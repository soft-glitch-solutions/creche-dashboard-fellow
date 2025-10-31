
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ArticleForm from "@/components/social/ArticleForm";
import ArticleCard from "@/components/social/ArticleCard";
import { ArticleSkeleton, PaginationSkeleton } from "@/components/social/SocialSkeletons";
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
  creche_id?: string;
  creche_name?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [creches, setCreches] = useState<{ id: string; name: string }[]>([]);
  const [selectedCreche, setSelectedCreche] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchArticles();
    fetchUserCreches();
  }, [currentPage]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchUserCreches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_creche')
        .select('creche_id')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const crecheIds = data.map(item => item.creche_id);
        const { data: crecheData, error: crecheError } = await supabase
          .from('creches')
          .select('id, name')
          .in('id', crecheIds);

        if (crecheError) throw crecheError;
        setCreches(crecheData || []);

        // Set the first creche as selected by default
        if (crecheData && crecheData.length > 0) {
          setSelectedCreche(crecheData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching user creches:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      const { count } = await supabase
        .from("articles")
        .select("*", { count: "exact" });

      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Try to get articles from view first
      let { data, error } = await supabase
        .from('article_with_details')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      // Fallback to regular articles table if view doesn't exist
      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('articles')
          .select(`
            *,
            author:users(display_name, profile_picture_url),
            creche:creches(id, name, logo)
          `)
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
          
        if (fallbackError) throw fallbackError;
        
        // Transform data to have all required fields
        data = fallbackData.map(article => ({
          ...article,
          creche_name: article.creche?.name || '',
          creche_id: article.creche?.id || '',
          author_name: article.author?.display_name || '',
          author_picture: article.author?.profile_picture_url || '',
          creche_logo: article.creche?.logo || '',
          comment_count: 0,
        }));
      }

      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createArticle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!selectedCreche) throw new Error("No creche selected");

      const { data, error } = await supabase
        .from("articles")
        .insert([
          {
            title: newArticle.title,
            content: newArticle.content,
            type: newArticle.type,
            author_id: user.id,
            creche_id: selectedCreche,
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

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Social Feed</h1>
        <Button 
          onClick={() => {
            if (creches.length === 0) {
              toast({
                title: "No creches available",
                description: "You need to be associated with at least one creche to create posts",
                variant: "destructive",
              });
              return;
            }
            setIsCreating(true);
          }}
        >
          Create Post
        </Button>
      </div>

      <ArticleForm
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={createArticle}
        initialData={newArticle}
      />

      <ArticleForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={updateArticle}
        initialData={editingArticle ? {
          title: editingArticle.title,
          content: editingArticle.content,
          type: editingArticle.type,
        } : null}
      />

      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <ArticleSkeleton key={index} />
          ))
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500">No articles found</div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={handleEditArticle}
              onDelete={deleteArticle}
              onHeart={handleHeart}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>

      {isLoading ? (
        <PaginationSkeleton />
      ) : (
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
      )}
    </div>
  );
};

export default Social;
