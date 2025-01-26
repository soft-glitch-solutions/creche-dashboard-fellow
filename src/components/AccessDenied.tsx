import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 text-center mb-6">
        You do not have permission to access this resource. Please contact your administrator if you believe this is a mistake.
      </p>
      <Button onClick={() => navigate("/dashboard")}>
        Return to Dashboard
      </Button>
    </div>
  );
};