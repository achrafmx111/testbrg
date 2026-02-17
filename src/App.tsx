import { ReactElement, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GodModeControl } from "@/components/admin/GodModeControl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import '@/i18n';
import Layout from "./components/layout/Layout";
import { GlobalSearch } from "@/components/GlobalSearch";
import ScrollToTop from "./components/ScrollToTop";
import { DashboardAccessGate } from "./pages/dashboard/components/DashboardAccessGate";


// Public Pages
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
const Pricing = lazy(() => import("./pages/Pricing"));

// About Sub-pages
const Vision = lazy(() => import("./pages/about/Vision"));
const Values = lazy(() => import("./pages/about/Values"));
const SkillCoreRedirect = lazy(() => import("./pages/about/AboutRedirects").then((module) => ({ default: module.SkillCoreRedirect })));
const DiscoveryRedirect = lazy(() => import("./pages/about/AboutRedirects").then((module) => ({ default: module.DiscoveryRedirect })));
const TalentFlowRedirect = lazy(() => import("./pages/about/AboutRedirects").then((module) => ({ default: module.TalentFlowRedirect })));

// Talente / Unternehmen Legacy Public Pages
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

// Auth & Legacy Profile
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const TalentPoolPage = lazy(() => import("./pages/TalentPoolPage"));
const TalentProfile = lazy(() => import("./pages/TalentProfile"));
const TalentShopPage = lazy(() => import("./pages/dashboard/talent/TalentShopPage"));
const TalentPricingPage = lazy(() => import("./pages/dashboard/talent/TalentPricingPage"));
const CommunityPage = lazy(() => import("./pages/dashboard/talent/CommunityPage"));
const VisaTrackerPage = lazy(() => import("./pages/dashboard/talent/VisaTrackerPage"));
const CostOfLivingPage = lazy(() => import("./pages/dashboard/talent/CostOfLivingPage"));
const DocumentVaultPage = lazy(() => import("./pages/dashboard/talent/DocumentVaultPage"));
const CompanyHomePage = lazy(() => import("./pages/dashboard/company/CompanyHomePage"));
const MvpRoleRedirect = lazy(() => import("./components/MvpRoleRedirect"));
const MvpRoleGuard = lazy(() => import("./components/MvpRoleGuard").then((module) => ({ default: module.MvpRoleGuard })));
const DashboardLegacyRedirect = lazy(() => import("./components/DashboardLegacyRedirect"));

// Admin Pages
const AdminLayout = lazy(() => import("./pages/dashboard/admin/AdminLayout"));
const AdminOverviewPage = lazy(() => import("./pages/dashboard/admin/AdminOverviewPage"));
const AdminSkillCoreDashboardPage = lazy(() => import("./pages/dashboard/admin/AdminProgramDashboards").then((module) => ({ default: module.AdminSkillCoreDashboardPage })));
const AdminDiscoveryDashboardPage = lazy(() => import("./pages/dashboard/admin/AdminProgramDashboards").then((module) => ({ default: module.AdminDiscoveryDashboardPage })));
const AdminTalentFlowDashboardPage = lazy(() => import("./pages/dashboard/admin/AdminProgramDashboards").then((module) => ({ default: module.AdminTalentFlowDashboardPage })));
const AdminTalentsPage = lazy(() => import("./pages/dashboard/admin/AdminTalentsPage"));
const AdminAiLogsPage = lazy(() => import("./pages/dashboard/admin/AdminAiLogsPage"));
const AdminMatchmakerPage = lazy(() => import("./pages/dashboard/admin/AdminMatchmakerPage"));
const AdminCompaniesPage = lazy(() => import("./pages/dashboard/admin/AdminCompaniesPage"));
const AdminJobsPage = lazy(() => import("./pages/dashboard/admin/AdminJobsPage"));
const AdminApprovalsPage = lazy(() => import("./pages/dashboard/admin/AdminApprovalsPage"));
const AdminApplicationsPage = lazy(() => import("./pages/dashboard/admin/AdminApplicationsPage"));
const AdminInterviewsPage = lazy(() => import("./pages/dashboard/admin/AdminInterviewsPage"));
const AdminAcademyPage = lazy(() => import("./pages/dashboard/admin/AdminAcademyPage"));
const AdminReadinessPage = lazy(() => import("./pages/dashboard/admin/AdminReadinessPage"));
const AdminPipelinePage = lazy(() => import("./pages/dashboard/admin/AdminPipelinePage"));
const AdminMessagingPage = lazy(() => import("./pages/dashboard/admin/AdminMessagingPage"));
const AdminFinancePage = lazy(() => import("./pages/dashboard/admin/AdminFinancePage"));
const AdminSupportPage = lazy(() => import("./pages/dashboard/admin/AdminSupportPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/dashboard/admin/AdminAnalyticsPage"));
const AdminSettingsPage = lazy(() => import("./pages/dashboard/admin/AdminSettingsPage"));
const AdminSystemPage = lazy(() => import("./pages/dashboard/admin/AdminSystemPage"));

