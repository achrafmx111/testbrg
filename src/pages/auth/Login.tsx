import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, roleHomePath } from "@/integrations/supabase/mvp";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User session not found after login.");
      }

      const profile = await mvp.getMyProfile(user.id);
      if (!profile) {
        throw new Error("No MVP profile found for this user.");
      }

      toast({
        title: "Login successful",
        description: `Redirecting to ${profile.role.toLowerCase()} dashboard`,
      });

      navigate(roleHomePath(profile.role), { replace: true });
    } catch (err: any) {
      const message = err?.message ?? "Unable to login.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full space-y-4 rounded-lg border bg-background p-6">
        <h1 className="text-2xl font-semibold">Login</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            data-testid="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            data-testid="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <Button data-testid="login-submit" type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <p className="text-sm text-muted-foreground">
          New here? <Link className="text-primary underline" to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
