import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/help/Editor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const EditContent = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('help_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching content:', error);
      return;
    }

    if (data) {
      setTitle(data.title);
      setContent(data.content);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to edit content",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('help_content')
      .update({
        title,
        content,
        updated_by: user.id,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Content updated successfully",
    });
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Edit Content</h1>
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
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  );
};

export default EditContent;