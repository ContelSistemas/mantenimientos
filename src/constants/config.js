export const SVC_LABELS = {
  "MONIT":       { short: "MON", label: "Monitorización" },
  "HELP":        { short: "HLP", label: "Helpdesk" },
  "PREV. PRES.": { short: "PRV", label: "Prev. Presencial" },
  "COR. PRES.":  { short: "COR", label: "Cor. Presencial" },
  // Servicios 24/7
  "DISP":        { short: "DSP", label: "Disponibilidad" },
  "PREM":        { short: "PRM", label: "Premium" },
  // Servicios Licencias
  "HOTSPOT":     { short: "HOT", label: "Hotspot" },
  "FORTINET":    { short: "FTN", label: "Fortinet" },
  "MIDDLEWARE":  { short: "MID", label: "Middleware" },
  "CHROMECAST":  { short: "CHR", label: "Chromecast" },
  "BERKANO":     { short: "BRK", label: "BBC Berkano" },
  "KABELIO":     { short: "KAB", label: "BBC Kabelio" },
};

const DEFAULT_SVCS = ["MONIT", "HELP", "PREV. PRES.", "COR. PRES."];

export const CAT_CONFIG = {
  "WIFI":           { icon: "📶", color: "#6366f1", services: DEFAULT_SVCS },
  "VOIP/TELEFONIA": { icon: "📞", color: "#0ea5e9", services: DEFAULT_SVCS },
  "CCTV":           { icon: "📷", color: "#f59e0b", services: DEFAULT_SVCS },
  "UPS":            { icon: "🔋", color: "#10b981", services: DEFAULT_SVCS },
  "AUDIOVISUALES":  { icon: "🔊", color: "#ec4899", services: DEFAULT_SVCS },
  "TV/IPTV":        { icon: "📺", color: "#8b5cf6", services: DEFAULT_SVCS },
  "DOMOTICA":       { icon: "🏠", color: "#14b8a6", services: DEFAULT_SVCS },
  "INCENDIO":       { icon: "🔥", color: "#ef4444", services: DEFAULT_SVCS },
  "EVACUACION":     { icon: "🏃", color: "#f97316", services: DEFAULT_SVCS },
  "ANTIINTRUSION":  { icon: "🛡️", color: "#dc2626", services: DEFAULT_SVCS },
  "RED OFIMATICA":  { icon: "💻", color: "#4b5563", services: DEFAULT_SVCS },
  "NETWORKING/GPON":{ icon: "🌐", color: "#2563eb", services: DEFAULT_SVCS },
  "24/7":           { icon: "⏰", color: "#facc15", services: ["DISP", "PREM"] },
  "LICENCIAS":      { icon: "🔑", color: "#c026d3", services: ["HOTSPOT", "FORTINET", "MIDDLEWARE", "CHROMECAST", "BERKANO", "KABELIO"] },
};
