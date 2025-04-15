import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, User, Calendar, FileText, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const DashboardPage = () => {
  const [userName, setUserName] = useState("User");
  const [subscriptionPlan, setSubscriptionPlan] = useState("");

  // Get user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserName(data.user.fullName || data.user.username);
          setSubscriptionPlan(data.user.subscriptionPlan || "");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch stats data
  const { data: statsData } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      try {
        // In a real implementation, we would fetch this from the API
        // For now, we'll use placeholder data
        return {
          activeCalls: 0,
          totalLeads: 0,
          upcomingAppointments: 0,
          documents: 0
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
          activeCalls: 0,
          totalLeads: 0,
          upcomingAppointments: 0,
          documents: 0
        };
      }
    }
  });

  const stats = statsData || {
    activeCalls: 0,
    totalLeads: 0,
    upcomingAppointments: 0,
    documents: 0
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}</h1>
        <p className="text-gray-600">
          {subscriptionPlan && (
            <>
              You're currently on the <span className="font-medium capitalize">{subscriptionPlan}</span> plan.{" "}
              <Link href="/subscriptions/plans" className="text-primary hover:underline">
                Upgrade
              </Link>
            </>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PhoneCall className="w-6 h-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{stats.activeCalls}</div>
            </div>
            <Link href="/dashboard/call-center">
              <a className="text-sm text-primary hover:underline mt-2 inline-block">
                View call center
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="w-6 h-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </div>
            <Link href="/dashboard/leads">
              <a className="text-sm text-primary hover:underline mt-2 inline-block">
                Manage leads
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            </div>
            <Link href="/dashboard/appointments">
              <a className="text-sm text-primary hover:underline mt-2 inline-block">
                View schedule
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Knowledge Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-primary mr-2" />
              <div className="text-2xl font-bold">{stats.documents}</div>
            </div>
            <Link href="/dashboard/documents">
              <a className="text-sm text-primary hover:underline mt-2 inline-block">
                Manage documents
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <Link href="/dashboard/call-center">
              <PhoneCall className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Start a Call</div>
                <div className="text-sm text-gray-500">Use AI voice agent to make calls</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <Link href="/dashboard/leads/new">
              <User className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Add New Lead</div>
                <div className="text-sm text-gray-500">Create a new lead in the system</div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <Link href="/dashboard/documents/upload">
              <FileText className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Upload Document</div>
                <div className="text-sm text-gray-500">Add to your knowledge base</div>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity and Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Welcome to Foundations AI</p>
                  <p className="text-sm text-gray-500">Your account was created successfully</p>
                  <p className="text-xs text-gray-400 mt-1">Just now</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Tips to make the most of Foundations AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <TrendingUp className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Complete Your Profile</p>
                  <p className="text-sm text-gray-500">Update your company information and preferences</p>
                  <Button size="sm" variant="outline" className="mt-2" asChild>
                    <Link href="/dashboard/settings">
                      Go to Settings
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-start">
                <TrendingUp className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium">Create Your First AI Agent</p>
                  <p className="text-sm text-gray-500">Set up an AI voice agent for your business needs</p>
                  <Button size="sm" variant="outline" className="mt-2" asChild>
                    <Link href="/dashboard/agents/new">
                      Create Agent
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;