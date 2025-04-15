import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { 
  BarChart3, 
  Users, 
  Phone, 
  FileText, 
  Calendar, 
  Bot, 
  ArrowRight, 
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Dashboard overview page
const Dashboard = () => {
  const { user } = useAuth();
  
  // Get dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/overview'],
    queryFn: async () => {
      return await apiRequest('/api/dashboard/overview');
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
              <CardDescription>
                Failed to load dashboard data. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // For the demo, we'll use sample data when real data is not available
  const overviewData = data || {
    counts: {
      leads: 0,
      appointments: 0,
      calls: 0,
      knowledgeDocuments: 0,
      customAgents: 0,
      activeAgents: 0
    },
    totalCallDuration: 0,
    upcomingAppointments: [],
    subscription: {
      status: 'inactive',
      planType: 'none',
      currentPeriodEnd: new Date().toISOString()
    }
  };

  // Format subscription info
  const subscriptionStatus = overviewData.subscription?.status || 'inactive';
  const planType = overviewData.subscription?.planType || 'none';
  const expiryDate = overviewData.subscription?.currentPeriodEnd 
    ? new Date(overviewData.subscription.currentPeriodEnd).toLocaleDateString() 
    : 'N/A';

  // Format time from seconds to hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome and subscription status */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome back, {user?.firstName || 'User'}!
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Here's what's happening with your AI agents today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <Button size="sm" asChild>
                  <Link href="/dashboard/agents">
                    <Bot className="mr-2 h-4 w-4" />
                    Manage AI Agents
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard/calls">
                    <Phone className="mr-2 h-4 w-4" />
                    View Call History
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border-zinc-800 ${
            subscriptionStatus === 'active' 
              ? 'bg-green-950/20' 
              : subscriptionStatus === 'past_due'
                ? 'bg-yellow-950/20'
                : 'bg-zinc-900'
          }`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Subscription</span>
                {subscriptionStatus === 'active' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {subscriptionStatus === 'past_due' && (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription>
                Current plan: <span className="font-semibold capitalize">{planType}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-zinc-400">
                  Status: <span className="capitalize">{subscriptionStatus}</span>
                </div>
                {subscriptionStatus === 'active' && (
                  <div className="text-sm text-zinc-400">
                    Renews: {expiryDate}
                  </div>
                )}
                <Button 
                  size="sm" 
                  variant={subscriptionStatus === 'active' ? "outline" : "default"}
                  className="w-full mt-2"
                  asChild
                >
                  <Link href="/dashboard/settings#subscription">
                    {subscriptionStatus === 'active' 
                      ? 'Manage Subscription' 
                      : 'Upgrade Plan'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Stats overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                Lead Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {overviewData.counts.leads}
              </div>
              <div className="text-sm text-zinc-400 mb-4">
                Total leads in your CRM
              </div>
              <Button variant="link" size="sm" className="px-0" asChild>
                <Link href="/dashboard/leads">
                  View leads
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {overviewData.counts.appointments}
              </div>
              <div className="text-sm text-zinc-400 mb-4">
                Total scheduled appointments
              </div>
              <Button variant="link" size="sm" className="px-0" asChild>
                <Link href="/dashboard/appointments">
                  Manage appointments
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium flex items-center">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                Call Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {formatDuration(overviewData.totalCallDuration)}
              </div>
              <div className="text-sm text-zinc-400 mb-4">
                Total call duration
              </div>
              <Button variant="link" size="sm" className="px-0" asChild>
                <Link href="/dashboard/calls">
                  View call center
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
        
        {/* AI Agents Overview */}
        <section>
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-primary" />
                AI Agent Status
              </CardTitle>
              <CardDescription>
                Overview of your active AI agents and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Active Agents</div>
                    <div className="text-2xl font-bold">
                      {overviewData.counts.activeAgents} / {overviewData.counts.customAgents}
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-1/2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span>{overviewData.counts.activeAgents === 0 
                        ? '0%' 
                        : `${Math.round((overviewData.counts.activeAgents / Math.max(overviewData.counts.customAgents, 1)) * 100)}%`}
                      </span>
                    </div>
                    <Progress 
                      value={overviewData.counts.customAgents === 0 
                        ? 0 
                        : (overviewData.counts.activeAgents / overviewData.counts.customAgents) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href="/dashboard/agents">
                      Manage AI Agents
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Upcoming appointments and documents */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overviewData.upcomingAppointments && overviewData.upcomingAppointments.length > 0 ? (
                  overviewData.upcomingAppointments.map((appointment: any, index: number) => (
                    <div key={index} className="flex justify-between items-start border-b border-zinc-800 pb-3">
                      <div>
                        <div className="font-medium">{appointment.title}</div>
                        <div className="text-sm text-zinc-400">
                          {new Date(appointment.startTime).toLocaleDateString()} at {' '}
                          {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500">
                    No upcoming appointments
                  </div>
                )}
                
                <Button variant="link" size="sm" className="px-0" asChild>
                  <Link href="/dashboard/appointments">
                    View all appointments
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="text-lg font-bold">{overviewData.counts.knowledgeDocuments}</div>
                    <div className="text-sm text-zinc-400">Total Documents</div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="text-lg font-bold">
                      <TrendingUp className="inline h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-sm text-zinc-400">Knowledge Growth</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/knowledge">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload New Document
                  </Link>
                </Button>
                
                <Button variant="link" size="sm" className="px-0" asChild>
                  <Link href="/dashboard/knowledge">
                    Manage knowledge base
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;