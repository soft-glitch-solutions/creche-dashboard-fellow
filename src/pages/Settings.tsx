import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Lock, User } from "lucide-react";

const Settings = () => {
  const settingsSections = [
    {
      title: "Profile Settings",
      icon: User,
      description: "Update your profile information and preferences",
    },
    {
      title: "Security",
      icon: Lock,
      description: "Manage your password and security settings",
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Configure your notification preferences",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
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
              <Button variant="outline">Configure</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;