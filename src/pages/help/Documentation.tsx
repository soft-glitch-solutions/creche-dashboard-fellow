import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/help/Editor";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Documentation = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDocs();
    checkAdminStatus();
  }, []);

  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from('help_content')
      .select('*')
      .eq('category', 'documentation')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching docs:', error);
      return;
    }

    setDocs(data || []);
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
        <h1 className="text-4xl font-bold text-primary">Documentation</h1>
        {isAdmin && (
          <Button onClick={() => navigate('new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {docs.map((doc) => (
          <Card key={doc.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
            <div className="prose prose-sm dark:prose-invert" 
                 dangerouslySetInnerHTML={{ __html: doc.content.substring(0, 200) + '...' }} />
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(`view/${doc.id}`)}
            >
              Read More
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Documentation;