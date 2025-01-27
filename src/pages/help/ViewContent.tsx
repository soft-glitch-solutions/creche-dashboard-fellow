import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/help/Editor";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Edit } from "lucide-react";

const ViewContent = () => {
  const [content, setContent] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchContent();
    checkAdminStatus();
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

    setContent(data);
  };

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('roles(role_name)')
      .eq('id', user.id)
      .single();

    setIsAdmin(
      userData?.roles?.role_name === 'Administrator' || 
      userData?.roles?.role_name === 'Developer'
    );
  };

  if (!content) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold text-primary">{content.title}</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate(`/dashboard/help/${content.category}/edit/${content.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>
    </div>
  );
};

export default ViewContent;