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
  Mail,
  Clock,
  GraduationCap,
  Building2,
  Eye,
  PenSquare,
  Calendar,
  Plus,
  Edit,
  TrendingUp,
  FileText,
  DollarSign,
  UserPlus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  ApplicationsCardSkeleton,
  CrecheProfileCardSkeleton,
  StudentsCardSkeleton,
  UpcomingEventsCardSkeleton,
} from "@/components/dashboard/DashboardSkeletons";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crecheData, setCrecheData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    dailyFee: "",
    monthlyFee: "",
    weeklyFee: "",
  });
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
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidAmount: 0,
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
      const [crecheResult, eventsResult, studentsResult, applicationsResult, invoicesResult] = await Promise.all([
        supabase.from("creches").select("*").eq("id", assignedCrecheId).single(),
        supabase.from("events").select("*").eq("creche_id", assignedCrecheId).gte("start", new Date().toISOString()).order("start", { ascending: true }).limit(5),
        supabase.from("students").select("id, fees_owed, fees_paid").eq("creche_id", assignedCrecheId),
        supabase.from("applications").select("id, application_status, lifecycle_stage").eq("creche_id", assignedCrecheId),
        supabase.from("invoices").select("id, status, total_amount").eq("creche_id", assignedCrecheId),
      ]);

      if (crecheResult.error) throw crecheResult.error;
      const creche = crecheResult.data;
      setCrecheData(creche);
      setEditForm({
        dailyFee: creche.price?.toString() || "",
        monthlyFee: creche.monthly_price?.toString() || "",
        weeklyFee: creche.weekly_price?.toString() || "",
      });

      if (!eventsResult.error) {
        setUpcomingEvents(eventsResult.data || []);
      }

      // Calculate stats
      const students = studentsResult.data || [];
      const applications = applicationsResult.data || [];
      const invoices = invoicesResult.data || [];

      const totalStudents = students.length;
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(a => a.lifecycle_stage === "New" || a.lifecycle_stage === "Contacted").length;
      const approvedApplications = applications.filter(a => a.lifecycle_stage === "Documents Received").length;
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(i => i.status === "paid").length;
      const unpaidAmount = invoices.filter(i => i.status !== "paid").reduce((sum, i) => sum + (i.total_amount || 0), 0);
      const capacityUsed = creche.capacity ? Math.round((totalStudents / creche.capacity) * 100) : 0;

      setStats({
        totalStudents,
        totalApplications,
        pendingApplications,
        approvedApplications,
        totalInvoices,
        paidInvoices,
        unpaidAmount,
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

  // Handle quick edit of creche prices
  const handleQuickEdit = async () => {
    try {
      if (!crecheData) return;

      // Update creche prices in the database
      const { error } = await supabase
        .from('creches')
        .update({
          price: parseFloat(editForm.dailyFee) || null,
          monthly_price: parseFloat(editForm.monthlyFee) || null,
          weekly_price: parseFloat(editForm.weeklyFee) || null,
        })
        .eq('id', crecheData.id);

      if (error) throw error;

      // Update local state instead of refetching
      setCrecheData((prev) => ({
        ...prev,
        price: parseFloat(editForm.dailyFee) || null,
        monthly_price: parseFloat(editForm.monthlyFee) || null,
        weekly_price: parseFloat(editForm.weeklyFee) || null,
      }));

      toast({
        title: "Success",
        description: "Creche prices updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating creche:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update creche prices",
      });
    }
  };

  // Sync edit form with creche data when editing starts
  useEffect(() => {
    if (isEditing && crecheData) {
      setEditForm({
        dailyFee: crecheData.price?.toString() || "",
        monthlyFee: crecheData.monthly_price?.toString() || "",
        weeklyFee: crecheData.weekly_price?.toString() || "",
      });
    }
  }, [isEditing, crecheData]);

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

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {crecheData?.capacity && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Capacity</span>
                  <span>{stats.capacityUsed}%</span>
                </div>
                <Progress value={stats.capacityUsed} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Applications</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700">{stats.pendingApplications} pending</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-700">{stats.approvedApplications} approved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Invoices</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalInvoices}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs">{stats.paidInvoices} paid</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Outstanding</p>
                <p className="text-3xl font-bold text-orange-600">R{stats.unpaidAmount.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <Button variant="link" className="p-0 h-auto mt-2 text-xs" onClick={() => navigate('/dashboard/finance')}>
              View all invoices →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Total Received
                </span>
                <span className="font-bold text-lg">{stats.totalApplications}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                <span className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pending Review
                </span>
                <span className="font-bold text-lg text-yellow-600">{stats.pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <span className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Ready to Enroll
                </span>
                <span className="font-bold text-lg text-green-600">{stats.approvedApplications}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Creche Profile Card */}
        {isLoading ? (
          <CrecheProfileCardSkeleton />
        ) : crecheData ? (
          <Card className="border border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                Creche Profile
              </CardTitle>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <PenSquare className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quick Edit Prices</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="dailyFee">Daily Fee</Label>
                      <Input
                        id="dailyFee"
                        value={editForm.dailyFee}
                        onChange={(e) => setEditForm(prev => ({ ...prev, dailyFee: e.target.value }))}
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weeklyFee">Weekly Fee</Label>
                      <Input
                        id="weeklyFee"
                        value={editForm.weeklyFee}
                        onChange={(e) => setEditForm(prev => ({ ...prev, weeklyFee: e.target.value }))}
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyFee">Monthly Fee</Label>
                      <Input
                        id="monthlyFee"
                        value={editForm.monthlyFee}
                        onChange={(e) => setEditForm(prev => ({ ...prev, monthlyFee: e.target.value }))}
                        type="number"
                      />
                    </div>
                    <Button onClick={handleQuickEdit} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Daily</p>
                  <p className="text-lg font-bold">R{crecheData?.price || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Weekly</p>
                  <p className="text-lg font-bold">R{crecheData?.weekly_price || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Monthly</p>
                  <p className="text-lg font-bold">R{crecheData?.monthly_price || 0}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Capacity</span>
                  <span className="font-bold">{stats.totalStudents} / {crecheData?.capacity || 0}</span>
                </div>
                <Progress value={stats.capacityUsed} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Students Card */}
        {isLoading ? (
          <StudentsCardSkeleton />
        ) : (
          <Card className="border border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-accent-foreground" />
                </div>
                Students
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/students`)}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Total Enrolled
                </span>
                <span className="font-bold text-lg">{stats.totalStudents}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalStudents}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 text-center">
                  <p className="text-xs text-muted-foreground">Capacity Left</p>
                  <p className="text-xl font-bold text-green-600">{(crecheData?.capacity || 0) - stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Events Card */}
      {isLoading ? (
        <UpcomingEventsCardSkeleton />
      ) : (
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
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
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors relative group"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatEventDate(event.start).split(' ')[1]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatEventDate(event.start).split(' ')[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-500">{event.description}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3"
                      onClick={() => openEditEventDialog(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No upcoming events scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
