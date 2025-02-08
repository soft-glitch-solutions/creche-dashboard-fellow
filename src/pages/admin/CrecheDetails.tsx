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
import { Settings, Users, DollarSign, Edit, Save, CheckSquare, Square } from "lucide-react";
import type { Creche } from "@/types/creche";
import BasicInformationCard from "@/components/admin/BasicInformationCard";
import AdditionalInformationCard from "@/components/admin/AdditionalInformationCard";
import PlanAndFeaturesCard from "@/components/admin/PlanAndFeaturesCard";

const defaultFeatures = {
  staff_management: false,
  attendance_tracking: false,
  parent_communication: false,
  event_calendar: false,
  financial_tracking: false,
  reports_analytics: false,
};

const CrecheDetails = () => {
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
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingAdditional, setIsEditingAdditional] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  
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

      const { data: userCreches, error: userCrecheError } = await supabase
        .from('user_creche')
        .select('creche_id')
        .eq('user_id', user.id);

      if (userCrecheError) throw userCrecheError;

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
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBasic = async () => {
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
        })
        .eq('id', crecheData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Basic information updated successfully",
      });

      setIsEditingBasic(false);
      loadCrecheDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update basic information",
        variant: "destructive",
      });
    }
  };

  const handleSaveAdditional = async () => {
    try {
      if (!crecheData?.id) {
        throw new Error("No creche ID found");
      }

      const { error } = await supabase
        .from('creches')
        .update({
          capacity: parseInt(editForm.capacity.toString()),
          operating_hours: editForm.operating_hours,
          website_url: editForm.website_url,
          description: editForm.description,
        })
        .eq('id', crecheData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Additional information updated successfully",
      });

      setIsEditingAdditional(false);
      loadCrecheDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update additional information",
        variant: "destructive",
      });
    }
  };

  const handleSavePlan = async () => {
    try {
      if (!crecheData?.id) {
        throw new Error("No creche ID found");
      }

      const { error } = await supabase
        .from('creches')
        .update({
          plan: editForm.plan,
          features: editForm.features,
        })
        .eq('id', crecheData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan and features updated successfully",
      });

      setIsEditingPlan(false);
      loadCrecheDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update plan and features",
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
      <h1 className="text-2xl font-bold">Creche Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicInformationCard
          crecheData={crecheData}
          editForm={editForm}
          isEditing={isEditingBasic}
          onToggleEdit={() => setIsEditingBasic(!isEditingBasic)}
          onSave={handleSaveBasic}
          onChange={(field, value) => setEditForm({ ...editForm, [field]: value })}
        />
        <AdditionalInformationCard
          crecheData={crecheData}
          editForm={editForm}
          isEditing={isEditingAdditional}
          onToggleEdit={() => setIsEditingAdditional(!isEditingAdditional)}
          onSave={handleSaveAdditional}
          onChange={(field, value) => setEditForm({ ...editForm, [field]: value })}
        />
        <PlanAndFeaturesCard
          crecheData={crecheData}
          editForm={editForm}
          isEditing={isEditingPlan}
          onToggleEdit={() => setIsEditingPlan(!isEditingPlan)}
          onSave={handleSavePlan}
          onFeatureToggle={handleFeatureToggle}
        />
      </div>
    </div>
  );
};

export default CrecheDetails;

