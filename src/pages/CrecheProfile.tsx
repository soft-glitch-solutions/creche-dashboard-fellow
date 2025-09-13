import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CrecheGallery } from "@/components/creche/CrecheGallery";
import { CrecheHeader } from "@/components/creche/CrecheHeader";
import { BasicInfoCard } from "@/components/creche/CrecheBasicInfo";
import { FinancialInfoCard } from "@/components/creche/CrecheFinancialInfo";
import { SocialMediaCard } from "@/components/creche/CrecheSocialMedia";
import { StudentsCard } from "@/components/creche/CrecheStudents";
import type { Creche, CrechePlan } from "@/types/creche";
import { FacilitiesCard } from "@/components/creche/CrecheFacilitiesCard";
import { ServicesCard } from "@/components/creche/CrecheServicesCard";

const defaultCreche: Creche = {
  id: "",
  name: "",
  address: null,
  phone_number: null,
  email: null,
  capacity: null,
  operating_hours: null,
  website_url: null,
  description: null,
  registered: null,
  facebook_url: null,
  twitter_url: null,
  instagram_url: null,
  linkedin_url: null,
  whatsapp_number: null,
  telegram_number: null,
  created_at: null,
  updated_at: null,
  price: null,
  header_image: null,
  website: null,
  logo: null,
  latitude: null,
  longitude: null,
  monthly_price: null,
  weekly_price: null,
  plan: "free" as CrechePlan,
  features: {
    event_calendar: false,
    staff_management: false,
    reports_analytics: false,
    financial_tracking: false,
    attendance_tracking: false,
    parent_communication: false,
  },
  services: {
    full_time_care: false,
    part_time_care: false,
    after_school_care: false,
    meals_provided: false,
    transportation: false,
    special_education: false,
  },
  facilities: {
    teachers: false,
    classrooms: false,
    toilets: false,
    playground: false,
    kitchen: false,
    parking: false,
    teachers_count: 0,
    classrooms_count: 0,
    toilets_count: 0,
    playground_count: 0,
    kitchen_count: 0,
    parking_count: 0,
  },
  bank_name: null,
  account_holder: null,
  account_number: null,
  branch_code: null,
  account_type: null,
};

// Skeleton Loading Component
const SkeletonLoading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-4">
        <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-56 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-4 border-b">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-10 w-24 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Tab Content Skeleton */}
      <div className="mt-6 space-y-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-56 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CrecheProfile = () => {
  const [crecheData, setCrecheData] = useState<Creche>(defaultCreche);
  const [editMode, setEditMode] = useState({
    basic: false,
    services: false,
    finance: false,
    facilities: false,
    additional: false,
    social: false,
  });
  const [activeTab, setActiveTab] = useState("basic"); // State for active tab
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    loadCrecheDetails();
  }, [id]);

  const loadCrecheDetails = async () => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      let crecheId = id;
      
      // If no ID is provided in the URL, get the user's assigned creche
      if (!id) {
        const { data: userCreche, error: ucError } = await supabase
          .from("user_creche")
          .select("creche_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (ucError) throw ucError;
        if (!userCreche?.creche_id) {
          throw new Error("No creche assigned to this user");
        }
        crecheId = userCreche.creche_id;
      }

      const { data: creche, error } = await supabase
        .from("creches")
        .select("*")
        .eq("id", crecheId)
        .maybeSingle();

      if (error) throw error;
      if (creche) {
        // Ensure the data conforms to our Creche type
        const typedCreche: Creche = {
          ...defaultCreche,
          ...creche,
          plan: (creche.plan || 'free') as CrechePlan,
          features: (typeof creche.features === 'object' && creche.features !== null) ? 
            creche.features as any : defaultCreche.features,
          services: (typeof creche.services === 'object' && creche.services !== null) ? 
            creche.services as any : defaultCreche.services,
          facilities: (typeof creche.facilities === 'object' && creche.facilities !== null) ? 
            creche.facilities as any : defaultCreche.facilities,
        };
        setCrecheData(typedCreche);
      }
    } catch (error) {
      console.error("Error loading creche:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creche details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested properties like 'services.full_time_care'
      const [parentField, childField] = field.split('.');
      setCrecheData(prev => ({
        ...prev,
        [parentField]: {
          ...(prev[parentField as keyof Creche] as any),
          [childField]: value
        }
      }));
    } else {
      // Handle top-level properties
      setCrecheData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleUpdate = async (section: keyof typeof editMode) => {
    try {
      const updateData = {
        ...crecheData,
        features: crecheData.features as any,
        services: crecheData.services as any,
        facilities: crecheData.facilities as any,
      };
      const { error } = await supabase
        .from("creches")
        .update(updateData)
        .eq("id", crecheData.id);

      if (error) throw error;

      setEditMode((prev) => ({ ...prev, [section]: false }));
      toast({
        title: "Success",
        description: "Creche details updated successfully",
      });
    } catch (error) {
      console.error("Error updating creche:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update creche details",
      });
    }
  };

  // Skeleton Loading State
  if (isLoading) {
    return <SkeletonLoading />;
  }

  // Define tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "services", label: "Services" },
    { id: "facilities", label: "Facilities" },
    { id: "financial", label: "Financial" },
    { id: "social", label: "Social Media" },
    { id: "students", label: "Students" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <CrecheHeader
        crecheData={crecheData}
        onLogoUpdate={(logoUrl) => setCrecheData((prev) => ({ ...prev, logo: logoUrl }))}
      />

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "basic" && (
          <BasicInfoCard
            crecheData={crecheData}
            editMode={editMode.basic}
            onEditToggle={() => setEditMode((prev) => ({ ...prev, basic: !prev.basic }))}
            onUpdate={() => handleUpdate("basic")}
            onInputChange={handleInputChange}
          />
        )}

        {activeTab === "services" && (
          <ServicesCard
            crecheData={crecheData}
            editMode={editMode.services}
            onEditToggle={() => setEditMode((prev) => ({ ...prev, services: !prev.services }))}
            onUpdate={() => handleUpdate("services")}
            onInputChange={handleInputChange}
          />
        )}

        {activeTab === "facilities" && (
          <FacilitiesCard
            crecheData={crecheData}
            editMode={editMode.facilities}
            onEditToggle={() => setEditMode((prev) => ({ ...prev, facilities: !prev.facilities }))}
            onUpdate={() => handleUpdate("facilities")}
            onInputChange={handleInputChange}
          />
        )}

        {activeTab === "financial" && (
          <FinancialInfoCard
            crecheData={crecheData}
            editMode={editMode.additional}
            onEditToggle={() => setEditMode((prev) => ({ ...prev, additional: !prev.additional }))}
            onUpdate={() => handleUpdate("additional")}
            onInputChange={handleInputChange}
          />
        )}

        {activeTab === "social" && (
          <SocialMediaCard
            crecheData={crecheData}
            editMode={editMode.social}
            onEditToggle={() => setEditMode((prev) => ({ ...prev, social: !prev.social }))}
            onUpdate={() => handleUpdate("social")}
            onInputChange={handleInputChange}
          />
        )}

        {activeTab === "students" && <StudentsCard />}

        {activeTab === "gallery" && <CrecheGallery crecheId={crecheData.id} />}
      </div>
    </div>
  );
};

export default CrecheProfile;