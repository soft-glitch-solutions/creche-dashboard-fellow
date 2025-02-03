import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Building2, Link, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "User Access",
      icon: Users,
      description: "View and manage users assigned to your creche",
      action: () => navigate("/dashboard/users"),
    },
    {
      title: "Creche Profile",
      icon: Building2,
      description: "View and update your creche profile information",
      action: () => navigate("/dashboard/creche"),
    },
    {
      title: "Integrations",
      icon: Link,
      description: "Set up and manage third-party integrations",
      action: () => navigate("/dashboard/integrations"),
    },
    {
      title: "General Settings",
      icon: SettingsIcon,
      description: "Configure general application settings",
      action: () => navigate("/dashboard/settings/general"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
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
              <Button variant="outline" onClick={section.action}>
                Configure
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;