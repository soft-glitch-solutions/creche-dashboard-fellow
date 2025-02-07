import React, { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import WeekView from "../components/lessons/WeekView";
import MonthView from "../components/lessons/MonthView";
import CreateLessonDialog from "../components/lessons/CreateLessonDialog";
import ManageLessonTypesDialog from "../components/lessons/ManageLessonTypesDialog";
import { supabase } from "@/integrations/supabase/client";

const Lessons = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [userCreche, setUserCreche] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]); // Fetch the weekly lessons
  const weeklyTableRef = useRef<HTMLDivElement>(null);
  const monthlyTableRef = useRef<HTMLDivElement>(null);

  // Fetch user's creche details
  useEffect(() => {
    const fetchUserCreche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: crecheData } = await supabase
          .from("user_creche")
          .select("creche_id")
          .eq("user_id", user.id)
          .single();
        
        if (crecheData) {
          const { data: crecheDetails } = await supabase
            .from("creches")
            .select("name, logo")
            .eq("id", crecheData.creche_id)
            .single();
          
          setUserCreche(crecheDetails); // Save creche name and logo
        }
      }
    };

    fetchUserCreche();
  }, []);

  // Fetch weekly lessons
  useEffect(() => {
    const fetchLessons = async () => {
      if (!userCreche) return;
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("creche_id", userCreche.id)
        .eq("week", "current-week"); // Assuming this is how you query the weekly lessons

      setLessons(lessonsData || []);
    };

    fetchLessons();
  }, [userCreche]);

  // Handle printing weekly lesson schedule
  const handlePrintWeekly = () => {
    if (!weeklyTableRef.current || !userCreche) return;
    
    const printWindow = window.open("", "_blank");
    const content = `
      <html>
        <head>
          <title>Weekly Lesson Schedule</title>
        </head>
        <body>
          <div style="text-align: center;">
            <img src="${userCreche.logo}" alt="Creche Logo" style="max-width: 100px;" />
            <h1>${userCreche.name}</h1>
            <h2>Weekly Lesson Schedule</h2>
          </div>
          <div>${weeklyTableRef.current.innerHTML}</div>
        </body>
      </html>
    `;

    printWindow?.document.write(content);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Lessons</h1>
        <div className="space-x-4">
          <ManageLessonTypesDialog />
          <CreateLessonDialog />
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
          <Button onClick={handlePrintWeekly} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Weekly Schedule
          </Button>
        </div>

        <TabsContent value="week">
          <div ref={weeklyTableRef}>
            <WeekView lessons={lessons} />
          </div>
        </TabsContent>

        <TabsContent value="month">
          <MonthView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Lessons;
