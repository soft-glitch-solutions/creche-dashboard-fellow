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
import type { Creche } from "@/types/creche";
import { FacilitiesCard } from "@/components/creche/CrecheFacilitiesCard";
import { ServicesCard } from "@/components/creche/CrecheServicesCard"; // Import the new ServicesCard

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
  plan: "free",
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
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    loadCrecheDetails();
  }, [id]);

  const loadCrecheDetails = async () => {
    try {
      const { data: creche, error } = await supabase
        .from("creches")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (creche) {
        setCrecheData(creche);
      }
    } catch (error) {
      console.error("Error loading creche:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creche details",
      });
    }
  };

  const handleUpdate = async (section: keyof typeof editMode) => {
    try {
      const { error } = await supabase
        .from("creches")
        .update(crecheData)
        .eq("id", id);

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

  const handleInputChange = (field: keyof Creche, value: string | number | boolean) => {
    setCrecheData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!crecheData) return <div>Loading...</div>;

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
            editMode={editMode.services} // Update to control services edit mode
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

        {activeTab === "gallery" && <CrecheGallery crecheId={id} />}
      </div>
    </div>
  );
};

export default CrecheProfile;
