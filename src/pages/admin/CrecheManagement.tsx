import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Plus, Users, Building2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Creche {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  capacity: number;
  operating_hours: string;
  description: string;
  monthly_price: number;
  weekly_price: number;
  website: string;
}

const CrecheManagement = () => {
  const [selectedCreche, setSelectedCreche] = useState<Creche | null>(null);
  const { toast } = useToast();

  const { data: creches, isLoading, error } = useQuery({
    queryKey: ["creches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creches")
        .select("*");

      if (error) {
        toast({
          title: "Error fetching creches",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Creche[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading creches</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Creche Management</h1>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          Add new creche
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Creche Name</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Monthly Fee</th>
                <th className="text-left p-4">Capacity</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creches?.map((creche) => (
                <tr key={creche.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <Building2 className="h-6 w-6" />
                      </Avatar>
                      {creche.name}
                    </div>
                  </td>
                  <td className="p-4">{creche.address}</td>
                  <td className="p-4">R{creche.monthly_price}</td>
                  <td className="p-4">{creche.capacity} children</td>
                  <td className="p-4 text-right">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedCreche(creche)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[800px] sm:w-[600px]">
                        <SheetHeader className="border-b pb-4">
                          <div className="flex items-center justify-between">
                            <SheetTitle>{creche.name}</SheetTitle>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </SheetHeader>
                        {selectedCreche && (
                          <div className="mt-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Capacity Information
                                </h3>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">
                                      Total Capacity
                                    </label>
                                    <p className="font-medium">
                                      {selectedCreche.capacity} children
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">
                                      Operating Hours
                                    </label>
                                    <p className="font-medium">
                                      {selectedCreche.operating_hours}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">
                                      Email
                                    </label>
                                    <p className="font-medium">{selectedCreche.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">
                                      Phone
                                    </label>
                                    <p className="font-medium">
                                      {selectedCreche.phone_number}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">
                                      Website
                                    </label>
                                    <p className="font-medium">{selectedCreche.website}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-4">Pricing</h3>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm text-muted-foreground">
                                    Monthly Fee
                                  </label>
                                  <p className="font-medium">
                                    R{selectedCreche.monthly_price}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">
                                    Weekly Fee
                                  </label>
                                  <p className="font-medium">
                                    R{selectedCreche.weekly_price}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-4">Description</h3>
                              <p className="text-muted-foreground">
                                {selectedCreche.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </SheetContent>
                    </Sheet>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CrecheManagement;