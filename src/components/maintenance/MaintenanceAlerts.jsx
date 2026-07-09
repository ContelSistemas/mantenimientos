import React, { useMemo, useState, useEffect, useCallback } from "react";
import { CAT_CONFIG, SVC_LABELS, PERIODICITY_OPTIONS } from "../../constants/config";
import { highlight } from "../../utils/helpers";

function formatIsoDate(value) {
  if (!value) return "—";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function getStatusLabel(status) {
  if (status === "missing") return "Sin fecha";
  if (status === "overdue") return "Vencido";
  return "Pendiente";
}

const FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "overdue", label: "Vencidos" },
  { value: "missing", label: "Sin fecha" }
];

const SORT_OPTIONS = [
  { value: "next_execution_asc", label: "Próximo vencimiento ↑" },
  { value: "next_execution_desc", label: "Próximo vencimiento ↓" },
  { value: "last_execution_asc", label: "Última ejecución ↑" },
  { value: "last_execution_desc", label: "Última ejecución ↓" },
  { value: "cliente_asc", label: "Cliente A-Z" },
  { value: "cliente_desc", label: "Cliente Z-A" }
];

export function MaintenanceAlerts({
  query = "",
  onOpenContract
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("next_execution_asc");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        filter,
        sort
      });
      const res = await fetch(`/api/maintenance/alerts?${params.toString()}`, { credentials: 'same-origin' });
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      if (!res.ok) throw new Error("Error cargando los mantenimientos");
      const json = await res.json();
      setItems(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const summary = useMemo(() => {
    const overdue = items.filter((item) => item.status === "overdue").length;
    const missing = items.filter((item) => item.status === "missing").length;
    return { total: items.length, overdue, missing };
  }, [items]);

  const isEmpty = !loading && !error && items.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: "12px",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)"
      }}>
        <span style={{ fontSize: "11px", color: "var(--stats-color)" }}>
          Mantenimientos detectados:
        </span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-color)" }}>
          {summary.total}
        </span>
        <span style={{ fontSize: "11px", color: "#ef4444" }}>
          Vencidos: <b>{summary.overdue}</b>
        </span>
        <span style={{ fontSize: "11px", color: "#f59e0b" }}>
          Sin fecha: <b>{summary.missing}</b>
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid var(--card-border)",
                background: filter === opt.value ? "var(--primary-color)" : "var(--input-bg)",
                color: filter === opt.value ? "#fff" : "var(--text-color)",
                transition: "all 0.15s ease"
              }}
            >
              {opt.label}
            </button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid var(--card-border)",
              background: "var(--input-bg)",
              color: "var(--text-color)",
              minWidth: "180px"
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--stats-color)" }}>
          <div className="spinner" style={{ margin: "0 auto 14px" }} />
          <div style={{ fontSize: "14px" }}>Buscando mantenimientos pendientes...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "#ef4444" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>⚠️</div>
          <div style={{ fontSize: "15px", marginBottom: "6px" }}>Error al cargar los mantenimientos</div>
          <div style={{ fontSize: "13px" }}>{error}</div>
        </div>
      ) : isEmpty ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          borderRadius: "12px",
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          color: "var(--stats-color)"
        }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
          <div style={{ fontSize: "15px", marginBottom: "6px" }}>
            No hay mantenimientos vencidos ni contratos sin próxima fecha.
          </div>
          <div style={{ fontSize: "13px" }}>
            Todo el reparto de mantenimiento está al día.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map((item) => {
            const catCfg = CAT_CONFIG[item.category] || { icon: "⚙️", color: "#94a3b8" };
            const statusLabel = getStatusLabel(item.status);
            const statusColor = item.status === "overdue" ? "#ef4444" : "#f59e0b";
            const periodicityLabel = PERIODICITY_OPTIONS.find((opt) => opt.value === item.periodicity)?.label || item.periodicity || "—";
            const activeServiceLabels = (item.activeServices || []).map((serviceKey) => SVC_LABELS[serviceKey]?.short || serviceKey);

            return (
              <div
                key={`${item.contract_id}-${item.category}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "var(--card-bg)",
                  border: `1px solid ${statusColor}33`
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px" }}>{catCfg.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: catCfg.color }}>
                      {item.category}
                    </span>
                    <span style={{
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      color: statusColor,
                      background: `${statusColor}18`,
                      border: `1px solid ${statusColor}44`
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                  <div style={{ marginTop: "5px", fontSize: "13px", fontWeight: 700, color: "var(--text-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {highlight(item.cliente, query)}
                  </div>
                  <div style={{ marginTop: "2px", fontSize: "11px", color: "var(--stats-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {highlight(item.obra, query)} · Nº {highlight(item.nCliente, query)}
                  </div>
                  {item.descripcion && (
                    <div style={{ marginTop: "2px", fontSize: "11px", color: "var(--stats-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {highlight(item.descripcion, query)}
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "var(--stats-color)" }}>
                  <div><b style={{ color: "var(--text-color)" }}>Periodicidad:</b> {periodicityLabel}</div>
                  <div><b style={{ color: "var(--text-color)" }}>Última:</b> {formatIsoDate(item.last_execution)}</div>
                  <div>
                    <b style={{ color: "var(--text-color)" }}>Próxima:</b> {formatIsoDate(item.next_execution)}
                    {item.status === "overdue" && (
                      <span style={{ color: "#ef4444", fontWeight: 700 }}> {" "}⚠️ vencido</span>
                    )}
                  </div>
                  {activeServiceLabels.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                      {activeServiceLabels.map((service) => (
                        <span
                          key={`${item.contract_id}-${item.category}-${service}`}
                          style={{
                            fontSize: "9px",
                            padding: "2px 5px",
                            borderRadius: "4px",
                            background: "var(--input-bg)",
                            border: "1px solid var(--input-border)",
                            color: "var(--text-color)"
                          }}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => onOpenContract?.(item)}
                    style={{
                      border: "1px solid var(--card-border)",
                      background: "var(--input-bg)",
                      color: "var(--text-color)",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Ver contrato
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}