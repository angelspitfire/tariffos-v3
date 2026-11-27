const TOOL_LABELS: Record<string, { running: string; done: string }> = {
  classify_item: {
    running: 'Clasificando mercancía (RGI 1→6)…',
    done: 'Clasificación completada',
  },
  request_technical_clarification: {
    running: 'Preparando validación técnica…',
    done: 'Validación técnica solicitada',
  },
  analyze_invoice_manifest: {
    running: 'Analizando manifiesto en streaming…',
    done: 'Manifiesto procesado',
  },
  web_search: {
    running: 'Buscando especificaciones en web (Parallel Fast)…',
    done: 'Especificaciones web consultadas (Parallel Fast)',
  },
  search_tariff: {
    running: 'Consultando Arancel de Aduanas…',
    done: 'Arancel consultado',
  },
  verify_hs_code: {
    running: 'Verificando código HS en base oficial…',
    done: 'Código HS verificado',
  },
  calculate_duties: {
    running: 'Calculando tributos y valor CIF…',
    done: 'Tributos recalculados',
  },
  request_dossier_review: {
    running: 'Marcando dictamen para revisión…',
    done: 'Enviado a revisión técnica',
  },
  get_bcv_rate: {
    running: 'Consultando tasa oficial BCV…',
    done: 'Tasa BCV consultada',
  },
  eve__skill: {
    running: 'Cargando guía técnica…',
    done: 'Guía técnica cargada',
  },
  've-rgi-classification': {
    running: 'Cargando guía RGI 1→6 Venezuela…',
    done: 'Guía RGI Venezuela cargada',
  },
  'cif-duty-liquidation': {
    running: 'Cargando guía de liquidación CIF…',
    done: 'Guía CIF cargada',
  },
  'chat-manifest-analysis': {
    running: 'Cargando guía de manifiestos…',
    done: 'Guía de manifiestos cargada',
  },
  'oga-compliance-review': {
    running: 'Cargando guía de compliance OGA…',
    done: 'Guía OGA cargada',
  },
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

/** Returns localized Spanish activity label + compact argument detail for an Eve tool or skill call. */
export function getEveToolActivity(
  toolName: string,
  completed: boolean,
  args?: unknown,
  preliminaryPhase?: string,
): { label: string; detail?: string } {
  const known = TOOL_LABELS[toolName];
  const label =
    !completed && preliminaryPhase?.trim()
      ? preliminaryPhase.trim()
      : known
        ? completed
          ? known.done
          : known.running
        : completed
          ? `Herramienta ${toolName} completada`
          : `Ejecutando ${toolName}…`;

  const rec = toRecord(args);
  const rawDetail =
    (typeof rec?.hsCode === 'string' && rec.hsCode) ||
    (typeof rec?.query === 'string' && rec.query) ||
    (typeof rec?.description === 'string' && rec.description) ||
    (typeof rec?.documentReference === 'string' && rec.documentReference) ||
    (typeof rec?.name === 'string' && rec.name) ||
    undefined;

  const detail = rawDetail && rawDetail.length > 42 ? `${rawDetail.slice(0, 41)}…` : rawDetail;
  return { label, detail };
}

/** Returns a concise Spanish progress or completion label for an Eve tool call. */
export function getEveToolLabel(toolName: string, completed: boolean): string {
  return getEveToolActivity(toolName, completed).label;
}
