import React, { useEffect, useMemo, useState, useCallback } from "react";
import Joyride, { EVENTS, STATUS } from "react-joyride";

const STORAGE_KEY = "contel_buscador_tour_v1_seen";

function buildSteps({ userRole }) {
  const steps = [
    {
      target: "#tour-section-contracts",
      title: "Buscador de contratos",
      content: "Aquí vuelves al buscador principal (contratos, servicios, PDFs, notas).",
      placement: "bottom",
      disableBeacon: true,
      meta: { section: "contracts" },
    },
    {
      target: "#tour-search-query",
      title: "Búsqueda general",
      content: "Busca por obra, nº cliente, cliente o descripción. El filtrado es en tiempo real.",
      placement: "bottom",
      meta: { section: "contracts" },
    },
    {
      target: "#tour-search-category",
      title: "Filtro por categoría",
      content: "Filtra por nombre de categoría (ej. “Mantenimiento”, “Helpdesk”).",
      placement: "bottom",
      meta: { section: "contracts" },
    },
    {
      target: "#tour-contract-row",
      title: "Abrir un contrato",
      content: "Pulsa una fila para desplegar los servicios contratados y ver más detalle.",
      placement: "bottom",
      meta: { section: "contracts" },
    },
    {
      target: "#tour-contract-notes",
      title: "Notas por contrato",
      content: "Usa 📝 para ver (y si eres ADMIN, editar) notas internas del contrato.",
      placement: "left",
      meta: { section: "contracts" },
    },
    ...(userRole === "ADMIN"
      ? [
          {
            target: "#tour-new-contract",
            title: "Alta de contrato (ADMIN)",
            content: "Crea un nuevo contrato desde aquí (alta/edición completa).",
            placement: "bottom",
            meta: { section: "contracts" },
          },
        ]
      : []),
    {
      target: "#tour-section-coverage",
      title: "Asignación de soporte",
      content: "Cambia a la vista de cobertura para reparto normal y simulación por ausencia.",
      placement: "bottom",
      meta: { section: "contracts" },
    },
    {
      target: "#tour-coverage-selector",
      title: "Selecciona técnico ausente",
      content: "Elige un técnico para simular la redistribución. “Asignación normal” muestra el reparto habitual.",
      placement: "top",
      meta: { section: "coverage" },
    },
    {
      target: "#tour-theme-toggle",
      title: "Tema claro/oscuro",
      content: "Cambia el tema. La preferencia se guarda en este navegador.",
      placement: "bottom",
      meta: { section: "contracts" },
    },
    {
      target: "#tour-logout",
      title: "Cerrar sesión",
      content: "Cierra la sesión actual.",
      placement: "bottom",
      meta: { section: "contracts" },
    },
  ];

  return steps;
}

export function AppTour({
  userRole,
  activeSection,
  onSectionChange,
  open,
  onClose,
  autoStart,
  contractsReady,
}) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => buildSteps({ userRole }), [userRole]);

  const close = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setStepIndex(0);
      setRun(true);
      return;
    }
    setRun(false);
    setStepIndex(0);
  }, [open]);

  useEffect(() => {
    if (!autoStart) return;
    const alreadySeen = localStorage.getItem(STORAGE_KEY) === "1";
    if (alreadySeen) return;
    setStepIndex(0);
    setRun(true);
  }, [autoStart]);

  const handleCallback = useCallback(
    (data) => {
      const { status, type, index } = data;
      const stepTarget = data?.step?.target;
      const isContractTarget = stepTarget === "#tour-contract-row" || stepTarget === "#tour-contract-notes";

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        localStorage.setItem(STORAGE_KEY, "1");
        close();
        return;
      }

      if (type === EVENTS.STEP_BEFORE) {
        const targetSection = steps[index]?.meta?.section;
        if (targetSection && targetSection !== activeSection) {
          setRun(false);
          onSectionChange?.(targetSection);
          window.setTimeout(() => setRun(true), 80);
        }
        return;
      }

      if (type === EVENTS.TARGET_NOT_FOUND) {
        if (isContractTarget && !contractsReady) {
          setRun(false);
          window.setTimeout(() => setRun(true), 250);
          return;
        }
        if (Number.isInteger(index)) setStepIndex(index + 1);
        return;
      }

      if (type === EVENTS.STEP_AFTER) {
        if (Number.isInteger(index)) setStepIndex(index + 1);
      }
    },
    [activeSection, close, contractsReady, onSectionChange, steps]
  );

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      showSkipButton
      showProgress
      disableOverlayClose
      spotlightPadding={10}
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: "var(--card-bg)",
          backgroundColor: "var(--card-bg)",
          primaryColor: "var(--highlight-color)",
          textColor: "var(--text-color)",
          overlayColor: "rgba(0, 0, 0, 0.65)",
        },
        tooltip: {
          borderRadius: 12,
          border: "1px solid var(--card-border)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        },
        buttonNext: {
          borderRadius: 10,
          fontFamily: "inherit",
          fontWeight: 700,
        },
        buttonBack: {
          borderRadius: 10,
          fontFamily: "inherit",
          fontWeight: 700,
        },
        buttonSkip: {
          borderRadius: 10,
          fontFamily: "inherit",
          fontWeight: 700,
        },
      }}
      locale={{
        back: "Atrás",
        close: "Cerrar",
        last: "Terminar",
        next: "Siguiente",
        skip: "Saltar",
      }}
    />
  );
}
