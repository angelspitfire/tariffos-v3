import { activeTurn, emptySessionView, interactionOwner, openRequests } from "./eve16.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/dev-checks.js
function checksSessionEvents() {
	let e = process.env.EVE_CHECK_SESSION_EVENTS;
	return e === `1` || e !== `0` && process.env.EVE_DEV === `1`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/state.js
const TURN_STATE_KEY = `eve.harness.turnState`;
const EMPTY_TURN_STATE = {
	remembered: {},
	suspended: []
};
function readTurnState(e) {
	return e?.[TURN_STATE_KEY] ?? EMPTY_TURN_STATE;
}
function writeTurnState(e, t) {
	let n = { ...e.state };
	return t.suspended.length === 0 && t.queued === void 0 && Object.keys(t.remembered).length === 0 ? delete n[TURN_STATE_KEY] : n[TURN_STATE_KEY] = t, {
		...e,
		state: Object.keys(n).length === 0 ? void 0 : n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection.js
function initialSessionProjection() {
	return {
		counters: {
			changes: 0,
			runs: 0
		},
		view: emptySessionView()
	};
}
function foldSession(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of t) switch (r.type) {
		case `model.requested`:
			e = {
				...e,
				counters: {
					...e.counters,
					runs: e.counters.runs + 1
				}
			};
			break;
		case `context.started`:
			e = {
				...e,
				counters: {
					...e.counters,
					changes: e.counters.changes + 1
				}
			};
			break;
		case `interaction.settled`: {
			let t = e.view.interactions[r.data.interactionId];
			if (t?.request.kind !== `budget` || t.origin !== void 0 || !(`turnId` in t.subject) || t.outcome !== `accepted` || r.data.outcome !== `accepted` || t.closedAt !== e.view.position - 1 || n.has(t.interactionId)) break;
			n.add(t.interactionId), e = {
				...e,
				usageWindow: {
					interactionId: t.interactionId,
					index: (e.usageWindow?.index ?? 0) + 1,
					start: e.view.usage.total
				}
			};
			break;
		}
		case `content.delta`:
			r.data.kind === `text` && r.data.delta.length > 0 && (e = markOutputStarted(e, r.scope?.runId));
			break;
		case `content.completed`: {
			let { kind: t, runId: n, value: i } = r.data;
			(t === `result` || t === `text` && typeof i == `string` && i.length > 0) && (e = markOutputStarted(e, n));
			break;
		}
	}
	return e;
}
function markOutputStarted(e, t) {
	let n = t === void 0 ? activeTurnIdOf(e) : runTurnId(e, t);
	return n === void 0 || e.outputStarted === n ? e : {
		...e,
		outputStarted: n
	};
}
function activeTurnIdOf(e) {
	return activeTurn(e.view)?.turnId;
}
function latestTurnIdOf(e) {
	return e.view.session.latestTurnId;
}
function runTurnId(e, t) {
	let n = e.view.runs[t]?.owner;
	return n !== void 0 && `turnId` in n ? n.turnId : void 0;
}
function nextRunId(e) {
	return `run_${String(e.counters.runs)}`;
}
function nextChangeId(e) {
	return `change_${String(e.counters.changes)}`;
}
function openRunOf(e, t) {
	let n;
	for (let r of Object.values(e.view.runs)) {
		if (r.status === `settled` || !(`turnId` in r.owner) || r.owner.turnId !== t) continue;
		let e = r.step ?? 0;
		(n === void 0 || e >= n.step) && (n = {
			runId: r.runId,
			step: e
		});
	}
	return n?.runId;
}
function turnSequence(e) {
	let t = /^turn_(\d+)$/.exec(e);
	return t === null ? void 0 : Number(t[1]);
}
function turnCoordinates(e) {
	let t = activeTurnIdOf(e);
	if (t !== void 0) return turnCoordinatesOf(e, t);
	let n = e.view.session.turnCount;
	return {
		sequence: n,
		stepIndex: 0,
		turnId: `turn_${n}`
	};
}
function turnCoordinatesOf(e, t) {
	let n = e.view.turns[t]?.runs ?? 0;
	let { latestTurnId: r, turnCount: i } = e.view.session;
	return {
		sequence: (t === r ? Math.max(0, i - 1) : void 0) ?? turnSequence(t) ?? Math.max(0, i - 1),
		stepIndex: Math.max(0, n - 1),
		turnId: t
	};
}
const TASK_TOOL_NAMES = ["eve__task_wait", "eve__task_cancel"];
function isTaskControlTool(e) {
	return TASK_TOOL_NAMES.includes(e);
}
function pendingTaskToolCalls(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n.content != `string`) for (let e of n.content) e.type === `tool-result` && t.add(e.toolCallId);
	let n = [];
	for (let r of e) if (r.role === `assistant` && typeof r.content != `string`) for (let e of r.content) {
		if (e.type !== `tool-call` || t.has(e.toolCallId)) continue;
		let r = typeof e.input == `object` && e.input !== null ? e.input : {};
		if (e.toolName === "eve__task_cancel") {
			let t = String(Reflect.get(r, `taskId`));
			n.push({
				callId: e.toolCallId,
				kind: "eve__task_cancel",
				taskId: t
			});
		} else if (e.toolName === "eve__task_wait") {
			let t = Reflect.get(r, `timeoutSeconds`);
			n.push({
				callId: e.toolCallId,
				kind: "eve__task_wait",
				timeoutMs: typeof t == `number` ? t * 1e3 : 18e5
			});
		}
	}
	return n;
}
function storedProjection(e) {
	let t = e?.["eve.harness.sessionProjection"];
	if (t === void 0) return initialSessionProjection();
	let n = initialSessionProjection();
	let r = {
		counters: t.counters ?? n.counters,
		view: t.view ?? n.view,
		usageWindow: t.usageWindow
	};
	return t.outputStarted === void 0 ? r : {
		...r,
		outputStarted: t.outputStarted
	};
}
function turnPosition(e) {
	let { sequence: t, stepIndex: n } = turnCoordinates(e);
	let r = activeTurnIdOf(e);
	let i = {
		sessionStarted: e.view.session.status !== `new`,
		sequence: t,
		stepIndex: n,
		turnId: r ?? ``
	};
	if (r === void 0) return i;
	e.outputStarted === r && (i.assistantOutputStarted = !0);
	let a = openRunOf(e, r);
	return a !== void 0 && (i.runId = a), i;
}
function activeTurnId(e) {
	return e.turnId === `` ? `turn_${e.sequence}` : e.turnId;
}
function isBetweenTurns(e) {
	return activeTurnIdOf(e) === void 0;
}
function queuedInput(e) {
	return readTurnState(e).queued;
}
function suspendedSteps(e) {
	return readTurnState(e).suspended;
}
function answeredCallIds(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if ((n.role === `tool` || n.role === `assistant`) && typeof n.content != `string`) for (let e of n.content) e.type === `tool-result` && t.add(e.toolCallId);
	return t;
}
function runningTasks(e) {
	let t = answeredCallIds(e.messages);
	return e.tasks.filter((e) => !t.has(e.callId));
}
function runtimeWait(e) {
	let t = suspendedSteps(e).flatMap((e) => {
		let t = runningTasks(e);
		let n = pendingTaskToolCalls(e.messages);
		return t.length === 0 && n.length === 0 ? [] : [{
			step: e,
			tasks: t,
			taskToolCalls: n
		}];
	});
	let n = t[0];
	if (n === void 0) return;
	let r = t.flatMap((e) => e.tasks);
	let i = t.flatMap((e) => e.taskToolCalls);
	return {
		callIds: [...r.map((e) => e.callId), ...i.map((e) => e.callId)],
		event: n.step.event,
		taskToolCalls: i,
		tasks: r
	};
}
function stepForRequest(e, t) {
	return e.turn.suspended.find((e) => e.requests.some((e) => e.interactionId === t));
}
function ownOpenRequestIds(e) {
	return new Set(openRequests(e.projection.view).filter((t) => t.origin === void 0 && interactionOwner(e.projection.view, t).taskId === void 0 && !e.relayedRequestIds.has(t.interactionId)).map((e) => e.interactionId));
}
function endingStepKeys(e) {
	return new Set(e.turn.suspended.flatMap((e) => e.endsTurn === !0 ? [stepCoordinatesKey(e.event)] : []));
}
function committedEndingStep(e, t) {
	if (t.size === 0) return !1;
	let n = new Set(e.turn.suspended.map((e) => stepCoordinatesKey(e.event)));
	return [...t].some((e) => !n.has(e));
}
function parkedCallsAnswered(e, t) {
	return e.every((e) => {
		let n = answeredCallIds(e.messages);
		return e.messages.every(({ content: e, role: r }) => r !== `assistant` || typeof e == `string` || e.every((e) => e.type !== `tool-call` || e.providerExecuted !== !0 && (n.has(e.toolCallId) || t.has(e.toolCallId))));
	});
}
function stepCoordinatesKey(e) {
	return `${e.turnId}:${e.sequence}:${e.stepIndex}`;
}
export { activeTurnId, activeTurnIdOf, answeredCallIds, checksSessionEvents, committedEndingStep, endingStepKeys, foldSession, initialSessionProjection, isBetweenTurns, isTaskControlTool, latestTurnIdOf, nextChangeId, nextRunId, openRunOf, ownOpenRequestIds, parkedCallsAnswered, queuedInput, readTurnState, runningTasks, runtimeWait, stepForRequest, storedProjection, turnCoordinatesOf, turnPosition, writeTurnState };

//# sourceMappingURL=eve19.mjs.map