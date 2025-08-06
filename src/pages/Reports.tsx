
import { useState, useEffect } from "react";
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
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import AttendanceReport from "./reports/AttendanceReport";
import EnrollmentReport from "./reports/EnrollmentReport";
import FinanceReport from "./reports/FinanceReport";
import ComplianceReport from "./reports/ComplianceReport";
import StaffTrainingReport from "./reports/StaffTrainingReport";
import HealthNutritionReport from "./reports/HealthNutritionReport";
import IncidentReport from "./reports/IncidentReport";
import InventoryReport from "./reports/InventoryReport";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string>("attendance");
  const [currentCrecheId, setCurrentCrecheId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch current user's creche
  useEffect(() => {
    const fetchUserCreche = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userCreche } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();

        if (userCreche) {
          setCurrentCrecheId(userCreche.creche_id);
        }
      } catch (error) {
        console.error('Error fetching user creche:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to fetch creche data. Please try again later."
        });
      }
    };

    fetchUserCreche();
  }, [toast]);

  const reports = [
    {
      id: "attendance",
      title: t("attendanceReport"),
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
      title: t("financeReport"),
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
    {
      id: "inventory",
      title: "Inventory & Supply",
      description: "Stock tracking and restock alerts",
      icon: Package,
      component: InventoryReport,
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

      {ReportComponent && <ReportComponent crecheId={currentCrecheId} />}
    </div>
  );
};

export default Reports;
