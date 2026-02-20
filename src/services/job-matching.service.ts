
// Mock Smart Job Matching Service
// Initially this will be a simple "Skill Overlap" score.
// Later, this will use embeddings & vector search.

export interface MatchAnalysis {
    score: number;
    matchingSkills: string[];
    missingSkills: string[];
    reason: string;
}

export type JobSimple = {
    id: string;
    title: string;
    requiredSkills: string[];
    description: string;
};

export type UserProfileSimple = {
    skills: string[];
    experience: string[]; // Job titles in experience array
    summary: string;
};

export const jobMatchingService = {
    // Analyzes match between a job and a user profile
    analyzeMatch(job: JobSimple, profile: UserProfileSimple | null): MatchAnalysis {
        if (!profile || !profile.skills || profile.skills.length === 0) {
            return {
                score: 0,
                matchingSkills: [],
                missingSkills: job.requiredSkills || [],
                reason: "Complete your profile to see match analysis."
            };
        }

        const userSkillsLower = new Set(profile.skills.map(s => s.toLowerCase()));

        // Calculate matching skills
        const matchingSkills: string[] = [];
        const missingSkills: string[] = [];

        (job.requiredSkills || []).forEach(skill => {
            if (userSkillsLower.has(skill.toLowerCase())) {
                matchingSkills.push(skill);
            } else {
                // Fuzzy match attempt (e.g. "ReactJS" matches "React")
                const isFuzzyMatch = Array.from(userSkillsLower).some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
                if (isFuzzyMatch) {
                    matchingSkills.push(skill);
                } else {
                    missingSkills.push(skill);
                }
            }
        });

        // Score calculation
        // Base score: % of required skills matched
        let score = 0;
        if (job.requiredSkills && job.requiredSkills.length > 0) {
            score = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
        } else {
            // If no skills listed, fallback to title match or description keyword search
            score = 50; // Neutral baseline
        }

        // Boost score if title matches experience
        const titleMatch = profile.experience.some(expTitle =>
            job.title.toLowerCase().includes(expTitle.toLowerCase()) ||
            expTitle.toLowerCase().includes(job.title.toLowerCase())
        );
        if (titleMatch) {
            score = Math.min(100, score + 15);
        }

        // Generate reason string
        let reason = "";
        if (score >= 90) reason = "Excellent match! Your skills align perfectly.";
        else if (score >= 75) reason = "Good match. You have most of the required skills.";
        else if (score >= 50) reason = "Potential match. Some key skills are missing.";
        else reason = "Low match. Consider upskilling or gaining more experience.";

        return {
            score,
            matchingSkills,
            missingSkills,
            reason
        };
    }
};
