import { Check, Clock } from "lucide-react";
import { ApplicationLifecycleStage, applicationStageOrder } from "@/types/application";

interface ApplicationLifecycleProps {
  currentStage: ApplicationLifecycleStage;
  onStageChange?: (stage: ApplicationLifecycleStage) => void;
  readonly?: boolean;
}

export const ApplicationLifecycle = ({ 
  currentStage, 
  onStageChange,
  readonly = false 
}: ApplicationLifecycleProps) => {
  const currentStageIndex = applicationStageOrder.indexOf(currentStage);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Application Progress</h3>
      <div className="relative flex items-center justify-between w-full">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 " />

        {/* Stages */}
        {applicationStageOrder.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = stage === currentStage;

          return (
            <div
              key={stage}
              className={`relative flex flex-col items-center ${
                readonly ? 'cursor-default' : 'cursor-pointer'
              }`}
              onClick={() => {
                if (!readonly && onStageChange) {
                  onStageChange(stage);
                }
              }}
            >
              {/* Stage Indicator */}
              <div
                className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border ${
                  isCompleted
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 '
                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                {isCompleted && <Check className="h-4 w-4" />}
              </div>
              {/* Stage Label */}
              <p className={`text-sm mt-2 ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                {stage}
              </p>
              {/* Current Stage Icon */}
              {isCurrent && (
                <Clock className="h-4 w-4 text-primary absolute -bottom-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
