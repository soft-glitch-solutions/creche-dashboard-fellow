import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Users, Mail, Phone, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface WaitingListItem {
  id: string;
  application_id: string;
  class_id: string;
  position: number;
  status: string;
  notes: string | null;
  created_at: string;
  application: {
    id: string;
    parent_name: string;
    parent_email: string;
    parent_phone_number: string;
    message: string;
  };
  creche_class: {
    id: string;
    name: string;
    color: string;
    capacity: number;
    min_age_months: number;
    max_age_months: number;
  };
}

interface CrecheClass {
  id: string;
  name: string;
  color: string;
  capacity: number;
  enrolled_count: number;
}

const WaitingList = () => {
  const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
  const [classes, setClasses] = useState<CrecheClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userCreche, setUserCreche] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserCreche = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userCrecheData } = await supabase
          .from('user_creche')
          .select('creche_id')
          .eq('user_id', user.id)
          .single();
        
        if (userCrecheData) {
          setUserCreche(userCrecheData.creche_id);
        }
      }
    };
    getUserCreche();
  }, []);

  useEffect(() => {
    if (userCreche) {
      fetchWaitingList();
      fetchClasses();
    }
  }, [userCreche]);

  const fetchClasses = async () => {
    if (!userCreche) return;

    const { data: classesData, error } = await supabase
      .from("creche_classes")
      .select("*")
      .eq("creche_id", userCreche);

    if (error) {
      console.error("Error fetching classes:", error);
      return;
    }

    // Get enrollment counts
    const classesWithCounts = await Promise.all(
      (classesData || []).map(async (cls) => {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id);

        return {
          ...cls,
          enrolled_count: count || 0,
        };
      })
    );

    setClasses(classesWithCounts);
  };

  const fetchWaitingList = async () => {
    if (!userCreche) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("application_waiting_list")
        .select(`
          *,
          application:applications(id, parent_name, parent_email, parent_phone_number, message),
          creche_class:creche_classes(id, name, color, capacity, min_age_months, max_age_months)
        `)
        .eq("creche_id", userCreche)
        .eq("status", "waiting")
        .order("class_id")
        .order("position");

      if (error) throw error;
      setWaitingList(data || []);
    } catch (error) {
      console.error("Error fetching waiting list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch waiting list"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePosition = async (id: string, direction: "up" | "down") => {
    const item = waitingList.find(w => w.id === id);
    if (!item) return;

    const classItems = waitingList.filter(w => w.class_id === item.class_id);
    const currentIndex = classItems.findIndex(w => w.id === id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= classItems.length) return;

    const swapItem = classItems[newIndex];

    try {
      await supabase
        .from("application_waiting_list")
        .update({ position: swapItem.position })
        .eq("id", id);

      await supabase
        .from("application_waiting_list")
        .update({ position: item.position })
        .eq("id", swapItem.id);

      fetchWaitingList();
    } catch (error) {
      console.error("Error updating position:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update position"
      });
    }
  };

  const offerSpot = async (id: string) => {
    try {
      await supabase
        .from("application_waiting_list")
        .update({ status: "offered" })
        .eq("id", id);

      toast({
        title: "Spot Offered",
        description: "The applicant has been notified of the available spot"
      });
      fetchWaitingList();
    } catch (error) {
      console.error("Error offering spot:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to offer spot"
      });
    }
  };

  const removeFromWaitingList = async (id: string) => {
    try {
      await supabase
        .from("application_waiting_list")
        .update({ status: "declined" })
        .eq("id", id);

      toast({
        title: "Removed",
        description: "Application removed from waiting list"
      });
      fetchWaitingList();
    } catch (error) {
      console.error("Error removing from waiting list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from waiting list"
      });
    }
  };

  const filteredWaitingList = selectedClass === "all" 
    ? waitingList 
    : waitingList.filter(w => w.class_id === selectedClass);

  const groupedByClass = filteredWaitingList.reduce((acc, item) => {
    const classId = item.class_id;
    if (!acc[classId]) {
      acc[classId] = {
        classInfo: item.creche_class,
        items: []
      };
    }
    acc[classId].items.push(item);
    return acc;
  }, {} as Record<string, { classInfo: WaitingListItem['creche_class'], items: WaitingListItem[] }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/applications")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Waiting List</h1>
            <p className="text-muted-foreground">Manage applications waiting for available spots</p>
          </div>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                  {cls.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Class capacity overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {classes.map(cls => {
          const waitingCount = waitingList.filter(w => w.class_id === cls.id).length;
          const isFull = cls.enrolled_count >= cls.capacity;
          return (
            <Card key={cls.id} className="border-l-4" style={{ borderLeftColor: cls.color }}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      <Users className="inline h-3 w-3 mr-1" />
                      {cls.enrolled_count}/{cls.capacity} enrolled
                    </p>
                  </div>
                  {isFull ? (
                    <Badge variant="destructive">Full</Badge>
                  ) : (
                    <Badge variant="secondary">{cls.capacity - cls.enrolled_count} spots</Badge>
                  )}
                </div>
                {waitingCount > 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {waitingCount} waiting
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : Object.keys(groupedByClass).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Applications in Waiting List</h3>
            <p className="text-muted-foreground">
              Applications will appear here when classes are at capacity
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByClass).map(([classId, { classInfo, items }]) => (
            <Card key={classId}>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: classInfo.color }} />
                  <CardTitle>{classInfo.name}</CardTitle>
                  <Badge variant="outline">{items.length} waiting</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updatePosition(item.id, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold text-muted-foreground">#{item.position}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updatePosition(item.id, "down")}
                          disabled={index === items.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-medium">{item.application.parent_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {item.application.parent_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.application.parent_phone_number}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => offerSpot(item.id)}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Offer Spot
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/dashboard/applications/${item.application_id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => removeFromWaitingList(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaitingList;
