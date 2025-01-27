import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/help/Editor";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faqs = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaqs();
    checkAdminStatus();
  }, []);

  const fetchFaqs = async () => {
    const { data, error } = await supabase
      .from('help_content')
      .select('*')
      .eq('category', 'faq')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return;
    }

    setFaqs(data || []);
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
        <h1 className="text-4xl font-bold text-primary">FAQs</h1>
        {isAdmin && (
          <Button onClick={() => navigate('new')}>
            <Plus className="h-4 w-4 mr-2" />
            New FAQ
          </Button>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.title}</AccordionTrigger>
            <AccordionContent>
              <div 
                className="prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: faq.content }} 
              />
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(`edit/${faq.id}`)}
                >
                  Edit
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Faqs;