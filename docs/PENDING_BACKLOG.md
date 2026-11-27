# TariffOS v3 — Backlog Vivo de Pendientes

- **Última actualización:** 2026-11-27
- **Commit base verificado:** `P0-1 + P1-1/2/3 + P3-2 + P2-3` (rama `main` al 2026-11-27; `pnpm check` y `pnpm check:deploy` en verde)
- **Proyecto Supabase:** `avlmnfillieppgqjmawk`

> [!IMPORTANT]
> **Reglas de actualización entre sesiones (Archivo Vivo)**
> 1. Al iniciar una sesión donde se consulten pendientes o próximos pasos, leer este archivo primero y contrastar contra `git log` / estado del repo si hubo commits nuevos.
> 2. Al completar un ítem, marcarlo `[x]` indicando **fecha y commit** (`(2026-11-XX · <hash>)`) y mover el detalle resumido a **Completado Recientemente**.
> 3. Si aparece una nueva brecha técnica, de datos o de producción, agregarla en `P0`, `P1`, `P2` o `P3` con rutas de archivo exactas y criterio de cierre verificable.
> 4. No borrar historial útil de **Completado Recientemente** salvo para compactar bloques antiguos ya verificados.

---

## Snapshot Verificado (Estado Base en Vivo)

| Componente / Tabla | Estado Verificado | Notas |
| :--- | :--- | :--- |
| `NationalTariff` (`VE`) | **17,584** activas (**12,046** hojas 10 dígitos) | Arancel Consolidado 2026 |
| `TariffNodeEmbedding` (`VE`) | **12,046 / 12,046** (`768d`, NVIDIA Build) | Índice **HNSW** activo |
| `PermitType` / `HsPermitRequirement` | **21** tipos / **6,541** requisitos | Régimen legal de importación VE |
| `LegalKnowledgeParent` (`VE`) | `12` `SECTION` · `92` `CHAPTER` · `1,464` `EXEMPTION` | **`0` `LEGAL_NOTE`** |
| `LegalKnowledgeChunk` | **609** chunks con vector FTS `spanish` | Base de notas de sección/capítulo |
| `ProductMaster` | **0** filas | Listo para importar precedentes |
| `Country` (`VE`) | `nomenclatureDigits: 10`, `datasetVersion: "consolidado-arancel-2026"` | Actualizado en vivo y en `seed_from_arancel_rows.ts` |
| Supabase Storage buckets | `legal-documents`, `payment-receipts`, `broker-signatures`, `batch-invoices` | Todos privados (`public: false`) |

---

## P0 — Crítico para Producción, Auth y Despliegue

- [ ] **P0-1 · Ejecutar `git push origin main` desde terminal local y confirmar deploy en Vercel** *(build local `100%` validado el 2026-11-27)*
  - **Estado:** `pnpm check` y `pnpm check:deploy` (limpieza + `packages/*` + `eve build` + `next build --webpack`) pasaron en verde. Falta únicamente ejecutar `git push origin main` con tu passphrase SSH local y confirmar el deploy en Vercel.

- [ ] **P0-2 · Corregir Supabase Auth en Dashboard (HTTP 400 en Password Reset y Google OAuth)** *(acción manual en Supabase Dashboard)*
  - **Referencia:** `docs/Test Results/REPORTE_PRUEBAS_EXPLORATORIAS_TARIFFOS_APP.md`.
  - **Acciones:**
    1. Agregar `https://tariffos.app/auth/callback` y `https://tariffos.app/**` en *Authentication → URL Configuration → Redirect URLs* en Supabase.
    2. Verificar configuración SMTP en Supabase Auth para recuperación de contraseña.
    3. Configurar Client ID y Client Secret de Google OAuth en Supabase (o confirmar `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` desactivado en Vercel para mantener oculto el botón hasta habilitarlo).
    4. Activar *Leaked Password Protection* en Supabase Auth (reportado como `WARN` por los security advisors de Supabase).
  - **Criterio de cierre:** Flujo de recuperación de contraseña (y Google OAuth si se habilita) sin errores HTTP 400 en `https://tariffos.app/login` y advisor Auth en verde.

