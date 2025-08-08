import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock, Menu, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

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
  const [features, setFeatures] = useState<Record<string, any>>({});
  const [permDefined, setPermDefined] = useState<Set<string>>(new Set());
  const [userPerms, setUserPerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadFeatures = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: uc } = await supabase.from("user_creche").select("creche_id").eq("user_id", user.id).maybeSingle();
      if (!uc?.creche_id) return;
      const { data: creche } = await supabase.from("creches").select("features").eq("id", uc.creche_id).maybeSingle();
      setFeatures((creche?.features as any) || {});
    };
    loadFeatures();
  }, []);

  useEffect(() => {
    const loadPerms = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: userRow } = await supabase
        .from("users")
        .select("roles(id, role_name), role_id")
        .eq("id", user.id)
        .maybeSingle();
      const roleId = (userRow as any)?.roles?.id || (userRow as any)?.role_id;
      const featureKeys = [
        "event_calendar",
        "financial_tracking",
        "reports_analytics",
        "parent_communication",
        "lessons",
        "photobook",
      ];
      const names = featureKeys.map((k) => `feature:${k}`);
      const { data: permList } = await supabase
        .from("permissions")
        .select("id,name")
        .in("name", names);
      const permNameSet = new Set((permList || []).map((p: any) => p.name as string));
      setPermDefined(permNameSet);
      if (roleId && permList && permList.length) {
        const { data: rp } = await supabase
          .from("role_permissions")
          .select("permission_id")
          .eq("role_id", roleId);
        const idSet = new Set((rp || []).map((r: any) => r.permission_id));
        const userNameSet = new Set(
          (permList || [])
            .filter((p: any) => idSet.has(p.id))
            .map((p: any) => p.name as string)
        );
        setUserPerms(userNameSet);
      }
    };
    loadPerms();
  }, []);

  const layout = (features?.sidebar_layout as string) || "default"; // default | compact | icons
  const effectiveOpen = layout === "icons" ? false : isSidebarOpen;

  const menuItems = useMemo(() => {
    const all = [
      { labelKey: "dashboard", path: "/dashboard", icon: "/images/icons/dashboard.png", bgColor: "#F684A3" },
      { labelKey: "applications", path: "/dashboard/applications", icon: "/images/icons/applications.png", bgColor: "#84A7F6" },
      { labelKey: "students", path: "/dashboard/students", icon: "/images/icons/students.png", bgColor: "#BD84F6" },
      { labelKey: "lessons", path: "/dashboard/lessons", icon: "/images/icons/book.png", bgColor: "#F684A3", requires: "lessons" },
      { labelKey: "photobook", path: "/dashboard/photobook", icon: "/images/icons/photo-album.png", bgColor: "#84A7F6", requires: "photobook" },
      { labelKey: "finance", path: "/dashboard/finance", icon: "/images/icons/finance.png", bgColor: "#9CDBC8", requires: "financial_tracking" },
      { labelKey: "calendar", path: "/dashboard/calendar", icon: "/images/icons/calendar.png", bgColor: "#84A7F6", requires: "event_calendar" },
      { labelKey: "social", path: "/dashboard/social", icon: "/images/icons/social.png", bgColor: "#F7CD85", requires: "parent_communication" },
      { labelKey: "reports", path: "/dashboard/reports", icon: "/images/icons/reports.png", bgColor: "#F684A3", requires: "reports_analytics" },
      { labelKey: "settings", path: "/dashboard/settings", icon: "/images/icons/settings.png", bgColor: "#BD84F6" },
      { labelKey: "help", path: "/dashboard/help", icon: "/images/icons/help.png", bgColor: "#F7CD85" },
    ];
    return all.filter((item) => {
      const featureAllowed = !item.requires || features?.[item.requires] !== false;
      const permName = item.requires ? `feature:${item.requires}` : null;
      const roleAllowed = !permName || !permDefined.has(permName) || userPerms.has(permName);
      return featureAllowed && roleAllowed;
    });
  }, [features]);

  const label = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);
  const compactCls = layout === "compact" ? "gap-3 mb-1 py-2" : "gap-4 mb-2";

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <div className={cn("transition-all duration-300", effectiveOpen ? "text-xl" : "")}> 
          <img src={crecheLogo} alt="Creche Logo" className={cn("transition-all duration-300", effectiveOpen ? "h-13 w-13" : "")}/>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <nav className="mt-8 flex-1">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn("w-full justify-start", compactCls, !effectiveOpen && "justify-center px-2")}
            onClick={() => navigate(item.path)}
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-md" style={{ backgroundColor: item.bgColor }}>
              <div className="h-6 w-6 bg-cover bg-center" style={{ backgroundImage: `url(${item.icon})` }} />
            </div>
            {effectiveOpen && <span>{label(item.labelKey)}</span>}
          </Button>
        ))}
      </nav>

      {isAdmin && (
        <div className="mt-auto mb-4">
          <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-start", compactCls, !effectiveOpen && "justify-center px-2")}>
                <Lock className="h-5 w-5" />
                {effectiveOpen && <span>Admin</span>}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <Button asChild variant="ghost" className={cn("w-full justify-start pl-8", compactCls, !effectiveOpen && "justify-center px-2")}>
                <a href="https://admin.crechespots.co.za" target="_blank" rel="noopener noreferrer">
                  <Shield className="h-5 w-5" />
                  {effectiveOpen && <span>Creche Admin</span>}
                </a>
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};
