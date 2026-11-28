import { getDefaultLandingCountry } from '@/lib/runtime-config';

export interface LandingFaqItem {
  readonly q: string;
  readonly a: string;
}

export interface LandingEditionConfig {
  readonly slug: 'global' | 've';
  readonly countryCode?: string;
  readonly hreflang: string;
  readonly canonicalPath: string;
  readonly editionLabel: string;
  readonly normativeBadge?: string;
  readonly heroHeading: string;
  readonly heroSubtitle: string;
  readonly demoHeading: string;
  readonly demoSubheading: string;
  readonly onboardingHref: string;
  readonly footerTag: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly faqItems: readonly LandingFaqItem[];
}

export const GLOBAL_LANDING_CONFIG: LandingEditionConfig = {
  slug: 'global',
  hreflang: 'x-default',
  canonicalPath: '/',
  editionLabel: 'Global',
  normativeBadge: 'Sistema Armonizado OMA · RGI 1 a 6 · Arquitectura Multi-Jurisdicción',
  heroHeading: 'Clasificación arancelaria auditable con respaldo RGI',
  heroSubtitle:
    'Valida fichas merceológicas con detección de vacíos técnicos, clasifica lotes Excel y emite dictámenes PDF firmables.',
  demoHeading: 'Validación normativa en minutos, paso a paso',
  demoSubheading: 'Diseñado para agentes de aduanas e importadores que exigen sustento técnico verificable',
  onboardingHref: '/onboarding?plan=pilot&cycle=monthly',
  footerTag: 'OMA · RGI 1 a 6',
  seoTitle: 'TariffOS — Clasificación Arancelaria Auditable con IA y Respaldo RGI 1–6',
  seoDescription:
    'Automatiza la clasificación merceológica bajo reglas OMA RGI 1 a 6, valida controles OGA/PGA, liquida tributos CIF y emite dictámenes PDF con Trazabilidad Documental Versionada.',
  faqItems: [
    {
      q: '¿Quién asume la responsabilidad legal de la clasificación sugerida?',
      a: 'TariffOS es una plataforma de soporte pericial y Trazabilidad Documental Versionada. Fundamenta cada dictamen con RGI 1 a 6 y Notas Legales oficiales, mientras el Agente de Aduanas revisa, valida y suscribe el dictamen final con su credencial.',
    },
    {
      q: '¿Cómo funciona la arquitectura multi-jurisdicción de TariffOS?',
      a: 'El motor razona sobre el Sistema Armonizado (OMA) y cruza cada código contra el arancel nacional vigente del país configurado en tu espacio de trabajo (hoy operativo en vivo para Venezuela NCM 10 dígitos, con despliegue corporativo asistido para nuevas jurisdicciones).',
    },
    {
      q: '¿Qué pasa si una factura comercial o PDF escaneado no trae datos suficientes?',
      a: 'TariffOS realiza extracción automática de PDFs con detección de vacíos técnicos: cuando faltan atributos críticos que dividen subpartidas, no inventa códigos; acota la partida y lista las preguntas exactas para el proveedor.',
    },
    {
      q: '¿Qué pasa con la confidencialidad de las facturas y clientes de mi agencia?',
      a: 'Tus facturas, valores CIF y catálogos SKU están aislados por organización mediante PostgreSQL Row-Level Security (RLS) y almacenamiento privado firmado. Nunca usamos documentos de clientes para entrenar modelos públicos.',
    },
    {
      q: '¿En qué se diferencia TariffOS de un chat genérico con IA?',
      a: 'Un chat genérico improvisa códigos sin verificar. TariffOS valida atributos merceológicos (HITL), verifica cada código dígito a dígito contra la base arancelaria oficial, calcula tributos de forma determinista y sella el dictamen con hash SHA-256.',
    },
    {
      q: '¿Cómo funciona el Piloto Operativo de $150 y la activación de planes?',
      a: 'El Piloto Operativo ($150 pago único) incluye 250 clasificaciones con lotes Excel y dictámenes PDF por 30 días, 100% acreditables a tu primer mes del Plan Agencia ($300/mes), con facturación asistida en menos de 24 horas hábiles.',
    },
  ],
};

