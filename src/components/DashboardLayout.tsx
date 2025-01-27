import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./dashboard/SidebarContent";
import { TopNav } from "./dashboard/TopNav";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [crecheLogo, setCrecheLogo] = useState("/lovable-uploads/8ef99244-a049-43de-a377-a00253510856.png");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setUser({
        ...user,
        profile_picture_url: user.user_metadata?.profile_picture_url || null,
      });
      fetchUserRole(user.id);
    }
  };

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

  const isAdmin = userRole === 'Administrator' || userRole === 'Developer';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 hidden md:flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isAdmin={isAdmin}
          isAdminOpen={isAdminOpen}
          setIsAdminOpen={setIsAdminOpen}
          crecheLogo={crecheLogo}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            isSidebarOpen={true}
            setIsSidebarOpen={() => {}}
            isAdmin={isAdmin}
            isAdminOpen={isAdminOpen}
            setIsAdminOpen={setIsAdminOpen}
            crecheLogo={crecheLogo}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1">
        <TopNav user={user} />
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;