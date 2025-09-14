
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { Download, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const FinanceReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          client:students(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Sample financial data for annual report
  const annualFinancialData = [
    { month: "Jan", income: 12500, expenses: 9800 },
    { month: "Feb", income: 13200, expenses: 10100 },
    { month: "Mar", income: 13800, expenses: 10300 },
    { month: "Apr", income: 14100, expenses: 10500 },
    { month: "May", income: 14300, expenses: 10700 },
    { month: "Jun", income: 14500, expenses: 10900 },
    { month: "Jul", income: 14200, expenses: 10600 },
    { month: "Aug", income: 0, expenses: 0 },
    { month: "Sep", income: 0, expenses: 0 },
    { month: "Oct", income: 0, expenses: 0 },
    { month: "Nov", income: 0, expenses: 0 },
    { month: "Dec", income: 0, expenses: 0 }
  ];

  // Expense breakdown data for pie chart
  const expenseData = [
    { name: "Staff Salaries", value: 62 },
    { name: "Rent", value: 15 },
    { name: "Food & Supplies", value: 10 },
    { name: "Utilities", value: 8 },
    { name: "Other", value: 5 }
  ];

  // Funding sources data for pie chart
  const fundingData = [
    { name: "Fees", value: 75 },
    { name: "Government Subsidy", value: 15 },
    { name: "Donations", value: 7 },
    { name: "Grants", value: 3 }
  ];

  const chartData = invoiceData?.reduce((acc: any[], curr) => {
    const date = format(new Date(curr.created_at), "MMM dd");
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.amount += curr.total_amount || 0;
    } else {
      acc.push({ date, amount: curr.total_amount || 0 });
    }
    return acc;
  }, []) || [];

  const handleExportExcel = () => {
    let dataToExport;
    let sheetName;
    
    if (activeTab === "overview") {
      dataToExport = annualFinancialData;
      sheetName = "Financial Overview";
    } else if (activeTab === "invoices") {
      dataToExport = invoiceData?.map((record) => ({
        Date: format(new Date(record.created_at), "yyyy-MM-dd"),
        Client: record.client?.name || "Unknown",
        Amount: record.total_amount || 0,
        Status: record.status,
      })) || [];
      sheetName = "Invoices";
    } else {
      dataToExport = expenseData;
      sheetName = "Expenses";
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, "finance-report.xlsx");

    toast({
      title: "Report Exported",
      description: "The finance report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance Report</h2>
          <p className="text-muted-foreground">
            View and analyze financial data from invoices
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

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="funding">Funding & Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Annual Financial Overview</CardTitle>
              <CardDescription>Income and expenses by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                income: {
                  label: "Income",
                  color: "#4ade80"
                },
                expenses: {
                  label: "Expenses",
                  color: "#f87171"
                }
              }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={annualFinancialData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R${value}`} />
                    <Bar dataKey="income" fill="var(--color-income)" />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Daily revenue from invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                amount: {
                  label: "Revenue",
                  color: "#84a7f6"
                }
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="var(--color-amount)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Invoice Records</CardTitle>
              <CardDescription>Detailed list of invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">Loading invoice data...</TableCell>
                    </TableRow>
                  ) : invoiceData && invoiceData.length > 0 ? (
                    invoiceData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{record.client?.name || "Unknown"}</TableCell>
                        <TableCell>R{record.total_amount?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>{record.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">No invoice data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="funding">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>Revenue distribution by source</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  value: {
                    label: "Percentage",
                    theme: {
                      light: "#3b82f6",
                      dark: "#60a5fa"
                    }
                  }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={fundingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fundingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money is being spent</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  value: {
                    label: "Percentage",
                    theme: {
                      light: "#3b82f6",
                      dark: "#60a5fa"
                    }
                  }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Funding Utilization Report</CardTitle>
              <CardDescription>Government subsidy and grant usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funding Source</TableHead>
                    <TableHead>Amount Received</TableHead>
                    <TableHead>Amount Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Reporting Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Government ECD Subsidy</TableCell>
                    <TableCell>R25,000.00</TableCell>
                    <TableCell>R18,750.00</TableCell>
                    <TableCell>R6,250.00</TableCell>
                    <TableCell>Sep 30, 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Local Community Grant</TableCell>
                    <TableCell>R5,000.00</TableCell>
                    <TableCell>R3,500.00</TableCell>
                    <TableCell>R1,500.00</TableCell>
                    <TableCell>Nov 15, 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Corporate Sponsorship</TableCell>
                    <TableCell>R10,000.00</TableCell>
                    <TableCell>R7,200.00</TableCell>
                    <TableCell>R2,800.00</TableCell>
                    <TableCell>Dec 31, 2024</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceReport;
