
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
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Printer, 
  FileUp, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Plus,
  PencilIcon,
  TrashIcon
} from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Student } from "@/types/student";
import jsPDF from "jspdf";
import "jspdf-autotable";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const HealthNutritionReport = ({ crecheId }: { crecheId: string | null }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("medicalRecords");
  const [students, setStudents] = useState<Student[]>([]);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showMealPlanForm, setShowMealPlanForm] = useState(false);
  const [editingMedical, setEditingMedical] = useState<any>(null);
  const [editingMealPlan, setEditingMealPlan] = useState<any>(null);
  const [immunizationChartData, setImmunizationChartData] = useState<any[]>([]);
  const [allergyChartData, setAllergyChartData] = useState<any[]>([]);

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

  // Medical Records Query
  const medicalRecordsQuery = useQuery({
    queryKey: ['medicalRecords', crecheId],
    queryFn: async () => {
      if (!crecheId) return [];

      const { data, error } = await supabase
        .from('student_medical_records')
        .select(`
          *,
          students(name, dob)
        `)
        .eq('creche_id', crecheId);

      if (error) throw error;
      
      // Process data for charts
      processMedicalChartData(data);
      
      return data;
    },
    enabled: !!crecheId
  });

  // Meal Plans Query
  const mealPlansQuery = useQuery({
    queryKey: ['mealPlans', crecheId],
    queryFn: async () => {
      if (!crecheId) return [];

      const { data, error } = await supabase
        .from('nutrition_meal_plans')
        .select('*')
        .eq('creche_id', crecheId)
        .order('week_starting', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!crecheId
  });

  // Process chart data for medical records
  const processMedicalChartData = (records: any[]) => {
    if (!records || records.length === 0) {
      setImmunizationChartData([
        { name: "Up to date", value: 0 },
        { name: "Pending", value: 0 },
        { name: "Incomplete", value: 0 },
      ]);
      
      setAllergyChartData([
        { name: "No allergies", value: 0 },
      ]);
      
      return;
    }

    // Process immunization status chart data
    const immunizationStatus: Record<string, number> = {
      "Up to date": 0,
      "Pending": 0,
      "Incomplete": 0
    };
    
    records.forEach(record => {
      const status = record.immunization_status;
      if (immunizationStatus[status] !== undefined) {
        immunizationStatus[status]++;
      } else {
        immunizationStatus[status] = 1;
      }
    });
    
    const immunizationData = Object.entries(immunizationStatus).map(([name, value]) => ({
      name,
      value
    }));
    
    setImmunizationChartData(immunizationData);

    // Process allergies chart data
    const allergies: Record<string, number> = {
      "No allergies": 0,
    };
    
    records.forEach(record => {
      if (!record.allergies || record.allergies.toLowerCase() === 'none') {
        allergies["No allergies"]++;
      } else {
        // Split multiple allergies and count each separately
        const allergyList = record.allergies.split(',').map((a: string) => a.trim());
        allergyList.forEach((allergy: string) => {
          if (allergies[allergy] !== undefined) {
            allergies[allergy]++;
          } else {
            allergies[allergy] = 1;
          }
        });
      }
    });
    
    const allergyData = Object.entries(allergies).map(([name, value]) => ({
      name,
      value
    }));
    
    setAllergyChartData(allergyData);
  };

  const medicalForm = useForm({
    defaultValues: {
      student_id: '',
      immunization_status: 'Up to date',
      allergies: 'None',
      last_checkup: format(new Date(), 'yyyy-MM-dd'),
      next_checkup: format(new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      medical_notes: ''
    }
  });

  const mealPlanForm = useForm({
    defaultValues: {
      week_starting: format(new Date(), 'yyyy-MM-dd'),
      meal_type: 'Breakfast',
      monday_menu: '',
      tuesday_menu: '',
      wednesday_menu: '',
      thursday_menu: '',
      friday_menu: ''
    }
  });

  useEffect(() => {
    if (editingMedical) {
      medicalForm.reset({
        student_id: editingMedical.student_id || '',
        immunization_status: editingMedical.immunization_status || 'Up to date',
        allergies: editingMedical.allergies || 'None',
        last_checkup: editingMedical.last_checkup ? format(new Date(editingMedical.last_checkup), 'yyyy-MM-dd') : '',
        next_checkup: editingMedical.next_checkup ? format(new Date(editingMedical.next_checkup), 'yyyy-MM-dd') : '',
        medical_notes: editingMedical.medical_notes || ''
      });
    }
  }, [editingMedical, medicalForm]);

  useEffect(() => {
    if (editingMealPlan) {
      mealPlanForm.reset({
        week_starting: editingMealPlan.week_starting ? format(new Date(editingMealPlan.week_starting), 'yyyy-MM-dd') : '',
        meal_type: editingMealPlan.meal_type || 'Breakfast',
        monday_menu: editingMealPlan.monday_menu || '',
        tuesday_menu: editingMealPlan.tuesday_menu || '',
        wednesday_menu: editingMealPlan.wednesday_menu || '',
        thursday_menu: editingMealPlan.thursday_menu || '',
        friday_menu: editingMealPlan.friday_menu || ''
      });
    }
  }, [editingMealPlan, mealPlanForm]);

  const onSubmitMedical = async (formData: any) => {
    if (!crecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche selected"
      });
      return;
    }

    try {
      const medicalData = {
        ...formData,
        creche_id: crecheId
      };

      let response;
      
      if (editingMedical) {
        // Update existing medical record
        response = await supabase
          .from('student_medical_records')
          .update(medicalData)
          .eq('id', editingMedical.id);
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Medical record updated successfully"
        });
      } else {
        // Check if medical record already exists for this student
        const { data: existingRecord } = await supabase
          .from('student_medical_records')
          .select('id')
          .eq('student_id', formData.student_id)
          .maybeSingle();

        if (existingRecord) {
          // Update existing record instead of creating a new one
          response = await supabase
            .from('student_medical_records')
            .update(medicalData)
            .eq('id', existingRecord.id);
        } else {
          // Create new medical record
          response = await supabase
            .from('student_medical_records')
            .insert(medicalData);
        }
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Medical record created successfully"
        });
      }

      // Refresh data
      medicalRecordsQuery.refetch();
      
      // Reset form and close dialog
      medicalForm.reset();
      setShowMedicalForm(false);
      setEditingMedical(null);
      
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save medical record"
      });
    }
  };

  const onSubmitMealPlan = async (formData: any) => {
    if (!crecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche selected"
      });
      return;
    }

    try {
      const mealPlanData = {
        ...formData,
        creche_id: crecheId
      };

      let response;
      
      if (editingMealPlan) {
        // Update existing meal plan
        response = await supabase
          .from('nutrition_meal_plans')
          .update(mealPlanData)
          .eq('id', editingMealPlan.id);
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Meal plan updated successfully"
        });
      } else {
        // Check if a meal plan for the same week and type already exists
        const { data: existingMealPlan } = await supabase
          .from('nutrition_meal_plans')
          .select('id')
          .eq('creche_id', crecheId)
          .eq('week_starting', formData.week_starting)
          .eq('meal_type', formData.meal_type)
          .maybeSingle();

        if (existingMealPlan) {
          // Update existing meal plan instead of creating a new one
          response = await supabase
            .from('nutrition_meal_plans')
            .update(mealPlanData)
            .eq('id', existingMealPlan.id);
        } else {
          // Create new meal plan
          response = await supabase
            .from('nutrition_meal_plans')
            .insert(mealPlanData);
        }
        
        if (response.error) throw response.error;
        
        toast({
          title: "Success",
          description: "Meal plan created successfully"
        });
      }

      // Refresh data
      mealPlansQuery.refetch();
      
      // Reset form and close dialog
      mealPlanForm.reset();
      setShowMealPlanForm(false);
      setEditingMealPlan(null);
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save meal plan"
      });
    }
  };

  const deleteMedicalRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_medical_records')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Medical record deleted successfully"
      });
      
      // Refresh data
      medicalRecordsQuery.refetch();
      
    } catch (error) {
      console.error('Error deleting medical record:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medical record"
      });
    }
  };

  const deleteMealPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_meal_plans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Meal plan deleted successfully"
      });
      
      // Refresh data
      mealPlansQuery.refetch();
      
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete meal plan"
      });
    }
  };

  const handleExportExcel = () => {
    const dataToExport = activeTab === "medicalRecords" 
      ? medicalRecordsQuery.data || [] 
      : mealPlansQuery.data || [];
    
    const fileName = activeTab === "medicalRecords" ? "medical-records-report.xlsx" : "nutrition-program-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Health");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generateMedicalPDF = (record: any) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Medical Record", 105, 15, { align: "center" });
    
    // Add student information
    doc.setFontSize(14);
    doc.text("Student Information", 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Name: ${record.students?.name || 'N/A'}`, 20, 40);
    
    // Calculate age if DOB is available
    let ageString = 'N/A';
    if (record.students?.dob) {
      const birthDate = new Date(record.students.dob);
      const today = new Date();
      const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                        today.getMonth() - birthDate.getMonth();
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      ageString = `${years}y ${months}m`;
    }
    
    doc.text(`Age: ${ageString}`, 20, 50);
    
    // Add medical details
    doc.setFontSize(14);
    doc.text("Medical Details", 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Immunization Status: ${record.immunization_status}`, 20, 75);
    doc.text(`Allergies: ${record.allergies || 'None'}`, 20, 85);
    doc.text(`Last Checkup: ${record.last_checkup ? format(new Date(record.last_checkup), "MMM dd, yyyy") : 'Not recorded'}`, 20, 95);
    doc.text(`Next Checkup: ${record.next_checkup ? format(new Date(record.next_checkup), "MMM dd, yyyy") : 'Not scheduled'}`, 20, 105);
    
    // Add medical notes
    if (record.medical_notes) {
      doc.setFontSize(14);
      doc.text("Medical Notes", 20, 120);
      
      doc.setFontSize(10);
      const notes = doc.splitTextToSize(record.medical_notes, 170);
      doc.text(notes, 20, 130);
    }
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 20, 280);
    
    // Save the PDF
    doc.save(`medical-record-${record.students?.name || 'student'}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "The medical record PDF has been generated"
    });
  };

  const generateMealPlanPDF = (mealPlan: any) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Weekly Meal Plan", 105, 15, { align: "center" });
    
    // Add week information
    doc.setFontSize(14);
    const weekStarting = format(new Date(mealPlan.week_starting), "MMMM d, yyyy");
    doc.text(`Week Starting: ${weekStarting}`, 20, 30);
    doc.text(`Meal Type: ${mealPlan.meal_type}`, 20, 40);
    
    // Add meal plan details
    doc.setFontSize(14);
    doc.text("Daily Menu", 20, 55);
    
    // Create a table-like structure
    const startY = 65;
    const rowHeight = 30;
    const colWidth = 150;
    
    // Headers
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Day", 20, startY);
    doc.text("Menu", 60, startY);
    doc.setFont(undefined, 'normal');
    
    // Monday
    doc.text("Monday", 20, startY + rowHeight);
    const mondayMenu = doc.splitTextToSize(mealPlan.monday_menu || 'Not specified', colWidth);
    doc.text(mondayMenu, 60, startY + rowHeight);
    
    // Tuesday
    doc.text("Tuesday", 20, startY + rowHeight * 2);
    const tuesdayMenu = doc.splitTextToSize(mealPlan.tuesday_menu || 'Not specified', colWidth);
    doc.text(tuesdayMenu, 60, startY + rowHeight * 2);
    
    // Wednesday
    doc.text("Wednesday", 20, startY + rowHeight * 3);
    const wednesdayMenu = doc.splitTextToSize(mealPlan.wednesday_menu || 'Not specified', colWidth);
    doc.text(wednesdayMenu, 60, startY + rowHeight * 3);
    
    // Thursday
    doc.text("Thursday", 20, startY + rowHeight * 4);
    const thursdayMenu = doc.splitTextToSize(mealPlan.thursday_menu || 'Not specified', colWidth);
    doc.text(thursdayMenu, 60, startY + rowHeight * 4);
    
    // Friday
    doc.text("Friday", 20, startY + rowHeight * 5);
    const fridayMenu = doc.splitTextToSize(mealPlan.friday_menu || 'Not specified', colWidth);
    doc.text(fridayMenu, 60, startY + rowHeight * 5);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 20, 280);
    
    // Save the PDF
    doc.save(`meal-plan-${format(new Date(mealPlan.week_starting), "yyyy-MM-dd")}-${mealPlan.meal_type}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "The meal plan PDF has been generated"
    });
  };

  if (!crecheId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-center">No Creche Selected</h2>
        <p className="text-muted-foreground text-center mt-2">
          Please select a creche to view health and nutrition reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Health & Nutrition Reports</h2>
          <p className="text-muted-foreground">
            Medical records and nutrition program reports
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

      <Tabs defaultValue="medicalRecords" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="medicalRecords">Medical Records</TabsTrigger>
          <TabsTrigger value="nutritionProgram">Nutrition Program</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medicalRecords">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Immunization Status</CardTitle>
                  <CardDescription>Overall immunization status of children</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    value: {
                      label: "Children",
                      theme: {
                        light: "#3b82f6",
                        dark: "#60a5fa"
                      }
                    }
                  }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={immunizationChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {immunizationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Allergy Distribution</CardTitle>
                  <CardDescription>Types of allergies reported</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    value: {
                      label: "Children",
                      theme: {
                        light: "#3b82f6",
                        dark: "#60a5fa"
                      }
                    }
                  }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={allergyChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {allergyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Children's Medical Records</CardTitle>
                  <CardDescription>Immunization and health check status</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingMedical(null);
                  medicalForm.reset();
                  setShowMedicalForm(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Record
                </Button>
              </CardHeader>
              <CardContent className="max-h-[450px] overflow-auto">
                {medicalRecordsQuery.isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : medicalRecordsQuery.data && medicalRecordsQuery.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Child Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Immunization</TableHead>
                        <TableHead>Allergies</TableHead>
                        <TableHead>Next Checkup</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicalRecordsQuery.data.map((record) => {
                        // Calculate age from DOB
                        let ageString = 'N/A';
                        if (record.students?.dob) {
                          const birthDate = new Date(record.students.dob);
                          const today = new Date();
                          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                                            today.getMonth() - birthDate.getMonth();
                          const years = Math.floor(ageInMonths / 12);
                          const months = ageInMonths % 12;
                          ageString = `${years}y ${months}m`;
                        }
                        
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.students?.name || 'N/A'}</TableCell>
                            <TableCell>{ageString}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {record.immunization_status === "Up to date" ? (
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                )}
                                {record.immunization_status}
                              </div>
                            </TableCell>
                            <TableCell>{record.allergies || 'None'}</TableCell>
                            <TableCell>{record.next_checkup ? format(new Date(record.next_checkup), "MMM dd, yyyy") : 'Not scheduled'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => generateMedicalPDF(record)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingMedical(record);
                                    setShowMedicalForm(true);
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deleteMedicalRecord(record.id)}
                                >
                                  <TrashIcon className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">No medical records found</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => {
                  setEditingMedical(null);
                  medicalForm.reset();
                  setShowMedicalForm(true);
                }}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Add Medical Record
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="nutritionProgram">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weekly Meal Plan</CardTitle>
                <CardDescription>Nutrition program for the current week</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingMealPlan(null);
                mealPlanForm.reset();
                setShowMealPlanForm(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New Meal Plan
              </Button>
            </CardHeader>
            <CardContent>
              {mealPlansQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : mealPlansQuery.data && mealPlansQuery.data.length > 0 ? (
                <>
                  <div className="font-medium text-lg mb-2">
                    Week Starting: {format(new Date(mealPlansQuery.data[0].week_starting), "MMMM d, yyyy")}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meal</TableHead>
                        <TableHead>Monday</TableHead>
                        <TableHead>Tuesday</TableHead>
                        <TableHead>Wednesday</TableHead>
                        <TableHead>Thursday</TableHead>
                        <TableHead>Friday</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealPlansQuery.data
                        .filter(meal => new Date(meal.week_starting).getTime() === new Date(mealPlansQuery.data[0].week_starting).getTime())
                        .map((meal) => (
                        <TableRow key={meal.id}>
                          <TableCell className="font-medium">{meal.meal_type}</TableCell>
                          <TableCell>{meal.monday_menu}</TableCell>
                          <TableCell>{meal.tuesday_menu}</TableCell>
                          <TableCell>{meal.wednesday_menu}</TableCell>
                          <TableCell>{meal.thursday_menu}</TableCell>
                          <TableCell>{meal.friday_menu}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => generateMealPlanPDF(meal)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingMealPlan(meal);
                                  setShowMealPlanForm(true);
                                }}
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteMealPlan(meal.id)}
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
                </>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">No meal plans found</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 items-stretch sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button className="flex-1" onClick={() => {
                setEditingMealPlan(null);
                mealPlanForm.reset();
                setShowMealPlanForm(true);
              }}>
                <FileUp className="mr-2 h-4 w-4" />
                Add New Meal Plan
              </Button>
              {mealPlansQuery.data && mealPlansQuery.data.length > 0 && (
                <Button className="flex-1" variant="outline" onClick={() => {
                  if (mealPlansQuery.data && mealPlansQuery.data.length > 0) {
                    const uniqueWeeks = [...new Set(mealPlansQuery.data.map(plan => 
                      format(new Date(plan.week_starting), "yyyy-MM-dd")
                    ))];
                    
                    const weeksList = uniqueWeeks.map(week => 
                      format(new Date(week), "MMMM d, yyyy")
                    ).join(', ');
                    
                    toast({
                      title: "Previous Meal Plans", 
                      description: `Available for weeks: ${weeksList}`
                    });
                  }
                }}>
                  <Search className="mr-2 h-4 w-4" />
                  View Previous Plans
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showMedicalForm} onOpenChange={(open) => {
        setShowMedicalForm(open);
        if (!open) {
          setEditingMedical(null);
          medicalForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMedical ? 'Edit Medical Record' : 'New Medical Record'}</DialogTitle>
            <DialogDescription>
              {editingMedical ? 'Update the medical record details' : 'Create a new medical record for a student'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...medicalForm}>
            <form onSubmit={medicalForm.handleSubmit(onSubmitMedical)} className="space-y-4">
              <FormField
                control={medicalForm.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={medicalForm.control}
                  name="immunization_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immunization Status</FormLabel>
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
                          <SelectItem value="Up to date">Up to date</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Incomplete">Incomplete</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={medicalForm.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Peanuts, Eggs (or None)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={medicalForm.control}
                  name="last_checkup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Checkup Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={medicalForm.control}
                  name="next_checkup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Checkup Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={medicalForm.control}
                name="medical_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Additional medical information, conditions, or special requirements" 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setShowMedicalForm(false);
                  setEditingMedical(null);
                  medicalForm.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMedical ? 'Update Record' : 'Save Record'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showMealPlanForm} onOpenChange={(open) => {
        setShowMealPlanForm(open);
        if (!open) {
          setEditingMealPlan(null);
          mealPlanForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMealPlan ? 'Edit Meal Plan' : 'New Meal Plan'}</DialogTitle>
            <DialogDescription>
              {editingMealPlan ? 'Update the meal plan details' : 'Create a new weekly meal plan'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...mealPlanForm}>
            <form onSubmit={mealPlanForm.handleSubmit(onSubmitMealPlan)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={mealPlanForm.control}
                  name="week_starting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week Starting (Monday)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={mealPlanForm.control}
                  name="meal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Breakfast">Breakfast</SelectItem>
                          <SelectItem value="Lunch">Lunch</SelectItem>
                          <SelectItem value="Snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={mealPlanForm.control}
                  name="monday_menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monday Menu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Oatmeal with fruit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={mealPlanForm.control}
                  name="tuesday_menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuesday Menu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Whole grain toast with egg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={mealPlanForm.control}
                  name="wednesday_menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wednesday Menu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Yogurt with granola" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={mealPlanForm.control}
                  name="thursday_menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thursday Menu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Fruit smoothie with toast" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={mealPlanForm.control}
                  name="friday_menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Friday Menu</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Egg and cheese sandwich" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setShowMealPlanForm(false);
                  setEditingMealPlan(null);
                  mealPlanForm.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMealPlan ? 'Update Meal Plan' : 'Save Meal Plan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthNutritionReport;
