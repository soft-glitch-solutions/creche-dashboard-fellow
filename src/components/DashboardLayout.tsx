import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  FileInput,
  Building2,
  Lock,
  Network,
  User,
  Image,
  Bell,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [supportTitle, setSupportTitle] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status when component mounts
    checkUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setUser(user);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const notifications = [
    {
      id: 1,
      title: "New Application",
      message: "You have received a new application",
      time: "5 minutes ago"
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Payment successfully processed",
      time: "1 hour ago"
    }
  ];

  const handleSupportSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a support request",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('support_requests')
        .insert([
          {
            user_id: user.id,
            title: supportTitle,
            category: 'General',
            message: supportMessage,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your support request has been submitted",
      });

      setSupportTitle("");
      setSupportMessage("");
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Error",
        description: "Failed to submit support request",
        variant: "destructive"
      });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileInput, label: "Applications", path: "/dashboard/applications" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: DollarSign, label: "Finance", path: "/dashboard/finance" },
    { icon: FileText, label: "Reports", path: "/dashboard/reports" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    { icon: HelpCircle, label: "Help Centre", path: "/dashboard/help" },
  ];

  const adminItems = [
    { icon: Users, label: "User Management", path: "/dashboard/admin/users" },
    { icon: Building2, label: "Creche Management", path: "/dashboard/admin/creches" },
    { icon: Network, label: "Integrations", path: "/dashboard/admin/integrations" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <h2
          className={cn(
            "font-bold text-primary transition-all duration-300",
            isSidebarOpen ? "text-xl" : "text-xs"
          )}
        >
          {isSidebarOpen ? "Creche Spots" : "CS"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <nav className="mt-8 flex-1">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-4 mb-2",
              !isSidebarOpen && "justify-center px-2"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            {isSidebarOpen && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="mt-auto mb-4">
        <Collapsible
          open={isAdminOpen}
          onOpenChange={setIsAdminOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4",
                !isSidebarOpen && "justify-center px-2"
              )}
            >
              <Lock className="h-5 w-5" />
              {isSidebarOpen && <span>Admin</span>}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {adminItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 pl-8",
                  !isSidebarOpen && "justify-center px-2"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 hidden md:flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1">
        {/* Top navigation bar */}
        <div className="bg-white border-b border-gray-200 h-16 px-4 md:px-8 flex items-center justify-end gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-sm text-gray-500">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Support Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <LifeBuoy className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Submit Support Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={supportTitle}
                    onChange={(e) => setSupportTitle(e.target.value)}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Detailed explanation of your issue"
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={handleSupportSubmit} className="w-full">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile/picture")}>
                <Image className="mr-2 h-4 w-4" />
                <span>Change Profile Picture</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
