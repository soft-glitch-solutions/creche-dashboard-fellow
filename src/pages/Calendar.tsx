
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end_time: string;
  all_day: boolean;
  color_code: string;
  location?: string;
  priority?: string;
  creche_id?: string;
}

const eventCategories = [
  { label: "Meeting", value: "meeting" },
  { label: "Holiday", value: "holiday" },
  { label: "Conference", value: "conference" },
  { label: "Birthday", value: "birthday" },
];

const colorOptions = [
  { label: "Blue", value: "#2563eb" },
  { label: "Red", value: "#dc2626" },
  { label: "Green", value: "#16a34a" },
  { label: "Purple", value: "#9333ea" },
];

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    start_time: "",
    end_time: "",
    all_day: false,
    category: "",
    color: "#2563eb",
  });
  const { toast } = useToast();
  const [view, setView] = useState<"month" | "week" | "day" | "list">("month");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('calendar-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('Calendar change received:', payload);
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche) return;

      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('creche_id', userCreche.creche_id);

      if (error) throw error;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events",
      });
    }
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);
    try {
      const { data: userCreche } = await supabase
        .from('user_creche')
        .select('creche_id')
        .single();

      if (!userCreche) throw new Error('No creche found for user');

      const startDateTime = `${newEvent.date.toISOString().split('T')[0]}T${newEvent.start_time}:00`;
      const endDateTime = `${newEvent.date.toISOString().split('T')[0]}T${newEvent.end_time}:00`;

      const { error } = await supabase
        .from('events')
        .insert([
          {
            title: newEvent.title,
            description: newEvent.description,
            start: startDateTime,
            end_time: endDateTime,
            all_day: newEvent.all_day,
            color_code: newEvent.color,
            priority: newEvent.category,
            creche_id: userCreche.creche_id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setIsCreateEventOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: new Date(),
        start_time: "",
        end_time: "",
        all_day: false,
        category: "",
        color: "#2563eb",
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaySelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setNewEvent(prev => ({ 
        ...prev, 
        date: selectedDate,
        start_time: "09:00",
        end_time: "10:00" 
      }));
      setIsCreateEventOpen(true);
    }
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div 
            key={day.toISOString()} 
            className="min-h-[200px] border rounded-lg p-2 cursor-pointer"
            onClick={() => handleDaySelect(day)}
          >
            <h3 className="text-sm font-medium mb-2">{format(day, 'EEE d')}</h3>
            <div className="space-y-1">
              {events
                .filter((event) => isSameDay(parseISO(event.start), day))
                .map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded"
                    style={{ backgroundColor: event.color_code }}
                  >
                    {event.title}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter((event) => 
      isSameDay(parseISO(event.start), date)
    );

    return (
      <div className="space-y-2">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="p-2 rounded-lg"
            style={{ backgroundColor: event.color_code }}
          >
            <p className="font-medium">{event.title}</p>
            <p className="text-sm">
              {format(parseISO(event.start), 'HH:mm')} - 
              {format(parseISO(event.end_time), 'HH:mm')}
            </p>
            {event.description && (
              <p className="text-sm mt-1">{event.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-3 border rounded-lg flex items-center gap-4"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: event.color_code }}
            />
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(event.start), 'PPP HH:mm')}
              </p>
              {event.description && (
                <p className="text-sm mt-1">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-md border">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("day")}
            >
              Day
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-6">
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Create event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Event for {format(newEvent.date, 'MMMM dd, yyyy')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="all-day"
                        checked={newEvent.all_day}
                        onCheckedChange={(checked) => 
                          setNewEvent({ ...newEvent, all_day: checked as boolean })
                        }
                      />
                      <Label htmlFor="all-day">All Day</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      disabled={newEvent.all_day}
                    />
                    <Input
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                      disabled={newEvent.all_day}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color *</Label>
                    <Select
                      value={newEvent.color}
                      onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateEventOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-muted-foreground">No Upcoming Events</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color_code }}
                      />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(event.start), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventCategories.map((category) => (
                  <div
                    key={category.value}
                    className="flex items-center gap-2"
                  >
                    <Checkbox id={category.value} />
                    <Label htmlFor={category.value}>{category.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setDate(addDays(date, -1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setDate(addDays(date, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {format(date, 'MMMM yyyy')}
                  </h2>
                </div>
              </div>
              
              {view === "month" && (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDaySelect}
                  className="rounded-md border"
                />
              )}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
              {view === "list" && renderListView()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
