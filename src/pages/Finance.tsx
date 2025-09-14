import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Eye, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { StatsCardSkeleton, InvoicesTableSkeleton } from "@/components/finance/FinanceSkeletons";

interface Invoice {
  id: string;
  title: string;
  status: string;
  total_amount: number;
  created_at: string;
  prepared_for: string;
}

const Finance = () => {
  const navigate = useNavigate();
  const [userCreche, setUserCreche] = useState<string | null>(null);

  // Get user's creche
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
          console.log("User's creche:", userCrecheData.creche_id);
        }
      }
    };

    getUserCreche();
  }, []);

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', userCreche],
    queryFn: async () => {
      if (!userCreche) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('creche_id', userCreche)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }

      return data as Invoice[];
    },
    enabled: !!userCreche
  });

  const stats = [
    {
      title: "Total Revenue",
      value: "R" + invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2),
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Pending Payments",
      value: "R" + invoices.filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2),
      icon: CreditCard,
      description: invoices.filter(inv => inv.status === 'pending').length + " pending invoices",
    },
    {
      title: "Growth",
      value: "+12.5%",
      icon: TrendingUp,
      description: "From last month",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-primary">Finance</h1>
        <p className="text-muted-foreground">
          View and manage financial reports and transactions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))
        ) : (
          stats.map((stat) => (
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
          ))
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Recent Invoices</h3>
          <Button 
            onClick={() => navigate('/dashboard/finance/create-invoice')}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {isLoading ? (
          <InvoicesTableSkeleton />
        ) : invoices.length === 0 ? (
          <Card className="p-6">
              <InvoicesTableSkeleton />
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 font-semibold text-sm text-gray-500">
                <div>Invoice #</div>
                <div>Parent</div>
                <div>Amount</div>
                <div>Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {invoices.map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-6 gap-4 py-3 border-b text-sm">
                  <div className="font-medium">{invoice.id.slice(0, 8)}</div>
                  <div>{invoice.prepared_for}</div>
                  <div>R{invoice.total_amount?.toFixed(2) || '0.00'}</div>
                  <div>{new Date(invoice.created_at).toLocaleDateString()}</div>
                  <div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/finance/invoice/${invoice.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/finance/invoice/${invoice.id}/pdf`)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Finance;