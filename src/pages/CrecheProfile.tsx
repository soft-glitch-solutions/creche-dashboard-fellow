import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Clock, Users, Building2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CrecheProfile = () => {
  const [crecheData, setCrecheData] = useState<any>(null);
  const { id } = useParams();

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
      setCrecheData(creche);
    } catch (error) {
      console.error('Error loading creche:', error);
    }
  };

  if (!crecheData) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-sm">
        <img
          src={crecheData.logo || "/lovable-uploads/b36d0e6b-5fa8-43e2-b837-5d0b3de9e849.png"}
          alt="Creche Logo"
          className="w-16 h-16"
        />
        <h1 className="text-3xl font-bold text-gray-900">{crecheData.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-secondary flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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