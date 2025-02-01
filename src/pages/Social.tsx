import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const ITEMS_PER_PAGE = 5;

const Social = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState({ title: "", content: "", type: "" });
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async () => {
    try {
      const { count } = await supabase
        .from("articles")
        .select("*", { count: "exact" });

      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      const { data: articles, error } = await supabase
        .from("articles")
        .select(`
          *,
          author:users(display_name, profile_picture_url)
        `)
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

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
            type: newArticle.type,
            author_id: user.id,
            hearts: 0,
            latitude: 0,
            longitude: 0,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchArticles();
      setNewArticle({ title: "", content: "", type: "" });
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

  const updateArticle = async () => {
    if (!editingArticle) return;
    
    try {
      const { error } = await supabase
        .from("articles")
        .update({
          title: editingArticle.title,
          content: editingArticle.content,
          type: editingArticle.type,
        })
        .eq("id", editingArticle.id);

      if (error) throw error;

      await fetchArticles();
      setEditingArticle(null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Article updated successfully",
      });
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive",
      });
    }
  };

  const deleteArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) throw error;

      await fetchArticles();
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
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
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Create Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
              <Select
                value={newArticle.type}
                onValueChange={(value) => setNewArticle({ ...newArticle, type: value })}
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
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                className="min-h-[200px]"
              />
              <div className="flex justify-end">
                <Button onClick={createArticle}>Publish</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            {editingArticle && (
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                />
                <Select
                  value={editingArticle.type}
                  onValueChange={(value) => setEditingArticle({ ...editingArticle, type: value })}
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
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="min-h-[200px]"
                />
                <div className="flex justify-end">
                  <Button onClick={updateArticle}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{article.title}</h2>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {article.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By {article.author?.display_name || "Unknown"} • 
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setEditingArticle(article);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteArticle(article.id)}
                >
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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Social;