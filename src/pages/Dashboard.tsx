import { Card } from "@/components/ui/card";
import { Users, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const stats = [
    {
      label: "Total Students",
      value: "156",
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Monthly Revenue",
      value: "$45,231",
      icon: DollarSign,
      color: "bg-secondary/10 text-secondary",
    },
    {
      label: "Reports Due",
      value: "3",
      icon: FileText,
      color: "bg-accent/10 text-accent",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Creche dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-lg", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;