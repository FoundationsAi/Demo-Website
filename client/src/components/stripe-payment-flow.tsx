import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

type PaymentStage = 'details' | 'processing' | 'confirming' | 'complete';

interface PaymentStageInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'waiting' | 'active' | 'complete' | 'error';
}

interface StripePaymentFlowProps {
  currentStage: PaymentStage;
  onStageComplete?: (stage: PaymentStage) => void;
  error?: string | null;
}

export const StripePaymentFlow: React.FC<StripePaymentFlowProps> = ({
  currentStage,
  onStageComplete,
  error = null,
}) => {
  const [stages, setStages] = useState<Record<PaymentStage, PaymentStageInfo>>({
    details: {
      title: 'Payment Details',
      description: 'Enter your payment information securely',
      icon: <CreditCard className="h-5 w-5" />,
      status: 'waiting',
    },
    processing: {
      title: 'Processing Payment',
      description: 'Securely processing your payment with Stripe',
      icon: <Lock className="h-5 w-5" />,
      status: 'waiting',
    },
    confirming: {
      title: 'Confirming Subscription',
      description: 'Activating your subscription plan',
      icon: <ShieldCheck className="h-5 w-5" />,
      status: 'waiting',
    },
    complete: {
      title: 'Payment Complete',
      description: 'Your subscription has been activated',
      icon: <Check className="h-5 w-5" />,
      status: 'waiting',
    },
  });

  useEffect(() => {
    // Update stage statuses based on current stage
    const updatedStages = { ...stages };
    const stageOrder: PaymentStage[] = ['details', 'processing', 'confirming', 'complete'];
    
    const currentIndex = stageOrder.indexOf(currentStage);
    
    stageOrder.forEach((stage, index) => {
      if (index < currentIndex) {
        updatedStages[stage].status = 'complete';
      } else if (index === currentIndex) {
        updatedStages[stage].status = 'active';
      } else {
        updatedStages[stage].status = 'waiting';
      }
    });
    
    setStages(updatedStages);
  }, [currentStage]);

  const getStageStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#3b5bf5] text-white border-[#3b5bf5]';
      case 'complete':
        return 'bg-green-500 text-white border-green-500';
      case 'error':
        return 'bg-red-500 text-white border-red-500';
      default:
        return 'bg-white text-gray-400 border-gray-200';
    }
  };

  const getConnectorStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-[#3b5bf5]';
      case 'complete':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-200';
    }
  };

  const getTitleStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#3b5bf5] font-medium';
      case 'complete':
        return 'text-green-500 font-medium';
      case 'error':
        return 'text-red-500 font-medium';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full py-3 px-2 bg-white rounded-lg border border-gray-100 shadow-sm">
      <h3 className="text-lg font-medium text-gray-700 px-4 pb-3 border-b border-gray-100 mb-4">
        Payment Progress
      </h3>
      <div className="flex flex-col space-y-0">
        {Object.entries(stages).map(([key, stage], index, array) => (
          <React.Fragment key={key}>
            <div className="flex items-center px-4 py-3 relative">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 ${getStageStyle(stage.status)}`}>
                {stage.status === 'complete' ? <Check className="h-4 w-4" /> : stage.icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className={`text-sm ${getTitleStyle(stage.status)}`}>{stage.title}</h3>
                <p className={`text-xs ${stage.status === 'active' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {stage.description}
                </p>
              </div>
              {stage.status === 'active' && (
                <div className="flex items-center justify-center">
                  <div className="animate-pulse h-2 w-2 rounded-full bg-[#3b5bf5]"></div>
                </div>
              )}
              {stage.status === 'complete' && (
                <Check className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            {index < array.length - 1 && (
              <div className="w-0.5 h-6 border-l-2 absolute ml-4 mt-3 z-0" style={{ marginLeft: '16px', marginTop: `${(index + 1) * 56}px` }}>
                <div className={`h-full ${getConnectorStyle(stage.status)}`}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {error && (
        <div className="mt-4 mx-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};