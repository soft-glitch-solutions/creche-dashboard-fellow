
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Heart, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ArticleCard from "@/components/social/ArticleCard";
import { ArticleSkeleton } from "@/components/social/SocialSkeletons";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import type { Creche } from "@/types/creche";

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

const SocialProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [crecheInfo, setCrecheInfo] = useState<Creche | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkAuth();
    fetchCrecheInfo();
    fetchCrecheArticles();
  }, [id]);

  const fetchCrecheInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCrecheInfo(data);
    } catch (error) {
      console.error("Error fetching creche info:", error);
      toast({
        title: "Error",
        description: "Failed to load creche information",
        variant: "destructive",
      });
    }
  };

  const fetchCrecheArticles = async () => {
    try {
      // Try to get articles from view first for more details
      let { data, error } = await supabase
        .from('article_with_details')
        .select('*')
        .eq('creche_id', id)
        .order('created_at', { ascending: false });

      // Fallback to regular articles table if view doesn't exist
      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('articles')
          .select(`
            *,
            author:users(display_name, profile_picture_url),
            creche:creches(id, name, logo)
          `)
          .eq('creche_id', id)
          .order('created_at', { ascending: false });
          
        if (fallbackError) throw fallbackError;
        
        // Transform data to have creche_name directly
        data = fallbackData.map(article => ({
          ...article,
          creche_name: article.creche?.name,
          creche_id: article.creche?.id,
        }));
      }

      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching creche articles:", error);
      toast({
        title: "Error",
        description: "Failed to load creche posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    // This would be implemented if we want to allow editing from the profile page
    navigate(`/dashboard/social`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== articleId));
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-4"
          onClick={() => navigate('/dashboard/social')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Social Feed
        </Button>
        <div className="h-40 animate-pulse bg-muted rounded-lg mb-6"></div>
        <ArticleSkeleton />
        <ArticleSkeleton />
      </div>
    );
  }

  if (!crecheInfo) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Creche not found</h2>
        <Button onClick={() => navigate('/dashboard/social')}>Return to Social Feed</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 mb-4"
        onClick={() => navigate('/dashboard/social')}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Social Feed
      </Button>
      
      {/* Creche Profile Header */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-primary/80 to-primary rounded-lg overflow-hidden">
          {crecheInfo.header_image && (
            <img 
              src={crecheInfo.header_image} 
              alt={crecheInfo.name} 
              className="w-full h-full object-cover opacity-70"
            />
          )}
        </div>
        <div className="absolute -bottom-16 left-6 flex items-end">
          <Avatar className="h-32 w-32 border-4 border-background">
            {crecheInfo.logo ? (
              <img src={crecheInfo.logo} alt={crecheInfo.name} className="w-full h-full object-cover" />
            ) : (
              <div className="bg-primary h-full w-full flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {crecheInfo.name?.charAt(0) || "C"}
              </div>
            )}
          </Avatar>
        </div>
      </div>

      {/* Creche Info */}
      <Card className="mt-16 pt-4">
        <CardContent>
          <h1 className="text-2xl font-bold">{crecheInfo.name}</h1>
          {crecheInfo.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{crecheInfo.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {crecheInfo.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{crecheInfo.address}</span>
              </div>
            )}
            
            {crecheInfo.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{crecheInfo.phone_number}</span>
              </div>
            )}
            
            {crecheInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{crecheInfo.email}</span>
              </div>
            )}
            
            {crecheInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a href={crecheInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {crecheInfo.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />
      
      <h2 className="text-xl font-semibold">Posts from {crecheInfo.name}</h2>
      
      {/* Articles section */}
      <div className="grid gap-6">
        {articles.length === 0 ? (
          <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">
            No posts available from this creche yet.
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={handleEditArticle}
              onDelete={handleDeleteArticle}
              onHeart={handleHeart}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SocialProfile;
