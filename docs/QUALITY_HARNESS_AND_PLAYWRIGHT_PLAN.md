# Plan de Endurecimiento del Harness, Suite Playwright y Matriz IA/Humano — TariffOS v3

**Fecha:** 27 de noviembre de 2026  
**Estado:** Listo para ejecutar  
**Referencias:** [scripts/check.mjs](file:///Users/afernandez/projects/tariffos-v3/scripts/check.mjs) · [.oxlintrc.jsonc](file:///Users/afernandez/projects/tariffos-v3/.oxlintrc.jsonc) · [scripts/check-deploy.mjs](file:///Users/afernandez/projects/tariffos-v3/scripts/check-deploy.mjs) · [PREVIEW_CICD_AND_RELEASE_GATE_PLAN.md](file:///Users/afernandez/projects/tariffos-v3/docs/PREVIEW_CICD_AND_RELEASE_GATE_PLAN.md)

---

## 1. Contexto y Retrospectiva (Por qué `pnpm check` no bastó)

Durante el overhaul del Workspace y la estabilización en vivo del 2026-11-27, `pnpm check` y `pnpm smoke:e2e` pasaron en verde mientras la app tenía fallos reales en navegador. Las 4 causas raíz fueron:

1. **Ceguera de JSDOM ante CSS y hit-testing:** Vitest + Testing Library no evalúa clases responsive de Tailwind (`hidden md:flex`), contextos de apilamiento (`z-index`) ni `pointer-events: none` de `@radix-ui/react-dialog`. Por eso el botón `Deshacer` parecía clicable en tests unitarios aunque Radix lo bloqueaba en Chromium, y las tabs móviles existían en el DOM aunque estaban ocultas en `390×844`.
2. **Warnings silenciados en Oxlint:** [.oxlintrc.jsonc](file:///Users/afernandez/projects/tariffos-v3/.oxlintrc.jsonc) declara `"categories": { "correctness": "warn" }` y [scripts/check.mjs](file:///Users/afernandez/projects/tariffos-v3/scripts/check.mjs) ejecuta `oxlint --quiet`, dejando pasar violaciones de `react-hooks/rules-of-hooks`.
3. **Smoke HTTP solo anónimo:** [scripts/smoke-e2e.mjs](file:///Users/afernandez/projects/tariffos-v3/scripts/smoke-e2e.mjs) verificaba redirects sin sesión, pero no sesiones autenticadas por rol (`super_admin` con membresía activa → bucle `307 /app -> /app` en [server-account-gate.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/lib/funnel/server-account-gate.ts)).
4. **Componentes probados con props ideales aisladas:** faltaban pruebas del árbol integrado (`cifValue === 0` al pulsar `+ CIF`, visibilidad de `complianceNotes` en `in_review` y turnos multi-herramienta de Eve en [eve-message-mapper.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/lib/workspace/eve-message-mapper.ts)).

---

## 2. Fase 1 — Endurecimiento del Harness Estático (`pnpm check` / `pnpm check:deploy`)

Objetivo: atrapar errores estructurales en **< 2 segundos** en cada commit, antes de abrir un navegador.

### 2.1 Reglas estrictas en `.oxlintrc.jsonc`
Archivo: [.oxlintrc.jsonc](file:///Users/afernandez/projects/tariffos-v3/.oxlintrc.jsonc)
- Promover a `"error"`:
  - `"react-hooks/rules-of-hooks": "error"`
  - `"jsx-a11y/alt-text": "error"`
  - `"jsx-a11y/aria-props": "error"`
  - `"jsx-a11y/aria-role": "error"`
  - `"jsx-a11y/role-has-required-aria-props": "error"`

### 2.2 Guardrails arquitectónicos en `scripts/lib/repo-guardrails.mjs`
Archivo: [scripts/lib/repo-guardrails.mjs](file:///Users/afernandez/projects/tariffos-v3/scripts/lib/repo-guardrails.mjs) (+ tests Vitest dedicados)
1. **Unicidad de modales Radix (`forbidden_raw_dialog`):** fallar si cualquier `.tsx` en `apps/web/src/components/workspace/` contiene `role="dialog"` o `aria-modal` fuera de [WorkspaceDialogShell.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/atoms/WorkspaceDialogShell.tsx).
2. **Tokens CSS sin duplicados (`duplicate_css_token`):** parsear [tokens.css](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/app/tokens.css) por selector (`:root`, `.dark`, `@theme`) y fallar si una misma variable `--*` se declara más de una vez en el mismo bloque.

### 2.3 Invariantes exhaustivas de ruteo y Golden Transcripts en Vitest
1. **Producto cartesiano en [server-account-gate.test.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/lib/funnel/server-account-gate.test.ts):**
   - Recorrer todas las combinaciones de `isPlatformAdmin × hasMembership × billingStatus × hasPendingPayment × route` (`login`, `onboarding`, `activate-plan`, `app`, `admin`).
   - Exigir dos invariantes matemáticos:
     - **Sin auto-redirect:** `target !== route`.
     - **Convergencia en ≤ 1 salto:** si `target !== null`, evaluar el gate sobre `target` debe devolver `null`.
2. **Trazas multi-herramienta en [eve-message-mapper.test.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/lib/workspace/eve-message-mapper.test.ts):**
   - Mantener fixtures "golden" de turnos encadenados (`analyze_invoice_manifest` + `classify_item`, `classify_item` + `calculate_duties`, `request_technical_clarification`) asegurando que ningún sobre contextual previo del mismo turno se pierda.

### 2.4 Build aislado en `scripts/check-deploy.mjs`
Archivo: [scripts/check-deploy.mjs](file:///Users/afernandez/projects/tariffos-v3/scripts/check-deploy.mjs)
- Ejecutar el paso 4 (`next build --webpack`) con `NEXT_DIST_DIR=.next-check` (ya soportado en [next.config.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/next.config.ts)).
- En un bloque `finally`, eliminar `apps/web/.next-check` y restaurar `apps/web/tsconfig.json` si Next inyectó `.next-check/types/**/*.ts`. Así `pnpm check:deploy` puede correrse en cualquier momento sin romper `pnpm dev`.

---

## 3. Fase 2 — Suite UI Determinista con Playwright (`apps/web/e2e/`)

Objetivo: validar CSS real, viewports reales, apilamiento Radix, teclado y contratos HTTP/SSE en Chromium en **< 45 segundos** y con **\$0 costo de LLM** usando `page.route` para fixtures SSE deterministas (dejando 1 smoke vivo separado para Preview).

### 3.1 Estructura propuesta (`<= 200` LOC por archivo)
```text
apps/web/
├── playwright.config.ts               # Proyectos: desktop-chromium (1440x900) y mobile-webkit/chromium (390x844)
└── e2e/
    ├── fixtures/
    │   ├── strict-page.ts             # Falla ante cualquier console.error, pageerror o HTTP >= 500
    │   ├── auth-states.ts             # Provisiona/limpia storageState para los roles de prueba
    │   └── eve-sse-mocks.ts           # Respuestas SSE deterministas (ítem único, CIF=0, lote 5 ítems)
    ├── public-funnel.spec.ts          # /, skip-link, fuentes, PlanRecommender, navegación a /login
    ├── auth-routing.spec.ts           # Matriz real de redirects en navegador (anónimo, onboarding, pago pendiente, broker, super_admin)
    ├── modals-and-overlays.spec.ts    # Hit-testing real: Deshacer toast sobre SkuCatalogModal, Escape en pila, dirty-guard en Settings
    ├── canvas-workflows.spec.ts       # + CIF con cifValue=0 -> DecimalField -> CFR -> Solicitar revisión -> Firma y descarga PDF
    ├── batch-triage-keyboard.spec.ts  # ArrowDown/ArrowUp/Enter, Copiar HS con stopPropagation, ficha plegada y Aprobar elegibles
    ├── mobile-viewport.spec.ts        # 390x844: WorkspaceMobilePaneTabs visible, switch Chat/Dictamen/Lote, scrollWidth <= innerWidth
    └── live-eve-smoke.spec.ts         # Solo en Preview/Pre-release (@live): 1 clasificación real contra Eve + Storage
```

### 3.2 Regla de oro del fixture `strict-page.ts`
Todo test importa `test` desde `e2e/fixtures/strict-page.ts`, el cual registra automáticamente:
- `page.on('pageerror', ...)` → fallo inmediato al terminar el test.
- `page.on('console', msg => msg.type() === 'error' ...)` → fallo inmediato (incluyendo mismatches de hidratación de React 19).
- `page.on('response', res => res.status() >= 500 ...)` → fallo inmediato en cualquier ruta `/api/*` o `/eve/*`.

### 3.3 Scripts en `package.json` raíz
- `pnpm test:e2e` → corre todas las specs deterministas (`--grep-invert @live`).
- `pnpm test:e2e:live` → corre `live-eve-smoke.spec.ts` (`--grep @live`) contra local (`:3003` + `:2000`) o `PLAYWRIGHT_BASE_URL` (Vercel Preview).

---

## 4. Fase 3 — Matriz de Responsabilidades: Harness vs. Playwright vs. IA vs. Humano

| Qué validar | Capa responsable | Frecuencia | Por qué vive aquí |
|---|---|---|---|
| Tipos, hooks condicionales, `<= 200` LOC, tokens duplicados, `role="dialog"` crudo, invariantes puros de ruteo y RLS estático | **1. Harness (`pnpm check`)** | Cada edición / commit (`< 5s`) | 100% estático/unitario; feedback instantáneo. |
| Visibilidad CSS móvil, `z-index` / `pointer-events` en Radix + toasts, teclado en tablas, flujo UI extremo a extremo, `0 console.error` y matriz Auth SSR | **2. Playwright Determinista (`pnpm test:e2e`)** | Cada PR y antes de merge (`< 45s`) | Requiere motor de layout y hit-testing real de Chromium, pero con respuestas deterministas sin gastar tokens. |
| Contrato vivo `Next -> Eve -> LLM -> pgvector -> Supabase Storage` (1 clasificación + 1 archivo) | **2b. Playwright Live Smoke (`@live`)** | En cada **Vercel Preview** antes de pasar a prod | Confirma que secretos, OIDC, red y esquemas reales están sanos en la nube. |
| Conversaciones ambiguas multi-turno con Eve, auditoría estética/visual de capturas (`/frontend-design` + `/web-design-guidelines`) y benchmark de precisión NCM (`pnpm eval:classify`) | **3. Agente IA (`browser` + `eval:classify`)** | Cambios en `agent/`, `packages/agent/` o rediseños mayores de UI | Requiere juicio semántico y visual donde los selectores rígidos fallan o no bastan. |
| Validez jurídica Decreto 4.944 / SIDUNEA, facturas escaneadas reales de clientes, verificación bancaria real (Zelle/Pago Móvil) y criterio final de UX/producto | **4. Humano (Producto / Agente Aduanal)** | Cierre de milestone / validación en Preview antes de release comercial | Responsabilidad legal aduanera, empatía operativa bajo presión y operación financiera real. |

---

## 5. Criterio de Cierre de este Plan

1. `pnpm check` falla intencionalmente ante un hook condicional, un `role="dialog"` fuera de `WorkspaceDialogShell` o un token CSS duplicado, y pasa en `0` errores sobre `main`.
2. `pnpm check:deploy` compila `packages/*`, `eve` y `web` usando `.next-check` sin tocar `.next` ni ensuciar `git status`.
3. `pnpm test:e2e` ejecuta las 6 specs deterministas en Desktop (`1440×900`) y Mobile (`390×844`) en `< 60s` con `0` flakes, `0 console.error` y `0 pageerror`.
