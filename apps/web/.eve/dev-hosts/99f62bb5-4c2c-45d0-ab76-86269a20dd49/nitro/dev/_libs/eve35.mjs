import "./eve6.mjs";
import { createLogger, logError } from "./eve15.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/eve-route-path.js
const EVE_NAMED_AGENT_MOUNT_PATTERN = /^\/eve\/[a-z0-9][a-z0-9_-]*$/;
const EVE_NAMED_AGENT_PROTOCOL_PATTERN = /^\/eve\/[a-z0-9][a-z0-9_-]*\/v1$/;
function joinEveRoutePath(e, t) {
	let n = trimTrailingSlash(e);
	let r = t.startsWith(`/`) ? t : `/${t}`;
	if (r === "/eve/v1" || r.startsWith(`/eve/v1/`)) {
		if (EVE_NAMED_AGENT_MOUNT_PATTERN.test(n)) return `${n}${r.slice(4)}`;
		if (EVE_NAMED_AGENT_PROTOCOL_PATTERN.test(n)) return `${n}${r.slice(7)}`;
	}
	return `${n}${r}`;
}
function normalizePublicEveRoutePath(e) {
	return e.replace(/^\/eve\/[a-z0-9][a-z0-9_-]*\/v1(?=\/|$)/, "/eve/v1");
}
function trimTrailingSlash(e) {
	return e === `/` ? `` : e.endsWith(`/`) ? e.slice(0, -1) : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/forwarded-principal.js
const log = createLogger(`channel.forwarded-principal`);
const attributeValueSchema = z.union([z.string(), z.array(z.string()).readonly()]);
const forwardedPrincipalContextSchema = z.object({
	attributes: z.record(z.string(), attributeValueSchema).readonly(),
	authenticator: z.string().min(1),
	issuer: z.string().min(1).optional(),
	principalId: z.string().min(1),
	principalType: z.string().min(1),
	subject: z.string().min(1).optional()
}).strict();
const forwardedPrincipalSchema = z.object({
	current: forwardedPrincipalContextSchema,
	initiator: forwardedPrincipalContextSchema.optional()
}).strict();
async function resolveForwardedPrincipal(e) {
	let t = e.payload.forwardedPrincipal;
	if (t === void 0) return {
		accepted: !1,
		auth: e.forwarder
	};
	if (e.trustedForwarders === void 0) return Response.json({
		error: `This deployment does not accept a forwarded principal.`,
		ok: !1
	}, { status: 403 });
	let n = parseForwardedPrincipal(t);
	if (!n.ok) return Response.json({
		error: n.message,
		ok: !1
	}, { status: 400 });
	let r = stampForwardedBy(n.forwardedPrincipal.current, e.forwarder.principalId);
	let i = n.forwardedPrincipal.initiator === void 0 ? r : stampForwardedBy(n.forwardedPrincipal.initiator, e.forwarder.principalId);
	let a;
	try {
		a = await e.trustedForwarders(e.forwarder, { principal: {
			current: r,
			initiator: i
		} });
	} catch (t) {
		let n = logError(log, `trustedForwarders handler failed`, t, { forwarder: e.forwarder.principalId });
		return Response.json({
			error: `trustedForwarders handler failed.`,
			errorId: n,
			ok: !1
		}, { status: 500 });
	}
	return a ? {
		accepted: !0,
		auth: r,
		initiatorAuth: i
	} : Response.json({
		error: `Caller is not authorized to assert a forwarded principal.`,
		ok: !1
	}, { status: 403 });
}
function parseForwardedPrincipal(e) {
	let t = forwardedPrincipalSchema.safeParse(e);
	if (t.success) {
		let e = toSessionAuthContext(t.data.current);
		return {
			forwardedPrincipal: t.data.initiator === void 0 ? { current: e } : {
				current: e,
				initiator: toSessionAuthContext(t.data.initiator)
			},
			ok: !0
		};
	}
	return {
		cause: t.error,
		message: formatForwardedPrincipalParseError(t.error),
		ok: !1
	};
}
function stampForwardedBy(e, t) {
	return {
		...e,
		attributes: {
			...e.attributes,
			["eve:forwarded-by"]: t
		}
	};
}
function toSessionAuthContext(e) {
	let t = {
		attributes: e.attributes,
		authenticator: e.authenticator,
		principalId: e.principalId,
		principalType: e.principalType
	};
	return e.issuer !== void 0 && (t.issuer = e.issuer), e.subject !== void 0 && (t.subject = e.subject), t;
}
function formatForwardedPrincipalParseError(e) {
	return `Invalid forwardedPrincipal metadata: ${e.issues.map((e) => `${e.path.length === 0 ? `forwardedPrincipal` : `forwardedPrincipal.${e.path.join(`.`)}`}: ${e.message}`).join(`; `)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/types.js
function declared(e, t) {
	return e.definitions.filter((e) => e.kind === t);
}
export { declared, joinEveRoutePath, normalizePublicEveRoutePath, resolveForwardedPrincipal };

//# sourceMappingURL=eve35.mjs.map