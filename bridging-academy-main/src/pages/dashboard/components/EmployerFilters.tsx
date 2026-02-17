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
import { Card, CardContent } from "@/components/ui/card";

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
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search skills, experience or summary..."
                        className="pl-9 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={trackFilter} onValueChange={setTrackFilter}>
                    <SelectTrigger className="h-10">
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
                    <SelectTrigger className="h-10">
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

            <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-lg border">
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

                    <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-lg border">
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Min. Match Score:</span>
                        <div className="w-32 flex items-center gap-2">
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
        </CardContent>
    );
};
