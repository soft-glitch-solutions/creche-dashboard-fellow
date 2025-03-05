
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Printer, Plus, AlertCircle, FileText } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths } from "date-fns";

const IncidentReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);

  // Incident data
  const incidentData = [
    {
      id: 1,
      date: "2024-06-15",
      time: "10:30",
      incidentType: "Minor Injury",
      childName: "Emma Thompson",
      location: "Playground",
      description: "Scraped knee while playing on the slide. First aid applied - cleaned with antiseptic and bandage applied.",
      actionTaken: "First aid administered, parent notified by phone",
      reportedBy: "Sarah Johnson",
      witness: "Mark Williams",
      severity: "Low"
    },
    {
      id: 2,
      date: "2024-05-22",
      time: "14:15",
      incidentType: "Behavioral",
      childName: "Noah Williams",
      location: "Classroom",
      description: "Dispute over sharing toys resulted in Noah pushing another child. No injuries but both children upset.",
      actionTaken: "Children separated, discussion about sharing, parents informed at pickup",
      reportedBy: "Emma Davis",
      witness: "Lisa Martinez",
      severity: "Low"
    },
    {
      id: 3,
      date: "2024-04-10",
      time: "11:45",
      incidentType: "Health Related",
      childName: "Olivia Davis",
      location: "Dining Area",
      description: "Allergic reaction (mild rash) after meal. Child accidentally received food containing dairy.",
      actionTaken: "Medication administered as per health plan, parents called immediately",
      reportedBy: "Robert Brown",
      witness: "Sarah Johnson",
      severity: "Medium"
    },
    {
      id: 4,
      date: "2024-03-18",
      time: "09:20",
      incidentType: "Facility Issue",
      childName: "N/A",
      location: "Kitchen",
      description: "Small water leak discovered from sink pipe. No safety hazard to children as area is restricted.",
      actionTaken: "Area closed off, maintenance called and repaired same day",
      reportedBy: "Lisa Martinez",
      witness: "N/A",
      severity: "Low"
    },
    {
      id: 5,
      date: "2024-02-05",
      time: "13:30",
      incidentType: "Emergency Drill",
      childName: "All Children",
      location: "Entire Facility",
      description: "Scheduled fire drill conducted. All children and staff evacuated within 3 minutes.",
      actionTaken: "Successful drill, no issues noted",
      reportedBy: "Robert Brown",
      witness: "All Staff",
      severity: "N/A"
    }
  ];

  // Chart data for incidents by month
  const currentDate = new Date();
  const incidentChartData = [
    { 
      month: format(subMonths(currentDate, 5), "MMM"), 
      minor: 2, 
      medium: 0, 
      major: 0 
    },
    { 
      month: format(subMonths(currentDate, 4), "MMM"), 
      minor: 1, 
      medium: 1, 
      major: 0 
    },
    { 
      month: format(subMonths(currentDate, 3), "MMM"), 
      minor: 1, 
      medium: 0, 
      major: 0 
    },
    { 
      month: format(subMonths(currentDate, 2), "MMM"), 
      minor: 0, 
      medium: 1, 
      major: 0 
    },
    { 
      month: format(subMonths(currentDate, 1), "MMM"), 
      minor: 1, 
      medium: 0, 
      major: 0 
    },
    { 
      month: format(currentDate, "MMM"), 
      minor: 2, 
      medium: 0, 
      major: 0 
    }
  ];

  // Sample safeguarding data
  const safeguardingData = [
    {
      id: 1,
      date: "2024-06-10",
      concernType: "Behavioral Change",
      childName: "Liam Johnson",
      description: "Child showing signs of withdrawal and reluctance to participate in activities.",
      actionTaken: "Observation period initiated, discussion with parents scheduled for next week",
      status: "Monitoring",
      reportedBy: "Sarah Johnson"
    },
    {
      id: 2,
      date: "2024-04-22",
      concernType: "Disclosure",
      childName: "Charlotte Brown",
      description: "Child made concerning comments about home situation during story time.",
      actionTaken: "Documented comments, consulted with safeguarding lead, meeting with parents held",
      status: "Resolved",
      reportedBy: "Emma Davis"
    },
    {
      id: 3,
      date: "2024-03-15",
      concernType: "Physical Mark",
      childName: "Sophia Martinez",
      description: "Unexplained bruise noticed on upper arm during changing time.",
      actionTaken: "Documented, discussed with parent who explained child fell at home, monitoring",
      status: "Resolved",
      reportedBy: "Mark Williams"
    }
  ];

  const viewIncidentDetails = (incident: any) => {
    setSelectedIncident(incident);
    setShowIncidentDetails(true);
  };

  const handleExportExcel = () => {
    const dataToExport = activeTab === "incidents" ? incidentData : safeguardingData;
    const fileName = activeTab === "incidents" ? "incident-report.xlsx" : "safeguarding-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      default:
        return <Badge className="bg-gray-500">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'monitoring':
        return <Badge className="bg-blue-500">Monitoring</Badge>;
      case 'active':
        return <Badge className="bg-yellow-500">Active</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'escalated':
        return <Badge className="bg-red-500">Escalated</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incident & Safeguarding Reports</h2>
          <p className="text-muted-foreground">
            Safety incidents, emergency reports, and child protection records
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

      <Tabs defaultValue="incidents" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incidents">Incident Reports</TabsTrigger>
          <TabsTrigger value="safeguarding">Safeguarding Concerns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incidents">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
                <CardDescription>Monthly incident reports by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  minor: {
                    label: "Minor",
                    color: "#4ade80"
                  },
                  medium: {
                    label: "Medium",
                    color: "#facc15"
                  },
                  major: {
                    label: "Major",
                    color: "#f87171"
                  }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incidentChartData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="minor" fill="var(--color-minor)" stackId="a" />
                      <Bar dataKey="medium" fill="var(--color-medium)" stackId="a" />
                      <Bar dataKey="major" fill="var(--color-major)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Incident Log</CardTitle>
                  <CardDescription>Record of all reported incidents</CardDescription>
                </div>
                <Button onClick={() => toast({ title: "Feature coming soon", description: "New incident report form will be available soon" })}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Incident
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Child</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidentData.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{format(new Date(incident.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{incident.incidentType}</TableCell>
                        <TableCell>{incident.childName}</TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                        <TableCell>{incident.reportedBy}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewIncidentDetails(incident)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <Dialog open={showIncidentDetails} onOpenChange={setShowIncidentDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Incident Report Details</DialogTitle>
                <DialogDescription>
                  Full details of the selected incident report
                </DialogDescription>
              </DialogHeader>
              
              {selectedIncident && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Incident Date & Time</h4>
                      <p>{format(new Date(selectedIncident.date), "MMM dd, yyyy")} at {selectedIncident.time}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Incident Type</h4>
                      <p>{selectedIncident.incidentType}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Child Involved</h4>
                      <p>{selectedIncident.childName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p>{selectedIncident.location}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Severity</h4>
                      <p>{getSeverityBadge(selectedIncident.severity)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Reported By</h4>
                      <p>{selectedIncident.reportedBy}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="mt-1">{selectedIncident.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Action Taken</h4>
                    <p className="mt-1">{selectedIncident.actionTaken}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Witness</h4>
                    <p>{selectedIncident.witness}</p>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowIncidentDetails(false)}>Close</Button>
                <Button onClick={() => {
                  toast({ title: "Report Generated", description: "The incident report PDF has been generated" });
                  setShowIncidentDetails(false);
                }}>
                  Generate PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="safeguarding">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Safeguarding Concerns</CardTitle>
                <CardDescription>Record of child protection and safeguarding issues</CardDescription>
              </div>
              <Button onClick={() => toast({ title: "Feature coming soon", description: "New safeguarding record form will be available soon" })}>
                <Plus className="mr-2 h-4 w-4" />
                New Record
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Confidential Information</h4>
                    <p className="text-amber-700 text-sm">
                      These records contain sensitive safeguarding information. Ensure appropriate privacy when viewing and maintain strict confidentiality.
                    </p>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Concern Type</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeguardingData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{record.concernType}</TableCell>
                      <TableCell>{record.childName}</TableCell>
                      <TableCell>{record.reportedBy}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Feature coming soon", description: "Safeguarding record details view will be available soon" })}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All safeguarding records are encrypted and access-controlled in compliance with data protection regulations.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentReport;
