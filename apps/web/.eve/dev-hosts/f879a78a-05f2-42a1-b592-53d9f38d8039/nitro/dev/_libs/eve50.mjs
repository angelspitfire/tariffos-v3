import { __exportAll, __reExport } from "../_runtime.mjs";
import { resolveInstalledPackageInfo } from "./eve4.mjs";
import { createEveCallbackRoutePath } from "./eve6.mjs";
import { jsonObjectSchema } from "./eve9.mjs";
import { isSessionCommandHookToken, isSessionInboxHookToken, logicalSessionInboxToken, logicalSessionToken, sessionCommandHookToken, sessionInboxHookToken } from "./eve12.mjs";
import { ChannelRequestIdKey, OtelTraceEnabledKey, ScheduleIdKey, SessionTitleKey, SessionTraceSeedKey, stubResponseNamespace } from "./eve13.mjs";
import { isNonEmptyString, isObject } from "./eve14.mjs";
import { ConversationContextKey, FACT_CATALOG, emptySessionView, foldLine, intersectInstrumentationDecisions, isSampledTrace, normalizeConversationContext, resolveForwardedTraceSeed, shouldCaptureInstrumentationContent } from "./eve16.mjs";
import { relayEvent, scheduleCollectionToolSlot } from "./eve17.mjs";
import { coalesceTurnInputs, readConversationBaggage, resolveConversationId } from "./eve18.mjs";
import { walkCauseChain } from "./eve22.mjs";
import { isLocalDevelopmentServer } from "./eve28.mjs";
import { isBlockedDestinationHost } from "./eve29.mjs";
import { declared, normalizePublicEveRoutePath } from "./eve35.mjs";
import { cascade } from "./eve36.mjs";
import { traceContext } from "./eve54.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Validator } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@cfworker/json-schema/index.js";
import { registerStepFunction } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/private.js";
import * as workflowRuntime from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/runtime.js";
import { resolveRunEncryptionKey } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/runtime/helpers.js";
import { getWritable } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/index.js";
import { HookNotFoundError, WorkflowWorldError } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/errors/index.js";
import { HookSchema, startHookId } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/world/index.js";
import { createAgentDelegationTransport } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/delegation.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/principal-identity.js
function principalIdentity(e) {
	return [
		e.authenticator,
		e.issuer ?? ``,
		e.principalType,
		e.principalId,
		e.subject ?? ``
	];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/envelope.js
const HEARTBEAT_RECORD = { $eve: `heartbeat` };
const LEASE_ENDED_RECORD = { $eve: `stream.lease-ended` };
const STREAM_ENDED_RECORD = { $eve: `stream.ended` };
function classifyRecord(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return {
		kind: `invalid`,
		value: e
	};
	let t = e;
	if (typeof t.$eve == `string`) switch (t.$eve) {
		case `position`: return typeof t.next == `number` && Number.isSafeInteger(t.next) ? {
			kind: `transport`,
			record: {
				$eve: `position`,
				next: t.next
			}
		} : {
			kind: `unknown-transport`,
			name: t.$eve
		};
		case `heartbeat`:
		case `stream.lease-ended`:
		case `stream.ended`: return {
			kind: `transport`,
			record: { $eve: t.$eve }
		};
		default: return {
			kind: `unknown-transport`,
			name: t.$eve
		};
	}
	return Array.isArray(t.facts) && typeof t.at == `string` ? {
		kind: `commit`,
		line: e
	} : t.progress !== null && typeof t.progress == `object` ? {
		kind: `progress`,
		line: e
	} : {
		kind: `invalid`,
		value: e
	};
}
function isStoredLine(e) {
	let { kind: t } = classifyRecord(e);
	return t === `commit` || t === `progress`;
}
function encodeLine(e) {
	return `${JSON.stringify(e)}\n`;
}
var SessionLineTooLargeError = class extends Error {
	bytes;
	constructor(e) {
		super(`Session commit is ${e} bytes; the limit is 8388608. A commit cannot be split. Reduce inline content or use a supported value reference.`), this.name = `SessionLineTooLargeError`, this.bytes = e;
	}
};
const lineEncoder = new TextEncoder();
function encodeLineBytes(e) {
	let t = lineEncoder.encode(encodeLine(e));
	if (t.byteLength > 8388608) throw new SessionLineTooLargeError(t.byteLength);
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/v26-lines.js
function isV26Line(e) {
	return typeof e == `object` && !!e && !Array.isArray(e) && typeof e.type == `string` && !isStoredLine(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/v26-interactions.js
function v26InteractionRequest(e) {
	let t = e.kind === `tool-approval` ? `approval` : e.kind === `session-limit` ? `budget` : `question`;
	let n = Array.isArray(e.options) ? e.options.flatMap((e) => isRecord$1(e) && typeof e.id == `string` && typeof e.label == `string` ? [{
		id: e.id,
		label: e.label,
		description: str$1(e.description),
		style: e.style === `primary` || e.style === `danger` || e.style === "default" ? e.style : void 0
	}] : []) : void 0;
	let r = e.display;
	return {
		allowFreeform: typeof e.allowFreeform == `boolean` ? e.allowFreeform : void 0,
		display: r === `confirmation` || r === `select` || r === `text` ? r : void 0,
		kind: t,
		options: n,
		prompt: str$1(e.prompt) ?? ``
	};
}
function v26InteractionOutcome(e) {
	switch (e) {
		case `answered`:
		case `approved`: return `accepted`;
		case `denied`: return `declined`;
		case `invalid`: return `invalid`;
		default: return `withdrawn`;
	}
}
function v26SignInRequest(e) {
	let t = isRecord$1(e.authorization) ? e.authorization : {};
	let n = str$1(e.name) ?? `sign-in`;
	let r = str$1(t.url);
	return {
		kind: `sign-in`,
		link: r === void 0 ? void 0 : { url: r },
		prompt: str$1(e.description) ?? `Sign in to ${n}.`,
		signIn: {
			callbackUrl: str$1(e.webhookUrl),
			displayName: str$1(t.displayName),
			expiresAt: str$1(t.expiresAt),
			grant: str$1(e.grant),
			instructions: str$1(t.instructions),
			name: n,
			principal: isRecord$1(e.principal) && typeof e.principal.type == `string` ? {
				id: str$1(e.principal.id),
				issuer: str$1(e.principal.issuer),
				type: e.principal.type
			} : void 0,
			url: r,
			userCode: str$1(t.userCode)
		}
	};
}
function v26SignInOutcome(e) {
	return e === `authorized` ? `accepted` : e === `declined` ? `declined` : e === `timed-out` ? `expired` : `failed`;
}
function str$1(e) {
	return typeof e == `string` ? e : void 0;
}
function isRecord$1(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/v26-history.js
function createV26HistoryReader() {
	let e = emptySessionView();
	let t = new Translator(e);
	return { read(n, r) {
		if (isStoredLine(n)) {
			let i = n;
			return `facts` in i && t.noteIntroduced(i.facts), foldLine(e, i, r, { retention: `operational` }), i;
		}
		if (!isV26Line(n)) return;
		let i = n;
		let a = isRecord(i.data) ? i.data : {};
		let o = isRecord(i.meta) ? i.meta : {};
		let s = typeof o.at == `string` ? o.at : (/* @__PURE__ */ new Date(0)).toISOString();
		let c = Array.isArray(o.deliveryIds) ? o.deliveryIds.filter((e) => typeof e == `string`) : [];
		let l = t.factsOf(i.type, a, {
			deliveryIds: c,
			position: r
		});
		if (l.length === 0) return;
		let u = JSON.parse(JSON.stringify(l));
		let d = cascade(e, u);
		let f = {
			at: s,
			facts: d
		};
		return t.noteIntroduced(d), foldLine(e, f, r, { retention: `operational` }), f;
	} };
}
function v26LineStream(e, t) {
	let n = createV26HistoryReader();
	let r = 0;
	return e.pipeThrough(new TransformStream({ transform(e, i) {
		let a = r;
		r += 1;
		let o = n.read(e, a);
		a < t || i.enqueue(o ?? {
			$eve: `position`,
			next: a + 1
		});
	} }));
}
var Translator = class {
	turnId;
	follows = null;
	runs = /* @__PURE__ */ new Map();
	partCounts = /* @__PURE__ */ new Map();
	reply;
	taskCalls = /* @__PURE__ */ new Set();
	approvals = /* @__PURE__ */ new Map();
	interactionCalls = /* @__PURE__ */ new Map();
	children = /* @__PURE__ */ new Map();
	compaction;
	pendingHistory;
	startingDelivery;
	introduced = /* @__PURE__ */ new Set();
	view;
	constructor(e) {
		this.view = e;
	}
	noteIntroduced(e) {
		for (let t of e) {
			let e = FACT_CATALOG[t.type];
			if (e?.role !== `introduces`) continue;
			let n = t.data[e.idField];
			typeof n == `string` && this.introduced.add(`${e.family}:${n}`);
		}
	}
	isIntroduced(e, t) {
		return this.introduced.has(`${e}:${t}`);
	}
	factsOf(e, t, n) {
		let r = `v26_${String(n.position)}`;
		switch (e) {
			case `session.started`: return [{
				data: sessionStarted(t),
				type: `session.started`
			}];
			case `turn.started`: return this.startTurn(str(t.turnId), n, t);
			case `history.imported`: return this.pendingHistory = Array.isArray(t.messages) ? t.messages.flatMap((e) => isRecord(e) && (e.role === `user` || e.role === `assistant`) && typeof e.text == `string` ? [{
				id: str(e.id),
				role: e.role,
				text: e.text
			}] : []) : void 0, [];
			case `message.received`: return this.received(t, n, r);
			case `step.started`: return this.stepStarted(t, r);
			case `reasoning.completed`: return this.content(t, `reasoning`, `narration`, str(t.reasoning), r);
			case `message.completed`: return this.content(t, `text`, t.finishReason === `tool-calls` ? `narration` : `reply`, str(t.message), r);
			case `result.completed`: return this.content(t, `result`, `reply`, json(t.result), r);
			case `step.completed`: return this.stepSettled(t, `completed`);
			case `step.failed`: return this.stepSettled(t, `failed`);
			case `actions.requested`: return this.actionsRequested(t);
			case `action.result`: return this.actionResult(t);
			case `task.started`: return this.taskStarted(t);
			case `task.settled`: return this.taskSettled(t);
			case `agent.started`: return this.agentStarted(t);
			case `input.requested`: return this.inputRequested(t);
			case `turn.waiting`: return this.turnWaiting(t);
			case `input.resolved`: return this.inputResolved(t, n, r);
			case `authorization.required`: return this.authorizationRequired(t, r);
			case `authorization.completed`: return this.authorizationCompleted(t);
			case `turn.completed`: return this.endTurn(str(t.turnId), { outcome: `completed` });
			case `turn.cancelled`: return this.endTurn(str(t.turnId), { outcome: `cancelled` });
			case `turn.failed`: return this.endTurn(str(t.turnId), {
				error: errorOf(t),
				outcome: `failed`
			});
			case `context.cleared`: return this.follows = null, [{
				data: {
					changeId: r,
					kind: `clear`
				},
				type: `context.started`
			}, {
				data: {
					changeId: r,
					kind: `clear`,
					outcome: `completed`,
					selects: null
				},
				type: `context.settled`
			}];
			case `compaction.requested`: return this.compactionRequested(t, r);
			case `compaction.completed`: return this.compactionSettled(`completed`);
			case `session.waiting`: return this.compaction === void 0 ? [] : this.compactionSettled(`failed`);
			case `session.completed`: return [{
				data: { outcome: `completed` },
				type: `session.ended`
			}];
			case `session.failed`: return sessionFailed(t, r);
			default: return [];
		}
	}
	startTurn(e, t, n = {}) {
		if (e === void 0 || this.isIntroduced(`turn`, e)) return [];
		let r = [];
		let i = this.unadmitted(t, `v26_${String(t.position)}`);
		return r.push(...this.admit(i)), r.push({
			data: {
				cause: { deliveryId: i },
				follows: this.follows,
				trace: traceContext.safeParse(n.trace).data,
				turnId: e
			},
			type: `turn.started`
		}), this.turnId = e, this.follows = e, this.reply = void 0, this.startingDelivery = i, r;
	}
	received(e, t, n) {
		let r = str(e.turnId);
		if (r === void 0) return [];
		let i = this.isIntroduced(`turn`, r) ? [] : this.startTurn(r, t);
		let a = this.startingDelivery !== void 0 && this.view.deliveries[this.startingDelivery]?.status === `admitted` ? this.startingDelivery : this.unadmitted(t, n);
		this.startingDelivery = void 0, i.some((e) => e.type === `delivery.admitted` && e.data.deliveryId === a) || i.push(...this.admit(a));
		let o = this.pendingHistory;
		return this.pendingHistory = void 0, i.push({
			data: {
				deliveryId: a,
				history: o !== void 0 && o.length > 0 ? o : void 0,
				parts: userParts(e),
				turnId: r
			},
			type: `delivery.consumed`
		}), i;
	}
	unadmitted(e, t) {
		return e.deliveryIds.find((e) => !this.isIntroduced(`delivery`, e) || this.view.deliveries[e]?.status === `admitted`) ?? t;
	}
	admit(e) {
		return this.isIntroduced(`delivery`, e) ? [] : [{
			data: { deliveryId: e },
			type: `delivery.admitted`
		}];
	}
	runOf(e) {
		let t = str(e.turnId);
		if (t !== void 0 && typeof e.stepIndex == `number`) return this.runs.get(`${t}:${String(e.stepIndex)}`);
	}
	stepStarted(e, t) {
		let n = str(e.turnId);
		if (n === void 0 || this.view.turns[n]?.status !== `running` || typeof e.stepIndex != `number`) return [];
		let r = `${n}:${String(e.stepIndex)}`;
		if (this.runs.has(r)) return [];
		let i = t;
		return this.runs.set(r, i), [{
			data: {
				owner: { turnId: n },
				runId: i
			},
			type: `model.requested`
		}, {
			data: {
				attempt: 0,
				modelId: str(e.modelId) ?? `unknown`,
				runId: i
			},
			type: `model.started`
		}];
	}
	content(e, t, n, r, i) {
		if (r === void 0) return [];
		let a = this.runOf(e) === void 0 ? this.stepStarted(e, i) : [];
		let o = this.runOf(e);
		if (o === void 0 || !(this.isOpenRun(o) || a.length > 0)) return [];
		let s = this.partCounts.get(o) ?? 0;
		this.partCounts.set(o, s + 1);
		let c = `${o}.${String(s)}`;
		return n === `reply` && (this.reply?.runId !== o && (this.reply = {
			parts: [],
			runId: o
		}), this.reply.parts.push(c)), [...a, {
			data: {
				kind: t,
				partId: c,
				phase: n,
				runId: o,
				value: r
			},
			type: `content.completed`
		}];
	}
	stepSettled(e, t) {
		let n = this.runOf(e);
		if (n === void 0 || !this.isOpenRun(n)) return [];
		let r = [{
			data: {
				error: t === `failed` ? errorOf(e) : void 0,
				finishReason: typeof e.finishReason == `string` ? e.finishReason : void 0,
				outcome: t,
				runId: n
			},
			type: `model.settled`
		}];
		let i = isRecord(e.usage) ? e.usage : void 0;
		return i !== void 0 && r.push({
			data: {
				kind: `model`,
				owner: { runId: n },
				usage: {
					cacheReadTokens: num(i.cacheReadTokens),
					cacheWriteTokens: num(i.cacheWriteTokens),
					costUsd: typeof i.costUsd == `number` ? i.costUsd : void 0,
					inputTokens: num(i.inputTokens),
					outputTokens: num(i.outputTokens)
				}
			},
			type: `usage.recorded`
		}), r;
	}
	isOpenRun(e) {
		let t = this.view.runs[e]?.status;
		return t !== void 0 && t !== `settled`;
	}
	actionsRequested(e) {
		let t = this.runOf(e);
		if (t === void 0 || !Array.isArray(e.actions)) return [];
		let n = isRecord(e.presentation) ? e.presentation : {};
		return e.actions.flatMap((e) => {
			if (!isRecord(e)) return [];
			let r = str(e.callId);
			return r === void 0 || this.isIntroduced(`call`, r) ? [] : [{
				data: {
					callId: r,
					capability: capabilityOf(e, str((isRecord(n[r]) ? n[r] : {}).label)),
					input: e.input === void 0 ? void 0 : e.input,
					owner: { runId: t }
				},
				type: `call.requested`
			}];
		});
	}
	startCall(e, t) {
		if (this.view.calls[e]?.status !== `requested`) return [];
		let n = this.approvals.get(e);
		return [{
			data: {
				callId: e,
				clearedBy: n === void 0 ? void 0 : { interactionId: n },
				taskId: t
			},
			type: `call.started`
		}];
	}
	actionResult(e) {
		let t = isRecord(e.result) ? e.result : {};
		let n = str(t.callId);
		let r = n === void 0 ? void 0 : this.view.calls[n];
		if (n === void 0 || r === void 0 || r.status === `settled` || this.taskCalls.has(n)) return [];
		let i = isRecord(e.error) ? errorOf(e.error) : void 0;
		if (e.status === `rejected`) {
			let e = this.approvals.get(n);
			return [{
				data: {
					callId: n,
					cause: e === void 0 ? void 0 : { interactionId: e },
					error: i,
					outcome: `rejected`,
					output: t.output === void 0 ? void 0 : t.output
				},
				type: `call.settled`
			}];
		}
		let a = e.status === `failed` ? `failed` : `completed`;
		return [...this.startCall(n), {
			data: {
				callId: n,
				error: a === `failed` && i !== void 0 ? i : void 0,
				outcome: a,
				output: t.output === void 0 ? void 0 : t.output
			},
			type: `call.settled`
		}];
	}
	taskStarted(e) {
		let t = str(e.taskId);
		let n = str(e.callId);
		if (t === void 0 || n === void 0 || this.view.calls[n] === void 0) return [];
		this.taskCalls.add(n);
		let r = [];
		return this.isIntroduced(`task`, t) || r.push({
			data: {
				kind: str(e.kind) ?? `tool`,
				name: str(e.name) ?? this.view.calls[n].capability.name,
				startedBy: { callId: n },
				taskId: t
			},
			type: `task.started`
		}), r.push(...this.startCall(n, t)), r;
	}
	taskSettled(e) {
		let t = str(e.callId);
		let n = t === void 0 ? void 0 : this.view.calls[t];
		if (t === void 0 || n === void 0 || n.status === `settled`) return [];
		let r = this.startCall(t, str(e.taskId));
		let i = e.status;
		let a = i === `completed` ? `completed` : i === `failed` ? `failed` : `interrupted`;
		let o = isRecord(e.cancel) ? str(e.cancel.reason) : void 0;
		return r.push({
			data: {
				callId: t,
				error: isRecord(e.error) && typeof e.error.message == `string` ? {
					code: `task_failed`,
					message: e.error.message
				} : void 0,
				outcome: a,
				output: e.output === void 0 ? void 0 : e.output,
				reason: o === void 0 ? void 0 : o.replaceAll(`_`, `-`)
			},
			type: `call.settled`
		}), r;
	}
	agentStarted(e) {
		let t = childStarted(e);
		let n = t === void 0 ? void 0 : this.view.calls[t.callId];
		if (t === void 0 || n === void 0) return [];
		let { callId: r, name: i, sessionId: a, stream: o } = t;
		this.children.set(`call:${r}`, a);
		let s = str(e.taskId);
		return s !== void 0 && this.children.set(`task:${s}`, a), this.isIntroduced(`child`, a) ? [] : [{
			data: {
				name: i ?? n.capability.name,
				owner: { callId: r },
				sessionId: a,
				stream: o
			},
			type: `child.opened`
		}];
	}
	inputRequested(e) {
		if (!Array.isArray(e.requests)) return [];
		let t = str(e.callId);
		let n = str(e.taskId);
		let r = str(e.turnId);
		return e.requests.flatMap((e) => {
			if (!isRecord(e)) return [];
			let i = str(e.requestId);
			if (i === void 0 || this.isIntroduced(`interaction`, i)) return [];
			let a = isRecord(e.action) ? e.action : {};
			let o = t ?? str(a.callId);
			let s = o !== void 0 && this.view.calls[o] !== void 0 ? { callId: o } : n !== void 0 && this.view.tasks[n] !== void 0 ? { taskId: n } : r === void 0 ? void 0 : { turnId: r };
			if (s === void 0) return [];
			let c = this.originOf(i, a, t, n);
			return o !== void 0 && e.kind === `tool-approval` && c === void 0 && this.interactionCalls.set(i, o), [{
				data: {
					interactionId: i,
					origin: c,
					request: v26InteractionRequest(e),
					subject: s
				},
				type: `interaction.opened`
			}];
		});
	}
	originOf(e, t, n, r) {
		let i = str(t.callId);
		let a = n ?? (r === void 0 ? void 0 : this.view.tasks[r]?.startedBy.callId);
		if (i === void 0 || a === void 0 || i === a) return;
		let o = r ?? this.view.calls[a]?.taskId;
		let s = this.children.get(`call:${a}`) ?? (o === void 0 ? void 0 : this.children.get(`task:${o}`));
		if (s !== void 0) return {
			call: {
				callId: i,
				input: t.input === void 0 ? void 0 : t.input,
				name: str(t.toolName) ?? str(t.name) ?? `tool`
			},
			interactionId: e,
			sessionId: s
		};
	}
	turnWaiting(e) {
		let t = str(e.turnId);
		if (e.on !== `input` || t === void 0) return [];
		let n = Object.values(this.view.interactions).filter((e) => e.status === `open`).map((e) => ({ interactionId: e.interactionId }));
		if (n.length === 0 || this.view.turns[t]?.status !== `running`) return [];
		let r = [{
			data: {
				awaiting: n,
				turnId: t
			},
			type: `turn.paused`
		}];
		for (let e of Object.values(this.view.deliveries)) e.status === `consumed` && e.turnId === t && r.push({
			data: {
				deliveryId: e.deliveryId,
				outcome: `awaiting-input`,
				turnId: t
			},
			type: `delivery.settled`
		});
		return r;
	}
	inputResolved(e, t, n) {
		if (!Array.isArray(e.resolutions)) return [];
		let r = str(e.turnId) ?? this.turnId;
		let i = this.unadmitted(t, `${n}_answers`);
		let a = [...this.admit(i)];
		let o = !1;
		return e.resolutions.forEach((e, t) => {
			if (!isRecord(e)) return;
			let n = str(e.requestId);
			if (n === void 0 || this.view.interactions[n]?.status !== `open`) return;
			let r = isRecord(e.response) ? e.response : {};
			let s = {};
			typeof r.optionId == `string` && (s.optionId = r.optionId), typeof r.text == `string` && (s.text = r.text);
			let c = v26InteractionOutcome(e.outcome);
			let l = `response_${i}_${String(t)}`;
			o = !0, a.push({
				data: {
					deliveryId: i,
					interactionId: n,
					responseId: l,
					value: s
				},
				type: `response.submitted`
			}, {
				data: { responseId: l },
				type: `response.admitted`
			}, {
				data: {
					outcome: `applied`,
					responseId: l
				},
				type: `response.settled`
			}, {
				data: {
					cause: { responseId: l },
					interactionId: n,
					outcome: c,
					response: Object.keys(s).length === 0 ? void 0 : s
				},
				type: `interaction.settled`
			});
			let u = this.interactionCalls.get(n);
			u !== void 0 && this.approvals.set(u, n);
		}), o ? (r !== void 0 && this.view.turns[r]?.status === `running` && a.push({
			data: {
				deliveryId: i,
				parts: [],
				turnId: r
			},
			type: `delivery.consumed`
		}), a) : [];
	}
	authorizationRequired(e, t) {
		let n = str(e.attemptId) ?? t;
		if (this.isIntroduced(`interaction`, n)) return [];
		let r = str(e.taskId);
		let i = str(e.turnId);
		let a = r !== void 0 && this.view.tasks[r] !== void 0 ? { taskId: r } : i === void 0 ? void 0 : { turnId: i };
		if (a === void 0) return [];
		let o = v26SignInRequest(e);
		let s = str(e.principalId);
		return [{
			data: {
				audience: s === void 0 ? void 0 : { principalIds: [s] },
				interactionId: n,
				request: o,
				subject: a
			},
			type: `interaction.opened`
		}];
	}
	authorizationCompleted(e) {
		let t = str(e.attemptId);
		return t === void 0 || this.view.interactions[t]?.status !== `open` ? [] : [{
			data: {
				interactionId: t,
				outcome: v26SignInOutcome(e.outcome),
				reason: str(e.reason)
			},
			type: `interaction.settled`
		}];
	}
	endTurn(e, t) {
		if (e === void 0 || this.view.turns[e]?.status !== `running`) return [];
		let n = t.outcome === `completed` ? this.reply?.parts : void 0;
		return this.turnId = void 0, this.reply = void 0, [{
			data: {
				error: t.error === void 0 ? void 0 : t.error,
				outcome: t.outcome,
				reply: n === void 0 || n.length === 0 ? void 0 : n,
				turnId: e
			},
			type: `turn.settled`
		}];
	}
	compactionRequested(e, t) {
		if (this.compaction !== void 0) return [];
		this.compaction = t;
		let n = str(e.turnId);
		let r = n !== void 0 && this.view.turns[n]?.status === `running`;
		let i = typeof e.usageInputTokens == `number` ? e.usageInputTokens : void 0;
		return [{
			data: {
				changeId: t,
				kind: `compaction`,
				trigger: i === void 0 ? void 0 : { inputTokens: i },
				turnId: r ? n : void 0
			},
			type: `context.started`
		}];
	}
	compactionSettled(e) {
		let t = this.compaction;
		return this.compaction = void 0, t === void 0 || this.view.changes[t]?.status !== `running` ? [] : [{
			data: {
				changeId: t,
				error: e === `failed` ? {
					code: `COMPACTION_FAILED`,
					message: `The compaction did not complete.`
				} : void 0,
				kind: `compaction`,
				outcome: e
			},
			type: `context.settled`
		}];
	}
};
function v26ChildStarted(e) {
	if (!isV26Line(e)) return;
	let t = e;
	if (t.type === `agent.started` && isRecord(t.data)) return childStarted(t.data);
}
function childStarted(e) {
	let t = str(e.sessionId);
	let n = str(e.callId);
	if (t !== void 0 && n !== void 0) return {
		callId: n,
		name: str(e.name),
		sessionId: t,
		stream: str(e.streamPath) ?? `/eve/v1/session/${t}/stream`
	};
}
function sessionStarted(e) {
	let t = isRecord(e.invocation) ? e.invocation : void 0;
	let n = str(t?.parentSessionId);
	let r = str(t?.parentCallId);
	let i = isRecord(e.predecessor) ? str(e.predecessor.sessionId) : void 0;
	return {
		parent: n !== void 0 && r !== void 0 ? {
			callId: r,
			sessionId: n
		} : void 0,
		predecessor: i === void 0 ? void 0 : { sessionId: i },
		runtime: isRecord(e.runtime) && typeof e.runtime.agentId == `string` ? e.runtime : void 0,
		trace: traceContext.safeParse(e.trace).data
	};
}
function sessionFailed(e, t) {
	let n = errorOf(e);
	let r = isRecord(e.details) ? e.details : {};
	return n.code !== `session_stranded` || typeof r.trigger != `string` ? [{
		data: {
			error: n,
			outcome: `failed`
		},
		type: `session.ended`
	}] : r.trigger === `reset` ? [{
		data: {
			deliveryId: t,
			source: { control: `reset` }
		},
		type: `delivery.admitted`
	}, {
		data: {
			cause: { deliveryId: t },
			error: n,
			outcome: `failed`
		},
		type: `session.ended`
	}] : [{
		data: {
			cause: { policy: `stranded-${r.trigger}` },
			error: n,
			outcome: `failed`
		},
		type: `session.ended`
	}];
}
function capabilityOf(e, t) {
	let n = t === void 0 ? {} : { label: t };
	switch (e.kind) {
		case `subagent-call`: return {
			kind: `agent`,
			name: str(e.name) ?? str(e.subagentName) ?? `agent`,
			...n
		};
		case `remote-agent-call`: return {
			kind: `agent`,
			name: str(e.name) ?? str(e.remoteAgentName) ?? `agent`,
			remote: !0,
			...n
		};
		case `load-skill`: return {
			kind: `skill`,
			name: str(e.name) ?? `skill`,
			...n
		};
		default: {
			let t = str(e.toolName) ?? str(e.name) ?? `tool`;
			return {
				kind: t.startsWith(`eve__task_`) ? `control` : `tool`,
				name: t,
				...n
			};
		}
	}
}
function userParts(e) {
	return Array.isArray(e.parts) ? e.parts.flatMap((e) => {
		if (!isRecord(e)) return [];
		if (e.type === `text` && typeof e.text == `string`) return [{
			kind: `text`,
			text: e.text
		}];
		if (e.type === `file` && typeof e.mediaType == `string`) {
			let t = str(e.url);
			return [{
				filename: str(e.filename),
				kind: `file`,
				mediaType: e.mediaType,
				size: typeof e.size == `number` ? e.size : void 0,
				unavailable: t === void 0 || void 0,
				url: t
			}];
		}
		return [];
	}) : typeof e.message == `string` ? [{
		kind: `text`,
		text: e.message
	}] : [];
}
function errorOf(e) {
	return {
		code: str(e.code) ?? `unknown`,
		message: str(e.message) ?? `Unknown error.`,
		name: str(e.name)
	};
}
function str(e) {
	return typeof e == `string` ? e : void 0;
}
function num(e) {
	return typeof e == `number` && Number.isFinite(e) ? e : 0;
}
function json(e) {
	return e === void 0 ? void 0 : e;
}
function isRecord(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/remote-agent-protocol.js
const CALLBACK_PROTOCOL_QUERY = `eveRemoteProtocol`;
function callbackUrlForProtocol(e, t) {
	let n = new URL(e);
	return n.searchParams.set(CALLBACK_PROTOCOL_QUERY, String(t)), n.toString();
}
function readCallbackProtocol(e) {
	let t = URL.parse(e)?.searchParams.get(CALLBACK_PROTOCOL_QUERY);
	if (t != null && /^[1-9]\d*$/.test(t)) return Number(t);
}
function servesRemoteAgentCaller(e) {
	return Number.isSafeInteger(e) && e >= 2 && e <= 3;
}
function formatEarlierRemoteChildStreamError(e) {
	return `Remote agent "${e.name}" speaks eve remote agent protocol ${String(e.childVersion)}, so this deployment can't follow its stream. Its result still arrives. Upgrade both deployments to the same eve release to follow it.`;
}
function readRemoteAgentProtocolVersion(e) {
	return typeof e == `number` ? e : 1;
}
function formatRemoteAgentProtocolMismatch(e) {
	return `Remote agent "${e.name}" speaks eve remote agent protocol ${String(e.receiverVersion)}, but this deployment speaks protocol 3. Upgrade both deployments to the same eve release.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/schema.js
const schema = { $ref: `#` };
const schemaList = {
	type: `array`,
	minItems: 1,
	items: schema
};
const propertyName = {
	type: `string`,
	not: { enum: Object.getOwnPropertyNames(Object.prototype) }
};
const schemaMap = {
	type: `object`,
	propertyNames: propertyName,
	additionalProperties: schema
};
const strings = {
	type: `array`,
	uniqueItems: !0,
	items: propertyName
};
const nonnegativeInteger = {
	type: `integer`,
	minimum: 0
};
const jsonType = { enum: [
	`array`,
	`boolean`,
	`integer`,
	`null`,
	`number`,
	`object`,
	`string`
] };
const constraintSchema = new Validator({ anyOf: [{ type: `boolean` }, {
	type: `object`,
	additionalProperties: !1,
	properties: {
		type: { anyOf: [jsonType, {
			type: `array`,
			minItems: 1,
			uniqueItems: !0,
			items: jsonType
		}] },
		const: { type: [
			`string`,
			`number`,
			`boolean`,
			`null`
		] },
		enum: {
			type: `array`,
			minItems: 1,
			uniqueItems: !0,
			items: { type: [
				`string`,
				`number`,
				`boolean`,
				`null`
			] }
		},
		title: { type: `string` },
		description: { type: `string` },
		default: !0,
		minimum: { type: `number` },
		maximum: { type: `number` },
		exclusiveMinimum: { type: `number` },
		exclusiveMaximum: { type: `number` },
		minLength: nonnegativeInteger,
		maxLength: nonnegativeInteger,
		pattern: {
			type: `string`,
			format: `regex`
		},
		minItems: nonnegativeInteger,
		maxItems: nonnegativeInteger,
		items: schema,
		prefixItems: schemaList,
		contains: schema,
		minProperties: nonnegativeInteger,
		maxProperties: nonnegativeInteger,
		properties: schemaMap,
		propertyNames: schema,
		required: strings,
		additionalProperties: schema,
		allOf: schemaList,
		anyOf: schemaList,
		oneOf: schemaList,
		not: schema,
		if: schema,
		then: schema,
		else: schema
	}
}] }, `2020-12`);
function validateStubConstraint(e, t, n) {
	let r = constraintSchema.validate(e);
	if (!r.valid) {
		let e = r.errors.at(-1);
		let i = e.keyword === `false` ? `Unsupported JSON Schema keyword.` : e.error;
		throw Error(`Invalid matcher "${n}" in tool stub "${t}" at ${e.instanceLocation}: ${i}`);
	}
}
function createStubValidator(e) {
	return new Validator(structuredClone(e), `2020-12`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/session-callback.js
const sessionCallbackSchema = z.object({
	callId: z.string().min(1),
	subagentName: z.string().min(1),
	token: z.string().min(1),
	url: z.string().min(1)
}).strict().superRefine((e, t) => {
	let n;
	try {
		n = new URL(e.url);
	} catch {
		t.addIssue({
			code: `custom`,
			message: `Callback url must be absolute.`,
			path: [`url`]
		});
		return;
	}
	readCallbackUrlToken(n) !== e.token && t.addIssue({
		code: `custom`,
		message: `Callback url token must match callback token.`,
		path: [`url`]
	}), n.protocol !== `http:` && n.protocol !== `https:` && t.addIssue({
		code: `custom`,
		message: `Callback url must use http or https.`,
		path: [`url`]
	}), isBlockedDestinationHost(n.hostname, { allowLoopback: isLocalDevelopmentServer() }) && t.addIssue({
		code: `custom`,
		message: `Callback url host must not be a loopback, private, link-local, or reserved address. Loopback is allowed only on local development servers.`,
		path: [`url`]
	});
});
function parseSessionCallback(e) {
	let t = sessionCallbackSchema.safeParse(e);
	return t.success ? {
		callback: t.data,
		ok: !0
	} : {
		cause: t.error,
		message: formatSessionCallbackParseError(t.error),
		ok: !1
	};
}
function readCallbackUrlToken(e) {
	let t = createEveCallbackRoutePath(``);
	let n = normalizePublicEveRoutePath(e.pathname);
	let r = n.lastIndexOf(t);
	if (r === -1) return null;
	let i = n.slice(r + t.length);
	if (i.length === 0 || i.includes(`/`)) return null;
	try {
		return decodeURIComponent(i);
	} catch {
		return null;
	}
}
function formatSessionCallbackParseError(e) {
	return `Invalid callback metadata: ${e.issues.map((e) => `${e.path.length === 0 ? `callback` : `callback.${e.path.join(`.`)}`}: ${e.message}`).join(`; `)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/validate-targets.js
var InvalidToolStubTargetError = class extends Error {};
function validateToolStubTargets(e, t) {
	for (let n of e) if (!hasToolPath(t, n.tool.split(`/`))) throw new InvalidToolStubTargetError(`Tool stub "${n.id}" names an unknown or unsupported tool path "${n.tool}".`);
}
function hasToolPath(e, t) {
	if (t.some((e) => e.length === 0)) return !1;
	let n = e.root;
	for (let [r, i] of t.entries()) {
		let a = n.turnAgent.tools.find((e) => e.name === i);
		if (r === t.length - 1) return a === void 0 ? declared(n.agent, `tool`).some((e) => e.extensionNamespace === void 0 || i.startsWith(`${e.extensionNamespace}__`)) || n.subagentRegistry.dynamicResolvers.some((e) => e.name === i) || declared(n.agent, `memory`).some((e) => e.offersTools === !0 && i.startsWith(`${e.slot}__`)) || declared(n.agent, `schedules`).some((e) => e.offersTools === !0 && i.startsWith(`${scheduleCollectionToolSlot(e)}__`)) || i.includes(`__`) && (declared(n.agent, `connection`).length > 0 || n.agent.connections.some((e) => i.startsWith(`${e.connectionName}__`))) : a.behavior?.handling?.kind !== `provider-tool`;
		if (a === void 0) return n.subagentRegistry.dynamicResolvers.some((e) => e.name === i);
		let o = a.behavior?.handling;
		if (o?.kind !== `dispatch` || o.target.kind !== `subagent-call` && o.target.kind !== `self-agent-call`) return !1;
		n = e.nodesByNodeId.get(o.target.nodeId);
	}
	return !1;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/runtime.js
var runtime_exports = /* @__PURE__ */ __exportAll({
	resolveRunEncryptionKey: () => resolveRunEncryptionKey,
	setWorld: () => setWorld
}, 2);
import * as import_file____Users_afernandez_projects_tariffos_v3_node_modules__pnpm_eve_1_4_0__opentelemetry_api_1_10_0_ai_7_0_181_zod_4_6_7__next_16_4_6__babel_core_7_29__7106a6b4633fcf609cecb5c210405702_node_modules_eve_dist_src_compiled__workflow_core_runtime_js from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/runtime.js";
__reExport(runtime_exports, import_file____Users_afernandez_projects_tariffos_v3_node_modules__pnpm_eve_1_4_0__opentelemetry_api_1_10_0_ai_7_0_181_zod_4_6_7__next_16_4_6__babel_core_7_29__7106a6b4633fcf609cecb5c210405702_node_modules_eve_dist_src_compiled__workflow_core_runtime_js);
function setWorld(e) {
	workflowRuntime.setWorld(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/owner-deployment-deleted.js
function isOwnerDeploymentDeletedError(e) {
	for (let t of walkCauseChain(e)) if (t instanceof Error && t.name === `RunKeyFetchError` && t.status === 404 && t.message.includes(`Deployment not found`)) return !0;
	return !1;
}
function readChannelKind(e) {
	let t = e["eve.channel"]?.kind;
	return isNonEmptyString(t) ? t : void 0;
}
function isWorkflowTraceContentVisible(e) {
	let t = e[SessionTraceSeedKey.name];
	let n = t === void 0 ? void 0 : resolveForwardedTraceSeed(t);
	if (n !== void 0 && (n.forwardedTracePolicy !== void 0 || readParentSessionId(e) !== void 0)) return recordsAllContent(n.decision);
	let r = normalizeConversationContext(e[ConversationContextKey.name]);
	let i = {
		audience: r?.audience ?? `unknown`,
		environment: r?.environment ?? `production`
	};
	let a = shouldCaptureInstrumentationContent(i);
	return !a || n?.decision === void 0 || !isWorkflowOtelTraceEnabled(e) ? a : recordsAllContent(n.decision);
}
function recordsAllContent(e) {
	return e?.action === `record` && e.recordInputs && e.recordOutputs;
}
function isWorkflowOtelTraceEnabled(e) {
	return e[OtelTraceEnabledKey.name] === !0;
}
function readSessionTraceId(e) {
	let t = e[SessionTraceSeedKey.name];
	if (t === void 0) return;
	let n = resolveForwardedTraceSeed(t);
	if (isSampledTrace(n)) return isNonEmptyString(t.traceId) ? t.traceId : void 0;
}
function readParentLineage(e) {
	let t = e[`eve.parentSession`];
	let n = t?.callId;
	let r = t?.rootSessionId;
	let i = t?.sessionId;
	let a = t?.turn?.id;
	return {
		callId: isNonEmptyString(n) ? n : void 0,
		rootSessionId: isNonEmptyString(r) ? r : void 0,
		sessionId: isNonEmptyString(i) ? i : void 0,
		turnId: isNonEmptyString(a) ? a : void 0
	};
}
function readParentSessionId(e) {
	return readParentLineage(e).sessionId;
}
function readChannelRequestId(e) {
	let t = e[ChannelRequestIdKey.name];
	return isNonEmptyString(t) ? t : void 0;
}
function readScheduleId(e) {
	let t = e[ScheduleIdKey.name];
	return isNonEmptyString(t) ? t : void 0;
}
function readSessionTitle(e) {
	let t = e[SessionTitleKey.name];
	return isNonEmptyString(t) ? t : void 0;
}
function deriveSessionTitle(e) {
	let t = collectMessageText(e);
	if (t === void 0 || t.length === 0) return;
	let n = t.replace(/\s+/gu, ` `).trim();
	if (n.length === 0) return;
	let r = Array.from(n);
	return r.length <= 125 ? n : `${r.slice(0, 124).join(``)}…`;
}
function collectMessageText(e) {
	if (typeof e == `string`) return e;
	if (!Array.isArray(e)) return;
	let t = [];
	for (let n of e) n && typeof n == `object` && n.type === `text` && typeof n.text == `string` && t.push(n.text);
	return t.length > 0 ? t.join(` `) : void 0;
}
function buildSessionAttributes(e) {
	let t = isWorkflowTraceContentVisible(e.serializedContext);
	let n = isWorkflowOtelTraceEnabled(e.serializedContext);
	return {
		"$eve.channel_request_id": readChannelRequestId(e.serializedContext),
		"$eve.schedule": readScheduleId(e.serializedContext),
		"$eve.is_otel_trace_enabled": n,
		"$eve.is_trace_content_visible": t,
		"$eve.trace_id": readSessionTraceId(e.serializedContext),
		["$eve.type"]: `session`,
		"$eve.trigger": readChannelKind(e.serializedContext),
		"$eve.title": readSessionTitle(e.serializedContext)
	};
}
function buildSubagentRootAttributes(e) {
	return {
		"$eve.channel_request_id": readChannelRequestId(e.serializedContext),
		"$eve.is_otel_trace_enabled": isWorkflowOtelTraceEnabled(e.serializedContext),
		"$eve.is_trace_content_visible": isWorkflowTraceContentVisible(e.serializedContext),
		"$eve.trace_id": readSessionTraceId(e.serializedContext),
		["$eve.type"]: `subagent`,
		"$eve.parent": e.parentSessionId,
		"$eve.parent_call": e.parentCallId,
		"$eve.parent_turn": e.parentTurnId,
		["$eve.root"]: e.rootSessionId,
		"$eve.subagent": e.identity.nodeId,
		"$eve.trigger": readChannelKind(e.serializedContext)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/handle.js
const MAX_HANDLE_LENGTH = 8192;
const InboxHookSchema = HookSchema.omit({
	metadata: !0,
	resumeCapabilities: !0
});
function parseInboxHook(e) {
	let t = InboxHookSchema.safeParse(e);
	return t.success ? t.data : void 0;
}
function signingKey() {
	let e = process.env.EVE_INBOX_HANDLE_SECRET;
	return e !== void 0 && e.length >= 32 ? e : void 0;
}
function signature(e, t) {
	return createHmac(`sha256`, t).update(`eve:inbox:v1:`).update(e).digest();
}
function issueInboxHandle(e) {
	let t = signingKey();
	if (t === void 0) return;
	let n = parseInboxHook(e);
	if (n?.resumeContext?.encryptionPublicKey === void 0) return;
	let r = {
		...n,
		resumeContext: {
			...n.resumeContext,
			traceCarrier: void 0
		}
	};
	let i = Buffer.from(JSON.stringify(r)).toString(`base64url`);
	let a = `v1.${i}.${signature(i, t).toString(`base64url`)}`;
	return a.length <= MAX_HANDLE_LENGTH ? a : void 0;
}
function readInboxHandle(e) {
	let t = signingKey();
	if (t === void 0 || e.length > MAX_HANDLE_LENGTH) return;
	let [n, r, i, a] = e.split(`.`);
	if (n !== `v1` || r === void 0 || i === void 0 || a !== void 0) return;
	let o = signature(r, t);
	let s = Buffer.from(i, `base64url`);
	if (o.length === s.length && timingSafeEqual(o, s)) try {
		return parseInboxHook(JSON.parse(Buffer.from(r, `base64url`).toString(`utf8`)));
	} catch {
		return;
	}
}
const rememberedOwners = /* @__PURE__ */ new Map();
function rememberInboxOwner(e, t) {
	let n = parseInboxHook(e);
	if (n?.resumeContext?.encryptionPublicKey !== void 0) {
		if (rememberedOwners.delete(n.token), rememberedOwners.size >= 1e4) {
			let e = rememberedOwners.keys().next();
			e.done !== !0 && rememberedOwners.delete(e.value);
		}
		rememberedOwners.set(n.token, {
			hook: n,
			sessionId: t
		});
	}
}
function recallInboxOwner(e) {
	return rememberedOwners.get(e);
}
function forgetInboxOwner(e) {
	rememberedOwners.delete(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/runnable-owner.js
const runnableOwnerRunIds = /* @__PURE__ */ new Set();
function routesToOwnerDeployment(e) {
	return e.capabilities?.deploymentAffinity === !0;
}
function isRunnableOwnerRun(e) {
	return e.attributes["$eve.version"] === resolveInstalledPackageInfo().version;
}
async function findRetiredOwnerRun(e, t) {
	if (runnableOwnerRunIds.has(t)) return;
	let n = await e.runs.get(t, { resolveData: `none` });
	if (!isRunnableOwnerRun(n)) return n;
	runnableOwnerRunIds.size >= 1e4 && runnableOwnerRunIds.clear(), runnableOwnerRunIds.add(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/development-run-unavailable-error.js
const NAME = `DevelopmentRunUnavailableError`;
var DevelopmentRunUnavailableError = class extends Error {
	availability;
	runId;
	constructor(e) {
		super(`Local Workflow run was not resumed. Start a new conversation, or restart eve dev with --resume to attempt recovery.`), this.name = NAME, this.availability = e.availability, this.runId = e.runId;
	}
	static is(e) {
		return e instanceof Error && e.name === NAME && typeof e.runId == `string`;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/owner.js
var StrandedSessionOwnerError = class extends Error {
	hook;
	ownerRun;
	constructor(e, t) {
		super(`Session owner run "${e.runId}" is stranded.`), this.name = `StrandedSessionOwnerError`, this.hook = t, this.ownerRun = e;
	}
	get ownerRunId() {
		return this.ownerRun.runId;
	}
	get eveVersion() {
		return this.ownerRun.attributes["$eve.version"];
	}
};
async function resumeRunnableHook(e, t, n, r) {
	let i = n !== void 0 || r !== void 0 ? await (0, runtime_exports.getWorld)() : void 0;
	if (i !== void 0 && routesToOwnerDeployment(i) && i.capabilities !== void 0 && `resolvedHookResume` in i.capabilities && i.capabilities.resolvedHookResume === !0) {
		let i = n !== void 0 && n.length <= 8192 ? readInboxHandle(n) : void 0;
		let a = i?.token === e ? i : r?.token === e ? r : void 0;
		if (a !== void 0) try {
			return await (0, runtime_exports.resumeHook)(a, t);
		} catch (e) {
			if (!HookNotFoundError.is(e)) throw e;
		}
	}
	return isSessionInboxHookToken(e) && await assertRunnableSessionInbox(e), await (0, runtime_exports.resumeHook)(e, t);
}
async function resumeSignInCallback(e, t) {
	try {
		await resumeRunnableHook(e, t);
	} catch (e) {
		if (!HookNotFoundError.is(e)) throw e;
	}
}
async function assertRunnableSessionInbox(e) {
	let t = await (0, runtime_exports.getWorld)();
	if (routesToOwnerDeployment(t)) return;
	let n = await findSessionHookHolder(e);
	n !== void 0 && await assertRunnableOwner(t, n.runId, n.hook);
}
async function assertRunnableSessionOwner(e) {
	let t = await (0, runtime_exports.getWorld)();
	routesToOwnerDeployment(t) || await assertRunnableOwner(t, e.runId, e.hook);
}
async function findSessionHookHolder(e) {
	try {
		let t = await (0, runtime_exports.getHookByToken)(e);
		return {
			hook: t,
			runId: t.runId
		};
	} catch (e) {
		if (HookNotFoundError.is(e)) return;
		if (DevelopmentRunUnavailableError.is(e)) return { runId: e.runId };
		throw e;
	}
}
async function lookupSessionOwnerHook(e) {
	try {
		return await (0, runtime_exports.getHookByToken)(e);
	} catch (e) {
		throw DevelopmentRunUnavailableError.is(e) && await assertRunnableOwner(await (0, runtime_exports.getWorld)(), e.runId), e;
	}
}
async function strandedIfDeploymentDeleted(e, t) {
	if (!isOwnerDeploymentDeletedError(e)) return e;
	let n = typeof t == `string` ? t : t.runId;
	let r = typeof t == `string` ? void 0 : t;
	try {
		return new StrandedSessionOwnerError(await (await (0, runtime_exports.getWorld)()).runs.get(n, { resolveData: `none` }), r);
	} catch {
		return e;
	}
}
async function assertRunnableOwner(e, t, n) {
	let r = await findRetiredOwnerRun(e, t);
	if (r !== void 0) throw new StrandedSessionOwnerError(r, n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/pre-v27.js
const PRE_V27_ANSWERS_KEY = `inputResponses`;
function withPreV27Answers(e) {
	let t = e;
	return t.kind === `send` && isPayload(t.payload) ? {
		...e,
		payload: withAnswersAlias(t.payload)
	} : t.kind === `deliver` && Array.isArray(t.payloads) ? {
		...e,
		payloads: t.payloads.map(withAnswersAlias)
	} : e;
}
function withAnswersAlias(e) {
	return e.answers === void 0 || e.answers.length === 0 ? e : {
		...e,
		[PRE_V27_ANSWERS_KEY]: e.answers.map((e) => {
			let t = { requestId: e.interactionId };
			return e.optionId !== void 0 && (t.optionId = e.optionId), e.text !== void 0 && (t.text = e.text), t;
		})
	};
}
function isPayload(e) {
	return typeof e == `object` && !!e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/deliver-payloads.js
const COALESCED_DELIVER_FIELDS = [
	`context`,
	`history`,
	`answers`,
	`message`,
	`outputSchema`
];
function coalesceDeliverPayloads(e) {
	if (e.length === 0) return {};
	if (e.length === 1) return e[0] ?? {};
	let t = {};
	let n = {};
	for (let r of e) {
		for (let [e, n] of Object.entries(r)) n !== void 0 && (t[e] = n);
		n = coalesceTurnInputs(n, r);
	}
	for (let e of COALESCED_DELIVER_FIELDS) delete t[e];
	return Object.assign(t, n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/inbox.js
var UnsupportedLegacySessionError = class extends Error {
	constructor() {
		super(`This session predates eve 0.45 and cannot be continued. Start a new session.`), this.name = `UnsupportedLegacySessionError`;
	}
};
async function resolveLegacyInbox(e) {
	let t = await lookupSessionOwnerHook(e);
	let n = await t.metadata;
	let r = isObject(n) && typeof n.sessionId == `string` ? n.sessionId : t.runId;
	try {
		return {
			hook: await lookupSessionOwnerHook(sessionInboxHookToken(sessionCommandHookToken(r))),
			sessionId: r,
			current: !0
		};
	} catch (e) {
		if (!HookNotFoundError.is(e)) throw e;
		return {
			hook: t,
			sessionId: r,
			current: !1
		};
	}
}
async function resumeLegacyInbox(e, t) {
	let n = await resolveLegacyInbox(e);
	let r = t;
	if (!n.current) {
		let e = await n.hook.metadata;
		r = encodeLegacyCommand(t, isObject(e) ? e.sessionInboxWireVersion : void 0), await assertRunnableSessionOwner({
			runId: n.hook.runId,
			hook: n.hook
		});
	}
	return {
		ownerRunId: (await resumeRunnableHook(n.hook.token, r)).runId,
		sessionId: Promise.resolve(n.sessionId)
	};
}
function encodeLegacyCommand(e, t) {
	let n = t;
	if (typeof n != `number` || !Number.isInteger(n) || n < 1 || n > 7) throw new UnsupportedLegacySessionError();
	if (e.kind !== `send` && e.kind !== `deliver`) return {
		...e,
		version: n
	};
	let r = e.kind === `send` ? [e.payload] : e.payloads;
	let i = e.caller;
	let a = e.kind === `send` ? e.delivery === void 0 ? void 0 : [{
		...e.delivery,
		payloadIndex: 0
	}] : e.deliveryMetadata;
	return n < 3 && a !== void 0 && (a = a.map(({ acceptedDeploymentId: e, ...t }) => t)), {
		auth: e.auth,
		caller: i,
		deliveryMetadata: a,
		kind: `deliver`,
		payload: coalesceDeliverPayloads(r),
		payloads: r,
		requestId: e.requestId,
		turnPolicy: e.turnPolicy,
		version: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/resume.js
async function resumeSessionInbox(e, t) {
	t = withPreV27Answers(t);
	let n = logicalSessionToken(e);
	let r = typeof e == `string` ? void 0 : e.sessionId;
	let i = sessionInboxHookToken(n);
	let a = recallInboxOwner(i);
	let o;
	try {
		o = await resumeCurrentOwner(i, t, typeof e == `string` ? void 0 : e.inbox, a?.hook);
	} catch (e) {
		if (forgetInboxOwner(i), !HookNotFoundError.is(e)) throw e;
		if (r !== void 0) {
			let e = await resumeSessionStartHook(r, t);
			if (e !== void 0) return {
				ownerRunId: e.runId,
				sessionId: Promise.resolve(r),
				startAddress: e.address
			};
		}
		if (t.kind === `session-failure` || t.kind === `session-prewarm`) throw e;
		return await resumeLegacyInbox(n, t).catch(rethrowUnsupportedAsNotFound);
	}
	a !== void 0 && a.hook.hookId !== o.hookId && forgetInboxOwner(i);
	let s;
	return {
		ownerRunId: o.runId,
		inbox: issueInboxHandle(o),
		get sessionId() {
			return s ??= (async () => {
				try {
					let e;
					return r === void 0 ? e = a !== void 0 && a.hook.hookId === o.hookId ? await liveSessionId(a) : requireSessionId(await o.metadata) : (t.kind === `reset` && await assertLiveResetOwner(o), e = r), rememberInboxOwner(o, e), e;
				} catch (e) {
					if (forgetInboxOwner(i), e instanceof StrandedSessionOwnerError) throw e;
					let t = await strandedIfDeploymentDeleted(e, o);
					throw t === e ? new AcceptedSessionIdentityError(e) : t;
				}
			})();
		}
	};
}
async function assertLiveResetOwner(e) {
	let t = await (0, runtime_exports.getWorld)();
	if (t.getEncryptionKeyForRun !== void 0) try {
		let n = e.resumeContext?.deploymentId ?? (await t.runs.get(e.runId, { resolveData: `none` })).deploymentId;
		await t.getEncryptionKeyForRun(e.runId, { deploymentId: n });
	} catch (t) {
		let n = await strandedIfDeploymentDeleted(t, e);
		if (n !== t) throw n;
	}
}
async function liveSessionId({ hook: e, sessionId: t }) {
	return await (await (0, runtime_exports.getWorld)()).getEncryptionKeyForRun?.(e.runId, { deploymentId: e.resumeContext?.deploymentId }), t;
}
async function resumeCurrentOwner(e, t, n, r) {
	try {
		return await resumeRunnableHook(e, t, n, r);
	} catch (n) {
		if (!isOwnerDeploymentDeletedError(n)) throw n;
		let r = await findSessionHookHolder(e);
		if (r?.hook === void 0) throw n;
		let i = await r.hook.metadata.then(() => void 0, (e) => e ?? n);
		if (i === void 0) return await resumeRunnableHook(e, t);
		let a = await strandedIfDeploymentDeleted(i, r.hook);
		throw a === i ? n : a;
	}
}
var AcceptedSessionIdentityError = class extends Error {
	constructor(e) {
		super(`Session command accepted, but its session identity could not be resolved.`, { cause: e }), this.name = `AcceptedSessionIdentityError`;
	}
};
function requireSessionId(e) {
	let t = isObject(e) ? e["sessionId"] : void 0;
	if (typeof t != `string` || t.length === 0) throw Error(`Session hook metadata is missing its session ID.`);
	return t;
}
async function resolveSessionInbox(e) {
	let t;
	try {
		return t = await (0, runtime_exports.getHookByToken)(sessionInboxHookToken(e)), { sessionId: requireSessionId(await t.metadata) };
	} catch (n) {
		if (t !== void 0) {
			let e = await strandedIfDeploymentDeleted(n, t);
			if (e !== n) throw e;
		}
		if (!HookNotFoundError.is(n)) throw n;
		return { sessionId: (await resolveLegacyInbox(e)).sessionId };
	}
}
async function resumeSessionStartHook(e, t) {
	if (!e.startsWith(`wrun_`)) return;
	let n;
	try {
		n = await (await (0, runtime_exports.getWorld)()).hooks.get(startHookId(e), { resolveData: `none` });
	} catch (e) {
		if (isMissingHook(e)) return;
		throw e;
	}
	let r = logicalSessionInboxToken(n.token);
	if (n.runId !== e || r === void 0) return;
	await assertRunnableSessionOwner({ runId: n.runId });
	let { metadata: i, ...a } = n;
	let o = isObject(t) && t.kind === `reset`;
	try {
		let e = await (0, runtime_exports.resumeHook)(a, t);
		return o && await assertLiveResetOwner(e), {
			address: r,
			runId: e.runId
		};
	} catch (e) {
		if (HookNotFoundError.is(e)) return;
		if (o) {
			if (e instanceof StrandedSessionOwnerError) throw e;
			let t = await strandedIfDeploymentDeleted(e, n.runId);
			if (t !== e) throw t;
		}
		throw e;
	}
}
function isMissingHook(e) {
	return HookNotFoundError.is(e) || WorkflowWorldError.is(e) && e.status === 404;
}
function rethrowUnsupportedAsNotFound(e) {
	throw e instanceof UnsupportedLegacySessionError ? new HookNotFoundError(e.message) : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tool-stubs/steps.js
async function publishStubResultStep(e) {
	if (e.matchedRuleId !== void 0) {
		let t = getWritable({ namespace: "eve.tool-stubs.matches" }).getWriter();
		try {
			await t.write(e.matchedRuleId);
		} finally {
			t.releaseLock();
		}
	}
	let t = getWritable({ namespace: stubResponseNamespace(e.callId) }).getWriter();
	try {
		await t.write(e.result);
	} finally {
		t.releaseLock();
	}
}
async function publishStubFailureStep(e) {
	let t = getWritable({ namespace: "eve.tool-stubs.failure" }).getWriter();
	try {
		await t.write(e);
	} finally {
		t.releaseLock();
	}
}
async function callToolStubStep(e, t) {
	return await requestStub(e, {
		kind: `call`,
		call: t
	});
}
async function reportStubFailureStep(e, t, n) {
	try {
		await requestStub(e, {
			kind: `failure`,
			callId: t,
			error: n
		});
	} catch (t) {
		if (e.rootSessionId === void 0) throw t;
		await (0, runtime_exports.getRun)(e.rootSessionId).cancel({ cancelReason: `Could not record a tool stub output-processing failure.` });
	}
}
async function requestStub(e, t) {
	let n = e.rootSessionId;
	if (n === void 0) throw Error(`Tool stub session is missing its durable playback owner.`);
	let r = t.kind === `call` ? t.call.callId : `${t.callId}:failure`;
	await (0, runtime_exports.resumeHook)(e.token, t);
	let i = (0, runtime_exports.getRun)(n).getReadable({ namespace: stubResponseNamespace(r) }).getReader();
	try {
		let { done: e, value: t } = await i.read();
		if (e) throw Error(`Tool stub session ended without a response.`);
		return t;
	} finally {
		await i.cancel(), i.releaseLock();
	}
}
async function readStubFailure(e) {
	let t = (0, runtime_exports.getRun)(e);
	let n = t.getReadable({ namespace: "eve.tool-stubs.failure" });
	if (await n.getTailIndex() < 0) {
		await n.cancel();
		let e = await t.status;
		return e === `failed` || e === `cancelled` ? `Tool stub session failed before verification.` : void 0;
	}
	let r = n.getReader();
	try {
		return (await r.read()).value;
	} finally {
		await r.cancel(), r.releaseLock();
	}
}
async function failStubSessionStep(e) {
	await resumeSessionInbox({ sessionId: e }, {
		kind: `session-failure`,
		error: `Tool stub playback failed.`
	});
}
async function readMatchedStubRules(e) {
	let t = (0, runtime_exports.getRun)(e).getReadable({ namespace: "eve.tool-stubs.matches" });
	let n = await t.getTailIndex();
	let r = t.getReader();
	let i = /* @__PURE__ */ new Set();
	try {
		for (let e = 0; e <= n; e++) {
			let { done: e, value: t } = await r.read();
			if (e) throw Error(`Tool stub match records ended unexpectedly.`);
			i.add(t);
		}
		return [...i];
	} finally {
		await r.cancel(), r.releaseLock();
	}
}
registerStepFunction("step//eve@1.4.0//publishStubResultStep", publishStubResultStep);
registerStepFunction("step//eve@1.4.0//publishStubFailureStep", publishStubFailureStep);
registerStepFunction("step//eve@1.4.0//callToolStubStep", callToolStubStep);
registerStepFunction("step//eve@1.4.0//reportStubFailureStep", reportStubFailureStep);
registerStepFunction("step//eve@1.4.0//failStubSessionStep", failStubSessionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/callback-hook-tokens.js
const REMOTE_REPLY_PREFIX = `eve:reply:v1:`;
const SIGN_IN_PREFIX = `eve:sign-in:v1:`;
function remoteReplyHookToken(e) {
	return `${REMOTE_REPLY_PREFIX}${e}`;
}
function isRemoteReplyHookToken(e) {
	return e.startsWith(REMOTE_REPLY_PREFIX);
}
function isSignInCallbackToken(e) {
	let t = logicalSessionInboxToken(e);
	return t === void 0 ? e.startsWith(SIGN_IN_PREFIX) : isSessionCommandHookToken(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/protocol-two-callback.js
const PROTOCOL_TWO_INPUT_CALLBACK_KINDS = /* @__PURE__ */ new Set([`subagent-input-request`, `subagent-authorization-event`]);
const position = {
	sequence: z.number(),
	stepIndex: z.number(),
	turnId: z.string()
};
const v26RequestSchema = z.object({
	action: z.object({
		callId: z.string().min(1),
		input: jsonObjectSchema,
		kind: z.literal(`tool-call`),
		toolName: z.string().min(1)
	}),
	allowFreeform: z.boolean().optional(),
	display: z.string().optional(),
	kind: z.enum([
		`question`,
		`session-limit`,
		`tool-approval`
	]),
	options: z.array(z.object({
		description: z.string().optional(),
		id: z.string(),
		label: z.string(),
		style: z.string().optional()
	})).optional(),
	prompt: z.string(),
	requestId: z.string().min(1)
});
const v26ResponseSchema = z.object({
	optionId: z.string().optional(),
	requestId: z.string(),
	text: z.string().optional()
});
const inputRequestCallbackSchema = z.object({
	callId: z.string().min(1),
	childContinuationToken: z.string().min(1),
	childSessionId: z.string().min(1),
	childSessionInbox: z.object({ sessionId: z.string().min(1) }).strict().optional(),
	inputSource: z.string().min(1).optional(),
	remote: z.object({
		forwardPrincipal: z.boolean().optional(),
		name: z.string().min(1),
		resolverId: z.string().min(1).optional(),
		sessionId: z.string().min(1),
		url: z.string().url()
	}).strict().optional(),
	kind: z.literal(`subagent-input-request`),
	subagentName: z.string().min(1),
	event: z.object({
		...position,
		requests: z.array(v26RequestSchema).min(1),
		taskId: z.string().optional()
	})
});
const signInFields = {
	...position,
	attemptId: z.string().min(1).optional(),
	name: z.string(),
	principalId: z.string().optional(),
	taskId: z.string().optional()
};
const authorizationCallbackSchema = z.object({
	callId: z.string().min(1),
	childSessionId: z.string().min(1),
	kind: z.literal(`subagent-authorization-event`),
	subagentName: z.string().min(1),
	event: z.discriminatedUnion(`type`, [
		z.object({
			type: z.literal(`approval.candidate`),
			data: z.object({
				...position,
				candidateId: z.string(),
				outcome: z.enum([
					`pending`,
					`rejected`,
					`failed`,
					`timed-out`,
					`stale`
				]),
				reason: z.string().optional(),
				requestId: z.string().min(1),
				responderPrincipalId: z.string()
			}).passthrough()
		}),
		z.object({
			type: z.literal(`approval.settled`),
			data: z.object({
				...position,
				outcome: z.enum([`approved`, `cancelled`]),
				requestId: z.string().min(1),
				responderPrincipalId: z.string()
			}).passthrough()
		}),
		z.object({
			type: z.literal(`input.resolved`),
			data: z.object({
				...position,
				resolutions: z.array(z.object({
					kind: z.enum([
						`question`,
						`session-limit`,
						`tool-approval`
					]),
					outcome: z.enum([
						`answered`,
						`approved`,
						`cancelled`,
						`denied`,
						`ignored`,
						`invalid`
					]),
					requestId: z.string().min(1),
					response: v26ResponseSchema.optional()
				}).passthrough())
			}).passthrough()
		}),
		z.object({
			type: z.literal(`authorization.required`),
			data: z.object({
				...signInFields,
				description: z.string(),
				webhookUrl: z.string().optional()
			}).passthrough()
		}),
		z.object({
			type: z.literal(`authorization.completed`),
			data: z.object({
				...signInFields,
				outcome: z.enum([
					`authorized`,
					`declined`,
					`failed`,
					`timed-out`
				])
			}).passthrough()
		})
	])
});
function protocolTwoAnswersSettledOnForward(e) {
	return e.answers.filter(({ interactionId: t }) => t !== e.decidedHere && e.kindOf(t) !== `approval`);
}
function parseProtocolTwoInputCallback(e) {
	let t = inputRequestCallbackSchema.safeParse(e);
	if (t.success) return t.data;
	let n = authorizationCallbackSchema.safeParse(e);
	return n.success ? n.data : void 0;
}
function readProtocolTwoInputCallback(e) {
	let t = inputRequestCallbackSchema.safeParse(e);
	if (t.success) {
		let { data: e } = t;
		return {
			callId: e.callId,
			childSessionId: e.childSessionId,
			events: e.event.requests.map((t) => {
				let n = {
					interactionId: t.requestId,
					sessionId: e.childSessionId
				};
				return relayEvent(`interaction.opened`, {
					interactionId: t.requestId,
					origin: t.kind === `session-limit` ? n : {
						...n,
						call: {
							callId: t.action.callId,
							input: t.action.input,
							name: t.action.toolName
						}
					},
					request: v26InteractionRequest(t),
					subject: { turnId: e.event.turnId }
				});
			}),
			kind: `subagent-interaction`,
			route: {
				childContinuationToken: e.childContinuationToken,
				...e.childSessionInbox !== void 0 && { childSessionInbox: e.childSessionInbox },
				...e.inputSource !== void 0 && { inputSource: e.inputSource }
			},
			subagentName: e.subagentName
		};
	}
	let n = authorizationCallbackSchema.safeParse(e);
	if (!n.success) return;
	let { data: r } = n;
	return {
		callId: r.callId,
		childSessionId: r.childSessionId,
		events: authorizationEvents(r.childSessionId, r.event),
		kind: `subagent-interaction`,
		subagentName: r.subagentName
	};
}
function authorizationEvents(e, t) {
	switch (t.type) {
		case `approval.candidate`: {
			let { outcome: e, reason: n, requestId: r } = t.data;
			return e === `pending` ? [relayEvent(`response.admitted`, { interactionId: r })] : [relayEvent(`response.settled`, {
				interactionId: r,
				outcome: CANDIDATE_OUTCOMES[e],
				...n !== void 0 && { reason: n }
			})];
		}
		case `approval.settled`: return [];
		case `input.resolved`: return t.data.resolutions.map((e) => {
			let t = {};
			return e.response?.optionId !== void 0 && (t.optionId = e.response.optionId), e.response?.text !== void 0 && (t.text = e.response.text), relayEvent(`interaction.settled`, {
				interactionId: e.requestId,
				outcome: v26InteractionOutcome(e.outcome),
				...Object.keys(t).length > 0 && { response: t }
			});
		});
		case `authorization.required`: {
			let n = t.data.principalId;
			let r = signInId(e, t.data);
			return [relayEvent(`interaction.opened`, {
				...n !== void 0 && { audience: { principalIds: [n] } },
				interactionId: r,
				origin: {
					interactionId: r,
					sessionId: e
				},
				request: v26SignInRequest(t.data),
				subject: { turnId: t.data.turnId }
			})];
		}
		case `authorization.completed`: return [relayEvent(`interaction.settled`, {
			interactionId: signInId(e, t.data),
			outcome: v26SignInOutcome(t.data.outcome)
		})];
	}
}
const CANDIDATE_OUTCOMES = {
	failed: `failed`,
	rejected: `refused`,
	stale: `withdrawn`,
	"timed-out": `expired`
};
function signInId(e, t) {
	return t.attemptId ?? `signin_${e}_${encodeURIComponent(t.name)}_${t.principalId ?? ``}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/delegation.js
const transport = createAgentDelegationTransport();
const agentDelegation = {
	fetch: transport.fetch,
	resume(e, t) {
		let { context: n } = e;
		let r = n.trace.parentTraceContext;
		if (r === void 0) return t();
		let i = r.decision;
		return transport.resume({
			caller: r,
			conversationId: n.trace.conversationId ?? resolveConversationId(n.parent.rootSessionId),
			parentRunId: n.parent.sessionId,
			parentCallId: n.parent.callId,
			agentName: e.agentName,
			capture: {
				emit: r.traceFlags === 1 && i?.action !== `drop`,
				recordInputs: i?.action === `record` && i.recordInputs,
				recordOutputs: i?.action === `record` && i.recordOutputs
			}
		}, t);
	},
	receive(e, t) {
		return transport.receive(e.headers, (t) => e.delegated && e.trusted && e.parent !== void 0 && t.parentRunId === e.parent.sessionId && t.parentCallId === e.parent.callId && e.callerTrace?.traceId === t.caller.traceId && e.callerTrace.spanId === t.caller.spanId, (n) => {
			let r = e.parentTraceContext;
			let i = n?.capture.emit ? {
				action: `record`,
				recordInputs: n.capture.recordInputs,
				recordOutputs: n.capture.recordOutputs
			} : { action: `drop` };
			let a = n === void 0 || r === void 0 ? r : {
				...r,
				decision: r.decision === void 0 ? i : intersectInstrumentationDecisions(r.decision, i),
				traceFlags: n.capture.emit ? r.traceFlags : 0
			};
			return t({
				conversationId: e.delegated ? n?.conversationId ?? readConversationBaggage(e.headers.get(`baggage`)) : void 0,
				parentTraceContext: a
			});
		});
	}
};
export { AcceptedSessionIdentityError, HEARTBEAT_RECORD, InvalidToolStubTargetError, LEASE_ENDED_RECORD, PROTOCOL_TWO_INPUT_CALLBACK_KINDS, STREAM_ENDED_RECORD, StrandedSessionOwnerError, agentDelegation, assertRunnableSessionInbox, assertRunnableSessionOwner, buildSessionAttributes, buildSubagentRootAttributes, callToolStubStep, callbackUrlForProtocol, coalesceDeliverPayloads, createStubValidator, createV26HistoryReader, deriveSessionTitle, encodeLineBytes, failStubSessionStep, findRetiredOwnerRun, findSessionHookHolder, formatEarlierRemoteChildStreamError, formatRemoteAgentProtocolMismatch, isOwnerDeploymentDeletedError, isRemoteReplyHookToken, isSignInCallbackToken, isStoredLine, isV26Line, parseProtocolTwoInputCallback, parseSessionCallback, principalIdentity, protocolTwoAnswersSettledOnForward, publishStubFailureStep, publishStubResultStep, readCallbackProtocol, readMatchedStubRules, readParentLineage, readProtocolTwoInputCallback, readRemoteAgentProtocolVersion, readStubFailure, remoteReplyHookToken, reportStubFailureStep, requireSessionId, resolveRunEncryptionKey, resolveSessionInbox, resumeRunnableHook, resumeSessionInbox, resumeSessionStartHook, resumeSignInCallback, routesToOwnerDeployment, runtime_exports, servesRemoteAgentCaller, setWorld, v26ChildStarted, v26LineStream, validateStubConstraint, validateToolStubTargets };

//# sourceMappingURL=eve50.mjs.map