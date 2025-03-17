
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Printer, FileUp, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface StaffMember {
  id: string;
  name: string;
  position: string;
  qualification: string;
  certification_date?: string;
  expiry_date?: string;
  background_check: string;
  creche_id: string;
}

interface TrainingRecord {
  id: string;
  training_name: string;
  staff_id: string;
  staff?: {
    name: string;
    position: string;
  };
  training_type: string;
  completion_date?: string;
  expiry_date?: string;
  certification_url?: string;
  status: string;
  notes?: string;
  creche_id: string;
}

const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().min(2, { message: "Position is required." }),
  qualification: z.string().min(2, { message: "Qualification is required." }),
  certification_date: z.string().optional(),
  expiry_date: z.string().optional(),
  background_check: z.string().default("Verified"),
});

const trainingFormSchema = z.object({
  staff_id: z.string().min(1, { message: "Staff member is required." }),
  training_name: z.string().min(2, { message: "Training name is required." }),
  training_type: z.string(),
  completion_date: z.string().optional(),
  expiry_date: z.string().optional(),
  status: z.string(),
  notes: z.string().optional(),
});

const StaffTrainingReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("qualifications");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
  const [currentCrecheId, setCurrentCrecheId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [trainingFile, setTrainingFile] = useState<File | null>(null);

  const staffForm = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      position: "",
      qualification: "",
      certification_date: new Date().toISOString().split('T')[0],
      expiry_date: "",
      background_check: "Verified",
    },
  });

  const trainingForm = useForm<z.infer<typeof trainingFormSchema>>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      staff_id: "",
      training_name: "",
      training_type: "first_aid",
      completion_date: "",
      expiry_date: "",
      status: "Completed",
      notes: "",
    },
  });

  // Fetch current user's creche
  useEffect(() => {
    const fetchUserCreche = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userCreche } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();

        if (userCreche) {
          setCurrentCrecheId(userCreche.creche_id);
        }
      } catch (error) {
        console.error('Error fetching user creche:', error);
      }
    };

    fetchUserCreche();
  }, []);

  // Fetch staff data from Supabase
  const { 
    data: staffData, 
    isLoading: isLoadingStaff, 
    error: staffError, 
    refetch: refetchStaff 
  } = useQuery({
    queryKey: ['staff', currentCrecheId],
    queryFn: async () => {
      if (!currentCrecheId) return [];
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('creche_id', currentCrecheId);
      
      if (error) throw error;
      return data as StaffMember[];
    },
    enabled: !!currentCrecheId
  });

  // Fetch training data from Supabase
  const { 
    data: trainingData, 
    isLoading: isLoadingTraining, 
    error: trainingError, 
    refetch: refetchTraining 
  } = useQuery({
    queryKey: ['staff-training', currentCrecheId],
    queryFn: async () => {
      if (!currentCrecheId) return [];
      const { data, error } = await supabase
        .from('staff_training')
        .select('*, staff(name, position)')
        .eq('creche_id', currentCrecheId);
      
      if (error) throw error;
      return data as TrainingRecord[];
    },
    enabled: !!currentCrecheId
  });

  // Prepare chart data
  const getQualificationChartData = () => {
    if (!staffData) return [];
    
    const qualificationsCount: Record<string, number> = {};
    
    staffData.forEach(staff => {
      const qualification = staff.qualification || 'Unknown';
      qualificationsCount[qualification] = (qualificationsCount[qualification] || 0) + 1;
    });
    
    return Object.entries(qualificationsCount).map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value
    }));
  };

  const handleExportExcel = () => {
    const dataToExport = activeTab === "qualifications" ? staffData : trainingData;
    const fileName = activeTab === "qualifications" ? "staff-qualifications-report.xlsx" : "staff-training-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The staff report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const uploadFile = async (file: File, path: string) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('compliance-documents')
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('compliance-documents')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const onSubmitStaff = async (data: z.infer<typeof staffFormSchema>) => {
    if (!currentCrecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche associated with current user"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('staff')
        .insert({
          ...data,
          creche_id: currentCrecheId
        });

      if (error) throw error;

      toast({
        title: "Staff Added",
        description: `${data.name} has been added to staff records`,
      });
      
      refetchStaff();
      setIsAddStaffOpen(false);
      staffForm.reset({
        name: "",
        position: "",
        qualification: "",
        certification_date: new Date().toISOString().split('T')[0],
        expiry_date: "",
        background_check: "Verified",
      });
      setCertificationFile(null);
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add staff member"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitTraining = async (data: z.infer<typeof trainingFormSchema>) => {
    if (!currentCrecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche associated with current user"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let certificationUrl = null;
      if (trainingFile) {
        certificationUrl = await uploadFile(trainingFile, `training/${currentCrecheId}`);
      }

      const { error } = await supabase
        .from('staff_training')
        .insert({
          ...data,
          certification_url: certificationUrl,
          creche_id: currentCrecheId
        });

      if (error) throw error;

      toast({
        title: "Training Added",
        description: `Training record has been added successfully`,
      });
      
      refetchTraining();
      setIsAddTrainingOpen(false);
      trainingForm.reset({
        staff_id: "",
        training_name: "",
        training_type: "first_aid",
        completion_date: "",
        expiry_date: "",
        status: "Completed",
        notes: "",
      });
      setTrainingFile(null);
    } catch (error) {
      console.error("Error adding training:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add training record"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDocument = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "No Document",
        description: "No document file is attached to this record"
      });
    }
  };

  if (staffError || trainingError) {
    return (
      <div className="p-6 rounded-md bg-red-50 text-red-500">
        <h3 className="text-lg font-medium">Error loading staff data</h3>
        <p className="mt-1 text-sm">{staffError?.message || trainingError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff & Training Reports</h2>
          <p className="text-muted-foreground">
            Staff qualifications, certifications and training records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="qualifications" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qualifications">Staff Qualifications</TabsTrigger>
          <TabsTrigger value="training">Training Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qualifications">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Qualification Distribution</CardTitle>
                <CardDescription>Staff qualifications by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  value: {
                    label: "Staff Count",
                    theme: {
                      light: "#3b82f6",
                      dark: "#60a5fa"
                    }
                  }
                }}>
                  {isLoadingStaff ? (
                    <div className="flex justify-center items-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : staffData && staffData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getQualificationChartData()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {getQualificationChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">No staff qualifications data available</p>
                    </div>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>
          
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Staff Qualification Records</CardTitle>
                  <CardDescription>Certification details and verification status</CardDescription>
                </div>
                <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <FileUp className="mr-2 h-4 w-4" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                    </DialogHeader>
                    <Form {...staffForm}>
                      <form onSubmit={staffForm.handleSubmit(onSubmitStaff)} className="space-y-4">
                        <FormField
                          control={staffForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Staff Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={staffForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={staffForm.control}
                          name="qualification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualification</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={staffForm.control}
                            name="certification_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certification Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={staffForm.control}
                            name="expiry_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={staffForm.control}
                          name="background_check"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background Check</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Verified">Verified</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Not Verified">Not Verified</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Staff"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-auto">
                {isLoadingStaff ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Verification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffData && staffData.length > 0 ? (
                        staffData.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell className="font-medium">{staff.name}</TableCell>
                            <TableCell>{staff.position}</TableCell>
                            <TableCell>{staff.qualification}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {staff.background_check === "Verified" ? (
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                )}
                                {staff.background_check}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No staff records found. Add your first staff member to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="training">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Training Records</CardTitle>
                <CardDescription>Staff training status and completion dates</CardDescription>
              </div>
              <Dialog open={isAddTrainingOpen} onOpenChange={setIsAddTrainingOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FileUp className="mr-2 h-4 w-4" />
                    Add Training
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Training Record</DialogTitle>
                  </DialogHeader>
                  <Form {...trainingForm}>
                    <form onSubmit={trainingForm.handleSubmit(onSubmitTraining)} className="space-y-4">
                      <FormField
                        control={trainingForm.control}
                        name="staff_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff Member</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {staffData?.map(staff => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name} - {staff.position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={trainingForm.control}
                        name="training_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={trainingForm.control}
                        name="training_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select training type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="first_aid">First Aid</SelectItem>
                                <SelectItem value="child_protection">Child Protection</SelectItem>
                                <SelectItem value="fire_safety">Fire Safety</SelectItem>
                                <SelectItem value="inclusive_education">Inclusive Education</SelectItem>
                                <SelectItem value="nutrition">Nutrition & Health</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={trainingForm.control}
                          name="completion_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Completion Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={trainingForm.control}
                          name="expiry_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={trainingForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={trainingForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="training-file">Certificate (PDF)</Label>
                        <Input 
                          id="training-file"
                          type="file" 
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setTrainingFile(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Training"
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingTraining ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Name</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Completion Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingData && trainingData.length > 0 ? (
                      trainingData.map((training) => (
                        <TableRow key={training.id}>
                          <TableCell className="font-medium">{training.training_name}</TableCell>
                          <TableCell>{training.staff?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            {training.completion_date 
                              ? format(new Date(training.completion_date), "MMM dd, yyyy") 
                              : "Not completed"}
                          </TableCell>
                          <TableCell>
                            {training.expiry_date 
                              ? format(new Date(training.expiry_date), "MMM dd, yyyy") 
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {training.status.includes("Completed") ? (
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                              )}
                              {training.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDocument(training.certification_url)}
                              disabled={!training.certification_url}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No training records found. Add your first training record to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffTrainingReport;
