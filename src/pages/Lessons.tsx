import React, { useState, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { CalendarDays, Plus, Printer, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Lesson, LessonType } from "@/types/lesson";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

const Lessons = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [date, setDate] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const weeklyTableRef = useRef<HTMLDivElement>(null);
  const monthlyTableRef = useRef<HTMLDivElement>(null);

  const handlePrintWeekly = useReactToPrint({
    documentTitle: "Weekly Schedule",
    onBeforeGetContent: () => {
      if (!weeklyTableRef.current) return null;
      return weeklyTableRef.current;
    }
  });

  const handlePrintMonthly = useReactToPrint({
    documentTitle: "Monthly Schedule",
    onBeforeGetContent: () => {
      if (!monthlyTableRef.current) return null;
      return monthlyTableRef.current;
    }
  });

  const form = useForm({
    defaultValues: {
      title: "",
      class_id: "",
      lesson_type: "",
      start_time: "",
      end_time: "",
      day_of_week: "",
    },
  });

  const editForm = useForm({
    defaultValues: {
      title: "",
      class_id: "",
      lesson_type: "",
      start_time: "",
      end_time: "",
      day_of_week: "",
    },
  });

  const typeForm = useForm({
    defaultValues: {
      name: "",
      color: "#3b82f6",
    },
  });

  // Fetch user's creche
  const { data: userCreche } = useQuery({
    queryKey: ["user-creche"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_creche")
        .select("creche_id")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      if (!userCreche?.creche_id) return [];

      const { data, error } = await supabase
        .from("creche_classes")
        .select("*")
        .eq('creche_id', userCreche.creche_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userCreche?.creche_id,
  });

  // Fetch lesson types
  const { data: lessonTypes } = useQuery({
    queryKey: ["lesson-types"],
    queryFn: async () => {
      if (!userCreche?.creche_id) return [];

      const { data, error } = await supabase
        .from("lesson_types")
        .select("*")
        .eq('creche_id', userCreche.creche_id);
      
      if (error) throw error;
      return data as LessonType[];
    },
    enabled: !!userCreche?.creche_id,
  });

  // Fetch lessons
  const { data: lessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, creche_classes (id, name, color), lesson_types (id, name, color)")
        .eq('active', true);
      if (error) throw error;
      return data;
    },
  });

  const queryClient = useQueryClient();

  // Create lesson mutation
  const createLesson = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("lessons")
        .insert([{ ...values, active: true }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      setIsCreateOpen(false);
      toast.success("Lesson created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create lesson");
      console.error("Error creating lesson:", error);
    },
  });

  // Update lesson mutation
  const updateLesson = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("lessons")
        .update(values)
        .eq('id', editingLesson?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      setEditingLesson(null);
      toast.success("Lesson updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update lesson");
      console.error("Error updating lesson:", error);
    },
  });

  // Create lesson type mutation
  const createLessonType = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("lesson_types")
        .insert([{ ...values, creche_id: userCreche?.creche_id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
      setIsTypeOpen(false);
      toast.success("Lesson type created successfully");
      typeForm.reset();
    },
    onError: (error) => {
      toast.error("Failed to create lesson type");
      console.error("Error creating lesson type:", error);
    },
  });

  // Delete lesson type mutation
  const deleteLessonType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lesson_types")
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
      toast.success("Lesson type deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete lesson type");
      console.error("Error deleting lesson type:", error);
    },
  });

  const onSubmit = (values: any) => {
    createLesson.mutate(values);
  };

  const onSubmitEdit = (values: any) => {
    updateLesson.mutate(values);
  };

  const onSubmitType = (values: any) => {
    createLessonType.mutate(values);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    editForm.reset(lesson);
  };

  const handleDeleteLessonType = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this lesson type?");
    if (confirmed) {
      deleteLessonType.mutate(id);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Lessons</h1>
        <div className="space-x-4">
          <Dialog open={isTypeOpen} onOpenChange={setIsTypeOpen}>
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
              <div className="space-y-6">
                <Form {...typeForm}>
                  <form onSubmit={typeForm.handleSubmit(onSubmitType)} className="space-y-4">
                    <FormField
                      control={typeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={typeForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Create Lesson Type</Button>
                  </form>
                </Form>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Existing Lesson Types</h3>
                  <div className="grid gap-4">
                    {lessonTypes?.map((type) => (
                      <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: type.color }}
                          />
                          <span>{type.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLessonType(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Lesson</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            {classes?.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            {lessonTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
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
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Create Lesson</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="week" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="week" onClick={() => setView("week")}>
              Week View
            </TabsTrigger>
            <TabsTrigger value="month" onClick={() => setView("month")}>
              Month View
            </TabsTrigger>
          </TabsList>
          <Button 
            onClick={view === "week" ? handlePrintWeekly : handlePrintMonthly}
            variant="outline"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print {view === "week" ? "Weekly" : "Monthly"} Schedule
          </Button>
        </div>

        <TabsContent value="week">
          <div className="border rounded-lg overflow-x-auto" ref={weeklyTableRef}>
            <div className="p-4 border-b bg-primary/5">
              <h2 className="text-xl font-semibold">Weekly Schedule</h2>
              <p className="text-sm text-muted-foreground">
                Week of {format(date, 'MMMM d, yyyy')}
              </p>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3">Time</th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="border p-3">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="border p-3 font-medium">{time}</td>
                    {daysOfWeek.map((day) => (
                      <td key={`${day}-${time}`} className="border p-3">
                        {lessons?.filter(
                          (lesson) =>
                            lesson.day_of_week === day &&
                            lesson.start_time === time
                        ).map((lesson) => {
                          const lessonType = lessonTypes?.find(
                            (type) => type.id === lesson.lesson_type
                          );
                          return (
                            <div
                              key={lesson.id}
                              className="p-2 rounded text-sm text-white relative group"
                              style={{
                                backgroundColor: lessonType?.color || "#3b82f6",
                              }}
                            >
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-xs opacity-90">
                                {lesson.creche_classes?.name}
                              </div>
                              <button
                                onClick={() => handleEditLesson(lesson)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          );
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="month">
          <div ref={monthlyTableRef}>
            <div className="p-4 border-b bg-primary/5 mb-4">
              <h2 className="text-xl font-semibold">Monthly Schedule</h2>
              <p className="text-sm text-muted-foreground">
                {format(date, 'MMMM yyyy')}
              </p>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                        {classes?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                        {lessonTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                <FormField
                  control={editForm.control}
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
              </div>
              <FormField
                control={editForm.control}
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
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Lesson</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lessons;
