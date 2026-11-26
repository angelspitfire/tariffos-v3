import { createLogger, logError } from "./eve15.mjs";
import { HEARTBEAT_RECORD, InvalidToolStubTargetError, LEASE_ENDED_RECORD, PROTOCOL_TWO_INPUT_CALLBACK_KINDS, STREAM_ENDED_RECORD, agentDelegation, createStubValidator, formatEarlierRemoteChildStreamError, isRemoteReplyHookToken, isSignInCallbackToken, isStoredLine, isV26Line, parseProtocolTwoInputCallback, parseSessionCallback, readCallbackProtocol, readMatchedStubRules, readProtocolTwoInputCallback, readRemoteAgentProtocolVersion, readStubFailure, resumeRunnableHook, runtime_exports, servesRemoteAgentCaller, v26ChildStarted, v26LineStream, validateStubConstraint } from "./eve50.mjs";
import { isEveDevEnvironment, isLocalDevelopmentServer } from "./eve28.mjs";
import { isLoopbackHostname } from "./eve29.mjs";
import { readForwardedAudienceBaggage, readForwardedParentSessionBaggage } from "./eve18.mjs";
import { isVercelOidcIssuer } from "./eve37.mjs";
import { deliveryIdForIdempotencyKey, internalSession, isAnswer, storedTurnPolicy, validateSessionHistory } from "./eve17.mjs";
import { DELETE, FAIL_CLOSED_FORWARDED_TRACE_ASSERTION, GET, HEAD, PATCH, POST, PUT, SessionNotActiveError, SessionStrandedError, attachClientContext, formatTraceContentCeiling, hasInternalRefScheme } from "./eve16.mjs";
import { defineChannel, readAgentInfoRouteResponse, readRemoteAgentStreamHeadersResolver, readRouteSessionCreator } from "./eve52.mjs";
import { createEveDescendantStreamRoutePath, createEveSessionStreamRoutePath, createEveSubagentStreamRoutePath } from "./eve6.mjs";
import { parseJsonObject, parseJsonValue } from "./eve8.mjs";
import { workflowEntryReference } from "./eve55.mjs";
import { deliverToHostedHook, isRunExpired, isRunMissing } from "./eve31.mjs";
import { collectUploadPolicyViolations, formatUploadPolicyViolation, mergeUploadPolicy } from "./eve53.mjs";
import { resolveForwardedPrincipal } from "./eve35.mjs";
import { isObject } from "./eve14.mjs";
import { eventsOfLine } from "./eve36.mjs";
import { jsonValueSchema as jsonValueSchema$1 } from "./eve9.mjs";
import { interactionSchemas } from "./eve56.mjs";
import { known } from "./eve27.mjs";
import { walkCauseChain } from "./eve22.mjs";
import { parseTraceparent, readAgentDispatchTraceContext } from "./eve39.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { networkInterfaces } from "node:os";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/jose/index.js";
import { HookNotFoundError } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/errors/index.js";
function readTrustedDevelopmentClientAddress(e, t) {
	let n = e.get("x-eve-dev-client-address");
	let r = e.get("x-eve-dev-client-address-signature");
	return n !== null && r !== null && isTrustedDevelopmentClientAddress(n, r, t) ? n : void 0;
}
function readTrustedDevelopmentPeer(e) {
	let t = readTrustedDevelopmentClientAddress(e, process.env["EVE_DEV_WORKFLOW_TRANSPORT_SECRET"]);
	if (t !== void 0) return isLocalMachineAddress(t) ? `local` : `remote`;
}
function isLocalMachineAddress(e) {
	if (isLoopbackHostname(e)) return !0;
	let t = e.toLowerCase().replace(/^\[(.*)\]$/u, `$1`).replace(/^::ffff:/u, ``);
	return Object.values(networkInterfaces()).some((e) => e?.some((e) => e.address.toLowerCase() === t));
}
function isTrustedDevelopmentClientAddress(e, t, n) {
	return e.length > 0 && t.length > 0 && n !== void 0 && n.length > 0 && timingSafeEqualStrings(t, signClientAddress(e, n));
}
function timingSafeEqualStrings(e, t) {
	let n = createHash(`sha256`).update(e).digest();
	let r = createHash(`sha256`).update(t).digest();
	return timingSafeEqual(n, r);
}
function signClientAddress(e, t) {
	return createHmac(`sha256`, t).update(e).digest(`base64url`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/auth/token-claims.js
const STANDARD_PROJECTED_CLAIM_KEYS = /* @__PURE__ */ new Set([
	`aud`,
	`exp`,
	`iat`,
	`iss`,
	`jti`,
	`nbf`,
	`sub`
]);
function normalizeJwtClaims(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) typeof r == `string` ? t[n] = r : Array.isArray(r) && r.every((e) => typeof e == `string`) && (t[n] = Object.freeze([...r]));
	return Object.freeze(t);
}
function createJwtAttributeProjection(e) {
	let t = normalizeJwtClaims(e);
	return Object.freeze(Object.fromEntries(Object.entries(t).filter(([e]) => !STANDARD_PROJECTED_CLAIM_KEYS.has(e))));
}
function areTokenClaimMatchersSatisfied(e, t) {
	let n = normalizeJwtClaims(e);
	if (t.subjects !== void 0) {
		let n = typeof e.sub == `string` ? e.sub : null;
		if (n === null || !t.subjects.some((e) => matchesWildcardPattern(e, n))) return !1;
	}
	return t.claims === void 0 || Object.entries(t.claims).every(([e, t]) => {
		let r = n[e];
		return r === void 0 ? !1 : typeof r == `string` ? t.includes(r) : r.some((e) => t.includes(e));
	});
}
function createJwtAuthenticatedCallerPrincipal(e) {
	let t = readFirstStringClaim(e.payload, [...e.issuerClaims ?? [], `iss`]);
	let n = e.subjectClaim ?? `sub`;
	let r = readFirstStringClaim(e.payload, [n]);
	if (t === void 0 || r === void 0) throw Error(`Expected verified JWT payloads to include string iss and ${n} claims.`);
	let i = normalizeJwtClaims(e.payload);
	return {
		attributes: createJwtAttributeProjection(e.payload),
		authenticator: e.authenticator,
		claims: i,
		issuer: t,
		principalId: `${t}:${r}`,
		principalType: e.principalType,
		subject: r
	};
}
function readFirstStringClaim(e, t) {
	for (let n of t) {
		let t = e[n];
		if (typeof t == `string` && t.length > 0) return t;
	}
}
function matchesWildcardPattern(e, t) {
	if (!e.includes(`*`)) return e === t;
	let n = e.replaceAll(/[.+?^${}()|[\]\\]/g, `\\$&`).replaceAll(`*`, `.*`);
	return RegExp(`^${n}$`).test(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/auth/oidc.js
const oidcDiscoveryDocumentSchema = z.object({
	issuer: z.string().optional(),
	jwks_uri: z.string().url()
}).passthrough();
const oidcDiscoveryDocumentCache = /* @__PURE__ */ new Map();
const oidcJwksCache = /* @__PURE__ */ new Map();
async function authenticateOidcStrategy(e) {
	if (unverifiedIssuer(e.token) !== e.strategy.issuer) return { kind: `not-authenticated` };
	let t;
	try {
		t = await getOidcRemoteJwks(e.strategy);
	} catch (e) {
		return {
			kind: `misconfigured`,
			message: `Failed to load OIDC discovery metadata. ${e instanceof Error ? e.message : `Unknown discovery failure.`}`
		};
	}
	try {
		let n = await jwtVerify(e.token, t, {
			audience: [...e.strategy.audiences],
			clockTolerance: e.strategy.clockSkewSeconds,
			issuer: e.strategy.issuer
		});
		if (e.strategy.acceptCurrentVercelProject && isVercelOidcIssuer(e.strategy.issuer) && n.payload.external_sub !== void 0) return typeof n.payload.external_sub != `string` || n.payload.external_sub.length === 0 || !currentVercelProjectMatches({
			payload: n.payload,
			strategy: e.strategy
		}) || !currentVercelEnvironmentMatches({
			payload: n.payload,
			strategy: e.strategy
		}) ? { kind: `caller-not-allowed` } : {
			kind: `authenticated`,
			principal: createJwtAuthenticatedCallerPrincipal({
				authenticator: `oidc`,
				issuerClaims: [`external_iss`, `connector_id`],
				payload: n.payload,
				principalType: `user`,
				subjectClaim: `external_sub`
			})
		};
		if (e.strategy.acceptCurrentVercelProject && isVercelOidcIssuer(e.strategy.issuer) && n.payload.user_id !== void 0) {
			if (typeof n.payload.user_id != `string` || n.payload.user_id.length === 0 || n.payload.environment !== `development` || !currentVercelProjectMatches({
				payload: n.payload,
				strategy: e.strategy
			})) return { kind: `caller-not-allowed` };
			if (currentVercelEnvironmentMatches({
				payload: n.payload,
				strategy: e.strategy
			})) return {
				kind: `authenticated`,
				principal: createJwtAuthenticatedCallerPrincipal({
					authenticator: `oidc`,
					payload: n.payload,
					principalType: `user`,
					subjectClaim: `user_id`
				})
			};
		}
		if (typeof n.payload.sub != `string` || n.payload.sub.length === 0) return { kind: `not-authenticated` };
		let r = e.strategy.acceptCurrentVercelProject && isCurrentVercelProjectToken({
			issuer: e.strategy.issuer,
			payload: n.payload,
			strategy: e.strategy
		});
		let i = r && isCurrentVercelEnvironmentToken({
			payload: n.payload,
			strategy: e.strategy
		});
		return !r && !areTokenClaimMatchersSatisfied(n.payload, e.strategy) ? { kind: `caller-not-allowed` } : {
			kind: `authenticated`,
			principal: createJwtAuthenticatedCallerPrincipal({
				authenticator: `oidc`,
				payload: n.payload,
				principalType: i ? `runtime` : `service`
			})
		};
	} catch {
		return { kind: `not-authenticated` };
	}
}
function unverifiedIssuer(e) {
	try {
		return decodeJwt(e).iss;
	} catch {
		return;
	}
}
async function getOidcRemoteJwks(e) {
	let t = await getOidcDiscoveryDocument(e.discoveryUrl);
	let n = oidcJwksCache.get(t.jwks_uri);
	if (n !== void 0) return n;
	let r = createRemoteJWKSet(new URL(t.jwks_uri));
	return oidcJwksCache.set(t.jwks_uri, r), r;
}
async function getOidcDiscoveryDocument(e) {
	let t = oidcDiscoveryDocumentCache.get(e);
	if (t !== void 0) return await t;
	let n = fetch(e, { headers: { accept: `application/json` } }).then(async (e) => {
		if (!e.ok) throw Error(`Discovery route returned HTTP ${e.status}.`);
		return oidcDiscoveryDocumentSchema.parse(await e.json());
	}).catch((t) => {
		throw oidcDiscoveryDocumentCache.delete(e), t;
	});
	return oidcDiscoveryDocumentCache.set(e, n), await n;
}
function isCurrentVercelProjectToken(e) {
	if (!isVercelOidcIssuer(e.issuer)) return !1;
	let t = e.strategy.currentVercelProject;
	return t !== void 0 && typeof e.payload.project_id == `string` && e.payload.project_id === t.projectId;
}
function currentVercelProjectMatches(e) {
	let t = e.strategy.currentVercelProject;
	return t !== void 0 && typeof e.payload.project_id == `string` && e.payload.project_id === t.projectId;
}
function isCurrentVercelEnvironmentToken(e) {
	let t = e.strategy.currentVercelProject?.environment;
	return t === void 0 || t.length === 0 ? !1 : typeof e.payload.environment == `string` && e.payload.environment === t;
}
function currentVercelEnvironmentMatches(e) {
	let t = e.strategy.currentVercelProject?.environment;
	return t === void 0 || t.length === 0 ? !1 : typeof e.payload.environment == `string` && e.payload.environment === t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/auth/vercel-oidc-project.js
const VERCEL_OIDC_PROJECT_RESOLVERS = Symbol.for(`eve.vercel-oidc-project-resolvers`);
const globalResolverRegistry = globalThis;
globalResolverRegistry[VERCEL_OIDC_PROJECT_RESOLVERS] === void 0 && (globalResolverRegistry[VERCEL_OIDC_PROJECT_RESOLVERS] = /* @__PURE__ */ new WeakMap());
const projectResolvers = globalResolverRegistry[VERCEL_OIDC_PROJECT_RESOLVERS];
async function resolveVercelOidcCurrentProject(e) {
	let t = projectResolvers.get(e);
	return t === void 0 ? void 0 : await t();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/auth/types.js
function createRuntimeSessionAuthContext(e) {
	return {
		attributes: e.attributes,
		authenticator: e.authenticator,
		issuer: e.issuer,
		principalId: e.principalId,
		principalType: e.principalType,
		subject: e.subject
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/auth/definitions.js
const vercelOidcLog = createLogger(`auth.vercel-oidc`);
async function runOidcVerification(e, t) {
	if (e === null || e.length === 0) return { kind: `not-authenticated` };
	let n = {
		acceptCurrentVercelProject: t.acceptCurrentVercelProject,
		audiences: [...t.audiences],
		clockSkewSeconds: t.clockSkewSeconds ?? 30,
		discoveryUrl: t.discoveryUrl ?? `${t.issuer.replace(/\/$/, ``)}/.well-known/openid-configuration`,
		issuer: t.issuer,
		kind: `oidc`,
		claims: t.claims,
		subjects: t.subjects
	};
	return await authenticateOidcStrategy({
		strategy: t.currentVercelProject === void 0 ? n : {
			...n,
			currentVercelProject: t.currentVercelProject
		},
		token: e
	});
}
function extractBearerToken(e) {
	if (e === null) return null;
	let t = /^Bearer\s+(.+)$/i.exec(e)?.[1]?.trim();
	return t === void 0 || t.length === 0 ? null : t;
}
function createUnauthorizedResponse(e = {}) {
	let t = e.status ?? 401;
	let n = e.code ?? (t === 403 ? `forbidden` : `unauthorized`);
	let r = e.message ?? (t === 403 ? `Forbidden.` : `Authorization is required for this route.`);
	let i = e.challenges ?? [];
	let a = new Headers({ "cache-control": `no-store` });
	for (let e of i) a.append(`www-authenticate`, formatChallenge(e));
	return Response.json({
		code: n,
		error: r,
		ok: !1
	}, {
		headers: a,
		status: t
	});
}
function formatChallenge(e) {
	if (e.parameters === void 0 || Object.keys(e.parameters).length === 0) return e.scheme;
	let t = Object.entries(e.parameters).map(([e, t]) => `${e}="${escapeAuthChallengeParameter(t)}"`).join(`, `);
	return `${e.scheme} ${t}`;
}
function escapeAuthChallengeParameter(e) {
	return e.replaceAll(`\\`, `\\\\`).replaceAll(`"`, `\\"`);
}
var UnauthenticatedError = class extends Error {
	response;
	constructor(e = {}) {
		super(e.message ?? `Authorization is required for this route.`), this.name = `UnauthenticatedError`, this.response = createUnauthorizedResponse({
			...e,
			status: 401
		});
	}
};
const AUTH_CHALLENGES_SYMBOL = Symbol.for(`eve.channels.auth.challenges`);
function withAuthChallenges(e, t) {
	let wrapped = (t) => e(t);
	return Object.defineProperty(wrapped, AUTH_CHALLENGES_SYMBOL, { value: t }), wrapped;
}
function getDeclaredChallenges(e) {
	return e[AUTH_CHALLENGES_SYMBOL];
}
function collectDeclaredChallenges(e) {
	let t = /* @__PURE__ */ new Set();
	let n = [];
	for (let r of e) for (let e of getDeclaredChallenges(r) ?? []) {
		let r = formatChallenge(e);
		t.has(r) || (t.add(r), n.push(e));
	}
	return n;
}
async function routeAuth(e, t) {
	let n = Array.isArray(t) ? t : [t];
	try {
		for (let t of n) {
			let n = await t(e);
			if (n) return n;
		}
	} catch (e) {
		if (typeof e == `object` && e && `response` in e && e.response instanceof Response) return e.response;
		throw e;
	}
	let r = collectDeclaredChallenges(n);
	return createUnauthorizedResponse({ challenges: r.length > 0 ? addInvalidBearerTokenError(e, r) : [{ scheme: `Bearer` }] });
}
function addInvalidBearerTokenError(e, t) {
	let n = e.headers.get(`authorization`);
	return n === null || !/^Bearer(?:\s|$)/i.test(n.trim()) || !t.some((e) => e.scheme === `Bearer`) ? t : t.map((e) => e.scheme !== `Bearer` || e.parameters?.error !== void 0 ? e : {
		...e,
		parameters: {
			...e.parameters,
			error: `invalid_token`
		}
	});
}
function placeholderAuth() {
	return () => {
		if (process.env.VERCEL_ENV !== `production`) return null;
		throw new UnauthenticatedError({
			code: `eve_production_auth_not_configured`,
			message: `Production auth is not configured. Replace placeholderAuth() in agent/channels/eve.ts with your app's auth provider.`
		});
	};
}
const LOCAL_DEV_AUTH_SYMBOL = Symbol.for(`eve.channels.auth.localDev`);
function localDev() {
	let authenticate = (e) => isLocalDevelopmentServer() && !isCrossSiteBrowserRequest(e) && !isFromRemotePeer(e) ? LOCAL_DEV_SESSION_AUTH_CONTEXT : null;
	return Object.defineProperty(authenticate, LOCAL_DEV_AUTH_SYMBOL, { value: !0 }), authenticate;
}
function isLocalDevAuth(e) {
	return e[LOCAL_DEV_AUTH_SYMBOL] === !0;
}
function isCrossSiteBrowserRequest(e) {
	if (!isLocalMachineAddress(new URL(e.url).hostname)) return !0;
	let t = e.headers.get(`origin`);
	if (t === null) return !1;
	let n = URL.parse(t)?.hostname;
	return n === void 0 || !isLocalMachineAddress(n);
}
function isFromRemotePeer(e) {
	return readTrustedDevelopmentPeer(e.headers) === `remote`;
}
const LOCAL_DEV_SESSION_AUTH_CONTEXT = {
	attributes: {},
	authenticator: `local-dev`,
	principalId: `local-dev`,
	principalType: `local-dev`
};
async function verifyVercelOidc(e, t = {}) {
	if (e === null || e.length === 0) return { ok: !1 };
	let n = decodeUnverifiedJwtClaims(e);
	if (n === null) return vercelOidcLog.debug(`Rejected token that failed to decode as a JWT.`), { ok: !1 };
	if (!isVercelOidcIssuer(n.issuer)) return vercelOidcLog.debug(`Rejected token whose issuer is not a Vercel OIDC issuer.`, { issuer: n.issuer }), { ok: !1 };
	if (n.audiences.length === 0) return vercelOidcLog.debug(`Rejected token with no audience claim.`, { issuer: n.issuer }), { ok: !1 };
	if (!n.audiences.some((e) => e.startsWith(`https://vercel.com/`))) return vercelOidcLog.debug(`Rejected token whose audience is not a Vercel audience.`, {
		audiences: n.audiences,
		issuer: n.issuer
	}), { ok: !1 };
	let r = resolveCurrentVercelProject(t);
	let i = await runOidcVerification(e, {
		acceptCurrentVercelProject: !0,
		audiences: n.audiences,
		currentVercelProject: r,
		issuer: n.issuer,
		subjects: t.subjects ?? []
	});
	return i.kind === `authenticated` ? (vercelOidcLog.debug(`Accepted Vercel OIDC token.`, {
		issuer: n.issuer,
		principalType: i.principal.principalType,
		subject: i.principal.subject
	}), {
		ok: !0,
		sessionAuth: createRuntimeSessionAuthContext(i.principal)
	}) : (vercelOidcLog.debug(`Rejected Vercel OIDC token after verification.`, {
		audiences: n.audiences,
		issuer: n.issuer,
		reason: i.kind,
		subjectsConfigured: (t.subjects ?? []).length > 0,
		detail: i.kind === `misconfigured` ? i.message : void 0
	}), { ok: !1 });
}
function resolveCurrentVercelProject(e) {
	if (e.currentVercelProject !== void 0) return e.currentVercelProject;
	let t = process.env.VERCEL_PROJECT_ID?.trim();
	if (t === void 0 || t.length === 0) return;
	let n = process.env.VERCEL_TARGET_ENV?.trim() || process.env.VERCEL_ENV?.trim();
	return n === void 0 || n.length === 0 ? { projectId: t } : {
		environment: n,
		projectId: t
	};
}
function vercelOidc(e = {}) {
	if (e.subjects?.some((e) => typeof e != `string`)) throw TypeError(`vercelOidc: every subjects entry must be a string. For entries such as { subject, allowToolStubs: true }, use eveVercelOidc from "eve/channels/eve".`);
	return withAuthChallenges(async (t) => {
		let n = extractBearerToken(t.headers.get(`authorization`));
		let r = e.currentVercelProject ?? (n !== null && isLocalDevelopmentVercelOidc() ? await resolveVercelOidcCurrentProject(t) : void 0);
		let i = await verifyVercelOidc(n, r === void 0 ? e : {
			...e,
			currentVercelProject: r
		});
		return i.ok ? i.sessionAuth : null;
	}, [{ scheme: `Bearer` }]);
}
function isLocalDevelopmentVercelOidc() {
	return process.env.VERCEL_ENV === `development` ? !0 : process.env.VERCEL_ENV === `preview` || process.env.VERCEL_ENV === `production` ? !1 : isEveDevEnvironment();
}
function decodeUnverifiedJwtClaims(e) {
	let t;
	try {
		t = decodeJwt(e);
	} catch {
		return null;
	}
	return typeof t.iss != `string` || t.iss.length === 0 ? null : {
		audiences: typeof t.aud == `string` ? [t.aud] : Array.isArray(t.aud) ? t.aud.filter((e) => typeof e == `string`) : [],
		issuer: t.iss
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/types.js
function defaultEveAuth(e) {
	return e.eve.caller;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/support.js
const log$1 = createLogger(`eve.channel`);
function healthResponse() {
	return Response.json({
		ok: !0,
		status: `ready`,
		workflowId: workflowEntryReference.workflowId
	});
}
function sessionCommandErrorResponse(e) {
	if (SessionNotActiveError.is(e)) return Response.json({
		ok: !1,
		code: e.code,
		error: e.retryable ? `The session is not ready to accept messages yet.` : `The session is no longer active.`
	}, {
		headers: { "cache-control": `no-store` },
		status: 409
	});
	if (!SessionStrandedError.is(e)) return;
	let t = {
		code: `session_stranded`,
		error: `This session is no longer available.`,
		ok: !1
	};
	return e.owner.eveVersion !== void 0 && (t.eveVersion = e.owner.eveVersion), Response.json(t, {
		headers: { "cache-control": `no-store` },
		status: 409
	});
}
function deliveryResponse(e) {
	return Response.json({
		ok: !0,
		sessionId: e.sessionId,
		deliveryId: e.deliveryId,
		inbox: e.inbox
	}, {
		headers: {
			"cache-control": `no-store`,
			["x-eve-session-id"]: e.sessionId
		},
		status: 202
	});
}
async function findRemoteAgentBinding(e) {
	let t = await e.parent.getChildBinding?.(e.childSessionId);
	if (t === void 0 || t.callId !== e.callId || t.streamPath !== e.childStreamPath) return;
	let n = {
		name: t.name,
		url: t.url
	};
	return t.resolverId !== void 0 && (n.resolverId = t.resolverId), t.dynamicBinding !== void 0 && (n.dynamicBinding = t.dynamicBinding), t.earlierProtocol !== void 0 && (n.earlierProtocol = t.earlierProtocol), n;
}
async function resolveOnMessage(e) {
	let t = e.config.onMessage ?? defaultOnMessage;
	let n;
	try {
		let r = {
			caller: e.auth,
			clientContext: e.clientContext,
			request: e.request,
			...e.turnPolicy !== void 0 && { turnPolicy: e.turnPolicy }
		};
		if (n = await t({ eve: e.sessionId === void 0 ? e.invocation === void 0 ? r : {
			...r,
			invocation: e.invocation
		} : {
			...r,
			sessionId: e.sessionId
		} }, e.message), n == null) throw TypeError(`eveChannel onMessage must return an auth result.`);
	} catch (t) {
		let n = logError(log$1, `onMessage handler failed`, t, { sessionId: e.sessionId });
		return Response.json({
			error: `onMessage handler failed.`,
			errorId: n,
			ok: !1
		}, { status: 500 });
	}
	return {
		auth: n.auth,
		clientContext: resolveTurnClientContext(n.clientContext, e.clientContext),
		context: n.context,
		history: n.history,
		title: n.title,
		turnPolicy: n.turnPolicy
	};
}
function resolveTurnClientContext(e, t) {
	let n = e === void 0 ? toContextEntries(t).map((e) => `Client context:
${e}`) : toContextEntries(e);
	return n.length === 0 ? void 0 : n;
}
function toContextEntries(e) {
	return e === void 0 || e === `` ? [] : typeof e == `string` ? [e] : Array.isArray(e) ? e : [JSON.stringify(e)];
}
function defaultOnMessage(e) {
	return { auth: defaultEveAuth(e) };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/turn-policy-request.js
function parseTurnPolicyField(e) {
	if (e !== void 0) return e === `queue` || e === `steer` ? e : Response.json({
		error: `Expected 'turnPolicy' to be either 'queue' or 'steer'.`,
		ok: !1
	}, { status: 400 });
}
function turnPolicyForRequest(e, t) {
	return e !== `steer` || t === void 0 ? e : storedTurnPolicy(t).turnPolicy === `steer` ? t : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/rules.js
const ruleSchema = z.strictObject({
	id: z.string().min(1),
	tool: z.string().min(1),
	match: z.record(z.string(), z.union([z.boolean(), z.record(z.string(), z.json())])).optional()
});
const outcomeSchema = z.union([z.strictObject({ response: z.json() }), z.strictObject({ throw: z.strictObject({
	message: z.string(),
	name: z.string().min(1).optional()
}) })]);
const toolStubsSchema = z.array(z.union([ruleSchema.extend({ outcome: outcomeSchema }), ruleSchema.extend({ outcomes: z.tuple([outcomeSchema]).rest(outcomeSchema) })])).max(100);
function parseToolStubs(e) {
	boundStubConfiguration(e);
	let t = toolStubsSchema.parse(parseJsonValue(e));
	let n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id)) throw Error(`Duplicate tool stub id "${e.id}".`);
		if (n.add(e.id), [
			"eve__search",
			"eve__tool",
			"eve__skill"
		].includes(e.tool.split(`/`).at(-1))) throw Error(`Cannot stub eve__search, eve__tool, or eve__skill. Stub the tool an eve__tool call reaches, such as linear__list_issues.`);
		for (let [t, n] of Object.entries(e.match ?? {})) {
			validateStubConstraint(n, e.id, t);
			try {
				createStubValidator(n);
			} catch (n) {
				throw Error(`Could not create matcher "${t}" in tool stub "${e.id}".`, { cause: n });
			}
		}
	}
	return t;
}
function boundStubConfiguration(e) {
	let t = [{
		value: e,
		depth: 0
	}];
	let n = 0;
	let r = 0;
	for (; t.length > 0;) {
		let e = t.pop();
		if (++n > 2e4 || e.depth > 32) throw Error(`Tool stubs exceed the size or nesting limit.`);
		if (typeof e.value == `string` && (r += e.value.length), e.value !== null && typeof e.value == `object`) for (let [n, i] of Object.entries(e.value)) {
			if (n === `__proto__`) throw Error(`Tool stubs cannot contain prototype keys.`);
			r += n.length, t.push({
				value: i,
				depth: e.depth + 1
			});
		}
		if (r > 1e6) throw Error(`Tool stubs exceed the size or nesting limit.`);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/create-request.js
function validateMessageFreeCreate(e) {
	if (e.hasMessageField && e.message === void 0) return Response.json({
		error: `Expected 'message' to be non-empty when provided.`,
		ok: !1
	}, { status: 400 });
	if (e.message === void 0 && (e.hasClientContext || e.callback !== void 0 || e.outputSchema !== void 0)) return Response.json({
		error: `Creating a session without a message does not accept 'clientContext', 'callback', or 'outputSchema'.`,
		ok: !1
	}, { status: 400 });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/request.js
function rejectUnknownFields(e, t) {
	let n = [];
	for (let r in e) if (Object.hasOwn(e, r) && !t.includes(r) && (n.push(r.length > 128 ? `${r.slice(0, 128)}…` : r), n.length === 9)) break;
	if (n.length === 0) return;
	let r = n.slice(0, 8).sort().map((e) => `'${JSON.stringify(e).slice(1, -1).replaceAll(`'`, `\\'`)}'`);
	let i = n.length > 8 ? ` (additional unknown fields omitted)` : ``;
	return Response.json({
		ok: !1,
		error: `Unknown field${n.length === 1 ? `` : `s`} ${r.join(`, `)}${i}. Accepted fields: ${t.length === 0 ? `(none)` : t.join(`, `)}.`
	}, { status: 400 });
}
async function deriveOperationContinuationToken(e) {
	let t = JSON.stringify([
		`eve:create-session:v1`,
		e.auth.authenticator,
		e.auth.issuer ?? null,
		e.auth.principalType,
		e.auth.principalId,
		e.operationId
	]);
	let n = await crypto.subtle.digest(`SHA-256`, new TextEncoder().encode(t));
	return `eve:op:${Array.from(new Uint8Array(n), (e) => e.toString(16).padStart(2, `0`)).join(``).slice(0, 32)}`;
}
function parseCreateBody(e) {
	let t = e.callback === void 0 ? void 0 : parseProtocolVersionField(e.protocolVersion);
	if (t instanceof Response) return t;
	let n = [
		`message`,
		`clientContext`,
		`outputSchema`,
		`operationId`,
		`callback`,
		`protocolVersion`,
		`capabilities`,
		`stubs`,
		`forwardedPrincipal`
	];
	e.callback !== void 0 && n.push(`activityObserver`);
	let r = rejectUnknownFields(e, n);
	if (r !== void 0) return r;
	let i = e;
	let a = parseMessageField(i.message);
	if (a instanceof Response) return a;
	let o = parseClientContextField(i.clientContext);
	if (o instanceof Response) return o;
	let s = parseCallbackField(i.callback);
	if (s instanceof Response) return s;
	let c = parseCapabilitiesField(i.capabilities);
	if (c instanceof Response) return c;
	let l = parseOutputSchemaField(i.outputSchema);
	if (l instanceof Response) return l;
	let u = validateMessageFreeCreate({
		callback: s,
		hasClientContext: i.clientContext !== void 0,
		hasMessageField: `message` in i,
		message: a,
		outputSchema: l
	});
	if (u !== void 0) return u;
	let d = i.operationId;
	if (d !== void 0 && (typeof d != `string` || !d)) return Response.json({
		error: `Expected 'operationId' to be a non-empty string.`,
		ok: !1
	}, { status: 400 });
	let f = {
		callback: s,
		capabilities: c,
		context: o,
		outputSchema: l
	};
	if (i.stubs !== void 0) try {
		f.stubs = parseToolStubs(i.stubs);
	} catch (e) {
		return Response.json({
			ok: !1,
			error: e instanceof Error ? e.message : `Invalid tool stubs.`
		}, { status: 400 });
	}
	return a !== void 0 && (f.message = a), typeof d == `string` && (f.operationId = d), t !== void 0 && (f.protocolVersion = t), f;
}
function parseSessionMessageBody(e) {
	let t = [
		`inbox`,
		`message`,
		`answers`,
		`clientContext`,
		`outputSchema`,
		`turnPolicy`,
		`callback`,
		`forwardedPrincipal`,
		`idempotencyKey`
	];
	e.callback !== void 0 && t.push(`activityObserver`);
	let n = rejectUnknownFields(e, t);
	if (n !== void 0) return n;
	let r = e;
	let i = parseIdempotencyKeyField(r.idempotencyKey);
	if (i instanceof Response) return i;
	let a = parseMessageField(r.message);
	if (a instanceof Response) return a;
	let o = parseCallbackField(r.callback);
	if (o instanceof Response) return o;
	let s = parseAnswers(r.answers);
	if (s instanceof Response) return s;
	let c = parseClientContextField(r.clientContext);
	if (c instanceof Response) return c;
	let l = parseOutputSchemaField(r.outputSchema);
	if (l instanceof Response) return l;
	let u = parseTurnPolicyField(r.turnPolicy);
	return u instanceof Response ? u : a === void 0 && s === void 0 ? Response.json({
		error: `Expected a non-empty 'message' or a non-empty 'answers' array.`,
		ok: !1
	}, { status: 400 }) : a !== void 0 && s !== void 0 ? Response.json({
		error: `'message' and 'answers' are mutually exclusive.`,
		ok: !1
	}, { status: 400 }) : {
		inbox: typeof r.inbox == `string` ? r.inbox : void 0,
		callback: o,
		message: a,
		answers: s,
		context: c,
		outputSchema: l,
		turnPolicy: u,
		...i !== void 0 && { idempotencyKey: i }
	};
}
function parseIdempotencyKeyField(e) {
	if (e !== void 0) return typeof e != `string` || e.length === 0 || e.length > 256 ? Response.json({
		error: `Expected 'idempotencyKey' to be a nonempty string of at most ${String(256)} characters.`,
		ok: !1
	}, { status: 400 }) : e;
}
async function parseCancelTurnBody(e) {
	let t = await parseOptionalJsonRequest(e);
	if (t instanceof Response) return t;
	let n = rejectUnknownFields(t, [`turnId`]);
	if (n !== void 0) return n;
	let r = t.turnId;
	return r != null && (typeof r != `string` || r.length === 0) ? Response.json({
		error: `Expected 'turnId' to be a non-empty string or null.`,
		ok: !1
	}, { status: 400 }) : r === null || typeof r == `string` ? { turnId: r } : {};
}
async function parseResetBody(e) {
	let t = await parseOptionalJsonRequest(e);
	if (t instanceof Response) return t;
	let n = rejectUnknownFields(t, [`reason`]);
	if (n !== void 0) return n;
	let r = t.reason;
	return r !== void 0 && (typeof r != `string` || r.length === 0) ? Response.json({
		error: `Expected 'reason' to be a non-empty string.`,
		ok: !1
	}, { status: 400 }) : r === void 0 ? {} : { reason: r };
}
async function parseSessionControlBody(e) {
	let t = await parseOptionalJsonRequest(e);
	return t instanceof Response ? t : rejectUnknownFields(t, []) ?? t;
}
async function parseOptionalJsonRequest(e) {
	let t;
	try {
		t = await e.text();
	} catch {
		return Response.json({
			error: `Unreadable request body.`,
			ok: !1
		}, { status: 400 });
	}
	if (t.trim().length === 0) return {};
	let n;
	try {
		n = JSON.parse(t);
	} catch {
		return Response.json({
			error: `Invalid JSON body.`,
			ok: !1
		}, { status: 400 });
	}
	return typeof n != `object` || !n || Array.isArray(n) ? Response.json({
		error: `Expected a JSON object.`,
		ok: !1
	}, { status: 400 }) : n;
}
function requireSessionId(e) {
	return e.sessionId || Response.json({
		error: `Missing session id.`,
		ok: !1
	}, { status: 400 });
}
async function createSessionStreamResponse(e, t) {
	let n = parseStartIndex(e);
	if (n instanceof Response) return n;
	let r = parseFollow(e);
	let i = !r || parseIncludeTailIndex(e);
	try {
		let a = n === void 0 || n >= 0 ? internalSession(t).getLineStream({
			follow: r,
			startIndex: n ?? 0
		}) : void 0;
		let o = startedOnEarlierEve(t, r && (n ?? 0) > 0);
		a?.catch(() => {}), o.catch(() => {});
		let s;
		let c;
		try {
			(i || a === void 0) && (s = await internalSession(t).getStreamTailIndex()), c = await o;
		} catch (e) {
			throw a?.then((e) => e.cancel()).catch(() => {}), e;
		}
		let l = a === void 0 ? Math.max(0, (s ?? -1) + 1 + (n ?? 0)) : n ?? 0;
		let u;
		let d = i && s !== void 0 ? Math.max(0, s - l + 1) : void 0;
		if (c) {
			a?.then((e) => e.cancel()).catch(() => {});
			let e = r && await internalSession(t).hasRunnableOwner();
			r && !e && (d = void 0), u = v26LineStream(await internalSession(t).getLineStream({
				follow: e,
				startIndex: 0
			}), l);
		} else u = await (a ?? internalSession(t).getLineStream({
			follow: r,
			startIndex: l
		}));
		let f = new Headers({
			"cache-control": `no-store, no-transform`,
			"content-type": "application/x-ndjson; charset=utf-8",
			"x-accel-buffering": `no`,
			["x-eve-session-id"]: t.id,
			["x-eve-stream-format"]: "ndjson",
			["x-eve-stream-version"]: "27"
		});
		return i && s !== void 0 && f.set("x-eve-stream-tail-index", String(s)), new Response(serializeLines(u, e.signal, d), { headers: f });
	} catch (e) {
		let t = sessionCommandErrorResponse(e);
		if (t !== void 0) return t;
		if (isRunExpired(e)) return Response.json({
			code: `session_expired`,
			error: `Session history is no longer available.`,
			ok: !1
		}, {
			headers: { "cache-control": `no-store` },
			status: 410
		});
		let n = isRunMissing(e);
		return Response.json({
			error: n ? `Session not found.` : `Session stream unavailable.`,
			ok: !1
		}, { status: n ? 404 : 503 });
	}
}
const currentSessions = /* @__PURE__ */ new Set();
function rememberCurrentSession(e) {
	if (!currentSessions.has(e)) {
		if (currentSessions.size >= 1e4) {
			let e = currentSessions.values().next();
			e.done !== !0 && currentSessions.delete(e.value);
		}
		currentSessions.add(e);
	}
}
async function startedOnEarlierEve(e, t) {
	if (currentSessions.has(e.id)) return !1;
	let n;
	let r;
	let i = !1;
	let a = (async () => {
		let open = (t) => internalSession(e).getLineStream({
			follow: t,
			startIndex: 0
		});
		if (r = (await (t ? open(!0).catch((e) => {
			if (i || isRunMissing(e) || isRunExpired(e)) throw e;
			return open(!1);
		}) : open(!1))).getReader(), i) return r.cancel().catch(() => {}), !1;
		let { done: n, value: a } = await r.read();
		return n ? !1 : isV26Line(a) ? !0 : (rememberCurrentSession(e.id), !1);
	})();
	a.catch(() => {});
	let o = new Promise((e, t) => {
		n = setTimeout(() => t(Error(`Timed out reading the session's first line.`)), 5e3);
	});
	try {
		return await Promise.race([a, o]);
	} finally {
		i = !0, clearTimeout(n), r?.cancel().catch(() => {});
	}
}
function parseOutputSchemaField(e) {
	if (e !== void 0) try {
		return parseJsonObject(e);
	} catch {
		return Response.json({
			error: `Expected 'outputSchema' to be a JSON-serializable object.`,
			ok: !1
		}, { status: 400 });
	}
}
function parseCallbackField(e) {
	if (e === void 0) return;
	let t = parseSessionCallback(e);
	return t.ok ? t.callback : Response.json({
		error: t.message,
		ok: !1
	}, { status: 400 });
}
function parseProtocolVersionField(e) {
	if (e !== void 0 && typeof e != `number`) return Response.json({
		error: `Expected 'protocolVersion' to be a number.`,
		ok: !1
	}, { status: 400 });
	let t = readRemoteAgentProtocolVersion(e);
	return servesRemoteAgentCaller(t) ? t : Response.json({
		code: "REMOTE_AGENT_PROTOCOL_MISMATCH",
		error: `This deployment speaks eve remote agent protocol ${String(3)}, but the caller speaks protocol ${String(t)}. Upgrade both deployments to the same eve release.`,
		ok: !1,
		protocolVersion: 3
	}, { status: 409 });
}
function parseCapabilitiesField(e) {
	if (e === void 0) return;
	if (typeof e != `object` || !e || Array.isArray(e)) return Response.json({
		error: `Expected 'capabilities' to be an object.`,
		ok: !1
	}, { status: 400 });
	let t = Object.keys(e);
	let n = Reflect.get(e, `requestInput`);
	return t.some((e) => e !== `requestInput`) || n !== void 0 && typeof n != `boolean` ? Response.json({
		error: `Expected 'capabilities.requestInput' to be a boolean when provided.`,
		ok: !1
	}, { status: 400 }) : n === void 0 ? {} : { requestInput: n };
}
function parseMessageField(e) {
	if (e === void 0) return;
	if (typeof e == `string`) return e.length > 0 ? e : void 0;
	if (!Array.isArray(e)) return Response.json({
		error: `Expected 'message' to be a string or an array of text/file parts.`,
		ok: !1
	}, { status: 400 });
	if (e.length === 0) return;
	if (e.length > 64) return Response.json({
		ok: !1,
		error: `Expected at most 64 message parts. Combine text or reduce attachments.`
	}, { status: 400 });
	let t = [];
	for (let n of e) {
		let e = parseMessagePart(n);
		if (e instanceof Response) return e;
		t.push(e);
	}
	return t;
}
function parseMessagePart(e) {
	if (typeof e != `object` || !e) return Response.json({
		error: `Expected each message part to be an object.`,
		ok: !1
	}, { status: 400 });
	let t = e;
	if (t.type === `text`) return typeof t.text != `string` || t.text.length === 0 ? Response.json({
		error: `Text parts require a non-empty 'text' string.`,
		ok: !1
	}, { status: 400 }) : {
		type: `text`,
		text: t.text
	};
	if (t.type === `file`) {
		if (typeof t.mediaType != `string` || t.mediaType.length === 0) return Response.json({
			error: `File parts require a non-empty 'mediaType' string.`,
			ok: !1
		}, { status: 400 });
		if (typeof t.data != `string`) return Response.json({
			error: `File parts require a 'data' string (base64, data URL, or URL).`,
			ok: !1
		}, { status: 400 });
		if (hasInternalRefScheme(t.data)) return Response.json({
			error: `File part 'data' must not use a framework-internal ref scheme.`,
			ok: !1
		}, { status: 400 });
		let e = {
			type: `file`,
			mediaType: t.mediaType,
			data: t.data
		};
		return typeof t.filename == `string` && t.filename.length > 0 ? {
			...e,
			filename: t.filename
		} : e;
	}
	return Response.json({
		error: `Unsupported message part type "${String(t.type)}". Use 'text' or 'file'.`,
		ok: !1
	}, { status: 400 });
}
function checkUploadPolicy(e, t) {
	if (!e.message) return null;
	let n = collectUploadPolicyViolations(e.message, t);
	if (n.length === 0) return null;
	let [r] = n;
	if (!r) return null;
	let i = r.kind === `too-large` ? 413 : 415;
	return Response.json({
		error: formatUploadPolicyViolation(r),
		ok: !1,
		violations: n.map((e) => e.kind === `too-large` ? {
			byteLength: e.byteLength,
			filename: e.filename,
			kind: e.kind,
			limit: e.limit,
			mediaType: e.mediaType
		} : {
			allowedMediaTypes: e.allowedMediaTypes,
			filename: e.filename,
			kind: e.kind,
			mediaType: e.mediaType
		})
	}, { status: i });
}
function parseAnswers(e) {
	if (e === void 0) return;
	if (!Array.isArray(e) || e.length === 0) return Response.json({
		error: `Expected 'answers' to be a non-empty array.`,
		ok: !1
	}, { status: 400 });
	let t = e.filter(isAnswer);
	return t.length === e.length ? t : Response.json({
		error: `Expected every 'answers' entry to match the HITL response schema.`,
		ok: !1
	}, { status: 400 });
}
function parseClientContextField(e) {
	if (e !== void 0) {
		if (typeof e == `string`) return e.length > 0 ? e : void 0;
		if (Array.isArray(e)) return e.length === 0 ? void 0 : e.every((e) => typeof e == `string` && e.length > 0) ? e : Response.json({
			error: `Expected 'clientContext' array entries to be non-empty strings.`,
			ok: !1
		}, { status: 400 });
		if (typeof e != `object` || !e) return Response.json({
			error: `Expected 'clientContext' to be a string, string array, or JSON object.`,
			ok: !1
		}, { status: 400 });
		try {
			return parseJsonObject(e);
		} catch {
			return Response.json({
				error: `Expected 'clientContext' to be a JSON-serializable object.`,
				ok: !1
			}, { status: 400 });
		}
	}
}
function parseIncludeTailIndex(e) {
	let t = new URL(e.url).searchParams.get(`includeTailIndex`);
	return t === `1` || t === `true`;
}
function parseFollow(e) {
	let t = new URL(e.url).searchParams.get(`follow`);
	return t !== `0` && t !== `false`;
}
function parseStartIndex(e) {
	let t = new URL(e.url).searchParams.get(`startIndex`);
	if (t === null) return;
	let n = Number(t);
	return !/^-?\d+$/.test(t) || !Number.isSafeInteger(n) ? Response.json({
		error: `Expected startIndex to be an integer.`,
		ok: !1
	}, { status: 400 }) : n;
}
function serializeLines(e, t, n) {
	let r = new TextEncoder();
	let record = (e) => r.encode(`${JSON.stringify(e)}\n`);
	let i = 0;
	let a;
	let o;
	let clearTimers = () => {
		clearTimeout(a), clearTimeout(o), a = void 0, o = void 0;
	};
	let scheduleHeartbeat = (e) => {
		clearTimeout(a), a = setTimeout(() => {
			try {
				e.enqueue(record(HEARTBEAT_RECORD)), scheduleHeartbeat(e);
			} catch {
				clearTimers();
			}
		}, 1e4);
	};
	let s = new TransformStream({
		start(e) {
			e.enqueue(record(HEARTBEAT_RECORD)), n === 0 ? e.terminate() : (scheduleHeartbeat(e), o = setTimeout(() => {
				clearTimers();
				try {
					e.enqueue(record(LEASE_ENDED_RECORD)), e.terminate();
				} catch {}
			}, 6e4));
		},
		transform(e, t) {
			t.enqueue(record(e)), i += 1, i === n ? (clearTimers(), t.terminate()) : scheduleHeartbeat(t);
		},
		flush(e) {
			clearTimers(), e.enqueue(record(STREAM_ENDED_RECORD));
		}
	});
	return e.pipeTo(s.writable, { signal: t }).catch(() => {}).finally(clearTimers), s.readable;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/stream-headers.js
function proxyStreamResponse(e) {
	let t = [
		`x-accel-buffering`,
		"x-eve-session-id",
		"x-eve-stream-format",
		"x-eve-stream-tail-index",
		"x-eve-stream-version"
	];
	let n = new Headers([...e.headers].filter(([e]) => t.includes(e)));
	let r = e.ok ? "application/x-ndjson; charset=utf-8" : `application/json`;
	return n.set(`content-type`, r), n.set(`x-content-type-options`, `nosniff`), n.set(`cache-control`, `no-store`), e.headers.get(`content-type`)?.split(`;`)[0]?.trim().toLowerCase() !== r.split(`;`)[0] || !e.ok && e.status < 400 ? (e.body?.cancel().catch(() => {}), n.set(`content-type`, `application/json`), Response.json({
		ok: !1,
		code: `invalid_stream_response`,
		error: `Remote session stream returned an unexpected response type.`
	}, {
		status: e.status >= 400 ? e.status : 502,
		headers: n
	})) : new Response(e.body, {
		headers: n,
		status: e.status,
		statusText: e.statusText
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/descendant-observation.js
function localObservationKey(e) {
	return JSON.stringify([`local`, e]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/wait-with-signal.js
async function waitWithSignal(e, t) {
	if (t === void 0) return await e;
	let n = Promise.withResolvers();
	let onAbort = () => n.reject(t.reason);
	t.addEventListener(`abort`, onAbort, { once: !0 }), t.aborted && onAbort();
	try {
		return await Promise.race([n.promise, e]);
	} finally {
		t.removeEventListener(`abort`, onAbort);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/descendant-stream.js
async function descendantStreamResponse(e) {
	let t = new URL(e.request.url);
	let n = t.searchParams.get(`children`);
	let r;
	try {
		if (n === null || n.length > 4096) throw Error();
		let e = parseDescendantPath(JSON.parse(n));
		if (e === void 0) throw Error();
		r = e;
	} catch {
		return Response.json({
			error: `Invalid descendant path.`,
			ok: !1
		}, { status: 400 });
	}
	let i = new AbortController();
	let a = setTimeout(() => i.abort(new DOMException(`Reader resolution timed out.`, `AbortError`)), 1e4);
	let o = AbortSignal.any([e.request.signal, i.signal]);
	let s = e.root;
	let c = /* @__PURE__ */ new Set([s.id]);
	try {
		for (let [n, i] of r.entries()) {
			let a = i.sessionId;
			let l = await recordedChild(s, i, o);
			if (l === void 0) return unavailable();
			let u = r.slice(n + 1);
			if (l.stream === createEveSessionStreamRoutePath(a)) {
				if (c.has(a)) return unavailable(`cycle`, 422);
				if (c.add(a), s = e.attachSession(a), u.length !== 0) continue;
				let t = await resolvedResponse(createSessionStreamResponse(e.request, s), o);
				return t.headers.set("x-eve-observation-key", localObservationKey(a)), t;
			}
			let d = await waitWithSignal(findRemoteAgentBinding({
				parent: internalSession(s),
				callId: l.callId ?? ``,
				childSessionId: a,
				childStreamPath: l.stream
			}), o);
			if (d === void 0 || d.earlierProtocol !== void 0 || e.resolveHeaders === void 0) return unavailable(`unsupported`, 422);
			let f = await waitWithSignal(e.resolveHeaders(d), o);
			let p = u.length === 0 ? createEveSessionStreamRoutePath(a) : createEveDescendantStreamRoutePath(a);
			let m = new URL(p.replace(/^\/+/, ``), `${d.url.replace(/\/+$/, ``)}/`);
			for (let e of [
				`startIndex`,
				`includeTailIndex`,
				`follow`
			]) {
				let n = t.searchParams.get(e);
				n !== null && m.searchParams.set(e, n);
			}
			u.length !== 0 && m.searchParams.set(`children`, JSON.stringify(u));
			let h = await resolvedResponse(fetch(m, {
				cache: `no-store`,
				headers: f,
				redirect: `manual`,
				signal: o
			}), o);
			if (h.status >= 300 && h.status < 400) return h.body?.cancel().catch(() => {}), unavailable(`unsupported`, 422);
			let g = proxyStreamResponse(h);
			if (g.ok) {
				let e = u.length === 0 ? localObservationKey(a) : h.headers.get("x-eve-observation-key");
				if (e === null || e.length > 8192) return h.body?.cancel().catch(() => {}), unavailable(`unsupported`, 422);
				g.headers.set("x-eve-observation-key", JSON.stringify([
					`remote`,
					s.id,
					a,
					e
				]));
			}
			return g;
		}
	} catch (e) {
		return isRunExpired(e) ? unavailable(`session_expired`, 410) : unavailable();
	} finally {
		clearTimeout(a);
	}
	return unavailable();
}
function parseDescendantPath(e) {
	if (!Array.isArray(e) || e.length === 0 || e.length > 8) return;
	let t = e;
	let n = [];
	for (let e of t) {
		if (!isObject(e) || typeof e.sessionId != `string` || e.sessionId.length === 0 || e.sessionId.length > 256 || typeof e.position != `number` || !Number.isSafeInteger(e.position) || e.position < 0) return;
		n.push({
			sessionId: e.sessionId,
			position: e.position
		});
	}
	return n;
}
async function resolvedResponse(e, t) {
	return e.then((e) => {
		t.aborted && e.body?.cancel().catch(() => {});
	}, () => {}), await waitWithSignal(e, t);
}
function unavailable(e = `descendant_unavailable`, t = 404) {
	return Response.json({
		ok: !1,
		code: e,
		error: `Descendant history is unavailable.`
	}, { status: t });
}
async function recordedChild(e, t, n) {
	n.throwIfAborted();
	let r = (await waitWithSignal(internalSession(e).getLineStream({
		follow: !1,
		startIndex: t.position
	}), n)).getReader();
	try {
		let e = await waitWithSignal(r.read(), n);
		if (e.done) return;
		let i = e.value;
		if (!isStoredLine(i)) {
			let e = v26ChildStarted(i);
			return e?.sessionId === t.sessionId ? e : void 0;
		}
		for (let e of eventsOfLine(i, t.position, ``)) if (e.type === `child.opened` && e.data.sessionId === t.sessionId) return {
			...`callId` in e.data.owner && { callId: e.data.owner.callId },
			stream: e.data.stream
		};
		return;
	} finally {
		r.cancel().catch(() => {});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/authorization.js
async function handleExpiredLegacyAuthorization() {
	return Response.json({
		ok: !1,
		error: `This authorization link predates the session upgrade. Request authorization again.`
	}, { status: 410 });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/authorization-complete-page.js
const PAGES = {
	authorized: {
		title: `Authorization complete`,
		icon: `M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.47-1.47.53-.53L11 4.94l-.53.53L6.5 9.44l-.97-.97L5 7.94 3.94 9l.53.53 1.5 1.5c.3.3.77.3 1.06 0z`
	},
	failed: {
		title: `Authorization not completed`,
		icon: `M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 6.94l2.47-2.47 1.06 1.06L9.06 8l2.47 2.47-1.06 1.06L8 9.06l-2.47 2.47-1.06-1.06L6.94 8 4.47 5.53l1.06-1.06z`
	}
};
function buildAuthorizationCompletePage(e) {
	let t = PAGES[e];
	let n = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${t.title}</title>
    <style>
      :root {
        color-scheme: light dark;
        --background: oklch(0.984 0 0);
        --foreground: oklch(0.205 0 0);
        --secondary: oklch(0.42 0 0);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --background: oklch(0.027 0 0);
          --foreground: oklch(0.946 0 0);
          --secondary: oklch(0.706 0 0);
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Geist Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        background: var(--background);
        color: var(--foreground);
      }
      .screen {
        min-height: 100vh;
        min-height: 100dvh;
        padding: 2rem 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--background);
        color: var(--foreground);
      }
      .content {
        width: 100%;
        max-width: 27.5rem;
      }
      .header {
        padding: 1.5rem 1.5rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .icon {
        width: 2rem;
        height: 2rem;
        margin-top: 1.5rem;
        color: var(--foreground);
      }
      .icon svg {
        display: block;
        width: 100%;
        height: 100%;
      }
      h1 {
        margin: 1.5rem 0 0;
        color: var(--foreground);
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 2rem;
        letter-spacing: -0.06rem;
      }
      p {
        margin: 0;
        padding: 1rem 1.5rem;
        color: var(--secondary);
        font-size: 0.8125rem;
        line-height: 1.125rem;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="screen" aria-labelledby="authorization-title">
      <div class="content">
        <div class="header">
          <h1 id="authorization-title">${t.title}</h1>
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none">
              <path fill="currentColor" fill-rule="evenodd" d="${t.icon}" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div style="height: 0.5rem" aria-hidden="true"></div>
        <p>You can close this tab and return to your app.</p>
      </div>
    </main>
  </body>
</html>`;
	return new Response(n, {
		headers: {
			"cache-control": `no-store`,
			"content-type": `text/html; charset=utf-8`
		},
		status: 200
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/connections/callback-route.js
async function handleConnectionCallbackRequest(e, t) {
	let n = t.params.name;
	let r = t.params.attemptId;
	let i = t.params.token;
	if (typeof n != `string` || n.length === 0) return Response.json({
		error: `Missing connection name.`,
		ok: !1
	}, { status: 400 });
	if (typeof i != `string` || i.length === 0) return Response.json({
		error: `Missing callback token.`,
		ok: !1
	}, { status: 400 });
	if (typeof r != `string` || r.length === 0) return Response.json({
		error: `Missing authorization attempt ID.`,
		ok: !1
	}, { status: 400 });
	if (!isSignInCallbackToken(i)) return callbackNotPending$1();
	let a = await projectAuthorizationCallback(e);
	let o = {
		kind: `authorization-callback`,
		payloads: [{ authorizationCallback: {
			attemptId: r,
			callback: a,
			connectionName: n
		} }]
	};
	try {
		await deliverToHostedHook(i, o) || await resumeRunnableHook(i, o);
	} catch {
		return callbackNotPending$1();
	}
	return buildAuthorizationCompletePage(a.params.error === void 0 ? `authorized` : `failed`);
}
function callbackNotPending$1() {
	return Response.json({
		error: `Connection callback not pending.`,
		ok: !1
	}, { status: 404 });
}
async function projectAuthorizationCallback(e) {
	let t = {};
	for (let [n, r] of new URL(e.url).searchParams) t[n] = r;
	let n;
	if (e.method !== `GET` && e.method !== `HEAD`) {
		try {
			n = await e.text();
		} catch {
			n = void 0;
		}
		let r = e.headers.get(`content-type`) ?? ``;
		if (n && r.includes(`application/x-www-form-urlencoded`)) for (let [e, r] of new URLSearchParams(n)) t[e] = r;
	}
	return n === void 0 ? {
		params: t,
		method: e.method
	} : {
		params: t,
		method: e.method,
		body: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/token-usage.js
const tokenUsageWithCostSchema = z.object({
	cacheReadTokens: z.number().int().nonnegative(),
	cacheWriteTokens: z.number().int().nonnegative(),
	inputTokens: z.number().int().nonnegative(),
	outputTokens: z.number().int().nonnegative()
}).extend({ costUsd: z.number().finite().nonnegative().optional() });
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/agent-turn-outcome.js
const jsonValueSchema = z.lazy(() => z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.array(jsonValueSchema),
	z.record(z.string(), jsonValueSchema)
]));
const agentTurnResultSchema = z.discriminatedUnion(`kind`, [
	z.strictObject({
		kind: z.literal(`succeeded`),
		output: jsonValueSchema
	}),
	z.strictObject({
		error: jsonValueSchema,
		kind: z.literal(`failed`)
	}),
	z.strictObject({ kind: z.literal(`cancelled`) })
]);
const agentTurnOutcomeWithCostSchema = z.discriminatedUnion(`kind`, [z.strictObject({
	kind: z.literal(`parked`),
	result: agentTurnResultSchema,
	usageDelta: tokenUsageWithCostSchema
}), z.strictObject({
	kind: z.literal(`terminal`),
	result: agentTurnResultSchema,
	usageDelta: tokenUsageWithCostSchema
})]);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/callback-route.js
const sessionInteractionCallbackSchema = z.object({
	callId: z.string().min(1),
	childSessionId: z.string().min(1),
	kind: z.literal(`subagent-interaction`),
	subagentName: z.string().min(1),
	route: z.object({
		childContinuationToken: z.string().min(1),
		childSessionInbox: z.object({ sessionId: z.string().min(1) }).strict().optional(),
		inputSource: z.string().min(1).optional(),
		remote: z.object({
			name: z.string().min(1),
			url: z.string().url(),
			forwardPrincipal: z.boolean().optional(),
			sessionId: z.string().min(1),
			resolverId: z.string().min(1).optional()
		}).strict().optional()
	}).optional(),
	events: z.array(z.discriminatedUnion(`type`, [
		interactionSchemas[`interaction.opened`],
		interactionSchemas[`interaction.settled`],
		z.object({
			type: z.literal(`response.admitted`),
			data: z.object({
				deliveryId: z.string().optional(),
				interactionId: z.string()
			})
		}),
		z.object({
			type: z.literal(`response.settled`),
			data: z.object({
				deliveryId: z.string().optional(),
				interactionId: z.string(),
				outcome: known(),
				reason: z.string().optional()
			})
		})
	]))
});
const sessionResultCallbackSchema = z.discriminatedUnion(`kind`, [z.object({
	callId: z.string().min(1),
	kind: z.literal(`turn.completed`),
	outcome: agentTurnOutcomeWithCostSchema,
	output: jsonValueSchema$1.optional(),
	subagentName: z.string().min(1)
}), z.object({
	callId: z.string().min(1),
	error: jsonValueSchema$1,
	kind: z.literal(`turn.failed`),
	outcome: agentTurnOutcomeWithCostSchema,
	subagentName: z.string().min(1)
})]);
async function handleSessionCallbackRequest(e, t) {
	let n = t.params.token;
	if (typeof n != `string` || n.length === 0) return Response.json({
		error: `Missing callback token.`,
		ok: !1
	}, { status: 400 });
	if (!isRemoteReplyHookToken(n)) return callbackNotPending();
	let r;
	try {
		r = await e.json();
	} catch {
		return Response.json({
			error: `Invalid JSON body.`,
			ok: !1
		}, { status: 400 });
	}
	let i = readInteractionCallback(r, readCallbackProtocol(e.url));
	if (i === null) return Response.json({
		error: `Invalid session input callback.`,
		ok: !1
	}, { status: 400 });
	if (isEmptyRelay(i)) return Response.json({ ok: !0 }, { status: 202 });
	let a = i === void 0 ? projectSessionCallbackResult(r) : void 0;
	if (a instanceof Response) return a;
	try {
		await resumeRunnableHook(n, i ?? {
			kind: `runtime-action-result`,
			results: [a]
		});
	} catch {
		return callbackNotPending();
	}
	return Response.json({ ok: !0 }, { status: 202 });
}
function callbackNotPending() {
	return Response.json({
		code: "CALLBACK_NOT_PENDING",
		error: "Session callback not pending.",
		ok: !1
	}, { status: 404 });
}
function readInteractionCallback(e, t) {
	let n = callbackKind(e);
	if (n === `subagent-interaction`) {
		let t = sessionInteractionCallbackSchema.safeParse(e);
		return t.success ? t.data : null;
	}
	if (PROTOCOL_TWO_INPUT_CALLBACK_KINDS.has(n)) {
		if (t === 2) return readProtocolTwoInputCallback(e) ?? null;
		if (t === void 0) return parseProtocolTwoInputCallback(e) ?? null;
	}
}
function isEmptyRelay(e) {
	if (e == null || Reflect.get(e, `kind`) !== `subagent-interaction`) return !1;
	let t = Reflect.get(e, `events`);
	return Array.isArray(t) && t.length === 0;
}
function callbackKind(e) {
	if (typeof e == `object` && e) return Reflect.get(e, `kind`);
}
function projectSessionCallbackResult(e) {
	if (typeof e != `object` || !e) return Response.json({
		error: `Expected a JSON object.`,
		ok: !1
	}, { status: 400 });
	let t = callbackKind(e);
	if (t !== `turn.completed` && t !== `turn.failed`) return Response.json({
		error: `Unsupported callback kind.`,
		ok: !1
	}, { status: 400 });
	let n = sessionResultCallbackSchema.safeParse(e);
	if (!n.success) return Response.json({
		error: `Invalid session result callback.`,
		ok: !1
	}, { status: 400 });
	let r = n.data;
	return r.kind === `turn.completed` ? {
		callId: r.callId,
		kind: `subagent-result`,
		origin: `child`,
		outcome: r.outcome,
		output: r.output ?? ``,
		subagentName: r.subagentName,
		usage: r.outcome.usageDelta
	} : {
		callId: r.callId,
		isError: !0,
		kind: `subagent-result`,
		origin: `child`,
		outcome: r.outcome,
		output: r.error,
		subagentName: r.subagentName
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-webhook-route.js
async function handleWorkflowWebhookRequest(e, t) {
	let n = t.params.token;
	if (typeof n != `string` || n.length === 0) return Response.json({
		error: `Missing webhook token.`,
		ok: !1
	}, { status: 400 });
	try {
		let t = new Request(e.url, {
			method: e.method,
			headers: new Headers(e.headers),
			body: e.body,
			signal: e.signal,
			duplex: `half`
		});
		return await (0, runtime_exports.resumeWebhook)(n, t);
	} catch (e) {
		for (let t of walkCauseChain(e)) if (HookNotFoundError.is(t)) return Response.json({
			error: `Webhook not pending.`,
			ok: !1
		}, { status: 404 });
		throw e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/auth/result.js
const IDENTITY_KEYS = Object.keys({
	attributes: !0,
	authenticator: !0,
	issuer: !0,
	principalId: !0,
	principalType: !0,
	subject: !0
});
function sessionAuthFromResult(e) {
	let t = {};
	for (let n of IDENTITY_KEYS) e[n] !== void 0 && (t[n] = e[n]);
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/audience.js
function defaultEveAudience(e) {
	return e.caller.type === `principal` && (e.caller.principal.kind === `user` || e.caller.principal.kind === `service` || e.caller.principal.kind === `runtime`) ? `private` : `unknown`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/eve-channel/index.js
const log = createLogger(`eve.channel`);
const AGENT_INFO_PRINCIPAL_TYPES = /* @__PURE__ */ new Set([
	`service`,
	`runtime`,
	`local-dev`
]);
const localDevelopmentCaller = localDev();
async function canReadAgentInfo(e, t, n) {
	return t.allowAgentInfo === !0 ? !0 : t.allowAgentInfo === !1 ? !1 : AGENT_INFO_PRINCIPAL_TYPES.has(t.principalType) ? !0 : n && !!await localDevelopmentCaller(e);
}
function createdSessionBody(e, t, n) {
	let r = {
		ok: !0,
		sessionId: e
	};
	return n !== void 0 && (r.deliveryId = n), t.callback !== void 0 && (r.status = `accepted`), t.protocolVersion !== void 0 && (r.protocolVersion = t.protocolVersion), r;
}
function eveChannel(e) {
	let t = mergeUploadPolicy(e.uploadPolicy);
	let n = (Array.isArray(e.auth) ? e.auth : [e.auth]).some(isLocalDevAuth);
	return defineChannel({
		cors: e.cors,
		turnPolicy: e.turnPolicy,
		audience: (t) => {
			let n = e.audience ?? defaultEveAudience;
			return typeof n == `function` ? n(t) : n;
		},
		routes: [
			GET("/eve/v1/health", async () => healthResponse()),
			HEAD("/eve/v1/health", async () => healthResponse()),
			GET("/eve/v1/info", async (t, r) => {
				let i = await routeAuth(t, e.auth);
				if (i instanceof Response) return i;
				if (!await canReadAgentInfo(t, i, n)) return Response.json({
					code: "info_forbidden",
					error: "Agent info is served only to operator credentials (principalType \"service\", \"runtime\", or \"local-dev\"). Authenticate as a service principal, for example with Vercel OIDC, or return allowAgentInfo: true from the eve channel's auth for this caller.",
					ok: !1
				}, { status: 403 });
				let a = readAgentInfoRouteResponse(r);
				return a === void 0 ? Response.json({
					error: `Agent info route requires internal channel dispatch context.`,
					ok: !1
				}, { status: 500 }) : await a();
			}),
			GET(`/eve/v1/connections/:name/callback/:token`, handleExpiredLegacyAuthorization),
			POST(`/eve/v1/connections/:name/callback/:token`, handleExpiredLegacyAuthorization),
			GET("/eve/v1/connections/:name/callback/:attemptId/:token", handleConnectionCallbackRequest),
			POST("/eve/v1/connections/:name/callback/:attemptId/:token", handleConnectionCallbackRequest),
			POST("/eve/v1/callback/:token", handleSessionCallbackRequest),
			GET("/.well-known/workflow/v1/webhook/:token", handleWorkflowWebhookRequest),
			POST("/.well-known/workflow/v1/webhook/:token", handleWorkflowWebhookRequest),
			PUT("/.well-known/workflow/v1/webhook/:token", handleWorkflowWebhookRequest),
			PATCH("/.well-known/workflow/v1/webhook/:token", handleWorkflowWebhookRequest),
			DELETE("/.well-known/workflow/v1/webhook/:token", handleWorkflowWebhookRequest),
			POST("/eve/v1/session", async (n, r) => {
				let i = await routeAuth(n, e.auth);
				if (i instanceof Response) return i;
				let a = sessionAuthFromResult(i);
				let o = await parseOptionalJsonRequest(n);
				if (o instanceof Response) return o;
				if (o.stubs !== void 0 && i.allowToolStubs !== !0) return Response.json({
					ok: !1,
					error: `Tool stubbing is not permitted for this caller.`
				}, { status: 403 });
				let s = await resolveForwardedPrincipal({
					trustedForwarders: e.trustedForwarders,
					forwarder: a,
					payload: o
				});
				if (s instanceof Response) return s;
				let c = parseCreateBody(o);
				if (c instanceof Response) return c;
				let l = c.callback === void 0 ? `absent` : readForwardedParentSessionBaggage(n.headers.get(`baggage`));
				let u;
				if (typeof l == `object`) {
					if (l.callId !== c.callback?.callId) log.warn(`ignoring remote parent lineage with a mismatched callback`, { forwarder: i.principalId });
					else {
						let t = s.accepted;
						if (!t && e.trustedForwarders !== void 0) try {
							t = await e.trustedForwarders(a, {});
						} catch (e) {
							let t = logError(log, `trustedForwarders handler failed`, e, { forwarder: i.principalId });
							return Response.json({
								error: `trustedForwarders handler failed.`,
								errorId: t,
								ok: !1
							}, { status: 500 });
						}
						t ? u = l : log.warn(`ignoring remote parent lineage from an untrusted forwarder`, { forwarder: i.principalId });
					}
				} else l === `malformed` && log.warn(`ignoring malformed remote parent lineage`, { forwarder: i.principalId });
				let d = c.callback === void 0 ? void 0 : parseTraceparent(n.headers.get(`traceparent`));
				let f = c.callback === void 0 ? void 0 : readAgentDispatchTraceContext(n.headers.get(`tracestate`), d) ?? d;
				let p = checkUploadPolicy(c, t);
				if (p !== null) return p;
				if (c.operationId !== void 0 && s.auth.principalType === `anonymous`) return Response.json({
					error: `operationId requires an authenticated principal.`,
					ok: !1
				}, { status: 400 });
				let m = c.operationId === void 0 ? void 0 : await deriveOperationContinuationToken({
					auth: s.auth,
					operationId: c.operationId
				});
				let h = m === void 0 ? void 0 : `delivery:${m}`;
				if (m !== void 0) {
					let e = await r.resolveSession(m);
					if (e !== void 0) return Response.json(createdSessionBody(e.id, c, h), {
						headers: {
							"cache-control": `no-store`,
							["x-eve-session-id"]: e.id
						},
						status: 202
					});
				}
				let g = d === void 0 ? `absent` : readForwardedAudienceBaggage(n.headers.get(`baggage`));
				let _ = s.accepted && d !== void 0 && (d.traceFlags & 1) == 1 ? typeof g == `object` ? g : g === `malformed` ? FAIL_CLOSED_FORWARDED_TRACE_ASSERTION : void 0 : void 0;
				let v = f;
				_ !== void 0 && f !== void 0 && (v = {
					...f,
					forwardedTracePolicy: _
				}), g === `malformed` ? log.warn(`using metadata-only policy for malformed forwarded audience baggage`, { forwarder: i.principalId }) : typeof g == `object` && (_ === void 0 ? log.warn(`ignoring forwarded trace policy without an accepted sampled principal`, { forwarder: i.principalId }) : log.info(`accepted forwarded trace policy`, {
					audience: g.originAudience,
					ceiling: formatTraceContentCeiling(g.ceiling),
					forwarder: i.principalId
				}));
				let y = c.message === void 0 ? {
					auth: s.auth,
					clientContext: resolveTurnClientContext(void 0, c.context)
				} : await resolveOnMessage({
					auth: s.auth,
					clientContext: c.context,
					config: e,
					invocation: u === void 0 || c.operationId === void 0 ? void 0 : { operationId: c.operationId },
					message: c.message,
					request: n
				});
				if (y instanceof Response) return y;
				let b = readRouteSessionCreator(r);
				if (b === void 0) return Response.json({
					error: `Session creation requires internal channel dispatch context.`,
					ok: !1
				}, { status: 500 });
				let x = c.protocolVersion === void 0 || c.protocolVersion === 3 ? void 0 : c.protocolVersion;
				let S;
				try {
					S = await agentDelegation.receive({
						headers: n.headers,
						delegated: c.callback !== void 0,
						trusted: s.accepted,
						parent: u,
						callerTrace: f,
						parentTraceContext: v
					}, ({ conversationId: e, parentTraceContext: t }) => b({
						deliveryId: h,
						audienceAuth: a,
						toolStubs: c.stubs === void 0 ? void 0 : {
							rules: c.stubs,
							token: crypto.randomUUID()
						},
						auth: y.auth,
						capabilities: x === void 0 ? c.capabilities ?? { requestInput: !0 } : { requestInput: !1 },
						callback: c.callback,
						earlierCallerProtocol: x,
						continuationToken: m,
						initiatorAuth: s.accepted ? s.initiatorAuth : void 0,
						input: attachClientContext({
							message: c.message,
							context: y.context,
							history: validateSessionHistory(`history` in y ? y.history : void 0),
							outputSchema: c.outputSchema
						}, y.clientContext),
						conversationId: e,
						parent: u,
						parentTraceContext: t,
						traceRoot: u === void 0 ? void 0 : { kind: `own` },
						title: y.title
					}));
				} catch (e) {
					if (e instanceof InvalidToolStubTargetError) return Response.json({
						error: e.message,
						ok: !1
					}, { status: 400 });
					let t = logError(log, `session-create request failed`, e);
					return Response.json({
						error: `Failed to create the session.`,
						errorId: t,
						ok: !1
					}, { status: 500 });
				}
				return m === void 0 && rememberCurrentSession(S.sessionId), Response.json(createdSessionBody(S.sessionId, c, h ?? S.deliveryId), {
					headers: {
						"cache-control": `no-store`,
						["x-eve-session-id"]: S.sessionId
					},
					status: 202
				});
			}),
			POST("/eve/v1/session/:sessionId", async (n, { attachSession: r, params: i }) => {
				let a = await routeAuth(n, e.auth);
				if (a instanceof Response) return a;
				let o = requireSessionId(i);
				if (o instanceof Response) return o;
				let s = await parseOptionalJsonRequest(n);
				if (s instanceof Response) return s;
				if (Object.keys(s).length === 0) try {
					let e = await r(o).prewarm();
					return Response.json({
						ok: !0,
						...e
					}, {
						headers: { "cache-control": `no-store` },
						status: e.status === `accepted` ? 202 : 200
					});
				} catch (e) {
					let t = logError(log, `session-prewarm request failed`, e, { sessionId: o });
					return Response.json({
						ok: !1,
						error: `Failed to prewarm the session.`,
						errorId: t
					}, { status: 500 });
				}
				let c = await resolveForwardedPrincipal({
					trustedForwarders: e.trustedForwarders,
					forwarder: sessionAuthFromResult(a),
					payload: s
				});
				if (c instanceof Response) return c;
				let l = parseSessionMessageBody(s);
				if (l instanceof Response) return l;
				let u = checkUploadPolicy(l, t);
				if (u !== null) return u;
				let d = resolveTurnClientContext(void 0, l.context);
				let f;
				let p;
				let m;
				let h;
				let g = c.auth;
				if (l.message !== void 0) {
					let t = await resolveOnMessage({
						auth: c.auth,
						clientContext: l.context,
						config: e,
						message: l.message,
						request: n,
						sessionId: o,
						turnPolicy: l.turnPolicy
					});
					if (t instanceof Response) return t;
					d = t.clientContext, f = t.context, p = t.history, m = t.title, h = t.turnPolicy, g = t.auth;
				}
				let _;
				try {
					let t = r(o);
					let n = attachClientContext({
						auth: g,
						inbox: l.inbox,
						callback: l.callback,
						context: f,
						history: p,
						outputSchema: l.outputSchema,
						turnPolicy: h ?? turnPolicyForRequest(l.turnPolicy, e.turnPolicy),
						title: m,
						...l.idempotencyKey !== void 0 && {
							deliveryId: await deliveryIdForIdempotencyKey(l.idempotencyKey),
							idempotencyKey: l.idempotencyKey
						}
					}, d);
					_ = l.answers === void 0 ? await t.send(l.message, n) : await t.respond(l.answers, n);
				} catch (e) {
					let t = sessionCommandErrorResponse(e);
					if (t !== void 0) return t;
					let n = logError(log, `session-message request failed`, e, { sessionId: o });
					return Response.json({
						error: `Failed to send the session message.`,
						errorId: n,
						ok: !1
					}, { status: 500 });
				}
				return deliveryResponse(_);
			}),
			POST("/eve/v1/session/:sessionId/cancel", async (t, { attachSession: n, params: r }) => {
				let i = await routeAuth(t, e.auth);
				if (i instanceof Response) return i;
				let a = requireSessionId(r);
				if (a instanceof Response) return a;
				let o = await parseCancelTurnBody(t);
				if (o instanceof Response) return o;
				let s;
				try {
					s = await n(a).cancel({
						auth: sessionAuthFromResult(i),
						turnId: o.turnId
					});
				} catch (e) {
					let t = sessionCommandErrorResponse(e);
					if (t !== void 0) return t;
					let n = logError(log, `cancel-turn request failed`, e, { sessionId: a });
					return Response.json({
						error: `Failed to cancel the turn.`,
						errorId: n,
						ok: !1
					}, { status: 500 });
				}
				return deliveryResponse(s);
			}),
			POST("/eve/v1/session/:sessionId/compact", async (t, { attachSession: n, params: r }) => {
				let i = await routeAuth(t, e.auth);
				if (i instanceof Response) return i;
				let a = requireSessionId(r);
				if (a instanceof Response) return a;
				let o = await parseSessionControlBody(t);
				if (o instanceof Response) return o;
				let s;
				try {
					s = await n(a).compact({ auth: sessionAuthFromResult(i) });
				} catch (e) {
					let t = sessionCommandErrorResponse(e);
					if (t !== void 0) return t;
					let n = logError(log, `session-compaction request failed`, e, { sessionId: a });
					return Response.json({
						error: `Failed to compact the session.`,
						errorId: n,
						ok: !1
					}, { status: 500 });
				}
				return deliveryResponse(s);
			}),
			POST("/eve/v1/session/:sessionId/clear", async (t, { attachSession: n, params: r }) => {
				let i = await routeAuth(t, e.auth);
				if (i instanceof Response) return i;
				let a = requireSessionId(r);
				if (a instanceof Response) return a;
				let o = await parseSessionControlBody(t);
				if (o instanceof Response) return o;
				let s;
				try {
					s = await n(a).clear({ auth: sessionAuthFromResult(i) });
				} catch (e) {
					let t = sessionCommandErrorResponse(e);
					if (t !== void 0) return t;
					let n = logError(log, `session-clear request failed`, e, { sessionId: a });
					return Response.json({
						error: `Failed to clear the session context.`,
						errorId: n,
						ok: !1
					}, { status: 500 });
				}
				return deliveryResponse(s);
			}),
			...["/eve/v1/session/:sessionId/end", "/eve/v1/session/:sessionId/reset"].map((t) => POST(t, async (t, { attachSession: n, params: r }) => {
				let i = await routeAuth(t, e.auth);
				if (i instanceof Response) return i;
				let a = requireSessionId(r);
				if (a instanceof Response) return a;
				let o = await parseResetBody(t);
				if (o instanceof Response) return o;
				let s;
				try {
					s = await n(a).end({
						auth: sessionAuthFromResult(i),
						reason: o.reason
					});
				} catch (e) {
					let t = sessionCommandErrorResponse(e);
					if (t !== void 0) return t;
					let n = logError(log, `session-end request failed`, e, { sessionId: a });
					return Response.json({
						error: `Failed to end the session.`,
						errorId: n,
						ok: !1
					}, { status: 500 });
				}
				return deliveryResponse(s);
			})),
			GET("/eve/v1/session/:sessionId/stubs", async (t, { params: n }) => {
				let r = await routeAuth(t, e.auth);
				if (r instanceof Response) return r;
				if (r.allowToolStubs !== !0) return Response.json({
					error: `Tool stubbing is not permitted for this caller.`,
					ok: !1
				}, { status: 403 });
				let i = requireSessionId(n);
				if (i instanceof Response) return i;
				try {
					return await (0, runtime_exports.getRun)(i).exists ? Response.json({
						error: await readStubFailure(i) ?? null,
						matchedRuleIds: await readMatchedStubRules(i)
					}, { headers: { "cache-control": `no-store` } }) : Response.json({
						error: `Session not found.`,
						ok: !1
					}, { status: 404 });
				} catch (e) {
					let t = logError(log, `tool-stub verification request failed`, e, { sessionId: i });
					return Response.json({
						error: `Failed to verify tool stubs.`,
						errorId: t,
						ok: !1
					}, { status: 500 });
				}
			}),
			GET("/eve/v1/session/:sessionId/stream", async (t, { attachSession: n, params: r }) => {
				let i = await routeAuth(t, e.auth);
				if (i instanceof Response) return i;
				let a = requireSessionId(r);
				return a instanceof Response ? a : await createSessionStreamResponse(t, n(a));
			}),
			GET("/eve/v1/session/:sessionId/descendants/stream", async (t, n) => {
				let r = await routeAuth(t, e.auth);
				if (r instanceof Response) return r;
				let i = requireSessionId(n.params);
				return i instanceof Response ? i : descendantStreamResponse({
					request: t,
					root: n.attachSession(i),
					attachSession: n.attachSession,
					resolveHeaders: readRemoteAgentStreamHeadersResolver(n)
				});
			}),
			GET("/eve/v1/session/:parentSessionId/subagents/:callId/:childSessionId/stream", async (t, n) => {
				let r = await routeAuth(t, e.auth);
				if (r instanceof Response) return r;
				let i = n.params.parentSessionId;
				let a = n.params.callId;
				let o = n.params.childSessionId;
				if (!i || !a || !o) return Response.json({
					error: `Missing subagent stream coordinates.`,
					ok: !1
				}, { status: 400 });
				let s = parseStartIndex(t);
				if (s instanceof Response) return s;
				let c = parseIncludeTailIndex(t);
				let l = createEveSubagentStreamRoutePath({
					callId: a,
					childSessionId: o,
					parentSessionId: i
				});
				let u;
				try {
					let e = n.attachSession(i);
					let t = await findRemoteAgentBinding({
						callId: a,
						childSessionId: o,
						childStreamPath: l,
						parent: internalSession(e)
					});
					if (t === void 0) throw Error(`Remote subagent binding not found.`);
					u = t;
				} catch {
					return Response.json({
						error: `Subagent stream not found.`,
						ok: !1
					}, { status: 404 });
				}
				if (u.earlierProtocol !== void 0) return Response.json({
					code: "REMOTE_AGENT_PROTOCOL_MISMATCH",
					error: formatEarlierRemoteChildStreamError({
						childVersion: u.earlierProtocol,
						name: u.name
					}),
					ok: !1
				}, { status: 409 });
				let d = readRemoteAgentStreamHeadersResolver(n);
				if (d === void 0) return Response.json({
					error: `Subagent stream proxy requires internal channel dispatch context.`,
					ok: !1
				}, { status: 500 });
				let f;
				try {
					f = await d(u);
				} catch {
					return Response.json({
						error: `Subagent stream not found.`,
						ok: !1
					}, { status: 404 });
				}
				let p = new URL(createEveSessionStreamRoutePath(o).replace(/^\/+/, ``), `${u.url.replace(/\/+$/, ``)}/`);
				s !== void 0 && p.searchParams.set(`startIndex`, String(s)), c && p.searchParams.set(`includeTailIndex`, `1`);
				return proxyStreamResponse(await fetch(p, {
					cache: `no-store`,
					headers: f,
					redirect: `manual`,
					signal: t.signal
				}));
			})
		],
		events: e.events,
		fetchFile: e.fetchFile,
		uploadPolicy: e.uploadPolicy
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/framework/sources/modules/eve-channel.js
function createDefaultEveChannel() {
	return eveChannel({ auth: [
		vercelOidc(),
		localDev(),
		placeholderAuth()
	] });
}
export { createDefaultEveChannel };

//# sourceMappingURL=eve51.mjs.map