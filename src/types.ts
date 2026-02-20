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
    referral_code?: string;

    // GDPR / Account Status
    status?: 'active' | 'suspended' | 'deleted' | 'deletion_scheduled';
    deleted_at?: string;
    deletion_scheduled_at?: string;
}

// Phase 4: Employer Dashboard Types
// Phase 4: Employer Dashboard Types
export interface TalentProfile extends Application {
    matchScore?: number;
    jobReadyScore?: number;
    shortlistNotes?: string;
    pipelineStatus?: string;
    country_city?: string;
    ai_analysis_summary?: string;
    ai_skills?: { skill: string; level: string }[];
}

export interface EmployerFavorite {
    talent_id: string;
    employer_id: string;
    notes: string;
    pipeline_status: string;
    created_at?: string;
}

export interface RecruitmentMessage {
    id: string;
    created_at: string;
    employer_id: string;
    application_id: string;
    sender_id: string;
    sender_role: 'employer' | 'candidate';
    body: string;
    metadata?: unknown;
}

export interface EmployerPipelineEvent {
    id: string;
    created_at: string;
    employer_id: string;
    application_id: string;
    old_status?: string;
    new_status: string;
    note?: string;
}

export interface ActivityLog {
    id: string;
    application_id: string;
    action: string;
    description: string;
    created_at: string;
    metadata?: unknown;
}

// Phase 5: Interview Flow Types
export type InterviewStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'scheduled'
    | 'cancelled'
    | 'confirmed'
    | 'completed'
    | 'declined';

export interface InterviewRequest {
    id: string;
    employer_id: string; // Added back to match DB
    company_id?: string;
    recruiter_id?: string;
    talent_id?: string;
    application_id: string;
    status: InterviewStatus;
    message?: string;
    proposed_times?: string[]; // JSON array of ISO strings
    confirmed_time?: string;
    meeting_link?: string;
    created_at: string;
    updated_at: string;

    // Relations (joined)
    application?: Application;
    company?: { name: string; logo_url?: string };
    talent?: Profile;
    recruiter?: Profile;
}

// Phase 7: Education & Gamification Types
export interface Course {
    id: string;
    title: string;
    description: string;
    sap_track: string;
    duration_hours: number;
    thumbnail_url?: string;
    created_at: string;
}

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    order_index: number;
    content_url?: string;
    created_at: string;
}

export interface CourseEnrollment {
    id: string;
    user_id: string;
    course_id: string;
    progress_percent: number;
    status: 'enrolled' | 'in_progress' | 'completed';
    last_accessed_at: string;
    completed_at?: string;
}

export interface UserModuleCompletion {
    id: string;
    user_id: string;
    module_id: string;
    completed_at: string;
}

export interface JobReadyAnalysis {
    score: number;
    breakdown: {
        profile: number;
        skills: number;
        education: number;
    };
    status: 'learning' | 'near_ready' | 'job_ready';
}

export interface Referral {
    id: string;
    referrer_id: string;
    referral_code: string;
    referee_email: string;
    status: 'pending' | 'joined' | 'active' | 'rewarded';
    reward_claimed: boolean;
    created_at: string;
    referrer?: Profile;

    // Fraud Engine
    fraud_score?: number;
    ip_address?: string;
    device_fingerprint?: string;
    is_flagged?: boolean;
}

export interface SecurityLog {
    id: string;
    user_id: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    metadata?: Record<string, any>;
    correlation_id?: string;
    event_hash?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface BackgroundJob {
    id: string;
    job_type: 'export_user_data' | 'delete_account' | 'fraud_check_batch' | 'send_email';
    payload: Record<string, any>;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    attempts: number;
    last_error?: string;
    created_at: string;
    updated_at: string;
}

export interface SystemMetric {
    id: string;
    metric_type: string;
    value: number;
    tags?: Record<string, any>;
    collected_at: string;
}
