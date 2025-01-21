import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  FileInput,
  Building2,
  Lock,
  Network,
  User,
  Image,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileInput, label: "Applications", path: "/dashboard/applications" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: DollarSign, label: "Finance", path: "/dashboard/finance" },
    { icon: FileText, label: "Reports", path: "/dashboard/reports" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    { icon: HelpCircle, label: "Help Centre", path: "/dashboard/help" },
  ];

  const adminItems = [
    { icon: Users, label: "User Management", path: "/dashboard/admin/users" },
    { icon: Building2, label: "Creche Management", path: "/dashboard/admin/creches" },
    { icon: Network, label: "Integrations", path: "/dashboard/admin/integrations" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex justify-between items-center">
          <h2
            className={cn(
              "font-bold text-primary transition-all duration-300",
              isSidebarOpen ? "text-xl" : "text-xs"
            )}
          >
            {isSidebarOpen ? "Creche Spots" : "CS"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-8 flex-1">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 mb-2",
                !isSidebarOpen && "justify-center px-2"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Admin Section */}
        <div className="mt-auto mb-4">
          <Collapsible
            open={isAdminOpen}
            onOpenChange={setIsAdminOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4",
                  !isSidebarOpen && "justify-center px-2"
                )}
              >
                <Lock className="h-5 w-5" />
                {isSidebarOpen && <span>Admin</span>}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {adminItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 pl-8",
                    !isSidebarOpen && "justify-center px-2"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-5 w-5" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Top navigation bar */}
        <div className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile/picture")}>
                <Image className="mr-2 h-4 w-4" />
                <span>Change Profile Picture</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;