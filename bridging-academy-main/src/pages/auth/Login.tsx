import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";
    const navigate = useNavigate();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            toast({
                title: isGerman ? "Willkommen zurück!" : "Welcome back!",
                description: isGerman ? "Sie haben sich erfolgreich eingeloggt." : "You have successfully logged in.",
            });

            navigate("/dashboard");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: isGerman ? "Fehler bei der Anmeldung" : "Login Failed",
                description: error.message === "Invalid login credentials"
                    ? (isGerman ? "Falsche E-Mail oder Passwort." : "Invalid email or password.")
                    : error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-6"
                >
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-heading font-bold">
                            {isGerman ? "Willkommen zurück" : "Welcome back"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isGerman ? "Geben Sie Ihre Daten ein, um fortzufahren" : "Enter your credentials to access your account"}
                        </p>
                    </div>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="pt-6">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">{isGerman ? "Passwort" : "Password"}</Label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            {isGerman ? "Passwort vergessen?" : "Forgot password?"}
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isGerman ? "Anmelden..." : "Signing in..."}
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {isGerman ? "Anmelden" : "Sign In"}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 border-t px-6 py-4">
                            <div className="text-center text-sm text-muted-foreground">
                                {isGerman ? "Noch kein Konto?" : "Don't have an account?"}{" "}
                                <Link to="/signup" className="font-semibold text-primary hover:underline">
                                    {isGerman ? "Registrieren" : "Sign up"}
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>

            {/* Right Side - Image/Decoration */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pattern-overlay opacity-50" />
                <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src="/lovable-uploads/6e082877-5080-4bd7-82a1-5364bfa10061.png"
                            alt="Bridging Academy"
                            className="w-32 h-32 mx-auto mb-8 rounded-2xl shadow-2xl"
                        />
                        <h2 className="text-3xl font-heading font-bold text-foreground">
                            {isGerman ? "Starten Sie Ihre SAP Karriere" : "Launch Your SAP Career"}
                        </h2>
                        <p className="text-lg text-muted-foreground mt-4">
                            {isGerman
                                ? "Greifen Sie auf Ihre Kurse zu, verfolgen Sie Ihre Bewerbungen und verwalten Sie Ihr Profil."
                                : "Access your courses, track your applications, and manage your professional profile."}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
