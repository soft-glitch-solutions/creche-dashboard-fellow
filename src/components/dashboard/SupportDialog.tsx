
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
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

export const SupportDialog = () => {
  const [supportTitle, setSupportTitle] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
            category,
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
      setCategory("general");
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <LifeBuoy className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("support")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("title")}</Label>
            <Input
              id="title"
              value={supportTitle}
              onChange={(e) => setSupportTitle(e.target.value)}
              placeholder="Brief description of your issue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t("category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("message")}</Label>
            <Textarea
              id="message"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Detailed explanation of your issue"
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={handleSupportSubmit} className="w-full">
            {t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
