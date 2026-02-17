import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://bridging-academy.lovable.app",
  "https://id-preview--2e0f858c-a072-473f-8fff-e4978b255bf7.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Input validation schema
const ContactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").trim(),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters").trim(),
  phone: z.string().max(30, "Phone must be less than 30 characters").optional().nullable(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject must be less than 200 characters").trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message must be less than 5000 characters").trim(),
});

// HTML escape function to prevent XSS
const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

const checkRateLimit = (identifier: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
};

// Cleanup old rate limit entries periodically
const cleanupRateLimitMap = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Cleanup old entries
    cleanupRateLimitMap();

    // Parse and validate input
    const rawData = await req.json();
    const validationResult = ContactMessageSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, phone, subject, message } = validationResult.data;

    // Rate limit by email
    const rateLimit = checkRateLimit(email.toLowerCase());
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", email);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }

    console.log("Received contact message from:", escapeHtml(name), email);

    // Escape all user inputs for HTML
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : "Not provided";
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
          New Contact Message
        </h1>
        
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #718096; width: 140px;"><strong>Full Name:</strong></td>
              <td style="padding: 8px 0; color: #2d3748;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #2d3748;">
                <a href="mailto:${safeEmail}" style="color: #3182ce;">${safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; color: #2d3748;">${safePhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Subject:</strong></td>
              <td style="padding: 8px 0; color: #2d3748;">${safeSubject}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Message</h2>
          <p style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
          <p>This message was sent from the Bridging Academy contact form.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bridging Academy <info@bridging.academy>",
      to: ["info@bridging.academy"],
      reply_to: email,
      subject: `Contact Form: ${safeSubject}`,
      html: htmlBody,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-message function:", error);
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
