import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Users, Building2, Link, DollarSign, Bell, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crecheId, setCrecheId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrecheId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userCreches, error } = await supabase
          .from("user_creche")
          .select("creche_id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching creche ID:", error);
          return;
        }

        if (userCreches) {
          setCrecheId(userCreches.creche_id);
        }
      } catch (error) {
        console.error("Error in fetchCrecheId:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrecheId();
  }, []);

  const settingsSections = [
    {
      title: t("userAccess"),
      icon: Users,
      description: t("manageUsers"),
      action: () => navigate("/dashboard/settings/users"),
    },
    {
      title: t("crecheProfile"),
      icon: Building2,
      description: t("updateProfile"),
      action: () => navigate(crecheId ? `/dashboard/settings/creche/${crecheId}` : "#"),
      disabled: !crecheId
    },
    {
      title: t("integrations"),
      icon: Link,
      description: t("setupIntegrations"),
      action: () => navigate("/dashboard/settings/integrations"),
    },
    {
      title: t("payments"),
      icon: DollarSign,
      description: t("managePayments"),
      action: () => navigate("/dashboard/settings/payments"),
    },
    {
      title: t("notifications"),
      icon: Bell,
      description: t("manageNotificationSettings"),
      action: () => navigate("/dashboard/settings/notifications"),
    },
    {
      title: t("features"),
      icon: SlidersHorizontal,
      description: t("manageFeaturesAndMenu"),
      action: () => navigate("/dashboard/settings/features"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("settings")}</h2>
        <p className="text-muted-foreground">
          Manage your creche settings and preferences
        </p>
      </div>

      <div className="grid gap-4">
        {settingsSections.map((section) => (
          <Card key={section.title} className="p-6">
            <div className="flex items-center gap-4">
              <section.icon className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={section.action}
                disabled={section.disabled || isLoading}
              >
                {t("configure")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;