import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      console.log("Auth Data:", authData);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      console.log("Profile Data:", profileData);

      if (profileData?.status === "pending") {
        toast.error("Your account is pending approval.");
        await supabase.auth.signOut();
        return;
      }

      if (profileData?.status === "rejected") {
        toast.error("Your account has been rejected.");
        await supabase.auth.signOut();
        return;
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      console.log("Role Data:", roleData);

      const isAdmin = roleData?.role?.trim().toLowerCase() === "admin";

      toast.success("Successfully signed in");
      navigate(isAdmin ? "/admin" : "/portal");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error(error.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => navigate("/signup")}
            className="text-primary hover:underline bg-transparent border-none"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
