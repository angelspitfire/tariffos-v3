import { attachClientContext, attachInputText, defaultDeliverResult, readClientContext, readInputText, removedEventKeyMessage } from "./eve16.mjs";
import { buildCallbackContext, currentView, snapshotOf } from "./eve36.mjs";
import { createBackgroundWork, mergeUploadPolicy } from "./eve53.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/nitro/routes/channel-route-context.js
const agentInfoRouteResponseKey = `__eveAgentInfoRouteResponse`;
const homeRouteMetadataKey = `__eveHomeRouteMetadata`;
const remoteAgentStreamHeadersResolverKey = `__eveRemoteAgentStreamHeadersResolver`;
const routeSessionCreatorKey = `__eveRouteSessionCreator`;
function readAgentInfoRouteResponse(e) {
	return e[agentInfoRouteResponseKey];
}
function readHomeRouteMetadata(e) {
	return e[homeRouteMetadataKey];
}
function readRouteSessionCreator(e) {
	return e[routeSessionCreatorKey];
}
function readRemoteAgentStreamHeadersResolver(e) {
	return e[remoteAgentStreamHeadersResolverKey];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/authoring.js
const authoringEventTypes = `session.started,session.ended,delivery.admitted,delivery.consumed,delivery.settled,turn.started,turn.paused,turn.settled,model.requested,model.started,model.retried,model.settled,content.delta,content.completed,call.input,call.requested,call.started,call.progress,call.settled,usage.recorded,context.started,context.settled,interaction.opened,interaction.settled,response.submitted,response.admitted,response.settled,child.opened,task.ended,task.started`.split(`,`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/cors.js
function normalizeChannelCors(e) {
	if (e === void 0 || e === !1) return;
	if (e === !0) return {};
	if (typeof e != `object` || !e || Array.isArray(e)) throw Error(`Expected channel cors to be a boolean or a serializable CORS options object.`);
	assertSupportedCorsKeys(e);
	let t = {};
	if (e.origin !== void 0 && (t.origin = normalizeOrigin(e.origin)), e.methods !== void 0 && (t.methods = normalizeWildcardOrStringList(e.methods, `methods`)), e.allowHeaders !== void 0 && (t.allowHeaders = normalizeWildcardOrStringList(e.allowHeaders, `allowHeaders`)), e.exposeHeaders !== void 0 && (t.exposeHeaders = normalizeWildcardOrStringList(e.exposeHeaders, `exposeHeaders`)), e.credentials !== void 0) {
		if (typeof e.credentials != `boolean`) throw Error(`Expected channel cors.credentials to be a boolean.`);
		t.credentials = e.credentials;
	}
	return e.maxAge !== void 0 && (t.maxAge = normalizeMaxAge(e.maxAge)), e.preflight !== void 0 && (t.preflight = normalizePreflight(e.preflight)), t;
}
const SUPPORTED_CORS_KEYS = /* @__PURE__ */ new Set([
	`origin`,
	`methods`,
	`allowHeaders`,
	`exposeHeaders`,
	`credentials`,
	`maxAge`,
	`preflight`
]);
const RENAMED_CORS_KEYS = {
	allowedHeaders: `allowHeaders`,
	exposedHeaders: `exposeHeaders`,
	preflightStatus: `preflight.statusCode`
};
function assertSupportedCorsKeys(e) {
	for (let t of Object.keys(e)) {
		if (SUPPORTED_CORS_KEYS.has(t)) continue;
		let e = Object.hasOwn(RENAMED_CORS_KEYS, t) ? RENAMED_CORS_KEYS[t] : void 0;
		throw Error(e === void 0 ? `Unknown channel cors option "${t}". Supported options: ${[...SUPPORTED_CORS_KEYS].join(`, `)}.` : `The channel cors option "${t}" is no longer supported. Use "${e}".`);
	}
}
function normalizeOrigin(e) {
	if (e === `*` || e === `null`) return e;
	if (typeof e == `string` && e.length > 0) return [e];
	if (!Array.isArray(e)) throw Error(`Expected channel cors.origin to be a non-empty origin string or an array of origins.`);
	return e.map((e) => {
		if (typeof e != `string` || e.length === 0) throw Error(`Expected channel cors.origin entries to be non-empty strings.`);
		return e;
	});
}
function normalizeWildcardOrStringList(e, t) {
	if (e === `*`) return e;
	if (!Array.isArray(e)) throw Error(`Expected channel cors.${t} to be "*" or an array of strings.`);
	return e.map((e) => {
		if (typeof e != `string` || e.length === 0) throw Error(`Expected channel cors.${t} entries to be non-empty strings.`);
		return e;
	});
}
function normalizeMaxAge(e) {
	if (e === !1) return !1;
	if (typeof e == `number`) {
		if (!Number.isFinite(e) || e < 0) throw Error(`Expected channel cors.maxAge to be a non-negative finite number.`);
		return String(e);
	}
	if (typeof e == `string` && e.length > 0) return e;
	throw Error(`Expected channel cors.maxAge to be false, a string, or a number.`);
}
function normalizePreflight(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) throw Error(`Expected channel cors.preflight to be an object.`);
	let t = e.statusCode;
	if (t === void 0) return {};
	if (!Number.isInteger(t) || t < 100 || t > 599) throw Error(`Expected channel cors.preflight.statusCode to be an HTTP status code.`);
	return { statusCode: t };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/definitions/channel.js
function defineChannel(e) {
	let t = buildAdapter(e);
	let n = normalizeChannelCors(e.cors);
	return {
		__kind: "eve:channel",
		routes: e.routes,
		adapter: t,
		cors: n,
		receive: e.receive,
		turnPolicy: e.turnPolicy
	};
}
const eventTypes = [...authoringEventTypes, `committed`];
function buildAdapter(e) {
	let t = e.state != null;
	let n = e.context != null;
	let r = e.fetchFile !== void 0;
	let i = e.metadata;
	let a = i !== void 0;
	let o = e.audience;
	let s = e.space;
	let c = e.uploadPolicy === void 0 ? void 0 : mergeUploadPolicy(e.uploadPolicy);
	let l = t || n || a || c !== void 0 || e.deliver !== void 0;
	let u = {};
	let d = !1;
	let f = e.events;
	for (let e of Object.keys(f ?? {})) {
		let t = removedEventKeyMessage(e);
		if (t !== void 0) throw Error(`A channel handles ${t}`);
	}
	for (let e of eventTypes) {
		let t = f?.[e];
		t && (d = !0, u[e] = (e, n) => {
			let { session: r, continuation: i, position: a, scope: o, view: s, waitUntil: c, ...l } = n;
			let u = {
				...l,
				get continuation() {
					return n.continuation;
				}
			};
			let d = createBackgroundWork();
			let f = {
				...buildCallbackContext(),
				channel: u,
				position: a ?? {
					index: 0,
					line: 0
				},
				view: snapshotOf(s ?? currentView()),
				waitUntil: c ?? d.waitUntilFor(e.type)
			};
			let p = t(e, f);
			return c === void 0 ? (async () => {
				try {
					await p;
				} finally {
					await d.settle(), d.close();
				}
			})() : p;
		});
	}
	let p = {};
	o !== void 0 && (p.audience = o), s !== void 0 && (p.space = s);
	let m = o !== void 0 || s !== void 0;
	return !l && !d && !r ? {
		kind: "http",
		...m && { instrumentation: p }
	} : {
		kind: `defineChannel`,
		state: t ? { ...e.state } : {},
		fetchFile: e.fetchFile,
		uploadPolicy: c,
		instrumentation: i === void 0 && !m ? void 0 : {
			...p,
			...i !== void 0 && { metadata(e) {
				let { audience: t, ...n } = i(e);
				return n;
			} }
		},
		createAdapterContext(t) {
			let r = t.state;
			let i = {
				session: t.session,
				get continuation() {
					return t.continuation;
				}
			};
			return {
				...n ? e.context(r, i) : {},
				state: r,
				ctx: t.ctx,
				session: i.session,
				get continuation() {
					return i.continuation;
				}
			};
		},
		async deliver(t, n) {
			let r = readInputText(t);
			let i = await e.deliver?.(r === void 0 ? t : {
				...t,
				answerText: r
			}, n);
			let a = defaultDeliverResult(i ?? t);
			if (a !== void 0) return attachClientContext(attachInputText(a, i?.answerText ?? r), readClientContext(t));
		},
		...u
	};
}
export { defineChannel, readAgentInfoRouteResponse, readHomeRouteMetadata, readRemoteAgentStreamHeadersResolver, readRouteSessionCreator };

//# sourceMappingURL=eve52.mjs.map