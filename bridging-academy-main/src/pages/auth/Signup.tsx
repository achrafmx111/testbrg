import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";
    const navigate = useNavigate();
    const { toast } = useToast();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });

            if (error) {
                throw error;
            }

            toast({
                title: isGerman ? "Account erstellt!" : "Account created!",
                description: isGerman
                    ? "Bitte überprüfen Sie Ihre E-Mails zur Bestätigung."
                    : "Please check your email to verify your account.",
            });

            // Optionally navigate to a verification pending page or login
            navigate("/login");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: isGerman ? "Fehler bei der Registrierung" : "Signup Failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Right Side (on Desktop) - Image/Decoration */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative overflow-hidden order-2">
                <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <CheckCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-foreground">
                            {isGerman ? "Werden Sie Teil der Community" : "Join the Community"}
                        </h2>
                        <ul className="text-left space-y-4 mt-8 max-w-sm mx-auto">
                            {[
                                isGerman ? "Zugang zu exklusiven Kursmaterialien" : "Access exclusive course materials",
                                isGerman ? "Tracken Sie Ihren Lernfortschritt" : "Track your learning progress",
                                isGerman ? "Verbinden Sie sich mit Experten" : "Connect with industry experts",
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background order-1">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-6"
                >
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-heading font-bold">
                            {isGerman ? "Account erstellen" : "Create Account"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isGerman ? "Starten Sie Ihre Reise heute" : "Start your journey today"}
                        </p>
                    </div>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{isGerman ? "Vorname" : "First Name"}</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="Max"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{isGerman ? "Nachname" : "Last Name"}</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Mustermann"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

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
                                    <Label htmlFor="password">{isGerman ? "Passwort" : "Password"}</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isGerman ? "Mindestens 6 Zeichen" : "At least 6 characters"}
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isGerman ? "Konto wird erstellt..." : "Creating account..."}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            {isGerman ? "Registrieren" : "Sign Up"}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 border-t px-6 py-4">
                            <div className="text-center text-sm text-muted-foreground">
                                {isGerman ? "Bereits ein Konto?" : "Already have an account?"}{" "}
                                <Link to="/login" className="font-semibold text-primary hover:underline">
                                    {isGerman ? "Anmelden" : "Log in"}
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
