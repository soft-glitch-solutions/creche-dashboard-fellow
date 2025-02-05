
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [creches, setCreches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCreche, setUserCreche] = useState<string>("");

  useEffect(() => {
    fetchUser();
    fetchCreches();
  }, [id]);

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(id, role_name),
          creches:user_creche(creche:creches(id, name))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data);
        if (data.creches?.[0]?.creche?.id) {
          setUserCreche(data.creches[0].creche.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreches = async () => {
    try {
      const { data, error } = await supabase
        .from('creches')
        .select('*');
      
      if (error) throw error;
      setCreches(data || []);
    } catch (error) {
      console.error('Error fetching creches:', error);
    }
  };

  const handleCrecheChange = async (crecheId: string) => {
    try {
      // Remove existing creche assignment
      const { error: deleteError } = await supabase
        .from('user_creche')
        .delete()
        .eq('user_id', id);

      if (deleteError) throw deleteError;

      // Add new creche assignment
      const { error: insertError } = await supabase
        .from('user_creche')
        .insert([{ user_id: id, creche_id: crecheId }]);

      if (insertError) throw insertError;

      setUserCreche(crecheId);
      toast({
        title: "Success",
        description: "User's creche updated successfully",
      });
      
      // Refresh user data
      fetchUser();
    } catch (error) {
      console.error('Error updating user creche:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user's creche",
      });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: user?.first_name,
          last_name: user?.last_name,
          phone_number: user?.phone_number,
          email: user?.email,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user profile",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard/admin/users')}>
          Back to Users
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback>
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={user.first_name || ''}
                      onChange={(e) => setUser(prev => prev ? {...prev, first_name: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={user.last_name || ''}
                      onChange={(e) => setUser(prev => prev ? {...prev, last_name: e.target.value} : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    onChange={(e) => setUser(prev => prev ? {...prev, email: e.target.value} : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user.phone_number || ''}
                    onChange={(e) => setUser(prev => prev ? {...prev, phone_number: e.target.value} : null)}
                  />
                </div>

                <Button type="submit">Update Profile</Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creche Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creche">Assigned Creche</Label>
                <Select
                  value={userCreche}
                  onValueChange={handleCrecheChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a creche" />
                  </SelectTrigger>
                  <SelectContent>
                    {creches.map((creche) => (
                      <SelectItem key={creche.id} value={creche.id}>
                        {creche.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge>
                    {user.role?.role_name || 'User'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
