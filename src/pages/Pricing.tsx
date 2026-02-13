import { useTranslation } from "react-i18next";
import { Check, ArrowRight, Zap, Shield, Rocket, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Pricing = () => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";

    const plans = [
        {
            name: isGerman ? "Basis" : "Free",
            price: "€0",
            description: isGerman ? "Für erste Schritte im Talent-Sourcing." : "For initial steps in talent sourcing.",
            features: [
                isGerman ? "Kandidaten Insights ansehen" : "View candidate insights",
                isGerman ? "Basis-Filter" : "Basic filtering",
                isGerman ? "Merkliste (Shortlist)" : "Shortlist access",
            ],
            cta: isGerman ? "Kostenlos starten" : "Get Started Free",
            link: "/signup",
            popular: false
        },
        {
            name: "Pro",
            price: "€299",
            period: isGerman ? "/ Monat" : "/ month",
            description: isGerman ? "Für wachsende Unternehmen mit Einstellungsbedarf." : "For growing companies with hiring needs.",
            features: [
                isGerman ? "Alle Basis-Funktionen" : "All Free features",
                isGerman ? "Kandidaten-Namen & Kontakt" : "Full Candidate Details",
                isGerman ? "Direkte Interview-Anfragen" : "Direct Interview Requests",
                isGerman ? "Detaillierte AI-Berichte" : "Detailed AI Match Reports",
                isGerman ? "Email-Support" : "Email support"
            ],
            cta: isGerman ? "Pro wählen" : "Choose Pro",
            link: "/contactus",
            popular: true
        },
        {
            name: "Enterprise",
            price: isGerman ? "Individuell" : "Custom",
            description: isGerman ? "Maßgeschneiderte Lösungen für große Teams." : "Tailored solutions for large scale recruitment.",
            features: [
                isGerman ? "Alles in Pro" : "Everything in Pro",
                isGerman ? "Unbegrenzte Matchings" : "Unlimited matchings",
                isGerman ? "Dedizierter Success Manager" : "Dedicated Success Manager",
                isGerman ? "API-Zugriff" : "API Access",
                isGerman ? "Eigene Dashboard-Analytics" : "Custom Dashboard Analytics"
            ],
            cta: isGerman ? "Vertrieb kontaktieren" : "Contact Sales",
            link: "/contactus",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden gradient-hero">
                <div className="container-custom relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <Badge variant="outline" className="mb-4 py-1 px-4 text-primary bg-primary/5 border-primary/20">
                            {isGerman ? "Preise & Pläne" : "Pricing & Plans"}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
                            {isGerman ? "Finden Sie das perfekte Talent." : "Find the perfect SAP talent."}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            {isGerman
                                ? "Flexible Pläne für Unternehmen jeder Größe. Finden Sie qualifizierte Fachkräfte aus Marokko."
                                : "Flexible plans for companies of all sizes. Find qualified professionals from Morocco."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Plans */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={cn(
                                    "relative h-full border-2 transition-all duration-300 hover:shadow-elegant",
                                    plan.popular ? "border-primary shadow-lg scale-105 z-10" : "border-border"
                                )}>
                                    {plan.popular && (
                                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                                            <Badge className="bg-primary text-primary-foreground px-4 py-1">
                                                {isGerman ? "Empfohlen" : "Most Popular"}
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="pt-8">
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <div className="flex items-baseline gap-1 mt-4">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                        </div>
                                        <CardDescription className="mt-4 min-h-[40px]">
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-3 text-sm">
                                                    <div className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Check className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-6">
                                        <Button asChild className="w-full h-12 text-lg" variant={plan.popular ? "default" : "outline"}>
                                            <Link to={plan.link}>
                                                {plan.cta}
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Simple FAQ / Trust */}
            <section className="py-20 bg-muted/30">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-12">
                            {isGerman ? "Häufig gestellte Fragen" : "Frequently Asked Questions"}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            <div>
                                <h3 className="font-bold mb-2">{isGerman ? "Kann ich meinen Plan jederzeit ändern?" : "Can I change my plan anytime?"}</h3>
                                <p className="text-muted-foreground text-sm">{isGerman ? "Ja, Upgrades sind sofort wirksam. Bei Kündigungen bleibt der Plan bis zum Ende des Zeitraums aktiv." : "Yes, upgrades take effect immediately. Cancellations remain active until the end of the period."}</p>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">{isGerman ? "Wie funktioniert das Matching?" : "How does the matching work?"}</h3>
                                <p className="text-muted-foreground text-sm">{isGerman ? "Unsere AI analysiert Skills und Erfahrung der Kandidaten im Vergleich zu Ihren Anforderungen." : "Our AI analyzes candidate skills and experience against your specific requirements."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                {isGerman ? "Bereit für Ihr nächstes SAP-Talent?" : "Ready for your next SAP talent?"}
                            </h2>
                            <p className="text-xl opacity-90 mb-10">
                                {isGerman
                                    ? "Starten Sie noch heute und finden Sie die passenden Experten für Ihr Projekt."
                                    : "Start today and find the right experts for your project."}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold">
                                    <Link to="/contactus">{isGerman ? "Beratung vereinbaren" : "Schedule a Call"}</Link>
                                </Button>
                            </div>
                        </div>
                        {/* Abstract backgrounds */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
