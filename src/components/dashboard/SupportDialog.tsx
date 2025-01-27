import { LifeBuoy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const SupportDialog = () => {
  const [supportTitle, setSupportTitle] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const { toast } = useToast();

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

  return (
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
  );
};