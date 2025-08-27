import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Editor } from "@/components/help/Editor";

type HelpCategory = "documentation" | "faq" | "tutorial";

const CreateContent = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<HelpCategory>("documentation");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Detect category from URL path
    const path = location.pathname;
    if (path.includes('faqs')) {
      setCategory('faq');
    } else if (path.includes('tutorials')) {
      setCategory('tutorial');
    } else if (path.includes('documentation')) {
      setCategory('documentation');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("help_content")
        .insert({
          title,
          content,
          category,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Help content created successfully"
      });
      navigate(`/dashboard/help/${category}`);
    } catch (error) {
      console.error("Error creating help content:", error);
      toast({
        title: "Error",
        description: "Failed to create help content",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-primary">Create New {category === 'faq' ? 'FAQ' : category === 'tutorial' ? 'Tutorial' : 'Documentation'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(value: HelpCategory) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Editor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-4">
          <Button type="submit">Create Content</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateContent;