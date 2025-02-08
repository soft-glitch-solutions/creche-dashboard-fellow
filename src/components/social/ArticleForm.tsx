import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ArticleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: { title: string; content: string; type: string }) => void;
  initialData?: { title: string; content: string; type: string } | null;
}

const ArticleForm = ({ isOpen, onClose, onSave, initialData }: ArticleFormProps) => {
  const [formData, setFormData] = useState({ title: "", content: "", type: "" });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: "", content: "", type: "" });
    }
  }, [initialData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Post" : "Create New Post"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select post type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Helpful">Helpful</SelectItem>
              <SelectItem value="Donation">Donation</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Write your post..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="min-h-[200px]"
          />
          <div className="flex justify-end">
            <Button onClick={() => onSave(formData)}>{initialData ? "Save Changes" : "Publish"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleForm;
