
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Printer, 
  Plus, 
  AlertCircle, 
  FileText,
  TrashIcon,
  PencilIcon,
  CheckCircle,
  XCircle,
  UserIcon
} from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, parseISO } from "date-fns";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Student } from "@/types/student";
import jsPDF from "jspdf";
import "jspdf-autotable";

const IncidentReport = ({ crecheId }: { crecheId: string | null }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);
  const [showNewSafeguardingForm, setShowNewSafeguardingForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [editingSafeguarding, setEditingSafeguarding] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [incidentChartData, setIncidentChartData] = useState<any[]>([]);

  // Fetch students from the creche
  useEffect(() => {
    const fetchStudents = async () => {
      if (!crecheId) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('creche_id', crecheId);

        if (error) throw error;
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch students"
        });
      }
    };

    fetchStudents();
  }, [crecheId, toast]);

  // Incident Reports Query
  const incidentReportsQuery = useQuery({
    queryKey: ['incidentReports', crecheId],
    queryFn: async () => {
      if (!crecheId) return [];

      const { data, error } = await supabase
        .from('incident_reports')
        .select(`
          *,
          students(name),
          auth.users!reported_by(email)
        `)
        .eq('creche_id', crecheId);

      if (error) throw error;
      
      // Process data for chart
      processIncidentChartData(data);
      
      return data;
    },
    enabled: !!crecheId
  });

  // Safeguarding Concerns Query
  const safeguardingConcernsQuery = useQuery({
    queryKey: ['safeguardingConcerns', crecheId],
    queryFn: async () => {
      if (!crecheId) return [];

      const { data, error } = await supabase
        .from('safeguarding_concerns')
        .select(`
          *,
          students(name),
          auth.users!reported_by(email)
        `)
        .eq('creche_id', crecheId);

      if (error) throw error;
      return data;
    },
    enabled: !!crecheId
  });

  // Process chart data for incidents
  const processIncidentChartData = (incidents: any[]) => {
    if (!incidents || incidents.length === 0) {
      // Generate empty chart data for the last 6 months
      const emptyChartData = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        emptyChartData.push({
          month: format(subMonths(currentDate, i), "MMM"),
          minor: 0,
          medium: 0,
          major: 0
        });
      }
      
      setIncidentChartData(emptyChartData);
      return;
    }

    // Create a map for the last 6 months
    const currentDate = new Date();
    const monthsData: Record<string, { minor: number; medium: number; major: number }> = {};
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "MMM");
      monthsData[monthKey] = { minor: 0, medium: 0, major: 0 };
    }
    
    // Count incidents by month and severity
    incidents.forEach((incident) => {
      const date = parseISO(incident.incident_date);
      const monthKey = format(date, "MMM");
      
      // Only include incidents from the last 6 months
      if (monthsData[monthKey]) {
        if (incident.severity.toLowerCase() === 'low') {
          monthsData[monthKey].minor += 1;
        } else if (incident.severity.toLowerCase() === 'medium') {
          monthsData[monthKey].medium += 1;
        } else if (incident.severity.toLowerCase() === 'high') {
          monthsData[monthKey].major += 1;
        }
      }
    });
    
    // Convert to chart data array
    const chartData = Object.entries(monthsData).map(([month, data]) => ({
      month,
      minor: data.minor,
      medium: data.medium,
      major: data.major
    }));
    
    setIncidentChartData(chartData);
  };

  const incidentForm = useForm({
    defaultValues: {
      student_id: '',
      incident_date: format(new Date(), 'yyyy-MM-dd'),
      incident_time: format(new Date(), 'HH:mm'),
      incident_type: '',
      location: '',
      description: '',
      action_taken: '',
      witness: '',
      severity: 'Low'
    }
  });

  const safeguardingForm = useForm({
    defaultValues: {
      student_id: '',
      concern_date: format(new Date(), 'yyyy-MM-dd'),
      concern_type: '',
      description: '',
      action_taken: '',
      status: 'Monitoring'
    }
  });

  useEffect(() => {
    if (editingIncident) {
      incidentForm.reset({
        student_id: editingIncident.student_id || '',
        incident_date: format(new Date(editingIncident.incident_date), 'yyyy-MM-dd'),
        incident_time: editingIncident.incident_time || '00:00',
        incident_type: editingIncident.incident_type || '',
        location: editingIncident.location || '',
        description: editingIncident.description || '',
        action_taken: editingIncident.action_taken || '',
        witness: editingIncident.witness || '',
        severity: editingIncident.severity || 'Low'
      });
    }
  }, [editingIncident, incidentForm]);

  useEffect(() => {
    if (editingSafeguarding) {
      safeguardingForm.reset({
        student_id: editingSafeguarding.student_id || '',
        concern_date: format(new Date(editingSafeguarding.concern_date), 'yyyy-MM-dd'),
        concern_type: editingSafeguarding.concern_type || '',
        description: editingSafeguarding.description || '',
        action_taken: editingSafeguarding.action_taken || '',
        status: editingSafeguarding.status || 'Monitoring'
      });
    }
  }, [editingSafeguarding, safeguardingForm]);

  const onSubmitIncident = async (formData: any) => {
    if (!crecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche selected"
      });
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not authenticated"
        });
        return;
      }

      const incidentData = {
        ...formData,
        student_id: formData.student_id === 'none' ? null : formData.student_id,
        creche_id: crecheId,
        reported_by: userId
      };

      let response;
      
      if (editingIncident) {
        // Update existing incident
        response = await supabase
          .from('incident_reports')
          .update(incidentData)
          .eq('id', editingIncident.id);
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Incident report updated successfully"
        });
      } else {
        // Create new incident
        response = await supabase
          .from('incident_reports')
          .insert(incidentData);
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Incident report created successfully"
        });
      }

      // Refresh data
      incidentReportsQuery.refetch();
      
      // Reset form and close dialog
      incidentForm.reset();
      setShowNewIncidentForm(false);
      setEditingIncident(null);
      
    } catch (error) {
      console.error('Error saving incident report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save incident report"
      });
    }
  };

  const onSubmitSafeguarding = async (formData: any) => {
    if (!crecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche selected"
      });
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not authenticated"
        });
        return;
      }

      const concernData = {
        ...formData,
        creche_id: crecheId,
        reported_by: userId
      };

      let response;
      
      if (editingSafeguarding) {
        // Update existing safeguarding concern
        response = await supabase
          .from('safeguarding_concerns')
          .update(concernData)
          .eq('id', editingSafeguarding.id);
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Safeguarding concern updated successfully"
        });
      } else {
        // Create new safeguarding concern
        response = await supabase
          .from('safeguarding_concerns')
          .insert(concernData);
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Safeguarding concern created successfully"
        });
      }

      // Refresh data
      safeguardingConcernsQuery.refetch();
      
      // Reset form and close dialog
      safeguardingForm.reset();
      setShowNewSafeguardingForm(false);
      setEditingSafeguarding(null);
      
    } catch (error) {
      console.error('Error saving safeguarding concern:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save safeguarding concern"
      });
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      const { error } = await supabase
        .from('incident_reports')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Incident report deleted successfully"
      });
      
      // Refresh data
      incidentReportsQuery.refetch();
      
    } catch (error) {
      console.error('Error deleting incident report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete incident report"
      });
    }
  };

  const deleteSafeguarding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('safeguarding_concerns')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Safeguarding concern deleted successfully"
      });
      
      // Refresh data
      safeguardingConcernsQuery.refetch();
      
    } catch (error) {
      console.error('Error deleting safeguarding concern:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete safeguarding concern"
      });
    }
  };

  const handleExportExcel = () => {
    const dataToExport = activeTab === "incidents" 
      ? incidentReportsQuery.data || [] 
      : safeguardingConcernsQuery.data || [];
      
    const fileName = activeTab === "incidents" ? "incident-report.xlsx" : "safeguarding-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = (incident: any) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Incident Report", 105, 15, { align: "center" });
    
    // Add creche information
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(incident.incident_date), "MMM dd, yyyy")}`, 20, 30);
    doc.text(`Time: ${incident.incident_time}`, 20, 40);
    
    // Add incident details
    doc.setFontSize(14);
    doc.text("Incident Details", 20, 55);
    
    doc.setFontSize(12);
    doc.text(`Type: ${incident.incident_type}`, 20, 65);
    doc.text(`Location: ${incident.location}`, 20, 75);
    doc.text(`Severity: ${incident.severity}`, 20, 85);
    doc.text(`Child: ${incident.students?.name || 'N/A'}`, 20, 95);
    
    // Description and actions
    doc.setFontSize(14);
    doc.text("Description", 20, 110);
    
    doc.setFontSize(10);
    const description = doc.splitTextToSize(incident.description, 170);
    doc.text(description, 20, 120);
    
    doc.setFontSize(14);
    doc.text("Action Taken", 20, 140 + (description.length * 5));
    
    doc.setFontSize(10);
    const actionTaken = doc.splitTextToSize(incident.action_taken, 170);
    doc.text(actionTaken, 20, 150 + (description.length * 5));
    
    // Add reported by and witness information
    doc.setFontSize(12);
    doc.text(`Reported by: ${incident.users?.email || 'Unknown'}`, 20, 180 + (description.length * 5));
    doc.text(`Witness: ${incident.witness || 'None'}`, 20, 190 + (description.length * 5));
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 20, 200 + (description.length * 5));
    
    // Save the PDF
    doc.save(`incident-report-${format(new Date(incident.incident_date), "yyyy-MM-dd")}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "The incident report PDF has been generated"
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      default:
        return <Badge className="bg-gray-500">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'monitoring':
        return <Badge className="bg-blue-500">Monitoring</Badge>;
      case 'active':
        return <Badge className="bg-yellow-500">Active</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'escalated':
        return <Badge className="bg-red-500">Escalated</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (!crecheId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-center">No Creche Selected</h2>
        <p className="text-muted-foreground text-center mt-2">
          Please select a creche to view incident reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incident & Safeguarding Reports</h2>
          <p className="text-muted-foreground">
            Safety incidents, emergency reports, and child protection records
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

      <Tabs defaultValue="incidents" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incidents">Incident Reports</TabsTrigger>
          <TabsTrigger value="safeguarding">Safeguarding Concerns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incidents">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
                <CardDescription>Monthly incident reports by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  minor: {
                    label: "Minor",
                    color: "#4ade80"
                  },
                  medium: {
                    label: "Medium",
                    color: "#facc15"
                  },
                  major: {
                    label: "Major",
                    color: "#f87171"
                  }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incidentChartData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="minor" fill="var(--color-minor)" stackId="a" />
                      <Bar dataKey="medium" fill="var(--color-medium)" stackId="a" />
                      <Bar dataKey="major" fill="var(--color-major)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Incident Log</CardTitle>
                  <CardDescription>Record of all reported incidents</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingIncident(null);
                  incidentForm.reset();
                  setShowNewIncidentForm(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Incident
                </Button>
              </CardHeader>
              <CardContent>
                {incidentReportsQuery.isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : incidentReportsQuery.data && incidentReportsQuery.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Child</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidentReportsQuery.data.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell>{format(new Date(incident.incident_date), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{incident.incident_type}</TableCell>
                          <TableCell>{incident.students?.name || 'N/A'}</TableCell>
                          <TableCell>{incident.location}</TableCell>
                          <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                          <TableCell>{incident.users?.email || 'Unknown'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedIncident(incident);
                                  setShowIncidentDetails(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingIncident(incident);
                                  setShowNewIncidentForm(true);
                                }}
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteIncident(incident.id)}
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">No incident reports found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Dialog open={showIncidentDetails} onOpenChange={setShowIncidentDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Incident Report Details</DialogTitle>
                <DialogDescription>
                  Full details of the selected incident report
                </DialogDescription>
              </DialogHeader>
              
              {selectedIncident && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Incident Date & Time</h4>
                      <p>{format(new Date(selectedIncident.incident_date), "MMM dd, yyyy")} at {selectedIncident.incident_time}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Incident Type</h4>
                      <p>{selectedIncident.incident_type}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Child Involved</h4>
                      <p>{selectedIncident.students?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p>{selectedIncident.location}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Severity</h4>
                      <p>{getSeverityBadge(selectedIncident.severity)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Reported By</h4>
                      <p>{selectedIncident.users?.email || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="mt-1">{selectedIncident.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Action Taken</h4>
                    <p className="mt-1">{selectedIncident.action_taken}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Witness</h4>
                    <p>{selectedIncident.witness}</p>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowIncidentDetails(false)}>Close</Button>
                <Button onClick={() => {
                  if (selectedIncident) {
                    generatePDF(selectedIncident);
                  }
                }}>
                  Generate PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewIncidentForm} onOpenChange={(open) => {
            setShowNewIncidentForm(open);
            if (!open) {
              setEditingIncident(null);
              incidentForm.reset();
            }
          }}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingIncident ? 'Edit Incident Report' : 'New Incident Report'}</DialogTitle>
                <DialogDescription>
                  {editingIncident ? 'Update the incident report details' : 'Create a new incident report'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...incidentForm}>
                <form onSubmit={incidentForm.handleSubmit(onSubmitIncident)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={incidentForm.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child Involved</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a child" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None/Not Applicable</SelectItem>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={incidentForm.control}
                      name="incident_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select incident type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Minor Injury">Minor Injury</SelectItem>
                              <SelectItem value="Behavioral">Behavioral</SelectItem>
                              <SelectItem value="Health Related">Health Related</SelectItem>
                              <SelectItem value="Facility Issue">Facility Issue</SelectItem>
                              <SelectItem value="Emergency Drill">Emergency Drill</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={incidentForm.control}
                      name="incident_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={incidentForm.control}
                      name="incident_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={incidentForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Where the incident occurred" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={incidentForm.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={incidentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Detailed description of the incident" 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={incidentForm.control}
                    name="action_taken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Taken</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Actions taken in response to the incident" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={incidentForm.control}
                    name="witness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Witness</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name of witness(es) if any" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowNewIncidentForm(false);
                      setEditingIncident(null);
                      incidentForm.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingIncident ? 'Update Incident' : 'Save Incident'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="safeguarding">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Safeguarding Concerns</CardTitle>
                <CardDescription>Record of child protection and safeguarding issues</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingSafeguarding(null);
                safeguardingForm.reset();
                setShowNewSafeguardingForm(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New Record
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Confidential Information</h4>
                    <p className="text-amber-700 text-sm">
                      These records contain sensitive safeguarding information. Ensure appropriate privacy when viewing and maintain strict confidentiality.
                    </p>
                  </div>
                </div>
              </div>
              
              {safeguardingConcernsQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : safeguardingConcernsQuery.data && safeguardingConcernsQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Concern Type</TableHead>
                      <TableHead>Child</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeguardingConcernsQuery.data.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.concern_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{record.concern_type}</TableCell>
                        <TableCell>{record.students?.name || 'N/A'}</TableCell>
                        <TableCell>{record.users?.email || 'Unknown'}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Viewing Details",
                                  description: "Safeguarding record details: " + record.description
                                });
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingSafeguarding(record);
                                setShowNewSafeguardingForm(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteSafeguarding(record.id)}
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No safeguarding records found</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All safeguarding records are encrypted and access-controlled in compliance with data protection regulations.
              </p>
            </CardFooter>
          </Card>

          <Dialog open={showNewSafeguardingForm} onOpenChange={(open) => {
            setShowNewSafeguardingForm(open);
            if (!open) {
              setEditingSafeguarding(null);
              safeguardingForm.reset();
            }
          }}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingSafeguarding ? 'Edit Safeguarding Concern' : 'New Safeguarding Concern'}</DialogTitle>
                <DialogDescription>
                  {editingSafeguarding ? 'Update the safeguarding concern details' : 'Record a new safeguarding concern'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...safeguardingForm}>
                <form onSubmit={safeguardingForm.handleSubmit(onSubmitSafeguarding)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={safeguardingForm.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child Involved</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a child" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={safeguardingForm.control}
                      name="concern_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concern Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select concern type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Behavioral Change">Behavioral Change</SelectItem>
                              <SelectItem value="Disclosure">Disclosure</SelectItem>
                              <SelectItem value="Physical Mark">Physical Mark</SelectItem>
                              <SelectItem value="Home Environment">Home Environment</SelectItem>
                              <SelectItem value="Emotional State">Emotional State</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={safeguardingForm.control}
                      name="concern_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={safeguardingForm.control}
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
                              <SelectItem value="Monitoring">Monitoring</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Escalated">Escalated</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={safeguardingForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Detailed description of the safeguarding concern" 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={safeguardingForm.control}
                    name="action_taken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Taken</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Actions taken in response to the concern" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowNewSafeguardingForm(false);
                      setEditingSafeguarding(null);
                      safeguardingForm.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSafeguarding ? 'Update Record' : 'Save Record'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentReport;
