
import { Heart, MessageCircle, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

interface Props {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onHeart: (id: string, hearts: number) => void;
  currentUserId?: string;
}

const ArticleCard = ({ article, onEdit, onDelete, onHeart, currentUserId }: Props) => {
  const navigate = useNavigate();
  
  const isAuthor = currentUserId === article.author_id;

  const handleViewCreche = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.creche_id) {
      navigate(`/dashboard/social/profile/${article.creche_id}`);
    }
  };

  return (
    <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/dashboard/social/${article.id}`)}>
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
            </span> •{" "}
            {new Date(article.created_at).toLocaleDateString()}
          </p>
        </div>
        {isAuthor && (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(article);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(article.id);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <p className="mt-4">{article.content}</p>
      <div className="mt-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onHeart(article.id, article.hearts);
          }}
        >
          <Heart className="h-4 w-4" />
          {article.hearts}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/social/${article.id}`);
          }}
        >
          <MessageCircle className="h-4 w-4" />
          Comments
        </Button>
      </div>
    </Card>
  );
};

export default ArticleCard;
