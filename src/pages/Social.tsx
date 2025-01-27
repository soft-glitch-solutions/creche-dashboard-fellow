import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Edit, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Article {
  id: string;
  title: string;
  content: string;
  hearts: number;
  author_id: string;
  created_at: string;
  type: string;
  latitude: number;
  longitude: number;
  author?: {
    display_name: string;
    profile_picture_url: string;
  };
}

const Social = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState({ title: "", content: "" });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data: articles, error } = await supabase
        .from("articles")
        .select(`
          *,
          author:users(display_name, profile_picture_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    }
  };

  const createArticle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("articles")
        .insert([
          {
            title: newArticle.title,
            content: newArticle.content,
            author_id: user.id,
            hearts: 0,
            type: 'post',
            latitude: 0, // Default value
            longitude: 0, // Default value
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setArticles([data, ...articles]);
      setNewArticle({ title: "", content: "" });
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Article created successfully",
      });
    } catch (error) {
      console.error("Error creating article:", error);
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive",
      });
    }
  };

  const handleHeart = async (articleId: string, currentHearts: number) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .update({ hearts: currentHearts + 1 })
        .eq("id", articleId)
        .select()
        .single();

      if (error) throw error;

      setArticles(articles.map(article => 
        article.id === articleId ? { ...article, hearts: data.hearts } : article
      ));
    } catch (error) {
      console.error("Error updating hearts:", error);
      toast({
        title: "Error",
        description: "Failed to like article",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Social Feed</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : "Create Post"}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 space-y-4">
          <Input
            placeholder="Title"
            value={newArticle.title}
            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
          />
          <Textarea
            placeholder="Write your post..."
            value={newArticle.content}
            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
            className="min-h-[200px]"
          />
          <div className="flex justify-end">
            <Button onClick={createArticle}>Publish</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{article.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By {article.author?.display_name || "Unknown"} • 
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-4">{article.content}</p>
            <div className="mt-6 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleHeart(article.id, article.hearts)}
              >
                <Heart className="h-4 w-4" />
                {article.hearts}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate(`/dashboard/social/${article.id}`)}
              >
                <MessageCircle className="h-4 w-4" />
                Comments
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Social;