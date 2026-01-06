import { Check, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface LifecycleStage {
  id: string;
  stage_name: string;
  display_order: number;
  is_active: boolean;
}

interface ApplicationLifecycleProps {
  currentStage: string;
  crecheId?: string;
  onStageChange?: (stage: string) => void;
  readonly?: boolean;
}

export const ApplicationLifecycle = ({
  currentStage,
  crecheId,
  onStageChange,
  readonly = false,
}: ApplicationLifecycleProps) => {
  const [stages, setStages] = useState<LifecycleStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const fetchStages = async () => {
      if (!crecheId) {
        // Fallback to default stages if no crecheId
        setStages([
          { id: "1", stage_name: "New", display_order: 1, is_active: true },
          { id: "2", stage_name: "Contacted", display_order: 2, is_active: true },
          { id: "3", stage_name: "Documents Pending", display_order: 3, is_active: true },
          { id: "4", stage_name: "Interview Scheduled", display_order: 4, is_active: true },
          { id: "5", stage_name: "Offer Made", display_order: 5, is_active: true },
          { id: "6", stage_name: "Accepted", display_order: 6, is_active: true },
          { id: "7", stage_name: "Rejected", display_order: 7, is_active: true },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("application_lifecycle_stages")
          .select("*")
          .eq("creche_id", crecheId)
          .eq("is_active", true)
          .order("display_order");

        if (error) throw error;

        if (data && data.length > 0) {
          setStages(data);
        } else {
          // Use defaults if no custom stages configured
          setStages([
            { id: "1", stage_name: "New", display_order: 1, is_active: true },
            { id: "2", stage_name: "Contacted", display_order: 2, is_active: true },
            { id: "3", stage_name: "Documents Pending", display_order: 3, is_active: true },
            { id: "4", stage_name: "Interview Scheduled", display_order: 4, is_active: true },
            { id: "5", stage_name: "Offer Made", display_order: 5, is_active: true },
            { id: "6", stage_name: "Accepted", display_order: 6, is_active: true },
            { id: "7", stage_name: "Rejected", display_order: 7, is_active: true },
          ]);
        }
      } catch (error) {
        console.error("Error fetching lifecycle stages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();
  }, [crecheId]);

  const currentStageIndex = stages.findIndex(s => s.stage_name === currentStage);

  // Calculate the progress line width based on the current stage
  useEffect(() => {
    if (progressLineRef.current && stages.length > 0) {
      const totalStages = stages.length;
      const progressPercentage = currentStageIndex >= 0 
        ? (currentStageIndex / (totalStages - 1)) * 100 
        : 0;
      setProgressWidth(progressPercentage);
    }
  }, [currentStageIndex, stages]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-6 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Application Progress</h3>
      <div className="relative flex items-center justify-between w-full">
        {/* Progress line */}
        <div
          ref={progressLineRef}
          className="absolute top-1/2 left-0 w-full h-0.5 bg-muted"
        >
          {/* Animated progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Stages */}
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = stage.stage_name === currentStage;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col items-center ${
                readonly ? "cursor-default" : "cursor-pointer"
              }`}
              onClick={() => {
                if (!readonly && onStageChange) {
                  onStageChange(stage.stage_name);
                }
              }}
            >
              {/* Stage Indicator */}
              <div
                className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background"
                } ${
                  isCurrent ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                }`}
              >
                {isCompleted && <Check className="h-4 w-4" />}
              </div>

              {/* Stage Label */}
              <p
                className={`text-xs mt-2 text-center max-w-[80px] transition-all duration-300 ${
                  isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {stage.stage_name}
              </p>

              {/* Current Stage Icon */}
              {isCurrent && (
                <Clock className="h-4 w-4 text-primary absolute -bottom-5 animate-bounce" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
