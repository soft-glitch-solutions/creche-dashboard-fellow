
import { createContext, useContext, useState } from "react";

type Language = "en" | "af" | "xh";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    welcome: "Welcome",
    support: "Support",
    settings: "Settings",
    submit: "Submit",
    logout: "Logout",
  },
  af: {
    welcome: "Welkom",
    support: "Ondersteuning",
    settings: "Instellings",
    submit: "Indien",
    logout: "Teken uit",
  },
  xh: {
    welcome: "Wamkelekile",
    support: "Inkxaso",
    settings: "Iisethingi",
    submit: "Ngenisa",
    logout: "Phuma",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem("language");
    return (savedLang as Language) || "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
