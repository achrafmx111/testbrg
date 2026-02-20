export type AgentRole = 'HiringCoordinator' | 'TechnicalScreener' | 'CultureFitExpert';

export interface AgentTool<TInput = any, TOutput = any> {
    name: string;
    description: string;
    execute: (input: TInput) => Promise<TOutput>;
}

export interface AgentProvider {
    name: string;
    generateResponse: (prompt: string) => Promise<string>;
}

export interface AgentInsight {
    score: number;
    reasoning: string;
    strengths: string[];
    risks: string[];
    recommendedNextSteps: string;
}

export interface AgentState {
    role: AgentRole;
    findings: Record<string, any>;
    history: string[];
}
