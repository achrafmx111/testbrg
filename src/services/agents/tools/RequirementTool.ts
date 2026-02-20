import { AgentTool } from "../types";
import { MvpJob } from "@/integrations/supabase/mvp";

export interface JobRequirements {
    tracks: string[];
    minExperience: number;
    requiredSkills: string[];
    preferredSkills: string[];
    germanLevel: string;
    locationType: 'Remote' | 'Onsite' | 'Hybrid';
}

export class RequirementTool implements AgentTool<MvpJob, JobRequirements> {
    name = "RequirementTool";
    description = "Extracts structured requirements from a job description.";

    async execute(job: MvpJob): Promise<JobRequirements> {
        // In a real agent, this would use an LLM provider to parse the text.
        // For the PoC, we extract based on structured fields and regex.

        const desc = job.description.toLowerCase();

        const requirements: JobRequirements = {
            tracks: job.required_skills.filter(s => ['FI', 'MM', 'SD', 'ABAP', 'BTP'].includes(s.toUpperCase())),
            minExperience: job.min_experience || 0,
            requiredSkills: job.required_skills,
            preferredSkills: [],
            germanLevel: desc.includes('b2') ? 'B2' : desc.includes('c1') ? 'C1' : 'B1',
            locationType: job.location?.toLowerCase().includes('remote') ? 'Remote' : 'Onsite'
        };

        return requirements;
    }
}
