import { Card } from "@/components/ui/card";
import { GraduationCap, UserPlus, Users } from "lucide-react";

const Students = () => {
  const stats = [
    {
      title: "Total Students",
      value: "156",
      icon: Users,
      description: "Active enrollments",
    },
    {
      title: "New Applications",
      value: "12",
      icon: UserPlus,
      description: "Pending review",
    },
    {
      title: "Graduates",
      value: "45",
      icon: GraduationCap,
      description: "This year",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">
          Manage student enrollments and applications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <stat.icon className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Students;