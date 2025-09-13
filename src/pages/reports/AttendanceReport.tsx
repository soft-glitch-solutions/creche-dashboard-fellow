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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Download, Printer, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

const AttendanceReport = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch classes for filter dropdown
  const { data: classes } = useQuery({
    queryKey: ["creche-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creche_classes")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance-report", selectedClass, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("attendance_students")
        .select(`
          *,
          student:students(name, class)
        `)
        .order("attendance_date", { ascending: false });

      // Apply class filter
      if (selectedClass) {
        query = query.eq("student.class", selectedClass);
      }

      // Apply date range filter
      if (startDate) {
        query = query.gte("attendance_date", startDate);
      }
      if (endDate) {
        query = query.lte("attendance_date", endDate);
      }

      const { data, error } = await query;
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-filter">Class/Grade</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All classes</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
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
                <TableHead>Class</TableHead>
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
                  <TableCell>{record.student?.class || "N/A"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReport;