
import { createContext, useContext, useState } from "react";

type Language = "en" | "af" | "xh" | "zu";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation & Core
    welcome: "Welcome",
    dashboard: "Dashboard",
    applications: "Applications",
    students: "Students",
    calendar: "Calendar",
    lessons: "Lessons",
    finance: "Finance",
    reports: "Reports",
    photobook: "Photobook",
    social: "Social",
    settings: "Settings",
    support: "Support",
    help: "Help",
    logout: "Logout",
    
    // Common Actions
    submit: "Submit",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    add: "Add",
    create: "Create",
    update: "Update",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    print: "Print",
    download: "Download",
    upload: "Upload",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    open: "Open",
    
    // Profile & User
    profile: "Profile",
    account: "Account",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    
    // Students
    studentProfile: "Student Profile",
    studentList: "Student List",
    addStudent: "Add Student",
    editStudent: "Edit Student",
    studentName: "Student Name",
    className: "Class",
    parentName: "Parent Name",
    parentPhone: "Parent Phone",
    attendance: "Attendance",
    grade: "Grade",
    age: "Age",
    dateOfBirth: "Date of Birth",
    
    // Applications
    applicationStatus: "Application Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    newApplication: "New Application",
    createApplication: "Create Application",
    parentEmail: "Parent Email",
    phoneNumber: "Phone Number",
    whatsapp: "WhatsApp",
    applicationAddress: "Address",
    numberOfChildren: "Number of Children",
    message: "Message",
    searchApplications: "Search applications...",
    
    // Settings
    userAccess: "User Access",
    crecheProfile: "Creche Profile",
    integrations: "Integrations",
    payments: "Payments",
    configure: "Configure",
    manageUsers: "View and manage users assigned to your creche",
    updateProfile: "View and update your creche profile information",
    setupIntegrations: "Set up and manage third-party integrations",
    managePayments: "Manage payment settings, plans, and billing",
    
    // Help & Documentation
    helpCentre: "Help Centre",
    documentation: "Documentation",
    faqs: "FAQs",
    supportChat: "Support Chat",
    tutorials: "Tutorials",
    findHelp: "Find help and learn how to use the platform",
    readGuides: "Read our comprehensive guides and documentation",
    findAnswers: "Find answers to commonly asked questions",
    chatSupport: "Chat with our support team",
    learnPlatform: "Learn how to use the platform effectively",
    newTutorial: "New Tutorial",
    viewTutorial: "View Tutorial",
    
    // Finance
    invoice: "Invoice",
    payment: "Payment",
    amount: "Amount",
    dueDate: "Due Date",
    
    // Calendar & Lessons
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    lesson: "Lesson",
    startTime: "Start Time",
    endTime: "End Time",
    
    // Reports
    attendanceReport: "Attendance Report",
    financeReport: "Finance Report",
    
    // Messages & Status
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
    loading: "Loading...",
    noData: "No data available",
    
    // Creche
    crecheName: "Creche Name",
    capacity: "Capacity",
    description: "Description",
    
    // Common Labels
    date: "Date",
    time: "Time",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    total: "Total",
    count: "Count",
    actions: "Actions",
    unassigned: "Unassigned",
    notSpecified: "Not specified",
    notProvided: "Not provided"
  },
  af: {
    // Navigation & Core
    welcome: "Welkom",
    dashboard: "Beheersentrum",
    applications: "Aansoeke",
    students: "Studente",
    calendar: "Kalender",
    lessons: "Lesse",
    finance: "Finansies",
    reports: "Verslae",
    photobook: "Fotoboek",
    social: "Sosiaal",
    settings: "Instellings",
    support: "Ondersteuning",
    help: "Hulp",
    logout: "Teken uit",
    
    // Common Actions
    submit: "Indien",
    save: "Stoor",
    cancel: "Kanselleer",
    edit: "Wysig",
    delete: "Skrap",
    view: "Bekyk",
    add: "Voeg by",
    create: "Skep",
    update: "Werk by",
    search: "Soek",
    filter: "Filter",
    export: "Uitvoer",
    import: "Invoer",
    print: "Druk",
    download: "Laai af",
    upload: "Laai op",
    back: "Terug",
    next: "Volgende",
    previous: "Vorige",
    close: "Sluit",
    open: "Maak oop",
    
    // Profile & User
    profile: "Profiel",
    account: "Rekening",
    name: "Naam",
    email: "E-pos",
    phone: "Telefoon",
    address: "Adres",
    password: "Wagwoord",
    confirmPassword: "Bevestig Wagwoord",
    
    // Students
    studentProfile: "Student Profiel",
    studentList: "Student Lys",
    addStudent: "Voeg Student by",
    editStudent: "Wysig Student",
    studentName: "Student Naam",
    className: "Klas",
    parentName: "Ouer Naam",
    parentPhone: "Ouer Telefoon",
    attendance: "Bywoning",
    grade: "Graad",
    age: "Ouderdom",
    dateOfBirth: "Geboortedatum",
    
    // Applications
    applicationStatus: "Aansoek Status",
    pending: "Hangende",
    approved: "Goedgekeur",
    rejected: "Afgekeur",
    newApplication: "Nuwe Aansoek",
    createApplication: "Skep Aansoek",
    parentEmail: "Ouer E-pos",
    phoneNumber: "Telefoonnommer",
    whatsapp: "WhatsApp",
    applicationAddress: "Adres",
    numberOfChildren: "Aantal Kinders",
    message: "Boodskap",
    searchApplications: "Soek aansoeke...",
    
    // Settings
    userAccess: "Gebruiker Toegang",
    crecheProfile: "Creche Profiel",
    integrations: "Integrasies",
    payments: "Betalings",
    configure: "Konfigureer",
    manageUsers: "Bekyk en bestuur gebruikers wat aan jou creche toegewys is",
    updateProfile: "Bekyk en werk jou creche profiel inligting by",
    setupIntegrations: "Stel derdeparty integrasies op en bestuur dit",
    managePayments: "Bestuur betaling instellings, planne en fakturering",
    
    // Help & Documentation
    helpCentre: "Hulp Sentrum",
    documentation: "Dokumentasie",
    faqs: "Gereelde Vrae",
    supportChat: "Ondersteuning Gesels",
    tutorials: "Tutoriale",
    findHelp: "Vind hulp en leer hoe om die platform te gebruik",
    readGuides: "Lees ons omvattende gidse en dokumentasie",
    findAnswers: "Vind antwoorde op algemene vrae",
    chatSupport: "Gesels met ons ondersteuning span",
    learnPlatform: "Leer hoe om die platform effektief te gebruik",
    newTutorial: "Nuwe Tutoriaal",
    viewTutorial: "Bekyk Tutoriaal",
    
    // Finance
    invoice: "Faktuur",
    payment: "Betaling",
    amount: "Bedrag",
    dueDate: "Vervaldatum",
    
    // Calendar & Lessons
    today: "Vandag",
    month: "Maand",
    week: "Week",
    day: "Dag",
    lesson: "Les",
    startTime: "Begin Tyd",
    endTime: "Eind Tyd",
    
    // Reports
    attendanceReport: "Bywoning Verslag",
    financeReport: "Finansie Verslag",
    
    // Messages & Status
    success: "Sukses",
    error: "Fout",
    warning: "Waarskuwing",
    info: "Inligting",
    loading: "Laai...",
    noData: "Geen data beskikbaar nie",
    
    // Creche
    crecheName: "Creche Naam",
    capacity: "Kapasiteit",
    description: "Beskrywing",
    
    // Common Labels
    date: "Datum",
    time: "Tyd",
    status: "Status",
    active: "Aktief",
    inactive: "Onaktief",
    total: "Totaal",
    count: "Tel",
    actions: "Aksies",
    unassigned: "Nie toegewys nie",
    notSpecified: "Nie gespesifiseer nie",
    notProvided: "Nie verskaf nie"
  },
  xh: {
    // Navigation & Core
    welcome: "Wamkelekile",
    dashboard: "Iphepha Lokulawula",
    applications: "Izicelo",
    students: "Abafundi",
    calendar: "Ikhalenda",
    lessons: "Izifundo",
    finance: "Ezemali",
    reports: "Iingxelo",
    photobook: "Incwadi Yeefoto",
    social: "Entlalweni",
    settings: "Iisethingi",
    support: "Inkxaso",
    help: "Uncedo",
    logout: "Phuma",
    
    // Common Actions
    submit: "Ngenisa",
    save: "Gcina",
    cancel: "Rhoxisa",
    edit: "Hlela",
    delete: "Cima",
    view: "Jonga",
    add: "Yongeza",
    create: "Dala",
    update: "Hlaziya",
    search: "Khangela",
    filter: "Hlumela",
    export: "Khuphela",
    import: "Ngenisa",
    print: "Printa",
    download: "Khuphela",
    upload: "Layisha",
    back: "Buyela",
    next: "Okulandelayo",
    previous: "Okudlulileyo",
    close: "Vala",
    open: "Vula",
    
    // Profile & User
    profile: "Iprofayile",
    account: "Iakhawunti",
    name: "Igama",
    email: "I-imeyili",
    phone: "Umnxeba",
    address: "Idilesi",
    password: "Iphasiwedi",
    confirmPassword: "Qinisekisa Iphasiwedi",
    
    // Students
    studentProfile: "Iprofayile Yomfundi",
    studentList: "Uluhlu Lwabafundi",
    addStudent: "Yongeza Umfundi",
    editStudent: "Hlela Umfundi",
    studentName: "Igama Lomfundi",
    className: "Iklasi",
    parentName: "Igama Lomzali",
    parentPhone: "Umnxeba Womzali",
    attendance: "Ukuzimasa",
    grade: "Ibanga",
    age: "Ubudala",
    dateOfBirth: "Umhla Wokuzalwa",
    
    // Applications
    applicationStatus: "Isimo Sesicelo",
    pending: "Salinde",
    approved: "Samkelwe",
    rejected: "Saliwe",
    newApplication: "Isicelo Esitsha",
    createApplication: "Dala Isicelo",
    parentEmail: "I-imeyili Yomzali",
    phoneNumber: "Inombolo Yomnxeba",
    whatsapp: "WhatsApp",
    applicationAddress: "Idilesi",
    numberOfChildren: "Inani Labantwana",
    message: "Umyalezo",
    searchApplications: "Khangela izicelo...",
    
    // Settings
    userAccess: "Ukufikelela Komsebenzisi",
    crecheProfile: "Iprofayile Yekreshi",
    integrations: "Ukudityaniswa",
    payments: "Iintlawulo",
    configure: "Hlela",
    manageUsers: "Jonga kwaye ulawule abasebenzisi ababelwe ikreshi yakho",
    updateProfile: "Jonga kwaye uhlaziye inkcukacha zeprofayile yekreshi yakho",
    setupIntegrations: "Misela kwaye ulawule ukudityaniswa kwenkcubeko yesithathu",
    managePayments: "Lawula izicwangciso zentlawulo, izicwangciso kunye nokubhayisela",
    
    // Help & Documentation
    helpCentre: "Iziko Loncedo",
    documentation: "Amaxwebhu",
    faqs: "Imibuzo Edla Ngokubuzwa",
    supportChat: "Incoko Yenkxaso",
    tutorials: "Izikhokelo",
    findHelp: "Fumana uncedo kwaye ufunde indlela yokusebenzisa iqonga",
    readGuides: "Funda izikhokelo zethu ezibanzi kunye namaxwebhu",
    findAnswers: "Fumana iimpendulo kwimibuzo edla ngokubuzwa",
    chatSupport: "Thetha neqela lethu lenkxaso",
    learnPlatform: "Funda indlela yokusebenzisa iqonga ngokufanelekileyo",
    newTutorial: "Isikhokelo Esitsha",
    viewTutorial: "Jonga Isikhokelo",
    
    // Finance
    invoice: "Ityala",
    payment: "Intlawulo",
    amount: "Imali",
    dueDate: "Umhla Wokuphela",
    
    // Calendar & Lessons
    today: "Namhlanje",
    month: "Inyanga",
    week: "Iveki",
    day: "Usuku",
    lesson: "Isifundo",
    startTime: "Ixesha Lokuqala",
    endTime: "Ixesha Lokugqibela",
    
    // Reports
    attendanceReport: "Ingxelo Yokuzimasa",
    financeReport: "Ingxelo Yezemali",
    
    // Messages & Status
    success: "Impumelelo",
    error: "Impazamo",
    warning: "Isilumkiso",
    info: "Ulwazi",
    loading: "Iyalayisha...",
    noData: "Akukho datha ikhoyo",
    
    // Creche
    crecheName: "Igama Lekreshi",
    capacity: "Umthamo",
    description: "Inkcazo",
    
    // Common Labels
    date: "Umhla",
    time: "Ixesha",
    status: "Isimo",
    active: "Iyasebenza",
    inactive: "Ayisebenzi",
    total: "Iyonke",
    count: "Bala",
    actions: "Izenzo",
    unassigned: "Ayikabeli",
    notSpecified: "Ayichazwanga",
    notProvided: "Ayinikezelwanga"
  },
  zu: {
    // Navigation & Core
    welcome: "Sawubona",
    dashboard: "Ideshibhodi",
    applications: "Izicelo",
    students: "Abafundi",
    calendar: "Ikhalenda",
    lessons: "Izifundo",
    finance: "Ezezimali",
    reports: "Imibiko",
    photobook: "Incwadi Yezithombe",
    social: "Kwezenhlalakahle",
    settings: "Izilungiselelo",
    support: "Ukusekela",
    help: "Usizo",
    logout: "Phuma",
    
    // Common Actions
    submit: "Thumela",
    save: "Gcina",
    cancel: "Khansela",
    edit: "Hlela",
    delete: "Susa",
    view: "Buka",
    add: "Engeza",
    create: "Dala",
    update: "Buyekeza",
    search: "Sesha",
    filter: "Hlungisa",
    export: "Khipha",
    import: "Ngenisa",
    print: "Phrinta",
    download: "Dawuniloda",
    upload: "Layisha",
    back: "Buyela",
    next: "Okulandelayo",
    previous: "Okudlule",
    close: "Vala",
    open: "Vula",
    
    // Profile & User
    profile: "Iphrofayela",
    account: "I-akhawunti",
    name: "Igama",
    email: "I-imeyili",
    phone: "Ucingo",
    address: "Ikheli",
    password: "Iphasiwedi",
    confirmPassword: "Qinisekisa Iphasiwedi",
    
    // Students
    studentProfile: "Iphrofayela Yomfundi",
    studentList: "Uhlu Lwabafundi",
    addStudent: "Engeza Umfundi",
    editStudent: "Hlela Umfundi",
    studentName: "Igama Lomfundi",
    className: "Ikilasi",
    parentName: "Igama Lomzali",
    parentPhone: "Ucingo Lomzali",
    attendance: "Ukuzimela",
    grade: "Ibanga",
    age: "Iminyaka",
    dateOfBirth: "Usuku Lokuzalwa",
    
    // Applications
    applicationStatus: "Isimo Sesicelo",
    pending: "Kusalindile",
    approved: "Kwamukelwe",
    rejected: "Kwenqatshelwe",
    newApplication: "Isicelo Esisha",
    createApplication: "Dala Isicelo",
    parentEmail: "I-imeyili Yomzali",
    phoneNumber: "Inombolo Yocingo",
    whatsapp: "WhatsApp",
    applicationAddress: "Ikheli",
    numberOfChildren: "Inani Lezingane",
    message: "Umlayezo",
    searchApplications: "Sesha izicelo...",
    
    // Settings
    userAccess: "Ukufinyelela Komsebenzisi",
    crecheProfile: "Iphrofayela Yekreshi",
    integrations: "Ukuhlanganisa",
    payments: "Izinkokhelo",
    configure: "Hlela",
    manageUsers: "Buka futhi uphathe abasebenzisi abanikezwe ikreshi yakho",
    updateProfile: "Buka futhi ubuyekeze ulwazi lwephrofayela yekreshi yakho",
    setupIntegrations: "Setha futhi uphathe ukuhlanganiswa kwabanye abantu",
    managePayments: "Phatha izilungiselelo zenkokhelo, amasu nokukhokhela",
    
    // Help & Documentation
    helpCentre: "Isikhungo Sosizo",
    documentation: "Amadokhumenti",
    faqs: "Imibuzo Evame Ukubuzwa",
    supportChat: "Ingxoxo Yesekelo",
    tutorials: "Izifundo",
    findHelp: "Thola usizo futhi ufunde indlela yokusebenzisa inkundla",
    readGuides: "Funda izinkombandlela zethu eziphelele kanye nemibhalo",
    findAnswers: "Thola izimpendulo emibuzo evame ukubuzwa",
    chatSupport: "Xoxa neqembu lethu lesekelo",
    learnPlatform: "Funda indlela yokusebenzisa inkundla ngendlela ephumelelayo",
    newTutorial: "Isifundo Esisha",
    viewTutorial: "Buka Isifundo",
    
    // Finance
    invoice: "I-invoyisi",
    payment: "Inkokhelo",
    amount: "Inani",
    dueDate: "Usuku Lokugcina",
    
    // Calendar & Lessons
    today: "Namuhla",
    month: "Inyanga",
    week: "Isonto",
    day: "Usuku",
    lesson: "Isifundo",
    startTime: "Isikhathi Sokuqala",
    endTime: "Isikhathi Sokugcina",
    
    // Reports
    attendanceReport: "Umbiko Wokuzimela",
    financeReport: "Umbiko Wezezimali",
    
    // Messages & Status
    success: "Impumelelo",
    error: "Iphutha",
    warning: "Isexwayiso",
    info: "Ulwazi",
    loading: "Iyaloda...",
    noData: "Ayikho idatha etholakalayo",
    
    // Creche
    crecheName: "Igama Lekreshi",
    capacity: "Umthamo",
    description: "Incazelo",
    
    // Common Labels
    date: "Usuku",
    time: "Isikhathi",
    status: "Isimo",
    active: "Kusebenza",
    inactive: "Akusebenzi",
    total: "Konke",
    count: "Bala",
    actions: "Izenzo",
    unassigned: "Akukabiwanga",
    notSpecified: "Akucacisiwe",
    notProvided: "Akunikeziwe"
  }
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
