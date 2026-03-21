import React, { useState } from 'react';
import { CategoryRow } from './CategoryRow';
import { CAT_CONFIG } from '../../constants/config';
import { highlight } from '../../utils/helpers';

export function ContractRow({ row, query, isOpen, onToggle, onUpdate, onCopy, copied }) {
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
      // update description if changed
      if (editData.descripcion !== row.descripcion) {
        await fetch(`/api/contracts/${row.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ descripcion: editData.descripcion })
        });
      }
      
      // update services
      await fetch(`/api/contracts/${row.id}/services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData.servicios)
      });
      
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
          [svc]: !prev.servicios[cat][svc]
        }
      }
    }));
  };

  return (
    <div
      onClick={() => !isEditing && onToggle()}
      style={{
        background: isOpen ? "#1a1740" : "#151528",
        border: `1px solid ${isOpen ? "#4338ca" : "#1e1b4b"}`,
        borderRadius: "10px", cursor: isEditing ? "default" : "pointer",
        transition: "all 0.15s", overflow: "hidden",
      }}
      onMouseEnter={e => { if (!isOpen && !isEditing) { e.currentTarget.style.background = "#181630"; e.currentTarget.style.borderColor = "#312e6e"; } }}
      onMouseLeave={e => { if (!isOpen && !isEditing) { e.currentTarget.style.background = "#151528"; e.currentTarget.style.borderColor = "#1e1b4b"; } }}
    >
      {/* Main row */}
      <div style={{ padding: "11px 14px", display: "grid", gridTemplateColumns: "106px 60px 1fr auto", gap: "10px", alignItems: "center" }}>
        {/* Obra */}
        <div>
          <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Obra</div>
          <div onClick={e => onCopy(row.obra, e)} title="Click para copiar"
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
          {isEditing ? (
            <input
              type="text"
              value={editData.descripcion}
              onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
              onClick={e => e.stopPropagation()}
              placeholder="Descripción..."
              style={{
                width: "100%", background: "#1e1b4b", border: "1px solid #4338ca",
                borderRadius: "4px", color: "#f1f5f9", fontSize: "11px", padding: "2px 6px",
                fontFamily: "inherit", marginTop: "2px"
              }}
            />
          ) : (
            row.descripcion && (
              <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {highlight(row.descripcion, query)}
              </div>
            )
          )}
        </div>
        {/* Icons + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
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
          
          <div style={{ display: "flex", gap: "4px" }}>
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                style={{
                  background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: "6px",
                  color: "#818cf8", padding: "4px 8px", fontSize: "10px", cursor: "pointer"
                }}
              >
                ✎
              </button>
            ) : (
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
            )}
          </div>

          <span style={{ color: "#475569", fontSize: "11px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>

      {/* Expanded services */}
      {isOpen && (
        <div style={{ borderTop: "1px solid #2d2b55", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "5px", background: "#13112a" }}>
          <div style={{ fontSize: "9px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
            {isEditing ? "Editar servicios" : "Servicios contratados"}
          </div>
          {Object.entries(isEditing ? editData.servicios : row.servicios || {}).map(([cat, svcs]) => (
            <CategoryRow
              key={cat}
              cat={cat}
              svcs={svcs}
              isEditing={isEditing}
              onToggleSvc={toggleSvc}
            />
          ))}
        </div>
      )}
    </div>
  );
}