// Talent Pages
const TalentLayout = lazy(() => import("./pages/dashboard/talent/TalentLayout"));
const TalentHomePage = lazy(() => import("./pages/dashboard/talent/TalentHomePage"));
const TalentLearningPage = lazy(() => import("./pages/dashboard/talent/TalentLearningPage"));
const TalentAssessmentsPage = lazy(() => import("./pages/dashboard/talent/TalentAssessmentsPage"));
const TalentMvpProfilePage = lazy(() => import("./pages/dashboard/talent/TalentProfilePage"));
const TalentProfilePage = TalentMvpProfilePage;
const TalentJobsPage = lazy(() => import("./pages/dashboard/talent/TalentJobsPage"));
const TalentApplicationsPage = lazy(() => import("./pages/dashboard/talent/TalentApplicationsPage"));
const TalentCoachingPage = lazy(() => import("./pages/dashboard/talent/TalentCoachingPage"));
// ... existing imports ...
const TalentCoachPage = lazy(() => import("@/pages/dashboard/talent/TalentCoachPage"));
const LinkedInOptimizerPage = lazy(() => import("./pages/dashboard/talent/LinkedInOptimizerPage"));
const LeaderboardPage = lazy(() => import("./pages/dashboard/talent/LeaderboardPage"));
const DuelPage = lazy(() => import("./pages/dashboard/talent/DuelPage"));
// TalentShopPage removed (duplicate)
// ... existing imports ...
const ResumeAnalysisPage = lazy(() => import("@/pages/dashboard/talent/ResumeAnalysisPage"));
const TalentRoadmapPage = lazy(() => import("./pages/dashboard/talent/TalentRoadmapPage"));
const TalentMessagesPage = lazy(() => import("./pages/dashboard/talent/TalentMessagesPage"));
const TalentAlumniPage = lazy(() => import("./pages/dashboard/talent/TalentAlumniPage"));
const TalentCourseDetailsPage = lazy(() => import("./pages/dashboard/talent/TalentCourseDetailsPage"));

// Company Pages
const CompanyLayout = lazy(() => import("@/pages/dashboard/company/CompanyLayout"));
// CompanyHomePage removed (duplicate)
const CompanyTalentPoolPage = lazy(() => import("@/pages/dashboard/company/CompanyTalentPoolPage"));
const CompanyApplicantsPage = lazy(() => import("./pages/dashboard/company/CompanyApplicantsPage"));
const CompanyOffersPage = lazy(() => import("./pages/dashboard/company/CompanyOffersPage"));
const CompanyBillingPage = lazy(() => import("./pages/dashboard/company/CompanyBillingPage"));
const CompanyMessagesPage = lazy(() => import("./pages/dashboard/company/CompanyMessagesPage"));
const CompanyProfilePage = lazy(() => import("./pages/dashboard/company/CompanyProfilePage"));
const CompanyJobsPage = lazy(() => import("./pages/dashboard/company/CompanyJobsPage"));
const CompanyPipelinePage = lazy(() => import("./pages/dashboard/company/CompanyPipelinePage"));
const CompanyAnalyticsPage = lazy(() => import("./pages/dashboard/company/CompanyAnalyticsPage"));

