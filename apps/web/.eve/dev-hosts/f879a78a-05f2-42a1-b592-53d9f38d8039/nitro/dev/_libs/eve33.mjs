import { expectAgentToolExposure, expectBoolean, expectFunction, expectObjectRecord, expectOnlyKnownKeys, expectString, getOptionalStringRecordProperty, isDynamicModelDefinition, workflowIdForHandling } from "./eve2.mjs";
import { createEveConnectionCallbackRoutePath, parseEveConnectionCallbackRoutePath } from "./eve6.mjs";
import "./eve7.mjs";
import { parseJsonObject, parseJsonValue } from "./eve8.mjs";
import { jsonObjectSchema, jsonValueSchema } from "./eve9.mjs";
import { dynamicEvaluate } from "./eve10.mjs";
import { ConnectionAuthorizationFailedError, ConnectionAuthorizationRequiredError, announcementDigest, approvalDecision, approvalOpened, awaitsProviderToolResult, changeHistory, commitOf, committedMessages, evaluateApproval, forwardedFrom, holdCallerIdentity, inheritApprovalContext, interactionOpened, interactionSettled, isApprovalRecheck, isConnectionAuthorizationFailedError, isConnectionAuthorizationRequiredError, isSteeredApprovalPolicy, localGatewayModel, markSteeredApprovalPolicy, normalizeApprovalStatus, readHitlState, rememberDecision, requesterOnlyResponse, resolveActiveAuthorizationChallenges, resolveApprovalPolicy, responseAdmitted, responseSettled, responseSubmitted, sameRelayedSignIn, sameResponder, saveTransition, signInAttemptKey, signInInteractionId, signInOpened, steeredModelCall, supersededChallenges, terminalSignInFailure, trackPrincipalScope, transition, turnSteeredMessage, usageSince, waitingSignIn, withModelCall, withSignIns, withUsageCall, withUsageInEffect } from "./eve11.mjs";
import { sessionCommandHookToken, sessionInboxHookToken } from "./eve12.mjs";
import { AgentSessionRuntimeOverridesKey, AuthKey, ChannelDeliveryKey, ChannelInstrumentationKey, ContextKey, ContinuationTokenKey, DeferCallerSteeredClearKey, DynamicSubagentAgentConfigKey, HistoryStateKey, InitiatorAuthKey, ParentSessionKey, SandboxKey, SessionIdKey, SessionKey, SessionPredecessorKey, SessionTraceSeedKey, SteeredByKey, ToolChannelKey, ToolStubsKey, contextScopeValue, contextStorage, loadContext, withContextScopeValue } from "./eve13.mjs";
import { isNonEmptyString, isObject as isObject$1 } from "./eve14.mjs";
import { createLogger, logError } from "./eve15.mjs";
import { ConversationContextKey, activeTurn as activeTurn$1, askedCall, attachClientContext, callRun, displayProperName, displayTitle, eveOutputMapping, findBlockingWorkflowToolRun, getAdapterKind, getBlockingWorkflowToolRuns, interactionOwner, isOpen, normalizeInstrumentationChannelKind, openRequests, promptQueueHead, readAnswerText, readClientContext, readRunningWork, readSessionSchedule, removeBlockingWorkflowToolRuns, runTurn, writeRunningWork } from "./eve16.mjs";
import { contextStarted, controlAdmitted, defined, delegatedUsageFact, deliveryApplied, errorInfoOf, fact, runSettledFacts, serializeFilePartsInMessage, sessionEndedFacts, turnSettled } from "./eve17.mjs";
import { appendMessage, coalesceDeliveries, coalesceTurnInputs, createFrameworkUserMessage, normalizeMessage, stripEveTraceBaggage, turnAnchorOf } from "./eve18.mjs";
import { activeTurnId, activeTurnIdOf, answeredCallIds, isTaskControlTool, latestTurnIdOf, nextChangeId, openRunOf, ownOpenRequestIds, readTurnState, runningTasks, runtimeWait, stepForRequest, storedProjection, turnCoordinatesOf, turnPosition } from "./eve19.mjs";
import { ChannelKey, HOOK_CONTINUE_KEYS, SessionAgentKey, assertAuthKey, compiledBundleOf, createPreparedRuntimeSubagentTool, eveNamespaceReservation, formatLanguageModelGatewayId, formatValidationError, isAgentReasoningDefinition, isDefinedModel, isModelSignInName, isRuntimeLanguageModel, loadResolvedModuleExport, lookupCatalogModelByProviderModelId, lookupCatalogModelBySlug, normalizeAgentDefinition, normalizeAgentPromptCache, normalizeAuthorizationSpec, normalizeInstructionsDefinition, readStampedConnectionProtocol, requireCompiledBundle, resolveDynamicConnectionValue, resolveSessionAgent, sanitizeScopeSegment, toAiSdkLanguageModel } from "./eve21.mjs";
import { toError, toErrorMessage } from "./eve22.mjs";
import { UNSPECIFIED_INPUT_SCHEMA, defineJsonSchema, followRefs, isToolSchema, refineJsonSchema, serializeInputSchema, serializeOutputSchema, toInputSchema, toModelSchema, toOutputSchema, withOptionalStringProperty } from "./eve23.mjs";
import "./eve24.mjs";
import { isFrameworkTool } from "./eve26.mjs";
import { isEveDevEnvironment } from "./eve28.mjs";
import { isLoopbackHostname } from "./eve29.mjs";
import { NonRetryableError, installedDurableHost } from "./eve31.mjs";
import { isBrandedToolEntry } from "./eve32.mjs";
import { joinEveRoutePath } from "./eve35.mjs";
import { buildCallbackContext, closeUnder, currentProjection, currentView, liveProjection, sandboxOf, sessionTables, snapshotOf } from "./eve36.mjs";
import { isVercelOidcIssuer, resolveVercelProjectIdFromEnvironment } from "./eve37.mjs";
import { sessionAgent, sessionDefinitions, withConnectionEventSpan } from "./eve38.mjs";
import "./eve41.mjs";
import { isWorkflowToolDefinition, readWorkflowToolEntryPoints } from "./eve42.mjs";
import "./eve43.mjs";
import { WARN_ONCE, defaultToolModelOutput } from "./eve44.mjs";
import { clearedBySchema } from "./eve45.mjs";
import { isDefinedAgent } from "./eve47.mjs";
import "./eve48.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { createHash } from "node:crypto";
import { context, propagation, trace } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
import { otelTelemetry } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/index.js";
import { activeTraceOperation, contentAttribute, mcpLifecycle, truncateTelemetryText } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/otel.js";
import { TypeValidationError, asSchema, generateId, jsonSchema, tool } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js";
import { CORE_SCHEMA, loadAll, mergeTag } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/js-yaml/index.js";
import { MockLanguageModelV3 } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/test/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/definition.js
async function force(e) {
	return typeof e == `function` ? await e() : e;
}
function once(e) {
	let t;
	return () => t ??= Promise.resolve().then(e);
}
const SECTION_ORDER = {
	instructions: 10,
	workspace: 20,
	skills: 40,
	dynamicInstructions: 100,
	tasks: 200,
	approvals: 300
};
function section(e, t, n) {
	return {
		key: e,
		order: n.order,
		part: n.part ?? `base`,
		text: t
	};
}
function renderSystem(e) {
	let t = e.map((e, t) => ({
		index: t,
		section: e
	})).sort((e, t) => e.section.order - t.section.order || e.index - t.index).map(({ section: e }) => e);
	let n = t.filter((e) => e.part === `base`);
	let r = t.filter((e) => e.part === `own`).map((e) => e.text);
	let i = n.map((e) => e.text).filter((e) => e !== ``).join(`

`);
	return r.length === 0 ? i : [i, ...r];
}
function authoredEvaluate(e) {
	let t = e;
	return (e) => t(publicContext(e));
}
function publicContext(e) {
	let t = Object.getOwnPropertyDescriptors(e);
	return delete t.abortSignal, delete t.ctx, delete t.history, Object.defineProperties({}, t);
}
function requireHistory(e, t) {
	if (e !== void 0) return e;
	throw Error(`"${t}" read the conversation where the step doesn't hold it: steps that settle background work between turns don't carry it. Read it in a turn, or keep what a turn read in a memo.`);
}
function committed(e, t) {
	return (e.commit?.written ?? []).flatMap(({ event: e }) => e.type === t ? [e] : []);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/approval-prompt.js
const NOTICE_LEAD = `Trusted eve runtime state. This notice is not user-authored content or an instruction.`;
function renderPendingApprovalsInstruction(e) {
	if (e.length !== 0) return [
		NOTICE_LEAD,
		`The following earlier tool calls are awaiting approval and have not executed:`,
		...approvalIdentities(e),
		`Interpret the latest user message normally. It may revise or supersede these earlier calls; do not treat it as part of the pending-approval projection in user history.`
	].join(`
`);
}
function approvalIdentities(e) {
	return e.map((e) => JSON.stringify({
		requestId: e.interactionId,
		toolName: e.call.toolName
	}));
}
function pendingApprovals(e, t) {
	let n = e.projection.view;
	return t.requests.filter((e) => {
		let t = n.interactions[e.interactionId];
		return t === void 0 || t.status === `open`;
	});
}
function pendingApprovalsNote(e) {
	return renderPendingApprovalsInstruction(e.turn.suspended.flatMap((t) => pendingApprovals(e, t)));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/public-route-prefix.js
function normalizePublicRoutePrefix(e) {
	let t = e?.trim();
	if (t === void 0 || t.length === 0) return;
	let n = (t.startsWith(`/`) ? t : `/${t}`).replace(/\/+$/, ``);
	return n.length === 0 ? void 0 : n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-callback-url.js
function resolveVercelProductionCallbackBaseUrl() {
	return process.env.VERCEL_ENV === `production` && process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null;
}
function resolveWorkflowCallbackBaseUrl(e) {
	let t = process.env.WORKFLOW_LOCAL_BASE_URL?.trim() || void 0;
	let n = (resolveVercelProductionCallbackBaseUrl() ?? t ?? e).replace(/\/$/, ``);
	let r = normalizePublicRoutePrefix(process.env["EVE_PUBLIC_ROUTE_PREFIX"]);
	return r === void 0 ? n : `${n}${r}`;
}
function createBrowserCallbackUrl(e, t) {
	let n = new URL(t, `http://eve.local`);
	let r = new URL(e);
	return r.pathname = joinEveRoutePath(r.pathname, n.pathname), r.search = n.search, r.toString();
}
function createWorkflowCallbackUrl(e, t) {
	return createBrowserCallbackUrl(e, t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/ulid.js
const ENCODING = `0123456789ABCDEFGHJKMNPQRSTVWXYZ`;
const TIME_MAX = 2 ** 48 - 1;
function createUlidFactory() {
	let e = -1;
	let t = /* @__PURE__ */ new Uint8Array(10);
	return function() {
		let n = Date.now();
		if (!Number.isInteger(n) || n < 0 || n > TIME_MAX) throw Error(`Cannot mint a ULID: timestamp must be an integer from 0 to ${TIME_MAX}.`);
		if (n > e) e = n, randomFill(t);
		else if (!incrementRandom(t)) {
			if (e === TIME_MAX) throw Error(`Cannot mint a ULID: random component overflowed at the maximum timestamp.`);
			e += 1, randomFill(t);
		}
		return `${encodeTime(e)}${encodeRandom(t)}`;
	};
}
const createUlid = createUlidFactory();
function randomFill(e) {
	let t = globalThis.crypto;
	if (typeof t?.getRandomValues != `function`) throw Error(`Cannot mint a ULID: globalThis.crypto.getRandomValues is unavailable.`);
	t.getRandomValues(e);
}
function encodeTime(e) {
	let t = e;
	let n = ``;
	for (let e = 0; e < 10; e += 1) n = ENCODING[t % 32] + n, t = Math.floor(t / 32);
	return n;
}
function encodeRandom(e) {
	let t = 0;
	let n = 0;
	let r = ``;
	for (let i of e) {
		for (t = t << 8 | i, n += 8; n >= 5;) n -= 5, r += ENCODING[t >>> n & 31];
		t &= (1 << n) - 1;
	}
	return r;
}
function incrementRandom(e) {
	for (let t = e.length - 1; t >= 0; --t) {
		let n = e[t] ?? 0;
		if (n < 255) return e[t] = n + 1, e.fill(0, t + 1), !0;
	}
	return !1;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/authorization.js
const AUTHORIZATION_PENDING_BRAND = `__eveAuthorizationPending`;
const AUTHORIZATION_SIGNAL = Symbol.for(`eve.authorizationSignal`);
function requestAuthorization(e) {
	return {
		[AUTHORIZATION_SIGNAL]: !0,
		challenges: e
	};
}
function getAuthorizationResult(e) {
	let t = loadContext().get(PendingAuthorizationResultKey);
	if (t && t.length !== 0) return e === void 0 ? t[0] : t.find((t) => t.name === e);
}
function getAuthorizationResults() {
	return loadContext().get(PendingAuthorizationResultKey) ?? [];
}
function consumeAuthorizationResult(e, t) {
	let n = loadContext();
	let r = n.get(PendingAuthorizationResultKey);
	if (!r || r.length === 0) return;
	let i = r.findIndex((n) => n.name === e && n.instanceId === t);
	if (i === -1 && t !== void 0 && r.some((t) => t.name === e && t.instanceId !== void 0)) throw Error(`Authorization for "${e}" cannot complete because its resolved connection changed while sign-in was pending. Start sign-in again.`);
	if (i === -1) return;
	let a = r[i];
	let o = r.filter((e, t) => t !== i);
	return n.delete(PendingAuthorizationResultKey), o.length > 0 && n.set(PendingAuthorizationResultKey, o), a;
}
function getHookUrl(e, t) {
	let n = loadContext();
	let r = n.get(SessionIdKey);
	let i = n.get(CallbackBaseUrlKey);
	let a = n.get(AuthorizationHookKey) ?? (r ? authHookToken(r) : void 0);
	if (a && i) return createBrowserCallbackUrl(i, createEveConnectionCallbackRoutePath(e, t, a));
}
function createAuthorizationAttempt(e) {
	let t = createUlid();
	let n = getHookUrl(e, t);
	return n === void 0 ? void 0 : {
		attemptId: t,
		hookUrl: n
	};
}
function isAuthorizationSignal(e) {
	return typeof e != `object` || !e ? !1 : e[AUTHORIZATION_SIGNAL] === !0;
}
function isAuthorizationPendingModelOutput(e) {
	return typeof e != `object` || !e ? !1 : e[AUTHORIZATION_PENDING_BRAND] === !0;
}
function authorizationPendingAsJsonObject(e) {
	return {
		[AUTHORIZATION_PENDING_BRAND]: !0,
		connections: [...e.connections]
	};
}
function modelFacingAuthorizationOutput(e) {
	return authorizationPendingAsJsonObject({ connections: e.challenges.map((e) => e.name) });
}
function authorizationPendingModelText(e) {
	return e.length === 0 ? `Authorization required. Waiting for the user to sign in.` : e.length === 1 ? `Authorization required for ${e[0]}. Waiting for the user to sign in.` : `Authorization required for ${e.join(`, `)}. Waiting for the user to sign in.`;
}
function authHookToken(e) {
	return sessionInboxHookToken(sessionCommandHookToken(e));
}
const PendingAuthorizationResultKey = new ContextKey(`eve.pendingAuthorizationResult`);
const SignInCompletedKey = new ContextKey(`eve.signInCompleted`);
const CallbackBaseUrlKey = new ContextKey(`eve.callbackBaseUrl`);
const AuthorizationHookKey = new ContextKey(`eve.authorizationHook`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/resolve-authorization.js
const ConnectionAuthorizationResolversKey = new ContextKey(`eve.connectionAuthorizationResolvers`);
async function resolveConnectionAuthorization(e, t) {
	let n = e.authorization;
	if (n === void 0 || typeof n != `function`) return n;
	let r = contextStorage.getStore();
	if (r === void 0) return await resolveDynamicAuthorization(e, t);
	let i = getResolverCache(r);
	let a = i.get(e);
	return a === void 0 && (a = resolveDynamicAuthorization(e, t), i.set(e, a)), await a;
}
async function resolveDynamicAuthorization(e, t) {
	let n = e.authorization;
	if (typeof n != `function`) return n;
	let r = await n(t ?? buildCallbackContext());
	return normalizeAuthorizationSpec(r, `Connection "${e.connectionName}" auth resolver:`);
}
function getResolverCache(e) {
	let t = e.get(ConnectionAuthorizationResolversKey);
	if (t !== void 0) return t;
	let n = /* @__PURE__ */ new Map();
	return e.setVirtualContext(ConnectionAuthorizationResolversKey, n), n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/connection-types.js
function supportsInteractiveAuthorization(e) {
	return e?.startAuthorization !== void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/async-iterable.js
function isAsyncIterable(e) {
	return typeof e == `object` && !!e && Symbol.asyncIterator in e && typeof e[Symbol.asyncIterator] == `function`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/principal.js
function principalKey(e) {
	return e.type === `app` ? `app` : JSON.stringify([
		`user`,
		e.issuer ?? null,
		e.id
	]);
}
function resolveConnectionPrincipal(e, t, n = contextStorage.getStore()) {
	return t.principalType === `user` && holdCallerIdentity(e, n), resolveConnectionPrincipalFromAuth(e, t, n?.get(AuthKey), n);
}
function resolveConnectionPrincipalFromAuth(e, t, n, r) {
	if (t.principalType === `app`) return { type: `app` };
	if (n == null || n.principalType !== `user`) throw new ConnectionAuthorizationFailedError(e, {
		message: buildUserPrincipalRequiredMessage(e, t, r, n),
		reason: `principal_required`,
		retryable: !1
	});
	return t.vercelConnect !== void 0 && isVercelDevelopmentUser(n) ? {
		attributes: n.attributes,
		id: n.subject ?? n.principalId,
		type: `user`
	} : {
		attributes: n.attributes,
		id: n.principalId,
		issuer: n.issuer ?? n.authenticator,
		type: `user`
	};
}
function isVercelDevelopmentUser(e) {
	return e.authenticator === `oidc` && isVercelOidcIssuer(e.issuer) && e.attributes.environment === `development` && e.subject === e.attributes.user_id;
}
function buildUserPrincipalRequiredMessage(e, t, n, r) {
	let i;
	return i = n === void 0 ? `it was invoked outside an eve context, so no authenticated user can be resolved.` : r == null ? `the active session has no authenticated user.` : t.vercelConnect !== void 0 && r.authenticator === `local-dev` ? `the local request fell back to local development access instead of authenticating a Vercel user. Ensure this directory is linked and the Vercel CLI can mint a Vercel OIDC token, then retry.` : `the active session is scoped to "${r.principalType}", not an authenticated user.`, `Connection "${e}" is user-scoped, but ${i} User-scoped connections require route auth that resolves an authenticated user. If this connection should use credentials shared by the agent instead, configure it as an app-scoped connection.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/authorization-tokens.js
const ConnectionAuthorizationTokensKey = new ContextKey(`eve.connectionAuthorizationTokens`);
function readCachedToken(e, t, n) {
	let r = e.get(ConnectionAuthorizationTokensKey)?.[t]?.[n];
	if (r !== void 0 && !(r.expiresAt !== void 0 && r.expiresAt <= Date.now())) return r;
}
function writeCachedToken(e, t, n, r) {
	let i = e.get(ConnectionAuthorizationTokensKey) ?? {};
	let a = i[t] ?? {};
	asContainer(e).setVirtualContext(ConnectionAuthorizationTokensKey, {
		...i,
		[t]: {
			...a,
			[n]: r
		}
	});
}
function evictCachedToken(e, t, n) {
	let r = e.get(ConnectionAuthorizationTokensKey);
	let i = r?.[t];
	if (r === void 0 || i === void 0 || i[n] === void 0) return;
	let { [n]: a, ...o } = i;
	asContainer(e).setVirtualContext(ConnectionAuthorizationTokensKey, {
		...r,
		[t]: o
	});
}
function asContainer(e) {
	return e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/scoped-authorization.js
const LOCAL_HTTP_VERCEL_CONNECT_HOSTNAMES = /* @__PURE__ */ new Set([`127.0.0.1`, `[::1]`]);
function createAuthorizationExecution(e = {}) {
	let t = /* @__PURE__ */ new Set();
	async function complete(n) {
		let r = n.instanceId ?? n.scope;
		!t.has(r) && await (e.completeAuthorization ?? completeScopedAuthorization)(n) && t.add(r);
	}
	function requireAuth(e, n) {
		throw new ScopedAuthorizationRequiredError(e, t.has(e.instanceId ?? e.scope), n);
	}
	return {
		complete,
		isJustAuthorized(e) {
			return t.has(e.instanceId ?? e.scope);
		},
		async getToken(e) {
			await complete(e);
			try {
				return await resolveScopedToken(e);
			} catch (t) {
				if (!isConnectionAuthorizationRequiredError(t)) throw t;
				return requireAuth(e, t);
			}
		},
		async getResponderToken(e) {
			try {
				return await resolveScopedToken(e);
			} catch (t) {
				throw isConnectionAuthorizationRequiredError(t) ? new ConnectionAuthorizationFailedError(e.scope, {
					message: `The approver of "${e.scope}" has no token for this provider, and an approved call doesn't start a sign-in.`,
					reason: `approver_authorization_required`,
					retryable: !1
				}) : t;
			}
		},
		requireAuth,
		async handleError(e, n) {
			return n !== void 0 && isConnectionAuthorizationRequiredError(e) ? await handleAuthorizationError(new ScopedAuthorizationRequiredError(n, t.has(n.instanceId ?? n.scope), e), { evictToken: !1 }) : await handleAuthorizationError(e);
		},
		run: executeWithAuthorization
	};
}
var ScopedAuthorizationRequiredError = class extends Error {
	scoped;
	justAuthorized;
	constructor(e, t, n) {
		super(`Authorization required.`, { cause: n }), this.name = `ScopedAuthorizationRequiredError`, this.scoped = e, this.justAuthorized = t;
	}
};
function isScopedAuthorizationRequiredError(e) {
	return e instanceof Error && e.name === `ScopedAuthorizationRequiredError`;
}
async function handleAuthorizationError(e, t = { evictToken: !0 }) {
	if (!isScopedAuthorizationRequiredError(e)) throw e;
	let { scoped: n } = e;
	if (e.justAuthorized) throw new ConnectionAuthorizationFailedError(n.scope, {
		message: `Authorization for "${n.scope}" failed: the service rejected the token immediately after authorization.`,
		reason: `token_rejected_after_authorization`,
		retryable: !1
	});
	let r = contextStorage.getStore();
	if (r !== void 0 && readSessionSchedule(r) !== void 0 && supportsInteractiveAuthorization(n.authorization)) throw new ConnectionAuthorizationFailedError(n.scope, {
		message: `Sign-in to "${n.scope}" isn't asked for in a scheduled run. Tell the user this action needs ${n.scope} access, and that they can sign in by asking for it in a conversation.`,
		reason: `sign_in_unavailable`,
		retryable: !1
	});
	let i = liveProjection();
	let a = i === void 0 ? void 0 : terminalSignInFailure(i, {
		grant: n.authorization.vercelConnect?.connector,
		name: n.scope,
		principal: resolveScopedPrincipal(n)
	});
	if (a !== void 0 && a.outcome !== `failed`) throw new ConnectionAuthorizationFailedError(n.scope, {
		message: `Sign-in to "${n.scope}" ended without being completed in this turn, so it won't be asked for again. Tell the user this action needs ${n.scope} access, and that they can ask for it again to sign in.`,
		reason: `sign_in_cancelled`,
		retryable: !1
	});
	if (a !== void 0) throw new ConnectionAuthorizationFailedError(n.scope, {
		message: `Authorization for "${n.scope}" already failed in this turn and can't be retried${a.reason === void 0 ? `.` : `: ${a.reason}`}`,
		...a.reason !== void 0 && { reason: a.reason },
		retryable: !1
	});
	t.evictToken && await evictScopedToken(n);
	let o = await startScopedAuthorization(n);
	if (o !== void 0) return o;
	throw supportsInteractiveAuthorization(n.authorization) ? new ConnectionAuthorizationFailedError(n.scope, {
		message: `Authorization for "${n.scope}" requires sign-in, but no authorization callback URL could be minted for this run (missing session context).`,
		reason: `authorization_callback_unavailable`,
		retryable: !1
	}) : e.cause ?? new ConnectionAuthorizationRequiredError(n.scope);
}
function executeWithAuthorization(e) {
	try {
		let t = e();
		return isAsyncIterable(t) ? handleIterable(t) : Promise.resolve(t).catch(handleAuthorizationError);
	} catch (e) {
		return handleAuthorizationError(e);
	}
}
async function* handleIterable(e) {
	try {
		for await (let t of e) yield t;
	} catch (e) {
		yield await handleAuthorizationError(e);
	}
}
async function resolveScopedToken(e) {
	let { scope: t, authorization: n, connection: r } = e;
	let i = e.instanceId ?? t;
	let a = contextStorage.getStore();
	let o = resolveScopedPrincipal(e, a);
	if (a === void 0) return await n.getToken({
		connection: r,
		principal: o
	});
	let s = principalKey(o);
	let c = readCachedToken(a, i, s);
	if (c !== void 0) return c;
	let l = await n.getToken({
		connection: r,
		principal: o
	});
	return writeCachedToken(a, i, s, l), l;
}
async function evictScopedToken(e) {
	let { scope: t, authorization: n, connection: r } = e;
	let i = e.instanceId ?? t;
	let a = contextStorage.getStore();
	if (a === void 0) return;
	let o;
	try {
		o = resolveScopedPrincipal(e, a), evictCachedToken(a, i, principalKey(o));
	} catch {
		return;
	}
	try {
		await n.evict?.({
			connection: r,
			principal: o
		});
	} catch {}
}
async function completeScopedAuthorization(e) {
	let { scope: t, authorization: n, connection: r } = e;
	if (!supportsInteractiveAuthorization(n)) return !1;
	let i = consumeAuthorizationResult(t, e.instanceId);
	if (i === void 0) return !1;
	let a = loadContext();
	let o = a.get(SignInCompletedKey);
	try {
		if (i.callback.params.error === "access_denied") throw new ConnectionAuthorizationFailedError(t, {
			message: `Sign-in to "${t}" was declined.`,
			reason: "access_denied",
			retryable: !1
		});
		let o = n;
		let s = i.principal ?? resolveScopedPrincipal(e, a);
		let c = await o.completeAuthorization({
			callbackUrl: i.hookUrl,
			connection: r,
			principal: s,
			resume: i.resume,
			callback: i.callback
		});
		writeCachedToken(a, e.instanceId ?? t, principalKey(s), c);
	} catch (e) {
		throw await o?.(i, toError(e)), e;
	}
	return await o?.(i), !0;
}
async function startScopedAuthorization(e) {
	let { scope: t, authorization: n, connection: r } = e;
	if (!supportsInteractiveAuthorization(n)) return;
	let i = createAuthorizationAttempt(t);
	if (i === void 0) return;
	let a = n;
	let o = resolveScopedPrincipal(e);
	let s = e.boundResponder ?? contextStorage.getStore()?.get(AuthKey) ?? void 0;
	let c = resolveAuthorizationCallbackUrl({
		authorization: n,
		callbackUrl: i.hookUrl
	});
	let { challenge: l, resume: u } = await a.startAuthorization({
		callbackUrl: c,
		connection: r,
		principal: o
	});
	return requestAuthorization([{
		attemptId: i.attemptId,
		challenge: stampChallengeDisplayName(l, n),
		grant: n.vercelConnect?.connector,
		hookUrl: c,
		instanceId: e.instanceId,
		name: t,
		principal: o,
		principalId: s?.principalId,
		requester: s,
		resume: u
	}]);
}
function resolveScopedPrincipal(e, t) {
	return e.boundResponder === void 0 ? resolveConnectionPrincipal(e.scope, e.authorization, t) : resolveConnectionPrincipalFromAuth(e.scope, e.authorization, e.boundResponder, t);
}
function resolveAuthorizationCallbackUrl(e) {
	return e.authorization.vercelConnect === void 0 ? e.callbackUrl : vercelConnectCallbackUrl(e.callbackUrl);
}
function vercelConnectCallbackUrl(e) {
	let t;
	try {
		t = new URL(e);
	} catch {
		return e;
	}
	return t.protocol !== `http:` || !LOCAL_HTTP_VERCEL_CONNECT_HOSTNAMES.has(t.hostname) ? e : (t.hostname = `localhost`, t.toString());
}
function stampChallengeDisplayName(e, t) {
	let n = t.displayName ?? e.displayName;
	return n === e.displayName ? e : {
		...e,
		displayName: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/authorization-context.js
function createAuthorizationContext(e) {
	let t = createAuthorizationExecution(e);
	let n = {};
	let resolve = (t, r) => buildInlineScopedAuthorization({
		...e,
		inlineAuthState: n,
		provider: t,
		options: r
	});
	let hold = (t) => {
		e.boundResponder === void 0 && t.authorization.principalType === `user` && holdCallerIdentity(t.scope, void 0, `tool "${e.scope}"`);
	};
	return {
		async getToken(e, n) {
			if (e === void 0) throw missingProviderError(`ctx.getToken`);
			let r = resolve(e, n);
			return hold(r), await t.getToken(r);
		},
		async getResponderToken(e, n, r) {
			return await t.getResponderToken({
				...resolve(n, r),
				boundResponder: e
			});
		},
		requireAuth(e, n) {
			if (e === void 0) throw missingProviderError(`ctx.requireAuth`);
			let r = resolve(e, n);
			return hold(r), t.requireAuth(r);
		},
		run: t.run
	};
}
function buildInlineScopedAuthorization(e) {
	let t = normalizeInlineProvider(e.provider, e.options);
	return {
		authorization: t,
		boundResponder: e.boundResponder,
		connection: e.options?.connection ?? { url: `` },
		scope: e.options?.authKey === void 0 ? deriveInlineScope({
			authorization: t,
			inlineAuthState: e.inlineAuthState,
			provider: e.provider,
			scope: e.scope
		}) : assertAuthKey(e.options.authKey, `ctx.getToken: The "options.authKey" field`)
	};
}
function normalizeInlineProvider(e, t) {
	let n = normalizeAuthorizationSpec(e, `ctx.getToken:`, `provider`);
	if (t?.displayName === void 0) return n;
	if (t.displayName.length === 0) throw Error(`ctx.getToken: The "options.displayName" field must be a non-empty string.`);
	return {
		...n,
		displayName: t.displayName
	};
}
function deriveInlineScope(e) {
	let t = e.authorization.vercelConnect?.connector;
	if (t !== void 0) return `${e.scope}__${sanitizeScopeSegment(t)}`;
	if (e.inlineAuthState.anonymousProvider === void 0) e.inlineAuthState.anonymousProvider = e.provider;
	else if (e.inlineAuthState.anonymousProvider !== e.provider) throw Error(`ctx.getToken: Multiple inline auth providers without provider metadata need explicit auth keys. Pass options.authKey for each provider, for example ctx.getToken(auth, { authKey: "github" }).`);
	return `${e.scope}__inline_auth`;
}
function missingProviderError(e) {
	return Error(`${e}: Pass an auth provider, for example ${e}(connect("github/myagent")).`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/approval-scope.js
const APPROVAL = Symbol(`eve.connectionApproval`);
function withConnectionApproval(e, t, n) {
	if (t === void 0) return n();
	let r = createAuthorizationContext({ scope: e });
	let i = { responder: {
		...t,
		getToken: (e, n) => r.getResponderToken(t, e, n)
	} };
	return withContextScopeValue(APPROVAL, i, n);
}
function buildConnectionCallbackContext() {
	let e = contextScopeValue(APPROVAL);
	return {
		...buildCallbackContext(),
		...e !== void 0 && { approval: e }
	};
}
function encodeForwardedPrincipalHeader(e, t) {
	let n = Buffer.from(JSON.stringify(e), `utf8`).toString(`base64url`);
	if (n.length > 16384) throw Error(`Connection "${t}" cannot forward the caller's principal: the eve-forwarded-principal header would be ${n.length} bytes, over the 16384-byte limit. Trim the principal's attributes.`);
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/mcp.js
function isObject(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
const MAX_MCP_TRACE_REQUEST_BYTES = 1048576;
const MAX_MCP_TRACE_CONTEXT_BYTES = 8192;
const utf8Encoder = new TextEncoder();
const traceContextSetter = { set(e, t, n) {
	e[t] = n;
} };
function createMcpTraceFetch$1(e) {
	let t = e.fetcher ?? ((e, t) => globalThis.fetch(e, t));
	let n = e.getActiveContext ?? (() => context.active());
	let r = e.injectContext ?? injectOpenTelemetryTraceContext;
	return async (i, a) => {
		let o = readJsonRpcRequest(a?.body);
		if (o === void 0) return await t(i, a);
		let s = n();
		let c = injectMcpTraceContext(o, s, r, e.filterCarrier);
		let l = o.method === `tools/call` || (o.method === `tools/list` || o.method === `events/list`) && activeTraceOperation(s)?.type === `mcp`;
		l && activeTraceOperation(s)?.mcp?.update(mcpRequestMetadata({
			connectionName: e.connectionName,
			message: o,
			params: isObject(o.params) ? o.params : {},
			protocolVersion: headerValue(a?.headers, `mcp-protocol-version`) ?? e.getProtocolVersion()
		}));
		let u = await t(i, c === void 0 ? a : {
			...a,
			body: JSON.stringify(c)
		});
		if (l) {
			let e = u.headers.get(`mcp-session-id`);
			e !== null && activeTraceOperation(s)?.mcp?.update({ sessionId: truncateTelemetryText(e, 512) });
		}
		return u;
	};
}
function injectMcpTraceContext(e, t, n = injectOpenTelemetryTraceContext, r) {
	if (!withinTraceRequestLimit(JSON.stringify(e)) || e.params !== void 0 && !isObject(e.params)) return;
	let i = {};
	if (n(t, i), !withinTraceContextLimit(i)) return;
	r?.(i);
	let a = isObject(e.params) ? e.params : {};
	let o = isObject(a._meta) ? a._meta : {};
	return {
		...e,
		params: {
			...a,
			_meta: {
				...o,
				...i
			}
		}
	};
}
const noContent = () => void 0;
const MCP_SERIALIZER = {
	json: contentAttribute,
	text: noContent,
	inputMessages: noContent,
	instructions: noContent,
	toolDefinitions: noContent,
	outputMessages: noContent,
	toolResults: noContent
};
function createMcpTracing() {
	let e = otelTelemetry({
		tracerName: `eve.mcp`,
		mapping: eveOutputMapping()
	});
	function start(t) {
		let n = e.startSpan({
			type: `mcp`,
			operationId: `${t.connectionName}:${t.method}`,
			name: t.method === `tools/call` ? `tools/call ${t.toolName ?? `unknown`}` : t.method,
			kind: `CLIENT`,
			parent: trace.getSpan(t.executionContext)?.spanContext(),
			attributes: {
				"agent.connection.name": t.connectionName,
				"mcp.method.name": t.method,
				"network.protocol.name": `http`,
				"network.transport": `tcp`,
				"mcp.protocol.version": t.protocolVersion,
				"gen_ai.operation.name": t.method === `tools/call` ? `execute_tool` : void 0,
				"gen_ai.tool.name": t.toolName
			}
		}, { context: t.executionContext });
		let r = mcpLifecycle({
			serializer: MCP_SERIALIZER,
			...t.capture,
			write(e) {
				for (let [t, r] of Object.entries(e)) r !== void 0 && n.setAttribute(t, r);
			},
			error: n.fail
		});
		return {
			...r,
			end: n.end,
			run(i) {
				return e.run({
					type: `mcp`,
					reference: n.reference,
					capture: t.capture,
					mcp: r
				}, i, t.executionContext);
			}
		};
	}
	return {
		async list(e) {
			let t = context.active();
			let n = start({
				method: e.method ?? `tools/list`,
				connectionName: e.connectionName,
				protocolVersion: e.protocolVersion,
				executionContext: t,
				capture: activeTraceOperation()?.capture ?? {
					emit: !0,
					recordInputs: !1,
					recordOutputs: !1
				}
			});
			try {
				return await n.run(async () => {
					try {
						return await e.execute();
					} catch (e) {
						let t = jsonRpcErrorCode(e);
						throw t !== void 0 && n.update({ statusCode: t }), n.error(e, errorType(e, t)), e;
					}
				});
			} finally {
				n.end();
			}
		},
		async call(e) {
			let t = context.active();
			let n = activeTraceOperation();
			if (n?.type === `tool` && n.mcp !== void 0) return n.mcp.update({
				...e,
				method: `tools/call`
			}), await runMcpToolCall(e, void 0);
			let r = start({
				method: `tools/call`,
				connectionName: e.connectionName,
				toolName: truncateTelemetryText(e.toolName, 128),
				protocolVersion: e.protocolVersion,
				executionContext: t,
				capture: n?.capture ?? {
					emit: !0,
					recordInputs: !1,
					recordOutputs: !1
				}
			});
			try {
				return await r.run(() => runMcpToolCall(e, r));
			} finally {
				r.end();
			}
		}
	};
}
function runMcpToolCall(e, t) {
	return t !== void 0 && t.arguments(e.arguments), e.execute().then((e) => (isToolErrorResult(e) && activeTraceOperation()?.mcp?.error(void 0, `tool_error`), t !== void 0 && t.result(e), e)).catch((e) => {
		let n = jsonRpcErrorCode(e);
		throw n !== void 0 && activeTraceOperation()?.mcp?.update({ statusCode: n }), t !== void 0 && activeTraceOperation()?.mcp?.error(e, errorType(e, n)), e;
	});
}
function mcpRequestMetadata(e) {
	let t = e.method ?? e.message?.method;
	let n = e.params ?? (isObject(e.message?.params) ? e.message.params : {});
	let r = e.toolName ?? (typeof n.name == `string` ? n.name : void 0);
	let i = e.message?.id;
	let a = n._meta;
	let o = e.protocolVersion ?? (isObject(a) && typeof a[`io.modelcontextprotocol/protocolVersion`] == `string` ? a[`io.modelcontextprotocol/protocolVersion`] : void 0);
	return {
		connectionName: e.connectionName,
		method: t ?? `unknown`,
		toolName: r,
		protocolVersion: o,
		requestId: typeof i == `number` || typeof i == `string` ? String(i) : void 0
	};
}
function injectOpenTelemetryTraceContext(e, t) {
	propagation.inject(e, t, traceContextSetter);
}
function readJsonRpcRequest(e) {
	if (typeof e == `string` && withinTraceRequestLimit(e)) try {
		let t = JSON.parse(e);
		return isObject(t) && typeof t.method == `string` ? t : void 0;
	} catch {
		return;
	}
}
function withinTraceRequestLimit(e) {
	return e.length <= MAX_MCP_TRACE_REQUEST_BYTES && utf8Encoder.encode(e).byteLength <= MAX_MCP_TRACE_REQUEST_BYTES;
}
function withinTraceContextLimit(e) {
	let t = 0;
	for (let [n, r] of Object.entries(e)) if (n.length + r.length > MAX_MCP_TRACE_CONTEXT_BYTES || (t += utf8Encoder.encode(n).byteLength + utf8Encoder.encode(r).byteLength + 2, t > MAX_MCP_TRACE_CONTEXT_BYTES)) return !1;
	return t > 0;
}
function headerValue(e, t) {
	if (e !== void 0) try {
		return new Headers(e).get(t) ?? void 0;
	} catch {
		return;
	}
}
function isToolErrorResult(e) {
	return isObject(e) && e.isError === !0;
}
function jsonRpcErrorCode(e) {
	if (!isObject(e)) return;
	let t = e.code;
	return typeof t == `number` || typeof t == `string` ? String(t) : void 0;
}
function errorType(e, t) {
	return t === void 0 ? e instanceof Error ? e.name || `Error` : void 0 : t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/mcp-tracing.js
function createMcpTraceFetch(e) {
	return createMcpTraceFetch$1({
		...e,
		filterCarrier: stripEveTraceBaggage
	});
}
function withMcpToolsListSpan(e) {
	return createMcpTracing().list(e);
}
function withMcpToolCallSpan(e) {
	return createMcpTracing().call(e);
}
function principalOf$1(e) {
	return e == null || e.principalType === `anonymous` ? "anonymous" : JSON.stringify([
		e.authenticator,
		e.issuer ?? null,
		e.principalType,
		e.principalId
	]);
}
function resolveTurnPrincipal(e, t) {
	let n = e?.delivery?.auth;
	return principalOf$1(n === void 0 ? t[AuthKey.name] : n);
}
function continueTurnAuth(e, t, n) {
	if (t === void 0) return e;
	if (principalOf$1(t) !== principalOf$1(e)) {
		if (n === `retain`) return e;
		throw Error(`A message from another principal cannot join a running turn. Gate it with isSteeringDelivery so it waits for the turn to end.`);
	}
	return t;
}
function steeredByAfter(e, t, n) {
	return n == null || principalOf$1(n) === `anonymous` ? e : principalOf$1(n) === principalOf$1(t) ? [] : e.some((e) => principalOf$1(e) === principalOf$1(n)) ? e : [...e, n];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/events/path.js
function connectionEventRoute(e) {
	return `/eve/v1/hooks/${encodeURIComponent(e)}`;
}
function connectionEventDestination(e) {
	return joinEveRoutePath(normalizePublicRoutePrefix(process.env["EVE_PUBLIC_ROUTE_PREFIX"]) ?? ``, connectionEventRoute(e));
}
function connectionEventHookToken(e) {
	return `eve:connection-event:${e}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/events/state.js
function sameEventOwner(e, t) {
	return e.connectionName === t.connectionName && e.instanceId === t.instanceId && e.connector === t.connector && e.principalKey === t.principalKey && e.executionPrincipal === t.executionPrincipal;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/events/actions.js
const GET = `events_get_subscription`;
const STOP = `events_unsubscribe`;
const PREFIX = `events_subscribe_`;
const MIN_TTL_MS = 12e4;
const MAX_TTL_MS = 31536e6;
const SUBSCRIBE_INPUT_SCHEMA = defineJsonSchema(parseJsonObject(subscribeInputSchema()));
function isEventAction(e) {
	return e === GET || e === STOP || e.startsWith(PREFIX);
}
var ConnectionEventActions = class {
	connection;
	events;
	headers;
	transportFetch;
	constructor(e, t, n, r) {
		this.connection = e, this.events = t, this.headers = n, this.transportFetch = r;
	}
	scope(e) {
		let t = contextStorage.getStore();
		if (t === void 0) throw Error(`Event subscriptions require an active eve session.`);
		if (t.get(SessionAgentKey)?.nodeId !== void 0) throw Error(`Experimental event subscriptions currently require a root-agent connection.`);
		e?.hold !== !1 && holdCallerIdentity(this.connection.connectionName, t);
		let { authorization: n, backend: r, connector: i } = this.events;
		let a = resolveConnectionPrincipal(this.connection.connectionName, n, t);
		let o = t.require(SessionIdKey);
		let s = principalKey(a);
		let c = principalOf$1(t.get(AuthKey));
		return {
			ctx: t,
			principal: a,
			sessionId: o,
			owner: s,
			executionPrincipal: c,
			caller: {
				connectionName: this.connection.connectionName,
				instanceId: this.connection.instanceId,
				connector: i,
				principalKey: s,
				executionPrincipal: c
			},
			backend: r,
			connector: i
		};
	}
	async withClient(e, t) {
		this.scope(t);
		let n;
		let r = {
			transport: {
				type: `http`,
				fetch: createMcpTraceFetch({
					connectionName: this.connection.connectionName,
					fetcher: this.transportFetch,
					getProtocolVersion: () => n?.initializeResult?.protocolVersion
				}),
				url: this.connection.url,
				headers: await this.headers()
			},
			protocolVersionDiscovery: this.connection.protocolVersionDiscovery
		};
		let { createMCPClient: i } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/mcp/index.js");
		n = await i(r);
		try {
			return await e(n.experimental_events);
		} finally {
			await n.close();
		}
	}
	async catalog(e) {
		let t = [];
		let n = /* @__PURE__ */ new Set();
		let r;
		let i = 0;
		for (let a = 0; a < 20; a++) {
			let a = await withConnectionEventSpan({
				ctx: this.scope({ hold: !1 }).ctx,
				connectionName: this.connection.connectionName,
				operation: `catalog`
			}, () => createMcpTracing().list({
				connectionName: this.connection.connectionName,
				method: `events/list`,
				execute: () => e.list({
					params: { cursor: r },
					options: { timeout: 15e3 }
				})
			}));
			if (i += a.events.length, i > 1e3) throw Error(`MCP event catalog exceeds the 1000-event limit.`);
			if (t.push(...a.events.filter((e) => e.delivery.includes(`webhook`))), r = a.nextCursor ?? void 0, r === void 0) return t;
			if (n.has(r)) throw Error(`MCP event catalog returned a repeated cursor.`);
			n.add(r);
		}
		throw Error(`MCP event catalog exceeds the 20-page limit.`);
	}
	async metadata() {
		return this.withClient(async (e) => [...(await this.catalog(e)).map((e) => ({
			name: actionName(e.name),
			description: `Watch ${e.name}. ${e.description ?? ``} Events reach this connection's authored callback for ttlMs milliseconds or until stopped. Set ttlMs to null to watch indefinitely. Watching the same event with the same arguments again returns the existing watch.`,
			inputSchema: subscribeInputSchema(e.inputSchema)
		})), ...managementMetadata()], { hold: !1 });
	}
	recoveryMetadata() {
		return this.scope({ hold: !1 }), managementMetadata().map((e) => ({
			...e,
			description: `MCP discovery is unavailable. ${e.description}`
		}));
	}
	async execute(e, t, n) {
		let r = parseJsonObject(t);
		let { ctx: i, principal: a, backend: o, sessionId: s, owner: c, executionPrincipal: l, caller: u } = this.scope();
		let d = installedDurableHost()?.connectionEvents;
		if (d === void 0) throw Error(`This host keeps no connection event subscriptions: watch events from a deployed agent.`);
		if (e === GET || e === STOP) {
			if (typeof r.id != `string`) throw Error(`id must be a subscription id.`);
			let t = r.id;
			let n = await d.find(t);
			if (n === void 0 || !sameEventOwner(n.owner, u)) throw Error(`Unknown subscription for this caller and account.`);
			if (e === STOP) {
				if (!await d.retire(t)) throw Error(`Unknown subscription for this caller and account.`);
				return {
					id: t,
					status: `stopping`
				};
			}
			if (n.subscription === void 0) return pendingResult(n.owner);
			let s = n.subscription.id;
			let c = await o.createAdapter({
				principal: a,
				connection: { url: this.connection.url },
				destination: { path: connectionEventDestination(this.connection.connectionName) }
			});
			return subscriptionResult(t, await withConnectionEventSpan({
				ctx: i,
				connectionName: this.connection.connectionName,
				bindingId: t,
				subscriptionId: s,
				operation: `get`
			}, () => c.getSubscription({
				id: s,
				options: { timeout: 3e4 }
			})));
		}
		return this.withClient(async (t) => {
			let a = (await this.catalog(t)).find((t) => actionName(t.name) === e);
			if (a === void 0) throw Error(`Unknown event subscription action for this account.`);
			let o = await SUBSCRIBE_INPUT_SCHEMA[`~standard`].validate(r);
			if (o.issues !== void 0) throw Error(`Invalid subscription input: ${o.issues.map(({ message: e }) => e).join(`; `)}`);
			let { arguments: f, ttlMs: p } = o.value;
			let m = typeof a.inputSchema == `boolean` ? { allOf: [a.inputSchema] } : a.inputSchema;
			let h = await toInputSchema(m)[`~standard`].validate(parseJsonObject(f));
			if (h.issues !== void 0) throw Error(`Event arguments do not match the authorized catalog schema.`);
			let g = parseJsonObject(h.value);
			let _ = createHash(`sha256`).update(canonicalJson$1([
				s,
				this.connection.instanceId,
				this.connection.connectionName,
				c,
				l,
				a.name,
				g
			])).digest(`hex`);
			let v = {
				...u,
				id: _,
				sessionId: s,
				auth: structuredClone(i.get(AuthKey) ?? null),
				traceSeed: i.get(SessionTraceSeedKey),
				request: {
					name: a.name,
					arguments: structuredClone(g),
					ttlMs: p,
					context: { eve: {
						version: 1,
						sessionId: s,
						bindingId: _
					} }
				}
			};
			let y = await d.start(v, requireCompiledBundle(i), n.abortSignal);
			return y === void 0 ? pendingResult(v) : subscriptionResult(_, y);
		});
	}
};
function subscribeInputSchema(e = { type: `object` }) {
	return {
		type: `object`,
		additionalProperties: !1,
		required: [`arguments`, `ttlMs`],
		properties: {
			arguments: e,
			ttlMs: {
				type: [`integer`, `null`],
				minimum: MIN_TTL_MS,
				maximum: MAX_TTL_MS,
				description: `How long to watch, in milliseconds (${MIN_TTL_MS} to ${MAX_TTL_MS}), or null until stopped`
			}
		}
	};
}
function subscriptionResult(e, t) {
	return {
		...t,
		id: e,
		subscriptionId: t.id
	};
}
function pendingResult(e) {
	let { name: t, arguments: n } = e.request;
	return {
		id: e.id,
		name: t,
		arguments: n,
		status: `pending`
	};
}
function canonicalJson$1(e) {
	return JSON.stringify(e, (e, t) => typeof t == `object` && t && !Array.isArray(t) ? Object.fromEntries(Object.entries(t).sort(([e], [t]) => e < t ? -1 : 1)) : t);
}
function actionName(e) {
	return `${PREFIX}${createHash(`sha256`).update(e).digest(`hex`).slice(0, 24)}`;
}
function managementMetadata() {
	return [GET, STOP].map((e) => ({
		name: e,
		description: e === GET ? `Get one of this caller's subscriptions, by the id its subscribe call returned, with Connect's current status.` : `Stop one of this caller's subscriptions, by the id its subscribe call returned. The watch then cancels upstream and ends; get reports it until it has.`,
		inputSchema: {
			type: `object`,
			properties: { id: { type: `string` } },
			required: [`id`],
			additionalProperties: !1
		}
	}));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/turn-principals.js
function readTurnPrincipals() {
	let e = contextStorage.getStore();
	let t = e?.get(SessionKey)?.auth;
	let n = identified(e?.get(AuthKey) ?? t?.current);
	if (n === void 0) return;
	let r = identified(e?.get(InitiatorAuthKey) ?? t?.initiator);
	return r === void 0 || r === n ? { current: n } : {
		current: n,
		initiator: r
	};
}
function identified(e) {
	return e == null || e.principalType === `anonymous` ? void 0 : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/provided-arguments.js
async function resolveProvidedArguments(e) {
	if (!isObject$1(e.args)) throw Error(`Tool "${e.toolName}" in connection "${e.connection.connectionName}" expected object arguments.`);
	let t = e.connection.toolCall?.providedArguments;
	if (t === void 0 || Object.keys(t).length === 0) return e.args;
	let n;
	let getContext = () => n ??= {
		...buildConnectionCallbackContext(),
		callId: e.callId,
		toolName: e.toolName
	};
	let r = {};
	for (let [n, i] of Object.entries(t)) {
		let t = typeof i == `function` ? await i(getContext()) : await i;
		try {
			r[n] = parseJsonValue(t);
		} catch {
			throw Error(`Connection "${e.connection.connectionName}" provided argument "${n}" must resolve to a JSON-serializable value.`);
		}
	}
	return {
		...e.args,
		...r
	};
}
function omitProvidedArgumentsFromSchema(e, t) {
	if (t.length === 0) return e;
	let n = new Set(t);
	let r = { ...e };
	return isObject$1(e.properties) && (r.properties = Object.fromEntries(Object.entries(e.properties).filter(([e]) => !n.has(e)))), Array.isArray(e.required) && (r.required = e.required.filter((e) => typeof e != `string` || !n.has(e))), r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/mcp-client.js
var McpUnauthorizedError = class extends Error {
	statusCode = 401;
	anonymous;
	constructor(e) {
		super(`MCP HTTP request failed (HTTP 401).`), this.anonymous = e;
	}
};
async function checkAuthorizationResponse(e, t) {
	if (e.status === 401) throw await e.body?.cancel(), new McpUnauthorizedError(t);
	return e;
}
var McpConnectionClient = class {
	#e;
	#t;
	#n;
	#r;
	#i;
	#a = !1;
	#o = !1;
	eventActions;
	constructor(e) {
		if (this.#i = e, e.experimental_events !== void 0) {
			let t = new ConnectionEventActions(e, e.experimental_events, () => resolveHeaders(e), this.#l());
			this.eventActions = {
				ownsName: isEventAction,
				recoveryMetadata: () => t.recoveryMetadata(),
				metadata: async () => {
					try {
						return await t.metadata();
					} catch (e) {
						return await this.#h(e);
					}
				},
				execute: async (e, n, r) => {
					try {
						return await t.execute(e, n, r);
					} catch (e) {
						return await this.#h(e);
					}
				}
			};
		}
	}
	get reusable() {
		return !this.#a;
	}
	async connect() {
		if (this.#t !== void 0) return this.#t;
		if (this.#e !== void 0) return this.#e;
		this.#e = this.#s();
		try {
			return this.#t = await this.#e, this.#t;
		} catch (e) {
			throw this.#e = void 0, e;
		}
	}
	async #s() {
		let { headers: e } = await resolveConnectionHeaders(this.#i, { anonymousWhenAuthorizationRequired: !0 });
		let t = this.#i.url;
		let n = createMcpTraceFetch({
			connectionName: this.#i.connectionName,
			fetcher: this.#c(Object.keys(e)),
			getProtocolVersion: () => this.#t?.initializeResult?.protocolVersion
		});
		let { createMCPClient: r } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/mcp/index.js");
		try {
			return await r({
				protocolVersionDiscovery: this.#i.protocolVersionDiscovery,
				transport: {
					fetch: n,
					headers: e,
					type: `http`,
					url: t
				}
			});
		} catch (i) {
			if (!isMcpHttpFallbackRetryableError(i)) throw i;
			return await r({
				protocolVersionDiscovery: this.#i.protocolVersionDiscovery,
				transport: {
					fetch: n,
					headers: e,
					type: `sse`,
					url: t
				}
			});
		}
	}
	#c(e) {
		let t = this.#l() ?? globalThis.fetch;
		return async (n, r) => {
			let resolve = () => resolveConnectionHeaders(this.#i, { anonymousWhenAuthorizationRequired: !0 });
			let send = async (i) => {
				let a = new Headers(r?.headers);
				for (let t of e) a.delete(t);
				for (let [e, t] of Object.entries(i.headers)) a.set(e, t);
				let o = await t(n, {
					...r,
					headers: a
				});
				return o.status === 404 && a.has(`mcp-session-id`) && (this.#o = !0), o;
			};
			let i = await resolve();
			let a = await send(i);
			if (a.status !== 401 || i.anonymous || this.#i.authorization === void 0 || r?.signal?.aborted) return await checkAuthorizationResponse(a, i.anonymous);
			await this.#_();
			let o = await resolve();
			return o.anonymous ? await checkAuthorizationResponse(a, !0) : (await a.body?.cancel(), await checkAuthorizationResponse(await send(o), o.anonymous));
		};
	}
	#l() {
		if (this.#i.forwardPrincipal !== !0) return;
		let e = this.#i.connectionName;
		return async (t, n) => {
			let r = readTurnPrincipals();
			if (r === void 0) return await globalThis.fetch(t, n);
			holdCallerIdentity(e);
			let i = new Headers(n?.headers);
			return i.set("eve-forwarded-principal", encodeForwardedPrincipalHeader(r, e)), await globalThis.fetch(t, {
				...n,
				headers: i,
				redirect: `error`
			});
		};
	}
	async getToolMetadata() {
		return (await this.#f()).metadata;
	}
	async executeTool(e, t, n) {
		this.#i.forwardPrincipal === !0 && holdCallerIdentity(this.#i.connectionName);
		let r;
		try {
			await this.#u(e);
			let i = await resolveProvidedArguments({
				args: t,
				callId: n.callId,
				connection: this.#i,
				toolName: e
			});
			r = await this.#d(async () => {
				let r = await this.#u(e);
				return await withMcpToolCallSpan({
					arguments: t,
					connectionName: this.#i.connectionName,
					execute: async () => await r(i, { abortSignal: n.abortSignal }),
					protocolVersion: this.#t?.initializeResult?.protocolVersion,
					toolName: e
				});
			});
		} catch (e) {
			return await this.#h(e, n.abortSignal?.aborted === !0);
		}
		return isMcpAuthChallengeResult(r) ? await this.#g(`the server asked for sign-in to call "${e}"`) : r;
	}
	async #u(e) {
		let t = (await this.#f()).tools[e]?.execute;
		if (t === void 0) throw Error(`Tool "${e}" not found in connection "${this.#i.connectionName}".`);
		return t;
	}
	async #d(e) {
		try {
			return await e();
		} catch (t) {
			if (!this.#o) throw t;
			return await this.close(), await e();
		}
	}
	async #f() {
		if (this.#r !== void 0) return this.#r;
		if (this.#n !== void 0) return this.#n;
		this.#n = this.#p();
		try {
			return this.#r = await this.#n, this.#r;
		} catch (e) {
			throw this.#n = void 0, e;
		}
	}
	async #p() {
		try {
			return await this.#d(() => this.#m());
		} catch (e) {
			return await this.#h(e);
		}
	}
	async #m() {
		let e = await this.connect();
		let t = await withMcpToolsListSpan({
			connectionName: this.#i.connectionName,
			execute: () => e.listTools(),
			protocolVersion: e.initializeResult?.protocolVersion
		});
		let n = Object.keys(this.#i.toolCall?.providedArguments ?? {});
		let r = t.tools.map((e) => ({
			...e,
			inputSchema: omitProvidedArgumentsFromSchema(e.inputSchema, n)
		}));
		let i = e.toolsFromDefinitions({ tools: r });
		return {
			metadata: r.map((e) => ({
				annotations: e.annotations,
				description: e.description ?? ``,
				inputSchema: e.inputSchema ?? {},
				name: e.name,
				outputSchema: `outputSchema` in e && e.outputSchema !== void 0 ? e.outputSchema : void 0
			})),
			tools: i
		};
	}
	async close() {
		try {
			await this.#t?.close();
		} finally {
			this.#t = void 0, this.#e = void 0, this.#n = void 0, this.#r = void 0, this.#a = !1, this.#o = !1;
		}
	}
	async #h(e, t = !1) {
		if (!isMcpAuthRequiredError(e)) throw (this.#o || !t && isTransportFailure(e)) && (this.#a = !0), e;
		let n = [...walkErrorChain(e)].find((e) => e instanceof McpUnauthorizedError)?.anonymous ?? (await resolveConnectionHeaders(this.#i, { anonymousWhenAuthorizationRequired: !0 })).anonymous;
		return await this.#g(n ? `the server requires sign-in` : `the server rejected the token`, n);
	}
	async #g(e, t) {
		throw t ??= (await resolveConnectionHeaders(this.#i, { anonymousWhenAuthorizationRequired: !0 })).anonymous, t || await this.#_(), await this.close(), new ConnectionAuthorizationRequiredError(this.#i.connectionName, { message: `Connection "${this.#i.connectionName}" requires authorization (${e}).` });
	}
	async #_() {
		let e = await resolveConnectionAuthorization(this.#i);
		e !== void 0 && await evictScopedToken({
			authorization: e,
			connection: { url: this.#i.url },
			instanceId: this.#i.instanceId,
			scope: this.#i.connectionName
		});
	}
};
function isMcpAuthRequiredError(e) {
	return readHttpStatus(e) === 401;
}
function isMcpAuthChallengeResult(e) {
	if (!isObject$1(e) || e.isError !== !0 || !isObject$1(e._meta)) return !1;
	let t = e._meta["mcp/www_authenticate"];
	return (typeof t == `string` || Array.isArray(t)) && t.length > 0;
}
function isTransportFailure(e) {
	return e instanceof TypeError || readHttpStatus(e) !== void 0 || isObject$1(e) && e.name === `MCPClientError` && e.code === void 0;
}
function isMcpHttpFallbackRetryableError(e) {
	let t = readHttpStatus(e);
	return t === 400 || t === 404 || t === 405;
}
function readHttpStatus(e) {
	for (let t of walkErrorChain(e)) {
		if (!isObject$1(t)) continue;
		let e = readStatusField(t);
		if (e !== void 0) return e;
		let n = t.response;
		if (isObject$1(n)) {
			let e = readStatusField(n);
			if (e !== void 0) return e;
		}
		if (typeof t.message == `string`) {
			let e = /\bHTTP\s+(\d{3})\b/u.exec(t.message);
			if (e?.[1] !== void 0) return Number(e[1]);
		}
	}
}
function readStatusField(e) {
	if (typeof e.status == `number`) return e.status;
	if (typeof e.statusCode == `number`) return e.statusCode;
}
function* walkErrorChain(e) {
	let t = e;
	let n = /* @__PURE__ */ new Set();
	for (; t != null && !n.has(t);) {
		if (n.add(t), yield t, !isObject$1(t) || !(`cause` in t)) return;
		t = t.cause;
	}
}
function passesToolFilter(e, t) {
	return t === void 0 ? !0 : `allow` in t ? e.some((e) => t.allow.includes(e)) : !e.some((e) => t.block.includes(e));
}
async function resolveHeaders(e) {
	let { headers: t } = await resolveConnectionHeaders(e, { anonymousWhenAuthorizationRequired: !1 });
	return t;
}
async function resolveConnectionHeaders(e, t) {
	let n = {};
	let r = !1;
	let i = await resolveConnectionAuthorization(e);
	if (i !== void 0) try {
		n.Authorization = `Bearer ${(await resolveToken(e, i)).token}`;
	} catch (e) {
		if (!t.anonymousWhenAuthorizationRequired || !isConnectionAuthorizationRequiredError(e)) throw e;
		r = !0;
	}
	if (e.headers !== void 0) {
		let t;
		let r = await resolveHeadersDefinition(e.headers, () => t ??= buildConnectionCallbackContext());
		for (let [t, a] of Object.entries(r)) {
			if (i !== void 0 && t.toLowerCase() === `authorization`) throw Error(`Connection "${e.connectionName}" headers must not include an "Authorization" key when "authorization" is also provided.`);
			n[t] = a;
		}
	}
	return {
		anonymous: r,
		headers: n
	};
}
async function resolveToken(e, t) {
	return await resolveScopedToken({
		authorization: t,
		connection: { url: e.url },
		instanceId: e.instanceId,
		scope: e.connectionName
	});
}
async function resolveHeadersDefinition(e, t) {
	if (typeof e == `function`) return { ...await e(t()) };
	let n = {};
	let r = Object.entries(e);
	for (let [e, i] of r) n[e] = await resolveHeaderValue(i, t);
	return n;
}
async function resolveHeaderValue(e, t) {
	return typeof e == `function` ? await e(t()) : await e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/connection-auth.js
const log$11 = createLogger(`framework.catalog-connections`);
async function completeConnectionSignIn(e, t) {
	assertPendingSignInInstance(t);
	let n = await interactiveAuthorization(t);
	let r = createAuthorizationExecution();
	n !== void 0 && await r.complete(n);
	let i = e.getClient(t.connectionName);
	return n !== void 0 && r.isJustAuthorized(n) && await i.close(), {
		auth: r,
		client: i,
		scoped: n
	};
}
async function listConnectionTools(e, { auth: t, client: n, scoped: r }) {
	let i = e.connectionName;
	try {
		return { tools: await listToolMetadata(e, n) };
	} catch (e) {
		return isConnectionAuthorizationRequiredError(e) ? r === void 0 ? { failure: `"${i}" requires authorization and cannot start interactive sign-in.` } : t.isJustAuthorized(r) ? { failure: `Authorization failed for "${i}": the service rejected the token immediately after authorization.` } : {
			authorization: r,
			error: e
		} : (log$11.warn(`failed to load connection tools`, {
			connection: i,
			error: e
		}), {
			...isConnectionAuthorizationFailedError(e) && { error: e },
			failure: listingFailureMessage(i, e)
		});
	}
}
const LISTING_TIMEOUT_MS = 1e4;
var ListingTimeoutError = class extends Error {};
async function listToolMetadata(e, t) {
	let { connectionName: n } = e;
	let r;
	let i = new Promise((e, t) => {
		r = setTimeout(() => {
			t(new ListingTimeoutError(`"${n}" did not list its tools within ${LISTING_TIMEOUT_MS / 1e3}s. Try again later.`));
		}, LISTING_TIMEOUT_MS);
	});
	try {
		return (await listConnectionMetadata(n, t, i)).filter((t) => passesToolFilter(t.operationId === void 0 ? [t.name] : [t.name, t.operationId], e.tools));
	} finally {
		clearTimeout(r);
	}
}
async function listConnectionMetadata(e, t, n) {
	let r = Promise.race([t.getToolMetadata(), n]);
	let i = t.eventActions;
	if (i === void 0) return r;
	let [a, o] = await Promise.allSettled([r, listEventActions(e, i, n)]);
	for (let e of [a, o]) if (e.status === `rejected` && isConnectionAuthorizationRequiredError(e.reason)) throw e.reason;
	let s = o.status === `fulfilled` ? o.value : [];
	if (a.status === `rejected`) {
		if (s.length > 0) return s;
		throw a.reason;
	}
	let c = a.value;
	if (c.some((e) => i.ownsName(e.name))) throw Error(`Remote tool names conflict with eve's event action namespace.`);
	return [...c, ...s];
}
async function listEventActions(e, t, n) {
	try {
		return await Promise.race([t.metadata(), n]);
	} catch (n) {
		if (isConnectionAuthorizationRequiredError(n)) throw n;
		return log$11.warn(`failed to discover connection events`, {
			connection: e,
			error: n
		}), t.recoveryMetadata();
	}
}
function listingFailureMessage(e, t) {
	return t instanceof ListingTimeoutError ? t.message : isConnectionAuthorizationFailedError(t) ? `Authorization failed for "${e}": ${t.message}` : `Failed to load tools for "${e}": ${toErrorMessage(t)}`;
}
async function interactiveAuthorization(e) {
	let t = await resolveConnectionAuthorization(e);
	if (t !== void 0 && supportsInteractiveAuthorization(t)) return {
		scope: e.connectionName,
		instanceId: e.instanceId,
		connection: { url: e.url ?? `` },
		authorization: t
	};
}
function assertPendingSignInInstance(e) {
	for (let t of getAuthorizationResults()) if (t.name === e.connectionName && t.instanceId !== void 0 && t.instanceId !== e.instanceId) throw Error(`Authorization for "${t.name}" cannot complete because its resolved connection changed while sign-in was pending. Sign in again with eve__tool({ name: "${t.name}" }).`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/connections/ownership.js
function connectionToolName(e, t) {
	return `${e}__${t}`;
}
function owningConnection(e, t) {
	for (let n of t) if (e === n || e.startsWith(connectionToolName(n, ``))) return n;
}
function assertNotConnectionOwned(e) {
	let t = owningConnection(e.name, e.connectionNames);
	if (t === void 0) return;
	let n = e.name === t ? `has the same name as connection "${t}"` : `starts with "${t}__", which belongs to connection "${t}"`;
	throw Error(`${e.subject} "${e.name}" ${n}. ${e.remedy}`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/rank.js
function rankCandidates(e, t) {
	let n = tokenize(e);
	let r = scoringTerms(n);
	return t.map((e) => ({
		candidate: e,
		...rankCandidate(n, r, e)
	})).filter((e) => e.score > 0).sort((e, t) => e.tier - t.tier || t.score - e.score || compareCodeUnits(e.candidate.connection?.name ?? ``, t.candidate.connection?.name ?? ``) || compareCodeUnits(e.candidate.name, t.candidate.name)).map((e) => e.candidate);
}
function isEmptyQuery(e) {
	return tokenize(e).length === 0;
}
function closestNames(e, t) {
	return isEmptyQuery(e) ? [] : rankCandidates(e, t).slice(0, 5).map((e) => e.name);
}
const Tier = {
	exact: 0,
	exactWithoutNamespace: 1,
	connection: 2,
	namePrefix: 3,
	keyword: 4
};
function rankCandidate(e, t, n) {
	let r = n.connection === void 0 ? n.name : connectionToolName(n.connection.name, n.name);
	let i = tokenize(r);
	let a = r.lastIndexOf(`__`);
	let o = tokenize(a < 0 ? r : r.slice(a + 2));
	let s = sameWords(i, e) ? Tier.exact : sameWords(o, e) ? Tier.exactWithoutNamespace : n.connection !== void 0 && startsWithWholeWords(tokenize(n.connection.name), e) ? Tier.connection : startsWithWords(i, e) || startsWithWords(o, e) ? Tier.namePrefix : Tier.keyword;
	return {
		score: scoreFields(t, candidateFields(n)),
		tier: s
	};
}
const FILLER_WORDS = /* @__PURE__ */ new Set([
	`a`,
	`an`,
	`and`,
	`for`,
	`in`,
	`is`,
	`me`,
	`my`,
	`of`,
	`or`,
	`please`,
	`the`,
	`to`,
	`with`
]);
function scoringTerms(e) {
	let t = e.filter((e) => e.length > 1 && !FILLER_WORDS.has(e));
	return t.length > 0 ? t : e;
}
function sameWords(e, t) {
	return e.length === t.length && startsWithWholeWords(e, t);
}
function startsWithWholeWords(e, t) {
	return t.length <= e.length && t.every((t, n) => e[n] === t);
}
function startsWithWords(e, t) {
	return t.length <= e.length && t.every((n, r) => r === t.length - 1 ? e[r].startsWith(n) : e[r] === n);
}
function candidateFields(e) {
	let t = isObject$1(e.inputSchema?.properties) ? Object.entries(e.inputSchema.properties) : [];
	let n = e.inputSchema ?? {};
	let r = t.flatMap(([, e]) => {
		for (let t of followRefs(n, e)) if (typeof t.description == `string`) return [t.description];
		return [];
	});
	return [
		[tokenize(e.name), 6],
		[tokenize(e.connection?.name ?? ``), 4],
		[t.flatMap(([e]) => tokenize(e)), 3],
		[proseWords(e.description), 2],
		[r.flatMap(proseWords), 1],
		[proseWords(e.connection?.description ?? ``), 1]
	];
}
function scoreFields(e, t) {
	let n = 0;
	for (let r of e) for (let [e, i] of t) e.some((e) => matchesWord(e, r)) && (n += i);
	return n;
}
function matchesWord(e, t) {
	return e.startsWith(t) || e.length >= 3 && t.startsWith(e);
}
function tokenize(e) {
	return e.replaceAll(/([A-Z]+)([A-Z][a-z])/gu, `$1 $2`).replaceAll(/([a-z0-9])([A-Z])/gu, `$1 $2`).toLowerCase().split(/[^a-z0-9]+/u).filter((e) => e !== ``);
}
function proseWords(e) {
	return tokenize(e).filter((e) => e.length > 1);
}
function compareCodeUnits(e, t) {
	return e < t ? -1 : +(e > t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/signature.js
const CONSTRAINT_KEYS = [
	`format`,
	`pattern`,
	`minimum`,
	`maximum`,
	`exclusiveMinimum`,
	`exclusiveMaximum`,
	`minLength`,
	`maxLength`,
	`minItems`,
	`maxItems`,
	`default`
];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/u;
function renderToolSignature(e) {
	let t = renderOutputType(e.outputSchema) ?? `unknown`;
	return capped((n) => renderSignature(e, n, t), 4e3);
}
function renderOutputType(e) {
	if (e === void 0) return;
	let t = capped((t) => renderSchema(e, t), 1e3);
	return t === `unknown` ? void 0 : t;
}
function isIdentifier(e) {
	return IDENTIFIER.test(e);
}
function capped(e, t) {
	let n = e(!0);
	if (n.length <= t) return n;
	let r = e(!1);
	return r.length > t ? `${r.slice(0, t - 3)}...` : r;
}
function renderSignature(e, t, n) {
	let r = e.inputSchema === void 0 ? `{}` : renderSchema(e.inputSchema, t);
	return `${e.name}(input: ${r}): Promise<${n}>`;
}
function renderSchema(e, t) {
	return renderType(e, {
		budget: { remaining: 1e3 },
		depth: 0,
		descriptions: t,
		refs: /* @__PURE__ */ new Set(),
		root: e
	});
}
function renderType(e, t) {
	if (e === !0 || !isObject$1(e) || t.depth > 6 || t.budget.remaining <= 0) return `unknown`;
	if (--t.budget.remaining, typeof e.$ref == `string`) {
		let n = resolveRef$1(e.$ref, t);
		return n === void 0 ? `unknown` : renderType(n, {
			...t,
			refs: /* @__PURE__ */ new Set([...t.refs, e.$ref])
		});
	}
	if (`const` in e) return literal(e.const);
	if (Array.isArray(e.enum)) return union(e.enum.map(literal));
	let n = Array.isArray(e.anyOf) ? e.anyOf : Array.isArray(e.oneOf) ? e.oneOf : void 0;
	if (n !== void 0) return union(n.map((e) => renderType(e, next(t))));
	if (Array.isArray(e.allOf)) return e.allOf.map((e) => wrap(renderType(e, next(t)))).join(` & `);
	let r = (Array.isArray(e.type) ? e.type : [e.type]).filter((e) => typeof e == `string`).map((n) => renderPrimitive(n, e, t));
	return r.length > 0 ? union(r) : isObject$1(e.properties) || e.additionalProperties !== void 0 ? renderObject(e, t) : e.items === void 0 ? `unknown` : renderPrimitive(`array`, e, t);
}
function renderPrimitive(e, t, n) {
	switch (e) {
		case `string`: return `string`;
		case `number`:
		case `integer`: return `number`;
		case `boolean`: return `boolean`;
		case `null`: return `null`;
		case `array`: return `${wrap(renderType(t.items, next(n)))}[]`;
		case `object`: return renderObject(t, n);
		default: return `unknown`;
	}
}
function renderObject(e, t) {
	let n = isObject$1(e.properties) ? e.properties : {};
	let r = new Set(Array.isArray(e.required) ? e.required.filter((e) => typeof e == `string`) : []);
	let i = Object.entries(n).map(([e, n]) => {
		let i = isIdentifier(e) ? e : JSON.stringify(e);
		let a = r.has(e) ? `` : `?`;
		let o = isObject$1(n) ? propertyComment(n, t) : ``;
		return `${i}${a}: ${renderType(n, next(t))}${o}`;
	});
	let a = e.additionalProperties;
	return isObject$1(a) && i.push(`[key: string]: ${renderType(a, next(t))}`), i.length === 0 ? a === !1 ? `{}` : `Record<string, unknown>` : `{ ${i.join(`; `)} }`;
}
function propertyComment(e, t) {
	let n = describedSchema(e, t);
	let r = [];
	let i = t.descriptions && typeof n.description == `string` ? n.description.replaceAll(/\s+/gu, ` `).replace(/[\s.;,:]+$/u, ``).trim() : ``;
	i.length > 0 && r.push(truncate$1(i));
	for (let e of CONSTRAINT_KEYS) n[e] !== void 0 && r.push(`${e}: ${JSON.stringify(n[e])}`);
	return r.length === 0 ? `` : ` /* ${r.join(`; `).replaceAll(`*/`, `* /`)} */`;
}
function describedSchema(e, t) {
	let n = e;
	let r = new Set(t.refs);
	for (let e = n.$ref; typeof e == `string` && !r.has(e); e = n.$ref) {
		r.add(e);
		let i = resolveRef$1(e, t);
		if (!isObject$1(i)) break;
		let { $ref: a, ...o } = n;
		n = {
			...i,
			...o
		};
	}
	return n;
}
function resolveRef$1(e, t) {
	if (t.refs.has(e) || !e.startsWith(`#`)) return;
	let n = t.root;
	for (let t of e.slice(1).split(`/`).filter(Boolean)) {
		if (!isObject$1(n)) return;
		n = n[t.replaceAll(`~1`, `/`).replaceAll(`~0`, `~`)];
	}
	return n;
}
function next(e) {
	return {
		...e,
		depth: e.depth + 1
	};
}
function literal(e) {
	return e === void 0 ? `undefined` : JSON.stringify(e);
}
function union(e) {
	let t = [...new Set(e)];
	return t.length === 0 ? `never` : t.join(` | `);
}
function wrap(e) {
	return e.includes(` | `) || e.includes(` & `) ? `(${e})` : e;
}
function truncate$1(e) {
	return e.length > 120 ? `${e.slice(0, 117)}...` : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/signatures.js
function entrySignature(e, t = serializeInputSchema(e.inputSchema)) {
	return renderToolSignature({
		inputSchema: t,
		name: e.name,
		outputSchema: serializeOutputSchema(e.outputSchema)
	});
}
function connectionToolSignature(e, t) {
	return renderToolSignature({
		inputSchema: t.inputSchema,
		name: connectionToolName(e.connectionName, t.name),
		outputSchema: t.outputSchema
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/approval/agent.js
function rank(e) {
	let t = normalizeApprovalStatus(e);
	let n = typeof t == `object` ? t.type : t;
	return n === `denied` ? 3 : n === `user-approval` ? 2 : +(n === `approved`);
}
function strictestApproval(e) {
	let combined = async (t) => {
		let n;
		for (let r of e) {
			let e = await r(t);
			if (rank(e) >= rank(n) && (n = e), rank(n) === 3) break;
		}
		return n;
	};
	return e.some(isSteeredApprovalPolicy) ? markSteeredApprovalPolicy(combined) : combined;
}
function withSteeredResponseGuard(e) {
	return (t) => {
		if ((contextStorage.getStore()?.get(SteeredByKey) ?? []).length > 0) {
			let e = requesterOnlyResponse(t);
			if (e.status === `rejected`) return e;
		}
		return e(t);
	};
}
function withAgentApproval(e, t) {
	if (e === void 0) return t;
	if (t === void 0) return e;
	let n = resolveApprovalPolicy(t);
	let r = strictestApproval([e, n]);
	if (typeof t == `function`) return r;
	let i = isSteeredApprovalPolicy(e) || isSteeredApprovalPolicy(n);
	return t.response === void 0 || !i ? {
		...t,
		request: r
	} : {
		...t,
		request: r,
		response: withSteeredResponseGuard(t.response)
	};
}
function withAgentApprovalOnEntries(e, t) {
	return t === void 0 ? new Map(e) : new Map([...e].map(([e, n]) => [e, n.frameworkAction !== void 0 || n.interactionOnly === !0 ? n : {
		...n,
		approval: withAgentApproval(t, n.approval)
	}]));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/tool-result.js
const MCP_CONTENT_TYPES = /* @__PURE__ */ new Set([
	`text`,
	`image`,
	`audio`,
	`resource`,
	`resource_link`
]);
function toConnectionToolResult(e, t, n) {
	if (e === `openapi` || !isObject$1(n)) return {
		ok: !0,
		value: n ?? null
	};
	let r = Array.isArray(n.content) ? n.content.filter(isMcpContentBlock) : [];
	let i = r.filter((e) => e.type === `text` && typeof e.text == `string`).map((e) => e.text).join(`
`);
	return n.isError === !0 ? {
		ok: !1,
		error: i.length > 0 ? i : n.structuredContent === void 0 ? `The tool reported an error.` : JSON.stringify(n.structuredContent)
	} : r.some((e) => e.type !== `text`) ? {
		ok: !0,
		value: r
	} : n.structuredContent === void 0 ? t.outputSchema === void 0 ? {
		ok: !0,
		value: parseJsonText(i)
	} : {
		ok: !0,
		value: i
	} : {
		ok: !0,
		value: n.structuredContent
	};
}
function connectionToolModelOutput(e) {
	return isMcpContentBlockList(e) ? {
		type: `content`,
		value: e.flatMap(toModelOutputParts)
	} : typeof e == `string` ? {
		type: `text`,
		value: e
	} : {
		type: `json`,
		value: e ?? null
	};
}
function parseJsonText(e) {
	let t = e.trim();
	if (!t.startsWith(`{`) && !t.startsWith(`[`)) return e;
	try {
		return JSON.parse(t);
	} catch {
		return e;
	}
}
function isMcpContentBlock(e) {
	return isObject$1(e) && typeof e.type == `string` && MCP_CONTENT_TYPES.has(e.type);
}
function isMcpContentBlockList(e) {
	return Array.isArray(e) && e.length > 0 && e.every(isMcpContentBlock) && e.some((e) => e.type !== `text`);
}
function toModelOutputParts(e) {
	switch (e.type) {
		case `text`: return typeof e.text == `string` ? [{
			type: `text`,
			text: e.text
		}] : [];
		case `image`:
		case `audio`: return typeof e.data == `string` && typeof e.mimeType == `string` ? [fileBlockPart(e.data, e.mimeType)] : [];
		case `resource`: {
			let t = isObject$1(e.resource) ? e.resource : {};
			let n = typeof t.uri == `string` ? t.uri : void 0;
			if (typeof t.blob == `string`) {
				let e = typeof t.mimeType == `string` ? t.mimeType : `application/octet-stream`;
				return [fileBlockPart(t.blob, e, n)];
			}
			return typeof t.text == `string` ? [{
				type: `text`,
				text: n === void 0 ? t.text : `${n}\n${t.text}`
			}] : [];
		}
		case `resource_link`: return [{
			type: `text`,
			text: `Resource link: ${typeof e.name == `string` ? e.name : `resource`} ${typeof e.uri == `string` ? e.uri : ``}`.trim()
		}];
		default: return [];
	}
}
function fileBlockPart(e, t, n) {
	let r = {
		type: `file`,
		data: {
			type: `data`,
			data: e
		},
		mediaType: t
	};
	return n !== void 0 && (r.filename = n), r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/connection-entry.js
const CONNECTION_CHANGED_MESSAGE = `The connection for this tool call changed or is unavailable. Request a new tool call and approval.`;
const ConnectionApprovalPinsKey = new ContextKey(`eve.connectionApprovalPins`);
function instanceKey(e) {
	return e.instanceId ?? ``;
}
function connectionEntry(e, t, n, r) {
	let i = `${displayProperName(t.connectionName)}: ${displayTitle(n)}`;
	let a = withAgentApproval(r, t.approval);
	return {
		approval: connectionApproval(e, t, n, a),
		deferred: !0,
		description: ``,
		execute: (r, i) => callConnectionTool(e, t, n, r, i, a !== void 0),
		inputSchema: refineJsonSchema({}, (r) => checkInput(e, t, n, r)),
		label: { start: () => i },
		name: connectionToolName(t.connectionName, n),
		toModelOutput: connectionModelOutput(t)
	};
}
function connectionModelOutput(e) {
	let t = e.toolCall?.toModelOutput;
	return t === void 0 ? connectionToolModelOutput : (e, n) => t(e, {
		...n,
		defaultModelOutput: connectionToolModelOutput
	});
}
function connectionSignInEntry(e, t) {
	let n = displayProperName(t.connectionName);
	let r = `Sign in to use the ${n} tools`;
	return {
		deferred: !0,
		description: t.description === `` ? `${r}.` : `${r}: ${t.description}`,
		execute: () => connect(e, t),
		inputSchema: defineJsonSchema({
			type: `object`,
			properties: {},
			additionalProperties: !1
		}),
		label: { start: () => `Sign in to ${n}` },
		name: t.connectionName
	};
}
async function connect(e, t) {
	let n = await completeConnectionSignIn(e, t);
	let r = await listConnectionTools(t, n);
	if (`failure` in r) throw Error(r.failure);
	if (`authorization` in r) return await n.auth.handleError(r.error, r.authorization);
	let i = displayProperName(t.connectionName);
	let a = `eve__search({ query: "${t.connectionName}__" })`;
	return n.scoped !== void 0 && n.auth.isJustAuthorized(n.scoped) ? `Signed in to ${i}. Find the ${i} tools with ${a}.` : `The ${i} tools are available. Find them with ${a}.`;
}
async function callConnectionTool(e, t, n, r, i, a) {
	releaseApprovalPin(i.toolCallId, t);
	let o = await runConnectionTool(e, t, n, r, i);
	return a && isAuthorizationSignal(o) && pinApprovedInstance(i.toolCallId, t), o;
}
async function runConnectionTool(e, t, n, r, i) {
	let a = await completeConnectionSignIn(e, t);
	let { auth: o, client: s, scoped: c } = a;
	let l = await listConnectionTools(t, a);
	if (`failure` in l) throw isConnectionAuthorizationFailedError(l.error) ? l.error : Error(l.failure);
	if (`authorization` in l) return await o.handleError(l.error, l.authorization);
	let u = s.eventActions?.ownsName(n) === !0;
	let d = withoutProvidedArguments(t, r, !u);
	let f = await checkCall(t, l.tools, n, d);
	if (`issues` in f) throw Error(issuesMessage(f.issues));
	let { input: p, tool: m } = f;
	let h;
	try {
		let approved = (e) => withConnectionApproval(t.connectionName, i.approval?.responder, e);
		if (u) return await approved(() => s.eventActions.execute(m.name, p, {
			abortSignal: i.abortSignal,
			callId: i.toolCallId
		}));
		h = await approved(() => executeWithDeadline(t.connectionName, s, m.name, p, i));
	} catch (e) {
		if (isConnectionAuthorizationRequiredError(e)) return await o.handleError(e, c);
		throw e;
	}
	let g = toConnectionToolResult(t.protocol, m, h);
	if (!g.ok) throw Error(g.error);
	return g.value;
}
const CALL_TIMEOUT_MS = 3e5;
async function executeWithDeadline(e, t, n, r, i) {
	let a = i.abortSignal;
	let o = new AbortController();
	let s = setTimeout(() => o.abort(), CALL_TIMEOUT_MS);
	try {
		return await t.executeTool(n, r, {
			abortSignal: a === void 0 ? o.signal : AbortSignal.any([a, o.signal]),
			callId: i.toolCallId
		});
	} catch (t) {
		throw !o.signal.aborted || a?.aborted === !0 ? t : Error(`"${e}" did not answer ${n} within ${CALL_TIMEOUT_MS / 6e4} minutes. It may still have run, so check before you retry.`, { cause: t });
	} finally {
		clearTimeout(s);
	}
}
async function checkInput(e, t, n, r) {
	let i = e.getClient(t.connectionName);
	let a;
	try {
		a = await listToolMetadata(t, i);
	} catch (e) {
		return isConnectionAuthorizationRequiredError(e) ? { value: r } : { issues: [{ message: listingFailureMessage(t.connectionName, e) }] };
	}
	let o = withoutProvidedArguments(t, r, i.eventActions?.ownsName(n) !== !0);
	let s = await checkCall(t, a, n, o);
	return `issues` in s ? { issues: s.issues } : { value: o };
}
function withoutProvidedArguments(e, t, n) {
	let r = n ? e.toolCall?.providedArguments ?? {} : {};
	return Object.fromEntries(Object.entries(isObject$1(t) ? t : {}).filter(([e]) => !Object.hasOwn(r, e)));
}
async function checkCall(e, t, n, r) {
	let i = t.find((e) => e.name === n);
	if (i === void 0) return { issues: [{ message: unknownToolMessage(e, n, t) }] };
	let a = await defineJsonSchema(i.inputSchema)[`~standard`].validate(r);
	return a.issues === void 0 ? {
		input: a.value,
		tool: i
	} : { issues: [...a.issues, { message: `Signature: ${connectionToolSignature(e, i)}` }] };
}
function issuesMessage(e) {
	return e.map(({ message: e, path: t = [] }) => {
		let n = t.map((e) => String(typeof e == `object` ? e.key : e)).join(`.`);
		return n.length > 0 ? `${n}: ${e}` : e;
	}).join(` `);
}
function unknownToolMessage(e, t, n) {
	let { connectionName: r } = e;
	let i = closestNames(t, n).map((e) => connectionToolName(r, e));
	return `Connection "${r}" has no tool named "${t}".${i.length > 0 ? ` Closest tools: ${i.join(`, `)}.` : ` Find its tools with eve__search({ query: "${r}__" }).`}`;
}
function connectionApproval(e, t, n, r) {
	if (r === void 0) return;
	let i = resolveApprovalPolicy(r);
	let request = async (r) => requestApproval(t, i, withToolAnnotations(r, await toolAnnotations(e, t, n)));
	if (typeof r == `function`) return request;
	let a = r.response;
	return {
		request,
		prompt: r.prompt,
		response: a === void 0 ? void 0 : (e) => authorizeApprovalResponse(t, a, e)
	};
}
async function requestApproval(e, t, n) {
	isApprovalRecheck(n) && !matchesApprovalPin(n.callId, e) && markApprovalPinChanged(n.callId);
	let r = await t(n);
	return !isApprovalRecheck(n) && approvalDecision(r).awaitsPerson === !0 && pinApprovedInstance(n.callId, e), r;
}
async function toolAnnotations(e, t, n) {
	try {
		return (await listToolMetadata(t, e.getClient(t.connectionName))).find((e) => e.name === n)?.annotations;
	} catch {
		return;
	}
}
function withToolAnnotations(e, t) {
	return t === void 0 ? e : inheritApprovalContext(e, {
		...e,
		toolAnnotations: t
	});
}
async function authorizeApprovalResponse(e, t, n) {
	return matchesApprovalPin(n.request.callId, e) ? await t(n) : {
		reason: CONNECTION_CHANGED_MESSAGE,
		status: `rejected`
	};
}
function pinApprovedInstance(e, t) {
	let n = loadContext();
	n.get(ConnectionApprovalPinsKey)?.[e] === void 0 && n.set(ConnectionApprovalPinsKey, (n = {}) => Object.fromEntries([...Object.entries(n).slice(-49), [e, instanceKey(t)]]));
}
function matchesApprovalPin(e, t) {
	let n = loadContext().get(ConnectionApprovalPinsKey)?.[e];
	return n !== void 0 && n === instanceKey(t);
}
function markApprovalPinChanged(e) {
	loadContext().set(ConnectionApprovalPinsKey, (t = {}) => ({
		...t,
		[e]: `\0changed`
	}));
}
function releaseApprovalPin(e, t) {
	let n = loadContext();
	let r = n.get(ConnectionApprovalPinsKey);
	if (r?.[e] === void 0) return;
	let { [e]: i, ...a } = r;
	if (n.set(ConnectionApprovalPinsKey, a), i !== instanceKey(t)) throw Error(CONNECTION_CHANGED_MESSAGE);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/action-request-name.js
function skillTarget(e) {
	return isObject$1(e) && typeof e.name == `string` ? e.name : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/skills.js
const SKILL_LOAD_LABEL = {
	start: (e) => `Load skill${skillName(e)}`,
	complete: (e) => `Loaded skill${skillName(e)}`
};
function skillName(e) {
	let t = skillTarget(e);
	return t === void 0 ? `` : ` ${t}`;
}
function createSkillLoader(e) {
	return {
		description: `Loads a skill's instructions.`,
		execute: (t) => {
			let n = e.get(t.name);
			if (n === void 0) throw Error(`No skill named "${t.name}".`);
			return n.markdown;
		},
		frameworkTool: !0,
		inputSchema: SKILL_INPUT_SCHEMA,
		label: SKILL_LOAD_LABEL,
		name: "eve:load-skill"
	};
}
function unknownSkillMessage(e, t, n, r) {
	let i = closestNames(e, [...t.values()]);
	let a = i.length > 0 ? ` Closest skills: ${i.join(`, `)}.` : r ? ` Find skills with eve__search.` : ``;
	let o = n.find((t) => t.toLowerCase() === e.toLowerCase());
	return `No skill named "${e}".${a}${o === void 0 ? `` : ` "${o}" is a connection, not a skill. Find its tools with eve__search({ query: "${o}__" }).`}`;
}
const SKILL_INPUT_SCHEMA = toInputSchema({
	type: `object`,
	properties: { name: { type: `string` } },
	required: [`name`],
	additionalProperties: !1
});
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/providers/connection-key.js
const ConnectionRegistryKey = new ContextKey(`eve.connectionRegistry`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/effective-agent-config.js
function agentSettings(e) {
	let t = e.ctx.get(DynamicSubagentAgentConfigKey);
	if (t !== void 0) return {
		compactionModel: t.compaction?.model,
		reasoning: t.reasoning,
		thresholdPercent: t.compaction?.thresholdPercent
	};
	let { settings: n } = sessionAgent(e.ctx);
	return {
		compactionModel: n.compaction?.model,
		reasoning: n.reasoning,
		thresholdPercent: n.compaction?.thresholdPercent
	};
}
function agentLimits(e, t) {
	let n = t.get(DynamicSubagentAgentConfigKey);
	return n === void 0 ? e.settings.limits : n.limits;
}
function resolveSessionUsageLimit(e) {
	let t = e.resolvedAgent.config?.limits?.sessionUsage ?? e.graph.nodesByNodeId.get("__root__")?.agent.config?.limits?.sessionUsage;
	return t === !1 ? () => !1 : t;
}
function resolveAgentApproval(e) {
	let t = e.graph.nodesByNodeId.get("__root__")?.agent.config?.approval;
	if (e.nodeId === void 0 || e.nodeId === "__root__") return t;
	let n = e.resolvedAgent.config?.approval;
	return n === void 0 ? t : t === void 0 ? n : strictestApproval([t, n]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/tool-entry-point.js
function entryPointOf(e) {
	let t = dispatchTargetOf(e);
	return t === void 0 ? `execute` : t.kind === `workflow-tool-call` ? t.entryPoint : `serve`;
}
function startsTasks(e) {
	return entryPointOf(e) !== `execute`;
}
function isAgentTool(e) {
	let t = dispatchTargetOf(e);
	return t !== void 0 && t.kind !== `workflow-tool-call`;
}
function dispatchTargetOf(e) {
	let t = e?.behavior?.handling;
	if (t?.kind === `dispatch`) return t.target;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/named.js
function namedEntries(e, t, n) {
	let fail = (t) => {
		throw Error(`The defineDynamic() in "${e.logicalPath}" ${t}`);
	};
	if (t == null) return [];
	let r = e.extensionNamespace === void 0 ? `` : `${e.extensionNamespace}__`;
	let i = n.is(t);
	return !i && (typeof t != `object` || Array.isArray(t)) && fail(`must return ${n.made}, a map of ${n.made} values, or null.`), (i ? [[e.slug, t]] : Object.entries(t)).map(([e, t]) => {
		n.is(t) || fail(`returned "${e}" without ${n.made}.`), !i && !n.pattern.test(e) && fail(`returned illegal ${n.noun} name "${e}". ${n.rule}`);
		let a = i ? e : `${r}${e}`;
		n.qualifiedPattern !== void 0 && !n.qualifiedPattern.test(a) && fail(`returned illegal ${n.noun} name "${a}". ${n.rule}`);
		let o = eveNamespaceReservation(a);
		return o !== void 0 && fail(`returned the reserved ${n.noun} name "${a}". ${o}; rename it.`), {
			entry: t,
			name: a
		};
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/workflow-function-id.js
function readWorkflowFunctionId(e) {
	if (typeof e != `function`) return;
	let t = Reflect.get(e, `workflowId`);
	return typeof t == `string` && t.length > 0 ? t : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/render.js
const TASK_WAIT_DESCRIPTION = `Call eve__task_wait sparingly, only when you deliberately want to withhold a message from the user while waiting for a task result. Tasks keep running and their results reach you without calling eve__task_wait. If the user should hear from you now, reply instead. Wait silently until any of your tasks has a result, a new message arrives, or timeoutSeconds pass. It returns after the first result, which follows in a <task_result> message; wait again only if you still want to withhold a reply until another result arrives. Waiting never stops a task.`;
const TASK_SYSTEM_BLOCK_OPENING = [
	`Tasks`,
	`- A call that returns "Started task <id>" is a task: it keeps working while you continue. Every agent call is a task.`,
	`- Each result arrives once, in a <task_result> message. Until then you know nothing about it, so don't guess or report its result.`,
	`- Ending your reply doesn't end your turn. While tasks work, eve holds your turn and calls you again with each result.`
];
const TASK_SYSTEM_BLOCK_CLOSING = [`- Don't redo work you delegated. Never use sleep or shell commands to wait for a task.`, `- To correct or continue an agent, or any task that accepts more input, call its tool again with its taskId. A new message never stops your tasks: answer it if it asks you something, decide whether it changes the work, then keep each task, correct an agent by taskId, or stop a task with eve__task_cancel.`];
const TASK_SYSTEM_BLOCK = [
	...TASK_SYSTEM_BLOCK_OPENING,
	`- If you have nothing to tell the person until a result arrives, call eve__task_wait. Start every independent task first, then wait.`,
	`- If the person should hear from you now, for example to confirm work is underway when they don't need the result yet, reply. When results arrive, report them without repeating yourself.`,
	...TASK_SYSTEM_BLOCK_CLOSING
].join(`
`);
const FINAL_REPLY_TASK_SYSTEM_BLOCK = [
	...TASK_SYSTEM_BLOCK_OPENING,
	`- Only your final reply reaches your caller. While tasks work, call eve__task_wait instead of replying. Start every independent task first, then wait.`,
	...TASK_SYSTEM_BLOCK_CLOSING
].join(`
`);
function renderTaskReceipt(e) {
	let t = `Started task ${e.id}. Its result will arrive in a <task_result> message.`;
	return e.resumable ? `${t} To send it another message, call ${e.tool} again with taskId ${e.id}.` : t;
}
function renderTaskSentReceipt(e) {
	return `Sent to task ${e}. Its reply will arrive in a <task_result> message.`;
}
function renderUnknownTaskError(e, t) {
	return `No task "${e}" is available to ${t}: it may have ended or belong to another tool. Start a new one by calling ${t} without taskId.`;
}
function renderTooManyTasksError(e, t) {
	return `${String(e)} tasks are already working (${t.join(`, `)}). Wait with eve__task_wait or stop one with eve__task_cancel, then try again.`;
}
function renderFinalOutputWhileWorkingError(e) {
	return `You can't give your final reply while tasks you started are working (${e.join(`, `)}). Wait for their results with eve__task_wait, or stop a task with eve__task_cancel, then call eve__reply.`;
}
function renderTaskResults(e) {
	let t = {
		bytes: 51200,
		lines: 2e3
	};
	return e.map((e) => {
		let n = fitToBudget(escapeTaskResultBody(e.body), t);
		return `<task_result ${`id="${escapeAttribute(e.taskId)}" tool="${escapeAttribute(e.tool)}" status="${e.status}"`}>${n}</task_result>`;
	}).join(`
`);
}
const TASK_RESULT_BLOCK = RegExp(`<task_result id="([^"]*)" tool="([^"]*)" status="(completed|failed)">([\\s\\S]*?)</task_result>`, `g`);
function readTaskResults(e) {
	return [...e.matchAll(TASK_RESULT_BLOCK)].map(([, e, t, n, r]) => ({
		body: r.replaceAll(`<\\/task_result`, `</task_result`),
		status: n,
		taskId: e,
		tool: t
	}));
}
function fitToBudget(e, t) {
	let n = new TextEncoder();
	let r = e.split(`
`);
	let i = [];
	for (let e of r) {
		let r = n.encode(e).byteLength + 1;
		if (t.lines === 0 || r > t.bytes) {
			let r = t.lines === 0 ? `` : cutToBytes(n, e, t.bytes - 1);
			r !== `` && i.push(r), i.push(`[truncated]`), t.lines = 0, t.bytes = 0;
			break;
		}
		i.push(e), --t.lines, t.bytes -= r;
	}
	return i.join(`
`);
}
function cutToBytes(e, t, n) {
	if (n <= 0) return ``;
	let { read: r } = e.encodeInto(t, new Uint8Array(n));
	return t.slice(0, r);
}
function escapeTaskResultBody(e) {
	return e.replaceAll(`</task_result`, `<\\/task_result`);
}
function renderModelOutputText(e) {
	if (typeof e == `string`) return e;
	if (isModelOutput(e)) switch (e.type) {
		case `text`: return String(e.value);
		case `json`: return JSON.stringify(e.value);
		case `content`: return renderContentParts(e.value);
	}
	return JSON.stringify(e ?? null);
}
function renderContentParts(e) {
	return Array.isArray(e) ? e.map((e) => e.type === `text` ? String(e.text) : `[file: ${typeof e.filename == `string` ? e.filename : String(e.mediaType)}]`).join(`
`) : ``;
}
function isModelOutput(e) {
	if (typeof e != `object` || !e) return !1;
	let t = Reflect.get(e, `type`);
	return (t === `text` || t === `json` || t === `content`) && `value` in e;
}
function renderTasksNote(e) {
	let t = ["[Tasks]", `<tasks>`];
	for (let n of e.working) t.push(`<task ${listedTaskAttributes(n)} status="working"/>`);
	if (t.push(`</tasks>`), e.idle.length > 0) {
		t.push(`<idle>`);
		for (let n of e.idle) t.push(`<task ${listedTaskAttributes(n)}/>`);
		t.push(`</idle>`);
	}
	return t.join(`
`);
}
function listedTaskAttributes(e) {
	return `id="${escapeAttribute(e.id)}" tool="${escapeAttribute(e.tool)}"`;
}
function escapeAttribute(e) {
	return e.replaceAll(`&`, `&amp;`).replaceAll(`"`, `&quot;`).replaceAll(`<`, `&lt;`).replaceAll(`>`, `&gt;`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/presentation-text.js
function normalizePresentationText(e) {
	return e.replace(/\p{Cc}/gu, ` `).replace(/\s+/g, ` `).trim().slice(0, 500);
}
function firstSentence(e) {
	for (let t of e.split(/\r?\n/u)) {
		let e = normalizePresentationText(t);
		if (e !== ``) return e.split(/(?<=[.!?])(?<!(?:^|\s)\d{1,2}\.)\s+(?=[\p{Lu}"'`(])/u, 1)[0];
	}
}
function withTaskIdSchema(e) {
	return withOptionalStringProperty(e, {
		description: "The id of a task this tool started, copied from its \"Started task\" receipt or the [Tasks] note, to send it this input. Omit it to start a new task.",
		name: "taskId"
	});
}
function withTaskIdInput(e) {
	let t = e.inputSchema;
	if (!isToolSchema(t)) throw Error(`Tool "${e.name}" has no input schema eve can add taskId to.`);
	let n = isAgentTool(e);
	let r = {
		...e,
		description: appendSentence(e.description, n ? "It does not see this conversation, so put everything it needs in message. To correct or continue an agent task, call this tool again with its taskId; without taskId, each call starts a new agent." : "To send this task more input, call this tool again with its taskId; without taskId, each call starts a new task."),
		inputSchema: withTaskIdSchema(t)
	};
	return !n || e.label === !1 || e.label?.start !== void 0 ? r : {
		...r,
		label: {
			...e.label,
			start: (t) => agentCallLabel(e.name, t)
		}
	};
}
function agentCallLabel(e, t) {
	let n = typeof t == `object` && t ? t.message : void 0;
	let r = typeof n == `string` ? firstSentence(n) : void 0;
	return r === void 0 ? displayTitle(e) : e === "agent" ? r : `${displayTitle(e)}: ${r}`;
}
const ABSENT_TASK_IDS = /* @__PURE__ */ new Set([
	``,
	`undefined`,
	`null`
]);
function splitTaskIdInput(e) {
	let { ["taskId"]: t, ...n } = e;
	return typeof t != `string` || ABSENT_TASK_IDS.has(t) ? { input: n } : {
		input: n,
		taskId: t
	};
}
function appendSentence(e, t) {
	let n = e.trimEnd();
	return n === `` ? t : `${n} ${t}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/schema-backed.js
function assertNoOwnTaskIdInput(e, t) {
	let n = e?.properties;
	if (isObject$1(n) && "taskId" in n) throw Error(`${t} inputSchema declares "taskId", which eve adds to a serve tool's model input to send a call to a running task. Rename the field.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/helpers/frontmatter.js
const schema = CORE_SCHEMA.withTags(mergeTag);
function loadDocument(e) {
	let t = loadAll(e, { schema });
	if (t.length > 1) throw Error(`Expected a single YAML document, but found more than one.`);
	return t[0] ?? {};
}
const OPENING_FENCE = /^\uFEFF?---(?!-)([^\r\n]*)(?:\r?\n|$)/;
const CLOSING_FENCE = /^---[ \t]*(?:\r?\n|$)/m;
function parseFrontmatter(e) {
	let t = OPENING_FENCE.exec(e);
	if (t === null) return;
	let n = t[1].trim();
	if (n !== `` && n.toLowerCase() !== `yaml`) throw Error(`Frontmatter language "${n}" is not supported. Use YAML frontmatter.`);
	let r = e.slice(t[0].length);
	let i = CLOSING_FENCE.exec(r);
	return i === null ? void 0 : {
		data: loadDocument(r.slice(0, i.index)),
		content: r.slice(i.index + i[0].length)
	};
}
function parseYaml(e) {
	let t = parseFrontmatter(e);
	return t === void 0 ? loadDocument(e) : t.data;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/skill-definition.js
const SKILL_BRAND = Symbol.for(`eve:skill-brand`);
function isBrandedSkillEntry(e) {
	return typeof e == `object` && !!e && e[SKILL_BRAND] === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/discover/grammar.js
const TOOL_SLUG_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
const SKILL_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;
const CONNECTION_SLUG_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/continuation.js
function continuationKey(e, t) {
	return `${e}:continue:${t}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/state.js
const DefinitionsStateKey = new ContextKey("eve.reactions");
const EMPTY_STATE = {
	latest: {},
	slots: {}
};
function readDefinitionsState(e) {
	return e.get(DefinitionsStateKey) ?? EMPTY_STATE;
}
function writeDefinitionsState(e, t) {
	e.set(DefinitionsStateKey, t);
}
function memoBytes(e) {
	return Buffer.byteLength(JSON.stringify(e));
}
function keepMemos(e, t, n) {
	let r = readDefinitionsState(e);
	let i = r.memos?.[t];
	let a = r.discarded?.filter((e) => e !== t);
	let o = withDiscarded(r, a);
	if (i === void 0 && Object.keys(n).length === 0) {
		a?.length !== r.discarded?.length && writeDefinitionsState(e, o);
		return;
	}
	let s = { ...r.memos };
	Object.keys(n).length === 0 ? delete s[t] : s[t] = n, writeDefinitionsState(e, {
		...o,
		memos: s
	});
}
function withDiscarded(e, t) {
	let { discarded: n, ...r } = e;
	return t === void 0 || t.length === 0 ? r : {
		...r,
		discarded: t
	};
}
function discardedByDeployment(e, t) {
	return readDefinitionsState(e).discarded?.includes(t) === !0;
}
function mergeMemos(e, t, n) {
	if (Object.keys(n).length === 0) return;
	let r = readDefinitionsState(e);
	let i = {
		...r.memos?.[t],
		...n
	};
	memoBytes(i) > 4194304 || writeDefinitionsState(e, {
		...r,
		memos: {
			...r.memos,
			[t]: i
		}
	});
}
function slotValueOf(e) {
	return e;
}
function digestOf(e) {
	return createHash(`sha256`).update(canonicalJson(e)).digest(`base64url`).slice(0, 22);
}
function canonicalJson(e) {
	if (typeof e != `object` || !e) return JSON.stringify(e);
	if (Array.isArray(e)) return `[${e.map(canonicalJson).join(`,`)}]`;
	let t = e;
	return `{${Object.keys(t).sort().map((e) => `${JSON.stringify(e)}:${canonicalJson(t[e])}`).join(`,`)}}`;
}
const LIVE_GLOBAL_KEY = Symbol.for(`eve.reactions.live`);
const liveSessions = globalThis[LIVE_GLOBAL_KEY] ??= /* @__PURE__ */ new Map();
function sessionIdOf(e) {
	let t = e.get(SessionIdKey);
	if (!isNonEmptyString(t)) throw Error(`Reaction state requires a session ID.`);
	return t;
}
function sessionLive(e) {
	let t = sessionIdOf(e);
	let n = liveSessions.get(t);
	return n === void 0 ? (n = /* @__PURE__ */ new Map(), liveSessions.set(t, n), liveSessions.size > 1024 && liveSessions.delete(liveSessions.keys().next().value)) : (liveSessions.delete(t), liveSessions.set(t, n)), n;
}
function readLive(e, t, n) {
	let r = sessionLive(e).get(t);
	if (r !== void 0 && r.digest === n.digest) return { live: r.live };
}
function writeLive(e, t, n, r) {
	sessionLive(e).set(t, {
		digest: n.digest,
		live: r
	});
}
function clearLive(e, t) {
	sessionLive(e).delete(t);
}
function forgetSessionLive(e) {
	liveSessions.delete(e);
}
function slotsOf(e, t) {
	let n = `${t}:`;
	return Object.entries(readDefinitionsState(e).slots).filter(([e]) => e.startsWith(n)).map(([t, n]) => {
		let r = n.live === !0 ? readLive(e, t, n) : void 0;
		return r === void 0 ? {
			id: t,
			slot: n
		} : {
			id: t,
			live: r.live,
			slot: n
		};
	});
}
function entryVersions(e, t) {
	let n = digestOf(readDefinitionsState(e).memos?.[t] ?? {});
	return (e) => digestOf({
		memos: n,
		offered: e
	});
}
function readSlot(e, t) {
	return readDefinitionsState(e).slots[t];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/abort-bound-session.js
function bindSandboxAbortSignal(e, t) {
	let compose = (e) => AbortSignal.any(e === void 0 ? [t] : [t, e]);
	return {
		...e,
		run: (t) => e.run({
			...t,
			signal: compose(t.signal)
		}),
		spawn: (t) => e.spawn({
			...t,
			signal: compose(t.signal)
		}),
		readFile: (t) => e.readFile({
			...t,
			signal: compose(t.signal)
		}),
		readBinaryFile: (t) => e.readBinaryFile({
			...t,
			signal: compose(t.signal)
		}),
		readTextFile: (t) => e.readTextFile({
			...t,
			signal: compose(t.signal)
		}),
		writeFile: (t) => e.writeFile({
			...t,
			signal: compose(t.signal)
		}),
		writeBinaryFile: (t) => e.writeBinaryFile({
			...t,
			signal: compose(t.signal)
		}),
		writeTextFile: (t) => e.writeTextFile({
			...t,
			signal: compose(t.signal)
		}),
		writeFiles: (t) => e.writeFiles({
			...t,
			signal: compose(t.signal)
		}),
		removePath: (t) => e.removePath({
			...t,
			signal: compose(t.signal)
		})
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/build-base-tool-context.js
function buildBaseToolContext(e) {
	let t = buildCallbackContext();
	let n = e.options.abortSignal ?? new AbortController().signal;
	let getSandbox = (async (e) => bindSandboxAbortSignal(await (e === void 0 ? t.getSandbox() : t.getSandbox(e)), n));
	return {
		...t,
		abortSignal: n,
		callId: e.options.toolCallId,
		getSandbox,
		toolName: e.toolName
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tool-auth.js
function createToolExecuteWithAuth(e) {
	return (t, n) => {
		let r = createAuthorizationContext({ scope: e.scope });
		let i = {
			...buildBaseToolContext({
				options: n,
				toolName: e.scope
			}),
			messages: n.messages,
			...contextStorage.getStore()?.get(ToolChannelKey) ?? {
				channel: {
					kind: `unknown`,
					metadata: {}
				},
				to: unavailableChannelTo
			},
			getToken: r.getToken,
			requireAuth: r.requireAuth,
			...n.approval !== void 0 && { approval: approvalOf(n.approval.responder, r) }
		};
		return r.run(() => e.execute(t, i));
	};
}
const unavailableChannelTo = () => {
	throw Error(`ctx.to() is only available while a session's turn runs the tool.`);
};
function approvalOf(e, t) {
	return { responder: {
		...e,
		getToken: (n, r) => t.getResponderToken(e, n, r)
	} };
}
function buildApprovalResponseAuth(e) {
	let t = createAuthorizationContext({
		scope: e.scope,
		boundResponder: e.responder
	});
	return {
		getToken: (n, r) => t.getToken(n, namespaceApprovalAuthOptions(e.scope, r)),
		requireAuth: (n, r) => t.requireAuth(n, namespaceApprovalAuthOptions(e.scope, r))
	};
}
function namespaceApprovalAuthOptions(e, t) {
	return t?.authKey === void 0 ? t : {
		...t,
		authKey: `${e}:${t.authKey}`
	};
}
async function handleApprovalResponsePolicyError(e) {
	return await handleAuthorizationError(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/harness-definition.js
function createWorkflowToolHarnessDefinition(e) {
	return {
		...entryPointOf(e.definition) === `serve` ? withTaskIdInput(e.definition) : e.definition,
		execute: void 0,
		executeInput: e.executeInput,
		workflowId: e.workflowId
	};
}
function createPreparedWorkflowToolHarnessDefinition(e) {
	let t = workflowIdForHandling(e.behavior?.handling);
	if (t === void 0) throw Error(`Prepared tool "${e.name}" is not backed by a workflow.`);
	return createWorkflowToolHarnessDefinition({
		definition: {
			frameworkTool: e.kind !== `authored-tool` || e.owner.kind === `framework`,
			behavior: e.behavior,
			deferred: e.deferred,
			description: e.description,
			inputSchema: toInputSchema(e.inputSchema) ?? UNSPECIFIED_INPUT_SCHEMA,
			name: e.name,
			outputSchema: toOutputSchema(e.outputSchema),
			rootOnly: e.rootOnly
		},
		workflowId: t
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/tools.js
const staticTools = {
	contribute: ({ step: e }) => ({ tools: () => ({ entries: toolEntries([...e?.agentTools.values() ?? []], `eve.tools`) }) }),
	id: `eve.tools`,
	label: `the agent's tools`
};
function toolDefinition(e) {
	return toolsDefinition(e, authoredEvaluate(e.evaluate));
}
function toolsDefinition(e, t) {
	let n = `tool:${e.extensionNamespace ?? ``}:${e.slug}`;
	return {
		contribute: (r) => ({ tools: async () => {
			let i = await r.keep(async (n) => contributeTools(e, await t(n), n.ctx));
			let a = Array.isArray(i?.value) ? i.value : [];
			let o = entryVersions(r.container, n);
			let s = i?.live ?? [];
			return { entries: new Map(s.map((e, t) => [e.name, {
				definition: {
					...e,
					version: o(a[t] ?? null)
				},
				source: n
			}])) };
		} }),
		id: n,
		label: e.logicalPath
	};
}
function dynamicToolNames(e) {
	return slotsOf(e, `tool`).flatMap(({ slot: e }) => Array.isArray(e.value) ? e.value.map((e) => e.name) : []);
}
function toolEntries(e, t) {
	return new Map(e.map((e) => [e.name, t === void 0 ? { definition: e } : {
		definition: e,
		source: t
	}]));
}
function contributeTools(e, t, n) {
	let r = namedTools(e, t).map(({ entry: t, name: r }) => (assertToolNameAvailable$1(n, e, r), liveTool(e, r, t)));
	return r.length === 0 ? { value: null } : {
		live: r,
		value: r.map(declaration)
	};
}
const TOOLS = {
	is: isBrandedToolEntry,
	made: `defineTool()`,
	noun: `tool`,
	pattern: TOOL_SLUG_PATTERN,
	qualifiedPattern: TOOL_SLUG_PATTERN,
	rule: "Expected ASCII letters, digits, underscores, and dashes only, starting with a letter, up to 64 characters."
};
function namedTools(e, t) {
	return namedEntries(e, t, TOOLS);
}
function compiledWorkflow(e, t, n) {
	if (isFrameworkTool(n)) throw Error(`The defineDynamic() in "${e.logicalPath}" returned eve's built-in workflow tool "${t}", which only works as a static tool. Export it from its own file under agent/tools/ instead.`);
	let [r] = readWorkflowToolEntryPoints(n);
	let i = r === void 0 ? void 0 : readWorkflowFunctionId(Reflect.get(n, r));
	if (r === void 0 || i === void 0) throw Error(`The defineDynamic() in "${e.logicalPath}" returned workflow tool "${t}" whose entry point isn't a compiled workflow. Declare it as a top-level async function that starts with "use workflow", and pass that function to defineWorkflowTool() as execute, task, or serve.`);
	if (Reflect.get(n, `endsTurn`) !== void 0 && r !== `execute`) throw Error(`The defineDynamic() in "${e.logicalPath}" returned workflow tool "${t}" with "endsTurn", which applies only to execute().`);
	return r === `serve` && assertNoOwnTaskIdInput(serializeInputSchema(Reflect.get(n, `inputSchema`)), `The defineDynamic() in "${e.logicalPath}" returned workflow tool "${t}" whose`), {
		entryPoint: r,
		workflowId: i
	};
}
function assertToolNameAvailable$1(e, t, n) {
	assertNotConnectionOwned({
		connectionNames: sessionConnectionNames(e),
		name: n,
		remedy: `Rename the map key.`,
		subject: `Dynamic tool`
	});
	let r = compiledBundleOf(e);
	if (r === void 0) return;
	let { subagentRegistry: i, toolRegistry: a } = r;
	if ((/* @__PURE__ */ new Set([
		...[...a.toolsByName.values()].filter(({ prepared: e }) => workflowIdForHandling(e.behavior?.handling) !== void 0).map(({ prepared: e }) => e.name),
		...i.preparedTools.map((e) => e.name),
		...i.dynamicResolvers.map((e) => e.name)
	])).has(n)) throw Error(`Dynamic tool "${n}" from "${t.logicalPath}" collides with the workflow tool or agent "${n}". Rename the map key.`);
}
function liveTool(e, t, n) {
	let r = n;
	let i = r;
	let a = {
		approval: r.approval,
		availableInSubagents: r.availableInSubagents,
		deferred: r.deferred,
		description: r.description,
		endsTurn: r.endsTurn,
		frameworkTool: isFrameworkTool(r) || void 0,
		inputSchema: toInputSchema(r.inputSchema),
		label: i.label,
		name: t,
		outputSchema: r.outputSchema === void 0 ? void 0 : toOutputSchema(r.outputSchema),
		toModelOutput: r.toModelOutput
	};
	if (isWorkflowToolDefinition(r)) {
		let { entryPoint: n, workflowId: i } = compiledWorkflow(e, t, r);
		return createWorkflowToolHarnessDefinition({
			definition: {
				...a,
				behavior: {
					availability: [],
					handling: {
						kind: `dispatch`,
						target: {
							entryPoint: n,
							kind: `workflow-tool-call`,
							workflowId: i
						}
					}
				}
			},
			workflowId: i
		});
	}
	return {
		...a,
		execute: createToolExecuteWithAuth({
			execute: (e, t) => r.execute(e, t),
			scope: t
		})
	};
}
function declaration(e) {
	return {
		description: e.description,
		inputSchema: serializeInputSchema(e.inputSchema),
		name: e.name,
		...e.outputSchema === void 0 ? {} : { outputSchema: serializeOutputSchema(e.outputSchema) },
		...e.deferred === !0 && { deferred: !0 },
		...e.endsTurn === !0 && { endsTurn: !0 },
		...e.availableInSubagents === !1 && { availableInSubagents: !1 }
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/openapi-schema.js
function buildInputSchema(e, t, n) {
	let r = {};
	let i = [];
	for (let t of e) r[t.name] = t.description === void 0 ? t.schema : {
		...t.schema,
		description: t.description
	}, t.required && i.push(t.name);
	t !== void 0 && (r.body = t.schema, t.required && i.push(`body`));
	let a = {
		type: `object`,
		properties: r
	};
	return i.length > 0 && (a.required = i), Object.keys(n).length > 0 && (a.$defs = n), a;
}
function buildOutputSchema(e, t) {
	let n = {
		type: `object`,
		properties: {
			status: { type: `integer` },
			statusText: { type: `string` },
			body: e,
			location: { type: `string` }
		},
		required: [
			`status`,
			`statusText`,
			`body`
		]
	};
	return Object.keys(t).length > 0 && (n.$defs = t), n;
}
function deref(e, t) {
	return typeof t.$ref == `string` ? resolveRef(e, t.$ref) ?? {} : t;
}
const SCHEMA_MAP_KEYWORDS = /* @__PURE__ */ new Set([
	`properties`,
	`patternProperties`,
	`$defs`,
	`definitions`
]);
const BASE_URI_KEYWORDS = /* @__PURE__ */ new Set([
	`$id`,
	`$anchor`,
	`$dynamicAnchor`,
	`$schema`
]);
function createSchemaConverter(e) {
	let t = {};
	let n = /* @__PURE__ */ new Map();
	let r = [];
	let define = (i) => {
		if (n.has(i)) return n.get(i);
		let a = resolveRef(e, i);
		let o = a === void 0 ? void 0 : uniqueKey(i, t);
		return n.set(i, o), o !== void 0 && (t[o] = {}, isAliasCycle(e, i) || r.push([o, a])), o;
	};
	let walk = (e) => {
		if (isArray(e)) return e.map(walk);
		if (!isObject$1(e)) return e;
		if (typeof e.$ref == `string`) {
			let t = define(e.$ref);
			return t === void 0 ? {} : { $ref: `#/$defs/${t}` };
		}
		let t = {};
		for (let [n, r] of Object.entries(e)) n === "default" || n === `example` ? t[n] = r : SCHEMA_MAP_KEYWORDS.has(n) && isObject$1(r) ? t[n] = Object.fromEntries(Object.entries(r).map(([e, t]) => [e, walk(t)])) : BASE_URI_KEYWORDS.has(n) || (t[n] = walk(r));
		return normalizeSchemaType(t), normalizeNullable(t), normalizeSchemaAnnotations(t), t;
	};
	return {
		convert: (e) => {
			let n = walk(e);
			for (let e = r.pop(); e !== void 0; e = r.pop()) t[e[0]] = walk(e[1]);
			return n;
		},
		defs: t
	};
}
function isAliasCycle(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r = t; typeof r == `string`;) {
		if (n.has(r)) return !0;
		n.add(r);
		let t = resolveRef(e, r);
		r = isObject$1(t) ? t.$ref : void 0;
	}
	return !1;
}
function uniqueKey(e, t) {
	let n = (e.slice(e.lastIndexOf(`/`) + 1) || `schema`).replace(/[^\w.-]/g, `_`);
	let r = n;
	for (let e = 2; Object.hasOwn(t, r) || r === `__proto__`; e += 1) r = `${n}_${e}`;
	return r;
}
const VALID_JSON_SCHEMA_TYPES = /* @__PURE__ */ new Set([
	`string`,
	`number`,
	`integer`,
	`boolean`,
	`object`,
	`array`,
	`null`
]);
function normalizeSchemaType(e) {
	let t = e.type;
	if (typeof t == `string` && !VALID_JSON_SCHEMA_TYPES.has(t)) delete e.type;
	else if (isArray(t)) {
		let n = t.filter((e) => typeof e == `string` && VALID_JSON_SCHEMA_TYPES.has(e));
		n.length === 0 ? delete e.type : e.type = n;
	}
}
function normalizeNullable(e) {
	if (!(`nullable` in e)) return;
	let t = e.nullable === !0;
	if (delete e.nullable, !t) return;
	let n = e.type;
	typeof n == `string` ? n !== `null` && (e.type = [n, `null`]) : isArray(n) ? n.includes(`null`) || (e.type = [...n, `null`]) : isArray(e.enum) && !e.enum.includes(null) && (e.enum = [...e.enum, null]);
}
function normalizeSchemaAnnotations(e) {
	let t = e.type;
	if (typeof t == `string` || isArray(t)) for (let n of [`default`, `example`]) n in e && !matchesSchemaType(e[n], t) && delete e[n];
}
function matchesSchemaType(e, t) {
	return (typeof t == `string` ? [t] : t).some((t) => {
		switch (t) {
			case `string`: return typeof e == `string`;
			case `number`: return typeof e == `number` && Number.isFinite(e);
			case `integer`: return typeof e == `number` && Number.isInteger(e);
			case `boolean`: return typeof e == `boolean`;
			case `object`: return isObject$1(e);
			case `array`: return isArray(e);
			case `null`: return e === null;
			default: return !1;
		}
	});
}
function resolveRef(e, t) {
	if (!t.startsWith(`#/`)) return;
	let n = t.slice(2).split(`/`).map((e) => e.replace(/~1/g, `/`).replace(/~0/g, `~`));
	let r = e;
	for (let e of n) {
		if (!isObject$1(r)) return;
		r = r[e];
	}
	return r;
}
function isArray(e) {
	return Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/openapi-operations.js
const HTTP_METHODS = [
	`get`,
	`put`,
	`post`,
	`delete`,
	`patch`,
	`head`,
	`options`
];
function successResponseSchema(e, t) {
	let { responses: n } = t;
	if (!isObject$1(n)) return;
	let r = Object.keys(n).filter((e) => /^2(\d\d|XX)$/iu.test(e));
	for (let i of r.length > 0 ? r : [`default`]) {
		let r = jsonResponseSchema(e, t, n[i]);
		if (r !== void 0) return r;
	}
}
function jsonResponseSchema(e, t, n) {
	let r = isObject$1(n) ? deref(e, n) : void 0;
	if (isObject$1(r)) {
		if (isObject$1(r.content)) {
			let e = jsonContentEntry(r.content);
			return isObject$1(e) && isObject$1(e.schema) ? e.schema : void 0;
		}
		if (swaggerProducesJson(e, t)) return isObject$1(r.schema) ? r.schema : void 0;
	}
}
function jsonContentEntry(e) {
	if (`application/json` in e) return e[`application/json`];
	for (let [t, n] of Object.entries(e)) if (isJsonMediaType(t)) return n;
}
function swaggerProducesJson(e, t) {
	let n = Array.isArray(t.produces) ? t.produces : Array.isArray(e.produces) ? e.produces : void 0;
	return n === void 0 || n.length === 0 || n.some((e) => typeof e == `string` && isJsonMediaType(e));
}
function isJsonMediaType(e) {
	return e.split(`;`, 1)[0]?.trim().toLowerCase() === `application/json`;
}
function operationName(e, t, n) {
	let r = declaredOperationId(e);
	if (r !== void 0) {
		let e = sanitizeToolName(r);
		if (e.length > 0) return e;
	}
	return sanitizeToolName(`${t}_${n.replace(/[{}]/g, ``).replace(/[^a-zA-Z0-9]+/g, `_`).replace(/^_+|_+$/g, ``)}`);
}
function declaredOperationId(e) {
	return typeof e.operationId == `string` && e.operationId.length > 0 ? e.operationId : void 0;
}
function sanitizeToolName(e) {
	return e.replace(/[^a-zA-Z0-9_-]+/g, `_`).replace(/^[_-]+|[_-]+$/g, ``).slice(0, 64);
}
function uniqueName(e, t) {
	let n = e;
	let r = 2;
	for (; t.has(n);) {
		let t = `_${r}`;
		n = `${e.slice(0, 64 - t.length)}${t}`, r += 1;
	}
	return t.add(n), n;
}
function operationDescription(e) {
	return typeof e.summary == `string` && e.summary.length > 0 ? e.summary : typeof e.description == `string` ? e.description : ``;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/openapi-security.js
function resolveSecurity(e, t) {
	let n = isArray(t.security) ? t.security : isArray(e.security) ? e.security : void 0;
	if (n === void 0 || n.length === 0) return;
	let r = getSecuritySchemes(e);
	if (r !== void 0) for (let t of n) {
		if (!isObject$1(t)) continue;
		let n = Object.keys(t)[0];
		if (n === void 0) continue;
		let i = r[n];
		let a = isObject$1(i) ? deref(e, i) : void 0;
		if (!isObject$1(a)) continue;
		let o = mapSecurityScheme(a);
		if (o !== void 0) return o;
	}
}
function getSecuritySchemes(e) {
	let t = isObject$1(e.components) ? e.components : void 0;
	return t !== void 0 && isObject$1(t.securitySchemes) ? t.securitySchemes : isObject$1(e.securityDefinitions) ? e.securityDefinitions : void 0;
}
function mapSecurityScheme(e) {
	if (e.type === `apiKey`) {
		let t = e.in;
		return (t === `header` || t === `query` || t === `cookie`) && typeof e.name == `string` && e.name.length > 0 ? {
			kind: `apiKey`,
			in: t,
			name: e.name
		} : void 0;
	}
	if (e.type === `http`) return (typeof e.scheme == `string` ? e.scheme.toLowerCase() : ``) === `basic` ? { kind: `basic` } : { kind: `bearer` };
	if (e.type === `basic`) return { kind: `basic` };
	if (e.type === `oauth2` || e.type === `openIdConnect`) return { kind: `bearer` };
}
function applySecurity(e, t, n, r, i) {
	if (e === void 0 || t.authorization === void 0) return;
	let a = extractBearerToken(n);
	a !== void 0 && e.kind !== `bearer` && (e.kind === `basic` ? n.Authorization = `Basic ${a}` : (delete n.Authorization, e.in === `header` ? n[e.name] = a : e.in === `query` ? r.set(e.name, a) : i.push(`${e.name}=${a}`)));
}
function extractBearerToken(e) {
	let t = e.Authorization ?? e.authorization;
	return typeof t == `string` ? /^Bearer\s+(.+)$/i.exec(t)?.[1] : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/openapi-spec.js
function parseSpecDocument(e) {
	try {
		return JSON.parse(e);
	} catch {}
	return parseYaml(e.replace(/^\uFEFF/, ``));
}
function extractServerUrl(e, t) {
	let n = extractOpenApiServerUrl(e, t);
	return n === void 0 ? extractSwaggerBaseUrl(e, t) : n;
}
function extractOpenApiServerUrl(e, t) {
	let n = e.servers;
	if (isArray(n)) for (let e of n) {
		if (!isObject$1(e) || typeof e.url != `string` || e.url.length === 0) continue;
		let n = isObject$1(e.variables) ? substituteServerVariables(e.url, e.variables) : e.url;
		if (n.startsWith(`http://`) || n.startsWith(`https://`)) return n;
		if (typeof t == `string` && URL.canParse(t)) try {
			return new URL(n, t).toString();
		} catch {}
	}
}
function extractSwaggerBaseUrl(e, t) {
	let n = typeof e.basePath == `string` ? e.basePath : ``;
	let r = typeof e.host == `string` && e.host.length > 0 ? e.host : ``;
	let i = typeof t == `string` && URL.canParse(t) ? new URL(t) : void 0;
	let a = extractSwaggerScheme(e) ?? i?.protocol.replace(/:$/, ``) ?? `https`;
	if (r.length > 0) return `${a}://${r}${normalizeBasePath(n)}`;
	if (i !== void 0) {
		let e = new URL(normalizeBasePath(n) || `/`, i.origin).toString();
		return e.endsWith(`/`) && normalizeBasePath(n).length === 0 ? e.slice(0, -1) : e;
	}
}
function extractSwaggerScheme(e) {
	let t = e.schemes;
	if (isArray(t)) {
		for (let e of t) if (e === `https` || e === `http`) return e;
	}
}
function normalizeBasePath(e) {
	let t = e.trim();
	return t.length === 0 || t === `/` ? `` : t.startsWith(`/`) ? t : `/${t}`;
}
function substituteServerVariables(e, t) {
	return e.replace(/\{([^}]+)\}/g, (e, n) => {
		let r = t[n];
		return isObject$1(r) && typeof r.default == `string` ? r.default : e;
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/openapi-client.js
const log$10 = createLogger(`runtime.connections.openapi-client`);
const SWAGGER_PARAMETER_SCHEMA_KEYS = [
	`default`,
	`enum`,
	`exclusiveMaximum`,
	`exclusiveMinimum`,
	`format`,
	`items`,
	`maximum`,
	`maxItems`,
	`maxLength`,
	`minimum`,
	`minItems`,
	`minLength`,
	`multipleOf`,
	`pattern`,
	`type`,
	`uniqueItems`
];
var OpenApiConnectionClient = class {
	#e;
	#t;
	#n;
	constructor(e) {
		this.#n = e;
	}
	async connect() {
		return this.#r();
	}
	async getToolMetadata() {
		return (await this.#r()).metadata;
	}
	async executeTool(e, t, n) {
		let r = await this.#r();
		let i = r.operations.get(e);
		if (i === void 0) throw Error(`Tool "${e}" not found in connection "${this.#n.connectionName}".`);
		return this.#m(i, r.baseUrl, isObject$1(t) ? t : {}, {
			abortSignal: n.abortSignal,
			callId: n.callId
		});
	}
	async close() {
		this.#e = void 0, this.#t = void 0;
	}
	async #r() {
		if (this.#t !== void 0) return this.#t;
		if (this.#e !== void 0) return this.#e;
		this.#e = this.#i();
		try {
			return this.#t = await this.#e, this.#t;
		} catch (e) {
			throw this.#e = void 0, e;
		}
	}
	async #i() {
		let e = await this.#s();
		let t = this.#o(e);
		let n = this.#c(e);
		let r = [];
		let i = /* @__PURE__ */ new Map();
		let a = Object.keys(this.#n.toolCall?.providedArguments ?? {});
		for (let e of n) {
			let t;
			try {
				t = parseJsonObject(omitProvidedArgumentsFromSchema(e.inputSchema, a));
			} catch (t) {
				this.#a(e.toolName, t);
				continue;
			}
			i.set(e.toolName, e), r.push({
				description: e.description,
				inputSchema: t,
				name: e.toolName,
				...e.operationId !== void 0 && { operationId: e.operationId },
				...e.outputSchema !== void 0 && { outputSchema: e.outputSchema }
			});
		}
		return {
			metadata: r,
			operations: i,
			baseUrl: t
		};
	}
	#a(e, t) {
		log$10.warn(`omitting OpenAPI operation with an invalid input schema`, {
			connectionName: this.#n.connectionName,
			error: t,
			toolName: e
		});
	}
	#o(e) {
		let t = this.#n.url;
		let n = typeof t == `string` && t.trim().length > 0 ? t : extractServerUrl(e, this.#n.spec);
		if (n === void 0) throw Error(`OpenAPI connection "${this.#n.connectionName}" has no base URL: set "baseUrl" or ensure the document declares an absolute "servers" entry or Swagger "host".`);
		return assertSecureUrl(n, this.#n.connectionName, `base`), n;
	}
	async #s() {
		let e = this.#n.spec;
		if (e === void 0) throw Error(`OpenAPI connection "${this.#n.connectionName}" is missing its "spec" source.`);
		if (typeof e != `string`) return e;
		assertSecureUrl(e, this.#n.connectionName, `spec`);
		let t;
		try {
			t = await fetch(e, { headers: { accept: `application/json, application/yaml, text/yaml, */*` } });
		} catch (t) {
			throw Error(`OpenAPI connection "${this.#n.connectionName}" failed to fetch its spec from "${e}": ${String(t)}`);
		}
		if (t.redirected && assertSecureUrl(t.url, this.#n.connectionName, `spec`), !t.ok) throw Error(`OpenAPI connection "${this.#n.connectionName}" failed to fetch its spec from "${e}": HTTP ${t.status}.`);
		let n = await t.text();
		let r;
		try {
			r = parseSpecDocument(n);
		} catch (t) {
			throw Error(`OpenAPI connection "${this.#n.connectionName}" spec at "${e}" could not be parsed as JSON or YAML: ${String(t)}`);
		}
		if (!isObject$1(r)) throw Error(`OpenAPI connection "${this.#n.connectionName}" spec at "${e}" is not an OpenAPI document object.`);
		return r;
	}
	#c(e) {
		let t = e.paths;
		if (!isObject$1(t)) return [];
		let n = [];
		let r = /* @__PURE__ */ new Set();
		for (let [i, a] of Object.entries(t)) {
			if (!isObject$1(a)) continue;
			let t = isArray(a.parameters) ? a.parameters : [];
			for (let o of HTTP_METHODS) {
				let s = a[o];
				if (!isObject$1(s)) continue;
				let c = uniqueName(operationName(s, o, i), r);
				let l = isArray(s.parameters) ? s.parameters : [];
				let u = [...t, ...l];
				let { convert: d, defs: f } = createSchemaConverter(e);
				let p;
				let m;
				try {
					p = this.#u(e, u, d), m = this.#d(e, s.requestBody, u, d);
				} catch (e) {
					this.#a(c, e);
					continue;
				}
				n.push({
					toolName: c,
					operationId: declaredOperationId(s),
					method: o,
					pathTemplate: i,
					description: operationDescription(s),
					parameters: p,
					requestBody: m,
					inputSchema: buildInputSchema(p, m, f),
					outputSchema: this.#l(e, s),
					security: resolveSecurity(e, s)
				});
			}
		}
		return n;
	}
	#l(e, t) {
		let n = successResponseSchema(e, t);
		if (n === void 0) return;
		let { convert: r, defs: i } = createSchemaConverter(e);
		try {
			return parseJsonObject(buildOutputSchema(r(n), i));
		} catch {
			return;
		}
	}
	#u(e, t, n) {
		let r = [];
		for (let i of t) {
			let t = isObject$1(i) ? deref(e, i) : i;
			if (!isObject$1(t)) continue;
			let a = t.in;
			if (a !== `path` && a !== `query` && a !== `header` && a !== `cookie` || typeof t.name != `string`) continue;
			let o = this.#f(t, n);
			r.push({
				name: t.name,
				location: a,
				required: t.required === !0 || a === `path`,
				schema: o,
				description: typeof t.description == `string` ? t.description : void 0
			});
		}
		return r;
	}
	#d(e, t, n, r) {
		if (isObject$1(t)) {
			let n = deref(e, t);
			if (isObject$1(n) && isObject$1(n.content)) {
				let e = n.content;
				let t = `application/json` in e ? `application/json` : Object.keys(e)[0];
				if (t !== void 0) {
					let i = e[t];
					let a = isObject$1(i) && isObject$1(i.schema) ? r(i.schema) : {};
					return {
						required: n.required === !0,
						contentType: t,
						schema: a
					};
				}
			}
		}
		return this.#p(e, n, r);
	}
	#f(e, t) {
		if (isObject$1(e.schema)) return t(e.schema);
		let n = {};
		for (let t of SWAGGER_PARAMETER_SCHEMA_KEYS) e[t] !== void 0 && (n[t] = e[t]);
		return t(n);
	}
	#p(e, t, n) {
		for (let r of t) {
			let t = isObject$1(r) ? deref(e, r) : r;
			if (!isObject$1(t) || t.in !== `body`) continue;
			let i = isObject$1(t.schema) ? n(t.schema) : {};
			return {
				required: t.required === !0,
				contentType: `application/json`,
				schema: i
			};
		}
	}
	async #m(e, t, n, r) {
		let i = await resolveProvidedArguments({
			args: n,
			callId: r.callId,
			connection: this.#n,
			toolName: e.toolName
		});
		let a = await resolveHeaders(this.#n);
		let o = e.pathTemplate;
		let s = new URLSearchParams();
		let c = [];
		for (let t of e.parameters) {
			let n = i[t.name];
			if (n != null) {
				if (t.location === `path`) {
					let r = String(n);
					if (r === `.` || r === `..`) throw Error(`Path parameter "${t.name}" for tool "${e.toolName}" in connection "${this.#n.connectionName}" must not be "." or "..".`);
					o = o.replace(`{${t.name}}`, encodeURIComponent(r));
				} else t.location === `query` ? appendQuery(s, t.name, n) : t.location === `cookie` ? c.push(`${t.name}=${encodeURIComponent(String(n))}`) : a[t.name] = String(n);
			}
		}
		if (applySecurity(e.security, this.#n, a, s, c), c.length > 0) {
			let e = a.cookie ?? a.Cookie;
			delete a.Cookie, a.cookie = [e, ...c].filter((e) => !!e).join(`; `);
		}
		let l = new URL(joinPath(t, o));
		l.search = s.toString();
		let u;
		e.requestBody !== void 0 && i.body !== void 0 && (u = JSON.stringify(i.body), a[`content-type`] = e.requestBody.contentType);
		let { response: d, location: f } = await fetchWithinOrigin(l, {
			method: e.method.toUpperCase(),
			headers: a,
			body: u,
			signal: r?.abortSignal
		}, this.#n.connectionName);
		let p = {
			status: d.status,
			statusText: d.statusText,
			body: await readResponseBody(d)
		};
		return f !== void 0 && (p.location = f), p;
	}
};
const REDIRECT_STATUSES = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
async function fetchWithinOrigin(e, t, n) {
	let r = e;
	let i = t;
	for (let t = 0;; t++) {
		let a = await fetch(r, {
			...i,
			redirect: `manual`
		});
		let o = a.headers.get(`location`);
		if (!REDIRECT_STATUSES.has(a.status) || o === null) return { response: a };
		let s = URL.parse(o, r.href);
		if (s === null) return { response: a };
		if (s.origin !== e.origin) return {
			response: a,
			location: s.href
		};
		if (await a.body?.cancel(), t >= 10) throw Error(`OpenAPI connection "${n}" stopped after 10 redirects from "${e.origin}${e.pathname}", last to "${s.pathname}". The API may be redirecting in a loop.`);
		r = s, i = redirectedRequest(i, a.status);
	}
}
function redirectedRequest(e, t) {
	if (!(t === 303 && e.method !== `GET` && e.method !== `HEAD` || (t === 301 || t === 302) && e.method === `POST`)) return e;
	let n = Object.fromEntries(Object.entries(e.headers).filter(([e]) => e.toLowerCase() !== `content-type`));
	return {
		...e,
		method: `GET`,
		headers: n,
		body: void 0
	};
}
function appendQuery(e, t, n) {
	if (isArray(n)) for (let r of n) e.append(t, String(r));
	else e.append(t, String(n));
}
function joinPath(e, t) {
	return `${e.endsWith(`/`) ? e.slice(0, -1) : e}${t.startsWith(`/`) ? t : `/${t}`}`;
}
function assertSecureUrl(e, t, n) {
	let r;
	try {
		r = new URL(e);
	} catch {
		throw Error(`OpenAPI connection "${t}" has an invalid ${n} URL "${e}".`);
	}
	if (r.protocol !== `https:` && !(r.protocol === `http:` && isLoopbackHostname(r.hostname))) throw Error(`OpenAPI connection "${t}" must use https for its ${n} (got "${r.protocol}//${r.host}").`);
}
async function readResponseBody(e) {
	let t = await e.text();
	if (t.length === 0) return null;
	if (isJsonMediaType(e.headers.get(`content-type`) ?? ``)) try {
		return JSON.parse(t);
	} catch {
		return t;
	}
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/registry.js
var ConnectionRegistryImpl = class {
	#e = /* @__PURE__ */ new Map();
	#t;
	#n;
	#r;
	#i = /* @__PURE__ */ new Set();
	#a = !1;
	constructor(e, t) {
		this.#n = e, this.#t = e, this.#r = t;
	}
	async replaceDynamicConnections(e) {
		let t = this.#o(e);
		let n = new Map(this.#t.map((e) => [e.connectionName, e]));
		let r = new Map(t.map((e) => [e.connectionName, e]));
		let i = [];
		for (let [e, t] of this.#e) n.get(e) !== r.get(e) && (this.#e.delete(e), i.push(t));
		this.#t = t, await Promise.allSettled(i.map((e) => this.#c(e, !0)));
	}
	#o(e) {
		let t = /* @__PURE__ */ new Map();
		let n = new Map(this.#n.map((e) => [e.connectionName, e]));
		for (let [r, i] of e) for (let e of i) {
			let i = t.get(e.connectionName);
			if (i !== void 0 && i !== r) throw Error(`Dynamic connection "${e.connectionName}" from resolver "${r}" collides with dynamic resolver "${i}". Namespace the map key manually.`);
			t.set(e.connectionName, r), n.set(e.connectionName, e);
		}
		for (let e of t.keys()) assertNoNestedConnection(e, n.keys());
		return [...n.values()];
	}
	getClient(e) {
		let t = this.#e.get(e);
		if (t !== void 0) return t;
		let n = this.#t.find((t) => t.connectionName === e);
		if (n === void 0) throw Error(`Connection "${e}" is not registered.`);
		let r = n.protocol === `openapi` ? new OpenApiConnectionClient(n) : this.#s(n);
		return this.#e.set(e, r), r;
	}
	getConnectionApproval(e) {
		return this.#t.find((t) => t.connectionName === e)?.approval;
	}
	getConnectionNames() {
		return this.#t.map((e) => e.connectionName);
	}
	getStaticConnectionNames() {
		return this.#n.map((e) => e.connectionName);
	}
	getConnections() {
		return this.#t;
	}
	async dispose() {
		this.#a = !0;
		let e = [...this.#e.values()];
		this.#e.clear(), await Promise.allSettled(e.map((e) => this.#c(e, !1)));
	}
	#s(e) {
		let t = this.#r;
		if (t === void 0 || this.#a || !this.#n.includes(e)) return new McpConnectionClient(e);
		let n = t.pool.acquire(t.scope, e);
		return this.#i.add(n), n;
	}
	async #c(e, t) {
		e instanceof McpConnectionClient && this.#i.delete(e) ? await this.#r?.pool.release(e, { discard: t }) : await e.close();
	}
};
function assertNoNestedConnection(e, t) {
	for (let n of t) {
		if (n === e) continue;
		let [t, r] = n.length < e.length ? [e, n] : [n, e];
		assertNotConnectionOwned({
			connectionNames: [r],
			name: t,
			remedy: `Rename the dynamic connection "${e}".`,
			subject: `Connection`
		});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/connections.js
const connections = {
	contribute: ({ container: e }) => ({ arrange: (t) => ({ tools: async () => {
		let n = await t.tools();
		return await installDynamicConnections(e), {
			...n,
			connections: e.get(ConnectionRegistryKey)?.getConnections() ?? []
		};
	} }) }),
	id: `eve.connections`,
	install: installDynamicConnections,
	label: `the agent's connections`
};
function connectionDefinition(e) {
	let t = authoredEvaluate(e.evaluate);
	return {
		contribute: (n) => ({ tools: async () => (await n.keep(async (n) => {
			let r = namedEntries(e, await t(n), CONNECTIONS).map(({ entry: t, name: n }) => resolveDynamicConnectionValue(t, {
				connectionName: n,
				exportName: e.exportName,
				logicalPath: e.logicalPath,
				sourceId: e.sourceId,
				sourceKind: `module`
			}));
			return assertOwnsNoEntries(n.ctx, r, e), r.length === 0 ? null : {
				live: r,
				value: r.map(target)
			};
		}), {}) }),
		id: `connection:${e.extensionNamespace ?? ``}:${e.slug}`,
		label: e.logicalPath
	};
}
function target(e) {
	let t = e.authorization;
	let n = typeof t == `object` && t ? t.principalType : void 0;
	return {
		name: e.connectionName,
		protocol: e.protocol,
		url: e.url,
		...e.instanceId !== void 0 && { instanceId: e.instanceId },
		...n !== void 0 && { principalType: n }
	};
}
async function installDynamicConnections(e) {
	let t = e.get(ConnectionRegistryKey);
	t instanceof ConnectionRegistryImpl && await t.replaceDynamicConnections(new Map(slotsOf(e, `connection`).map(({ id: e, live: t }) => [e, t ?? []])));
}
function sessionConnectionNames(e) {
	let t = e.get(ConnectionRegistryKey);
	let n = t instanceof ConnectionRegistryImpl ? t.getStaticConnectionNames() : t?.getConnectionNames() ?? [];
	return [.../* @__PURE__ */ new Set([...n, ...dynamicConnectionVersions(e).keys()])];
}
function dynamicConnectionVersions(e) {
	let t = /* @__PURE__ */ new Map();
	for (let { id: n, slot: r } of slotsOf(e, `connection`)) {
		let i = entryVersions(e, n);
		for (let e of Array.isArray(r.value) ? r.value : []) {
			let n = e?.name;
			typeof n == `string` && !t.has(n) && t.set(n, i(e));
		}
	}
	return t;
}
const CONNECTIONS = {
	is: (e) => readStampedConnectionProtocol(e) !== void 0,
	made: `defineMcpClientConnection() or defineOpenAPIConnection()`,
	noun: `connection`,
	pattern: CONNECTION_SLUG_PATTERN,
	rule: `Expected lowercase ASCII letters, digits, and dashes only, starting with a letter, up to 64 characters.`
};
function assertOwnsNoEntries(e, t, n) {
	let r = compiledBundleOf(e);
	let i = [
		...r?.toolRegistry.toolsByName.keys() ?? [],
		...r?.subagentRegistry.subagentsByName.keys() ?? [],
		...r?.subagentRegistry.dynamicResolvers.map((e) => e.name) ?? [],
		...dynamicToolNames(e)
	];
	let a = t.map((e) => e.connectionName);
	for (let e of i) assertNotConnectionOwned({
		connectionNames: a,
		name: e,
		remedy: `Rename it, or the dynamic connection that "${n.logicalPath}" returned.`,
		subject: `Tool or subagent`
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/execute-call.js
function historyCallNames(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) if (n.role === `assistant` && Array.isArray(n.content)) for (let e of n.content) e.type === `tool-call` && t.set(e.toolCallId, e.toolName);
	return t;
}
function runEntryCall(e, t) {
	let { call: n, definition: r } = e;
	if (r.execute === void 0) throw Error(`"${n.toolName}" cannot run.`);
	return r.execute(n.input, t);
}
function toEntryStep(e, t, n) {
	return [{
		approvalRequests: e.approvalRequests,
		policyApprovals: e.policyApprovals,
		callId: e.callId,
		content: (e.content ?? []).map((e) => toEntryPart(e, n)),
		finishReason: e.finishReason,
		invalidInputToolCallIds: e.invalidInputToolCallIds,
		providerMetadata: e.providerMetadata,
		response: e.response,
		signIns: e.signIns,
		text: e.text,
		toolCalls: (e.toolCalls ?? []).map((e) => entryCallOf(e, n)),
		toolResults: (e.toolResults ?? []).map((e) => entryCallOf(e, n)),
		usage: e.usage
	}, [...t]];
}
async function* toEntryStream(e, t) {
	let n = /* @__PURE__ */ new Set();
	for await (let r of e) r.type === `tool-input-start` && (r.toolName === "eve__tool" || r.toolName === "eve__skill") ? n.add(r.id) : r.type === `tool-input-delta` && n.has(r.id) || r.type === `tool-input-end` && n.delete(r.id) || (yield toEntryPart(r, t));
}
function entryCallOf(e, t) {
	return t(e)?.call ?? e;
}
function toEntryPart(e, t) {
	switch (e.type) {
		case `tool-call`:
		case `tool-result`:
		case `tool-error`: return entryCallOf(e, t);
		case `tool-approval-request`: {
			let n = e;
			return n.toolCall === void 0 ? e : {
				...n,
				toolCall: entryCallOf(n.toolCall, t)
			};
		}
		default: return e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/table.js
const EMPTY_TABLE = { tasks: [] };
function readTaskTable(e) {
	let t = readRunningWork(e).tasks;
	return t.length === 0 ? EMPTY_TABLE : { tasks: t.flatMap((e) => {
		let t = decodeTaskRecord(e);
		return t === void 0 ? [] : [t];
	}) };
}
function writeTaskTable(e, t) {
	return {
		...e,
		state: writeRunningWork(e.state, { tasks: pruneFinishedRecords(t.tasks) })
	};
}
function findTask(e, t) {
	return e.tasks.find((e) => e.id === t);
}
function isActiveTaskRun(e, t, n) {
	let r = findTask(e, t);
	return r?.cancelled !== !0 && r?.run?.runId === n;
}
function isCancelledTaskRun(e, t, n) {
	let r = findTask(e, t);
	return r?.cancelled === !0 && r.run?.runId === n;
}
function isTaskWorking(e) {
	return e.calls.length > 0;
}
function workingTasks(e) {
	return e.tasks.filter(isTaskWorking);
}
function idleTasks(e) {
	return e.tasks.filter(isResumableTaskIdle).slice(-10);
}
function isTaskAvailable(e, t) {
	return e !== void 0 && e.resumable && !e.cancelled && e.run !== void 0 && e.name === t;
}
function tasksWithResults(e) {
	return e.tasks.filter((e) => e.results.length > 0);
}
function liveRuns(e) {
	return [...getBlockingWorkflowToolRuns(e).map((e) => e.address), ...liveTaskRuns(readTaskTable(e))];
}
function liveTaskRuns(e) {
	return e.tasks.flatMap((e) => e.run === void 0 ? [] : [toRunAddress(e.run)]);
}
function createTask(e, t) {
	let n = createTaskId(e, t.name);
	let r = {
		calls: [{
			callId: t.callId,
			turnId: t.turnId
		}],
		id: n,
		kind: t.kind,
		name: t.name,
		results: [],
		resumable: t.resumable
	};
	return {
		table: {
			...e,
			tasks: [...e.tasks, r]
		},
		taskId: n
	};
}
function removeTask(e, t) {
	return {
		...e,
		tasks: e.tasks.filter((e) => e.id !== t)
	};
}
function recordTaskRun(e, t, n) {
	return updateTask(e, t, (e) => ({
		...e,
		run: {
			...n,
			started: !1
		}
	}));
}
function markTaskRunStarted(e, t, n) {
	let r = findTask(e, t);
	if (r?.run === void 0 || r.run.runId !== n || r.run.started) return { table: e };
	let i = {
		...r.run,
		started: !0
	};
	let a = updateTask(e, t, (e) => {
		let { held: t, ...n } = e;
		return {
			...n,
			run: i
		};
	});
	return r.held === void 0 ? { table: a } : {
		held: {
			commands: r.held,
			run: toRunAddress(i)
		},
		table: a
	};
}
function recordTaskCall(e, t, n) {
	let r = findTask(e, t);
	if (r?.run === void 0) return { table: e };
	let i = {
		call: n,
		kind: `call`
	};
	let a = r.run;
	let o = {
		callId: n.callId,
		turnId: n.turnId
	};
	let s = {
		...r,
		calls: [...r.calls, o]
	};
	a.started || (s = {
		...s,
		held: [...r.held ?? [], i]
	});
	let c = {
		...e,
		tasks: [...removeTask(e, t).tasks, s]
	};
	return a.started ? {
		send: {
			commands: [i],
			run: toRunAddress(a)
		},
		table: c
	} : { table: c };
}
function settleTaskCalls(e, t) {
	let n = new Set(t.callIds);
	let r = (findTask(e, t.taskId)?.calls ?? []).filter((e) => n.has(e.callId));
	if (r.length === 0) return {
		settled: r,
		table: e
	};
	let { outcome: i } = t;
	return {
		settled: r,
		table: updateTask(e, t.taskId, (e) => ({
			...e,
			calls: e.calls.filter((e) => !n.has(e.callId)),
			results: i.status === `cancelled` ? e.results : [...e.results, {
				...i,
				calls: r
			}]
		}))
	};
}
function settleRemainingTaskCalls(e, t, n) {
	return settleTaskCalls(e, {
		callIds: findTask(e, t)?.calls.map((e) => e.callId) ?? [],
		outcome: n,
		taskId: t
	});
}
function recordTaskRunUsage(e, t, n) {
	return updateTask(e, t, (e) => e.run === void 0 ? e : {
		...e,
		run: {
			...e.run,
			usage: n
		}
	});
}
function finishTaskRun(e, t, n) {
	return updateTask(e, t, (e) => {
		if (e.run?.runId !== n) return e;
		let { held: t, run: r, ...i } = e;
		return i;
	});
}
function cancelTask(e, t) {
	let n = findTask(e, t);
	if (n === void 0) return {
		settled: [],
		table: e
	};
	if (n.resumable && n.kind !== `agent`) return cancelResumableTask(e, n);
	let r = cancelledCalls(n);
	let i = n.run;
	let a = updateTask(e, t, (e) => ({
		...e,
		calls: [],
		cancelled: !0,
		held: void 0
	}));
	return i === void 0 || n.cancelled ? {
		settled: r,
		table: a
	} : {
		send: cancelCommand(i),
		settled: r,
		table: a
	};
}
function cancelResumableTask(e, t) {
	let n = t.run;
	if (n === void 0 || !isTaskWorking(t)) return {
		settled: [],
		table: e
	};
	let r = cancelledCalls(t);
	let i = updateTask(e, t.id, (e) => {
		let t = {
			...e,
			calls: []
		};
		return n.started ? t : {
			...t,
			held: [{ kind: `cancel` }]
		};
	});
	return n.started ? {
		send: cancelCommand(n),
		settled: r,
		table: i
	} : {
		settled: r,
		table: i
	};
}
function cancelCommand(e) {
	return {
		commands: [{ kind: `cancel` }],
		run: toRunAddress(e)
	};
}
function takeTaskResults(e) {
	let t = tasksWithResults(e);
	let n = e.tasks.map((e) => t.includes(e) ? {
		...e,
		results: []
	} : e);
	return {
		table: {
			...e,
			tasks: n
		},
		taken: t
	};
}
function updateTask(e, t, n) {
	return {
		...e,
		tasks: e.tasks.map((e) => e.id === t ? n(e) : e)
	};
}
function cancelledCalls(e) {
	return e.run === void 0 ? [] : e.calls;
}
function toRunAddress(e) {
	return {
		hookToken: e.hookToken,
		runId: e.runId
	};
}
function createTaskId(e, t) {
	for (;;) {
		let n = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(6));
		let r = `${t}-${Array.from(n, (e) => `0123456789abcdefghjkmnpqrstvwxyz`[e % 32]).join(``)}`;
		if (findTask(e, r) === void 0) return r;
	}
}
function isResumableTaskIdle(e) {
	return e.resumable && !e.cancelled && e.run !== void 0 && !isTaskWorking(e);
}
function isFinishedRecord(e) {
	return e.calls.length === 0 && e.results.length === 0 && e.run === void 0;
}
function pruneFinishedRecords(e) {
	let t = e.filter(isFinishedRecord);
	let n = t.length - 100;
	if (n <= 0) return e;
	let r = new Set(t.slice(0, n));
	return e.filter((e) => !r.has(e));
}
function decodeTaskRecord(e) {
	if (isTaskRecord(e)) return e;
	if (isObject$1(e) && isNonEmptyString(e.id) && isNonEmptyString(e.name)) return {
		calls: [],
		id: e.id,
		kind: e.kind === `agent` ? `agent` : `tool`,
		name: e.name,
		results: [{
			error: "The task's state could not be read.",
			status: `failed`
		}],
		resumable: !1
	};
}
function isTaskRecord(e) {
	return isObject$1(e) && isNonEmptyString(e.id) && isNonEmptyString(e.name) && (e.kind === `agent` || e.kind === `tool`) && typeof e.resumable == `boolean` && Array.isArray(e.calls) && Array.from(e.calls).every(isTaskCall) && Array.isArray(e.results) && Array.from(e.results).every(isTaskResult) && (e.run === void 0 || isTaskRun(e.run)) && (e.held === void 0 || Array.isArray(e.held) && Array.from(e.held).every(isTaskRunCommand));
}
function isTaskRunCommand(e) {
	return isObject$1(e) ? e.kind === `cancel` || e.kind === `call` && isObject$1(e.call) && isNonEmptyString(e.call.callId) : !1;
}
function isTaskResult(e) {
	return !isObject$1(e) || e.calls !== void 0 && (!Array.isArray(e.calls) || !Array.from(e.calls).every(isTaskCall)) ? !1 : e.status === `completed` ? `output` in e : e.status === `failed` && typeof e.error == `string`;
}
function isTaskRun(e) {
	return isObject$1(e) && isNonEmptyString(e.runId) && isNonEmptyString(e.hookToken) && typeof e.started == `boolean` && (e.usage === void 0 || isObject$1(e.usage));
}
function isTaskCall(e) {
	return isObject$1(e) && isNonEmptyString(e.callId) && typeof e.turnId == `string`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/target.js
function stubToolPath(e, t) {
	return e?.agentPath === void 0 ? t : `${e.agentPath}/${t}`;
}
function findStubTarget(e, t) {
	if (e !== void 0) return t = stubToolPath(e, t), e.rules.some((e) => e.tool === t) ? {
		scope: e,
		tool: t
	} : void 0;
}
function stubCallId(e, t, n) {
	return `${e}:${t}:${n}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/providers/tool-stubs-key.js
const ToolStubPlaybackKey = new ContextKey(`eve.toolStubPlayback`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/output.js
function toolStubOutput(e) {
	if (e.throw !== void 0) {
		let t = Error(e.throw.message);
		throw t.name = e.throw.name ?? `Error`, t;
	}
	return e.response;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/execute.js
function executeWithToolStub(e, t, n, r) {
	let i = contextStubCall(e, t, n.toolCallId);
	return i === void 0 ? r() : executeStubbedTool(i.playback, i.call, n, r);
}
async function* executeStubbedTool(e, t, n, r) {
	n.abortSignal?.throwIfAborted();
	let i = await e.call(t);
	if (i.kind === `error`) throw Error(i.error);
	if (i.kind === `stub`) {
		yield toolStubOutput(i.outcome);
		return;
	}
	let a = await r();
	isAsyncIterable(a) ? yield* a : yield a;
}
function contextStubCall(e, t, n) {
	let r = contextStorage.getStore();
	if (r === void 0) return;
	let i = findStubTarget(r.get(ToolStubsKey), e);
	if (i === void 0) return;
	let a = r.require(SessionKey);
	return {
		playback: r.require(ToolStubPlaybackKey),
		call: {
			tool: i.tool,
			input: t,
			callId: stubCallId(a.sessionId, a.turn.id, n)
		}
	};
}
async function recordToolStubFailure(e, t, n) {
	let r = contextStorage.getStore();
	let i = r?.get(ToolStubsKey);
	if (i === void 0 || t === void 0 || findStubTarget(i, e) === void 0) return;
	let a = r.require(SessionKey);
	await r.require(ToolStubPlaybackKey).fail(stubCallId(a.sessionId, n ?? a.turn.id, t), `Stubbed tool "${e}" failed during output processing.`);
}
async function observeToolOutput(e, t, n, r) {
	try {
		return await n();
	} catch (n) {
		try {
			for (let n of t) await recordToolStubFailure(e, n.callId, n.turnId);
		} catch (e) {
			throw AggregateError([n, e], `Tool output processing and failure reporting failed.`, { cause: n });
		}
		if (r !== void 0) return r(n);
		throw n;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/task-cancel.js
const taskCancelTool = {
	frameworkTool: !0,
	description: "Stop a task's current work. That work never reports back; if it already had a result, that result is still delivered. Cancelling an agent or one-shot task ends it; start a new task to delegate again. Other tasks that accept more input stay available: call their tool with the taskId to give them new work.",
	frameworkAction: `task-cancel`,
	inputSchema: defineJsonSchema({
		type: `object`,
		properties: { taskId: {
			type: `string`,
			minLength: 1,
			description: "The id of the task to stop, copied from its \"Started task\" receipt or the [Tasks] note."
		} },
		required: [`taskId`],
		additionalProperties: !1
	}),
	name: "eve__task_cancel"
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/task-wait.js
const taskWaitTool = {
	frameworkTool: !0,
	description: TASK_WAIT_DESCRIPTION,
	frameworkAction: `task-wait`,
	inputSchema: defineJsonSchema({
		type: `object`,
		properties: { timeoutSeconds: {
			type: `integer`,
			minimum: 1,
			description: "Optional. Seconds to wait before returning without a result. There is no upper limit, so set it above 1800 to wait longer than 30 minutes. Omit it to wait up to 30 minutes for a result or a new message, which is almost always right. Don't use short timeouts to check on tasks: results reach you without checking."
		} },
		additionalProperties: !1
	}),
	name: "eve__task_wait"
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/model-step.js
function isTaskTool(e) {
	return e?.frameworkAction === `task-wait` || e?.frameworkAction === `task-cancel`;
}
function isWorkflowTool(e) {
	return e?.workflowId !== void 0 || isTaskTool(e);
}
function withTaskTools(e) {
	return new Map([
		...e,
		["eve__task_wait", taskWaitTool],
		["eve__task_cancel", taskCancelTool]
	]);
}
function commitCallEntry(e, t) {
	let n = entryPointOf(t.definition);
	switch (n) {
		case `execute`: return {
			entry: { entryPoint: n },
			input: t.input,
			session: e
		};
		case `task`: return commitTask(e, t, n, t.input);
		case `serve`: {
			let { input: r, taskId: i } = splitTaskIdInput(t.input);
			return i === void 0 ? commitTask(e, t, n, r) : {
				entry: {
					entryPoint: `receive`,
					taskId: i
				},
				input: r,
				session: e
			};
		}
	}
}
function commitTask(e, t, n, r) {
	let i = createTask(readTaskTable(e.state), {
		callId: t.callId,
		kind: isAgentTool(t.definition) ? `agent` : `tool`,
		name: t.toolName,
		resumable: n === `serve`,
		turnId: t.turnId
	});
	return {
		entry: {
			entryPoint: n,
			taskId: i.taskId
		},
		input: r,
		session: writeTaskTable(e, i.table)
	};
}
function workingTaskIds(e) {
	return workingTasks(readTaskTable(e.state)).map((e) => e.id);
}
async function appendTaskContext(e) {
	let t = [];
	let n = await deliverTaskResults(e);
	n.message !== void 0 && t.push(createFrameworkUserMessage(`task.result`, n.message));
	let r = resolveTasksNote({
		messages: [...e.messages, ...t],
		session: n.session
	});
	return r !== void 0 && t.push(createFrameworkUserMessage(`context.state`, r)), {
		messages: t,
		session: n.session
	};
}
async function deliverTaskResults(e) {
	let { table: t, taken: n } = takeTaskResults(readTaskTable(e.session.state));
	if (n.length === 0) return { session: e.session };
	let r = [];
	for (let t of n) for (let n of t.results) r.push(await toResultBlock(t, n, e.tools.get(t.name), e.outputContext));
	return {
		message: renderTaskResults(r),
		session: writeTaskTable(e.session, t)
	};
}
async function toResultBlock(e, t, n, r) {
	let i = {
		taskId: e.id,
		tool: e.name
	};
	return t.status === `failed` ? {
		...i,
		body: t.error,
		status: `failed`
	} : {
		...i,
		body: await projectOutput(e, t, n, r),
		status: `completed`
	};
}
async function projectOutput({ id: e, name: t }, n, r, i) {
	if (r?.toModelOutput === void 0) return renderModelOutputText(n.output);
	let a = n.calls?.[0]?.callId ?? e;
	return await observeToolOutput(t, n.calls ?? [], async () => renderModelOutputText(await r.toModelOutput(n.output, i(t, a))), () => renderModelOutputText(n.output));
}
function resolveTasksNote(e) {
	let t = readTaskTable(e.session.state);
	let n = workingTasks(t).map(toListedTask);
	let r = idleTasks(t).map(toListedTask);
	let i = e.messages.findLast(isTasksNote);
	if (i === void 0 && n.length === 0 && r.length === 0) return;
	let a = renderTasksNote({
		idle: r,
		working: n
	});
	return i?.content === a ? void 0 : a;
}
function toListedTask(e) {
	return {
		id: e.id,
		tool: e.name
	};
}
function isTasksNote(e) {
	return e.role === `user` && typeof e.content == `string` && e.content.startsWith("[Tasks]");
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/resolve-text.js
function answerFromText(e, t) {
	let { interactionId: n, request: r } = t;
	let i = e.trim();
	if (i.length === 0) return;
	let a = i.toLowerCase();
	if (r.options !== void 0 && r.options.length > 0) {
		let e = matchOption(a, r.options);
		if (e !== void 0) return {
			interactionId: n,
			optionId: e.id
		};
	}
	if (r.allowFreeform === !0 || r.options === void 0 || r.options.length === 0) return {
		interactionId: n,
		text: i
	};
}
function matchOption(e, t) {
	let n = t.find((t) => t.id.toLowerCase() === e);
	if (n !== void 0) return n;
	let r = t.find((t) => t.label.toLowerCase() === e);
	if (r !== void 0) return r;
	let i = Number(e);
	if (Number.isInteger(i) && i > 0 && i <= t.length) return t[i - 1];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/budget-request.js
function createSessionLimitContinuationRequest(e) {
	let { sessionId: t, turnSequence: n, windowIndex: r } = e;
	return {
		interactionId: `${t}:${n}:limit:usage:${r}`,
		request: {
			allowFreeform: !1,
			display: `confirmation`,
			kind: `budget`,
			options: [{
				description: `Start a new usage window`,
				id: "approve",
				label: `Approve`,
				style: `primary`
			}, {
				description: `Stop now`,
				id: "deny",
				label: `Stop`,
				style: `danger`
			}],
			prompt: `This session has hit its usage limit. This is a guardrail against defective long-running sessions. If session activity looks fine, just approve to keep going.`
		}
	};
}
function toJsonUsage(e) {
	let { costUsd: t, ...n } = e;
	return t === void 0 ? n : {
		...n,
		costUsd: t
	};
}
function isSessionLimitContinuationRequestId(e) {
	return /:limit:(?:usage|input|output):\d+$/u.test(e) || /:limit:token-cost:\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu.test(e);
}
function limitDecision(e) {
	if (e.optionId === "approve") return { granted: !0 };
	if (e.optionId === "deny") return { granted: !1 };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/stale-responses.js
function dropStaleSessionLimitContinuationResponses(e) {
	if (e.stepInput === void 0) return;
	let t = e.stepInput.answers ?? [];
	let n = t.filter(({ interactionId: t }) => e.pendingRequestIds.has(t) || !isSessionLimitContinuationRequestId(t));
	if (n.length === t.length) return e.stepInput;
	let { answers: r, ...i } = e.stepInput;
	return n.length === 0 ? i : {
		...i,
		answers: n
	};
}
function convertStaleResponsesToUserMessage(e) {
	if (e.stepInput === void 0) return { kind: `unchanged` };
	let t = e.stepInput.answers ?? [];
	let n = t.filter(({ interactionId: t }) => e.pendingRequestIds.has(t));
	if (n.length === t.length) return {
		kind: `unchanged`,
		stepInput: e.stepInput
	};
	let r = t.filter(({ interactionId: t }) => !e.pendingRequestIds.has(t) && e.view.interactions[t]?.request.kind !== `budget`);
	let { answers: i, ...a } = e.stepInput;
	let o = n.length === 0 ? a : {
		...a,
		answers: n
	};
	if (r.length === 0) return {
		kind: `unchanged`,
		stepInput: o
	};
	let { view: s } = e;
	let c = appendOptionalUserContent(e.stepInput.message, formatModelMessage(r, s));
	return {
		displayMessage: appendOptionalUserContent(e.stepInput.message, formatDisplayMessage(r, s)),
		kind: `converted`,
		stepInput: {
			...o,
			message: c
		}
	};
}
function formatModelMessage(e, t) {
	let n = e.map((e) => {
		let n = t.interactions[e.interactionId];
		let r = n?.request;
		let i = r?.options?.find((t) => t.id === e.optionId);
		return {
			requestId: e.interactionId,
			response: {
				optionId: e.optionId,
				selectedOption: i === void 0 ? void 0 : {
					id: i.id,
					label: i.label,
					description: i.description
				},
				text: e.text
			},
			...r?.kind === `approval` && {
				prompt: r.prompt,
				requestType: `approval`,
				toolName: askedCall(t, n)?.name
			}
		};
	});
	return [
		`The user submitted the following response to an earlier interactive prompt.`,
		`Treat it as new input at the current point in the conversation and decide whether it is still relevant. This does not authorize an earlier action; request approval again if that action is still needed.`,
		JSON.stringify(n, null, 2)
	].join(`
`);
}
function formatDisplayMessage(e, t) {
	return e.map((e) => e.text !== void 0 && e.text.length > 0 ? e.text : t.interactions[e.interactionId]?.request.options?.find((t) => t.id === e.optionId)?.label ?? e.optionId ?? `Response to an earlier interactive prompt`).join(`
`);
}
function appendOptionalUserContent(e, t) {
	let n = normalizeMessage(e);
	return n === void 0 ? t : appendMessage({
		appended: t,
		existing: n
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/delivery.js
function deliver(e, t, n) {
	let r = n.takeQueued ? e.turn.queued : void 0;
	let i = openRequests(e.projection.view).find((e) => e.request.kind === `budget`);
	let a = r !== void 0 && i !== void 0 && n.typedAnswers !== !1 ? resolveTextInput(e.projection.view, t) : t;
	let o = r === void 0 ? a : a === void 0 ? r : coalesceTurnInputs(r, a);
	let s = e.projection.view;
	let c = /* @__PURE__ */ new Set([...ownOpenRequestIds(e), ...e.turn.suspended.flatMap((e) => e.requests.filter((e) => s.interactions[e.interactionId] === void 0).map((e) => e.interactionId))]);
	let l = convertStaleResponsesToUserMessage({
		pendingRequestIds: c,
		view: s,
		stepInput: dropStaleSessionLimitContinuationResponses({
			pendingRequestIds: c,
			stepInput: o
		})
	});
	return l.kind === `converted` ? {
		displayMessage: l.displayMessage,
		input: l.stepInput,
		takeQueued: n.takeQueued
	} : {
		input: l.stepInput,
		takeQueued: n.takeQueued
	};
}
function resolveTextInput(e, t) {
	let n = readAnswerText(t);
	if (t === void 0 || n === void 0) return t;
	let r = new Set(openRequests(e).map((e) => e.interactionId));
	if (t.answers?.some((e) => r.has(e.interactionId))) return t;
	let i = promptQueueHead(e);
	let a = i === void 0 ? void 0 : answerFromText(n, i);
	let o = typedAnswers(t, a === void 0 ? [] : [a]);
	return o === void 0 ? t : compactInput(consumeTypedMessage(t, o));
}
function resolveTypedApproval(e, t) {
	let n = readAnswerText(t);
	if (t === void 0 || n === void 0) return t;
	let r = new Set((t.answers ?? []).map(({ interactionId: e }) => e));
	let i = promptQueueHead(e.projection.view, (e) => r.has(e));
	let a = e.turn.suspended.some((e) => e.requests.some((e) => e.interactionId === i?.interactionId));
	if (i === void 0 || !a || i.request.kind !== `approval`) return t;
	let o = answerFromText(n, i);
	let s = typedAnswers(t, o === void 0 ? [] : [o]);
	return s === void 0 ? t : consumeTypedMessage(t, s);
}
function consumeTypedMessage(e, t) {
	return {
		...e,
		answers: [...e.answers ?? [], ...t],
		context: void 0,
		deliveries: withoutHistory(e.deliveries),
		history: void 0,
		message: void 0,
		messageConsumed: !0
	};
}
function withoutHistory(e) {
	return e?.map(({ history: e, ...t }) => t);
}
function typedAnswers(e, t) {
	let n = e.deliveries?.at(-1)?.deliveryId;
	if (n !== void 0 && t.length !== 0) return t.map((e, t) => ({
		...e,
		deliveryId: n,
		responseId: typedResponseId(n, t)
	}));
}
function typedResponseId(e, t) {
	return `response_${e}_typed_${String(t)}`;
}
function isEmptyInput(e) {
	return Object.keys(compactInput(e)).length === 0;
}
function withoutResponses(e) {
	if (e === void 0) return;
	let { answers: t, messageConsumed: n, ...r } = e;
	return r;
}
function turnInputOnly(e) {
	if (e === void 0) return;
	let t = {};
	(e.context?.length ?? 0) > 0 && (t.context = e.context), (e.history?.length ?? 0) > 0 && (t.history = e.history), e.message !== void 0 && e.messageConsumed !== !0 && (t.message = e.message);
	let n = attachClientContext(t, readClientContext(e));
	return isEmptyInput(n) ? void 0 : n;
}
function withoutTurnInput(e) {
	let t = {};
	return (e?.answers?.length ?? 0) > 0 && (t.answers = e.answers), (e?.deliveries?.length ?? 0) > 0 && (t.deliveries = e.deliveries), e?.outputSchema !== void 0 && (t.outputSchema = e.outputSchema), t;
}
function compactInput(e) {
	if (e === void 0) return {};
	let t = {};
	return (e.deliveries?.length ?? 0) > 0 && (t.deliveries = e.deliveries), (e.context?.length ?? 0) > 0 && (t.context = e.context), (e.history?.length ?? 0) > 0 && (t.history = e.history), (e.answers?.length ?? 0) > 0 && (t.answers = e.answers), e.message !== void 0 && (t.message = e.message), e.messageConsumed === !0 && (t.messageConsumed = !0), e.outputSchema !== void 0 && (t.outputSchema = e.outputSchema), attachClientContext(t, readClientContext(e));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/suspended-steps.js
function suspend(e, t) {
	return {
		...e,
		suspended: [...e.suspended, t]
	};
}
function stepCallIds(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.messages) if (n.role === `assistant` && typeof n.content != `string`) for (let e of n.content) e.type === `tool-call` && e.providerExecuted !== !0 && t.add(e.toolCallId);
	return t;
}
function isComplete(e) {
	let t = answeredCallIds(e.messages);
	return [...stepCallIds(e)].every((e) => t.has(e));
}
function withResult(e, t) {
	let n = [...e];
	let r = findCall(n, t.toolCallId);
	if (r === void 0) return n.push({
		content: [t],
		role: `tool`
	}), n;
	let i = {
		...t,
		toolName: r.call.toolName
	};
	let a = n[r.index + 1];
	return a?.role === `tool` ? n[r.index + 1] = {
		...a,
		content: [...a.content, i]
	} : n.splice(r.index + 1, 0, {
		content: [i],
		role: `tool`
	}), n;
}
function withoutResults(e, t) {
	return e.flatMap((e) => {
		if (e.role !== `tool`) return [e];
		let n = e.content.filter((e) => e.type !== `tool-result` || !t.has(e.toolCallId));
		return n.length === 0 ? [] : [{
			...e,
			content: n
		}];
	});
}
function findCall(e, t) {
	for (let [n, r] of e.entries()) {
		if (r.role !== `assistant` || typeof r.content == `string`) continue;
		let e = r.content.find((e) => e.type === `tool-call` && e.toolCallId === t);
		if (e !== void 0) return {
			call: e,
			index: n
		};
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/interrupted-attempt.js
function interruptedCallResult(e) {
	switch (e?.outcome) {
		case `completed`: return `This call completed, but its result was lost when the step running it was interrupted.`;
		case `failed`: return `This call failed before the step running it was interrupted.`;
		case `rejected`: return `This call was rejected.`;
		default: return e?.started === !0 ? `The step running this call was interrupted. The call may or may not have taken effect.` : `This call did not run.`;
	}
}
function interruptedAttemptNote(e) {
	let t = [...e.values()].filter((e) => e.started && e.name !== ``);
	if (t.length === 0) return;
	let n = t.slice(0, 20).map((e) => {
		let t = e.input === void 0 ? `` : ` ${truncate(JSON.stringify(e.input))}`;
		return `- ${e.name}${t}: ${interruptedCallResult(e)}`;
	});
	return t.length > 20 && n.push(`- ${t.length - 20} more calls.`), createFrameworkUserMessage(`execution.retry`, [
		`An infrastructure failure interrupted your previous attempt at this step before its results were saved. It made these tool calls:`,
		...n,
		`Before repeating a call that changes anything outside this conversation, check whether it already took effect.`
	].join(`
`));
}
function truncate(e) {
	return e.length <= 500 ? e : `${e.slice(0, 500)}… (truncated)`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/call-outcome.js
function callOutcomeOf(e) {
	if (e.isError === !0) {
		let t = readOutputError(e.output) ?? {
			code: `ACTION_RESULT_FAILED`,
			message: formatOutput(e.output)
		};
		return {
			error: `errorName` in e && e.errorName !== void 0 ? {
				...t,
				name: e.errorName
			} : t,
			outcome: `failed`
		};
	}
	return { outcome: `completed` };
}
function readOutputError(e) {
	let t = parseRecord(e);
	if (t === void 0) return;
	let n = typeof t.code == `string` && t.code.length > 0 ? t.code : void 0;
	let r = typeof t.message == `string` && t.message.length > 0 ? t.message : void 0;
	return n === void 0 || r === void 0 ? void 0 : {
		code: n,
		message: r
	};
}
function parseRecord(e) {
	if (typeof e == `object` && e) return e;
	if (typeof e != `string`) return;
	let t = e.trim();
	if (t.length !== 0) try {
		let e = JSON.parse(t);
		return typeof e == `object` && e ? e : void 0;
	} catch {
		return;
	}
}
function formatOutput(e) {
	if (typeof e == `string`) return e;
	let t = JSON.stringify(e);
	return typeof t == `string` && t.length > 0 ? t : `Action failed.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/call-facts.js
function capabilityOf(e, t, n) {
	let r = e.kind === `load-skill` ? {
		kind: `skill`,
		name: e.name
	} : e.kind === `subagent-call` ? {
		kind: `agent`,
		name: e.name
	} : e.kind === `remote-agent-call` ? {
		kind: `agent`,
		name: e.name,
		remote: !0
	} : {
		kind: toolKind(e.toolName),
		name: e.toolName
	};
	return n === !0 ? {
		...r,
		hidden: !0
	} : t === void 0 ? r : {
		...r,
		label: t
	};
}
function announcedKind(e, t) {
	if (e === "eve:load-skill") return `skill`;
	let n = t?.behavior?.handling;
	return n?.kind === `dispatch` && n.target.kind !== `workflow-tool-call` ? `agent` : toolKind(e);
}
function toolKind(e) {
	return isTaskControlTool(e) ? `control` : `tool`;
}
function callRequested(e) {
	let { action: t, inputError: n } = e;
	return fact(`call.requested`, {
		callId: t.callId,
		capability: capabilityOf(t, e.label, e.hidden),
		input: n === void 0 ? toJsonValue$1(t.input) : void 0,
		inputError: n,
		owner: e.owner
	});
}
function callStarted(e, t = {}) {
	return fact(`call.started`, {
		callId: e,
		clearedBy: t.clearedBy
	});
}
function callSettledFrom(e, t = {}) {
	let { error: n, outcome: r } = callOutcomeOf(e);
	let i = t.rejected === !0;
	return fact(`call.settled`, {
		callId: e.callId,
		cause: t.cause ?? (i ? { policy: `approval` } : void 0),
		error: n,
		outcome: i ? `rejected` : r,
		output: e.output === void 0 ? void 0 : toJsonValue$1(e.output),
		label: t.label
	});
}
function callProgress(e, t, n) {
	return {
		data: defined({
			callId: e,
			output: toJsonValue$1(t),
			label: n
		}),
		type: `call.progress`
	};
}
function toJsonValue$1(e) {
	if (e === void 0) return null;
	if (e === null || typeof e == `string` || typeof e == `boolean`) return e;
	if (typeof e == `number`) return Number.isFinite(e) ? e : String(e);
	if (typeof e == `bigint` || typeof e == `symbol` || typeof e == `function`) return String(e);
	try {
		return JSON.parse(JSON.stringify(e));
	} catch {
		return String(e);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/transitions.js
const unchanged = (e, t) => transition({
	events: t,
	turn: e.turn
});
function followedTurn(e) {
	let t = e.view.selection;
	return t === null ? null : t?.turnId ?? e.view.session.latestTurnId ?? null;
}
function waitingDeliveries(e, t) {
	return t.filter(({ deliveryId: t }) => e.view?.deliveries[t]?.status === `admitted`);
}
function consumed(e, t) {
	return fact(`delivery.consumed`, {
		deliveryId: e.deliveryId,
		history: (e.history?.length ?? 0) > 0 ? e.history : void 0,
		parts: e.parts,
		turnId: t
	});
}
function receive(e, t) {
	let { projection: n } = e;
	let r = turnPosition(n);
	let i = activeTurnId(r);
	let a = waitingDeliveries(n, t.deliveries ?? []);
	let o = a[0];
	let s = o === void 0 ? t.cause ?? { policy: `system` } : { deliveryId: o.deliveryId };
	let { parent: c, predecessor: l, runtime: u, trace: d } = t;
	let f = [];
	return r.sessionStarted || f.push(fact(`session.started`, {
		parent: c,
		predecessor: l,
		runtime: u,
		trace: d
	})), r.turnId === `` && f.push(fact(`turn.started`, {
		cause: s,
		follows: followedTurn(n),
		trace: d,
		turnId: i
	})), f.push(...a.map((e) => consumed(e, i))), unchanged(e, f);
}
function join(e, t) {
	let { projection: n } = e;
	let r = waitingDeliveries(n, t.deliveries);
	let i = activeTurnIdOf(n);
	return unchanged(e, i === void 0 ? r.map(({ deliveryId: e }) => deliveryApplied(e)) : r.map((e) => consumed(e, i)));
}
function complete(e) {
	return unchanged(e, turnSettled(e.projection, { outcome: `completed` }));
}
function clearedByAttempt(e) {
	return transition({
		events: [],
		history: { rewrite: [] },
		signIns: [],
		turn: {
			remembered: e.turn.remembered,
			suspended: []
		}
	});
}
function fail(e, t) {
	let n = e.turn.suspended.filter((e) => (e.approved?.length ?? 0) > 0);
	let r = errorInfoOf(t);
	let i = activeTurnIdOf(e.projection);
	let a = i === void 0 ? void 0 : openRunOf(e.projection, i);
	let o = [...a === void 0 ? [] : runSettledFacts({
		runId: a,
		outcome: `failed`,
		error: r,
		usage: t.usage
	}), ...t.terminal === void 0 ? turnSettled(e.projection, {
		error: r,
		outcome: `failed`
	}) : sessionEndedFacts(e.projection, {
		cause: i === void 0 ? void 0 : { turnId: i },
		error: r,
		outcome: `failed`
	})];
	return transition({
		...commitSteps(e.turn, n, cancelledTranscript),
		events: o
	});
}
function settle(e, t) {
	let n = [];
	let r = [...e.turn.suspended];
	for (let { part: i, result: a, usage: o } of t.results) {
		let t = r.findIndex((e) => stepCallIds(e).has(i.toolCallId));
		let s = r[t];
		if (s === void 0) continue;
		r[t] = withoutApproved({
			...s,
			messages: withResult(s.messages, i)
		}, /* @__PURE__ */ new Set([i.toolCallId]));
		let c = a === void 0 ? void 0 : e.projection.view.calls[a.callId];
		a !== void 0 && c !== void 0 && c.taskId === void 0 && c.status !== `settled` && (n.push(callSettledFrom(a)), o !== void 0 && n.push(delegatedUsageFact(a.callId, o)));
	}
	let i = r.filter(isComplete);
	return transition({
		...commitSteps({
			...e.turn,
			suspended: r
		}, i),
		events: n
	});
}
function discardAttempt(e, t) {
	let n = e.projection.view;
	let r = {
		family: `run`,
		id: t.runId
	};
	let i = t.ending === `steered` ? closeUnder(n, r, `steered`) : [];
	if (!isOpen(n, r)) return unchanged(e, i);
	let a = t.ending === `retried` ? {
		outcome: `abandoned`,
		runId: t.runId,
		usage: t.usage
	} : {
		finishReason: `other`,
		outcome: `completed`,
		runId: t.runId,
		usage: t.usage
	};
	return unchanged(e, [...i, ...runSettledFacts(a)]);
}
function suspendStep(e, t) {
	return transition({
		events: [],
		turn: suspend(e.turn, {
			...t,
			requests: []
		})
	});
}
function withoutApproved(e, t) {
	if (e.approved === void 0) return e;
	let n = e.approved.filter((e) => !t.has(e.call.callId));
	if (n.length === e.approved.length) return e;
	let { approved: r, ...i } = e;
	return n.length === 0 ? i : {
		...i,
		approved: n
	};
}
function runnableCalls(e, t) {
	let n = new Set(e.signIns.map(signInAttemptKey));
	return (t.approved ?? []).filter((e) => (e.signIns ?? []).every((e) => !n.has(signInAttemptKey(e))));
}
function startDispatchedCalls(e, t) {
	let n = new Set(Object.keys(e.projection.view.tasks));
	return unchanged(e, [
		...t.executing.map(({ callId: e, clearedBy: t }) => callStarted(e, { clearedBy: t })),
		...t.started.flatMap((t) => startTask(e, t, n).events),
		...t.refused.map(({ policy: e, result: t }) => callSettledFrom(t, {
			cause: { policy: e },
			rejected: !0
		}))
	]);
}
function startTask(e, t, n) {
	let r = [];
	return (n?.has(t.taskId) ?? e.projection.view.tasks[t.taskId] !== void 0) || (n?.add(t.taskId), r.push({
		type: `task.started`,
		data: {
			taskId: t.taskId,
			kind: t.kind,
			name: t.name,
			startedBy: { callId: t.callId }
		}
	})), r.push({
		type: `call.started`,
		data: defined({
			callId: t.callId,
			taskId: t.taskId,
			clearedBy: t.clearedBy
		})
	}), unchanged(e, r);
}
function settleTask(e, t) {
	let { outcome: n } = t;
	let r = n.status === `completed` ? n.output : void 0;
	let i = t.calls[0]?.callId;
	let a = t.calls.map(({ callId: e }, t) => fact(`call.settled`, {
		callId: e,
		error: n.status === `failed` ? {
			code: `TASK_FAILED`,
			message: n.error
		} : void 0,
		outcome: n.status === `cancelled` ? `interrupted` : n.status,
		output: t === 0 ? r : void 0,
		outputOf: t > 0 && r !== void 0 && i !== void 0 ? { callId: i } : void 0,
		reason: n.status === `cancelled` ? n.reason ?? `task-cancelled` : void 0
	}));
	return unchanged(e, a);
}
function endTask(e, t) {
	let n = e.projection.view.tasks[t.taskId];
	if (n === void 0 || n.status === `ended`) return unchanged(e, []);
	let { outcome: r } = t;
	return unchanged(e, [fact(`task.ended`, {
		error: r.status === `failed` ? {
			code: `TASK_FAILED`,
			message: r.error
		} : void 0,
		outcome: r.status,
		reason: r.status === `cancelled` ? r.reason ?? `task-ended` : void 0,
		taskId: t.taskId
	})]);
}
function finishRun(e, t) {
	let n = new Set(t.requestIds);
	let r = e.projection.view;
	let i = Object.values(r.interactions).filter((e) => e.status === `open` && (n.has(e.interactionId) || t.taskId !== void 0 && interactionOwner(r, e).taskId === t.taskId));
	return unchanged(e, i.map((e) => withdrawInteraction(e.interactionId, `asker-ended`)));
}
function withdrawInteraction(e, t, n = `withdrawn`) {
	return interactionSettled(e, n, { reason: t });
}
function relay(e, t) {
	let { payload: n } = t;
	let r = e.projection.view;
	let i = n.route === void 0 ? void 0 : {
		...n.route,
		...t.workflowAsk !== void 0 && { workflowAsk: t.workflowAsk },
		...t.runId !== void 0 && { runId: t.runId }
	};
	let a = [];
	let o = {};
	let s = r.calls[n.callId];
	let c = s !== void 0 && (s.status !== `settled` || ((e) => e !== void 0 && r.tasks[e]?.status === `running`)(s.taskId)) || Object.values(r.tasks).some((e) => e.status === `running` && e.startedBy.callId === n.callId);
	for (let e of n.events) {
		let s = e.data.interactionId;
		let l = r.interactions[s];
		let u = t.relays?.get(s) ?? i;
		if ((e.type !== `interaction.opened` || c) && (e.type === `interaction.opened` || relayedMirror(r, n, s) !== void 0)) switch (e.type) {
			case `interaction.opened`:
				if (l !== void 0) break;
				a.push({
					data: waitingSignIn(r, {
						...e.data,
						origin: e.data.origin ?? {
							interactionId: s,
							sessionId: n.childSessionId
						},
						subject: { callId: n.callId }
					}, t.callsBack),
					type: `interaction.opened`
				}), i !== void 0 && e.data.request.kind !== `sign-in` && (o[s] = i);
				break;
			case `interaction.settled`:
				if (l?.status !== `open`) break;
				a.push(...mirrorSettled(r, e.data, u));
				break;
			case `response.admitted`: {
				let t = l === void 0 ? void 0 : forwardedAnswer(r, s, e.data.deliveryId, u);
				t !== void 0 && r.responses[t]?.status === `submitted` && a.push(responseAdmitted(t));
				break;
			}
			case `response.settled`: {
				let t = l === void 0 ? void 0 : forwardedAnswer(r, s, e.data.deliveryId, u);
				t !== void 0 && e.data.outcome !== `applied` && a.push(responseSettled(t, e.data.outcome, e.data.reason));
				break;
			}
		}
	}
	return Object.keys(o).length > 0 ? {
		...unchanged(e, a),
		relays: o
	} : unchanged(e, a);
}
function relayedMirror(e, t, n) {
	let r = e.interactions[n];
	return r?.origin !== void 0 && `callId` in r.subject && r.subject.callId === t.callId ? r : void 0;
}
function mirrorSettled(e, t, n) {
	let r = t.outcome === `accepted` || t.outcome === `declined` || t.outcome === `invalid`;
	let i = t.cause !== void 0 && `deliveryId` in t.cause ? t.cause.deliveryId : void 0;
	let a = r ? forwardedAnswer(e, t.interactionId, i, n) : void 0;
	let o = a === void 0 ? [] : [responseSettled(a, `applied`, t.reason)];
	let s = a === void 0 ? t.cause !== void 0 && (`policy` in t.cause || `hook` in t.cause) ? t.cause : void 0 : { responseId: a };
	return o.push(fact(`interaction.settled`, {
		...t,
		cause: s
	})), o;
}
function forwardedAnswer(e, t, n, r) {
	let i = Object.values(e.responses).filter((e) => e.interactionId === t && e.status !== `settled`);
	if (n === void 0) return i.length === 1 ? i[0].responseId : void 0;
	if (r?.remote !== void 0) {
		let e = r.receipts ?? {};
		let t = Object.hasOwn(e, n) ? e[n] : void 0;
		return i.find((e) => e.deliveryId === t)?.responseId;
	}
	let a = forwardedFrom(n);
	return (i.find((e) => e.deliveryId === n) ?? i.find((e) => e.deliveryId === a))?.responseId;
}
function routeAnswer(e, t) {
	let n = e.projection.view;
	let r = [];
	let i = /* @__PURE__ */ new Set();
	for (let e of t.deliveries) {
		if (n.deliveries[e.deliveryId] !== void 0 || i.has(e.deliveryId)) continue;
		i.add(e.deliveryId);
		let { deliveryId: t, principal: a, source: o } = e;
		r.push(fact(`delivery.admitted`, {
			deliveryId: t,
			principal: a,
			source: o
		})), e.consumed !== void 0 && r.push(consumed({
			deliveryId: t,
			parts: e.consumed.parts
		}, e.consumed.turnId));
	}
	let known = (e) => i.has(e) || n.deliveries[e] !== void 0;
	let a = /* @__PURE__ */ new Map();
	for (let e of t.forwarded) n.responses[e.responseId] === void 0 && n.interactions[e.interactionId]?.status === `open` && known(e.deliveryId) && (a.set(e.responseId, e), r.push(responseSubmitted(e)));
	for (let { answer: e, outcome: i } of t.decided) {
		let t = n.interactions[e.interactionId];
		if (t?.status !== `open`) continue;
		let o = [...Object.values(n.responses).filter((e) => e.interactionId === t.interactionId && e.status !== `settled`).map((e) => e.responseId), ...[...a.values()].filter((e) => e.interactionId === t.interactionId).map((e) => e.responseId)].at(-1);
		o !== void 0 && r.push(responseSettled(o, `applied`)), r.push(interactionSettled(t.interactionId, i, {
			cause: o === void 0 ? void 0 : { responseId: o },
			response: e
		}));
	}
	for (let e of t.deliveries) e.consumed === void 0 && e.continues !== !0 && i.has(e.deliveryId) && r.push(deliveryApplied(e.deliveryId));
	return t.relays === void 0 ? unchanged(e, r) : {
		...unchanged(e, r),
		relays: t.relays
	};
}
function matchSignIns(e, t) {
	let n = new Set(t.attemptIds);
	return {
		...unchanged(e, []),
		signIns: e.signIns.filter((e) => !n.has(signInAttemptKey(e)))
	};
}
function callSignIns(e) {
	return e.suspended.flatMap((e) => (e.approved ?? []).flatMap((e) => e.signIns ?? []));
}
function awaitSignIns(e, t) {
	let n = stepCallIds(e);
	let r = t.stopped.filter(({ call: e }) => n.has(e.callId));
	if (r.length === 0) return e;
	let i = r.map(({ approval: n, call: r, connections: i }) => {
		let a = e.approved?.find((e) => e.call.callId === r.callId);
		let o = n?.interactionId ?? a?.interactionId;
		let s = n?.responder ?? a?.responder;
		return {
			call: r,
			...o !== void 0 && { interactionId: o },
			...s !== void 0 && { responder: s },
			signIns: [...a?.signIns ?? [], ...t.challenges.filter((e) => i.includes(e.name))]
		};
	});
	let a = new Set(i.map((e) => e.call.callId));
	return {
		...e,
		messages: withoutResults(e.messages, a),
		approved: [...(e.approved ?? []).filter((e) => !a.has(e.call.callId)), ...i]
	};
}
function signInCallbackFacts(e, t, n) {
	let r = signInInteractionId(t);
	if (e.interactions[r]?.status !== `open`) return [];
	let i = `callback_${r}`;
	let a = `response_${i}`;
	let o = interactionSettled(r, n.outcome, {
		cause: { responseId: a },
		...n.reason !== void 0 && { reason: n.reason }
	});
	return [
		{
			data: {
				deliveryId: i,
				source: { callback: `authorization` }
			},
			type: `delivery.admitted`
		},
		responseSubmitted({
			deliveryId: i,
			interactionId: r,
			responseId: a
		}),
		responseSettled(a, `applied`),
		n.retryable === !1 ? {
			...o,
			data: {
				...o.data,
				response: { retryable: !1 }
			}
		} : o,
		deliveryApplied(i)
	];
}
function callSignInsSettled(e, t, n) {
	let r = e.projection.view;
	let i = n === void 0 ? { outcome: `accepted` } : {
		...n,
		outcome: n.reason === "access_denied" ? `declined` : `failed`
	};
	return (t.signIns ?? []).flatMap((e) => signInCallbackFacts(r, e, i));
}
function completeSignIn(e, t) {
	let n = e.projection.view;
	let r = new Set(callSignIns(e.turn).map(signInAttemptKey));
	return unchanged(e, t.completions.filter((e) => !r.has(signInAttemptKey(e))).flatMap((e) => signInCallbackFacts(n, e, e.attemptId !== void 0 && t.declined.has(e.attemptId) ? {
		outcome: `declined`,
		reason: "access_denied",
		retryable: !1
	} : { outcome: `accepted` })));
}
function controlDeliveryFor(e, t) {
	return t ?? { deliveryId: `control_${String(e.projection.view.position)}` };
}
function controlled(e, t, n) {
	if (e === void 0) return n(void 0);
	let r = n({ deliveryId: e.deliveryId });
	return {
		...r,
		events: [
			controlAdmitted(e, t),
			...r.events,
			deliveryApplied(e.deliveryId)
		]
	};
}
function cancel(e, t = {}) {
	let { projection: n } = e;
	let r = activeTurnIdOf(n);
	let i = e.turn.suspended.filter((e) => r !== void 0 && e.event.turnId === r || e.tasks.some((t) => !answeredCallIds(e.messages).has(t.callId)) || (e.approved?.length ?? 0) > 0);
	let a = new Set(i.flatMap((e) => e.requests.map((e) => e.interactionId)));
	let o = n.view;
	let s = Object.values(o.interactions).filter((t) => t.status === `open` && (e.relayedRequestIds.has(t.interactionId) || a.has(t.interactionId) || t.request.kind === `budget`)).map((e) => withdrawInteraction(e.interactionId, `Cancelled.`, `interrupted`));
	s.push(...turnSettled(n, {
		cause: t.cause,
		outcome: `cancelled`
	}, activeTurn$1(o)?.turnId ?? r), ...unreadSettled(e));
	let { queued: c, ...l } = e.turn;
	return transition({
		...commitSteps(l, i, cancelledTranscript),
		events: s,
		signIns: []
	});
}
function unreadSettled(e) {
	let t = e.projection.view;
	return (e.turn.queued?.deliveries ?? []).filter(({ deliveryId: e }) => t.deliveries[e]?.status === `admitted`).map(({ deliveryId: e }) => fact(`delivery.settled`, {
		deliveryId: e,
		outcome: `ignored`
	}));
}
function cancelledTranscript(e) {
	return stoppedTranscript(e, () => "The turn was cancelled before this call finished.");
}
function stopInterruptedSteps(e, t) {
	let n = e.turn.suspended.filter((e) => e.requests.some((e) => t.settledInteractions.has(e.interactionId)) || [...stepCallIds(e)].some((e) => t.calls.get(e)?.started === !0));
	return transition({
		...commitSteps(e.turn, n, (e) => stoppedTranscript(e, (e) => interruptedCallResult(t.calls.get(e)))),
		events: []
	});
}
function commitSteps(e, t, n = (e) => e.messages) {
	let r = new Set(t);
	return {
		history: { append: t.flatMap(n) },
		turn: {
			...e,
			suspended: e.suspended.filter((e) => !r.has(e))
		}
	};
}
function stoppedTranscript(e, t) {
	let n = answeredCallIds(e.messages);
	let r = [...e.messages];
	for (let i of e.messages) if (i.role === `assistant` && typeof i.content != `string`) for (let e of i.content) e.type === `tool-call` && e.providerExecuted !== !0 && (n.has(e.toolCallId) || (r = withResult(r, {
		output: {
			type: `text`,
			value: t(e.toolCallId)
		},
		toolCallId: e.toolCallId,
		toolName: e.toolName,
		type: `tool-result`
	})));
	return r;
}
function clear(e, t = {}) {
	let { projection: n } = e;
	let r = nextChangeId(n);
	return transition({
		history: { rewrite: [] },
		signIns: [],
		events: [
			...clearedInteractions(e),
			...turnSettled(n, {
				cause: t.cause,
				outcome: `cancelled`
			}),
			...unreadSettled(e),
			contextStarted({
				cause: t.cause,
				changeId: r,
				kind: `clear`
			}),
			fact(`context.settled`, {
				changeId: r,
				kind: `clear`,
				outcome: `completed`,
				selects: null
			})
		],
		turn: {
			remembered: e.turn.remembered,
			suspended: []
		}
	});
}
function clearedInteractions(e) {
	let t = e.projection.view;
	return Object.values(t.interactions).filter((t) => t.status === `open` && !e.relayedRequestIds.has(t.interactionId)).map((e) => withdrawInteraction(e.interactionId, `The context was cleared.`, `interrupted`));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/tool-output-serialization.js
var ToolOutputSerializationError = class extends TypeError {
	toolCallId;
	toolName;
	constructor(e) {
		super(formatToolOutputSerializationMessage(e)), this.name = `ToolOutputSerializationError`, this.toolCallId = e.toolCallId, this.toolName = e.toolName, e.cause !== void 0 && (this.cause = e.cause);
	}
};
function formatToolOutputSerializationMessage(e) {
	return `${e.toolCallId === void 0 ? `Tool "${e.toolName}"` : `Tool "${e.toolName}" call "${e.toolCallId}"`} ${e.boundary === `execute` ? `returned a non-JSON-serializable result` : e.boundary === `toModelOutput` ? `returned a non-JSON-serializable model output` : `produced a non-JSON-serializable action result`}.${e.cause instanceof Error && e.cause.message.length > 0 ? ` ${e.cause.message}` : ``}`;
}
function withToolOutputSerializationError(e, t) {
	try {
		return t();
	} catch (t) {
		throw t instanceof ToolOutputSerializationError ? t : new ToolOutputSerializationError({
			boundary: e.boundary,
			cause: t,
			toolCallId: e.toolCallId,
			toolName: e.toolName
		});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/action-result-helpers.js
function toJsonValue(e) {
	return isAuthorizationSignal(e) ? parseJsonValue(authorizationPendingAsJsonObject({ connections: e.challenges.map((e) => e.name) })) : isAuthorizationPendingModelOutput(e) ? parseJsonValue(authorizationPendingAsJsonObject(e)) : parseJsonValue(e === void 0 ? null : e);
}
function createRuntimeToolResultFromValue(e) {
	let t = e.isError === !0 && e.output instanceof Error ? e.output : void 0;
	let n = {
		callId: e.callId,
		kind: `tool-result`,
		output: toolResultOutputToJsonValue({
			output: {
				type: e.isError === !0 ? `error-json` : `json`,
				value: t === void 0 ? e.output : t.message
			},
			toolCallId: e.callId,
			toolName: e.toolName
		}),
		toolName: e.toolName
	};
	return e.isError === !0 ? t === void 0 ? {
		...n,
		isError: !0
	} : {
		...n,
		errorName: t.name,
		isError: !0
	} : n;
}
function createRuntimeToolResultFromStepResult(e) {
	return createRuntimeToolResultFromValue({
		callId: e.toolCallId,
		output: e.output,
		toolName: e.toolName
	});
}
function createRuntimeToolResultFromToolError(e) {
	return createRuntimeToolResultFromValue({
		callId: e.toolCallId,
		isError: !0,
		output: toError(e.error),
		toolName: e.toolName
	});
}
function createToolResultMessagePartFromToolError(e) {
	return {
		type: `tool-result`,
		toolCallId: e.toolCallId,
		toolName: e.toolName,
		output: {
			type: `error-text`,
			value: toError(e.error).message
		}
	};
}
function createRuntimeToolResultFromMessagePart(e, t) {
	return createRuntimeToolResultFromValue({
		callId: e.toolCallId,
		output: toolResultOutputToJsonValue({
			output: e.output,
			toolCallId: e.toolCallId,
			toolName: t
		}),
		toolName: t,
		isError: isToolResultError(e.output)
	});
}
function toolResultOutputToJsonValue(e) {
	return withToolOutputSerializationError({
		boundary: `action.result`,
		toolCallId: e.toolCallId,
		toolName: e.toolName
	}, () => {
		switch (e.output.type) {
			case `text`:
			case `error-text`: return e.output.value;
			case `json`:
			case `error-json`: return toJsonValue(e.output.value);
			case `execution-denied`: return {
				code: `TOOL_EXECUTION_DENIED`,
				message: e.output.reason ?? `Tool execution was denied.`
			};
			case `content`: return toJsonValue(e.output.value);
		}
	});
}
function isToolResultError(e) {
	return e.type === `error-json` || e.type === `error-text` || e.type === `execution-denied`;
}
function resolveApprovalOutcome(e) {
	if (e === void 0) return {
		approved: !1,
		reason: `Ignored because the user continued without responding.`,
		status: `ignored`
	};
	if (e.optionId === `approve`) return {
		approved: !0,
		reason: void 0,
		status: `approved`
	};
	if (e.optionId === `cancel` || e.optionId === `deny`) {
		let t = e.text?.trim();
		return {
			approved: !1,
			reason: t ? `Tool execution was denied. The person who denied it wrote: ${JSON.stringify(t)}` : "Tool execution was denied.",
			status: `denied`
		};
	}
	return {
		approved: !1,
		reason: `Invalid approval response.`,
		status: `invalid`
	};
}
function unavailableToolMessage(e, t) {
	return `The tool "${e}" is no longer available, so the call didn't run. If the task still needs it, ${t ? `find an available tool with eve__search and make a new call` : `make a new call with an available tool`}.`;
}
function changedSinceOffered(e, t) {
	return t !== void 0 && e.version !== t.version;
}
function changedToolMessage(e) {
	return `The tool "${e}" changed since it was offered, so the call didn't run. If the task still needs it, request it again.`;
}
function failedCall(e) {
	let { callId: t, message: n, toolName: r } = e;
	return {
		part: {
			output: {
				type: `error-text`,
				value: n instanceof Error ? n.message : n
			},
			toolCallId: t,
			toolName: r,
			type: `tool-result`
		},
		result: createRuntimeToolResultFromValue({
			callId: t,
			isError: !0,
			output: n,
			toolName: r
		})
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/approvals.js
function askApprovals(e, t) {
	let n = t.requester?.principalType === `anonymous` ? null : t.requester;
	let r = t.messages.findIndex((e) => e.role !== `tool`);
	let i = r === -1 ? t.messages : t.messages.slice(0, r);
	let a = suspend(e.turn, {
		...t.endsTurn === !0 && { endsTurn: !0 },
		event: t.event,
		messages: t.messages.slice(i.length),
		requester: n,
		requests: t.requests,
		responseAuthRequiredRequestIds: t.responseAuthRequiredRequestIds,
		tasks: t.tasks
	});
	return transition({
		history: { append: i },
		events: t.tasks.length > 0 ? [] : t.requests.map((e) => approvalOpened(e)),
		turn: a
	});
}
function openDeferredApprovals(e) {
	let t = e.projection.view;
	let n = e.turn.suspended.flatMap((e) => e.tasks.length === 0 || runningTasks(e).length > 0 || e.requests.some((e) => t.interactions[e.interactionId] !== void 0) ? [] : e.requests.map((e) => approvalOpened(e)));
	return transition({
		events: n,
		turn: e.turn
	});
}
function dispatch(e, t) {
	let n = e.turn.suspended.map((e) => {
		let n = stepCallIds(e);
		let r = t.tasks.filter((e) => n.has(e.callId));
		return r.length === 0 ? e : {
			...withoutApproved(e, new Set(r.map((e) => e.callId))),
			tasks: [...e.tasks, ...r]
		};
	});
	return transition({
		events: [],
		turn: {
			...e.turn,
			suspended: n
		}
	});
}
function queueInput(e, t) {
	return transition({
		events: [],
		turn: withQueued(e.turn, t)
	});
}
function withQueued(e, t) {
	return t === void 0 || isEmptyInput(t) ? e : {
		...e,
		queued: e.queued === void 0 ? t : coalesceTurnInputs(e.queued, t)
	};
}
function admitAnswers(e, t) {
	let { check: n, delivery: r } = t;
	let i = e.projection.view;
	let a = responseLedger(i);
	a.submit(r?.answers ?? []);
	for (let { reason: e, responseId: t } of n.refused) t !== void 0 && a.settle(t, `refused`, e);
	for (let e of n.admit) a.admit(e);
	let o = n.refused.map(({ reason: e }) => e).join(`
`);
	let s = new Set(n.refused.map(({ responseId: e }) => e));
	let c = (r?.answers ?? []).filter(({ responseId: e }) => s.has(e)).map(({ deliveryId: e }) => e);
	let l = c.length === n.refused.length && c.every((e) => e !== void 0);
	let u = [...new Set(l ? c : (r?.deliveries ?? []).map(({ deliveryId: e }) => e))].filter((e) => i.deliveries[e]?.status !== `settled`).map((e) => ({
		data: {
			deliveryId: e,
			outcome: `refused`,
			reason: o
		},
		type: `delivery.settled`
	}));
	return transition({
		events: [...a.facts(), ...u],
		responders: n.weigh,
		turn: e.turn
	});
}
function standingAnswers(e) {
	let t = /* @__PURE__ */ new Map();
	let n = Object.values(e.responses).sort((e, t) => e.introducedAt - t.introducedAt);
	for (let e of n) e.status === `admitted` && t.set(e.interactionId, e);
	return t;
}
function responseOf(e, t) {
	if (t?.value === void 0) return;
	let n = { interactionId: e };
	return t.value.optionId !== void 0 && (n.optionId = t.value.optionId), t.value.text !== void 0 && (n.text = t.value.text), n;
}
function settleApprovals(e, t) {
	let n = e.projection.view;
	let r = standingAnswers(n);
	let answerOf = (e) => responseOf(e.interactionId, r.get(e.interactionId));
	let i = responseLedger(n);
	let a = [];
	let o = !1;
	let s = [];
	let c = [];
	let decide = (e, t, n) => {
		let a = t === `withdrawn` ? void 0 : r.get(e.interactionId);
		a !== void 0 && i.settle(a.responseId, `applied`), a !== void 0 && (t === `accepted` || t === `declined`) && c.push({
			at: a.introducedAt,
			outcome: t,
			request: e
		}), i.closeOthers(e.interactionId, a?.responseId), s.push(interactionSettled(e.interactionId, t, {
			cause: a === void 0 ? void 0 : { responseId: a.responseId },
			reason: n,
			response: t === `withdrawn` ? void 0 : answerOf(e)
		}));
	};
	let l = e.turn.suspended.map((i) => {
		let c = pendingApprovals(e, i).filter((e) => n.interactions[e.interactionId] !== void 0);
		if (c.length === 0) return i;
		let l = c.every((e) => answerOf(e) !== void 0);
		if (!t.steer && !l) return i;
		o ||= l;
		let u = i.messages;
		for (let t of c) {
			let { callId: n, toolName: o } = t.call;
			let { approved: c, reason: l, status: d } = resolveApprovalOutcome(answerOf(t));
			if (c) {
				let n = e.responders[r.get(t.interactionId)?.responseId ?? ``];
				a.push({
					approval: {
						call: t.call,
						interactionId: t.interactionId,
						...n !== void 0 && { responder: n.responder }
					},
					step: i
				}), decide(t, `accepted`);
				continue;
			}
			d === `ignored` ? decide(t, `withdrawn`, "superseded-by-message") : decide(t, d === `invalid` ? `invalid` : `declined`), u = withResult(u, {
				output: {
					reason: l,
					type: `execution-denied`
				},
				toolCallId: n,
				toolName: o,
				type: `tool-result`
			});
			let f = callSettledFrom({
				callId: n,
				isError: !0,
				kind: `tool-result`,
				output: {
					approval: {
						interactionId: t.interactionId,
						status: d
					},
					code: `TOOL_EXECUTION_DENIED`,
					message: l ?? "Tool execution was denied.",
					tool: { result: `not_run` }
				},
				toolName: o
			}, { rejected: !0 });
			s.push({
				...f,
				data: {
					...f.data,
					cause: { interactionId: t.interactionId }
				}
			});
		}
		return {
			...i,
			messages: u
		};
	});
	let declinedLast = (e) => +(e.outcome === `declined`);
	let u = c.sort((e, t) => e.at - t.at || declinedLast(e) - declinedLast(t)).reduce((e, t) => rememberDecision(e, t.request, t.outcome), e.turn.remembered);
	return transition({
		answered: o,
		approved: a,
		events: [...i.facts(), ...s],
		turn: {
			...e.turn,
			remembered: u,
			suspended: l
		}
	});
}
function withdrawUnavailable(e, t) {
	let n = e.projection.view;
	let r = responseLedger(n);
	let i = new Set(t.interactionIds);
	let a = [];
	let o = e.turn.suspended.map((n) => {
		let o = n.messages;
		for (let s of pendingApprovals(e, n)) {
			if (!i.has(s.interactionId)) continue;
			let { callId: e, toolName: n } = s.call;
			let c = unavailableToolMessage(n, t.searchable);
			let l = failedCall({
				callId: e,
				message: c,
				toolName: n
			});
			o = withResult(o, l.part), r.closeOthers(s.interactionId, void 0), a.push(interactionSettled(s.interactionId, `withdrawn`, { reason: c }), callSettledFrom(l.result));
		}
		return o === n.messages ? n : {
			...n,
			messages: o
		};
	});
	return transition({
		events: [...r.facts(), ...a],
		turn: {
			...e.turn,
			suspended: o
		}
	});
}
function approvalMemory(e) {
	return {
		pending: e.turn.suspended.flatMap((t) => pendingApprovals(e, t).flatMap((e) => e.remember === void 0 ? [] : [e.remember.key])),
		remembered: e.turn.remembered
	};
}
function openLimit(e) {
	let t = ownOpenRequestIds(e);
	let n = e.projection.view;
	let r = openRequests(n).find((e) => e.request.kind === `budget` && t.has(e.interactionId));
	return r === void 0 ? void 0 : {
		row: r,
		turnId: interactionOwner(n, r).turnId
	};
}
function requestLimit(e, t) {
	let { turnId: n } = turnPosition(e.projection);
	return transition({
		events: [interactionOpened({
			...t,
			subject: { turnId: n }
		})],
		turn: e.turn
	});
}
function settleLimit(e) {
	let t = openLimit(e);
	let n = e.projection.view;
	let r = t?.row.interactionId;
	let i = r === void 0 ? void 0 : standingAnswers(n).get(r);
	let a = r === void 0 ? void 0 : responseOf(r, i);
	if (t === void 0 || r === void 0 || i === void 0 || a === void 0) return transition({
		events: [],
		turn: e.turn
	});
	let o = responseLedger(n);
	let s = limitDecision(a);
	return s === void 0 ? (o.settle(i.responseId, `refused`, `The budget prompt takes Continue or Stop.`), transition({
		events: o.facts(),
		turn: e.turn
	})) : (o.settle(i.responseId, `applied`), o.closeOthers(r, i.responseId), transition({
		events: [...o.facts(), interactionSettled(r, s.granted ? `accepted` : `declined`, {
			cause: { responseId: i.responseId },
			response: a
		})],
		limit: s,
		turn: e.turn
	}));
}
function withdrawSignIns(e, t) {
	let n = e.projection.view;
	let r = e.turn.suspended.flatMap((t) => (t.approved ?? []).filter((n) => !runnableCalls(e, t).includes(n)));
	let i = [...e.signIns, ...r.flatMap((e) => e.signIns ?? [])];
	let a = [...new Map(i.map((e) => [signInAttemptKey(e), e])).values()].flatMap((e) => {
		let r = signInInteractionId(e);
		return n.interactions[r]?.status === `open` ? [interactionSettled(r, `withdrawn`, { reason: t })] : [];
	});
	let o = settle(e, { results: r.map(({ call: e }) => failedCall({
		callId: e.callId,
		message: t,
		toolName: e.toolName
	})) });
	return transition({
		...o,
		events: [...a, ...o.events],
		signIns: []
	});
}
function requireSignIn(e, t) {
	let { turnId: n } = turnPosition(e.projection);
	let r = e.projection.view;
	let i = t.challenges.filter((e) => r.interactions[signInInteractionId(e)] === void 0);
	let a = new Set(supersededChallenges(e.signIns, t.challenges).map(signInInteractionId).filter((e) => r.interactions[e]?.status === `open`));
	let o = [...[...a].map((e) => interactionSettled(e, `abandoned`, { reason: `Superseded by a newer authorization attempt.` })), ...i.map((e) => {
		let i = signInOpened(e, { subject: e.candidateId !== void 0 && r.responses[e.candidateId] !== void 0 ? { responseId: e.candidateId } : { turnId: n } });
		return {
			...i,
			data: waitingSignIn(r, i.data, t.callsBack, a)
		};
	})];
	let s = withQueued(e.turn, t.queued);
	let c = withSignIns(e.signIns, t.challenges);
	let { calls: l } = t;
	let u = l === void 0 ? s.suspended : s.suspended.map((e) => awaitSignIns(e, {
		challenges: t.challenges,
		stopped: l
	}));
	return transition({
		events: o,
		signIns: c,
		turn: {
			...s,
			suspended: u
		}
	});
}
function responseLedger(e) {
	let t = [];
	let n = /* @__PURE__ */ new Map();
	let r = /* @__PURE__ */ new Map();
	for (let t of Object.values(e.responses)) r.set(t.responseId, t.status);
	let submit = (i) => {
		for (let a of i) {
			let { deliveryId: i, interactionId: o, optionId: s, responseId: c, text: l } = a;
			if (r.has(c) || e.interactions[o]?.status !== `open`) continue;
			n.set(c, a), r.set(c, `submitted`);
			let u = {};
			s !== void 0 && (u.optionId = s), l !== void 0 && (u.text = l), t.push(responseSubmitted({
				deliveryId: i,
				interactionId: o,
				responseId: c,
				value: u
			}));
		}
	};
	let interactionOf = (t) => n.get(t)?.interactionId ?? e.responses[t]?.interactionId;
	let order = (t) => e.responses[t]?.introducedAt ?? 2 ** 53 - 1;
	let openFor = (e) => [...r].filter(([t, n]) => n !== `settled` && interactionOf(t) === e).map(([e]) => e).sort((e, t) => order(e) - order(t));
	let settle = (e, n, i) => {
		let a = r.get(e);
		a !== void 0 && a !== `settled` && (r.set(e, `settled`), t.push(responseSettled(e, n, i)));
	};
	return {
		admit(e) {
			if (r.get(e) !== `submitted`) return;
			let n = interactionOf(e);
			if (n !== void 0) for (let t of openFor(n)) t !== e && r.get(t) === `admitted` && settle(t, `abandoned`, `revised`);
			r.set(e, `admitted`), t.push(responseAdmitted(e));
		},
		closeOthers(e, t) {
			for (let n of openFor(e)) n !== t && settle(n, r.get(n) === `admitted` ? `abandoned` : `withdrawn`);
		},
		facts: () => t,
		submit,
		settle
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/sign-in-callbacks.js
function ownCallbacks(e, t) {
	return {
		origin: new URL(vercelConnectCallbackUrl(t)).origin,
		sessionId: e
	};
}
function localSignInCallback(e, t) {
	let n = e.request.signIn?.callbackUrl;
	if (n === void 0 || !URL.canParse(n)) return;
	let r = new URL(n);
	if (r.origin !== t.origin) return;
	let i = parseEveConnectionCallbackRoutePath(r.pathname);
	let a = e.origin?.sessionId ?? t.sessionId;
	return i?.token === authHookToken(a) ? i : void 0;
}
function callsBackFor(e) {
	return (t) => localSignInCallback(t, e) !== void 0;
}
const ResumeSignInKey = new ContextKey(`eve.resumeSignIn`);
function stepCallbacks(e) {
	let t = e.ctx.get(CallbackBaseUrlKey);
	return t === void 0 ? void 0 : ownCallbacks(e.session.sessionId, t);
}
function stepCallsBack(e) {
	let t = stepCallbacks(e);
	return t === void 0 ? void 0 : callsBackFor(t);
}
async function applyEndingSignIns(e, t, n) {
	let r = stepCallbacks(e);
	if (r !== void 0) {
		let n = e.view().projection.view;
		let i = t.events.flatMap((e) => {
			if (e.type !== `interaction.settled`) return [];
			let { interactionId: t, outcome: i, reason: a } = e.data;
			return i === `accepted` || i === `declined` ? [] : signInsEnded(n, {
				interactionId: t,
				reason: a ?? i
			}, r);
		});
		i.length > 0 && await settleSignIns(e.ctx.require(ResumeSignInKey), i);
	}
	await e.apply(t, n);
}
function signInsEnded(e, t, n) {
	return Object.values(e.interactions).flatMap((e) => {
		if (e.status !== `open` || e.request.signIn?.waitsOn !== t.interactionId) return [];
		let r = localSignInCallback(e, n);
		return r === void 0 ? [] : [{
			callback: r,
			params: { error: t.reason }
		}];
	});
}
async function settleSignIns(e, t) {
	await Promise.all(t.map(({ callback: t, params: n }) => e(t.token, {
		kind: `authorization-callback`,
		payloads: [{ authorizationCallback: {
			attemptId: t.attemptId,
			callback: {
				method: `GET`,
				params: n
			},
			connectionName: t.name
		} }]
	})));
}
function signInsAnswered(e, t, n) {
	let r = t.outcome === `declined` ? { error: "access_denied" } : {};
	return Object.values(e.interactions).flatMap((e) => {
		if (e.interactionId === t.interactionId || e.status !== `open` || `responseId` in e.subject || e.request.signIn === void 0 || !sameRelayedSignIn(e.request.signIn, t.signIn)) return [];
		let i = localSignInCallback(e, n);
		return i === void 0 ? [] : [{
			callback: i,
			params: r
		}];
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/budget.js
const DEFAULT_SESSION_USAGE_LIMIT = ({ window: e }) => e.inputTokens - e.cacheReadTokens >= 4e7;
function checkSessionUsageLimit(e) {
	let t = e.usage;
	let n = e.window ?? storedProjection(e.session.state).usageWindow;
	let r = usageSince(t, n?.start);
	return r.inputTokens === 0 && r.outputTokens === 0 && !r.costUsd || !e.limit({
		total: { ...t },
		window: { ...r }
	}) ? { kind: `within` } : e.canAsk ? {
		kind: `ask`,
		ask: createSessionLimitContinuationRequest({
			sessionId: e.session.sessionId,
			turnSequence: e.turnSequence,
			windowIndex: n?.index ?? 0
		})
	} : {
		kind: `fail`,
		code: `SESSION_USAGE_LIMIT_REACHED`,
		details: {
			total: toJsonUsage(t),
			window: toJsonUsage(r)
		},
		message: `The session reached its usage limit.`
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/clearance.js
function mintClearance(e, t) {
	return t === void 0 ? { callId: e } : {
		callId: e,
		clearedBy: t
	};
}
function approvedClearance(e, t) {
	let n = Object.values(e.interactions).filter((e) => e.request.kind === `approval` && e.origin === void 0 && `callId` in e.subject && e.subject.callId === t).sort((e, t) => e.introducedAt - t.introducedAt).at(-1);
	if (n?.status === `settled` && n.outcome === `accepted`) return mintClearance(t, { interactionId: n.interactionId });
}
function requireClearance(e, t) {
	if (e.callId !== t) throw Error(`Call "${t}" can't run on the clearance of call "${e.callId}".`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/tool-model-output.js
function toolModelOutputContext(e, t, n = {}) {
	let r = n.sandboxOutlivesCall ?? !0;
	return {
		callId: t,
		defaultModelOutput: defaultToolModelOutput,
		getSandbox: async () => r ? await loadContext().get(SandboxKey)?.get() ?? void 0 : void 0,
		toolName: e,
		[WARN_ONCE]: (t, n, r) => {
			let i = loadContext();
			let a = i.get(WarnedKey) ?? [];
			a.includes(t) || (i.set(WarnedKey, [...a, t]), log$9.warn(n, {
				toolName: e,
				...r
			}));
		}
	};
}
const log$9 = createLogger(`harness.tool-model-output`);
const WarnedKey = new ContextKey(`eve.toolModelOutput.warned`);
const CONTENT_FILE_WARN_BYTES = 3145728;
const UNSUPPORTED_FILE_DATA_TAGS = /* @__PURE__ */ new Set([`reference`, `text`]);
const toolModelOutputPartSchema = z.discriminatedUnion(`type`, [z.object({
	type: z.literal(`text`),
	text: z.string()
}), z.object({
	type: z.literal(`file`),
	data: z.discriminatedUnion(`type`, [z.object({
		type: z.literal(`data`),
		data: z.string()
	}), z.object({
		type: z.literal(`url`),
		url: z.string()
	})]),
	mediaType: z.string().min(1),
	filename: z.string().optional()
})]);
const toolModelOutputSchema = z.discriminatedUnion(`type`, [
	z.object({
		type: z.literal(`text`),
		value: z.string()
	}),
	z.object({
		type: z.literal(`error-text`),
		value: z.string()
	}),
	z.object({
		type: z.literal(`json`),
		value: z.unknown()
	}),
	z.object({
		type: z.literal(`content`),
		value: z.array(toolModelOutputPartSchema).min(1)
	})
]);
function normalizeToolJsonOutput(e) {
	let t = e.output === void 0 ? null : e.output;
	return withToolOutputSerializationError(e, () => (parseJsonValue(t), t));
}
function normalizeToolModelOutput(e) {
	return withToolOutputSerializationError({
		boundary: `toModelOutput`,
		toolCallId: e.toolCallId,
		toolName: e.toolName
	}, () => {
		assertSupportedFilePartData(e.output);
		let t = toolModelOutputSchema.safeParse(e.output);
		if (!t.success) throw TypeError(formatValidationError(t.error));
		let n = t.data;
		return n.type === `json` ? {
			type: `json`,
			value: normalizeToolJsonOutput({
				boundary: `toModelOutput`,
				output: n.value,
				toolCallId: e.toolCallId,
				toolName: e.toolName
			})
		} : n.type === `content` ? {
			type: `content`,
			value: n.value.map((t) => normalizeContentPart(t, e.toolName))
		} : n;
	});
}
function normalizeContentPart(e, t) {
	return e.type === `text` ? e : e.data.type === `data` ? (warnOversizedFilePayload(e.data.data, e.mediaType, t), {
		...e,
		data: e.data
	}) : {
		...e,
		data: {
			type: `url`,
			url: parseFileUrl(e.data.url)
		}
	};
}
function parseFileUrl(e) {
	let t = URL.canParse(e) ? new URL(e) : void 0;
	if (t?.protocol !== `https:`) {
		let e = t === void 0 ? `a value that is not a URL` : `a ${t.protocol} URL`;
		throw TypeError(`Expected file content part url to be an https: URL, received ${e}.`);
	}
	return t;
}
function assertSupportedFilePartData(e) {
	if (typeof e != `object` || !e) return;
	let t = e;
	if (t.type === `content` && Array.isArray(t.value)) for (let e of t.value) {
		if (typeof e != `object` || !e) continue;
		let t = e;
		if (t.type !== `file`) continue;
		let n = t.data;
		let r = typeof n == `object` && n ? n.data : void 0;
		if (isBinaryPayload(n) || isBinaryPayload(r)) throw TypeError(`Expected file content part data to be a base64 string, received raw bytes. Base64-encode binary payloads before returning them from toModelOutput.`);
		let i = typeof n == `object` && n ? n.type : void 0;
		if (typeof i == `string` && UNSUPPORTED_FILE_DATA_TAGS.has(i)) throw TypeError(`File content part data tag "${i}" is not supported yet; use { type: "data" } with a base64 string or { type: "url" } with an https: URL.`);
	}
}
function warnOversizedFilePayload(e, t, n) {
	let r = Math.floor(e.length * 3 / 4);
	r <= CONTENT_FILE_WARN_BYTES || log$9.warn(`content-part file payload exceeds the inline size guideline — it is persisted in history and re-sent on every subsequent model call`, {
		estimatedBytes: r,
		mediaType: t,
		toolName: n,
		warnBytes: CONTENT_FILE_WARN_BYTES
	});
}
function isBinaryPayload(e) {
	return e instanceof Uint8Array || e instanceof ArrayBuffer;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/provider-tool-schemas.js
const WEB_SEARCH_OPENAI_OUTPUT_SCHEMA = {
	$schema: `http://json-schema.org/draft-07/schema#`,
	additionalProperties: !1,
	properties: {
		action: { oneOf: [
			{
				additionalProperties: !1,
				properties: {
					queries: {
						items: { type: `string` },
						type: `array`
					},
					query: { type: `string` },
					type: {
						const: `search`,
						type: `string`
					}
				},
				required: [`type`],
				type: `object`
			},
			{
				additionalProperties: !1,
				properties: {
					type: {
						const: `openPage`,
						type: `string`
					},
					url: { anyOf: [{ type: `string` }, { type: `null` }] }
				},
				required: [`type`],
				type: `object`
			},
			{
				additionalProperties: !1,
				properties: {
					pattern: { anyOf: [{ type: `string` }, { type: `null` }] },
					type: {
						const: `findInPage`,
						type: `string`
					},
					url: { anyOf: [{ type: `string` }, { type: `null` }] }
				},
				required: [`type`],
				type: `object`
			}
		] },
		sources: {
			items: { oneOf: [{
				additionalProperties: !1,
				properties: {
					type: {
						const: `url`,
						type: `string`
					},
					url: { type: `string` }
				},
				required: [`type`, `url`],
				type: `object`
			}, {
				additionalProperties: !1,
				properties: {
					name: { type: `string` },
					type: {
						const: `api`,
						type: `string`
					}
				},
				required: [`type`, `name`],
				type: `object`
			}] },
			type: `array`
		}
	},
	type: `object`
};
const WEB_SEARCH_ANTHROPIC_OUTPUT_SCHEMA = {
	$schema: `http://json-schema.org/draft-07/schema#`,
	items: {
		additionalProperties: !1,
		properties: {
			encryptedContent: { type: `string` },
			pageAge: { anyOf: [{ type: `string` }, { type: `null` }] },
			title: { anyOf: [{ type: `string` }, { type: `null` }] },
			type: {
				const: `web_search_result`,
				type: `string`
			},
			url: { type: `string` }
		},
		required: [
			`url`,
			`title`,
			`pageAge`,
			`encryptedContent`,
			`type`
		],
		type: `object`
	},
	type: `array`
};
const WEB_SEARCH_GOOGLE_OUTPUT_SCHEMA = {
	$schema: `http://json-schema.org/draft-07/schema#`,
	additionalProperties: !1,
	properties: {},
	type: `object`
};
const WEB_SEARCH_EXA_OUTPUT_SCHEMA = {
	$schema: `http://json-schema.org/draft-07/schema#`,
	anyOf: [{
		properties: {
			costDollars: {
				additionalProperties: !1,
				properties: {
					search: {
						additionalProperties: { type: `number` },
						type: `object`
					},
					total: { type: `number` }
				},
				type: `object`
			},
			requestId: { type: `string` },
			resolvedSearchType: { type: `string` },
			results: {
				items: {
					properties: {
						author: { anyOf: [{ type: `string` }, { type: `null` }] },
						entities: {
							items: {
								properties: {
									id: { type: `string` },
									properties: { type: `object` },
									type: { type: `string` },
									version: { type: `number` }
								},
								required: [
									`id`,
									`type`,
									`version`,
									`properties`
								],
								type: `object`
							},
							type: `array`
						},
						extras: {
							additionalProperties: !1,
							properties: {
								imageLinks: {
									items: { type: `string` },
									type: `array`
								},
								links: {
									items: { type: `string` },
									type: `array`
								}
							},
							type: `object`
						},
						favicon: { anyOf: [{ type: `string` }, { type: `null` }] },
						highlightScores: {
							items: { type: `number` },
							type: `array`
						},
						highlights: {
							items: { type: `string` },
							type: `array`
						},
						id: { type: `string` },
						image: { anyOf: [{ type: `string` }, { type: `null` }] },
						publishedDate: { anyOf: [{ type: `string` }, { type: `null` }] },
						score: { anyOf: [{ type: `number` }, { type: `null` }] },
						subpages: {
							items: {},
							type: `array`
						},
						summary: { type: `string` },
						text: { type: `string` },
						title: { anyOf: [{ type: `string` }, { type: `null` }] },
						url: { type: `string` }
					},
					required: [`url`, `id`],
					type: `object`
				},
				type: `array`
			},
			searchTime: { type: `number` },
			searchType: { type: `string` }
		},
		required: [`requestId`, `results`],
		type: `object`
	}, {
		additionalProperties: !1,
		properties: {
			error: {
				enum: [
					`api_error`,
					`rate_limit`,
					`timeout`,
					`invalid_input`,
					`configuration_error`,
					`execution_error`,
					`unknown`
				],
				type: `string`
			},
			message: { type: `string` },
			statusCode: { type: `number` }
		},
		required: [`error`, `message`],
		type: `object`
	}]
};
const WEB_SEARCH_PARALLEL_OUTPUT_SCHEMA = {
	$schema: `http://json-schema.org/draft-07/schema#`,
	anyOf: [{
		additionalProperties: !1,
		properties: {
			results: {
				items: {
					additionalProperties: !1,
					properties: {
						excerpt: { type: `string` },
						publishDate: { anyOf: [{ type: `string` }, { type: `null` }] },
						relevanceScore: { type: `number` },
						title: { type: `string` },
						url: { type: `string` }
					},
					required: [
						`url`,
						`title`,
						`excerpt`
					],
					type: `object`
				},
				type: `array`
			},
			searchId: { type: `string` }
		},
		required: [`searchId`, `results`],
		type: `object`
	}, {
		additionalProperties: !1,
		properties: {
			error: {
				enum: [
					`api_error`,
					`rate_limit`,
					`timeout`,
					`invalid_input`,
					`configuration_error`,
					`unknown`
				],
				type: `string`
			},
			message: { type: `string` },
			statusCode: { type: `number` }
		},
		required: [`error`, `message`],
		type: `object`
	}]
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/provider-tools.js
const UPSTREAM_TOOL_TYPE_TO_FRAMEWORK_NAME = {
	web_search_20250305: "web_search",
	web_search: "web_search",
	"web_search_call.action.sources": "web_search"
};
function resolveFrameworkToolFromUpstreamType(e) {
	return UPSTREAM_TOOL_TYPE_TO_FRAMEWORK_NAME[e] ?? null;
}
function resolveWebSearchOutputSchema(e) {
	switch (e) {
		case `anthropic`: return WEB_SEARCH_ANTHROPIC_OUTPUT_SCHEMA;
		case `exa`: return WEB_SEARCH_EXA_OUTPUT_SCHEMA;
		case `google`: return WEB_SEARCH_GOOGLE_OUTPUT_SCHEMA;
		case `openai`: return WEB_SEARCH_OPENAI_OUTPUT_SCHEMA;
		case `parallel`: return WEB_SEARCH_PARALLEL_OUTPUT_SCHEMA;
	}
}
function resolveWebSearchBackend(e, t = { provider: `parallel` }) {
	return e.gateway ? t.provider === `native` ? resolveNativeWebSearchBackend(e) ?? t.fallback ?? null : t.provider : resolveNativeWebSearchBackend(e);
}
function resolveNativeWebSearchBackend(e) {
	return !NATIVE_WEB_SEARCH_BACKENDS.has(e.provider) || e.provider === `google` && e.googleSearchDropsTools ? null : e.provider;
}
const NATIVE_WEB_SEARCH_BACKENDS = /* @__PURE__ */ new Set([
	`anthropic`,
	`google`,
	`openai`
]);
async function resolveWebSearchProviderTool(e) {
	switch (e) {
		case `browserbase`: {
			let { gateway: e } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js");
			return e.tools.browserbaseSearch();
		}
		case `tako`: {
			let { gateway: e } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js");
			return e.tools.takoSearch();
		}
		case `openai`: {
			let { openai: t } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/openai/index.js");
			return attachWebSearchOutputSchema(t.tools.webSearch({}), e);
		}
		case `anthropic`: {
			let { anthropic: t } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/anthropic/index.js");
			return attachWebSearchOutputSchema(t.tools.webSearch_20250305(), e);
		}
		case `google`: {
			let { google: t } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/google/index.js");
			return attachWebSearchOutputSchema(t.tools.googleSearch({}), e);
		}
		case `exa`: {
			let { gateway: t } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js");
			return attachWebSearchOutputSchema(t.tools.exaSearch({
				contents: { highlights: { maxCharacters: 1e3 } },
				numResults: 10
			}), e);
		}
		case `parallel`: {
			let { gateway: t } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js");
			return attachWebSearchOutputSchema(t.tools.parallelSearch(), e);
		}
	}
}
function attachWebSearchOutputSchema(e, t) {
	return {
		...e,
		outputSchema: jsonSchema(resolveWebSearchOutputSchema(t))
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/tools.js
const log$8 = createLogger(`harness.tools`);
function buildToolSet(e) {
	let t = {};
	let n = e.disabledProviderTools;
	for (let r of e.tools.values()) n?.has(r.name) || (t[r.name] = tool({
		description: e.describe(r),
		inputSchema: toModelSchema(r.inputSchema, `input`),
		strict: !1,
		outputSchema: toModelSchema(r.outputSchema, `output`)
	}));
	return t;
}
function isRunnableTool(e) {
	return e?.execute !== void 0;
}
function invokeTool(e, t, n, r) {
	let { execute: i } = e;
	let a;
	try {
		requireClearance(r, n.toolCallId), a = executeWithToolStub(e.name, t, n, () => i(t, n));
	} catch (e) {
		return Promise.reject(e);
	}
	return isAsyncIterable(a) ? normalizeToolExecuteIterable(a, e.name, n) : Promise.resolve(a).then((t) => normalizeToolExecuteOutput(t, e.name, n));
}
async function* normalizeToolExecuteIterable(e, t, n) {
	for await (let r of e) yield normalizeToolExecuteOutput(r, t, n);
}
function normalizeToolExecuteOutput(e, t, n) {
	return isAuthorizationSignal(e) ? e : normalizeToolJsonOutput({
		boundary: `execute`,
		output: e,
		toolCallId: n.toolCallId,
		toolName: t
	});
}
async function buildToolSetWithProviderTools(e) {
	let t = e.disabledProviderTools;
	let n = { ...buildToolSet(e) };
	for (let r of e.tools.values()) {
		let i = r.behavior?.handling;
		if (i?.kind === `provider-tool` && r.execute === void 0 && !t?.has(r.name)) {
			let t = resolveWebSearchBackend(e.profile, i);
			t === null ? (log$8.debug(`model has no web search backend; leaving the tool out`, {
				gateway: e.profile.gateway,
				modelProvider: e.profile.provider,
				searchProvider: i.provider,
				tool: r.name
			}), delete n[r.name]) : n[r.name] = await resolveWebSearchProviderTool(t);
		}
	}
	return n;
}
async function decideApproval(e, t) {
	let n = e.approval === void 0 ? { denied: !1 } : await evaluateApproval(resolveApprovalPolicy(e.approval), {
		...buildCallbackContext(),
		abortSignal: t.abortSignal ?? new AbortController().signal,
		callId: t.callId,
		toolInput: isObject$1(t.input) ? t.input : void 0,
		toolName: e.name
	}, {
		memory: t.approvalMemory,
		recheck: t.recheck
	});
	return n.denied || n.awaitsPerson === !0 ? n : {
		...n,
		clearance: mintClearance(t.callId, n.clearedBy)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/calls.js
function requestCalls(e) {
	return commitOf(e.map(callRequested));
}
function requestCall(e) {
	return requestCalls([e]);
}
function requestProviderCalls(e) {
	return commitOf(e.flatMap((e) => [callRequested(e), callStarted(e.action.callId, { clearedBy: { policy: `provider` } })]));
}
function startCall(e) {
	let { callId: t, clearedBy: n } = e;
	return commitOf([callStarted(t, n === void 0 ? {} : { clearedBy: n })]);
}
function settleCall(...e) {
	return commitOf([callSettledFrom(...e)]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-stream-write-error.js
var SessionStreamWriteError = class extends Error {
	constructor(e) {
		super(`A session stream write failed: ${e instanceof Error ? e.message : String(e)}`, { cause: e }), this.name = e instanceof Error && e.name === `AbortError` ? `AbortError` : `SessionStreamWriteError`;
	}
};
function throwIfSessionStreamDead(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n = e; typeof n == `object` && n;) {
		if (n instanceof SessionStreamWriteError) throw n;
		if (t.has(n)) return;
		t.add(n), n = n.cause;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/turn-cancellation.js
const TURN_CANCELLED_ERROR_NAME = `TurnCancelledError`;
var TurnCancelledError = class extends Error {
	constructor(e = `The turn was cancelled.`) {
		super(e), this.name = TURN_CANCELLED_ERROR_NAME;
	}
};
var SessionLimitDeclinedError = class extends TurnCancelledError {
	constructor() {
		super(`The user declined a fresh session token budget.`);
	}
};
function isTurnCancellation(e) {
	let t = e;
	let n = /* @__PURE__ */ new Set();
	for (; typeof t == `object` && t && !n.has(t);) {
		if (n.add(t), t.name === TURN_CANCELLED_ERROR_NAME) return !0;
		t = t.cause;
	}
	return !1;
}
function throwIfTurnAborted(e) {
	if (e?.aborted === !0) throw isTurnCancellation(e.reason) ? e.reason : new TurnCancelledError();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/action-presentation.js
function createPresentedRuntimeActionRequestFromToolCall(e) {
	let t = createRuntimeActionRequestFromToolCall(e);
	let n = e.tools.get(e.toolCall.toolName);
	if (n?.label === !1) return {
		action: t,
		hidden: !0
	};
	let r = projectToolLabel(n, `start`, t.input);
	return r === void 0 ? { action: t } : {
		action: t,
		presentationLabel: r
	};
}
function projectToolLabel(e, t, n, r) {
	let i = e?.label;
	let a = i === !1 ? void 0 : i?.[t];
	if (a !== void 0 && n !== void 0) try {
		let e = normalizePresentationText(a(parseJsonObject(n), r));
		return e === `` ? void 0 : e;
	} catch {
		return;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/tool-call-input-errors.js
function isInvalidToolCall(e) {
	return e.invalid === !0;
}
function createInvalidToolCallInputError(e) {
	let { toolCall: t } = e;
	let n = {
		type: `tool-error`,
		toolCallId: t.toolCallId,
		toolName: t.toolName,
		input: t.input,
		error: e.error
	};
	return t.dynamic === !0 && (n.dynamic = !0), t.providerExecuted === !0 && (n.providerExecuted = !0), t.providerMetadata !== void 0 && (n.providerMetadata = t.providerMetadata), t.toolMetadata !== void 0 && (n.toolMetadata = t.toolMetadata), n;
}
function resolveProviderToolCallRequest(e, t) {
	try {
		return { request: createPresentedRuntimeActionRequestFromToolCall({
			toolCall: {
				...e,
				providerExecuted: !0,
				type: `tool-call`
			},
			tools: t
		}) };
	} catch (t) {
		if (!(t instanceof TypeError)) throw t;
		return { toolError: createInvalidToolCallInputError({
			error: t,
			toolCall: {
				input: e.input,
				providerExecuted: !0,
				toolCallId: e.toolCallId,
				toolName: e.toolName,
				type: `tool-call`
			}
		}) };
	}
}
function getInvalidToolCallInputError(e) {
	let { toolCall: t } = e;
	if (!isInvalidToolCall(t)) try {
		resolveToolCallInputObject(t.input, {
			callId: t.toolCallId,
			toolName: t.toolName
		});
		return;
	} catch (e) {
		if (e instanceof TypeError) return createInvalidToolCallInputError({
			error: e,
			toolCall: t
		});
		throw e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/call-executor.js
const log$7 = createLogger(`harness.tool-loop`);
async function executeToolCall(e, t, n) {
	let { callId: r, toolName: i, input: a } = e;
	let { definition: o } = t;
	let s = [];
	let c = [];
	let l = !1;
	let u = !1;
	let d;
	try {
		if (throwIfTurnAborted(t.abortSignal), (n === `recheck` ? await asSchema(toModelSchema(o.inputSchema, `input`)).validate?.(a) : void 0)?.success === !1) {
			let e = `The approved input is no longer valid for tool "${i}". Request a new tool call and approval.`;
			return await t.beforeResult?.({
				failure: e,
				invoked: u
			}), await t.publish(settleCall(createRuntimeToolResultFromValue({
				callId: r,
				isError: !0,
				output: e,
				toolName: i
			}), {})), {
				settled: [{ part: {
					type: `tool-result`,
					toolCallId: r,
					toolName: i,
					output: {
						type: `error-text`,
						value: e
					}
				} }],
				toolResults: c
			};
		}
		let e = await decideApproval(o, {
			abortSignal: t.abortSignal,
			callId: r,
			input: a,
			approvalMemory: t.approvalMemory,
			recheck: n === `recheck`
		});
		if (e.awaitsPerson === !0) return {
			awaitsApproval: !0,
			...e.callerOnly === !0 && { callerOnly: !0 },
			remember: e.remember,
			settled: s,
			toolResults: c
		};
		if (e.denied) {
			await t.beforeResult?.({
				failure: e.reason ?? "Tool execution was denied.",
				invoked: u
			});
			let n = await publishDenial({
				callId: r,
				input: a,
				toolName: i
			}, {
				publish: t.publish,
				reason: e.reason
			});
			return {
				settled: [...s, ...n.settled],
				toolResults: c
			};
		}
		let f = (n === `recheck` && t.view !== void 0 ? approvedClearance(t.view().projection.view, r) : void 0) ?? e.clearance;
		if (f === void 0) throw Error(`Call "${r}" has no clearance to run.`);
		let p;
		let m = !1;
		let h = ``;
		let g;
		let _ = toolTelemetry(t.telemetry, {
			callId: t.modelCallId ?? `approved:${r}`,
			messages: [...t.messages],
			toolCall: {
				input: a,
				toolCallId: r,
				toolName: i,
				type: `tool-call`
			}
		});
		t.beforeExecute?.(), await _.started();
		let v = 0;
		try {
			await _.execute(async () => {
				let e = performance.now();
				try {
					l = !0, await t.publish(startCall(f));
					let run = async () => {
						u = !0;
						let e = invokeTool(o, a, {
							...t.responder !== void 0 && { approval: { responder: t.responder } },
							abortSignal: t.abortSignal,
							messages: [...t.messages],
							toolCallId: r
						}, f);
						let i = n === `evaluate` ? t.abortSignal : void 0;
						if (isAsyncIterable(e)) for await (let n of untilAborted(e, i)) {
							p = n;
							let e = withoutSignInSecrets(n);
							await t.publish(callProgress(r, e, projectToolLabel(o, `delta`, a, e)));
						}
						else p = await raceAbort(Promise.resolve(e), i);
					};
					await withUsageCall(r, () => withModelCall(run));
				} finally {
					v = performance.now() - e;
				}
			});
		} catch (e) {
			await _.ended({
				error: e,
				input: a,
				toolCallId: r,
				toolName: i,
				type: `tool-error`
			}, v), throwIfSessionStreamDead(e), throwIfTurnAborted(t.abortSignal), logError(log$7, `tool execution failed`, e, {
				toolName: i,
				toolCallId: r
			}), m = !0, g = toError(e), p = g.message, h = modelFacingError(e);
		}
		if (m || await _.ended({
			input: a,
			output: withoutSignInSecrets(p),
			toolCallId: r,
			toolName: i,
			type: `tool-result`
		}, v), !m && isAuthorizationSignal(p)) {
			let e = {
				callId: r,
				input: a,
				signal: p,
				toolName: i
			};
			return {
				settled: s,
				signIn: o.version === void 0 ? e : {
					...e,
					version: o.version
				},
				toolResults: c
			};
		}
		return c.push({
			input: a,
			output: p,
			toolCallId: r,
			toolName: i,
			type: `tool-result`
		}), d = { part: {
			output: m ? {
				type: `error-text`,
				value: h
			} : await toolCallModelOutput(o, p, r),
			toolCallId: r,
			toolName: i,
			type: `tool-result`
		} }, s.push(d), await t.beforeResult?.({
			failure: m ? g : void 0,
			invoked: u
		}), await t.publish(settleCall(createRuntimeToolResultFromValue({
			callId: r,
			isError: m,
			output: g ?? p,
			toolName: i
		}), { label: m ? void 0 : projectToolLabel(o, `complete`, a, p) })), {
			settled: s,
			toolResults: c
		};
	} catch (e) {
		if (throwIfSessionStreamDead(e), t.abortSignal?.aborted === !0) return l || throwIfTurnAborted(t.abortSignal), d === void 0 ? {
			settled: [interruptedResult(r, i)],
			toolResults: c
		} : {
			settled: [d],
			toolResults: c
		};
		let n = toError(e);
		logError(log$7, `tool call failed`, e, {
			toolName: i,
			toolCallId: r
		}), await t.beforeResult?.({
			failure: n,
			invoked: u
		});
		let a = failedCall({
			callId: r,
			toolName: i,
			message: n
		});
		return await t.publish(settleCall(a.result)), {
			settled: [{ part: a.part }],
			toolResults: c
		};
	}
}
async function raceAbort(e, t) {
	if (t === void 0) return await e;
	e.catch(() => {}), t.throwIfAborted();
	let onAbort;
	let n = new Promise((e, n) => {
		onAbort = () => n(t.reason), t.addEventListener(`abort`, onAbort, { once: !0 });
	});
	try {
		return await Promise.race([e, n]);
	} finally {
		t.removeEventListener(`abort`, onAbort);
	}
}
async function* untilAborted(e, t) {
	let n = e[Symbol.asyncIterator]();
	let r = !1;
	try {
		for (;;) {
			let e = await raceAbort(n.next(), t);
			if (e.done === !0) {
				r = !0;
				return;
			}
			yield e.value;
		}
	} finally {
		!r && n.return !== void 0 && await raceAbort(Promise.resolve(n.return()), t);
	}
}
function modelFacingError(e) {
	return e == null ? `unknown error` : typeof e == `string` ? e : e instanceof Error ? e.toString() : JSON.stringify(e);
}
function withoutSignInSecrets(e) {
	return isAuthorizationSignal(e) ? modelFacingAuthorizationOutput(e) : e;
}
function interruptedResult(e, t) {
	return { part: {
		output: {
			type: `error-text`,
			value: "The turn was cancelled while this approved tool call was running. It may have partially run; it was not retried."
		},
		toolCallId: e,
		toolName: t,
		type: `tool-result`
	} };
}
function toolTelemetry(e, t) {
	let n = e === void 0 || e.isEnabled === !1 ? [] : [e.integrations ?? []].flat();
	let r = e?.recordInputs === !1;
	let i = e?.recordOutputs === !1;
	let recorded = (e) => {
		if (!r && !i) return e;
		let t = { ...e };
		return r && (t.input = void 0), i ? (t.output = void 0, t.error = void 0) : t.error != null && (t.error = Error(`AI SDK operation failed`)), t;
	};
	let a = {
		...t,
		messages: r ? [] : t.messages,
		toolCall: r ? {
			...t.toolCall,
			input: void 0
		} : t.toolCall,
		functionId: e?.functionId,
		recordInputs: e?.recordInputs,
		recordOutputs: e?.recordOutputs,
		toolContext: void 0
	};
	let notify = async (e) => {
		await Promise.allSettled(n.map(async (t) => await e(t)));
	};
	return {
		started: () => notify((e) => e.onToolExecutionStart?.(a)),
		execute: async (e) => {
			let wrapped = e;
			for (let e of n) {
				if (e.executeTool === void 0) continue;
				let n = wrapped;
				wrapped = () => e.executeTool({
					...a,
					execute: n,
					toolCallId: t.toolCall.toolCallId
				});
			}
			await wrapped();
		},
		ended: (e, t) => notify((n) => n.onToolExecutionEnd?.({
			...a,
			toolExecutionMs: t,
			toolOutput: recorded(e)
		}))
	};
}
const NO_INLINE_CALLS = {
	approvals: [],
	parts: [],
	signIns: [],
	toolResults: []
};
async function executeInlineCalls(e) {
	let t = e.toolCalls.filter((t) => t.providerExecuted !== !0 && !isInvalidToolCall(t) && !e.excludedCallIds.has(t.toolCallId) && e.tools.get(t.toolName) !== void 0);
	let n = await Promise.allSettled(t.map(async (t) => {
		let n = e.tools.get(t.toolName);
		let r = {
			callId: t.toolCallId,
			input: t.input,
			toolName: t.toolName
		};
		try {
			let i = isRunnableTool(n) ? await executeToolCall(r, {
				...e,
				definition: n
			}, `evaluate`) : await decideDeferredCall(r, n, e);
			return {
				call: t,
				executed: i,
				approval: i.awaitsApproval === !0 ? {
					...approvalRequest(t, n),
					...i.callerOnly === !0 && { callerOnly: !0 },
					remember: i.remember
				} : void 0
			};
		} catch (n) {
			throwIfSessionStreamDead(n), throwIfTurnAborted(e.abortSignal);
			let i = failedCall({
				...r,
				message: toError(n)
			});
			return await e.publish(settleCall(i.result)), {
				call: t,
				executed: {
					settled: [{ part: i.part }],
					toolResults: []
				}
			};
		}
	}));
	let r = n.find((e) => e.status === `rejected`);
	if (r?.status === `rejected`) throw r.reason;
	let i = n.flatMap((e) => e.status === `fulfilled` ? [e.value] : []);
	return {
		policyApprovals: Object.fromEntries(i.flatMap(({ call: e, executed: t }) => t.clearance === void 0 ? [] : [[e.toolCallId, t.clearance]])),
		approvals: i.flatMap(({ approval: e }) => e === void 0 ? [] : [e]),
		parts: i.flatMap(({ executed: e }) => e.settled.map((e) => e.part)),
		signIns: i.flatMap(({ executed: e }) => e.signIn === void 0 ? [] : [e.signIn]),
		toolResults: i.flatMap(({ executed: e }) => e.toolResults)
	};
}
async function decideDeferredCall(e, t, n) {
	let r = await decideApproval(t, {
		abortSignal: n.abortSignal,
		approvalMemory: n.approvalMemory,
		callId: e.callId,
		input: e.input
	});
	return r.awaitsPerson === !0 ? {
		awaitsApproval: !0,
		...r.callerOnly === !0 && { callerOnly: !0 },
		remember: r.remember,
		settled: [],
		toolResults: []
	} : r.denied ? await publishDenial(e, {
		publish: n.publish,
		reason: r.reason
	}) : {
		settled: [],
		toolResults: [],
		clearance: r.clearance
	};
}
async function publishDenial(e, t) {
	let n = {
		output: {
			reason: t.reason,
			type: `execution-denied`
		},
		toolCallId: e.callId,
		toolName: e.toolName,
		type: `tool-result`
	};
	return await t.publish(settleCall({
		callId: e.callId,
		isError: !0,
		kind: `tool-result`,
		output: {
			code: `TOOL_EXECUTION_DENIED`,
			message: t.reason ?? "Tool execution was denied.",
			tool: { result: `not_run` }
		},
		toolName: e.toolName
	}, { rejected: !0 })), {
		settled: [{ part: n }],
		toolResults: []
	};
}
function approvalRequest(e, t) {
	let { toolCallId: n, toolName: r } = e;
	let i = resolveToolCallInputObject(e.input, {
		callId: n,
		toolName: r
	});
	let a = projectToolLabel(t, `start`, i) ?? displayTitle(r);
	let o = authoredApprovalPrompt(e, t);
	return {
		call: {
			callId: n,
			input: i,
			toolName: r,
			...t?.version !== void 0 && { version: t.version }
		},
		interactionId: generateId(),
		request: {
			allowFreeform: !1,
			display: `confirmation`,
			kind: `approval`,
			options: [{
				id: `approve`,
				label: `Approve`
			}, {
				id: `deny`,
				label: `Deny`
			}],
			prompt: o ?? `Approve ${a}?`
		}
	};
}
function authoredApprovalPrompt(e, t) {
	let n = t?.approval;
	if (n === void 0 || typeof n == `function`) return;
	let r = typeof e.input == `object` && e.input !== null && !Array.isArray(e.input) ? e.input : {};
	let i = n.prompt?.({
		callId: e.toolCallId,
		input: r,
		toolName: e.toolName
	});
	if (i !== void 0 && typeof i != `string`) throw Error(`Tool "${e.toolName}" approval prompt must return a string.`);
	return i;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/approved-calls.js
function signInReports(e) {
	let t = /* @__PURE__ */ new Map();
	let settle = async (t, n, r) => {
		let i = isConnectionAuthorizationFailedError(r) ? r : void 0;
		let a = callSignInsSettled(e.view(), {
			...t,
			signIns: [n]
		}, r === void 0 ? void 0 : {
			reason: i === void 0 ? toErrorMessage(r) : i.reason ?? i.message,
			...i !== void 0 && { retryable: i.retryable }
		});
		a.length > 0 && await e.publish(commitOf(a));
	};
	let reportOne = (e, n, r) => {
		let i = signInAttemptKey(n);
		let a = t.get(i);
		return a === void 0 && (a = settle(e, n, r), t.set(i, a)), a;
	};
	return {
		report: async (e, t) => {
			await Promise.all((e.signIns ?? []).map((n) => reportOne(e, n, t)));
		},
		completed: (e) => async (t, n) => {
			if (t.attemptId !== void 0) for (let r of e) {
				let e = r.signIns?.find(({ attemptId: e }) => e === t.attemptId);
				e !== void 0 && await reportOne(r, e, n);
			}
		}
	};
}
async function runApprovedCalls(e) {
	let t = (e.signIns ?? signInReports(e)).report;
	let n = await Promise.allSettled(e.approvals.map(async (n) => {
		let { call: r } = n;
		let { callId: i, toolName: a } = r;
		let o = e.tools.get(a);
		if (changedSinceOffered(r, o)) {
			let o = failedCall({
				callId: i,
				message: changedToolMessage(a),
				toolName: a
			});
			return await t(n), await e.publish(settleCall(o.result)), {
				settled: [{ part: o.part }],
				toolResults: []
			};
		}
		if (isRunnableTool(o)) {
			let i = e.responderOf?.(n);
			return await executeToolCall(r, {
				...e,
				definition: o,
				...i !== void 0 && { responder: i },
				beforeResult: ({ failure: e, invoked: r }) => t(n, r ? e : void 0)
			}, `recheck`);
		}
		let l = failedCall({
			callId: i,
			message: unavailableToolMessage(a, e.tools.get("eve__search") !== void 0),
			toolName: a
		});
		return await t(n), await e.publish(settleCall(l.result)), {
			settled: [{ part: l.part }],
			toolResults: []
		};
	}));
	let r = n.find((e) => e.status === `rejected`);
	if (r?.status === `rejected` && e.abortSignal?.aborted !== !0) throw r.reason;
	let i = n.flatMap((e) => e.status === `fulfilled` ? [e.value] : []);
	return {
		settled: i.flatMap((e) => e.settled),
		signIns: i.flatMap((e) => e.signIn === void 0 ? [] : [e.signIn])
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/responders.js
const UNAUTHENTICATED_FEEDBACK = `Authentication is required to respond to this approval.`;
const TEMPORARILY_UNAVAILABLE_REASON = `Approval authorization is temporarily unavailable. Please try again.`;
const FAILED_REASON = `We couldn’t verify your response. Please try again.`;
const log$6 = createLogger(`harness.hitl`);
function checkResponders(e, t, n) {
	let r = [];
	let i = [];
	let a = {};
	let o = /* @__PURE__ */ new Set();
	for (let s of t?.answers ?? []) {
		let { responder: t, responseId: c } = s;
		if (o.has(c) || (o.add(c), e.projection.view.responses[c] !== void 0)) continue;
		let l = stepForRequest(e, s.interactionId);
		let u = l?.requests.find((e) => e.interactionId === s.interactionId);
		if (l === void 0 || u === void 0) {
			c !== void 0 && r.push(c);
			continue;
		}
		if (decisionOf(s) === void 0) {
			i.push({
				reason: `Respond to this approval with Approve or Cancel.`,
				responseId: c
			});
			continue;
		}
		if (l.responseAuthRequiredRequestIds?.includes(u.interactionId) !== !0) {
			let e = t === void 0 ? currentResponder() : t;
			let n = l.requester ?? null;
			if (n !== null && e === null) {
				i.push({
					reason: UNAUTHENTICATED_FEEDBACK,
					responseId: c
				});
				continue;
			}
			if (n !== null && e !== null && !sameResponder(n, e)) {
				i.push({
					reason: "Only the person who requested this action can respond to this approval.",
					responseId: c
				});
				continue;
			}
			c !== void 0 && r.push(c);
			continue;
		}
		if (c === void 0) continue;
		let d = t === void 0 ? buildCallbackContext().session.auth.current : t;
		d === null ? i.push({
			reason: UNAUTHENTICATED_FEEDBACK,
			responseId: c
		}) : a[c] = {
			expiresAt: n + 6e5,
			responder: d
		};
	}
	return {
		admit: r,
		refused: i,
		weigh: a
	};
}
async function weighResponders(e, t) {
	let n = e.projection.view;
	let r = e.responders;
	let i = [];
	let a = [];
	let o = [];
	let s = {};
	let c = revisedAnswers(e, t.now);
	for (let [l, u] of Object.entries(r)) {
		let r = n.responses[l];
		if (r?.status !== `submitted`) continue;
		if (u.expiresAt <= t.now) {
			i.push(responseSettled(l, `expired`, `The approval response expired. Please submit a new response.`));
			continue;
		}
		if (c.has(l)) {
			i.push(responseSettled(l, `withdrawn`, `revised`));
			continue;
		}
		if ((u.challenges?.length ?? 0) > 0 && !u.challenges.some((e) => getAuthorizationResult(e.name) !== void 0)) continue;
		let d = stepForRequest(e, r.interactionId);
		let f = d?.requests.find((e) => e.interactionId === r.interactionId);
		let p = r.value?.optionId === `approve` ? `approve` : `deny`;
		if (d === void 0 || f === void 0) continue;
		let m = await weigh({
			decision: p,
			pending: u,
			request: f,
			responseId: l,
			step: d,
			tools: t.tools
		});
		switch (m.kind) {
			case `allowed`:
				i.push(responseAdmitted(l));
				break;
			case `refused`:
				i.push(responseSettled(l, `refused`, m.reason));
				break;
			case `failed`:
				i.push(responseSettled(l, `failed`, m.reason));
				break;
			case `unavailable`:
				i.push(responseSettled(l, `failed`, `The tool this approval was for is no longer available, so the call won't run.`)), o.push(f.interactionId);
				break;
			case `sign-in`: {
				let e = m.challenges.map((e) => ({
					...e,
					candidateId: l
				}));
				a.push(...e);
				let t = Math.min(u.expiresAt, ...e.map((e) => Date.parse(e.challenge.expiresAt ?? ``)).filter(Number.isFinite));
				s[l] = {
					...u,
					challenges: e,
					expiresAt: t
				};
				break;
			}
		}
	}
	return transition({
		challenges: a,
		events: i,
		responders: s,
		turn: e.turn,
		unavailable: o
	});
}
function revisedAnswers(e, t) {
	let n = e.projection.view;
	let r = /* @__PURE__ */ new Map();
	let i = /* @__PURE__ */ new Set();
	for (let [a, o] of Object.entries(e.responders)) {
		let e = n.responses[a];
		if (e?.status !== `submitted` || o.expiresAt <= t || (o.challenges?.length ?? 0) > 0) continue;
		let { authenticator: s, issuer: c, principalId: l, principalType: u } = o.responder;
		let d = JSON.stringify([
			e.interactionId,
			s,
			c ?? ``,
			u,
			l
		]);
		let f = r.get(d);
		f !== void 0 && f.introducedAt > e.introducedAt ? i.add(a) : (f !== void 0 && i.add(f.responseId), r.set(d, {
			introducedAt: e.introducedAt,
			responseId: a
		}));
	}
	return i;
}
async function weigh(e) {
	let t;
	try {
		t = await e.tools();
	} catch (t) {
		return logError(log$6, `approval tools could not be restored`, t, { interactionId: e.request.interactionId }), {
			kind: `failed`,
			reason: TEMPORARILY_UNAVAILABLE_REASON
		};
	}
	let n = t.get(e.request.call.toolName);
	if (n === void 0) return { kind: `unavailable` };
	let { approval: r } = n;
	let i = r !== void 0 && typeof r != `function` ? r.response : void 0;
	if (i === void 0) return {
		kind: `failed`,
		reason: TEMPORARILY_UNAVAILABLE_REASON
	};
	try {
		let t = buildCallbackContext();
		let n = {
			callId: e.request.call.callId,
			interactionId: e.request.interactionId,
			principal: e.step.requester ?? null,
			toolInput: e.request.call.input,
			toolName: e.request.call.toolName
		};
		let a = {
			decision: e.decision,
			principal: e.pending.responder
		};
		if (e.request.callerOnly === !0 || r !== void 0 && typeof r != `function` && isSteeredApprovalPolicy(r.request) && (t.session.auth.steeredBy ?? []).length > 0) {
			let e = requesterOnlyResponse({
				request: n,
				response: a
			});
			if (e.status === `rejected`) return {
				kind: `refused`,
				reason: e.reason
			};
		}
		let o = await withTimeout(i({
			auth: buildApprovalResponseAuth({
				responder: e.pending.responder,
				scope: e.responseId
			}),
			request: n,
			response: a,
			session: {
				id: t.session.id,
				initiator: t.session.auth.initiator,
				parent: t.session.parent,
				turn: t.session.turn
			}
		}));
		return o.status === `rejected` ? {
			kind: `refused`,
			reason: o.reason ?? ``
		} : o.status === `allowed` ? { kind: `allowed` } : {
			kind: `failed`,
			reason: FAILED_REASON
		};
	} catch (e) {
		let t = await handleApprovalResponsePolicyError(e).catch(() => void 0);
		return isAuthorizationSignal(t) ? {
			challenges: t.challenges,
			kind: `sign-in`
		} : {
			kind: `failed`,
			reason: FAILED_REASON
		};
	}
}
function currentResponder() {
	let e = contextStorage.getStore();
	return e?.get(AuthKey) ?? e?.get(SessionKey)?.auth.current ?? null;
}
function decisionOf(e) {
	if (e.optionId === `approve`) return `approve`;
	if (e.optionId === `deny`) return `deny`;
}
async function withTimeout(e) {
	let t;
	try {
		return await Promise.race([Promise.resolve(e), new Promise((e, n) => {
			t = setTimeout(() => n(Error(`Approval response authorizer timed out.`)), 1e4);
		})]);
	} finally {
		t !== void 0 && clearTimeout(t);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/step/park.js
const ANSWER_FIRST_KINDS = /* @__PURE__ */ new Set([`budget`]);
function resumesOnPerson(e) {
	return ownOpenRequestIds(e).size > 0 || e.signIns.length > 0;
}
function holdsMessages(e) {
	let t = e.projection.view;
	return [...ownOpenRequestIds(e)].some((e) => ANSWER_FIRST_KINDS.has(t.interactions[e]?.request.kind ?? ``));
}
function hasQueuedTurnInput(e) {
	let t = e.turn.queued;
	return t !== void 0 && (t.message !== void 0 || (t.context?.length ?? 0) > 0 || t.outputSchema !== void 0 || readClientContext(t) !== void 0 || (t.runtimeActionResults?.length ?? 0) > 0);
}
function blocked(e, t) {
	return resumesOnPerson(e) || runtimeWait(t) !== void 0;
}
function park(e) {
	let t = e.view();
	return hasQueuedTurnInput(t) && !holdsMessages(t) ? {
		next: e.runStep,
		session: e.session
	} : resumesOnPerson(t) ? {
		held: { kind: `request` },
		next: null,
		session: e.session
	} : {
		next: null,
		session: e.session
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/combine.js
const log$5 = createLogger(`definitions`);
function draftOf(e) {
	let t = {
		announcements: once(async () => announcementsOf(await collect(e, `announcements`))),
		context: once(async () => (await collect(e, `context`)).flat()),
		system: once(async () => (await collect(e, `system`)).flat()),
		tools: once(async () => mergeTools(await collect(e, `tools`)))
	};
	for (let { arrange: n } of e) {
		if (n === void 0) continue;
		let { announcements: e, context: r, system: i, tools: a } = n(t);
		t = {
			announcements: e === void 0 ? t.announcements : once(e),
			context: r === void 0 ? t.context : once(r),
			system: i === void 0 ? t.system : once(i),
			tools: a === void 0 ? t.tools : once(a)
		};
	}
	return t;
}
async function decideModel(e) {
	for (let t = e.length - 1; t >= 0; --t) {
		let n = await force(e[t].model);
		if (n !== void 0) return n;
	}
}
async function collect(e, t) {
	let n = [];
	for (let r of e) {
		let e = await force(r[t]);
		e !== void 0 && n.push(e);
	}
	return n;
}
async function collectEffects(e) {
	return (await collect(e, `effects`)).flat();
}
function mergeTools(e) {
	let t = /* @__PURE__ */ new Map();
	for (let { entries: n } of e) for (let [e, r] of n ?? []) {
		let n = t.get(e);
		n === void 0 ? t.set(e, r) : log$5.error(`Tool "${e}" from "${r.source ?? ``}" collides with the one from "${n.source ?? ``}"; the first keeps it.`);
	}
	let n = /* @__PURE__ */ new Map();
	for (let { skills: t } of e) for (let [e, r] of t ?? []) {
		let t = n.get(e);
		t === void 0 ? n.set(e, r) : r.source !== void 0 && log$5.error(`Skill "${e}" from "${r.source}" collides with the one from "${t.source ?? ``}"; the first keeps it.`);
	}
	return {
		connections: e.flatMap(({ connections: e }) => e ?? []),
		entries: t,
		skills: n
	};
}
function announcementsOf(e) {
	let t = /* @__PURE__ */ new Set();
	return Object.fromEntries(e.flatMap((e) => Object.entries(e).filter(([e]) => claim(t, e, `announcement`))));
}
function claim(e, t, n) {
	return e.has(t) ? (log$5.error(`Two definitions make the ${n} "${t}"; the first keeps it.`), !1) : (e.add(t), !0);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/mock-model-identity.js
const MOCK_MODEL = Symbol.for(`eve:mock-model`);
function isMockModel(e) {
	return typeof e == `object` && !!e && Reflect.get(e, MOCK_MODEL) === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/models/options.js
function selectionModel(e) {
	return isSelectionObject(e) ? e.model : e;
}
function isSelectionObject(e) {
	return typeof e != `string` && !isRuntimeLanguageModel(e) && !isDefinedModel(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/agent-models.js
const AGENT_TOOL_MODELS = Symbol.for(`eve.agent-tool-models`);
function readAgentToolModels(e) {
	if (typeof e == `object` && e) return e[AGENT_TOOL_MODELS];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/bootstrap-model-utils.js
const BOOTSTRAP_RESPONSE_TIMESTAMP = /* @__PURE__ */ new Date(`2026-03-16T00:00:00.000Z`);
function createBootstrapGenerateResult(e) {
	return {
		content: [{
			text: e.text,
			type: `text`
		}],
		finishReason: {
			raw: void 0,
			unified: `stop`
		},
		response: {
			id: `bootstrap-response`,
			modelId: e.modelId,
			timestamp: BOOTSTRAP_RESPONSE_TIMESTAMP
		},
		usage: {
			inputTokens: {
				cacheRead: 0,
				cacheWrite: 0,
				noCache: e.inputTokens,
				total: e.inputTokens
			},
			outputTokens: {
				reasoning: 0,
				text: e.outputTokens,
				total: e.outputTokens
			}
		},
		warnings: []
	};
}
function createBootstrapStreamResult(e) {
	let t = [{
		type: `stream-start`,
		warnings: e.warnings
	}];
	e.response !== void 0 && t.push({
		...e.response,
		type: `response-metadata`
	});
	let n = 0;
	for (let r of e.content) switch (r.type) {
		case `text`: {
			let e = `text_${n}`;
			n += 1, t.push({
				id: e,
				type: `text-start`
			}), r.text.length > 0 && t.push({
				delta: r.text,
				id: e,
				type: `text-delta`
			}), t.push({
				id: e,
				type: `text-end`
			});
			break;
		}
		case `tool-call`: t.push(r);
	}
	return t.push({
		finishReason: e.finishReason,
		type: `finish`,
		usage: e.usage
	}), { stream: new ReadableStream({ start(e) {
		for (let n of t) e.enqueue(n);
		e.close();
	} }) };
}
function estimateTokenCount(e) {
	return Math.max(1, Math.ceil(e.trim().length / 4));
}
function getPromptContentText(e) {
	return typeof e == `string` ? e : e.flatMap((e) => {
		if (typeof e == `string`) return [e];
		switch (e.type) {
			case `text`: return [e.text];
			default: return [];
		}
	}).join(``);
}
function getLastUserPromptText(e) {
	for (let t of [...e].reverse()) {
		if (t.role !== `user`) continue;
		let e = getPromptContentText(t.content).trim();
		if (!isFrameworkAnnouncementText(e) && e.length > 0) return e;
	}
	return null;
}
function isFrameworkAnnouncementText(e) {
	return e.startsWith("[Tasks]") || e.startsWith("<task_result");
}
function getPromptText(e) {
	return e.map((e) => getPromptContentText(e.content)).join(` `);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/bootstrap-model.js
const bootstrapRuntimeModels = /* @__PURE__ */ new Map();
function resolveBootstrapRuntimeModel(e) {
	if (e.id !== "eve-bootstrap-model") return null;
	let t = bootstrapRuntimeModels.get(e.id);
	if (t !== void 0) return t;
	let n = new MockLanguageModelV3({
		doGenerate: async (t) => createBootstrapModelResult(t.prompt, e.id),
		doStream: async (t) => createBootstrapStreamResult(createBootstrapModelResult(t.prompt, e.id)),
		modelId: e.id,
		provider: `eve-bootstrap`
	});
	return bootstrapRuntimeModels.set(e.id, n), n;
}
function createBootstrapModelResult(e, t) {
	let n = `Bootstrap reply: ${getLastUserPromptText(e) ?? `Hello from eve`}`;
	return createBootstrapGenerateResult({
		inputTokens: estimateTokenCount(getPromptText(e)),
		modelId: t,
		outputTokens: estimateTokenCount(n),
		text: n
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/mock-model-skill-selection.js
function getAvailableSkills(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		if (n.role !== `system` && n.role !== `user`) continue;
		let e = getPromptContentText(n.content).split(`
`);
		let r = e.findIndex((e) => e.trim() === `Available skills`);
		if (!(r < 0)) for (let n of e.slice(r + 1)) {
			if (n.trim().length === 0) break;
			let e = parseAvailableSkill(n);
			e !== null && t.set(e.name, e);
		}
	}
	return [...t.values()];
}
function findRelevantSkill(e, t) {
	let n = normalizeText$2(t);
	for (let t of e) if (n.includes(normalizeText$2(t.name))) return t;
	return /\b(forecast|temperature|weather|wind|rain|snow)\b/u.test(n) ? e.find((e) => /\b(forecast|temperature|weather|wind|rain|snow)\b/u.test(normalizeText$2(`${e.name} ${e.description}`))) ?? null : null;
}
function getActivatedSkillIds(e) {
	return [...e.filter((e) => e.role === `system`).flatMap((e) => getPromptContentText(e.content).split(`
`).map((e) => e.trim()).flatMap((e) => {
		let t = /^Skill \((.+)\)$/.exec(e);
		return t?.[1] === void 0 ? [] : [t[1]];
	})), ...getSkillLoads(e).values()];
}
function getSkillLoads(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) if (n.role === `assistant` && typeof n.content != `string`) for (let e of n.content) {
		if (typeof e == `string` || e.type !== `tool-call` || e.toolName !== "eve__skill") continue;
		let n = readSkillFromToolInput(e.input);
		n !== void 0 && t.set(e.toolCallId, n);
	}
	return t;
}
function readSkillFromToolInput(e) {
	let t = typeof e == `string` ? safeJsonParse(e) : e;
	if (typeof t == `object` && t && `name` in t && typeof t.name == `string`) return t.name;
}
function safeJsonParse(e) {
	try {
		return JSON.parse(e);
	} catch {
		return;
	}
}
function parseAvailableSkill(e) {
	let t = /^- (.+?): (.+?)(?: \(path: (.+)\))?$/.exec(e.trim());
	return t?.[1] && t[2] ? {
		description: t[2],
		name: t[1]
	} : null;
}
function normalizeText$2(e) {
	return e.toLowerCase().replace(/[^a-z0-9]+/gu, ` `).trim();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/mock-structured-output.js
function createJsonSchemaSample(e) {
	if (!isRecord$2(e)) return {};
	if (`const` in e) return e.const;
	if (Array.isArray(e.enum) && e.enum.length > 0) return e.enum[0];
	let t = getFirstSchema(e.oneOf) ?? getFirstSchema(e.anyOf);
	if (t !== void 0) return createJsonSchemaSample(t);
	switch (getJsonSchemaType(e)) {
		case `array`: return [createJsonSchemaSample(getFirstSchema(e.items) ?? e.items)];
		case `boolean`: return !0;
		case `integer`:
		case `number`: return 1;
		case `null`: return null;
		case `object`: return createJsonSchemaObjectSample(e);
		case `string`: return createJsonSchemaStringSample(e);
		default: return isRecord$2(e.properties) ? createJsonSchemaObjectSample(e) : e.items === void 0 ? {} : [createJsonSchemaSample(getFirstSchema(e.items) ?? e.items)];
	}
}
function createJsonSchemaObjectSample(e) {
	let t = isRecord$2(e.properties) ? e.properties : {};
	let n = Array.isArray(e.required) ? e.required.filter((e) => typeof e == `string`) : [];
	let r = /* @__PURE__ */ new Set([...n, ...Object.keys(t)]);
	let i = {};
	for (let e of r) i[e] = createJsonSchemaSample(t[e]);
	return i;
}
function createJsonSchemaStringSample(e) {
	switch (e.format) {
		case `date`: return `2026-01-01`;
		case `date-time`: return `2026-01-01T00:00:00.000Z`;
		case `email`: return `eve@example.com`;
		case `uri`: return `https://example.com`;
		default: return `structured-output`;
	}
}
function getJsonSchemaType(e) {
	if (typeof e.type == `string`) return e.type;
	if (Array.isArray(e.type)) return e.type.find((e) => typeof e == `string` && e !== `null`);
}
function getFirstSchema(e) {
	return Array.isArray(e) ? e[0] : e;
}
function isRecord$2(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/mock-model-fixtures.js
function createMockAuthoredToolInput(e, t, n) {
	let r = {
		...e,
		inputSchema: withoutTaskIdInput(e.inputSchema)
	};
	let i = getToolInputPropertyNames(r.inputSchema);
	if (i.includes(`question`)) return createQuestionInput(t);
	if (i.includes(`command`)) return { command: resolveShellCommand(t) };
	if (i.includes(`topic`) || !hasDeclaredInputProperties(r.inputSchema) && /\btopic\b/u.test(normalizeText$1(t))) return { topic: resolveLookupTopic(t) };
	let a = extractAnchoredInputs(i, t);
	if (Object.keys(a).length > 0) return a;
	if (i.length === 1 && i[0] === `message`) return { message: t };
	if (i.includes(`city`) || !hasDeclaredInputProperties(r.inputSchema)) return { city: n };
	let o = createJsonSchemaSample(r.inputSchema);
	return isRecord$1(o) ? o : {};
}
function withoutTaskIdInput(e) {
	if (!isRecord$1(e) || !isRecord$1(e.properties)) return e;
	let { ["taskId"]: t, ...n } = e.properties;
	return {
		...e,
		properties: n
	};
}
function extractAnchoredInputs(e, t) {
	let n = {};
	for (let r of e) {
		let e = RegExp(`\\b${escapeRegExp(r)}\\b\\s*(?:to|=|:)?\\s*(?:\`([^\`]+)\`|"([^"]+)"|'([^']+)')`, `iu`).exec(t);
		let i = e?.[1] ?? e?.[2] ?? e?.[3];
		i !== void 0 && (n[r] = i.trim());
	}
	return n;
}
function escapeRegExp(e) {
	return e.replace(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);
}
function resolveMockFixtureToken(e) {
	let t = e.filter((e) => e.role === `system`).map((e) => getPromptContentText(e.content)).join(`
`);
	let n = [
		...getLoadedSkillResultTexts(e),
		t,
		getTrailingUserText(e)
	];
	for (let e of n) {
		let t = resolveExactFixtureReply(e);
		if (t !== null) return t;
	}
	return null;
}
function resolveWeatherCity(e) {
	let t = /"city"\s*:\s*"([^"]+)"/u.exec(e);
	return t?.[1] ? t[1].trim() : (/\b(?:in|for)\s+([A-Za-z][A-Za-z\s.-]*?)(?:[?.!,]|$)/u.exec(e) ?? /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/u.exec(e))?.[1]?.trim() || `Brooklyn`;
}
function formatToolOutput(e) {
	if (typeof e == `string`) return e;
	try {
		return JSON.stringify(e);
	} catch {
		return String(e);
	}
}
function getTrailingUserText(e) {
	let t = [];
	for (let n of [...e].reverse()) {
		if (n.role === `system`) continue;
		if (n.role !== `user`) break;
		let e = getPromptContentText(n.content);
		isFrameworkAnnouncementText(e.trim()) || t.unshift(e);
	}
	return t.join(`
`);
}
function getLoadedSkillResultTexts(e) {
	let t = getSkillLoads(e);
	return e.flatMap((e) => e.role !== `tool` && e.role !== `assistant` ? [] : (typeof e.content == `string` ? [e.content] : e.content).flatMap((e) => typeof e == `string` || e.type !== `tool-result` || !t.has(e.toolCallId) || e.output.type === `execution-denied` ? [] : [formatToolOutput(e.output.value)]));
}
function resolveExactFixtureReply(e) {
	let t = matchExactValue(/\breply\s+with\s+the\s+exact\s+string\s+(`([^`]+)`|"([^"]+)"|'([^']+)'|([^\s.]+))\s+and\s+nothing\s+else\b/iu, e);
	if (t !== null) return t;
	let n = e.split(/\r?\n/u);
	for (let e = 0; e < n.length; e += 1) {
		let t = n[e]?.trim() ?? ``;
		let r = /\breply\s+with\s+exactly(?:\s+the\s+following\s+text\s+and\s+nothing\s+else)?:\s*(.+)$/iu.exec(t);
		if (r?.[1]) return cleanExactValue(r[1]);
		if (/\breply\s+with\s+exactly\s+the\s+following\s+text\s+and\s+nothing\s+else:\s*$/iu.test(t) || /\breply\s+with\s+exactly:\s*$/iu.test(t)) {
			let t = n.slice(e + 1).map((e) => e.trim()).find((e) => e.length > 0);
			if (t !== void 0) return cleanExactValue(t);
		}
	}
	return matchExactValue(/\binclude\s+the\s+exact\s+token\s+(`([^`]+)`|"([^"]+)"|'([^']+)'|([^\s.]+))\s+verbatim\b/iu, e);
}
function matchExactValue(e, t) {
	let n = e.exec(t);
	return n === null ? null : cleanExactValue(n[2] ?? n[3] ?? n[4] ?? n[5] ?? n[1] ?? ``);
}
function cleanExactValue(e) {
	return e.trim();
}
function getToolInputPropertyNames(e) {
	return !isRecord$1(e) || !isRecord$1(e.properties) ? [] : Object.keys(e.properties);
}
function hasDeclaredInputProperties(e) {
	return isRecord$1(e) && isRecord$1(e.properties);
}
function createQuestionInput(e) {
	let t = parseOptionLabels(e);
	return {
		question: resolveQuestionPrompt(e),
		...t.length >= 2 && { options: t.map((e) => ({
			description: `Choose ${e}.`,
			label: e
		})) }
	};
}
function parseOptionLabels(e) {
	return [...e.matchAll(/\blabel\b\s*:?\s*"([^"]+)"/giu)].map((e) => e[1] ?? ``);
}
function resolveQuestionPrompt(e) {
	let t = /\b(?:set\s+)?question\s+to:\s*'([^']+)'/iu.exec(e) ?? /\b(?:set\s+)?question\s+to:\s*"([^"]+)"/iu.exec(e);
	return t?.[1] ? t[1].trim() : /\bask(?:\s+me)?\s+(?:to\s+)?(.+?)(?:\.|$)/iu.exec(e)?.[1]?.trim() || `Please choose an option.`;
}
function resolveShellCommand(e) {
	let t = /`([^`]+)`/u.exec(e);
	return t?.[1] ? t[1].trim() : (/\b(?:run|command)\s+["']([^"']+)["']/iu.exec(e) ?? /\bcommand\s+(.+?)(?:\.|$)/iu.exec(e))?.[1]?.trim() || `pwd`;
}
function resolveLookupTopic(e) {
	return /\btopic\s+['"]?([A-Za-z0-9_.-]+)['"]?/u.exec(e)?.[1] ?? `demo`;
}
function normalizeText$1(e) {
	return e.toLowerCase().replace(/[^a-z0-9]+/gu, ` `).trim();
}
function isRecord$1(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/mock-model-adapter.js
const authoredRuntimeModelMocks = /* @__PURE__ */ new Map();
const bootstrapWeatherPayloadSchema = z.object({
	city: z.string(),
	condition: z.string(),
	summary: z.string(),
	temperatureF: z.number().finite()
}).strict();
function shouldMockAuthoredRuntimeModels() {
	return process.env.NODE_ENV === `test` || process.env.EVE_MOCK_AUTHORED_MODELS === `1`;
}
function createMockAuthoredRuntimeModel(e) {
	let t = authoredRuntimeModelMocks.get(e.id);
	if (t !== void 0) return t;
	let n = new MockLanguageModelV3({
		modelId: e.id,
		provider: `eve-runtime-mock`,
		doGenerate: async (t) => createMockModelResult(t, e.id),
		doStream: async (t) => createBootstrapStreamResult(createMockModelResult(t, e.id))
	});
	return authoredRuntimeModelMocks.set(e.id, n), n;
}
function createMockModelResult(e, t) {
	let n = getLastAuthoredToolResult(e.prompt);
	if (n !== null) {
		let r = createFollowUpToolCallResult({
			modelId: t,
			options: e,
			result: n
		});
		if (r !== null) return r;
	} else {
		let n = createParallelAuthoredToolCallsResult(e, t) ?? createSubagentDelegationResult(e, t) ?? createSkillLoadResult(e.prompt, t) ?? createAuthoredToolCallResult(e, t);
		if (n !== null) return n;
	}
	let r = createFinalOutputResult(e, t);
	if (r !== null) return r;
	let i = n === null ? createAssistantMessage(e.prompt) : formatToolResultReply(n, e.prompt);
	return createBootstrapGenerateResult({
		inputTokens: estimateTokenCount(getPromptText(e.prompt)),
		modelId: t,
		outputTokens: estimateTokenCount(i),
		text: i
	});
}
function createFinalOutputResult(e, t) {
	let n = getAvailableTools(e).find((e) => e.name === "eve__reply");
	if (n === void 0) return null;
	let r = createJsonSchemaSample(n.inputSchema);
	return createToolCallGenerateResult({
		input: r,
		inputTokens: estimateTokenCount(getPromptText(e.prompt)),
		modelId: t,
		outputTokens: estimateTokenCount(JSON.stringify(r)),
		toolCallId: createToolCallId("eve__reply"),
		toolName: "eve__reply"
	});
}
function resolveMockAuthoredRuntimeModel(e) {
	return !shouldMockAuthoredRuntimeModels() || e.id === "eve-bootstrap-model" ? null : createMockAuthoredRuntimeModel(e);
}
function createSkillLoadResult(e, t) {
	let n = getLastUserPromptText(e);
	if (n === null || getActivatedSkillIds(e).length > 0) return null;
	let r = findRelevantSkill(getAvailableSkills(e), n);
	return r === null ? null : createToolCallGenerateResult({
		input: { name: r.name },
		inputTokens: estimateTokenCount(getPromptText(e)),
		modelId: t,
		outputTokens: estimateTokenCount(r.name),
		toolCallId: `call_execute_skill`,
		toolName: "eve__skill"
	});
}
const SUBAGENT_DELEGATION_DIRECTIVE = /\bdelegate\s+to\s+a\s+subagent\s*:\s*(.+)$/iu;
const PARALLEL_AUTHORED_TOOLS_DIRECTIVE = /^call tools in parallel:\s*(.+)$/imu;
function createParallelAuthoredToolCallsResult(e, t) {
	let n = getLastUserPromptText(e.prompt);
	if (n === null) return null;
	let r = PARALLEL_AUTHORED_TOOLS_DIRECTIVE.exec(n)?.[1]?.split(`,`).map((e) => e.trim()).filter(Boolean);
	if (r === void 0 || r.length < 2 || new Set(r).size !== r.length) return null;
	let i = new Map(getAvailableTools(e).map((e) => [e.name, e]));
	let a = [];
	for (let e of r) {
		let t = i.get(e);
		if (t === void 0) return null;
		a.push(t);
	}
	let o = resolveWeatherCity(n);
	return createToolCallsGenerateResult({
		calls: a.map((e) => ({
			input: createMockAuthoredToolInput(e, n, o),
			toolCallId: createToolCallId(e.name),
			toolName: e.name
		})),
		inputTokens: estimateTokenCount(getPromptText(e.prompt)),
		modelId: t,
		outputTokens: estimateTokenCount(n)
	});
}
function createSubagentDelegationResult(e, t) {
	let n = getLastUserPromptText(e.prompt);
	if (n === null) return null;
	let r = SUBAGENT_DELEGATION_DIRECTIVE.exec(n);
	if (r?.[1] === void 0) return null;
	let i = `agent`;
	if (getAvailableTools(e).find((e) => e.name === i) === void 0) return null;
	let a = r[1].trim();
	return createToolCallGenerateResult({
		input: { message: a },
		inputTokens: estimateTokenCount(getPromptText(e.prompt)),
		modelId: t,
		outputTokens: estimateTokenCount(a),
		toolCallId: createToolCallId(i),
		toolName: i
	});
}
function createAuthoredToolCallResult(e, t) {
	let n = getLastUserPromptText(e.prompt);
	if (n === null) return null;
	let r = findRelevantTool(getAvailableTools(e), n);
	if (r === null) return null;
	let a = createMockAuthoredToolInput(r, n, resolveWeatherCity(n));
	return createToolCallGenerateResult({
		input: a,
		inputTokens: estimateTokenCount(getPromptText(e.prompt)),
		modelId: t,
		outputTokens: estimateTokenCount(Object.values(a).join(` `)),
		toolCallId: createToolCallId(r.name),
		toolName: r.name
	});
}
function createFollowUpToolCallResult(e) {
	let t = findNextExplicitToolAfterResult({
		previousToolName: e.result.toolName,
		prompt: e.options.prompt,
		tools: getAvailableTools(e.options)
	});
	if (t === null) return null;
	let n = createFollowUpToolInput(e.result.output);
	return n === null ? null : createToolCallGenerateResult({
		input: n,
		inputTokens: estimateTokenCount(getPromptText(e.options.prompt)),
		modelId: e.modelId,
		outputTokens: estimateTokenCount(Object.values(n).join(` `)),
		toolCallId: createToolCallId(t.name),
		toolName: t.name
	});
}
const LIST_ATTACHMENTS_DIRECTIVE = /\blist the attachments\b/iu;
function createAssistantMessage(e) {
	let t = getLastUserPromptText(e) ?? `Hello from eve`;
	if (LIST_ATTACHMENTS_DIRECTIVE.test(t)) return `Attachments: ${JSON.stringify(listPromptAttachments(e))}`;
	let n = getSystemPromptLabels(e);
	let r = resolveSystemProbe(e);
	let i = resolveMockFixtureToken(e);
	return i === null ? n.length > 0 ? r === null ? `Bootstrap reply [${n.join(`, `)}]: ${t}` : `Bootstrap reply [${n.join(`, `)}; probe=${r}]: ${t}` : r === null ? `Bootstrap reply: ${t}` : `Bootstrap reply [probe=${r}]: ${t}` : i;
}
function formatToolResultReply(e, t) {
	if (e.isError) return `Local weather tool failed: ${formatToolOutput(e.output)}`;
	if (isWeatherPayload(e.output)) return `Used local weather tool for ${e.output.city}: ${e.output.condition}, ${e.output.temperatureF}F. ${e.output.summary}`;
	let n = getLastUserPromptText(t) ?? `Hello from eve`;
	return `Used ${e.toolName} for "${n}": ${formatToolOutput(e.output)}`;
}
function createToolCallGenerateResult(e) {
	return createToolCallsGenerateResult({
		calls: [{
			input: e.input,
			toolCallId: e.toolCallId,
			toolName: e.toolName
		}],
		inputTokens: e.inputTokens,
		modelId: e.modelId,
		outputTokens: e.outputTokens
	});
}
function createToolCallsGenerateResult(e) {
	return {
		content: e.calls.map((e) => ({
			input: JSON.stringify(e.input),
			toolCallId: e.toolCallId,
			toolName: e.toolName,
			type: `tool-call`
		})),
		finishReason: {
			raw: void 0,
			unified: `tool-calls`
		},
		response: {
			id: `bootstrap-response`,
			modelId: e.modelId,
			timestamp: /* @__PURE__ */ new Date(`2026-03-16T00:00:00.000Z`)
		},
		usage: {
			inputTokens: {
				cacheRead: 0,
				cacheWrite: 0,
				noCache: e.inputTokens,
				total: e.inputTokens
			},
			outputTokens: {
				reasoning: 0,
				text: e.outputTokens,
				total: e.outputTokens
			}
		},
		warnings: []
	};
}
function getAvailableTools(e) {
	return (e.tools ?? []).flatMap((e) => e.type === `function` ? [{
		description: e.description,
		inputSchema: `inputSchema` in e ? e.inputSchema : void 0,
		name: e.name,
		outputSchema: `outputSchema` in e ? e.outputSchema : void 0
	}] : []);
}
function getLastAuthoredToolResult(e) {
	let t = getSkillLoads(e);
	for (let n of [...e].reverse()) {
		if (n.role === `user`) {
			let e = getPromptContentText(n.content).trim();
			let t = readTaskResults(e).at(-1);
			if (t !== void 0) {
				let { body: e, taskId: n, tool: r } = t;
				return {
					isError: t.status === `failed`,
					output: e,
					toolCallId: n,
					toolName: r
				};
			}
			if (isFrameworkAnnouncementText(e)) continue;
			return null;
		}
		if (n.role === `tool` || n.role === `assistant`) {
			for (let e of [...n.content].reverse()) if (typeof e != `string` && e.type === `tool-result` && !t.has(e.toolCallId)) return {
				isError: e.output.type === `error-json` || e.output.type === `error-text` || e.output.type === `execution-denied`,
				output: e.output.type === `execution-denied` ? {
					reason: e.output.reason ?? null,
					type: e.output.type
				} : e.output.value,
				toolCallId: e.toolCallId,
				toolName: e.toolName
			};
		}
	}
	return null;
}
function findNextExplicitToolAfterResult(e) {
	let t = getLastUserPromptText(e.prompt);
	if (t === null) return null;
	let n = normalizeText(t);
	let r = n.indexOf(normalizeText(e.previousToolName));
	return r < 0 ? null : e.tools.filter((t) => t.name !== e.previousToolName).flatMap((e) => {
		let t = n.indexOf(normalizeText(e.name), r + 1);
		return t < 0 ? [] : [{
			index: t,
			tool: e
		}];
	}).sort((e, t) => e.index - t.index)[0]?.tool ?? null;
}
function createFollowUpToolInput(e) {
	return isRecord(e) && typeof e.stepKey == `string` ? { stepKey: e.stepKey } : null;
}
function getSystemPromptLabels(e) {
	let t = e.filter((e) => e.role === `system`);
	if (t.length === 0) return [];
	let n = t.flatMap((e) => {
		let t = getPromptContentText(e.content);
		if (t.startsWith(`Available skills
`)) return [];
		let n = t.split(`
`).map((e) => e.trim()).filter((e) => e.length > 0);
		let r = [];
		for (let e of n) {
			if (e === "You are the eve bootstrap agent. Be concise, stay grounded in the current conversation, and do not assume tools are available unless the runtime provides them." || e === `Available skills`) continue;
			let t = /^System \((.+)\)$/.exec(e);
			if (t?.[1]) {
				r.push(t[1]);
				continue;
			}
			let n = /^Skill \((.+)\)$/.exec(e);
			n?.[1] && r.push(n[1]);
		}
		if (r.length > 0) return r;
		let i = n.find((e) => e !== "You are the eve bootstrap agent. Be concise, stay grounded in the current conversation, and do not assume tools are available unless the runtime provides them." && e !== `Available skills`);
		return i === void 0 ? [] : [i];
	});
	return [...new Set(n)];
}
function findRelevantTool(e, t) {
	let n = normalizeText(t);
	let r = e.find((e) => e.name !== `agent` && n.includes(normalizeText(e.name)));
	return r === void 0 ? /\b(forecast|temperature|weather|wind|rain|snow)\b/u.test(n) ? e.find((e) => /\b(forecast|temperature|weather|wind|rain|snow)\b/u.test(normalizeText(`${e.name} ${e.description ?? ``}`))) ?? null : null : r;
}
function normalizeText(e) {
	return e.toLowerCase().replace(/[^a-z0-9]+/gu, ` `).trim();
}
function createToolCallId(e) {
	return `call_${e.toLowerCase().replace(/[^a-z0-9]+/gu, `_`).replace(/^_+|_+$/gu, ``) || `tool`}`;
}
function resolveSystemProbe(e) {
	let t = e.filter((e) => e.role === `system`).map((e) => getPromptContentText(e.content)).join(`
`);
	return /hmr-probe:\s*([^\n]+)/iu.exec(t)?.[1]?.trim() || null;
}
function isWeatherPayload(e) {
	return z.validate(bootstrapWeatherPayloadSchema, e);
}
function isRecord(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
const ATTACHMENT_NOTE = /^Attachment\b/u;
function listPromptAttachments(e) {
	return e.flatMap((e) => e.role !== `user` || typeof e.content == `string` ? [] : e.content.flatMap((e) => {
		if (typeof e == `string`) return [];
		if (e.type === `text`) return ATTACHMENT_NOTE.test(e.text) ? [{ note: e.text.replaceAll(`"`, `'`) }] : [];
		if (e.type !== `file`) return [];
		let t = e.filename?.split(`/`).at(-1) ?? null;
		let n = fileData(e.data);
		if (n instanceof URL) return [{
			mediaType: e.mediaType,
			name: t,
			url: n.href
		}];
		if (n === void 0) return [{
			mediaType: e.mediaType,
			name: t
		}];
		let r = typeof n == `string` ? Buffer.from(n, `base64`) : Buffer.from(n);
		return [{
			bytes: r.length,
			mediaType: e.mediaType,
			name: t,
			sha256: createHash(`sha256`).update(r).digest(`hex`).slice(0, 16)
		}];
	}));
}
function fileData(e) {
	if (typeof e == `string` || e instanceof Uint8Array || e instanceof URL) return e;
	if (typeof e != `object` || !e) return;
	let t = e;
	if (t.type === `url` && t.url instanceof URL) return t.url;
	if (t.type === `data`) return fileData(t.data);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/resolve-model.js
var InvalidRuntimeModelSelectionError = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = `InvalidRuntimeModelSelectionError`;
	}
};
async function resolveRuntimeModelReference(e, t) {
	let n = resolveBootstrapRuntimeModel(e);
	if (n !== null) return n;
	let r = resolveMockAuthoredRuntimeModel(e);
	if (r !== null) return r;
	if (isSourceBackedRuntimeModelReference(e)) return await loadSourceBackedRuntimeModelReference(e, t);
	if (e.credentialed === !0) throw Error(`The dynamic model function failed, and the "${e.id}" model needs it to run on the caller's credential.`);
	return localGatewayModel(e.id) ?? e.id;
}
async function loadSourceBackedRuntimeModelReference(e, t) {
	if (t === void 0) throw Error(`Expected a compiled module-map scope to resolve the authored runtime model "${e.id}".`);
	let n = await loadResolvedModuleExport({
		definition: e.source,
		kindLabel: `runtime model "${e.id}"`,
		moduleMap: t.moduleMap,
		nodeId: t.nodeId
	});
	if (e.sourceModelOption !== void 0) return agentToolOptionModel(n, e.sourceModelOption, e.source);
	let r = normalizeAgentDefinition(n, `Expected the authored agent config export "${e.source.exportName ?? `default`}" from "${e.source.logicalPath}" to match the public eve shape.`);
	let i = e.sourceField === `compaction.model` ? r.compaction?.model : r.model;
	if (i === void 0) throw Error(`Expected the authored agent config export "${e.source.exportName ?? `default`}" from "${e.source.logicalPath}" to provide a runtime model at "${e.sourceField ?? `model`}".`);
	if (isDynamicModelDefinition(i)) throw Error(`Expected the authored agent config export "${e.source.exportName ?? `default`}" from "${e.source.logicalPath}" to provide a static runtime model.`);
	return isDefinedModel(i) ? i : toAiSdkLanguageModel(i);
}
function agentToolOptionModel(e, t, n) {
	let r = readAgentToolModels(e)?.get(t);
	if (r === void 0) throw Error(`The model option "${t}" this session chose is no longer one of the agent({ models }) options in "${n.logicalPath}".`);
	let i = selectionModel(r.selection);
	if (typeof i == `string`) throw Error(`Expected the agent({ models }) option "${t}" in "${n.logicalPath}" to hold a provider model.`);
	return isDefinedModel(i) ? i : toAiSdkLanguageModel(i);
}
function isSourceBackedRuntimeModelReference(e) {
	return e.source !== void 0;
}
async function loadDynamicRuntimeModelDefinition(e) {
	let t = await loadResolvedModuleExport({
		definition: e.dynamicModel,
		kindLabel: `dynamic runtime model`,
		moduleMap: e.scope.moduleMap,
		nodeId: e.scope.nodeId
	});
	let n = normalizeAgentDefinition(t, `Expected the authored agent config export "${e.dynamicModel.exportName ?? `default`}" from "${e.dynamicModel.logicalPath}" to match the public eve shape.`).model;
	if (!isDynamicModelDefinition(n)) throw Error(`Expected the authored agent config export "${e.dynamicModel.exportName ?? `default`}" from "${e.dynamicModel.logicalPath}" to provide a dynamic model definition.`);
	return n;
}
async function resolveRuntimeModelSelection(e) {
	if (e.selection === null || e.selection === void 0) throw new InvalidRuntimeModelSelectionError(`The dynamic model returned no model. Return a model ID, a provider model, or { model, reasoning?, modelContextWindowTokens?, modelOptions? }.`);
	let t;
	let n;
	let r;
	try {
		t = normalizeDynamicModelSelection(e.selection), validateDynamicModelSelection(t), n = t.modelOptions?.providerOptions === void 0 ? void 0 : parseProviderOptionsRecord(t.modelOptions.providerOptions), r = t.modelOptions?.promptCache === void 0 ? void 0 : normalizeAgentPromptCache(t.modelOptions.promptCache, `Dynamic model resolver returned an invalid selection.`);
	} catch (e) {
		throw invalidSelectionError(e);
	}
	let i = t.model;
	if (typeof i == `string`) {
		let a = formatLanguageModelGatewayId(i);
		if (r !== void 0 && !isAnthropicGatewayId(a)) throw gatewayPromptCacheError(a);
		return { reference: {
			id: a,
			contextWindowTokens: t.modelContextWindowTokens ?? (await lookupModelMetadata(e.modelMetadata, a, (e) => lookupCatalogModelBySlug(e, a))).contextWindowTokens,
			promptCache: r,
			providerOptions: n,
			reasoning: t.reasoning
		} };
	}
	if (isDefinedModel(i) || validateRuntimeLanguageModel(i), e.durability === `durable`) throw new InvalidRuntimeModelSelectionError(`Dynamic model selection returned a model object, but durable model selections must be serializable. Return a model id string.`);
	if (isDefinedModel(i)) {
		let a = t.modelContextWindowTokens ?? (await lookupModelMetadata(e.modelMetadata, i.id, (e) => lookupCatalogModelBySlug(e, i.id))).contextWindowTokens;
		return {
			model: i,
			reference: {
				id: i.id,
				contextWindowTokens: a,
				credentialed: !0,
				promptCache: r,
				providerOptions: n,
				reasoning: t.reasoning
			}
		};
	}
	let a = formatLanguageModelGatewayId(i);
	let o = i.provider.split(`.`)[0] === `gateway`;
	if (r !== void 0 && o && !isAnthropicGatewayId(i.modelId)) throw gatewayPromptCacheError(a);
	let s = o ? i.modelId : a;
	let c = t.modelContextWindowTokens;
	if (c === void 0) {
		let t = await lookupModelMetadata(e.modelMetadata, s, (e) => o ? lookupCatalogModelBySlug(e, i.modelId) : lookupCatalogModelByProviderModelId(e, i.provider, i.modelId));
		o || (s = t.slug), c = t.contextWindowTokens;
	}
	return {
		model: i,
		reference: {
			id: s,
			contextWindowTokens: c,
			promptCache: r,
			providerOptions: n,
			reasoning: t.reasoning
		}
	};
}
function invalidSelectionError(e) {
	return e instanceof InvalidRuntimeModelSelectionError ? e : new InvalidRuntimeModelSelectionError(e instanceof Error ? e.message : String(e), { cause: e });
}
function isAnthropicGatewayId(e) {
	return e.split(`/`)[0] === `anthropic`;
}
function gatewayPromptCacheError(e) {
	return new InvalidRuntimeModelSelectionError(`Dynamic model resolver returned modelOptions.promptCache for "${e}", which routes through AI Gateway. promptCache applies to Anthropic models and to models eve calls directly; Gateway manages its own prompt caching for other models through providerOptions.gateway.caching.`);
}
async function lookupModelMetadata(e, t, n) {
	let r = await e();
	let i = n(r);
	if (i !== null) return i;
	throw new InvalidRuntimeModelSelectionError(r.fetchedAt === null ? `Cannot select model "${t}" because this build couldn't read the AI Gateway model catalog, so it has no context window for the model. Return modelContextWindowTokens with this selection, or rebuild with network access to ai-gateway.vercel.sh.` : `Cannot select model "${t}" because the AI Gateway model catalog this build read at ${r.fetchedAt} has no context window for it. Return modelContextWindowTokens with this selection for an unlisted or custom model, or rebuild to pick up a newly published one.`);
}
const DYNAMIC_MODEL_SELECTION_KEYS = /* @__PURE__ */ new Set([
	`model`,
	`modelContextWindowTokens`,
	`modelOptions`,
	`reasoning`
]);
function validateDynamicModelSelection(e) {
	let t = Object.keys(e).filter((e) => !DYNAMIC_MODEL_SELECTION_KEYS.has(e));
	if (t.length > 0) throw Error(`A dynamic model returns only runtime settings: model, reasoning, modelContextWindowTokens, and modelOptions. It returned ${t.map((e) => `"${e}"`).join(`, `)}, which can't vary per session; declare ${t.length === 1 ? `it` : `them`} on defineAgent() instead.`);
	if (e.reasoning !== void 0 && !isAgentReasoningDefinition(e.reasoning)) throw Error(`Dynamic model resolver returned an invalid reasoning effort. Expected provider-default, none, minimal, low, medium, high, or xhigh.`);
	let n = e.modelContextWindowTokens;
	if (n !== void 0 && (!Number.isInteger(n) || n <= 0)) throw Error(`Dynamic model resolver returned an invalid modelContextWindowTokens value. Expected a positive integer.`);
	if (typeof e.model == `string` && e.model.trim() === ``) throw Error(`Dynamic model resolver returned an empty model id.`);
}
function normalizeDynamicModelSelection(e) {
	return isModelSelectionDefinition(e) ? e : { model: e };
}
function isModelSelectionDefinition(e) {
	return typeof e == `object` && !!e && `model` in e && !isRuntimeLanguageModel(e);
}
function validateRuntimeLanguageModel(e) {
	if (!isRuntimeLanguageModel(e)) throw new InvalidRuntimeModelSelectionError(`Dynamic model resolver returned an invalid model. Return an AI Gateway model id string, an AI SDK language model, a defineModel value, or { model, modelContextWindowTokens?, modelOptions? }.`);
}
function parseProviderOptionsRecord(e) {
	if (e === void 0) return;
	let t = {};
	for (let [n, r] of Object.entries(e)) t[n] = parseJsonObject(r);
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/model.js
const DYNAMIC_MODEL_SELECTION_ERROR_CODE = `EVE_DYNAMIC_MODEL_SELECTION_FAILED`;
var DynamicModelSelectionError = class extends Error {
	code = DYNAMIC_MODEL_SELECTION_ERROR_CODE;
	name = `DynamicModelSelectionError`;
	constructor(e) {
		super(toErrorMessage(e), { cause: e });
	}
};
function isDynamicModelSelectionError(e) {
	return e instanceof DynamicModelSelectionError || typeof e == `object` && !!e && e.code === DYNAMIC_MODEL_SELECTION_ERROR_CODE;
}
async function loadModelDefinition(e) {
	let t = e.turnAgent.dynamicModel;
	if (t === void 0) return;
	let n = await loadDynamicRuntimeModelDefinition({
		dynamicModel: t,
		scope: {
			moduleMap: e.moduleMap,
			nodeId: e.nodeId
		}
	});
	return modelDefinition(e.modelMetadata, {
		choose: authoredEvaluate(dynamicEvaluate(n)),
		id: `model:agent`,
		label: `${t.logicalPath}#model`
	});
}
function modelDefinition(e, t) {
	return {
		contribute: (n) => ({ model: async () => {
			let r = await n.keep(async (n) => {
				let r = await t.choose(n);
				try {
					return await keptModel(r, e);
				} catch (e) {
					throw new DynamicModelSelectionError(e);
				}
			}, { choosesModel: !0 });
			let i = r?.value;
			if (i != null) return r?.live ?? { reference: i.reference };
		} }),
		id: t.id,
		label: t.label
	};
}
async function keptModel(e, t) {
	let n = await resolveRuntimeModelSelection({
		durability: `live`,
		modelMetadata: t,
		selection: e
	});
	let r = n.model === void 0 || !isMockModel(n.model) && shouldMockAuthoredRuntimeModels() ? void 0 : n;
	let i = { reference: n.reference };
	return {
		live: r,
		value: parseJsonValue(i)
	};
}
const ChosenModelKey = new ContextKey(`eve.model`);
async function chooseModel(e, t) {
	let n = await decideModel(e);
	return n !== void 0 && t.set(ChosenModelKey, { reference: n.reference }), n;
}
function currentModel(e) {
	return e.get(ChosenModelKey)?.reference ?? givenModel(e) ?? compiledBundleOf(e)?.turnAgent.model;
}
function effectiveModelId(e) {
	return currentModel(e)?.id;
}
function givenModel(e) {
	return e.get(AgentSessionRuntimeOverridesKey)?.model ?? e.get(DynamicSubagentAgentConfigKey)?.model;
}
function agentModel(e) {
	let t = e.turnAgent.model;
	if (t !== void 0) return {
		contribute: () => ({ model: () => ({ reference: t }) }),
		id: `eve.model`,
		label: `agent.ts#model`
	};
}
const parentModel = {
	contribute: ({ container: e }) => ({ model: () => {
		let t = givenModel(e);
		return t === void 0 ? void 0 : { reference: t };
	} }),
	id: `eve.model.parent`,
	label: `the model the session was given`
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/intents.js
const log$4 = createLogger(`hooks`);
function queueCommands(e, t, n, r) {
	if (r.length === 0) return;
	let i = readDefinitionsState(e);
	let a = [...i.intents ?? []];
	let { continuation: o, sessionEnd: s } = i;
	let c = activeTurnIdOf(currentProjection(e));
	let l = !1;
	let queueTurnCancel = (e) => {
		c !== void 0 && i.cancelledTurnId !== c && (a.some((e) => e.type === `cancel` && e.turnId === c) || (a.push({
			occurrence: n,
			reactionId: t.id,
			type: `cancel`,
			...e !== void 0 && { reason: e },
			turnId: c
		}), l = !0));
	};
	for (let e of r) if (e.type === `end`) s === void 0 && (s = { hook: e.hook }, l = !0), o !== void 0 && (o = void 0, l = !0), queueTurnCancel(e.reason);
	else if (e.type === `continue`) {
		if (s !== void 0) continue;
		let t = o?.turnId === e.turnId ? o : void 0;
		o = {
			delivery: t === void 0 ? e.delivery : coalesceDeliveries([t.delivery, e.delivery]),
			turnId: e.turnId
		}, l = !0;
	} else queueTurnCancel(e.reason);
	if (l) {
		let { continuation: t, ...n } = i;
		writeDefinitionsState(e, {
			...n,
			intents: a,
			...o !== void 0 && { continuation: o },
			...s !== void 0 && { sessionEnd: s }
		});
	}
}
function takeIntents(e, t) {
	let n = readDefinitionsState(e);
	let r = (n.intents ?? []).filter(t);
	if (r.length === 0) return r;
	let i = (n.intents ?? []).filter((e) => !t(e));
	return writeDefinitionsState(e, {
		...n,
		intents: i
	}), r;
}
function reportEffectFailure(e, t, n, r) {
	let i = activeTurnIdOf(currentProjection(e));
	let a = toErrorMessage(n);
	let o = `${t.id.startsWith(`memory:`) ? `Memory` : `Hook`} "${t.label}"`;
	if (log$4.error(`${o} failed.`, {
		error: a,
		occurrence: r,
		turnId: i
	}), i === void 0) return;
	let s = readDefinitionsState(e);
	let c = s.intents ?? [];
	c.some((e) => e.type === `fail` && e.turnId === i) || writeDefinitionsState(e, {
		...s,
		intents: [...c, {
			occurrence: r ?? `fail:${i}`,
			reactionId: t.id,
			reason: `${o} failed: ${a}`,
			turnId: i,
			type: `fail`
		}]
	});
}
function takeTurnFailure(e) {
	let t = activeTurnIdOf(currentProjection(e));
	if (t === void 0) return;
	let [n] = takeIntents(e, (e) => e.type === `fail` && e.turnId === t);
	return n?.reason;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/turn.js
function latestTurn(e) {
	let t = e.session.latestTurnId;
	let n = t === void 0 ? void 0 : e.turns[t];
	return n === void 0 ? null : {
		id: n.turnId,
		input: turnInput(e, n),
		status: n.status
	};
}
function turnInput(e, t) {
	let n = `deliveryId` in t.cause ? t.cause.deliveryId : void 0;
	return Object.values(e.deliveries).filter((e) => e.turnId === t.turnId && e.parts !== void 0 && (e.deliveryId === n || e.introducedAt < t.introducedAt)).sort((e, t) => e.introducedAt - t.introducedAt).flatMap((e) => e.parts ?? []);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/frame.js
function channelOf(e) {
	let t = e.get(ChannelKey);
	let n = e.get(ChannelInstrumentationKey);
	return {
		continuationToken: e.get(ContinuationTokenKey),
		kind: normalizeInstrumentationChannelKind(n?.kind ?? (t === void 0 ? void 0 : getAdapterKind(t))),
		metadata: n?.metadata ?? {}
	};
}
function sessionFrameOf(e, t = {}) {
	let n = e.get(ConversationContextKey);
	let r = e.get(ParentSessionKey);
	let i = e.get(SteeredByKey);
	let a = t.view ?? currentView(e);
	let o = t.at ?? readDefinitionsState(e).at ?? a.session.startedAt;
	return {
		channel: channelOf(e),
		...n !== void 0 && { conversation: n },
		now: new Date(o ?? 0),
		session: {
			auth: {
				current: e.get(AuthKey) ?? null,
				initiator: e.get(InitiatorAuthKey) ?? null,
				...i !== void 0 && i.length > 0 && { steeredBy: i }
			},
			id: sessionIdOf(e),
			...r !== void 0 && { parent: r },
			predecessor: e.get(SessionPredecessorKey),
			schedule: readSessionSchedule(e)
		},
		turn: latestTurn(a),
		view: snapshotOf(a)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/memos.js
const log$3 = createLogger(`definitions.memos`);
const RUNNING_GLOBAL_KEY = Symbol.for(`eve.reactions.memo-running`);
function keyOf(e, t, n) {
	let r = toJson(e ?? null, `"${t}": ${n} key`, { key: !0 });
	let i = Buffer.byteLength(canonicalJson(r));
	if (i > 65536) throw Error(`"${t}": ${n} received a ${Math.ceil(i / 1024)} KB key; a key is at most 64 KB. Key on an ID, such as a tenant or turn ID.`);
	return { digest: digestOf(r) };
}
function openMemos(e) {
	let t = {};
	let n = {};
	let r = 0;
	let use = (t, i) => {
		if (r += memoBytes({ [t]: i }), r > 4194304) throw Error(`"${e.label}": ctx.memo (key ${t}) brought this evaluation's memos to ${Math.ceil(r / 1024)} KB of JSON; one definition or hook keeps at most 4 MB, and every step of the session carries it. Memo once per collection rather than once per row or user-supplied value, and keep IDs rather than whole records.`);
		n[t] = i;
	};
	let i = /* @__PURE__ */ new Set();
	let a = !1;
	return {
		close: () => {
			a = !0;
		},
		memo: (async (n, r) => {
			assertCallable(e.label, `ctx.memo`, a, t);
			let { digest: o } = keyOf(n, e.label, `ctx.memo`);
			if (i.has(o)) throw Error(`"${e.label}" called ctx.memo twice with the same key (${o}) in one evaluation. Give each memo a distinct key, such as ["tables", ctx.session.id] and ["flags", ctx.turn?.id ?? null].`);
			i.add(o);
			let s = e.kept?.[o];
			if (s !== void 0) return use(o, s), cloneJson(s);
			if (e.restoring !== void 0) throw Error(`"${e.label}": ${e.restoring} (memo key ${o}).`);
			let c = {
				abortSignal: e.abortSignal,
				idempotencyKey: `${e.sessionId}:${e.scope}:memo:${o}`
			};
			let l = Date.now();
			let u = toJson(await withContextScopeValue(RUNNING_GLOBAL_KEY, t, () => r(c)) ?? null, `"${e.label}": ctx.memo (key ${o}) returned`);
			return assertResultSize(u, e.label, o), log$3.debug(`Ran a memo`, {
				durationMs: Date.now() - l,
				file: e.label,
				key: o,
				reason: e.afterDeployment === !0 ? `deployment change` : `new key`
			}), use(o, u), cloneJson(u);
		}),
		used: () => n
	};
}
function assertCallable(e, t, n, r) {
	if (contextScopeValue(RUNNING_GLOBAL_KEY) === r) throw Error(`"${e}" called ${t} inside a memo. Memos don't nest: call ${t} from the definition, and pass what the inner one needs from outside.`);
	if (n) throw Error(`"${e}" called ${t} after its evaluation settled. Await every ${t} before the function returns.`);
}
function assertResultSize(e, t, n) {
	let r = memoBytes(e);
	if (r > 1048576) throw Error(`"${t}": ctx.memo (key ${n}) returned ${Math.ceil(r / 1024)} KB of JSON; a memo result is at most 1 MB, and every step of the session carries it. Keep an ID, and fetch the rest where it's used.`);
}
function cloneJson(e) {
	return JSON.parse(JSON.stringify(e));
}
function toJson(e, t, n) {
	let visit = (e, r) => {
		if (e === null) return null;
		switch (typeof e) {
			case `string`:
			case `boolean`: return e;
			case `number`:
				if (Number.isFinite(e)) return e;
				throw notJson(t, String(e), r);
			case `object`: {
				if (Array.isArray(e)) return e.map((e, n) => {
					if (e === void 0) throw notJson(t, `undefined`, `${r}[${n}]`);
					return visit(e, `${r}[${n}]`);
				});
				let i = Object.getPrototypeOf(e);
				if (i !== Object.prototype && i !== null) throw notJson(t, e.constructor?.name ?? `object`, r);
				let a = {};
				for (let [i, o] of Object.entries(e)) {
					let e = /^[A-Za-z_$][\w$]*$/.test(i) ? `${r}.${i}` : `${r}[${JSON.stringify(i)}]`;
					if (o === void 0) {
						if (n?.key !== !0) continue;
						throw Error(`${t} has undefined at ${e}, which would share a memo with a key that leaves it out. Pass null for a missing value, such as \`tenantId ?? null\`.`);
					}
					a[i] = visit(o, e);
				}
				return a;
			}
			default: throw notJson(t, typeof e, r);
		}
	};
	return visit(e, `$`);
}
function notJson(e, t, n) {
	return Error(`${e} ${t} at ${n}. Memo keys and results must be JSON: return plain data, and build tools, clients, or dates from it outside the memo.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/hooks.js
function hookDefinition(e) {
	let t = {
		id: `hook:${e.slug}`,
		label: e.logicalPath
	};
	return {
		...t,
		contribute: (n) => ({ effects: () => (n.commit?.written ?? []).flatMap(({ event: r, position: i, progress: a, view: o }) => {
			let { meta: s, ...c } = r;
			return (a ? [c.type] : [c.type, `*`]).flatMap((r) => {
				let a = e.events[r];
				return a === void 0 ? [] : [{
					id: t.id,
					run: () => runHandler({
						at: s?.at,
						commit: n.commit,
						ctx: n.container,
						event: c,
						handler: a,
						key: r,
						occurrence: `${i.line}.${i.index}`,
						position: i,
						definition: t,
						signal: n.signal,
						slug: e.slug,
						view: o
					})
				}];
			});
		}) })
	};
}
async function runHandler(e) {
	let { ctx: t, signal: n } = e;
	let { id: r, label: i } = e.definition;
	let a = buildCallbackContext();
	let o = sessionFrameOf(t, {
		at: e.at,
		view: e.view
	});
	let s = a.session.id;
	let c = `${s}:${r}:${e.occurrence}:${e.key}`;
	let l = `${r}#${e.key}`;
	let u = !1;
	let d = openMemos({
		abortSignal: n,
		afterDeployment: discardedByDeployment(t, l),
		kept: readDefinitionsState(t).memos?.[l],
		label: i,
		scope: l,
		sessionId: s
	});
	let f = [];
	let assertOpen = (e) => {
		if (u) throw Error(`Hook "${i}" called ctx.${e}() after its handler settled. Await the work that calls it before the handler returns.`);
	};
	let cancel = (e) => {
		assertOpen(`cancel`), f.push(e === void 0 ? { type: `cancel` } : {
			reason: e,
			type: `cancel`
		});
	};
	let end = (t) => {
		assertOpen(`end`), e.event.type !== `session.ended` && f.push(t === void 0 ? {
			hook: e.slug,
			type: `end`
		} : {
			hook: e.slug,
			reason: t,
			type: `end`
		});
	};
	let continueTurn = (n, a = {}) => {
		if (assertOpen(`continue`), normalizeMessage(n) === void 0) throw TypeError(`Hook "${i}" called ctx.continue() without a message.`);
		if (e.event.type !== `turn.settled`) return {
			queued: !1,
			reason: `not-settled`
		};
		let o = e.event.data;
		let c = readDefinitionsState(t);
		let l = o.outcome === `cancelled` && c.cancelledTurnId === o.turnId && c.cancelledBy === r;
		if (o.outcome !== `completed` && !l) return {
			queued: !1,
			reason: `not-completed`
		};
		let { turnId: u } = o;
		let d = [...f.flatMap((e) => e.type === `continue` && e.turnId === u ? [e.delivery] : []), ...c.continuation?.turnId === u ? [c.continuation.delivery] : []];
		return d.some(({ deliveryMetadata: t }) => t?.some((t) => t.hook === e.slug)) ? {
			queued: !1,
			reason: `already-queued`
		} : d.length > 0 && actsFor(t, d[0].auth) !== actsFor(t, a.auth) ? {
			queued: !1,
			reason: `auth-conflict`
		} : (f.push({
			delivery: hookDelivery(t, {
				...a,
				idempotencyKey: continuationKey(s, u),
				message: n,
				slug: e.slug
			}),
			turnId: u,
			type: `continue`
		}), { queued: !0 });
	};
	let p = {
		...a,
		...o,
		agent: agentOf(t),
		cancel,
		end,
		memo: d.memo,
		occurrence: {
			abortSignal: n,
			idempotencyKey: c
		},
		position: e.position,
		session: {
			...a.session,
			...o.session
		},
		...HOOK_CONTINUE_KEYS[e.key] === !0 && { continue: continueTurn }
	};
	try {
		await e.handler(e.event, p), keepMemos(t, l, d.used()), u = !0;
		let n = (e.event.type === `delivery.admitted` || e.event.type === `session.started`) && activeTurnIdOf(currentProjection(t)) === void 0 ? e.commit.cancelBeforeTurn : void 0;
		if (n === void 0) queueCommands(t, e.definition, c, f);
		else {
			let a = f.find((e) => e.type === `end`);
			if (a !== void 0) queueCommands(t, e.definition, c, [a]), n({
				hook: i,
				...a.reason !== void 0 && { reason: a.reason }
			});
			else if (e.event.type === `delivery.admitted`) {
				for (let a of f) if (a.type === `cancel`) {
					let o = e.commit.written.flatMap(({ event: e }) => e.type === `delivery.admitted` ? [e.data.deliveryId] : []);
					writeDefinitionsState(t, {
						...readDefinitionsState(t),
						cancelledOpening: {
							by: r,
							deliveryIds: o
						}
					}), n({
						hook: i,
						...a.reason !== void 0 && { reason: a.reason }
					});
				}
			}
		}
	} catch (n) {
		mergeMemos(t, l, d.used()), reportEffectFailure(t, e.definition, n, c);
	} finally {
		u = !0, d.close();
	}
}
function actsFor(e, t) {
	return principalOf$1(t === void 0 ? e.get(AuthKey) : t);
}
function agentOf(e) {
	let t = sessionAgent(e);
	return {
		name: t.id,
		nodeId: t.nodeId
	};
}
function hookDelivery(e, t) {
	let n = e.get(ChannelDeliveryKey);
	let r = n?.channelKind ?? e.get(ChannelInstrumentationKey)?.kind ?? getAdapterKind(e.require(ChannelKey));
	return {
		...t.auth !== void 0 && { auth: t.auth },
		deliveryMetadata: [{
			channelKind: r,
			channelName: n?.channelName ?? r,
			deliveryId: crypto.randomUUID(),
			hook: t.slug,
			payloadIndex: 0
		}],
		idempotencyKey: t.idempotencyKey,
		kind: `deliver`,
		payloads: [{
			...t.context !== void 0 && { context: t.context },
			message: serializeFilePartsInMessage(t.message)
		}],
		turnPolicy: `queue`
	};
}
function settleHookCommands(e, t, n) {
	actOnCancels(e, t, n.cancelTurn), dropYieldedContinuations(e, n.written);
}
function actOnCancels(e, t, n) {
	let r = activeTurnIdOf(currentProjection(e));
	takeIntents(e, (e) => (e.type === `cancel` || e.type === `fail`) && e.turnId !== r);
	let [i] = (readDefinitionsState(e).intents ?? []).filter((e) => e.type === `cancel`);
	if (i === void 0 || n === void 0) return;
	let a = t.find(({ id: e }) => e === i.reactionId)?.label ?? i.reactionId;
	takeIntents(e, (e) => e.type === `cancel`), writeDefinitionsState(e, {
		...readDefinitionsState(e),
		cancelledBy: i.reactionId,
		cancelledTurnId: i.turnId
	}), n({
		hook: a,
		...i.reason !== void 0 && { reason: i.reason }
	});
}
function dropYieldedContinuations(e, t) {
	let { continuation: n, ...r } = readDefinitionsState(e);
	if (n === void 0) return;
	let i = latestTurnIdOf(currentProjection(e));
	(r.sessionEnd !== void 0 || n.turnId !== i || t.some(({ event: e }) => stopsContinuations(e))) && writeDefinitionsState(e, r);
}
function stopsContinuations(e) {
	if (e.type === `context.settled`) return e.data.kind === `clear` && e.data.outcome === `completed`;
	if (e.type !== `delivery.admitted`) return !1;
	let { source: t } = e.data;
	return t !== void 0 && `control` in t && (t.control === `cancel` || t.control === `reset`);
}
function bindOpeningCancel(e, t) {
	let { cancelledOpening: n, ...r } = e;
	if (n === void 0) return e;
	let i = t.find(({ event: e }) => e.type === `turn.started`)?.event;
	if (i?.type !== `turn.started`) return e;
	let { cause: a, turnId: o } = i.data;
	return `deliveryId` in a && n.deliveryIds.includes(a.deliveryId) ? {
		...r,
		cancelledBy: n.by,
		cancelledTurnId: o
	} : r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/prompt/compose.js
function agentInstructionsOf(e) {
	let t = (e ?? []).filter((e) => e.role === `system` && e.content.trim().length > 0);
	if (t.length === 0) return;
	let n = t.length === 1 ? t[0] : void 0;
	let r = n !== void 0 && n.owner.kind !== `extension` ? n.name : `instructions`;
	return {
		content: t.map((e) => e.content).join(`

`).trim(),
		name: r
	};
}
function renderInstructionsBlock(e) {
	return `Instructions (${e.name})\n${e.content}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/workspace/spec.js
function createWorkspacePromptSection(e) {
	return e.rootEntries.length === 0 ? void 0 : [
		`Workspace`,
		`- You have access to authored files mounted at the workspace root for this run.`,
		"- The workspace root is the directory where `bash` commands start; `pwd` prints its absolute path.",
		`- Root entries under the workspace root:`,
		...e.rootEntries.map((e) => `  - ${e}`),
		"- For questions about workspace paths or file availability, verify with `bash` first using commands like `pwd`, `ls`, and `find`.",
		"- If the required `bash` verification fails, report that failure directly instead of answering from this overview.",
		"- Use the `bash` tool with `ls`, `find`, and `rg` to inspect deeper contents when needed.",
		`- Do not claim these files are unavailable unless a workspace or tool call actually fails.`
	].join(`
`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/instructions-definition.js
const INSTRUCTIONS_BRAND = Symbol.for(`eve:instructions-brand`);
function isBrandedInstructionsEntry(e) {
	return typeof e == `object` && !!e && e[INSTRUCTIONS_BRAND] === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/instructions.js
const instructions = {
	contribute: ({ container: e }) => ({
		announcements: () => Object.fromEntries(staticUserInstructions(e).map(({ content: e, key: t }) => [t, userInstruction(e, digestOf(e))])),
		system: () => {
			let t = agentInstructionsOf(compiledBundleOf(e)?.resolvedAgent.instructions);
			return [section(`eve.instructions`, t === void 0 ? `` : renderInstructionsBlock(t), { order: SECTION_ORDER.instructions })];
		}
	}),
	id: `eve.instructions`,
	label: `the agent's instructions`
};
const workspace = {
	contribute: ({ container: e }) => ({ system: () => {
		let t = compiledBundleOf(e)?.turnAgent?.workspaceSpec;
		let n = t === void 0 ? void 0 : createWorkspacePromptSection(t);
		return n === void 0 ? [] : [section(`eve.workspace`, n, { order: SECTION_ORDER.workspace })];
	} }),
	id: `eve.workspace`,
	label: `the agent's workspace`
};
function instructionsDefinition(e) {
	let t = `instructions:${e.slug}`;
	let n = authoredEvaluate(e.evaluate);
	return {
		contribute: (r) => {
			let kept = async () => await r.keep(async (t) => ({ value: instructionOf(e, await n(t)) }));
			return {
				announcements: async () => {
					let e = (await kept())?.value;
					if (e === void 0) return {};
					let n = e;
					return { [t]: userInstruction(n?.role === `user` ? n.content : void 0, digestOf(e)) };
				},
				system: async () => {
					let e = (await kept())?.value;
					return e?.role === `system` && e.content !== `` ? [section(t, e.content, {
						order: SECTION_ORDER.dynamicInstructions,
						part: `own`
					})] : [];
				}
			};
		},
		id: t,
		label: e.logicalPath
	};
}
function instructionOf(e, t) {
	if (t == null) return null;
	if (!isBrandedInstructionsEntry(t)) throw Error(`The dynamic instructions "${e.slug}" returned an unbranded value — wrap with defineInstructions().`);
	let n = normalizeInstructionsDefinition(t, `Expected dynamic instructions to match the public eve shape.`);
	let r = n.content.trim();
	return r.length === 0 ? null : {
		content: r,
		role: n.role ?? `system`
	};
}
function userInstruction(e, t) {
	return {
		initial: ``,
		kind: `context.instruction`,
		render: () => e,
		value: e === void 0 ? `` : t
	};
}
function staticUserInstructions(e) {
	return (compiledBundleOf(e)?.resolvedAgent.instructions ?? []).flatMap((e) => {
		let t = e.content.trim();
		return e.role === `user` && t.length > 0 ? [{
			content: t,
			key: `eve.instructions:${e.name}`
		}] : [];
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/kernel.js
const log$2 = createLogger(`definitions`);
const neverAborted = new AbortController().signal;
function contributionsOf(e, t, n, r = `read`) {
	let i = /* @__PURE__ */ new Map();
	let a = n.signal ?? neverAborted;
	return e.map((e) => e.contribute({
		...n,
		container: t,
		history: n.history,
		keep: (o, s) => {
			let c = i.get(e.id);
			return c === void 0 && (c = keepOne(t, e, o, {
				choosesModel: s?.choosesModel === !0,
				history: n.history,
				mode: r === `read` ? `restore` : `evaluate`,
				signal: a
			}), i.set(e.id, c)), c;
		},
		signal: a
	}));
}
async function keepOne(e, t, n, r) {
	if (e.get(SessionIdKey) === void 0) return;
	let i = e;
	if (r.mode === `restore`) {
		let e = readSlot(i, t.id);
		if (e === void 0) return;
		if (e.live !== !0) return { value: e.value };
		let n = readLive(i, t.id, e);
		if (n !== void 0) return {
			live: n.live,
			value: e.value
		};
	}
	let a = Date.now();
	let o;
	try {
		o = await evaluate(i, t, n, r);
	} catch (e) {
		if (r.mode === `evaluate`) throw log$2.error(`Dynamic value "${t.label}" failed; the turn fails.`, { error: toErrorMessage(e) }), new DefinitionFailedError(t.label, e);
		return log$2.warn(`Dynamic value "${t.label}" didn't evaluate for this step.`, { error: toErrorMessage(e) }), { value: readSlot(i, t.id).value };
	}
	return log$2.debug(`Evaluated a dynamic value`, {
		changed: o.changed,
		definition: t.label,
		durationMs: Date.now() - a
	}), o.changed && await t.install?.(i), o.kept;
}
async function runEffects(e, t) {
	let n = await sessionDefinitions(e);
	if (writeDefinitionsState(e, bindOpeningCancel(withLatest(readDefinitionsState(e), t.written), t.written)), t.written.length === 0) return;
	let cancelBeforeTurn;
	let r = t.cancelBeforeTurn;
	let i = contributionsOf(n, e, {
		commit: {
			...r !== void 0 && { cancelBeforeTurn: (e) => {
				cancelBeforeTurn ??= () => r(e);
			} },
			written: t.written
		},
		history: t.conversation,
		signal: t.abortSignal
	});
	for (let [t, r] of i.entries()) {
		let i = n[t];
		for (let t of await collectEffects([r])) try {
			await withUsageInEffect(() => t.run());
		} catch (n) {
			t.blocking === !0 ? blockingFailures.has(e) || blockingFailures.set(e, n) : reportEffectFailure(e, {
				id: t.id,
				label: i.label
			}, n);
		}
	}
	settleHookCommands(e, n, t), cancelBeforeTurn?.();
}
const blockingFailures = /* @__PURE__ */ new WeakMap();
function takeBlockingFailure(e) {
	if (!blockingFailures.has(e)) return;
	let t = blockingFailures.get(e);
	return blockingFailures.delete(e), t ?? Error(`A blocking effect failed.`);
}
var DefinitionFailedError = class extends Error {
	name = `DefinitionFailedError`;
	definition;
	constructor(e, t) {
		super(toErrorMessage(t), { cause: t }), this.definition = e;
	}
};
async function restoreDefinitions(e, t = {}) {
	announceHeldInstructions(e, t.conversation);
	let n = readDefinitionsState(e);
	if (t.revision !== void 0 && t.revision !== n.revision) {
		let r = n.revision !== void 0 && n.memos !== void 0;
		r && log$2.info(`The session moved to another deployment; its memos run again.`);
		let { memos: i, ...a } = n;
		writeDefinitionsState(e, {
			...r ? {
				...a,
				discarded: Object.keys(i ?? {})
			} : n,
			revision: t.revision
		});
	}
	if (process.env.NODE_ENV !== `production` && process.env.EVE_DEFINITIONS_COLD === `1`) {
		let t = e.get(SessionIdKey);
		t !== void 0 && forgetSessionLive(t);
	}
	let r = await sessionDefinitions(e);
	dropRemovedSlots(e, r);
	let i = contributionsOf(r, e, {
		history: t.conversation,
		signal: t.abortSignal
	});
	await chooseModel(i, e);
	let a = draftOf(i);
	await a.tools(), await a.system();
}
function announceHeldInstructions(e, t) {
	let n = e.get(HistoryStateKey) ?? {};
	let r = staticUserInstructions(e).filter(({ key: e }) => n.announcements?.[e] === void 0);
	if (r.length === 0) return;
	let i = new Set((t ?? []).flatMap((e) => e.role === `user` && e.kind === `context.instruction` && typeof e.content == `string` ? [e.content] : []));
	let a = r.filter(({ content: e }) => i.has(e));
	a.length !== 0 && e.set(HistoryStateKey, {
		...n,
		announcements: {
			...Object.fromEntries(a.map(({ content: e, key: t }) => [t, digestOf(e)])),
			...n.announcements
		},
		messages: {
			...Object.fromEntries(a.map(({ content: e, key: t }) => [t, announcementDigest(`context.instruction`, e)])),
			...n.messages
		}
	});
}
function dropRemovedSlots(e, t) {
	let n = readDefinitionsState(e);
	let r = new Set(t.map(({ id: e }) => e));
	let i = Object.keys(n.slots).filter((e) => !r.has(e));
	let a = Object.keys(n.memos ?? {}).filter((e) => !r.has(e.split(`#`)[0]));
	if (i.length === 0 && a.length === 0) return;
	let o = { ...n.slots };
	for (let t of i) delete o[t], clearLive(e, t);
	let s = { ...n.memos };
	for (let e of a) delete s[e];
	writeDefinitionsState(e, {
		...n,
		memos: s,
		slots: o
	});
}
async function installDefinitions(e) {
	let t = new Set((await sessionDefinitions(e)).map(({ install: e }) => e));
	for (let n of t) await n?.(e);
}
function writeSlot(e, t, n) {
	let r = readDefinitionsState(e);
	writeDefinitionsState(e, {
		...r,
		slots: {
			...r.slots,
			[t]: n
		}
	});
}
async function evaluate(e, t, n, r) {
	let i = readSlot(e, t.id);
	let call = async (a) => await n(internalContext(e, t, {
		...r,
		memo: a
	}), i?.value) ?? { value: null };
	let { result: a, used: o } = await withMemos(e, {
		abortSignal: r.signal,
		label: t.label,
		scope: t.id
	}, call);
	let s = parseJsonValue(a.value ?? null);
	let c = digestOf(s);
	if (isEveDevEnvironment() && r.mode === `evaluate`) {
		let n = openMemos({
			abortSignal: r.signal,
			kept: o,
			label: t.label,
			restoring: `a second evaluation used a memo key the first didn't`,
			scope: t.id,
			sessionId: sessionIdOf(e)
		});
		await call(n.memo).then((e) => {
			digestOf(parseJsonValue(e.value ?? null)) !== c && log$2.warn(`Dynamic value "${t.label}" returned something different when evaluated again with the same memos. Code outside a memo, such as Math.random() or Date.now() in a name or description, makes eve rebuild it before every model call; move it into a memo, or use ctx.now.`);
		}, (e) => log$2.warn(`Dynamic value "${t.label}" failed when evaluated again with the same memos.`, { error: toErrorMessage(e) })), n.close();
	}
	if (s === null && i === void 0 && a.live === void 0) return {
		changed: !1,
		kept: { value: s }
	};
	let l = i?.digest === c;
	!l && i !== void 0 && r.mode === `restore` && log$2.warn(`Dynamic value "${t.label}" offers something other than what the session was offered after a restart: code outside its memos answered differently. eve offers the new value from the next model call.`);
	let u = readDefinitionsState(e).latest[`*`] ?? 0;
	let d = {
		digest: c,
		since: l ? i.since : u,
		value: s,
		...a.live !== void 0 && { live: !0 }
	};
	return writeSlot(e, t.id, d), a.live === void 0 ? clearLive(e, t.id) : writeLive(e, t.id, d, a.live), {
		changed: !l || a.live !== void 0,
		kept: {
			value: s,
			...a.live !== void 0 && { live: a.live }
		}
	};
}
async function withMemos(e, t, n) {
	let r = openMemos({
		abortSignal: t.abortSignal ?? neverAborted,
		afterDeployment: discardedByDeployment(e, t.scope),
		kept: readDefinitionsState(e).memos?.[t.scope],
		label: t.label,
		scope: t.scope,
		sessionId: sessionIdOf(e)
	});
	let i;
	try {
		i = await n(r.memo);
	} catch (n) {
		throw mergeMemos(e, t.scope, r.used()), n;
	} finally {
		r.close();
	}
	let a = r.used();
	return keepMemos(e, t.scope, a), {
		result: i,
		used: a
	};
}
function internalContext(e, t, n) {
	let r = sessionFrameOf(e);
	let { history: i } = n;
	return Object.defineProperties({
		...r,
		abortSignal: n.signal,
		ctx: e,
		getSandbox: n.choosesModel ? () => {
			throw Error(`"${t.label}" called ctx.getSandbox() while choosing the model. Choose the model from the session, and read the sandbox in the definitions that use it.`);
		} : n.mode === `restore` ? () => {
			throw Error(`"${t.label}" called ctx.getSandbox() while eve rebuilt it in a fresh process, before the step opened its sandbox. eve evaluates it again, with the sandbox, before the next model call.`);
		} : sandboxOf(e),
		history: i,
		memo: n.memo,
		messages: async () => requireHistory(i, t.label)
	}, { model: {
		enumerable: !0,
		get() {
			if (n.choosesModel) throw Error(`"${t.label}" read ctx.model while choosing the model. The model field's function runs before the model is chosen.`);
			let r = effectiveModelId(e);
			if (r === void 0) throw Error(`"${t.label}" read ctx.model before the session chose one.`);
			return { id: r };
		}
	} });
}
function withLatest(e, t) {
	if (t.length === 0) return e;
	let n = { ...e.latest };
	let r = e.at;
	for (let { event: e, position: i, progress: a } of t) n[e.type] = i.line, a || (n[`*`] = i.line, r = e.meta?.at ?? r, (e.type === `context.started` || e.type === `context.settled`) && (n[`${e.type}:${e.data.kind ?? ``}`] = i.line));
	return {
		...e,
		latest: n,
		...r !== void 0 && { at: r }
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/messages.js
function announce(e, t, n) {
	if (awaitsProviderToolResult(e.record)) return e;
	let r = [];
	let i = e.historyState.announcements;
	let a = e.historyState.messages;
	let o = !1;
	for (let [e, t] of Object.entries(n)) {
		let n = i?.[e];
		if ((n ?? t.initial) === t.value) continue;
		let s = t.render(n);
		let { [e]: c, ...l } = a ?? {};
		if (a = l, s !== void 0) {
			let n = createFrameworkUserMessage(t.kind ?? `context.state`, s);
			r.push(n), a = {
				...a,
				[e]: announcementDigest(n.kind, n.content)
			};
		}
		i = {
			...i,
			[e]: t.value
		}, o = !0;
	}
	if (!o) return e;
	let s = e.record.findIndex((e) => t.has(e));
	let c = s === -1 ? e.record.length : s;
	return {
		...e,
		historyState: {
			...e.historyState,
			announcements: i,
			messages: a
		},
		record: [
			...e.record.slice(0, c),
			...r,
			...e.record.slice(c)
		]
	};
}
function placeAnchored(e, t) {
	if (t.length === 0) return [...e];
	let n = /* @__PURE__ */ new Map();
	e.forEach((e, t) => {
		let r = turnAnchorOf(e);
		r !== void 0 && !n.has(r) && n.set(r, t);
	});
	let r = checkpointLength(e);
	let i = t.map(({ turnId: e }) => n.get(e) ?? r);
	let a = [];
	for (let n = 0; n <= e.length; n += 1) t.forEach((e, t) => {
		i[t] === n && a.push(e.message);
	}), n < e.length && a.push(e[n]);
	return a;
}
function checkpointLength(e) {
	let [t, n] = e;
	return t?.role === `user` && t.kind === `context.compaction` && n?.role === `assistant` ? 2 : 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/step.js
function stepInfo(e) {
	return {
		agentTools: e.config.tools,
		endsTurn: e.endsTurn ?? !1,
		finalReplyOnly: e.finalReplyOnly,
		session: e.session,
		...e.view !== void 0 && { view: () => e.view() }
	};
}
async function stepDraft(e, t) {
	return draftOf(contributionsOf(await sessionDefinitions(e.ctx), e.ctx, {
		call: t,
		step: stepInfo(e)
	}));
}
async function evaluateStepValues(e, t) {
	let n = e.ctx;
	let i = contributionsOf(await sessionDefinitions(n), n, {
		history: t.conversation,
		signal: t.abortSignal,
		step: stepInfo(e)
	}, `evaluate`);
	await chooseModel(i, n);
	let a = draftOf(i);
	await a.tools(), await a.system(), await a.context(), await a.announcements();
}
async function evaluateStepModel(e, t) {
	let n = e.ctx;
	return await chooseModel(contributionsOf(await sessionDefinitions(n), n, {
		history: t.conversation,
		signal: t.abortSignal,
		step: stepInfo(e)
	}, `evaluate`), n);
}
async function stepModel(e) {
	let t = e.ctx;
	return await chooseModel(contributionsOf(await sessionDefinitions(t), t, { step: stepInfo(e) }), t);
}
async function stepCatalog(e) {
	let t = await stepDraft(e);
	return buildStepCatalog({
		ctx: e.ctx,
		endsTurn: e.endsTurn ?? !1,
		session: e.session,
		table: await t.tools()
	});
}
async function stepSystem(e, t) {
	return renderSystem(await (t ?? await stepDraft(e)).system());
}
async function stepMessages(e, t) {
	let n = {
		historyState: t.call.historyState,
		record: t.call.record
	};
	let r = { ...await e.announcements() };
	for (let { announcements: t } of (await e.tools()).entries.values()) for (let [e, n] of Object.entries(t ?? {})) r[e] ??= n;
	let i = announce(n, t.call.currentInput, r);
	return {
		...i,
		view: placeAnchored(t.project(i.record), await e.context())
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/inline-tool-authorization.js
function resolveInlineAuthorizationInterrupt(e) {
	if (e.signIns.length !== 0) return {
		calls: e.signIns.map(({ callId: e, input: t, signal: n, toolName: r, version: i }) => ({
			call: {
				callId: e,
				input: resolveToolCallInputObject(t, {
					callId: e,
					toolName: r
				}),
				toolName: r,
				...i !== void 0 && { version: i }
			},
			connections: n.challenges.map((e) => e.name)
		})),
		challenges: resolveActiveAuthorizationChallenges(e.signIns.flatMap(({ signal: e }) => e.challenges))
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/intake.js
async function admitHumanInput(e, t, n) {
	let { config: r } = e;
	let i = r.signInCompletions ?? [];
	if (i.length > 0) {
		let t = new Set(getAuthorizationResults().flatMap(({ attemptId: e, callback: t }) => e !== void 0 && t.params.error === "access_denied" ? [e] : []));
		await e.apply(completeSignIn(e.view(), {
			completions: i,
			declined: t
		}));
	}
	let a = await weighResponders(e.view(), {
		now: Date.now(),
		tools: () => toolsOf(e)
	});
	if (await e.apply(a), a.unavailable.length > 0) {
		let t = (await toolsOf(e)).get("eve__search") !== void 0;
		await e.apply(withdrawUnavailable(e.view(), {
			interactionIds: a.unavailable,
			searchable: t
		}));
	}
	if (a.challenges.length > 0) return await applyEndingSignIns(e, requireSignIn(e.view(), {
		challenges: a.challenges,
		callsBack: stepCallsBack(e),
		queued: t
	})), {
		kind: `stop`,
		result: await park(e)
	};
	let o = r.typedAnswers !== !1;
	let s = deliver(e.view(), t, {
		...n,
		typedAnswers: o
	});
	s.takeQueued && e.view().turn.queued !== void 0 && await e.apply(transition({
		events: [],
		turn: {
			...e.view().turn,
			queued: void 0
		}
	}));
	let c = o ? resolveTypedApproval(e.view(), s.input) : s.input;
	let l = openLimit(e.view());
	let u = s.input?.message !== void 0 && c?.message !== void 0 || s.displayMessage !== void 0;
	let d = u && l === void 0;
	let f = d ? await withdrawSteeredSignIns(e, c) : c;
	let p = l === void 0 || !o ? f : resolveTextInput(e.view().projection.view, f);
	let m = checkResponders(e.view(), p, Date.now());
	if (await e.apply(admitAnswers(e.view(), {
		check: m,
		delivery: p
	})), Object.keys(m.weigh).length > 0) return await e.apply(queueInput(e.view(), compactInput(withoutResponses(p)))), {
		kind: `stop`,
		result: {
			next: e.runStep,
			session: e.session
		}
	};
	let h = p?.messageConsumed === !0;
	return e.ctx.get(DeferCallerSteeredClearKey) === !0 && (e.ctx.delete(DeferCallerSteeredClearKey), !h && u && clearSteeredBy(e)), {
		consumedMessage: h,
		input: withoutResponses(p),
		kind: `run`,
		message: h ? void 0 : s.displayMessage ?? s.input?.message,
		opensTurn: hasTurnInput(s.input) || hasTurnInput(f),
		steer: d && !h
	};
}
async function settleHumanInput(e, t) {
	let n = settleLimit(e.view());
	n.events.length > 0 && await e.apply(n), e.view().turn.suspended.length > 0 && await toolsOf(e);
	let r = settleApprovals(e.view(), { steer: t.steer });
	await e.apply(r), callerApprovedSettled(e, r.approved) && clearSteeredBy(e);
	let i = e.view();
	let a = i.turn.suspended.flatMap((e) => runnableCalls(i, e).map((t) => ({
		approval: t,
		step: e
	})));
	return {
		approved: [...r.approved, ...a],
		limit: n.limit,
		settledApprovals: r.answered
	};
}
async function applyHumanDecisions(e, t) {
	if (t.limit?.granted === !1) throw new SessionLimitDeclinedError();
	return await e.apply(settle(e.view(), { results: [] })), runApproved(e, t.approved);
}
async function runApproved(e, t) {
	if (t.length === 0) return;
	let n = /* @__PURE__ */ new Map();
	for (let { approval: e, step: r } of t) n.set(r, [...n.get(r) ?? [], e]);
	let r = [];
	let i = [];
	let a = [];
	let o = /* @__PURE__ */ new Set();
	for (let [t, s] of n) {
		let n = await toolsOf(e);
		let c = /* @__PURE__ */ new Map();
		for (let t of s) {
			let r = n.get(t.call.toolName);
			if (r?.workflowId === void 0) continue;
			if (changedSinceOffered(t.call, r)) {
				let { callId: n, toolName: r } = t.call;
				let a = failedCall({
					callId: n,
					message: changedToolMessage(r),
					toolName: r
				});
				await e.publish(settleCall(a.result)), i.push({ part: a.part });
				continue;
			}
			let a = await decideApproval(r, {
				recheck: !0,
				abortSignal: e.config.abortSignal,
				approvalMemory: approvalMemory(e.view()),
				callId: t.call.callId,
				input: t.call.input
			});
			if (a.denied) i.push(...(await publishDenial(t.call, {
				publish: e.publish,
				reason: a.reason
			})).settled);
			else {
				let n = approvedClearance(e.view().projection.view, t.call.callId) ?? a.clearance;
				if (n === void 0) throw Error(`Approved call "${t.call.callId}" has no clearance to dispatch.`);
				c.set(t.call.callId, {
					approval: t,
					clearance: n
				});
			}
		}
		if (a.push({
			approvals: s.filter((e) => n.get(e.call.toolName)?.workflowId === void 0).map((t) => reportingOnce(e.view(), t, o)),
			tools: n
		}), c.size === 0) continue;
		let l = collectWorkflowCalls({
			clearances: Object.fromEntries([...c.entries()].map(([e, { clearance: t }]) => [e, t])),
			session: e.session,
			toolCalls: [...c.values()].map(({ approval: { call: e } }) => ({
				input: e.input,
				toolCallId: e.callId,
				toolName: e.toolName
			})),
			tools: n,
			turnId: t.event.turnId
		});
		e.session = l.session, r.push(...l.workflowRequests);
	}
	i.length > 0 && await e.apply(settle(e.view(), { results: i })), r.length > 0 && await e.apply(dispatch(e.view(), { tasks: r }));
	let s = a.flatMap(({ approvals: e }) => e);
	if (e.frameworkToolNames = new Set(a.flatMap(({ approvals: e, tools: t }) => e.map((e) => e.call.toolName).filter((e) => t.get(e)?.frameworkTool === !0))), s.length === 0) return;
	let c = signInReports({
		publish: e.publish,
		view: () => e.view()
	});
	e.ctx.setVirtualContext(SignInCompletedKey, c.completed(s));
	let l = await Promise.allSettled(a.map(async ({ approvals: t, tools: n }) => {
		if (t.length === 0) return {
			settled: [],
			signIns: []
		};
		let r = e.view().projection.view;
		let i = r.calls[t[0].call.callId];
		let a = i === void 0 ? void 0 : callRun(r, i);
		let o = a === void 0 ? void 0 : r.runs[a];
		let s = o?.attempt === void 0 ? void 0 : e.instrumentation?.prepareAttempt({
			runId: o.runId,
			attempt: o.attempt,
			stepIndex: o.step,
			turnId: runTurn(r, o.runId),
			isFrameworkTool: (t) => e.frameworkToolNames.has(t)
		});
		return await runApprovedCalls({
			abortSignal: e.config.abortSignal,
			approvalMemory: approvalMemory(e.view()),
			approvals: t,
			messages: e.session.history,
			publish: e.publish,
			responderOf: (e) => e.responder,
			telemetry: s?.telemetry,
			signIns: c,
			tools: n,
			view: () => e.view()
		});
	}));
	e.ctx.delete(SignInCompletedKey);
	let u = l.map((e) => {
		if (e.status === `rejected`) throw e.reason;
		return e.value;
	});
	await e.apply(settle(e.view(), { results: u.flatMap((e) => e.settled) })), throwIfTurnAborted(e.config.abortSignal);
	let d = resolveInlineAuthorizationInterrupt({ signIns: u.flatMap((e) => e.signIns) });
	if (d === void 0) return;
	let f = new Map(s.map((e) => [e.call.callId, e]));
	return await applyEndingSignIns(e, requireSignIn(e.view(), {
		calls: d.calls.map((e) => {
			let t = f.get(e.call.callId);
			return t === void 0 ? e : {
				...e,
				approval: t
			};
		}),
		challenges: d.challenges,
		callsBack: stepCallsBack(e)
	}), e.session.history), park(e);
}
function reportingOnce(e, t, n) {
	let { interactions: r } = e.projection.view;
	let i = (t.signIns ?? []).filter((e) => {
		let t = signInAttemptKey(e);
		let i = r[signInInteractionId(e)]?.status === `open`;
		return n.has(t) || !i ? !1 : (n.add(t), !0);
	});
	return {
		...t,
		signIns: i
	};
}
const stepTools = /* @__PURE__ */ new WeakMap();
function toolsOf(e) {
	let t = stepTools.get(e);
	return t === void 0 && (t = stepCatalog(e), stepTools.set(e, t), t.catch(() => stepTools.delete(e))), t;
}
async function withdrawSteeredSignIns(e, t) {
	let n = [...new Set(e.view().signIns.map((e) => isModelSignInName(e.name) ? e.challenge.displayName ?? e.name : e.name))];
	return n.length === 0 ? t : (await applyEndingSignIns(e, withdrawSignIns(e.view(), `Cancelled because a new message arrived.`)), {
		...t,
		context: [...t?.context ?? [], `Sign-in to ${n.join(`, `)} was cancelled because the user sent a new message instead, and it won't be asked for again in this turn. If the new message still needs it, tell the user the action needs that access and that they can ask again to sign in.`]
	});
}
function hasTurnInput(e) {
	return e === void 0 ? !1 : e.message !== void 0 || (e.answers?.length ?? 0) > 0;
}
function clearSteeredBy(e) {
	e.ctx.delete(SteeredByKey);
	let t = e.ctx.get(SessionKey);
	t !== void 0 && t.auth.steeredBy !== void 0 && e.ctx.setVirtualContext(SessionKey, Object.freeze({
		...t,
		auth: {
			current: t.auth.current,
			initiator: t.auth.initiator
		}
	}));
}
function callerApprovedSettled(e, t) {
	let n = e.ctx.get(AuthKey) ?? e.ctx.get(SessionKey)?.auth.current ?? null;
	return n === null || n.principalType === `anonymous` ? !1 : t.some(({ approval: e, step: t }) => {
		let r = e.responder ?? t.requester ?? null;
		return r !== null && sameResponder(n, r);
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/index.js
async function askStepApprovals(e, t) {
	let n = askApprovals(e.view(), {
		endsTurn: t.endsTurn,
		event: t.event,
		messages: t.messages,
		requests: t.requests,
		requester: currentRequester(e),
		responseAuthRequiredRequestIds: responsePolicyRequestIds(t.tools, t.requests),
		tasks: t.tasks
	});
	await e.apply(n, [...e.session.history, ...committedMessages(n)]);
}
async function stopForSignIn(e, t) {
	return await applyEndingSignIns(e, requireSignIn(e.view(), {
		calls: t.calls,
		challenges: t.challenges,
		callsBack: stepCallsBack(e)
	}), e.session.history), park(e);
}
async function enforceBudget(e, t) {
	let n = checkSessionUsageLimit({
		canAsk: e.emit !== void 0 && e.config.capabilities?.requestInput === !0,
		limit: e.config.sessionUsageLimit ?? DEFAULT_SESSION_USAGE_LIMIT,
		session: e.session,
		turnSequence: e.position().sequence,
		usage: e.view().projection.view.usage.total,
		window: e.view().projection.usageWindow
	});
	if (n.kind !== `within`) return n.kind === `ask` ? (e.session = changeHistory(e.session, { extend: t }), openLimit(e.view())?.row.interactionId !== n.ask.interactionId && await e.apply(requestLimit(e.view(), n.ask), e.session.history), park(e)) : (await e.apply(fail(e.view(), {
		code: n.code,
		details: n.details,
		message: n.message,
		terminal: !0
	})), {
		next: {
			done: !0,
			output: ``
		},
		session: e.session
	});
}
function humanInputContext(e) {
	return { approvalMemory: approvalMemory(e.view()) };
}
function responsePolicyRequestIds(e, t) {
	return t.filter((t) => {
		let n = e.get(t.call.toolName)?.approval;
		return n !== void 0 && typeof n != `function` && n.response !== void 0;
	}).map((e) => e.interactionId);
}
function currentRequester(e) {
	return e.ctx.get(AuthKey) ?? e.ctx.get(SessionKey)?.auth.current ?? null;
}
function takeDeferredMessage(e) {
	let { queued: t, ...n } = readTurnState(e.state);
	if (t?.message === void 0) return { session: e };
	let { message: r, ...i } = t;
	return {
		message: r,
		session: saveTransition(e, transition({
			events: [],
			turn: isEmptyInput(i) ? n : {
				...n,
				queued: i
			}
		}))
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/workflow-admission.js
function admitWorkflowTask(e, t) {
	requireClearance(t, e.callId);
	let n = {
		...e,
		clearedBy: t.clearedBy
	};
	return {
		...n,
		admission: {
			callId: t.callId,
			fingerprint: fingerprint(n)
		}
	};
}
function hasWorkflowAdmission(e) {
	return e.admission?.callId === e.callId && e.admission.fingerprint === fingerprint(e);
}
function fingerprint(e) {
	return createHash(`sha256`).update(stableJson([
		e.callId,
		e.toolName,
		e.workflowId,
		e.entry,
		e.input,
		e.executeInput,
		e.clearedBy
	])).digest(`hex`);
}
function stableJson(e) {
	return JSON.stringify(e, (e, t) => typeof t != `object` || !t || Array.isArray(t) ? t : Object.fromEntries(Object.keys(t).sort().map((e) => [e, t[e]])));
}
z.object({
	callId: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`tool-call`),
	toolName: z.string()
}).strict();
z.object({
	callId: z.string(),
	description: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`subagent-call`),
	name: z.string(),
	nodeId: z.string(),
	subagentName: z.string()
}).strict(), z.object({
	callId: z.string(),
	description: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`remote-agent-call`),
	name: z.string(),
	nodeId: z.string(),
	remoteAgentName: z.string()
}).strict(), z.object({
	callId: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`workflow-tool-call`),
	toolName: z.string(),
	workflowId: z.string()
}).strict(), z.object({
	callId: z.string(),
	description: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`subagent-call`),
	name: z.string(),
	nodeId: z.string(),
	subagentName: z.string()
}).strict();
z.object({
	callId: z.string(),
	description: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`remote-agent-call`),
	name: z.string(),
	nodeId: z.string(),
	remoteAgentName: z.string()
}).strict();
const workflowToolCallEntrySchema = z.discriminatedUnion(`entryPoint`, [
	z.object({ entryPoint: z.literal(`execute`) }).strict(),
	z.object({
		entryPoint: z.literal(`task`),
		taskId: z.string()
	}).strict(),
	z.object({
		entryPoint: z.literal(`serve`),
		taskId: z.string()
	}).strict(),
	z.object({
		entryPoint: z.literal(`receive`),
		taskId: z.string()
	}).strict()
]);
z.object({
	callId: z.string(),
	admission: z.object({
		callId: z.string(),
		fingerprint: z.string()
	}).strict().optional(),
	clearedBy: clearedBySchema.optional(),
	entry: workflowToolCallEntrySchema,
	executeInput: jsonValueSchema.optional(),
	input: jsonObjectSchema,
	kind: z.literal(`workflow-task`),
	toolName: z.string(),
	workflowId: z.string()
}).strict();
z.object({
	callId: z.string(),
	input: jsonObjectSchema,
	kind: z.literal(`load-skill`),
	name: z.string()
}).strict();
const RUNTIME_WORKFLOW_TOOL_ACTION = Symbol.for(`eve:runtime-workflow-tool-action`);
function markRuntimeWorkflowToolAction(e) {
	return Object.defineProperty(e, RUNTIME_WORKFLOW_TOOL_ACTION, { value: !0 }), e;
}
z.object({
	callId: z.string(),
	errorName: z.string().optional(),
	isError: z.boolean().optional(),
	kind: z.literal(`tool-result`),
	output: jsonValueSchema,
	toolName: z.string()
}).strict(), z.object({
	callId: z.string(),
	isError: z.literal(!0),
	kind: z.literal(`subagent-result`),
	origin: z.literal(`dispatch`),
	output: jsonValueSchema,
	subagentName: z.string()
}).strict(), z.object({
	callId: z.string(),
	isError: z.boolean().optional(),
	kind: z.literal(`load-skill-result`),
	name: z.string(),
	output: jsonValueSchema
}).strict();
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/coordination.js
function assertUniqueCoordinationCallIds(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) {
		if (t.has(n.callId)) throw Error(`Coordination batch contains duplicate callId "${n.callId}".`);
		t.add(n.callId);
	}
}
function forgetFinishedRuns(e, t, n) {
	let r = e;
	let i = [];
	for (let e of t) {
		if (e.kind !== `tool-result`) continue;
		let t = findBlockingWorkflowToolRun(r.state, e.callId, n);
		if (t !== void 0) {
			for (let [e, n] of readHitlState(r.state).relays) n.runId === t.address.runId && i.push(e);
			r = removeBlockingWorkflowToolRuns(r, n, t.callId);
		}
	}
	return {
		requestIds: i,
		session: r
	};
}
async function runtimeResultCalls(e, t) {
	let n = [];
	for (let r of e) {
		switch (r.kind) {
			case `load-skill-result`:
				n.push({
					part: toolResult(r, "eve__skill", toToolResultOutput(r)),
					result: r
				});
				continue;
			case `subagent-result`:
				n.push({
					part: toolResult(r, r.subagentName, toToolResultOutput(r)),
					result: r
				});
				continue;
			case `tool-result`:
				n.push({
					part: toolResult(r, r.toolName, await projectToolResultOutput(r, t?.get(r.toolName))),
					result: r
				});
				continue;
		}
		throw Error(`Unsupported runtime action result kind "${String(r)}".`);
	}
	return n;
}
function toolResult(e, t, n) {
	return {
		output: n,
		toolCallId: e.callId,
		toolName: t,
		type: `tool-result`
	};
}
function collectWorkflowCalls(e) {
	let { session: t } = e;
	let n = [];
	for (let r of e.toolCalls) {
		let i = e.tools.get(r.toolName);
		if (isTaskTool(i)) continue;
		let a = e.clearances[r.toolCallId];
		if (a === void 0) throw Error(`Call "${r.toolCallId}" has no clearance to dispatch.`);
		requireClearance(a, r.toolCallId);
		let o = commitCallEntry(t, {
			callId: r.toolCallId,
			definition: i,
			input: resolveToolCallInputObject(r.input, {
				callId: r.toolCallId,
				toolName: r.toolName
			}),
			toolName: r.toolName,
			turnId: e.turnId
		});
		t = o.session, n.push(admitWorkflowTask(createCoordinationRequestFromToolCall({
			entry: o.entry,
			input: o.input,
			toolCall: r,
			tools: e.tools
		}), a));
	}
	return {
		session: t,
		workflowRequests: n
	};
}
function createRuntimeActionRequestFromToolCall(e) {
	let t = e.tools.get(e.toolCall.toolName);
	let n = resolveToolCallInputObject(e.toolCall.input, {
		callId: e.toolCall.toolCallId,
		toolName: e.toolCall.toolName
	});
	let r = e.toolCall.toolName === "eve:load-skill" ? skillTarget(n) : void 0;
	if (r !== void 0) return {
		callId: e.toolCall.toolCallId,
		input: n,
		kind: `load-skill`,
		name: r
	};
	let i = t?.behavior?.handling;
	if (t !== void 0 && i?.kind === `dispatch` && i.target.kind !== `workflow-tool-call`) {
		let r = i.target;
		let a = {
			callId: e.toolCall.toolCallId,
			description: t.description,
			input: n,
			name: e.toolCall.toolName,
			nodeId: r.nodeId
		};
		return r.kind === `remote-agent-call` ? {
			...a,
			kind: `remote-agent-call`,
			remoteAgentName: r.remoteAgentName
		} : {
			...a,
			kind: `subagent-call`,
			subagentName: r.subagentName
		};
	}
	let a = {
		callId: e.toolCall.toolCallId,
		input: n,
		kind: `tool-call`,
		toolName: e.toolCall.toolName
	};
	return t?.workflowId === void 0 ? a : markRuntimeWorkflowToolAction(a);
}
function createCoordinationRequestFromToolCall(e) {
	let t = e.tools.get(e.toolCall.toolName);
	if (t?.workflowId === void 0) throw Error(`Workflow tool "${e.toolCall.toolName}" has no workflow.`);
	return {
		callId: e.toolCall.toolCallId,
		entry: e.entry,
		executeInput: t.executeInput?.(e.input),
		input: e.input,
		kind: `workflow-task`,
		toolName: e.toolCall.toolName,
		workflowId: t.workflowId
	};
}
function resolveToolCallInputObject(e, t) {
	if (e == null || typeof e == `string` && e.trim() === ``) return {};
	try {
		return parseJsonObject(typeof e == `string` ? JSON.parse(e) : e);
	} catch (e) {
		let n = e instanceof Error ? e.message : String(e);
		throw TypeError(`Failed to parse tool-call arguments for "${t.toolName}" (${t.callId}): ${n}`, { cause: e });
	}
}
async function projectToolResultOutput(e, t) {
	return e.isError === !0 || t?.toModelOutput === void 0 || startsTasks(t) ? toToolResultOutput(e) : await observeToolOutput(e.toolName, [{ callId: e.callId }], async () => normalizeToolModelOutput({
		output: await t.toModelOutput(e.output, toolModelOutputContext(e.toolName, e.callId)),
		toolCallId: e.callId,
		toolName: e.toolName
	}));
}
function toToolResultOutput(e) {
	return typeof e.output == `string` ? {
		type: e.isError === !0 ? `error-text` : `text`,
		value: e.output
	} : {
		type: e.isError === !0 ? `error-json` : `json`,
		value: structuredClone(e.output)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/tool-call-io.js
async function checkToolCallInput(e, t, n) {
	let r;
	try {
		r = resolveToolCallInputObject(t, {
			callId: n,
			toolName: e.name
		});
	} catch (t) {
		return invalidInput(e.name, t);
	}
	let i;
	try {
		let t = asSchema(toModelSchema(e.inputSchema, `input`));
		if (t.validate === void 0) return {
			kind: `valid`,
			value: r
		};
		i = await t.validate(r);
	} catch (e) {
		return {
			error: e,
			kind: `threw`
		};
	}
	return i.success ? {
		kind: `valid`,
		value: i.value
	} : invalidInput(e.name, i.error);
}
function invalidInput(e, t) {
	return {
		issues: schemaIssues(t),
		kind: `invalid`,
		message: `Invalid input for tool "${e}": ${toErrorMessage(t)}`
	};
}
function schemaIssues(e) {
	let t = TypeValidationError.isInstance(e) ? e.cause : void 0;
	return Array.isArray(t) && t.every(isIssue) ? t : [{ message: toErrorMessage(e) }];
}
function isIssue(e) {
	return isObject$1(e) && typeof e.message == `string`;
}
async function toolCallModelOutput(e, t, n, r) {
	return await observeToolOutput(e.name, [{ callId: n }], async () => isAuthorizationPendingModelOutput(t) ? {
		type: `text`,
		value: authorizationPendingModelText(t.connections)
	} : e.toModelOutput === void 0 ? typeof t == `string` ? {
		type: `text`,
		value: t
	} : normalizeToolModelOutput({
		output: defaultToolModelOutput(t),
		toolCallId: n,
		toolName: e.name
	}) : normalizeToolModelOutput({
		output: await e.toModelOutput(t, toolModelOutputContext(e.name, n, r)),
		toolCallId: n,
		toolName: e.name
	}));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/step-catalog.js
function callableOf(e) {
	let { connections: t, skills: n } = e.table;
	let r = compiledBundleOf(e.ctx);
	let i = r === void 0 ? void 0 : resolveAgentApproval(r);
	let a = withAgentApprovalOnEntries(new Map([...e.table.entries].filter(([, t]) => t.route === void 0 && isVisible(t.definition, e.session)).map(([e, t]) => [e, t.definition])), i);
	let o = e.ctx.get(ConnectionRegistryKey);
	let s = dynamicConnectionVersions(e.ctx);
	return {
		connections: t,
		deferred: new Map([...a].filter(([, e]) => e.deferred === !0)),
		describe: (t) => describeEntry(t, e.endsTurn),
		entries: a,
		get: (e) => a.get(e) ?? (o === void 0 ? void 0 : connectionEntryNamed(e, o, t, s, i)),
		registry: o,
		skills: n
	};
}
function buildStepCatalog(e) {
	let t = callableOf(e);
	let n = createSkillLoader(t.skills);
	let get = (e) => e === "eve:load-skill" ? n : t.get(e);
	let r = new Map([...e.table.entries].flatMap(([e, { route: t }]) => t === void 0 ? [] : [[e, t]]));
	let i = /* @__PURE__ */ new Map();
	let a = {
		advertised: i,
		connections: t.connections,
		deferred: t.deferred,
		describe: t.describe,
		entries: t.entries,
		get,
		resolve: (e) => {
			let t = r.get(e.toolName);
			if (t === void 0) {
				let t = i.get(e.toolName);
				return t === void 0 ? void 0 : {
					call: e,
					definition: t
				};
			}
			let n = t.target(e.input);
			if (`issue` in n) return;
			let a = get(n.name);
			return a === void 0 ? void 0 : {
				call: {
					...e,
					input: n.input,
					toolName: n.name
				},
				definition: a
			};
		},
		skills: t.skills
	};
	for (let [n, r] of e.table.entries) if (r.route !== void 0) i.set(n, routeTool(r.definition, r.route, a));
	else {
		let e = t.entries.get(n);
		e !== void 0 && e.deferred !== !0 && i.set(n, e);
	}
	return a;
}
function routeTool(e, t, n) {
	let { name: r } = e;
	return {
		...e,
		execute: (e, t) => runResolved(n, {
			input: e,
			toolName: r
		}, t),
		inputSchema: refineJsonSchema(t.inputSchema, async (e) => {
			let i = t.target(e);
			if (`issue` in i) return failure([i.path], i.issue);
			let a = n.get(i.name);
			if (a === void 0) return failure([], `${r} reaches no entry named "${i.name}".`);
			let o = await checkToolCallInput(a, i.input, ``);
			if (o.kind === `threw`) throw o.error;
			if (o.kind === `invalid`) {
				let e = i.at === void 0 ? [] : [i.at];
				return { issues: (t.explain?.(a, o.issues) ?? o.issues).map(({ message: t, path: n = [] }) => ({
					message: t,
					path: [...e, ...n]
				})) };
			}
			return { value: i.at === void 0 ? e : {
				...e,
				[i.at]: o.value
			} };
		}),
		name: r
	};
}
function sessionOffersTasks(e) {
	return (compiledBundleOf(e.ctx)?.subagentRegistry.dynamicResolvers.length ?? 0) > 0 || e.tools.some((t) => isVisible(t, e.session) && startsTasks(t));
}
function runResolved(e, t, n) {
	let r = e.resolve(t);
	if (r === void 0) throw Error(`A ${t.toolName} call ran without a resolved entry.`);
	return runEntryCall(r, n);
}
function describeEntry(e, t) {
	return t && e.endsTurn === !0 ? `${e.description}\n\nCalling this tool ends your turn once it succeeds, after any other tool calls in the same step finish: do not write a reply, and you will not see those calls' results. If it fails, you will see the error and can continue.`.trimStart() : e.description;
}
function isVisible(e, t) {
	return e.rootOnly !== !0 && e.availableInSubagents !== !1 && e.behavior?.availability.includes(`root-session`) !== !0 || t.rootSessionId === void 0;
}
function connectionEntryNamed(e, t, n, r, i) {
	for (let a of n) {
		let n = r.get(a.connectionName);
		let versioned = (e) => n === void 0 ? e : {
			...e,
			version: n
		};
		if (e === a.connectionName) return versioned(connectionSignInEntry(t, a));
		let o = connectionToolName(a.connectionName, ``);
		if (e.length > o.length && e.startsWith(o)) return versioned(connectionEntry(t, a, e.slice(o.length), i));
	}
}
function failure(e, t) {
	return { issues: [{
		message: t,
		path: [...e]
	}] };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/subagents/dynamic-agent-config.js
async function normalizeDynamicSubagentAgentConfig(e) {
	let t = `Dynamic subagent "${e.name}" must return defineAgent(...), defineRemoteAgent(...), or null.`;
	if (!isDefinedAgent(e.value)) throw Error(`${t} Wrap a returned agent object in defineAgent({...}) from "eve".`);
	let n = normalizeAgentDefinition(e.value, t);
	if (!n.description) throw Error(`${t} The "description" field is required.`);
	if (n.build !== void 0) throw Error(`${t} The "build" field cannot be selected at runtime. Declare packaging configuration such as build.externalDependencies on the root agent in agent/agent.ts.`);
	if (n.defaultTools !== void 0) throw Error(`${t} The "defaultTools" field cannot be selected at runtime.`);
	if (n.experimental !== void 0) throw Error(`${t} The "experimental" field cannot be selected at runtime.`);
	if (isDynamicModelDefinition(n.model)) throw Error(`${t} The returned "model" must be static.`);
	if (n.limits?.sessionUsage !== void 0) throw Error(`${t} The "limits.sessionUsage" field cannot be selected at runtime; the root agent's \`sessionUsage\` applies.`);
	if (n.approval !== void 0) throw Error(`${t} The "approval" field cannot be selected at runtime; the root agent's \`approval\` applies.`);
	let r = {
		description: n.description,
		model: await normalizeDurableModelSelection({
			modelMetadata: e.modelMetadata,
			selection: {
				model: n.model,
				modelContextWindowTokens: n.modelContextWindowTokens ?? parentContextWindow(e.state, n.model),
				modelOptions: n.modelOptions
			}
		})
	};
	if (n.compaction !== void 0) {
		let t = {};
		n.compaction.model !== void 0 && (t.model = await normalizeDurableModelSelection({
			modelMetadata: e.modelMetadata,
			selection: {
				model: n.compaction.model,
				modelContextWindowTokens: n.compaction.modelContextWindowTokens,
				modelOptions: n.modelOptions
			}
		})), n.compaction.threshold !== void 0 && (t.thresholdPercent = n.compaction.threshold), r.compaction = t;
	}
	return n.limits !== void 0 && (r.limits = n.limits), n.reasoning !== void 0 && (r.reasoning = n.reasoning), n.tool !== void 0 && (r.tool = n.tool), r;
}
async function normalizeDurableModelSelection(e) {
	return (await resolveRuntimeModelSelection({
		durability: `durable`,
		modelMetadata: e.modelMetadata,
		selection: e.selection
	})).reference;
}
function parentContextWindow(e, t) {
	if (typeof t != `string`) return;
	let n = currentModel(e);
	return n?.id === t ? n.contextWindowTokens : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/subagents/dynamic-remote-agent-config.js
async function normalizeDynamicRemoteAgent(e) {
	let t = `Dynamic subagent "${e.name}" must return defineAgent(...), defineRemoteAgent(...), or null.`;
	let n = expectObjectRecord(e.value, t);
	if (expectOnlyKnownKeys(n, [
		`auth`,
		`description`,
		`forwardPrincipal`,
		`headers`,
		`kind`,
		`path`,
		`tool`,
		`url`
	], t), n.kind !== `remote`) throw Error(t);
	let r = await resolveUrl(n.url, t);
	let i = {};
	n.auth !== void 0 && (i.auth = expectFunction(n.auth, `${t} "auth" must be a function.`)), n.headers !== void 0 && (i.headers = typeof n.headers == `function` ? n.headers : getOptionalStringRecordProperty(n, `headers`, `${t} "headers" must be an object of string values or a function.`));
	let a = i.auth !== void 0 || i.headers !== void 0;
	let o = {
		description: expectString(n.description, t),
		path: n.path === void 0 ? "/eve/v1/session" : expectString(n.path, t),
		url: r
	};
	return n.forwardPrincipal !== void 0 && (o.forwardPrincipal = expectBoolean(n.forwardPrincipal, t)), n.tool !== void 0 && (o.tool = expectAgentToolExposure(n.tool, t)), a && (o.credentials = !0), a ? {
		config: o,
		credentials: i
	} : { config: o };
}
async function resolveUrl(e, t) {
	let n = typeof e == `function` ? await expectFunction(e, t)() : expectString(e, t);
	if (n.length === 0) throw Error(`${t} The "url" field must resolve to a non-empty string.`);
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/remote.js
function bindingOf(e, t) {
	let n = readDefinitionsState(e);
	let r = sessionFrameOf(e);
	let i = effectiveModelId(e);
	return {
		at: r.now.toISOString(),
		channel: structuredClone(r.channel),
		...r.conversation !== void 0 && { conversation: structuredClone(r.conversation) },
		memos: n.memos?.[`subagent:${t}`] ?? {},
		...i !== void 0 && { model: i },
		position: Math.max(0, sessionTables(r.view).position - 1),
		session: {
			auth: structuredClone(r.session.auth),
			id: e.get(SessionIdKey) ?? r.session.id,
			...r.session.parent !== void 0 && { parent: structuredClone(r.session.parent) },
			...r.session.predecessor !== void 0 && { predecessor: structuredClone(r.session.predecessor) },
			...r.session.schedule !== void 0 && { schedule: structuredClone(r.session.schedule) }
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/subagents.js
function subagentDefinition(e) {
	let t = `subagent:${e.nodeId}`;
	let n = authoredEvaluate(e.evaluate);
	return {
		contribute: (r) => ({ tools: async () => {
			let i = await r.keep(async (t) => {
				let r = await n(t);
				if (r == null) return null;
				let { credentials: i, selection: a } = await selectionOf(t.ctx, e, r);
				let o = parseJsonValue(JSON.parse(JSON.stringify(a)));
				return i === void 0 ? { value: o } : {
					live: i,
					value: o
				};
			});
			let a = subagentTool(r.container, t, i?.value ?? null);
			return { entries: new Map(a === void 0 ? [] : [[a.name, {
				definition: a,
				source: t
			}]]) };
		} }),
		id: t,
		label: e.logicalPath
	};
}
function readDynamicSubagentSelections(e) {
	let t = {};
	for (let { id: n, slot: r } of slotsOf(e, `subagent`)) {
		let i = slotValueOf(r.value);
		if (i === null) continue;
		let a = n.slice(9);
		t[a] = i.kind === `remote` && i.remoteAgent.credentials === !0 ? {
			...i,
			binding: bindingOf(e, a)
		} : i;
	}
	return t;
}
function subagentTool(e, t, n) {
	let r = slotValueOf(n);
	if (r !== null && (r.kind === `subagent` ? r.agentConfig.tool : r.remoteAgent.tool) !== !1) return {
		...createPreparedWorkflowToolHarnessDefinition(r.prepared),
		version: entryVersions(e, t)(n)
	};
}
async function selectionOf(e, t, n) {
	assertNotConnectionOwned({
		connectionNames: sessionConnectionNames(e),
		name: t.name,
		remedy: `Rename the subagent directory.`,
		subject: `Dynamic subagent`
	});
	let r = {
		logicalPath: t.logicalPath,
		name: t.name,
		nodeId: t.nodeId,
		sourceId: t.sourceId,
		sourceKind: t.sourceKind
	};
	if (n.kind === `remote`) {
		let { config: i, credentials: a } = await normalizeDynamicRemoteAgent({
			name: t.name,
			value: n
		});
		let o = t.tool === !1 ? {
			...i,
			tool: !1
		} : i;
		assertToolNameAvailable(e, t, o.tool);
		let s = {
			kind: `remote`,
			prepared: createPreparedRuntimeSubagentTool({
				...r,
				description: o.description,
				kind: `remote`,
				path: o.path,
				tool: o.tool,
				url: o.url
			}),
			remoteAgent: o
		};
		return a === void 0 ? { selection: s } : {
			credentials: a,
			selection: s
		};
	}
	let i = await normalizeDynamicSubagentAgentConfig({
		modelMetadata: requireCompiledBundle(e).modelMetadata,
		name: t.name,
		state: e,
		value: n
	});
	let a = t.tool === !1 ? {
		...i,
		tool: !1
	} : i;
	return assertToolNameAvailable(e, t, a.tool), { selection: {
		agentConfig: a,
		kind: `subagent`,
		prepared: createPreparedRuntimeSubagentTool({
			...r,
			description: a.description,
			kind: `subagent`,
			tool: a.tool
		})
	} };
}
function assertToolNameAvailable(e, t, n) {
	let r = eveNamespaceReservation(t.name);
	if (r !== void 0) throw Error(`Dynamic subagent "${t.name}" from "${t.logicalPath}" uses the reserved name "${t.name}". ${r}; rename the subagent.`);
	if (n !== !1 && compiledBundleOf(e)?.toolRegistry.toolsByName.has(t.name) === !0) throw Error(`Dynamic subagent "${t.name}" from "${t.logicalPath}" collides with the tool "${t.name}". Set the subagent's tool to false when that tool wraps it.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/owner.js
function agentSessionOwner(e) {
	return { bundle: {
		nodeId: e.nodeId,
		source: e.source
	} };
}
function ownerReference(e) {
	return {
		kind: `bundle`,
		nodeId: e.bundle.nodeId,
		source: e.bundle.source
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/message.js
function normalizeAgentMessage(e) {
	if (typeof e == `string`) {
		if (e.trim() === ``) throw TypeError(`ctx.agent().send() requires a non-empty message.`);
		return e;
	}
	if (!Array.isArray(e) || e.length === 0 || e.length > 64) throw TypeError(`ctx.agent().send() requires text or between 1 and 64 text/file parts.`);
	let t = e.map((e) => {
		if (e.type === `text` && typeof e.text == `string`) return {
			type: `text`,
			text: e.text
		};
		let invalidFile = () => TypeError(`ctx.agent().send() file parts require an HTTP(S) URL, not inline bytes or base64.`);
		if (e.type !== `file` || typeof e.data != `string` && !(e.data instanceof URL)) throw invalidFile();
		let t;
		try {
			t = new URL(String(e.data));
		} catch {
			throw invalidFile();
		}
		if (t.protocol !== `http:` && t.protocol !== `https:`) throw invalidFile();
		let n = {
			type: `file`,
			data: t.href,
			mediaType: e.mediaType
		};
		return e.filename !== void 0 && (n.filename = e.filename), n;
	});
	if (!t.some((e) => e.type === `file` || e.text.trim() !== ``)) throw TypeError(`ctx.agent().send() requires a non-empty message.`);
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/target.js
const log$1 = createLogger(`execution.agent-target`);
function resolveAgentAction(e) {
	let t = findAgentDefinition(e.bundle, e.dynamicSelections, e.input.target);
	if (t === void 0) throw new NonRetryableError(`Agent target "${e.input.target}" is not available to this agent.`);
	let n = {
		callId: e.callId,
		description: t.description ?? ``,
		input: agentActionInput(e.input),
		name: t.name,
		nodeId: t.nodeId
	};
	return t.kind === `remote` ? {
		...n,
		kind: `remote-agent-call`,
		remoteAgentName: t.name
	} : {
		...n,
		kind: `subagent-call`,
		subagentName: t.name
	};
}
function remoteAgentNames(e, t) {
	let n = new Set(e.subagentRegistry.subagentsByName.keys());
	for (let e of Object.values(t)) e !== null && n.add(e.prepared.name);
	return [...n].filter((n) => findAgentDefinition(e, t, n)?.kind === `remote`);
}
function agentActionInput(e) {
	return {
		message: normalizeAgentMessage(e.message),
		...e.outputSchema !== void 0 && { outputSchema: e.outputSchema }
	};
}
function findAgentDefinition(e, t, n) {
	let r = e.subagentRegistry.subagentsByName.get(n);
	if (r !== void 0) return r.definition;
	let i = Object.values(t).find((e) => e !== null && e.prepared.name === n);
	if (i != null) return i.prepared;
	if (n === "agent" && e.nodeId === void 0) return {
		description: "Delegate a focused subtask to a copy of yourself. Use it to isolate complex work or split a large task into independent pieces. Each call starts a task, so several agents can work at once: start every independent one before you wait. A new child has fresh history and state but reuses your tools and sandbox, so give parallel writers non-overlapping scopes. In message, state the goal, what to return, and whether it may change files.",
		kind: `subagent`,
		name: "agent",
		nodeId: "__root__"
	};
}
function resolveAgentStartTarget(e) {
	let { action: t } = e;
	let n = e.bundle.subagentRegistry.subagentsByNodeId;
	let r = e.bundle.subagentRegistry.dynamicNodeIds.has(t.nodeId);
	let i = r ? e.dynamicSelections[t.nodeId] ?? void 0 : void 0;
	if (r && (i === void 0 || t.kind === `subagent-call` && i.kind !== `subagent` || t.kind === `remote-agent-call` && i.kind !== `remote`)) throw log$1.warn(`dynamic subagent call blocked after availability changed`, {
		callId: t.callId,
		nodeId: t.nodeId,
		subagentName: t.name
	}), new NonRetryableError(`Subagent "${t.name}" is not available in the current session context.`);
	if (isRecursiveAgentAction(t, n) && !e.isRootSession) throw log$1.warn(`recursive agent call blocked outside the root session`, {
		callId: t.callId,
		nodeId: t.nodeId,
		subagentName: t.subagentName
	}), new NonRetryableError(`The built-in "agent" tool is only available to the root session.`);
	if (t.kind === `remote-agent-call`) return {
		action: t,
		dynamicRemoteAgent: i?.kind === `remote` ? i.remoteAgent : void 0,
		kind: `remote`
	};
	let a = i?.kind === `subagent` ? i.agentConfig : void 0;
	let o = n.get(t.nodeId);
	let s = a?.description ?? (o?.definition.kind === `subagent` ? o.definition.description : void 0);
	return {
		action: t,
		dynamicSubagentAgentConfig: a,
		kind: `local`,
		source: s === void 0 ? { type: `runtime` } : {
			description: s,
			type: `local`
		}
	};
}
function isRecursiveAgentAction(e, t) {
	return e.kind === `subagent-call` && e.subagentName === "agent" && !t.has(e.nodeId);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/roster.js
async function loadAgentRoster(e) {
	return (await resolveSessionAgent(ownerReference(e))).roster(e.dynamicSelections);
}
function compiledAgentRoster(e, t) {
	return {
		childRuntime: (t, n) => ({
			agentSessionRuntimeOverrides: n,
			compiledArtifactsSource: e.compiledArtifactsSource,
			dynamicSubagentAgentConfig: t.dynamicSubagentAgentConfig,
			nodeId: t.action.nodeId
		}),
		graph: e.graph,
		remote: e.subagentRegistry,
		remoteAgentNames: () => remoteAgentNames(e, t),
		resolveAction: (n, r) => resolveAgentAction({
			bundle: e,
			callId: n,
			dynamicSelections: t,
			input: r
		}),
		async runtimeOverrides(t, n, r) {
			let i = await loadAgentModelsTool(e, r);
			if (i !== void 0) return { model: await resolveAgentToolModel(e, i, n) };
			try {
				return { model: (await resolveRuntimeModelSelection({
					durability: `durable`,
					modelMetadata: e.modelMetadata,
					selection: n
				})).reference };
			} catch (e) {
				throw e instanceof InvalidRuntimeModelSelectionError ? new NonRetryableError(`ctx.agent("${t}", { model }) could not resolve the model selection: ${toErrorMessage(e)}`) : e;
			}
		},
		startTarget: (n, r) => resolveAgentStartTarget({
			action: n,
			bundle: e,
			dynamicSelections: t,
			isRootSession: r
		})
	};
}
async function loadAgentModelsTool(e, t) {
	let n = t === void 0 ? void 0 : e.resolvedAgent.tools.find((e) => e.name === t);
	if (n?.behavior?.handling?.kind !== `workflow-tool`) return;
	let r = readAgentToolModels(await loadResolvedModuleExport({
		definition: n,
		kindLabel: `tool`,
		moduleMap: e.moduleMap,
		nodeId: e.nodeId
	}));
	return r === void 0 ? void 0 : {
		definition: n,
		models: r
	};
}
async function resolveAgentToolModel(e, { definition: t, models: n }, r) {
	let i = typeof r == `string` ? n.get(r) : void 0;
	if (i === void 0) throw new NonRetryableError(`The "${t.name}" tool has no model ${JSON.stringify(r)}. Use one of its agent({ models }) keys, or omit model to use the current model.`);
	let a;
	try {
		({reference: a} = await resolveRuntimeModelSelection({
			durability: `live`,
			modelMetadata: e.modelMetadata,
			selection: i.selection
		}));
	} catch (e) {
		throw e instanceof InvalidRuntimeModelSelectionError ? new NonRetryableError(`The "${t.name}" tool could not resolve its model "${i.key}": ${toErrorMessage(e)}`) : e;
	}
	return typeof selectionModel(i.selection) == `string` ? a : {
		...a,
		source: {
			exportName: t.exportName,
			logicalPath: t.logicalPath,
			sourceId: t.sourceId,
			sourceKind: `module`
		},
		sourceModelOption: i.key
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sessions/session-agent.js
function runtimeNodeId(e) {
	return e.nodeId ?? "__root__";
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/memory.js
function createMemoryInstrumentation(e) {
	return { async execute(t, n) {
		let { hooks: r, rootSessionId: i, traceSessionId: a } = e.resolveContext();
		let o = {
			...t,
			rootSessionId: i,
			traceSessionId: a,
			sessionId: e.sessionId
		};
		await r.publish({
			...o,
			type: `memory.operation.started`
		});
		try {
			let t = await e.runInContext({
				...o,
				type: `memory.operation`
			}, n);
			return await r.publish({
				outcome: `completed`,
				...o,
				outputRecords: t.outputRecords,
				recordCount: t.recordCount,
				type: `memory.operation.settled`
			}), t.value;
		} catch (e) {
			throw await r.publish({
				outcome: `failed`,
				...o,
				error: e,
				type: `memory.operation.settled`
			}), e;
		}
	} };
}
async function instrumentMemoryOperation(e, t, n) {
	return e === void 0 ? (await n()).value : await e.execute(typeof t == `function` ? t() : t, n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/memory/index.js
function defaultNamespace(e) {
	let t = resolveVercelProjectIdFromEnvironment();
	if (t === void 0) return JSON.stringify([
		`eve-memory-default-namespace-v1`,
		`local`,
		createHash(`sha256`).update(e.appRoot).digest(`base64url`),
		e.node,
		e.slot
	]);
	let n = process.env.VERCEL_TARGET_ENV?.trim() || process.env.VERCEL_ENV?.trim() || `production`;
	let r = n === `preview` ? process.env.VERCEL_GIT_COMMIT_REF?.trim() || process.env.VERCEL_DEPLOYMENT_ID?.trim() || process.env.VERCEL_URL?.trim() || `unknown-preview` : null;
	let i = process.env["EVE_INTERNAL_AGENT_WORKSPACE_MEMBER"] === `1` ? normalizePublicRoutePrefix(process.env["EVE_PUBLIC_ROUTE_PREFIX"]) : void 0;
	return JSON.stringify([
		`eve-memory-default-namespace-v1`,
		`vercel`,
		t,
		n,
		r,
		...i === void 0 ? [] : [i],
		e.node,
		e.slot
	]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/memory-state.js
const MEMORY_NAMESPACE_MAX_BYTES = 1024;
const MEMORY_SCOPE_COMPONENT_MAX_BYTES = 1024;
const MEMORY_CANONICAL_KEY_INPUT_MAX_BYTES = 4096;
const MEMORY_ITEM_ID_MAX_BYTES = 1024;
function createMemoryScope(e) {
	validateMemoryNamespace(e.namespace), validateMemoryScopeValue(e.scope);
	let t = encodeScalar(`namespace`, e.namespace);
	let n = encodeScope(e.scope);
	if (t.byteLength + n.byteLength > MEMORY_CANONICAL_KEY_INPUT_MAX_BYTES) throw Error(`Memory slot "${e.slot}" namespace and scope encoding exceeds ${MEMORY_CANONICAL_KEY_INPUT_MAX_BYTES} UTF-8 bytes.`);
	let r = digest(`memns1_`, t);
	let i = digest(`memscope1_`, n);
	let a = Buffer.concat([
		Buffer.from(`eve-memory-composite-v1\0`),
		lengthPrefix(Buffer.from(r)),
		lengthPrefix(Buffer.from(i))
	]);
	return Object.freeze({
		key: digest(`memscope1_`, a),
		namespace: e.namespace,
		value: Array.isArray(e.scope) ? Object.freeze([...e.scope]) : e.scope
	});
}
function validateMemoryRecallResult(e, t) {
	if (e == null) return [];
	if (typeof e != `object` || Array.isArray(e)) throw Error(`Memory slot "${t}" recall() must return { messages }, null, or undefined.`);
	let n = Object.keys(e).filter((e) => e !== `messages`);
	if (n.length > 0) throw Error(`Memory slot "${t}" recall() returned unknown key(s): ${n.join(`, `)}.`);
	if (!Array.isArray(e.messages)) throw Error(`Memory slot "${t}" recall().messages must be an array.`);
	let r = /* @__PURE__ */ new Set();
	return e.messages.map((e, n) => {
		if (typeof e != `object` || !e || Array.isArray(e)) throw Error(`Memory slot "${t}" recall message ${n} must be an object.`);
		let i = Object.keys(e).filter((e) => e !== `content` && e !== `id`);
		if (i.length > 0) throw Error(`Memory slot "${t}" recall message ${n} has unknown key(s): ${i.join(`, `)}.`);
		if (typeof e.content != `string` || e.content.trim().length === 0) throw Error(`Memory slot "${t}" recall message ${n} content must be non-blank.`);
		if (e.id === void 0) return Object.freeze({ content: e.content });
		if (typeof e.id != `string` || e.id.length === 0) throw Error(`Memory slot "${t}" recall message ${n} id must be non-empty.`);
		if (utf8Bytes(e.id) > MEMORY_ITEM_ID_MAX_BYTES) throw Error(`Memory slot "${t}" recall message ${n} id exceeds ${MEMORY_ITEM_ID_MAX_BYTES} UTF-8 bytes.`);
		if (r.has(e.id)) throw Error(`Memory slot "${t}" recall() returned duplicate id "${e.id}".`);
		return r.add(e.id), Object.freeze({
			content: e.content,
			itemKey: digest(`memitem1_`, encodeScalar(`item`, e.id))
		});
	});
}
function validateMemoryNamespace(e) {
	if (e.trim().length === 0) throw Error(`Memory namespace must be non-empty.`);
	if (utf8Bytes(e) > MEMORY_NAMESPACE_MAX_BYTES) throw Error(`Memory namespace exceeds ${MEMORY_NAMESPACE_MAX_BYTES} UTF-8 bytes.`);
}
function validateMemoryScopeValue(e) {
	let t = Array.isArray(e) ? e : [e];
	if (Array.isArray(e) && t.length > 16) throw Error(`Memory scope tuple exceeds 16 components.`);
	if (t.length === 0) throw Error(`Memory scope tuple must not be empty.`);
	for (let [e, n] of t.entries()) {
		if (typeof n != `string` || n.trim().length === 0) throw Error(`Memory scope component ${e} must be a non-empty string.`);
		if (utf8Bytes(n) > MEMORY_SCOPE_COMPONENT_MAX_BYTES) throw Error(`Memory scope component ${e} exceeds ${MEMORY_SCOPE_COMPONENT_MAX_BYTES} UTF-8 bytes.`);
	}
}
function encodeScope(e) {
	return typeof e == `string` ? encodeScalar(`scope-scalar`, e) : Buffer.concat([
		Buffer.from(`scope-tuple-v1\0`),
		uint32(e.length),
		...e.map((e) => lengthPrefix(Buffer.from(e, `utf8`)))
	]);
}
function encodeScalar(e, t) {
	return Buffer.concat([Buffer.from(`${e}-v1\0`), lengthPrefix(Buffer.from(t, `utf8`))]);
}
function lengthPrefix(e) {
	return Buffer.concat([uint32(e.byteLength), e]);
}
function uint32(e) {
	let t = Buffer.allocUnsafe(4);
	return t.writeUInt32BE(e), t;
}
function digest(e, t) {
	return `${e}${createHash(`sha256`).update(t).digest(`base64url`)}`;
}
function utf8Bytes(e) {
	return Buffer.byteLength(e, `utf8`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/agent-memory-instrumentation.js
function recordMemoryToolStore(e, t) {
	activeTraceOperation()?.memory?.store({
		storeId: e,
		slot: t
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/memory/definition.js
const log = createLogger(`memory`);
const instrumentations = /* @__PURE__ */ new WeakMap();
function bindMemoryInstrumentation(e, t) {
	t === void 0 ? instrumentations.delete(e) : instrumentations.set(e, t);
}
function memoryDefinition(e) {
	return {
		contribute: (t) => ({
			context: async () => ((await t.keep(async (t, n) => {
				let r = readDefinitionsState(t.ctx).latest;
				let i = r[`turn.started`] ?? null;
				if (i === null) return null;
				let a = r[`context.settled:clear`] ?? null;
				let o = t.session.auth.steeredBy;
				let s = await t.memo({
					cleared: a,
					principal: principalOf(t),
					turn: i,
					...o !== void 0 && o.length > 0 && { steeredBy: o }
				}, () => recallOnce(e, t, a));
				if (s === null) return null;
				let c = validateMemoryRecallResult(s.result, e.slot);
				let l = accumulate(n ?? null, s, c);
				return { value: l.batches.length === 0 ? null : parseJsonValue(l) };
			}))?.value?.batches ?? []).flatMap(({ messages: e, turnId: t }) => e.map(({ content: e }) => ({
				message: createFrameworkUserMessage(`memory.load`, e),
				turnId: t
			}))),
			effects: () => [...committed(t, `context.started`).flatMap((n) => n.data.kind === `compaction` && e.provider.capture?.[`compaction.requested`] ? [{
				blocking: !0,
				id: `memory:${e.slot}:compaction`,
				run: () => captureBeforeCompaction(e, t, n)
			}] : []), ...committed(t, `turn.settled`).flatMap((n) => n.data.outcome === `completed` && e.provider.capture?.[`turn.completed`] ? [{
				id: `memory:${e.slot}:capture`,
				run: () => captureTurn(e, t)
			}] : [])]
		}),
		id: `memory:${e.slot}:recall`,
		label: e.logicalPath
	};
}
async function captureTurn(e, t) {
	let n = e.provider.capture[`turn.completed`];
	let r = t.container;
	let i = requireHistory(t.history, e.logicalPath);
	let a = activeTurn(i);
	let o = commitScopeContext(t);
	let s = await resolveTrackedMemoryScope(e, o);
	if (s === null || s.callerScoped && (o.session.auth.steeredBy ?? []).length > 0) return;
	let { scope: c } = s;
	let l = operationId(sessionIdOf(r), e.slot, `turn.completed`, a);
	try {
		await instrumentMemoryOperation(instrumentations.get(r), {
			idempotencyKey: l,
			operationName: `upsert_memory`,
			phase: `turn.completed`,
			slot: e.slot,
			storeId: c.key,
			turnId: a.id
		}, async () => (await n({
			...buildCallbackContext(),
			abortSignal: t.signal,
			memory: {
				scope: c,
				slot: e.slot
			},
			messages: i,
			operationId: l,
			turn: a
		}), { value: void 0 }));
	} catch (t) {
		log.error(`Completed-turn memory capture failed.`, {
			error: t,
			slot: e.slot
		});
	}
}
async function recallOnce(e, t, n) {
	let r = requireHistory(t.history, e.logicalPath);
	let i = activeTurn(r);
	let a = await resolveTrackedMemoryScope(e, t);
	if (a === null || a.callerScoped && (t.session.auth.steeredBy ?? []).length > 0) return null;
	let { scope: o } = a;
	let s = operationId(t.session.id, e.slot, `turn.started`, i);
	return {
		cleared: n,
		result: await instrumentMemoryOperation(instrumentations.get(t.ctx), {
			idempotencyKey: s,
			operationName: `search_memory`,
			phase: `turn.started`,
			slot: e.slot,
			storeId: o.key,
			turnId: i.id
		}, async () => {
			let n = await e.provider.recall[`turn.started`]({
				...buildCallbackContext(),
				abortSignal: t.abortSignal,
				memory: {
					scope: o,
					slot: e.slot
				},
				messages: r,
				operationId: s,
				turn: i
			});
			let a = (n?.messages ?? []).map((e) => e.id === void 0 ? { content: e.content } : {
				content: e.content,
				id: e.id
			});
			return {
				outputRecords: a,
				recordCount: a.length,
				value: n
			};
		}) ?? null,
		scope: o.key,
		turnId: i.id
	};
}
function commitScopeContext(e) {
	let t = buildCallbackContext();
	return {
		abortSignal: e.signal,
		channel: channelOf(e.container),
		...t.conversation !== void 0 && { conversation: t.conversation },
		ctx: e.container,
		session: {
			auth: t.session.auth,
			id: t.session.id
		}
	};
}
async function captureBeforeCompaction(e, t, n) {
	let r = e.provider.capture[`compaction.requested`];
	let i = t.container;
	try {
		let a = requireHistory(t.history, e.logicalPath);
		let o = commitScopeContext(t);
		let s = await resolveTrackedMemoryScope(e, o);
		if (s === null || s.callerScoped && (o.session.auth.steeredBy ?? []).length > 0) return;
		let { scope: c } = s;
		let l = n.data.turnId === void 0 ? null : activeTurn(a);
		let u = [
			`eve-memory-operation-v1`,
			sessionIdOf(i),
			`compaction.requested`,
			n.data.changeId,
			e.slot
		].join(`:`);
		await instrumentMemoryOperation(instrumentations.get(i), {
			idempotencyKey: u,
			operationName: `upsert_memory`,
			phase: `compaction.requested`,
			slot: e.slot,
			storeId: c.key,
			...l !== null && { turnId: l.id }
		}, async () => (await r({
			...buildCallbackContext(),
			abortSignal: t.signal,
			compaction: {
				modelId: i.get(SessionAgentKey)?.settings.compaction?.model?.id ?? effectiveModelId(i) ?? `unknown`,
				usageInputTokens: n.data.trigger?.inputTokens ?? null
			},
			memory: {
				scope: c,
				slot: e.slot
			},
			messages: a,
			operationId: u,
			turn: l
		}), { value: void 0 }));
	} catch (t) {
		throw log.error(`Memory capture before compaction failed; the compaction fails.`, {
			error: t,
			slot: e.slot
		}), t;
	}
}
function accumulate(e, t, n) {
	let r = e;
	let i = r?.batches !== void 0 && r.cleared === t.cleared && r.scope === t.scope ? r.batches.filter(({ turnId: e }) => e !== t.turnId) : [];
	let a = /* @__PURE__ */ new Map();
	for (let e of i) for (let t of e.messages) t.id !== void 0 && a.set(t.id, t.content);
	let o = n.filter(({ content: e, itemKey: t }) => t === void 0 || a.get(t) !== e).map(({ content: e, itemKey: t }) => t === void 0 ? { content: e } : {
		content: e,
		id: t
	});
	let s = new Set(o.flatMap(({ id: e }) => e === void 0 ? [] : [e]));
	let c = i.map((e) => ({
		...e,
		messages: e.messages.filter(({ id: e }) => e === void 0 || !s.has(e))
	})).filter(({ messages: e }) => e.length > 0);
	return o.length > 0 && c.push({
		messages: o,
		turnId: t.turnId
	}), {
		batches: c,
		cleared: t.cleared,
		scope: t.scope
	};
}
async function resolveTrackedMemoryScope(e, t) {
	let { used: n, value: r } = typeof e.scope == `function` ? await trackPrincipalScope(() => e.scope({
		abortSignal: t.abortSignal,
		channel: t.channel,
		...t.conversation !== void 0 && { conversation: t.conversation },
		session: {
			auth: t.session.auth,
			id: t.session.id
		}
	})) : {
		used: !1,
		value: e.scope
	};
	if (r === null) return disabled(e.slot, `scope`);
	let i = {
		appRoot: compiledBundleOf(t.ctx)?.resolvedAgent.metadata.appRoot ?? ``,
		node: runtimeNodeId(t.ctx.get(SessionAgentKey) ?? {}),
		slot: e.slot
	};
	let a = e.namespace === void 0 ? defaultNamespace(i) : typeof e.namespace == `function` ? await e.namespace(i) : e.namespace;
	return a === null ? disabled(e.slot, `namespace`) : {
		callerScoped: n,
		scope: createMemoryScope({
			namespace: a,
			scope: r,
			slot: e.slot
		})
	};
}
function disabled(e, t) {
	return isEveDevEnvironment() && log.info(`Memory slot is disabled for this operation`, {
		resolver: t,
		slot: e
	}), null;
}
function principalOf(e) {
	return e.session.auth.current;
}
function activeTurn(e) {
	let t = currentProjection();
	let n = activeTurnIdOf(t) ?? latestTurnIdOf(t) ?? ``;
	let { sequence: r } = turnCoordinatesOf(t, n);
	let i = e.length;
	for (; i > 0 && e[i - 1].role !== `user`;) --i;
	let a = i;
	for (; a > 0 && e[a - 1].role === `user`;) --a;
	return Object.freeze({
		id: n,
		input: Object.freeze(e.slice(a, i)),
		sequence: r
	});
}
function operationId(e, t, n, r) {
	return [
		`eve-memory-operation-v1`,
		e,
		String(r.sequence),
		r.id.length === 0 ? `standalone` : r.id,
		n,
		t
	].join(`:`);
}
function memoryToolsDefinition(e) {
	return toolsDefinition({
		logicalPath: `tools/${e.slot}.ts`,
		slug: e.slot
	}, (t) => memoryTools(e, t));
}
async function memoryTools(e, t) {
	let { provider: n, slot: r } = e;
	if (n.tools === void 0) return null;
	let i = readDefinitionsState(t.ctx).latest[`turn.started`] ?? null;
	let a = t.session.auth.steeredBy;
	let o = await t.memo({
		principal: principalOf(t),
		turn: i,
		...a !== void 0 && a.length > 0 && { steeredBy: a }
	}, () => resolveTrackedMemoryScope(e, t));
	if (o === null) return null;
	let { callerScoped: s, scope: c } = o;
	let l = {
		abortSignal: t.abortSignal,
		channel: t.channel,
		memory: {
			scope: c,
			slot: r
		},
		session: t.session
	};
	t.conversation !== void 0 && (l.conversation = t.conversation);
	let u = await n.tools(l);
	if (u === null) return null;
	if (typeof u != `object` || Array.isArray(u)) throw Error(`Memory slot "${r}" provider.tools() must return a tool map or null.`);
	return Object.fromEntries(Object.entries(u).map(([t, n]) => {
		let i = `${r}__${t}`;
		if (!isBrandedToolEntry(n)) throw Error(`Memory provider tool "${i}" must be created with defineTool().`);
		let a = e.description === void 0 ? n.description : `${e.description}\n\n${n.description}`;
		return [i, {
			...n,
			description: a,
			execute(e, t) {
				if (s && steeredModelCall()) throw Error(turnSteeredMessage(`memory "${r}"`));
				return recordMemoryToolStore(c.key, r), n.execute(e, t);
			}
		}];
	}));
}
export { CallbackBaseUrlKey, ConnectionRegistryImpl, ConnectionRegistryKey, DefinitionFailedError, DefinitionsStateKey, FINAL_REPLY_TASK_SYSTEM_BLOCK, McpConnectionClient, NO_INLINE_CALLS, PendingAuthorizationResultKey, ResumeSignInKey, SECTION_ORDER, SKILL_NAME_PATTERN, SessionStreamWriteError, TASK_SYSTEM_BLOCK, ToolStubPlaybackKey, TurnCancelledError, admitHumanInput, agentLimits, agentModel, agentSessionOwner, agentSettings, announcedKind, answerFromText, appendTaskContext, applyHumanDecisions, askStepApprovals, assertUniqueCoordinationCallIds, authoredEvaluate, bindMemoryInstrumentation, blocked, buildToolSetWithProviderTools, callProgress, callableOf, callsBackFor, cancel, cancelTask, channelOf, clear, clearedByAttempt, closestNames, collectWorkflowCalls, compactInput, compareCodeUnits, compiledAgentRoster, complete, completeConnectionSignIn, connectionDefinition, connectionEventDestination, connectionEventHookToken, connectionSignInEntry, connectionToolName, connectionToolSignature, connections, continueTurnAuth, controlDeliveryFor, controlled, createAuthorizationExecution, createInvalidToolCallInputError, createMemoryInstrumentation, createPreparedWorkflowToolHarnessDefinition, createPresentedRuntimeActionRequestFromToolCall, createRuntimeToolResultFromMessagePart, createRuntimeToolResultFromStepResult, createRuntimeToolResultFromToolError, createRuntimeToolResultFromValue, createToolExecuteWithAuth, createToolResultMessagePartFromToolError, createWorkflowCallbackUrl, createWorkflowToolHarnessDefinition, discardAttempt, endTask, enforceBudget, entrySignature, evaluateStepModel, evaluateStepValues, evictScopedToken, executeInlineCalls, fail, findTask, finishRun, finishTaskRun, forgetFinishedRuns, getInvalidToolCallInputError, handleAuthorizationError, hasQueuedTurnInput, hasWorkflowAdmission, historyCallNames, hookDefinition, humanInputContext, installDefinitions, instructions, instructionsDefinition, interruptedAttemptNote, isActiveTaskRun, isAgentTool, isBrandedSkillEntry, isCancelledTaskRun, isDynamicModelSelectionError, isEmptyQuery, isInvalidToolCall, isRunnableTool, isScopedAuthorizationRequiredError, isTaskAvailable, isToolResultError, isTurnCancellation, isWorkflowTool, join, latestTurn, listConnectionTools, listingFailureMessage, liveRuns, loadAgentRoster, loadModelDefinition, markTaskRunStarted, matchSignIns, memoryDefinition, memoryToolsDefinition, namedEntries, normalizeAgentMessage, normalizeDynamicRemoteAgent, once, openDeferredApprovals, openMemos, ownCallbacks, parentModel, park, pendingApprovalsNote, principalKey, principalOf$1 as principalOf, projectToolLabel, queueInput, rankCandidates, readDynamicSubagentSelections, readHttpStatus, readTaskTable, receive, recordTaskCall, recordTaskRun, recordTaskRunUsage, relay, relayedMirror, removeTask, renderFinalOutputWhileWorkingError, renderTaskReceipt, renderTaskSentReceipt, renderTooManyTasksError, renderUnknownTaskError, requestCall, requestProviderCalls, resolveConnectionPrincipalFromAuth, resolveFrameworkToolFromUpstreamType, resolveInlineAuthorizationInterrupt, resolveProviderToolCallRequest, resolveRuntimeModelReference, resolveSessionUsageLimit, resolveTurnPrincipal, resolveWorkflowCallbackBaseUrl, restoreDefinitions, routeAnswer, runEffects, runtimeNodeId, runtimeResultCalls, section, sessionOffersTasks, settle, settleCall, settleHumanInput, settleRemainingTaskCalls, settleSignIns, settleTask, settleTaskCalls, signInsAnswered, signInsEnded, slotValueOf, slotsOf, startDispatchedCalls, startTask, staticTools, steeredByAfter, stepCatalog, stepDraft, stepMessages, stepModel, stepSystem, stopForSignIn, stopInterruptedSteps, stubToolPath, subagentDefinition, supportsInteractiveAuthorization, suspendStep, takeBlockingFailure, takeDeferredMessage, takeTaskResults, takeTurnFailure, throwIfSessionStreamDead, throwIfTurnAborted, toEntryStep, toEntryStream, toJsonValue$1 as toJsonValue, toolDefinition, toolModelOutputContext, toolsDefinition, turnInputOnly, unknownSkillMessage, withResult, withTaskTools, withoutTurnInput, workingTaskIds, workspace, writeTaskTable };

//# sourceMappingURL=eve33.mjs.map