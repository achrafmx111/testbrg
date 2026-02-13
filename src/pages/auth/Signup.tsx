import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MvpRole, mvp, roleHomePath } from "@/integrations/supabase/mvp";

type SignupRole = "TALENT" | "COMPANY";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("TALENT");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({ email, password });
      if (signupError) throw signupError;

      const user = data.user;
      if (!user) {
        throw new Error("Signup failed to create user.");
      }

      let companyId: string | null = null;
      if (role === "COMPANY") {
        const company = await mvp.createCompany({ name: companyName || "New Company" });
        companyId = company.id;
      }

      const profile = await mvp.upsertProfile({ id: user.id, role: role as MvpRole, company_id: companyId });

      if (profile.role === "TALENT") {
        await mvp.upsertTalentProfile({
          user_id: user.id,
          bio: "",
          skills: [],
          languages: [],
          readiness_score: 0,
          coach_rating: 0,
          availability: true,
          placement_status: "LEARNING",
        });
      }

      toast({
        title: "Account created",
        description: `Welcome to ${profile.role.toLowerCase()} area`,
      });

      navigate(roleHomePath(profile.role), { replace: true });
    } catch (err: any) {
      const message = err?.message ?? "Unable to register.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full space-y-4 rounded-lg border bg-background p-6">
        <h1 className="text-2xl font-semibold">Register</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            disabled={loading}
            required
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as SignupRole)}
              disabled={loading}
            >
              <option value="TALENT">Talent</option>
              <option value="COMPANY">Company</option>
            </select>
          </div>

          {role === "COMPANY" ? (
            <Input
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
              required
            />
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <p className="text-sm text-muted-foreground">
          Already have an account? <Link className="text-primary underline" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
