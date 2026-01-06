import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LifecycleStage {
  id: string;
  stage_name: string;
  display_order: number;
  is_active: boolean;
}

const LifecycleStagesSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stages, setStages] = useState<LifecycleStage[]>([]);
  const [crecheId, setCrecheId] = useState<string | null>(null);

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: uc } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!uc?.creche_id) {
        setIsLoading(false);
        return;
      }

      setCrecheId(uc.creche_id);

      const { data, error } = await supabase
        .from("application_lifecycle_stages")
        .select("*")
        .eq("creche_id", uc.creche_id)
        .order("display_order");

      if (error) throw error;

      setStages(data || []);
    } catch (error) {
      console.error("Error loading stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lifecycle stages",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageChange = (stageId: string, key: keyof LifecycleStage, value: any) => {
    setStages(prev =>
      prev.map(stage =>
        stage.id === stageId ? { ...stage, [key]: value } : stage
      )
    );
  };

  const handleSave = async () => {
    if (!crecheId) return;
    setIsSaving(true);

    try {
      for (const stage of stages) {
        const { error } = await supabase
          .from("application_lifecycle_stages")
          .update({
            stage_name: stage.stage_name,
            display_order: stage.display_order,
            is_active: stage.is_active,
          })
          .eq("id", stage.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Lifecycle stages saved successfully",
      });
    } catch (error) {
      console.error("Error saving stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save lifecycle stages",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStage = async () => {
    if (!crecheId) return;

    const newOrder = Math.max(...stages.map(s => s.display_order), 0) + 1;

    try {
      const { data, error } = await supabase
        .from("application_lifecycle_stages")
        .insert({
          creche_id: crecheId,
          stage_name: "New Stage",
          display_order: newOrder,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setStages(prev => [...prev, data]);
      toast({
        title: "Stage Added",
        description: "New stage has been added",
      });
    } catch (error) {
      console.error("Error adding stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new stage",
      });
    }
  };

  const handleDeleteStage = async (stageId: string, stageName: string) => {
    // Prevent deletion of core stages
    const coreStages = ["New", "Approved", "Rejected"];

    if (coreStages.includes(stageName)) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "This is a core stage and cannot be deleted. You can disable it instead.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("application_lifecycle_stages")
        .delete()
        .eq("id", stageId);

      if (error) throw error;

      setStages(prev => prev.filter(s => s.id !== stageId));
      toast({
        title: "Stage Deleted",
        description: "Stage has been removed",
      });
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete stage",
      });
    }
  };

  const moveStage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === stages.length - 1)
    ) {
      return;
    }

    const newStages = [...stages];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // Swap display orders
    const tempOrder = newStages[index].display_order;
    newStages[index].display_order = newStages[swapIndex].display_order;
    newStages[swapIndex].display_order = tempOrder;

    // Swap positions in array
    [newStages[index], newStages[swapIndex]] = [newStages[swapIndex], newStages[index]];

    setStages(newStages);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!crecheId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Creche Assigned</CardTitle>
          <CardDescription>
            You need to be assigned to a creche to configure lifecycle stages.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Application Lifecycle Stages</h2>
          <p className="text-muted-foreground">
            Customize the stages applicants go through in your application process
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddStage}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lifecycle Stages</CardTitle>
          <CardDescription>
            Drag to reorder stages. The order defines the application workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No stages configured. Click "Add Stage" to create your first stage.
              </p>
            ) : (
              stages
                .sort((a, b) => a.display_order - b.display_order)
                .map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStage(index, "up")}
                        disabled={index === 0}
                      >
                        ▲
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStage(index, "down")}
                        disabled={index === stages.length - 1}
                      >
                        ▼
                      </Button>
                    </div>
                    
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Stage Name</Label>
                        <Input
                          value={stage.stage_name}
                          onChange={(e) => handleStageChange(stage.id, "stage_name", e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Order</Label>
                        <Input
                          type="number"
                          value={stage.display_order}
                          onChange={(e) => handleStageChange(stage.id, "display_order", parseInt(e.target.value))}
                          className="h-9"
                        />
                      </div>

                      <div className="flex items-end gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={stage.is_active}
                            onCheckedChange={(checked) => handleStageChange(stage.id, "is_active", checked)}
                          />
                          <Label className="text-sm">Active</Label>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStage(stage.id, stage.stage_name)}
                          className="text-destructive hover:text-destructive ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>New</strong> - The initial stage when an application is submitted</p>
          <p>• <strong>Active stages</strong> - Will appear in the application lifecycle tracker</p>
          <p>• <strong>Inactive stages</strong> - Won't appear but existing applications on that stage are preserved</p>
          <p>• <strong>Order</strong> - Determines the progression flow of applications</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifecycleStagesSettings;
