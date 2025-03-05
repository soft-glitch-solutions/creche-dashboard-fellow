import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommentItem from "@/components/social/CommentItem";
import { ArticleSkeleton } from "@/components/social/SocialSkeletons";
import ArticleForm from "@/components/social/ArticleForm";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    display_name: string;
    profile_picture_url: string;
  };
}

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

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkAuth();
    fetchArticle();
    fetchComments();
  }, [id]);

  const fetchArticle = async () => {
    try {
      let { data, error } = await supabase
        .from('article_with_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('articles')
          .select(`
            *,
            author:users(display_name, profile_picture_url),
            creche:creches(id, name, logo)
          `)
          .eq('id', id)
          .single();
          
        if (fallbackError) throw fallbackError;
        
        data = {
          ...fallbackData,
          creche_name: fallbackData.creche?.name,
          creche_id: fallbackData.creche?.id,
        };
      }

      setArticle(data);
    } catch (error) {
      console.error("Error fetching article:", error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .select(`
          *,
          user:users(display_name, profile_picture_url)
        `)
        .eq('article_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: id,
          user_id: user.id,
          content: newComment,
        })
        .select();

      if (error) throw error;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('display_name, profile_picture_url')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const newCommentWithUser = {
        ...data[0],
        user: userData,
      };

      setComments([newCommentWithUser, ...comments]);
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleHeart = async () => {
    if (!article) return;
    
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ hearts: article.hearts + 1 })
        .eq('id', article.id)
        .select()
        .single();

      if (error) throw error;

      setArticle({ ...article, hearts: data.hearts });
    } catch (error) {
      console.error("Error updating hearts:", error);
      toast({
        title: "Error",
        description: "Failed to like article",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id);

      if (error) throw error;

      navigate('/dashboard/social');
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

  const handleUpdateArticle = async (updatedArticle: { title: string; content: string; type: string }) => {
    if (!article) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: updatedArticle.title,
          content: updatedArticle.content,
          type: updatedArticle.type,
        })
        .eq('id', article.id);

      if (error) throw error;

      setArticle({
        ...article,
        title: updatedArticle.title,
        content: updatedArticle.content,
        type: updatedArticle.type,
      });
      
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

  const handleViewCreche = () => {
    if (article?.creche_id) {
      navigate(`/dashboard/social/profile/${article.creche_id}`);
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
        <ArticleSkeleton />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <Button onClick={() => navigate('/dashboard/social')}>Return to Social Feed</Button>
      </div>
    );
  }

  const isAuthor = user?.id === article.author_id;

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 mb-4"
        onClick={() => navigate('/dashboard/social')}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Social Feed
      </Button>
      
      <ArticleForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleUpdateArticle}
        initialData={article ? {
          title: article.title,
          content: article.content,
          type: article.type,
        } : null}
      />

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">{article.title}</h2>
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {article.type}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By <span 
                onClick={handleViewCreche}
                className="cursor-pointer hover:underline text-primary"
              >
                {article.creche_name || article.author?.display_name || "Unknown"}
              </span> • {new Date(article.created_at).toLocaleDateString()}
            </p>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="mt-4 whitespace-pre-wrap">{article.content}</p>
        <div className="mt-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleHeart}
          >
            <Heart className="h-4 w-4" />
            {article.hearts} likes
          </Button>
        </div>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        
        {user ? (
          <div className="mb-6">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleAddComment}>Post Comment</Button>
            </div>
          </div>
        ) : (
          <Card className="p-4 mb-6 text-center">
            <p>You need to be logged in to comment</p>
          </Card>
        )}
        
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                currentUserId={user?.id}
                onDelete={() => handleDeleteComment(comment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;
