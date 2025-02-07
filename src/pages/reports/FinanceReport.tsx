import { useState } from "react";
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
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

const FinanceReport = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_students")
        .select(`
          *,
          student:students(name)
        `)
        .order("attendance_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const chartData = attendanceData?.reduce((acc: any[], curr) => {
    const date = format(new Date(curr.attendance_date), "MMM dd");
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []);

  const handleExportExcel = () => {
    if (!attendanceData) return;

    const worksheet = XLSX.utils.json_to_sheet(
      attendanceData.map((record) => ({
        Date: format(new Date(record.attendance_date), "yyyy-MM-dd"),
        Student: record.student?.name,
        Status: record.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance-report.xlsx");

    toast({
      title: "Report Exported",
      description: "The attendance report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Report</h2>
          <p className="text-muted-foreground">
            View and analyze student attendance data
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
          <CardTitle>Finance Overview</CardTitle>
          <CardDescription>Daily attendance count</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            count: {
              label: "Attendance Count",
              color: "#84a7f6"
            }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Detailed list of attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.attendance_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{record.student?.name}</TableCell>
                  <TableCell>{record.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceReport;