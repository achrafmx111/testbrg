import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EmployerFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    trackFilter: string;
    setTrackFilter: (value: string) => void;
    expFilter: string;
    setExpFilter: (value: string) => void;
    germanFilter: string;
    setGermanFilter: (value: string) => void;
    minScore: number;
    setMinScore: (value: number) => void;
    onReset: () => void;
}

export const EmployerFilters = ({
    searchTerm,
    setSearchTerm,
    trackFilter,
    setTrackFilter,
    expFilter,
    setExpFilter,
    germanFilter,
    setGermanFilter,
    minScore,
    setMinScore,
    onReset
}: EmployerFiltersProps) => {
    return (
        <div className="space-y-4 px-6 pb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Discovery Filters</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-8 text-xs hover:text-primary gap-2"
                        onClick={onReset}
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset Defaults
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search skills, experience or summary..."
                        className="pl-9 h-10 bg-white border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={trackFilter} onValueChange={setTrackFilter}>
                    <SelectTrigger className="h-10 bg-white border-slate-200">
                        <SelectValue placeholder="SAP Track" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tracks</SelectItem>
                        <SelectItem value="FI">Financial (FI)</SelectItem>
                        <SelectItem value="MM">Materials (MM)</SelectItem>
                        <SelectItem value="SD">Sales (SD)</SelectItem>
                        <SelectItem value="BTP">Platform (BTP)</SelectItem>
                        <SelectItem value="ABAP">Dev (ABAP)</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={expFilter} onValueChange={setExpFilter}>
                    <SelectTrigger className="h-10 bg-white border-slate-200">
                        <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Experience</SelectItem>
                        <SelectItem value="junior">Junior (0-2y)</SelectItem>
                        <SelectItem value="mid">Mid (2-5y)</SelectItem>
                        <SelectItem value="senior">Senior (5y+)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-1 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex w-full items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:w-auto">
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">German Level:</span>
                        <div className="flex gap-1">
                            {['A2', 'B1', 'B2', 'C1'].map(L => (
                                <button
                                    key={L}
                                    onClick={() => setGermanFilter(germanFilter === L ? "all" : L)}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${germanFilter === L ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-primary/10 border"}`}
                                >
                                    {L}+
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:w-auto">
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Min. Match Score:</span>
                        <div className="flex w-full items-center gap-2 sm:w-36">
                            <Slider
                                value={[minScore]}
                                onValueChange={(v) => setMinScore(v[0])}
                                max={100}
                                step={5}
                                className="py-1"
                            />
                            <span className="text-[10px] font-bold text-primary w-8">{minScore}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
