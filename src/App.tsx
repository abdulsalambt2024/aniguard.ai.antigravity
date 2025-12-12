import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import Events from "./pages/Events";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Announcements from "./pages/Announcements";
import Donations from "./pages/Donations";
import AIStudio from "./pages/AIStudio";
import Admin from "./pages/Admin";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import Analytics from "./pages/admin/Analytics";
import AdminTasks from "./pages/admin/AdminTasks";
import ErrorLogs from "./pages/admin/ErrorLogs";
import PaymentTransactions from "./pages/admin/PaymentTransactions";
import Attendance from "./pages/admin/Attendance";
import SlideshowManager from "./pages/admin/SlideshowManager";
import BadgeManagement from "./pages/admin/BadgeManagement";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import ProfileEdit from "./pages/ProfileEdit";
import CampaignDetail from "./pages/CampaignDetail";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
              {/* Public route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Layout><ProtectedRoute><Home /></ProtectedRoute></Layout>} />
              <Route path="/posts" element={<Layout><ProtectedRoute><Posts /></ProtectedRoute></Layout>} />
              <Route path="/events" element={<Layout><ProtectedRoute><Events /></ProtectedRoute></Layout>} />
              <Route path="/chat" element={<Layout><ProtectedRoute><Chat /></ProtectedRoute></Layout>} />
              <Route path="/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
              <Route path="/profile/edit" element={<Layout><ProtectedRoute><ProfileEdit /></ProtectedRoute></Layout>} />
              <Route path="/achievements" element={<Layout><ProtectedRoute><Achievements /></ProtectedRoute></Layout>} />
              <Route path="/announcements" element={<Layout><ProtectedRoute><Announcements /></ProtectedRoute></Layout>} />
              <Route path="/donations" element={<Layout><ProtectedRoute><Donations /></ProtectedRoute></Layout>} />
              <Route path="/ai-studio" element={<Layout><ProtectedRoute requiredRole="member"><AIStudio /></ProtectedRoute></Layout>} />
              <Route path="/admin" element={<Layout><ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute></Layout>} />
              <Route path="/admin/users" element={<Layout><ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute></Layout>} />
              <Route path="/admin/moderation" element={<Layout><ProtectedRoute requiredRole="admin"><ContentModeration /></ProtectedRoute></Layout>} />
              <Route path="/admin/analytics" element={<Layout><ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute></Layout>} />
              <Route path="/admin/tasks" element={<Layout><ProtectedRoute requiredRole="admin"><AdminTasks /></ProtectedRoute></Layout>} />
              <Route path="/admin/errors" element={<Layout><ProtectedRoute requiredRole="super_admin"><ErrorLogs /></ProtectedRoute></Layout>} />
              <Route path="/admin/payments" element={<Layout><ProtectedRoute requiredRole="admin"><PaymentTransactions /></ProtectedRoute></Layout>} />
              <Route path="/admin/attendance" element={<Layout><ProtectedRoute requiredRole="admin"><Attendance /></ProtectedRoute></Layout>} />
              <Route path="/admin/slideshow" element={<Layout><ProtectedRoute requiredRole="admin"><SlideshowManager /></ProtectedRoute></Layout>} />
              <Route path="/admin/badges" element={<Layout><ProtectedRoute requiredRole="super_admin"><BadgeManagement /></ProtectedRoute></Layout>} />
              <Route path="/performance" element={<Layout><ProtectedRoute><PerformanceDashboard /></ProtectedRoute></Layout>} />
              <Route path="/donations/:id" element={<Layout><ProtectedRoute><CampaignDetail /></ProtectedRoute></Layout>} />
              <Route path="/settings" element={<Layout><ProtectedRoute><Settings /></ProtectedRoute></Layout>} />
              <Route path="/help" element={<Layout><ProtectedRoute><Help /></ProtectedRoute></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
