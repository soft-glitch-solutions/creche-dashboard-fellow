import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LessonType {
  id: string;
  name: string;
  color: string;
  creche_id: string;
}

const ManageLessonTypesDialog = () => {
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [newLessonTypeName, setNewLessonTypeName] = useState("");
  const [newLessonTypeColor, setNewLessonTypeColor] = useState("#3b82f6");
  const [editingLessonType, setEditingLessonType] = useState<LessonType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchLessonTypes();
    }
  }, [isOpen]);

  // Utility function to fetch user creche_id
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
    } catch (error) {
      console.error("Error fetching user creche:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch user creche",
      });
      return null;
    }
  };

  const fetchLessonTypes = async () => {
    const crecheId = await getUserCrecheId();
    if (!crecheId) return;

    try {
      const { data: lessonTypes, error } = await supabase
        .from("lesson_types")
        .select("*")
        .eq("creche_id", crecheId);

      if (error) throw error;

      setLessonTypes(lessonTypes || []);
    } catch (error) {
      console.error("Error fetching lesson types:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch lesson types",
      });
    }
  };

  const addLessonType = async () => {
    if (!newLessonTypeName.trim()) return;
    const crecheId = await getUserCrecheId();
    if (!crecheId) return;

    try {
      const { error } = await supabase.from("lesson_types").insert({
        creche_id: crecheId,
        name: newLessonTypeName,
        color: newLessonTypeColor,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Lesson type added successfully" });
      setNewLessonTypeName("");
      setNewLessonTypeColor("#3b82f6");
      fetchLessonTypes();
    } catch (error) {
      console.error("Error adding lesson type:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add lesson type" });
    }
  };

  const updateLessonType = async (lessonTypeId: string) => {
    if (!editingLessonType || !editingLessonType.name.trim()) return;

    try {
      const { error } = await supabase
        .from("lesson_types")
        .update({ name: editingLessonType.name, color: editingLessonType.color })
        .eq("id", lessonTypeId);

      if (error) throw error;

      toast({ title: "Success", description: "Lesson type updated successfully" });
      setEditingLessonType(null);
      fetchLessonTypes();
    } catch (error) {
      console.error("Error updating lesson type:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update lesson type" });
    }
  };

  const deleteLessonType = async (lessonTypeId: string) => {
    try {
      const { error } = await supabase.from("lesson_types").delete().eq("id", lessonTypeId);
      if (error) throw error;

      toast({ title: "Success", description: "Lesson type deleted successfully" });
      fetchLessonTypes();
    } catch (error) {
      console.error("Error deleting lesson type:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete lesson type" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Manage Lesson Types
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Lesson Types</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Lesson Type Name</Label>
              <Input
                value={newLessonTypeName}
                onChange={(e) => setNewLessonTypeName(e.target.value)}
                placeholder="Enter lesson type name"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={newLessonTypeColor}
                onChange={(e) => setNewLessonTypeColor(e.target.value)}
                className="w-20 h-10"
              />
            </div>
            <Button onClick={addLessonType} className="mt-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {lessonTypes.map((lessonType) => (
              <div
                key={lessonType.id}
                className="flex items-center justify-between p-2 rounded-md"
                style={{ backgroundColor: lessonType.color + "20" }}
              >
                {editingLessonType?.id === lessonType.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      value={editingLessonType.name}
                      onChange={(e) => setEditingLessonType({ ...editingLessonType, name: e.target.value })}
                    />
                    <Input
                      type="color"
                      value={editingLessonType.color}
                      onChange={(e) => setEditingLessonType({ ...editingLessonType, color: e.target.value })}
                      className="w-20"
                    />
                    <Button onClick={() => updateLessonType(lessonType.id)} size="sm">
                      Save
                    </Button>
                    <Button onClick={() => setEditingLessonType(null)} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: lessonType.color }} />
                      <span>{lessonType.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingLessonType(lessonType)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteLessonType(lessonType.id)}>
                        <Trash2 className="h-4 w-4" />
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

export default ManageLessonTypesDialog;