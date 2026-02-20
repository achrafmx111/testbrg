import { useState } from "react";
import { Check, X, CreditCard, Shield, Zap, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fireConfetti } from "@/utils/confetti";

export default function TalentPricingPage() {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = () => {
        setIsCheckoutOpen(true);
    };

    const confirmPayment = () => {
        setIsProcessing(true);
        // Simulate Stripe processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsCheckoutOpen(false);
            fireConfetti();
            toast.success("Welcome to Bridging Academy PRO! 💎");
        }, 1500);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Premium Membership
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Accelerate Your Career
                </h1>
                <p className="text-xl text-muted-foreground">
                    Unlock exclusive tools, unlimited applications, and AI-powered coaching to land your dream job in Germany.
                </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <Card className="border-border/60 relative">
                    <CardHeader>
                        <CardTitle className="text-2xl">Standard</CardTitle>
                        <CardDescription>Everything you need to get started</CardDescription>
                        <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-4xl font-bold">€0</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-500" />
                                <span>Basic Talent Profile</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-500" />
                                <span>10 Job Applications / month</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-500" />
                                <span>Limited AI Coach Access</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span>No "Verified" Badge</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span>No Priority Support</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>
                            Current Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative"
                >
                    <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-primary via-secondary to-accent opacity-70 blur-sm pointer-events-none" />
                    <Card className="relative border-primary/30 shadow-xl bg-background/95 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-3">
                            <Badge className="bg-gradient-to-r from-primary to-secondary border-none">
                                RECOMMENDED
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                Pro <Crown className="h-6 w-6 text-secondary fill-secondary" />
                            </CardTitle>
                            <CardDescription>For serious career acceleration</CardDescription>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-bold">€19</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-3 text-sm font-medium">
                                <li className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>Everything in Standard</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Zap className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>Unlimited Job Applications</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>Advanced AI Voice Coach (Early Access)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Shield className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>Verified Pro Badge 💎</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full shadow-lg shadow-primary/20" onClick={handleUpgrade}>
                                Upgrade to Pro
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>

            {/* Features Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-10">
                <div className="bg-muted/40 p-6 rounded-2xl">
                    <Zap className="h-8 w-8 text-yellow-500 mb-4" />
                    <h3 className="font-semibold mb-2">Faster Applications</h3>
                    <p className="text-sm text-muted-foreground">Apply to unlimited jobs with one click. No more daily limits holding you back.</p>
                </div>
                <div className="bg-muted/40 p-6 rounded-2xl">
                    <Shield className="h-8 w-8 text-emerald-500 mb-4" />
                    <h3 className="font-semibold mb-2">Verified Status</h3>
                    <p className="text-sm text-muted-foreground">Stand out to recruiters with a verified badge that signals your serious intent.</p>
                </div>
                <div className="bg-muted/40 p-6 rounded-2xl">
                    <Sparkles className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">AI Preparation</h3>
                    <p className="text-sm text-muted-foreground">Get unlimited access to our advanced Interview Coach and resume analysis tools.</p>
                </div>
            </div>

            {/* Checkout Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Subscribe to Pro</DialogTitle>
                        <DialogDescription>
                            Secure checkout powered by Stripe
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-primary/5 rounded-lg flex justify-between items-center border border-primary/20">
                            <div>
                                <p className="font-medium text-foreground">Bridging Academy Pro</p>
                                <p className="text-sm text-muted-foreground">Monthly Subscription</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">€19.00</p>
                        </div>

                        {/* Mock Card Form */}
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="4242 4242 4242 4242"
                                        className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                                        disabled
                                        value="4242 4242 4242 4242"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Expiry</label>
                                    <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border rounded-md text-sm" disabled value="12/28" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">CVC</label>
                                    <input type="text" placeholder="123" className="w-full px-3 py-2 border rounded-md text-sm" disabled value="***" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="w-full" onClick={confirmPayment} disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Pay €19.00"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
