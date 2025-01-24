import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CrecheDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crecheData, setCrecheData] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
    capacity: 0,
    operating_hours: "",
    website_url: "",
    description: "",
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

      // First get the user's creche from the junction table
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

      // Then get the creche details
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

      setCrecheData(creche);
      setEditForm({
        name: creche.name || "",
        address: creche.address || "",
        phone_number: creche.phone_number || "",
        email: creche.email || "",
        capacity: creche.capacity || 0,
        operating_hours: creche.operating_hours || "",
        website_url: creche.website_url || "",
        description: creche.description || "",
      });
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
            <CardTitle>Basic Information</CardTitle>
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
            <CardTitle>Additional Information</CardTitle>
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
      </div>
    </div>
  );
};

export default CrecheDetails;