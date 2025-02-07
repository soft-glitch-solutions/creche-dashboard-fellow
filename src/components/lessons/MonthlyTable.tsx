import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  class_id: string;
  lesson_type: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  creche_classes: { name: string; color: string };
  lesson_types: { name: string; color: string };
}

interface MonthlyTableProps {
  date: Date; // Selected date from the calendar
}

const MonthlyTable = ({ date }: MonthlyTableProps) => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Fetch lessons for the selected month
  const fetchLessons = async () => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Months are 0-indexed in JavaScript

      const { data: lessons, error } = await supabase
        .from("lessons")
        .select("*, creche_classes (name, color), lesson_types (name, color)")
        .gte("start_time", `${year}-${month.toString().padStart(2, "0")}-01`) // Start of the month
        .lt("start_time", `${year}-${(month + 1).toString().padStart(2, "0")}-01`); // Start of the next month

      if (error) throw error;

      console.log("Fetched lessons:", lessons); // Debugging: Log fetched data
      setLessons(lessons || []);
    } catch (error) {
      console.error("Error fetching lessons:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch lessons",
      });
    }
  };

  // Fetch lessons when the date changes
  useEffect(() => {
    fetchLessons();
  }, [date]);

  return (
    <div className=" rounded-lg shadow-md p-4">
      <h3 className="text-xl font-semibold mb-4">
        Lessons for {date.toLocaleDateString("default", { month: "long", year: "numeric" })}
      </h3>
      <div className="space-y-4">
        {Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }).map((_, dayIndex) => {
          const day = dayIndex + 1;
          const lessonsForDay = lessons.filter(
            (lesson) => new Date(lesson.start_time).getDate() === day
          );

          return (
            <div key={day} className="border rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-2">Day {day}</h4>
              {lessonsForDay.length > 0 ? (
                lessonsForDay.map((lesson) => {
                  const lessonTypeColor = lesson.lesson_types?.color || "#3b82f6";
                  return (
                    <div
                      key={lesson.id}
                      className="p-3 rounded-lg mb-2"
                    >
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-sm opacity-90">
                        {lesson.creche_classes?.name}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No lessons</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyTable;