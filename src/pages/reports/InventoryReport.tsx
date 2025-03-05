
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
import { Download, Plus, Bell, AlertTriangle, Package, PackageCheck, Search } from "lucide-react";
import * as XLSX from "xlsx";

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

const InventoryReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "stationery",
    current_quantity: 0,
    minimum_threshold: 10,
    unit: "units",
    notes: "",
  });

  // Sample inventory data - in a real app, this would come from the database
  const inventoryData: InventoryItem[] = [
    {
      id: "1",
      name: "Crayons",
      category: "stationery",
      current_quantity: 45,
      minimum_threshold: 20,
      unit: "boxes",
      last_restocked: "2024-06-01",
      notes: "Assorted colors, 24 count boxes",
      creche_id: "1",
    },
    {
      id: "2",
      name: "Construction Paper",
      category: "stationery",
      current_quantity: 15,
      minimum_threshold: 10,
      unit: "packs",
      last_restocked: "2024-05-15",
      notes: "Multicolor, 50 sheets per pack",
      creche_id: "1",
    },
    {
      id: "3",
      name: "Baby Wipes",
      category: "cleaning",
      current_quantity: 8,
      minimum_threshold: 10,
      unit: "packs",
      last_restocked: "2024-05-25",
      notes: "Fragrance-free, 80 wipes per pack",
      creche_id: "1",
    },
    {
      id: "4",
      name: "Disposable Gloves",
      category: "cleaning",
      current_quantity: 5,
      minimum_threshold: 6,
      unit: "boxes",
      last_restocked: "2024-05-10",
      notes: "Latex-free, 100 gloves per box",
      creche_id: "1",
    },
    {
      id: "5",
      name: "Diapers Size 3",
      category: "diapers",
      current_quantity: 35,
      minimum_threshold: 30,
      unit: "packs",
      last_restocked: "2024-06-05",
      notes: "30 diapers per pack",
      creche_id: "1",
    },
    {
      id: "6",
      name: "Diapers Size 4",
      category: "diapers",
      current_quantity: 12,
      minimum_threshold: 20,
      unit: "packs",
      last_restocked: "2024-05-20",
      notes: "28 diapers per pack",
      creche_id: "1",
    },
    {
      id: "7",
      name: "Rice",
      category: "food",
      current_quantity: 25,
      minimum_threshold: 10,
      unit: "kg",
      last_restocked: "2024-05-28",
      notes: "Long grain",
      creche_id: "1",
    },
    {
      id: "8",
      name: "Apple Juice",
      category: "food",
      current_quantity: 8,
      minimum_threshold: 12,
      unit: "bottles",
      last_restocked: "2024-05-18",
      notes: "1L bottles, no added sugar",
      creche_id: "1",
    },
  ];

  const filteredInventory = inventoryData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const restockAlerts = inventoryData.filter(
    (item) => item.current_quantity <= item.minimum_threshold
  );

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

  const handleAddNewItem = () => {
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory`,
    });
    setIsAddItemDialogOpen(false);
    setNewItem({
      name: "",
      category: "stationery",
      current_quantity: 0,
      minimum_threshold: 10,
      unit: "units",
      notes: "",
    });
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stationery">Stationery</SelectItem>
                      <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                      <SelectItem value="diapers">Diapers</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_quantity">Current Quantity</Label>
                    <Input
                      id="current_quantity"
                      type="number"
                      value={newItem.current_quantity}
                      onChange={(e) => setNewItem({ ...newItem, current_quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minimum_threshold">Minimum Threshold</Label>
                  <Input
                    id="minimum_threshold"
                    type="number"
                    value={newItem.minimum_threshold}
                    onChange={(e) => setNewItem({ ...newItem, minimum_threshold: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddNewItem}>Add Item</Button>
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
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
              {restockAlerts.length > 0 ? (
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
                <Button variant="outline" className="w-full">
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
