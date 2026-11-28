# TariffOS v3 — Backlog Vivo de Pendientes

- **Última actualización:** 2026-11-28
- **Commit base verificado:** Auditoría Pre-Lanzamiento + Landings `/` / `/ve` / `/privacidad` + `P0-3` (`NEXT_PUBLIC_SITE_URL` en Vercel Production; `pnpm check`, `pnpm check:db` y `pnpm check:deploy` en verde)
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
| `TariffExemptionRule` (`VE`) | **363** reglas (`RL-9` COMEX, `Ex.AEC`) | Decreto N° 5.197 (venc. `31/12/2026`) |
| `LegalKnowledgeParent` (`VE`) | `12` `SECTION` · `92` `CHAPTER` · `1,464` `EXEMPTION` | **`0` `LEGAL_NOTE`** |
| `LegalKnowledgeChunk` | **609** chunks con vector FTS `spanish` | Base de notas de sección/capítulo |
| `ProductMaster` | **0** filas | Listo para importar precedentes |
| `Country` (`VE`) | `nomenclatureDigits: 10`, `datasetVersion: "consolidado-arancel-2026"` | Actualizado en vivo y en `seed_from_arancel_rows.ts` |
| Supabase Storage buckets | `legal-documents`, `payment-receipts`, `broker-signatures`, `batch-invoices` | Todos privados (`public: false`) |

---

## P0 — Crítico para Producción, Auth y Despliegue

- [ ] **P0-1 · Ejecutar `git push origin main` desde terminal local y confirmar deploy en Vercel** *(gates locales 100% en verde el 2026-11-28)*
  - **Estado:** `pnpm check` (`145` archivos/`508` tests en `apps/web` + `46`/`212` en `packages/agent`), `pnpm check:db` (`44/44` RLS, `0` políticas inseguras) y `pnpm check:deploy` (`packages/*` + `eve build` + `next build --webpack` incluyendo `/[country]` y `/privacidad`) pasaron en verde. Falta únicamente ejecutar `git push origin main` con tu passphrase SSH local y verificar `pnpm smoke:e2e -- --url https://tariffos.app --strict` tras el despliegue.

- [ ] **P0-2 · Completar seguridad restante en Supabase Auth Dashboard (`avlmnfillieppgqjmawk`)** *(Google OAuth ya verificado activo el 2026-11-28)*
  - **Ya verificado en vivo (`/auth/v1/settings`):** `"google": true` y `"email": true` activos.
  - **Pendiente (Dashboard de Supabase):**
    1. Activar *Leaked Password Protection* en Supabase Auth (actualmente reportado como `WARN` por `get_advisors`).
    2. Confirmar en *Authentication → URL Configuration / SMTP* que `https://tariffos.app/auth/callback` y el envío de correos de recuperación funcionen sin HTTP 400.
  - **Criterio de cierre:** Advisor `auth_leaked_password_protection` limpio y recuperación de contraseña operativa en `https://tariffos.app/login`.

- [ ] **P0-3 · Completar variables opcionales / clave productiva en Vercel (`Production`)** *(core AI/Supabase/Inngest y `NEXT_PUBLIC_SITE_URL` ya verificados el 2026-11-28)*
  - **Ya verificado en Vercel Production (`vercel env ls production`):** `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` (con `/api/inngest` firmado respondiendo `x-inngest-sdk-handled: true`), `LLM_PROVIDER`, `DECISION_PROVIDER`, `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `RGI_MODEL`, `RGI_DEEP_MODEL`, `EVE_MODEL`, `EMBEDDING_MODEL`, `EMBEDDING_DIMS`, `MAX_WEB_GROUNDING_STANDARD` y **`NEXT_PUBLIC_SITE_URL=https://tariffos.app`**.
  - **Pendiente según necesidad operativa:**
    1. `TYPESAFE_API_KEY` real (si `DECISION_PROVIDER=typesafe`; en `.env.local` solo hay valor placeholder).
    2. `RESEND_API_KEY` + `EMAIL_FROM` (para entrega automática de credenciales desde `/admin/onboarding`).
    3. Opcionales: `LEADS_WEBHOOK_URL` (alertas externas de leads) y `NEXT_PUBLIC_AGENT_RUNTIME` (`eve` si quieres activarlo en producción en lugar del default `sse`).

