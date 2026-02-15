import { z } from "zod";

export const registrationRequestSchema = z.object({
    company_name: z.string().min(2, "Company name must be at least 2 characters"),
    contact_name: z.string().min(2, "Contact name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const jobPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    required_skills: z.array(z.string()).min(1, "At least one skill is required"), // Requires handling array input in UI
    min_experience: z.coerce.number().min(0, "Experience cannot be negative"), // Coerce for form inputs
    location: z.string().optional(),
    salary_range: z.string().optional(),
});

export const invoiceSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    amount: z.coerce.number().positive("Amount must be positive"),
    currency: z.string().length(3, "Currency must be 3 characters (e.g. USD)"),
    status: z.enum(["DRAFT", "ISSUED", "PAID", "OVERDUE", "CANCELLED"]),
    due_date: z.string().optional(), // Allow date string
});

export const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    difficulty: z.string().optional(),
    duration: z.string().optional(),
    level: z.string().optional(),
    track: z.string().optional(),
});
