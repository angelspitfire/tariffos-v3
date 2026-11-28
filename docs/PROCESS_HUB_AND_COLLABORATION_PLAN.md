# Plan de Centro de Procesos, Auto-Triage con System 1 (Jev) y Colaboración Multi-Rol — TariffOS v3

**Fecha:** 28 de noviembre de 2026  
**Estado:** Listo para ejecutar (Fase A prioritaria; Fase B preparada desde el modelo de datos)  
**Referencias:** [typesafe-adapter.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/decision/typesafe-adapter.ts) · [provider.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/decision/provider.ts) · [ThreadSidebar.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/organisms/ThreadSidebar.tsx) · [ThreadHistoryList.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/molecules/ThreadHistoryList.tsx) · [AnalyticsWorkspaceView.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/organisms/AnalyticsWorkspaceView.tsx) · [api/workspace/threads/route.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/app/api/workspace/threads/route.ts) · [schema.prisma](file:///Users/afernandez/projects/tariffos-v3/packages/database/prisma/schema.prisma)

---

## 1. Problema a Resolver

En operación real, un liquidador procesa decenas de consultas, ítems individuales y facturas por semana. Hoy el workspace sufre 4 cuellos de botella:

1. **Historial plano tipo chatbot:** [ThreadHistoryList.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/molecules/ThreadHistoryList.tsx) mezcla consultas efímeras de 10 segundos con lotes abiertos, casos trabados esperando datos y dictámenes ya sellados.
2. **Dashboard pasivo sin valor operativo:** [AnalyticsWorkspaceView.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/organisms/AnalyticsWorkspaceView.tsx) muestra gráficas históricas que no ayudan a destrabar el trabajo del día y será reemplazado.
3. **Fricción del enfoque anterior (`Filing` rígido):** obligar a llenar una ficha de expediente antes de clasificar bloquea el trabajo real; la solución es **iniciar sin fricción en el chat**, clasificar automáticamente la intención con **System 1 (`typesafe-jev` / `DecisionProvider`)** y promover a proceso estructurado solo lo que realmente lo amerita.
4. **Escalabilidad multi-operador y API:** [api/workspace/threads/route.ts](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/app/api/workspace/threads/route.ts#L66-L71) trae un tope fijo `take: 25` con todos los `messages` JSON completos del `tenantId`, ocultando historial antiguo y mezclando operadores sin visibilidad por rol ni asignación.

---

## 2. Arquitectura de Auto-Clasificación de Hilos con System 1 (Jev)

### 2.1 Extensión del Puerto `DecisionProvider` (`packages/agent/src/lib/decision/`)
Aprovechar que `TypeSafeClient.systemOne({ state, questions })` en [typesafe-adapter.ts](file:///Users/afernandez/projects/tariffos-v3/packages/agent/src/lib/decision/typesafe-adapter.ts#L28-L32) responde múltiples `choice()` en una sola llamada de ~100 ms:

```ts
export type ProcessKind =
  | 'quick_lookup'
  | 'single_ruling'
  | 'invoice_batch'
  | 'oga_escalation'
  | 'cif_simulation';

export type OperationalStatus =
  | 'needs_input'
  | 'processing'
  | 'in_review'
  | 'approved'
  | 'archived';

export interface ThreadTriageDecision {
  processKind: ProcessKind;
  urgency: 'routine' | 'needs_client_info' | 'compliance_sensitive';
  retentionPolicy: 'ephemeral_48h' | 'track_until_approved';
  confidence: number;
}
```

### 2.2 Regla Híbrida Determinista + System 1 (Sin gastar llamadas obvias)
1. **Atajos deterministas (0 ms, \$0):**
   - Si el turno ejecutó `analyze_invoice_manifest` o creó un `BatchJob` → `processKind = 'invoice_batch'`.
   - Si el dictamen tiene `reviewStatus === 'in_review'` o alerta OGA crítica / pre-gate restringido → `processKind = 'oga_escalation'`, `operationalStatus = 'in_review'`.
   - Si el usuario solicitó solo `calculate_duties` sin dictamen RGI → `processKind = 'cif_simulation'`.
   - Si existe `verdict` + `dossier` aprobado → `operationalStatus = 'approved'`.
2. **Clasificador System 1 (`classifyThreadIntent` vía `DecisionProvider`):**
   - Se dispara en el primer turno de texto libre (o cuando un hilo `quick_lookup` recibe un nuevo turno con intención distinta) pasando `{ firstMessage, hasAttachments, toolNames, hasVerdict, hasQuestionnaire }`.
   - Si `processKind` cambia de `quick_lookup` a `single_ruling` / `invoice_batch` / `oga_escalation`, el hilo se **promueve automáticamente** a proceso activo (sin que el operador tenga que mover nada manualmente).

### 2.3 Trato Diferenciado por Tipo de Proceso

| `processKind` | ¿Entra al Centro de Procesos? | Comportamiento en Sidebar (`256px`) | Vista inicial del Canvas | Ciclo de vida |
| :--- | :---: | :--- | :--- | :--- |
| **`quick_lookup`** | **No** | Vive en acordeón plegable discreto **`Consultas rápidas`** (últimas 5–8 de las últimas 48h; siempre buscable en `Buscar…`). | Solo chat | Auto-expira de la vista a las 48h salvo promoción automática. |
| **`single_ruling`** | **Sí** | Vive en **`En curso`** mientras esté abierto. | `Dictamen` | Al pasar a `approved` (sellado), sale de `En curso` → `Sellados` en Centro de Procesos. |
| **`invoice_batch`** | **Sí** | Vive en **`En curso`** con contador `X/Y ítems`. | `Lote` | Sincroniza progreso en vivo con `BatchJob` / Inngest; al cerrar 100% pasa a `Sellados`. |
| **`oga_escalation`** | **Sí (prioridad alta)** | Vive en **`En curso`** con indicador ámbar/rojo. | `Dictamen` (bloque OGA + revisión) | Salta directo a **`Por aprobar / Revisión técnica`**. |
| **`cif_simulation`** | **Sí (ligero)** | Vive en **`En curso`** con monto USD/VES. | `CIF` | No exige firma RGI salvo que el operador pida dictamen formal. |

---

## 3. Modelo de Datos Preparado para Fase A y Fase B

> [!IMPORTANT]
> Cualquier migración sobre `packages/database/prisma/schema.prisma` debe cumplir la Regla 9 de `AGENTS.md`: RLS activa en todas las tablas `public`, índices explícitos sobre claves foráneas y verificación con `pnpm check:db` + Supabase `get_advisors`.

### 3.1 Columnas aditivas en `ClassificationSession` (Prisma)
Mantener compatibilidad 100% con sesiones existentes (valores por defecto seguros):
- `processKind` (`String @default("single_ruling") @map("process_kind")`) — `'quick_lookup' | 'single_ruling' | 'invoice_batch' | 'oga_escalation' | 'cif_simulation'`.
- `operationalStatus` (`String @default("processing") @map("operational_status")`) — `'needs_input' | 'processing' | 'in_review' | 'approved' | 'archived'`.
- `clientRef` (`String? @map("client_ref")`) — etiqueta ligera opcional de cliente / factura / BL (ej. `"Importadora Polar · BL-8821"`), editable en 1 clic desde el header `48px` o sugerida automáticamente al extraer una factura.
- `primaryHsCode` (`String? @map("primary_hs_code")`) — desnormalizado para listado/búsqueda rápida sin parsear JSON de `ChatMessage`.
- `itemProgressJson` (`Json? @map("item_progress")`) — `{ total: number, completed: number, needsInfo: number }` para barras de progreso sin joins pesados.
- `createdByUserId` (`String? @map("created_by_user_id")`) — autor inicial del proceso *(listo para Fase B)*.
- `assignedToUserId` (`String? @map("assigned_to_user_id")`) — operador o revisor asignado *(listo para Fase B)*.
- Índices compuestos recomendados:
  - `@@index([tenantId, operationalStatus, updatedAt(sort: Desc)])`
  - `@@index([tenantId, assignedToUserId, operationalStatus])`
  - `@@index([tenantId, processKind, updatedAt(sort: Desc)])`

### 3.2 Contrato ligero de API (`apps/web/src/app/api/workspace/threads/`)
Romper el cuello de botella actual de `take: 25` con payload completo:
- **`GET /api/workspace/threads`** — devuelve **cabeceras ligeras paginadas** (`cursor`, `limit=30`, `scope=mine|assigned|agency`, `status`, `kind`, `q`) sin cargar `messages` JSON de todos los hilos. Búsqueda server-side en `title`, `primaryHsCode`, `clientRef`.
- **`GET /api/workspace/threads/[id]`** — carga el arreglo completo `messages[]` únicamente al abrir un proceso específico (con caché local en IndexedDB para cambio instantáneo).
- **`PATCH /api/workspace/threads/[id]`** — actualización puntual de metadatos (`clientRef`, `operationalStatus`, `assignedToUserId`, `processKind`, `archived`) sin reescribir todos los `ChatMessage`.

---

## 4. Fases de Ejecución

### Fase A — Centro de Procesos + Triage Jev + Sidebar Limpio *(Prioritaria)*

1. **Backend & Dominio (TDD):**
   - Implementar `classifyThreadIntent` en `packages/agent/src/lib/decision/thread-triage.ts` (`<= 150` LOC) detrás de `DecisionProvider`, con atajos deterministas + fallback seguro ante timeout/error de red.
   - Aplicar migración aditiva en `ClassificationSession` + índices + verificación `pnpm check:db`.
   - Separar listado ligero paginado (`GET /api/workspace/threads`) y detalle bajo demanda (`GET /api/workspace/threads/[id]` + `PATCH`).
2. **Reemplazo total del Dashboard por el Centro de Procesos (`apps/web/src/components/workspace/`):**
   - Retirar el antiguo `AnalyticsWorkspaceView.tsx` (o absorber solo 4 KPIs operativos en la cabecera) y sustituir el botón `Dashboard` en [ThreadSidebar.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/organisms/ThreadSidebar.tsx) por **`Procesos`** con contador en vivo de pendientes.
   - Crear organismos y moléculas atómicas (`<= 200` LOC cada archivo):
     - `ProcessHubView.tsx` (organismo principal con conmutador **Tabla densa** ↔ **Tablero por estado**).
     - `ProcessKpiStrip.tsx` (4 contadores reales clicables que filtran la vista: `Requiere dato`, `En curso`, `Por aprobar`, `Sellados hoy`).
     - `ProcessRowCard.tsx` (muestra código HS / progreso de lote `14/20`, `clientRef`, semáforo de estado, fecha relativa, y acciones 1-clic: *Abrir*, *Copiar HS*, *Descargar PDF*, *Archivar*).
     - `ClientRefInlineChip.tsx` en [WorkspaceHeader48.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/organisms/WorkspaceHeader48.tsx) para etiquetar cliente/factura/BL sin formularios previos.
3. **Sidebar `256px` estilo "Inbox Zero":**
   - Dividir [ThreadHistoryList.tsx](file:///Users/afernandez/projects/tariffos-v3/apps/web/src/components/workspace/molecules/ThreadHistoryList.tsx) en:
     - **`En curso`**: únicamente procesos vivos (`needs_input`, `processing`, `in_review`), agrupados en `Hoy` / `Ayer` / `Anteriores`. Al aprobar/sellar un dictamen, sale automáticamente hacia `Sellados` en el Centro de Procesos (con toast `Dictamen sellado · Ver en Procesos`).
     - **`Consultas rápidas`**: acordeón plegable con las últimas 5–8 sesiones `quick_lookup` de las últimas 48h.
   - Búsqueda global (`Cmd+K` o input del sidebar) que consulta `GET /api/workspace/threads?q=...` en todo el historial (incluyendo archivados y consultas).

---

### Fase B — Roles de Agencia (`OWNER / REVIEWER / ANALYST`) y Colaboración en Vivo

1. **Roles operativos sobre `Membership.role`:**
   - Normalizar `Membership.role` a `'OWNER' | 'REVIEWER' | 'ANALYST'` (mapeando `'MEMBER'` existente → `'ANALYST'` por compatibilidad).
   - **Vista inicial por rol en `ProcessHubView`:**
     - `ANALYST` → filtro por defecto `Mis procesos`.
     - `REVIEWER` (Agente Aduanal firmante) → filtro por defecto `Cola de Revisión` (`in_review` + `oga_escalation`).
     - `OWNER` (Dueño / Gerente) → filtro por defecto `Toda la Agencia` con desglose por operador y por cliente.
   - **Guardia de firma:** si `approvalWorkflowMode === 'manual_signoff'` y el usuario es `ANALYST`, el botón primario es **`Enviar a revisión`** (solo `REVIEWER` / `OWNER` pueden estampar el sello final).
2. **Handoff y colaboración en un mismo proceso:**
   - Al pulsar `Solicitar revisión`, permitir asignar un miembro específico del tenant (`assignedToUserId`) o dejar en `Cola Técnica` de la agencia, registrando una nota auditable.
   - Atribución por autor en `WorkspaceMessage` (`authorUserId`, `authorName`, `authorInitials`) para distinguir en un hilo compartido de Eve quién hizo cada repregunta o edición del lote.
   - Timeline breve de eventos del proceso (`creado`, `escalado`, `editado`, `aprobado`) reutilizando el patrón append-only de `FilingStatusEvent`.
   - **Presencia suave (Supabase Realtime Presence):** mostrar indicador no bloqueante (`Ana está viendo este proceso`) cuando dos miembros abren el mismo `sessionId` simultáneamente.
3. **Gestión de equipo de agencia:**
   - Nueva pestaña `Equipo` dentro de `WorkspaceSettingsModal` (visible solo para `OWNER`) apoyada en el modelo `Invitation` ya existente en [schema.prisma](file:///Users/afernandez/projects/tariffos-v3/packages/database/prisma/schema.prisma#L117-L137).

---

## 5. Criterios de Verificación y Cierre

### Fase A
1. **Tests unitarios (Vitest):** `thread-triage.test.ts` (atajos deterministas + mock de `DecisionProvider` + promoción `quick_lookup -> single_ruling`), `threads-route.test.ts` (paginación ligera + búsqueda server-side + `PATCH` sin sobrescribir mensajes + rechazo `403` cross-tenant), y tests de `ProcessHubView` + `ThreadHistoryList` (`<= 200` LOC por archivo).
2. **Playwright E2E (`apps/web/e2e/`):**
   - Consulta rápida cae en `Consultas rápidas` y NO aparece en el Centro de Procesos.
   - Clasificación formal entra en `En curso` y en Centro de Procesos; al aprobar/sellar desaparece de `En curso` y queda en `Sellados`.
   - Búsqueda encuentra un proceso archivado más allá del ítem #25.
3. **Seguridad DB:** `pnpm check:db` + Supabase `get_advisors` en verde tras la migración de `ClassificationSession`.

### Fase B
1. **Tests RBAC multi-rol:** `ANALYST` no puede aprobar en modo `manual_signoff` (`403`), `REVIEWER` sí aprueba y sella, `OWNER` ve procesos de toda la agencia e invita miembros.
2. **E2E colaboración:** Analista A crea proceso y escala a Revisor B → aparece en `Cola de Revisión` de B → B abre la misma sesión Eve, agrega instrucción y aprueba con atribución de autor correcta.
