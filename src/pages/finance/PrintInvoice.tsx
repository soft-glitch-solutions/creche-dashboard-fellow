import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

// Interfaces
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

// Skeleton Loading Component
const SkeletonLoading = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse">
      {/* Back & Print Buttons Skeleton */}
      <div className="mb-8 flex justify-between">
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
      </div>

      {/* Header Skeleton */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
          <div className="h-16 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-56 bg-gray-200 rounded"></div>
          <div className="h-4 w-52 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Bill To Skeleton */}
      <div className="border-t border-b py-4 mb-8">
        <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Items Table Skeleton */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2"><div className="h-4 w-32 bg-gray-200 rounded"></div></th>
            <th className="text-right py-2"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
            <th className="text-right py-2"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
            <th className="text-right py-2"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
            <th className="text-right py-2"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(3)].map((_, index) => (
            <tr key={index} className="border-b">
              <td className="py-2"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
              <td className="text-right py-2"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
              <td className="text-right py-2"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
              <td className="text-right py-2"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
              <td className="text-right py-2"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Skeleton */}
      <div className="space-y-2 mb-8">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t pt-8 text-center">
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  );
};

// Main Component
const PrintInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [creche, setCreche] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: invoiceData } = await supabase
          .from("invoices")
          .select("*, creche:creches(*)")
          .eq("id", id)
          .single();

        if (invoiceData) {
          setInvoice(invoiceData);
          setCreche(invoiceData.creche);
        }

        const { data: itemsData } = await supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", id);

        if (itemsData) {
          setItems(itemsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePrint = () => {
    const content = document.getElementById("invoice-content")?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (content) {
      document.body.innerHTML = content;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  // Skeleton Loading State
  if (isLoading) {
    return <SkeletonLoading />;
  }

  // Render Invoice Content
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Back & Print Buttons (Hidden when printing) */}
      <div className="print:hidden mb-8 flex justify-between">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Content - Only this will be printed */}
      <div id="invoice-content" className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <img src={creche.logo} alt="Creche Logo" className="h-16 mb-4" />
            <h1 className="text-2xl font-bold">{creche.name}</h1>
            <p className="text-sm text-gray-600">{creche.address}</p>
            <p className="text-sm text-gray-600">{creche.email}</p>
            <p className="text-sm text-gray-600">{creche.phone_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-700">INVOICE</h2>
            <p className="text-gray-600">#{invoice.id.slice(0, 8)}</p>
            <p className="text-gray-600">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="border-t border-b py-4">
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p>{invoice.prepared_for}</p>
        </div>

        {/* Items Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Discount</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.title}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">R{item.unit_price.toFixed(2)}</td>
                <td className="text-right py-2">{item.discount}%</td>
                <td className="text-right py-2">R{item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT ({invoice.tax_rate}%):</span>
            <span>R{invoice.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>R{invoice.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p>{creche.name}</p>
          <p>{creche.website || ""}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;