import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationNote } from "@/types/application";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ApplicationNotesProps {
  notes: ApplicationNote[];
  onAddNote: (note: string) => Promise<void>;
}

export const ApplicationNotes = ({ notes, onAddNote }: ApplicationNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddNote(newNote);
      setNewNote("");
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
          Add Note
        </Button>
      </div>

      {/* Notes list */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <div className="bg-primary text-white rounded-full w-full h-full flex items-center justify-center">
                {note.user?.first_name?.[0] || note.user?.email?.[0] || 'U'}
              </div>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  {note.user?.display_name || note.user?.email || 'Unknown User'}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};