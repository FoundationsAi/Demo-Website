import React from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  PhoneCall, 
  Users, 
  Calendar, 
  FileText, 
  Bot, 
  Settings, 
  BarChartBig, 
  UserCog, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { MountainLogo } from "@/components/mountain-logo";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, currentPath, badge }) => {
  const isActive = currentPath === href || currentPath.startsWith(`${href}/`);
  
  return (
    <Link href={href}>
      <a className={`flex items-center px-3 py-2 rounded-md text-sm group transition-colors ${
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-gray-700 hover:bg-gray-100"
      }`}>
        <span className={`mr-3 ${isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-900"}`}>
          {icon}
        </span>
        <span>{label}</span>
        {badge && (
          <span className="ml-auto bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            {badge}
          </span>
        )}
      </a>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <MountainLogo className="h-8 w-8" />
          <span className="ml-2 font-bold text-xl">Foundations AI</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
            Main
          </h3>
          <nav className="space-y-1">
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              currentPath={location}
            />
            <NavItem
              href="/dashboard/call-center"
              icon={<PhoneCall size={20} />}
              label="Call Center"
              currentPath={location}
            />
            <NavItem
              href="/dashboard/leads"
              icon={<Users size={20} />}
              label="Leads"
              currentPath={location}
              badge="New"
            />
            <NavItem
              href="/dashboard/appointments"
              icon={<Calendar size={20} />}
              label="Appointments"
              currentPath={location}
            />
          </nav>
        </div>
        
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
            Knowledge Base
          </h3>
          <nav className="space-y-1">
            <NavItem
              href="/dashboard/documents"
              icon={<FileText size={20} />}
              label="Documents"
              currentPath={location}
            />
            <NavItem
              href="/dashboard/agents"
              icon={<Bot size={20} />}
              label="AI Agents"
              currentPath={location}
            />
          </nav>
        </div>
        
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
            Admin
          </h3>
          <nav className="space-y-1">
            <NavItem
              href="/dashboard/settings"
              icon={<Settings size={20} />}
              label="Settings"
              currentPath={location}
            />
            <NavItem
              href="/dashboard/reports"
              icon={<BarChartBig size={20} />}
              label="Reports"
              currentPath={location}
            />
            <NavItem
              href="/dashboard/team"
              icon={<UserCog size={20} />}
              label="Team"
              currentPath={location}
            />
          </nav>
        </div>
        
        <div>
          <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
            Support
          </h3>
          <nav className="space-y-1">
            <NavItem
              href="/dashboard/help"
              icon={<HelpCircle size={20} />}
              label="Help & Support"
              currentPath={location}
            />
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;