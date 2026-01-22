import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Building2,
  Calendar,
  Plus,
  Edit,
  UserPlus,
} from "lucide-react";
import {
  ApplicationsCardSkeleton,
  UpcomingEventsCardSkeleton,
} from "@/components/dashboard/DashboardSkeletons";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crecheData, setCrecheData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    start: "",
    location: "",
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    capacityUsed: 0,
  });

  // Load all dashboard data in one function
  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      const { data: userCreches, error: userCrecheError } = await supabase
        .from("user_creche")
        .select("creche_id")
        .eq("user_id", user.id);

      if (userCrecheError || !userCreches?.length) {
        setIsAuthorized(false);
        toast({ variant: "destructive", title: "Access Denied", description: "You are not assigned to any creche." });
        return;
      }

      const assignedCrecheId = userCreches[0].creche_id;
      
      // Fetch all data in parallel
      const [crecheResult, eventsResult, studentsResult, applicationsResult] = await Promise.all([
        supabase.from("creches").select("*").eq("id", assignedCrecheId).single(),
        supabase.from("events").select("*").eq("creche_id", assignedCrecheId).gte("start", new Date().toISOString()).order("start", { ascending: true }).limit(5),
        supabase.from("students").select("id").eq("creche_id", assignedCrecheId),
        supabase.from("applications").select("id, application_status, lifecycle_stage").eq("creche_id", assignedCrecheId),
      ]);

      if (crecheResult.error) throw crecheResult.error;
      const creche = crecheResult.data;
      setCrecheData(creche);

      if (!eventsResult.error) {
        setUpcomingEvents(eventsResult.data || []);
      }

      // Calculate stats
      const students = studentsResult.data || [];
      const applications = applicationsResult.data || [];

      const totalStudents = students.length;
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(a => a.lifecycle_stage === "New" || a.lifecycle_stage === "Contacted").length;
      const approvedApplications = applications.filter(a => a.lifecycle_stage === "Documents Received").length;
      const capacityUsed = creche.capacity ? Math.round((totalStudents / creche.capacity) * 100) : 0;

      setStats({
        totalStudents,
        totalApplications,
        pendingApplications,
        approvedApplications,
        capacityUsed,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format event date
  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle adding a new event
  const handleAddEvent = async () => {
    try {
      if (!crecheData) return;

      const startDate = new Date(eventForm.start);
      const endTime = new Date(startDate);
      endTime.setHours(startDate.getHours() + 1);

      const { error } = await supabase
        .from('events')
        .insert([
          {
            title: eventForm.title,
            description: eventForm.description,
            start: startDate.toISOString(),
            end_time: endTime.toISOString(),
            location: eventForm.location,
            creche_id: crecheData.id,
            all_day: false,
            color_code: "#2563eb"
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setIsAddEventOpen(false);
      setEventForm({
        title: "",
        description: "",
        start: "",
        location: "",
      });
      
      // Reload events
      loadDashboardData();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event",
      });
    }
  };

  // Handle editing an event
  const handleEditEvent = async () => {
    try {
      if (!crecheData || !selectedEvent) return;

      const startDate = new Date(eventForm.start);
      const endTime = new Date(startDate);
      endTime.setHours(startDate.getHours() + 1);

      const { error } = await supabase
        .from('events')
        .update({
          title: eventForm.title,
          description: eventForm.description,
          start: startDate.toISOString(),
          end_time: endTime.toISOString(),
          location: eventForm.location,
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      setIsEditEventOpen(false);
      setSelectedEvent(null);
      setEventForm({
        title: "",
        description: "",
        start: "",
        location: "",
      });
      
      // Reload events
      loadDashboardData();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
    }
  };

  // Open edit event dialog with selected event data
  const openEditEventDialog = (event) => {
    setSelectedEvent(event);
    
    // Format datetime string for datetime-local input
    const startDateTime = new Date(event.start);
    const formattedStart = startDateTime.toISOString().slice(0, 16);
    
    setEventForm({
      title: event.title,
      description: event.description || "",
      start: formattedStart,
      location: event.location || "",
    });
    
    setIsEditEventOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center">
            <img
              src={crecheData?.logo || "/lovable-uploads/b36d0e6b-5fa8-43e2-b837-5d0b3de9e849.png"}
              alt="Creche Logo"
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {crecheData?.name || "Loading..."}
            </h1>
            <p className="text-muted-foreground">Welcome to your dashboard</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/dashboard/creche/${crecheData?.id}`)}>
          <Building2 className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </div>

      {/* Main Layout - Left cards stacked, Right events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stacked Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Total Students Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Students</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Active: <span className="font-semibold text-blue-600">{stats.totalStudents}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Capacity Left: <span className="font-semibold text-green-600">{(crecheData?.capacity || 0) - stats.totalStudents}</span>
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              {crecheData?.capacity && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Capacity</span>
                    <span>{stats.capacityUsed}%</span>
                  </div>
                  <Progress value={stats.capacityUsed} className="h-2" />
                </div>
              )}
              <Button variant="ghost" size="sm" className="mt-3 p-0" onClick={() => navigate(`/dashboard/students`)}>
                View All Students →
              </Button>
            </CardContent>
          </Card>

          {/* Applications Card */}
          {isLoading ? (
            <ApplicationsCardSkeleton />
          ) : (
            <Card className="border border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-secondary" />
                  </div>
                  Applications
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/applications`)}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Received</p>
                    <p className="text-3xl font-bold">{stats.totalApplications}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-yellow-500/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-green-500/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Ready to Enroll</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approvedApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Upcoming Events */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <UpcomingEventsCardSkeleton />
          ) : (
            <Card className="border-2 border-primary/20 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Event Title</Label>
                        <Input
                          id="event-title"
                          value={eventForm.title}
                          onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter event title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea
                          id="event-description"
                          value={eventForm.description}
                          onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter event description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date & Time</Label>
                        <Input
                          id="event-date"
                          type="datetime-local"
                          value={eventForm.start}
                          onChange={(e) => setEventForm(prev => ({ ...prev, start: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-location">Location (Optional)</Label>
                        <Input
                          id="event-location"
                          value={eventForm.location}
                          onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter event location"
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddEvent} disabled={!eventForm.title || !eventForm.start}>
                        Add Event
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors relative group"
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          <div className="text-xl font-bold text-primary">
                            {formatEventDate(event.start).split(' ')[1]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatEventDate(event.start).split(' ')[0]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => openEditEventDialog(event)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event-title">Event Title</Label>
              <Input
                id="edit-event-title"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-description">Description</Label>
              <Textarea
                id="edit-event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-date">Date & Time</Label>
              <Input
                id="edit-event-date"
                type="datetime-local"
                value={eventForm.start}
                onChange={(e) => setEventForm(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-location">Location (Optional)</Label>
              <Input
                id="edit-event-location"
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter event location"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>Cancel</Button>
            <Button onClick={handleEditEvent} disabled={!eventForm.title || !eventForm.start}>
              Update Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
