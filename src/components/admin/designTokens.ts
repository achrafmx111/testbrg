/**
 * Bridging Academy — Admin Design System Tokens
 * ─────────────────────────────────────────────
 * Materio-inspired: softer shadows, larger radius,
 * no hover lift, clean modern aesthetic.
 * All colors use existing brand palette.
 */

/* ──────────── VALUE TOKENS ──────────── */
export const adminDesignTokens = {
  colors: {
    /* Brand */
    primary: "hsl(var(--primary))",
    primarySoft: "hsl(var(--primary) / 0.10)",
    primaryMedium: "hsl(var(--primary) / 0.18)",
    secondary: "hsl(var(--secondary))",
    secondarySoft: "hsl(var(--secondary) / 0.12)",
    secondaryMedium: "hsl(var(--secondary) / 0.20)",
    accent: "hsl(var(--accent))",
    accentSoft: "hsl(var(--accent) / 0.10)",
    accentMedium: "hsl(var(--accent) / 0.18)",

    /* Surfaces */
    background: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    surfaceElevated: "hsl(var(--card) / 0.98)",
    surfaceMuted: "hsl(var(--muted) / 0.5)",
    surfaceOverlay: "hsl(var(--muted) / 0.30)",

    /* Text */
    text: "hsl(var(--foreground))",
    textSecondary: "hsl(var(--muted-foreground))",
    mutedText: "hsl(var(--muted-foreground))",

    /* Borders */
    border: "hsl(var(--border))",
    borderSubtle: "hsl(var(--border) / 0.50)",

    /* Status — derived from existing */
    danger: "hsl(var(--destructive))",
    dangerSoft: "hsl(var(--destructive) / 0.10)",
    success: "hsl(var(--primary) / 0.85)",
    successSoft: "hsl(var(--primary) / 0.10)",
    warning: "hsl(var(--secondary) / 0.90)",
    warningSoft: "hsl(var(--secondary) / 0.12)",

    /* Navy spectrum */
    navy: "hsl(var(--navy))",
    navyLight: "hsl(var(--navy-light))",
    navyDark: "hsl(var(--navy-dark))",

    /* Gold spectrum */
    gold: "hsl(var(--gold))",
    goldLight: "hsl(var(--gold-light))",
    goldDark: "hsl(var(--gold-dark))",

    /* Sidebar */
    sidebar: "hsl(var(--sidebar-background))",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    "4xl": "2.5rem",
    pageX: "2.5rem",
    pageY: "2.5rem",
    section: "2rem",
    sectionCompact: "1.5rem",
    card: "1.5rem",
    cardCompact: "1rem",
    grid: "1.25rem",
    gridWide: "1.5rem",
  },

  radius: {
    xs: "0.375rem",
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    "2xl": "calc(var(--radius) + 8px)",
    panel: "calc(var(--radius) + 6px)",
    card: "var(--radius)",
    compact: "calc(var(--radius) - 2px)",
    badge: "9999px",
    full: "9999px",
  },

  shadows: {
    xs: "0 1px 2px 0 rgba(0,0,0,0.04)",
    sm: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)",
    md: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.03)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
    panel: "0 2px 8px 0 rgba(0,0,0,0.04), 0 0 1px 0 rgba(0,0,0,0.06)",
    card: "0 2px 8px 0 rgba(0,0,0,0.04), 0 0 1px 0 rgba(0,0,0,0.06)",
    cardHover: "0 4px 18px 0 rgba(0,0,0,0.08), 0 0 1px 0 rgba(0,0,0,0.06)",
    soft: "0 2px 4px -1px rgba(0,0,0,0.06)",
    inset: "inset 0 1px 0 hsl(var(--background))",
    sidebar: "0 2px 8px 0 rgba(0,0,0,0.04)",
    kpiGlow: "0 2px 8px 0 rgba(0,0,0,0.04), 0 0 1px 0 rgba(0,0,0,0.06)",
  },

  typography: {
    overline: "text-[11px] font-semibold uppercase tracking-[0.12em]",
    caption: "text-[11px] font-medium tracking-[0.02em]",
    h1: "text-[1.5rem] font-semibold tracking-[-0.025em] leading-tight",
    h2: "text-xl font-semibold tracking-[-0.02em]",
    h3: "text-[0.9375rem] font-semibold tracking-[-0.01em]",
    h4: "text-sm font-semibold tracking-[-0.005em]",
    body: "text-sm leading-6",
    bodySmall: "text-[0.8125rem] leading-5",
    muted: "text-sm leading-6 text-muted-foreground",
    metric: "text-[1.75rem] font-bold tracking-[-0.03em] leading-none",
    metricSmall: "text-lg font-semibold tracking-[-0.02em]",
  },

  motion: {
    base: "transition-all duration-200 ease-out",
    fast: "transition-all duration-150 ease-out",
    colors: "transition-colors duration-150 ease-out",
    transform: "transition-transform duration-200 ease-out",
    spring: "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  },
};

/* ──────────── CLASS TOKENS (Tailwind utility bundles) ──────────── */
export const adminClassTokens = {
  /* Layout shells */
  pageShell: "space-y-6",
  sectionStack: "space-y-5",

  /* Panel — Materio-style: soft shadow, no border, white bg */
  panel: [
    "rounded-xl bg-card p-6",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  panelCompact: [
    "rounded-xl bg-card p-5",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  /* Cards — Materio: no hover lift, soft shadow */
  card: [
    "rounded-xl bg-card p-5",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
    "transition-shadow duration-200 ease-out",
    "hover:shadow-[0_4px_18px_0_rgba(0,0,0,0.08),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  /* KPI metric cards — Materio flat style */
  kpiCard: [
    "rounded-xl bg-card p-5",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  /* Table system */
  tableWrap: [
    "overflow-hidden rounded-xl bg-card",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  tableHead: [
    "bg-muted/20 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground",
  ].join(" "),

  tableRow: [
    "border-t border-border/30",
    "transition-colors duration-150 ease-out",
    "hover:bg-muted/15",
  ].join(" "),

  /* Badge */
  badge: [
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
    "text-[11px] font-semibold tracking-[0.02em] leading-5",
  ].join(" "),

  /* Utility panels */
  mutedPanel: "rounded-xl border border-border/30 bg-muted/10 p-4",

  railItem: [
    "rounded-lg border border-border/30 bg-muted/10 p-4 text-sm leading-6 text-foreground",
    "transition-all duration-150 ease-out",
    "hover:bg-muted/20",
  ].join(" "),

  /* Loading state */
  loadingPill: [
    "flex items-center gap-2.5 rounded-xl bg-card px-5 py-3.5",
    "text-sm text-muted-foreground",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  /* Page info card */
  infoCard: [
    "rounded-xl bg-card p-5 text-sm leading-6 text-muted-foreground",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),

  /* Stat card */
  miniStatCard: [
    "rounded-xl bg-card p-5",
    "shadow-[0_2px_8px_0_rgba(0,0,0,0.04),0_0_1px_0_rgba(0,0,0,0.06)]",
  ].join(" "),
};
