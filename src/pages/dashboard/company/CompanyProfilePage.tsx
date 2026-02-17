import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpCompany } from "@/integrations/supabase/mvp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, CreditCard, Save, Globe, MapPin, Mail, Shield, Loader2, Camera, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MvpTeamMember } from "@/integrations/supabase/mvp";

export default function CompanyProfilePage() {
    const { toast } = useToast();
    const [company, setCompany] = useState<MvpCompany | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Team state
    const [teamMembers, setTeamMembers] = useState<MvpTeamMember[]>([]);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("recruiter");
    const [inviting, setInviting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        industry: "",
        website: "",
        description: "",
        country: "",
        size: "",
    });

    const loadTeamMembers = useCallback(async (companyId: string) => {
        try {
            const members = await mvp.listCompanyTeam(companyId);
            setTeamMembers(members);
        } catch (error) {
            console.error("Error loading team:", error);
        }
    }, []);

    const loadCompanyData = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const profile = await mvp.getMyProfile(user.id);
            if (!profile?.company_id) return;

            const companies = await mvp.listCompanies();
            const companyData = companies.find((item) => item.id === profile.company_id);

            if (companyData) {
                setCompany(companyData);
                setFormData({
                    name: companyData.name || "",
                    industry: companyData.industry || "",
                    website: companyData.website || "",
                    description: companyData.description || "",
                    country: companyData.country || "",
                    size: companyData.size || "",
                });
                loadTeamMembers(companyData.id);
            }
        } catch (error) {
            console.error("Error loading company:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load company profile.",
            });
        } finally {
            setLoading(false);
        }
    }, [loadTeamMembers, toast]);

    useEffect(() => {
        loadCompanyData();
    }, [loadCompanyData]);

    const handleInviteMember = async () => {
        if (!company || !inviteEmail) return;
        setInviting(true);
        try {
            await mvp.inviteTeamMember(company.id, inviteEmail, inviteRole);
            setInviteEmail("");
            setInviteOpen(false);
            toast({ title: "Invitation Sent", description: `${inviteEmail} has been added to the team.` });
            loadTeamMembers(company.id);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to invite member." });
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!company) return;
        try {
            await mvp.removeTeamMember(memberId);
            toast({ title: "Member Removed", description: "Team member has been removed." });
            loadTeamMembers(company.id);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to remove member." });
        }
    };

    const handleSaveGeneral = async () => {
        if (!company) return;
        setSaving(true);
        try {
            // Simulation of API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Profile Updated",
                description: "Your company details have been saved successfully.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save changes.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Company Linked</h3>
                <p className="text-muted-foreground max-w-sm">
                    Please contact support to link your account to a registered company profile.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your company branding, team members, and billing details.</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-8">
                    <TabsTrigger value="general" className="gap-2"><Building2 className="h-4 w-4" /> General</TabsTrigger>
                    <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" /> Team</TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4" /> Billing</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Company Profile</CardTitle>
                                <CardDescription>Update your company information and public branding.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Logo Upload Section */}
                                <div className="flex items-start gap-6 pb-8 border-b border-border/50">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 border-2 border-border shadow-sm">
                                            <AvatarImage src={company.logo_url || ""} />
                                            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                                {company.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-lg">Company Logo</h4>
                                        <p className="text-sm text-muted-foreground">Recommend 400x400px. JPG or PNG.</p>
                                        <div className="flex gap-3 mt-3">
                                            <Button variant="outline" size="sm">Upload New</Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Company Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-muted/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <Input
                                            id="industry"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="bg-muted/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="website"
                                                className="pl-9 bg-muted/30"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Headquarters</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="country"
                                                className="pl-9 bg-muted/30"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">About Company</Label>
                                    <Textarea
                                        id="description"
                                        rows={5}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-muted/30 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground text-right">0 / 500 characters</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-border/50 px-6 py-4 bg-muted/10">
                                <p className="text-xs text-muted-foreground">Changes will be reflected on your public profile immediately.</p>
                                <Button onClick={handleSaveGeneral} disabled={saving} className="gap-2 shadow-lg shadow-primary/20">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Team Members */}
                <TabsContent value="team">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Team Members</CardTitle>
                                    <CardDescription>Manage who has access to your company dashboard.</CardDescription>
                                </div>
                                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2">
                                            <Users className="h-4 w-4" /> Invite Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite Team Member</DialogTitle>
                                            <DialogDescription>
                                                Send an invitation to a colleague to join your company dashboard.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    placeholder="colleague@company.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="role">Role</Label>
                                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="recruiter">Recruiter</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                                            <Button onClick={handleInviteMember} disabled={inviting}>
                                                {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                                Send Invite
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Current User */}
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border border-border">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">ME</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">You</p>
                                                <p className="text-xs text-muted-foreground">Administrator</p>
                                            </div>
                                        </div>
                                        <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Owner</Badge>
                                    </div>

                                    {teamMembers.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No team members yet. Invite your colleagues to collaborate.</p>
                                        </div>
                                    )}
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-border">
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-navy/30 dark:text-slate-300">
                                                        {member.profiles?.full_name?.substring(0, 2).toUpperCase() || member.invited_email?.substring(0, 2).toUpperCase() || "TM"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground">{member.profiles?.full_name || "Pending User"}</p>
                                                    <p className="text-xs text-muted-foreground">{member.profiles?.email || member.invited_email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="font-normal text-muted-foreground capitalize bg-secondary/50">{member.role}</Badge>
                                                {member.status === "pending" && <Badge variant="outline" className="text-xs text-orange border-orange/20 bg-orange/5">Invited</Badge>}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveMember(member.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Billing */}
                <TabsContent value="billing">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-none shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white relative z-10">
                                        <Shield className="h-5 w-5 text-amber-400 fill-current" />
                                        Premium Subscription
                                    </CardTitle>
                                    <CardDescription className="text-indigo-200 relative z-10">
                                        You are currently on the <span className="font-semibold text-white">Business Plan</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-5xl font-bold">$299</span>
                                        <span className="text-indigo-200 mb-1">/month</span>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Unlimited Jobs</Badge>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Analysis Tools</Badge>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Priority Support</Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-white/10 pt-6 mt-2 gap-4 relative z-10">
                                    <Button variant="secondary" className="gap-2 text-indigo-950 border-none hover:bg-white/90 shadow-lg">
                                        Manage Plan
                                    </Button>
                                    <Button variant="link" className="text-white hover:text-white/80">View Invoices</Button>
                                </CardFooter>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Payment Method</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-12 bg-white border rounded flex items-center justify-center">
                                                    <span className="font-bold text-[10px] text-slate-500">VISA</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">**** 4242</p>
                                                    <p className="text-[10px] text-muted-foreground">Expires 12/2028</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100 text-[10px]">Default</Badge>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full">Update Method</Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Billing Email</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground mt-3" />
                                            <Input defaultValue="billing@company.com" className="h-9" />
                                        </div>
                                        <Button size="sm" className="w-full">Update Email</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