export const VE_LANDING_CONFIG: LandingEditionConfig = {
  slug: 've',
  countryCode: 'VE',
  hreflang: 'es-VE',
  canonicalPath: '/ve',
  editionLabel: 'Venezuela',
  normativeBadge:
    'Arancel NCM 10 Dígitos · Decreto 4.944 y Reformas Vigentes · VE-SENIAT',
  heroHeading: 'Clasificación arancelaria auditable con respaldo RGI para Venezuela',
  heroSubtitle:
    'Automatiza la clasificación merceológica NCM, la validación de Regímenes Legales (RL 1–21 y COMEX) y la Trazabilidad Documental Versionada previa a SIDUNEA.',
  demoHeading: 'Validación normativa en minutos, antes de declarar en SIDUNEA',
  demoSubheading:
    'Evita retenciones en reconocimiento y discrepancias de Unidad Física, Ex.AEC o Regímenes Legales',
  onboardingHref: '/onboarding?plan=pilot&cycle=monthly&country=VE',
  footerTag: 'RGI 1 a 6 · VE-SENIAT',
  seoTitle: 'TariffOS Venezuela — Clasificación Arancelaria Decreto 4.944, RL 1–21 y RGI',
  seoDescription:
    'Clasificación merceológica NCM a 10 dígitos verificada contra el Decreto 4.944 y sus reformas vigentes, Ex.AEC, Unidad Física Art. 37, Decreto 5.197 (COMEX RL 9) y dictámenes PDF firmables.',
  faqItems: [
    {
      q: '¿Con qué versión del Arancel de Aduanas de Venezuela opera TariffOS?',
      a: 'Operamos sobre los más de 12.000 códigos NCM nacionales de 10 dígitos del Decreto N° 4.944 y sus reformas consolidadas vigentes, incluyendo alícuotas efectivas Ex.AEC, condición BK/BIT, Unidad Física oficial (Columna 7 Art. 37) y Regímenes Legales 1 al 21.',
    },
    {
      q: '¿Valida exoneraciones vigentes (Decreto N° 5.197) y requisito de Permiso COMEX?',
      a: 'Sí. Al detectar códigos incluidos en regímenes de exoneración sujetos a Certificado COMEX (Régimen Legal 9), TariffOS muestra la alícuota ordinaria, advierte el requisito obligatorio de RL 9 y alerta preventivamente sobre la fecha de vencimiento según registro de la DUA.',
    },
    {
      q: '¿Quién asume la responsabilidad legal del dictamen previo a SIDUNEA?',
      a: 'TariffOS genera Trazabilidad Documental Versionada con cita expresa de RGI 1 a 6, Notas de Sección/Capítulo y hash SHA-256 del documento fuente. El Agente de Aduanas revisa, aprueba y suscribe el dictamen final con su patente SENIAT.',
    },
    {
      q: '¿Qué pasa si la factura comercial viene escaneada o incompleta?',
      a: 'Ejecutamos extracción automática de PDFs escaneados con detección de vacíos técnicos: si el documento no especifica material, composición o principio de funcionamiento, el sistema no adivina el código; estrecha la partida y detalla qué consultar al proveedor.',
    },
    {
      q: '¿Cómo protegen la confidencialidad de nuestras facturas CIF y proveedores?',
      a: 'Cada agencia e importador opera en un espacio aislado con Row-Level Security (RLS), buckets privados con URLs firmadas temporales y política estricta de no entrenamiento de modelos públicos con tus documentos.',
    },
    {
      q: '¿Qué métodos de pago aceptan en Venezuela para el Piloto Operativo ($150)?',
      a: 'El Piloto Operativo ($150 pago único, 250 clasificaciones 100% acreditables al Plan Agencia de $300/mes) puede pagarse vía Zelle, Transferencia USD/EUR, Binance Pay o Pago Móvil a tasa BCV, con activación en menos de 24 horas hábiles.',
    },
  ],
};

export const COUNTRY_LANDINGS_BY_SLUG: Readonly<Record<string, LandingEditionConfig>> = {
  ve: VE_LANDING_CONFIG,
};

export function getCountryLandingBySlug(slug: string): LandingEditionConfig | null {
  return COUNTRY_LANDINGS_BY_SLUG[slug.trim().toLowerCase()] ?? null;
}

export function resolveRootLandingConfig(pinnedSlugOverride?: string): LandingEditionConfig {
  const pinnedSlug = (pinnedSlugOverride ?? getDefaultLandingCountry()).trim().toLowerCase();
  if (pinnedSlug && pinnedSlug !== 'global') {
    return getCountryLandingBySlug(pinnedSlug) ?? GLOBAL_LANDING_CONFIG;
  }
  return GLOBAL_LANDING_CONFIG;
}

export function buildLandingAlternates(canonicalPath: string) {
  return {
    canonical: canonicalPath,
    languages: {
      'es-VE': '/ve',
      'x-default': '/',
    },
  };
}
