import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  Phone, 
  FileText, 
  Calendar, 
  Bot, 
  Settings, 
  BarChart, 
  UsersRound, 
  Link2, 
  HelpCircle, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  Bell
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, active, onClick }) => {
  return (
    <Link href={href}>
      <a 
        className={`flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
          active 
            ? 'bg-primary/10 text-primary' 
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        onClick={onClick}
      >
        <div className="mr-3">{icon}</div>
        {label}
      </a>
    </Link>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const closeSidebar = () => setSidebarOpen(false);
  
  // Format user's name for display
  const userDisplayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.email.split('@')[0] || 'User';
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const mainNavItems = [
    { 
      icon: <LayoutDashboard size={18} />, 
      label: 'Overview', 
      href: '/dashboard' 
    },
    { 
      icon: <Users size={18} />, 
      label: 'Leads CRM', 
      href: '/dashboard/leads' 
    },
    { 
      icon: <Phone size={18} />, 
      label: 'Call Center', 
      href: '/dashboard/calls' 
    },
    { 
      icon: <FileText size={18} />, 
      label: 'Knowledge Base', 
      href: '/dashboard/knowledge' 
    },
    { 
      icon: <Calendar size={18} />, 
      label: 'Appointments', 
      href: '/dashboard/appointments' 
    },
    { 
      icon: <Bot size={18} />, 
      label: 'AI Agents', 
      href: '/dashboard/agents' 
    },
  ];

  const adminNavItems = [
    { 
      icon: <Settings size={18} />, 
      label: 'Settings', 
      href: '/dashboard/settings' 
    },
    { 
      icon: <BarChart size={18} />, 
      label: 'Reports', 
      href: '/dashboard/reports' 
    },
    { 
      icon: <UsersRound size={18} />, 
      label: 'Team', 
      href: '/dashboard/team' 
    },
    { 
      icon: <Link2 size={18} />, 
      label: 'Integrations', 
      href: '/dashboard/integrations' 
    },
    { 
      icon: <HelpCircle size={18} />, 
      label: 'Help & Support', 
      href: '/dashboard/support' 
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 z-50 flex items-center justify-between px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-zinc-400"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </Button>
        
        <Link href="/dashboard">
          <a className="text-xl font-bold">Foundations AI</a>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 pt-2 pb-3">
              <p className="text-sm font-medium">{userDisplayName}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <a className="w-full cursor-pointer">Settings</a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Sidebar */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />
      
      <aside 
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          <span className="text-xl font-bold">Foundations AI</span>
          <Button variant="ghost" size="icon" onClick={closeSidebar}>
            <X size={24} />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-8">
            <p className="text-xs uppercase font-semibold text-zinc-500 mb-2 px-4">Main</p>
            <nav className="space-y-1">
              {mainNavItems.map((item, i) => (
                <SidebarItem 
                  key={i} 
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location === item.href}
                  onClick={closeSidebar}
                />
              ))}
            </nav>
          </div>
          
          <div>
            <p className="text-xs uppercase font-semibold text-zinc-500 mb-2 px-4">Admin</p>
            <nav className="space-y-1">
              {adminNavItems.map((item, i) => (
                <SidebarItem 
                  key={i} 
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location === item.href}
                  onClick={closeSidebar}
                />
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Desktop Layout */}
      <div className="flex h-screen lg:overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-zinc-800 bg-zinc-900 h-screen overflow-y-auto">
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <Link href="/dashboard">
              <a className="text-xl font-bold">Foundations AI</a>
            </Link>
          </div>
          
          <div className="p-4">
            <div className="mb-8">
              <p className="text-xs uppercase font-semibold text-zinc-500 mb-2 px-4">Main</p>
              <nav className="space-y-1">
                {mainNavItems.map((item, i) => (
                  <SidebarItem 
                    key={i} 
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                  />
                ))}
              </nav>
            </div>
            
            <div>
              <p className="text-xs uppercase font-semibold text-zinc-500 mb-2 px-4">Admin</p>
              <nav className="space-y-1">
                {adminNavItems.map((item, i) => (
                  <SidebarItem 
                    key={i} 
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Desktop Header */}
          <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900">
            <h1 className="text-xl font-bold">
              {location === '/dashboard' && 'Overview'}
              {location === '/dashboard/leads' && 'Leads CRM'}
              {location === '/dashboard/calls' && 'Call Center'}
              {location === '/dashboard/knowledge' && 'Knowledge Base'}
              {location === '/dashboard/appointments' && 'Appointments'}
              {location === '/dashboard/agents' && 'AI Agents'}
              {location === '/dashboard/settings' && 'Settings'}
              {location === '/dashboard/reports' && 'Reports'}
              {location === '/dashboard/team' && 'Team'}
              {location === '/dashboard/integrations' && 'Integrations'}
              {location === '/dashboard/support' && 'Help & Support'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Bell size={20} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span>{userDisplayName}</span>
                    <ChevronDown size={16} className="text-zinc-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 pt-2 pb-3">
                    <p className="text-sm font-medium">{userDisplayName}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <a className="w-full cursor-pointer">Settings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Content Area */}
          <main className="flex-1 overflow-auto bg-zinc-950 p-6 pt-20 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;