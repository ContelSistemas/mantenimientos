import React, { useState } from 'react';
import { CategoryRow } from './CategoryRow';
import { CAT_CONFIG } from '../../constants/config';
import { highlight } from '../../utils/helpers';

export function ContractRow({ row, query, isOpen, onToggle, onUpdate, onCopy, onEdit, copied, userRole }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    descripcion: row.descripcion || "",
    servicios: JSON.parse(JSON.stringify(row.servicios || {}))
  });
  const [isSaving, setIsSaving] = useState(false);

  const cats = Object.keys(row.servicios || {});

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    if (!isOpen) onToggle();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditData({
      descripcion: row.descripcion || "",
      servicios: JSON.parse(JSON.stringify(row.servicios || {}))
    });
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      // update contract (including description and services)
      const res = await fetch(`/api/contracts/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      if (!res.ok) throw new Error("Error al guardar");
      
      onUpdate(); // refresh data
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving contract", err);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSvc = (cat, svc) => {
    setEditData(prev => ({
      ...prev,
      servicios: {
        ...prev.servicios,
        [cat]: {
          ...prev.servicios[cat],
          flags: {
            ...prev.servicios[cat].flags,
            [svc]: !prev.servicios[cat].flags[svc]
          }
        }
      }
    }));
  };

  const changeMaintenance = (cat, field, value) => {
    setEditData(prev => ({
      ...prev,
      servicios: {
        ...prev.servicios,
        [cat]: {
          ...prev.servicios[cat],
          [field]: value
        }
      }
    }));
  };

  return (
    <div
      onClick={() => !isEditing && onToggle()}
      style={{
        background: isOpen ? "var(--card-bg-expanded)" : "var(--card-bg)",
        border: `1px solid ${isOpen ? "var(--highlight-color)" : "var(--card-border)"}`,
        borderRadius: "10px", cursor: isEditing ? "default" : "pointer",
        transition: "all 0.15s", overflow: "hidden",
      }}
      onMouseEnter={e => { if (!isOpen && !isEditing) { e.currentTarget.style.background = "var(--card-bg-hover)"; e.currentTarget.style.borderColor = "var(--highlight-color)"; } }}
      onMouseLeave={e => { if (!isOpen && !isEditing) { e.currentTarget.style.background = "var(--card-bg)"; e.currentTarget.style.borderColor = "var(--card-border)"; } }}
    >
      {/* Main row */}
      <div style={{ padding: "11px 14px", display: "grid", gridTemplateColumns: "106px 40px 60px 1fr auto", gap: "10px", alignItems: "center" }}>
        {/* Obra */}
        <div>
          <div style={{ fontSize: "9px", color: "var(--stats-color)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Obra</div>
          <div onClick={e => onCopy(row.obra, e)} title="Click para copiar"
            style={{ fontSize: "11px", fontWeight: 700, color: "var(--highlight-color)", cursor: "copy" }}>
            {copied === row.obra ? "✓ Copiado" : highlight(row.obra, query)}
          </div>
        </div>
        {/* Empresa */}
        <div>
          <div style={{ fontSize: "9px", color: "var(--stats-color)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Emp.</div>
          <div style={{ 
            fontSize: "10px", 
            fontWeight: 800, 
            color: "white", 
            background: row.empresa === 'CS' ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #3b82f6, #2563eb)",
            padding: "1px 4px",
            borderRadius: "4px",
            textAlign: "center",
            width: "fit-content"
          }}>
            {row.empresa}
          </div>
        </div>
        {/* Nº Cliente */}
        <div>
          <div style={{ fontSize: "9px", color: "var(--stats-color)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Nº Cli.</div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-color)" }}>{highlight(row.nCliente, query)}</div>
        </div>
        {/* Cliente + desc */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {highlight(row.cliente, query)}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editData.descripcion}
              onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
              onClick={e => e.stopPropagation()}
              placeholder="Descripción..."
              style={{
                width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)",
                borderRadius: "4px", color: "var(--text-color)", fontSize: "11px", padding: "2px 6px",
                fontFamily: "inherit", marginTop: "2px"
              }}
            />
          ) : (
            row.descripcion && (
              <div style={{ fontSize: "11px", color: "var(--stats-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {highlight(row.descripcion, query)}
              </div>
            )
          )}
        </div>
        {/* Icons + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "120px" }}>
            {row.pdf_url && (
              <a 
                href={row.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                title="Ver Contrato PDF"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", padding: "2px 6px", borderRadius: "3px",
                  background: "#ef444422", border: "1px solid #ef444444",
                  color: "#ef4444", textDecoration: "none"
                }}
              >
                PDF
              </a>
            )}
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
          
          <div style={{ display: "flex", gap: "4px" }}>
            {userRole === "ADMIN" && !isEditing ? (
              <>
                <button
                  onClick={handleEditClick}
                  title="Edición rápida"
                  style={{
                    background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px",
                    color: "var(--highlight-color)", padding: "4px 8px", fontSize: "10px", cursor: "pointer"
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  title="Edición completa"
                  style={{
                    background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px",
                    color: "var(--highlight-color)", padding: "4px 8px", fontSize: "10px", cursor: "pointer"
                  }}
                >
                  ⚙️
                </button>
              </>
            ) : userRole === "ADMIN" && isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    background: "#10b981", border: "none", borderRadius: "6px",
                    color: "white", padding: "4px 8px", fontSize: "10px", cursor: "pointer"
                  }}
                >
                  {isSaving ? "..." : "✓"}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#ef4444", border: "none", borderRadius: "6px",
                    color: "white", padding: "4px 8px", fontSize: "10px", cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </>
            ) : null}
          </div>

          <span style={{ color: "var(--stats-color)", fontSize: "11px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>

      {/* Expanded services */}
      {isOpen && (
        <div style={{ borderTop: "1px solid var(--card-border)", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "5px", background: "var(--bg-color)" }}>
          <div style={{ fontSize: "9px", color: "var(--stats-color)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
            {isEditing ? "Editar servicios" : "Servicios contratados"}
          </div>
          {Object.entries(isEditing ? editData.servicios : row.servicios || {}).map(([cat, svcs]) => (
            <CategoryRow
              key={cat}
              cat={cat}
              svcs={svcs}
              isEditing={isEditing}
              onToggleSvc={toggleSvc}
              onChangeMaintenance={changeMaintenance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
