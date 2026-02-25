import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import PrelimApplication from "./pages/PrelimApplication";
import DetailedApplication from "./pages/DetailedApplication";
import AdminRegistrations from "./pages/AdminRegistrations";
import Login from "./pages/Login";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import SidbiDashboard from "./pages/SidbiDashboard";
import SidbiApplicationReview from "./pages/SidbiApplicationReview";
import ApplicationView from "./pages/ApplicationView";
import PublicData from "./pages/PublicData";
import CommitteeMeeting from "./pages/CommitteeMeeting";
import CommitteeReview from "./pages/CommitteeReview";
import CommitteeMeetingsList from "./pages/CommitteeMeetingsList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          <Route path="/prelim-application" element={<PrelimApplication />} />
          <Route path="/detailed-application" element={<DetailedApplication />} />
          <Route path="/application-view/:id" element={<ApplicationView />} />
          <Route path="/sidbi/dashboard" element={<SidbiDashboard />} />
          <Route path="/sidbi/review/:id" element={<SidbiApplicationReview />} />
          <Route path="/sidbi/meeting/:type" element={<CommitteeMeeting />} />
          <Route path="/sidbi/committee-review/:type/:meetingId?" element={<CommitteeReview />} />
          <Route path="/sidbi/meetings/:type" element={<CommitteeMeetingsList />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/public/data" element={<PublicData />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
