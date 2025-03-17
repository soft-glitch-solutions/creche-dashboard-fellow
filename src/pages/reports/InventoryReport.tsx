
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Bell, AlertTriangle, Package, PackageCheck, Search, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_quantity: number;
  minimum_threshold: number;
  unit: string;
  last_restocked: string;
  notes?: string;
  creche_id: string;
}

const inventoryFormSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  category: z.string(),
  current_quantity: z.number().min(0, { message: "Quantity cannot be negative." }),
  minimum_threshold: z.number().min(0, { message: "Threshold cannot be negative." }),
  unit: z.string().min(1, { message: "Unit is required." }),
  notes: z.string().optional(),
});

const InventoryReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [currentCrecheId, setCurrentCrecheId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inventoryForm = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      category: "stationery",
      current_quantity: 0,
      minimum_threshold: 10,
      unit: "units",
      notes: "",
    },
  });

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
      }
    };

    fetchUserCreche();
  }, []);

  // Fetch inventory data from Supabase
  const { data: inventoryData, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', currentCrecheId],
    queryFn: async () => {
      if (!currentCrecheId) return [];
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('creche_id', currentCrecheId);
      
      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!currentCrecheId
  });

  const filteredInventory = inventoryData 
    ? inventoryData.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
    : [];

  const restockAlerts = inventoryData 
    ? inventoryData.filter(
        (item) => item.current_quantity <= item.minimum_threshold
      )
    : [];

  const handleExportExcel = () => {
    const dataToExport = activeTab === "inventory" ? filteredInventory : restockAlerts;
    const fileName = activeTab === "inventory" ? "inventory-report.xlsx" : "restock-alerts.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The inventory report has been exported to Excel",
    });
  };

  const onSubmit = async (data: z.infer<typeof inventoryFormSchema>) => {
    if (!currentCrecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche associated with current user"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          ...data,
          creche_id: currentCrecheId,
          last_restocked: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Item Added",
        description: `${data.name} has been added to inventory`,
      });
      
      refetch();
      setIsAddItemDialogOpen(false);
      inventoryForm.reset({
        name: "",
        category: "stationery",
        current_quantity: 0,
        minimum_threshold: 10,
        unit: "units",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add inventory item"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockLevelColor = (item: InventoryItem) => {
    const percentage = (item.current_quantity / item.minimum_threshold) * 100;
    if (percentage <= 75) return "bg-red-500";
    if (percentage <= 150) return "bg-yellow-500";
    return "bg-green-500";
  };

  const calculateStockPercentage = (item: InventoryItem) => {
    return Math.min(Math.round((item.current_quantity / (item.minimum_threshold * 2)) * 100), 100);
  };

  if (error) {
    return (
      <div className="p-6 rounded-md bg-red-50 text-red-500">
        <h3 className="text-lg font-medium">Error loading inventory</h3>
        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory & Supply Management</h2>
          <p className="text-muted-foreground">
            Track supplies and get restock alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
          </Button>
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <Form {...inventoryForm}>
                <form onSubmit={inventoryForm.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={inventoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inventoryForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stationery">Stationery</SelectItem>
                            <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                            <SelectItem value="diapers">Diapers</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={inventoryForm.control}
                      name="current_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inventoryForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={inventoryForm.control}
                    name="minimum_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Threshold</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inventoryForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Item"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="stationery">Stationery</SelectItem>
            <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
            <SelectItem value="diapers">Diapers</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="inventory" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="restock" className="relative">
            <Bell className="mr-2 h-4 w-4" />
            Restock Alerts
            {restockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {restockAlerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>All supplies and materials in stock</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Last Restocked</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell>
                            {item.current_quantity} {item.unit}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={calculateStockPercentage(item)} 
                                className={`h-2 w-20 ${getStockLevelColor(item)}`} 
                              />
                              {item.current_quantity < item.minimum_threshold && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(item.last_restocked).toLocaleDateString()}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{item.notes}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          {inventoryData?.length === 0 
                            ? "No inventory items found. Add your first item to get started." 
                            : "No items match your search criteria."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="restock">
          <Card>
            <CardHeader>
              <CardTitle>Restock Alerts</CardTitle>
              <CardDescription>Items that need to be restocked soon</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : restockAlerts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Quantity</TableHead>
                      <TableHead>Minimum Threshold</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restockAlerts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>{item.current_quantity} {item.unit}</TableCell>
                        <TableCell>{item.minimum_threshold} {item.unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-red-500 font-medium">
                              {item.current_quantity === 0 
                                ? "Out of stock" 
                                : "Running low"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <PackageCheck className="h-12 w-12 text-green-500 mb-2" />
                  <p className="text-lg font-medium text-center">All inventory items are adequately stocked</p>
                  <p className="text-muted-foreground text-center max-w-md mt-1">
                    No items are currently below their minimum threshold levels
                  </p>
                </div>
              )}
            </CardContent>
            {restockAlerts.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => {
                  toast({
                    title: "Purchase Order",
                    description: "Purchase order functionality will be available soon"
                  });
                }}>
                  Create Purchase Order
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryReport;
