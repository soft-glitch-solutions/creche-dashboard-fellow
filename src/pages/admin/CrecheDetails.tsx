import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Users, Calendar, DollarSign, CheckSquare, Square } from "lucide-react";
import type { Creche, CrechePlan, CrecheFeatures } from "@/types/creche";

const defaultFeatures: CrecheFeatures = {
  staff_management: false,
  attendance_tracking: false,
  parent_communication: false,
  event_calendar: false,
  financial_tracking: false,
  reports_analytics: false
};

const CrecheDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crecheData, setCrecheData] = useState<Creche | null>(null);
  const [editForm, setEditForm] = useState<Creche>({
    id: "",
    name: "",
    address: "",
    phone_number: "",
    email: "",
    capacity: 0,
    operating_hours: "",
    website_url: "",
    description: "",
    plan: "free" as CrechePlan,
    features: defaultFeatures,
    registered: false,
    facebook_url: null,
    twitter_url: null,
    instagram_url: null,
    linkedin_url: null,
    whatsapp_number: null,
    telegram_number: null,
    created_at: null,
    updated_at: null,
    price: null,
    header_image: null,
    website: null,
    logo: null,
    latitude: null,
    longitude: null,
    monthly_price: null,
    weekly_price: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCrecheDetails();
  }, []);

  const loadCrecheDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No authenticated user found");
        return;
      }

      console.log("Loading creche for user:", user.id);

      const { data: userCreches, error: userCrecheError } = await supabase
        .from('user_creche')
        .select('creche_id')
        .eq('user_id', user.id);

      if (userCrecheError) throw userCrecheError;
      console.log("User creches:", userCreches);

      if (!userCreches || userCreches.length === 0) {
        setError("No creche found for this user");
        return;
      }

      const { data: creche, error: crecheError } = await supabase
        .from('creches')
        .select('*')
        .eq('id', userCreches[0].creche_id)
        .maybeSingle();

      if (crecheError) throw crecheError;
      console.log("Loaded creche data:", creche);

      if (!creche) {
        setError("Creche not found");
        return;
      }

      const typedCreche: Creche = {
        ...creche,
        plan: (creche.plan || 'free') as CrechePlan,
        features: creche.features as CrecheFeatures || defaultFeatures
      };

      setCrecheData(typedCreche);
      setEditForm(typedCreche);
    } catch (error: any) {
      console.error('Error loading creche details:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!crecheData?.id) {
        throw new Error("No creche ID found");
      }

      const { error } = await supabase
        .from('creches')
        .update({
          name: editForm.name,
          address: editForm.address,
          phone_number: editForm.phone_number,
          email: editForm.email,
          capacity: parseInt(editForm.capacity.toString()),
          operating_hours: editForm.operating_hours,
          website_url: editForm.website_url,
          description: editForm.description,
          plan: editForm.plan,
          features: editForm.features
        })
        .eq('id', crecheData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Creche details updated successfully",
      });

      setIsEditing(false);
      loadCrecheDetails();
    } catch (error: any) {
      console.error('Error saving creche details:', error);
      toast({
        title: "Error",
        description: "Failed to update creche details",
        variant: "destructive",
      });
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setEditForm(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!crecheData) return <div>No creche data found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Creche Details</h1>
        {isEditing ? (
          <Button onClick={handleSave}>Save Changes</Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              ) : (
                <div>{crecheData.name}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Address</Label>
              {isEditing ? (
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              ) : (
                <div>{crecheData.address}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              {isEditing ? (
                <Input
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                />
              ) : (
                <div>{crecheData.phone_number}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              ) : (
                <div>{crecheData.email}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Capacity</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                />
              ) : (
                <div>{crecheData.capacity}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Operating Hours</Label>
              {isEditing ? (
                <Input
                  value={editForm.operating_hours}
                  onChange={(e) => setEditForm({ ...editForm, operating_hours: e.target.value })}
                />
              ) : (
                <div>{crecheData.operating_hours}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Website URL</Label>
              {isEditing ? (
                <Input
                  value={editForm.website_url}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                />
              ) : (
                <div>{crecheData.website_url}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              ) : (
                <div>{crecheData.description}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Plan & Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              {isEditing ? (
                <Select 
                  value={editForm.plan} 
                  onValueChange={(value: CrechePlan) => setEditForm({ ...editForm, plan: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="capitalize">{crecheData.plan}</div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Enabled Features</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(editForm.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    {isEditing ? (
                      <Checkbox
                        checked={enabled}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                    ) : (
                      enabled ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />
                    )}
                    <Label className="capitalize">{feature.replace(/_/g, ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrecheDetails;
