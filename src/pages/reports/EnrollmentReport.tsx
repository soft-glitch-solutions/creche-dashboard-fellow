import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { ChartContainer } from "@/components/ui/chart";
import { Download, Printer } from "lucide-react";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const EnrollmentReport = () => {
  const { toast } = useToast();

  const { data: enrollmentData, isLoading } = useQuery({
    queryKey: ["enrollment-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const chartData = enrollmentData?.reduce((acc: any[], curr) => {
    const classGroup = curr.class || "Unassigned";
    const existing = acc.find((item) => item.name === classGroup);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: classGroup, value: 1 });
    }
    return acc;
  }, []);

  const handleExportExcel = () => {
    if (!enrollmentData) return;

    const worksheet = XLSX.utils.json_to_sheet(
      enrollmentData.map((student) => ({
        Name: student.name,
        Class: student.class || "Unassigned",
        Age: student.age,
        "Parent Name": student.parent_name,
        "Parent Email": student.parent_email,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment");
    XLSX.writeFile(workbook, "enrollment-report.xlsx");

    toast({
      title: "Report Exported",
      description: "The enrollment report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enrollment Report</h2>
          <p className="text-muted-foreground">
            View current enrollment statistics
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

      <Card>
        <CardHeader>
          <CardTitle>Class Distribution</CardTitle>
          <CardDescription>Students per class</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer config={{
            value: {
              label: "Students",
              theme: {
                light: "#3b82f6",
                dark: "#60a5fa"
              }
            }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData?.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
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
          <CardTitle>Student List</CardTitle>
          <CardDescription>Complete list of enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Parent Name</TableHead>
                <TableHead>Parent Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentData?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class || "Unassigned"}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.parent_name}</TableCell>
                  <TableCell>{student.parent_email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentReport;