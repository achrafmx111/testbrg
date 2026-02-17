export interface Application {
    id: string;
    created_at: string;
    updated_at?: string;
    user_id: string;
    status: 'pending' | 'reviewed' | 'contacted' | 'approved' | 'accepted' | 'rejected' | 'withdrawn';
    type?: string;
    course_name?: string;
    course_slug?: string;
    name?: string;
    email?: string;
    phone?: string;
    linkedin_url?: string;
    cv_path?: string;
    cover_letter_path?: string;
    passport_path?: string;

    // AI & Skills
    ai_skills?: { skill: string; level: string }[];
    ai_analysis_summary?: string;

    // Admin fields
    admin_rating?: number;
    admin_notes?: string;
    status_message?: string;
    missing_docs?: string[];
    next_steps?: { text: string; link: string };

    // Demographics / Filters
    experience_years?: number;
    german_level?: string;
    sap_track?: string;
}

export interface Profile {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: 'admin' | 'business' | 'student' | 'user';
    avatar_url?: string;
    phone?: string;
    country?: string;
    city?: string;
    title?: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    website_url?: string;
}

// Phase 4: Employer Dashboard Types
// Phase 4: Employer Dashboard Types
export interface TalentProfile extends Application {
    matchScore?: number;
    shortlistNotes?: string;
    pipelineStatus?: string;
    country_city?: string;
    ai_analysis_summary?: string;
    ai_skills?: { skill: string; level: string }[];
}

export interface EmployerFavorite {
    application_id: string;
    employer_id: string;
    notes: string;
    pipeline_status: string;
    created_at?: string;
}

export interface ActivityLog {
    id: string;
    application_id: string;
    action: string;
    description: string;
    created_at: string;
    metadata?: any;
}

// Phase 5: Interview Flow Types
export type InterviewStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'cancelled';

export interface InterviewRequest {
    id: string;
    employer_id: string;
    application_id: string;
    status: InterviewStatus;
    message?: string;
    proposed_dates?: string[]; // ISO strings
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}
