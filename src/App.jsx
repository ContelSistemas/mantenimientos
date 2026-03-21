import { useState, useMemo, useEffect } from "react";

const CAT_CONFIG = {
  "WIFI":           { icon: "📶", color: "#6366f1" },
  "VOIP/TELEFONIA": { icon: "📞", color: "#0ea5e9" },
  "CCTV":           { icon: "📷", color: "#f59e0b" },
  "UPS":            { icon: "🔋", color: "#10b981" },
  "AUDIOVISUALES":  { icon: "🔊", color: "#ec4899" },
  "TV/IPTV":        { icon: "📺", color: "#8b5cf6" },
  "DOMOTICA":       { icon: "🏠", color: "#14b8a6" },
};

const SVC_LABELS = {
  "MONIT":       { short: "MON", label: "Monitorización" },
  "HELP":        { short: "HLP", label: "Helpdesk" },
  "PREV. PRES.": { short: "PRV", label: "Prev. Presencial" },
  "COR. PRES.":  { short: "COR", label: "Cor. Presencial" },
};

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toUpperCase().indexOf(query.toUpperCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#f59e0b", color: "#1a1a2e", borderRadius: "2px", padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function CategoryRow({ cat, svcs }) {
  const cfg = CAT_CONFIG[cat] || { icon: "⚙️", color: "#94a3b8" };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "5px 10px", borderRadius: "6px",
      background: cfg.color + "11", border: `1px solid ${cfg.color}22`,
    }}>
      <span style={{ fontSize: "13px" }}>{cfg.icon}</span>
      <span style={{ fontSize: "11px", fontWeight: 700, color: cfg.color, width: "100px", flexShrink: 0 }}>{cat}</span>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {Object.entries(svcs).map(([svc, active]) => active ? (
          <span key={svc} title={SVC_LABELS[svc]?.label || svc} style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em",
            padding: "2px 6px", borderRadius: "3px",
            background: cfg.color + "25", color: cfg.color,
            border: `1px solid ${cfg.color}55`,
          }}>
            {SVC_LABELS[svc]?.short || svc}
          </span>
        ) : (
          <span key={svc} title={SVC_LABELS[svc]?.label || svc} style={{
            fontSize: "9px", fontWeight: 500, letterSpacing: "0.05em",
            padding: "2px 6px", borderRadius: "3px",
            background: "#1e1b4b", color: "#374151",
            border: "1px solid #1e293b",
          }}>
            {SVC_LABELS[svc]?.short || svc}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetch("/api/contracts")
      .then(res => {
        if (!res.ok) throw new Error("Error cargando datos");
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return data;
    return data.filter(r =>
      r.obra.toUpperCase().includes(q) ||
      r.nCliente.toUpperCase().includes(q) ||
      r.cliente.toUpperCase().includes(q) ||
      (r.descripcion && r.descripcion.toUpperCase().includes(q))
    );
  }, [query, data]);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const copyText = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #0f0f1a 100%)",
        borderBottom: "1px solid #312e6e",
        padding: "22px 28px 16px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            width: 34, height: 34, borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "17px", fontWeight: "bold", color: "white", flexShrink: 0,
          }}>C</div>
          <div>
            <div style={{ fontSize: "10px", color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Contel Ingenieros</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>MONIT. Y HELPDESK — Buscador</div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#6366f1", fontSize: "16px", pointerEvents: "none" }}>⌕</span>
          <input
            type="text"
            placeholder="Buscar por obra, nº cliente, cliente o descripción..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            disabled={loading}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#1e1b4b", border: "1.5px solid #4338ca", borderRadius: "10px",
              padding: "10px 36px 10px 38px", fontSize: "13px", color: "#f1f5f9",
              outline: "none", fontFamily: "inherit",
              opacity: loading ? 0.6 : 1
            }}
            onFocus={e => e.target.style.borderColor = "#818cf8"}
            onBlur={e => e.target.style.borderColor = "#4338ca"}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "18px" }}>×</button>
          )}
        </div>

        {/* Stats + legend */}
        <div style={{ display: "flex", gap: "14px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b" }}>
            {loading ? (
              <span>Cargando datos...</span>
            ) : error ? (
              <span style={{ color: "#ef4444" }}>Error: {error}</span>
            ) : (
              <>
                <span style={{ color: "#818cf8", fontWeight: 700 }}>{results.length}</span> resultado{results.length !== 1 ? "s" : ""}
                {query && <span> de {data.length}</span>}
                {" · "}pulsa fila para ver servicios
              </>
            )}
          </span>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(SVC_LABELS).map(([k, v]) => (
              <span key={k} style={{ fontSize: "9px", color: "#475569" }}>
                <span style={{ color: "#818cf8", fontWeight: 700 }}>{v.short}</span> = {v.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "12px 18px 40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <div className="spinner" style={{ marginBottom: "15px" }}></div>
            <div style={{ fontSize: "14px" }}>Sincronizando con base de datos...</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
            <div style={{ fontSize: "14px" }}>{query ? <>Sin resultados para <strong style={{ color: "#818cf8" }}>"{query}"</strong></> : "No hay datos disponibles"}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {results.map((row) => {
              const isOpen = expanded === row.id;
              const cats = Object.keys(row.servicios || {});
              return (
                <div
                  key={row.id}
                  onClick={() => toggleExpand(row.id)}
                  style={{
                    background: isOpen ? "#1a1740" : "#151528",
                    border: `1px solid ${isOpen ? "#4338ca" : "#1e1b4b"}`,
                    borderRadius: "10px", cursor: "pointer",
                    transition: "all 0.15s", overflow: "hidden",
                  }}
                  onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.background = "#181630"; e.currentTarget.style.borderColor = "#312e6e"; } }}
                  onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.background = "#151528"; e.currentTarget.style.borderColor = "#1e1b4b"; } }}
                >
                  {/* Main row */}
                  <div style={{ padding: "11px 14px", display: "grid", gridTemplateColumns: "106px 60px 1fr auto", gap: "10px", alignItems: "center" }}>
                    {/* Obra */}
                    <div>
                      <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Obra</div>
                      <div onClick={e => copyText(row.obra, e)} title="Click para copiar"
                        style={{ fontSize: "11px", fontWeight: 700, color: "#818cf8", cursor: "copy" }}>
                        {copied === row.obra ? "✓ Copiado" : highlight(row.obra, query)}
                      </div>
                    </div>
                    {/* Nº Cliente */}
                    <div>
                      <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Nº Cli.</div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#a5b4fc" }}>{highlight(row.nCliente, query)}</div>
                    </div>
                    {/* Cliente + desc */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {highlight(row.cliente, query)}
                      </div>
                      {row.descripcion && (
                        <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {highlight(row.descripcion, query)}
                        </div>
                      )}
                    </div>
                    {/* Category icons + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100px" }}>
                        {cats.map(cat => (
                          <span key={cat} title={cat} style={{
                            fontSize: "11px", padding: "2px 4px", borderRadius: "3px",
                            background: (CAT_CONFIG[cat]?.color || "#94a3b8") + "22",
                            border: `1px solid ${(CAT_CONFIG[cat]?.color || "#94a3b8")}44`,
                          }}>
                            {CAT_CONFIG[cat]?.icon || "⚙️"}
                          </span>
                        ))}
                      </div>
                      <span style={{ color: "#475569", fontSize: "11px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded services */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid #2d2b55", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "5px", background: "#13112a" }}>
                      <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Servicios contratados</div>
                      {Object.entries(row.servicios || {}).map(([cat, svcs]) => (
                        <CategoryRow key={cat} cat={cat} svcs={svcs} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        mark { font-family: inherit; }
        .spinner {
          width: 30px; height: 30px;
          border: 3px solid #1e1b4b;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
