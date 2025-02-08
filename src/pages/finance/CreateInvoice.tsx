import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  name: string;
  parent_name: string;
}

interface Application {
  id: string;
  applicant_name: string;
  parent_name: string;
}

interface InvoiceItem {
  title: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userCreche, setUserCreche] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedTab, setSelectedTab] = useState<"student" | "application">("student");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([{
    title: "",
    quantity: 1,
    unit_price: 0,
    discount: 0,
    total_price: 0
  }]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const getUserCreche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userCrecheData } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();
        
        if (userCrecheData) {
          setUserCreche(userCrecheData.creche_id);
          // Fetch students for this creche
          const { data: studentsData } = await supabase
            .from('students')
            .select('id, name, parent_name')
            .eq('creche_id', userCrecheData.creche_id);
          
          if (studentsData) {
            setStudents(studentsData);
          }

          // Fetch applications for this creche
          const { data: applicationsData } = await supabase
            .from('applications')
            .select('id, parent_name')
            .eq('creche_id', userCrecheData.creche_id);
          
          if (applicationsData) {
            setApplications(applicationsData);
          }
        }
      }
    };

    getUserCreche();
  }, []);

  const handleAddItem = () => {
    setItems([...items, {
      title: "",
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total_price: 0
    }]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Recalculate total price
    const quantity = newItems[index].quantity;
    const unitPrice = newItems[index].unit_price;
    const discount = newItems[index].discount;
    newItems[index].total_price = quantity * unitPrice * (1 - discount / 100);

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async () => {
    if (!userCreche || (selectedTab === "student" && !selectedStudent) || (selectedTab === "application" && !selectedApplication)) {
      toast({
        title: "Error",
        description: `Please select a ${selectedTab === "student" ? "student" : "application"}`,
        variant: "destructive",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const taxRate = 15; // 15% VAT
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    try {
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          creche_id: userCreche,
          student_id: selectedTab === "student" ? selectedStudent : null,
          application_id: selectedTab === "application" ? selectedApplication : null,
          title,
          status: 'pending',
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          prepared_for: selectedTab === "student" 
            ? students.find(s => s.id === selectedStudent)?.parent_name 
            : applications.find(a => a.id === selectedApplication)?.parent_name
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          items.map(item => ({
            invoice_id: invoice.id,
            ...item
          }))
        );

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      navigate(`/dashboard/finance/invoice/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
        <p className="text-muted-foreground">Create a new invoice for a student or application</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "student" | "application")}>
            <TabsList>
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
            </TabsList>
          </Tabs>

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
              <Label>Select {selectedTab === "student" ? "Student" : "Application"}</Label>
              <Select
                value={selectedTab === "student" ? selectedStudent : selectedApplication}
                onValueChange={selectedTab === "student" ? setSelectedStudent : setSelectedApplication}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${selectedTab === "student" ? "student" : "application"}`} />
                </SelectTrigger>
                <SelectContent>
                  {selectedTab === "student"
                    ? students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.parent_name})
                        </SelectItem>
                      ))
                    : applications.map((application) => (
                        <SelectItem key={application.id} value={application.id}>
                          {application.applicant_name} ({application.parent_name})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <Button onClick={handleAddItem} variant="outline">Add Item</Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Item description"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Unit Price (R)"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Discount %"
                    value={item.discount}
                    onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                  />
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
            <Button variant="outline" onClick={() => navigate('/dashboard/finance')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Invoice
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateInvoice;