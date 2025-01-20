import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";

const Finance = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Pending Payments",
      value: "$3,452",
      icon: CreditCard,
      description: "7 pending invoices",
    },
    {
      title: "Growth",
      value: "+12.5%",
      icon: TrendingUp,
      description: "From last month",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finance Reports</h2>
        <p className="text-muted-foreground">
          View and manage financial reports and transactions
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

export default Finance;