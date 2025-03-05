
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportDialog } from "@/components/dashboard/SupportDialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  title: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
  priority: string;
  user_id: string;
}

const SupportChat = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const fetchSupportTickets = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view support tickets",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: tickets, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(tickets || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Support Tickets</h1>
        <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Support Request
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p className="mb-4 text-muted-foreground">You haven't submitted any support requests yet.</p>
            <Button onClick={() => setShowDialog(true)}>Create Your First Request</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{ticket.title}</CardTitle>
                    <CardDescription>Created on {formatDate(ticket.created_at)}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityBadgeColor(ticket.priority)}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                    </Badge>
                    <Badge className={getStatusBadgeColor(ticket.status)}>
                      {ticket.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Category: </span>
                  <span className="text-sm">{ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</span>
                </div>
                <p className="whitespace-pre-wrap">{ticket.message}</p>
              </CardContent>
              {ticket.updated_at !== ticket.created_at && (
                <CardFooter className="pt-0 text-xs text-muted-foreground">
                  Last updated: {formatDate(ticket.updated_at)}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {showDialog && <SupportDialog isOpen={showDialog} onOpenChange={setShowDialog} onSuccess={fetchSupportTickets} />}
    </div>
  );
};

export default SupportChat;
