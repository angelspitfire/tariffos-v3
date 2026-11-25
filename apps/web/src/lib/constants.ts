/**
 * TariffOS Thresholds and UI constants.
 * Single source of truth to avoid magic numbers across modules.
 */

export const CONFIDENCE_SAFE_THRESHOLD = 17 / 20;
export const CONFIDENCE_BORDERLINE_THRESHOLD = 13 / 20;

export const DEFAULT_CURRENCY = 'USD';

export const DENSITY_MODES = {
  COMPACT: 'compact',
  SPACIOUS: 'spacious',
} as const;

export type DensityMode = (typeof DENSITY_MODES)[keyof typeof DENSITY_MODES];

// ─── DataVisualizer chart defaults ───
export const DEFAULT_CHART_HEIGHT = 300;

export const BAR_RADIUS = 4;
export const LINE_STROKE_WIDTH = 2;
export const AREA_FILL_OPACITY = 0.1;

export const PIE_INNER_RADIUS = 60;
export const PIE_OUTER_RADIUS = 100;
export const PIE_PADDING_ANGLE = 2;

export const CHART_MARGIN = {
  top: 24,
  right: 24,
  bottom: 12,
  left: 0,
} as const;

export const AXIS_TICK_FONT_SIZE = 11;

export const SKY_500 = '#0ea5e9';

export const DEFAULT_SERIES_COLORS = [
  'var(--brand)',
  'var(--cleared)',
  'var(--review)',
  'var(--disputed)',
  'var(--brand-accent)',
  SKY_500,
] as const;

// ─── ProcessTimeline stepper ───
export const TIMELINE_STEP_SPACING = 32;
export const TIMELINE_CIRCLE_SIZE = 24;
export const TIMELINE_LINE_WIDTH = 2;
export const TIMELINE_HOVER_TRANSITION = 150;

// ─── DocumentPreviewer (PDF viewer) ───
export const DOC_PREVIEW_THUMB_WIDTH = 80;
export const DOC_PREVIEW_TOOLBAR_HEIGHT = 48;
export const DOC_PREVIEW_ZOOM_STEP = 0.2;
export const DOC_PREVIEW_MIN_ZOOM = 0.5;
export const DOC_PREVIEW_MAX_ZOOM = 3.0;
export const DOC_PREVIEW_DEFAULT_ZOOM = 1.0;
export const DOC_PREVIEW_CANVAS_SHADOW = '0 4px 24px rgba(0,0,0,0.3)';
export const PDFJS_WORKER_SRC =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
export const PDFJS_STANDARD_FONTS_URL =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/standard_fonts/';
export const DOC_PREVIEW_THUMB_ASPECT_RATIO = 1.414;
export const DOC_PREVIEW_ZOOM_PERCENT = 100;

// ─── Mock data constants (route.ts) ───
export const MOCK_TOTAL_CIF = 99850;
export const MOCK_TOTAL_DUTIES = 1455;
export const MOCK_DELTA_USD = 232.50;
export const MOCK_EXONERATION_SAVINGS = 1455.00;

// ─── Chat tool magic numbers ───
export const SINGLE_ITEM_CONFIDENCE_PERCENT = 92;
export const DISCREPANCY_COUNT = 2;
export const FAVORABLE_DUTY_RATE_PERCENT = 5;
export const GENERIC_DUTY_RATE_PERCENT = 10;
export const DUTY_RELIEF_PERCENT = 100;
export const BATCH_ITEM_COUNT = 3;
export const DELTA_USD_DECIMALS = 2;
export const FILING_ID = 'TR-2024-8849-VE';

// ─── Tariff reference rates (SENIAT Arancel Oficial) ───
export const IVA_RATE_PERCENT = 16;
export const FODINFA_RATE_PERCENT = 1 / 2;

// Duty rate color bands (ad-valorem %), used for status color coding
export const DUTY_RATE_LOW_BAND = 5;
export const DUTY_RATE_MEDIUM_BAND = 15;
export const ADVALOREM_LOW_BAND = 5;
export const ADVALOREM_MEDIUM_BAND = 15;

// UI timing
export const TOAST_DURATION_MS = 2500;
export const CHAT_MAX_DURATION_SECONDS = 60;

// ─── TariffToolRenderer constants ───
export const CONFIDENCE_PERCENT_MULTIPLIER = 100;
export const ICON_SIZE_SM = 12;
export const ICON_SIZE_MD = 16;
export const AUTO_APPROVED_COUNT = 2;
export const REQUIRES_REVIEW_COUNT = 1;

export const AI_GLOW = '#8b5cf6';
export const DISAMBIGUATION_DELTA_PERCENT = 11.7;
export const HS_CODE_ADAPTER = '8504.40';
export const AI_GLOW_RGBA_30 = 'rgba(139,92,246,0.3)';
export const AI_GLOW_RGBA_12 = 'rgba(139,92,246,0.12)';
export const AI_GLOW_RGBA_60 = 'rgba(139,92,246,0.6)';

// ─── Mock handler delays ───
export const MOCK_DELAY_SHORT_MS = 300;
export const MOCK_DELAY_MEDIUM_MS = 500;
export const MOCK_DELAY_LONG_MS = 1000;
export const MOCK_DELAY_EXTRA_LONG_MS = 1500;

// ─── Tariff search limits ───
export const MAX_TARIFF_SEARCH_RESULTS = 50;

// ─── Extract confidence constants ───
export const EXTRACT_CONFIDENCE_HIGH = 47 / 50;
export const EXTRACT_CONFIDENCE_MEDIUM = 22 / 25;
export const EXTRACT_CONFIDENCE_LOW = 31 / 50;

// ─── CanvasTabBar icon constants ───
import { FileSearch, Layers, Landmark, AlertTriangle, Scale, ShieldCheck, Coins, FileText } from 'lucide-react';

export const TAB_ICONS = {
  'single-item': FileSearch,
  'batch-manifest': Layers,
  'tax-breakdown': Landmark,
  'discrepancy-audit': AlertTriangle,
  'disambiguation': Scale,
  'permits-matrix': ShieldCheck,
  'exoneration-simulator': Coins,
  'customs-dossier': FileText,
} as const;

export const TAB_STATUS_COLORS = {
  'single-item': '#10b981',
  'batch-manifest': '#818cf8',
  'tax-breakdown': '#f59e0b',
  'discrepancy-audit': '#f43f5e',
  'disambiguation': '#a855f7',
  'permits-matrix': '#06b6d4',
  'exoneration-simulator': '#10b981',
  'customs-dossier': '#6366f1',
} as const;

export const ACTIVE_TAB_BORDER_COLOR = '#818cf8';

// ─── Tariff reference tabs ───
export const TARIFF_TABLE_MIN_HEIGHT = 528;

export type TariffRefTabId = 'buscar' | 'explorar' | 'favoritos' | 'historial';

export interface TariffRefTab {
  id: TariffRefTabId;
  label: string;
}

export const TARIFF_REF_TABS: readonly TariffRefTab[] = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'explorar', label: 'Explorar' },
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'historial', label: 'Historial' },
];
