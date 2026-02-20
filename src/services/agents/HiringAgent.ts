import { AgentInsight, AgentRole, AgentState } from "./types";
import { RequirementTool, JobRequirements } from "./tools/RequirementTool";
import { CandidateAnalyzerTool, CandidateProfile } from "./tools/CandidateAnalyzerTool";
import { MvpJob, MvpTalentProfile } from "@/integrations/supabase/mvp";

export class HiringAgent {
    private requirementTool: RequirementTool;
    private candidateTool: CandidateAnalyzerTool;
    private state: AgentState;

    constructor() {
        this.requirementTool = new RequirementTool();
        this.candidateTool = new CandidateAnalyzerTool();
        this.state = {
            role: 'HiringCoordinator',
            findings: {},
            history: []
        };
    }

    async analyzeMatch(job: MvpJob, talent: MvpTalentProfile): Promise<AgentInsight> {
        this.log("Starting match analysis for talent ID " + talent.user_id);

        // Step 1: Use Requirement Tool
        const jobReqs = await this.requirementTool.execute(job);
        this.state.findings.jobReqs = jobReqs;
        this.log("Extracted job requirements: " + jobReqs.requiredSkills.join(", "));

        // Step 2: Use Candidate Analyzer Tool
        const candidateProfile = await this.candidateTool.execute(talent);
        this.state.findings.candidateProfile = candidateProfile;
        this.log("Analyzed candidate capability: German " + candidateProfile.germanLevel);

        // Step 3: Reasoning (Simulation of LLM synthesis)
        const insight = this.synthesize(jobReqs, candidateProfile);

        return insight;
    }

    private synthesize(reqs: JobRequirements, profile: CandidateProfile): AgentInsight {
        const matchingSkills = profile.skills.filter(s => reqs.requiredSkills.includes(s));
        const missingSkills = reqs.requiredSkills.filter(s => !profile.skills.includes(s));

        let score = (matchingSkills.length / reqs.requiredSkills.length) * 0.7;

        // Language boost
        if (profile.germanLevel >= reqs.germanLevel) score += 0.2;
        if (profile.totalExperience >= reqs.minExperience) score += 0.1;

        const strengths = [
            `Strong alignment with ${matchingSkills.join(", ")}`,
            `Meets language requirement (${profile.germanLevel})`,
            profile.totalExperience >= reqs.minExperience ? `Exceeds experience requirement` : null
        ].filter(Boolean) as string[];

        const risks = missingSkills.length > 0 ? [`Missing experience in ${missingSkills.join(", ")}`] : [];

        const reasoning = `Candidate shows ${Math.round(score * 100)}% compatibility. ` +
            (matchingSkills.length > 2 ? "Technical background is highly relevant." : "Some skill gaps identified.");

        return {
            score: Math.min(score, 1),
            reasoning,
            strengths,
            risks,
            recommendedNextSteps: score > 0.7 ? "Schedule First Interview" : "Preliminary Screening Call"
        };
    }

    private log(message: string) {
        this.state.history.push(`${new Date().toISOString()}: ${message}`);
        console.log(`[HiringAgent] ${message}`);
    }
}
