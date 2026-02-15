import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();

function loadEnvFile(fileName) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const equalsIndex = trimmed.indexOf("=");
        if (equalsIndex <= 0) continue;
        const key = trimmed.slice(0, equalsIndex).trim();
        const rawValue = trimmed.slice(equalsIndex + 1).trim();
        const value = rawValue.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
        if (!process.env[key]) process.env[key] = value;
    }
}

async function main() {
    loadEnvFile(".env.local");
    loadEnvFile(".env");

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log("Seeding MVP domain data...");

    // 1. Fetch Users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const adminUser = users.find(u => u.email === (process.env.MVP_ADMIN_EMAIL ?? "admin@bridging.academy"));
    const companyUser = users.find(u => u.email === (process.env.MVP_COMPANY_EMAIL ?? "company@bridging.academy"));
    const talentUser = users.find(u => u.email === (process.env.MVP_TALENT_EMAIL ?? "talent@bridging.academy"));

    if (!adminUser || !companyUser || !talentUser) {
        throw new Error("One or more MVP users not found. Run seed-mvp-users.mjs first.");
    }

    // 2. Insert Company
    const companyId = '11111111-1111-4111-8111-111111111111';
    await upsert(supabase, 'companies', {
        id: companyId,
        name: 'Bridging Hiring GmbH',
        industry: 'Technology',
        country: 'Germany'
    });

    // 3. Insert Profiles
    await upsert(supabase, 'profiles', { id: adminUser.id, role: 'ADMIN', company_id: null });
    await upsert(supabase, 'profiles', { id: companyUser.id, role: 'COMPANY', company_id: companyId });
    await upsert(supabase, 'profiles', { id: talentUser.id, role: 'TALENT', company_id: null });

    // 4. Insert Course
    const courseId = '22222222-2222-4222-8222-222222222222';
    await upsert(supabase, 'courses', {
        id: courseId,
        title: 'SAP Foundation Bootcamp',
        description: 'Comprehensive introduction to SAP S/4HANA ecosystem.',
        level: 'Beginner',
        track: 'SAP Core',
        duration: '4 Weeks'
    });

    // 5. Insert Job
    const jobId = '33333333-3333-4333-8333-333333333333';
    await upsert(supabase, 'jobs', {
        id: jobId,
        company_id: companyId,
        title: 'Junior SAP Consultant',
        description: 'Entry-level SAP consultant role for graduates from Bridging Academy.',
        required_skills: ["sap basics", "communication", "english"],
        location: 'Berlin',
        salary_range: 'EUR 35k - 45k',
        status: 'OPEN',
        min_experience: 0
    });

    // 6. Insert Talent Profile
    const talentProfileId = '44444444-4444-4444-8444-444444444444';
    await upsert(supabase, 'talent_profiles', {
        id: talentProfileId,
        user_id: talentUser.id,
        bio: 'Motivated SAP learner preparing for first consulting role.',
        languages: ["English", "German A2"],
        skills: ["sap basics", "excel"],
        years_of_experience: 1,
        readiness_score: 52,
        coach_rating: 4.2,
        availability: true,
        placement_status: 'LEARNING'
    });

    // 7. Insert Enrollment
    const enrollmentId = '55555555-5555-4555-8555-555555555555';
    await upsert(supabase, 'enrollments', {
        id: enrollmentId,
        talent_id: talentUser.id,
        course_id: courseId,
        progress: 30,
        status: 'ACTIVE'
    });

    // 8. Insert Application
    const applicationId = '66666666-6666-4666-8666-666666666666';
    await upsert(supabase, 'applications', {
        id: applicationId,
        job_id: jobId,
        talent_id: talentUser.id,
        stage: 'APPLIED',
        score: 61.5
    });

    // 9. Insert Interview
    const interviewId = '77777777-7777-4777-8777-777777777777';
    await upsert(supabase, 'interviews', {
        id: interviewId,
        application_id: applicationId,
        status: 'SCHEDULED',
        scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        meeting_link: 'https://meet.example.com/bridging-interview'
    });

    // 10. Insert Invoices
    await upsert(supabase, 'invoices', {
        id: '88888888-8888-4888-8888-888888888888',
        company_id: companyId,
        amount: 12000,
        currency: 'MAD',
        status: 'ISSUED',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });

    // 11. Insert Registration Request
    await upsert(supabase, 'company_registration_requests', {
        id: '99999999-9999-4999-8999-999999999999',
        company_name: 'TechNova Inc',
        contact_name: 'Sarah Connor',
        email: 'sarah@technova.com',
        industry: 'AI & Robotics',
        country: 'International',
        status: 'PENDING'
    });

    // 12. Lessons
    await upsert(supabase, 'lessons', {
        course_id: courseId,
        title: 'Introduction to SAP',
        content: 'Content for introduction...',
        order: 1
    }, 'title'); // Upsert by title since ID is random if we don't fix it

    await upsert(supabase, 'lessons', {
        course_id: courseId,
        title: 'Navigation and UI',
        content: 'UI Content...',
        order: 2
    }, 'title');

    // 13. Assessment
    await upsert(supabase, 'assessments', {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        course_id: courseId,
        title: 'Foundation Module Exam',
        passing_score: 70,
        questions: [
            { id: "q1", text: "What does SAP stand for?", options: ["System Applications Products", "Sales and Purchasing"], correctAnswer: "System Applications Products" },
            { id: "q2", text: "Which UI technology is standard in S/4HANA?", options: ["SAP GUI", "SAP Fiori"], correctAnswer: "SAP Fiori" }
        ]
    });

    console.log("Seeding completed successfully.");
}

const stats = {
    users: 0,
    companies: 0,
    profiles: 0,
    courses: 0,
    jobs: 0,
    talent_profiles: 0,
    enrollments: 0,
    applications: 0,
    interviews: 0,
    invoices: 0,
    company_registration_requests: 0,
    lessons: 0,
    assessments: 0
};

async function upsert(supabase, table, data, onConflict = 'id') {
    const { error } = await supabase.from(table).upsert(data, { onConflict }).select();
    if (error) {
        console.error(`Error upserting ${table}:`, error);
        throw error; // Fail loudly
    } else {
        if (stats[table] !== undefined) stats[table]++;
    }
}

main().then(() => {
    console.table(stats);
}).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
