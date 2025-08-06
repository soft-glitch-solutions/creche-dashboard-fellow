import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/help/Editor";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

const Tutorials = () => {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchTutorials();
    checkAdminStatus();
  }, []);

  const fetchTutorials = async () => {
    const { data, error } = await supabase
      .from('help_content')
      .select('*')
      .eq('category', 'tutorial')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutorials:', error);
      return;
    }

    setTutorials(data || []);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">{t("tutorials")}</h1>
        {isAdmin && (
          <Button onClick={() => navigate('new')}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newTutorial")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{tutorial.title}</h3>
            <div 
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: tutorial.content.substring(0, 150) + '...' }} 
            />
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline"
                onClick={() => navigate(`view/${tutorial.id}`)}
              >
                {t("viewTutorial")}
              </Button>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="ml-2"
                  onClick={() => navigate(`edit/${tutorial.id}`)}
                >
                  {t("edit")}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tutorials;