- [ ] **P0-3 · Confirmar variables de entorno en Vercel y sincronizar Inngest Cloud** *(acción manual en Vercel / Inngest)*
  - **Referencia:** `.env.example` y `docs/EVE_RUNTIME.md`.
  - **Acciones:**
    1. Verificar en Vercel: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `RESEND_API_KEY`, `EMAIL_FROM` (entrega de credenciales en `/admin/onboarding`), `LEADS_WEBHOOK_URL` (opcional alertas de leads) y `NEXT_PUBLIC_AGENT_RUNTIME` (`sse` vs `eve`).
    2. Sincronizar el endpoint `/api/inngest` en Inngest Cloud para garantizar ejecución de `bcv-sync` (cada 2h), `classifyInvoiceBatchFn`, `ingestLegalDocumentFn` y `indexPublishedLegalFn`.
  - **Criterio de cierre:** Apps registradas y saludables en Inngest Cloud y variables validadas en entorno productivo de Vercel.

---

## P1 — Brechas Funcionales en Código, Storage y Datos

*(Sin ítems P1 abiertos — `P1-1`, `P1-2` y `P1-3` completados el 2026-11-27.)*

---

## P2 — Corpus Normativo, Evaluación de Calidad y Lanzamiento

- [ ] **P2-1 · Ingestar leyes y notas transversales (`LEGAL_NOTE`) para VE**
  - **Estado actual:** `0` registros `LEGAL_NOTE` en `LegalKnowledgeParent`.
  - **Acciones:** Cargar vía `/admin/ingestion` o `pnpm --filter @tariffos/database ingest:legal`:
    1. Texto íntegro de las RGI 1–6 y Reglas Generales Complementarias del Decreto N° 4.944.
    2. Ley Orgánica de Aduanas (LOA) y su Reglamento.
    3. Providencias SENIAT y decretos modificatorios vigentes relevantes.
  - **Criterio de cierre:** Documentos publicados en estado `PUBLISHED` con `LegalKnowledgeChunk` indexado (FTS + embeddings) y verificables desde el clasificador.

- [ ] **P2-2 · Ampliar Golden Set VE y correr evaluación E2E (`eval-classify.ts`)**
  - **Archivos implicados:** `scripts/eval/ve-golden-set.json` (actualmente `32` líneas) y `scripts/eval-classify.ts`.
  - **Acciones:** Expandir a **50–100 productos reales de importación VE** y correr el pipeline completo (Tier 1 + Tier 2 RGI, no solo `--retrieval-only`).
  - **Criterio de cierre:** Documentar exactitud a 10 dígitos, tasa de falsos positivos HITL, latencia p50/p95 y costo promedio por clasificación.

- [ ] **P2-3 · Smoke Gate E2E completo con sesión autenticada en producción (`https://tariffos.app`)**
  - **Ya automatizado (`2026-11-27`):** suite Vitest de 6 flujos en `apps/web/src/app/__tests__/smoke-e2e.test.tsx` + CLI HTTP `pnpm smoke:e2e` (`scripts/smoke-e2e.mjs`) para rutas públicas y guards sin sesión.
  - **Pendiente tras configurar P0-2 / P0-3 en producción (flujos autenticados):**
    1. Hero Landing → Login/Onboarding → auto-clasificación en `/app`.
    2. Recuperación de contraseña sin error 400.
    3. Clasificación individual + HITL + PDF firmado + guardado/reuso SKU Tier 0 + persistencia de firma entre navegadores.
    4. Lote multi-ítem (incluyendo factura `> 3.5 MB` por Signed URL a `batch-invoices`) + Triage rápido + realtime.
    5. `/activate-plan` con subida real a `payment-receipts` + aprobación en `/admin/billing`.
    6. `/admin/ingestion` (subir borrador → Diff → publicar → auditoría en `/admin/audit`).

- [ ] **P2-4 · Importar precedentes históricos de primeros clientes piloto (`ProductMaster`)**
  - **Archivos implicados:** `packages/database/src/scripts/import_precedents.ts`.
  - **Estado actual:** `0` filas en `ProductMaster`.
  - **Criterio de cierre:** Cargar planillas CSV/Excel de clientes piloto iniciales para habilitar aciertos rápidos en Tier 0.

---

## P3 — Expansión Post-Lanzamiento (Backlog Despriorizado)

- [ ] **P3-1 · (En pausa por decisión del usuario, 2026-11-27) Segundo país operativo:** mantener solo Venezuela (`VE`) en esta etapa; reactivar solo cuando se decida abrir otro mercado.

---

## Completado Recientemente (Referencia — No Repetir)

