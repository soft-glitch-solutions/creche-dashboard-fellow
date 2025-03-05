import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Printer, ArrowLeft, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Invoice {
  id: string;
  title: string;
  status: string;
  total_amount: number;
  created_at: string;
  prepared_for: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
}

interface InvoiceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    const fetchInvoice = async () => {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
        return;
      }

      setInvoice(invoiceData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id);

      if (itemsError) {
        console.error("Error fetching invoice items:", itemsError);
        return;
      }

      setItems(itemsData);
    };

    fetchInvoice();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setInvoice((prev) => (prev ? { ...prev, status: newStatus } : null));

      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    }
  };

  const handlePrintPDF = () => {
    navigate(`/dashboard/finance/invoice/${id}/pdf`);
  };

  const handleEditInvoice = () => {
    navigate(`/dashboard/finance/invoice/edit/${id}`);
  };

  if (!invoice) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
          <Card className="p-6 space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/finance")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Finance
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{invoice.title}</h2>
          <p className="text-muted-foreground">
            Invoice #{invoice.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleEditInvoice}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Invoice
          </Button>
          <Select value={invoice.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handlePrintPDF}>
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">Bill To:</h3>
              <p>{invoice.prepared_for}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date:</p>
              <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Discount</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.title}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      R{item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">{item.discount}%</td>
                    <td className="px-4 py-2 text-right">
                      R{item.total_price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT ({invoice.tax_rate}%):</span>
              <span>R{invoice.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>R{invoice.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewInvoice;
