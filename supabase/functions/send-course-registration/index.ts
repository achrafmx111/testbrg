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
const CourseRegistrationSchema = z.object({
  courseName: z.string().min(2, "Course name must be at least 2 characters").max(200, "Course name must be less than 200 characters").trim(),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(100, "First name must be less than 100 characters").trim(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(100, "Last name must be less than 100 characters").trim(),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters").trim(),
  phone: z.string().max(30, "Phone must be less than 30 characters").optional().nullable(),
  location: z.enum(["morocco", "germany", "other"], { errorMap: () => ({ message: "Invalid location" }) }),
  otherLocation: z.string().max(100, "Location must be less than 100 characters").optional().nullable(),
  format: z.array(z.enum(["presence", "online", "hybrid"])).min(1, "At least one format is required").max(3),
  level: z.enum(["beginner", "intermediate", "experienced"], { errorMap: () => ({ message: "Invalid level" }) }),
  languages: z.array(z.enum(["de", "en", "fr", "ar"])).min(1, "At least one language is required").max(4),
  motivation: z.string().max(2000, "Motivation must be less than 2000 characters").optional().nullable(),
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
const MAX_REQUESTS_PER_WINDOW = 3; // Lower limit for registrations

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

const formatLocation = (location: string, otherLocation?: string | null): string => {
  const locationMap: Record<string, string> = {
    morocco: "🇲🇦 Marokko",
    germany: "🇩🇪 Deutschland",
    other: `🌍 ${otherLocation ? escapeHtml(otherLocation) : "Anderes Land"}`,
  };
  return locationMap[location] || escapeHtml(location);
};

const formatArray = (arr: string[], labelMap: Record<string, string>): string => {
  return arr.map(item => labelMap[item] || escapeHtml(item)).join(", ") || "Nicht angegeben";
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
    const validationResult = CourseRegistrationSchema.safeParse(rawData);
    
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

    const data = validationResult.data;

    // Rate limit by email
    const rateLimit = checkRateLimit(data.email.toLowerCase());
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", data.email);
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
    
    console.log("Received course registration from:", escapeHtml(data.firstName), escapeHtml(data.lastName), data.email);

    const formatLabels: Record<string, string> = {
      presence: "Vor Ort (Präsenz in Marokko)",
      online: "Online",
      hybrid: "Hybrid (Online + Präsenz)",
    };

    const levelLabels: Record<string, string> = {
      beginner: "Einsteiger",
      intermediate: "Fortgeschritten",
      experienced: "Berufserfahrung im IT/SAP Umfeld",
    };

    const languageLabels: Record<string, string> = {
      de: "Deutsch",
      en: "Englisch",
      fr: "Französisch",
      ar: "Arabisch",
    };

    // Escape all user inputs for HTML
    const safeCourseName = escapeHtml(data.courseName);
    const safeFirstName = escapeHtml(data.firstName);
    const safeLastName = escapeHtml(data.lastName);
    const safeEmail = escapeHtml(data.email);
    const safePhone = data.phone ? escapeHtml(data.phone) : "Nicht angegeben";
    const safeMotivation = data.motivation ? escapeHtml(data.motivation) : "Keine Angabe";

    const emailHtml = `
      <h1>Neue Kursanmeldung: ${safeCourseName}</h1>
      
      <h2>Persönliche Daten</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${safeFirstName} ${safeLastName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>E-Mail</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Telefon</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${safePhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Standort</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatLocation(data.location, data.otherLocation)}</td>
        </tr>
      </table>

      <h2>Kursdetails</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Kurs</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${safeCourseName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Lernformat</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatArray(data.format, formatLabels)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Kenntnisniveau</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${levelLabels[data.level] || "Nicht angegeben"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Unterrichtssprache</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatArray(data.languages, languageLabels)}</td>
        </tr>
      </table>

      <h2>Motivation</h2>
      <p style="padding: 12px; background: #f5f5f5; border-radius: 4px; white-space: pre-wrap;">
        ${safeMotivation}
      </p>

      <hr style="margin: 24px 0;" />
      <p style="color: #666; font-size: 12px;">
        Diese E-Mail wurde automatisch über das Kursanmeldeformular auf bridging.academy gesendet.
      </p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bridging Academy <info@bridging.academy>",
      to: ["info@bridging.academy"],
      reply_to: data.email,
      subject: `Neue Kursanmeldung: ${safeCourseName} - ${safeFirstName} ${safeLastName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-course-registration function:", error);
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
