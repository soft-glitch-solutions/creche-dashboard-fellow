import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Grid, List, Eye, Link2, Trash2, X, UserCheck, Plus, Edit } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash";
import { ApplicationLifecycle } from "@/components/applications/ApplicationLifecycle";
import { ApplicationNotes } from "@/components/applications/ApplicationNotes";
import { ApplicationNote, ApplicationLifecycleStage } from "@/types/application";
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  source: ReactNode;
  id: string;
  application_status: string;
  parent_name: string;
  parent_email: string;
  creche_id: string | null;
  message: string;
  parent_phone_number: string;
  created_at: string;
  number_of_children: number | null;
  parent_address: string | null;
  parent_whatsapp: string | null;
  lifecycle_stage: ApplicationLifecycleStage;
  user_id: string;
}

const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationNote, setApplicationNote] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [applicationNotes, setApplicationNotes] = useState<ApplicationNote[]>([]);
  const [userCreche, setUserCreche] = useState<string | null>(null);
  const navigate = useNavigate();

  // New application form state
  const [newApplication, setNewApplication] = useState({
    parent_name: "",
    parent_email: "",
    parent_phone_number: "",
    parent_whatsapp: "",
    parent_address: "",
    message: "",
    number_of_children: 1,
    source: "dashboard",
  });

  // Fetch user's creche
  useEffect(() => {
    const getUserCreche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userCrecheData } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();
        
        if (userCrecheData) {
          setUserCreche(userCrecheData.creche_id);
          console.log("User's creche:", userCrecheData.creche_id);
        }
      }
    };

    getUserCreche();
  }, []);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, [userCreche]);

  // Fetch applications with caching
  const fetchApplications = async () => {
    try {
      const { data: rawData, error } = await supabase
        .from("applications")
        .select("*")
        .eq('creche_id', userCreche)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Loaded applications data:", rawData);
      
      if (rawData) {
        // Transform the data to ensure lifecycle_stage is of type ApplicationLifecycleStage
        const transformedData: Application[] = rawData.map(app => ({
          ...app,
          lifecycle_stage: (app.lifecycle_stage || "New") as ApplicationLifecycleStage
        }));
        setApplications(transformedData);
        localStorage.setItem("applications", JSON.stringify(transformedData));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new application
  const handleCreateApplication = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert([newApplication])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setApplications((prev) => [data, ...prev]);
      localStorage.setItem("applications", JSON.stringify([data, ...applications]));

      toast({
        title: "Success",
        description: "Application created successfully",
      });
    } catch (error) {
      console.error("Error creating application:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create application",
      });
    }
  };

  // Handle status change
  const handleStatusChange = async (status: string) => {
    if (selectedApplication) {
      try {
        const { error } = await supabase
          .from("applications")
          .update({ application_status: status })
          .eq("id", selectedApplication.id);

        if (error) throw error;

        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id ? { ...app, application_status: status } : app
          )
        );

        toast({
          title: "Success",
          description: "Application status updated successfully",
        });
      } catch (error) {
        console.error("Error updating application status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update application status",
        });
      }
    }
  };

  // Handle making a student from an application
  const handleMakeStudent = async (application: Application) => {
    try {
      // Create new student record
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert([
          {
            name: `Child of ${application.parent_name}`,
            parent_name: application.parent_name,
            parent_email: application.parent_email,
            parent_phone_number: application.parent_phone_number,
            address: application.parent_address,
            creche_id: application.creche_id,
            application_id: application.id,
          },
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      // Delete the application
      const { error: deleteError } = await supabase
        .from("applications")
        .delete()
        .eq("id", application.id);

      if (deleteError) throw deleteError;

      // Update local state
      setApplications((prev) => prev.filter((app) => app.id !== application.id));
      localStorage.setItem(
        "applications",
        JSON.stringify(applications.filter((app) => app.id !== application.id))
      );

      toast({
        title: "Success",
        description: "Student created successfully",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student",
      });
    }
  };

  // Debounced search
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Filter applications based on search term
  const filteredApplications = applications.filter(
    (app) =>
      app.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parent_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      New: "bg-blue-100 text-blue-800",
      "Pending documents": "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
  };

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const ListSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Parent Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
        <Card key={index} className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-100 p-4 rounded-lg space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Applications</h1>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Application</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="parent_name">Parent Name</Label>
                  <Input
                    id="parent_name"
                    value={newApplication.parent_name}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        parent_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent_email">Email</Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={newApplication.parent_email}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        parent_email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent_phone">Phone Number</Label>
                  <Input
                    id="parent_phone"
                    value={newApplication.parent_phone_number}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        parent_phone_number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent_whatsapp">WhatsApp (Optional)</Label>
                  <Input
                    id="parent_whatsapp"
                    value={newApplication.parent_whatsapp}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        parent_whatsapp: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent_address">Address</Label>
                  <Input
                    id="parent_address"
                    value={newApplication.parent_address}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        parent_address: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number_of_children">Number of Children</Label>
                  <Input
                    id="number_of_children"
                    type="number"
                    min="1"
                    value={newApplication.number_of_children}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        number_of_children: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newApplication.message}
                    onChange={(e) =>
                      setNewApplication((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button onClick={handleCreateApplication}>Create Application</Button>
            </DialogContent>
          </Dialog>
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
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search applications..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-10"
          />
          <Eye className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {viewType === "list" ? (
        <div className="rounded-md border">
          {isLoading ? (
            <ListSkeleton />
          ) : paginatedApplications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No applications found
              </TableCell>
            </TableRow>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.source}</TableCell>
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
                      <Badge className={getStatusBadge(application.lifecycle_stage)}>
                        {application.lifecycle_stage}
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
                              <Edit className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[1800px] sm:w-[840px]">
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
                                <ApplicationLifecycle
                                  currentStage={selectedApplication?.lifecycle_stage || "New"}
                                  onStageChange={async (stage) => {
                                    if (!selectedApplication) return;
                                    try {
                                      const { error } = await supabase
                                        .from("applications")
                                        .update({ lifecycle_stage: stage })
                                        .eq("id", selectedApplication.id);

                                      if (error) throw error;

                                      setApplications(prev =>
                                        prev.map(app =>
                                          app.id === selectedApplication.id
                                            ? { ...app, lifecycle_stage: stage }
                                            : app
                                        )
                                      );

                                      toast({
                                        title: "Success",
                                        description: "Application stage updated successfully",
                                      });
                                    } catch (error) {
                                      console.error("Error updating application stage:", error);
                                      toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description: "Failed to update application stage",
                                      });
                                    }
                                  }}
                                />
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-sm font-medium">Parent Information</h3>
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                  <p>Name: {selectedApplication?.parent_name}</p>
                                  <p>Email: {selectedApplication?.parent_email}</p>
                                  <p>Phone: {selectedApplication?.parent_phone_number}</p>
                                  <p>Address: {selectedApplication?.parent_address || "Not provided"}</p>
                                  <p>
                                    Number of Children: {selectedApplication?.number_of_children || "Not specified"}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-sm font-medium">Message</h3>
                                <p className="bg-muted p-4 rounded-lg">{selectedApplication?.message}</p>
                              </div>

                              <ApplicationNotes
                                notes={applicationNotes}
                                onAddNote={async (note) => {
                                  if (!selectedApplication) return;
                                  
                                  try {
                                    const { data: userData, error: userError } = await supabase.auth.getUser();
                                    if (userError) throw userError;

                                    const { error } = await supabase
                                      .from("application_notes")
                                      .insert({
                                        application_id: selectedApplication.id,
                                        user_id: userData.user.id,
                                        note,
                                      });

                                    if (error) throw error;

                                    // Refresh notes
                                    const { data: newNotes, error: notesError } = await supabase
                                      .from("application_notes")
                                      .select(`
                                        *,
                                        users!inner (
                                          id,
                                          email,
                                          role_id,
                                          first_name,
                                          last_name
                                        )
                                      `)
                                      .eq("application_id", selectedApplication.id)
                                      .order("created_at", { ascending: false });

                                    if (notesError) throw notesError;

                                    setApplicationNotes(newNotes);

                                    toast({
                                      title: "Success",
                                      description: "Note added successfully",
                                    });
                                  } catch (error) {
                                    console.error("Error adding note:", error);
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description: "Failed to add note",
                                    });
                                  }
                                }}
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                        {application.application_status === "Approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMakeStudent(application)}
                            title="Create Student"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/applications/${application.id}`)}>
                          <Eye className="h-4 w-4" />
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
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <GridSkeleton />
          ) : paginatedApplications.length === 0 ? (
            <div className="col-span-full text-center">No applications found</div>
          ) : (
            paginatedApplications.map((application) => (
              <Card key={application.id} className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-600">
                    {application.application_status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 p-4 rounded-lg space-y-2">
                    <p className="text-gray-700">Parent: {application.parent_name}</p>
                    <p className="text-gray-700">Email: {application.parent_email}</p>
                    <p className="text-gray-700">Phone: {application.parent_phone_number}</p>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="p-0 h-auto hover:bg-transparent hover:text-purple-700"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <span className="text-purple-600 underline flex items-center gap-2">
                            View Details
                            <Eye className="h-4 w-4" />
                          </span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[880px]">
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
                              defaultValue={application.application_status}
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

                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Applications;