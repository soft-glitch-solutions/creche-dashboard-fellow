import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudentProfileDrawerProps {
  student: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: any) => void;
}

export const StudentProfileDrawer = ({
  student,
  open,
  onOpenChange,
  onSave,
}: StudentProfileDrawerProps) => {
  const [formData, setFormData] = useState(student || {});
  const [classes, setClasses] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(student || {});
  }, [student]);

  const fetchClasses = useCallback(async () => {
    try {
      // Fetch authenticated user
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch creche ID associated with the user
      const { data: userCreche, error: crecheError } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.user.id)
        .single();

      if (crecheError || !userCreche?.creche_id) {
        console.error("Error fetching creche:", crecheError);
        return;
      }

      // Fetch classes associated with the creche
      const { data, error: classesError } = await supabase
        .from("creche_classes")
        .select("*")
        .eq("creche_id", userCreche.creche_id);

      if (classesError) {
        console.error("Error fetching classes:", classesError);
        return;
      }

      if (data) setClasses(data);
    } catch (error) {
      console.error("Unexpected error fetching classes:", error);
    }
  }, []);

  useEffect(() => {
    if (open) fetchClasses();
  }, [open, fetchClasses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{student ? "Edit Student" : "Add Student"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={formData.class || ""}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cls.color }}
                      />
                      {cls.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent_name">Parent Name</Label>
            <Input
              id="parent_name"
              value={formData.parent_name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, parent_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent_phone_number">Contact Number</Label>
            <Input
              id="parent_phone_number"
              value={formData.parent_phone_number || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, parent_phone_number: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent_email">Email</Label>
            <Input
              id="parent_email"
              type="email"
              value={formData.parent_email || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, parent_email: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="disabilities_allergies">Special Needs/Allergies</Label>
            <Input
              id="disabilities_allergies"
              value={formData.disabilities_allergies || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, disabilities_allergies: e.target.value }))
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
