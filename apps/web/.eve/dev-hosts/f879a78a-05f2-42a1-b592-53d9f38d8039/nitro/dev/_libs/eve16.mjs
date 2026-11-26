import { parseJsonObject } from "./eve8.mjs";
import { AuthKey, ContextKey, InitiatorAuthKey, OccurrenceIdKey, ScheduleIdKey, ScheduleInstanceKey, SessionIdKey, SessionTraceSeedKey, contextStorage, loadContext } from "./eve13.mjs";
import { isNonEmptyString, isObject as isObject$1, readNonEmptyString } from "./eve14.mjs";
import { createLogger, logError } from "./eve15.mjs";
import "./eve20.mjs";
import { otelTelemetry } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/index.js";
import { boundedPrincipalId, truncateTelemetryText } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/otel.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/display-name.js
function displayName(e) {
	let t = lastSegment(e).replace(/([a-z0-9])([A-Z])/gu, `$1 $2`).replace(/([A-Z]+)([A-Z][a-z])/gu, `$1 $2`).split(SEPARATORS).filter((e) => e !== ``).map((e) => e.length > 1 && e === e.toUpperCase() ? e : e.toLowerCase());
	return t.length === 0 ? e : t.join(` `);
}
function displayTitle(e) {
	return capitalize(displayName(e));
}
function displayProperName(e) {
	let t = lastSegment(e).split(SEPARATORS).filter((e) => e !== ``).join(` `);
	return t === `` ? e : capitalize(t);
}
const SEPARATORS = /[\s_-]+/u;
function lastSegment(e) {
	return e.split(`__`).findLast((e) => e !== ``) ?? e;
}
function capitalize(e) {
	return e.charAt(0).toUpperCase() + e.slice(1);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/json.js
function isObject(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/tree.js
const TABLES = {
	call: `calls`,
	change: `changes`,
	child: `children`,
	delivery: `deliveries`,
	interaction: `interactions`,
	part: `parts`,
	response: `responses`,
	run: `runs`,
	task: `tasks`,
	turn: `turns`
};
const CLOSABLE = [
	`interaction`,
	`response`,
	`call`,
	`run`,
	`task`,
	`change`,
	`delivery`,
	`turn`
];
function tableOf(e) {
	return TABLES[e];
}
function rowOf(e, t, n) {
	return e[TABLES[t]][n];
}
function refOf(e) {
	if (isObject(e)) {
		if (`turnId` in e) return {
			family: `turn`,
			id: e.turnId
		};
		if (`runId` in e) return {
			family: `run`,
			id: e.runId
		};
		if (`changeId` in e) return {
			family: `change`,
			id: e.changeId
		};
		if (`callId` in e) return {
			family: `call`,
			id: e.callId
		};
		if (`taskId` in e) return {
			family: `task`,
			id: e.taskId
		};
		if (`responseId` in e) return {
			family: `response`,
			id: e.responseId
		};
		if (`interactionId` in e) return {
			family: `interaction`,
			id: e.interactionId
		};
	}
}
function parentOf(e, t) {
	switch (t.family) {
		case `run`: return refOf(rowOf(e, `run`, t.id)?.owner);
		case `change`: {
			let n = rowOf(e, `change`, t.id)?.turnId;
			return n === void 0 ? void 0 : {
				family: `turn`,
				id: n
			};
		}
		case `call`: {
			let n = rowOf(e, `call`, t.id);
			if (n === void 0) return;
			if (n.taskId !== void 0) return {
				family: `task`,
				id: n.taskId
			};
			let r = refOf(n.owner);
			if (r?.family !== `run`) return r;
			let i = rowOf(e, `run`, r.id);
			return i?.status === `settled` && i.outcome === `completed` ? refOf(i.owner) : r;
		}
		case `interaction`: return refOf(rowOf(e, `interaction`, t.id)?.subject);
		case `response`: {
			let n = rowOf(e, `response`, t.id)?.interactionId;
			return n === void 0 ? void 0 : {
				family: `interaction`,
				id: n
			};
		}
		case `delivery`: {
			let n = rowOf(e, `delivery`, t.id);
			return n?.status === `consumed` && n.turnId !== void 0 ? {
				family: `turn`,
				id: n.turnId
			} : void 0;
		}
		case `child`: return refOf(rowOf(e, `child`, t.id)?.owner);
		case `part`: {
			let n = rowOf(e, `part`, t.id);
			return n?.runId === void 0 ? n?.turnId === void 0 ? void 0 : {
				family: `turn`,
				id: n.turnId
			} : {
				family: `run`,
				id: n.runId
			};
		}
		case `turn`:
		case `task`: return;
	}
}
function ancestors(e, t) {
	let n = [];
	let r = /* @__PURE__ */ new Set([`${t.family}:${t.id}`]);
	let i = parentOf(e, t);
	for (; i !== void 0 && !r.has(`${i.family}:${i.id}`);) r.add(`${i.family}:${i.id}`), n.push(i), i = parentOf(e, i);
	return n;
}
function ownerOf(e, t, n) {
	return t.family === n ? t.id : ancestors(e, t).find((e) => e.family === n)?.id;
}
function isOpen(e, t) {
	let n = rowOf(e, t.family, t.id);
	return n?.status !== void 0 && n.status !== `settled` && n.status !== `ended`;
}
function openUnder(e, t) {
	let n = [];
	for (let r of CLOSABLE) for (let [i, a] of Object.entries(e[TABLES[r]])) {
		let o = {
			family: r,
			id: i
		};
		if (!isOpen(e, o)) continue;
		let s = ancestors(e, o);
		(t === `session` || s.some((e) => e.family === t.family && e.id === t.id)) && n.push({
			at: a.introducedAt,
			depth: s.length,
			ref: o
		});
	}
	return n.sort((e, t) => t.depth - e.depth || t.at - e.at).map((e) => e.ref);
}
function scopeOf(e, t) {
	let n = {};
	for (let r of [t, ...ancestors(e, t)]) r.family === `turn` ? n.turnId ??= r.id : r.family === `task` ? n.taskId ??= r.id : r.family === `run` ? n.runId ??= r.id : r.family === `change` && (n.changeId ??= r.id);
	let r = t.family === `call` ? refOf(rowOf(e, `call`, t.id)?.owner) : void 0;
	return r !== void 0 && (r.family === `run` && (n.runId ??= r.id), n.turnId ??= ownerOf(e, r, `turn`), n.turnId === void 0 && delete n.turnId), n;
}
function turnOf(e, t) {
	let n = scopeOf(e, t);
	if (n.turnId !== void 0 || n.taskId === void 0) return n.turnId;
	let r = rowOf(e, `task`, n.taskId)?.startedBy.callId;
	return r === void 0 ? void 0 : scopeOf(e, {
		family: `call`,
		id: r
	}).turnId;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/selectors.js
function activeTurn(e) {
	if (e.session.status === `ended`) return;
	let t = e.session.latestTurnId;
	let n = t === void 0 ? void 0 : e.turns[t];
	return n !== void 0 && n.status !== `settled` ? n : void 0;
}
function interactionBatches(e, t = {}) {
	let n = /* @__PURE__ */ new Map();
	let r = Object.values(e.interactions).sort((e, t) => e.introducedAt - t.introducedAt);
	for (let e of r) {
		if (e.request.kind === `sign-in` && t.signIns !== !0) continue;
		let r = n.get(e.introducedAt);
		r === void 0 ? n.set(e.introducedAt, [e]) : r.push(e);
	}
	return [...n.values()];
}
function isWorking(e, t) {
	return e.session.status === `ended` || e.tasks[t]?.status !== `running` ? !1 : Object.values(e.calls).some((n) => n.status !== `settled` && callTask(e, n) === t);
}
function tasks(e, t = {}) {
	return Object.values(e.tasks).filter((n) => {
		switch (t.status) {
			case void 0: return !0;
			case `ended`: return n.status === `ended`;
			case `working`: return isWorking(e, n.taskId);
			case `idle`: return n.status === `running` && !isWorking(e, n.taskId);
		}
	});
}
function openInteractions(e, t = {}) {
	return e.session.status === `ended` ? [] : Object.values(e.interactions).filter((n) => {
		if (n.status !== `open` || t.kind !== void 0 && n.request.kind !== t.kind) return !1;
		let r = t.about;
		if (r === void 0) return !0;
		if (`callId` in r) {
			let t = e.calls[r.callId];
			return `callId` in n.subject && n.subject.callId === r.callId || n.origin?.call?.callId === r.callId || t?.taskId !== void 0 && interactionOwner(e, n).taskId === t.taskId;
		}
		return `taskId` in r ? interactionOwner(e, n).taskId === r.taskId : `turnId` in r ? interactionOwner(e, n).turnId === r.turnId : sameSubject(n.subject, r);
	}).sort((e, t) => e.introducedAt - t.introducedAt);
}
function answeredInteractionIds(e) {
	return new Set(Object.values(e.responses).filter((e) => e.status === `admitted`).map((e) => e.interactionId));
}
function waiting(e, t) {
	if (e.session.status === `ended`) return;
	let n = e.turns[t];
	if (n === void 0 || n.status === `settled`) return;
	let r = openWork(e, { turnId: t });
	if (r.runs.length > 0 || r.changes.length > 0) return { on: `session` };
	let i = new Set(r.interactions.flatMap((e) => `responseId` in e.subject ? [e.subject.responseId] : []));
	if (r.responses.some((e) => e.status === `submitted` && !i.has(e.responseId))) return { on: `session` };
	let a = Math.max(-1, ...Object.values(e.runs).filter((n) => runTurn(e, n.runId) === t).map((e) => e.introducedAt), ...Object.values(e.interactions).filter((n) => interactionOwner(e, n).turnId === t || subjectTurn(e, n) === t).map((e) => e.introducedAt), ...Object.values(e.responses).filter((n) => n.status !== `submitted` && e.deliveries[n.deliveryId]?.turnId === t).map((e) => e.introducedAt));
	if (Object.values(e.deliveries).some((e) => e.status === `consumed` && e.turnId === t && (e.consumedAt ?? -1) > a)) return { on: `session` };
	let o = Object.values(e.interactions);
	let about = (e) => new Set(o.flatMap((t) => e(t) ? [...`callId` in t.subject ? [t.subject.callId] : [], ...t.origin?.call === void 0 ? [] : [t.origin.call.callId]] : []));
	let s = about((e) => e.status === `open`);
	let c = about((e) => e.status === `settled` && e.outcome === `accepted`);
	let l = Object.values(e.calls).filter((n) => n.status !== `settled` && callTurn(e, n) === t);
	let u = l.filter((e) => e.status === `running`);
	let d = answeredInteractionIds(e);
	if (!o.some((e) => e.status === `open` && e.request.kind === `sign-in` && `turnId` in e.subject && e.subject.turnId === t && !d.has(e.interactionId)) && u.some((e) => e.taskId === void 0 && e.capability.name !== `eve__task_wait` && !s.has(e.callId))) return { on: `session` };
	let f = l.filter((e) => e.status === `requested` && !s.has(e.callId));
	if (f.some((e) => c.has(e.callId)) || f.some((e) => e.capability.kind === `control` && e.capability.name === `eve__task_cancel`) || f.length > 0 && u.length === 0) return { on: `session` };
	let p = openInteractions(e).filter((n) => !d.has(n.interactionId) && !heardBack(e, n) && !(`callId` in n.subject && e.calls[n.subject.callId]?.status === `settled`) && (interactionOwner(e, n).turnId === t || subjectTurn(e, n) === t));
	if (p.length > 0) return {
		interactions: p,
		on: `interaction`
	};
	if (u.length > 0) {
		let t = new Set(u.flatMap((e) => e.taskId ?? []));
		if (u.some((e) => e.capability.name === `eve__task_wait`)) for (let n of tasks(e, { status: `working` })) t.add(n.taskId);
		return {
			on: `work`,
			calls: u,
			tasks: [...t].flatMap((t) => e.tasks[t] ?? [])
		};
	}
	return { on: `session` };
}
function heardBack(e, t) {
	let n = t.request.signIn?.waitsOn;
	return n !== void 0 && e.interactions[n]?.status === `settled`;
}
function callRun(e, t) {
	let n = callOwnerRoot(e, t);
	return n !== void 0 && `runId` in n ? n.runId : void 0;
}
function callOwnerRoot(e, t) {
	let n = /* @__PURE__ */ new Set();
	let r = t;
	for (; r !== void 0 && !n.has(r.callId);) {
		if (n.add(r.callId), !(`callId` in r.owner)) return r.owner;
		r = e.calls[r.owner.callId];
	}
}
function callTurn(e, t) {
	let n = callOwnerRoot(e, t);
	if (n !== void 0) {
		if (`turnId` in n) return n.turnId;
		if (`runId` in n) return e.runs[n.runId] === void 0 ? void 0 : runTurn(e, n.runId);
	}
}
function callTask(e, t) {
	return ownerOf(e, {
		family: `call`,
		id: t.callId
	}, `task`);
}
function runTurn(e, t) {
	return ownerOf(e, {
		family: `run`,
		id: t
	}, `turn`);
}
function interactionOwner(e, t) {
	let n = {
		family: `interaction`,
		id: t.interactionId
	};
	let r = {};
	for (let t of [
		`turn`,
		`task`,
		`run`,
		`change`
	]) {
		let i = ownerOf(e, n, t);
		i !== void 0 && (r[`${t}Id`] = i);
	}
	return r;
}
function openWork(e, t) {
	if (e.session.status === `ended`) return {
		calls: [],
		changes: [],
		deliveries: [],
		interactions: [],
		responses: [],
		runs: [],
		tasks: []
	};
	let n = `session` in t ? `session` : refOf(t);
	let r = openUnder(e, n);
	n !== `session` && n.family !== `turn` && isOpen(e, n) && r.push(n);
	let rows = (t) => r.flatMap((n) => {
		let r = n.family === t ? rowOf(e, t, n.id) : void 0;
		return r === void 0 ? [] : [r];
	});
	let i = new Set(n !== `session` && n.family === `turn` ? Object.values(e.responses).flatMap((t) => ownerOf(e, {
		family: `response`,
		id: t.responseId
	}, `turn`) === n.id ? [t.deliveryId] : []) : []);
	let a = [...rows(`delivery`), ...Object.values(e.deliveries).filter((e) => e.status === `admitted` && i.has(e.deliveryId))];
	return {
		calls: rows(`call`),
		changes: rows(`change`),
		deliveries: a,
		interactions: rows(`interaction`),
		responses: rows(`response`),
		runs: rows(`run`),
		tasks: rows(`task`)
	};
}
function subjectTurn(e, t) {
	let { subject: n } = t;
	if (`turnId` in n) return n.turnId;
	if (`callId` in n) {
		let t = e.calls[n.callId];
		return t === void 0 ? void 0 : callTurn(e, t);
	}
}
function sameSubject(e, t) {
	let [n, r] = Object.entries(e)[0] ?? [];
	let [i, a] = Object.entries(t)[0] ?? [];
	return n === i && r === a;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/client-context.js
const clientContextKey = `__eveClientContext`;
function attachClientContext(e, t) {
	return t !== void 0 && (e[clientContextKey] = t), e;
}
function readClientContext(e) {
	return e?.[clientContextKey];
}
function attachInputText(e, t) {
	return t !== void 0 && (e["__eveInputText"] = t), e;
}
function readInputText(e) {
	return e?.["__eveInputText"];
}
function readAnswerText(e) {
	if (typeof e?.message == `string`) return readInputText(e) ?? e.message;
}
const TERMINAL_OUTCOMES = {
	"call.settled": [
		`completed`,
		`failed`,
		`rejected`,
		`interrupted`,
		`abandoned`
	],
	"context.settled": [
		`completed`,
		`failed`,
		`cancelled`,
		`interrupted`
	],
	"delivery.settled": [
		`handled`,
		`awaiting-input`,
		`applied`,
		`ignored`,
		`refused`,
		`failed`
	],
	"interaction.settled": [
		`accepted`,
		`declined`,
		`invalid`,
		`failed`,
		`withdrawn`,
		`interrupted`,
		`abandoned`,
		`expired`
	],
	"model.settled": [
		`completed`,
		`failed`,
		`interrupted`,
		`abandoned`
	],
	"response.settled": [
		`applied`,
		`refused`,
		`failed`,
		`withdrawn`,
		`abandoned`,
		`expired`
	],
	"session.ended": [`completed`, `failed`],
	"task.ended": [
		`completed`,
		`failed`,
		`cancelled`
	],
	"turn.settled": [
		`completed`,
		`failed`,
		`cancelled`
	]
};
const FACT_CATALOG = {
	"call.requested": {
		family: `call`,
		idField: `callId`,
		role: `introduces`
	},
	"call.settled": {
		family: `call`,
		idField: `callId`,
		role: `terminal`
	},
	"call.started": {
		family: `call`,
		idField: `callId`,
		role: `updates`
	},
	"child.opened": {
		family: `child`,
		idField: `sessionId`,
		role: `introduces`
	},
	"child.sent": {
		family: `child`,
		idField: `sessionId`,
		role: `record`
	},
	"content.completed": {
		family: `content`,
		idField: `partId`,
		role: `complete`
	},
	"context.settled": {
		family: `context`,
		idField: `changeId`,
		role: `terminal`
	},
	"context.started": {
		family: `context`,
		idField: `changeId`,
		role: `introduces`
	},
	"delivery.admitted": {
		family: `delivery`,
		idField: `deliveryId`,
		role: `introduces`
	},
	"delivery.consumed": {
		family: `delivery`,
		idField: `deliveryId`,
		role: `updates`
	},
	"delivery.settled": {
		family: `delivery`,
		idField: `deliveryId`,
		role: `terminal`
	},
	"interaction.opened": {
		family: `interaction`,
		idField: `interactionId`,
		role: `introduces`
	},
	"interaction.settled": {
		family: `interaction`,
		idField: `interactionId`,
		role: `terminal`
	},
	"model.requested": {
		family: `model`,
		idField: `runId`,
		role: `introduces`
	},
	"model.retried": {
		family: `model`,
		idField: `runId`,
		role: `updates`
	},
	"model.settled": {
		family: `model`,
		idField: `runId`,
		role: `terminal`
	},
	"model.started": {
		family: `model`,
		idField: `runId`,
		role: `updates`
	},
	"response.admitted": {
		family: `response`,
		idField: `responseId`,
		role: `updates`
	},
	"response.settled": {
		family: `response`,
		idField: `responseId`,
		role: `terminal`
	},
	"response.submitted": {
		family: `response`,
		idField: `responseId`,
		role: `introduces`
	},
	"session.ended": {
		family: `session`,
		idField: ``,
		role: `terminal`
	},
	"session.started": {
		family: `session`,
		idField: ``,
		role: `introduces`
	},
	"task.ended": {
		family: `task`,
		idField: `taskId`,
		role: `terminal`
	},
	"task.started": {
		family: `task`,
		idField: `taskId`,
		role: `introduces`
	},
	"turn.paused": {
		family: `turn`,
		idField: `turnId`,
		role: `updates`
	},
	"turn.settled": {
		family: `turn`,
		idField: `turnId`,
		role: `terminal`
	},
	"turn.started": {
		family: `turn`,
		idField: `turnId`,
		role: `introduces`
	},
	"usage.recorded": {
		family: `usage`,
		idField: ``,
		role: `record`
	}
};
const PROGRESS_CATALOG = {
	"call.input": {
		family: `call`,
		idField: `callId`
	},
	"call.progress": {
		family: `call`,
		idField: `callId`
	},
	"content.delta": {
		family: `content`,
		idField: `partId`
	}
};
function isFactType(e) {
	return typeof e == `string` && Object.hasOwn(FACT_CATALOG, e);
}
function isProgressType(e) {
	return typeof e == `string` && Object.hasOwn(PROGRESS_CATALOG, e);
}
function isTerminalType(e) {
	return typeof e == `string` && Object.hasOwn(TERMINAL_OUTCOMES, e);
}
function isKnownOutcome(e, t) {
	return typeof t == `string` && TERMINAL_OUTCOMES[e].includes(t);
}
function contentPhase(e) {
	return e === `reply` ? `reply` : `narration`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/fold.js
const ZERO = {
	cacheReadTokens: 0,
	cacheWriteTokens: 0,
	inputTokens: 0,
	outputTokens: 0
};
function dictionary(e) {
	return Object.assign(Object.create(null), e);
}
function emptySessionView() {
	return {
		calls: dictionary(),
		changes: dictionary(),
		children: dictionary(),
		deliveries: dictionary(),
		interactions: dictionary(),
		parts: dictionary(),
		position: 0,
		responses: dictionary(),
		runs: dictionary(),
		session: {
			status: `new`,
			turnCount: 0
		},
		tasks: dictionary(),
		turns: dictionary(),
		usage: {
			byKind: dictionary(),
			total: ZERO
		}
	};
}
function emptyPreviews() {
	return {
		calls: dictionary(),
		parts: dictionary()
	};
}
function foldLine(e, t, n, r = {}) {
	let i = e;
	if (n < i.position) return;
	r.retention === `operational` && prune(i, r.keep), i.position = n + 1;
	let a = r.previews;
	if (`progress` in t) a !== void 0 && foldProgress(i, a, t.progress);
	else if (Array.isArray(t.facts)) for (let e of t.facts) foldFact(i, a, e, {
		at: t.at,
		position: n
	});
}
function copyView(e) {
	return {
		...e,
		calls: dictionary(e.calls),
		changes: dictionary(e.changes),
		children: dictionary(e.children),
		deliveries: dictionary(e.deliveries),
		interactions: dictionary(e.interactions),
		parts: dictionary(e.parts),
		responses: dictionary(e.responses),
		runs: dictionary(e.runs),
		tasks: dictionary(e.tasks),
		turns: dictionary(e.turns)
	};
}
function foldReceivedEvent(e, t, n) {
	let r = e;
	let i = t.meta?.position?.line ?? r.position;
	if (i < r.position) return;
	let a = n;
	isFactType(t.type) ? foldFact(r, a, t, {
		at: t.meta?.at ?? ``,
		position: i
	}) : a !== void 0 && isProgressType(t.type) && foldProgress(r, a, t), t.meta?.endOfLine !== !1 && (r.position = i + 1);
}
function foldFact(e, t, n, r) {
	if (typeof n != `object` || !n) return;
	let i = n;
	if (isFactType(i.type) && i.data !== null && typeof i.data == `object` && e.session.status !== `ended` && (i.type !== `model.requested` && i.type !== `call.requested` && i.type !== `child.opened` || isObject(i.data.owner))) {
		if (foldLifecycle(e, i, {
			introducedAt: r.position,
			startedAt: r.at
		}, r)) foldSpecifics(e, t, i, r);
		else switch (i.type) {
			case `session.started`: {
				if (e.session.status !== `new`) return;
				let { parent: t, runtime: n } = i.data;
				e.session = {
					...e.session,
					parent: t,
					runtime: n,
					startedAt: r.at,
					status: `open`
				};
				return;
			}
			case `session.ended`: {
				let { cause: t, error: n, outcome: a } = i.data;
				if (typeof a != `string`) return;
				e.session = {
					...e.session,
					cause: t,
					closedAt: r.position,
					endedAt: r.at,
					error: n,
					outcome: a,
					status: `ended`
				};
				return;
			}
			case `child.sent`: {
				let { callId: t, childDeliveryId: n, sessionId: r } = i.data;
				let a = e.children[r];
				if (a === void 0 || a.deliveries?.some((e) => e.deliveryId === n)) return;
				e.children[r] = {
					...a,
					deliveries: [...a.deliveries ?? [], {
						callId: t,
						deliveryId: n
					}]
				};
				return;
			}
			case `usage.recorded`: {
				let { kind: t, owner: n, usage: r } = i.data;
				if (typeof r != `object` || !r || (e.usage = addToTotals(e.usage, t, r), !isObject(n))) return;
				if (`runId` in n) {
					let t = e.runs[n.runId];
					t !== void 0 && (e.runs[t.runId] = {
						...t,
						usage: addUsage(t.usage, r)
					});
				} else if (`callId` in n) {
					let t = e.calls[n.callId];
					t !== void 0 && (e.calls[t.callId] = {
						...t,
						usage: addUsage(t.usage, r)
					});
				}
				return;
			}
		}
	}
}
const LIFECYCLE = {
	"call.requested": {
		status: `requested`,
		table: `calls`
	},
	"call.settled": {
		status: `settled`,
		table: `calls`
	},
	"call.started": {
		from: `requested`,
		status: `running`,
		table: `calls`
	},
	"child.opened": { table: `children` },
	"content.completed": { table: `parts` },
	"context.settled": {
		status: `settled`,
		table: `changes`
	},
	"context.started": {
		status: `running`,
		table: `changes`
	},
	"delivery.admitted": {
		status: `admitted`,
		table: `deliveries`
	},
	"delivery.consumed": {
		from: `admitted`,
		omit: [`history`],
		status: `consumed`,
		table: `deliveries`
	},
	"delivery.settled": {
		status: `settled`,
		table: `deliveries`
	},
	"interaction.opened": {
		status: `open`,
		table: `interactions`
	},
	"interaction.settled": {
		status: `settled`,
		table: `interactions`
	},
	"model.requested": {
		status: `requested`,
		table: `runs`
	},
	"model.settled": {
		status: `settled`,
		table: `runs`
	},
	"model.started": {
		status: `running`,
		table: `runs`
	},
	"response.admitted": {
		from: `submitted`,
		status: `admitted`,
		table: `responses`
	},
	"response.settled": {
		status: `settled`,
		table: `responses`
	},
	"response.submitted": {
		status: `submitted`,
		table: `responses`
	},
	"task.ended": {
		status: `ended`,
		table: `tasks`
	},
	"task.started": {
		status: `running`,
		table: `tasks`
	},
	"turn.settled": {
		rename: { cause: `endedBy` },
		status: `settled`,
		table: `turns`
	},
	"turn.started": {
		omit: [`trace`],
		status: `running`,
		table: `turns`
	}
};
const FOLD_FIELDS = /* @__PURE__ */ new Set([
	`introducedAt`,
	`startedAt`,
	`closedAt`,
	`endedAt`,
	`consumedAt`,
	`step`,
	`runs`,
	`status`
]);
function foldLifecycle(e, t, n, r) {
	let i = LIFECYCLE[t.type];
	if (i === void 0) return !1;
	let { idField: a, role: o } = FACT_CATALOG[t.type];
	let s = Object.fromEntries(Object.entries(t.data).flatMap(([e, t]) => i.omit?.includes(e) === !0 || FOLD_FIELDS.has(e) ? [] : [[i.rename?.[e] ?? e, t]]));
	let c = s[a];
	if (typeof c != `string`) return !1;
	let l = e[i.table];
	let u = l[c];
	let d = i.status === void 0 ? {} : { status: i.status };
	let closed = (e) => e.status === `settled` || e.status === `ended`;
	switch (o) {
		case `introduces`:
		case `complete`: return u === void 0 && (l[c] = {
			...n,
			...s,
			...d
		}, !0);
		case `updates`: return u === void 0 || (i.from === void 0 ? closed(u) : u.status !== i.from) ? !1 : (l[c] = {
			...u,
			...s,
			...d
		}, !0);
		case `terminal`: return u === void 0 || closed(u) || typeof s.outcome != `string` ? !1 : (l[c] = {
			...u,
			...s,
			closedAt: r.position,
			endedAt: r.at,
			...d
		}, !0);
		default: return !1;
	}
}
function foldSpecifics(e, t, n, r) {
	switch (n.type) {
		case `delivery.consumed`: {
			let t = e.deliveries[n.data.deliveryId];
			e.deliveries[t.deliveryId] = {
				...t,
				consumedAt: r.position
			};
			return;
		}
		case `turn.started`:
			e.session = {
				...e.session,
				latestTurnId: n.data.turnId,
				turnCount: e.session.turnCount + 1
			}, delete e.selection;
			return;
		case `model.requested`: {
			let { owner: t, runId: r } = n.data;
			let i = `turnId` in t ? e.turns[t.turnId] : void 0;
			if (i === void 0) return;
			let a = i.runs ?? 0;
			e.turns[i.turnId] = {
				...i,
				runs: a + 1
			}, e.runs[r] = {
				...e.runs[r],
				step: a
			};
			return;
		}
		case `model.settled`:
			t !== void 0 && dropRunPreviews(e, t, n.data.runId);
			return;
		case `call.requested`:
		case `call.settled`:
			t !== void 0 && delete t.calls[n.data.callId];
			return;
		case `content.completed`: {
			let { partId: r, phase: i, runId: a } = n.data;
			t !== void 0 && delete t.parts[r];
			let o = a === void 0 ? void 0 : e.runs[a]?.owner;
			let s = a === void 0 ? n.scope?.turnId : o !== void 0 && `turnId` in o ? o.turnId : void 0;
			a === void 0 && s !== void 0 && (e.parts[r] = {
				...e.parts[r],
				turnId: s
			});
			let c = s === void 0 ? void 0 : e.turns[s];
			if (i === `reply` && c !== void 0 && c.status !== `settled`) {
				let t = (c.reply ?? []).filter((t) => {
					let n = e.parts[t];
					return n !== void 0 && n.runId === a;
				});
				e.turns[c.turnId] = {
					...c,
					reply: [...t, r]
				};
			}
			return;
		}
		case `context.settled`: {
			let { outcome: t, selects: r } = n.data;
			t === `completed` && `selects` in n.data && r !== void 0 && (e.selection = r);
			return;
		}
	}
}
function foldProgress(e, t, n) {
	if (typeof n != `object` || !n) return;
	let r = n;
	if (isProgressType(r.type) && r.data !== null && typeof r.data == `object` && e.session.status !== `ended`) switch (r.type) {
		case `content.delta`: {
			let { delta: n, kind: i, partId: a } = r.data;
			if (e.parts[a] !== void 0 || typeof n != `string`) return;
			let o = t.parts[a];
			o === void 0 ? i !== void 0 && (t.parts[a] = {
				kind: i,
				partId: a,
				runId: r.scope?.runId,
				text: n
			}) : t.parts[a] = {
				...o,
				text: o.text + n
			};
			return;
		}
		case `call.input`: {
			let { callId: n, delta: i, kind: a, name: o } = r.data;
			if (e.calls[n] !== void 0 || typeof i != `string`) return;
			let s = t.calls[n];
			if (s !== void 0) t.calls[n] = {
				...s,
				input: s.input + i
			};
			else if (o !== void 0) {
				let e = {
					callId: n,
					input: i,
					name: o,
					runId: r.scope?.runId
				};
				t.calls[n] = a === void 0 ? e : {
					...e,
					kind: a
				};
			}
			return;
		}
		case `call.progress`: {
			let { callId: n, output: i, label: a } = r.data;
			let o = e.calls[n];
			if (o === void 0 || o.status === `settled`) return;
			let s = t.calls[n];
			t.calls[n] = {
				callId: n,
				input: s?.input ?? ``,
				name: o.capability.name,
				output: i,
				runId: `runId` in o.owner ? o.owner.runId : void 0,
				...a !== void 0 && { label: a }
			};
			return;
		}
	}
}
function dropRunPreviews(e, t, n) {
	for (let [e, r] of Object.entries(t.parts)) r.runId === n && delete t.parts[e];
	for (let [r, i] of Object.entries(t.calls)) i.runId === n && e.calls[r] === void 0 && delete t.calls[r];
}
function prune(e, t) {
	let n = /* @__PURE__ */ new Set();
	let pinPath = (t) => {
		let r = t === void 0 ? [] : [t];
		for (; r.length > 0;) {
			let t = r.pop();
			let i = `${tableOf(t.family)}:${t.id}`;
			if (n.has(i)) continue;
			n.add(i);
			let a = parentOf(e, t);
			a !== void 0 && r.push(a);
			let o = t.family === `call` ? refOf(e.calls[t.id]?.owner) : void 0;
			o !== void 0 && r.push(o);
		}
	};
	for (let t of [
		`call`,
		`run`,
		`change`,
		`interaction`,
		`delivery`
	]) for (let n of Object.keys(e[tableOf(t)])) isOpen(e, {
		family: t,
		id: n
	}) && pinPath({
		family: t,
		id: n
	});
	for (let t of Object.values(e.responses)) t.status !== `settled` && (pinPath({
		family: `response`,
		id: t.responseId
	}), pinPath({
		family: `delivery`,
		id: t.deliveryId
	}));
	let r = liveTurns(e);
	let i = e.session.latestTurnId;
	for (let t of (i === void 0 ? void 0 : e.turns[i]?.reply) ?? []) n.add(`parts:${t}`);
	let retained = (i, a) => {
		if (n.has(`${tableOf(i)}:${a}`) || t?.(tableOf(i), a) === !0) return !0;
		let o = i === `part` ? void 0 : i === `delivery` ? e.deliveries[a]?.turnId : turnOf(e, {
			family: i,
			id: a
		});
		return o !== void 0 && r.has(o);
	};
	let dropWhere = (e, t, n) => {
		for (let [r, i] of Object.entries(t)) n(i) && !retained(e, r) && delete t[r];
	};
	dropWhere(`delivery`, e.deliveries, (e) => e.status === `settled`), dropWhere(`turn`, e.turns, (e) => e.status === `settled`), dropWhere(`run`, e.runs, (e) => e.status === `settled`), dropWhere(`part`, e.parts, () => !0), dropWhere(`call`, e.calls, (e) => e.status === `settled`), dropWhere(`task`, e.tasks, (e) => e.status === `ended`), dropWhere(`interaction`, e.interactions, (e) => e.status === `settled`), dropWhere(`response`, e.responses, (e) => e.status === `settled`), dropWhere(`change`, e.changes, (e) => e.status === `settled`);
	for (let [t, n] of Object.entries(e.children)) (`callId` in n.owner ? e.calls[n.owner.callId] : e.tasks[n.owner.taskId]) === void 0 ? delete e.children[t] : n.deliveries !== void 0 && (e.children[t] = {
		...n,
		deliveries: void 0
	});
	for (let t of Object.values(e.calls)) t.status === `settled` && !n.has(`calls:${t.callId}`) && withholdLarge(e, t);
}
function liveTurns(e) {
	let t = /* @__PURE__ */ new Set();
	e.session.latestTurnId !== void 0 && t.add(e.session.latestTurnId);
	for (let n of Object.values(e.calls)) {
		if (n.status === `settled`) continue;
		let r = turnOf(e, {
			family: `call`,
			id: n.callId
		});
		r !== void 0 && t.add(r);
	}
	return t;
}
const MAX_KEPT_VALUE_LENGTH = 16384;
function withholdLarge(e, t) {
	let size = (e) => e === void 0 ? 0 : JSON.stringify(e)?.length ?? 0;
	let n = size(t.input);
	let r = size(t.output);
	if (n <= MAX_KEPT_VALUE_LENGTH && r <= MAX_KEPT_VALUE_LENGTH) return;
	let { input: i, output: a, ...o } = t;
	e.calls[t.callId] = {
		...o,
		...n <= MAX_KEPT_VALUE_LENGTH ? { input: i } : { inputRef: {
			size: n,
			mediaType: `application/json`
		} },
		...r <= MAX_KEPT_VALUE_LENGTH ? a === void 0 ? {} : { output: a } : { outputRef: {
			size: r,
			mediaType: `application/json`
		} }
	};
}
function addUsage(e, t) {
	if (e === void 0) return t;
	let n = {
		cacheReadTokens: e.cacheReadTokens + t.cacheReadTokens,
		cacheWriteTokens: e.cacheWriteTokens + t.cacheWriteTokens,
		inputTokens: e.inputTokens + t.inputTokens,
		outputTokens: e.outputTokens + t.outputTokens
	};
	return (e.costUsd !== void 0 || t.costUsd !== void 0) && (n.costUsd = (e.costUsd ?? 0) + (t.costUsd ?? 0)), n;
}
function addToTotals(e, t, n) {
	return {
		byKind: dictionary({
			...e.byKind,
			[t]: addUsage(e.byKind[t], n)
		}),
		total: addUsage(e.total, n)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/reader.js
function turnStepAt(e, t, n = 1 / 0) {
	let r = 0;
	for (let i of Object.values(e.runs)) i.step === void 0 || i.introducedAt > n || `turnId` in i.owner && i.owner.turnId === t && (r = Math.max(r, i.step));
	return r;
}
function askedCall(e, t) {
	if (t.origin !== void 0) return t.origin.call;
	if (!(`callId` in t.subject)) return;
	let n = e.calls[t.subject.callId];
	if (n !== void 0) return n.input === void 0 ? {
		callId: n.callId,
		name: n.capability.name
	} : {
		callId: n.callId,
		input: n.input,
		name: n.capability.name
	};
}
function interactionPlace(e, t) {
	let n = interactionOwner(e, t);
	let r = n.turnId ?? e.session.latestTurnId ?? `turn_0`;
	let i = {
		stepIndex: turnStepAt(e, r, t.introducedAt),
		turnId: r
	};
	let a = n.taskId ?? (`taskId` in t.subject ? t.subject.taskId : void 0);
	return a !== void 0 && (i.taskId = a), i;
}
function interaction(e, t) {
	let n = e.interactions[t];
	if (n === void 0) return;
	let r = n.request;
	if (n.request.signIn !== void 0) {
		let { callbackUrl: e, ...t } = n.request.signIn;
		r = {
			...n.request,
			signIn: t
		};
	}
	let i = {
		...interactionPlace(e, n),
		interactionId: t,
		request: r,
		status: n.status
	};
	let a = askedCall(e, n);
	a !== void 0 && (i.call = a), n.outcome !== void 0 && (i.outcome = n.outcome), n.reason !== void 0 && (i.reason = n.reason);
	let o = decidingAnswer(n);
	if (n.status === `open`) for (let n of Object.values(e.responses)) n.interactionId === t && n.status !== `settled` && n.value !== void 0 && (o = {
		...n.value,
		interactionId: t
	});
	return o !== void 0 && (i.answer = o), i;
}
function decidingAnswer(e) {
	let t = e.response;
	if (t === void 0) return;
	let n = { interactionId: e.interactionId };
	return typeof t.optionId == `string` && (n.optionId = t.optionId), typeof t.text == `string` && (n.text = t.text), n.optionId === void 0 && n.text === void 0 ? void 0 : n;
}
function responderOf(e, t) {
	let n = e.responses[t];
	return n === void 0 ? void 0 : e.deliveries[n.deliveryId]?.principal;
}
function openRequests(e) {
	return e === void 0 ? [] : openInteractions(e).filter((e) => e.request.kind !== `sign-in`);
}
function openSignIns(e) {
	return e === void 0 ? [] : openInteractions(e, { kind: `sign-in` });
}
function promptQueueHead(e, t = () => !1) {
	let n = answeredInteractionIds(e);
	let r = openRequests(e).filter((e) => !t(e.interactionId) && !n.has(e.interactionId));
	return r.find((e) => e.request.kind === `budget`) ?? r[0];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/instrumentation-content.js
function shouldCaptureInstrumentationContent(e) {
	return e.audience === `public` || e.environment === `development`;
}
function applyAudienceCeiling(e, t) {
	return e.action === `drop` || e.explicitContentAudience === t.audience || shouldCaptureInstrumentationContent(t) ? e : {
		action: `record`,
		recordInputs: !1,
		recordOutputs: !1
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/channel-audience.js
const CHANNEL_AUDIENCES = [
	`public`,
	`private`,
	`unknown`
];
function normalizeChannelAudience(e) {
	return typeof e == `string` && CHANNEL_AUDIENCES.includes(e) ? e : `unknown`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/instrumentation-decision.js
const DROP_INSTRUMENTATION = { action: `drop` };
function readInstrumentationDecision(e) {
	if (e === void 0) return;
	if (typeof e != `object` || !e || Array.isArray(e)) return DROP_INSTRUMENTATION;
	let t = e;
	return t.action === `drop` ? DROP_INSTRUMENTATION : t.action === `record` && typeof t.recordInputs == `boolean` && typeof t.recordOutputs == `boolean` ? {
		action: `record`,
		recordInputs: t.recordInputs,
		recordOutputs: t.recordOutputs,
		...t.explicitContentAudience !== void 0 && CHANNEL_AUDIENCES.includes(t.explicitContentAudience) ? { explicitContentAudience: t.explicitContentAudience } : void 0
	} : DROP_INSTRUMENTATION;
}
function intersectInstrumentationDecisions(e, t) {
	if (e.action === `drop` || t.action === `drop`) return DROP_INSTRUMENTATION;
	let n = e.explicitContentAudience === void 0 ? t.explicitContentAudience : t.explicitContentAudience === void 0 || e.explicitContentAudience === t.explicitContentAudience ? e.explicitContentAudience : void 0;
	return {
		action: `record`,
		recordInputs: e.recordInputs && t.recordInputs,
		recordOutputs: e.recordOutputs && t.recordOutputs,
		...n === void 0 ? void 0 : { explicitContentAudience: n }
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/forwarded-trace-policy.js
const FAIL_CLOSED_FORWARDED_TRACE_ASSERTION = {
	ceiling: {
		recordInputs: !1,
		recordOutputs: !1
	},
	originAudience: `unknown`
};
function decisionToTraceContentCeiling(e) {
	let t = readInstrumentationDecision(e);
	return t?.action === `record` ? {
		recordInputs: t.recordInputs,
		recordOutputs: t.recordOutputs
	} : void 0;
}
function traceContentCeilingToDecision(e) {
	return {
		action: `record`,
		...e
	};
}
function formatTraceContentCeiling(e) {
	return `i${e.recordInputs ? `1` : `0`}o${e.recordOutputs ? `1` : `0`}`;
}
function defaultContentCapture(e, t) {
	let n = shouldCaptureInstrumentationContent(e);
	return {
		recordInputs: n && t?.recordInputs !== !1,
		recordOutputs: n && t?.recordOutputs !== !1
	};
}
function applyLiveDeliveryAudienceCeiling(e, t, n, r) {
	return n !== void 0 && (t === `unknown` || t === n.originAudience) ? e : applyAudienceCeiling(e, {
		audience: t,
		environment: r
	});
}
function readForwardedTraceAssertion(e) {
	if (e === void 0) return;
	if (typeof e != `object` || !e || Array.isArray(e)) return FAIL_CLOSED_FORWARDED_TRACE_ASSERTION;
	let t = e;
	let n = t.ceiling;
	return typeof n != `object` || !n || typeof n.recordInputs != `boolean` || typeof n.recordOutputs != `boolean` || t.originAudience !== `public` && t.originAudience !== `private` && t.originAudience !== `unknown` ? FAIL_CLOSED_FORWARDED_TRACE_ASSERTION : {
		ceiling: {
			recordInputs: n.recordInputs,
			recordOutputs: n.recordOutputs
		},
		originAudience: t.originAudience
	};
}
function resolveForwardedTraceState(e) {
	let t = readForwardedTraceAssertion(e.forwardedTracePolicy);
	let n = readInstrumentationDecision(e.decision);
	if (t !== void 0) {
		let e = traceContentCeilingToDecision(t.ceiling);
		n = n === void 0 ? DROP_INSTRUMENTATION : intersectInstrumentationDecisions(n, e);
	}
	return {
		decision: n,
		forwardedTracePolicy: t,
		traceFlags: n?.action === `drop` ? e.traceFlags & -2 : e.traceFlags
	};
}
function resolveForwardedTraceSeed(e, t) {
	if (e === void 0) return;
	let n = Object.prototype.hasOwnProperty.call(e, `forwardedTracePolicy`);
	return resolveForwardedTraceState({
		decision: e.decision,
		forwardedTracePolicy: n ? e.forwardedTracePolicy : t,
		traceFlags: e.traceFlags
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/runtime-global.js
const INSTRUMENTATION_RUNTIME_KEY = Symbol.for(`eve.instrumentation-runtime`);
const globalRuntime = globalThis;
function getInstrumentationRuntime() {
	return globalRuntime[INSTRUMENTATION_RUNTIME_KEY];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/running-work.js
const RUNNING_WORK_STATE_KEY = `eve.work`;
function readRunningWork(e) {
	let t = e?.[RUNNING_WORK_STATE_KEY];
	if (t === void 0) return {
		calls: [],
		tasks: []
	};
	if (!isObject$1(t) || t.version !== 1 || t.calls !== void 0 && !Array.isArray(t.calls) || t.tasks !== void 0 && !Array.isArray(t.tasks)) throw Error(`Corrupt running-work record: invalid version or shape.`);
	return {
		calls: Array.isArray(t.calls) ? Array.from(t.calls) : [],
		tasks: Array.isArray(t.tasks) ? Array.from(t.tasks) : []
	};
}
function writeRunningWork(e, t) {
	let n = readRunningWork(e);
	let r = t.calls ?? n.calls;
	let i = t.tasks ?? n.tasks;
	if (r.length === 0 && i.length === 0) {
		let t = { ...e };
		return delete t[RUNNING_WORK_STATE_KEY], Object.keys(t).length === 0 ? void 0 : t;
	}
	let a = { version: 1 };
	return r.length > 0 && (a.calls = r), i.length > 0 && (a.tasks = i), {
		...e,
		[RUNNING_WORK_STATE_KEY]: a
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/workflow-tool-runs.js
function isWorkflowToolRun(e) {
	return isObject$1(e) && isNonEmptyString(e.callId) && isNonEmptyString(e.toolName) && isObject$1(e.origin) && isNonEmptyString(e.origin.turnId) && typeof e.origin.stepIndex == `number` && Number.isSafeInteger(e.origin.stepIndex) && e.origin.stepIndex >= 0 && isObject$1(e.address) && isNonEmptyString(e.address.runId) && isNonEmptyString(e.address.hookToken);
}
function parseRuns(e) {
	if (!e.every(isWorkflowToolRun)) throw Error(`Corrupt workflow tool run registry: invalid run.`);
	let t = /* @__PURE__ */ new Set();
	for (let n of e) {
		let e = JSON.stringify([n.origin.turnId, n.callId]);
		if (t.has(e)) throw Error(`Corrupt workflow tool run registry: Run identities must be unique.`);
		t.add(e);
	}
	return e.map(copyWorkflowToolRun);
}
function copyWorkflowToolRun(e) {
	return {
		...e,
		origin: { ...e.origin },
		address: { ...e.address }
	};
}
function readRuns(e) {
	return parseRuns(readRunningWork(e).calls);
}
function writeRuns(e, t) {
	return writeRunningWork(e, { calls: parseRuns(t) });
}
function getBlockingWorkflowToolRuns(e, t) {
	return readRuns(e).filter((e) => t === void 0 || e.origin.turnId === t);
}
function registerWorkflowToolRun(e, t) {
	let n = [...readRuns(e.state)];
	let r = n.findIndex((e) => e.origin.turnId === t.origin.turnId && e.callId === t.callId);
	let i = n[r];
	if (i !== void 0 && i.toolName !== t.toolName) throw Error(`Replayed invocation changed its tool identity.`);
	return i === void 0 ? n.push(t) : n[r] = {
		...i,
		...t,
		origin: i.origin,
		address: {
			...i.address,
			...t.address
		}
	}, {
		...e,
		state: writeRuns(e.state, n)
	};
}
function removeBlockingWorkflowToolRuns(e, t, n) {
	let r = readRuns(e.state);
	let i = r.filter((e) => e.origin.turnId !== t || n !== void 0 && e.callId !== n);
	return i.length === r.length ? e : {
		...e,
		state: writeRuns(e.state, i)
	};
}
function findBlockingWorkflowToolRun(e, t, n) {
	let r = getBlockingWorkflowToolRuns(e, n).filter((e) => e.callId === t);
	return r.length === 1 ? r[0] : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/serialized-observability-state.js
const SERIALIZED_INSTRUMENTATION_STATE_KEYS = {
	activeChannelDeliveries: `eve.activeChannelDeliveries`,
	providerState: `eve.harness.instrumentationState`
};
function preserveSerializedInstrumentationState(e, t) {
	let n = e;
	for (let e of Object.values(SERIALIZED_INSTRUMENTATION_STATE_KEYS)) {
		let r = t[e];
		r !== void 0 && (n = {
			...n,
			[e]: r
		});
	}
	return n;
}
new ContextKey(SERIALIZED_INSTRUMENTATION_STATE_KEYS.providerState, { codec: {
	deserialize: deserializeState,
	serialize: (e) => e
} });
function deserializeState(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return {};
	let t = {};
	for (let [n, r] of Object.entries(e)) {
		if (typeof r != `object` || !r || Array.isArray(r)) continue;
		let e = r;
		let i = typeof e.attemptId == `string` ? e.attemptId : void 0;
		let a = typeof e.sessionId == `string` ? e.sessionId : void 0;
		let o = typeof e.turnId == `string` ? e.turnId : void 0;
		let s = {};
		e.abandoned === !0 && (s.abandoned = !0), i !== void 0 && (s.attemptId = i), a !== void 0 && (s.sessionId = a), o !== void 0 && (s.turnId = o), e.value !== void 0 && (s.value = cloneAndFreezeJson(e.value)), t[n] = s;
	}
	return t;
}
function cloneAndFreezeJson(e) {
	if (Array.isArray(e)) return Object.freeze(e.map((e) => cloneAndFreezeJson(e)));
	if (typeof e != `object` || !e) return e;
	let t = {};
	for (let [n, r] of Object.entries(e)) t[n] = cloneAndFreezeJson(r);
	return Object.freeze(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/trace-policy.js
function isSampledTrace(e) {
	return !!(e.traceFlags & 1);
}
function resolveTracePolicy(e, t, n) {
	try {
		let n = e?.(t);
		return resolveTracePolicyDecision(n ?? !0, t);
	} catch (e) {
		try {
			n?.(e);
		} catch {}
		return DROP_INSTRUMENTATION;
	}
}
function resolveTracePolicyDecision(e, t) {
	if (e === !1) return DROP_INSTRUMENTATION;
	if (e === !0) {
		let e = shouldCaptureInstrumentationContent(t);
		return {
			action: `record`,
			recordInputs: e,
			recordOutputs: e
		};
	}
	return e.emit ? {
		action: `record`,
		recordInputs: e.recordInputs,
		recordOutputs: e.recordOutputs,
		...e.recordInputs || e.recordOutputs ? { explicitContentAudience: t.audience } : void 0
	} : DROP_INSTRUMENTATION;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/principal-summary.js
function summarizeInstrumentationPrincipal(e, t) {
	if (e !== void 0) return e === null ? { type: `none` } : instrumentationPrincipal(e.principalType, shouldCaptureInstrumentationContent(t) ? e.principalId : void 0);
}
function instrumentationPrincipal(e, t) {
	let n = isInstrumentationPrincipalType(e) && e !== `none` ? e : `other`;
	let r = boundedPrincipalId(t);
	return r === void 0 ? { type: n } : {
		id: r,
		type: n
	};
}
function applyPrincipalTraceDecision(e, t) {
	if (e !== void 0) return e.type !== `none` && t?.action === `record` && t.recordInputs && t.recordOutputs ? e : { type: e.type };
}
function readInstrumentationPrincipals(e, t, n = resolveTracePolicyDecision(!0, t)) {
	return {
		currentPrincipal: applyPrincipalTraceDecision(summarizeInstrumentationPrincipal(e.get(AuthKey), t), n),
		initiatorPrincipal: applyPrincipalTraceDecision(summarizeInstrumentationPrincipal(e.get(InitiatorAuthKey), t), n)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/gateway-routing.js
function readGatewayRouting(e) {
	if (!isObject$1(e)) return;
	let t = e;
	let n = pickStrings(isObject$1(t.affinity) ? t.affinity : void 0, [
		`displacedProvider`,
		`outcome`,
		`pinnedProvider`
	]);
	let r = { ...pickStrings(t, [`clientSessionId`, `clientSessionIdSource`]) };
	return n !== void 0 && (r.affinity = n), Object.keys(r).length === 0 ? void 0 : r;
}
function pickStrings(e, t) {
	if (e === void 0) return;
	let n = {};
	for (let r of t) {
		let t = readNonEmptyString(e[r]);
		t !== void 0 && (n[r] = t);
	}
	return Object.keys(n).length === 0 ? void 0 : n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/content.js
function structuralProviderMetadata(e) {
	let t = e.gateway;
	if (typeof t != `object` || !t || Array.isArray(t)) return Object.freeze({});
	let n = t;
	let r = {};
	for (let e of [`cost`, `generationId`]) {
		let t = n[e];
		(typeof t == `string` || typeof t == `number`) && (r[e] = t);
	}
	let i = readGatewayRouting(n.routing);
	return i !== void 0 && (r.routing = i), Object.freeze(Object.keys(r).length === 0 ? {} : { gateway: Object.freeze(r) });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/scope.js
const key = Symbol.for(`eve.instrumentation.trace-steps`);
const global = globalThis;
const traceSteps = global[key] ??= /* @__PURE__ */ new WeakMap();
const turnKey = Symbol.for(`eve.instrumentation.turn-scopes`);
const turnGlobal = globalThis;
const turnScopes = turnGlobal[turnKey] ??= /* @__PURE__ */ new WeakSet();
function instrumentationScope(e, t) {
	let n = e.rootSessionId === void 0 ? {
		...e,
		rootSessionId: e.sessionId
	} : e;
	return t !== void 0 && traceSteps.set(n, t), n;
}
function turnScope(e) {
	let t = instrumentationScope({
		...e,
		attempt: 0,
		runId: e.turnId
	});
	return turnScopes.add(t), t;
}
createLogger(`harness.instrumentation-dispatch`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/lifecycle.js
function sessionIdempotencyKey(e) {
	return `session:${e}`;
}
function turnIdempotencyKey(e, t) {
	return `turn:${e}:${t}`;
}
function attemptIdempotencyKey(e) {
	return `model-run:${e.sessionId}:${e.runId}:${e.attempt}`;
}
function modelCallIdempotencyKey(e, t, n) {
	return `model:${e.sessionId}:${e.runId}:${e.attempt}:${String(t)}:${String(n)}`;
}
function toolCallIdempotencyKey(e, t, n) {
	return `tool:${e.sessionId}:${e.runId}:${e.attempt}:${t}:${String(n)}`;
}
function inputIdempotencyKey(e, t, n) {
	return `input:${e}:${t}:${n}`;
}
function channelDeliveryIdempotencyKey(e, t) {
	return `channel-delivery:${e}:${t}`;
}
function actionIdempotencyKey(e, t, n) {
	return `action:${e}:${t}:${n}`;
}
const INSTRUMENTATION_PRINCIPAL_TYPES = [
	`anonymous`,
	`app`,
	`local-dev`,
	`none`,
	`other`,
	`runtime`,
	`service`,
	`unknown`,
	`user`
];
function isInstrumentationPrincipalType(e) {
	return INSTRUMENTATION_PRINCIPAL_TYPES.some((t) => t === e);
}
const traceStateKey = (e, t) => JSON.stringify([e, t]);
function traceStateValue(e, t, n) {
	return e?.entries[traceStateKey(t, n)]?.value;
}
const emptyAgentTraceContextState = () => ({ entries: {} });
function deserializeAgentTraceContextState(e) {
	try {
		let t = parseJsonObject(e);
		if (typeof t.entries != `object` || t.entries === null || Array.isArray(t.entries)) return emptyAgentTraceContextState();
		let n = {};
		for (let [e, r] of Object.entries(t.entries)) {
			if (typeof r != `object` || !r || Array.isArray(r)) continue;
			let t = r;
			t.kind !== `session` && t.kind !== `turn` && t.kind !== `checkpoint` && t.kind !== `action` || t.value === null || typeof t.value != `object` || Array.isArray(t.value) || (n[e] = r);
		}
		return { entries: n };
	} catch {
		return emptyAgentTraceContextState();
	}
}
const AgentTraceContextKey = new ContextKey("eve.harness.agentTrace", { codec: {
	deserialize: deserializeAgentTraceContextState,
	serialize: (e) => e
} });
function currentTraceSessionId(e) {
	return traceStateValue(contextStorage.getStore()?.get(AgentTraceContextKey), `session`, e)?.traceSessionId;
}
function pruneAgentTraceState(e, t, n) {
	try {
		pruneTraceOwnership(e, t, n);
	} catch (e) {
		createLogger(`tracing.retention`).warn(`could not reconcile trace ownership; preserving trace state`, { error: e });
	}
}
function pruneTraceOwnership(e, t, n) {
	let r = e.get(AgentTraceContextKey);
	if (r === void 0) return;
	let i = new Set(getBlockingWorkflowToolRuns(n).map((e) => e.callId));
	let a = Object.fromEntries(Object.entries(r.entries).filter(([, e]) => e.kind !== `action` || e.value.sessionId !== t || e.active || i.has(e.value.callId)));
	e.set(AgentTraceContextKey, {
		...r,
		entries: a
	});
}
function readSessionTraceDecision(e, t) {
	return traceStateValue(e.get(AgentTraceContextKey), `session`, t)?.decision;
}
function preserveSerializedAgentTraceState(e, t) {
	let n = t[AgentTraceContextKey.name];
	return n === void 0 ? e : {
		...e,
		[AgentTraceContextKey.name]: n
	};
}
function readTurnTraceContext(e, t, n) {
	let r = e[AgentTraceContextKey.name];
	if (r === void 0) return;
	let i = deserializeAgentTraceContextState(r);
	let a = traceStateValue(i, `turn`, JSON.stringify([t, n]));
	return a === void 0 ? void 0 : withTraceDecision(e, a.context, traceStateValue(i, `session`, t)?.decision);
}
function readActionTraceContext(e, t, n, r) {
	let i = e[AgentTraceContextKey.name];
	if (i === void 0) return;
	let a = deserializeAgentTraceContextState(i);
	let o = traceStateValue(a, `action`, actionIdempotencyKey(t, n, r));
	if (o !== void 0) return withTraceDecision(e, {
		...o.context,
		isRemote: !1
	}, traceStateValue(a, `session`, o.sessionId)?.decision);
}
function withTraceDecision(e, t, n) {
	let r = e[SessionTraceSeedKey.name];
	let i = resolveForwardedTraceSeed({
		decision: n ?? r?.decision,
		forwardedTracePolicy: r?.forwardedTracePolicy,
		traceFlags: t.traceFlags
	});
	let a = i.decision;
	let o = i.forwardedTracePolicy;
	let s = decisionToTraceContentCeiling(a);
	let c = {
		...t,
		traceFlags: i.traceFlags
	};
	if (o === void 0) return a === void 0 ? c : {
		...c,
		decision: a
	};
	let l = s === void 0 ? o : {
		...o,
		ceiling: s
	};
	return a === void 0 ? {
		...c,
		forwardedTracePolicy: l
	} : {
		...c,
		decision: a,
		forwardedTracePolicy: l
	};
}
var ContextAgentTraceStateStore = class {
	get(e, t) {
		let n = contextStorage.getStore()?.get(AgentTraceContextKey)?.entries[traceStateKey(e === `anchor` ? `action` : e, t)];
		if (!(n === void 0 || n.kind === `action` && !(e === `anchor` ? n.retained : n.active))) return n.value;
	}
	set(e, t, n) {
		updateState((r) => {
			let i = traceStateKey(e === `anchor` ? `action` : e, t);
			let a = r.entries[i];
			let o = e === `action` || e === `anchor` ? {
				kind: `action`,
				value: n,
				active: e === `action` || a?.kind === `action` && a.active,
				retained: e === `anchor` || a?.kind === `action` && a.retained
			} : {
				kind: e,
				value: n
			};
			return {
				...r,
				entries: {
					...r.entries,
					[i]: o
				}
			};
		});
	}
	delete(e, t) {
		updateState((n) => {
			let r = traceStateKey(e === `anchor` ? `action` : e, t);
			let i = n.entries[r];
			let a = { ...n.entries };
			return i?.kind === `action` && e === `action` && i.retained ? a[r] = {
				...i,
				active: !1
			} : i?.kind === `action` && e === `anchor` && i.active ? a[r] = {
				...i,
				retained: !1
			} : delete a[r], {
				...n,
				entries: a
			};
		});
	}
	update(e, t, n) {
		let r = this.get(e, t);
		r !== void 0 && this.set(e, t, n(r));
	}
	entries(e) {
		return Object.entries(contextStorage.getStore()?.get(AgentTraceContextKey)?.entries ?? {}).flatMap(([t, n]) => n.kind === (e === `anchor` ? `action` : e) && (n.kind !== `action` || (e === `anchor` ? n.retained : n.active)) ? [[JSON.parse(t)[1], n.value]] : []);
	}
};
function updateState(e) {
	loadContext().set(AgentTraceContextKey, (t) => e(t ?? emptyAgentTraceContextState()));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/profile.js
function eveOutputMapping(e) {
	return {
		attributes(t, n) {
			let r = {};
			for (let [e, i] of Object.entries(n)) e === `agent.connection.name` ? r[`eve.connection.name`] = i : t.type === `channelRequest` && e === `agent.channel.name` ? r[`eve.channel.name`] = i : t.type === `channelRequest` && e === `agent.channel.kind` ? r[`eve.channel.kind`] = i : r[e] = i;
			if (n[`agent.run.id`] !== void 0) {
				let i = e?.resolve(t) ?? {
					platform: process.env.VERCEL_ENV === void 0 ? `other` : `vercel`,
					traceSessionId: typeof n[`agent.run.id`] == `string` ? currentTraceSessionId(n[`agent.run.id`]) : void 0
				};
				i?.platform === `vercel` && i.traceSessionId !== void 0 && (r[`vercel.session_id`] = i.traceSessionId);
			}
			return r;
		},
		link: (e, t) => ({ "eve.link.type": t.relationship === `execution.delivery` ? `workflow.delivery` : t.relationship })
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/channel-delivery-span.js
const log$1 = createLogger(`channel.delivery`);
const DeliveryAttemptKey = new ContextKey(`eve.channelDeliveryAttempt`);
function recordChannelDeliveryFailure(e, t) {
	let n = contextStorage.getStore()?.get(DeliveryAttemptKey);
	n !== void 0 && (n.failure ??= {
		code: e,
		errorId: t
	});
}
async function withChannelDeliverySpan(e, t) {
	let n = contextStorage.getStore();
	if (n === void 0) return t();
	let r = {};
	let i = Date.now();
	n.setVirtualContext(DeliveryAttemptKey, r);
	try {
		await t();
	} finally {
		n.delete(DeliveryAttemptKey);
	}
	if (e.reachesPerson || r.failure !== void 0) try {
		await recordDelivery(n, e, r, i);
	} catch (e) {
		log$1.warn(`recording a channel delivery span failed`, { error: e });
	}
}
async function recordDelivery(e, t, n, r) {
	let i = e.get(SessionIdKey);
	if (i === void 0) return;
	let a = t.turnId === void 0 ? void 0 : await getInstrumentationRuntime()?.readTurnTraceContext?.(i, t.turnId);
	let { connectionEventTraceContext: o, sideSpanHost: s } = await import("./_5.mjs");
	let c = s(e, o(a));
	if (c === void 0) return;
	let l = `agent.channel.deliver`;
	let u = {
		"agent.channel.kind": truncateTelemetryText(t.adapterKind, 128),
		"agent.channel.event.type": t.eventType,
		"agent.channel.delivery.outcome": n.failure === void 0 ? `completed` : `failed`,
		"agent.run.id": truncateTelemetryText(i, 256),
		"operation.name": l,
		"resource.name": l
	};
	t.turnId !== void 0 && (u[`agent.turn.id`] = t.turnId), n.failure?.errorId !== void 0 && (u[`eve.error.id`] = n.failure.errorId);
	let d = otelTelemetry({
		tracerName: `eve.channel`,
		mapping: eveOutputMapping()
	}).startSpan({
		type: `step`,
		operationId: l,
		name: l,
		kind: `PRODUCER`,
		attributes: u,
		startTimeMs: r
	}, { context: c });
	n.failure === void 0 ? d.setStatus(`OK`) : d.fail(void 0, n.failure.code), d.end();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/adapter.js
const log = createLogger(`channel.adapter`);
function defaultDeliverResult(e) {
	if (e.message !== void 0) return attachClientContext(attachInputText({
		answers: e.answers,
		message: e.message,
		context: e.context,
		outputSchema: e.outputSchema
	}, readInputText(e)), readClientContext(e));
	if (e.answers !== void 0 && e.answers.length > 0) return attachClientContext({
		answers: e.answers,
		context: e.context,
		outputSchema: e.outputSchema
	}, readClientContext(e));
	if (e.context !== void 0 && e.context.length > 0 || (readClientContext(e)?.length ?? 0) > 0) return attachClientContext({
		context: e.context,
		outputSchema: e.outputSchema
	}, readClientContext(e));
	if (e.outputSchema !== void 0) return { outputSchema: e.outputSchema };
}
function getAdapterKind(e) {
	return e.kind;
}
function seedChannelState(e, t) {
	return {
		...structuredClone(e),
		...t
	};
}
async function callAdapterEventHandler(e, t, n) {
	let r = `facts` in t ? `committed` : t.type;
	let i = e[r];
	if (i === void 0) return;
	let a = getAdapterKind(e);
	await withChannelDeliverySpan({
		adapterKind: a,
		eventType: r,
		reachesPerson: reachesPerson(t),
		turnId: n.scope?.turnId
	}, async () => {
		try {
			await i(t, n);
		} catch (e) {
			recordChannelDeliveryFailure(`channel_handler_failed`, logError(log, `adapter event handler threw — event swallowed`, e, {
				adapterKind: a,
				eventType: r
			}));
		}
	});
}
function reachesPerson(e) {
	return `facts` in e ? !1 : e.type === `interaction.opened` || e.type === `content.completed` && e.data.kind === `text` && contentPhase(e.data.phase) === `reply`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/definitions/removed-event-keys.js
const REPLACED = {
	"action.input.appended": "`call.input`",
	"agent.started": "`child.opened`, which names the call whose run opened the child session",
	"approval.candidate": "`response.submitted` and `response.settled` (`refused`, `failed`, `expired`, `withdrawn`); the responder is the principal of the response's delivery",
	"approval.settled": "`interaction.settled` with `outcome: \"accepted\"` or `\"declined\"`; `cause.responseId` names the deciding response",
	"authorization.completed": "`interaction.settled` for the sign-in interaction",
	"authorization.required": "`interaction.opened` with `request.kind: \"sign-in\"`",
	"input.requested": "`interaction.opened`, one per request; one commit's requests are one batch",
	"input.resolved": "`interaction.settled`, one per request",
	"action.partial": "`call.progress`",
	"action.result": "`call.settled`, the only place a call's output appears",
	"actions.requested": "`call.requested`, one per call",
	"compaction.completed": "`context.settled` with `kind: \"compaction\"`",
	"compaction.requested": "`context.started` with `kind: \"compaction\"`",
	"context.cleared": "`context.settled` with `kind: \"clear\"`",
	"message.appended": "`content.delta` with `kind: \"text\"`",
	"message.completed": "`content.completed`; `phase: \"reply\"` marks the reply, instead of `finishReason`",
	"message.received": "`delivery.consumed`",
	"reasoning.appended": "`content.delta` with `kind: \"reasoning\"`",
	"reasoning.completed": "`content.completed` with `kind: \"reasoning\"`",
	"result.completed": "`content.completed` with `kind: \"result\"`",
	"session.completed": "`session.ended` with `outcome: \"completed\"`",
	"session.failed": "`session.ended` with `outcome: \"failed\"`",
	"session.waiting": "`delivery.settled` (a message's response is done) or `turn.settled`, and `idle(ctx.view)` from `eve/events` (nothing is running)",
	"step.completed": "`model.settled`",
	"step.failed": "`model.settled` with `outcome: \"failed\"`",
	"step.started": "`model.started`, or `model.requested` before the model is chosen",
	"task.settled": "`call.settled` for each call the task served",
	"turn.cancelled": "`turn.settled` with `outcome: \"cancelled\"`",
	"turn.completed": "`turn.settled` with `outcome: \"completed\"`",
	"turn.failed": "`turn.settled` with `outcome: \"failed\"`",
	"turn.waiting": "`turn.paused`",
	"turn.resumed": "the turn's next `model.requested` or `delivery.consumed`; `waiting(ctx.view, turnId)` from `eve/events` reads what an open turn waits on"
};
function removedEventKeyMessage(e) {
	let t = REPLACED[e];
	return t === void 0 ? void 0 : `"${e}" was removed in session stream version 27. Key on ${t}.`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/compiled-channel.js
const CHANNEL_INSTRUMENTATION_KIND = Symbol.for(`eve.channel.instrumentationKind`);
const CHANNEL_INSTRUMENTATION_KINDS = Symbol.for(`eve.channel.instrumentationKinds`);
const channelInstrumentationKindGlobal = globalThis;
channelInstrumentationKindGlobal[CHANNEL_INSTRUMENTATION_KINDS] ??= /* @__PURE__ */ new Map();
const channelInstrumentationKinds = channelInstrumentationKindGlobal[CHANNEL_INSTRUMENTATION_KINDS];
function isCompiledChannel(e) {
	return typeof e == `object` && !!e && e.__kind === `eve:channel`;
}
function setChannelInstrumentationKind(e, t) {
	Object.defineProperty(e, CHANNEL_INSTRUMENTATION_KIND, {
		configurable: !0,
		enumerable: !1,
		value: t
	});
	let n = channelRouteSignature(e);
	n !== void 0 && channelInstrumentationKinds.set(n, t);
}
function channelRouteSignature(e) {
	if (e.routes.length !== 0) return e.routes.map((e) => `${e.method.toUpperCase()} ${e.path}`).sort().join(`
`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/routes.js
function GET(e, t) {
	return {
		transport: `http`,
		method: `GET`,
		path: e,
		handler: t
	};
}
function HEAD(e, t) {
	return {
		transport: `http`,
		method: `HEAD`,
		path: e,
		handler: t
	};
}
function POST(e, t) {
	return {
		transport: `http`,
		method: `POST`,
		path: e,
		handler: t
	};
}
function PUT(e, t) {
	return {
		transport: `http`,
		method: `PUT`,
		path: e,
		handler: t
	};
}
function PATCH(e, t) {
	return {
		transport: `http`,
		method: `PATCH`,
		path: e,
		handler: t
	};
}
function DELETE(e, t) {
	return {
		transport: `http`,
		method: `DELETE`,
		path: e,
		handler: t
	};
}
function isHttpRouteDefinition(e) {
	return e.transport !== `websocket`;
}
function isWebSocketRouteDefinition(e) {
	return e.transport === `websocket`;
}
const HTTP_ADAPTER = { kind: "http" };
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/session-stranded-error.js
var SessionStrandedError = class SessionStrandedError extends Error {
	owner;
	constructor(e, t) {
		super(t ?? describeStrandedSession(e)), this.name = `SessionStrandedError`, this.owner = e;
	}
	static is(e) {
		return e instanceof SessionStrandedError || typeof e == `object` && !!e && Reflect.get(e, `name`) === `SessionStrandedError` && typeof Reflect.get(e, `owner`) == `object`;
	}
};
function describeStrandedSession(e, t) {
	return `This session is stranded: ${e.eveVersion === void 0 ? `it was created by an earlier eve release` : `it was created by eve ${e.eveVersion}`} on a deployment that is no longer available, so it cannot process messages. ${t ?? `Reset the session to start fresh.`}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/eve-error.js
const LINEAGE = Symbol.for(`eve.error.lineage`);
var EveError = class EveError extends Error {
	static errorName = `EveError`;
	code;
	constructor(e, t, n) {
		if (super(t, n), new.target !== EveError && !Object.hasOwn(new.target, `errorName`)) throw TypeError(`${new.target.name} must declare its own static errorName.`);
		this.name = new.target.errorName, this.code = e;
		let r = [new.target.errorName];
		for (let e = new.target; e !== EveError;) e = Object.getPrototypeOf(e), r.push(e.errorName);
		Object.defineProperty(this, LINEAGE, { value: Object.freeze(r) });
	}
	static is(e) {
		if (typeof e != `object` || !e) return !1;
		let t = Reflect.get(e, LINEAGE);
		return Array.isArray(t) && t.includes(this.errorName);
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/session-not-active-error.js
var SessionNotActiveError = class extends EveError {
	static errorName = `SessionNotActiveError`;
	retryable;
	constructor(e = {}) {
		let t = e.retryable === !0;
		super(t ? `session_not_ready` : `session_not_active`, t ? `The session is not ready to accept commands. Retry shortly.` : `The session is no longer active. Start a new session.`), this.retryable = t;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/url-refs.js
const EVE_URL_SCHEME = `eve-url:`;
function serializeUrlFilePart(e) {
	return `${EVE_URL_SCHEME}${e.href}`;
}
function isSerializedUrlFilePart(e) {
	return typeof e == `string` && e.startsWith(EVE_URL_SCHEME);
}
function deserializeUrlFilePart(e) {
	return new URL(e.slice(8));
}
const INTERNAL_REF_SCHEMES = [
	EVE_URL_SCHEME,
	"eve-sandbox:",
	"chat-sdk-file:"
];
function hasInternalRefScheme(e) {
	let t = /^\s*([a-z][a-z\d+.-]*:)/i.exec(e)?.[1]?.toLowerCase();
	return t !== void 0 && INTERNAL_REF_SCHEMES.includes(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/session-schedule.js
function readSerializedSessionSchedule(e) {
	let t = e[ScheduleIdKey.name];
	if (typeof t != `string`) return;
	let n = e[ScheduleInstanceKey.name];
	let r = e[OccurrenceIdKey.name];
	return {
		definition: t,
		instance: typeof n == `string` ? n : void 0,
		occurrenceId: typeof r == `string` ? r : void 0
	};
}
function readSessionSchedule(e) {
	let t = e.get(ScheduleIdKey);
	if (t !== void 0) return {
		definition: t,
		instance: e.get(ScheduleInstanceKey),
		occurrenceId: e.get(OccurrenceIdKey)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/instrumentation-channel-kind.js
const FRAMEWORK_CHANNEL_KINDS = /* @__PURE__ */ new Set([
	`http`,
	`schedule`,
	`subagent`
]);
function isInstrumentationChannelKind(e) {
	return e.startsWith(`channel:`) || FRAMEWORK_CHANNEL_KINDS.has(e);
}
function normalizeInstrumentationChannelKind(e) {
	return e !== void 0 && isInstrumentationChannelKind(e) ? e : `unknown`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/conversation-context.js
const CONVERSATION_SPACE_TYPES = [`direct`, `shared`];
function readSpaceId(e) {
	if (typeof e != `string`) return;
	let t = e.trim();
	if (!(t.length === 0 || t.length > 512 || /[\u0000-\u001f\u007f]/u.test(t))) return t;
}
function normalizeConversationSpace(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return;
	let t = e;
	let n = readSpaceId(t.id);
	let r = t.type;
	if (n === void 0 || typeof r != `string` || !CONVERSATION_SPACE_TYPES.includes(r)) return;
	let i = readSpaceId(t.workspaceId);
	let a = t.visibility === `public` || t.visibility === `private` ? t.visibility : void 0;
	return {
		id: n,
		type: r,
		...a !== void 0 && { visibility: a },
		...i !== void 0 && { workspaceId: i }
	};
}
const UNKNOWN_CONVERSATION_CONTEXT = {
	audience: `unknown`,
	channel: { kind: `unknown` },
	environment: `production`,
	principalType: `anonymous`
};
function resolveConversationContext(e, t, n = {}) {
	return e === void 0 ? {
		...UNKNOWN_CONVERSATION_CONTEXT,
		audience: t.forwardedTracePolicy?.originAudience ?? `unknown`,
		channel: { kind: normalizeInstrumentationChannelKind(t.channelKind) },
		environment: t.environment,
		principalType: t.principalType ?? `anonymous`
	} : !n.forwardedOverridesStored || t.forwardedTracePolicy === void 0 ? e : {
		...e,
		audience: t.forwardedTracePolicy.originAudience
	};
}
const ConversationContextKey = new ContextKey(`eve.conversation`, { codec: {
	serialize: (e) => e,
	deserialize: (e) => {
		if (typeof e != `object` || !e || Array.isArray(e)) return UNKNOWN_CONVERSATION_CONTEXT;
		let t = normalizeConversationContext(e);
		return t === void 0 ? UNKNOWN_CONVERSATION_CONTEXT : t;
	}
} });
function normalizeConversationContext(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return;
	let t = e;
	let n = normalizeConversationChannel(t.channel);
	let r = t.environment;
	let i = t.principalType;
	if (n === void 0 || r !== `development` && r !== `preview` && r !== `production` || !isNonEmptyString(i)) return;
	let a = normalizeConversationSpace(t.space);
	return {
		audience: normalizeChannelAudience(t.audience),
		channel: n,
		environment: r,
		principalType: i,
		...a !== void 0 && { space: a }
	};
}
function normalizeConversationChannel(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return;
	let t = e;
	return {
		kind: normalizeInstrumentationChannelKind(typeof t.kind == `string` ? t.kind : void 0),
		name: isNonEmptyString(t.name) ? t.name : void 0
	};
}
export { ContextAgentTraceStateStore, ConversationContextKey, DELETE, FACT_CATALOG, FAIL_CLOSED_FORWARDED_TRACE_ASSERTION, GET, HEAD, HTTP_ADAPTER, PATCH, POST, PUT, SessionNotActiveError, SessionStrandedError, actionIdempotencyKey, activeTurn, applyLiveDeliveryAudienceCeiling, askedCall, attachClientContext, attachInputText, attemptIdempotencyKey, callAdapterEventHandler, callRun, channelDeliveryIdempotencyKey, copyView, decidingAnswer, decisionToTraceContentCeiling, defaultContentCapture, defaultDeliverResult, describeStrandedSession, deserializeUrlFilePart, displayProperName, displayTitle, emptyPreviews, emptySessionView, eveOutputMapping, findBlockingWorkflowToolRun, foldLine, foldReceivedEvent, formatTraceContentCeiling, getAdapterKind, getBlockingWorkflowToolRuns, getInstrumentationRuntime, hasInternalRefScheme, inputIdempotencyKey, instrumentationPrincipal, instrumentationScope, interaction, interactionBatches, interactionOwner, intersectInstrumentationDecisions, isCompiledChannel, isFactType, isHttpRouteDefinition, isInstrumentationChannelKind, isKnownOutcome, isOpen, isProgressType, isSampledTrace, isSerializedUrlFilePart, isTerminalType, isWebSocketRouteDefinition, isWorking, modelCallIdempotencyKey, normalizeChannelAudience, normalizeConversationContext, normalizeConversationSpace, normalizeInstrumentationChannelKind, openInteractions, openRequests, openSignIns, openUnder, openWork, preserveSerializedAgentTraceState, preserveSerializedInstrumentationState, promptQueueHead, pruneAgentTraceState, readActionTraceContext, readAnswerText, readClientContext, readForwardedTraceAssertion, readInputText, readInstrumentationDecision, readInstrumentationPrincipals, readRunningWork, readSerializedSessionSchedule, readSessionSchedule, readSessionTraceDecision, readTurnTraceContext, refOf, registerWorkflowToolRun, removeBlockingWorkflowToolRuns, removedEventKeyMessage, resolveConversationContext, resolveForwardedTraceSeed, resolveTracePolicy, resolveTracePolicyDecision, responderOf, rowOf, runTurn, scopeOf, seedChannelState, serializeUrlFilePart, sessionIdempotencyKey, setChannelInstrumentationKind, shouldCaptureInstrumentationContent, structuralProviderMetadata, subjectTurn, tasks, toolCallIdempotencyKey, traceContentCeilingToDecision, turnIdempotencyKey, turnScope, waiting, writeRunningWork };

//# sourceMappingURL=eve16.mjs.map