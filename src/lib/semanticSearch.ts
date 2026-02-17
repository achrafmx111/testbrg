const SKILL_SYNONYMS: Record<string, string[]> = {
  sap: ["sap", "erp", "s4hana", "s/4", "hana"],
  btp: ["btp", "business technology platform", "sap btp", "cloud platform"],
  fi: ["fi", "finance", "financial accounting"],
  mm: ["mm", "materials", "material management", "procurement"],
  sd: ["sd", "sales", "sales distribution"],
  abap: ["abap", "development", "developer"],
  german: ["german", "deutsch", "de", "german language"],
  english: ["english", "en", "business english"],
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function expandSemanticTerms(input: string): string[] {
  const normalized = normalize(input);
  if (!normalized) return [];

  const tokens = normalized.split(" ").filter(Boolean);
  const expanded = new Set<string>([normalized, ...tokens]);

  tokens.forEach((token) => {
    Object.entries(SKILL_SYNONYMS).forEach(([key, values]) => {
      if (key === token || values.includes(token)) {
        values.forEach((term) => expanded.add(term));
        expanded.add(key);
      }
    });
  });

  return Array.from(expanded);
}

export function includesSemantic(text: string, terms: string[]): boolean {
  if (!terms.length) return true;
  const normalizedText = normalize(text);
  return terms.some((term) => normalizedText.includes(term));
}
