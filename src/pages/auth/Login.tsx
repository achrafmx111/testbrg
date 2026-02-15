import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Loader2, Shield, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="relative hidden overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary to-secondary p-10 text-primary-foreground shadow-2xl lg:block">
          <div className="absolute -top-28 -right-20 h-72 w-72 rounded-full bg-background/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-background/10 blur-3xl" />

          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Admin Experience
            </div>

            <div>
              <h1 className="text-4xl font-black leading-tight tracking-tight">
                One dashboard to manage talent, companies, and hiring flow.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-primary-foreground/85">
                Sign in and jump into your command center with charts, pipeline tracking, and quick previews across all workspaces.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Live KPIs", value: "24+" },
                { label: "Pipeline Stages", value: "6" },
                { label: "Admin Views", value: "3" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 text-center">
                  <p className="text-xl font-bold">{item.value}</p>
                  <p className="text-[11px] uppercase tracking-wide text-primary-foreground/80">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-primary-foreground/80">
                <BarChart3 className="h-4 w-4" />
                Command Center Ready
              </div>
              <p className="text-sm text-primary-foreground/95">
                Immediate access to admin overview, talent insights, and company preview in one flow.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-xl">
            <div className="mb-6 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Shield className="h-3.5 w-3.5" />
                Secure Access
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your dashboard workspace.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                data-testid="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-11"
              />
              <Input
                data-testid="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-11"
              />
              <Button data-testid="login-submit" type="submit" className="h-11 w-full gap-2 font-semibold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

            <p className="mt-5 text-sm text-muted-foreground">
              New here? <Link className="font-semibold text-primary underline-offset-2 hover:underline" to="/register">Create account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
