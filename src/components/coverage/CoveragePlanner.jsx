import { useMemo, useState } from "react";
import { ABSENCE_COVERAGE, NORMAL_ASSIGNMENTS, TECHNICIAN_BY_ID, TECHNICIANS } from "./coverageData";
import "./coverage.css";

function NormalView() {
  const totalTasks = useMemo(
    () => TECHNICIANS.reduce((sum, tec) => sum + (NORMAL_ASSIGNMENTS[tec.id]?.length || 0), 0),
    []
  );

  return (
    <div className="cov-panel active">
      <div className="cov-alert-box cov-info">
        <i className="cov-alert-icon">i</i>
        <span>Reparto habitual con el equipo completo. Total: {totalTasks} tareas repartidas entre 4 tecnicos.</span>
      </div>
      <div className="cov-normal-grid">
        {TECHNICIANS.map((tec) => (
          <div className="cov-area-card" key={tec.id}>
            <div className="cov-area-head">
              <span className="cov-area-dot" style={{ background: tec.accentVar }}></span>
              {tec.name} - {NORMAL_ASSIGNMENTS[tec.id].length} tareas
            </div>
            {NORMAL_ASSIGNMENTS[tec.id].map((row) => (
              <div className="cov-sub-row" key={`${tec.id}-${row.loc}-${row.area}`}>
                <span className="cov-loc">{row.loc}</span>
                <span className={`cov-pill ${tec.pillClass}`}>{row.area}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AbsenceView({ absentId }) {
  const absent = TECHNICIAN_BY_ID[absentId];
  const coverage = ABSENCE_COVERAGE[absentId];

  if (!absent || !coverage) {
    return null;
  }

  return (
    <div className="cov-panel active">
      <div className="cov-alert-box cov-warn">
        <i className="cov-alert-icon">!</i>
        <span>
          Ausente: <strong>{absent.name}</strong>. Las tareas se redistribuyen automaticamente entre el resto del equipo.
        </span>
      </div>
      <div className="cov-areas">
        <div className="cov-area-card">
          <div className="cov-area-head">
            <span className="cov-area-dot" style={{ background: absent.accentVar }}></span>
            CCTV - cubre
          </div>
          {coverage.cctv.map((row) => (
            <div className="cov-sub-row" key={`${absentId}-cctv-${row.loc}`}>
              <span className="cov-loc">{row.loc}</span>
              <span className={`cov-pill ${TECHNICIAN_BY_ID[row.by].pillClass}`}>{TECHNICIAN_BY_ID[row.by].name}</span>
            </div>
          ))}
        </div>
        <div className="cov-area-card">
          <div className="cov-area-head">
            <span className="cov-area-dot" style={{ background: absent.accentVar }}></span>
            Monitorizacion - cubre
          </div>
          {coverage.monitoring.map((row) => (
            <div className="cov-sub-row" key={`${absentId}-monitor-${row.loc}`}>
              <span className="cov-loc">{row.loc}</span>
              <span className={`cov-pill ${TECHNICIAN_BY_ID[row.by].pillClass}`}>{TECHNICIAN_BY_ID[row.by].name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="cov-load-summary">
        <div className="cov-load-title">Carga resultante durante ausencia</div>
        <div className="cov-load-bars">
          {coverage.loads.map((load) => (
            <div className="cov-bar-row" key={`${absentId}-${load.id}-bar`}>
              <span className="cov-bar-name">{TECHNICIAN_BY_ID[load.id].name}</span>
              <div className="cov-bar-track">
                <div className="cov-bar-fill" style={{ width: `${load.width}%`, background: TECHNICIAN_BY_ID[load.id].accentVar }} />
              </div>
              <span className="cov-bar-count">{load.summary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CoveragePlanner() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="cov-root">
      <div className="cov-main">
        <div className="cov-intro">
          <h1>Plan de sustituciones</h1>
          <p>
            Selecciona el tecnico que esta ausente para ver quien asume cada tarea.
            <br />
            Operativa remota, con balance por volumen de asignaciones.
          </p>
        </div>

        <div className="cov-selector-label">Tecnico ausente hoy</div>
        <div className="cov-selector">
          <button
            className={`cov-btn-normal ${selected === "normal" ? "active" : ""}`}
            onClick={() => setSelected("normal")}
            type="button"
          >
            <div className="cov-initials-n">▶</div>
            <div>
              <span className="cov-tec-name">Ver asignacion normal</span>
              <span className="cov-tec-load">Todo el equipo presente - reparto habitual</span>
            </div>
          </button>

          {TECHNICIANS.map((tec) => (
            <button
              key={tec.id}
              className={`cov-tec-btn ${selected === tec.id ? "active" : ""}`}
              data-tec={tec.id}
              onClick={() => setSelected(tec.id)}
              type="button"
            >
              <div className="cov-initials">{tec.initials}</div>
              <span className="cov-tec-name">{tec.name}</span>
              <span className="cov-tec-load">{tec.normalLoad} tareas</span>
            </button>
          ))}
        </div>

        {!selected && (
          <div className="cov-placeholder">
            <div className="cov-sym">?</div>
            <p>Selecciona un tecnico para ver su plan de cobertura</p>
          </div>
        )}

        {selected === "normal" && <NormalView />}
        {selected && selected !== "normal" && <AbsenceView absentId={selected} />}
      </div>

      <footer className="cov-footer">Contel Ingenieros · Dpto. Sistemas y Desarrollo · Uso interno</footer>
    </section>
  );
}
