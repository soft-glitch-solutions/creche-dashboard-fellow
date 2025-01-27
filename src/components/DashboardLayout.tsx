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
  Calendar,
  Sun,
  Moon,
  Languages
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [supportTitle, setSupportTitle] = useState("");
  const [crecheLogo, setCrecheLogo] = useState("/lovable-uploads/8ef99244-a049-43de-a377-a00253510856.png");
  const [supportMessage, setSupportMessage] = useState("");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        fetchUserRole(session.user.id);
        fetchUserCrecheLogo(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('roles(role_name)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(userData?.roles?.role_name || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setUser( {user,
        profile_picture_url: user.user_metadata?.profile_picture_url || null,});
      fetchUserRole(user.id);
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

  const fetchProfilePicture = async (userId) => {
    const { data, error } = await supabase
      .from('users') // or your custom table name
      .select('profile_picture_url')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  
    return data?.profile_picture_url;
  };


  const fetchUserCrecheLogo = async (userId: string) => {
    try {
      const { data: userCrecheData, error: userCrecheError } = await supabase
        .from('user_creche')
        .select('creche_id')
        .eq('user_id', userId)
        .single();
  
      if (userCrecheError) throw userCrecheError;
      if (!userCrecheData?.creche_id) {
        console.error('User is not assigned to a creche');
        return;
      }
  
      const { data: crecheData, error: crecheError } = await supabase
        .from('creches')
        .select('logo')
        .eq('id', userCrecheData.creche_id)
        .single();
  
      if (crecheError) throw crecheError;
  
      setCrecheLogo(crecheData?.logo || "/default-logo.png");
  
    } catch (error) {
      console.error('Error fetching creche logo:', error);
    }
  };
  

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

  const isAdmin = userRole === 'Administrator' || userRole === 'Developer';

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "/images/icons/dashboard.png", bgColor: "#F684A3" },
    { label: "Applications", path: "/dashboard/applications", icon: "/images/icons/applications.png", bgColor: "#84A7F6" },
    { label: "Students", path: "/dashboard/students", icon: "/images/icons/students.png", bgColor: "#BD84F6" },
    { label: "Finance", path: "/dashboard/finance", icon: "/images/icons/finance.png", bgColor: "#9CDBC8" },
    { label: "Calendar", path: "/dashboard/calendar", icon: "/images/icons/calendar.png", bgColor: "#84A7F6" },
    { label: "Social", path: "/dashboard/social", icon: "/images/icons/social.png", bgColor: "#F7CD85" },
    { label: "Reports", path: "/dashboard/reports", icon: "/images/icons/reports.png", bgColor: "#F684A3" },
    { label: "Settings", path: "/dashboard/settings", icon: "/images/icons/settings.png", bgColor: "#BD84F6" },
    { label: "Help Centre", path: "/dashboard/help", icon: "/images/icons/help.png", bgColor: "#F7CD85" },
  ];

  const adminItems = [
    { icon: Users, label: "User Management", path: "/dashboard/admin/users" },
    { icon: Building2, label: "Creche Management", path: "/dashboard/admin/creches" },
    { icon: Network, label: "Integrations", path: "/dashboard/admin/integrations" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <div
          className={cn(
            "transition-all duration-300",
            isSidebarOpen ? "text-xl" : ""
          )}
        >
          <img
            src={crecheLogo}
            alt="Creche Logo"
            className={cn(
              "transition-all duration-300",
              isSidebarOpen ? "h-12 w-auto" : ""
            )}
          />
        </div>
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
          <div
            className="h-8 w-8 flex items-center justify-center rounded-md"
            style={{
              backgroundColor: item.bgColor,
            }}
          >
            <div
              className="h-6 w-6 bg-cover bg-center"
              style={{
                backgroundImage: `url(${item.icon})`,
              }}
            />
          </div>
          {isSidebarOpen && <span className="text-black">{item.label}</span>}
        </Button>
      ))}
    </nav>

      {isAdmin && (
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
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 md:px-8 flex items-center justify-end gap-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[
                { code: "en", label: "English" },
                { code: "af", label: "Afrikaans" },
                { code: "xh", label: "Xhosa" },
              ].map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as "en" | "af" | "xh")}
                  className={cn(
                    "cursor-pointer",
                    language === lang.code && "bg-accent"
                  )}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-200"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
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
              src={user?.profile_picture_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"}
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
