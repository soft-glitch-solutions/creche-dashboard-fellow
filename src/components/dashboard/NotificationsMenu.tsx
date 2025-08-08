import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DBNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read_at).length, [notifications]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await fetchNotifications(user.id);
      subscribeRealtime(user.id);
    };
    init();
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchNotifications = async (uid: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id,title,message,created_at,read_at")
      .eq("user_id", uid)
      .eq("deleted", false)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setLoading(false);
  };

  const subscribeRealtime = (uid: string) => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          const row = payload.new as DBNotification & { user_id: string };
          if (row && (row as any).user_id === uid) {
            setNotifications(prev => [row, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    await fetchNotifications(userId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={loading || unreadCount === 0}>
              Mark all read
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-2 rounded-md transition-colors border" style={{ opacity: n.read_at ? 0.7 : 1 }}>
                  <div className="font-medium text-sm">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};