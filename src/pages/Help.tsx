import { Card } from "@/components/ui/card";
import { HelpCircle, Book, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  const helpResources = [
    {
      title: "Documentation",
      icon: Book,
      description: "Read our comprehensive guides and documentation",
    },
    {
      title: "FAQs",
      icon: HelpCircle,
      description: "Find answers to commonly asked questions",
    },
    {
      title: "Support Chat",
      icon: MessageSquare,
      description: "Chat with our support team",
    },
    {
      title: "Tutorials",
      icon: FileText,
      description: "Learn how to use the platform effectively",
    },
  ];

  const toSlug = (text: string) => text.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help Centre</h2>
        <p className="text-muted-foreground">
          Find help and learn how to use the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {helpResources.map((resource) => (
          <Card key={resource.title} className="p-6">
            <div className="flex items-center gap-4">
              <resource.icon className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/help/${toSlug(resource.title)}`)}
              >
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Help;
