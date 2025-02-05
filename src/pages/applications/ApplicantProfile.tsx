import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, ArrowLeft, Trash2, FileText, UserCheck } from "lucide-react";
import { ApplicationDocumentUpload } from "@/components/applications/ApplicationDocumentUpload";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplicationLifecycle } from "@/components/applications/ApplicationLifecycle";
import { ApplicationNotes } from "@/components/applications/ApplicationNotes";
import { Badge } from "@/components/ui/badge";

interface ApplicationDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
}

interface Invoice {
  id: string;
  title: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function ApplicantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    parent_name: "",
    parent_email: "",
    parent_phone_number: "",
    parent_whatsapp: "",
    parent_address: "",
    message: "",
  });
  const [applicationNotes, setApplicationNotes] = useState([]);

  const fetchApplicationNotes = async (applicationId: string) => {
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('application_notes')
        .select(`
          *,
          user:users (
            id,
            email,
            first_name,
            last_name,
            display_name,
            role:roles (
              role_name
            )
          )
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error("Error fetching notes:", notesError);
        return;
      }

      setApplicationNotes(notesData || []);
    } catch (error) {
      console.error("Error in fetchApplicationNotes:", error);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!application) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('application_notes')
        .insert({
          application_id: application.id,
          user_id: userData.user.id,
          note,
        });

      if (error) throw error;

      // Refresh notes after adding new one
      fetchApplicationNotes(application.id);

      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note",
      });
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, [id]);

  const fetchApplicationData = async () => {
    if (!id) return;

    // Fetch application details
    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (applicationError) {
      console.error("Error fetching application:", applicationError);
      return;
    }

    setApplication(applicationData);
    setEditForm({
      parent_name: applicationData.parent_name,
      parent_email: applicationData.parent_email,
      parent_phone_number: applicationData.parent_phone_number,
      parent_whatsapp: applicationData.parent_whatsapp || "",
      parent_address: applicationData.parent_address || "",
      message: applicationData.message,
    });

    // Fetch documents
    const { data: documentsData, error: documentsError } = await supabase
      .from("application_documents")
      .select("*")
      .eq("application_id", id)
      .order("uploaded_at", { ascending: false });

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
    } else {
      setDocuments(documentsData);
    }

    // Fetch invoices
    const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: false });

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
    } else {
      setInvoices(invoicesData);
    }
  };

  const handleEditSubmit = async () => {
    const { error } = await supabase
      .from("applications")
      .update(editForm)
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application",
      });
    } else {
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
      setIsEditing(false);
      fetchApplicationData();
    }
  };

  const handleDeleteDocument = async (documentId: string, fileUrl: string) => {
    try {
      // Delete from storage
      const filePath = fileUrl.split("/").pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("application-documents")
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("application_documents")
        .delete()
        .eq("id", documentId);

      if (dbError) throw dbError;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document",
      });
    }
  };

  const handleCreateStudent = async () => {
    if (!application) return;

    try {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert([
          {
            name: `Child of ${application.parent_name}`,
            parent_name: application.parent_name,
            parent_email: application.parent_email,
            parent_phone_number: application.parent_phone_number,
            parent_whatsapp: application.parent_whatsapp,
            address: application.parent_address,
            application_id: application.id,
            creche_id: application.creche_id,
          },
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      toast({
        title: "Success",
        description: "Student created successfully",
      });

      navigate(`/dashboard/students/${student.id}`);
    } catch (error) {
      console.error("Error creating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create student",
      });
    }
  };

  // Update useEffect to fetch notes when component mounts
  useEffect(() => {
    if (id) {
      fetchApplicationData();
      fetchApplicationNotes(id);
    }
  }, [id]);

  if (!application) {
    return <div className="text-center p-6">Loading application data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-2xl font-medium">
                {application.parent_name ? application.parent_name.charAt(0) : "?"}
              </div>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{application.parent_name}</h1>
              <p className="text-muted-foreground">{application.parent_email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {application.lifecycle_stage === "Documents Received" && (
              <Button onClick={handleCreateStudent}>
                <UserCheck className="h-4 w-4 mr-2" />
                Create Student
              </Button>
            )}
          </div>
        </div>

        <ApplicationLifecycle
          currentStage={application.lifecycle_stage || "New"}
          onStageChange={async (stage) => {
            const { error } = await supabase
              .from("applications")
              .update({ lifecycle_stage: stage })
              .eq("id", application.id);

            if (error) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update stage",
              });
            } else {
              setApplication({ ...application, lifecycle_stage: stage });
              toast({
                title: "Success",
                description: "Application stage updated",
              });
            }
          }}
        />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="parent_name">Parent Name</Label>
              <Input
                id="parent_name"
                value={editForm.parent_name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, parent_name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent_email">Email</Label>
              <Input
                id="parent_email"
                type="email"
                value={editForm.parent_email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, parent_email: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent_phone">Phone Number</Label>
              <Input
                id="parent_phone"
                value={editForm.parent_phone_number}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    parent_phone_number: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent_whatsapp">WhatsApp</Label>
              <Input
                id="parent_whatsapp"
                value={editForm.parent_whatsapp}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    parent_whatsapp: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent_address">Address</Label>
              <Input
                id="parent_address"
                value={editForm.parent_address}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    parent_address: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={editForm.message}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-4 bg-muted p-1 rounded-lg">
          <TabsTrigger value="info">Parent Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-6 space-y-4">
            <div><strong>Email:</strong> {application.parent_email}</div>
            <div><strong>Phone:</strong> {application.parent_phone_number}</div>
            <div><strong>WhatsApp:</strong> {application.parent_whatsapp || "Not provided"}</div>
            <div><strong>Address:</strong> {application.parent_address || "Not provided"}</div>
            <div><strong>Number of Children:</strong> {application.number_of_children || "Not specified"}</div>
            <div><strong>Message:</strong> {application.message}</div>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6 space-y-4">
            <ApplicationDocumentUpload
              applicationId={application.id}
              onUploadComplete={fetchApplicationData}
            />
            
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.file_name}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-muted-foreground text-center">
                  No documents uploaded yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Invoices</h3>
              <Button onClick={() => navigate(`/dashboard/finance/create-invoice?applicationId=${id}`)}>
                Create Invoice
              </Button>
            </div>
            
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{invoice.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <p className="font-medium">R{invoice.total_amount}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/finance/invoice/${invoice.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <p className="text-muted-foreground text-center">
                  No invoices created yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="p-6">
            <ApplicationNotes 
              notes={applicationNotes} 
              onAddNote={handleAddNote}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
