import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserManagement = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;