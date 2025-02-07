import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Set up the localizer for moment.js
const localizer = momentLocalizer(moment);

const MonthView = () => {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [lessons, setLessons] = useState<any[]>([]);

  // Fetch lessons from the database
  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, creche_classes (id, name, color)") // Fetch class details
        .eq("active", true);

      if (error) throw error;

      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch lessons",
      });
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Map lessons to events for the calendar
  const events = lessons.map((lesson) => {
    return {
      title: lesson.title,
      start: new Date(lesson.start_time), // Assuming start_time is in a suitable format
      end: new Date(lesson.end_time), // Assuming end_time is in a suitable format
      resource: {
        class: lesson.creche_classes?.name,
        type: lesson.lesson_type,
      },
    };
  });

  // Custom event component
  const EventComponent = ({ event }: { event: any }) => (
    <div className="p-1 bg-blue-100 border-l-4 border-blue-500 rounded">
      <strong>{event.title}</strong>
      <div className="text-sm text-gray-600">{event.resource.class}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Monthly Schedule</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={["month"]}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          style={{ height: 600 }} // Set calendar height
          components={{
            event: EventComponent, // Use custom event component
          }}
        />
      </div>
    </div>
  );
};

export default MonthView;
