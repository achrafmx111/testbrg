import { ReactNode, isValidElement } from "react";
import { adminClassTokens } from "@/components/admin/designTokens";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from "lucide-react";

/* ──────────── Section Header (Materio-style: simpler) ──────────── */
export function AdminSectionHeader({
  title,
  description,
  aside,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-1">
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-[0.8125rem] leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {aside}
    </header>
  );
}

/* ──────────── Stat/KPI Card (Materio layout: icon right, value left) ──────────── */
const toneStyles = {
  primary: {
    border: "",
    indicator: "bg-primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  secondary: {
    border: "",
    indicator: "bg-secondary",
    iconBg: "bg-secondary/12",
    iconColor: "text-secondary-foreground",
  },
  accent: {
    border: "",
    indicator: "bg-accent",
    iconBg: "bg-accent/12",
    iconColor: "text-accent-foreground",
  },
  success: {
    border: "",
    indicator: "bg-green-500",
    iconBg: "bg-green-100", // using standard tailwind colors for simplicity
    iconColor: "text-green-700",
  },
  warning: {
    border: "",
    indicator: "bg-amber-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  critical: {
    border: "",
    indicator: "bg-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
  },
  neutral: {
    border: "",
    indicator: "bg-slate-500",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
};

export function AdminStatCard({
  label,
  value,
  tone = "primary",
  icon,
  trend,
  trendLabel,
  subtitle,
}: {
  label: string;
  value: number | string;
  tone?: "primary" | "secondary" | "accent" | "success" | "warning" | "critical" | "neutral";
  icon?: ReactNode;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  subtitle?: string;
}) {
  const t = toneStyles[tone];

  const TrendIcon =
    trend === "up"
      ? TrendingUp
      : trend === "down"
        ? TrendingDown
        : Minus;

  return (
    <div className={adminClassTokens.kpiCard}>
      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        {icon ? (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.iconBg}`}
          >
            {icon}
          </span>
        ) : (
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.iconBg}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${t.indicator}`} />
          </span>
        )}
        {/* Menu dots (Materio style) */}
        <button className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4">
        <p className="text-[1.75rem] font-bold tracking-[-0.03em] leading-none text-foreground">
          {value}
        </p>
        <p className="mt-1.5 text-[0.8125rem] font-medium text-muted-foreground">
          {label}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">{subtitle}</p>
        )}
      </div>
      {trend ? (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIcon
            className={`h-3.5 w-3.5 ${trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-destructive"
                : "text-muted-foreground"
              }`}
          />
          <span className={`text-[11px] font-semibold ${trend === "up"
            ? "text-green-600"
            : trend === "down"
              ? "text-destructive"
              : "text-muted-foreground"
            }`}>
            {trendLabel ?? (trend === "up" ? "+18.4%" : trend === "down" ? "-5.2%" : "0%")}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ──────────── Empty State ──────────── */
export function AdminEmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode | React.ElementType }) {
  const IconComponent = icon as React.ElementType;
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/40 bg-muted/10 px-8 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30">
        {isValidElement(icon) ? icon : (IconComponent ? <IconComponent className="h-5 w-5 text-muted-foreground/70" /> : <Info className="h-5 w-5 text-muted-foreground/70" />)}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">{description}</p>}
      </div>
    </div>
  );
}


/* ──────────── Status Badge (Materio pill) ──────────── */
const badgeStyles = {
  neutral: "bg-muted/30 text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent-foreground",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-primary/10 text-primary",
  warning: "bg-secondary/12 text-secondary-foreground",
};

const badgeIcons = {
  neutral: null,
  primary: null,
  accent: <CheckCircle2 className="h-3 w-3" />,
  danger: <XCircle className="h-3 w-3" />,
  success: <CheckCircle2 className="h-3 w-3" />,
  warning: <AlertCircle className="h-3 w-3" />,
};

export function AdminStatusBadge({
  text,
  kind,
  showIcon = false,
}: {
  text: string;
  kind: "neutral" | "primary" | "accent" | "danger" | "success" | "warning";
  showIcon?: boolean;
}) {
  return (
    <span
      className={`${adminClassTokens.badge} ${badgeStyles[kind]}`}
    >
      {showIcon && badgeIcons[kind]}
      {text}
    </span>
  );
}

/* ──────────── Loading Pill ──────────── */
export function AdminLoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <div className={adminClassTokens.loadingPill}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      {text}
    </div>
  );
}

/* ──────────── Panel Header (Materio: with optional 3-dot menu) ──────────── */
export function AdminPanelHeader({
  title,
  badge,
  aside,
  showMenu = false,
}: {
  title: string;
  badge?: string;
  aside?: ReactNode;
  showMenu?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      <div className="flex items-center gap-2">
        {badge ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
            {badge}
          </span>
        ) : null}
        {aside}
        {showMenu && (
          <button className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────── Table Header Cell ──────────── */
export function AdminTableHeaderRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/30 bg-muted/10 px-5 py-3.5">
      {children}
    </div>
  );
}
