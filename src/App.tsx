import { ReactElement, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import '@/i18n';
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { DashboardAccessGate } from "./pages/dashboard/components/DashboardAccessGate";

const Index = lazy(() => import("./pages/Index"));
const SkillCore = lazy(() => import("./pages/SkillCore"));
const Discovery = lazy(() => import("./pages/Discovery"));
const TalentFlow = lazy(() => import("./pages/TalentFlow"));
const Companies = lazy(() => import("./pages/Companies"));
const Partners = lazy(() => import("./pages/Partners"));
const Realcore = lazy(() => import("./pages/Realcore"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Apply = lazy(() => import("./pages/Apply"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SapBtpCourse = lazy(() => import("./pages/courses/SapBtpCourse"));
const StandardCoursePage = lazy(() => import("./pages/courses/StandardCoursePage"));
const TalentPoolPage = lazy(() => import("./pages/TalentPoolPage"));
const TalentProfile = lazy(() => import("./pages/TalentProfile"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const MvpRoleRedirect = lazy(() => import("./pages/mvp/MvpRoleRedirect"));
const MvpRoleGuard = lazy(() => import("./pages/mvp/MvpRoleGuard").then((module) => ({ default: module.MvpRoleGuard })));
const AdminLayout = lazy(() => import("./pages/dashboard/admin/AdminLayout"));
const AdminOverviewPage = lazy(() => import("./pages/mvp/admin/AdminOverviewPage"));
const AdminSkillCoreDashboardPage = lazy(() => import("./pages/mvp/admin/AdminProgramDashboards").then((module) => ({ default: module.AdminSkillCoreDashboardPage })));
const AdminDiscoveryDashboardPage = lazy(() => import("./pages/mvp/admin/AdminProgramDashboards").then((module) => ({ default: module.AdminDiscoveryDashboardPage })));
const AdminTalentFlowDashboardPage = lazy(() => import("./pages/mvp/admin/AdminProgramDashboards").then((module) => ({ default: module.AdminTalentFlowDashboardPage })));
const AdminTalentsPage = lazy(() => import("./pages/mvp/admin/AdminTalentsPage"));
const AdminCompaniesPage = lazy(() => import("./pages/mvp/admin/AdminCompaniesPage"));
const AdminJobsPage = lazy(() => import("./pages/mvp/admin/AdminJobsPage"));
const AdminApplicationsPage = lazy(() => import("./pages/mvp/admin/AdminApplicationsPage"));
const AdminInterviewsPage = lazy(() => import("./pages/dashboard/admin/AdminInterviewsPage"));
const AdminAcademyPage = lazy(() => import("./pages/mvp/admin/AdminAcademyPage"));
const AdminReadinessPage = lazy(() => import("./pages/mvp/admin/AdminReadinessPage"));
const AdminPipelinePage = lazy(() => import("./pages/mvp/admin/AdminPipelinePage"));
const AdminMessagingPage = lazy(() => import("./pages/dashboard/admin/AdminMessagingPage"));
const AdminFinancePage = lazy(() => import("./pages/mvp/admin/AdminFinancePage"));
const AdminSupportPage = lazy(() => import("./pages/mvp/admin/AdminSupportPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/mvp/admin/AdminAnalyticsPage"));
const AdminSettingsPage = lazy(() => import("./pages/mvp/admin/AdminSettingsPage"));
import { UnifiedDashboardLayout } from "./pages/dashboard/components/UnifiedDashboardLayout";
import AdminSystemPage from "./pages/dashboard/admin/AdminSystemPage";
import TalentLayout from "./pages/dashboard/talent/TalentLayout";
const TalentHomePage = lazy(() => import("./pages/dashboard/talent/TalentHomePage"));
const TalentLearningPage = lazy(() => import("./pages/mvp/talent/TalentLearningPage"));
const TalentAssessmentsPage = lazy(() => import("./pages/mvp/talent/TalentAssessmentsPage"));
const TalentMvpProfilePage = lazy(() => import("./pages/dashboard/talent/TalentProfilePage"));
// Alias for cleaner usage in new routes
const TalentProfilePage = TalentMvpProfilePage;
const TalentJobsPage = lazy(() => import("./pages/mvp/talent/TalentJobsPage"));
const TalentApplicationsPage = lazy(() => import("./pages/mvp/talent/TalentApplicationsPage"));
const TalentCoachingPage = lazy(() => import("./pages/mvp/talent/TalentCoachingPage"));
const TalentCoachPage = lazy(() => import("./pages/dashboard/talent/TalentCoachPage"));
const ResumeAnalysisPage = lazy(() => import("./pages/dashboard/talent/ResumeAnalysisPage"));
const TalentRoadmapPage = lazy(() => import("./pages/dashboard/talent/TalentRoadmapPage"));
const TalentMessagesPage = lazy(() => import("./pages/mvp/talent/TalentMessagesPage"));
const TalentAlumniPage = lazy(() => import("./pages/mvp/talent/TalentAlumniPage"));
const CompanyLayout = lazy(() => import("./pages/dashboard/company/CompanyLayout"));
// Renamed to avoid potential conflict
const CompanyHome = lazy(() => import("./pages/mvp/company/CompanyHomePage"));
const CompanyTalentPoolPage = lazy(() => import("./pages/mvp/company/CompanyTalentPoolPage"));
const CompanyApplicantsPage = lazy(() => import("./pages/dashboard/company/CompanyApplicantsPage"));
const CompanyOffersPage = lazy(() => import("./pages/mvp/company/CompanyOffersPage"));
const CompanyBillingPage = lazy(() => import("./pages/mvp/company/CompanyBillingPage"));
const CompanyMessagesPage = lazy(() => import("./pages/mvp/company/CompanyMessagesPage"));
const CompanyProfilePage = lazy(() => import("./pages/mvp/company/CompanyProfilePage"));
const CompanyJobsPage = lazy(() => import("./pages/mvp/company/CompanyJobsPage"));
const AdminWorkspace = lazy(() => import("./pages/dashboard/AdminWorkspace"));
const CompanyWorkspace = lazy(() => import("./pages/dashboard/CompanyWorkspace"));
const ExternalTalentDashboard = lazy(() => import("./pages/dashboard/ExternalTalentDashboard"));
const TalentLayout = lazy(() => import("./pages/dashboard/talent/TalentLayout"));
const TalentOverviewPage = lazy(() => import("./pages/dashboard/talent/TalentOverviewPage"));
const TalentCoursesPage = lazy(() => import("./pages/dashboard/talent/TalentCoursesPage"));
const TalentCourseDetailsPage = lazy(() => import("./pages/dashboard/talent/TalentCourseDetailsPage"));
const TalentCourseDetailsEntryPage = lazy(() => import("./pages/dashboard/talent/TalentCourseDetailsEntryPage"));
const Pricing = lazy(() => import("./pages/Pricing"));

const Vision = lazy(() => import("./pages/about/Vision"));
const Values = lazy(() => import("./pages/about/Values"));
const SkillCoreRedirect = lazy(() => import("./pages/about/AboutRedirects").then((module) => ({ default: module.SkillCoreRedirect })));
const DiscoveryRedirect = lazy(() => import("./pages/about/AboutRedirects").then((module) => ({ default: module.DiscoveryRedirect })));
const TalentFlowRedirect = lazy(() => import("./pages/about/AboutRedirects").then((module) => ({ default: module.TalentFlowRedirect })));

const Karrierepfade = lazy(() => import("./pages/talente/Karrierepfade"));
const Bootcamps = lazy(() => import("./pages/talente/Bootcamps"));
const Zertifizierungen = lazy(() => import("./pages/talente/Zertifizierungen"));
const Beratung = lazy(() => import("./pages/talente/Beratung"));
const TalentPool = lazy(() => import("./pages/talente/TalentPool"));

const CorporateTraining = lazy(() => import("./pages/unternehmen/CorporateTraining"));
const Upskilling = lazy(() => import("./pages/unternehmen/Upskilling"));
const UnternehmenTalentPool = lazy(() => import("./pages/unternehmen/UnternehmenTalentPool"));
const WarumMarokko = lazy(() => import("./pages/unternehmen/WarumMarokko"));
const Partner = lazy(() => import("./pages/unternehmen/Partner"));

const queryClient = new QueryClient();

const routeLoader = (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const withLayout = (element: ReactElement) => <Layout>{element}</Layout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Suspense fallback={routeLoader}>
          <Routes>
            <Route path="/" element={withLayout(<Index />)} />
            <Route path="/skillcore" element={withLayout(<SkillCore />)} />
            <Route path="/discovery" element={withLayout(<Discovery />)} />
            <Route path="/talentflow" element={withLayout(<TalentFlow />)} />
            <Route path="/companies" element={withLayout(<Companies />)} />
            <Route path="/pricing" element={withLayout(<Pricing />)} />
            <Route path="/partners" element={withLayout(<Partners />)} />
            <Route path="/realcore" element={withLayout(<Realcore />)} />
            <Route path="/about" element={withLayout(<About />)} />
            <Route path="/blog" element={withLayout(<Blog />)} />
            <Route path="/contactus" element={withLayout(<ContactUs />)} />
            <Route path="/contact" element={<Navigate to="/contactus" replace />} />
            <Route path="/apply" element={withLayout(<Apply />)} />
            <Route path="/talent-pool" element={withLayout(<TalentPoolPage />)} />
            <Route path="/profile/:id" element={withLayout(<TalentProfile />)} />

            {/* About sub-pages */}
            <Route path="/about/vision" element={withLayout(<Vision />)} />
            <Route path="/about/values" element={withLayout(<Values />)} />
            {/* Redirects to canonical URLs */}
            <Route path="/about/skillcore" element={withLayout(<SkillCoreRedirect />)} />
            <Route path="/about/discovery" element={withLayout(<DiscoveryRedirect />)} />
            <Route path="/about/talentflow" element={withLayout(<TalentFlowRedirect />)} />

            {/* Talente routes */}
            <Route path="/talente/karrierepfade" element={withLayout(<Karrierepfade />)} />
            <Route path="/talente/bootcamps" element={withLayout(<Bootcamps />)} />
            <Route path="/talente/zertifizierungen" element={withLayout(<Zertifizierungen />)} />
            <Route path="/talente/beratung" element={withLayout(<Beratung />)} />
            <Route path="/talente/talent-pool" element={withLayout(<TalentPool />)} />

            {/* Unternehmen routes */}
            <Route path="/unternehmen/corporate-training" element={withLayout(<CorporateTraining />)} />
            <Route path="/unternehmen/upskilling" element={withLayout(<Upskilling />)} />
            <Route path="/unternehmen/talent-pool" element={withLayout(<UnternehmenTalentPool />)} />
            <Route path="/unternehmen/warum-marokko" element={withLayout(<WarumMarokko />)} />
            <Route path="/unternehmen/partner" element={withLayout(<Partner />)} />
            <Route path="/unternehmen/anfrage" element={<Navigate to="/contactus" replace />} />

            {/* Course routes - canonical under /skillcore/courses/ */}
            <Route path="/skillcore/courses/sap-btp" element={withLayout(<SapBtpCourse />)} />
            <Route path="/skillcore/courses/:courseSlug" element={withLayout(<StandardCoursePage />)} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />

            <Route path="/dashboard" element={<MvpRoleRedirect />} />

            <Route
              path="/admin"
              element={
                <MvpRoleGuard role="ADMIN">
                  <AdminLayout />
                </MvpRoleGuard>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="skillcore" element={<AdminSkillCoreDashboardPage />} />
              <Route path="discovery" element={<AdminDiscoveryDashboardPage />} />
              <Route path="talentflow" element={<AdminTalentFlowDashboardPage />} />
              <Route path="talents" element={<AdminTalentsPage />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="interviews" element={<AdminInterviewsPage />} />
              <Route path="academy" element={<AdminAcademyPage />} />
              <Route path="readiness" element={<AdminReadinessPage />} />
              <Route path="pipeline" element={<AdminPipelinePage />} />
              <Route path="messaging" element={<AdminMessagingPage />} />
              <Route path="finance" element={<AdminFinancePage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route
              path="/talent"
              element={
                <MvpRoleGuard role="TALENT">
                  <TalentLayout />
                </MvpRoleGuard>
              }
            >
              <Route index element={<TalentHomePage />} />
              <Route path="learning" element={<TalentLearningPage />} />
              <Route path="assessments" element={<TalentAssessmentsPage />} />
              <Route path="profile" element={<TalentMvpProfilePage />} />
              <Route path="jobs" element={<TalentJobsPage />} />
              <Route path="applications" element={<TalentApplicationsPage />} />
              <Route path="coaching" element={<TalentCoachingPage />} />
              <Route path="coach" element={<TalentCoachPage />} />
              <Route path="resume-analysis" element={<ResumeAnalysisPage />} />
              <Route path="roadmap" element={<TalentRoadmapPage />} />
              <Route path="messages" element={<TalentMessagesPage />} />
              <Route path="alumni" element={<TalentAlumniPage />} />
            </Route>

            <Route
              path="/company"
              element={
                <MvpRoleGuard role="COMPANY">
                  <CompanyLayout />
                </MvpRoleGuard>
              }
            >
              <Route index element={<CompanyHome />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="jobs" element={<CompanyJobsPage />} />
              <Route path="talent-pool" element={<CompanyTalentPoolPage />} />
              <Route path="applicants" element={<CompanyApplicantsPage />} />
              <Route path="offers" element={<CompanyOffersPage />} />
              <Route path="billing" element={<CompanyBillingPage />} />
              <Route path="messages" element={<CompanyMessagesPage />} />
            </Route>

            {/* NEW: Unified Dashboard Layout */}
            <Route
              path="/dashboard"
              element={
                <DashboardAccessGate allowedRoles={["TALENT", "COMPANY", "ADMIN"] as any}>
                  <UnifiedDashboardLayout />
                </DashboardAccessGate>
              }
            >
              <Route index element={<Navigate to="talent" replace />} />

              {/* Talent Routes */}
              <Route path="talent">
                <Route index element={<TalentHomePage />} />
                <Route path="profile" element={<TalentProfilePage />} />
                <Route path="learning" element={<TalentLearningPage />} />
                <Route path="applications" element={<TalentApplicationsPage />} />
                <Route path="roadmap" element={<TalentRoadmapPage />} />
                <Route path="assessments" element={<TalentAssessmentsPage />} />
                <Route path="coaching" element={<TalentCoachingPage />} />
                <Route path="coach" element={<TalentCoachPage />} />
                <Route path="resume-analysis" element={<ResumeAnalysisPage />} />
                <Route path="jobs" element={<TalentJobsPage />} />
                <Route path="messages" element={<TalentMessagesPage />} />
              </Route>

              {/* Company Routes */}
              <Route path="company">
                <Route index element={<CompanyHome />} />
                <Route path="talent-pool" element={<CompanyTalentPoolPage />} />
                <Route path="applications" element={<CompanyApplicantsPage />} />
              </Route>

              {/* Admin Routes - Nested under Unified Layout */}
              <Route
                path="admin"
                element={
                  <DashboardAccessGate allowedRoles={["admin"] as any}>
                    <AdminLayout />
                  </DashboardAccessGate>
                }
              >
                <Route index element={<AdminOverviewPage />} />
                <Route path="skillcore" element={<AdminSkillCoreDashboardPage />} />
                <Route path="discovery" element={<AdminDiscoveryDashboardPage />} />
                <Route path="talentflow" element={<AdminTalentFlowDashboardPage />} />
                <Route path="talents" element={<AdminTalentsPage />} />
                <Route path="companies" element={<AdminCompaniesPage />} />
                <Route path="jobs" element={<AdminJobsPage />} />
                <Route path="applications" element={<AdminApplicationsPage />} />
                <Route path="interviews" element={<AdminInterviewsPage />} />
                <Route path="academy" element={<AdminAcademyPage />} />
                <Route path="readiness" element={<AdminReadinessPage />} />
                <Route path="pipeline" element={<AdminPipelinePage />} />
                <Route path="messaging" element={<AdminMessagingPage />} />
                <Route path="finance" element={<AdminFinancePage />} />
                <Route path="support" element={<AdminSupportPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="system" element={<AdminSystemPage />} />
              </Route>
            </Route>
            <Route
              path="/dashboard/talent-external"
              element={
                <DashboardAccessGate allowedRoles={["TALENT"] as any}>
                  <ExternalTalentDashboard />
                </DashboardAccessGate>
              }
            />

            {/* Legacy routes/redirects could go here if needed */}

            {/* Legacy course routes - redirect to canonical */}
            <Route path="/courses/sap-btp" element={withLayout(<SapBtpCourse />)} />
            <Route path="/courses/:courseSlug" element={withLayout(<StandardCoursePage />)} />

            {/* Catch-all */}
            <Route path="*" element={withLayout(<NotFound />)} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
