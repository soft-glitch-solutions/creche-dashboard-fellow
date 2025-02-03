import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Students from "./pages/Students";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Reports from "./pages/Reports";
import DashboardLayout from "./components/DashboardLayout";
import UserManagement from "./pages/admin/UserManagement";
import CrecheManagement from "./pages/admin/CrecheManagement";
import CrecheDetails from "./pages/admin/CrecheDetails";
import Integrations from "./pages/admin/Integrations";
import Profile from "./pages/dashboard/Profile";
import ViewInvoice from "./pages/finance/ViewInvoice";
import PrintInvoice from "./pages/finance/PrintInvoice";
import CreateInvoice from "./pages/finance/CreateInvoice";
import Calender from "./pages/Calendar";
import CrecheProfile from "./pages/CrecheProfile";
import EditInvoice from "./pages/finance/EditInvoice";
import Tutorials from "./pages/help/Tutorials";
import SupportChat from "./pages/help/Support-Chat";
import Documentation from "./pages/help/Documentation";
import Faqs from "./pages/help/Faqs";
import Social from "./pages/Social";
import CreateContent from "./pages/help/CreateContent";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ViewContent from "./pages/help/ViewContent";
import EditContent from "./pages/help/EditContent";
import PhotoBook from "./pages/Photobook";
import StudentProfile from "./pages/students/StudentProfile";
import ApplicantProfile from "./pages/applications/ApplicantProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="creche/:id" element={<CrecheProfile />} />
                <Route path="applications" element={<Applications />} />
                <Route path="applications/:id" element={<ApplicantProfile />} />
                <Route path="students" element={<Students />} />
                <Route path="students/:id" element={<StudentProfile />} />
                <Route path="photobook" element={<PhotoBook />} />
                <Route path="finance" element={<Finance />} />
                <Route path="finance/create-invoice" element={<CreateInvoice />} />
                <Route path="finance/invoice/:id" element={<ViewInvoice />} />
                <Route path="finance/invoice/edit/:id" element={<EditInvoice />} />
                <Route path="finance/invoice/:id/pdf" element={<PrintInvoice />} />
                <Route path="calendar" element={<Calender />} />
                <Route path="social" element={<Social />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/integrations" element={<Integrations />} />
                <Route path="settings/creche/:id" element={<CrecheProfile />} />
                <Route path="help" element={<Help />} />
                <Route path="help/documentation" element={<Documentation />} />
                <Route path="help/documentation/new" element={<CreateContent />} />
                <Route path="help/documentation/view/:id" element={<ViewContent />} />
                <Route path="help/documentation/edit/:id" element={<EditContent />} />
                <Route path="help/tutorials" element={<Tutorials />} />
                <Route path="help/tutorials/new" element={<CreateContent />} />
                <Route path="help/tutorials/view/:id" element={<ViewContent />} />
                <Route path="help/tutorials/edit/:id" element={<EditContent />} />
                <Route path="help/support-chat" element={<SupportChat />} />
                <Route path="help/faqs" element={<Faqs />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/creches" element={<CrecheManagement />} />
                <Route path="admin/creches/:id" element={<CrecheDetails />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
