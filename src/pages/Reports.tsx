import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartBar,
  ChartLine,
  ChartPie,
  Download,
  Printer,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string>("attendance");

  // Fetch students data for reports
  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch attendance data
  const { data: attendance } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_students")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const reports = [
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Daily and monthly attendance tracking",
      icon: Calendar,
    },
    {
      id: "enrollment",
      title: "Enrollment Statistics",
      description: "Current and historical enrollment data",
      icon: ChartLine,
    },
    {
      id: "financial",
      title: "Financial Summary",
      description: "Income, expenses, and outstanding fees",
      icon: ChartBar,
    },
    {
      id: "demographics",
      title: "Student Demographics",
      description: "Age groups and class distribution",
      icon: ChartPie,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view reports for your creche
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={selectedReport}
          onValueChange={(value) => setSelectedReport(value)}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            {reports.map((report) => (
              <SelectItem key={report.id} value={report.id}>
                {report.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-colors hover:border-primary ${
              selectedReport === report.id ? "border-primary" : ""
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader>
              <report.icon className="h-8 w-8 text-primary" />
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {reports.find((r) => r.id === selectedReport)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedReport === "attendance" && (
            <div>
              <p className="text-muted-foreground">
                Total Students: {students?.length || 0}
              </p>
              <p className="text-muted-foreground">
                Today's Attendance: {attendance?.length || 0}
              </p>
            </div>
          )}
          {/* Add more report content based on selectedReport */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;