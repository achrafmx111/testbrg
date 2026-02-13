import { supabase } from "@/integrations/supabase/client";

export type MvpRole = "ADMIN" | "TALENT" | "COMPANY";
export type PlacementStatus = "LEARNING" | "JOB_READY" | "PLACED";
export type JobStatus = "OPEN" | "CLOSED";
export type ApplicationStage = "APPLIED" | "SCREEN" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";
export type EnrollmentStatus = "ACTIVE" | "COMPLETED";

export interface MvpProfile {
  id: string;
  role: MvpRole;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MvpTalentProfile {
  id: string;
  user_id: string;
  bio: string | null;
  languages: string[];
  skills: string[];
  readiness_score: number;
  coach_rating: number;
  availability: boolean;
  placement_status: PlacementStatus;
  created_at: string;
  updated_at: string;
}

export interface MvpCompany {
  id: string;
  name: string;
  industry: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface MvpJob {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string | null;
  salary_range: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface MvpApplication {
  id: string;
  job_id: string;
  talent_id: string;
  stage: ApplicationStage;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface MvpCourse {
  id: string;
  title: string;
  level: string | null;
  track: string | null;
  created_at: string;
  updated_at: string;
}

export interface MvpEnrollment {
  id: string;
  talent_id: string;
  course_id: string;
  progress: number;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
}

export interface MvpInterview {
  id: string;
  application_id: string;
  scheduled_at: string;
  meeting_link: string | null;
  feedback: string | null;
  created_at: string;
}

export interface MvpMessage {
  id: string;
  from_user_id: string;
  to_user_id: string;
  thread_type: string;
  body: string;
  created_at: string;
}

export interface MvpNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface MvpInvoice {
  id: string;
  company_id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface MvpAuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MvpStaffAssignment {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface MvpRolePermission {
  id: string;
  role: string;
  resource: string;
  action: string;
  allowed: boolean;
}

const mvpSchema: any = (supabase as any).schema("mvp");

function mapArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

function mapProfile(row: any): MvpProfile {
  return {
    id: row.id,
    role: row.role,
    company_id: row.company_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapTalentProfile(row: any): MvpTalentProfile {
  return {
    id: row.id,
    user_id: row.user_id,
    bio: row.bio,
    languages: mapArray<string>(row.languages),
    skills: mapArray<string>(row.skills),
    readiness_score: Number(row.readiness_score ?? 0),
    coach_rating: Number(row.coach_rating ?? 0),
    availability: Boolean(row.availability),
    placement_status: row.placement_status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapCompany(row: any): MvpCompany {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    country: row.country,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapJob(row: any): MvpJob {
  return {
    id: row.id,
    company_id: row.company_id,
    title: row.title,
    description: row.description,
    required_skills: mapArray<string>(row.required_skills),
    location: row.location,
    salary_range: row.salary_range,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapApplication(row: any): MvpApplication {
  return {
    id: row.id,
    job_id: row.job_id,
    talent_id: row.talent_id,
    stage: row.stage,
    score: row.score,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapCourse(row: any): MvpCourse {
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    track: row.track,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapEnrollment(row: any): MvpEnrollment {
  return {
    id: row.id,
    talent_id: row.talent_id,
    course_id: row.course_id,
    progress: Number(row.progress ?? 0),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapInterview(row: any): MvpInterview {
  return {
    id: row.id,
    application_id: row.application_id,
    scheduled_at: row.scheduled_at,
    meeting_link: row.meeting_link,
    feedback: row.feedback,
    created_at: row.created_at,
  };
}

function mapMessage(row: any): MvpMessage {
  return {
    id: row.id,
    from_user_id: row.from_user_id,
    to_user_id: row.to_user_id,
    thread_type: row.thread_type,
    body: row.body,
    created_at: row.created_at,
  };
}

function mapNotification(row: any): MvpNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    read_at: row.read_at,
    created_at: row.created_at,
  };
}

function mapInvoice(row: any): MvpInvoice {
  return {
    id: row.id,
    company_id: row.company_id,
    amount: Number(row.amount ?? 0),
    currency: row.currency,
    status: row.status,
    due_date: row.due_date,
    paid_at: row.paid_at,
    created_at: row.created_at,
  };
}

function mapAuditLog(row: any): MvpAuditLog {
  return {
    id: row.id,
    actor_id: row.actor_id,
    action: row.action,
    entity: row.entity,
    entity_id: row.entity_id,
    metadata: row.metadata ?? {},
    created_at: row.created_at,
  };
}

function mapStaffAssignment(row: any): MvpStaffAssignment {
  return {
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    created_at: row.created_at,
  };
}

function mapRolePermission(row: any): MvpRolePermission {
  return {
    id: row.id,
    role: row.role,
    resource: row.resource,
    action: row.action,
    allowed: Boolean(row.allowed),
  };
}

export const mvp = {
  schema: mvpSchema,

  async getMyProfile(userId: string): Promise<MvpProfile | null> {
    const { data, error } = await mvpSchema.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : null;
  },

  async upsertProfile(input: { id: string; role: MvpRole; company_id?: string | null }): Promise<MvpProfile> {
    const { data, error } = await mvpSchema
      .from("profiles")
      .upsert({ id: input.id, role: input.role, company_id: input.company_id ?? null }, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return mapProfile(data);
  },

  async listTalentProfiles(): Promise<MvpTalentProfile[]> {
    const { data, error } = await mvpSchema
      .from("talent_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapTalentProfile);
  },

  async upsertTalentProfile(input: {
    user_id: string;
    bio?: string;
    skills?: string[];
    languages?: string[];
    readiness_score?: number;
    coach_rating?: number;
    availability?: boolean;
    placement_status?: PlacementStatus;
  }): Promise<MvpTalentProfile> {
    const payload = {
      user_id: input.user_id,
      bio: input.bio ?? null,
      skills: input.skills ?? [],
      languages: input.languages ?? [],
      readiness_score: input.readiness_score ?? 0,
      coach_rating: input.coach_rating ?? 0,
      availability: input.availability ?? true,
      placement_status: input.placement_status ?? "LEARNING",
    };

    const { data, error } = await mvpSchema
      .from("talent_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;
    return mapTalentProfile(data);
  },

  async markTalentJobReady(userId: string): Promise<MvpTalentProfile> {
    const { data, error } = await mvpSchema
      .from("talent_profiles")
      .update({ placement_status: "JOB_READY" })
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return mapTalentProfile(data);
  },

  async createCompany(input: { name: string; industry?: string; country?: string }): Promise<MvpCompany> {
    const { data, error } = await mvpSchema
      .from("companies")
      .insert({ name: input.name, industry: input.industry ?? null, country: input.country ?? null })
      .select("*")
      .single();
    if (error) throw error;
    return mapCompany(data);
  },

  async listCompanies(): Promise<MvpCompany[]> {
    const { data, error } = await mvpSchema.from("companies").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCompany);
  },

  async listOpenJobs(): Promise<MvpJob[]> {
    const { data, error } = await mvpSchema
      .from("jobs")
      .select("*")
      .eq("status", "OPEN")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapJob);
  },

  async listCompanyJobs(companyId?: string | null): Promise<MvpJob[]> {
    let query = mvpSchema.from("jobs").select("*").order("created_at", { ascending: false });
    if (companyId) {
      query = query.eq("company_id", companyId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapJob);
  },

  async createJob(input: {
    company_id: string;
    title: string;
    description: string;
    required_skills?: string[];
    location?: string;
    salary_range?: string;
  }): Promise<MvpJob> {
    const { data, error } = await mvpSchema
      .from("jobs")
      .insert({
        company_id: input.company_id,
        title: input.title,
        description: input.description,
        required_skills: input.required_skills ?? [],
        location: input.location ?? null,
        salary_range: input.salary_range ?? null,
        status: "OPEN",
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapJob(data);
  },

  async listJobs(): Promise<MvpJob[]> {
    const { data, error } = await mvpSchema.from("jobs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapJob);
  },

  async applyToJob(jobId: string, talentId: string): Promise<MvpApplication> {
    const { data, error } = await mvpSchema
      .from("applications")
      .insert({ job_id: jobId, talent_id: talentId, stage: "APPLIED" })
      .select("*")
      .single();
    if (error) throw error;
    return mapApplication(data);
  },

  async listApplications(): Promise<MvpApplication[]> {
    const { data, error } = await mvpSchema
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapApplication);
  },

  async listTalentApplications(talentId: string): Promise<MvpApplication[]> {
    const { data, error } = await mvpSchema
      .from("applications")
      .select("*")
      .eq("talent_id", talentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapApplication);
  },

  async listCompanyApplications(companyId: string): Promise<MvpApplication[]> {
    const { data: jobs, error: jobsError } = await mvpSchema.from("jobs").select("id").eq("company_id", companyId);
    if (jobsError) throw jobsError;

    const jobIds = (jobs ?? []).map((job: any) => job.id);
    if (!jobIds.length) {
      return [];
    }

    const { data, error } = await mvpSchema
      .from("applications")
      .select("*")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapApplication);
  },

  async updateApplicationStage(applicationId: string, stage: ApplicationStage): Promise<MvpApplication> {
    const { data, error } = await mvpSchema
      .from("applications")
      .update({ stage })
      .eq("id", applicationId)
      .select("*")
      .single();
    if (error) throw error;
    return mapApplication(data);
  },

  async listCourses(): Promise<MvpCourse[]> {
    const { data, error } = await mvpSchema.from("courses").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCourse);
  },

  async listTalentEnrollments(talentId: string): Promise<MvpEnrollment[]> {
    const { data, error } = await mvpSchema
      .from("enrollments")
      .select("*")
      .eq("talent_id", talentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapEnrollment);
  },

  async listAllEnrollments(): Promise<MvpEnrollment[]> {
    const { data, error } = await mvpSchema.from("enrollments").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapEnrollment);
  },

  async listInterviews(): Promise<MvpInterview[]> {
    const { data, error } = await mvpSchema.from("interviews").select("*").order("scheduled_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapInterview);
  },

  async listMessages(): Promise<MvpMessage[]> {
    const { data, error } = await mvpSchema.from("messages").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapMessage);
  },

  async listNotifications(): Promise<MvpNotification[]> {
    const { data, error } = await mvpSchema.from("notifications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNotification);
  },

  async listInvoices(): Promise<MvpInvoice[]> {
    const { data, error } = await mvpSchema.from("invoices").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapInvoice);
  },

  async listAuditLogs(): Promise<MvpAuditLog[]> {
    const { data, error } = await mvpSchema.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return (data ?? []).map(mapAuditLog);
  },

  async listStaffAssignments(): Promise<MvpStaffAssignment[]> {
    const { data, error } = await mvpSchema.from("staff_assignments").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapStaffAssignment);
  },

  async listRolePermissions(): Promise<MvpRolePermission[]> {
    const { data, error } = await mvpSchema.from("role_permissions").select("*");
    if (error) throw error;
    return (data ?? []).map(mapRolePermission);
  },
};

export function roleHomePath(role: MvpRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "COMPANY") return "/company";
  return "/talent";
}
