import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Calculator,
    ArrowRight,
    Euro,
    Wallet,
    ShoppingCart,
    Home,
    Tram,
    Coffee,
    TrendingUp,
    Info
} from "lucide-react";
import { motion } from "framer-motion";

// Mock Data for City Costs (Base: Casablanca = 100)
// These are rough estimates for demonstration
const CITY_DATA: Record<string, { name: string; currency: string; rentIndex: number; costIndex: number; salaryRatio: number }> = {
    "casablanca": { name: "Casablanca, MA", currency: "MAD", rentIndex: 100, costIndex: 100, salaryRatio: 1 },
    "rabat": { name: "Rabat, MA", currency: "MAD", rentIndex: 95, costIndex: 98, salaryRatio: 1 },
    "munich": { name: "Munich, DE", currency: "EUR", rentIndex: 450, costIndex: 280, salaryRatio: 0.092 }, // 1 MAD approx 0.092 EUR, but costs are way higher
    "berlin": { name: "Berlin, DE", currency: "EUR", rentIndex: 350, costIndex: 240, salaryRatio: 0.092 },
    "paris": { name: "Paris, FR", currency: "EUR", rentIndex: 400, costIndex: 260, salaryRatio: 0.092 },
    "amsterdam": { name: "Amsterdam, NL", currency: "EUR", rentIndex: 420, costIndex: 270, salaryRatio: 0.092 },
    "london": { name: "London, UK", currency: "GBP", rentIndex: 500, costIndex: 300, salaryRatio: 0.078 },
};

