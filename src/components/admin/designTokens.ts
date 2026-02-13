export const adminDesignTokens = {
  colors: {
    primary: "hsl(var(--primary))",
    primarySoft: "hsl(var(--primary) / 0.12)",
    secondary: "hsl(var(--secondary))",
    secondarySoft: "hsl(var(--secondary) / 0.16)",
    accent: "hsl(var(--accent))",
    accentSoft: "hsl(var(--accent) / 0.14)",
    background: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    surfaceMuted: "hsl(var(--muted) / 0.5)",
    text: "hsl(var(--foreground))",
    mutedText: "hsl(var(--muted-foreground))",
    border: "hsl(var(--border))",
    danger: "hsl(var(--destructive))",
    dangerSoft: "hsl(var(--destructive) / 0.12)",
    navy: "hsl(var(--navy))",
    navyLight: "hsl(var(--navy-light))",
    sidebar: "hsl(var(--sidebar-background))",
    gold: "hsl(var(--gold))",
  },
  spacing: {
    pageX: "2rem",
    pageY: "2rem",
    section: "2rem",
    sectionCompact: "1.5rem",
    card: "1.5rem",
    cardCompact: "1rem",
    grid: "1rem",
    gridWide: "1.25rem",
  },
  radius: {
    panel: "calc(var(--radius) + 6px)",
    card: "var(--radius)",
    compact: "calc(var(--radius) - 2px)",
    badge: "9999px",
  },
  shadows: {
    panel: "0 10px 24px -14px hsl(var(--navy) / 0.28), 0 3px 8px -4px hsl(var(--navy) / 0.18)",
    card: "0 8px 20px -16px hsl(var(--navy) / 0.22), 0 2px 5px -3px hsl(var(--navy) / 0.14)",
    soft: "0 2px 6px -4px hsl(var(--navy) / 0.16)",
    inset: "inset 0 1px 0 hsl(var(--background))",
  },
  typography: {
    overline: "text-[11px] font-semibold uppercase tracking-[0.12em]",
    h1: "text-3xl font-semibold tracking-[-0.02em]",
    h2: "text-2xl font-semibold tracking-[-0.02em]",
    h3: "text-base font-semibold tracking-[-0.01em]",
    body: "text-sm leading-6",
    muted: "text-sm leading-6 text-muted-foreground",
    metric: "text-3xl font-semibold tracking-[-0.02em]",
  },
  motion: {
    base: "transition-all duration-200 ease-out",
    colors: "transition-colors duration-150 ease-out",
    transform: "transition-transform duration-200 ease-out",
  },
};

export const adminClassTokens = {
  pageShell: "space-y-8",
  sectionStack: "space-y-6",
  panel:
    "rounded-2xl border border-border/70 bg-card/95 p-6 shadow-[0_10px_24px_-14px_hsl(var(--navy)/0.28),0_3px_8px_-4px_hsl(var(--navy)/0.18)] backdrop-blur-sm transition-all duration-200 ease-out",
  panelCompact:
    "rounded-xl border border-border/70 bg-card/95 p-5 shadow-[0_8px_20px_-16px_hsl(var(--navy)/0.22),0_2px_5px_-3px_hsl(var(--navy)/0.14)] transition-all duration-200 ease-out",
  card:
    "rounded-xl border border-border/65 bg-card p-5 shadow-[0_8px_20px_-16px_hsl(var(--navy)/0.22),0_2px_5px_-3px_hsl(var(--navy)/0.14)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-16px_hsl(var(--navy)/0.28),0_5px_10px_-5px_hsl(var(--navy)/0.18)]",
  kpiCard:
    "rounded-xl border border-border/65 bg-card p-4 shadow-[0_8px_20px_-16px_hsl(var(--navy)/0.22),0_2px_5px_-3px_hsl(var(--navy)/0.14)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35",
  tableWrap: "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_8px_20px_-16px_hsl(var(--navy)/0.22),0_2px_5px_-3px_hsl(var(--navy)/0.14)]",
  tableHead:
    "bg-muted/40 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground",
  tableRow: "border-t border-border/50 transition-colors duration-150 ease-out hover:bg-muted/35",
  badge: "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.02em]",
  mutedPanel: "rounded-xl border border-border/60 bg-muted/30 p-4",
  railItem: "rounded-xl border border-border/60 bg-muted/25 p-3.5 text-sm leading-6 text-foreground",
};
