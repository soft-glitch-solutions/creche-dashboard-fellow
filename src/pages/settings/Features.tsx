import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AccessDenied } from "@/components/AccessDenied";

const featureKeys = [
  "event_calendar",
  "financial_tracking",
  "reports_analytics",
  "parent_communication",
  "lessons",
  "photobook",
] as const;

type FeatureKey = typeof featureKeys[number];

const defaultFeatures: Record<string, any> = {
  staff_management: true,
  attendance_tracking: true,
  parent_communication: true,
  event_calendar: true,
  financial_tracking: true,
  reports_analytics: true,
  lessons: true,
  photobook: true,
  sidebar_layout: "default",
};

const prettyLabel: Record<FeatureKey, string> = {
  event_calendar: "Calendar",
  financial_tracking: "Finance",
  reports_analytics: "Reports",
  parent_communication: "Social",
  lessons: "Lessons",
  photobook: "Photobook",
};

const FeaturesSettings = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [crecheId, setCrecheId] = useState<string | null>(null);
  const [features, setFeatures] = useState<Record<string, any>>(defaultFeatures);
  const [saving, setSaving] = useState(false);

  // Role-based permissions state
  const [roles, setRoles] = useState<{ id: string; role_name: string }[]>([]);
  const [permMap, setPermMap] = useState<Record<string, { id: string; name: string }>>({}); // name -> record
  const [roleFeatureMap, setRoleFeatureMap] = useState<Record<string, Set<string>>>({}); // roleId -> Set(permission name)

  const permissionName = (k: FeatureKey) => `feature:${k}`;

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

      if (isAdminUser) {
        await loadRoleData();
      }
    };
    init();
  }, []);

  const loadRoleData = async () => {
    // Load roles
    const { data: rolesData } = await supabase.from("roles").select("id, role_name");
    setRoles(rolesData || []);

    // Load permissions for features
    const names = featureKeys.map((k) => permissionName(k));
    const { data: perms } = await supabase.from("permissions").select("id, name").in("name", names);
    const map: Record<string, { id: string; name: string }> = {};
    (perms || []).forEach((p) => { map[p.name] = p; });
    setPermMap(map);

    // Load role permissions mapping
    const { data: rp } = await supabase
      .from("role_permissions")
      .select("role_id, permission:permission_id(id, name)");

    const rmap: Record<string, Set<string>> = {};
    (rp || []).forEach((row: any) => {
      const n = row.permission?.name as string | undefined;
      if (!n || !n.startsWith("feature:")) return;
      if (!rmap[row.role_id]) rmap[row.role_id] = new Set<string>();
      rmap[row.role_id].add(n);
    });
    setRoleFeatureMap(rmap);
  };

  const toggle = (key: string) => setFeatures(prev => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    if (!isAdmin || !crecheId) return;
    setSaving(true);
    await supabase.from("creches").update({ features }).eq("id", crecheId);
    setSaving(false);
  };

  const ensurePermission = async (name: string) => {
    if (permMap[name]) return permMap[name];
    const { data, error } = await supabase.from("permissions").insert({ name }).select().single();
    if (error) throw error;
    const next = { ...permMap, [name]: data } as Record<string, { id: string; name: string }>;
    setPermMap(next);
    return data;
  };

  const setRoleFeature = async (roleId: string, key: FeatureKey, enabled: boolean) => {
    const name = permissionName(key);
    const perm = await ensurePermission(name);
    if (enabled) {
      await supabase.from("role_permissions").insert({ role_id: roleId, permission_id: perm.id });
      setRoleFeatureMap((prev) => {
        const set = new Set(prev[roleId] || []);
        set.add(name);
        return { ...prev, [roleId]: set };
      });
    } else {
      await supabase.from("role_permissions").delete().match({ role_id: roleId, permission_id: perm.id });
      setRoleFeatureMap((prev) => {
        const set = new Set(prev[roleId] || []);
        set.delete(name);
        return { ...prev, [roleId]: set };
      });
    }
  };

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="max-w-5xl space-y-6">
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
          {featureKeys.map((k) => (
            <div key={k} className="flex items-center justify-between py-2">
              <Label>{prettyLabel[k]}</Label>
              <Switch checked={features[k] !== false} onCheckedChange={() => toggle(k)} />
            </div>
          ))}
          <div className="col-span-full flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role-based Feature Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No roles found.</div>
          ) : (
            roles.map((r) => (
              <div key={r.id} className="border rounded-md p-3">
                <div className="font-medium mb-2">{r.role_name}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {featureKeys.map((k) => {
                    const name = permissionName(k);
                    const enabled = roleFeatureMap[r.id]?.has(name) || false;
                    return (
                      <div key={k} className="flex items-center justify-between">
                        <Label>{prettyLabel[k]}</Label>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(v) => setRoleFeature(r.id, k, v)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesSettings;
