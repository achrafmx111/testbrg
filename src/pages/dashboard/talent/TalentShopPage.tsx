import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap, Award, BookOpen, Crown, Check, AlertCircle, Sparkles, FileText, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { fireConfetti } from "@/utils/confetti";
import { playCaChingSound } from "@/utils/sound";
import { toast } from "sonner";

// Mock Data
const SHOP_ITEMS = [
    {
        id: "mentorship-session",
        title: "1:1 Mentorship Session",
        description: "30-minute video call with a senior industry expert.",
        price: 5000,
        category: "boost",
        icon: Crown,
        color: "text-primary",
        bg: "bg-primary/10",
        popular: true
    },
    {
        id: "cv-review",
        title: "Expert CV Review",
        description: "Detailed feedback on your resume to pass ATS systems.",
        price: 2000,
        category: "resource",
        icon: FileText,
        color: "text-secondary",
        bg: "bg-secondary/10"
    },
    {
        id: "premium-month",
        title: "1 Month Premium",
        description: "Unlock all Pro features including AI Voice Coach for 30 days.",
        price: 10000,
        category: "upgrade",
        icon: Sparkles,
        color: "text-accent",
        bg: "bg-accent/10"
    },
    {
        id: "boost-24h",
        title: "Profile Boost (24h)",
        description: "Get highlighted at the top of recruiter searches for 24 hours.",
        price: 500,
        category: "boost",
        icon: Zap,
        color: "text-secondary",
        bg: "bg-secondary/10"
    },
    {
        id: "theme-dark-noir",
        title: "Noir Theme",
        description: "Unlock the exclusive 'Pitch Black' dashboard theme.",
        price: 1200,
        category: "cosmetic",
        icon: Palette,
        color: "text-primary",
        bg: "bg-primary/10"
    }
];

export default function TalentShopPage() {
    // Mock user balance
    const [balance, setBalance] = useState(15000);
    const [selectedItem, setSelectedItem] = useState<typeof SHOP_ITEMS[0] | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBuyClick = (item: typeof SHOP_ITEMS[0]) => {
        setSelectedItem(item);
        setIsPurchaseModalOpen(true);
    };

    const confirmPurchase = () => {
        if (!selectedItem) return;

        if (balance < selectedItem.price) {
            toast.error("Insufficient XP! Complete more lessons to earn points.");
            setIsPurchaseModalOpen(false);
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setBalance(prev => prev - selectedItem.price);
            setPurchasedItems(prev => [...prev, selectedItem.id]);
            setIsProcessing(false);
            setIsPurchaseModalOpen(false);
            fireConfetti();
            playCaChingSound();
            toast.success(`Successfully purchased ${selectedItem.title}!`);
        }, 800);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">XP Shop</h1>
                    <p className="text-muted-foreground mt-1">Spend your hard-earned XP on boosts and exclusive items.</p>
                </div>

                <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-lg min-w-[200px]">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">Your Balance</p>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold">{balance.toLocaleString()}</span>
                                <span className="text-sm font-medium opacity-80">XP</span>
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="upgrade">Upgrades</TabsTrigger>
                    <TabsTrigger value="boost">Career Boosts</TabsTrigger>
                    <TabsTrigger value="cosmetic">Cosmetics</TabsTrigger>
                    <TabsTrigger value="resource">Resources</TabsTrigger>
                </TabsList>

                {["all", "upgrade", "boost", "cosmetic", "resource"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {SHOP_ITEMS.filter(item => tab === "all" || item.category === tab).map((item) => {
                                const isPurchased = purchasedItems.includes(item.id);
                                const canAfford = balance >= item.price;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className={`h-full flex flex-col border-border/60 transition-all ${isPurchased ? "bg-muted/50 opacity-80" : "hover:shadow-md bg-white/50 backdrop-blur-sm"}`}>
                                            <CardHeader className="relative pb-4">
                                                {item.popular && (
                                                    <Badge className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 border-none">
                                                        Popular
                                                    </Badge>
                                                )}
                                                <div className={`h-12 w-12 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                                                    <item.icon className={`h-6 w-6 ${item.color}`} />
                                                </div>
                                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <CardDescription className="text-sm leading-relaxed mb-4">
                                                    {item.description}
                                                </CardDescription>
                                            </CardContent>
                                            <CardFooter className="pt-0 flex items-center justify-between border-t p-6 bg-muted/5">
                                                <div className="font-bold text-foreground">
                                                    {item.price} <span className="text-xs font-normal text-muted-foreground">XP</span>
                                                </div>
                                                <Button
                                                    onClick={() => handleBuyClick(item)}
                                                    disabled={isPurchased || (!canAfford && !isPurchased)}
                                                    variant={isPurchased ? "outline" : canAfford ? "default" : "secondary"}
                                                    size="sm"
                                                    className={!canAfford && !isPurchased ? "opacity-50" : ""}
                                                >
                                                    {isPurchased ? (
                                                        <>Owned <Check className="ml-1 h-3 w-3" /></>
                                                    ) : (
                                                        <>Buy Now</>
                                                    )}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Purchase Confirmation Modal */}
            <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to spend <span className="font-bold text-foreground">{selectedItem?.price} XP</span> on this item?
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="flex items-center gap-4 py-4 bg-muted/30 p-4 rounded-lg border">
                            <div className={`h-12 w-12 rounded-lg ${selectedItem.bg} flex items-center justify-center shrink-0`}>
                                <selectedItem.icon className={`h-6 w-6 ${selectedItem.color}`} />
                            </div>
                            <div>
                                <h4 className="font-semibold">{selectedItem.title}</h4>
                                <p className="text-xs text-muted-foreground">{selectedItem.description}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsPurchaseModalOpen(false)}>Cancel</Button>
                        <Button onClick={confirmPurchase} disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Confirm & Pay"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
