
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  Plus,
  ExternalLink,
  Search,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportDialog } from "@/components/dashboard/SupportDialog";
import { useToast } from "@/hooks/use-toast";

type SupportTicketStatus = "open" | "in_progress" | "on_hold" | "resolved" | "closed";

interface SupportTicket {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  status: SupportTicketStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  creche_id: string | null;
  converted_at: string | null;
  converted_ticket_id: string | null;
}

const getStatusColor = (status: SupportTicketStatus) => {
  switch (status) {
    case "open":
      return "bg-blue-500";
    case "in_progress":
      return "bg-yellow-500";
    case "on_hold":
      return "bg-purple-500";
    case "resolved":
      return "bg-green-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-blue-500";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
};

const SupportChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isCreateSupportOpen, setIsCreateSupportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["supportRequests", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUserData();
  }, []);

  useEffect(() => {
    if (data) {
      setTickets(data);
    }
  }, [data]);

  const handleSupportSuccess = () => {
    refetch();
    toast({ title: "Support Request Created", description: "Your support request has been created successfully" });
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStatusLabel = (status: SupportTicketStatus) => {
    const statusMap: Record<SupportTicketStatus, string> = {
      open: "Open",
      in_progress: "In Progress",
      on_hold: "On Hold",
      resolved: "Resolved",
      closed: "Closed"
    };
    
    return statusMap[status] || status;
  };

  const renderTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return format(date, "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading support requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <p className="text-red-500">Error loading support requests</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Requests</h1>
          <p className="text-muted-foreground">
            View and manage your support tickets
          </p>
        </div>
        <SupportDialog
          isOpen={isCreateSupportOpen}
          onOpenChange={setIsCreateSupportOpen}
          onSuccess={handleSupportSuccess}
        />
        <Button onClick={() => setIsCreateSupportOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Support Request
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search support requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id}
              className="cursor-pointer hover:border-primary transition-all"
              onClick={() => navigate(`/dashboard/help/support-request/${ticket.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">{ticket.title}</CardTitle>
                  <CardDescription className="flex gap-2 mt-1">
                    <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                      {renderStatusLabel(ticket.status)}
                    </Badge>
                    <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.message}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{ticket.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{renderTimeAgo(ticket.updated_at)}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">No Support Requests</CardTitle>
              <CardDescription>
                You haven't created any support requests yet
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <LifeBuoy className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setIsCreateSupportOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Support Request
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportChat;
