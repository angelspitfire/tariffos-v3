# TariffOS v3 — Runtime Único con Eve

TariffOS utiliza **`@assistant-ui/eve`** (`EveThreadSurface`) y el agente durable de **`eve`** en `agent/` como **runtime único de chat**, con filesystem de instrucciones, skills modulares bajo demanda, herramientas tipadas y reconexión durable por `sessionId`.

## Arquitectura del agente (`agent/`)

- `agent/agent.ts` — Configuración del agente raíz (`defineAgent`, modelo dinámico desde `SystemSetting` `ai.runtime_config` o `EVE_MODEL`).
- `agent/instructions.md` — Identidad conversacional multi-turno y reglas base estables (saludos y dudas conceptuales en texto directo, sin disparar tools innecesarias).
- `agent/skills/` — Procedimientos especializados cargados bajo demanda con `eve__skill`:
  - `ve-rgi-classification` — Clasificación arancelaria Venezuela (Decreto 4.944, NCM 10 dígitos, RGI 1→6 y A2UI).
  - `cif-duty-liquidation` — Valoración CIF, Incoterms, tasa BCV, preferencias, exoneraciones y antidumping.
  - `chat-manifest-analysis` — Clasificación en streaming directo para manifiestos pequeños (2–25 líneas).
  - `oga-compliance-review` — Auditoría OGA/PGA (SENCAMER, SACS, CONATEL, INSAI, MINEC) y escalamiento `in_review`.
- `agent/tools/` — Herramientas tipadas (`classify_item`, `request_technical_clarification`, `analyze_invoice_manifest`, `calculate_duties`, `search_tariff`, `verify_hs_code`, `get_bcv_rate`, `web_search`, `request_dossier_review`).
- `agent/channels/eve.ts` — Canal HTTP `/eve/v1/*` protegido con cookies/JWT de Supabase, Vercel OIDC y `localDev()`.

## Desarrollo local

### Opción A (Recomendada): `pnpm dev` (Next.js + Eve juntos)

Inicia automáticamente el servidor local de **Eve** (`http://127.0.0.1:2000`) y el workspace **Next.js** (`http://localhost:3003`) en un solo comando:

```bash
pnpm dev
```

`apps/web/next.config.ts` redirige `/eve/*` hacia `EVE_BASE_URL` (`http://127.0.0.1:2000` por defecto), manteniendo el mismo origen y reenviando cookies de sesión sin problemas de CORS.

### Opción B: un solo comando con Vercel services (`vercel dev --local`)

Ejecuta Next.js (`apps/web`) y Eve (`agent/`) en el mismo origen (`/eve/v1/*` enrutado por `vercel.ts`):

```bash
pnpm dev:all
```

No requiere configurar `NEXT_PUBLIC_EVE_URL` (vacío por defecto → mismo origen).

### Opción C: dos terminales (`dev:eve` + `dev:web`)

Si prefieres ejecutar ambos procesos por separado (por ejemplo, para ver la TUI interactiva de Eve):

```bash
# Terminal 1 — Agente Eve con TUI (http://127.0.0.1:2000)
pnpm dev:eve

# Terminal 2 — Next.js Workspace (http://localhost:3003)
pnpm dev:web
```

Si ejecutas Eve en otro puerto o host, define `EVE_BASE_URL` o `NEXT_PUBLIC_EVE_URL`.

## Variables de entorno clave

```bash
EVE_MODEL="openrouter:nvidia/nemotron-3.5-super-vl"
NEXT_PUBLIC_AGENT_RUNTIME="eve"
# Opcional: dejar vacío para usar mismo origen (/eve/v1/*)
# NEXT_PUBLIC_EVE_URL=""
# Opcional: destino del proxy local de Next.js cuando usas `pnpm dev` + `pnpm dev:eve`
# EVE_BASE_URL="http://127.0.0.1:2000"
```

## Sesiones durables por hilo (`WorkspaceThread.eveSessionId`)

Cada hilo del workspace guarda el `eveSessionId` asignado por Eve (`onSessionChange`) en IndexedDB y en Cloud (`ClassificationSession.description`). Al cambiar de hilo en el sidebar, `EveThreadSurface` reconecta la sesión durable real (`initialSession: { sessionId, streamIndex: 0 }, resume: true`) sin duplicar mensajes ni cortar respuestas en curso.

## Diagnóstico rápido

```bash
pnpm exec eve info        # Verifica discovery de instructions, skills y tools
pnpm exec eve build       # Compila el agente para producción
pnpm check                # TypeScript + Oxlint + tamaño de módulos + Vitest + build:packages
```
