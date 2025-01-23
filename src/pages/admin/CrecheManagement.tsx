import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, Plus, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Creche {
  id: string;
  name: string;
  address: string;
  monthly_price: number;
  capacity: number;
}

const CrecheManagement = () => {
  const navigate = useNavigate();
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/dashboard/admin/creches/${creche.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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