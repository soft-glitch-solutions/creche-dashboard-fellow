import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  DollarSign,
  PenSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CrecheDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: creche, isLoading } = useQuery({
    queryKey: ["creche", id],
    queryFn: async () => {
      console.log("Fetching creche details for id:", id);

      const { data: crecheData, error: crecheError } = await supabase
        .from("creches")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (crecheError) throw crecheError;

      if (!crecheData) {
        throw new Error("Creche not found");
      }

      // Fetch staff count
      const { count: staffCount, error: staffError } = await supabase
        .from("staff")
        .select("*", { count: true })
        .eq("creche_id", id);

      if (staffError) throw staffError;

      // Fetch students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from("students")
        .select("*", { count: true })
        .eq("creche_id", id);

      if (studentsError) throw studentsError;

      return {
        ...crecheData,
        staffCount: staffCount || 0,
        studentsCount: studentsCount || 0
      };
    },
    meta: {
      onError: (error) => {
        console.error("Error in creche query:", error);
        toast({
          title: "Error fetching creche details",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!creche) {
    return <div>Creche not found</div>;
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <Building2 className="h-12 w-12" />
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{creche.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{creche.address}</span>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <PenSquare className="h-4 w-4" />
          Edit Creche
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Contacts</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{creche.phone_number || "No phone number"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{creche.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{creche.website || "No website"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Operations</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{creche.operating_hours || "Operating hours not set"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Capacity: {creche.capacity || 0} children</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Info Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Creche Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Total Students</label>
                <p className="font-medium">{creche.studentsCount}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Total Staff</label>
                <p className="font-medium">{creche.staffCount}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Monthly Fee</label>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {creche.monthly_price || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Social Media</h2>
            <div className="space-y-4">
              {creche.facebook_url && (
                <div>
                  <label className="text-sm text-muted-foreground">Facebook</label>
                  <p className="font-medium">{creche.facebook_url}</p>
                </div>
              )}
              {creche.instagram_url && (
                <div>
                  <label className="text-sm text-muted-foreground">Instagram</label>
                  <p className="font-medium">{creche.instagram_url}</p>
                </div>
              )}
              {creche.twitter_url && (
                <div>
                  <label className="text-sm text-muted-foreground">Twitter</label>
                  <p className="font-medium">{creche.twitter_url}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrecheDetails;