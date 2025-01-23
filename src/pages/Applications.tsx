import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Grid, List, Eye, Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Applications = () => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const applications = [
    {
      id: 1,
      status: "Received",
      studentNo: "NDXDEL003",
      parentName: "John Doe",
      email: "john.doe@example.com",
      creche: "Sunshine Daycare",
      action: "Click to view",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
    {
      id: 2,
      status: "Pending documents",
      studentNo: "NDXDEL004",
      parentName: "Jane Smith",
      email: "jane.smith@example.com",
      creche: "Rainbow Kids",
      action: "Click to view",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
    {
      id: 3,
      status: "Approved",
      studentNo: "NDXDEL005",
      parentName: "Mike Johnson",
      email: "mike.j@example.com",
      creche: "Little Angels",
      action: "Contact Parent",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
    {
      id: 4,
      status: "Rejected",
      studentNo: "NDXDEL006",
      parentName: "Sarah Williams",
      email: "sarah.w@example.com",
      creche: "Happy Hearts",
      action: "Reason:",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Received: "bg-blue-100 text-blue-800",
      "Pending documents": "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Applications</h1>
        <div className="flex gap-2">
          <Button
            variant={viewType === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewType("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app) => (
            <Card key={app.id} className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-purple-600">
                  {app.status}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`${app.bgColor} p-4 rounded-lg space-y-2`}>
                  <p className="text-gray-700">Student no: {app.studentNo}</p>
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto hover:bg-transparent hover:text-purple-700"
                  >
                    <span className={`${app.textColor} underline flex items-center gap-2`}>
                      {app.action}
                      {app.action === "Contact Parent" ? (
                        <UserPlus className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Creche</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <div className="bg-primary text-white rounded-full w-full h-full flex items-center justify-center">
                          {application.parentName.charAt(0)}
                        </div>
                      </Avatar>
                      {application.parentName}
                    </div>
                  </TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.creche}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(application.status)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Applications;