import { AGENT_WORKFLOW_RETENTION_VALUES, ANTHROPIC_PROMPT_CACHE_TTLS, compiledModuleMapSchema, expectAgentToolExposure, expectBoolean, expectFunction, expectObjectRecord, expectOnlyKnownKeys, expectPositiveInteger, expectProviderOptions, expectString, getAuthoredModuleExport, materializeAuthoredModuleExport, stripLogicalPathExtension, validateCompiledAgentManifest, validateCompiledModuleMap } from "./eve2.mjs";
import { resolvePackageSourceFilePath } from "./eve4.mjs";
import { parseJsonValue } from "./eve8.mjs";
import { assertDynamicSentinelKeys, connectionDefinitionKey, dynamicEvaluate, isDynamicSentinel, registerDefinitionSource } from "./eve10.mjs";
import { isReservedSessionCommandToken } from "./eve12.mjs";
import { AuthKey, ChannelInstrumentationKey, ContextContainer, ContextKey, ContinuationTokenKey, OccurrenceIdKey, ParentSessionKey, ParentTraceContextKey, ScheduleIdKey, ScheduleInstanceKey, SessionCallbackKey, SessionIdKey, SessionInboxKey, SessionTitleKey, SessionTraceSeedKey, contextStorage } from "./eve13.mjs";
import { createErrorId, createLogger, formatError } from "./eve15.mjs";
import { ConversationContextKey, HTTP_ADAPTER, SessionNotActiveError, SessionStrandedError, askedCall, attachInputText, describeStrandedSession, getAdapterKind, interactionBatches, isCompiledChannel, isHttpRouteDefinition, isWebSocketRouteDefinition, normalizeChannelAudience, readForwardedTraceAssertion, readInputText, readInstrumentationPrincipals, readSessionSchedule, removedEventKeyMessage, resolveConversationContext, resolveForwardedTraceSeed, seedChannelState, setChannelInstrumentationKind } from "./eve16.mjs";
import { commandDelivery, controlCommand, createChannelDeliveryMetadata, createSession, normalizeSendInput, parseAnswers, relayEvent, scheduleCollectionToolSlot, serializeFilePartsInMessage, sessionCallbackToTurnCaller, storedTurnPolicy, toSessionSendOptions, validateDeliveryIdempotencyKey, validateSessionHistory } from "./eve17.mjs";
import { toErrorMessage } from "./eve22.mjs";
import { isToolSchema, serializeInputSchema, serializeOutputSchema, toInputSchema, toOutputSchema } from "./eve23.mjs";
import { SUBAGENT_TOOL_INPUT_SCHEMA } from "./eve24.mjs";
import { defineParentSandbox, getBoundSandboxEnvironment, isSandboxEnvironment } from "./eve25.mjs";
import { frameworkTool, isFrameworkTool, isInteractionOnly, markInteractionOnly } from "./eve26.mjs";
import { resolveInstrumentationEnvironment } from "./eve28.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { createHash, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { AsyncLocalStorage } from "node:async_hooks";
import { createContextKey } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
import { fromError } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod-validation-error/index.js";
import { registerStepFunction } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/private.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/vercel-connect-metadata.js
function extractVercelConnectMetadata(e) {
	if (typeof e != `object` || !e) return;
	let { connector: t, requirement: n } = e;
	if (typeof t != `string` || t.length === 0) return;
	let r = extractCredentialRequirement(n);
	return r === void 0 ? { connector: t } : {
		connector: t,
		requirement: r
	};
}
function extractCredentialRequirement(e) {
	if (typeof e != `object` || !e) return;
	let { method: t, reference: n, service: r, subjectTypes: i } = e;
	if (typeof n != `string` || n.length === 0 || typeof r != `string` || r.length === 0 || !Array.isArray(i) || i.length === 0 || !i.every((e) => e === `app` || e === `user`) || t !== void 0 && (typeof t != `string` || t.length === 0)) return;
	let a = {
		reference: n,
		service: r,
		subjectTypes: i
	};
	return typeof t == `string` && (a.method = t), a;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/connection-events.js
function readConnectionEventsBackend(e) {
	if (e !== void 0) {
		if (typeof e != `object` || !e || !(`createAdapter` in e) || typeof e.createAdapter != `function` || !(`verify` in e) || typeof e.verify != `function`) throw TypeError(`Connect experimental_events must provide createAdapter and verify methods.`);
		return e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/validate-authorization.js
function validateAuthorizationSpec(e, t = `auth`) {
	if (typeof e != `object` || !e) return `The "${t}" field must be an object with a "getToken" method.`;
	let n = e;
	if (typeof n.getToken != `function`) return `The "${t}.getToken" field must be a function returning Promise<{ token }>.`;
	let r = n.startAuthorization !== void 0;
	let i = n.completeAuthorization !== void 0;
	if (`credentialOwner` in n) return `The "${t}.credentialOwner" field is no longer supported. Use "principalType": "app" or "user".`;
	if (n.principalType !== void 0 && n.principalType !== `app` && n.principalType !== `user`) return `The "${t}.principalType" field must be "app" or "user".`;
	if (r !== i) return `The "${t}" field must provide either both "startAuthorization" and "completeAuthorization" (interactive OAuth) or neither (getToken-only). Got only "${r ? `startAuthorization` : `completeAuthorization`}".`;
	if (r && typeof n.startAuthorization != `function`) return `The "${t}.startAuthorization" field must be a function when provided.`;
	if (i && typeof n.completeAuthorization != `function`) return `The "${t}.completeAuthorization" field must be a function when provided.`;
	if (r && n.principalType !== `user`) return `Interactive authorization (startAuthorization + completeAuthorization) is restricted to "principalType": "user" in v1. App-level credentials must use a getToken-only definition.`;
	if (n.displayName !== void 0 && (typeof n.displayName != `string` || n.displayName.length === 0)) return `The "${t}.displayName" field must be a non-empty string when provided.`;
}
function normalizeAuthorizationSpec(e, t, n = `auth`) {
	let r = validateAuthorizationSpec(e, n);
	if (r !== void 0) throw Error(`${t} ${r}`);
	let i = e;
	let a = extractVercelConnectMetadata(i.vercelConnect);
	let o = readConnectionEventsBackend(i.vercelConnect?.experimental_events);
	let s = a;
	o !== void 0 && a !== void 0 && (s = {
		...a,
		experimental_events: o
	});
	let c = i.displayName;
	let l = typeof i.evict == `function` ? i.evict : void 0;
	if (i.startAuthorization !== void 0 && i.completeAuthorization !== void 0) {
		let e = {
			completeAuthorization: i.completeAuthorization,
			getToken: i.getToken,
			principalType: `user`,
			startAuthorization: i.startAuthorization
		};
		return s !== void 0 && (e = {
			...e,
			vercelConnect: s
		}), c !== void 0 && (e = {
			...e,
			displayName: c
		}), l !== void 0 && (e = {
			...e,
			evict: l
		}), e;
	}
	let u = {
		getToken: i.getToken,
		principalType: i.principalType ?? `app`
	};
	return s !== void 0 && (u = {
		...u,
		vercelConnect: s
	}), c !== void 0 && (u = {
		...u,
		displayName: c
	}), l !== void 0 && (u = {
		...u,
		evict: l
	}), u;
}
function assertAuthKey(e, t) {
	if (!/^[A-Za-z0-9_.:-]+$/u.test(e)) throw Error(`${t} must contain only letters, digits, "_", "-", ".", or ":".`);
	return e;
}
function sanitizeScopeSegment(e) {
	let t = e.replace(/[^A-Za-z0-9_.:-]+/gu, `_`).replace(/^_+|_+$/gu, ``);
	return t.length > 0 ? t : `provider`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/models/definition.js
const MODEL_DEFINITION = Symbol.for(`eve.model-definition`);
const MODEL_SIGN_IN_PREFIX = `eve__model__`;
function isDefinedModel(e) {
	return typeof e == `object` && !!e && Reflect.get(e, MODEL_DEFINITION) === !0;
}
function isModelSignInName(e) {
	return e.startsWith(MODEL_SIGN_IN_PREFIX);
}
function modelSignInName(e) {
	return `${MODEL_SIGN_IN_PREFIX}${e.authKey ?? sanitizeScopeSegment(e.auth.vercelConnect.connector)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/runtime-model.js
function formatLanguageModelGatewayId(e) {
	return typeof e == `string` ? e : isDefinedModel(e) ? e.id : `${e.provider.split(`.`)[0]}/${e.modelId.replace(/^(claude-[a-z]+-\d+)-(\d+)$/, `$1.$2`)}`;
}
function isRuntimeLanguageModel(e) {
	if (typeof e != `object` || !e) return !1;
	let t = e;
	return (t.specificationVersion === `v2` || t.specificationVersion === `v3` || t.specificationVersion === `v4`) && typeof t.provider == `string` && typeof t.modelId == `string` && typeof t.doGenerate == `function` && typeof t.doStream == `function`;
}
function toAiSdkLanguageModel(e) {
	return e;
}
function isAgentReasoningDefinition(e) {
	return typeof e == `string` && [
		`provider-default`,
		`none`,
		`minimal`,
		`low`,
		`medium`,
		`high`,
		`xhigh`
	].includes(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/development-generation.js
const DevelopmentGenerationKey = new ContextKey(`eve.internal.developmentGeneration`);
function getDevelopmentWorkflowGeneration() {
	return contextStorage.getStore()?.get(DevelopmentGenerationKey);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/durable-compiled-artifacts-source.js
function serializeDurableCompiledArtifactsSource(e) {
	return e.kind === `disk` && e.durableReference === `development-generation` ? { kind: `development` } : e;
}
function resolveDurableCompiledArtifactsSource(e) {
	if (e.kind !== `development`) return e;
	let t = getDevelopmentWorkflowGeneration();
	if (t === void 0) throw Error(`A development Workflow generation selector was resumed outside a generation-bound delivery.`);
	return t.source;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/compiled-artifacts-source.js
function createDiskRuntimeCompiledArtifactsSource(e, t = {}) {
	return t.moduleMapLoaderPath !== void 0 || t.sandboxAppRoot !== void 0 || t.sandboxScope !== void 0 || t.durableReference !== void 0 ? {
		appRoot: e,
		durableReference: t.durableReference,
		kind: `disk`,
		moduleMapLoaderPath: t.moduleMapLoaderPath,
		sandboxAppRoot: t.sandboxAppRoot,
		sandboxScope: t.sandboxScope
	} : {
		appRoot: e,
		kind: `disk`
	};
}
function getRuntimeCompiledArtifactsSandboxAppRoot(e) {
	return e.kind === `disk` ? e.sandboxAppRoot ?? e.appRoot : void 0;
}
function getRuntimeCompiledArtifactsCacheKey(e) {
	return e.kind === `disk` ? e.moduleMapLoaderPath === void 0 ? `disk:${e.appRoot}` : `disk:${e.appRoot}:authored-source:${e.moduleMapLoaderPath}` : `bundled`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/loaders/artifact-paths.js
function resolveRuntimeCompilerArtifactPaths(e) {
	let t = normalizeFilesystemPath(e);
	let n = `${t}/.eve/discovery`;
	let r = `${t}/.eve/compile`;
	return {
		appRoot: t,
		compiledManifestPath: `${r}/compiled-agent-manifest.json`,
		compileDirectoryPath: r,
		compileMetadataPath: `${r}/compile-metadata.json`,
		diagnosticsPath: `${n}/diagnostics.json`,
		discoveryDirectoryPath: n,
		discoveryManifestPath: `${n}/agent-discovery-manifest.json`,
		modelMetadataPath: `${r}/model-metadata.json`,
		moduleMapPath: `${r}/module-map.mjs`,
		sandboxPreparedArtifactsPath: `${r}/sandbox-prepared-artifacts.json`
	};
}
function normalizeFilesystemPath(e) {
	let t = e.replaceAll(`\\`, `/`);
	return t === `/` ? t : t.replace(/\/+$/, ``);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sessions/runtime-session.js
function createRuntimeSession(e = `test-session`) {
	return {
		bundleCache: /* @__PURE__ */ new Map(),
		bundleCacheKeyBySourceKey: /* @__PURE__ */ new Map(),
		compiledArtifacts: null,
		describedAgents: /* @__PURE__ */ new Map(),
		id: e,
		skillFiles: null
	};
}
const RUNTIME_SESSION_STORAGE_GLOBAL_KEY = Symbol.for(`eve.runtime-session-storage`);
const RUNTIME_SESSION_DEFAULT_GLOBAL_KEY = Symbol.for(`eve.runtime-session-default`);
const globalContainer = globalThis;
globalContainer[RUNTIME_SESSION_STORAGE_GLOBAL_KEY] === void 0 && (globalContainer[RUNTIME_SESSION_STORAGE_GLOBAL_KEY] = new AsyncLocalStorage());
const runtimeSessionStorage = globalContainer[RUNTIME_SESSION_STORAGE_GLOBAL_KEY];
function resolveProcessDefaultSession() {
	return globalContainer[RUNTIME_SESSION_DEFAULT_GLOBAL_KEY] === void 0 && (globalContainer[RUNTIME_SESSION_DEFAULT_GLOBAL_KEY] = createRuntimeSession(`process-default`)), globalContainer[RUNTIME_SESSION_DEFAULT_GLOBAL_KEY];
}
function getActiveRuntimeSession() {
	return runtimeSessionStorage.getStore() ?? resolveProcessDefaultSession();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/loaders/bundled-artifacts.js
function readBundledCompiledArtifacts() {
	return getActiveRuntimeSession().compiledArtifacts;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/validation.js
function formatValidationError(e) {
	return fromError(e, { prefix: void 0 }).message;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/loaders/compile-metadata.js
const compileArtifactDigestSchema = z.object({
	path: z.string(),
	sha256: z.string()
}).strict();
const compileMetadataSchema = z.object({
	compile: z.object({
		manifest: compileArtifactDigestSchema,
		moduleMap: compileArtifactDigestSchema
	}).strict(),
	discovery: z.object({
		diagnostics: compileArtifactDigestSchema,
		manifest: compileArtifactDigestSchema,
		sourceGraphHash: z.string(),
		summary: z.object({
			errors: z.number().finite(),
			warnings: z.number().finite()
		}).strict()
	}).strict(),
	generator: z.object({
		name: z.string(),
		version: z.string()
	}).strict(),
	kind: z.literal("eve-compile-metadata"),
	status: z.union([z.literal(`failed`), z.literal(`ready`)]),
	version: z.literal(6)
}).strict();
var LoadCompileMetadataError = class extends Error {
	metadataPath;
	constructor(e, t) {
		super(e), this.name = `LoadCompileMetadataError`, t !== void 0 && (this.metadataPath = t);
	}
};
async function loadCompileMetadata(e) {
	let t = e.compiledArtifactsSource.kind === `disk` ? resolveRuntimeCompilerArtifactPaths(e.compiledArtifactsSource.appRoot).compileMetadataPath : void 0;
	if (t !== void 0) {
		let { readFile: e } = await import(`node:fs/promises`);
		let n;
		try {
			n = JSON.parse(await e(t, `utf8`));
		} catch (e) {
			throw new LoadCompileMetadataError(formatLoadErrorMessage$2(e), t);
		}
		return parseCompileMetadata(n, t);
	}
	let n = readBundledCompiledArtifacts()?.metadata;
	return n === void 0 ? null : parseCompileMetadata(n, `bundled compile metadata`);
}
function parseCompileMetadata(e, t) {
	let n = compileMetadataSchema.safeParse(e);
	if (!n.success) throw new LoadCompileMetadataError(`Expected "${t}" to contain valid eve compile metadata. ${formatValidationError(n.error)}`, t);
	return n.data;
}
function formatLoadErrorMessage$2(e) {
	return e instanceof Error ? e.message : `Unknown compile metadata load failure.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/cache-key.js
const bundledKeys = /* @__PURE__ */ new WeakMap();
const diskKeys = /* @__PURE__ */ new Map();
async function resolveRuntimeCompiledArtifactsVersionedCacheKey(e) {
	let t = getRuntimeCompiledArtifactsCacheKey(e);
	if (e.kind !== `disk`) {
		let n = readBundledCompiledArtifacts();
		if (n === null) return t;
		let r = bundledKeys.get(n);
		if (r !== void 0) return r;
		let { key: i } = await resolveVersionedKey(e, t, void 0);
		return bundledKeys.set(n, i), i;
	}
	let n = await resolveCompileMetadataMtimeMs(e);
	if (n === void 0) return (await resolveVersionedKey(e, t, void 0)).key;
	let r = diskKeys.get(t);
	if (r?.mtimeMs === n) return r.key;
	let { key: i, loaded: a } = await resolveVersionedKey(e, t, n);
	return a && diskKeys.set(t, {
		key: i,
		mtimeMs: n
	}), i;
}
async function resolveVersionedKey(e, t, n) {
	let r = n === void 0 ? `` : `:mtime-${formatMtimeMsForCacheKey(n)}`;
	try {
		let n = (await loadCompileMetadata({ compiledArtifactsSource: e }))?.discovery.sourceGraphHash;
		return {
			key: n === void 0 || n.length === 0 ? `${t}${r}` : `${t}:${n}${r}`,
			loaded: !0
		};
	} catch {
		return {
			key: `${t}${r}`,
			loaded: !1
		};
	}
}
async function resolveCompileMetadataMtimeMs(e) {
	if (e.kind !== `disk`) return;
	let { stat: t } = await import(`node:fs/promises`);
	let { compileMetadataPath: n } = resolveRuntimeCompilerArtifactPaths(e.appRoot);
	try {
		return (await t(n)).mtimeMs;
	} catch {
		return;
	}
}
function formatMtimeMsForCacheKey(e) {
	return Math.floor(e).toString(36);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/loaders/manifest.js
const BUNDLED_MANIFEST_SOURCE = `bundled compiled manifest`;
var LoadCompiledManifestError = class extends Error {
	manifestPath;
	constructor(e, t) {
		super(e), this.name = `LoadCompiledManifestError`, t !== void 0 && (this.manifestPath = t);
	}
};
async function loadCompiledManifest(e) {
	let t = e.compiledArtifactsSource.kind === `disk` ? resolveRuntimeCompilerArtifactPaths(e.compiledArtifactsSource.appRoot).compiledManifestPath : void 0;
	if (t !== void 0) {
		let { readFile: e } = await import(`node:fs/promises`);
		let n;
		try {
			n = JSON.parse(await e(t, `utf8`));
		} catch (e) {
			throw new LoadCompiledManifestError(formatLoadErrorMessage$1(e), t);
		}
		return checkCompiledManifest(await parseCompiledManifest(n, t), t);
	}
	let n = readBundledCompiledArtifacts();
	if (n !== null) return checkCompiledManifest(n.manifest, BUNDLED_MANIFEST_SOURCE);
	throw new LoadCompiledManifestError(`Compiled manifest is unavailable without an app root or bundled compiled artifacts.`, BUNDLED_MANIFEST_SOURCE);
}
async function parseCompiledManifest(e, t) {
	let { compiledAgentManifestSchema: n } = await import("./_2.mjs");
	let r = n.safeParse(e);
	if (!r.success) throw new LoadCompiledManifestError(`Expected "${t}" to contain a valid compiled eve agent manifest. ${formatValidationError(r.error)}`, t);
	return r.data;
}
function checkCompiledManifest(e, t) {
	try {
		validateCompiledAgentManifest(e);
	} catch (e) {
		throw new LoadCompiledManifestError(`Expected "${t}" to contain a semantically valid compiled eve agent manifest. ${formatLoadErrorMessage$1(e)}`, t);
	}
	return e;
}
function formatLoadErrorMessage$1(e) {
	return e instanceof Error ? e.message : `Unknown manifest load failure.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/graph.js
function getResolvedRuntimeAgentNode(e, t) {
	if (t === void 0 || t === `__root__`) return e.root;
	let n = e.nodesByNodeId.get(t);
	if (n === void 0) throw Error(`Missing runtime agent node for node id "${t}".`);
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/runtime-tools.js
function eveNamespaceReservation(e) {
	return e === `eve` || e.startsWith(`eve__`) ? `eve reserves the "eve" namespace for its built-in tools` : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/runtime-registry.js
var RuntimeRegistryError = class extends Error {
	registry;
	entryName;
	logicalPath;
	sourceId;
	constructor(e, t, n = {}) {
		super(t), this.name = `RuntimeRegistryError`, this.registry = e, n.entryName !== void 0 && (this.entryName = n.entryName), n.logicalPath !== void 0 && (this.logicalPath = n.logicalPath), n.sourceId !== void 0 && (this.sourceId = n.sourceId);
	}
};
var RuntimeRegistry = class {
	registry;
	_entries = /* @__PURE__ */ new Map();
	_reserved;
	constructor(e, t = []) {
		this.registry = e, this._reserved = new Set(t);
	}
	get size() {
		return this._entries.size;
	}
	has(e) {
		return this._entries.has(e);
	}
	get(e) {
		return this._entries.get(e) ?? null;
	}
	asMap() {
		return this._entries;
	}
	register(e, t, n = {}) {
		if (this._entries.has(e)) throw new RuntimeRegistryError(this.registry, n.duplicateMessage ?? `Duplicate ${this.registry} name "${e}".`, {
			...n.location,
			entryName: e
		});
		if (this._reserved.has(e)) throw new RuntimeRegistryError(this.registry, n.reservedMessage ?? `${capitalize(this.registry)} "${e}" collides with another runtime-visible name.`, {
			...n.location,
			entryName: e
		});
		this._entries.set(e, t), this._reserved.add(e);
	}
	set(e, t) {
		this._entries.set(e, t), this._reserved.add(e);
	}
};
function capitalize(e) {
	return e.length === 0 ? e : e.charAt(0).toUpperCase() + e.slice(1);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/subagents/registry.js
const SUBAGENT_TOOL_INPUT_JSON_SCHEMA = serializeInputSchema(SUBAGENT_TOOL_INPUT_SCHEMA);
function createRuntimeSubagentRegistry(e) {
	let t = [];
	let n = /* @__PURE__ */ new Set();
	let r = [];
	let i = new RuntimeRegistry(`subagent`);
	let a = new Set(e.reservedToolNames ?? []);
	let o = new Set(e.disabledToolNames ?? []);
	let s = /* @__PURE__ */ new Map();
	for (let c of e.subagents) {
		let e = {
			logicalPath: c.logicalPath,
			sourceId: c.sourceId
		};
		if (s.has(c.nodeId)) throw new RuntimeRegistryError(`subagent`, `Found multiple runtime subagents mapped to node id "${c.nodeId}".`, {
			...e,
			entryName: c.name
		});
		let l;
		let u = c.kind === `subagent` ? c.dynamic : void 0;
		if (u === void 0) {
			let n = createPreparedRuntimeSubagentTool(c, SUBAGENT_TOOL_INPUT_JSON_SCHEMA);
			l = {
				definition: c,
				prepared: n
			}, i.register(c.name, l, {
				location: e,
				duplicateMessage: duplicateSubagentMessage(c.name)
			});
			let r = c.tool !== !1 && !o.has(c.name);
			let s = eveNamespaceReservation(c.name);
			if (s !== void 0) throw new RuntimeRegistryError(`subagent`, `Subagent "${c.logicalPath}" uses the reserved name "${c.name}". Rename its path; ${s}.`, {
				...e,
				entryName: c.name
			});
			if (r && a.has(c.name)) throw new RuntimeRegistryError(`subagent`, `Subagent "${c.name}" collides with another runtime-visible tool name.`, {
				...e,
				entryName: c.name
			});
			r && t.push(n);
		} else n.add(c.nodeId), r.push({
			...u,
			kind: `subagent`,
			logicalPath: c.logicalPath,
			name: c.name,
			nodeId: c.nodeId,
			sourceId: c.sourceId,
			sourceKind: `module`,
			tool: !o.has(c.name) && void 0
		}), l = { definition: c };
		s.set(c.nodeId, l);
	}
	return assertUniqueDynamicSubagentNames(r, i.asMap()), {
		dynamicNodeIds: n,
		dynamicResolvers: r,
		preparedTools: t,
		subagentsByName: i.asMap(),
		subagentsByNodeId: s
	};
}
function createPreparedRuntimeSubagentTool(e, t = SUBAGENT_TOOL_INPUT_JSON_SCHEMA) {
	if (e.description === void 0) throw Error(`Static subagent "${e.name}" is missing a description.`);
	return {
		behavior: {
			availability: [],
			handling: {
				kind: `dispatch`,
				target: e.kind === `remote` ? {
					kind: `remote-agent-call`,
					nodeId: e.nodeId,
					remoteAgentName: e.name
				} : {
					kind: `subagent-call`,
					nodeId: e.nodeId,
					subagentName: e.name
				}
			}
		},
		deferred: e.tool === `deferred` || void 0,
		description: e.description,
		inputSchema: t,
		kind: e.kind,
		logicalPath: e.logicalPath,
		name: e.name,
		nodeId: e.nodeId,
		sourceId: e.sourceId
	};
}
function duplicateSubagentMessage(e) {
	return `Found multiple subagents named "${e}". Subagent names must be unique at runtime.`;
}
function assertUniqueDynamicSubagentNames(e, t) {
	let n = new Set(t.keys());
	for (let { logicalPath: t, name: r, sourceId: i } of e) {
		if (n.has(r)) throw new RuntimeRegistryError(`subagent`, duplicateSubagentMessage(r), {
			entryName: r,
			logicalPath: t,
			sourceId: i
		});
		n.add(r);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-helpers.js
var ResolveAgentError = class extends Error {
	logicalPath;
	sourceId;
	constructor(e, t = {}) {
		super(e), this.name = `ResolveAgentError`, t.logicalPath !== void 0 && (this.logicalPath = t.logicalPath), t.sourceId !== void 0 && (this.sourceId = t.sourceId);
	}
};
function createResolvedModuleSourceRef(e) {
	return {
		exportName: e.exportName,
		logicalPath: e.logicalPath,
		sourceId: e.sourceId,
		sourceKind: `module`
	};
}
async function loadResolvedModuleExport(e) {
	let t = e.nodeId ?? "__root__";
	let n = e.moduleMap.nodes[t]?.modules[e.definition.sourceId];
	if (n === void 0) throw new ResolveAgentError(`Missing compiled module namespace for ${e.kindLabel} source "${e.definition.sourceId}" in node "${t}".`, {
		logicalPath: e.definition.logicalPath,
		sourceId: e.definition.sourceId
	});
	let r = expectObjectRecord(n, `Missing compiled module namespace for ${e.kindLabel} source "${e.definition.sourceId}" in node "${t}".`);
	let i = getAuthoredModuleExport(r, {
		exportName: e.definition.exportName,
		logicalPath: e.definition.logicalPath
	});
	return await materializeAuthoredModuleExport(i);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/tools/registry.js
async function createRuntimeToolRegistry(e, t = {}) {
	let n = [];
	let r = new RuntimeRegistry(`tool`, t.reservedToolNames ?? []);
	for (let i of e.tools) {
		let e = await createPreparedRuntimeTool(i, t);
		r.register(i.name, {
			definition: i,
			prepared: e
		}, {
			location: {
				logicalPath: i.logicalPath,
				sourceId: i.sourceId
			},
			duplicateMessage: `Found multiple authored tools named "${i.name}". Tool names must be unique at runtime.`,
			reservedMessage: `Tool "${i.name}" collides with another runtime-visible tool name.`
		}), n.push(e);
	}
	return {
		preparedTools: n,
		toolsByName: r.asMap()
	};
}
function findRegisteredRuntimeTool(e, t) {
	return e.toolsByName.get(t) ?? null;
}
async function createPreparedRuntimeTool(e, t) {
	let n = e.behavior?.handling?.kind === `dispatch` && e.behavior.handling.action === `self-agent`;
	return {
		availableInSubagents: e.availableInSubagents,
		behavior: prepareToolBehavior(e.behavior, t.nodeId),
		deferred: e.deferred ?? (n && t.deferSelfAgent || void 0),
		description: e.description,
		inputSchema: serializeInputSchema(e.inputSchema),
		kind: `authored-tool`,
		logicalPath: e.logicalPath,
		name: e.name,
		owner: e.owner,
		outputSchema: serializeOutputSchema(e.outputSchema),
		rootOnly: n || void 0,
		sourceId: e.sourceId
	};
}
function prepareToolBehavior(e, t) {
	if (e === void 0) return;
	let n;
	if (e.handling?.kind === `dispatch`) {
		if (t === void 0) throw Error(`The self-agent tool requires a concrete runtime node id.`);
		n = {
			kind: `dispatch`,
			target: {
				kind: `self-agent-call`,
				nodeId: t,
				subagentName: "agent"
			}
		};
	} else n = e.handling?.kind === `workflow-tool` ? {
		kind: `dispatch`,
		target: {
			entryPoint: e.handling.entryPoint,
			kind: `workflow-tool-call`,
			workflowId: e.handling.workflowId
		}
	} : e.handling;
	return {
		availability: e.availability,
		handling: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sandbox/registry.js
function owningSandboxDefinition(e) {
	return e.inheritance?.definition ?? e.definition;
}
function createRuntimeSandboxRegistry(e) {
	let t = e.sandbox;
	if (t.kind === `parent` && (e.workspaceResourceRoot.contentHash !== void 0 || e.workspaceResourceRoot.rootEntries.length > 0)) throw Error(`Sandbox "${t.logicalPath}" selects parent.sandbox but has managed workspace resources. Remove the child workspace or give the child its own sandbox.`);
	return { sandbox: {
		definition: t,
		workspaceResourceRoot: e.workspaceResourceRoot
	} };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/agent/bootstrap.js
function createResolvedRuntimeTurnAgent(e) {
	let t = e.agent;
	let n = t.config;
	let r = e.id ?? n?.name;
	if (r === void 0) throw Error(`Expected a path-derived agent id while resolving agent resources.`);
	let i = {
		id: r,
		compactionModel: n?.compaction?.model,
		nodeId: e.nodeId,
		reasoning: n?.reasoning,
		tools: [...e.tools],
		workspaceSpec: t.workspaceSpec
	};
	return n === void 0 ? {
		...i,
		configResolver: !0
	} : n.dynamicModel === void 0 ? {
		...i,
		model: n.model
	} : {
		...i,
		dynamicModel: n.dynamicModel
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/approval.js
function normalizeApproval(e, t) {
	if (typeof e == `function`) return e;
	let n = expectObjectRecord(e, t);
	return expectOnlyKnownKeys(n, [
		`request`,
		`prompt`,
		`response`
	], t), {
		request: expectFunction(n.request, t),
		prompt: n.prompt === void 0 ? void 0 : expectFunction(n.prompt, t),
		response: n.response === void 0 ? void 0 : expectFunction(n.response, t)
	};
}
function normalizeAgentApproval(e, t) {
	return expectFunction(e, t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/schedule-timezone.js
function validateScheduleTimezone(e) {
	let t = e.trim();
	if (t.length === 0 || t.length > 50 || /^[+-]/.test(t)) throw Error(`Schedule timezone must be a valid IANA timezone.`);
	try {
		return new Intl.DateTimeFormat(`en-US`, { timeZone: t }).resolvedOptions().timeZone;
	} catch {
		throw Error(`Invalid IANA timezone: ${t}`);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/core.js
function normalizeAgentDefinition(e, t) {
	if (isDynamicSentinel(e)) throw Error(`${t} agent.ts exports defineAgent(). To choose the model per session, make the model field dynamic: model: defineDynamic(async (ctx) => model) from "eve/models", or model: auto({ ... }).`);
	let n = expectObjectRecord(e, t);
	if (expectOnlyKnownKeys(n, [
		`approval`,
		`build`,
		`compaction`,
		`defaultTools`,
		`description`,
		`experimental`,
		`limits`,
		`model`,
		`modelContextWindowTokens`,
		`modelOptions`,
		`reasoning`,
		`tool`
	], t), n.model === void 0) throw Error(`${t} The "model" field is required.`);
	let r = { model: normalizeAgentModel(n.model, t) };
	if (isDynamicSentinel(r.model) && (n.modelContextWindowTokens !== void 0 || n.modelOptions !== void 0)) throw Error(`${t} A dynamic model returns its "modelContextWindowTokens" and "modelOptions" with the model they describe: return { model, modelContextWindowTokens, modelOptions } from its function.`);
	return n.description !== void 0 && (r.description = expectString(n.description, t)), n.defaultTools !== void 0 && (r.defaultTools = expectBoolean(n.defaultTools, t)), n.compaction !== void 0 && (r.compaction = normalizeAgentCompactionDefinition(n.compaction, t)), n.build !== void 0 && (r.build = normalizeAgentBuildDefinition(n.build, t)), n.experimental !== void 0 && (r.experimental = normalizeAgentExperimentalDefinition(n.experimental, t)), n.modelOptions !== void 0 && (r.modelOptions = normalizeAgentModelOptions(n.modelOptions, t)), n.modelContextWindowTokens !== void 0 && (r.modelContextWindowTokens = expectPositiveInteger(n.modelContextWindowTokens, t)), n.reasoning !== void 0 && (r.reasoning = normalizeAgentReasoningDefinition(n.reasoning, t)), n.tool !== void 0 && (r.tool = expectAgentToolExposure(n.tool, t)), n.limits !== void 0 && (r.limits = normalizeAgentLimitsDefinition(n.limits, t)), n.approval !== void 0 && (r.approval = normalizeAgentApproval(n.approval, t)), r;
}
function normalizeAgentModel(e, t) {
	return isDynamicSentinel(e) && assertDynamicSentinelKeys(e, `${t} The dynamic "model":`), e;
}
function normalizeAgentReasoningDefinition(e, t) {
	if (!isAgentReasoningDefinition(e)) throw Error(t);
	return e;
}
function expectPositiveIntegerOrFalse(e, t) {
	return e !== !1 && expectPositiveInteger(e, t);
}
function normalizeAgentLimitsDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, [`sessionTimeoutMs`, `sessionUsage`], t);
	let r = {};
	return n.sessionTimeoutMs !== void 0 && (r.sessionTimeoutMs = expectPositiveIntegerOrFalse(n.sessionTimeoutMs, t)), n.sessionUsage !== void 0 && (r.sessionUsage = n.sessionUsage !== !1 && expectFunction(n.sessionUsage, t)), r;
}
function normalizeAgentBuildDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, [`externalDependencies`], t);
	let r = {};
	if (n.externalDependencies !== void 0) {
		if (!Array.isArray(n.externalDependencies)) throw Error(t);
		r.externalDependencies = Object.freeze(n.externalDependencies.map((e) => expectString(e, t)));
	}
	return r;
}
function normalizeAgentWorkflowDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, [
		`modelCallsPerStep`,
		`retention`,
		`world`
	], t);
	let r = {};
	return n.modelCallsPerStep !== void 0 && (r.modelCallsPerStep = expectPositiveInteger(n.modelCallsPerStep, t)), n.retention !== void 0 && (r.retention = normalizeAgentWorkflowRetentionDefinition(n.retention, t)), n.world !== void 0 && (r.world = normalizeAgentWorkflowWorldDefinition(n.world, t)), r;
}
function normalizeAgentWorkflowRetentionDefinition(e, t) {
	let n = AGENT_WORKFLOW_RETENTION_VALUES.find((t) => t === e);
	if (n === void 0) {
		let e = AGENT_WORKFLOW_RETENTION_VALUES.map((e) => JSON.stringify(e)).join(` or `);
		throw Error(`${t} "experimental.workflow.retention" must be ${e}.`);
	}
	return n;
}
function normalizeAgentWorkflowWorldDefinition(e, t) {
	let n = expectString(e, t);
	if (n.trim() === ``) throw Error(`${t} "experimental.workflow.world" must be a non-empty package name.`);
	return n;
}
function normalizeAgentExperimentalDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, [`workflow`], t);
	let r = {};
	return n.workflow !== void 0 && (r.workflow = normalizeAgentWorkflowDefinition(n.workflow, t)), r;
}
function normalizeAgentModelOptions(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, [`promptCache`, `providerOptions`], t);
	let r = {};
	return n.providerOptions !== void 0 && (r.providerOptions = expectProviderOptions(n.providerOptions, t)), n.promptCache !== void 0 && (r.promptCache = normalizeAgentPromptCache(n.promptCache, t)), r;
}
function normalizeAgentPromptCache(e, t) {
	let n = expectObjectRecord(e, `${t} "modelOptions.promptCache" must be an object.`);
	if (expectOnlyKnownKeys(n, [`anthropic`], `${t} In "modelOptions.promptCache":`), n.anthropic === void 0) return {};
	let r = expectObjectRecord(n.anthropic, `${t} "modelOptions.promptCache.anthropic" must be an object.`);
	expectOnlyKnownKeys(r, [`ttl`], `${t} In "modelOptions.promptCache.anthropic":`);
	let i = r.ttl;
	if (i === void 0) return { anthropic: {} };
	if (!ANTHROPIC_PROMPT_CACHE_TTLS.includes(i)) throw Error(`${t} "modelOptions.promptCache.anthropic.ttl" must be "5m" or "1h"; received ${JSON.stringify(i)}.`);
	return { anthropic: { ttl: i } };
}
function normalizeAgentCompactionDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	if (`thresholdPercent` in n) throw Error(`${t} Rename "compaction.thresholdPercent" to "compaction.threshold" (a fraction from 0 to 1).`);
	expectOnlyKnownKeys(n, [
		`model`,
		`modelContextWindowTokens`,
		`threshold`
	], t);
	let r = {};
	if (n.model !== void 0) {
		if (isDynamicSentinel(n.model)) throw Error(`${t} "compaction.model" does not support defineDynamic — provide a static model.`);
		if (isDefinedModel(n.model)) throw Error(`${t} "compaction.model" takes a model ID or a model instance. A defineModel value needs a credential, and the summary call can't hold the turn for a sign-in.`);
		r.model = n.model;
	}
	if (n.modelContextWindowTokens !== void 0 && (r.modelContextWindowTokens = expectPositiveInteger(n.modelContextWindowTokens, t)), n.threshold !== void 0) {
		let e = n.threshold;
		if (typeof e != `number` || !Number.isFinite(e) || e < 0 || e > 1) throw Error(t);
		r.threshold = e;
	}
	return r;
}
function normalizeInstructionsDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, [`content`, `role`], t);
	let r = n.role === void 0 ? `system` : expectString(n.role, t);
	if (r !== `system` && r !== `user`) throw Error(`${t} Expected "role" to be one of: system, user.`);
	return {
		content: expectString(n.content, t),
		role: r
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/connection.js
const KNOWN_TOP_LEVEL_KEYS = [
	`approval`,
	`auth`,
	`description`,
	`forwardPrincipal`,
	`experimental`,
	`headers`,
	`instanceKey`,
	`protocolVersionDiscovery`,
	`toolCall`,
	`tools`,
	`url`
];
const KNOWN_OPENAPI_TOP_LEVEL_KEYS = [
	`approval`,
	`auth`,
	`baseUrl`,
	`description`,
	`headers`,
	`instanceKey`,
	`operations`,
	`spec`,
	`toolCall`
];
const KNOWN_AUTHORIZATION_KEYS = [
	`completeAuthorization`,
	`credentialOwner`,
	`displayName`,
	`evict`,
	`getToken`,
	`principalType`,
	`startAuthorization`,
	`vercelConnect`
];
const KNOWN_TOOL_CALL_KEYS = [`providedArguments`, `toModelOutput`];
function normalizeMcpClientConnectionDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, KNOWN_TOP_LEVEL_KEYS, t), validateUrl(n, t), validateDescription(n, t), validateInstanceKey(n, t);
	let r = normalizeAuthorization(n, t);
	let i = normalizeHeaders(n, t);
	let a = normalizeConnectionToolCall(n, t);
	let o = normalizeToolFilter(n, t);
	if (r !== void 0 && i !== void 0 && typeof i != `function` && Object.keys(i).some((e) => e.toLowerCase() === `authorization`)) throw Error(`${t} "headers" must not include an "Authorization" key when "auth" is also provided.`);
	let s = {
		description: n.description,
		url: n.url
	};
	let c = n.experimental === void 0 ? void 0 : expectObjectRecord(n.experimental, `${t} experimental must be an object.`);
	if (c !== void 0 && expectOnlyKnownKeys(c, [`events`], t), c?.events !== void 0) {
		let e = expectObjectRecord(c.events, `${t} experimental.events must be an object.`);
		if (expectOnlyKnownKeys(e, [
			`onEvent`,
			`onGap`,
			`onTerminated`
		], t), typeof e.onEvent != `function` || e.onGap !== void 0 && typeof e.onGap != `function` || e.onTerminated !== void 0 && typeof e.onTerminated != `function`) throw Error(`${t} experimental.events requires onEvent; onGap and onTerminated must be functions when provided.`);
		if (r === void 0 || typeof r == `function` || r.vercelConnect?.experimental_events === void 0) throw Error(`${t} experimental.events requires a static Connect auth provider with the events bridge.`);
		s.experimental = { events: {
			onEvent: e.onEvent,
			onGap: e.onGap,
			onTerminated: e.onTerminated
		} };
	}
	if (n.protocolVersionDiscovery !== void 0) {
		if (typeof n.protocolVersionDiscovery != `boolean`) throw Error(`${t} "protocolVersionDiscovery" must be a boolean.`);
		s.protocolVersionDiscovery = n.protocolVersionDiscovery;
	}
	if (n.forwardPrincipal !== void 0) {
		if (typeof n.forwardPrincipal != `boolean`) throw Error(`${t} "forwardPrincipal" must be a boolean.`);
		s.forwardPrincipal = n.forwardPrincipal;
	}
	return n.instanceKey !== void 0 && (s.instanceKey = n.instanceKey), r !== void 0 && (s.auth = r), i !== void 0 && (s.headers = i), a !== void 0 && (s.toolCall = a), o !== void 0 && (s.tools = o), n.approval !== void 0 && (s.approval = normalizeApproval(n.approval, t)), s;
}
function normalizeConnectionToolCall(e, t) {
	if (e.toolCall === void 0) return;
	let n = expectObjectRecord(e.toolCall, `${t} The "toolCall" field must be a plain object.`);
	expectOnlyKnownKeys(n, KNOWN_TOOL_CALL_KEYS, `${t} The "toolCall" field`);
	let r = {};
	if (n.providedArguments !== void 0 && (r.providedArguments = normalizeProvidedArguments(n.providedArguments, t)), n.toModelOutput !== void 0) {
		if (typeof n.toModelOutput != `function`) throw Error(`${t} The "toolCall.toModelOutput" field must be a function.`);
		r.toModelOutput = n.toModelOutput;
	}
	return r;
}
function normalizeProvidedArguments(e, t) {
	let n = expectObjectRecord(e, `${t} The "toolCall.providedArguments" field must be a plain object.`);
	for (let [e, r] of Object.entries(n)) if (typeof r != `function` && !(typeof r == `object` && r && typeof r.then == `function`)) try {
		parseJsonValue(r);
	} catch {
		throw Error(`${t} The "toolCall.providedArguments.${e}" value must be JSON-serializable, a Promise, or a function.`);
	}
	return n;
}
function normalizeOpenApiConnectionDefinition(e, t) {
	let n = expectObjectRecord(e, t);
	expectOnlyKnownKeys(n, KNOWN_OPENAPI_TOP_LEVEL_KEYS, t), validateSpec(n, t), validateBaseUrl(n, t), validateDescription(n, t), validateInstanceKey(n, t);
	let r = normalizeAuthorization(n, t);
	let i = normalizeHeaders(n, t);
	let a = normalizeFilterField(n, `operations`, t);
	let o = normalizeConnectionToolCall(n, t);
	if (r !== void 0 && i !== void 0 && typeof i != `function` && Object.keys(i).some((e) => e.toLowerCase() === `authorization`)) throw Error(`${t} "headers" must not include an "Authorization" key when "auth" is also provided.`);
	let s = {
		description: n.description,
		spec: n.spec
	};
	return n.baseUrl !== void 0 && (s.baseUrl = n.baseUrl), n.instanceKey !== void 0 && (s.instanceKey = n.instanceKey), r !== void 0 && (s.auth = r), i !== void 0 && (s.headers = i), o !== void 0 && (s.toolCall = o), a !== void 0 && (s.operations = a), n.approval !== void 0 && (s.approval = normalizeApproval(n.approval, t)), s;
}
function validateSpec(e, t) {
	let n = e.spec;
	if (typeof n == `string`) {
		if (!URL.canParse(n)) throw Error(`${t} The "spec" field must be a valid URL when provided as a string.`);
		let e = new URL(n);
		if (e.protocol !== `https:` && e.protocol !== `http:`) throw Error(`${t} The "spec" URL must use the http or https protocol, got "${e.protocol}".`);
	} else if (typeof n != `object` || !n || Array.isArray(n)) throw Error(`${t} The "spec" field must be a URL string or an inline OpenAPI document object.`);
}
function validateBaseUrl(e, t) {
	if (e.baseUrl === void 0) return;
	if (typeof e.baseUrl != `string` || !URL.canParse(e.baseUrl)) throw Error(`${t} The "baseUrl" field must be a valid URL when provided.`);
	let n = new URL(e.baseUrl);
	if (n.protocol !== `https:` && n.protocol !== `http:`) throw Error(`${t} The "baseUrl" field must use the http or https protocol, got "${n.protocol}".`);
}
function validateUrl(e, t) {
	if (typeof e.url != `string` || !URL.canParse(e.url)) throw Error(`${t} The "url" field must be a valid URL.`);
	let n = new URL(e.url);
	if (n.protocol !== `https:` && n.protocol !== `http:`) throw Error(`${t} The "url" field must use the http or https protocol, got "${n.protocol}".`);
}
function validateDescription(e, t) {
	if (typeof e.description != `string` || e.description.length === 0) throw Error(`${t} The "description" field must be a non-empty string.`);
}
function validateInstanceKey(e, t) {
	if (e.instanceKey !== void 0 && (typeof e.instanceKey != `string` || e.instanceKey.length === 0)) throw Error(`${t} The "instanceKey" field must be a non-empty string.`);
}
function normalizeAuthorization(e, t) {
	if (e.auth === void 0) return;
	if (typeof e.auth == `function`) return e.auth;
	let n = expectObjectRecord(e.auth, `${t} The "auth" field must be an object with a "getToken" method or a function.`);
	return expectOnlyKnownKeys(n, KNOWN_AUTHORIZATION_KEYS, `${t} The "auth" field`), normalizeAuthorizationSpec(n, t);
}
function normalizeHeaders(e, t) {
	if (e.headers === void 0) return;
	if (typeof e.headers == `function`) return e.headers;
	if (typeof e.headers != `object` || e.headers === null || Array.isArray(e.headers)) throw Error(`${t} The "headers" field must be a plain object or a function.`);
	let n = e.headers;
	for (let [e, r] of Object.entries(n)) {
		let n = typeof r;
		if (n !== `string` && n !== `function` && n !== `object` || n === `object` && (r === null || typeof r.then != `function`)) throw Error(`${t} The "headers.${e}" value must be a string, Promise, or function.`);
	}
	return n;
}
function normalizeToolFilter(e, t) {
	return normalizeFilterField(e, `tools`, t);
}
function normalizeFilterField(e, t, n) {
	let r = e[t];
	if (r === void 0) return;
	if (typeof r != `object` || !r || Array.isArray(r)) throw Error(`${n} The "${t}" field must specify either "allow" or "block".`);
	let i = r;
	let a = `allow` in i;
	let o = `block` in i;
	if (a && o) throw Error(`${n} The "${t}" field must specify either "allow" or "block", not both.`);
	if (!a && !o) throw Error(`${n} The "${t}" field must specify either "allow" or "block".`);
	return a ? (validateStringArray(i.allow, `${n} The "${t}.allow"`), { allow: i.allow }) : (validateStringArray(i.block, `${n} The "${t}.block"`), { block: i.block });
}
function validateStringArray(e, t) {
	if (!Array.isArray(e)) throw Error(`${t} field must be an array of strings.`);
	for (let n = 0; n < e.length; n++) if (typeof e[n] != `string`) throw Error(`${t}[${n}] must be a string.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/definitions/connections/protocol.js
const PROTOCOL_KEY = Symbol.for(`eve.connection-protocol`);
function readStampedConnectionProtocol(e) {
	if (typeof e == `object` && e && PROTOCOL_KEY in e) return e[PROTOCOL_KEY];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/instance-identity.js
function createConnectionInstanceId(e) {
	return `connection:${createHash(`sha256`).update(JSON.stringify([
		e.sourceId,
		e.connectionName,
		e.protocol,
		e.url,
		e.instanceKey ?? ``
	])).digest(`base64url`)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-connection.js
async function resolveConnectionDefinition(e, t, n) {
	try {
		let r = await loadResolvedModuleExport({
			definition: e,
			kindLabel: `connection`,
			moduleMap: t,
			nodeId: n
		});
		let i = expectObjectRecord(r, `Expected the connection export "${e.exportName ?? `default`}" from "${e.logicalPath}" to return an object.`);
		registerDefinitionSource(i, {
			kind: `connection`,
			logicalPath: e.logicalPath,
			name: e.connectionName
		}, connectionDefinitionKey(e.url, e.description));
		let a = i.auth !== void 0;
		let o = i.headers !== void 0;
		let s = e.protocol === `openapi` ? i.operations : i.tools;
		let c = {
			connectionName: e.connectionName,
			description: e.description,
			exportName: e.exportName,
			logicalPath: e.logicalPath,
			instanceId: createConnectionInstanceId({
				connectionName: e.connectionName,
				instanceKey: typeof i.instanceKey == `string` ? i.instanceKey : void 0,
				protocol: e.protocol,
				sourceId: e.sourceId,
				url: e.url
			}),
			protocol: e.protocol,
			sourceId: e.sourceId,
			sourceKind: `module`,
			url: e.url
		};
		if (a) {
			if (typeof i.auth == `function`) c.authorization = i.auth;
			else try {
				c.authorization = normalizeAuthorizationSpec(i.auth, `Connection "${e.connectionName}" at "${e.logicalPath}":`);
			} catch (t) {
				throw new ResolveAgentError(toErrorMessage(t), {
					logicalPath: e.logicalPath,
					sourceId: e.sourceId
				});
			}
		}
		if (e.protocol === `mcp` && i.protocolVersionDiscovery !== void 0) {
			if (typeof i.protocolVersionDiscovery != `boolean`) throw Error(`"protocolVersionDiscovery" must be a boolean.`);
			c.protocolVersionDiscovery = i.protocolVersionDiscovery;
		}
		if (e.protocol === `mcp` && i.forwardPrincipal !== void 0) {
			if (typeof i.forwardPrincipal != `boolean`) throw Error(`"forwardPrincipal" must be a boolean.`);
			c.forwardPrincipal = i.forwardPrincipal;
		}
		if (e.experimental_events === !0) {
			let t = normalizeMcpClientConnectionDefinition(i, `Connection "${e.connectionName}":`).experimental?.events;
			let n = typeof c.authorization == `object` ? c.authorization : void 0;
			if (t === void 0 || n?.vercelConnect?.experimental_events === void 0) throw new ResolveAgentError(`Connection "${e.connectionName}": experimental.events requires a static Connect auth provider with the events bridge.`, {
				logicalPath: e.logicalPath,
				sourceId: e.sourceId
			});
			c.experimental_events = {
				callbacks: t,
				authorization: n,
				connector: n.vercelConnect.connector,
				backend: n.vercelConnect.experimental_events
			};
		}
		return o && (c.headers = i.headers), i.toolCall !== void 0 && (c.toolCall = i.toolCall), s !== void 0 && (c.tools = s), e.protocol === `openapi` && i.spec !== void 0 && (c.spec = i.spec), i.approval !== void 0 && (c.approval = normalizeApproval(i.approval, `"approval" must be a policy function or { request, response?, prompt? }.`)), c;
	} catch (t) {
		throw t instanceof ResolveAgentError ? t : new ResolveAgentError(`Failed to resolve connection "${e.connectionName}" from "${e.logicalPath}": ${toErrorMessage(t)}`, {
			logicalPath: e.logicalPath,
			sourceId: e.sourceId
		});
	}
}
function resolveDynamicConnectionValue(e, t) {
	let n = readStampedConnectionProtocol(e);
	let r = `Dynamic connection "${t.connectionName}" from "${t.logicalPath}" must be created by defineMcpClientConnection() or defineOpenAPIConnection().`;
	if (n === void 0) throw Error(r);
	if (registerDefinitionSource(e, {
		kind: `connection`,
		logicalPath: t.logicalPath,
		name: t.connectionName
	}), n === `openapi`) {
		let i = normalizeOpenApiConnectionDefinition(e, r);
		return assertAuthenticatedDynamicInstanceKey(i.auth, i.instanceKey, r), omitUndefined({
			approval: i.approval,
			authorization: i.auth,
			connectionName: t.connectionName,
			description: i.description,
			exportName: t.exportName,
			headers: i.headers,
			instanceId: createConnectionInstanceId({
				connectionName: t.connectionName,
				instanceKey: i.instanceKey,
				protocol: n,
				sourceId: t.sourceId,
				url: i.baseUrl ?? ``
			}),
			logicalPath: t.logicalPath,
			protocol: n,
			sourceId: t.sourceId,
			sourceKind: `module`,
			spec: i.spec,
			toolCall: i.toolCall,
			tools: i.operations,
			url: i.baseUrl ?? ``
		});
	}
	let i = normalizeMcpClientConnectionDefinition(e, r);
	if (i.experimental?.events !== void 0) throw Error(`${r} experimental_events requires a statically authored connection so eve can mount its receiver at build time.`);
	return assertAuthenticatedDynamicInstanceKey(i.auth, i.instanceKey, r), omitUndefined({
		approval: i.approval,
		authorization: i.auth,
		connectionName: t.connectionName,
		description: i.description,
		exportName: t.exportName,
		headers: i.headers,
		instanceId: createConnectionInstanceId({
			connectionName: t.connectionName,
			instanceKey: i.instanceKey,
			protocol: n,
			sourceId: t.sourceId,
			url: i.url
		}),
		logicalPath: t.logicalPath,
		protocol: n,
		sourceId: t.sourceId,
		sourceKind: `module`,
		toolCall: i.toolCall,
		protocolVersionDiscovery: i.protocolVersionDiscovery,
		forwardPrincipal: i.forwardPrincipal,
		tools: i.tools,
		url: i.url
	});
}
function assertAuthenticatedDynamicInstanceKey(e, t, n) {
	if (e !== void 0 && t === void 0) throw Error(`${n} Authenticated dynamic connections must set "instanceKey" to a stable, non-secret account or tenant identifier.`);
}
function omitUndefined(e) {
	return Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/definitions/hook.js
const HOOK_CONTINUE_KEYS = {
	"*": !0,
	"call.input": !1,
	"call.progress": !1,
	"call.requested": !1,
	"call.settled": !1,
	"call.started": !1,
	"child.opened": !1,
	"content.completed": !1,
	"content.delta": !1,
	"context.settled": !1,
	"context.started": !1,
	"delivery.admitted": !1,
	"delivery.consumed": !1,
	"delivery.settled": !1,
	"interaction.opened": !1,
	"interaction.settled": !1,
	"model.requested": !1,
	"model.retried": !1,
	"model.settled": !1,
	"model.started": !1,
	"response.admitted": !1,
	"response.settled": !1,
	"response.submitted": !1,
	"session.ended": !1,
	"session.started": !1,
	"task.ended": !1,
	"task.started": !1,
	"turn.paused": !1,
	"turn.settled": !0,
	"turn.started": !1,
	"usage.recorded": !1
};
function assertHookForm(e, t) {
	if (typeof e != `object` || !e) throw Error(`${t} takes an object with events handlers.`);
	let { events: n, ...r } = e;
	let i = Object.keys(r).filter((e) => e !== `kind`);
	if (i.length > 0) throw Error(`${t} takes only events handlers; unknown key(s): ${i.join(`, `)}. A hook acts on a condition from a handler, such as "*", with ctx.cancel.`);
	if (typeof n != `object` || !n) throw Error(`${t} requires events: an object of handlers keyed by event type.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/hook.js
function normalizeHookHandlers(e, t) {
	let n = `the hook export "${t.exportName ?? `default`}" from "${t.logicalPath}"`;
	let r = expectObjectRecord(e, `Expected ${n} to return an object.`);
	assertHookForm(r, `The hook export "${t.exportName ?? `default`}" from "${t.logicalPath}"`);
	let i = r.events === void 0 ? {} : expectObjectRecord(r.events, `Expected ${n} to expose \`events\` as an object.`);
	let a = {};
	for (let [e, r] of Object.entries(i)) {
		if (r === void 0) continue;
		let i = removedEventKeyMessage(e);
		if (i !== void 0) throw Error(`Hook "${t.logicalPath}" handles ${i}`);
		a[e] = expectFunction(r, `Expected ${n} to provide a function for "events.${e}".`);
	}
	return a;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/memory-definition.js
const MEMORY_DEFINITION_BRAND = Symbol.for(`eve:memory-definition`);
function isMemoryDefinition(e) {
	return typeof e == `object` && !!e && Reflect.get(e, MEMORY_DEFINITION_BRAND) === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/memory.js
function memoryMismatch(e) {
	return `Expected the memory export "${e.exportName ?? `default`}" from "${e.logicalPath}" to be created with defineMemory().`;
}
function normalizeMemoryDefinition(e, t) {
	if (!isMemoryDefinition(e)) throw Error(t);
	let n = expectObjectRecord(e, t);
	if (expectOnlyKnownKeys(n, [
		`description`,
		`namespace`,
		`provider`,
		`scope`
	], t), n.description !== void 0 && (typeof n.description != `string` || n.description.trim().length === 0)) throw Error(`${t} "description" must be a non-empty string when provided.`);
	if (n.namespace !== void 0 && n.namespace !== null && typeof n.namespace != `string` && typeof n.namespace != `function`) throw Error(`${t} "namespace" must be a string, null, or resolver.`);
	if (n.scope !== null && typeof n.scope != `string` && typeof n.scope != `function`) throw Error(`${t} "scope" must be a string, null, or resolver.`);
	let r = expectObjectRecord(n.provider, `${t} "provider" must be an object.`);
	expectOnlyKnownKeys(r, [
		`recall`,
		`capture`,
		`tools`
	], `${t} "provider"`);
	let i = expectObjectRecord(r.recall, `${t} "provider.recall" must be an object.`);
	if (expectOnlyKnownKeys(i, [`turn.started`], `${t} "provider.recall"`), typeof i[`turn.started`] != `function`) throw Error(`${t} provider.recall["turn.started"] must be a function.`);
	if (r.capture !== void 0) {
		let e = expectObjectRecord(r.capture, `${t} "provider.capture" must be an object when provided.`);
		expectOnlyKnownKeys(e, [`compaction.requested`, `turn.completed`], `${t} "provider.capture"`);
		for (let n of [`compaction.requested`, `turn.completed`]) if (e[n] !== void 0 && typeof e[n] != `function`) throw Error(`${t} provider.capture[${JSON.stringify(n)}] must be a function when provided.`);
	}
	if (r.tools !== void 0 && typeof r.tools != `function`) throw Error(`${t} "provider.tools" must be a function when provided.`);
	return e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/schedule-collection-definition.js
const SCHEDULE_COLLECTION_DEFINITION_BRAND = Symbol.for(`eve:schedule-collection-definition`);
const SCHEDULE_COLLECTION_SOURCE = Symbol.for(`eve:schedule-collection-source`);
function stampScheduleCollectionSource(e, t) {
	let n = readScheduleCollectionSource(e);
	if (n !== void 0) {
		if (n.application !== t.application || n.collection !== t.collection || n.logicalPath !== t.logicalPath || n.sourceId !== t.sourceId) throw Error(`Schedule collection source identity does not match its compiled module.`);
	} else Object.defineProperty(e, SCHEDULE_COLLECTION_SOURCE, {
		configurable: !1,
		enumerable: !1,
		value: Object.freeze({ ...t })
	});
}
function readScheduleCollectionSource(e) {
	return Reflect.get(e, SCHEDULE_COLLECTION_SOURCE);
}
function isScheduleCollectionDefinition(e) {
	return typeof e == `object` && !!e && Reflect.get(e, SCHEDULE_COLLECTION_DEFINITION_BRAND) === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/schedule-collection.js
const SCHEDULE_OPERATIONS = [
	`create`,
	`get`,
	`list`,
	`update`,
	`enable`,
	`disable`,
	`invoke`,
	`delete`
];
const PROVIDER_KEYS = [
	`kind`,
	`create`,
	`list`,
	`get`,
	`update`,
	`enable`,
	`disable`,
	`invoke`,
	`delete`,
	`validateExpression`
];
const PROVIDER_METHODS = PROVIDER_KEYS.filter((e) => e !== `kind` && e !== `validateExpression`);
const DEFINITION_KEYS = [
	`id`,
	`description`,
	`provider`,
	`scope`,
	`inputSchema`,
	`preparePayload`,
	`run`,
	`auth`,
	`events`,
	`tool`,
	`scopes`,
	`approval`
];
const SCHEDULE_COLLECTION_ID_PATTERN = /^(?=.{1,64}$)[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/u;
const SCHEDULE_SCOPE_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/u;
function normalizeScheduleCollectionDefinition(e, t) {
	if (!isScheduleCollectionDefinition(e)) throw Error(t);
	let n = expectObjectRecord(e, t);
	if (expectOnlyKnownKeys(n, DEFINITION_KEYS, t), n.id !== void 0 && (typeof n.id != `string` || !SCHEDULE_COLLECTION_ID_PATTERN.test(n.id))) throw Error(`${t} "id" must be 1 to 64 ASCII letters, digits, underscores, and dashes, with "/" only between segments.`);
	if (n.description !== void 0 && (typeof n.description != `string` || n.description.trim() === ``)) throw Error(`${t} "description" must be a non-empty string when provided.`);
	let r = expectObjectRecord(n.inputSchema, `${t} "inputSchema" is required and must be a Standard Schema.`);
	if (typeof expectObjectRecord(r[`~standard`], `${t} "inputSchema" must be a Standard Schema.`).validate != `function`) throw Error(`${t} "inputSchema" must supply a Standard Schema validate function.`);
	if (n.preparePayload !== void 0 && typeof n.preparePayload != `function`) throw Error(`${t} "preparePayload" must be a function when provided.`);
	if (typeof n.run != `function`) throw Error(`${t} "run" is required and must be a function.`);
	if (n.scope !== void 0 && typeof n.scope != `function`) throw Error(`${t} "scope" must be a function when provided.`);
	if (typeof n.auth != `function`) throw Error(`${t} "auth" is required and must be a function that resolves the schedule creator to execution auth.`);
	if (n.events !== void 0) {
		let e = expectObjectRecord(n.events, `${t} "events" must be an object.`);
		expectOnlyKnownKeys(e, [`occurrence.dispatched`, `occurrence.failed`], `${t} "events"`);
		for (let [n, r] of Object.entries(e)) if (r !== void 0 && typeof r != `function`) throw Error(`${t} "events.${n}" must be a function.`);
	}
	let i = expectObjectRecord(n.provider, `${t} "provider" must be an object.`);
	if (expectOnlyKnownKeys(i, PROVIDER_KEYS, `${t} "provider"`), typeof i.kind != `string` || i.kind.trim() === ``) throw Error(`${t} provider.kind must be a non-empty string.`);
	for (let e of PROVIDER_METHODS) if (typeof i[e] != `function`) throw Error(`${t} provider.${e} must be a function.`);
	if (i.validateExpression !== void 0 && typeof i.validateExpression != `function`) throw Error(`${t} provider.validateExpression must be a function when provided.`);
	if (n.tool !== void 0 && expectAgentToolExposure(n.tool, t), n.scopes !== void 0) {
		if (n.scope !== void 0) throw Error(`${t} Set "scope" or "scopes", not both.`);
		let e = expectObjectRecord(n.scopes, `${t} "scopes" must be an object.`);
		if (Object.keys(e).length === 0) throw Error(`${t} "scopes" must declare at least one scope.`);
		for (let [r, i] of Object.entries(e)) {
			let e = `${t} "scopes.${r}"`;
			if (!SCHEDULE_SCOPE_NAME_PATTERN.test(r) || r === `__proto__`) throw Error(`${e} must be named with 1 to 64 ASCII letters, digits, underscores, and dashes.`);
			if (typeof i == `function`) continue;
			let a = expectObjectRecord(i, `${e} must be a scope resolver function or an object with "resolve".`);
			if (expectOnlyKnownKeys(a, [
				`description`,
				`id`,
				`resolve`,
				`preparePayload`,
				`run`,
				`approval`
			], e), typeof a.resolve != `function`) throw Error(`${e} "resolve" is required and must be a function.`);
			for (let t of [`preparePayload`, `run`]) if (a[t] !== void 0 && typeof a[t] != `function`) throw Error(`${e} "${t}" must be a function when provided.`);
			if (a.description !== void 0 && (typeof a.description != `string` || a.description.trim() === ``)) throw Error(`${e} "description" must be a non-empty string when provided.`);
			if (a.id !== void 0 && (typeof a.id != `string` || !SCHEDULE_COLLECTION_ID_PATTERN.test(a.id))) throw Error(`${e} "id" must be 1 to 64 ASCII letters, digits, underscores, and dashes, with "/" only between segments.`);
			if (a.approval !== void 0) {
				if (n.tool === !1) throw Error(`${t} "scopes.${r}.approval" cannot be configured when tool is false.`);
				expectApprovals(a.approval, t, `scopes.${r}.approval`);
			}
		}
	}
	if (n.tool === !1 && n.approval !== void 0) throw Error(`${t} "approval" cannot be configured when tool is false.`);
	return n.approval !== void 0 && expectApprovals(n.approval, t, `approval`), e;
}
function expectApprovals(e, t, n) {
	let r = expectObjectRecord(e, `${t} "${n}" must be an object.`);
	expectOnlyKnownKeys(r, SCHEDULE_OPERATIONS, `${t} "${n}"`);
	for (let [e, i] of Object.entries(r)) if (typeof i != `function` && (typeof i != `object` || !i || typeof Reflect.get(i, `request`) != `function` || Reflect.get(i, `response`) !== void 0 && typeof Reflect.get(i, `response`) != `function`)) throw Error(`${t} "${n}.${e}" must be an approval policy.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/schedules/named-scope.js
const built = /* @__PURE__ */ new WeakMap();
function namedScopeDefinition(e, t) {
	let n = e.scopes !== void 0 && Object.hasOwn(e.scopes, t) ? e.scopes[t] : void 0;
	if (n === void 0) throw Error(`Dynamic schedules definition has no scope "${t}". Its scopes are: ${Object.keys(e.scopes ?? {}).join(`, `) || `none`}.`);
	let r = built.get(e);
	r === void 0 && (r = /* @__PURE__ */ new Map(), built.set(e, r));
	let i = r.get(t);
	if (i !== void 0) return i;
	let a = typeof n == `function` ? { resolve: n } : n;
	let { scopes: o, id: s, ...c } = e;
	let l = a.preparePayload ?? c.preparePayload;
	let u = {
		...c,
		...a.run !== void 0 && { run: a.run },
		...a.approval !== void 0 && { approval: {
			...c.approval,
			...a.approval
		} },
		...l !== void 0 && { preparePayload: (e, n) => l(e, {
			...n,
			scopeName: t
		}) },
		scope: (e) => a.resolve({
			...e,
			scopeName: t
		})
	};
	return r.set(t, u), u;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-definition.js
async function resolveDefinition(e, t) {
	let { eventNames: n, ...r } = e;
	return await resolving(e, e.kind, async () => {
		let n = await loadResolvedModuleExport({
			...t,
			definition: e,
			kindLabel: e.kind
		});
		switch (e.kind) {
			case `hook`: return {
				...r,
				events: normalizeHookHandlers(n, e),
				kind: `hook`
			};
			case `memory`: return {
				...normalizeMemoryDefinition(n, memoryMismatch(e)),
				...r,
				kind: `memory`,
				...!t.toolFiles.has(e.slug) && { offersTools: !0 },
				slot: e.slug
			};
			default: return {
				...r,
				...dynamicSource(e, n, e.kind),
				kind: e.kind
			};
		}
	});
}
async function resolveScheduleCollection(e, t) {
	return await resolving(e, `schedule collection`, async () => {
		let r = normalizeScheduleCollectionDefinition(await loadResolvedModuleExport({
			...t,
			definition: e,
			kindLabel: `schedule collection`
		}), `Expected the schedule collection export from "${e.logicalPath}" to be created with defineDynamicSchedules().`);
		let i = e.namedScope === void 0 ? r : namedScopeDefinition(r, e.namedScope.name);
		stampScheduleCollectionSource(i, {
			application: e.application,
			collection: e.name,
			logicalPath: e.logicalPath,
			sourceId: e.sourceId
		});
		let a = e.namedScope;
		let o = a === void 0 ? void 0 : r.scopes?.[a.name];
		let s = typeof o == `object` ? o.description : void 0;
		let c = i.tool !== !1 && !t.toolFiles.has(scheduleCollectionToolSlot(e));
		return {
			definition: i,
			kind: `schedules`,
			logicalPath: e.logicalPath,
			name: e.name,
			...a !== void 0 && { namedScope: {
				...a,
				...s !== void 0 && { description: s }
			} },
			...c && { offersTools: !0 },
			sourceId: e.sourceId,
			sourceKind: `module`
		};
	});
}
async function resolveDynamicDefinition(e, t) {
	return await resolving(e, t.kindLabel, async () => ({
		...e,
		...dynamicSource(e, await loadResolvedModuleExport({
			...t,
			definition: e
		}), t.kindLabel)
	}));
}
function dynamicSource(e, t, n) {
	let r = `the ${n} export "${e.exportName ?? `default`}" from "${e.logicalPath}"`;
	if (!isDynamicSentinel(t)) throw Error(`Expected ${r} to be created by defineDynamic().`);
	return assertDynamicSentinelKeys(t, `The ${r.slice(4)}:`), { evaluate: dynamicEvaluate(t) };
}
async function resolving(e, t, n) {
	try {
		return await n();
	} catch (n) {
		throw n instanceof ResolveAgentError ? n : new ResolveAgentError(`Failed to resolve ${t} from "${e.logicalPath}": ${toErrorMessage(n)}`, {
			logicalPath: e.logicalPath,
			sourceId: e.sourceId
		});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/channel.js
function normalizeChannelDefinition(e, t) {
	if (!isCompiledChannel(e)) throw Error(`${t} Use \`defineChannel({ routes, ... })\` (or a wrapper like \`slackChannel\` / \`eveChannel\`) — bare \`{ fetch, receive? }\` channel objects are no longer supported.`);
	return e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-channel.js
async function resolveChannelDefinition(e, t, n) {
	try {
		let i = normalizeChannelDefinition(await loadResolvedModuleExport({
			definition: e,
			kindLabel: `channel`,
			moduleMap: t,
			nodeId: n
		}), `Expected the channel export "${e.exportName ?? `default`}" from "${e.logicalPath}" to match the public eve shape.`);
		let a = createResolvedModuleSourceRef({
			exportName: e.exportName,
			logicalPath: e.logicalPath,
			sourceId: e.sourceId
		});
		let o = i.routes.find((t) => t.method.toUpperCase() === e.method.toUpperCase() && t.path === e.urlPath);
		let s = `channel:${e.name}`;
		setChannelInstrumentationKind(i, s);
		let c = i.adapter;
		c && c.kind !== "http" && (c.kind = s);
		let l = resolveHttpRoute(e, o);
		let u = resolveWebSocketRoute(e, o);
		return {
			name: e.name,
			method: e.method,
			urlPath: e.urlPath,
			cors: e.cors,
			fetch: async (e, t) => l ? l.handler(e, t) : Response.json({
				error: `No matching route handler.`,
				ok: !1
			}, { status: 404 }),
			handler: l?.handler,
			websocket: u?.handler,
			receive: i.receive,
			definition: i,
			adapter: c,
			turnPolicy: i.turnPolicy,
			...a
		};
	} catch (t) {
		throw t instanceof ResolveAgentError ? t : new ResolveAgentError(`Failed to attach the channel definition from "${e.logicalPath}": ${toErrorMessage(t)}`, {
			logicalPath: e.logicalPath,
			sourceId: e.sourceId
		});
	}
}
function resolveHttpRoute(e, t) {
	if (t !== void 0 && e.method !== `WEBSOCKET` && isHttpRouteDefinition(t)) return t;
}
function resolveWebSocketRoute(e, t) {
	if (t !== void 0 && e.method === `WEBSOCKET` && isWebSocketRouteDefinition(t)) return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-sandbox.js
async function resolveSandboxDefinition(e, t, n) {
	if (e.inheritsParent === !0) return {
		exportName: e.exportName,
		kind: `parent`,
		logicalPath: e.logicalPath,
		revisionHash: e.revisionHash,
		selector: defineParentSandbox(),
		sourceId: e.sourceId,
		sourceKind: `module`
	};
	let r = t.nodes[n ?? "__root__"]?.modules[e.sourceId];
	let i = expectObjectRecord(r, `Missing sandbox module "${e.logicalPath}".`);
	let a = getAuthoredModuleExport(i, e);
	if (typeof a != `function`) throw new ResolveAgentError(`Sandbox "${e.logicalPath}" does not export a selector.`);
	let o = e.environmentExportName ? i[e.environmentExportName] : getBoundSandboxEnvironment(a);
	let s = {
		exportName: e.exportName,
		logicalPath: e.logicalPath,
		revisionHash: e.revisionHash,
		selector: a,
		sourceId: e.sourceId,
		sourceKind: `module`
	};
	if (!isSandboxEnvironment(o)) throw new ResolveAgentError(`Sandbox "${e.logicalPath}" has no environment. Export the environment its selector opens, for example \`export const environment = DefaultSandbox.environment();\`.`);
	return {
		...s,
		environment: o,
		kind: `independent`
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/workflow-program-input.js
function createWorkflowProgramExecuteInput(e, t) {
	let n = t?.js;
	if (typeof n != `string`) throw TypeError(`workflow requires a "js" string.`);
	return {
		js: n,
		maxSubagents: e.maxSubagents
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-tool.js
async function resolveToolDefinition(e, t, n, r) {
	if (!e.hasExecute) {
		let t = {
			availableInSubagents: e.availableInSubagents,
			behavior: e.behavior,
			deferred: e.deferred,
			description: e.description,
			inputSchema: toInputSchema(e.inputSchema),
			logicalPath: e.logicalPath,
			name: e.name,
			outputSchema: toOutputSchema(e.outputSchema),
			owner: r,
			sourceId: e.sourceId,
			sourceKind: `module`
		};
		return e.behavior?.handling?.kind === `provider-tool` ? frameworkTool(t) : t;
	}
	try {
		let i = await loadResolvedModuleExport({
			definition: e,
			kindLabel: `tool`,
			moduleMap: t,
			nodeId: n
		});
		let a = expectObjectRecord(i, describe(e, `to return an object`));
		registerDefinitionSource(a, {
			kind: `tool`,
			logicalPath: e.logicalPath,
			name: e.name
		}, `tool:${a.description}`);
		let o = e.behavior?.handling?.kind === `workflow-tool` ? void 0 : expectFunction(a.execute, describe(e, `to provide an execute function`));
		let s = isToolSchema(a.inputSchema) ? a.inputSchema : toInputSchema(e.inputSchema);
		let c = isToolSchema(a.outputSchema) ? a.outputSchema : toOutputSchema(e.outputSchema);
		let l = e.workflowProgram;
		let u = l === void 0 ? void 0 : (e) => createWorkflowProgramExecuteInput(l, e);
		let d = {
			availableInSubagents: e.availableInSubagents,
			behavior: e.behavior,
			deferred: e.deferred,
			description: e.description,
			execute: o,
			executeInput: u,
			exportName: e.exportName,
			inputSchema: s,
			logicalPath: e.logicalPath,
			name: e.name,
			owner: r,
			outputSchema: c,
			sourceId: e.sourceId,
			sourceKind: `module`,
			...extractOptionalHooks(a, e)
		};
		let f = isFrameworkTool(a) ? frameworkTool(d) : d;
		return isInteractionOnly(a.execute) ? markInteractionOnly(f) : f;
	} catch (t) {
		throw t instanceof ResolveAgentError ? t : new ResolveAgentError(`Failed to attach the tool execute function from "${e.logicalPath}": ${toErrorMessage(t)}`, {
			logicalPath: e.logicalPath,
			sourceId: e.sourceId
		});
	}
}
function extractOptionalHooks(e, t) {
	let n = {};
	if (e.label === !1) n.label = !1;
	else if (e.label !== void 0) {
		let r = expectObjectRecord(e.label, describe(t, `to provide a valid label definition`));
		n.label = {
			complete: r.complete === void 0 ? void 0 : expectFunction(r.complete, describe(t, `to provide an label complete function`)),
			delta: r.delta === void 0 ? void 0 : expectFunction(r.delta, describe(t, `to provide an label delta function`)),
			start: expectFunction(r.start, describe(t, `to provide a label start callback function`))
		};
	}
	return e.approval !== void 0 && (n.approval = normalizeApproval(e.approval, describe(t, `to provide a valid approval definition`))), e.endsTurn !== void 0 && (n.endsTurn = typeof e.endsTurn == `boolean` ? e.endsTurn : expectFunction(e.endsTurn, describe(t, `to provide endsTurn as a boolean or a function`))), e.toModelOutput !== void 0 && (n.toModelOutput = expectFunction(e.toModelOutput, describe(t, `to provide a toModelOutput function`))), n;
}
function describe(e, t) {
	return `Expected the tool export "${e.exportName ?? `default`}" from "${e.logicalPath}" ${t}.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-agent.js
async function resolveAgent(e) {
	let t = e.manifest.skills.map((t) => ({
		...t,
		owner: requireCompiledSourceOwner(e.manifest, t),
		metadata: t.metadata === void 0 ? void 0 : { ...t.metadata }
	}));
	let n = await Promise.all(e.manifest.channelRoutes.effective.map((t) => resolveChannelDefinition(t, e.moduleMap, e.nodeId)));
	let r = await Promise.all(e.manifest.tools.map((t) => resolveToolDefinition(t, e.moduleMap, e.nodeId, requireBindingOwner(e.manifest, t.sourceId))));
	let i = {
		moduleMap: e.moduleMap,
		nodeId: e.nodeId,
		toolFiles: toolFileNames(e.manifest)
	};
	let a = await Promise.all([...e.manifest.definitions.map((e) => resolveDefinition(e, i)), ...e.manifest.scheduleCollections.map((e) => resolveScheduleCollection(e, i))]);
	let o = await Promise.all(e.manifest.connections.map((t) => resolveConnectionDefinition(t, e.moduleMap, e.nodeId)));
	let s = await resolveSandboxDefinition(e.manifest.sandbox, e.moduleMap, e.nodeId);
	let c = e.manifest.instructions.map((t) => createResolvedInstructionsDefinition(e.manifest, t));
	let l = e.manifest.workspaceResourceRoot;
	let u = {
		channels: n,
		connections: o,
		definitions: a,
		instructions: c,
		metadata: {
			agentRoot: e.manifest.agentRoot,
			appRoot: e.manifest.appRoot,
			diagnosticsSummary: e.manifest.diagnosticsSummary
		},
		sandbox: s,
		workspaceResourceRoot: l,
		skills: t,
		tools: r,
		workspaceSpec: { rootEntries: [...l.rootEntries] }
	};
	return `config` in e.manifest ? {
		...u,
		config: createResolvedAgentConfig(e.manifest, await loadAgentConfigFunctions(e.manifest, e.moduleMap, e.nodeId))
	} : u;
}
async function loadAgentConfigFunctions(e, t, n) {
	let r = e.config.limits?.sessionUsage;
	let i = e.config.approval === !0;
	let a = e.config.source;
	if (i && a === void 0) throw Error(`The compiled agent marks an "approval" policy but has no agent config module.`);
	if (r !== !0 && !i || a === void 0) return r === !1 ? { sessionUsage: !1 } : {};
	let s = normalizeAgentDefinition(await loadResolvedModuleExport({
		definition: a,
		kindLabel: `agent config`,
		moduleMap: t,
		nodeId: n
	}), `Expected the authored agent config export "${a.exportName ?? `default`}" from "${a.logicalPath}" to match the public eve shape.`);
	if (i && s.approval === void 0) throw Error(`The compiled agent marks an "approval" policy, but "${a.logicalPath}" no longer exports one. Rebuild the agent.`);
	return {
		...i && { approval: s.approval },
		sessionUsage: r !== !1 && s.limits?.sessionUsage
	};
}
function requireBindingOwner(e, t) {
	let n = e.bindings[t];
	if (n === void 0) throw Error(`Compiled source "${t}" has no binding.`);
	return n.owner;
}
function createResolvedInstructionsDefinition(e, t) {
	return {
		content: t.content,
		name: t.name,
		owner: requireCompiledSourceOwner(e, t),
		logicalPath: t.logicalPath,
		role: t.role,
		sourceId: t.sourceId,
		sourceKind: t.sourceKind
	};
}
function requireCompiledSourceOwner(e, t) {
	let n = e.bindings[t.sourceId]?.owner ?? t.owner;
	if (n === void 0) throw Error(`Compiled source "${t.sourceId}" has no owner.`);
	return n;
}
function createResolvedAgentConfig(e, { approval: t, sessionUsage: n }) {
	let r = { name: e.config.name };
	if (e.config.defaultTools !== void 0 && (r.defaultTools = e.config.defaultTools), t !== void 0 && (r.approval = t), e.config.description !== void 0 && (r.description = e.config.description), e.config.compaction !== void 0) {
		let t = {};
		e.config.compaction.model !== void 0 && (t.model = e.config.compaction.model.source === void 0 ? {
			contextWindowTokens: e.config.compaction.model.contextWindowTokens,
			id: e.config.compaction.model.id,
			providerOptions: e.config.compaction.model.providerOptions
		} : {
			contextWindowTokens: e.config.compaction.model.contextWindowTokens,
			id: e.config.compaction.model.id,
			providerOptions: e.config.compaction.model.providerOptions,
			source: {
				exportName: e.config.compaction.model.source.exportName,
				sourceKind: `module`,
				logicalPath: e.config.compaction.model.source.logicalPath,
				sourceId: e.config.compaction.model.source.sourceId
			},
			sourceField: e.config.compaction.model.sourceField
		}), e.config.compaction.thresholdPercent !== void 0 && (t.thresholdPercent = e.config.compaction.thresholdPercent), r.compaction = t;
	}
	if (e.config.experimental !== void 0 && (r.experimental = { workflow: e.config.experimental.workflow === void 0 ? void 0 : {
		modelCallsPerStep: e.config.experimental.workflow.modelCallsPerStep,
		retention: e.config.experimental.workflow.retention,
		world: e.config.experimental.workflow.world
	} }), e.config.reasoning !== void 0 && (r.reasoning = e.config.reasoning), e.config.source !== void 0 && (r.source = createResolvedModuleSourceRef(e.config.source)), e.config.tool !== void 0 && (r.tool = e.config.tool), e.config.limits !== void 0 && (r.limits = {
		sessionTimeoutMs: e.config.limits.sessionTimeoutMs,
		sessionUsage: n
	}), e.config.dynamicModel !== void 0) return {
		...r,
		dynamicModel: createResolvedModuleSourceRef(e.config.dynamicModel)
	};
	let i = e.config.model;
	return {
		...r,
		model: i.source === void 0 ? {
			id: i.id,
			contextWindowTokens: i.contextWindowTokens,
			promptCache: i.promptCache,
			providerOptions: i.providerOptions
		} : {
			contextWindowTokens: i.contextWindowTokens,
			id: i.id,
			promptCache: i.promptCache,
			providerOptions: i.providerOptions,
			source: {
				exportName: i.source.exportName,
				sourceKind: `module`,
				logicalPath: i.source.logicalPath,
				sourceId: i.source.sourceId
			}
		}
	};
}
function toolFileNames(e) {
	return /* @__PURE__ */ new Set([
		...e.tools.flatMap(({ name: t, sourceId: n }) => e.bindings[n]?.owner.kind === `framework` ? [] : [t]),
		...e.definitions.flatMap((e) => e.kind === `tool` && e.extensionNamespace === void 0 ? [e.slug] : []),
		...disabledToolNames(e)
	]);
}
function disabledToolNames(e) {
	return e.sourceComposition.entries.flatMap((e) => e.kind !== `disabled` || !e.source.logicalPath.startsWith(`tools/`) ? [] : [stripLogicalPathExtension(e.source.logicalPath).replace(/^tools\//, ``).replaceAll(`/`, `-`)]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/resolve-agent-graph.js
var ResolveRuntimeAgentGraphError = class extends Error {
	logicalPath;
	nodeId;
	sourceId;
	constructor(e, t = {}) {
		super(e), this.name = `ResolveRuntimeAgentGraphError`, t.logicalPath !== void 0 && (this.logicalPath = t.logicalPath), t.nodeId !== void 0 && (this.nodeId = t.nodeId), t.sourceId !== void 0 && (this.sourceId = t.sourceId);
	}
};
async function resolveRuntimeAgentGraph(e) {
	validateCompiledModuleMap(e.manifest, e.moduleMap);
	let t = /* @__PURE__ */ new Map();
	let n = createChildNodeIdsByParentNodeId(e.manifest);
	let r = new Map(e.manifest.subagents.map((e) => [e.nodeId, e]));
	let i = await resolveRuntimeAgentNode({
		childNodeIdsByParentNodeId: n,
		manifest: e.manifest,
		moduleMap: e.moduleMap,
		nodeId: "__root__",
		nodesByNodeId: t,
		subagentNodesById: r
	});
	return attachInheritedSandboxWorkspaceResources({
		manifest: e.manifest,
		nodesByNodeId: t
	}), {
		nodesByNodeId: t,
		root: i
	};
}
async function resolveRuntimeAgentNode(e) {
	let t = toRuntimeNodeId(e.nodeId);
	if (e.nodesByNodeId.has(t)) throw new ResolveRuntimeAgentGraphError(`Found multiple runtime agent nodes for node id "${t}".`, {
		nodeId: t,
		sourceId: e.sourceId
	});
	let n = await resolveAgent({
		manifest: e.manifest,
		moduleMap: e.moduleMap,
		nodeId: e.nodeId
	});
	let r = await createRuntimeToolRegistry({ tools: n.tools }, {
		deferSelfAgent: n.config?.tool === `deferred`,
		nodeId: t
	});
	let i = createRuntimeSandboxRegistry({
		sandbox: n.sandbox,
		workspaceResourceRoot: n.workspaceResourceRoot
	});
	let a = createRuntimeSubagentRegistry({
		disabledToolNames: disabledToolNames(e.manifest),
		reservedToolNames: r.preparedTools.map((e) => e.name),
		subagents: await resolveRuntimeSubagents({
			childNodeIdsByParentNodeId: e.childNodeIdsByParentNodeId,
			manifest: e.manifest,
			moduleMap: e.moduleMap,
			nodesByNodeId: e.nodesByNodeId,
			parentNodeId: e.nodeId,
			subagentNodesById: e.subagentNodesById
		})
	});
	let o = {
		agent: n,
		channels: n.channels,
		nodeId: t,
		sandboxRegistry: i,
		sourceId: e.sourceId,
		subagentRegistry: a,
		toolRegistry: r,
		turnAgent: createResolvedRuntimeTurnAgent({
			agent: n,
			id: e.agentId,
			nodeId: t,
			tools: [...r.preparedTools, ...a.preparedTools]
		})
	};
	return e.nodesByNodeId.set(t, o), o;
}
async function resolveRuntimeSubagents(e) {
	let t = [];
	let n = e.childNodeIdsByParentNodeId.get(e.parentNodeId) ?? [];
	for (let r of n) {
		let n = e.subagentNodesById.get(r);
		if (n === void 0) throw new ResolveRuntimeAgentGraphError(`Missing compiled subagent node "${r}" while resolving runtime subagents.`, {
			nodeId: toRuntimeNodeId(e.parentNodeId),
			sourceId: r
		});
		t.push(await resolveRuntimeSubagent({
			childNodeIdsByParentNodeId: e.childNodeIdsByParentNodeId,
			moduleMap: e.moduleMap,
			nodesByNodeId: e.nodesByNodeId,
			sourceRef: n,
			subagentNodesById: e.subagentNodesById
		}));
	}
	for (let n of e.manifest.remoteAgents) t.push(await resolveRuntimeRemoteAgent({
		moduleMap: e.moduleMap,
		nodeScopeId: e.parentNodeId,
		sourceRef: n
	}));
	return t;
}
async function resolveRuntimeSubagent(e) {
	let t = {
		...e.sourceRef.configResolver === void 0 ? {
			description: e.sourceRef.description,
			tool: e.sourceRef.agent.config.tool
		} : { dynamic: await resolveDynamicDefinition(e.sourceRef.configResolver, {
			kindLabel: `dynamic subagent`,
			moduleMap: e.moduleMap,
			nodeId: e.sourceRef.nodeId
		}) },
		kind: `subagent`,
		logicalPath: e.sourceRef.logicalPath,
		name: e.sourceRef.name,
		nodeId: toRuntimeNodeId(e.sourceRef.nodeId),
		sourceId: e.sourceRef.sourceId,
		sourceKind: `module`
	};
	return await resolveRuntimeAgentNode({
		agentId: e.sourceRef.name,
		childNodeIdsByParentNodeId: e.childNodeIdsByParentNodeId,
		manifest: e.sourceRef.agent,
		moduleMap: e.moduleMap,
		nodeId: e.sourceRef.nodeId,
		nodesByNodeId: e.nodesByNodeId,
		sourceId: e.sourceRef.sourceId,
		subagentNodesById: e.subagentNodesById
	}), t;
}
async function resolveRuntimeRemoteAgent(e) {
	let t = await loadResolvedModuleExport({
		definition: e.sourceRef,
		kindLabel: `remote agent`,
		moduleMap: e.moduleMap,
		nodeId: e.nodeScopeId
	});
	let n = expectObjectRecord(t, `Expected remote agent source "${e.sourceRef.logicalPath}" to export an object.`);
	let r = {
		description: e.sourceRef.description,
		kind: `remote`,
		logicalPath: e.sourceRef.logicalPath,
		name: e.sourceRef.name,
		nodeId: toRuntimeNodeId(e.sourceRef.nodeId),
		path: e.sourceRef.path,
		sourceId: e.sourceRef.sourceId,
		sourceKind: `module`,
		tool: e.sourceRef.tool,
		url: await resolveRemoteAgentUrl({
			bakedUrl: e.sourceRef.url,
			logicalPath: e.sourceRef.logicalPath,
			resolvedUrl: n.url
		})
	};
	typeof n.auth == `function` && (r.auth = n.auth), n.forwardPrincipal === !0 && (r.forwardPrincipal = !0);
	let i = resolveRemoteAgentHeaders(n.headers);
	return i !== void 0 && (r.headers = i), r;
}
async function resolveRemoteAgentUrl(e) {
	if (typeof e.resolvedUrl == `function`) {
		let t = await e.resolvedUrl();
		if (typeof t != `string` || t.length === 0) throw Error(`Remote agent "${e.logicalPath}" url function must return a non-empty string.`);
		return t;
	}
	let t = e.bakedUrl ?? (typeof e.resolvedUrl == `string` ? e.resolvedUrl : ``);
	if (t.length === 0) throw Error(`Remote agent "${e.logicalPath}" is missing a url.`);
	return t;
}
function resolveRemoteAgentHeaders(e) {
	if (e === void 0) return;
	if (typeof e == `function`) return e;
	if (typeof e != `object` || !e || Array.isArray(e)) return;
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == `string` && (t[n] = r);
	return t;
}
function attachInheritedSandboxWorkspaceResources(e) {
	let t = new Map(e.manifest.subagents.map((e) => [e.nodeId, e.parentNodeId]));
	for (let [n, r] of e.nodesByNodeId) {
		if (r.sandboxRegistry.sandbox.definition.kind !== `parent`) continue;
		if (r.agent.definitions.some(({ kind: e }) => e === `skill`)) throw new ResolveRuntimeAgentGraphError(`Sandbox "${r.sandboxRegistry.sandbox.definition.logicalPath}" selects parent.sandbox but agent node "${n}" defines dynamic skills. Remove the child dynamic skills or give the child its own sandbox.`, { nodeId: n });
		let i = t.get(n);
		if (i === void 0) throw new ResolveRuntimeAgentGraphError(`Sandbox "${r.sandboxRegistry.sandbox.definition.logicalPath}" selects parent.sandbox but agent node "${n}" has no parent. Only a declared subagent can share its parent's sandbox with defineParentSandbox(). Give this agent its own sandbox with defineSandbox() and an exported environment.`, { nodeId: n });
		let a = resolveSandboxOwnerNode({
			nodeId: i,
			nodesByNodeId: e.nodesByNodeId,
			parentNodeIdByChildNodeId: t
		});
		r.sandboxRegistry.sandbox.inheritance = {
			definition: a.sandboxRegistry.sandbox.definition,
			nodeId: a.nodeId,
			workspaceResourceRoot: a.sandboxRegistry.sandbox.workspaceResourceRoot
		}, r.turnAgent.workspaceSpec = a.agent.workspaceSpec;
	}
}
function resolveSandboxOwnerNode(e) {
	let t = e.nodesByNodeId.get(toRuntimeNodeId(e.nodeId));
	if (t === void 0) throw new ResolveRuntimeAgentGraphError(`Missing parent runtime node "${e.nodeId}".`, { nodeId: e.nodeId });
	if (t.sandboxRegistry.sandbox.definition.kind !== `parent`) return t;
	let n = e.parentNodeIdByChildNodeId.get(e.nodeId);
	if (n === void 0) throw new ResolveRuntimeAgentGraphError(`Inherited sandbox node "${e.nodeId}" has no parent.`, { nodeId: e.nodeId });
	return resolveSandboxOwnerNode({
		...e,
		nodeId: n
	});
}
function createChildNodeIdsByParentNodeId(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.subagents) {
		let e = t.get(n.parentNodeId);
		e === void 0 ? t.set(n.parentNodeId, [n.nodeId]) : e.push(n.nodeId);
	}
	return t;
}
function toRuntimeNodeId(e) {
	return e === "__root__" ? "__root__" : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/schedules/record.js
function scheduleDisplayName(e) {
	return e.replace(/--[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u, ``);
}
function projectScheduleRecord(e) {
	return {
		...e,
		displayName: scheduleDisplayName(e.name)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/schedule-auth.js
const SCHEDULE_APP_AUTH = {
	attributes: {},
	authenticator: `app`,
	principalId: `eve:app`,
	principalType: `runtime`
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/channel-address.js
const startsNewAddress = Symbol(`eve.channel.startsNewAddress`);
function createChannelAddress(e) {
	let t = e.metadata ?? {};
	let n = `${e.channelName}:${e.continuationToken}`;
	if (isReservedSessionCommandToken(n)) throw Error(`Channel address "${n}" uses eve's reserved session namespace.`);
	return {
		continuationToken: e.continuationToken,
		async deliver(r, i) {
			validateDeliveryIdempotencyKey(i.idempotencyKey);
			let a = createChannelDeliveryMetadata({
				channelKind: `channel:${e.channelName}`,
				channelName: e.channelName,
				...t
			});
			let o = withValidatedHistory(normalizeSendInput(r));
			let s = sessionCallbackToTurnCaller(i.callback);
			let c = contextStorage.getStore();
			let l = c === void 0 ? void 0 : readSessionSchedule(c);
			let u = {
				...l !== void 0 && { schedule: l },
				idempotencyKey: i.idempotencyKey,
				auth: i.auth,
				delivery: a,
				kind: `send`,
				payload: {
					...o,
					message: serializeFilePartsInMessage(o.message)
				},
				requestId: t.requestId,
				...o.message === void 0 ? { turnPolicy: void 0 } : storedTurnPolicy(i.turnPolicy ?? e.turnPolicy ?? "steer")
			};
			let d = s === void 0 ? u : {
				...u,
				caller: s
			};
			let f = i.state;
			let p = {
				...e.adapter,
				state: seedChannelState(e.adapter.state, f)
			};
			let m = {
				idempotencyKey: i.idempotencyKey,
				adapter: p,
				auth: i.auth,
				capabilities: { requestInput: !0 },
				callback: i.callback,
				channelName: e.channelName,
				continuationConflictCommand: d,
				continuationToken: n,
				delivery: a,
				initiatorAuth: i.initiatorAuth,
				input: attachInputText({
					context: o.context,
					history: o.history,
					message: serializeFilePartsInMessage(o.message) ?? ``,
					outputSchema: o.outputSchema,
					state: o.state
				}, readInputText(o)),
				requestId: t.requestId,
				title: i.title
			};
			let h = o.answers !== void 0 && o.answers.length > 0;
			let g = i[startsNewAddress] === !0 && !h ? void 0 : await e.runtime.dispatchContinuation({
				command: d,
				continuationToken: n,
				successor: m
			});
			if (g?.status === `accepted`) return commandDelivery(e.runtime, g, a.deliveryId);
			if (h) throw new SessionNotActiveError();
			let _ = await e.runtime.createSession(m);
			return commandDelivery(e.runtime, {
				status: `accepted`,
				sessionId: _.sessionId
			}, a.deliveryId);
		},
		async create(r) {
			let i = validateSessionHistory(r.history);
			let toSession = (n) => createSession(n, e.runtime, {
				...t,
				turnPolicy: e.turnPolicy
			});
			let a;
			try {
				a = await e.runtime.resolveContinuation(n, { runnable: !0 });
			} catch (e) {
				throw SessionStrandedError.is(e) ? new SessionStrandedError(e.owner, describeStrandedSession(e.owner, `Call end() on the address, then create() again to start a session from your history.`)) : e;
			}
			if (a !== void 0) return {
				created: !1,
				session: toSession(a.sessionId)
			};
			let o = r.state;
			let s = await e.runtime.createSession({
				adapter: {
					...e.adapter,
					state: seedChannelState(e.adapter.state, o)
				},
				auth: r.auth,
				capabilities: { requestInput: !0 },
				channelName: e.channelName,
				continuationToken: n,
				initiatorAuth: r.initiatorAuth,
				input: i === void 0 ? {} : { history: i },
				requestId: t.requestId,
				title: r.title
			});
			return {
				created: s.claimedContinuation !== !1,
				session: toSession(s.sessionId)
			};
		},
		async send(e, t) {
			return await this.deliver({ message: e }, t);
		},
		async respond(e, t) {
			if (e === void 0 || e.length === 0) throw Error(`respond() requires at least one answer.`);
			return await this.deliver({ answers: e }, t);
		},
		async cancel(t) {
			let r = controlCommand({
				kind: `cancel`,
				turnId: t?.turnId
			}, t);
			let i = await e.runtime.dispatchContinuation({
				command: r,
				continuationToken: n
			});
			return commandDelivery(e.runtime, i, r.deliveryId);
		},
		async compact(t) {
			let r = controlCommand({ kind: `compact` }, t);
			let i = await e.runtime.dispatchContinuation({
				command: r,
				continuationToken: n
			});
			return commandDelivery(e.runtime, i, r.deliveryId);
		},
		async clear(t) {
			let r = controlCommand({ kind: `clear` }, t);
			let i = await e.runtime.dispatchContinuation({
				command: r,
				continuationToken: n
			});
			return commandDelivery(e.runtime, i, r.deliveryId);
		},
		async end(t) {
			let r = controlCommand({
				kind: `reset`,
				reason: t?.reason
			}, t);
			let i = await e.runtime.dispatchContinuation({
				command: r,
				continuationToken: n
			});
			return commandDelivery(e.runtime, i, r.deliveryId, { follow: !1 });
		},
		async resolveSession() {
			let r = await e.runtime.resolveContinuation(n);
			return r === void 0 ? void 0 : createSession(r.sessionId, e.runtime, {
				...t,
				turnPolicy: e.turnPolicy
			});
		}
	};
}
function createChannelAddressFn(e) {
	return (t) => createChannelAddress({
		...e,
		continuationToken: t
	});
}
function withValidatedHistory(e) {
	let { history: t, ...n } = e;
	let r = validateSessionHistory(t);
	return r === void 0 ? n : {
		...n,
		history: r
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/channel-operations.js
function createChannelOperations(e) {
	let t = createChannelAddressFn(e);
	return {
		from(e) {
			let n = t(e);
			return {
				async send(e, t) {
					return await n.deliver(attachInputText({
						context: t.context,
						history: t.history,
						message: e,
						outputSchema: t.outputSchema,
						state: t.state
					}, t.answerText), t);
				},
				async create(e) {
					return await n.create(e);
				},
				async respond(e, t) {
					if (e.length === 0) throw Error(`respond() requires at least one answer.`);
					let r = parseAnswers(e);
					return await n.deliver({
						context: t.context,
						outputSchema: t.outputSchema,
						answers: r,
						state: t.state
					}, t);
				},
				async cancel(e) {
					return await n.cancel(e);
				},
				async compact(e) {
					return await n.compact(e);
				},
				async clear(e) {
					return await n.clear(e);
				},
				async end(e) {
					return await n.end(e);
				}
			};
		},
		async resolveSession(e) {
			return await t(e).resolveSession();
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/cross-channel-receive.js
function toCrossChannelTargets(e) {
	return e.flatMap((e) => e.definition === void 0 ? [] : [{
		name: e.name,
		definition: e.definition,
		receive: e.receive,
		adapter: e.adapter,
		turnPolicy: e.turnPolicy
	}]);
}
function createCrossChannelToFn(e, t, n = {}) {
	return (r, i) => {
		let a = resolveTargetByReference(r, t);
		return { async send(t, r) {
			return await invokeChannelReceive({
				runtime: e,
				source: n,
				target: a,
				input: {
					...toSessionSendOptions(r),
					message: t,
					target: i
				},
				turnPolicy: r.turnPolicy
			});
		} };
	};
}
async function invokeChannelReceive(e) {
	let { name: t } = e.target;
	if (!e.target.receive) throw Error(`ctx.to(): channel "${t}" does not implement receive(). Declare a receive hook on the channel to accept cross-channel sessions.`);
	if (!e.target.adapter) throw Error(`ctx.to(): channel "${t}" has no adapter — cannot build ctx.from().`);
	let n = createChannelOperations({
		adapter: e.target.adapter,
		channelName: t,
		metadata: {
			...e.source,
			channelKind: `channel:${t}`,
			channelName: t
		},
		runtime: e.runtime,
		turnPolicy: e.turnPolicy ?? e.target.turnPolicy
	});
	return await e.target.receive(e.input, n);
}
function resolveTargetByReference(e, t) {
	for (let n of t) if (n.definition === e) return n;
	let n = resolveTargetByRouteFingerprint(e, t);
	if (n !== null) return n;
	throw Error(`ctx.to(): the channel passed as the first argument is not registered in this agent's channels/. Import the channel module's default export from agent/channels/<name>.ts and pass that value.`);
}
function resolveTargetByRouteFingerprint(e, t) {
	if (!isCompiledChannel(e)) return null;
	let n = createRouteFingerprint(e);
	if (n === null) return null;
	let r = /* @__PURE__ */ new Map();
	for (let e of t) createRouteFingerprint(e.definition) === n && r.set(e.name, e);
	if (r.size === 1) return [...r.values()][0];
	if (r.size > 1) throw Error(`ctx.to(): the channel passed as the first argument matches multiple registered channels by route shape. Import a channel with a unique route set from agent/channels/<name>.ts before passing it to ctx.to().`);
	return null;
}
function createRouteFingerprint(e) {
	return e.routes.length === 0 ? null : e.routes.map((e) => `${e.method.toUpperCase()} ${e.path}`).sort().join(`
`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/schedules/verify-delivery.js
const referenceSchema$1 = z.string().min(1);
z.looseObject({
	executionId: referenceSchema$1.optional(),
	firedAt: z.string().optional(),
	name: referenceSchema$1,
	namespace: referenceSchema$1,
	payload: z.looseObject({
		eve: z.looseObject({
			application: referenceSchema$1,
			collection: referenceSchema$1,
			version: z.literal(1)
		}),
		payload: z.unknown()
	}),
	scheduleId: referenceSchema$1,
	scheduledAt: z.string().optional(),
	source: z.literal(`dynamic`)
});
var PermanentScheduleMessageError = class extends Error {};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/schedules/payload.js
const referenceSchema = z.string().min(1).max(2048);
const principalReferenceSchema = z.object({
	type: referenceSchema,
	authenticator: referenceSchema,
	issuer: referenceSchema.optional(),
	principalId: referenceSchema,
	subject: referenceSchema.optional()
}).strict();
const payloadSchema = z.object({
	eve: z.object({
		application: referenceSchema,
		collection: referenceSchema,
		version: z.literal(3)
	}).strict(),
	envelope: z.object({
		version: z.literal(3),
		payload: z.json(),
		scope: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
		principal: principalReferenceSchema
	}).strict()
}).strict();
function createScheduleCollectionPayload(e) {
	return parseSchedulePayload({
		eve: {
			application: e.application,
			collection: e.collection,
			version: 3
		},
		envelope: e.envelope
	});
}
function parseSchedulePayload(e, t) {
	let n;
	try {
		let t = JSON.stringify(e);
		if (t === void 0 || Buffer.byteLength(t) > 65536) throw Error();
		n = JSON.parse(t);
	} catch {
		throw Error(`Invalid scheduled collection payload; recreate the schedule.`);
	}
	let r = payloadSchema.safeParse(n);
	if (!r.success) throw Error(`Invalid scheduled collection payload; recreate the schedule.`);
	if (t !== void 0 && (r.data.eve.application !== t.application || r.data.eve.collection !== t.collection)) throw Error(`Schedule identity changed; recreate the schedule.`);
	return r.data;
}
async function validateSchedulePayload(e, t) {
	let n = await e[`~standard`].validate(t);
	if (n.issues !== void 0 || !(`value` in n)) throw Error(`Invalid schedule payload: ${n.issues?.map((e) => e.message).join(`; `) ?? `schema validation failed`}.`);
	return n.value;
}
const SCHEDULE_ADAPTER = { kind: "schedule" };
var ScheduleDispatcher = class {
	runtime;
	channels;
	constructor(e) {
		this.runtime = e.runtime, this.channels = e.channels;
	}
	async trigger(e) {
		let t = new ContextContainer();
		return t.set(ScheduleIdKey, e.scheduleId), await contextStorage.run(t, () => this.triggerInScope(e));
	}
	async triggerCollection(e) {
		let { envelope: t } = parseSchedulePayload(e.payload, {
			application: e.payload.eve.application,
			collection: e.collectionId
		});
		let { definition: n } = e;
		let r = {
			...e.occurrence,
			displayName: scheduleDisplayName(e.occurrence.name)
		};
		let i = n.preparePayload === void 0 ? await validateSchedulePayload(n.inputSchema, t.payload) : t.payload;
		await e.verifyDelivery?.();
		let a = resolveCreatorAuth(await n.auth({
			principal: t.principal,
			payload: i,
			occurrence: r,
			schedule: e.schedule
		}), t.principal);
		let o = new ContextContainer();
		o.set(ScheduleIdKey, e.collectionId), o.set(AuthKey, a), o.set(OccurrenceIdKey, r.executionId), o.set(ScheduleInstanceKey, r.name);
		let scheduledToken = (e, t) => t === void 0 ? `eve-scheduled-send:${randomUUID()}` : `eve-scheduled-send:${createHash(`sha256`).update(JSON.stringify([
			r.scheduleId,
			e,
			t
		])).digest(`hex`)}`;
		let s = /* @__PURE__ */ new Map();
		let occurrenceKey = (e, t, n) => {
			let i = messageDigest(n);
			let a = s.get(e) ?? /* @__PURE__ */ new Map();
			s.set(e, a);
			let o = JSON.stringify([t, i]);
			let c = a.get(o) ?? 0;
			return a.set(o, c + 1), `eve-occurrence:${createHash(`sha256`).update(JSON.stringify([
				r.executionId,
				i,
				c
			])).digest(`hex`)}`;
		};
		let freshRun = (e) => ({
			...e,
			auth: a,
			initiatorAuth: a,
			capabilities: { requestInput: !1 },
			continuationToken: scheduledToken(e.continuationToken, e.idempotencyKey),
			continuationConflictCommand: e.idempotencyKey === void 0 ? void 0 : e.continuationConflictCommand
		});
		return await contextStorage.run(o, async () => {
			let t = {
				...this.runtime,
				resolveContinuation: async () => void 0,
				dispatchContinuation: async (e) => {
					if (e.command.kind !== `send`) throw Error(`Scheduled channel receive can only start a fresh session.`);
					return { status: `session_not_active` };
				},
				createSession: async (e) => await this.runtime.createSession(freshRun(e))
			};
			let { args: o, sessions: s, waitUntilTasks: c } = this.createHandlerContext(t);
			return await n.run({
				payload: i,
				occurrence: r,
				auth: a,
				schedule: e.schedule,
				to: (e, t) => ({ send: (n, r) => o.to(e, t).send(n, {
					...r,
					idempotencyKey: r?.idempotencyKey ?? occurrenceKey(e, t, n),
					auth: a
				}) }),
				waitUntil: o.waitUntil
			}), await Promise.all(c), {
				sessions: s,
				waitUntilTasks: c
			};
		});
	}
	async triggerInScope(e) {
		let { args: t, sessions: n, waitUntilTasks: r } = this.createHandlerContext();
		if (e.run) await e.run(t);
		else if (e.markdown !== void 0) n.push(await this.runMarkdown(e.markdown));
		else throw Error(`Schedule "${e.scheduleId}" has neither "run" nor "markdown" — at least one must be set.`);
		return {
			sessions: n,
			waitUntilTasks: r
		};
	}
	createHandlerContext(e = this.runtime) {
		let t = [];
		let n = [];
		let r = createCrossChannelToFn(e, toCrossChannelTargets(this.channels), { acceptedDeploymentId: process.env.VERCEL_DEPLOYMENT_ID?.trim() || void 0 });
		return {
			args: {
				appAuth: SCHEDULE_APP_AUTH,
				to(e, n) {
					let i = r(e, n);
					return { async send(e, n) {
						let r = await i.send(e, n);
						return t.push(r), r;
					} };
				},
				waitUntil(e) {
					n.push(e);
				}
			},
			sessions: t,
			waitUntilTasks: n
		};
	}
	async runMarkdown(e) {
		let t = createChannelDeliveryMetadata({
			channelKind: `schedule`,
			channelName: `schedule`
		});
		let n = await this.runtime.createSession({
			delivery: t,
			adapter: SCHEDULE_ADAPTER,
			auth: SCHEDULE_APP_AUTH,
			input: { message: e }
		});
		return commandDelivery(this.runtime, {
			status: `accepted`,
			sessionId: n.sessionId
		}, t.deliveryId);
	}
};
function messageDigest(e) {
	let t = createHash(`sha256`);
	let field = (e) => {
		t.update(`${typeof e == `string` ? Buffer.byteLength(e) : e.byteLength}:`), t.update(e);
	};
	for (let t of typeof e == `string` ? [{
		type: `text`,
		text: e
	}] : e) {
		if (field(t.type), t.type === `text`) {
			field(t.text);
			continue;
		}
		field(t.mediaType), field(t.filename ?? ``);
		let { data: e } = t;
		typeof e == `string` ? (field(`encoded`), field(e)) : e instanceof URL ? (field(`url`), field(e.href)) : (field(`bytes`), field(e instanceof ArrayBuffer ? new Uint8Array(e) : e));
	}
	return t.digest(`hex`);
}
function resolveCreatorAuth(e, t) {
	if (e === null) throw new PermanentScheduleMessageError(`Scheduled execution is no longer authorized: "auth" returned null for the schedule creator.`);
	if (typeof e == `object` && `principalId` in e) {
		if (e.principalId !== t.principalId || e.principalType !== t.type || e.authenticator !== t.authenticator || e.issuer !== t.issuer || e.subject !== t.subject) throw new PermanentScheduleMessageError(`Scheduled execution auth must resolve the schedule creator.`);
		return e;
	}
	let n = e?.attributes;
	if (typeof n != `object` || !n) throw new PermanentScheduleMessageError(`Scheduled execution "auth" must return { attributes }, a SessionAuthContext for the schedule creator, or null.`);
	let r = {
		attributes: n,
		authenticator: t.authenticator,
		principalId: t.principalId,
		principalType: t.type
	};
	return t.issuer !== void 0 && (r.issuer = t.issuer), t.subject !== void 0 && (r.subject = t.subject), r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/interaction-relay.js
function relayedInteractionEvents(e, t, n) {
	if (t.type !== `interaction.opened`) {
		let n = relayedFact(e, t);
		return n === void 0 ? [] : [n];
	}
	let r = e.interactions[t.data.interactionId];
	return (interactionBatches(e, { signIns: !0 }).find((e) => e[0] === r) ?? []).map((t) => {
		let r = askedCall(e, t);
		let i = {
			interactionId: t.interactionId,
			sessionId: n
		};
		return relayEvent(`interaction.opened`, {
			audience: t.audience,
			interactionId: t.interactionId,
			origin: r === void 0 ? i : {
				...i,
				call: r
			},
			request: t.request,
			subject: t.subject
		});
	});
}
function relayedFact(e, t) {
	switch (t.type) {
		case `interaction.settled`: {
			let { cause: n } = t.data;
			let r = n !== void 0 && `responseId` in n ? e.responses[n.responseId] : void 0;
			return relayEvent(`interaction.settled`, r === void 0 ? t.data : {
				...t.data,
				cause: { deliveryId: r.deliveryId }
			});
		}
		case `response.admitted`: {
			let n = e.responses[t.data.responseId];
			return n === void 0 ? void 0 : relayEvent(`response.admitted`, {
				deliveryId: n.deliveryId,
				interactionId: n.interactionId
			});
		}
		case `response.settled`: {
			let { outcome: n, reason: r, responseId: i } = t.data;
			let a = e.responses[i];
			if (a === void 0 || n === `applied`) return;
			let { deliveryId: o, interactionId: s } = a;
			return relayEvent(`response.settled`, {
				deliveryId: o,
				interactionId: s,
				outcome: n,
				reason: r
			});
		}
		default: return;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/capability-error.js
function formatCapabilityError(e, t) {
	let n = t.filter((e) => e !== void 0 && e.length > 0).flatMap((e) => [e, encodeURIComponent(e)]).sort((e, t) => t.length - e.length);
	return Object.fromEntries(Object.entries(formatError(e)).map(([e, t]) => [e, typeof t == `string` ? n.reduce((e, t) => e.replaceAll(t, `[redacted]`), t) : t]));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/adapter-state.js
function isSubagentAdapterState(e) {
	if (typeof e != `object` || !e) return !1;
	let t = e;
	return typeof t.callId == `string` && t.callId.length > 0 && typeof t.parentContinuationToken == `string` && t.parentContinuationToken.length > 0 && typeof t.parentSessionId == `string` && typeof t.subagentName == `string` && t.subagentName.length > 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/adapter.js
const log = createLogger(`execution.subagent-adapter`);
const SUBAGENT_ADAPTER = {
	kind: "subagent",
	async "interaction.opened"(e, t) {
		await relay(e, t);
	},
	async "interaction.settled"(e, t) {
		await relay(e, t);
	},
	async "response.admitted"(e, t) {
		await relay(e, t);
	},
	async "response.settled"(e, t) {
		await relay(e, t);
	}
};
async function relay(e, t) {
	let n = t.state;
	if (!isSubagentAdapterState(n) || t.view === void 0) return;
	let r = t.ctx.require(SessionIdKey);
	let i = relayedInteractionEvents(t.view, e, r);
	i.length !== 0 && await forwardToParentStep({
		hookPayload: {
			callId: n.callId,
			childSessionId: r,
			events: i,
			kind: `subagent-interaction`,
			subagentName: n.subagentName,
			...i.some((e) => e.type === `interaction.opened` && e.data.request.kind !== `sign-in`) && { route: {
				childContinuationToken: t.ctx.require(ContinuationTokenKey),
				...t.ctx.get(SessionInboxKey) !== void 0 && { childSessionInbox: t.ctx.get(SessionInboxKey) },
				...t.inputSource !== void 0 && { inputSource: t.inputSource }
			} }
		},
		parentContinuationToken: n.parentContinuationToken
	});
}
async function forwardToParentStep(e) {
	try {
		let { resumeRoutedHook: t } = await import("./_3.mjs");
		await t(e.parentContinuationToken, e.hookPayload);
	} catch (t) {
		throw log.warn(`failed to forward a child's interaction to its parent`, {
			callId: e.hookPayload.callId,
			childSessionId: e.hookPayload.childSessionId,
			errorId: createErrorId(),
			eventTypes: e.hookPayload.events.map((e) => e.type),
			subagentName: e.hookPayload.subagentName,
			error: formatCapabilityError(t, [e.parentContinuationToken, e.hookPayload.route?.childContinuationToken])
		}), t;
	}
}
registerStepFunction("step//eve@1.4.0//forwardToParentStep", forwardToParentStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/channels/registry.js
const FRAMEWORK_ADAPTERS = [
	HTTP_ADAPTER,
	SUBAGENT_ADAPTER,
	SCHEDULE_ADAPTER
];
const ADAPTER_NON_EVENT_FIELDS = /* @__PURE__ */ new Set([
	`kind`,
	`state`,
	`deliver`,
	`createAdapterContext`,
	`fetchFile`,
	`instrumentation`,
	`uploadPolicy`
]);
function createRuntimeAdapterRegistry(e) {
	let t = /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Set();
	for (let e of FRAMEWORK_ADAPTERS) {
		let r = requireAdapterKind(e);
		n.add(r), t.set(r, e);
	}
	for (let r of e.channels) {
		if (r.adapter === void 0) continue;
		let e = {
			logicalPath: r.logicalPath,
			sourceId: r.sourceId
		};
		let i = r.adapter;
		let a = requireAdapterKind(i, e);
		if (n.has(a)) {
			if (carriesAdapterBehavior(i)) throw new RuntimeRegistryError(`adapter`, `Channel adapter kind "${a}" is reserved by the framework. A route-declared adapter may share a framework kind only as a pass-through with no \`deliver\` hook, event handlers, \`attachments\` resolver, or \`createAdapterContext\` factory. Use a custom \`kind\` to add channel-specific behavior.`, {
				...e,
				entryName: a
			});
		} else t.set(a, i);
	}
	return { adaptersByKind: t };
}
function deserializeRuntimeAdapter(e, t) {
	let n = t;
	let r = e.adaptersByKind.get(n.kind);
	if (r === void 0) throw Error(`Unknown adapter kind: "${n.kind}". Declare the adapter on the route that starts this session so the runtime can rehydrate it.`);
	return {
		...r,
		state: seedChannelState(r.state, n.state)
	};
}
function requireAdapterKind(e, t) {
	let n = getAdapterKind(e);
	if (typeof n != `string` || n.length === 0) throw new RuntimeRegistryError(`adapter`, "Adapters must declare a non-empty `kind` field.", {
		entryName: `unknown`,
		logicalPath: t?.logicalPath,
		sourceId: t?.sourceId
	});
	return n;
}
function carriesAdapterBehavior(e) {
	if (e.deliver !== void 0 || e.fetchFile !== void 0 || e.uploadPolicy !== void 0 || e.createAdapterContext !== void 0) return !0;
	for (let [t, n] of Object.entries(e)) if (!ADAPTER_NON_EVENT_FIELDS.has(t) && typeof n == `function`) return !0;
	return !1;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-catalog.js
const MODEL_METADATA_KIND = `eve-model-metadata`;
const catalogModelProviderSchema = z.object({
	provider: z.string().min(1),
	providerModelId: z.string().min(1),
	contextWindowTokens: z.number().int().nonnegative().optional()
}).passthrough();
const catalogModelSchema = z.object({
	slug: z.string().min(1),
	providers: z.array(catalogModelProviderSchema).min(1)
}).passthrough();
z.object({
	models: z.array(catalogModelSchema),
	providerAliases: z.record(z.string(), z.string())
}).passthrough();
const modelMetadataSchema = z.object({
	fetchedAt: z.string().nullable(),
	kind: z.literal(MODEL_METADATA_KIND),
	models: z.array(z.object({
		slug: z.string().min(1),
		providers: z.array(z.object({
			contextWindowTokens: z.number().int().positive(),
			provider: z.string().min(1),
			providerModelId: z.string().min(1)
		}).strict()).min(1)
	}).strict()),
	providerAliases: z.record(z.string(), z.string()),
	version: z.literal(1)
}).strict();
function normalizeCatalogModelId(e) {
	return e.endsWith(`-thinking`) ? e.slice(0, -9) : e;
}
function findCatalogModelBySlug(e, t) {
	let n = e.find((e) => e.slug === t);
	if (n !== void 0) return n;
	let r = normalizeCatalogModelId(t);
	return r === t ? void 0 : e.find((e) => e.slug === r);
}
function lookupCatalogModelBySlug(e, t) {
	let n = findCatalogModelBySlug(e.models, t);
	if (n === void 0) return null;
	for (let e of n.providers) {
		let t = contextWindowOf(e);
		if (t !== null) return {
			contextWindowTokens: t,
			slug: n.slug
		};
	}
	return null;
}
function lookupCatalogModelByProviderModelId(e, t, n) {
	let r = t.split(`.`)[0];
	let i = e.providerAliases[r] ?? r;
	let a = normalizeCatalogModelId(n);
	for (let t of e.models) for (let e of t.providers) {
		let n = contextWindowOf(e);
		if (n !== null && e.provider === i && normalizeCatalogModelId(e.providerModelId) === a) return {
			contextWindowTokens: n,
			slug: t.slug
		};
	}
	return null;
}
function contextWindowOf(e) {
	return e.contextWindowTokens === void 0 || e.contextWindowTokens <= 0 ? null : e.contextWindowTokens;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/loaders/model-metadata.js
async function loadModelMetadata(e) {
	if (e.kind === `bundled`) {
		let e = readBundledCompiledArtifacts()?.modelMetadata;
		if (e === void 0) throw Error("The bundled compiled artifacts have no model metadata. Rebuild with `eve build`.");
		return e;
	}
	let t = resolveRuntimeCompilerArtifactPaths(e.appRoot).modelMetadataPath;
	try {
		return modelMetadataSchema.parse(JSON.parse(await readFile(t, `utf8`)));
	} catch (e) {
		throw e instanceof Error && `code` in e && e.code === `ENOENT` ? Error(`The compiled artifacts have no model metadata at "${t}". Rebuild with \`eve build\`, or restart \`eve dev\`.`, { cause: e }) : e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/loaders/module-map.js
const BUNDLED_MODULE_MAP_SOURCE = `bundled compiled module map`;
var LoadCompiledModuleMapError = class extends Error {
	moduleMapPath;
	constructor(e, t) {
		super(e), this.name = `LoadCompiledModuleMapError`, t !== void 0 && (this.moduleMapPath = t);
	}
};
async function loadCompiledModuleMap(e) {
	let t = e.compiledArtifactsSource.kind === `disk` ? resolveRuntimeCompilerArtifactPaths(e.compiledArtifactsSource.appRoot).moduleMapPath : void 0;
	if (t !== void 0) {
		let e = createFileImportSpecifier(t);
		try {
			let n = await import(e);
			return parseCompiledModuleMap(n.moduleMap ?? n.default, t);
		} catch (e) {
			throw new LoadCompiledModuleMapError(formatLoadErrorMessage(e), t);
		}
	}
	let n = readBundledCompiledArtifacts();
	if (n !== null) return parseCompiledModuleMap(n.moduleMap, BUNDLED_MODULE_MAP_SOURCE);
	throw new LoadCompiledModuleMapError(`Compiled module map is unavailable without an app root or bundled compiled artifacts.`, BUNDLED_MODULE_MAP_SOURCE);
}
function parseCompiledModuleMap(e, t) {
	let n = compiledModuleMapSchema.safeParse(e);
	if (!n.success) throw new LoadCompiledModuleMapError(`Expected "${t}" to export a valid compiled eve module map. ${formatValidationError(n.error)}`, t);
	return n.data;
}
function formatLoadErrorMessage(e) {
	return e instanceof Error ? e.message : `Unknown module-map load failure.`;
}
function createFileImportSpecifier(e) {
	let t = e.replaceAll(`\\`, `/`);
	return /^[A-Za-z]:\//.test(t) ? `file:///${encodeURI(t)}` : t.startsWith(`/`) ? `file://${encodeURI(t)}` : t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sessions/compiled-agent-cache.js
const isCacheDisabled = process.env.EVE_DISABLE_AGENT_CACHE === `1`;
const DEVELOPMENT_RUNTIME_SNAPSHOT_SEGMENT = /\/\.eve\/(?:eval-servers\/[^/]+\/)?dev-runtime\/snapshots\//;
function isDevelopmentRuntimeSnapshotRoot(e) {
	return DEVELOPMENT_RUNTIME_SNAPSHOT_SEGMENT.test(e.replaceAll(`\\`, `/`));
}
function normalizeCompiledArtifactsSource(e) {
	return e.kind !== `disk` || e.moduleMapLoaderPath !== void 0 || !isDevelopmentRuntimeSnapshotRoot(e.appRoot) ? e : {
		...e,
		moduleMapLoaderPath: resolvePackageSourceFilePath(`src/internal/authored-module-map-loader.ts`)
	};
}
async function loadFullBundle(e) {
	let t = normalizeCompiledArtifactsSource(e);
	let [n, r] = await Promise.all([loadCompiledManifest({ compiledArtifactsSource: t }), loadRuntimeCompiledModuleMap(t)]);
	let i = await resolveRuntimeAgentGraph({
		manifest: n,
		moduleMap: r
	});
	let a = i.root;
	let o;
	return {
		adapterRegistry: createRuntimeAdapterRegistry({ channels: collectResolvedChannels(i) }),
		compiledArtifactsSource: t,
		graph: i,
		modelMetadata: () => (o ??= loadModelMetadata(t).catch((e) => {
			throw o = void 0, e;
		}), o),
		moduleMap: r,
		resolvedAgent: a.agent,
		subagentRegistry: a.subagentRegistry,
		toolRegistry: a.toolRegistry,
		turnAgent: a.turnAgent
	};
}
async function loadRuntimeCompiledModuleMap(e) {
	return e.kind === `disk` && e.moduleMapLoaderPath !== void 0 ? await loadAuthoredSourceCompiledModuleMap(e) : await loadCompiledModuleMap({ compiledArtifactsSource: e });
}
async function loadAuthoredSourceCompiledModuleMap(e) {
	if (e.moduleMapLoaderPath === void 0) throw Error(`Authored-source module map loading requires "moduleMapLoaderPath" in the compiled artifacts source.`);
	return await (await import(pathToFileURL(e.moduleMapLoaderPath).href)).loadCompiledModuleMapFromAuthoredSource({ compiledArtifactsSource: e });
}
async function getOrLoadFullBundle(e) {
	let t = normalizeCompiledArtifactsSource(e);
	if (isCacheDisabled) return loadFullBundle(t);
	let n = getActiveRuntimeSession();
	let r = getRuntimeCompiledArtifactsCacheKey(t);
	let i = await resolveRuntimeCompiledArtifactsVersionedCacheKey(t);
	let a = n.bundleCacheKeyBySourceKey.get(r);
	a !== void 0 && a !== i && n.bundleCache.delete(a), n.bundleCacheKeyBySourceKey.set(r, i);
	let o = n.bundleCache.get(i);
	if (o !== void 0) return o;
	let s = loadFullBundle(t).catch((e) => {
		throw n.bundleCache.delete(i), n.bundleCacheKeyBySourceKey.get(r) === i && n.bundleCacheKeyBySourceKey.delete(r), e;
	});
	return n.bundleCache.set(i, s), s;
}
async function getCompiledRuntimeAgentBundle(e) {
	let t = await getOrLoadFullBundle(e.compiledArtifactsSource);
	if (e.nodeId === void 0) return t;
	let n = nodeBundlesByFullBundle.get(t);
	n === void 0 && (n = /* @__PURE__ */ new Map(), nodeBundlesByFullBundle.set(t, n));
	let r = n.get(e.nodeId);
	if (r !== void 0) return r;
	let i = createNodeBundle(t, e.nodeId);
	return n.set(e.nodeId, i), i;
}
const nodeBundlesByFullBundle = /* @__PURE__ */ new WeakMap();
function createNodeBundle(e, t) {
	let n = getResolvedRuntimeAgentNode(e.graph, t);
	return {
		adapterRegistry: e.adapterRegistry,
		compiledArtifactsSource: e.compiledArtifactsSource,
		graph: {
			nodesByNodeId: e.graph.nodesByNodeId,
			root: n
		},
		modelMetadata: e.modelMetadata,
		moduleMap: e.moduleMap,
		nodeId: t,
		resolvedAgent: n.agent,
		subagentRegistry: n.subagentRegistry,
		toolRegistry: n.toolRegistry,
		turnAgent: n.turnAgent
	};
}
function collectResolvedChannels(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.nodesByNodeId.values()) for (let e of n.channels) t.set(`${e.sourceId}:${e.name}`, e);
	return [...t.values()];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sessions/compiled-session-agent.js
async function compiledSessionAgent(e) {
	let { fromCompiledBundle: t } = await import("./_7.mjs");
	return t(e);
}
async function loadCompiledSessionAgent(e) {
	return await compiledSessionAgent(await getCompiledRuntimeAgentBundle(e));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sessions/runtime-context-keys.js
const ChannelKey = new ContextKey("eve.channel", { codec: {
	serialize(e) {
		return {
			kind: getAdapterKind(e),
			state: e.state ? { ...e.state } : {}
		};
	},
	deserialize(e, t) {
		let n = t.get(SessionAgentKey);
		if (n === void 0) throw Error(`Cannot deserialize "eve.channel" before the session's agent: it must be present in context.`);
		return deserializeRuntimeAdapter(n.adapters, e);
	}
} });
const SessionAgentKey = new ContextKey("eve.bundle", { codec: {
	serialize: (e) => writeAgentReference(e.reference),
	deserialize: async (e) => await resolveSessionAgent(readAgentReference(e))
} });
function compiledBundleOf(e) {
	return e.get(SessionAgentKey)?.compiled;
}
function requireCompiledBundle(e) {
	let t = compiledBundleOf(e);
	if (t === void 0) throw Error(`This needs an agent compiled from files: the session's context has no compiled agent.`);
	return t;
}
async function resolveSessionAgent(e) {
	return await loadCompiledSessionAgent({
		compiledArtifactsSource: resolveDurableCompiledArtifactsSource(e.source),
		nodeId: e.nodeId
	});
}
function writeAgentReference(e) {
	return {
		nodeId: e.nodeId,
		source: e.source
	};
}
function readAgentReference(e) {
	let { nodeId: t, source: n } = e;
	return {
		kind: `bundle`,
		nodeId: t,
		source: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/parent-lineage.js
function resolveParentLineage(e, t, n) {
	if (e === void 0) return;
	let r = t?.state;
	let i = isSubagentAdapterState(r) ? r : void 0;
	return {
		callId: n?.callId ?? i?.callId ?? e.callId,
		sessionId: e.sessionId,
		subagentName: n?.subagentName ?? i?.subagentName,
		turnId: e.turn.id
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/session-context.js
function readInstrumentationSessionContext(e) {
	let t = e.get(SessionTraceSeedKey);
	let n = resolveForwardedTraceSeed(t);
	let r = t === void 0 || n === void 0 ? void 0 : {
		...t,
		...n
	};
	let i = e.get(ParentSessionKey);
	let a = e.get(ChannelKey);
	let o = e.get(ChannelInstrumentationKey);
	let s = readForwardedTraceAssertion(r?.forwardedTracePolicy);
	let c = resolveConversationContext(e.get(ConversationContextKey), {
		channelKind: o?.kind,
		environment: resolveInstrumentationEnvironment(),
		forwardedTracePolicy: s,
		principalType: e.get(AuthKey)?.principalType
	});
	return {
		audience: c.audience,
		channel: a,
		conversation: c,
		context: e,
		forwardedTracePolicy: s,
		instrumentation: o,
		parent: i,
		parentLineage: resolveParentLineage(i, a, e.get(SessionCallbackKey)),
		parentTraceContext: e.get(ParentTraceContextKey),
		principals: readInstrumentationPrincipals(e, c, r?.decision),
		scheduleId: e.get(ScheduleIdKey),
		title: e.get(SessionTitleKey),
		traceSeed: r
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/channel-audience-context.js
const CHANNEL_AUDIENCE_KEY = createContextKey(`eve.channel.audience`);
function withChannelAudience(e, t) {
	return e.setValue(CHANNEL_AUDIENCE_KEY, normalizeChannelAudience(t));
}
export { ChannelKey, HOOK_CONTINUE_KEYS, ScheduleDispatcher, SessionAgentKey, assertAuthKey, compiledBundleOf, compiledSessionAgent, createCrossChannelToFn, createDiskRuntimeCompiledArtifactsSource, createPreparedRuntimeSubagentTool, createScheduleCollectionPayload, eveNamespaceReservation, findRegisteredRuntimeTool, formatCapabilityError, formatLanguageModelGatewayId, formatValidationError, getCompiledRuntimeAgentBundle, getResolvedRuntimeAgentNode, getRuntimeCompiledArtifactsSandboxAppRoot, isAgentReasoningDefinition, isDefinedModel, isModelSignInName, isRuntimeLanguageModel, isSubagentAdapterState, loadCompiledManifest, loadCompiledSessionAgent, loadResolvedModuleExport, lookupCatalogModelByProviderModelId, lookupCatalogModelBySlug, modelSignInName, namedScopeDefinition, normalizeAgentDefinition, normalizeAgentPromptCache, normalizeAuthorizationSpec, normalizeInstructionsDefinition, normalizeScheduleCollectionDefinition, owningSandboxDefinition, projectScheduleRecord, readBundledCompiledArtifacts, readInstrumentationSessionContext, readScheduleCollectionSource, readStampedConnectionProtocol, relayedInteractionEvents, requireCompiledBundle, resolveDurableCompiledArtifactsSource, resolveDynamicConnectionValue, resolveRuntimeAgentGraph, resolveRuntimeCompiledArtifactsVersionedCacheKey, resolveRuntimeCompilerArtifactPaths, resolveSessionAgent, sanitizeScopeSegment, scheduleDisplayName, serializeDurableCompiledArtifactsSource, toAiSdkLanguageModel, toCrossChannelTargets, validateSchedulePayload, validateScheduleTimezone, withChannelAudience };

//# sourceMappingURL=eve21.mjs.map