---

## P1 — Brechas Funcionales, Calidad Automatizada y CI/CD Preview

- [x] **P1-4 · Harness Estático endurecido y Suite UI Determinista con Playwright (`2026-11-28 · pendiente commit`):** ver **Completado Recientemente**.

- [ ] **P1-5 · Configuración externa en Dashboards para activar `preview-e2e.yml` y Branch Protection** *(workflows y scripts del repo listos el `2026-11-28`)*
  - **Ya implementado en el repo:** `.github/workflows/ci.yml` (+ Playwright determinista), `.github/workflows/preview-e2e.yml`, `.github/workflows/prod-smoke.yml`, `scripts/smoke-e2e.mjs` (con `x-vercel-protection-bypass`, `/app` y `/api/workspace/threads`), `scripts/e2e-accounts.ts` + `scripts/lib/e2e-account-helpers.mjs` (cuentas efímeras `@tariffos.internal` y teardown cascada).
  - **Pendiente en Dashboards externos (~15 min manuales):**
    1. Crear `VERCEL_AUTOMATION_BYPASS_SECRET` en Vercel (*Deployment Protection → Protection Bypass for Automation*).
    2. Cargar en *GitHub Repository Secrets*: `VERCEL_AUTOMATION_BYPASS_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`.
    3. Añadir wildcard `https://*-*.vercel.app/**` en *Supabase Auth → URL Configuration → Redirect URLs*.
    4. Activar Branch Protection en `main` requiriendo PR + checks `verify` y `preview-e2e` antes de mergear.

- [x] **P1-6 · Centro de Procesos Operativos, Auto-Triage System 1 (Jev) y Colaboración Multi-Rol (`docs/PROCESS_HUB_AND_COLLABORATION_PLAN.md`)**
  - [x] **Fase A (`2026-11-28` · `a533f6c`..`26752d6`):** `ProcessKind`/`OperationalStatus` en `@tariffos/shared-types`, motor híbrido `classifyThreadIntent` en `@tariffos/agent`, migración aditiva RLS en `ClassificationSession`, API paginada/detalle/patch (`/api/workspace/threads` + `/[id]`), preservación de caché en `DualWritePersistence`, `ProcessHubView` (`Tabla` ↔ `Tablero` + KPIs + `ClientRefInlineChip`) reemplazando a `AnalyticsWorkspaceView` y sidebar Inbox-Zero (`En curso` + `Consultas rápidas` 48h).
  - [x] **Fase B (`2026-11-28 · pendiente commit`):** roles `OWNER / REVIEWER / ANALYST` en `Membership`, API CRUD de equipo (`/api/workspace/team`) con guardia de último `OWNER`, guardia RBAC de sellado en backend y UI (`canSealDossier`), asignación de revisor en 1 clic (`DossierApprovalBar`), atribución por autor (`authorName`) en mensajes de usuario compartidos, presencia blanda Supabase Realtime (`useProcessPresence` + `ProcessPresenceBadge`), bitácora del proceso (`ProcessActivityStrip`) y pestaña `Equipo` sobre `Invitation`.

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

