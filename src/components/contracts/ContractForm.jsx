import React, { useState, useEffect, useRef } from 'react';
import { CAT_CONFIG } from '../../constants/config';
import { CategoryRow } from './CategoryRow';

export function ContractForm({ onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    obra: "",
    empresa: "CI",
    nCliente: "",
    cliente: "",
    descripcion: "",
    servicios: {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCats, setSelectedCats] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const mergedSvcs = JSON.parse(JSON.stringify(initialData.servicios || {}));
      
      // Asegurar que todas las categorías cargadas tengan todos sus servicios definidos
      Object.keys(mergedSvcs).forEach(cat => {
        if (CAT_CONFIG[cat]) {
          (CAT_CONFIG[cat].services || []).forEach(s => {
            if (mergedSvcs[cat][s] === undefined) {
              mergedSvcs[cat][s] = false;
            }
          });
        }
      });

      setFormData({
        obra: initialData.obra || "",
        empresa: initialData.empresa || "CI",
        nCliente: initialData.nCliente || "",
        cliente: initialData.cliente || "",
        descripcion: initialData.descripcion || "",
        servicios: mergedSvcs
      });
      setSelectedCats(Object.keys(initialData.servicios || {}));
    }
  }, [initialData]);

  const handleToggleCat = (cat) => {
    setSelectedCats(prev => {
      if (prev.includes(cat)) {
        const next = prev.filter(c => c !== cat);
        const nextSvcs = { ...formData.servicios };
        delete nextSvcs[cat];
        setFormData({ ...formData, servicios: nextSvcs });
        return next;
      } else {
        const next = [...prev, cat];
        const nextSvcs = { ...formData.servicios };
        // Inicializar con los servicios definidos para esta categoría
        const initialSvcs = {};
        (CAT_CONFIG[cat].services || []).forEach(s => {
          initialSvcs[s] = false;
        });
        nextSvcs[cat] = initialSvcs;
        setFormData({ ...formData, servicios: nextSvcs });
        return next;
      }
    });
  };

  const handleToggleSvc = (cat, svc) => {
    setFormData(prev => ({
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

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este contrato? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contracts/${initialData.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Error al eliminar");
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el contrato");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemovePdf = async () => {
    if (!window.confirm("¿Eliminar el PDF adjunto?")) return;
    try {
      await fetch(`/api/contracts/${initialData.id}/pdf`, { method: 'DELETE' });
      onSave();
      onClose(); // Cerrar para refrescar
    } catch (err) {
      alert("Error al eliminar el PDF");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.obra || !formData.nCliente || !formData.cliente) {
      alert("Obra, Nº Cliente y Cliente son obligatorios");
      return;
    }
    
    setIsSaving(true);
    try {
      const isEdit = !!initialData?.id;
      const url = isEdit ? `/api/contracts/${initialData.id}` : '/api/contracts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Error al guardar");
      
      const savedContract = await res.json();
      const contractId = savedContract.id;

      // Subir PDF si hay uno seleccionado
      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append('pdf', pdfFile);
        const pdfRes = await fetch(`/api/contracts/${contractId}/pdf`, {
          method: 'POST',
          body: pdfFormData
        });
        if (!pdfRes.ok) alert("El contrato se guardó pero hubo un error al subir el PDF");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el contrato");
    } finally {
      setIsSaving(false);
    }
  };

  const isEdit = !!initialData?.id;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "var(--overlay-bg)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 100, padding: "20px"
    }}>
      <div style={{
        background: "var(--bg-color)", border: "1px solid var(--card-border)",
        borderRadius: "12px", width: "100%", maxWidth: "600px",
        maxHeight: "90vh", overflowY: "auto", padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", color: "var(--subtitle-color)" }}>
            {isEdit ? "Editar Contrato" : "Nuevo Contrato"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--stats-color)", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "4px", textTransform: "uppercase" }}>Obra *</label>
              <input
                required
                value={formData.obra}
                onChange={e => setFormData({ ...formData, obra: e.target.value.toUpperCase() })}
                style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px", color: "var(--text-color)", padding: "8px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "4px", textTransform: "uppercase" }}>Empresa *</label>
              <select
                value={formData.empresa}
                onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px", color: "var(--text-color)", padding: "8px", fontSize: "13px", height: "37px", appearance: "none" }}
              >
                <option value="CI">CI - Ingenieros</option>
                <option value="CS">CS - Seguridad</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "4px", textTransform: "uppercase" }}>Nº Cliente *</label>
              <input
                required
                value={formData.nCliente}
                onChange={e => setFormData({ ...formData, nCliente: e.target.value })}
                style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px", color: "var(--text-color)", padding: "8px", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "4px", textTransform: "uppercase" }}>Cliente *</label>
            <input
              required
              value={formData.cliente}
              onChange={e => setFormData({ ...formData, cliente: e.target.value })}
              style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px", color: "var(--text-color)", padding: "8px", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "4px", textTransform: "uppercase" }}>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "6px", color: "var(--text-color)", padding: "8px", fontSize: "13px", minHeight: "60px", fontFamily: "inherit" }}
            />
          </div>

          {/* PDF Section */}
          <div style={{ background: "var(--input-bg)", padding: "12px", borderRadius: "8px", border: "1px dashed var(--input-border)" }}>
            <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "8px", textTransform: "uppercase" }}>Documento PDF (Contrato)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={e => setPdfFile(e.target.files[0])}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: "6px 12px", borderRadius: "6px", background: "var(--card-bg-expanded)",
                  color: "var(--text-color)", border: "1px solid var(--card-border)", fontSize: "12px", cursor: "pointer"
                }}
              >
                {pdfFile ? "Cambiar PDF" : "Seleccionar PDF"}
              </button>
              {pdfFile && <span style={{ fontSize: "11px", color: "var(--highlight-color)" }}>{pdfFile.name}</span>}
              {!pdfFile && initialData?.pdf_url && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#10b981" }}>✓ PDF cargado</span>
                  <button 
                    type="button" 
                    onClick={handleRemovePdf}
                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "10px", color: "var(--stats-color)", marginBottom: "8px", textTransform: "uppercase" }}>Categorías de Servicio</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              {Object.keys(CAT_CONFIG).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleToggleCat(cat)}
                  style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 600,
                    cursor: "pointer", border: "1px solid",
                    background: selectedCats.includes(cat) ? CAT_CONFIG[cat].color : "transparent",
                    color: selectedCats.includes(cat) ? "white" : "var(--stats-secondary)",
                    borderColor: selectedCats.includes(cat) ? CAT_CONFIG[cat].color : "var(--card-border)"
                  }}
                >
                  {CAT_CONFIG[cat].icon} {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedCats.map(cat => (
                <CategoryRow
                  key={cat}
                  cat={cat}
                  svcs={formData.servicios[cat]}
                  isEditing={true}
                  onToggleSvc={handleToggleSvc}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              style={{
                flex: 2, background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white", border: "none", borderRadius: "8px",
                padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer"
              }}
            >
              {isSaving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Contrato"}
            </button>
            
            {isEdit && (
              <button
                type="button"
                disabled={isSaving || isDeleting}
                onClick={handleDelete}
                style={{
                  flex: 1, background: "#ef4444",
                  color: "white", border: "none", borderRadius: "8px",
                  padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer"
                }}
              >
                {isDeleting ? "..." : "Eliminar"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, background: "var(--input-bg)", color: "var(--text-color)",
                border: "1px solid var(--header-border)", borderRadius: "8px",
                padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer"
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
