# Plan de Evaluación Empírica: System 1 + System 2 — TariffOS v3

**Fecha:** 27 de noviembre de 2026  
**Estado:** Borrador para análisis y validación  
**Referencias:** [UNIT_ECONOMICS_AND_TOKEN_BUDGET.md](file:///Users/afernandez/projects/tariffos-v3/docs/UNIT_ECONOMICS_AND_TOKEN_BUDGET.md) · [LLM_MODELS_CATALOG.md](file:///Users/afernandez/projects/tariffos-v3/docs/LLM_MODELS_CATALOG.md) · [pre-gate.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/pipeline/pre-gate.ts) · [rgi-llm-adapter.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/adapters/rgi-llm-adapter.ts)

---

## 1. Objetivo

Medir con datos reales de TariffOS v3 la **precisión arancelaria (10 dígitos NCM / Decreto 4.944)**, **estabilidad de JSON**, **latencia** y **costo efectivo por clasificación** de nuestra arquitectura **System 1 + System 2**, antes de fijar el stack definitivo de producción.

Las preguntas clave que este eval debe responder:
1. **System 1 (`DecisionProvider`):** ¿Qué tan bien rinden `typesafe-jev` vs. `Google Decisions API` (`gemini-decision-1`) tanto en el pre-gate (`runCompliancePreGate`) como en un eventual routing `standard` vs. `deepMode`?
2. **System 2 (`createRgiLlmRunner`):** ¿El ahorro de 6×–8× de **Nemotron** (`3.5-super-vl` + `3-ultra-550b`) mantiene la precisión RGI 1→6 y el español jurídico al nivel de **Gemini 4 Hydrogen/Neon** o **Qwen 3 235B**, o genera más reintentos/escalados?
3. **Consumo real:** ¿Cuántos tokens reales (`inputTokens` / `outputTokens`) consumen nuestros casos típicos y pesados en promedio?

---

## 2. Dataset de Prueba ("Golden Set": 50 ítems)

Construir un archivo de referencia (ej. `packages/agent/evals/golden-set.json`) con casos reales validados junto a **Aduanera SP**:

| Bloque | Cantidad | Tipo de casos | Qué evalúa |
| :--- | :---: | :--- | :--- |
| **A. Estándar** | 20 | Electrónica, repuestos automotrices, textiles, alimentos con descripción clara | Precisión y costo de Tier 2 Estándar (`deepMode: false`) |
| **B. Complejos / Deep RGI** | 15 | Notas de Sección XVI, Capítulos químicos 28–38, unidades funcionales, partes vs. máquinas, RGI 3b | Razonamiento RGI 1→6, manejo de `legalNotes` (`deepMode: true`) |
| **C. Pre-Gate / Restringidos** | 10 | 5 permitidos comerciales + 3 restringidos/dual-use + 2 prohibidos | Falsos positivos y falsos negativos en System 1 |
| **D. Multimodal / Sucios** | 5 | Descripciones cortas de factura + hasta `2` imágenes (`imageDataUrls`) | Calidad de visión/extracción y costo extra de tokens visuales |

### Campos mínimos por ítem del Golden Set
- `id`, `block` (`A | B | C | D`)
- `input`: `InvoiceItemInput` (`description`, `originCountry`, `imageDataUrls?`)
- `expectedPreGate`: `'allowed' | 'prohibited_tariff' | 'restricted_dual_use'`
- `expectedMode`: `'standard' | 'deep'`
- `expectedHsCode`: código oficial a 10 dígitos (`xxxx.xx.xx.xx`) + `acceptableAlternatives[]`
- `notes`: criterio breve del especialista aduanero *(para completar)*

---

## 3. Contendientes a Evaluar

### System 1 (`DecisionProvider` en [provider.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/decision/provider.ts))
| Candidato | Integración | Costo estimado | Estado |
| :--- | :--- | :--- | :--- |
| **TypeSafe Jev** (`typesafe-jev`) | [typesafe-adapter.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/decision/typesafe-adapter.ts) (`@typesafe-ai/sdk`) | Según plan `TYPESAFE_API_KEY` | **Implementado** |
| **Google Decisions API** (`gemini-decision-1`) | Nuevo adaptador `decisions-api-adapter.ts` (~30 líneas) | \$0.10 / 1M input · \$0 output | **Por implementar** |

### System 2 (`createRgiLlmRunner` en [rgi-llm-adapter.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/adapters/rgi-llm-adapter.ts))
| Stack | Modelo Estándar (Bloque A/D) | Modelo Deep RGI (Bloque B) | Gateway / API |
| :--- | :--- | :--- | :--- |
| **Nemotron Recomendado** | `nvidia/nemotron-3.5-super-vl` | `nvidia/nemotron-3-ultra-550b-a55b` | OpenRouter / Vercel AI Gateway |
| **Nemotron Ultra-Eco** | `nvidia/nemotron-3.5-lightning` | `nvidia/nemotron-3-ultra-550b-a55b` | OpenRouter |
| **Control Español Open** | `qwen/qwen3-235b-a22b-2507` | `qwen/qwen3-235b-a22b-thinking-2507` | OpenRouter |
| **Google Gemini 4** | `gemini-4-hydrogen` *(thinking low/med)* | `gemini-4-hydrogen` *(high)* o `gemini-4-neon` | Google AI / Vertex |
| **Baseline Google 2.5** | `gemini-2.5-flash` | `gemini-2.5-pro` | Google AI / OpenRouter |

### Web Grounding ([parallel-web-search.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/adapters/parallel-web-search.ts) + [orchestrator.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/pipeline/orchestrator.ts))
| Candidato | Activación | Costo | Estado |
| :--- | :--- | :--- | :--- |
| **Vercel Parallel Search (`fast`)** | `needsGrounding` (~20–30% de Tier 2) | \$0 hasta 31 ene 2027 · luego \$5 / 1,000 búsquedas | **Implementado** |
| **Google Search Grounding (Gemini 4)** | Nativo en llamadas Gemini 4 | 5,000/mes gratis · luego \$14 / 1,000 búsquedas | **Por evaluar** |

---

## 4. Métricas y Criterios de Aceptación

### Métricas Automáticas (por corrida)
1. **Validez de Esquema (`RgiResponseSchema`):** `%` de respuestas que parsean al primer intento sin error (Meta: **≥ 98%**).
2. **Auditoría Oficial (`auditTariffAgainstOfficialSchedule`):** `%` de códigos devueltos que existen y son válidos en el Arancel Decreto 4.944 (Meta: **≥ 95%**).
3. **Exactitud a 10 dígitos (y a 6 dígitos SA):** `%` de coincidencia con `expectedHsCode` (Meta: **≥ 85%** en Bloque A; **≥ 70%** en Bloque B).
4. **Precisión de Pre-Gate (Bloque C):** `0` falsos negativos en mercancía prohibida y `< 5%` falsos positivos en mercancía comercial normal.
5. **Consumo Real y Latencia:** `inputTokens` promedio/P95, `outputTokens` promedio/P95, latencia P50/P95 y **costo real en USD por 1,000 clasificaciones** (incluyendo reintentos).

### Métrica Cualitativa (Revisión Humana — escala 1 a 5)
- **Calidad del español jurídico y `rgiSteps`:** ¿Cita correctamente las Reglas 1→6 y las notas de sección/capítulo sin alucinar fundamentos?

---

## 5. Fases de Ejecución

1. **Fase 1 — Armar el Golden Set (Día 1–2):**
   - [ ] Seleccionar los 50 ítems reales (Bloques A, B, C, D) y validar sus códigos a 10 dígitos con Aduanera SP.
2. **Fase 2 — Adaptador Decisions API + Script Runner (Día 2–3):**
   - [ ] Implementar `decisions-api-adapter.ts` detrás de `DecisionProvider` (sin alterar `typesafe-jev`).
   - [ ] Crear script `pnpm eval:pipeline` que ejecute el Golden Set contra cada stack y exporte resultados a JSON/Markdown.
3. **Fase 3 — Corrida de Benchmarks (Día 3–4):**
   - [ ] Correr System 1 (`typesafe-jev` vs `gemini-decision-1`) sobre Bloque C + routing A/B.
   - [ ] Correr System 2 sobre los 50 ítems con los 4–5 stacks candidatos y registrar tokens reales.
4. **Fase 4 — Análisis y Decisión (Día 5):**
   - [ ] Completar la tabla de resultados abajo y definir el stack de producción + umbral de cascada (`confidencePct`).

---

## 6. Plantilla de Resultados (Para completar tras correr el eval)

| Stack | JSON válido (%) | Pasa Auditoría (%) | Exactitud 10d Bloque A | Exactitud 10d Bloque B | Tokens prom. (In / Out) | Costo real / 1,000 | Latencia P50 | Nota español (1–5) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `Nemotron (super-vl + ultra)` | _% | _% | _% | _% | _ / _ | \$_ | _s | _/5 |
| `Nemotron (lightning + ultra)` | _% | _% | _% | _% | _ / _ | \$_ | _s | _/5 |
| `Qwen 3 235B` | _% | _% | _% | _% | _ / _ | \$_ | _s | _/5 |
| `Gemini 4 Hydrogen` | _% | _% | _% | _% | _ / _ | \$_ | _s | _/5 |
| `Gemini 4 Hydrogen + Neon` | _% | _% | _% | _% | _ / _ | \$_ | _s | _/5 |
| `Gemini 2.5 (flash + pro)` | _% | _% | _% | _% | _ / _ | \$_ | _s | _/5 |

### Notas / Decisiones finales *(completar)*
- **Proveedor System 1 elegido:** `[ ] TypeSafe Jev` · `[ ] Google Decisions API` · `[ ] Híbrido`
- **Proveedor System 2 Estándar:** `____________________`
- **Proveedor System 2 Deep / Fallback:** `____________________`
- **Umbral de escalado por confianza:** `confidencePct < ____`