- [x] **Centro de Procesos + Colaboración Multi-Rol P1-6 (Fases A y B, `2026-11-28`):** vistas operativas (`Tabla`/`Tablero`) con auto-triage System 1, sidebar Inbox-Zero (`En curso` + `Consultas rápidas`), RBAC `OWNER / REVIEWER / ANALYST` sobre `Membership`/`Invitation`, API `/api/workspace/team`, guardia `canSealDossier`, revisor en 1 clic, atribución de autor, presencia Realtime y bitácora del proceso + E2E `team-collaboration.spec.ts`.
- [x] **Harness Estático P1-4 + Suite Playwright + Pipeline CI/CD P1-5 (`2026-11-28 · pendiente commit`):** endurecido `.oxlintrc.jsonc` (`rules-of-hooks` y `jsx-a11y/*` en `error`), añadidos guardrails `checkForbiddenRawDialogs` y `checkDuplicateCssTokens` en `scripts/lib/repo-guardrails.mjs` (cableados en `scripts/check.mjs`), aislamiento `NEXT_DIST_DIR=.next-check` en `scripts/check-deploy.mjs` con limpieza/restauración de `tsconfig.json`, matriz cartesiana de 432 estados en `server-account-gate.test.ts` (corrigiendo bug real de redirección de 2 saltos), transcript dorado multi-herramienta en `eve-message-mapper.test.ts`, suite Playwright (`10 passed` en Desktop `1440×900` + Mobile `390×844` sobre `next start` en `.next-e2e` con mocks Eve v27 NDJSON, `0 console.error` y `0 pageerror`), extensión de `scripts/smoke-e2e.mjs`, CLI `scripts/e2e-accounts.ts` con guardia `@tariffos.internal` (`e2e-accounts-guard.test.ts`) y workflows `.github/workflows/ci.yml`, `preview-e2e.yml` y `prod-smoke.yml`.
- [x] **Auditoría P0 de Producción y Config Vercel (`2026-11-28`):** verificados Google OAuth (`"google": true` en Supabase Auth), firma Inngest activa en `https://tariffos.app/api/inngest` (`INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` en Vercel) y alta de `NEXT_PUBLIC_SITE_URL=https://tariffos.app` en Vercel Production (`vercel env ls production`); gates `pnpm check`, `pnpm check:db` y `pnpm check:deploy` en verde.
- [x] **Auditoría Pre-Lanzamiento + Landings Global (`/`) y Venezuela (`/ve`) + `/privacidad` (2026-11-28):** migración RLS `TariffExemptionRule` + columnas `baseAdValorem`/`tariffExceptionCode`/`statisticalUnit` en `NationalTariff` y trazabilidad *append-only* (`version`, `sourceSha256`, `datasetVersion`, `userId`) en `DecisionArtifact`; re-seed en vivo de `17,584` filas VE con tasas efectivas `Ex.AEC` (`98E`, `0E`), `statisticalUnit` saneado y `363` reglas `Decreto N° 5.197` (`RL-9` COMEX, vencimiento `31/12/2026`); gate anti-alucinación en facturas insuficientes (`insufficient-spec-guard.ts`), prioridad de Notas Excluyentes de Sección, dictamen PDF enriquecido (`dossier-pdf-sections.ts` + muestra real de `5.1 KB`), arquitectura `CountryLandingConfig` (`/` Global OMA + `/ve` localizada con sugerencia GeoIP Modo B + `hreflang`), ruta `/privacidad` y protocolo `scripts/eval/rompe-ia-suite.json`.
- [x] **Overhaul UI/UX del Workspace (Planes 1–3) + Estabilización Runtime E2E en Vivo (Plan 4, 2026-11-27 · `88425cb`, `ae71e48`, `237f3e2`, `2078a8c`):** tipografía `Plus Jakarta Sans` + `JetBrains Mono`, modales unificados en `WorkspaceDialogShell`, pestañas móviles siempre visibles, toast portaled con `Deshacer` 5s sobre Radix, `VerdictCard` sobria, `DossierView` editorial continuo, calculadora CIF bajo demanda con `DecimalField`, triaje masivo por teclado, corrección del bucle `307` de `super_admin` en `server-account-gate.ts` y preservación multi-herramienta en `eve-message-mapper.ts` (verificado en navegador real con `0 console.error`, `0 pageerror` y `0 HTTP >= 400`).
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
