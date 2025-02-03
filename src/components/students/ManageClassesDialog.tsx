import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";

interface CrecheClass {
  id: string;
  name: string;
  color: string;
}

interface ManageClassesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageClassesDialog = ({ open, onOpenChange }: ManageClassesDialogProps) => {
  const [classes, setClasses] = useState<CrecheClass[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassColor, setNewClassColor] = useState("#3b82f6");
  const { toast } = useToast();

  const fetchClasses = async () => {
    try {
      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche?.creche_id) return;

      const { data } = await supabase
        .from('creche_classes')
        .select('*')
        .eq('creche_id', userCreche.creche_id);

      if (data) setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const addClass = async () => {
    if (!newClassName.trim()) return;

    try {
      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche?.creche_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No creche assigned"
        });
        return;
      }

      const { error } = await supabase
        .from('creche_classes')
        .insert({
          creche_id: userCreche.creche_id,
          name: newClassName,
          color: newClassColor
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class added successfully"
      });

      setNewClassName("");
      fetchClasses();
    } catch (error) {
      console.error('Error adding class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add class"
      });
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('creche_classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully"
      });

      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete class"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Classes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Class Name</Label>
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={newClassColor}
                onChange={(e) => setNewClassColor(e.target.value)}
                className="w-20 h-10"
              />
            </div>
            <Button onClick={addClass} className="mt-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-2 rounded-md"
                style={{ backgroundColor: cls.color + '20' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span>{cls.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteClass(cls.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};