const DEMO_MODE_STORAGE_KEY = "bridging_demo_mode";

function envForcesDemoMode(): boolean {
  return import.meta.env.VITE_FORCE_DEMO_MODE === "true";
}

export function readDemoMode(): boolean {
  if (typeof window === "undefined") {
    return envForcesDemoMode();
  }

  const raw = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return envForcesDemoMode();
}

export function writeDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? "true" : "false");
}
