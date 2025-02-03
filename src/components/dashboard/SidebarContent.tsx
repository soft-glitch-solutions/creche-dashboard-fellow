import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarContentProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  isAdmin: boolean;
  isAdminOpen: boolean;
  setIsAdminOpen: (value: boolean) => void;
  crecheLogo: string;
}

export const SidebarContent = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isAdmin,
  isAdminOpen,
  setIsAdminOpen,
  crecheLogo,
}: SidebarContentProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "/images/icons/dashboard.png", bgColor: "#F684A3" },
    { label: "Applications", path: "/dashboard/applications", icon: "/images/icons/applications.png", bgColor: "#84A7F6" },
    { label: "Students", path: "/dashboard/students", icon: "/images/icons/students.png", bgColor: "#BD84F6" },
    { label: "Lesson Plan", path: "/dashboard/lessons", icon: "/images/icons/book.png", bgColor: "#F684A3" },
    { label: "Photo Book", path: "/dashboard/photobook", icon: "/images/icons/photo-album.png", bgColor: "#84A7F6" },
    { label: "Finance", path: "/dashboard/finance", icon: "/images/icons/finance.png", bgColor: "#9CDBC8" },
    { label: "Calendar", path: "/dashboard/calendar", icon: "/images/icons/calendar.png", bgColor: "#84A7F6" },
    { label: "Social", path: "/dashboard/social", icon: "/images/icons/social.png", bgColor: "#F7CD85" },
    { label: "Reports", path: "/dashboard/reports", icon: "/images/icons/reports.png", bgColor: "#F684A3" },
    { label: "Settings", path: "/dashboard/settings", icon: "/images/icons/settings.png", bgColor: "#BD84F6" },
    { label: "Help Centre", path: "/dashboard/help", icon: "/images/icons/help.png", bgColor: "#F7CD85" },
  ];

  const adminItems = [
    { icon: "Users", label: "User Management", path: "/dashboard/admin/users" },
    { icon: "Building2", label: "Creche Management", path: "/dashboard/admin/creches" },
    { icon: "Network", label: "Integrations", path: "/dashboard/admin/integrations" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <div className={cn("transition-all duration-300", isSidebarOpen ? "text-xl" : "")}>
          <img
            src={crecheLogo}
            alt="Creche Logo"
            className={cn("transition-all duration-300", isSidebarOpen ? "h-13 w-13" : "")}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex"
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
            <div
              className="h-8 w-8 flex items-center justify-center rounded-md"
              style={{ backgroundColor: item.bgColor }}
            >
              <div
                className="h-6 w-6 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.icon})` }}
              />
            </div>
            {isSidebarOpen && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      {isAdmin && (
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
                  <Lock className="h-5 w-5" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};