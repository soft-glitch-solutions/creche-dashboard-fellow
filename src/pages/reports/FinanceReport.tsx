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

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice")
        .select(`
          *,
          client:clients(name)
        `)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const chartData = invoiceData?.reduce((acc: any[], curr) => {
    const date = format(new Date(curr.invoice_date), "MMM dd");
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ date, amount: curr.amount });
    }
    return acc;
  }, []);

  const handleExportExcel = () => {
    if (!invoiceData) return;

    const worksheet = XLSX.utils.json_to_sheet(
      invoiceData.map((record) => ({
        Date: format(new Date(record.invoice_date), "yyyy-MM-dd"),
        Client: record.client?.name,
        Amount: record.amount,
        Status: record.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "invoice-report.xlsx");

    toast({
      title: "Report Exported",
      description: "The invoice report has been exported to Excel",
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
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
              {invoiceData?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.invoice_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{record.client?.name}</TableCell>
                  <TableCell>${record.amount.toFixed(2)}</TableCell>
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