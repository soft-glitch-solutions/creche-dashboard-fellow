
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Printer, Upload, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ComplianceDocument {
  id: string;
  document_name: string;
  document_type: string;
  status: string;
  file_url?: string;
  expiry_date?: string;
  submission_date?: string;
  notes?: string;
  creche_id: string;
}

interface Policy {
  id: string;
  policy_name: string;
  policy_type: string;
  file_url?: string;
  last_updated: string;
  review_due: string;
  status: string;
  notes?: string;
  creche_id: string;
}

const documentFormSchema = z.object({
  document_name: z.string().min(2, { message: "Document name must be at least 2 characters." }),
  document_type: z.string(),
  status: z.string(),
  submission_date: z.string().optional(),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
});

const policyFormSchema = z.object({
  policy_name: z.string().min(2, { message: "Policy name must be at least 2 characters." }),
  policy_type: z.string(),
  status: z.string(),
  last_updated: z.string(),
  review_due: z.string(),
  notes: z.string().optional(),
});

const ComplianceReport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("registration");
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [currentCrecheId, setCurrentCrecheId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);

  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      document_name: "",
      document_type: "registration",
      status: "Valid",
      submission_date: new Date().toISOString().split('T')[0],
      expiry_date: "",
      notes: "",
    },
  });

  const policyForm = useForm<z.infer<typeof policyFormSchema>>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      policy_name: "",
      policy_type: "admissions",
      status: "Current",
      last_updated: new Date().toISOString().split('T')[0],
      review_due: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      notes: "",
    },
  });

  // Fetch current user's creche
  useEffect(() => {
    const fetchUserCreche = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userCreche } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();

        if (userCreche) {
          setCurrentCrecheId(userCreche.creche_id);
        }
      } catch (error) {
        console.error('Error fetching user creche:', error);
      }
    };

    fetchUserCreche();
  }, []);

  // Fetch compliance documents from Supabase
  const { 
    data: registrationData, 
    isLoading: isLoadingDocuments, 
    error: documentsError, 
    refetch: refetchDocuments 
  } = useQuery({
    queryKey: ['compliance-documents', currentCrecheId],
    queryFn: async () => {
      if (!currentCrecheId) return [];
      const { data, error } = await supabase
        .from('compliance_documents')
        .select('*')
        .eq('creche_id', currentCrecheId);
      
      if (error) throw error;
      return data as ComplianceDocument[];
    },
    enabled: !!currentCrecheId
  });

  // Fetch policies from Supabase
  const { 
    data: policyData, 
    isLoading: isLoadingPolicies, 
    error: policiesError, 
    refetch: refetchPolicies 
  } = useQuery({
    queryKey: ['policies', currentCrecheId],
    queryFn: async () => {
      if (!currentCrecheId) return [];
      const { data, error } = await supabase
        .from('creche_policies')
        .select('*')
        .eq('creche_id', currentCrecheId);
      
      if (error) throw error;
      return data as Policy[];
    },
    enabled: !!currentCrecheId
  });

  const handleExportExcel = () => {
    const dataToExport = activeTab === "registration" ? registrationData : policyData;
    const fileName = activeTab === "registration" ? "compliance-registration-report.xlsx" : "policies-procedures-report.xlsx";
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance");
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Exported",
      description: "The compliance report has been exported to Excel",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const uploadFile = async (file: File, path: string) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('compliance-documents')
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('compliance-documents')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const onSubmitDocument = async (data: z.infer<typeof documentFormSchema>) => {
    if (!currentCrecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche associated with current user"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = null;
      if (documentFile) {
        fileUrl = await uploadFile(documentFile, `documents/${currentCrecheId}`);
      }

      const { error } = await supabase
        .from('compliance_documents')
        .insert({
          ...data,
          file_url: fileUrl,
          creche_id: currentCrecheId
        });

      if (error) throw error;

      toast({
        title: "Document Added",
        description: `${data.document_name} has been added to compliance records`,
      });
      
      refetchDocuments();
      setIsAddDocumentOpen(false);
      documentForm.reset({
        document_name: "",
        document_type: "registration",
        status: "Valid",
        submission_date: new Date().toISOString().split('T')[0],
        expiry_date: "",
        notes: "",
      });
      setDocumentFile(null);
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add document"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPolicy = async (data: z.infer<typeof policyFormSchema>) => {
    if (!currentCrecheId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No creche associated with current user"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = null;
      if (policyFile) {
        fileUrl = await uploadFile(policyFile, `policies/${currentCrecheId}`);
      }

      const { error } = await supabase
        .from('creche_policies')
        .insert({
          ...data,
          file_url: fileUrl,
          creche_id: currentCrecheId
        });

      if (error) throw error;

      toast({
        title: "Policy Added",
        description: `${data.policy_name} has been added to policy records`,
      });
      
      refetchPolicies();
      setIsAddPolicyOpen(false);
      policyForm.reset({
        policy_name: "",
        policy_type: "admissions",
        status: "Current",
        last_updated: new Date().toISOString().split('T')[0],
        review_due: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        notes: "",
      });
      setPolicyFile(null);
    } catch (error) {
      console.error("Error adding policy:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add policy"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDocument = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "No Document",
        description: "No document file is attached to this record"
      });
    }
  };

  if (documentsError || policiesError) {
    return (
      <div className="p-6 rounded-md bg-red-50 text-red-500">
        <h3 className="text-lg font-medium">Error loading compliance data</h3>
        <p className="mt-1 text-sm">{documentsError?.message || policiesError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance & Registration Reports</h2>
          <p className="text-muted-foreground">
            Track registration renewal and regulatory compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="registration" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registration">Registration & Certificates</TabsTrigger>
          <TabsTrigger value="policies">Policies & Procedures</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registration">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registration Renewal Status</CardTitle>
                <CardDescription>Key documents and certificates for regulatory compliance</CardDescription>
              </div>
              <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Compliance Document</DialogTitle>
                  </DialogHeader>
                  <Form {...documentForm}>
                    <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className="space-y-4">
                      <FormField
                        control={documentForm.control}
                        name="document_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={documentForm.control}
                        name="document_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="registration">Registration Certificate</SelectItem>
                                <SelectItem value="fire_safety">Fire Safety Certificate</SelectItem>
                                <SelectItem value="health_hygiene">Health & Hygiene Certificate</SelectItem>
                                <SelectItem value="building_compliance">Building Compliance</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={documentForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Valid">Valid</SelectItem>
                                <SelectItem value="Submitted">Submitted</SelectItem>
                                <SelectItem value="Updated">Updated</SelectItem>
                                <SelectItem value="Expired">Expired</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={documentForm.control}
                          name="submission_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Submission Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={documentForm.control}
                          name="expiry_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={documentForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="document-file">Document File (PDF)</Label>
                        <Input 
                          id="document-file"
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setDocumentFile(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Document"
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationData && registrationData.length > 0 ? (
                      registrationData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.document_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {item.status === "Valid" || item.status === "Submitted" || item.status === "Updated" ? (
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                              )}
                              {item.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.submission_date ? format(new Date(item.submission_date), "MMM dd, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            {item.expiry_date ? format(new Date(item.expiry_date), "MMM dd, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>{item.notes || "N/A"}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDocument(item.file_url)}
                              disabled={!item.file_url}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No compliance documents found. Add your first document to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Policies & Procedures</CardTitle>
                <CardDescription>Center policies documentation and review status</CardDescription>
              </div>
              <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Policy
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Policy Document</DialogTitle>
                  </DialogHeader>
                  <Form {...policyForm}>
                    <form onSubmit={policyForm.handleSubmit(onSubmitPolicy)} className="space-y-4">
                      <FormField
                        control={policyForm.control}
                        name="policy_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={policyForm.control}
                        name="policy_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select policy type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admissions">Admissions Policy</SelectItem>
                                <SelectItem value="child_protection">Child Protection Policy</SelectItem>
                                <SelectItem value="emergency">Emergency & Evacuation</SelectItem>
                                <SelectItem value="health_safety">Health & Safety</SelectItem>
                                <SelectItem value="code_of_conduct">Code of Conduct</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={policyForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Current">Current</SelectItem>
                                <SelectItem value="Needs Review">Needs Review</SelectItem>
                                <SelectItem value="Under Review">Under Review</SelectItem>
                                <SelectItem value="Outdated">Outdated</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={policyForm.control}
                          name="last_updated"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Updated</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={policyForm.control}
                          name="review_due"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review Due</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={policyForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="policy-file">Policy Document (PDF)</Label>
                        <Input 
                          id="policy-file"
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setPolicyFile(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Policy"
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingPolicies ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Next Review Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policyData && policyData.length > 0 ? (
                      policyData.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">{policy.policy_name}</TableCell>
                          <TableCell>{format(new Date(policy.last_updated), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{format(new Date(policy.review_due), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {policy.status === "Current" ? (
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                              )}
                              {policy.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDocument(policy.file_url)}
                              disabled={!policy.file_url}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No policy documents found. Add your first policy to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReport;
