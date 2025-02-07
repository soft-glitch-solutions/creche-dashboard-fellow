import React, { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Class {
  id: string;
  name: string;
  color: string; // Add color field
}

interface LessonType {
  id: string;
  name: string;
  color: string; // Add color field
}

interface LessonFormProps {
  initialValues?: {
    title: string;
    class_id: string;
    lesson_type: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
  };
  onSuccess?: () => void; // Callback for successful submission
}

const LessonForm = ({ initialValues, onSuccess }: LessonFormProps) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [crecheId, setCrecheId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: initialValues || {
      title: "",
      class_id: "",
      lesson_type: "",
      start_time: "",
      end_time: "",
      day_of_week: "",
    },
  });

  // Fetch the user's creche_id
  const fetchUserCrecheId = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) throw new Error("User not authenticated");

      const { data: userCreche, error: crecheError } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.user.id)
        .single();

      if (crecheError || !userCreche?.creche_id) throw new Error("No creche assigned");

      setCrecheId(userCreche.creche_id);
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

  // Fetch classes related to the user's creche_id
  const fetchClasses = async (crecheId: string) => {
    try {
      const { data: classes, error } = await supabase
        .from("creche_classes")
        .select("id, name, color") // Include color field
        .eq("creche_id", crecheId);

      if (error) throw error;

      setClasses(classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch classes",
      });
    }
  };

  // Fetch lesson types related to the user's creche_id
  const fetchLessonTypes = async (crecheId: string) => {
    try {
      const { data: lessonTypes, error } = await supabase
        .from("lesson_types")
        .select("id, name, color") // Include color field
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

  // Fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      const crecheId = await fetchUserCrecheId();
      if (crecheId) {
        await fetchClasses(crecheId);
        await fetchLessonTypes(crecheId);
      }
    };

    initializeData();
  }, []);

  // Handle form submission
  const onSubmit = async (values) => {
    if (!crecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche assigned to the user.",
      });
      return;
    }

    try {
      // Insert the lesson into the Supabase `lessons` table with the creche_id
      const { error } = await supabase.from("lessons").insert([
        {
          ...values,
          creche_id: crecheId, // Add the creche_id to the lesson data
        },
      ]);

      if (error) throw error;

      // Show success message
      toast({
        title: "Success",
        description: "Lesson saved successfully!",
      });

      // Reset the form
      form.reset();

      // Trigger the onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save lesson. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter lesson title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Class ID Field */}
        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cls.color }} // Display color as a circle
                        />
                        <span>{cls.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lesson Type Field */}
        <FormField
          control={form.control}
          name="lesson_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lessonTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: type.color }} // Display color as a circle
                        />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Time Field */}
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Time Field */}
        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Day of Week Field */}
        <FormField
          control={form.control}
          name="day_of_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit">Save Lesson</Button>
      </form>
    </Form>
  );
};

export default LessonForm;