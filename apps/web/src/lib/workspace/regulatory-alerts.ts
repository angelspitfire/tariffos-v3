export interface RegulatoryAlertItem {
  id: string;
  jurisdictionId: string;
  title: string;
  summary: string;
  gazetteRef: string;
  effectiveDate: string;
  severity: 'high' | 'medium' | 'info';
  read: boolean;
}

export interface NotificationChannelPrefs {
  pushEnabled: boolean;
  emailEnabled: boolean;
  notificationEmail: string;
  frequency: 'immediate' | 'daily_digest';
}

export interface RegulatoryPrefsState {
  subscribedJurisdictions: Record<string, boolean>;
  readAlertIds: string[];
  notifications: NotificationChannelPrefs;
}

const STORAGE_KEY = 'tariffos_regulatory_prefs_v1';

export const SEED_REGULATORY_ALERTS: readonly RegulatoryAlertItem[] = [
  {
    id: 'alert-ve-4944-ex',
    jurisdictionId: 've-seniat',
    title: 'Reforma parcial de exoneraciones Decreto 4.944 (Cap. 84 y 85)',
    summary: 'Actualización de códigos elegibles para exoneración parcial de bienes de capital e inversores solares.',
    gazetteRef: 'Gaceta Oficial 6.812 Ext.',
    effectiveDate: '2026-09-01',
    severity: 'high',
    read: false,
  },
  {
    id: 'alert-ve-iva-90',
    jurisdictionId: 've-seniat',
    title: 'Control OGA sanitario MPPS para equipos médicos Cap. 90',
    summary: 'Validación previa de registro sanitario para equipos de diagnóstico por ultrasonido (9018.12).',
    gazetteRef: 'Providencia SENIAT/2026-14',
    effectiveDate: '2026-10-15',
    severity: 'medium',
    read: false,
  },
  {
    id: 'alert-co-dian-nandina',
    jurisdictionId: 'co-dian',
    title: 'Ajuste de desdoblamiento NANDINA para baterías de litio',
    summary: 'Nueva apertura nacional en 8507.60.00.10 para módulos de almacenamiento estacionario.',
    gazetteRef: 'Decreto DIAN 1420',
    effectiveDate: '2026-08-20',
    severity: 'info',
    read: false,
  },
  {
    id: 'alert-pa-ana-zlc',
    jurisdictionId: 'pa-ana',
    title: 'Declaración anticipada obligatoria en Zona Libre de Colón',
    summary: 'Exigencia de código SA de 12 dígitos en manifiestos marítimos consolidados.',
    gazetteRef: 'Resolución ANA-098',
    effectiveDate: '2026-10-01',
    severity: 'medium',
    read: true,
  },
];

export function createDefaultRegulatoryPrefs(email: string, activeJurisdictionId: string): RegulatoryPrefsState {
  return {
    subscribedJurisdictions: { [activeJurisdictionId]: true },
    readAlertIds: ['alert-pa-ana-zlc'],
    notifications: {
      pushEnabled: true,
      emailEnabled: true,
      notificationEmail: email,
      frequency: 'immediate',
    },
  };
}

export function readRegulatoryPrefs(email: string, activeJurisdictionId: string): RegulatoryPrefsState {
  if (typeof window === 'undefined') {
    return createDefaultRegulatoryPrefs(email, activeJurisdictionId);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultRegulatoryPrefs(email, activeJurisdictionId);
    const parsed = JSON.parse(raw) as Partial<RegulatoryPrefsState>;
    const defaults = createDefaultRegulatoryPrefs(email, activeJurisdictionId);
    return {
      subscribedJurisdictions: parsed.subscribedJurisdictions ?? defaults.subscribedJurisdictions,
      readAlertIds: Array.isArray(parsed.readAlertIds) ? parsed.readAlertIds : defaults.readAlertIds,
      notifications: { ...defaults.notifications, ...parsed.notifications },
    };
  } catch {
    return createDefaultRegulatoryPrefs(email, activeJurisdictionId);
  }
}

export function saveRegulatoryPrefs(state: RegulatoryPrefsState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in private browsing.
  }
}
