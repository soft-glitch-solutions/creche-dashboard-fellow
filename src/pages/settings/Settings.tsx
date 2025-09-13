import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

// Import existing settings components
import { Features } from "./Features";
import { NotificationsSettings } from "./Notifications";
import { PaymentsSettings } from "./Payments";
import { UserManagementSettings } from "./UserManagement";
import { CrecheProfile } from "../CrecheProfile";

export const Settings = () => {
  const { tab, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userCrecheId, setUserCrecheId] = useState<string | null>(null);

  // Get user's assigned creche
  useEffect(() => {
    const getUserCreche = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: uc } = await supabase
          .from("user_creche")
          .select("creche_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (uc?.creche_id) {
          setUserCrecheId(uc.creche_id);
        }
      } catch (error) {
        console.error("Error fetching user creche:", error);
      }
    };

    getUserCreche();
  }, []);

  // Handle creche profile routing
  if (tab === "creche" && id) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <h1 className="text-2xl font-bold">Creche Profile Settings</h1>
        </div>
        <CrecheProfile />
      </div>
    );
  }

  const activeTab = tab || "features";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => navigate(`/dashboard/settings/${value}`)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="creche">Creche Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <Features />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSettings />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentsSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementSettings />
        </TabsContent>

        <TabsContent value="creche" className="space-y-6">
          {userCrecheId ? (
            <Card>
              <CardHeader>
                <CardTitle>Creche Profile</CardTitle>
                <CardDescription>
                  Configure your creche profile settings and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(`/dashboard/settings/creche/${userCrecheId}`)}
                  className="w-full"
                >
                  Edit Creche Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Creche Assigned</CardTitle>
                <CardDescription>
                  You don't have a creche assigned to your account. Please contact your administrator.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;