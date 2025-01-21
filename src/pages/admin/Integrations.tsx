import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Integrations = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Integrations</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Integration management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integrations;