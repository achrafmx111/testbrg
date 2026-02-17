import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS
const RESEND_SENDER = "onboarding@resend.dev"; // Change to info@bridging.academy once domain is verified in Resend

const ALLOWED_ORIGINS = [
  "https://bridging-academy.lovable.app",
  "https://id-preview--2e0f858c-a072-473f-8fff-e4978b255bf7.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// HTML escape function to prevent XSS
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
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
const MAX_REQUESTS_PER_WINDOW = 10;

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

// Validation schemas
const TalentFormSchema = z.object({
  role: z.literal("talent_career"),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim(),
  phone: z.string().min(5).max(30).trim(),
  country_city: z.string().max(100).optional().nullable(),
  current_status: z.string().max(50).optional().nullable(),
  area_of_interest: z.string().max(50).optional().nullable(),
  learning_mode: z.string().max(20).optional().nullable(),
  german_level: z.string().max(10).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  type: z.string().optional().nullable(),
});

const BusinessFormSchema = z.object({
  role: z.literal("business_partnerships"),
  organization_name: z.string().min(2).max(200).trim(),
  website: z.string().max(255).optional().nullable(),
  contact_person: z.string().min(2).max(100).trim(),
  role_position: z.string().max(100).optional().nullable(),
  email: z.string().email().max(255).trim(),
  phone: z.string().max(30).optional().nullable(),
  subcategory: z.string().max(50).optional().nullable(),
  inquiry_type: z.string().max(50).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
});

const CourseApplicationSchema = z.object({
  type: z.literal("course_application"),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim(),
  phone: z.string().min(5).max(30).trim(),
  country_city: z.string().max(100).optional().nullable(),
  course_slug: z.string().min(1).max(50),
  course_name: z.string().min(1).max(100),
  learning_mode: z.string().max(20).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
});

const InterviewRequestSchema = z.object({
  type: z.literal("interview_request"),
  employer_email: z.string().email(),
  candidate_id: z.string(),
  message: z.string().min(1).max(2000),
});

// Label mappings
const labelMaps = {
  currentStatus: {
    student: "Student",
    graduate: "Graduate",
    professional: "Working Professional",
  },
  areaOfInterest: {
    s4hana: "SAP S/4HANA",
    bw4hana: "BW/4HANA & Datasphere",
    btp: "SAP BTP",
    sac: "SAC & Analytics",
    abap: "ABAP / Fiori",
  },
  learningMode: {
    online: "Online",
    onsite: "Onsite",
    hybrid: "Hybrid",
  },
  germanLevel: {
    a0: "A0 (No German)",
    a1: "A1 (Beginner)",
    a2: "A2 (Elementary)",
    b1: "B1 (Intermediate)",
    b2: "B2 (Upper Intermediate)",
    c1: "C1 (Advanced)",
  },
  subcategory: {
    corporate: "Corporate / Company",
    partner: "Partner",
    university: "University / Academy",
    hotel: "Hotel / Venue",
    other: "Other Institution",
  },
  inquiryType: {
    training: "Corporate Training",
    partnership: "Partnership",
    nearshoring: "Nearshoring",
    event: "Event / Bootcamp Hosting",
  },
};

const getLabel = (map: Record<string, string>, value: string | null | undefined): string => {
  if (!value) return "Not specified";
  return map[value] || value;
};

// Email template builders
const buildTalentEmailHtml = (data: z.infer<typeof TalentFormSchema>): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
        🎓 New Talent & Career Inquiry
      </h1>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <h2 style="color: #166534; margin-top: 0;">Contact Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 140px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #3182ce;">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.phone)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Location:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.country_city) || "Not specified"}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Profile Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 140px;"><strong>Current Status:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${getLabel(labelMaps.currentStatus, data.current_status)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Area of Interest:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${getLabel(labelMaps.areaOfInterest, data.area_of_interest)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Learning Mode:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${getLabel(labelMaps.learningMode, data.learning_mode)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>German Level:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${getLabel(labelMaps.germanLevel, data.german_level)}</td>
          </tr>
        </table>
      </div>

      ${data.message ? `
      <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Message</h2>
        <p style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
      ` : ""}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
        <p>This message was sent from the Bridging Academy contact form (Talent & Career).</p>
      </div>
    </div>
  `;
};

const buildBusinessEmailHtml = (data: z.infer<typeof BusinessFormSchema>): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
        🏢 New Business & Partnership Inquiry
      </h1>
      
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <h2 style="color: #1e40af; margin-top: 0;">Organization Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 160px;"><strong>Organization:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.organization_name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Type:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${getLabel(labelMaps.subcategory, data.subcategory)}</td>
          </tr>
          ${data.website ? `
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Website:</strong></td>
            <td style="padding: 8px 0;"><a href="${escapeHtml(data.website)}" style="color: #3182ce;">${escapeHtml(data.website)}</a></td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Contact Person</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 160px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.contact_person)}</td>
          </tr>
          ${data.role_position ? `
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Position:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.role_position)}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #3182ce;">${escapeHtml(data.email)}</a></td>
          </tr>
          ${data.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.phone)}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h2 style="color: #92400e; margin-top: 0;">Inquiry Type</h2>
        <p style="color: #2d3748; font-size: 16px; margin: 0;">${getLabel(labelMaps.inquiryType, data.inquiry_type)}</p>
      </div>

      ${data.message ? `
      <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Message</h2>
        <p style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
      ` : ""}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
        <p>This message was sent from the Bridging Academy contact form (Business & Partnerships).</p>
      </div>
    </div>
  `;
};

