import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { ApplicationNote } from "@/types/application";

export const ApplicationNotes = () => {
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Extract applicationId from URL
  const getApplicationIdFromUrl = (url: string) => {
    const match = url.match(/applications\/([^/]+)/); // Extracting applicationId from "/applications/:id"
    return match ? match[1] : null;
  };

  const applicationId = getApplicationIdFromUrl(location.pathname);
  console.log("📌 Extracted applicationId:", applicationId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("🔥 Error fetching user:", error);
        return;
      }
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!applicationId) {
      console.warn("⚠️ No applicationId found in URL.");
      return;
    }
    fetchNotes();
  }, [applicationId]);

  const fetchNotes = async () => {
    if (!applicationId) {
      console.error("❌ Cannot fetch notes: applicationId is missing!");
      return;
    }

    console.log("🚀 Fetching notes for applicationId:", applicationId);
    try {
      const { data, error } = await supabase
      .from("application_notes")
      .select(`
        id, note, created_at, 
        users!application_notes_user_id_fkey ( id, email, first_name, last_name, role_id )
      `)
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });
    

      if (error) throw error;

      setNotes(data || []);
      console.log("✅ Notes fetched successfully:", data);
    } catch (error) {
      console.error("🔥 Error fetching notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch application notes",
      });
    }
  };

  const handleAddNote = async (note: string) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    if (!applicationId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Application ID is missing",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("application_notes")
        .insert([{ application_id: applicationId, user_id: userId, note }]);

      if (error) throw error;

      await fetchNotes(); // Refresh notes list
      setNewNote(""); // Clear input
    } catch (error) {
      console.error("🔥 Error adding note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note",
      });
    }
  };

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await handleAddNote(newNote);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Application Notes</h3>

      {/* Add new note */}
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="min-h-[100px]"
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !newNote.trim()}
          className="w-full"
        >
          {isSubmitting ? "Adding..." : "Add Note"}
        </Button>
      </div>

      {/* Notes list */}
      <div className="space-y-4 mt-6">
        {notes.map((note) => (
          <div key={note.id} className="flex space-x-3 p-4 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <div className="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center text-sm font-semibold">
                {note.user?.first_name?.[0] || note.user?.email?.[0] || "U"}
              </div>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">
                      {note.user?.first_name || note.user?.email || "Unknown User"}
                    </h4>
                    {note.user?.role?.role_name && (
                      <Badge variant="secondary" className="text-xs">
                        {note.user.role.role_name}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{note.note}</p>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No notes yet. Be the first to add a note.
          </p>
        )}
      </div>
    </div>
  );
};
