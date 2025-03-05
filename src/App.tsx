
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import ApplicantProfile from "@/pages/applications/ApplicantProfile";
import Students from "@/pages/Students";
import StudentProfile from "@/pages/students/StudentProfile";
import CrecheProfile from "@/pages/CrecheProfile";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AdminUserManagement from "@/pages/admin/AdminUserManagement";
import CompleteProfile from "@/pages/CompleteProfile";
import Calendar from "@/pages/Calendar";
import Finance from "@/pages/Finance";
import CreateInvoice from "@/pages/finance/CreateInvoice";
import ViewInvoice from "@/pages/finance/ViewInvoice";
import EditInvoice from "@/pages/finance/EditInvoice";
import PrintInvoice from "@/pages/finance/PrintInvoice";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/settings/UserManagement";
import { AdminRoute } from "@/components/AdminRoute";
import UserProfile from "@/pages/admin/UserProfile";
import CrecheManagement from "@/pages/admin/CrecheManagement";
import CrecheDetails from "@/pages/admin/CrecheDetails";
import Reports from "@/pages/Reports";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Lessons from "@/pages/Lessons";
import Photobook from "@/pages/Photobook";
import Social from "@/pages/Social";
import ArticleDetail from "@/pages/social/ArticleDetail";
import Integrations from "@/pages/admin/Integrations";
import Profile from "@/pages/dashboard/Profile";
import Help from "@/pages/Help";
import Faqs from "@/pages/help/Faqs";
import Documentation from "@/pages/help/Documentation";
import Tutorials from "@/pages/help/Tutorials";
import SupportChat from "@/pages/help/Support-Chat";
import ViewContent from "@/pages/help/ViewContent";
import CreateContent from "@/pages/help/CreateContent";
import EditContent from "@/pages/help/EditContent";
import SupportRequestDetail from "@/pages/help/SupportRequestDetail";
import { Toaster } from "@/components/ui/sonner";
import SocialProfile from "./pages/social/SocialProfile";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Landing/Auth Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />

                {/* Students */}
                <Route path="students" element={<Students />} />
                <Route path="students/:id" element={<StudentProfile />} />

                {/* Applications */}
                <Route path="applications" element={<Applications />} />
                <Route path="applications/:id" element={<ApplicantProfile />} />

                {/* Calendar */}
                <Route path="calendar" element={<Calendar />} />

                {/* Creche Management */}
                <Route path="creche/:id" element={<CrecheProfile />} />

                {/* Finance */}
                <Route path="finance" element={<Finance />} />
                <Route path="finance/create-invoice" element={<CreateInvoice />} />
                <Route path="finance/invoice/:id" element={<ViewInvoice />} />
                <Route path="finance/invoice/edit/:id" element={<EditInvoice />} />
                <Route path="finance/invoice/:id/pdf" element={<PrintInvoice />} />

                {/* Lessons */}
                <Route path="lessons" element={<Lessons />} />

                {/* Reports */}
                <Route path="reports" element={<Reports />} />

                {/* Photobook */}
                <Route path="photobook" element={<Photobook />} />

                {/* Social */}
                <Route path="social" element={<Social />} />
                <Route path="social/:id" element={<ArticleDetail />} />
                <Route path="social/profile/:id" element={<SocialProfile />} />

                {/* Profile */}
                <Route path="profile" element={<Profile />} />

                {/* Help Center */}
                <Route path="help" element={<Help />} />
                <Route path="help/faqs" element={<Faqs />} />
                <Route path="help/documentation" element={<Documentation />} />
                <Route path="help/tutorials" element={<Tutorials />} />
                <Route path="help/support-chat" element={<SupportChat />} />
                <Route path="help/support-request/:id" element={<SupportRequestDetail />} />
                <Route path="help/view/:id" element={<ViewContent />} />
                <Route path="help/create" element={<CreateContent />} />
                <Route path="help/edit/:id" element={<EditContent />} />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
                <Route path="settings/users" element={<UserManagement />} />
                <Route path="settings/creche/:id" element={<CrecheProfile />} />
                <Route path="settings/integrations" element={<Integrations />} />

                {/* Admin Routes */}
                <Route path="admin" element={<AdminRoute />}>
                  <Route path="user-management" element={<AdminUserManagement />} />
                  <Route path="user/:id" element={<UserProfile />} />
                  <Route path="creche-management" element={<CrecheManagement />} />
                  <Route path="creche/:id" element={<CrecheDetails />} />
                  <Route path="integrations" element={<Integrations />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
