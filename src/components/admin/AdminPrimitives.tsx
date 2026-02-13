import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { adminClassTokens } from "@/components/admin/designTokens";

export function AdminSectionHeader({ title, description, aside }: { title: string; description?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Admin command center</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {aside}
    </div>
  );
}

export function AdminStatCard({ label, value, tone }: { label: string; value: number | string; tone?: "primary" | "secondary" | "accent" }) {
  const toneClass =
    tone === "secondary"
      ? "border-secondary/35"
      : tone === "accent"
        ? "border-accent/35"
        : "border-primary/35";
  const glowClass = tone === "secondary" ? "bg-secondary/20" : tone === "accent" ? "bg-accent/20" : "bg-primary/20";

  return (
    <div className={`${adminClassTokens.kpiCard} ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${glowClass}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-foreground">{value}</p>
    </div>
  );
}

export function AdminEmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border/80 bg-muted/25 p-7 text-sm leading-6 text-muted-foreground">{text}</div>;
}

export function AdminStatusBadge({ text, kind }: { text: string; kind: "neutral" | "primary" | "accent" | "danger" }) {
  if (kind === "danger") {
    return (
      <Badge variant="destructive" className="font-medium">
        {text}
      </Badge>
    );
  }

  if (kind === "accent") {
    return <span className={`${adminClassTokens.badge} border border-accent/30 bg-accent/15 text-accent-foreground`}>{text}</span>;
  }

  if (kind === "primary") {
    return <span className={`${adminClassTokens.badge} border border-primary/30 bg-primary/15 text-primary`}>{text}</span>;
  }

  return <span className={`${adminClassTokens.badge} border border-border/70 bg-muted/60 text-muted-foreground`}>{text}</span>;
}
