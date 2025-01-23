import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Grid, List, Eye, Link2, Trash2, X } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Applications = () => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationNote, setApplicationNote] = useState("");

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

  const handleStatusChange = (status: string) => {
    if (selectedApplication) {
      // Here you would typically update the status in your database
      console.log(`Updating application ${selectedApplication.id} status to ${status}`);
    }
  };

  const handleNoteSubmit = () => {
    if (selectedApplication && applicationNote.trim()) {
      // Here you would typically save the note to your database
      console.log(`Saving note for application ${selectedApplication.id}: ${applicationNote}`);
      setApplicationNote("");
    }
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
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto hover:bg-transparent hover:text-purple-700"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <span className={`${app.textColor} underline flex items-center gap-2`}>
                          {app.action}
                          <Eye className="h-4 w-4" />
                        </span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle className="flex justify-between">
                          Application Details
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedApplication(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Application Status</h3>
                          <Select onValueChange={handleStatusChange} defaultValue={app.status}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Received">Received</SelectItem>
                              <SelectItem value="Pending documents">Pending documents</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Parent Information</h3>
                          <div className="bg-muted p-4 rounded-lg space-y-2">
                            <p>Name: {app.parentName}</p>
                            <p>Email: {app.email}</p>
                            <p>Creche: {app.creche}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Application Notes</h3>
                          <Textarea
                            value={applicationNote}
                            onChange={(e) => setApplicationNote(e.target.value)}
                            placeholder="Add a note..."
                            className="min-h-[100px]"
                          />
                          <Button 
                            onClick={handleNoteSubmit}
                            className="w-full"
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
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
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle className="flex justify-between">
                              Application Details
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedApplication(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </SheetTitle>
                          </SheetHeader>
                          <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium">Application Status</h3>
                              <Select onValueChange={handleStatusChange} defaultValue={application.status}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Received">Received</SelectItem>
                                  <SelectItem value="Pending documents">Pending documents</SelectItem>
                                  <SelectItem value="Approved">Approved</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium">Parent Information</h3>
                              <div className="bg-muted p-4 rounded-lg space-y-2">
                                <p>Name: {application.parentName}</p>
                                <p>Email: {application.email}</p>
                                <p>Creche: {application.creche}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h3 className="text-sm font-medium">Application Notes</h3>
                              <Textarea
                                value={applicationNote}
                                onChange={(e) => setApplicationNote(e.target.value)}
                                placeholder="Add a note..."
                                className="min-h-[100px]"
                              />
                              <Button 
                                onClick={handleNoteSubmit}
                                className="w-full"
                              >
                                Add Note
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
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