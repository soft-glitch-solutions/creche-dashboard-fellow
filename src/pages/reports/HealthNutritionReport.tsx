
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
import { Download, Printer, FileUp, CheckCircle, AlertCircle, Search } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const HealthNutritionReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("medicalRecords");

  // Medical Records data
  const medicalRecords = [
    {
      id: 1,
      childName: "Emma Thompson",
      dob: "2020-03-15",
      immunizationStatus: "Up to date",
      allergies: "Peanuts",
      lastCheckup: "2024-02-10",
      nextCheckup: "2024-08-10"
    },
    {
      id: 2,
      childName: "Noah Williams",
      dob: "2020-05-22",
      immunizationStatus: "Up to date",
      allergies: "None",
      lastCheckup: "2024-03-05",
      nextCheckup: "2024-09-05"
    },
    {
      id: 3,
      childName: "Olivia Davis",
      dob: "2019-11-10",
      immunizationStatus: "Pending (Booster)",
      allergies: "Dairy",
      lastCheckup: "2024-01-20",
      nextCheckup: "2024-07-20"
    },
    {
      id: 4,
      childName: "Liam Johnson",
      dob: "2021-01-30",
      immunizationStatus: "Up to date",
      allergies: "None",
      lastCheckup: "2024-04-12",
      nextCheckup: "2024-10-12"
    },
    {
      id: 5,
      childName: "Sophia Brown",
      dob: "2019-09-05",
      immunizationStatus: "Up to date",
      allergies: "Eggs",
      lastCheckup: "2024-02-25",
      nextCheckup: "2024-08-25"
    }
  ];

  // Nutrition program data
  const nutritionData = [
    {
      id: 1,
      weekStarting: "2024-07-01",
      mealType: "Breakfast",
      mondayMenu: "Oatmeal with fruit",
      tuesdayMenu: "Whole grain toast with egg",
      wednesdayMenu: "Yogurt with granola",
      thursdayMenu: "Fruit smoothie with toast",
      fridayMenu: "Egg and cheese sandwich"
    },
    {
      id: 2,
      weekStarting: "2024-07-01",
      mealType: "Lunch",
      mondayMenu: "Vegetable pasta",
      tuesdayMenu: "Chicken and rice",
      wednesdayMenu: "Fish with sweet potato",
      thursdayMenu: "Bean and cheese burrito",
      fridayMenu: "Baked chicken with vegetables"
    },
    {
      id: 3,
      weekStarting: "2024-07-01",
      mealType: "Snack",
      mondayMenu: "Fresh fruit",
      tuesdayMenu: "Cheese and crackers",
      wednesdayMenu: "Vegetable sticks with hummus",
      thursdayMenu: "Yogurt",
      fridayMenu: "Banana bread"
    }
  ];

  // Chart data for immunization status
  const immunizationChartData = [
    { name: "Up to date", value: 4 },
    { name: "Pending", value: 1 },
    { name: "Incomplete", value: 0 },
  ];

  // Chart data for allergies
  const allergyChartData = [
    { name: "No allergies", value: 2 },
    { name: "Peanuts", value: 1 },
    { name: "Dairy", value: 1 },
    { name: "Eggs", value: 1 },
  ];

  const handleExportExcel = () => {
    const dataToExport = activeTab === "medicalRecords" ? medicalRecords : nutritionData;
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
                          label
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
                          label
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
              <CardHeader>
                <CardTitle>Children's Medical Records</CardTitle>
                <CardDescription>Immunization and health check status</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[450px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Child Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Immunization</TableHead>
                      <TableHead>Allergies</TableHead>
                      <TableHead>Next Checkup</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalRecords.map((record) => {
                      const birthDate = new Date(record.dob);
                      const today = new Date();
                      const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                                        today.getMonth() - birthDate.getMonth();
                      const years = Math.floor(ageInMonths / 12);
                      const months = ageInMonths % 12;
                      const ageString = `${years}y ${months}m`;
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.childName}</TableCell>
                          <TableCell>{ageString}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {record.immunizationStatus === "Up to date" ? (
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                              )}
                              {record.immunizationStatus}
                            </div>
                          </TableCell>
                          <TableCell>{record.allergies}</TableCell>
                          <TableCell>{format(new Date(record.nextCheckup), "MMM dd, yyyy")}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => toast({ title: "Feature coming soon", description: "Medical record upload functionality will be available soon" })}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Medical Records
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="nutritionProgram">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Meal Plan</CardTitle>
              <CardDescription>Nutrition program for the current week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="font-medium text-lg mb-2">Week Starting: July 1, 2024</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal</TableHead>
                    <TableHead>Monday</TableHead>
                    <TableHead>Tuesday</TableHead>
                    <TableHead>Wednesday</TableHead>
                    <TableHead>Thursday</TableHead>
                    <TableHead>Friday</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nutritionData.map((meal) => (
                    <TableRow key={meal.id}>
                      <TableCell className="font-medium">{meal.mealType}</TableCell>
                      <TableCell>{meal.mondayMenu}</TableCell>
                      <TableCell>{meal.tuesdayMenu}</TableCell>
                      <TableCell>{meal.wednesdayMenu}</TableCell>
                      <TableCell>{meal.thursdayMenu}</TableCell>
                      <TableCell>{meal.fridayMenu}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 items-stretch sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button className="flex-1" onClick={() => toast({ title: "Feature coming soon", description: "Meal plan upload functionality will be available soon" })}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload New Meal Plan
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => toast({ title: "Feature coming soon", description: "Previous meal plans will be available soon" })}>
                <Search className="mr-2 h-4 w-4" />
                View Previous Plans
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthNutritionReport;
