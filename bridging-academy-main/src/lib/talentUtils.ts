import { TalentProfile } from "@/types";

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

export const calculateMatchScore = (
    candidate: TalentProfile,
    filters: { track: string; german: string; exp: string; avail: string }
) => {
    let score = 0;
    let totalWeights = 0;

    // 1. SAP Track (50% weight if filter active)
    if (filters.track !== "all") {
        totalWeights += 50;
        if (candidate.sap_track === filters.track) {
            score += 50;
        } else if (candidate.ai_analysis_summary?.includes(filters.track)) {
            score += 25; // Partial match through AI summary
        }
    }

    // 2. German Level (20% weight if filter active)
    if (filters.german !== "all") {
        totalWeights += 20;
        const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const targetIdx = levels.indexOf(filters.german);
        const candIdx = levels.indexOf(candidate.german_level || "A1");
        if (candIdx >= targetIdx) score += 20;
        else if (candIdx === targetIdx - 1) score += 10;
    }

    // 3. Experience (20% weight if filter active)
    if (filters.exp !== "all") {
        totalWeights += 20;
        const years = candidate.experience_years || 0;
        if (filters.exp === "senior" && years >= 5) score += 20;
        else if (filters.exp === "mid" && years >= 2) score += 20;
        else if (filters.exp === "junior") score += 20;
    }

    // 4. Availability (10% weight if filter active)
    if (filters.avail !== "all") {
        totalWeights += 10;
        if ((candidate as any).availability === filters.avail) score += 10;
    }

    // If no specific filters, baseline 100%
    if (totalWeights === 0) return 100;

    return Math.round((score / totalWeights) * 100);
};
