import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Pencil } from "lucide-react";

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
  const [editingClass, setEditingClass] = useState<CrecheClass | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchClasses();
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      // First get the user's creche
      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche?.creche_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No creche assigned to user"
        });
        return;
      }

      const { data, error } = await supabase
        .from('creche_classes')
        .select('*')
        .eq('creche_id', userCreche.creche_id);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch classes"
      });
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

  const updateClass = async (classId: string) => {
    if (!editingClass || !editingClass.name.trim()) return;

    try {
      const { error } = await supabase
        .from('creche_classes')
        .update({
          name: editingClass.name,
          color: editingClass.color
        })
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class updated successfully"
      });

      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update class"
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
                {editingClass?.id === cls.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      value={editingClass.name}
                      onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                    />
                    <Input
                      type="color"
                      value={editingClass.color}
                      onChange={(e) => setEditingClass({ ...editingClass, color: e.target.value })}
                      className="w-20"
                    />
                    <Button onClick={() => updateClass(cls.id)} size="sm">
                      Save
                    </Button>
                    <Button onClick={() => setEditingClass(null)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cls.color }}
                      />
                      <span>{cls.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingClass(cls)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteClass(cls.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};