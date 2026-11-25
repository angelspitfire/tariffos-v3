'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'es' | 'en';

export const DEFAULT_LANGUAGE: Language = 'es';

export const LANGUAGES: Record<Language, { code: Language; label: string; native: string }> = {
  es: { code: 'es', label: 'Español', native: 'Español' },
  en: { code: 'en', label: 'English', native: 'Inglés' },
} as const;

export type TranslationKey = keyof typeof translations.es;

export const translations = {
  es: {
    'TariffOS': 'TariffOS',
    'Clasificación arancelaria aduanal': 'Clasificación arancelaria aduanal',
    'Despacho': 'Despacho',
    'Nuevo despacho aduanero': 'Nuevo despacho aduanero',
    'Arancel Oficial SENIAT': 'Arancel Oficial SENIAT',
    'Buscar por codigo o descripcion...': 'Buscar por codigo o descripcion...',
    'Ver manifiesto de carga': 'Ver manifiesto de carga',
    'Clasificar fuente conmutada 220V': 'Clasificar fuente conmutada 220V',
    'Ingesta de Documentos de Despacho': 'Ingesta de Documentos de Despacho',
    'Factura comercial, lista de empaque o conocimiento BoL': 'Factura comercial, lista de empaque o conocimiento BoL',
    'Archivos de Demostración del Embarque': 'Archivos de Demostración del Embarque',
    'Analizar y Subir': 'Analizar y Subir',
    'Cancelar': 'Cancelar',
    'Procesando...': 'Procesando...',
    'Capítulos': 'Capítulos',
    'Buscar capítulo...': 'Buscar capítulo...',
    'No se encontraron capítulos': 'No se encontraron capítulos',
    'Venezuela • Vigente 2024': 'Venezuela • Vigente 2024',
    'Capítulos:': 'Capítulos:',
    'Seleccione una partida arancelaria': 'Seleccione una partida arancelaria',
    'Navegue el árbol o use la búsqueda': 'Navegue el árbol o use la búsqueda',
    'Cargando...': 'Cargando...',
    'Procesando reglas arancelarias...': 'Procesando reglas arancelarias...',
    'Escribe tu consulta aduanera': 'Escribe tu consulta aduanera',
    'Escribe tu consulta o adjunta un documento de despacho...': 'Escribe tu consulta o adjunta un documento de despacho...',
    'Adjuntar documento': 'Adjuntar documento',
    'Enviar consulta': 'Enviar consulta',
    'Sugerencias rápidas': 'Sugerencias rápidas',
    'Generar expediente oficial': 'Generar expediente oficial',
    'Simulador de acuerdos TLC': 'Simulador de acuerdos TLC',
    'Ver matriz de vistos buenos': 'Ver matriz de vistos buenos',
    'Arbitraje de subpartida (Línea 3)': 'Arbitraje de subpartida (Línea 3)',
    'Liquidación de tributos': 'Liquidación de tributos',
    'Adjuntar factura comercial o packing list': 'Adjuntar factura comercial o packing list',
    'Analizar factura comercial cargada': 'Analizar factura comercial cargada',
    'Cerrar arancel': 'Cerrar arancel',
    // ARIA / accessibility
    'Navegación principal': 'Navegación principal',
    'Colapsar barra lateral': 'Colapsar barra lateral',
    'Desplegar barra lateral': 'Desplegar barra lateral',
    'Nueva Consulta': 'Nueva Consulta',
    'Asistente Aduanero': 'Asistente Aduanero',
    'Trámites Recientes': 'Trámites Recientes',
    'Agente Aduanero': 'Agente Aduanero',
    'Gaveta de Documentos Aduaneros': 'Gaveta de Documentos Aduaneros',
    'Cerrar gaveta': 'Cerrar gaveta',
    'Cerrar arancel (ESC)': 'Cerrar arancel (ESC)',
    'Ver Mesa de Aforo': 'Ver Mesa de Aforo',
    'Ocultar Mesa de Aforo': 'Ocultar Mesa de Aforo',
    'Mesa de Aforo Aduanero': 'Mesa de Aforo Aduanero',
    'Expediente': 'Expediente',
    'Ver Expediente': 'Ver Expediente',
    'Ocultar Expediente': 'Ocultar Expediente',
    'Alternar idioma': 'Alternar idioma',
    'Buscar': 'Buscar',
    'Cerrar': 'Cerrar',
    'Ajustes': 'Ajustes',
    'Conversación activa': 'Conversación activa',
    'Nuevo Trámite': 'Nuevo Trámite',
    'Asistente Arancelario': 'Asistente Arancelario',
    'Arancel Nacional SENIAT': 'Arancel Nacional SENIAT',
    // ExonerationSimulator
    'Simulador de Acuerdos Comerciales y Exoneraciones': 'Simulador de Acuerdos Comerciales y Exoneraciones',
    'Proyección fiscal bajo tratados': 'Proyección fiscal bajo tratados',
    'Base Imponible': 'Base Imponible',
    'Régimen / Acuerdo Comercial': 'Régimen / Acuerdo Comercial',
    'Desgravamen Ad-Valorem': 'Desgravamen Ad-Valorem',
    'Moneda de Liquidación': 'Moneda de Liquidación',
    'Proyección de Ahorro': 'Proyección de Ahorro',
  },
  en: {
    'TariffOS': 'TariffOS',
    'Clasificación arancelaria aduanal': 'Customs tariff classification',
    'Despacho': 'Filing',
    'Nuevo despacho aduanero': 'New customs filing',
    'Arancel Oficial SENIAT': 'Official SENIAT Tariff',
    'Buscar por codigo o descripcion...': 'Search by code or description...',
    'Ver manifiesto de carga': 'View cargo manifest',
    'Clasificar fuente conmutada 220V': 'Classify 220V switched power supply',
    'Ingesta de Documentos de Despacho': 'Filing Document Ingestion',
    'Factura comercial, lista de empaque o conocimiento BoL': 'Commercial invoice, packing list or BoL',
    'Archivos de Demostración del Embarque': 'Shipment Demo Files',
    'Analizar y Subir': 'Analyze and Upload',
    'Cancelar': 'Cancel',
    'Procesando...': 'Processing...',
    'Capítulos': 'Chapters',
    'Buscar capítulo...': 'Search chapter...',
    'No se encontraron capítulos': 'No chapters found',
    'Venezuela • Vigente 2024': 'Venezuela • Valid 2024',
    'Capítulos:': 'Chapters:',
    'Seleccione una partida arancelaria': 'Select a tariff item',
    'Navegue el árbol o use la búsqueda': 'Navigate the tree or use search',
    'Cargando...': 'Loading...',
    'Procesando reglas arancelarias...': 'Processing tariff rules...',
    'Escribe tu consulta aduanera': 'Write your customs query',
    'Escribe tu consulta o adjunta un documento de despacho...': 'Write your query or attach a filing document...',
    'Adjuntar documento': 'Attach document',
    'Enviar consulta': 'Send query',
    'Sugerencias rápidas': 'Quick suggestions',
    'Generar expediente oficial': 'Generate official record',
    'Simulador de acuerdos TLC': 'FTA simulator',
    'Ver matriz de vistos buenos': 'View approval matrix',
    'Arbitraje de subpartida (Línea 3)': 'Subheading arbitration (Line 3)',
    'Liquidación de tributos': 'Tax settlement',
    'Adjuntar factura comercial o packing list': 'Attach commercial invoice or packing list',
    'Analizar factura comercial cargada': 'Analyze loaded commercial invoice',
    'Cerrar arancel': 'Close tariff',
    'Expediente': 'Dossier',
    'Ver Expediente': 'View Dossier',
    'Ocultar Expediente': 'Hide Dossier',
    // ARIA / accessibility
    'Navegación principal': 'Main navigation',
    'Colapsar barra lateral': 'Collapse sidebar',
    'Desplegar barra lateral': 'Expand sidebar',
    'Nueva Consulta': 'New Query',
    'Asistente Aduanero': 'Customs Assistant',
    'Trámites Recientes': 'Recent Filings',
    'Agente Aduanero': 'Customs Agent',
    'Gaveta de Documentos Aduaneros': 'Customs Documents Drawer',
    'Cerrar gaveta': 'Close drawer',
    'Cerrar arancel (ESC)': 'Close tariff (ESC)',
    'Ver Mesa de Aforo': 'View Tariff Desk',
    'Ocultar Mesa de Aforo': 'Hide Tariff Desk',
    'Mesa de Aforo Aduanero': 'Customs Tariff Desk',
    'Alternar idioma': 'Toggle language',
    'Buscar': 'Search',
    'Cerrar': 'Close',
    'Ajustes': 'Settings',
    'Conversación activa': 'Active conversation',
    'Nuevo Trámite': 'New Filing',
    'Asistente Arancelario': 'Tariff Assistant',
    'Arancel Nacional SENIAT': 'National SENIAT Tariff',
    // ExonerationSimulator
    'Simulador de Acuerdos Comerciales y Exoneraciones': 'Trade Agreement & Exoneration Simulator',
    'Proyección fiscal bajo tratados': 'Tax projection under trade agreements',
    'Base Imponible': 'Tax Base',
    'Régimen / Acuerdo Comercial': 'Regime / Trade Agreement',
    'Desgravamen Ad-Valorem': 'Ad-Valorem Relief',
    'Moneda de Liquidación': 'Settlement Currency',
    'Proyección de Ahorro': 'Savings Projection',
  },
} as const;

function translate(language: Language, key: TranslationKey): string {
  return translations[language][key] ?? key;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  isEs: boolean;
  isEn: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  children,
  defaultLanguage = DEFAULT_LANGUAGE,
}: {
  children: ReactNode;
  defaultLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const setLang = useCallback((next: Language) => {
    setLanguage(next);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translate(language, key),
    [language],
  );

  const value: I18nContextValue = {
    language,
    setLanguage: setLang,
    t,
    isEs: language === 'es',
    isEn: language === 'en',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

export default I18nProvider;