export default function CostOfLivingPage() {
    const [currentCity, setCurrentCity] = useState("casablanca");
    const [targetCity, setTargetCity] = useState("munich");
    const [currentSalary, setCurrentSalary] = useState<string>("15000"); // Default 15k MAD
    const [calculated, setCalculated] = useState(false);

    // Conversion Logic (Simplified)
    const source = CITY_DATA[currentCity];
    const target = CITY_DATA[targetCity];

    // Exchange Rate (approximate hardcoded for demo)
    const exchangeRate = target.name.includes("DE") || target.name.includes("FR") || target.name.includes("NL") ? 0.093 :
        target.name.includes("UK") ? 0.078 : 1;

    // Needed Salary Calculation
    // Formula: (Current Salary * Exchange Rate) * (Target Cost Index / Source Cost Index)
    const rawSalary = parseFloat(currentSalary) || 0;
    const convertedBaseSalary = rawSalary * exchangeRate;
    const costRatio = target.costIndex / source.costIndex;
    const neededSalary = convertedBaseSalary * costRatio;
    const comparisonPercentage = Math.round((costRatio - 1) * 100);

    const handleCalculate = () => {
        setCalculated(true);
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Cost of Living Calculator 💶
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Compare your current lifestyle in Morocco with your target destination.
                    Understand the salary you need to maintain your standard of living.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Input Section */}
                <Card className="lg:col-span-1 shadow-lg border-primary/10 h-fit">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="h-5 w-5 text-primary" />
                            Your Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label>Current Monthly Salary</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={currentSalary}
                                    onChange={(e) => { setCurrentSalary(e.target.value); setCalculated(false); }}
                                    className="pl-20 font-mono text-lg"
                                />
                                <div className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground border-r pr-2">
                                    {source.currency}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Location</Label>
                                <Select value={currentCity} onValueChange={(v) => { setCurrentCity(v); setCalculated(false); }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="casablanca">Casablanca, Morocco 🇲🇦</SelectItem>
                                        <SelectItem value="rabat">Rabat, Morocco 🇲🇦</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-center -my-2 relative z-10">
                                <div className="bg-background rounded-full p-2 border shadow-sm text-muted-foreground">
                                    <ArrowRight className="h-4 w-4 rotate-90" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Target Destination</Label>
                                <Select value={targetCity} onValueChange={(v) => { setTargetCity(v); setCalculated(false); }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="munich">Munich, Germany 🇩🇪</SelectItem>
                                        <SelectItem value="berlin">Berlin, Germany 🇩🇪</SelectItem>
                                        <SelectItem value="paris">Paris, France 🇫🇷</SelectItem>
                                        <SelectItem value="amsterdam">Amsterdam, Netherlands 🇳🇱</SelectItem>
                                        <SelectItem value="london">London, UK 🇬🇧</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button onClick={handleCalculate} size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg transition-all hover:scale-[1.02]">
                            Calculate Comparison
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-6">
                    {calculated ? (
                        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5 }}>

                            {/* Main Result Card */}
                            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-32 bg-emerald-100/30 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-emerald-800 text-lg font-medium uppercase tracking-wide">Equivalent Salary Needed</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col md:flex-row items-baseline gap-2 md:gap-4">
                                        <span className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
                                            {Math.round(neededSalary).toLocaleString()} <span className="text-3xl text-slate-500">{target.currency}</span>
                                        </span>
                                        <span className="text-muted-foreground font-medium">
                                            / month (Net approx.)
                                        </span>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-emerald-800 font-medium">
                                            <TrendingUp className="h-4 w-4" />
                                            Cost of Living: +{comparisonPercentage}%
                                        </div>
                                        <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-600">
                                            <Wallet className="h-4 w-4 text-slate-400" />
                                            1 {source.currency} ≈ {exchangeRate} {target.currency}
                                        </div>
                                    </div>

                                    <div className="mt-8 bg-white/60 rounded-xl p-4 border border-emerald-100/50">
                                        <p className="text-slate-700 leading-relaxed">
                                            To maintain the same standard of living as <span className="font-bold text-slate-900">{parseInt(currentSalary).toLocaleString()} {source.currency}</span> in {source.name.split(',')[0]},
                                            you would need approximately <span className="font-bold text-emerald-700">{Math.round(neededSalary).toLocaleString()} {target.currency}</span> in {target.name.split(',')[0]}.
                                            <br /><span className="text-sm text-muted-foreground mt-1 block italic">*Note: This implies typical local lifestyle adjustments.</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                                {/* Rent Comparison */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Home className="h-4 w-4 text-blue-500" /> Housing & Rent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{source.name.split(',')[0]}</span>
                                                    <span className="font-medium">Baseline</span>
                                                </div>
                                                <Progress value={20} className="h-2 bg-slate-100 [&>div]:bg-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-900 font-medium">{target.name.split(',')[0]}</span>
                                                    <span className="font-bold text-red-500">+{Math.round((target.rentIndex / source.rentIndex - 1) * 100)}%</span>
                                                </div>
                                                <Progress value={Math.min(100, (target.rentIndex / source.rentIndex) * 20)} className="h-2 bg-slate-100 [&>div]:bg-red-500" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Housing in {target.name.split(',')[0]} is significantly more expensive. Expect to pay 3-4x more for a similar apartment.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Consumer Goods */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-amber-500" /> Groceries & Dining
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{source.name.split(',')[0]}</span>
                                                    <span className="font-medium">Baseline</span>
                                                </div>
                                                <Progress value={30} className="h-2 bg-slate-100 [&>div]:bg-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-900 font-medium">{target.name.split(',')[0]}</span>
                                                    <span className="font-bold text-amber-600">+{Math.round((target.costIndex / source.costIndex - 1) * 60)}%</span>
                                                </div>
                                                <Progress value={Math.min(100, (target.costIndex / source.costIndex) * 30)} className="h-2 bg-slate-100 [&>div]:bg-amber-500" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Supermarket prices are comparable, but dining out and services are much pricier in {target.currency}.
                                        </p>
                                    </CardContent>
                                </Card>


                            </div>

                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Calculator className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">Ready to Compare?</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                Enter your current monthly net salary to see exactly how much you'd need to earn in {target.name.split(',')[0]} to maintain your lifestyle.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
