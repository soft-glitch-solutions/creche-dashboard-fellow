import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SettingRowProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const SettingRow = ({ label, value, onChange }: SettingRowProps) => (
  <div className="flex items-center justify-between py-2">
    <Label className="text-sm">{label}</Label>
    <Switch checked={value} onCheckedChange={onChange} />
  </div>
);

const NotificationsSettings = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    application_new: true,
    payment_received: true,
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("notification_settings")
        .select("type, enabled")
        .eq("user_id", user.id);
      const map: Record<string, boolean> = { ...settings };
      (data || []).forEach(row => { map[row.type] = row.enabled; });
      setSettings(map);
    };
    init();
  }, []);

  const save = async (type: string, enabled: boolean) => {
    if (!userId) return;
    setSettings(prev => ({ ...prev, [type]: enabled }));
    await supabase.from("notification_settings").upsert({ user_id: userId, type, enabled });
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingRow label="New Application" value={settings.application_new} onChange={(v) => save("application_new", v)} />
          <SettingRow label="Payment Received" value={settings.payment_received} onChange={(v) => save("payment_received", v)} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;
