import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import WeekView from "../components/lessons/WeekView";
import MonthView from "../components/lessons/MonthView";
import CreateLessonDialog from "../components/lessons/CreateLessonDialog";
import ManageLessonTypesDialog from "../components/lessons/ManageLessonTypesDialog";

const Lessons = () => {
  const [view, setView] = useState<"week" | "month">("week");

  const handlePrint = () => {
    // Handle print logic here
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
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print {view === "week" ? "Weekly" : "Monthly"} Schedule
          </Button>
        </div>

        <TabsContent value="week">
          <WeekView />
        </TabsContent>

        <TabsContent value="month">
          <MonthView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Lessons;