// External/Other
const ExternalTalentDashboard = lazy(() => import("./pages/dashboard/ExternalTalentDashboard"));


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
        <GodModeControl />
        <GlobalSearch />
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
            <Route path="/about/skillcore" element={withLayout(<SkillCoreRedirect />)} />
            <Route path="/about/discovery" element={withLayout(<DiscoveryRedirect />)} />
            <Route path="/about/talentflow" element={withLayout(<TalentFlowRedirect />)} />

            {/* Legacy Content Routes */}
            <Route path="/talente/karrierepfade" element={withLayout(<Karrierepfade />)} />
            <Route path="/talente/bootcamps" element={withLayout(<Bootcamps />)} />
            <Route path="/talente/zertifizierungen" element={withLayout(<Zertifizierungen />)} />
            <Route path="/talente/beratung" element={withLayout(<Beratung />)} />
            <Route path="/talente/talent-pool" element={withLayout(<TalentPool />)} />
            <Route path="/unternehmen/corporate-training" element={withLayout(<CorporateTraining />)} />
            <Route path="/unternehmen/upskilling" element={withLayout(<Upskilling />)} />
            <Route path="/unternehmen/talent-pool" element={withLayout(<UnternehmenTalentPool />)} />
            <Route path="/unternehmen/warum-marokko" element={withLayout(<WarumMarokko />)} />
            <Route path="/unternehmen/partner" element={withLayout(<Partner />)} />
            <Route path="/unternehmen/anfrage" element={<Navigate to="/contactus" replace />} />

            {/* Course routes */}
            <Route path="/skillcore/courses/sap-btp" element={withLayout(<SapBtpCourse />)} />
            <Route path="/skillcore/courses/:courseSlug" element={withLayout(<StandardCoursePage />)} />
            <Route path="/courses/sap-btp" element={withLayout(<SapBtpCourse />)} />
            <Route path="/courses/:courseSlug" element={withLayout(<StandardCoursePage />)} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />

            <Route path="/dashboard" element={<MvpRoleRedirect />} />
            <Route path="/dashboard/:role/*" element={<DashboardLegacyRedirect />} />

            {/* Legacy Independent Admin Route */}
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
              <Route path="matchmaker" element={<AdminMatchmakerPage />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="interviews" element={<AdminInterviewsPage />} />
              <Route path="ai-logs" element={<AdminAiLogsPage />} />
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

            {/* Legacy Independent Talent Route */}
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
              <Route path="learning/:courseId" element={<TalentCourseDetailsPage />} />
              <Route path="assessments" element={<TalentAssessmentsPage />} />
              <Route path="profile" element={<TalentMvpProfilePage />} />
              <Route path="jobs" element={<TalentJobsPage />} />
              <Route path="applications" element={<TalentApplicationsPage />} />
              <Route path="coaching" element={<TalentCoachingPage />} />
              <Route path="coach" element={<TalentCoachPage />} />
              <Route path="linkedin-optimizer" element={<LinkedInOptimizerPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="shop" element={<TalentShopPage />} />
              <Route path="pricing" element={<TalentPricingPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="duel" element={<DuelPage />} />
              <Route path="resume-analysis" element={<ResumeAnalysisPage />} />
              <Route path="roadmap" element={<TalentRoadmapPage />} />
              <Route path="messages" element={<TalentMessagesPage />} />
              <Route path="alumni" element={<TalentAlumniPage />} />
              <Route path="visa" element={<VisaTrackerPage />} />
              <Route path="cost-of-living" element={<CostOfLivingPage />} />
              <Route path="vault" element={<DocumentVaultPage />} />
            </Route>

            {/* Legacy Independent Company Route */}
            <Route
              path="/company"
              element={
                <MvpRoleGuard role="COMPANY">
                  <CompanyLayout />
                </MvpRoleGuard>
              }
            >
              <Route index element={<CompanyHomePage />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="jobs" element={<CompanyJobsPage />} />
              <Route path="pipeline" element={<CompanyPipelinePage />} />
              <Route path="analytics" element={<CompanyAnalyticsPage />} />
              <Route path="talent-pool" element={<CompanyTalentPoolPage />} />
              <Route path="applicants" element={<CompanyApplicantsPage />} />
              <Route path="offers" element={<CompanyOffersPage />} />
              <Route path="billing" element={<CompanyBillingPage />} />
              <Route path="messages" element={<CompanyMessagesPage />} />
            </Route>



            <Route
              path="/dashboard/talent-external"
              element={
                <DashboardAccessGate allowedRoles={["TALENT"] as any}>
                  <ExternalTalentDashboard />
                </DashboardAccessGate>
              }
            />

            <Route path="*" element={withLayout(<NotFound />)} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
