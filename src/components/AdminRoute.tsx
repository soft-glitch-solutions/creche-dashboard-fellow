import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AccessDenied } from "./AccessDenied";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('roles(role_name)')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const isAdminUser = userData?.roles?.role_name === 'Administrator' || 
                         userData?.roles?.role_name === 'Developer';
      
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return location.pathname.startsWith('/dashboard/admin') ? 
      <AccessDenied /> : 
      <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};