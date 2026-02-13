import { TalentProfile, CourseEnrollment } from "@/types";

export const RECRUITMENT_STAGES = [
    'shortlisted',
    'interview_requested',
    'interviewing',
    'offered',
    'hired',
    'rejected'
] as const;

export type RecruitmentStage = (typeof RECRUITMENT_STAGES)[number];

export const PIPELINE_TRANSITIONS: Record<RecruitmentStage, RecruitmentStage[]> = {
    shortlisted: ['interview_requested', 'rejected'],
    interview_requested: ['interviewing', 'rejected'],
    interviewing: ['offered', 'rejected'],
    offered: ['hired', 'rejected'],
    hired: [], // Terminal
    rejected: [] // Terminal
};

export const isValidTransition = (from: RecruitmentStage, to: RecruitmentStage): boolean => {
    return PIPELINE_TRANSITIONS[from]?.includes(to) || false;
};

export const TRACK_REQUIREMENTS: { [key: string]: string[] } = {
    "ABAP": ["ABAP Objects", "SAP HANA", "OData Services", "CDS Views", "Fiori Fundamentals"],
    "FICO": ["Financial Accounting", "Management Accounting", "Asset Accounting", "Taxation", "S/4HANA Finance"],
    "MM": ["Procurement", "Inventory Management", "Physical Inventory", "Invoice Verification", "LSMW/LTMC"],
    "SD": ["Sales & Distribution", "Shipping & Transportation", "Billing", "Pricing", "Stock Room Management"],
    "SuccessFactors": ["Employee Central", "Recruiting", "Onboarding", "Learning Management", "Performance & Goals"]
};

export const analyzeSkillGap = (candidate: TalentProfile) => {
    const track = candidate.sap_track || "ABAP"; // Default to ABAP if not specified
    const requirements = TRACK_REQUIREMENTS[track] || TRACK_REQUIREMENTS["ABAP"];
    const candSkills = (candidate.ai_skills || []).map(s => s.skill.toLowerCase());

    const matched = requirements.filter(req =>
        candSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs))
    );

    const missing = requirements.filter(req => !matched.includes(req));
    const readiness = Math.round((matched.length / requirements.length) * 100);

    return {
        track,
        requirements,
        matched,
        missing,
        readiness
    };
};

export const calculateMatchScore = (candidate: TalentProfile, filters: any) => {
    let score = 0;

    // Track match (40%)
    if (filters.track && candidate.sap_track === filters.track) {
        score += 40;
    }

    // Location match (20%)
    if (filters.location && candidate.country_city === filters.location) {
        score += 20;
    }

    // Status match (20%)
    if (filters.status && candidate.status === filters.status) {
        score += 20;
    }

    // Readiness bonus (up to 20%)
    const gap = analyzeSkillGap(candidate);
    score += (gap.readiness / 100) * 20;

    return Math.min(Math.round(score), 100);
};

export const calculateJobReadyScore = (
    candidate: TalentProfile,
    enrollments: CourseEnrollment[] = []
) => {
    let profileScore = 0;
    let skillScore = 0;
    let educationScore = 0;

    // 1. Profile Completion (Max 40 points)
    if (candidate.cv_path) profileScore += 20;
    if (candidate.linkedin_url) profileScore += 10;
    if (candidate.phone && candidate.country_city) profileScore += 10;

    // 2. Skill Match (Max 30 points)
    const gap = analyzeSkillGap(candidate);
    skillScore = (gap.readiness / 100) * 30;

    // 3. Education Progress (Max 30 points)
    if (enrollments.length > 0) {
        const avgProgress = enrollments.reduce((acc, curr) => acc + curr.progress_percent, 0) / enrollments.length;
        educationScore = (avgProgress / 100) * 30;
    }

    const total = Math.round(profileScore + skillScore + educationScore);

    return {
        score: total,
        breakdown: {
            profile: profileScore,
            skills: Math.round(skillScore),
            education: Math.round(educationScore)
        },
        status: total >= 80 ? 'job_ready' : total >= 50 ? 'near_ready' : 'learning'
    };
};
