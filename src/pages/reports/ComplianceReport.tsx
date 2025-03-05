
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
import { Download, Printer, Upload, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ComplianceReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("registration");

  // Sample compliance data - in a real app, this would come from the database
  const registrationData = [
    { 
      id: 1, 
      documentName: "Registration Renewal Form", 
      status: "Submitted",
      expiryDate: "2025-06-15",
      submittedDate: "2024-06-15",
      notes: "Annual renewal completed"
    },
    { 
      id: 2, 
      documentName: "Fire Safety Certificate", 
      status: "Valid",
      expiryDate: "2025-03-20",
      submittedDate: "2024-03-20",
      notes: "Passed inspection with no issues"
    },
    { 
      id: 3, 
      documentName: "Health & Hygiene Certificate", 
      status: "Valid",
      expiryDate: "2025-02-10",
      submittedDate: "2024-02-10",
      notes: "Health department approval"
    },
    { 
      id: 4, 
      documentName: "Building Compliance Certificate", 
      status: "Valid",
      expiryDate: "2027-05-12",
      submittedDate: "2024-05-12",
      notes: "Structural safety verified"
    },
    { 
      id: 5, 
      documentName: "Child Protection Policy", 
      status: "Updated",
      expiryDate: "2025-08-01",
      submittedDate: "2024-08-01",
      notes: "Annual policy review completed"
    },
  ];

  const policyData = [
    { 
      id: 1, 
      policyName: "Admissions Policy", 
      lastUpdated: "2024-01-15",
      reviewDue: "2025-01-15",
      status: "Current"
    },
    { 
      id: 2, 
      policyName: "Child Protection Policy", 
      lastUpdated: "2024-02-20",
      reviewDue: "2025-02-20",
      status: "Current"
    },
    { 
      id: 3, 
      policyName: "Emergency & Evacuation Plan", 
      lastUpdated: "2024-03-05",
      reviewDue: "2025-03-05",
      status: "Current"
    },
    { 
      id: 4, 
      policyName: "Health & Safety Policy", 
      lastUpdated: "2024-01-30",
      reviewDue: "2025-01-30",
      status: "Current"
    },
    { 
      id: 5, 
      policyName: "Staff Code of Conduct", 
      lastUpdated: "2023-11-10",
      reviewDue: "2024-11-10",
      status: "Needs Review"
    },
  ];

  const handleExportExcel = () => {
    const dataToExport = activeTab === "registration" ? registrationData : policyData;
    const fileName = activeTab === "registration" ? "compliance-registration-report.xlsx" : "policies-procedures-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The compliance report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance & Registration Reports</h2>
          <p className="text-muted-foreground">
            Track registration renewal and regulatory compliance
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

      <Tabs defaultValue="registration" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registration">Registration & Certificates</TabsTrigger>
          <TabsTrigger value="policies">Policies & Procedures</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle>Registration Renewal Status</CardTitle>
              <CardDescription>Key documents and certificates for regulatory compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.documentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {item.status === "Valid" || item.status === "Submitted" || item.status === "Updated" ? (
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                          )}
                          {item.status}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(item.submittedDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(new Date(item.expiryDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{item.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => toast({ title: "Feature coming soon", description: "Document upload functionality will be available soon" })}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Policies & Procedures</CardTitle>
              <CardDescription>Center policies documentation and review status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Next Review Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policyData.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.policyName}</TableCell>
                      <TableCell>{format(new Date(policy.lastUpdated), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(new Date(policy.reviewDue), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {policy.status === "Current" ? (
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                          )}
                          {policy.status}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => toast({ title: "Feature coming soon", description: "Policy document upload functionality will be available soon" })}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Policy
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReport;
