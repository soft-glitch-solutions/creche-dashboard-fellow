import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the creche ID for the current user
      const { data: userCreche } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.id)
        .single();

      if (!userCreche) return;

      // Then get all users associated with this creche
      const { data: crecheUsers, error } = await supabase
        .from("users")
        .select(`
          *,
          roles!inner (
            id,
            role_name
          )
        `)
        .in("id", (
          await supabase
            .from("user_creche")
            .select("user_id")
            .eq("creche_id", userCreche.creche_id)
        ).data?.map(uc => uc.user_id) || []);

      if (error) throw error;

      // Transform the data to match the User type
      const transformedUsers: User[] = crecheUsers.map(user => ({
        ...user,
        role: {
          id: user.roles.id,
          role_name: user.roles.role_name
        }
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      // Get current user's creche
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: userCreche } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.id)
        .single();

      if (!userCreche) throw new Error("No creche found for user");

      // Create magic link
      const { data, error } = await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          data: {
            creche_id: userCreche.creche_id,
            invited_by: user.id,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      setIsInviteDialogOpen(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation",
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userCreche } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.id)
        .single();

      if (!userCreche) return;

      const { error } = await supabase
        .from("user_creche")
        .delete()
        .eq("user_id", userId)
        .eq("creche_id", userCreche.creche_id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));

      toast({
        title: "Success",
        description: "User removed successfully",
      });
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove user",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage users who have access to your creche
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button 
            variant="ghost" 
            onClick={() => setIsInviteDialogOpen(true)}
            className="opacity-100 cursor-pointer"
          >
            Invite User
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role?.role_name || "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleRemoveUser(user.id)}
                        className="opacity-100 cursor-pointer"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleInviteUser} className="w-full">
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;