import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/user";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCrecheUsers();
  }, []);

  const loadCrecheUsers = async () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Access</h2>
        <p className="text-muted-foreground">
          Manage users who have access to your creche
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creche Users</CardTitle>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
