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
  ChartBar,
  ChartLine,
  ChartPie,
  Calendar,
} from "lucide-react";
import AttendanceReport from "./reports/AttendanceReport";
import EnrollmentReport from "./reports/EnrollmentReport";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string>("attendance");

  const reports = [
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Daily and monthly attendance tracking",
      icon: Calendar,
      component: AttendanceReport,
    },
    {
      id: "enrollment",
      title: "Enrollment Statistics",
      description: "Current and historical enrollment data",
      icon: ChartLine,
      component: EnrollmentReport,
    },
  ];

  const ReportComponent = reports.find(
    (report) => report.id === selectedReport
  )?.component;

  return (
    <div className="space-y-6">
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

      {ReportComponent && <ReportComponent />}
    </div>
  );
};

export default Reports;