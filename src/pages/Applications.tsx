import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus } from "lucide-react";

const Applications = () => {
  const applications = [
    {
      status: "Received",
      studentNo: "NDXDEL003",
      action: "Click to view",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
    {
      status: "Pending documents",
      studentNo: "NDXDEL003",
      action: "Click to view",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
    {
      status: "Approved",
      studentNo: "NDXDEL003",
      action: "Contact Parent",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
    {
      status: "Rejected",
      studentNo: "NDXDEL003",
      action: "Reason:",
      bgColor: "bg-blue-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-primary">Applications</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {applications.map((app, index) => (
          <Card key={index} className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">
                {app.status}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${app.bgColor} p-4 rounded-lg space-y-2`}>
                <p className="text-gray-700">Student no: {app.studentNo}</p>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto hover:bg-transparent hover:text-purple-700"
                >
                  <span className={`${app.textColor} underline flex items-center gap-2`}>
                    {app.action}
                    {app.action === "Contact Parent" ? (
                      <UserPlus className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Applications;