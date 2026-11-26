import { AuthKey, ContinuationHookTokensKey, ContinuationTokenKey, InitiatorAuthKey, SessionIdKey, SteeredByKey } from "./eve13.mjs";
import { isObject } from "./eve14.mjs";
import { SessionNotActiveError, activeTurn, attachClientContext, emptySessionView, foldReceivedEvent, interaction, openInteractions, readClientContext, serializeUrlFilePart } from "./eve16.mjs";
import { conforming } from "./eve27.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/facts.js
function defined(e) {
	return Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0));
}
function fact(e, t) {
	return {
		data: defined(t),
		type: e
	};
}
function usageOf(e) {
	return defined({
		cacheReadTokens: e.cacheReadTokens ?? 0,
		cacheWriteTokens: e.cacheWriteTokens ?? 0,
		costUsd: e.costUsd,
		inputTokens: e.inputTokens ?? 0,
		outputTokens: e.outputTokens ?? 0
	});
}
function errorInfoOf(e) {
	let { errorId: t, hint: n } = e.details ?? {};
	return defined({
		code: e.code,
		hint: typeof n == `string` && n.trim().length > 0 ? n.trim() : void 0,
		id: typeof t == `string` ? t : void 0,
		message: e.message
	});
}
function sessionEndedFacts(e, t) {
	let n = [];
	e !== void 0 && e.view.session.status === `new` && n.push(fact(`session.started`, {}));
	for (let e of t.settles ?? []) n.push(...controlSettled(e));
	let { control: r } = t;
	r !== void 0 && n.push(controlAdmitted(r, `reset`), deliveryApplied(r.deliveryId));
	let i = r === void 0 ? t.cause : { deliveryId: r.deliveryId };
	return n.push(fact(`session.ended`, {
		cause: i,
		error: t.error,
		outcome: t.outcome
	})), n;
}
function turnSettled(e, t, n = activeTurn(e.view)?.turnId) {
	if (n === void 0) return [];
	let r = e.view.turns[n]?.reply;
	return [fact(`turn.settled`, {
		...t,
		reply: r !== void 0 && r.length > 0 ? r : void 0,
		turnId: n
	})];
}
function runRequested(e, t) {
	return fact(`model.requested`, {
		owner: e,
		runId: t
	});
}
function runStarted(e) {
	let { attempt: t, modelId: n, runId: r } = e;
	return fact(`model.started`, {
		attempt: t,
		modelId: n,
		runId: r
	});
}
function runSettledFacts(e) {
	let { usage: t, ...n } = e;
	let r = [fact(`model.settled`, n)];
	return t !== void 0 && r.push(runUsageRecorded(e.runId, t)), r;
}
function runUsageRecorded(e, t) {
	return fact(`usage.recorded`, {
		kind: `model`,
		owner: { runId: e },
		usage: t
	});
}
function delegatedUsageFact(e, t) {
	let n = usageOf(t);
	return e === void 0 ? fact(`usage.recorded`, {
		kind: `delegated-late`,
		usage: n
	}) : fact(`usage.recorded`, {
		kind: `model`,
		owner: { callId: e },
		usage: n
	});
}
function contextStarted(e) {
	return fact(`context.started`, e);
}
function controlAdmitted(e, t) {
	return fact(`delivery.admitted`, {
		deliveryId: e.deliveryId,
		principal: e.principal,
		source: { control: t }
	});
}
function controlSettled(e) {
	let { control: t, outcome: n, reason: r, source: i } = e;
	return [controlAdmitted(t, i), fact(`delivery.settled`, {
		deliveryId: t.deliveryId,
		outcome: n,
		...r !== void 0 && { reason: r }
	})];
}
function deliveryApplied(e) {
	return fact(`delivery.settled`, {
		deliveryId: e,
		outcome: `applied`
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/schedule-collection-tools.js
function scheduleCollectionToolPrefix(e) {
	return `schedule__${e.replaceAll(`/`, `-`)}`;
}
function scheduleCollectionToolSlot(e) {
	return scheduleCollectionToolPrefix(e.namedScope?.definition ?? e.name);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/request-status.js
function deliveryStatus(e, t, n) {
	switch (e) {
		case void 0: return n === `failed` ? `failed` : `working`;
		case `awaiting-input`: return `awaiting-input`;
		case `failed`:
		case `refused`: return `failed`;
		case `ignored`:
		case `applied`: return `completed`;
		case `handled`: return t === `cancelled` ? `cancelled` : t === `failed` ? `failed` : `completed`;
		default: return `failed`;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/client/session-utils.js
function turnSummary(e) {
	let t = new ResponseSegment({ deliveryId: e });
	let n;
	let r;
	let i = !1;
	let a = /* @__PURE__ */ new Map();
	let o = /* @__PURE__ */ new Map();
	let s = /* @__PURE__ */ new Map();
	let c = /* @__PURE__ */ new Map();
	let l;
	let u = /* @__PURE__ */ new Map();
	let d;
	let f;
	let p;
	let m;
	function observe(h) {
		h.type === `session.ended` && (i = !0), h.type === `delivery.consumed` && h.data.deliveryId === e && (r = h.data.turnId), h.type === `delivery.settled` && h.data.deliveryId === e && (n = h.data), h.type === `turn.settled` && a.set(h.data.turnId, h.data.outcome), t.observe(h) && (d = t.boundary);
		let g = failureOf(h);
		if (f = g ?? f, g !== void 0 && (h.type === `turn.settled` && c.set(h.data.turnId, g), h.type === `session.ended` && (l = g)), h.type === `content.completed` && (u.set(h.data.partId, {
			kind: h.data.kind,
			value: h.data.value
		}), h.data.kind === `result` && (m = h.data.value, h.scope?.turnId !== void 0 && s.set(h.scope.turnId, m))), h.type === `turn.settled`) {
			let e = (h.data.reply ?? []).flatMap((e) => {
				let t = u.get(e);
				return t?.kind === `text` && typeof t.value == `string` ? [t.value] : [];
			});
			p = e.length === 0 ? void 0 : e.join(`
`), o.set(h.data.turnId, p);
			for (let e of h.data.reply ?? []) {
				let t = u.get(e);
				t?.kind === `result` && s.set(h.data.turnId, t.value);
			}
		}
	}
	function summarize() {
		let u = n?.turnId ?? r;
		let h = e === void 0 ? summarizeBoundaryStatus(d, f) : deliveryStatus(n?.outcome, a.get(u ?? ``), l === void 0 ? void 0 : `failed`);
		if (e !== void 0) {
			let e = n?.outcome === `handled` || n?.outcome === `awaiting-input`;
			p = e && u !== void 0 ? o.get(u) : void 0, m = e && u !== void 0 ? s.get(u) : void 0, f = h === `failed` ? c.get(u ?? ``) ?? l : void 0, h === `failed` && f === void 0 && (f = {
				code: n?.outcome === `refused` ? `DELIVERY_REFUSED` : `DELIVERY_FAILED`,
				message: n?.reason ?? (n?.outcome === `refused` ? `The delivery was refused.` : `The delivery failed.`)
			});
		}
		return {
			boundary: d,
			failure: f,
			interactions: t.interactions,
			message: p,
			result: m,
			sessionEnded: i,
			status: h,
			outcome: n?.outcome
		};
	}
	return {
		observe,
		result: summarize
	};
}
function summarizeBoundaryStatus(e, t) {
	return t === void 0 ? e?.type === `turn.settled` || e?.type === `session.ended` ? e.data.outcome : e?.type === `turn.paused` ? `awaiting-input` : `working` : `failed`;
}
function failureOf(e) {
	if (e.type === `turn.settled` && e.data.outcome === `failed`) return e.data.error ?? {
		code: `TURN_FAILED`,
		message: `The turn failed.`
	};
	if (e.type === `session.ended` && e.data.outcome === `failed`) return e.data.error ?? {
		code: `SESSION_FAILED`,
		message: `The session failed.`
	};
}
function endsTurn(e) {
	return e.type === `turn.settled` || e.type === `session.ended` || e.type === `turn.paused` && e.data.awaiting.some((e) => `interactionId` in e);
}
var ResponseSegment = class {
	#e = emptySessionView();
	#t;
	#n;
	constructor(e = {}) {
		this.#t = e.deliveryId;
	}
	get interactions() {
		return openInteractions(this.#e).flatMap((e) => interaction(this.#e, e.interactionId) ?? []);
	}
	get boundary() {
		return this.#n;
	}
	observe(e) {
		foldReceivedEvent(this.#e, e), (this.#t === void 0 ? endsTurn(e) : e.type === `session.ended` || e.type === `delivery.settled` && e.data.deliveryId === this.#t) && (this.#n = e);
		let t = `meta` in e ? e.meta : void 0;
		let n = typeof t == `object` && t && `endOfLine` in t ? t.endOfLine : void 0;
		return this.#n !== void 0 && n !== !1;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/client/abort-signal.js
function throwIfAborted(e) {
	if (e === void 0) return;
	let t = e.throwIfAborted;
	if (typeof t == `function`) {
		t.call(e);
		return;
	}
	if (!e.aborted) return;
	if (e.reason !== void 0) throw e.reason;
	let n = Error(`The operation was aborted.`);
	throw n.name = `AbortError`, n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/client/delivery.js
const sendReceipts = /* @__PURE__ */ new WeakMap();
var StreamDelivery = class {
	sessionId;
	deliveryId;
	inbox;
	#e;
	#t;
	constructor(e) {
		this.sessionId = e.sessionId, this.inbox = e.inbox, this.deliveryId = e.deliveryId, e.receipt !== void 0 && sendReceipts.set(this, e.receipt), this.#e = e.createStream;
	}
	async *stream(e) {
		throwIfAborted(e?.signal);
		for await (let t of this.#e(e)) throwIfAborted(e?.signal), yield t;
		throwIfAborted(e?.signal);
	}
	async result(e) {
		if (throwIfAborted(e?.signal), this.#t !== void 0) return this.#t;
		let t = turnSummary(this.deliveryId);
		for await (let n of this.stream(e)) t.observe(n);
		let n = t.result();
		if (n.status === `working` || n.outcome === void 0) throw Error(`The stream ended before the accepted delivery settled.`);
		let r = {
			data: n.result,
			deliveryId: this.deliveryId,
			interactions: n.interactions,
			outcome: n.outcome,
			reply: n.message,
			sessionEnded: n.sessionEnded,
			sessionId: this.sessionId
		};
		let i = n.status === `failed` ? {
			...r,
			status: `failed`,
			error: n.failure ?? {
				code: `DELIVERY_FAILED`,
				message: `The delivery failed.`
			}
		} : {
			...r,
			status: n.status
		};
		return this.#t = i, i;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/client/delivery-events.js
async function* deliveryEvents(e, t, n, r) {
	let i = new ResponseSegment({ deliveryId: t });
	let a = !1;
	let o = [];
	for await (let n of e) {
		if (!a) {
			if (n.type === `session.ended`) throw Error(`The session ended before admitting the accepted delivery.`);
			if (o[0]?.meta.position.line !== n.meta.position.line) {
				for (let e of o) r?.(e);
				o = [];
			}
			if (o.push(n), n.type !== `delivery.admitted` || n.data.deliveryId !== t) continue;
			a = !0;
		}
		let e = o.length > 0 ? o : [n];
		o = [];
		for (let t of e) {
			let e = i.observe(t);
			if (yield t, e) return;
		}
	}
	if (!n?.aborted) throw Error(`The stream ended before the accepted delivery settled.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/delivery.js
function commandDelivery(e, t, n, r = {}) {
	if (t.status !== `accepted` && t.status !== `reset`) throw new SessionNotActiveError();
	let i = t.status === `reset` ? t.previousSessionId : t.sessionId;
	return new StreamDelivery({
		inbox: `inbox` in t ? t.inbox : void 0,
		sessionId: i,
		deliveryId: n,
		createStream: async function* (t) {
			yield* deliveryEvents(await e.getEventStream(i, {
				...r,
				signal: t?.signal
			}), n, t?.signal);
		}
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/delivery-metadata.js
function createChannelDeliveryMetadata(e) {
	let t = {
		channelKind: e.channelKind,
		channelName: e.channelName,
		deliveryId: crypto.randomUUID()
	};
	return e.acceptedDeploymentId !== void 0 && (t.acceptedDeploymentId = e.acceptedDeploymentId), e.requestId !== void 0 && (t.requestId = e.requestId), e.requestTraceContext !== void 0 && (t.requestTraceContext = e.requestTraceContext), t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/delivery-idempotency.js
function validateDeliveryIdempotencyKey(e) {
	if (e !== void 0 && (typeof e != `string` || e.length === 0 || e.length > 256)) throw Error(`idempotencyKey must be a nonempty string of at most 256 characters.`);
}
async function deliveryIdForIdempotencyKey(e) {
	let t = new Uint8Array(await crypto.subtle.digest(`SHA-256`, new TextEncoder().encode(`eve:delivery:${e}`)));
	t[6] = t[6] & 15 | 128, t[8] = t[8] & 63 | 128;
	let n = Array.from(t.subarray(0, 16), (e) => e.toString(16).padStart(2, `0`)).join(``);
	return `${n.slice(0, 8)}-${n.slice(8, 12)}-${n.slice(12, 16)}-${n.slice(16, 20)}-${n.slice(20, 32)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/send-input.js
function normalizeSendInput(e) {
	return isMessageContent(e) ? { message: e } : e;
}
function isMessageContent(e) {
	return typeof e == `string` || Array.isArray(e);
}
function serializeFilePartsInMessage(e) {
	if (e === void 0 || typeof e == `string`) return e;
	let t = !1;
	let n = e.map((e) => {
		if (e.type !== `file`) return e;
		if (e.data instanceof URL && e.data.protocol !== `data:`) return t = !0, {
			...e,
			data: serializeUrlFilePart(e.data)
		};
		if (e.data instanceof Uint8Array || e.data instanceof ArrayBuffer) {
			t = !0;
			let n = Buffer.from(new Uint8Array(e.data)).toString(`base64`);
			return {
				...e,
				data: `data:${e.mediaType};base64,${n}`
			};
		}
		return e;
	});
	return t ? n : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/types.js
function storedTurnPolicy(e) {
	return typeof e == `string` ? { turnPolicy: e } : e.mode !== `steer` || e.principal === void 0 || e.principal === `match` ? { turnPolicy: e.mode } : {
		turnPolicy: `steer`,
		principalPolicy: e.principal
	};
}
function controlCommand(e, t) {
	let n = crypto.randomUUID();
	return t?.auth === void 0 ? {
		...e,
		deliveryId: n
	} : {
		...e,
		auth: t.auth,
		deliveryId: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/session-history.js
var InvalidSessionHistoryError = class extends Error {
	name = `InvalidSessionHistoryError`;
};
const HISTORY_FIELDS = [
	`id`,
	`role`,
	`text`
];
function validateSessionHistory(e) {
	if (e === void 0) return;
	if (!Array.isArray(e)) throw new InvalidSessionHistoryError(`history must be an array of messages.`);
	let t = /* @__PURE__ */ new Set();
	return e.map((e, n) => {
		let r = `history[${n}]`;
		if (!isObject(e)) throw new InvalidSessionHistoryError(`${r} must be an object.`);
		rejectUnknownFields(e, r);
		let { id: i, role: a, text: o } = e;
		if (a !== `user` && a !== `assistant`) throw new InvalidSessionHistoryError(`${r}.role must be "user" or "assistant".`);
		if (typeof o != `string` || o.trim().length === 0) throw new InvalidSessionHistoryError(`${r}.text must be a non-empty string.`);
		let s = {
			role: a,
			text: o
		};
		if (i === void 0) return s;
		if (typeof i != `string` || i.length === 0) throw new InvalidSessionHistoryError(`${r}.id must be a non-empty string.`);
		if (t.has(i)) throw new InvalidSessionHistoryError(`${r}.id "${i}" is not unique.`);
		return t.add(i), {
			...s,
			id: i
		};
	});
}
function rejectUnknownFields(e, t) {
	let n = Object.keys(e).filter((t) => !HISTORY_FIELDS.includes(t) && e[t] !== void 0);
	if (n.length === 0) return;
	let r = n.slice(0, 8).sort().map((e) => JSON.stringify(e.length > 128 ? `${e.slice(0, 128)}…` : e));
	let i = n.length > 8 ? ` (and more)` : ``;
	throw new InvalidSessionHistoryError(`${t} has unknown field${n.length === 1 ? `` : `s`} ${r.join(`, `)}${i}. Accepted fields: ${HISTORY_FIELDS.join(`, `)}.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/input.js
const answerSchema = conforming()(z.object({
	interactionId: z.string(),
	optionId: z.string().optional(),
	text: z.string().optional()
}).strict());
function parseAnswers(e) {
	return answerSchema.array().parse(e).map((e) => e);
}
function isAnswer(e) {
	return z.validate(answerSchema, e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/continuation-token.js
function toChannelLocalContinuationToken(e) {
	let t = e.indexOf(`:`);
	return t < 0 ? e : e.slice(t + 1);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/session.js
function internalSession(e) {
	return e;
}
const SESSION_SEND_OPTION_KEYS = Object.keys({
	auth: !0,
	context: !0,
	history: !0,
	idempotencyKey: !0,
	outputSchema: !0,
	title: !0,
	turnPolicy: !0
});
function toSessionSendOptions(e) {
	validateDeliveryIdempotencyKey(e.idempotencyKey);
	let t = {};
	for (let n of SESSION_SEND_OPTION_KEYS) e[n] !== void 0 && (t[n] = e[n]);
	return t;
}
function createSession(e, t, n = {}) {
	return {
		id: e,
		async send(r, i) {
			validateDeliveryIdempotencyKey(i.idempotencyKey);
			let a = createDelivery(n, i.deliveryId);
			let o = sessionCallbackToTurnCaller(i.callback);
			let s = validateSessionHistory(i.history);
			let c = attachClientContext({ message: serializeFilePartsInMessage(r) }, readClientContext(i));
			i.context !== void 0 && (c.context = i.context), s !== void 0 && (c.history = s), i.outputSchema !== void 0 && (c.outputSchema = i.outputSchema);
			let l = {
				idempotencyKey: i.idempotencyKey,
				auth: i.auth,
				delivery: a,
				kind: `send`,
				payload: c,
				requestId: n.requestId,
				...storedTurnPolicy(i.turnPolicy ?? n.turnPolicy ?? "steer"),
				title: i.title
			};
			return commandDelivery(t, await t.dispatchSession({
				command: o === void 0 ? l : {
					...l,
					caller: o
				},
				sessionId: e,
				inbox: i.inbox
			}), a.deliveryId);
		},
		async respond(r, i) {
			if (validateDeliveryIdempotencyKey(i.idempotencyKey), r.length === 0) throw Error(`respond() requires at least one answer.`);
			let a = parseAnswers(r);
			let o = sessionCallbackToTurnCaller(i.callback);
			let s = createDelivery(n, i.deliveryId);
			let c = attachClientContext({ answers: a }, readClientContext(i));
			i.context !== void 0 && (c.context = i.context), i.outputSchema !== void 0 && (c.outputSchema = i.outputSchema);
			let l = {
				idempotencyKey: i.idempotencyKey,
				auth: i.auth,
				delivery: s,
				kind: `send`,
				payload: c,
				requestId: n.requestId
			};
			return commandDelivery(t, await t.dispatchSession({
				command: o === void 0 ? l : {
					...l,
					caller: o
				},
				sessionId: e,
				inbox: i.inbox
			}), s.deliveryId);
		},
		async cancel(n) {
			let r = controlCommand({
				kind: `cancel`,
				turnId: n?.turnId
			}, n);
			return commandDelivery(t, await t.dispatchSession({
				command: r,
				sessionId: e
			}), r.deliveryId);
		},
		async prewarm() {
			return await t.dispatchSession({
				command: {
					kind: `prewarm`,
					targetDeploymentId: n.acceptedDeploymentId
				},
				sessionId: e
			});
		},
		async compact(n) {
			let r = controlCommand({ kind: `compact` }, n);
			return commandDelivery(t, await t.dispatchSession({
				command: r,
				sessionId: e
			}), r.deliveryId);
		},
		async clear(n) {
			let r = controlCommand({ kind: `clear` }, n);
			return commandDelivery(t, await t.dispatchSession({
				command: r,
				sessionId: e
			}), r.deliveryId);
		},
		async end(n) {
			let r = controlCommand({
				kind: `reset`,
				reason: n?.reason
			}, n);
			return commandDelivery(t, await t.dispatchSession({
				command: r,
				sessionId: e
			}), r.deliveryId, { follow: !1 });
		},
		stream(n) {
			return { [Symbol.asyncIterator]() {
				let r;
				return {
					async next() {
						r ??= t.getEventStream(e, n).then((e) => e.getReader());
						let i = await (await r).read();
						return i.done ? {
							done: !0,
							value: void 0
						} : i;
					},
					async return() {
						return await (await r?.catch(() => void 0))?.cancel(), {
							done: !0,
							value: void 0
						};
					}
				};
			} };
		},
		async getLineStream(n) {
			return t.getLineStream(e, n);
		},
		async getStreamTailIndex() {
			return t.getStreamTailIndex(e);
		},
		async hasRunnableOwner() {
			return await t.hasRunnableOwner?.(e) ?? !0;
		},
		async getChildBinding(n) {
			return await t.readChildBinding?.(e, n);
		}
	};
}
function createAttachSessionFn(e, t = {}) {
	return (n) => createSession(n, e, t);
}
function createDelivery(e, t) {
	let n = createChannelDeliveryMetadata({
		channelKind: `http`,
		channelName: `http`,
		...e
	});
	return t === void 0 ? n : {
		...n,
		deliveryId: t
	};
}
function buildChannelContext(e) {
	return {
		session: {
			get id() {
				return e.get(SessionIdKey) ?? ``;
			},
			get auth() {
				let t = e.get(SteeredByKey);
				return {
					current: e.get(AuthKey) ?? null,
					initiator: e.get(InitiatorAuthKey) ?? null,
					...t !== void 0 && t.length > 0 && { steeredBy: t }
				};
			}
		},
		get continuation() {
			let t = e.get(ContinuationTokenKey);
			if (t !== void 0 && t.length !== 0) return {
				token: toChannelLocalContinuationToken(t),
				alias(n) {
					if (n.length === 0) throw Error(`A session alias requires a nonempty token.`);
					let r = namespaceContinuationToken(t, n);
					t !== r && (e.set(ContinuationHookTokensKey, (e) => {
						let n = e ?? [t];
						return n.includes(r) ? n : [...n, r];
					}), e.set(ContinuationTokenKey, r));
				}
			};
		}
	};
}
function namespaceContinuationToken(e, t) {
	let n = e.indexOf(`:`);
	if (n <= 0) throw Error(`Cannot set session continuation token without an existing namespaced continuation token. Start the session with a placeholder continuationToken.`);
	return `${e.slice(0, n + 1)}${t}`;
}
function sessionCallbackToTurnCaller(e) {
	return e === void 0 ? void 0 : {
		callId: e.callId,
		replyTo: {
			kind: `callback`,
			token: e.token,
			url: e.url
		},
		subagentName: e.subagentName
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/relay-event.js
function relayEvent(e, t) {
	return {
		data: defined(t),
		type: e
	};
}
export { buildChannelContext, commandDelivery, contextStarted, controlAdmitted, controlCommand, controlSettled, createAttachSessionFn, createChannelDeliveryMetadata, createSession, defined, delegatedUsageFact, deliveryApplied, deliveryIdForIdempotencyKey, errorInfoOf, fact, internalSession, isAnswer, normalizeSendInput, parseAnswers, relayEvent, runRequested, runSettledFacts, runStarted, runUsageRecorded, scheduleCollectionToolPrefix, scheduleCollectionToolSlot, serializeFilePartsInMessage, sessionCallbackToTurnCaller, sessionEndedFacts, storedTurnPolicy, toSessionSendOptions, turnSettled, usageOf, validateDeliveryIdempotencyKey, validateSessionHistory };

//# sourceMappingURL=eve17.mjs.map