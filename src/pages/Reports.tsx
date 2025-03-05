
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartBar,
  ChartLine,
  Calendar,
  Banknote,
  FileCheck,
  GraduationCap,
  UserCheck,
  Apple,
  AlertTriangle,
} from "lucide-react";
import AttendanceReport from "./reports/AttendanceReport";
import EnrollmentReport from "./reports/EnrollmentReport";
import FinanceReport from "./reports/FinanceReport";
import ComplianceReport from "./reports/ComplianceReport";
import StaffTrainingReport from "./reports/StaffTrainingReport";
import HealthNutritionReport from "./reports/HealthNutritionReport";
import IncidentReport from "./reports/IncidentReport";

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
    {
      id: "finance",
      title: "Finance Report",
      description: "Financial statements and funding utilization",
      icon: Banknote,
      component: FinanceReport,
    },
    {
      id: "compliance",
      title: "Compliance Reports",
      description: "Registration and regulatory compliance",
      icon: FileCheck,
      component: ComplianceReport,
    },
    {
      id: "staff",
      title: "Staff & Training",
      description: "Qualifications and training records",
      icon: UserCheck,
      component: StaffTrainingReport,
    },
    {
      id: "health",
      title: "Health & Nutrition",
      description: "Medical records and nutrition programs",
      icon: Apple,
      component: HealthNutritionReport,
    },
    {
      id: "incidents",
      title: "Incident Reports",
      description: "Safety incidents and emergency reports",
      icon: AlertTriangle,
      component: IncidentReport,
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