const buildCourseApplicationEmailHtml = (data: z.infer<typeof CourseApplicationSchema>): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
        📚 New Course Application
      </h1>
      
      <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a855f7;">
        <h2 style="color: #7e22ce; margin-top: 0;">Course Selected</h2>
        <p style="color: #2d3748; font-size: 18px; font-weight: bold; margin: 0;">${escapeHtml(data.course_name)}</p>
        <p style="color: #718096; font-size: 14px; margin: 8px 0 0 0;">Slug: ${escapeHtml(data.course_slug)}</p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Applicant Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 140px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #3182ce;">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.phone)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Location:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${escapeHtml(data.country_city) || "Not specified"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Learning Mode:</strong></td>
            <td style="padding: 8px 0; color: #2d3748;">${getLabel(labelMaps.learningMode, data.learning_mode)}</td>
          </tr>
        </table>
      </div>

      ${data.message ? `
      <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Additional Message</h2>
        <p style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
      ` : ""}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
        <p>This application was submitted via the Bridging Academy course application form.</p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    cleanupRateLimitMap();

    const rawData = await req.json();

    let validatedData: z.infer<typeof TalentFormSchema> | z.infer<typeof BusinessFormSchema> | z.infer<typeof CourseApplicationSchema>;
    let emailSubject: string;
    let htmlBody: string;
    let replyToEmail: string;

    // Determine form type and validate
    if (rawData.type === "course_application") {
      const result = CourseApplicationSchema.safeParse(rawData);
      if (!result.success) {
        console.log("Course application validation failed:", result.error.errors);
        return new Response(
          JSON.stringify({ error: "Validation failed", details: result.error.errors }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      validatedData = result.data;
      emailSubject = `📚 Course Application: ${result.data.course_name} - ${result.data.name}`;
      htmlBody = buildCourseApplicationEmailHtml(result.data);
      replyToEmail = result.data.email;
    } else if (rawData.role === "talent_career") {
      const result = TalentFormSchema.safeParse(rawData);
      if (!result.success) {
        console.log("Talent form validation failed:", result.error.errors);
        return new Response(
          JSON.stringify({ error: "Validation failed", details: result.error.errors }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      validatedData = result.data;
      emailSubject = `🎓 Talent Inquiry: ${result.data.name}`;
      htmlBody = buildTalentEmailHtml(result.data);
      replyToEmail = result.data.email;
    } else if (rawData.role === "business_partnerships") {
      const result = BusinessFormSchema.safeParse(rawData);
      if (!result.success) {
        console.log("Business form validation failed:", result.error.errors);
        return new Response(
          JSON.stringify({ error: "Validation failed", details: result.error.errors }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      validatedData = result.data;
      emailSubject = `🏢 Business Inquiry: ${result.data.organization_name}`;
      htmlBody = buildBusinessEmailHtml(result.data);
      replyToEmail = result.data.email;
    } else if (rawData.type === "interview_request") {
      const result = InterviewRequestSchema.safeParse(rawData);
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: "Validation failed", details: result.error.errors }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      validatedData = result.data;
      emailSubject = `📅 New Interview Request: Candidate #${result.data.candidate_id.slice(0, 5)}`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Interview Request</h2>
          <p>An employer (<strong>${result.data.employer_email}</strong>) has requested an interview with a candidate.</p>
          <p><strong>Candidate ID:</strong> ${result.data.candidate_id}</p>
          <p><strong>Message from Employer:</strong></p>
          <blockquote style="background: #f4f4f4; padding: 10px; border-left: 4px solid #ccc;">
            ${escapeHtml(result.data.message)}
          </blockquote>
          <hr />
          <p>Please log in to the Admin Dashboard to Approve or Reject this request.</p>
        </div>
      `;
      replyToEmail = result.data.employer_email;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid form type or role" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limit by email
    const rateLimit = checkRateLimit(replyToEmail.toLowerCase());
    if (!rateLimit.allowed) {
      console.log("Rate limit exceeded for:", replyToEmail);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "3600", ...corsHeaders },
        }
      );
    }

    console.log("Sending email:", emailSubject);

    const emailResponse = await resend.emails.send({
      from: RESEND_SENDER,
      to: ["achrafmx111@gmail.com"],
      reply_to: replyToEmail,
      subject: emailSubject,
      html: htmlBody,
    });

    // Send confirmation to the applicant if it's an application or talent inquiry
    if (rawData.type === "course_application" || rawData.role === "talent_career" || rawData.type === "talent_pool_registration") {
      await resend.emails.send({
        from: RESEND_SENDER,
        to: [replyToEmail],
        subject: "Confirmation: We've received your request - Bridging Academy",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${rawData.name},</h2>
            <p>Thank you for reaching out to **Bridging Academy**.</p>
            <p>We have successfully received your ${rawData.type === 'course_application' ? 'application' : (rawData.type === 'talent_pool_registration' ? 'registration' : 'inquiry')}. Our team will review your details and get back to you shortly.</p>
            <hr />
            <p>Best regards,<br/>The Bridging Academy Team</p>
          </div>
        `,
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-unified-contact function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
