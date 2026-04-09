import React from 'react';
import { CAT_CONFIG, SVC_LABELS, PERIODICITY_OPTIONS } from '../../constants/config';

export function CategoryRow({ cat, svcs, isEditing, onToggleSvc, onChangeMaintenance }) {
  const cfg = CAT_CONFIG[cat] || { icon: "⚙️", color: "#94a3b8" };
  
  // Handle both old and new structure for safety during migration
  const flags = svcs?.flags || svcs || {};
  const periodicity = svcs?.periodicity || "";
  const last_execution = svcs?.last_execution || "";
  const next_execution = svcs?.next_execution || "";

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "8px",
      padding: "8px 10px", borderRadius: "6px",
      background: cfg.color + "11", border: `1px solid ${cfg.color}22`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13px" }}>{cfg.icon}</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: cfg.color, width: "100px", flexShrink: 0 }}>{cat}</span>
        
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", flex: 1 }}>
          {Object.entries(flags).map(([svc, active]) => {
            const label = SVC_LABELS[svc]?.label || svc;
            const short = SVC_LABELS[svc]?.short || svc;
            
            if (isEditing) {
              return (
                <label key={svc} style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "9px", fontWeight: 700, cursor: "pointer",
                  padding: "2px 6px", borderRadius: "3px",
                  background: active ? cfg.color + "25" : "var(--svc-inactive-bg)",
                  color: active ? cfg.color : "var(--svc-inactive-text)",
                  border: `1px solid ${active ? cfg.color + "55" : "var(--svc-inactive-border)"}`,
                  opacity: active ? 1 : 0.6,
                }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggleSvc(cat, svc)}
                    style={{ margin: 0, width: "10px", height: "10px" }}
                  />
                  {short}
                </label>
              );
            }
            
            return (
              <span key={svc} title={label} style={{
                fontSize: "9px", fontWeight: active ? 700 : 500, letterSpacing: "0.05em",
                padding: "2px 6px", borderRadius: "3px",
                background: active ? cfg.color + "25" : "var(--svc-inactive-bg)",
                color: active ? cfg.color : "var(--svc-inactive-text)",
                border: `1px solid ${active ? cfg.color + "55" : "var(--svc-inactive-border)"}`,
                opacity: active ? 1 : 0.4,
              }}>
                {short}
              </span>
            );
          })}
        </div>
      </div>

      {/* Maintenance Section */}
      <div style={{ 
        display: "flex", gap: "10px", alignItems: "center", 
        paddingLeft: "21px", borderTop: "1px solid " + cfg.color + "22", 
        paddingTop: "6px", marginTop: "2px" 
      }}>
        {isEditing ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label style={{ fontSize: "8px", color: "var(--stats-color)", textTransform: "uppercase" }}>Periodicidad</label>
              <select
                value={periodicity || ""}
                onChange={(e) => onChangeMaintenance(cat, 'periodicity', e.target.value)}
                style={{ background: "var(--input-bg)", color: "var(--text-color)", border: "1px solid var(--input-border)", borderRadius: "4px", fontSize: "10px", padding: "2px 4px" }}
              >
                <option value="">- Periodicidad -</option>
                {PERIODICITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label style={{ fontSize: "8px", color: "var(--stats-color)", textTransform: "uppercase" }}>Última Ejecución</label>
              <input
                type="date"
                value={last_execution || ""}
                onChange={(e) => onChangeMaintenance(cat, 'last_execution', e.target.value)}
                style={{ background: "var(--input-bg)", color: "var(--text-color)", border: "1px solid var(--input-border)", borderRadius: "4px", fontSize: "10px", padding: "2px 4px" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label style={{ fontSize: "8px", color: "var(--stats-color)", textTransform: "uppercase" }}>Próxima Ejecución</label>
              <input
                type="date"
                value={next_execution || ""}
                onChange={(e) => onChangeMaintenance(cat, 'next_execution', e.target.value)}
                style={{ background: "var(--input-bg)", color: "var(--text-color)", border: "1px solid var(--input-border)", borderRadius: "4px", fontSize: "10px", padding: "2px 4px" }}
              />
            </div>
          </>
        ) : (
          <>
            {periodicity && (
              <span style={{ fontSize: "10px", color: "var(--stats-color)" }}>
                🔄 <b>{PERIODICITY_OPTIONS.find(o => o.value === periodicity)?.label}</b>
              </span>
            )}
            {last_execution && (
              <span style={{ fontSize: "10px", color: "var(--stats-color)" }}>
                ✅ Último: {new Date(last_execution).toLocaleDateString()}
              </span>
            )}
            {next_execution && (
              <span style={{ 
                fontSize: "10px", 
                fontWeight: 600,
                color: new Date(next_execution) < new Date() ? "#ef4444" : "#10b981" 
              }}>
                📅 Próximo: {new Date(next_execution).toLocaleDateString()}
                {new Date(next_execution) < new Date() && " ⚠️"}
              </span>
            )}
            {!periodicity && !last_execution && !next_execution && (
              <span style={{ fontSize: "9px", color: "var(--stats-secondary)", fontStyle: "italic" }}>
                Sin mantenimiento programado
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
