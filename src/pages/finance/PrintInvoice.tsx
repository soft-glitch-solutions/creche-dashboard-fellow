import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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

const PrintInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [creche, setCreche] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch invoice
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*, creche:creches(*)')
        .eq('id', id)
        .single();

      if (invoiceData) {
        setInvoice(invoiceData);
        setCreche(invoiceData.creche);
      }

      // Fetch items
      const { data: itemsData } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id);

      if (itemsData) {
        setItems(itemsData);
      }
    };

    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!invoice || !creche) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="print:hidden mb-8">
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      <div className="space-y-8">
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
          <p>{creche.website || ''}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;