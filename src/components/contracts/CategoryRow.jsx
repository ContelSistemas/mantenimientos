import React from 'react';
import { CAT_CONFIG, SVC_LABELS } from '../../constants/config';

export function CategoryRow({ cat, svcs, isEditing, onToggleSvc }) {
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
        {Object.entries(svcs).map(([svc, active]) => {
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
  );
}
