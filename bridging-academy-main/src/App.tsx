import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import '@/i18n';
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import SkillCore from "./pages/SkillCore";
import Discovery from "./pages/Discovery";
import TalentFlow from "./pages/TalentFlow";
import Companies from "./pages/Companies";
import Partners from "./pages/Partners";
import Realcore from "./pages/Realcore";
import About from "./pages/About";
import Blog from "./pages/Blog";
import ContactUs from "./pages/ContactUs";
import Apply from "./pages/Apply";
import NotFound from "./pages/NotFound";
import SapBtpCourse from "./pages/courses/SapBtpCourse";
import StandardCoursePage from "./pages/courses/StandardCoursePage";
import TalentPoolPage from "./pages/TalentPoolPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import CandidateProfile from "./pages/dashboard/CandidateProfile";
import Pricing from "./pages/Pricing";

// About sub-pages
import Vision from "./pages/about/Vision";
import Values from "./pages/about/Values";
import { SkillCoreRedirect, DiscoveryRedirect, TalentFlowRedirect } from "./pages/about/AboutRedirects";

// Talente pages
import Karrierepfade from "./pages/talente/Karrierepfade";
import Bootcamps from "./pages/talente/Bootcamps";
import Zertifizierungen from "./pages/talente/Zertifizierungen";
import Beratung from "./pages/talente/Beratung";
import TalentPool from "./pages/talente/TalentPool";

// Unternehmen pages
import CorporateTraining from "./pages/unternehmen/CorporateTraining";
import Upskilling from "./pages/unternehmen/Upskilling";
import UnternehmenTalentPool from "./pages/unternehmen/UnternehmenTalentPool";
import WarumMarokko from "./pages/unternehmen/WarumMarokko";
import Partner from "./pages/unternehmen/Partner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/skillcore" element={<SkillCore />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/talentflow" element={<TalentFlow />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/realcore" element={<Realcore />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/contact" element={<Navigate to="/contactus" replace />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/talent-pool" element={<TalentPoolPage />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* About sub-pages */}
            <Route path="/about/vision" element={<Vision />} />
            <Route path="/about/values" element={<Values />} />
            {/* Redirects to canonical URLs */}
            <Route path="/about/skillcore" element={<SkillCoreRedirect />} />
            <Route path="/about/discovery" element={<DiscoveryRedirect />} />
            <Route path="/about/talentflow" element={<TalentFlowRedirect />} />

            {/* Talente routes */}
            <Route path="/talente/karrierepfade" element={<Karrierepfade />} />
            <Route path="/talente/bootcamps" element={<Bootcamps />} />
            <Route path="/talente/zertifizierungen" element={<Zertifizierungen />} />
            <Route path="/talente/beratung" element={<Beratung />} />
            <Route path="/talente/talent-pool" element={<TalentPool />} />

            {/* Unternehmen routes */}
            <Route path="/unternehmen/corporate-training" element={<CorporateTraining />} />
            <Route path="/unternehmen/upskilling" element={<Upskilling />} />
            <Route path="/unternehmen/talent-pool" element={<UnternehmenTalentPool />} />
            <Route path="/unternehmen/warum-marokko" element={<WarumMarokko />} />
            <Route path="/unternehmen/partner" element={<Partner />} />
            <Route path="/unternehmen/anfrage" element={<Navigate to="/contactus" replace />} />

            {/* Course routes - canonical under /skillcore/courses/ */}
            <Route path="/skillcore/courses/sap-btp" element={<SapBtpCourse />} />
            <Route path="/skillcore/courses/:courseSlug" element={<StandardCoursePage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/candidate/:id" element={<CandidateProfile />} />

            {/* Legacy course routes - redirect to canonical */}
            <Route path="/courses/sap-btp" element={<SapBtpCourse />} />
            <Route path="/courses/:courseSlug" element={<StandardCoursePage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;