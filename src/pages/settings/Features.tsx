import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AccessDenied } from "@/components/AccessDenied";

const defaultFeatures = {
  staff_management: true,
  attendance_tracking: true,
  parent_communication: true,
  event_calendar: true,
  financial_tracking: true,
  reports_analytics: true,
  sidebar_layout: "default",
};

const FeaturesSettings = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [crecheId, setCrecheId] = useState<string | null>(null);
  const [features, setFeatures] = useState<Record<string, any>>(defaultFeatures);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data: u } = await supabase.from("users").select("roles(role_name)").eq("id", user.id).maybeSingle();
      const isAdminUser = u?.roles?.role_name === "Administrator" || u?.roles?.role_name === "Developer";
      setIsAdmin(isAdminUser);
      const { data: uc } = await supabase.from("user_creche").select("creche_id").eq("user_id", user.id).maybeSingle();
      if (uc?.creche_id) {
        setCrecheId(uc.creche_id);
        const { data: c } = await supabase.from("creches").select("features").eq("id", uc.creche_id).maybeSingle();
        setFeatures({ ...defaultFeatures, ...(c?.features as any || {}) });
      }
    };
    init();
  }, []);

  const toggle = (key: string) => setFeatures(prev => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    if (!isAdmin || !crecheId) return;
    setSaving(true);
    await supabase.from("creches").update({ features }).eq("id", crecheId);
    setSaving(false);
  };

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-sm">Choose layout variant</Label>
          <Select value={features.sidebar_layout} onValueChange={(v) => setFeatures(prev => ({ ...prev, sidebar_layout: v }))}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="icons">Icons only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Visibility</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "event_calendar", label: "Calendar" },
            { key: "financial_tracking", label: "Finance" },
            { key: "reports_analytics", label: "Reports" },
            { key: "parent_communication", label: "Social" },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-2">
              <Label>{f.label}</Label>
              <Switch checked={features[f.key] !== false} onCheckedChange={() => toggle(f.key)} />
            </div>
          ))}
          <div className="col-span-full flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesSettings;
