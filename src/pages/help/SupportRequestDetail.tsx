
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  MessageCircle,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
}

interface SupportComment {
  id: string;
  ticket_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

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

const SupportRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setUserProfile(data);
      }
    };
    getUserProfile();
  }, []);

  const { data: ticket, isLoading: isTicketLoading } = useQuery({
    queryKey: ["supportTicket", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .eq("id", id!)
        .single();
      
      if (error) throw error;
      return data as SupportTicket;
    },
  });

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["supportComments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_comments")
        .select(`
          *,
          user:user_id (
            id, email, first_name, last_name
          )
        `)
        .eq("ticket_id", id!)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as SupportComment[];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("support_comments")
        .insert([
          {
            ticket_id: id,
            user_id: user.id,
            comment: newComment,
          },
        ])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been added to the support request",
      });
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["supportComments", id] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: SupportTicketStatus) => {
      const updateData: any = {
        status: newStatus,
      };
      
      // If the status is resolved, add resolved_at timestamp
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("support_requests")
        .update(updateData)
        .eq("id", id!)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The support request status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["supportTicket", id] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update status: ${error.message}`,
      });
    }
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment cannot be empty",
      });
      return;
    }
    
    addCommentMutation.mutate();
  };

  const handleUpdateStatus = (newStatus: SupportTicketStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  if (isTicketLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading support request details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold">Support request not found</p>
        <Button 
          variant="link" 
          onClick={() => navigate("/dashboard/help/support-chat")}
          className="mt-4"
        >
          Back to support requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/help/support-chat")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to support requests
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge 
                  className={`${getPriorityColor(ticket.priority)} text-white`}
                >
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                </Badge>
                <Badge 
                  className={`${getStatusColor(ticket.status)} text-white`}
                >
                  {ticket.status.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(ticket.created_at), "MMM dd, yyyy")}
                </span>
              </CardDescription>
            </div>
            <div>
              <Select
                value={ticket.status}
                onValueChange={(value) => handleUpdateStatus(value as SupportTicketStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{ticket.message}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <div className="space-y-4">
                {isCommentsLoading ? (
                  <p>Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {comment.user?.first_name?.[0] || comment.user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {comment.user?.first_name 
                              ? `${comment.user.first_name} ${comment.user.last_name || ""}`
                              : comment.user?.email || "Unknown User"}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No comments yet</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add a comment</h3>
              <Textarea
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={addCommentMutation.isPending || !newComment.trim()}
                className="w-full"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {addCommentMutation.isPending ? "Sending..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {ticket.status === "resolved" && ticket.resolved_at ? (
              <span>
                Resolved on {format(new Date(ticket.resolved_at), "MMM dd, yyyy")}
              </span>
            ) : (
              <span>
                Last updated {format(new Date(ticket.updated_at), "MMM dd, yyyy")}
              </span>
            )}
          </div>
          {ticket.status === "open" && (
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus("resolved")}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Resolved
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupportRequestDetail;
