import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react"; // Import Eye Icons

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation(); // Get current URL

  useEffect(() => {
    // Extract access token from URL hash
    const queryParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = queryParams.get("access_token");

    if (accessToken) {
      sessionStorage.setItem("supabase_reset_token", accessToken);
    } else {
      const storedToken = sessionStorage.getItem("supabase_reset_token");
      if (!storedToken) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "The reset password link is invalid or expired.",
        });
        navigate("/login");
      }
    }
  }, [location, navigate, toast]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const accessToken = sessionStorage.getItem("supabase_reset_token");
  
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Invalid Link",
        description: "The reset password link is invalid or expired.",
      });
      navigate("/login");
      return;
    }
  
    try {
      // Set the session with the access token (Fix for PKCE issue)
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "", // Supabase doesn't provide a refresh token in password reset flows
      });
  
      if (sessionError) {
        toast({
          variant: "destructive",
          title: "Session Error",
          description: sessionError.message,
        });
        return;
      }
  
      // Update the password
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });
  
      if (passwordError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: passwordError.message,
        });
        return;
      }
  
      toast({
        title: "Password Reset Successfully",
        description: "You can now log in with your new password.",
      });
  
      // Clear the stored token after reset
      sessionStorage.removeItem("supabase_reset_token");
  
      // Redirect to login after successful password reset
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Reset Password</h1>
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} // Toggle between text and password
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              {/* Toggle Button for Show/Hide Password */}
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
