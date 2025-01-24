import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crecheData, setCrecheData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    dailyFee: "",
    monthlyFee: "",
    weeklyFee: "",
  });

  useEffect(() => {
    loadUserCreche();
  }, []);

  const loadUserCreche = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Loading creche for user:", user.id);

      // First get all creches for this user
      const { data: userCreches, error: userCrecheError } = await supabase
        .from('user_creche')
        .select('creche_id')
        .eq('user_id', user.id);

      if (userCrecheError) {
        console.error("Error fetching user creches:", userCrecheError);
        throw userCrecheError;
      }

      console.log("User creches:", userCreches);

      if (userCreches && userCreches.length > 0) {
        // For now, we'll just use the first creche
        const firstCrecheId = userCreches[0].creche_id;

        const { data: creche, error: crecheError } = await supabase
          .from('creches')
          .select('*')
          .eq('id', firstCrecheId)
          .single();

        if (crecheError) {
          console.error("Error fetching creche details:", crecheError);
          throw crecheError;
        }

        console.log("Loaded creche data:", creche);

        setCrecheData(creche);
        setEditForm({
          dailyFee: creche.price?.toString() || "",
          monthlyFee: creche.monthly_price?.toString() || "",
          weeklyFee: creche.weekly_price?.toString() || "",
        });
      } else {
        console.log("No creches found for user");
        toast({
          variant: "destructive",
          title: "No creche assigned",
          description: "You are not assigned to any creche",
        });
      }
    } catch (error) {
      console.error('Error loading creche:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creche data",
      });
    }
  };

  const handleQuickEdit = async () => {
    try {
      if (!crecheData) return;

      const { error } = await supabase
        .from('creches')
        .update({
          price: parseFloat(editForm.dailyFee) || null,
          monthly_price: parseFloat(editForm.monthlyFee) || null,
          weekly_price: parseFloat(editForm.weeklyFee) || null,
        })
        .eq('id', crecheData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Creche prices updated successfully",
      });
      setIsEditing(false);
      loadUserCreche();
    } catch (error) {
      console.error('Error updating creche:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update creche prices",
      });
    }
  };

  const applications = {
    received: 5,
    pending: 10,
    toBeContacted: 3,
  };

  const students = {
    gradeR: 15,
    grade0: 12,
    afterCare: 20,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">Welcome to your Creche dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Applications Card */}
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-secondary">
              My Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Mail className="h-4 w-4" />
                Received
              </span>
              <span className="font-bold">{applications.received}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Clock className="h-4 w-4" />
                Pending
              </span>
              <span className="font-bold">{applications.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Users className="h-4 w-4" />
                To be contacted
              </span>
              <span className="font-bold">{applications.toBeContacted}</span>
            </div>
          </CardContent>
        </Card>

        {/* Creche Profile Card */}
        {crecheData && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg md:text-xl text-primary">
                My Creche Profile
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/dashboard/creche/${crecheData.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <PenSquare className="h-4 w-4" />
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
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm md:text-base">
                  <span>Daily fee:</span>
                  <span className="font-bold">R{crecheData?.price || 0}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>Weekly fee:</span>
                  <span className="font-bold">R{crecheData?.weekly_price || 0}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>Monthly fee:</span>
                  <span className="font-bold">R{crecheData?.monthly_price || 0}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm md:text-base">Capacity:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                  <div>Total: {crecheData?.capacity || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Card */}
        <Card className="border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-accent">My Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <GraduationCap className="h-4 w-4" />
                Grade R
              </span>
              <span className="font-bold">{students.gradeR}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Building2 className="h-4 w-4" />
                Grade 0
              </span>
              <span className="font-bold">{students.grade0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm md:text-base">
                <Clock className="h-4 w-4" />
                After-care
              </span>
              <span className="font-bold">{students.afterCare}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;