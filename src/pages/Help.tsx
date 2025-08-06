import { Card } from "@/components/ui/card";
import { HelpCircle, Book, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const Help = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const helpResources = [
    {
      title: t("documentation"),
      icon: Book,
      description: t("readGuides"),
    },
    {
      title: t("faqs"),
      icon: HelpCircle,
      description: t("findAnswers"),
    },
    {
      title: t("supportChat"),
      icon: MessageSquare,
      description: t("chatSupport"),
    },
    {
      title: t("tutorials"),
      icon: FileText,
      description: t("learnPlatform"),
    },
  ];

  const toSlug = (text: string) => text.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("helpCentre")}</h2>
        <p className="text-muted-foreground">
          {t("findHelp")}
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
                {t("view")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Help;
