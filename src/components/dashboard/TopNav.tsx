
import { Languages, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationsMenu } from "./NotificationsMenu";
import { SupportDialog } from "./SupportDialog";
import { UserMenu } from "./UserMenu";

interface TopNavProps {
  user: any;
}

export const TopNav = ({ user }: TopNavProps) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 md:px-8 flex items-center justify-end gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Languages className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {[
            { code: "en", label: "English" },
            { code: "af", label: "Afrikaans" },
            { code: "xh", label: "Xhosa" },
          ].map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code as "en" | "af" | "xh")}
              className={cn(
                "cursor-pointer",
                language === lang.code && "bg-accent"
              )}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-gray-700 dark:text-gray-200"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      <NotificationsMenu />
      <SupportDialog />
      <UserMenu user={user} />
    </div>
  );
};
