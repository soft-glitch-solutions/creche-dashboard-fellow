import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/help/Editor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const CreateContent = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { category } = useParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create content",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('help_content')
      .insert([
        {
          title,
          content,
          category,
          created_by: user.id,
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Content created successfully",
    });
    navigate(`/dashboard/help/${category}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">
          Create New {category?.charAt(0).toUpperCase() + category?.slice(1)}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <Editor content={content} onChange={setContent} />
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateContent;