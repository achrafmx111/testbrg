import { AgentTool } from "../types";
import { MvpTalentProfile } from "@/integrations/supabase/mvp";

export interface CandidateProfile {
    skills: string[];
    germanLevel: string;
    totalExperience: number;
    sapExpertise: string[];
    readinessScore: number;
}

export class CandidateAnalyzerTool implements AgentTool<MvpTalentProfile, CandidateProfile> {
    name = "CandidateAnalyzerTool";
    description = "Extracts structured capability data from a talent profile.";

    async execute(talent: MvpTalentProfile): Promise<CandidateProfile> {
        // Simulating Agentic extraction of candidate capabilities

        const profile: CandidateProfile = {
            skills: talent.skills || [],
            germanLevel: talent.languages?.find(l => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(l)) || 'A1',
            totalExperience: talent.years_of_experience || 0,
            sapExpertise: (talent.skills || []).filter(s => s.toUpperCase().includes('SAP')),
            readinessScore: talent.languages?.some(l => ['B2', 'C1', 'C2'].includes(l)) ? 0.9 : 0.6
        };

        return profile;
    }
}
