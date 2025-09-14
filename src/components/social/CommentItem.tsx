
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    user?: {
      display_name: string;
      profile_picture_url: string;
    };
  };
  currentUserId?: string;
  onDelete: () => void;
}

const CommentItem = ({ comment, currentUserId, onDelete }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { toast } = useToast();
  
  const isAuthor = currentUserId === comment.user_id;

  const handleSaveEdit = async () => {
    try {
      if (!editedContent.trim()) {
        toast({
          title: "Error",
          description: "Comment cannot be empty",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('article_comments')
        .update({ content: editedContent })
        .eq('id', comment.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 mb-3">
      <div className="flex justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {comment.user?.profile_picture_url ? (
              <img 
                src={comment.user.profile_picture_url} 
                alt={comment.user.display_name || "User"} 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs">{(comment.user?.display_name || "User").substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="font-semibold">{comment.user?.display_name || "Unknown user"}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        
        {isAuthor && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border rounded-md min-h-[80px]"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
      )}
    </Card>
  );
};

export default CommentItem;
