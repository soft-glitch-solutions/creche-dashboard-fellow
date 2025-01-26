import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Grid, List, Eye, Link2, Trash2, X, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  status: string;
  parent_name: string;
  parent_email: string;
  creche_id: string | null;
  message: string;
  parent_phone_number: string;
  created_at: string;
  number_of_children: number | null;
  parent_address: string | null;
}

const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationNote, setApplicationNote] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load applications",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (selectedApplication) {
      try {
        const { error } = await supabase
          .from('applications')
          .update({ application_status: status })
          .eq('id', selectedApplication.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Application status updated successfully",
        });

        fetchApplications();
      } catch (error) {
        console.error('Error updating application status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update application status",
        });
      }
    }
  };

  const handleMakeStudent = async (application: Application) => {
    try {
      // Create new student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([
          {
            name: `Child of ${application.parent_name}`,
            parent_name: application.parent_name,
            parent_email: application.parent_email,
            parent_phone_number: application.parent_phone_number,
            address: application.parent_address,
            creche_id: application.creche_id,
            application_id: application.id
          }
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      // Delete the application
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Student created successfully",
      });

      fetchApplications();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      New: "bg-blue-100 text-blue-800",
      "Pending documents": "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
  };

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

      {viewType === "list" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading applications...</TableCell>
                </TableRow>
              ) : paginatedApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No applications found</TableCell>
                </TableRow>
              ) : (
                paginatedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <div className="bg-primary text-white rounded-full w-full h-full flex items-center justify-center">
                            {application.parent_name.charAt(0)}
                          </div>
                        </Avatar>
                        {application.parent_name}
                      </div>
                    </TableCell>
                    <TableCell>{application.parent_email}</TableCell>
                    <TableCell>{application.parent_phone_number}</TableCell>
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
                                <Select 
                                  onValueChange={handleStatusChange} 
                                  defaultValue={application.status}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Pending documents">Pending documents</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="text-sm font-medium">Parent Information</h3>
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                  <p>Name: {application.parent_name}</p>
                                  <p>Email: {application.parent_email}</p>
                                  <p>Phone: {application.parent_phone_number}</p>
                                  <p>Address: {application.parent_address || 'Not provided'}</p>
                                  <p>Number of Children: {application.number_of_children || 'Not specified'}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-sm font-medium">Message</h3>
                                <p className="bg-muted p-4 rounded-lg">{application.message}</p>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-sm font-medium">Application Notes</h3>
                                <Textarea
                                  value={applicationNote}
                                  onChange={(e) => setApplicationNote(e.target.value)}
                                  placeholder="Add a note..."
                                  className="min-h-[100px]"
                                />
                                <Button className="w-full">
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                        {application.status === 'Approved' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMakeStudent(application)}
                            title="Create Student"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app) => (
            <Card key={app.id} className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-purple-600">
                  {app.status}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-100 p-4 rounded-lg space-y-2">
                  <p className="text-gray-700">Student no: {app.studentNo}</p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto hover:bg-transparent hover:text-purple-700"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <span className="text-purple-600 underline flex items-center gap-2">
                          Click to view
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
      )}
    </div>
  );
};

export default Applications;
