# Plan de Adopción Completa de Oxlint (`--type-aware --type-check`)

## Objetivo
Migrar el harness ([scripts/check.mjs](../scripts/check.mjs)) para ejecutar `oxlint --type-aware --type-check apps packages` en todo el monorepo, eliminando ruido legacy y capturando errores de tipos y reglas de lint en un solo paso rápido (~4–5s).

> **Nota sobre build de producción:** `oxlint --type-check` valida tipos y reglas de lint, pero **no** reemplaza a `pnpm bootstrap` (`prisma generate && tsc`) ni a `next build --webpack` (rutas de Next.js, límites client/server y bundling). El paso `5/5 Bootstrap build` en `scripts/check.mjs` debe mantenerse para el `pnpm check` completo antes de desplegar en Vercel.

---

## Estado Actual
- Ya están ignorados `**/.next/**` y `**/.eve/**` en [.oxlintrc.jsonc](../.oxlintrc.jsonc).
- `apps/web/src`, `packages/agent/src`, `packages/ai-client/src`, `packages/shared-types/src`, `packages/env/src` y `packages/logger/src` pasan `oxlint --type-aware --type-check --quiet` sin errores.
- **Único bloqueador actual:** deuda legacy en `packages/database`.

---

## Deuda Pendiente en `packages/database`
Errores reportados por `pnpm exec oxlint --type-aware --type-check --quiet apps packages`:

### 1. Código fuente core (`packages/database/src/`)
- [packages/database/src/client.ts](../packages/database/src/client.ts)
  - `typescript/no-explicit-any` (líneas 18, 35, 64, 70, 76, 143)
  - `eslint/no-unused-vars`: parámetro `ext` (línea 35)
- [packages/database/src/derogation.ts](../packages/database/src/derogation.ts)
  - `typescript/no-explicit-any` (líneas 1, 14, 38)
- [packages/database/src/permits.ts](../packages/database/src/permits.ts)
  - `typescript/no-explicit-any` (línea 194)

### 2. Tests (`packages/database/src/__tests__/`)
- [packages/database/src/__tests__/platform-admins.test.ts](../packages/database/src/__tests__/platform-admins.test.ts)
  - `TS2307` en línea 7: `Cannot find module '../platform-admins'` bajo `moduleResolution: NodeNext` (requiere extensión `.js` o ajuste de resolución).

### 3. Scripts de ingesta y seed (`packages/database/src/scripts/`)
- [packages/database/src/scripts/seed_from_arancel_rows.ts](../packages/database/src/scripts/seed_from_arancel_rows.ts)
  - `TS2322` (líneas 269 y 274): `Record<string, unknown>[]` no asignable a `NationalTariffCreateManyInput[]` / `LegalKnowledgeParentCreateManyInput[]`.
- [packages/database/src/scripts/fetch_seniat_normativa.ts](../packages/database/src/scripts/fetch_seniat_normativa.ts)
  - `eslint/no-unused-vars`: `gazetteKey` (línea 140).
- [packages/database/src/scripts/extract_arancel_notes.ts](../packages/database/src/scripts/extract_arancel_notes.ts)
  - `eslint/no-unused-vars`: `subchapterLabel` (línea 255).
- [packages/database/src/scripts/extract_arancel_pdf.ts](../packages/database/src/scripts/extract_arancel_pdf.ts)
  - `typescript/no-explicit-any` (línea 217).
- [packages/database/src/scripts/seed_from_portable.ts](../packages/database/src/scripts/seed_from_portable.ts)
  - `eslint/no-unused-vars`: `PortableProduct` (línea 38).
  - `typescript/no-explicit-any` (líneas 8, 48, 50, 166, 167, 188).
- [packages/database/src/scripts/backup_embeddings.ts](../packages/database/src/scripts/backup_embeddings.ts)
  - `eslint/no-unused-vars`: parámetro `reject` (línea 61).
- [packages/database/src/scripts/seed_from_json.ts](../packages/database/src/scripts/seed_from_json.ts)
  - `typescript/no-explicit-any` (líneas 118, 119, 134, 164, 191).

---

## Pasos para Completar la Migración
1. Corregir los tipos `any` y variables sin usar en `packages/database/src/` (`client.ts`, `derogation.ts`, `permits.ts`).
2. Corregir el import en `packages/database/src/__tests__/platform-admins.test.ts` (y verificar `vitest`).
3. Limpiar los scripts en `packages/database/src/scripts/` (tipar `tariffs`/`exemptions` en `seed_from_arancel_rows.ts` y reemplazar `any` por `unknown` + Zod o interfaces).
4. Validar en local:
   ```bash
   pnpm exec oxlint --type-aware --type-check --quiet apps packages
   ```
5. Actualizar el paso `2/5` en [scripts/check.mjs](../scripts/check.mjs) para correr `oxlint --type-aware --type-check apps packages` globalmente en lugar de filtrar solo `changedFiles`.
