import { ConversationIdKey, contextStorage } from "./eve13.mjs";
import { attachClientContext, attachInputText, formatTraceContentCeiling, readClientContext, readInputText } from "./eve16.mjs";
import { createContextKey } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/messages.js
function createUserMessage(e, t, n) {
	let r = {
		content: t,
		kind: e,
		role: `user`
	};
	return n === void 0 ? r : {
		...r,
		metadata: n
	};
}
function createImportedHistoryMessages(e) {
	return e.map((e) => e.role === `user` ? createUserMessage(`user`, e.text, { ["eve.imported"]: !0 }) : {
		content: e.text,
		role: `assistant`
	});
}
function createFrameworkUserMessage(e, t, n) {
	return createUserMessage(e, t, n);
}
const TURN_ANCHOR_KEY = `eve.turn`;
function anchorToTurn(e, t) {
	return {
		...e,
		metadata: {
			...e.metadata,
			[TURN_ANCHOR_KEY]: t
		}
	};
}
function turnAnchorOf(e) {
	if (e.role !== `user`) return;
	let t = e.metadata?.[TURN_ANCHOR_KEY];
	return typeof t == `string` ? t : void 0;
}
function isUserMessageKind(e) {
	return e === `user` || isFrameworkMessageKind(e);
}
function isUserModelMessage(e) {
	if (e.role !== `user`) return !1;
	let { kind: t } = e;
	return isUserMessageKind(t);
}
function isFrameworkUserMessage(e) {
	return isUserModelMessage(e) && e.kind !== `user`;
}
function validateHarnessModelMessages(e) {
	let t = [];
	for (let n of e) if (n.role !== `user`) t.push(n);
	else {
		if (!isUserModelMessage(n)) throw TypeError(`Expected every user-role model message to have a kind.`);
		t.push(n);
	}
	return t;
}
function isFrameworkMessageKind(e) {
	return e === `context.instruction` || e === `context.state` || e === `context.compaction` || e === `memory.load` || e === `execution.continuation` || e === `execution.retry` || e === `task.result`;
}
function markFrameworkStepInput(e, t) {
	return {
		...e,
		frameworkMessageKind: t
	};
}
function frameworkMessageKindForStepInput(e) {
	if (e === void 0) return;
	let { frameworkMessageKind: t } = e;
	return isFrameworkMessageKind(t) ? t : void 0;
}
function coalesceTurnInputs(e, t) {
	let n = coalesceAnswers({
		a: e.answers,
		b: t.answers
	});
	let r = coalesceMessage({
		a: e.message,
		b: t.message
	});
	let i = coalesceContext({
		a: e.context,
		b: t.context
	});
	let a = [...e.history ?? [], ...t.history ?? []];
	let o = coalesceFrameworkMessageKind({
		a: e,
		b: t
	});
	let s = coalesceContext({
		a: readClientContext(e),
		b: readClientContext(t)
	});
	let c = t.outputSchema ?? e.outputSchema;
	let l = {};
	let u = [...e.deliveries ?? [], ...t.deliveries ?? []];
	u.length > 0 && (l.deliveries = u), n !== void 0 && (l.answers = n), r !== void 0 && (l.message = r), i !== void 0 && (l.context = i), a.length > 0 && (l.history = a), c !== void 0 && (l.outputSchema = c);
	let d = normalizeMessage(e.message) === void 0 ? readInputText(t) : normalizeMessage(t.message) === void 0 ? readInputText(e) : void 0;
	return attachClientContext(attachInputText(o === void 0 ? l : markFrameworkStepInput(l, o), d), s);
}
function normalizeMessage(e) {
	if (e === void 0) return;
	if (typeof e == `string`) return e.trim().length > 0 ? e : void 0;
	let t = e.filter((e) => e.type !== `text` || e.text.trim().length > 0);
	if (t.length !== 0) return t.length === e.length ? e : t;
}
function followsToolResults(e) {
	return e.findLast((e) => e.role !== `user`)?.role === `tool`;
}
function normalizeModelMessages(e) {
	return e.flatMap((e) => {
		if (typeof e.content == `string`) return e.content.trim().length > 0 ? [e] : [];
		let t = e.content.filter((e) => e.type !== `text` || e.text.trim().length > 0);
		return t.length === 0 ? [] : t.length === e.content.length ? [e] : [{
			...e,
			content: t
		}];
	});
}
function resolveAssistantStepText(e, t) {
	for (let t = e.length - 1; t >= 0; --t) {
		let n = e[t];
		if (n?.role !== `assistant`) continue;
		let r = extractMessageText(n);
		if (r.trim().length > 0) return r;
	}
	return t !== void 0 && t.trim().length > 0 ? t : null;
}
function extractMessageText(e) {
	return typeof e.content == `string` ? e.content : Array.isArray(e.content) ? e.content.flatMap((e) => typeof e == `string` ? [e] : `type` in e && e.type === `text` && typeof e.text == `string` ? [e.text] : []).join(``) : ``;
}
function coalesceAnswers(e) {
	let t = e.a ?? [];
	let n = e.b ?? [];
	if (t.length !== 0 || n.length !== 0) return [...t, ...n];
}
function coalesceContext(e) {
	let t = e.a ?? [];
	let n = e.b ?? [];
	if (t.length !== 0 || n.length !== 0) return [...t, ...n];
}
function coalesceFrameworkMessageKind(e) {
	let t = frameworkMessageKindForStepInput(e.a);
	let n = frameworkMessageKindForStepInput(e.b);
	return e.a.message === void 0 ? n : e.b.message === void 0 || t === n ? t : void 0;
}
function coalesceMessage(e) {
	let t = normalizeMessage(e.a);
	let n = normalizeMessage(e.b);
	return t === void 0 ? n : n === void 0 ? t : appendMessage({
		appended: n,
		existing: t
	});
}
function appendMessage(e) {
	return typeof e.existing == `string` && typeof e.appended == `string` ? `${e.existing}\n\n${e.appended}` : [...partsOf(e.existing), ...partsOf(e.appended)];
}
function partsOf(e) {
	return typeof e == `string` ? e.length > 0 ? [{
		text: e,
		type: `text`
	}] : [] : e;
}
function userContentOf(e) {
	return typeof e == `string` ? e : [...e];
}
function coalesceDeliveries(e) {
	let [t, ...n] = e;
	if (t === void 0) throw Error(`Cannot coalesce an empty delivery batch.`);
	let r = t.auth;
	let i = t.caller;
	let a = t.steeredBy;
	let o = [...t.payloads];
	let s = [...t.deliveryMetadata ?? []];
	for (let e of n) {
		let t = o.length;
		if (e.auth !== void 0 && (r = e.auth), e.caller !== void 0) {
			if (i !== void 0 && i.callId !== e.caller.callId) throw Error(`Cannot coalesce deliveries from different turns.`);
			i = e.caller;
		}
		a = e.steeredBy, o.push(...e.payloads), s.push(...(e.deliveryMetadata ?? []).map((e) => ({
			...e,
			payloadIndex: e.payloadIndex + t
		})));
	}
	let c = {
		...t,
		auth: r,
		caller: i,
		deliveryMetadata: s.length === 0 ? void 0 : s,
		payloads: o
	};
	let l = c;
	return a === void 0 ? delete l.steeredBy : l.steeredBy = a, c;
}
function selectDeliveryPayloads(e, t) {
	let n = t.flatMap(({ index: t }, n) => (e.deliveryMetadata ?? []).filter((e) => e.payloadIndex === t).map((e) => ({
		...e,
		payloadIndex: n
	})));
	return {
		...e,
		payloads: t.map(({ payload: e }) => e),
		deliveryMetadata: n.length === 0 ? void 0 : n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/baggage.js
const EVE_AUDIENCE_KEY = `eve.audience`;
const EVE_PARENT_SESSION_KEY = `eve.parent_session`;
const EVE_TRACE_BAGGAGE_KEYS = [
	EVE_AUDIENCE_KEY,
	`eve.conversation.id`,
	EVE_PARENT_SESSION_KEY
];
const CEILING_PROPERTY_KEY = `ceiling`;
const MAX_BAGGAGE_BYTES = 8192;
const encoder$1 = new TextEncoder();
const decoder = new TextDecoder(`utf-8`, { ignoreBOM: !0 });
function readForwardedParentSessionBaggage(e) {
	let t = readBaggageMember(e, EVE_PARENT_SESSION_KEY);
	if (typeof t == `string`) return t;
	if (t.properties.length !== 0) return `malformed`;
	let n;
	try {
		n = JSON.parse(t.value);
	} catch {
		return `malformed`;
	}
	if (typeof n != `object` || !n || Array.isArray(n)) return `malformed`;
	let r = n;
	let i = r.turn;
	return typeof r.callId != `string` || r.callId.length === 0 || typeof r.rootSessionId != `string` || r.rootSessionId.length === 0 || typeof r.sessionId != `string` || r.sessionId.length === 0 || i === void 0 || typeof i.id != `string` || i.id.length === 0 || !Number.isSafeInteger(i.sequence) || i.sequence < 0 ? `malformed` : {
		callId: r.callId,
		rootSessionId: r.rootSessionId,
		sessionId: r.sessionId,
		turn: {
			id: i.id,
			sequence: i.sequence
		}
	};
}
function writeForwardedParentSessionBaggage(e, t) {
	return replaceBaggageMember(e, EVE_PARENT_SESSION_KEY, t === void 0 ? void 0 : encodeURIComponent(JSON.stringify(t)));
}
function readForwardedAudienceBaggage(e) {
	let t = readBaggageMember(e, EVE_AUDIENCE_KEY);
	if (typeof t == `string`) return t;
	let n = t.value;
	if (n !== `public` && n !== `private` && n !== `unknown`) return `malformed`;
	let r = t.properties[0];
	if (t.properties.length !== 1 || r?.key !== CEILING_PROPERTY_KEY) return `malformed`;
	let i = r.value === void 0 ? void 0 : parseCeiling(r.value);
	return i === void 0 ? `malformed` : {
		ceiling: i,
		originAudience: n
	};
}
function writeForwardedAudienceBaggage(e, t) {
	return replaceBaggageMember(e, EVE_AUDIENCE_KEY, t === void 0 ? void 0 : `${t.originAudience};${CEILING_PROPERTY_KEY}=${formatTraceContentCeiling(t.ceiling)}`);
}
function stripEveTraceBaggage(e) {
	let t = e.baggage;
	if (t !== void 0) {
		for (let e of EVE_TRACE_BAGGAGE_KEYS) t = replaceBaggageMember(t, e, void 0);
		t === void 0 || encoder$1.encode(t).byteLength > MAX_BAGGAGE_BYTES ? delete e.baggage : e.baggage = t;
	}
}
function readBaggageMember(e, t) {
	if (e === null) return `absent`;
	if (e.length > MAX_BAGGAGE_BYTES || encoder$1.encode(e).byteLength > MAX_BAGGAGE_BYTES) return `malformed`;
	let n = baggageMembers(e).filter((e) => baggageKey(e) === t);
	if (n.length === 0) return `absent`;
	if (n.length !== 1) return `malformed`;
	let [r, ...i] = n[0].split(`;`);
	let a = parsePair(r);
	if (a?.value === void 0) return `malformed`;
	let o = [];
	for (let e of i) {
		let t = parsePair(e);
		if (t === void 0) return `malformed`;
		o.push(t);
	}
	return {
		value: a.value,
		properties: o
	};
}
function replaceBaggageMember(e, t, n) {
	let r = baggageMembers(e ?? ``).filter((e) => baggageKey(e) !== t);
	if (n !== void 0) {
		let e = [...r, `${t}=${n}`].join(`,`);
		if (encoder$1.encode(e).byteLength > MAX_BAGGAGE_BYTES) throw Error(`Cannot forward baggage: header exceeds 8192 bytes. Reduce remote.headers.baggage.`);
		return e;
	}
	return r.join(`,`) || void 0;
}
function baggageMembers(e) {
	return e.split(`,`).map(trimOws).filter(Boolean);
}
function parsePair(e) {
	let t = e.indexOf(`=`);
	let n = trimOws(t < 0 ? e : e.slice(0, t));
	if (!/^[!#$%&'*+\-.^_`|~\w]+$/u.test(n)) return;
	if (t < 0) return { key: n };
	let r = trimOws(e.slice(t + 1));
	if (!/^[\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]*$/u.test(r) || /%(?![\da-f]{2})/iu.test(r)) return;
	let i = Uint8Array.from(r.match(/%[\da-f]{2}|./giu) ?? [], (e) => e.startsWith(`%`) ? Number.parseInt(e.slice(1), 16) : e.charCodeAt(0));
	return {
		key: n,
		value: decoder.decode(i)
	};
}
function parseCeiling(e) {
	let t = /^i([01])o([01])$/u.exec(e);
	return t === null ? void 0 : {
		recordInputs: t[1] === `1`,
		recordOutputs: t[2] === `1`
	};
}
function trimOws(e) {
	return e.replace(/^[\t ]+|[\t ]+$/gu, ``);
}
function baggageKey(e) {
	let t = e.split(`;`, 1)[0];
	let n = t.indexOf(`=`);
	return (n < 0 ? t : t.slice(0, n)).trim();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/conversation-identity.js
const MAX_ID_BYTES = 1024;
const encoder = new TextEncoder();
function readConversationId(e) {
	if (!(typeof e != `string` || e.length === 0 || e.length > MAX_ID_BYTES || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(e) || encoder.encode(e).byteLength > MAX_ID_BYTES)) try {
		return encodeURIComponent(e), e;
	} catch {
		return;
	}
}
function resolveConversationId(e) {
	return readConversationId(contextStorage.getStore()?.get(ConversationIdKey)) ?? e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/conversation-context.js
const BAGGAGE_KEY = `eve.conversation.id`;
const CONVERSATION_KEY = createContextKey(`eve.trace.conversation.id`);
const TRACE_SESSION_KEY = createContextKey(`eve.trace.session.id`);
function withConversationId(e, t) {
	return e.setValue(CONVERSATION_KEY, t);
}
function traceSessionIdOf(e) {
	return e.traceSessionId ?? e.rootSessionId ?? e.sessionId;
}
function operationConversationId(e) {
	return resolveConversationId(e.rootSessionId ?? e.sessionId);
}
function withOperationTraceContext(e, t) {
	return withConversationId(e, operationConversationId(t)).setValue(TRACE_SESSION_KEY, traceSessionIdOf(t));
}
function readConversationBaggage(e) {
	let t = readBaggageMember(e, BAGGAGE_KEY);
	return typeof t == `string` ? void 0 : readConversationId(t.value);
}
function writeConversationBaggage(e, t) {
	let n = readConversationId(t);
	return n === void 0 ? e : replaceBaggageMember(e, BAGGAGE_KEY, encodeURIComponent(n));
}
export { anchorToTurn, appendMessage, coalesceDeliveries, coalesceTurnInputs, createFrameworkUserMessage, createImportedHistoryMessages, createUserMessage, followsToolResults, frameworkMessageKindForStepInput, isFrameworkUserMessage, isUserMessageKind, isUserModelMessage, normalizeMessage, normalizeModelMessages, readConversationBaggage, readConversationId, readForwardedAudienceBaggage, readForwardedParentSessionBaggage, resolveAssistantStepText, resolveConversationId, selectDeliveryPayloads, stripEveTraceBaggage, turnAnchorOf, userContentOf, validateHarnessModelMessages, withOperationTraceContext, writeConversationBaggage, writeForwardedAudienceBaggage, writeForwardedParentSessionBaggage };

//# sourceMappingURL=eve18.mjs.map