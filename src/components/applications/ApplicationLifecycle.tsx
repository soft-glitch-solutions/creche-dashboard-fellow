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
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-2 top-2 h-full w-0.5 bg-gray-200" />
        
        {/* Stages */}
        <div className="space-y-6">
          {applicationStageOrder.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = stage === currentStage;
            
            return (
              <div
                key={stage}
                className={`relative flex items-center ${
                  readonly ? 'cursor-default' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (!readonly && onStageChange) {
                    onStageChange(stage);
                  }
                }}
              >
                <div
                  className={`z-10 flex h-4 w-4 items-center justify-center rounded-full border ${
                    isCompleted
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white'
                  } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {isCompleted && <Check className="h-3 w-3" />}
                </div>
                <div className="ml-4 flex min-w-0 flex-1 items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {stage}
                    </p>
                  </div>
                  {isCurrent && (
                    <div className="ml-4">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};