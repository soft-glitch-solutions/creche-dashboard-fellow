
import { useState } from "react";
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
import { Download, Printer, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const StaffTrainingReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("qualifications");

  // Sample staff qualification data
  const staffQualifications = [
    { 
      id: 1, 
      name: "Sarah Johnson", 
      position: "Lead Teacher",
      qualification: "Early Childhood Development Level 6",
      certificationDate: "2022-05-10",
      expiryDate: "2025-05-10",
      backgroundCheck: "Verified"
    },
    { 
      id: 2, 
      name: "Mark Williams", 
      position: "Assistant Teacher",
      qualification: "Early Childhood Development Level 4",
      certificationDate: "2023-01-15",
      expiryDate: "2026-01-15",
      backgroundCheck: "Verified"
    },
    { 
      id: 3, 
      name: "Emma Davis", 
      position: "Caregiver",
      qualification: "Child Care Certificate",
      certificationDate: "2023-08-22",
      expiryDate: "2026-08-22",
      backgroundCheck: "Verified"
    },
    { 
      id: 4, 
      name: "Robert Brown", 
      position: "Administrative Manager",
      qualification: "Business Administration Diploma",
      certificationDate: "2020-11-30",
      expiryDate: "2023-11-30",
      backgroundCheck: "Verified"
    },
    { 
      id: 5, 
      name: "Lisa Martinez", 
      position: "Cook",
      qualification: "Food Safety Certificate",
      certificationDate: "2024-01-05",
      expiryDate: "2025-01-05",
      backgroundCheck: "Verified"
    },
  ];

  // Training data
  const trainingData = [
    { 
      id: 1, 
      name: "First Aid Training", 
      staff: "All Staff",
      completionDate: "2024-02-15",
      expiryDate: "2025-02-15",
      status: "Completed"
    },
    { 
      id: 2, 
      name: "Child Protection Training", 
      staff: "Teaching Staff",
      completionDate: "2024-03-20",
      expiryDate: "2025-03-20",
      status: "Completed"
    },
    { 
      id: 3, 
      name: "Fire Safety & Evacuation", 
      staff: "All Staff",
      completionDate: "2024-01-10",
      expiryDate: "2025-01-10",
      status: "Completed"
    },
    { 
      id: 4, 
      name: "Inclusive Education", 
      staff: "Teaching Staff",
      completionDate: "",
      expiryDate: "",
      status: "Scheduled (Sep 2024)"
    },
    { 
      id: 5, 
      name: "Nutrition & Health", 
      staff: "Caregivers & Cook",
      completionDate: "2023-11-05",
      expiryDate: "2024-11-05",
      status: "Completed"
    },
  ];

  // Chart data for qualifications by type
  const qualificationChartData = [
    { name: "ECD Level 6", value: 1 },
    { name: "ECD Level 4", value: 1 },
    { name: "Child Care Cert", value: 1 },
    { name: "Business Admin", value: 1 },
    { name: "Food Safety", value: 1 },
  ];

  const handleExportExcel = () => {
    const dataToExport = activeTab === "qualifications" ? staffQualifications : trainingData;
    const fileName = activeTab === "qualifications" ? "staff-qualifications-report.xlsx" : "staff-training-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
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
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={qualificationChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {qualificationChartData.map((entry, index) => (
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
                <CardTitle>Staff Qualification Records</CardTitle>
                <CardDescription>Certification details and verification status</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-auto">
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
                    {staffQualifications.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                        <TableCell>{staff.qualification}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {staff.backgroundCheck === "Verified" ? (
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                            )}
                            {staff.backgroundCheck}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => toast({ title: "Feature coming soon", description: "Staff document upload functionality will be available soon" })}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload New Certificate
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Records</CardTitle>
              <CardDescription>Staff training status and completion dates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Training Name</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingData.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">{training.name}</TableCell>
                      <TableCell>{training.staff}</TableCell>
                      <TableCell>
                        {training.completionDate 
                          ? format(new Date(training.completionDate), "MMM dd, yyyy") 
                          : "Not completed"}
                      </TableCell>
                      <TableCell>
                        {training.expiryDate 
                          ? format(new Date(training.expiryDate), "MMM dd, yyyy") 
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => toast({ title: "Feature coming soon", description: "Training record upload functionality will be available soon" })}>
                <FileUp className="mr-2 h-4 w-4" />
                Add New Training Record
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffTrainingReport;
