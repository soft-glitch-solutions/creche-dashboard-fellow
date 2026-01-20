import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Pencil, Users, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CrecheClass {
  id: string;
  name: string;
  color: string;
  capacity: number;
  min_age_months: number;
  max_age_months: number;
  enrolled_count?: number;
  waiting_count?: number;
}

interface ManageClassesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatAgeRange = (minMonths: number, maxMonths: number) => {
  const formatAge = (months: number) => {
    if (months < 12) return `${months}m`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}m`;
  };
  return `${formatAge(minMonths)} - ${formatAge(maxMonths)}`;
};

export const ManageClassesDialog = ({ open, onOpenChange }: ManageClassesDialogProps) => {
  const [classes, setClasses] = useState<CrecheClass[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassColor, setNewClassColor] = useState("#3b82f6");
  const [newClassCapacity, setNewClassCapacity] = useState(20);
  const [newMinAge, setNewMinAge] = useState(0);
  const [newMaxAge, setNewMaxAge] = useState(72);
  const [editingClass, setEditingClass] = useState<CrecheClass | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchClasses();
    }
  }, [open]);

  const getUserCrecheId = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) throw new Error("User not authenticated");

      const { data: userCreche, error: crecheError } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.user.id)
        .single();

      if (crecheError || !userCreche?.creche_id) throw new Error("No creche assigned");
      
      return userCreche.creche_id;
    } catch (error: any) {
      console.error("Error fetching user creche:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch user creche",
      });
      return null;
    }
  };

  const fetchClasses = async () => {
    const crecheId = await getUserCrecheId();
    if (!crecheId) return;

    try {
      const { data: classesData, error } = await supabase
        .from("creche_classes")
        .select("*")
        .eq("creche_id", crecheId);

      if (error) throw error;

      // Get enrollment counts for each class
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count: enrolledCount } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id);

          const { count: waitingCount } = await supabase
            .from("application_waiting_list")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id)
            .eq("status", "waiting");

          return {
            ...cls,
            enrolled_count: enrolledCount || 0,
            waiting_count: waitingCount || 0,
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error: any) {
      console.error("Error fetching classes:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch classes",
      });
    }
  };

  const addClass = async () => {
    if (!newClassName.trim()) return;
    const crecheId = await getUserCrecheId();
    if (!crecheId) return;

    try {
      const { error } = await supabase.from("creche_classes").insert({
        creche_id: crecheId,
        name: newClassName,
        color: newClassColor,
        capacity: newClassCapacity,
        min_age_months: newMinAge,
        max_age_months: newMaxAge,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Class added successfully" });
      setNewClassName("");
      setNewClassCapacity(20);
      setNewMinAge(0);
      setNewMaxAge(72);
      fetchClasses();
    } catch (error) {
      console.error("Error adding class:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add class" });
    }
  };

  const updateClass = async (classId: string) => {
    if (!editingClass || !editingClass.name.trim()) return;

    try {
      const { error } = await supabase
        .from("creche_classes")
        .update({ 
          name: editingClass.name, 
          color: editingClass.color,
          capacity: editingClass.capacity,
          min_age_months: editingClass.min_age_months,
          max_age_months: editingClass.max_age_months,
        })
        .eq("id", classId);

      if (error) throw error;

      toast({ title: "Success", description: "Class updated successfully" });
      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      console.error("Error updating class:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update class" });
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      const { error } = await supabase.from("creche_classes").delete().eq("id", classId);
      if (error) throw error;

      toast({ title: "Success", description: "Class deleted successfully" });
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete class" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Classes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add new class form */}
          <div className="grid grid-cols-6 gap-2 items-end border-b pb-4">
            <div className="col-span-2 space-y-2">
              <Label>Class Name</Label>
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Toddlers"
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={newClassCapacity}
                onChange={(e) => setNewClassCapacity(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Age (months)</Label>
              <Input
                type="number"
                value={newMinAge}
                onChange={(e) => setNewMinAge(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Age (months)</Label>
              <Input
                type="number"
                value={newMaxAge}
                onChange={(e) => setNewMaxAge(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newClassColor}
                onChange={(e) => setNewClassColor(e.target.value)}
                className="w-12 h-10"
              />
              <Button onClick={addClass}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Class list */}
          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-3 rounded-lg border"
                style={{ borderLeftColor: cls.color, borderLeftWidth: 4 }}
              >
                {editingClass?.id === cls.id ? (
                  <div className="grid grid-cols-6 gap-2 items-end">
                    <div className="col-span-2">
                      <Input
                        value={editingClass.name}
                        onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                      />
                    </div>
                    <Input
                      type="number"
                      value={editingClass.capacity}
                      onChange={(e) => setEditingClass({ ...editingClass, capacity: parseInt(e.target.value) || 0 })}
                      min={1}
                    />
                    <Input
                      type="number"
                      value={editingClass.min_age_months}
                      onChange={(e) => setEditingClass({ ...editingClass, min_age_months: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                    <Input
                      type="number"
                      value={editingClass.max_age_months}
                      onChange={(e) => setEditingClass({ ...editingClass, max_age_months: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={editingClass.color}
                        onChange={(e) => setEditingClass({ ...editingClass, color: e.target.value })}
                        className="w-12"
                      />
                      <Button onClick={() => updateClass(cls.id)} size="sm">Save</Button>
                      <Button onClick={() => setEditingClass(null)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cls.color }} />
                        <span className="font-medium">{cls.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({formatAgeRange(cls.min_age_months, cls.max_age_months)})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingClass(cls)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteClass(cls.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{cls.enrolled_count}/{cls.capacity}</span>
                      </div>
                      {cls.waiting_count! > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span>{cls.waiting_count} waiting</span>
                        </div>
                      )}
                      <Progress 
                        value={((cls.enrolled_count || 0) / cls.capacity) * 100} 
                        className="flex-1 h-2"
                      />
                      {(cls.enrolled_count || 0) >= cls.capacity && (
                        <span className="text-xs text-red-600 font-medium">FULL</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {classes.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No classes created yet. Add your first class above.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
