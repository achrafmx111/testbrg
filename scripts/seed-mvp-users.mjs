import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^"|"$/g, "").replace(/^'|'$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function listAllUsers(adminApi) {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminApi.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const pageUsers = data?.users ?? [];
    users.push(...pageUsers);

    if (pageUsers.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function findUserByEmail(adminApi, email) {
  const users = await listAllUsers(adminApi);
  return users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureUser(adminApi, { email, password, user_metadata }) {
  const existing = await findUserByEmail(adminApi, email);
  if (existing) {
    return existing;
  }

  const { data, error } = await adminApi.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL or VITE_SUPABASE_URL in environment.");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const defaults = {
    admin: {
      email: process.env.MVP_ADMIN_EMAIL ?? "admin@bridging.academy",
      password: process.env.MVP_ADMIN_PASSWORD ?? "Admin123!",
      user_metadata: { name: "MVP Admin" },
    },
    company: {
      email: process.env.MVP_COMPANY_EMAIL ?? "company@bridging.academy",
      password: process.env.MVP_COMPANY_PASSWORD ?? "Company123!",
      user_metadata: { name: "MVP Company" },
    },
    talent: {
      email: process.env.MVP_TALENT_EMAIL ?? "talent@bridging.academy",
      password: process.env.MVP_TALENT_PASSWORD ?? "Talent123!",
      user_metadata: { name: "MVP Talent" },
    },
  };

  const adminUser = await ensureUser(supabase.auth.admin, defaults.admin);
  const companyUser = await ensureUser(supabase.auth.admin, defaults.company);
  const talentUser = await ensureUser(supabase.auth.admin, defaults.talent);

  console.log("MVP auth users are ready:");
  console.log(`- admin:   ${adminUser.id} (${defaults.admin.email})`);
  console.log(`- company: ${companyUser.id} (${defaults.company.email})`);
  console.log(`- talent:  ${talentUser.id} (${defaults.talent.email})`);
  console.log("Next step: run supabase/seeds/mvp_seed.sql to insert mvp.* domain data.");
}

main().catch((error) => {
  console.error("Failed to seed MVP auth users.");
  console.error(error.message ?? error);
  process.exit(1);
});
