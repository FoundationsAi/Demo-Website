import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { FullPageAgent } from '@/components/full-page-agent';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AgentChatPage() {
  const [_, params] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  
  // Parse query parameters to get agent info
  useEffect(() => {
    try {
      // Extract query parameters
      const searchParams = new URLSearchParams(window.location.search);
      const agentId = searchParams.get('agentId');
      const gender = searchParams.get('gender') || 'male';
      const type = searchParams.get('type') || 'default';
      const name = searchParams.get('name');
      
      if (!agentId) {
        setError(true);
        setLoading(false);
        return;
      }
      
      // Get agent names based on gender
      let agentName = name || (gender === 'male' ? 'Steve' : 'Sarah');
      
      // Map agent type to descriptive name
      let agentType = 'Assistant';
      switch (type) {
        case 'sales':
          agentType = 'Sales Rep';
          break;
        case 'customer-service':
          agentType = 'Customer Service';
          break;
        case 'receptionist':
          agentType = 'Receptionist';
          break;
        case 'healthcare':
          agentType = 'Healthcare Advisor';
          break;
        // Add other agent types as needed
      }
      
      // Set agent data
      setAgent({
        id: agentId,
        name: agentName,
        type: agentType,
        gender: gender
      });
      
      // Simulate loading
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error parsing agent data:', error);
      setError(true);
      setLoading(false);
    }
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="text-white mt-4">Connecting to AI Agent...</div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !agent) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="max-w-md p-8 bg-gray-900 rounded-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Agent Not Found</h1>
          <p className="text-gray-300 mb-6">We couldn't find the AI agent you're looking for. Please try again or select a different agent.</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>
    );
  }
  
  // Show agent interface
  return (
    <FullPageAgent
      agentId={agent.id}
      agentName={agent.name}
      agentType={agent.type}
      agentIcon={agent.gender === 'male' ? '👨‍💼' : '👩‍💼'}
    />
  );
}