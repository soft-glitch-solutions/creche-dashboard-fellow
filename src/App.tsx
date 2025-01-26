import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />

            {/* Creche Routes */}
            <Route path="creche/:id" element={<CrecheProfile />} />
            <Route path="applications" element={<Applications />} />
            <Route path="students" element={<Students />} />

            <Route path="finance" element={<Finance />} />
            {/* Finance Routes */}
            <Route path="finance/create-invoice" element={<CreateInvoice />} />
            <Route path="finance/invoice/:id" element={<ViewInvoice />} />
            <Route path="finance/invoice/edit/:id" element={<EditInvoice />} />
            <Route path="finance/invoice/:id/pdf" element={<PrintInvoice />} />

            
            <Route path="calendar" element={<Calender />} />
            <Route path="social" element={<Social />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            {/* Help Routes */}
            <Route path="help/documentation" element={<Documentation />} />
            <Route path="help/tutorials" element={<Tutorials />} />
            <Route path="help/support-chat" element={<SupportChat />} />
            <Route path="help/faqs" element={<Faqs />} />

            {/* Admin Routes */}
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/creches" element={<CrecheManagement />} />
            <Route path="admin/creches/:id" element={<CrecheDetails />} />
            <Route path="admin/integrations" element={<Integrations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;