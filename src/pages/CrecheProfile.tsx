import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Clock, Users, Building2, GraduationCap, Edit, Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Creche, CrechePlan, CrecheFeatures } from "@/types/creche";

const defaultCreche: Creche = {
  id: "",
  name: "",
  plan: "free" as CrechePlan,
  features: {
    event_calendar: false,
    staff_management: false,
    reports_analytics: false,
    financial_tracking: false,
    attendance_tracking: false,
    parent_communication: false
  }
};

const CrecheProfile = () => {
  const [crecheData, setCrecheData] = useState<Creche>(defaultCreche);
  const [editMode, setEditMode] = useState<{
    basic: boolean;
    additional: boolean;
  }>({
    basic: false,
    additional: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    loadCrecheDetails();
  }, [id]);

  const loadCrecheDetails = async () => {
    try {
      const { data: creche, error } = await supabase
        .from('creches')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      console.log("Loaded creche data:", creche);
      
      if (creche) {
        const typedCreche: Creche = {
          ...creche,
          plan: (creche.plan || 'free') as CrechePlan,
          features: creche.features as CrecheFeatures || defaultCreche.features
        };
        setCrecheData(typedCreche);
      }
    } catch (error) {
      console.error('Error loading creche:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creche details",
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-logo-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('creches')
        .update({ logo: publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      setCrecheData(prev => prev ? { ...prev, logo: publicUrl } : null);
      toast({
        title: "Success",
        description: "Logo updated successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload logo",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (section: 'basic' | 'additional') => {
    try {
      const { error } = await supabase
        .from('creches')
        .update(crecheData)
        .eq('id', id);

      if (error) throw error;

      setEditMode(prev => ({ ...prev, [section]: false }));
      toast({
        title: "Success",
        description: "Creche details updated successfully",
      });
    } catch (error) {
      console.error('Error updating creche:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update creche details",
      });
    }
  };

  const handleInputChange = (field: keyof Creche, value: string | number) => {
    setCrecheData(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (!crecheData) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={crecheData.logo || "/lovable-uploads/b36d0e6b-5fa8-43e2-b837-5d0b3de9e849.png"}
              alt="Creche Logo"
              className="w-16 h-16 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploading}
              />
              <Upload className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </label>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{crecheData.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg md:text-xl text-secondary flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Basic Information
            </CardTitle>
            {!editMode.basic ? (
              <Button variant="ghost" size="sm" onClick={() => setEditMode(prev => ({ ...prev, basic: true }))}>
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => handleUpdate('basic')}>
                <Save className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {editMode.basic ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Phone Number</label>
                    <Input
                      value={crecheData.phone_number || ''}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Email</label>
                    <Input
                      value={crecheData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Operating Hours</label>
                    <Input
                      value={crecheData.operating_hours || ''}
                      onChange={(e) => handleInputChange('operating_hours', e.target.value)}
                      placeholder="Operating hours"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    {crecheData.phone_number || "No phone number provided"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {crecheData.email || "No email provided"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {crecheData.operating_hours || "Operating hours not specified"}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              Additional Information
            </CardTitle>
            {!editMode.additional ? (
              <Button variant="ghost" size="sm" onClick={() => setEditMode(prev => ({ ...prev, additional: true }))}>
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => handleUpdate('additional')}>
                <Save className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode.additional ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Daily Fee</label>
                  <Input
                    type="number"
                    value={crecheData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    placeholder="Daily fee"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Weekly Fee</label>
                  <Input
                    type="number"
                    value={crecheData.weekly_price || ''}
                    onChange={(e) => handleInputChange('weekly_price', parseFloat(e.target.value))}
                    placeholder="Weekly fee"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Monthly Fee</label>
                  <Input
                    type="number"
                    value={crecheData.monthly_price || ''}
                    onChange={(e) => handleInputChange('monthly_price', parseFloat(e.target.value))}
                    placeholder="Monthly fee"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Capacity</label>
                  <Input
                    type="number"
                    value={crecheData.capacity || ''}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    placeholder="Capacity"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily fee:</span>
                    <span className="font-bold">R{crecheData.price || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly fee:</span>
                    <span className="font-bold">R{crecheData.weekly_price || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly fee:</span>
                    <span className="font-bold">R{crecheData.monthly_price || 0}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Capacity:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Total: {crecheData.capacity || 0}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-accent flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Grade R
                </span>
                <span className="font-bold">15</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Grade 0
                </span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  After-care
                </span>
                <span className="font-bold">20</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrecheProfile;