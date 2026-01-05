import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Plus, Trash2, Save } from "lucide-react";

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options: any;
  is_required: boolean;
  is_enabled: boolean;
  display_order: number;
  section: string;
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Text Area" },
  { value: "checkbox", label: "Checkbox" },
];

const sections = [
  { value: "parent", label: "Parent Information" },
  { value: "child", label: "Child Information" },
  { value: "additional", label: "Additional Information" },
];

const ApplicationFormSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [crecheId, setCrecheId] = useState<string | null>(null);

  useEffect(() => {
    loadFormConfig();
  }, []);

  const loadFormConfig = async () => {
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

      const { data: configData, error } = await supabase
        .from("application_form_config")
        .select("*")
        .eq("creche_id", uc.creche_id)
        .order("section")
        .order("display_order");

      if (error) throw error;

      setFields(configData || []);
    } catch (error) {
      console.error("Error loading form config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load form configuration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, key: keyof FormField, value: any) => {
    setFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, [key]: value } : field
      )
    );
  };

  const handleSave = async () => {
    if (!crecheId) return;
    setIsSaving(true);

    try {
      for (const field of fields) {
        const { error } = await supabase
          .from("application_form_config")
          .update({
            field_label: field.field_label,
            field_type: field.field_type,
            is_required: field.is_required,
            is_enabled: field.is_enabled,
            display_order: field.display_order,
            section: field.section,
          })
          .eq("id", field.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Application form configuration saved",
      });
    } catch (error) {
      console.error("Error saving form config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save form configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddField = async () => {
    if (!crecheId) return;

    const newFieldName = `custom_field_${Date.now()}`;
    const newOrder = Math.max(...fields.map(f => f.display_order), 0) + 1;

    try {
      const { data, error } = await supabase
        .from("application_form_config")
        .insert({
          creche_id: crecheId,
          field_name: newFieldName,
          field_label: "New Field",
          field_type: "text",
          is_required: false,
          is_enabled: true,
          display_order: newOrder,
          section: "additional",
        })
        .select()
        .single();

      if (error) throw error;

      setFields(prev => [...prev, data]);
      toast({
        title: "Field Added",
        description: "New field has been added to the form",
      });
    } catch (error) {
      console.error("Error adding field:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new field",
      });
    }
  };

  const handleDeleteField = async (fieldId: string, fieldName: string) => {
    // Prevent deletion of core fields
    const coreFields = [
      "parent_name", "parent_email", "parent_phone_number",
      "child_first_name", "child_last_name"
    ];

    if (coreFields.includes(fieldName)) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "This is a core field and cannot be deleted. You can disable it instead.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("application_form_config")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;

      setFields(prev => prev.filter(f => f.id !== fieldId));
      toast({
        title: "Field Deleted",
        description: "Field has been removed from the form",
      });
    } catch (error) {
      console.error("Error deleting field:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete field",
      });
    }
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
            You need to be assigned to a creche to configure the application form.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groupedFields = sections.map(section => ({
    ...section,
    fields: fields.filter(f => f.section === section.value),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Form Settings</h2>
          <p className="text-muted-foreground">
            Customize the fields shown in your application form
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {groupedFields.map(section => (
        <Card key={section.value}>
          <CardHeader>
            <CardTitle className="text-lg">{section.label}</CardTitle>
            <CardDescription>
              Configure fields for the {section.label.toLowerCase()} section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.fields.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No fields in this section
                </p>
              ) : (
                section.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Field Label</Label>
                        <Input
                          value={field.field_label}
                          onChange={(e) => handleFieldChange(field.id, "field_label", e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Field Type</Label>
                        <Select
                          value={field.field_type}
                          onValueChange={(value) => handleFieldChange(field.id, "field_type", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.is_required}
                            onCheckedChange={(checked) => handleFieldChange(field.id, "is_required", checked)}
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.is_enabled}
                            onCheckedChange={(checked) => handleFieldChange(field.id, "is_enabled", checked)}
                          />
                          <Label className="text-sm">Enabled</Label>
                        </div>
                      </div>

                      <div className="flex items-end justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteField(field.id, field.field_name)}
                          className="text-destructive hover:text-destructive"
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
      ))}
    </div>
  );
};

export default ApplicationFormSettings;
