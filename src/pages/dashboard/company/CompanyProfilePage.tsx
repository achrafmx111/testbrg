import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpCompany, MvpTeamMember } from "@/integrations/supabase/mvp";
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
import {
    Building2, Users, CreditCard, Save, Globe, MapPin, Mail,
    Shield, Loader2, Camera, Plus, Trash2, Download,
    CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const MOCK_INVOICES = [
    { id: "INV-2024-001", date: "Feb 01, 2024", amount: "$299.00", status: "Paid" },
    { id: "INV-2024-002", date: "Jan 01, 2024", amount: "$299.00", status: "Paid" },
    { id: "INV-2023-012", date: "Dec 01, 2023", amount: "$299.00", status: "Paid" },
];

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

    // Billing state
    const [invoicesOpen, setInvoicesOpen] = useState(false);
    const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
    const [planManageOpen, setPlanManageOpen] = useState(false);

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
            await mvp.updateCompany(company.id, {
                name: formData.name,
                industry: formData.industry,
                size: formData.size,
                website: formData.website,
                description: formData.description,
                country: formData.country,
                logo_url: company.logo_url,
            });

            toast({
                title: "Profile Updated",
                description: "Your company details have been saved successfully.",
            });
        } catch (error) {
            console.error("Error saving profile:", error);
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
            <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                            <Sparkles className="mr-1 h-3.5 w-3.5" /> Company Control
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight">Company settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your branding, team permissions, and billing operations from one place.</p>
                    </div>
                </div>
            </section>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[420px] mb-8 rounded-xl border border-border/60 bg-card p-1">
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
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-lg">Company Logo</h4>
                                        <p className="text-sm text-muted-foreground">Logos are fetched via URL for now.</p>
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
                                        <Label htmlFor="size">Company Size</Label>
                                        <Select
                                            value={formData.size}
                                            onValueChange={(val) => setFormData({ ...formData, size: val })}
                                        >
                                            <SelectTrigger className="bg-muted/30">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                                <SelectItem value="500+">500+ employees</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="logo_url">Logo URL</Label>
                                        <div className="relative">
                                            <Camera className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="logo_url"
                                                className="pl-9 bg-muted/30"
                                                placeholder="https://..."
                                                value={company.logo_url || ""}
                                                onChange={(e) => setCompany({ ...company, logo_url: e.target.value })}
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
                                    <p className="text-xs text-muted-foreground text-right">{formData.description.length} / 500 characters</p>
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
                                                    <AvatarFallback className="bg-muted text-muted-foreground">
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
                            <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground border-none shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white relative z-10">
                                        <Shield className="h-5 w-5 text-primary-foreground fill-current" />
                                        Premium Subscription
                                    </CardTitle>
                                    <CardDescription className="text-primary-foreground/80 relative z-10">
                                        You are currently on the <span className="font-semibold text-white">Business Plan</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-5xl font-bold">$299</span>
                                        <span className="text-primary-foreground/80 mb-1">/month</span>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Unlimited Jobs</Badge>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Analysis Tools</Badge>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Priority Support</Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-white/10 pt-6 mt-2 gap-4 relative z-10">
                                    <Button variant="secondary" className="gap-2 text-foreground border-none hover:bg-white/90 shadow-lg" onClick={() => setPlanManageOpen(true)}>
                                        Manage Plan
                                    </Button>
                                    <Button variant="link" className="text-white hover:text-white/80" onClick={() => setInvoicesOpen(true)}>View Invoices</Button>
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
                                                    <p className="text-xs text-muted-foreground">Expires 12/2028</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100 text-[10px]">Default</Badge>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full" onClick={() => setPaymentMethodOpen(true)}>Update Method</Button>
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
                                        <Button size="sm" className="w-full" onClick={() => toast({ title: "Email Updated", description: "Billing email update saved." })}>Update Email</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>

            {/* Invoices Sheet */}
            <Sheet open={invoicesOpen} onOpenChange={setInvoicesOpen}>
                <SheetContent className="sm:max-w-xl w-full">
                    <SheetHeader>
                        <SheetTitle>Billing History</SheetTitle>
                        <SheetDescription>Download your past invoices.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-8">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_INVOICES.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell>{inv.date}</TableCell>
                                        <TableCell>{inv.amount}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">{inv.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: "Downloading", description: `Downloading invoice ${inv.id}...` })}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Payment Method Dialog */}
            <Dialog open={paymentMethodOpen} onOpenChange={setPaymentMethodOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Payment Method</DialogTitle>
                        <DialogDescription>Enter your new card details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="card-number" placeholder="0000 0000 0000 0000" className="pl-9" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="expiry">Expiry</Label>
                                <Input id="expiry" placeholder="MM/YY" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentMethodOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setPaymentMethodOpen(false);
                            toast({ title: "Updated", description: "Payment method updated successfully." });
                        }}>
                            Save Card
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Plan Dialog */}
            <Dialog open={planManageOpen} onOpenChange={setPlanManageOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subscription Plan</DialogTitle>
                        <DialogDescription>Your plan is active until Mar 01, 2024.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/10 border-primary/20">
                            <div>
                                <h4 className="font-bold text-foreground">Business Plan</h4>
                                <p className="text-sm text-muted-foreground">$299.00 / month</p>
                            </div>
                            <Badge>Active</Badge>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold">Change Plan</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" className="justify-between" disabled>
                                    <span>Starter</span>
                                    <span>$99/mo</span>
                                </Button>
                                <Button variant="outline" className="justify-between border-primary/50 bg-primary/5">
                                    <span>Business (Current)</span>
                                    <span>$299/mo</span>
                                </Button>
                                <Button variant="outline" className="justify-between" onClick={() => toast({ title: "Sales Contacted", description: "An enterprise representative will contact you shortly." })}>
                                    <span>Enterprise</span>
                                    <span>Contact Sales</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:justify-between sm:flex-row items-center gap-2">
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 px-0 sm:px-4" onClick={() => toast({ title: "Cancellation Requested", description: "Support will process your cancellation within 24h." })}>
                            Cancel Subscription
                        </Button>
                        <Button onClick={() => setPlanManageOpen(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
