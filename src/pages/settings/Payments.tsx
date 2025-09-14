import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { CreditCard, DollarSign, Calendar, CheckCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Payments = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [config, setConfig] = useState({
    enablePayments: true,
    allowGuestCheckout: false,
    currency: 'ZAR',
    taxRate: 15,
    freePrice: 0,
    basicPrice: 149,
    proPrice: 299,
    enableSubscriptions: true,
    enableOneTimePayments: true,
    billingDescription: 'Monthly billing',
    successUrl: '/payment-success',
    cancelUrl: '/payment-canceled'
  });

  useEffect(() => {
    checkAdminStatus();
    fetchPaymentConfig();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('roles(role_name)')
      .eq('id', user.id)
      .single();

    setIsAdmin(
      userData?.roles?.role_name === 'Administrator' || 
      userData?.roles?.role_name === 'Developer'
    );
  };

  const fetchPaymentConfig = async () => {
    // In a real app, you'd fetch this from your database
    // For now, we'll use the default config
  };

  const saveConfig = async () => {
    try {
      // In a real app, you'd save this to your database
      toast({
        title: "Success",
        description: "Payment configuration saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("payments")}</h2>
        <p className="text-muted-foreground">
          {t("managePayments")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Payment Configuration - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure payment settings and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={config.currency}
                    onChange={(e) => updateConfig('currency', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={config.taxRate}
                    onChange={(e) => updateConfig('taxRate', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="freePrice">Free Plan Price</Label>
                  <Input
                    id="freePrice"
                    type="number"
                    value={config.freePrice}
                    onChange={(e) => updateConfig('freePrice', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basicPrice">Basic Plan Price</Label>
                  <Input
                    id="basicPrice"
                    type="number"
                    value={config.basicPrice}
                    onChange={(e) => updateConfig('basicPrice', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proPrice">Pro Plan Price</Label>
                  <Input
                    id="proPrice"
                    type="number"
                    value={config.proPrice}
                    onChange={(e) => updateConfig('proPrice', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enablePayments">Enable Payments</Label>
                    <p className="text-sm text-muted-foreground">Allow users to make payments</p>
                  </div>
                  <Switch
                    id="enablePayments"
                    checked={config.enablePayments}
                    onCheckedChange={(checked) => updateConfig('enablePayments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
                    <p className="text-sm text-muted-foreground">Allow payments without login</p>
                  </div>
                  <Switch
                    id="allowGuestCheckout"
                    checked={config.allowGuestCheckout}
                    onCheckedChange={(checked) => updateConfig('allowGuestCheckout', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableSubscriptions">Enable Subscriptions</Label>
                    <p className="text-sm text-muted-foreground">Allow recurring payments</p>
                  </div>
                  <Switch
                    id="enableSubscriptions"
                    checked={config.enableSubscriptions}
                    onCheckedChange={(checked) => updateConfig('enableSubscriptions', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableOneTimePayments">Enable One-time Payments</Label>
                    <p className="text-sm text-muted-foreground">Allow single payments</p>
                  </div>
                  <Switch
                    id="enableOneTimePayments"
                    checked={config.enableOneTimePayments}
                    onCheckedChange={(checked) => updateConfig('enableOneTimePayments', checked)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="successUrl">Success Redirect URL</Label>
                  <Input
                    id="successUrl"
                    value={config.successUrl}
                    onChange={(e) => updateConfig('successUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancelUrl">Cancel Redirect URL</Label>
                  <Input
                    id="cancelUrl"
                    value={config.cancelUrl}
                    onChange={(e) => updateConfig('cancelUrl', e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={saveConfig}>Save Configuration</Button>
            </CardContent>
          </Card>
        )}

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your current subscription plan and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Free Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Basic features with limited functionality
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {config.billingDescription}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {config.currency}{config.freePrice}/month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Upgrade your plan to unlock more features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Free Plan */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Free</h3>
                    <div className="text-2xl font-bold">{config.currency}{config.freePrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Up to 20 students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Basic attendance tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Limited storage
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                </div>

                {/* Basic Plan */}
                <div className="border rounded-lg p-4 space-y-3 relative">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Basic</h3>
                    <div className="text-2xl font-bold">{config.currency}{config.basicPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Up to 50 students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Full attendance features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Financial tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Basic reports
                    </li>
                  </ul>
                  <Button className="w-full" disabled={!config.enablePayments}>
                    {config.enablePayments ? 'Upgrade' : 'Payments Disabled'}
                  </Button>
                </div>

                {/* Pro Plan */}
                <div className="border rounded-lg p-4 space-y-3 relative border-primary">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Pro</h3>
                    <div className="text-2xl font-bold">{config.currency}{config.proPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unlimited students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Parent communication
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                  </ul>
                  <Button className="w-full" disabled={!config.enablePayments}>
                    {config.enablePayments ? 'Upgrade' : 'Payments Disabled'}
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your past invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No billing history available</p>
              <p className="text-sm">You are currently on the free plan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;