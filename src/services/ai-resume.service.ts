
export interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        linkedin: string;
        location: string;
        summary: string;
    };
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
}

export interface ExperienceItem {
    id: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface EducationItem {
    id: string;
    degree: string;
    school: string;
    year: string;
}

// Mock AI Service
export const aiResumeService = {
    // Simulates AI improving a bullet point
    async optimizeContent(content: string): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!content) resolve("");

                // Simple mock improvements
                if (content.toLowerCase().includes("managed")) {
                    resolve("Orchestrated a cross-functional team to deliver high-impact projects, resulting in a 20% increase in efficiency.");
                } else if (content.toLowerCase().includes("developed")) {
                    resolve("Engineered scalable solutions using modern technologies, reducing technical debt by 15%.");
                } else if (content.toLowerCase().includes("helped")) {
                    resolve("Collaborated with key stakeholders to drive strategic initiatives and improve operational workflows.");
                } else {
                    resolve(`Optimized: ${content} (Enhanced with action verbs and metrics)`);
                }
            }, 1000); // Simulate network delay
        });
    },

    // Simulates generating a professional summary
    async generateSummary(jobTitle: string, years: string): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(
                    `Results-oriented ${jobTitle} with ${years}+ years of experience driving business growth. Proven track record in project execution and team leadership. Skilled in leveraging data to make informed decisions.`
                );
            }, 1500);
        });
    }
};
