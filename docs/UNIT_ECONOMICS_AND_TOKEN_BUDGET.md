# Economía Unitaria, Presupuesto de Tokens y Comparativa de Costos vs. Wrapper Chat/RAG

**Fecha:** 26 de noviembre de 2026  
**Referencias:** [LLM_MODELS_CATALOG.md](file:///Users/afernandez/projects/tariffos-v3/docs/LLM_MODELS_CATALOG.md) · [COMPETITIVE_ANALYSIS_TARS.md](file:///Users/afernandez/projects/tariffos-v3/docs/COMPETITIVE_ANALYSIS_TARS.md)

---

## 1. Presupuesto de Tokens por Clasificación en TariffOS v3

### 1.1 Desglose real del pipeline actual (`packages/agent`)
En [orchestrator.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/pipeline/orchestrator.ts) y [rgi-llm-adapter.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/adapters/rgi-llm-adapter.ts):

| Etapa | Input tokens | Output tokens | Total | Notas |
| :--- | :---: | :---: | :---: | :--- |
| **Tier 0 (`ProductMaster` / SKU aprobado)** | 0 | 0 | **0** | Hit directo en precedentes de la agencia |
| **Tier 1 (`canUseTier1FastPath` + DB)** | ~150 *(embedding)* | 0 | **~150** | Validación directa contra `NationalTariff` |
| **Tier 2 Estándar (`rgi-llm-adapter.ts`)** | **2,500 – 5,500** *(prom. ~4,000)* | **600 – 1,400** *(prom. ~1,000)* | **~5,000** | 1 sola llamada JSON estructurada |
| **Tier 2 Deep RGI (`deepMode: true`)** | **3,500 – 7,000** *(prom. ~5,000)* | **1,500 – 3,500** *(prom. ~2,500)* | **~7,500** | Casos ambiguos / notas de sección complejas |

**Composición aproximada del Input en Tier 2:**
- `RGI_SYSTEM_PROMPT`: ~280 tokens fijos.
- `item` + `webContext` (opcional): ~150 – 600 tokens.
- `candidates` (candidatas NCM en JSON): ~800 – 1,500 tokens.
- `legalNotes` (top 3 capítulos): ~1,200 – 3,500 tokens *(principal palanca de recorte futuro)*.

### 1.2 Topes objetivo recomendados (Target Budget)
- **Estándar (75–80% del tráfico LLM):** `≤ 5,000 input` / `≤ 1,200 output` (`maxOutputTokens = 1,500`).
- **Deep RGI (20–25% del tráfico LLM):** `≤ 7,000 input` / `≤ 3,000 output` (`maxOutputTokens = 3,500`).
- **Meta de desvío a costo \$0 (Tier 0 SKU + Tier 1 Fast-Path + `dedup.ts`):**
  - Mes 1: **15–20%** → Mes 6 (con historial SKU + reglas globales de Aduanera SP): **40–50%**.

---

## 2. Costo Estimado por Clasificación y por Plan

Fórmula base por cada 1,000 clasificaciones:

$$\text{Costo}_{1000} = (1 - \text{HitRate}_{T0/T1}) \times 1000 \times \left(\frac{\text{In}}{10^6} \cdot P_{\text{in}} + \frac{\text{Out}}{10^6} \cdot P_{\text{out}}\right)$$

### Escenarios sin contar aún el ahorro de caché SKU (escenario conservador)

| Configuración de modelos (OpenRouter) | Costo / **1 clasificación** | Costo **1 Piloto** *(250 clasif. · \$150)* | Costo **1 Agencia** *(1,000 clasif. · \$300/mes)* | Margen bruto IA (Agencia \$300) |
| :--- | :---: | :---: | :---: | :---: |
| **Ultra-económica** *(80% `nemotron-3.5-lightning` + 20% `nemotron-3-ultra`)* | **~\$0.0020** | **~\$0.50** | **~\$2.00** | **99.3%** |
| **Recomendada** *(80% `nemotron-3.5-super-vl` o `qwen3-235b` + 20% `nemotron-3-ultra`)* | **~\$0.0025** | **~\$0.63** | **~\$2.50** | **99.2%** |
| **Google Gemini** *(80% `gemini-2.5-flash` + 20% `gemini-2.5-pro`)* | **~\$0.0092** | **~\$2.30** | **~\$9.20** | **96.9%** |
| **Peor caso / Frontera puro** *(100% `claude-sonnet-4.6`)* | **~\$0.0270** | **~\$6.75** | **~\$27.00** | **91.0%** |

- **Componentes a costo \$0.00:** validación dígito a dígito del Decreto 4.944 ([tariff-validator.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/pipeline/tariff-validator.ts)), cálculo tributario CIF/IVA/exoneraciones ([duties.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/pipeline/duties.ts)), detección de ambigüedad HITL ([merceological-hitl.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/pipeline/merceological-hitl.ts)) y generación del dictamen PDF.
- **Embeddings (`nemotron-3.5-embed-1b`):** ~\$0.00001 por consulta (despreciable).
- **Web Grounding (opcional en descripciones muy cortas):** ~\$0.001–\$0.005 solo en el subconjunto acotado de ítems que lo disparen.
- **Con caché SKU madura (40% hit rate al Mes 6):** el costo del stack recomendado cae a **~\$0.0015 / clasificación** (**\$1.50 por cada 1,000**).

---

## 3. Comparativa de Costos: TariffOS v3 vs. Wrapper Chat + RAG Básico (ej. TARS)

Un competidor construido como **chat conversacional con RAG básico** (como suele operar un producto tipo *TARS Chat* cubriendo 13 países) sufre 5 penalizaciones estructurales de costo que TariffOS evita por arquitectura:

| Factor de costo | Wrapper Chat + RAG Básico (estimado TARS) | TariffOS v3 (Pipeline Multi-Tier) | Diferencia |
| :--- | :--- | :--- | :---: |
| **Impuesto conversacional (multi-turno)** | Aclarar atributos requiere 2–4 turnos de chat; cada turno re-envía todo el historial + chunks RAG (**12k–30k tokens in** por caso) | HITL merceológico en código puro (**0 tokens**); **1 sola llamada** estructurada (~4k tokens in) | **3× a 7× menos input** |
| **Redacción de informe / cálculos** | El LLM escribe prosa larga e informes técnico-legales + cálculos de impuestos (**2,000–4,000 tokens out**) | El LLM solo devuelve JSON compacto (~1,000 out); cálculos CIF y PDF se generan en TypeScript (**0 tokens**) | **2× a 4× menos output** |
| **Dependencia de modelo caro** | Sin validador determinista ni RAG quirúrgico, un wrapper suele depender de modelos tipo GPT-4o/4.1 o Claude Sonnet (\$2–\$15/1M) para no alucinar códigos | Validador oficial + cascada Tier 1 económico (`nemotron`/`qwen`) + Tier 2 solo en casos ambiguos | **5× a 15× menor tarifa/token** |
| **Reutilización y lotes** | Cada consulta repetida o línea de factura paga 100% del LLM otra vez | `dedup.ts` + `ProductMaster` (Tier 0) + `canUseTier1FastPath` (Tier 1) resuelven repetitivos a **\$0.00** | **30–50% tráfico a \$0** |
| **Costo real estimado por clasificación** | **~\$0.03 – \$0.12 USD** *(en casos con informe legal y 2–3 turnos)* | **~\$0.0015 – \$0.0025 USD** *(stack recomendado)* | **12× a 50× más barato** |

### Impacto directo en una eventual guerra de precios
- **Costo estimado de TARS para atender su plan Enterprise (1,500 consultas/mes por \$350):** entre **\$45 y \$150 USD/mes por cliente** si usan modelos comerciales con chat multi-turno e informe largo (sin contar el desgaste de trials de 3 requests y planes de \$30).
- **Costo de TariffOS para atender 1,500 clasificaciones/mes:** **~\$2.50 – \$4.00 USD/mes** en stack recomendado (o ~\$14 con Gemini Flash/Pro).
- **Ventaja estratégica resultante:**
  1. **No necesitas regalar el precio:** mantienes tu piso en **\$300/mes** por ofrecer mucho más valor operativo (lotes, CIF, SKU, PDF firmable).
  2. **Capacidad de aplastamiento táctico:** si un competidor intenta bajar precios, TariffOS puede **duplicar la cuota incluida** (ej. 2,000–3,000 clasificaciones por \$299/mes a un costo marginal de \$2–\$4) o igualar puntualmente \$250/mes en contratos anuales manteniendo **>97% de margen bruto**, algo financieramente muy doloroso para un wrapper sin optimización.

---

## 4. Hoja de Ruta de Optimización Continua (Meses 1 a 6)

1. **Mes 1 (Telemetría real — Fase 5 de [paid_pilot_plan.md](file:///Users/afernandez/.gemini/antigravity/brain/9315a09b-e5b3-48d1-baee-b69515fb1a8c/paid_pilot_plan.md)):** conectar `inputTokens`, `outputTokens` y `estimatedCostUsd` desde `rgi-llm-adapter.ts` → `UsageRecord` y `/admin/usage` + fijar `maxOutputTokens` y tope de `legalNotes`.
2. **Mes 2 (Cascada automática por confianza):** enrutar lotes y casos estándar a `nemotron-3.5-lightning` / `nemotron-3.5-super-vl` y escalar a `nemotron-3-ultra` solo cuando `confidencePct < 80` o falle `auditTariffAgainstOfficialSchedule`.
3. **Mes 3–6 (Efecto compuesto de caché):** alimentar `CustomClassificationRule` (`GLOBAL`) con los productos recurrentes validados junto a **Aduanera SP** y activar reutilización automática de `ProductMaster` por agencia para llevar el costo efectivo por debajo de **\$0.0015 / clasificación**.