- [x] **Sincronización cloud de firma manuscrita (`P1-1`, 2026-11-27):** bucket privado `broker-signatures`, helper `apps/web/src/lib/workspace/signature-storage.ts` y cableado en `GET`/`PUT /api/workspace/profile` usando `UserProfile.signatureStorageKey` (tests TDD en verde).
- [x] **Subida firmada para facturas pesadas en lotes (`P1-2`, 2026-11-27):** bucket privado `batch-invoices`, helper `batch-storage.ts`, endpoint `POST /api/batch/upload-url`, refactor de `batch-request-parser.ts` y soporte de flujo en 3 pasos (`> 3.5 MB`, hasta `25 MB`) en `submitBatchFile` con verificación de propiedad por `tenantId` (HTTP 403 ante cross-tenant).
- [x] **`Country.datasetVersion` VE al Consolidado 2026 (`P1-3`, 2026-11-27):** actualizado en vivo (`consolidado-arancel-2026` + Decretos 4.944, 5.103, 5.122, 5.147 y 5.198) y sincronizado automáticamente en `packages/database/src/scripts/seed_from_arancel_rows.ts`.
- [x] **UI/UX de `/login` y descomposición atómica (`P3-2`, 2026-11-27):** extracción de `LoginContextBanners.tsx` (`LoginCard.tsx` `<= 200` LOC), botón limpiar correo en 1 clic, trim en `onBlur`, atributos `autoCapitalize="none"`/`spellCheck={false}`/`inputMode="email"` y enlace `aria-describedby` en errores (`LoginCard.test.tsx`).
- [x] **Smoke Suite E2E ampliada y script HTTP (`P2-3` base, 2026-11-27):** `apps/web/src/app/__tests__/smoke-e2e.test.tsx` ampliado a 6 flujos críticos y nuevo script `pnpm smoke:e2e` (`scripts/smoke-e2e.mjs`).
- [x] **Plan Maestro Fases 0–D (`PIPELINE_AND_UI_PLAN.md`) y rediseño `/app`:** embudo SaaS de 3 planes B2B, Auth SSR con `proxy.ts`, Onboarding Express, `/app` en Atomic Design (`<= 200` LOC) con riel `54px`, header `48px`, `VerdictCard` (con badges RGI deduplicados en `1dd8ec3`), tarjetas HITL, `DossierView`, `DutyCalculatorView`, persistencia dual `IndexedDB` + `/api/workspace/*` (`7433f7c`, `88a6728`, `4182bec`, `1dd8ec3`).
- [x] **Consola Admin completa (`/admin`):** `leads`, `plans`, `onboarding`, `billing`, `tenants`, `usage`, `audit`, `settings`, `ai-quality`, `platform_admins`, cambio de contraseña in-app y cierre RBAC (`396df42`).
- [x] **Comprobantes de pago reales en Storage:** bucket privado `payment-receipts`, subida desde `PlanActivationForm` (`receiptStorageKey`) y lectura segura en `/api/admin/billing/receipts` desde `PaymentQueueCard`.
- [x] **Pipeline Multi-País de Ingestión Legal (`LEGAL_INGESTION_PIPELINE_PLAN.md`, Fases 1–6):** extractores PDF/MD/TXT/CSV/JSON, chunker con `scope` HS, Diff engine, derogación exacta, Inngest (`ingestLegalDocumentFn` + `indexPublishedLegalFn`), bucket privado `legal-documents`, UI `/admin/ingestion` y CLI `ingest_legal.ts` (`ed52f90`, `5ee1ba5`).
- [x] **Arancel VE Consolidado 2026 + Retrieval Híbrido:** `17,584` filas (`12,046` hojas 10 dígitos), `12,046` embeddings `768d` (NVIDIA Build) con índice **HNSW**, `21` `PermitType`, `6,541` `HsPermitRequirement`, `1,464` exoneraciones BK/BIT, `609` chunks de notas de sección/capítulo y búsqueda híbrida vector + FTS (`943dad1`, `7433f7c`).
- [x] **Lotes Multi-Ítem, Extractor Multimodal y Tasas BCV:** carga 1-clic de XLSX/PDF/fotos en `/app` con Inngest v4 Realtime + fallback inline local, extractor LLM/VL (`invoice-llm-extractor.ts`), caché bajo demanda + cron BCV cada 2h y herramienta `get_bcv_rate` (`5af3e77`, `1b73b6e`, `c096c80`, `95f6114`).
- [x] **Runtime conversacional Eve + optimizaciones de carga:** conexión Eve detrás de feature flag con caché de hilos en `IndexedDB`, esfuerzo de razonamiento configurable, búsqueda web `Parallel Fast` y manejo de errores/spinners (`108e4a4`, `3e5c999`, `71caf06`, `b1456e5`, `a12a25d`, `4182bec`).
