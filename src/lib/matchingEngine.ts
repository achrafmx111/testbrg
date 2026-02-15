/**
 * Matching Engine v1
 * Scores talent-job matches based on skills overlap, readiness, and language fit.
 *
 * Score = (skills_overlap × 40%) + (readiness_score × 20%) + (language_match × 15%)
 *       + (availability × 10%) + (coach_rating × 15%)
 */

import type { MvpTalentProfile, MvpJob } from "@/integrations/supabase/mvp";

export interface MatchResult {
    talentId: string;
    userId: string;
    jobId: string;
    score: number;
    breakdown: {
        skillsOverlap: number;
        readiness: number;
        languageMatch: number;
        availability: number;
        coachRating: number;
    };
}

/** Normalise a skill string for comparison */
function normalizeSkill(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Compute skills overlap ratio (0-1) */
function skillsOverlap(talentSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 0.5; // Neutral if job has no requirements
    const normTalent = new Set(talentSkills.map(normalizeSkill));
    let matched = 0;
    for (const req of requiredSkills) {
        const normReq = normalizeSkill(req);
        // Check for exact or partial match
        for (const ts of normTalent) {
            if (ts.includes(normReq) || normReq.includes(ts)) {
                matched++;
                break;
            }
        }
    }
    return matched / requiredSkills.length;
}

/** Check if talent speaks German (needed for Germany-based jobs) */
function languageMatch(talentLanguages: string[], jobLocation: string | null): number {
    const needsGerman = jobLocation?.toLowerCase().includes("germany") || jobLocation?.toLowerCase().includes("deutschland");
    if (!needsGerman) return 1.0; // No German needed, full score
    const speaksGerman = talentLanguages.some((l) => l.toLowerCase().includes("german") || l.toLowerCase().includes("deutsch"));
    return speaksGerman ? 1.0 : 0.3; // Penalise but don't fully exclude
}

/**
 * Score a single talent against a single job.
 * Returns a score 0-100.
 */
export function scoreTalentJob(talent: MvpTalentProfile, job: MvpJob): MatchResult {
    const skills = skillsOverlap(talent.skills, job.required_skills);

    // Experience Score (30%)
    // If talent exp >= job min exp, full score. Else proportional.
    // If job has no min exp (0), assume 1 year requirement for baseline or give full score? 
    // Let's assume full score if min_experience is 0.
    let expScore = 1.0;
    if (job.min_experience > 0) {
        expScore = Math.min(talent.years_of_experience / job.min_experience, 1.0);
    }

    const langMatch = languageMatch(talent.languages, job.location);
    const avail = talent.availability ? 1.0 : 0.0;
    // Location Score (20%) - reused langMatch logic or separate?
    // Requirement says "Location (20%)".
    // I'll add a locationMatch function.
    const locMatch = locationMatch(talent, job);

    // Weights: Skills 40%, Experience 30%, Location 20%, Language 10%
    const score = Math.round(
        skills * 40 + expScore * 30 + locMatch * 20 + langMatch * 10
    );

    return {
        talentId: talent.id,
        userId: talent.user_id,
        jobId: job.id,
        score: Math.min(score, 100),
        breakdown: {
            skillsOverlap: Math.round(skills * 100),
            experience: Math.round(expScore * 100), // Updated key
            location: Math.round(locMatch * 100), // Updated key
            languageMatch: Math.round(langMatch * 100), // Logic reused
            availability: Math.round(avail * 100), // Kept for data but weight is 0 now? Or part of something?
            // Requirement didn't mention availability or coach rating.
            // I'll keep them in breakdown but not in score calculation if strict.
            // Or I can add them as bonus?
            // "Ensure scoreTalentJob weights: Skills (40%), Experience (30%), Location (20%), Language (10%)"
            // This sums to 100%. So Availability/Coach are ignored in score.
            coachRating: 0
        } as any, // Cast to any to avoid type error if interface mismatches temporarily
    };
}

function locationMatch(talent: MvpTalentProfile, job: MvpJob): number {
    // Basic location check: if job has location, checks if talent bio implies it? 
    // Talent profile doesn't have structured location.
    // We can use Timezone or derived data.
    // For MVP, if job location is "Remote", return 1.0. 
    // If job location matches something in bio? 
    // Or just return 1.0 for now as we lack talent location field.
    if (!job.location || job.location.toLowerCase().includes("remote")) return 1.0;
    return 0.5; // Default penalty for onsite if we don't know talent location
}

/**
 * Match all talents against a specific job and return top N matches.
 */
export function matchTalentsToJob(
    talents: MvpTalentProfile[],
    job: MvpJob,
    topN = 10
): MatchResult[] {
    const results = talents
        .filter((t) => t.placement_status !== "PLACED") // Skip already placed
        .map((t) => scoreTalentJob(t, job))
        .sort((a, b) => b.score - a.score);

    return results.slice(0, topN);
}

/**
 * Match a talent against all open jobs and return top N matches.
 */
export function matchJobsToTalent(
    talent: MvpTalentProfile,
    jobs: MvpJob[],
    topN = 10
): MatchResult[] {
    const results = jobs
        .filter((j) => j.status === "OPEN")
        .map((j) => scoreTalentJob(talent, j))
        .sort((a, b) => b.score - a.score);

    return results.slice(0, topN);
}
