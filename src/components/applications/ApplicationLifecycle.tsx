import { Check, Clock } from "lucide-react";
import { ApplicationLifecycleStage, applicationStageOrder } from "@/types/application";
import { useEffect, useRef, useState } from "react";

interface ApplicationLifecycleProps {
  currentStage: ApplicationLifecycleStage;
  onStageChange?: (stage: ApplicationLifecycleStage) => void;
  readonly?: boolean;
}

export const ApplicationLifecycle = ({
  currentStage,
  onStageChange,
  readonly = false,
}: ApplicationLifecycleProps) => {
  const currentStageIndex = applicationStageOrder.indexOf(currentStage);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [progressWidth, setProgressWidth] = useState(0);

  // Calculate the progress line width based on the current stage
  useEffect(() => {
    if (progressLineRef.current) {
      const totalStages = applicationStageOrder.length;
      const progressPercentage = (currentStageIndex / (totalStages - 1)) * 100;
      setProgressWidth(progressPercentage);
    }
  }, [currentStageIndex]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Application Progress</h3>
      <div className="relative flex items-center justify-between w-full">
        {/* Progress line */}
        <div
          ref={progressLineRef}
          className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200"
        >
          {/* Animated progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Stages */}
        {applicationStageOrder.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = stage === currentStage;

          return (
            <div
              key={stage}
              className={`relative flex flex-col items-center ${
                readonly ? "cursor-default" : "cursor-pointer"
              }`}
              onClick={() => {
                if (!readonly && onStageChange) {
                  onStageChange(stage);
                }
              }}
            >
              {/* Stage Indicator */}
              <div
                className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                  isCompleted
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white"
                } ${
                  isCurrent ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                }`}
              >
                {isCompleted && <Check className="h-4 w-4" />}
              </div>

              {/* Stage Label */}
              <p
                className={`text-sm mt-2 transition-all duration-300 ${
                  isCompleted ? "text-gray-900 font-medium" : "text-gray-500"
                }`}
              >
                {stage}
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