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
  const [error, setError] = useState(null);
  const [crecheData, setCrecheData] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
    capacity: "",
    operating_hours: "",
    website_url: "",
    description: "",
  });

  useEffect(() => {
    loadCrecheDetails();
  }, []);

  const loadCrecheDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCrecheData(data);
      setEditForm({
        name: data.name,
        address: data.address,
        phone_number: data.phone_number,
        email: data.email,
        capacity: data.capacity,
        operating_hours: data.operating_hours,
        website_url: data.website_url,
        description: data.description,
      });
    } catch (error) {
      console.error('Error loading creche details:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('creches')
        .update(editForm)
        .eq('id', crecheData.id);

      if (error) throw error;

      setIsEditing(false);
      loadCrecheDetails();
    } catch (error) {
      console.error('Error saving creche details:', error);
    }
  };

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

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading creche details</div>
      ) : crecheData ? (
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
                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
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
      ) : (
        <div>No creche data found</div>
      )}
    </div>
  );
};

export default CrecheDetails;
