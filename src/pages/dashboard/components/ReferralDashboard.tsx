import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Users,
    Copy,
    Mail,
    Gift,
    Share2,
    MessageSquare,
    Linkedin,
    CheckCircle,
    Clock,
    Sparkles,
    Trophy,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types";
import { getOrAssignReferralCode, sendReferralInvite } from "@/lib/referralUtils";
import { format } from "date-fns";

interface ReferralDashboardProps {
    profile: Profile;
}

export const ReferralDashboard = ({ profile }: ReferralDashboardProps) => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";
    const isArabic = i18n.language === "ar";
    const { toast } = useToast();

    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const initReferrals = async () => {
            if (!profile?.id) return;
            setLoading(true);

            // 1. Get Code
            const code = await getOrAssignReferralCode(profile.id, profile.first_name);
            setReferralCode(code);

            // 2. Get Referrals
            const { data } = await (supabase as any)
                .from('referrals')
                .select('*')
                .eq('referrer_id', profile.id)
                .order('created_at', { ascending: false });

            setReferrals(data || []);
            setLoading(false);
        };

        initReferrals();
    }, [profile]);

    const handleCopyCode = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(`https://bridging.academy/join?ref=${referralCode}`);
        setCopySuccess(true);
        toast({ title: isGerman ? "Link kopiert!" : isArabic ? "تم نسخ الرابط!" : "Referral Link Copied!" });
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const stats = {
        total: referrals.length,
        joined: referrals.filter(r => r.status === 'joined' || r.status === 'active').length,
        rewards: referrals.filter(r => r.reward_claimed).length
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                            <Sparkles className="h-6 w-6" />
                            {isGerman ? "Freunde werben" : isArabic ? "قم بدعوة الأصدقاء" : "Refer & Earn"}
                        </CardTitle>
                        <CardDescription>
                            {isGerman
                                ? "Helfen Sie anderen Talenten, ihre Karriere zu starten."
                                : isArabic
                                    ? "ساعد المواهب الأخرى على بدء حياتهم المهنية."
                                    : "Help other talents jumpstart their career properly."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                {isGerman ? "Ihr einzigartiger Einladungslink" : isArabic ? "رابط الدعوة الخاص بك" : "Your Unique Invite Link"}
                            </span>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        readOnly
                                        value={loading ? "Generating..." : `https://bridging.academy/join?ref=${referralCode}`}
                                        className="pr-10 bg-white font-mono text-xs md:text-sm h-11"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <Share2 className="h-4 w-4" />
                                    </div>
                                </div>
                                <Button onClick={handleCopyCode} className="h-11 px-6 shadow-md" disabled={loading}>
                                    {copySuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {isGerman ? "Kopieren" : isArabic ? "نسخ" : (copySuccess ? "Copied" : "Copy")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center items-center text-center p-6 bg-white shadow-elegant border-slate-100">
                    <div className="rounded-full bg-amber-100 p-4 mb-4">
                        <Trophy className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-slate-800">{stats.joined}</h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {isGerman ? "Erfolgreich geworben" : isArabic ? "دعوات ناجحة" : "Successful Referrals"}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Invite Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Direct Email Invite (RPC) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {isGerman ? "Per E-Mail einladen" : isArabic ? "دعوة عبر البريد الإلكتروني" : "Invite via Email"}
                        </CardTitle>
                        <CardDescription>
                            {isGerman ? "Senden Sie eine persönliche Einladung." : isArabic ? "أرسل دعوة شخصية مباشرة." : "Send a direct invitation to your friend's inbox."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="friend@example.com"
                                type="email"
                            />
                            <Button onClick={async (e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                const email = input.value;
                                if (!email) return;

                                const btn = e.currentTarget;
                                const originalText = btn.innerText;
                                btn.disabled = true;
                                btn.innerText = "...";

                                const res = await sendReferralInvite(email);

                                if (res.success) {
                                    toast({ title: isGerman ? "Einladung gesendet" : isArabic ? "تم إرسال الدعوة" : "Invite Sent!" });
                                    input.value = "";
                                } else {
                                    toast({ variant: "destructive", title: res.error || "Error" });
                                }

                                btn.disabled = false;
                                btn.innerText = originalText;
                            }}>
                                <Mail className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Social Sharing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {isGerman ? "Teilen" : isArabic ? "مشاركة" : "Share via Socials"}
                        </CardTitle>
                        <CardDescription>
                            {isGerman ? "Schnell über WhatsApp oder LinkedIn teilen." : isArabic ? "شارك بسرعة عبر واتساب أو لينكد إن." : "Quickly share your link on social networks."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                        <Button variant="outline" className="flex-1 gap-2 border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on Bridging Academy! Here is my link: https://bridging.academy/join?ref=${referralCode}`)}`, '_blank')}
                        >
                            <MessageSquare className="h-4 w-4" /> WhatsApp
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://bridging.academy/join?ref=${referralCode}`)}`, '_blank')}
                        >
                            <Linkedin className="h-4 w-4" /> LinkedIn
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Referrals List */}
            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-slate-500" />
                        {isGerman ? "Ihre Empfehlungen" : isArabic ? "إحالاتك" : "Your Referrals"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : referrals.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                            <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                            <p className="text-muted-foreground font-medium">
                                {isGerman ? "Noch keine Empfehlungen." : isArabic ? "لا توجد إحالات بعد." : "No referrals yet."}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {isGerman ? "Teilen Sie Ihren Code, um zu beginnen!" : isArabic ? "شارك الكود الخاص بك للبدء!" : "Share your link to get started!"}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referrals.map((ref) => (
                                    <TableRow key={ref.id}>
                                        <TableCell className="font-mono text-xs">{ref.referee_email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                                                ${ref.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    ref.status === 'joined' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        ref.status === 'rewarded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'}
                                            `}>
                                                {ref.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground flex items-center justify-between">
                                            <span>{format(new Date(ref.created_at), "MMM d, yyyy")}</span>

                                            {/* Claim Reward Button */}
                                            {ref.status === 'joined' && !ref.reward_claimed && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 text-[10px] text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={async () => {
                                                        const { error } = await supabase.rpc('claim_referral_reward', { referral_id: ref.id });
                                                        if (error) {
                                                            toast({ variant: "destructive", title: "Claim Failed", description: error.message });
                                                        } else {
                                                            toast({ title: isGerman ? "Belohnung beansprucht!" : isArabic ? "تم الحصول على المكافأة!" : "Reward Claimed!" });
                                                            // Optimistic update
                                                            setReferrals(prev => prev.map(r => r.id === ref.id ? { ...r, status: 'rewarded', reward_claimed: true } : r));
                                                        }
                                                    }}
                                                >
                                                    <Gift className="h-3 w-3 mr-1" />
                                                    {isGerman ? "Beanspruchen" : isArabic ? "مطالبة" : "Claim"}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
