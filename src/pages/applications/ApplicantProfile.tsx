import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Navigate for back button
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, ArrowLeft } from "lucide-react";

interface Applicant {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  dob: string | null;
  application_fee: string | null;
  payment_status: string | null;
  documents: string | null; // Path to the uploaded documents or list of documents
}

const ApplicantProfile = () => {
  const { id } = useParams(); // Get applicant ID from URL
  const navigate = useNavigate(); // For back navigation
  const [applicant, setApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching applicant:", error);
      } else {
        setApplicant(data);
      }
    };

    if (id) {
      fetchApplicant();
    }
  }, [id]);

  // Safety check for applicant data
  if (!applicant) {
    return <div className="text-center p-6">Loading applicant data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      {/* Applicant Header */}
      <Card className="p-6 flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-2xl font-medium">
            {applicant.name ? applicant.name.charAt(0) : "?"}
          </div>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{applicant.name || "No Name"}</h1>
          <p className="text-muted-foreground">{applicant.email || "No Email"}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-3 bg-muted p-1 rounded-lg">
          <TabsTrigger value="info">Applicant Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Applicant Info Tab */}
        <TabsContent value="info">
          <Card className="p-6 space-y-4">
            <div><strong>Email:</strong> {applicant.email || "Not Provided"}</div>
            <div><strong>Phone:</strong> {applicant.phone_number || "Not Provided"}</div>
            <div><strong>Address:</strong> {applicant.address || "Not Provided"}</div>
            <div><strong>Birthday:</strong> {applicant.dob || "Not Provided"}</div>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="p-6">
            <p>📂 {applicant.documents || "No documents uploaded yet."}</p>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <Card className="p-6 space-y-4">
            <div><strong>Application Fee:</strong> {applicant.application_fee || "Not Provided"}</div>
            <div><strong>Payment Status:</strong> {applicant.payment_status || "Not Provided"}</div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicantProfile;
