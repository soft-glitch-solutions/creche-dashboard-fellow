import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  parent_name: string;
}

interface InvoiceItem {
  title: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

const EditInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams(); // Get the invoice ID from the URL
  const [userCreche, setUserCreche] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userCrecheData } = await supabase
          .from("user_creche")
          .select("creche_id")
          .eq("user_id", user.id)
          .single();

        if (userCrecheData) {
          setUserCreche(userCrecheData.creche_id);

          const { data: studentsData } = await supabase
            .from("students")
            .select("id, name, parent_name")
            .eq("creche_id", userCrecheData.creche_id);

          setStudents(studentsData || []);

          const { data: invoiceData, error: invoiceError } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", id)
            .single();

          if (invoiceError || !invoiceData) {
            console.error("Error fetching invoice:", invoiceError);
            toast({
              title: "Error",
              description: "Invoice not found",
              variant: "destructive",
            });
            return;
          }

          setTitle(invoiceData.title);
          setSelectedStudent(invoiceData.student_id);

          const { data: itemsData } = await supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", id);

          setItems(itemsData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch invoice data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate total price
    const quantity = Number(newItems[index].quantity) || 0;
    const unitPrice = Number(newItems[index].unit_price) || 0;
    const discount = Number(newItems[index].discount) || 0;
    newItems[index].total_price = quantity * unitPrice * (1 - discount / 100);

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const handleSubmit = async () => {
    if (!userCreche || !selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const taxRate = 15; // 15% VAT
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    try {
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          title,
          student_id: selectedStudent,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          prepared_for: students.find((s) => s.id === selectedStudent)?.parent_name,
        })
        .eq("id", id);

      if (invoiceError) throw invoiceError;

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", id);

      if (itemsError) throw itemsError;

      const { error: newItemsError } = await supabase
        .from("invoice_items")
        .insert(
          items.map((item) => ({
            invoice_id: id,
            ...item,
          }))
        );

      if (newItemsError) throw newItemsError;

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      navigate(`/dashboard/finance/invoice/${id}`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Invoice</h2>
        <p className="text-muted-foreground">Update the invoice details</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Invoice Title</Label>
              <Input
                placeholder="Enter invoice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.parent_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <Button
                variant="outline"
                onClick={() =>
                  setItems([
                    ...items,
                    { title: "", quantity: 1, unit_price: 0, discount: 0, total_price: 0 },
                  ])
                }
              >
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <Label htmlFor={`title-${index}`}>Description</Label>
                  <Input
                    id={`title-${index}`}
                    placeholder="Item description"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`unit-price-${index}`}>Unit Price (R)</Label>
                  <Input
                    id={`unit-price-${index}`}
                    type="number"
                    placeholder="Unit Price"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
                  <Input
                    id={`discount-${index}`}
                    type="number"
                    placeholder="Discount %"
                    value={item.discount}
                    onChange={(e) => handleItemChange(index, "discount", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`total-${index}`}>Total</Label>
                  <div id={`total-${index}`} className="h-10 flex items-center justify-center border border-input rounded-md bg-muted px-3 py-2">
                    R{item.total_price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (15%):</span>
              <span>R{(calculateSubtotal() * 0.15).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>R{(calculateSubtotal() * 1.15).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard/finance")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Update Invoice</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditInvoice;