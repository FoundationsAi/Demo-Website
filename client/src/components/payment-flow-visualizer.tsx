import React from "react";
import { cn } from "@/lib/utils";

export type PaymentStep = "plan-selection" | "payment-info" | "processing" | "confirmation";

interface PaymentFlowVisualizerProps {
  currentStep: PaymentStep;
  className?: string;
}

const steps: { id: PaymentStep; label: string }[] = [
  { id: "plan-selection", label: "Plan Selection" },
  { id: "payment-info", label: "Payment Info" },
  { id: "processing", label: "Processing" },
  { id: "confirmation", label: "Confirmation" },
];

export function PaymentFlowVisualizer({ currentStep, className }: PaymentFlowVisualizerProps) {
  // Calculate which steps are completed
  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep);
  };

  return (
    <div className={cn("w-full flex flex-col space-y-2", className)}>
      <div className="flex justify-between items-center w-full">
        {steps.map((step, index) => {
          const stepIndex = getCurrentStepIndex();
          const isActive = step.id === currentStep;
          const isCompleted = index < stepIndex;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-[#3b5bf5] text-white"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-1",
                    isActive ? "text-[#3b5bf5] font-medium" : "text-slate-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div 
                  className={cn(
                    "flex-1 h-[2px] mx-2", 
                    isCompleted ? "bg-green-500" : "bg-slate-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}