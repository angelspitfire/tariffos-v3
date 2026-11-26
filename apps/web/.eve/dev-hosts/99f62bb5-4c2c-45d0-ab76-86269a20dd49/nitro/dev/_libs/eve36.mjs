import { SandboxKey, SessionKey, contextStorage, loadContext } from "./eve13.mjs";
import { ConversationContextKey, FACT_CATALOG, activeTurn, copyView, emptyPreviews, emptySessionView, foldLine, foldReceivedEvent, interactionOwner, isFactType, isKnownOutcome, isOpen, isProgressType, isTerminalType, openUnder, readSessionSchedule, refOf, rowOf, scopeOf, subjectTurn, waiting } from "./eve16.mjs";
import { checksSessionEvents, foldSession, storedProjection } from "./eve19.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/build-callback-context.js
function buildCallbackContext() {
	let e = loadContext();
	let t = e.require(SessionKey);
	let n = e.get(ConversationContextKey);
	return {
		session: {
			id: t.sessionId,
			auth: t.auth,
			turn: t.turn,
			parent: t.parent,
			schedule: readSessionSchedule(e),
			predecessor: t.predecessor
		},
		...n !== void 0 && { conversation: n },
		getSandbox: sandboxOf(e)
	};
}
function sandboxOf(e) {
	return ((t) => {
		let n = e.get(SandboxKey);
		if (n === void 0) throw Error(`eve sandbox runtime access is unavailable in the current async context. Call ctx.getSandbox() only from authored runtime functions such as tools, hooks, dynamic values, and channel events.`);
		if (t !== void 0 && n.environment !== t) throw Error(`The requested sandbox environment is not active for the current session.`);
		return n.get().then((e) => {
			if (e === null) throw Error(`The sandbox is not available in the current authored runtime context.`);
			return withRuntimeSandboxLifecycle(e, async (e) => {
				if (n.delete === void 0) throw Error(`The active sandbox runtime does not support deletion.`);
				await n.delete(e);
			}, async () => await n.stop());
		});
	});
}
function withRuntimeSandboxLifecycle(e, t, n) {
	return new Proxy(Object.create(null), {
		get(r, i) {
			if (i === `delete`) return t;
			if (i === `stop`) return n;
			let a = Reflect.get(e, i, e);
			return typeof a == `function` ? a.bind(e) : a;
		},
		getOwnPropertyDescriptor(t, n) {
			if (n === `delete` || n === `stop`) return {
				configurable: !0,
				enumerable: !0,
				writable: !1
			};
			let r = Reflect.getOwnPropertyDescriptor(e, n);
			return r === void 0 ? void 0 : {
				...r,
				configurable: !0
			};
		},
		has(t, n) {
			return n === `delete` || n === `stop` || Reflect.has(e, n);
		},
		ownKeys() {
			return [.../* @__PURE__ */ new Set([
				...Reflect.ownKeys(e),
				`delete`,
				`stop`
			])];
		}
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-lines.js
function isKnownRecordType(e) {
	return isFactType(e) || isProgressType(e);
}
function linesOf(e, t) {
	let n = [];
	let r = [];
	let flush = () => {
		r.length !== 0 && (n.push({
			at: t,
			facts: r
		}), r = []);
	};
	for (let t of e) isProgressType(t.type) ? (flush(), n.push({ progress: t })) : r.push(t);
	return flush(), n;
}
function eventsOfLine(e, t, n) {
	let r = `facts` in e ? e.facts : [e.progress];
	let i = `facts` in e ? e.at : n;
	let a = [];
	r.forEach((e, n) => {
		if (typeof e != `object` || !e) return;
		let r = e;
		isKnownRecordType(r.type) && a.push({
			...r,
			meta: {
				at: i,
				endOfLine: !1,
				position: {
					index: n,
					line: t
				}
			}
		});
	});
	let o = a.at(-1);
	return o !== void 0 && (a[a.length - 1] = {
		...o,
		meta: {
			...o.meta,
			endOfLine: !0
		}
	}), a;
}
function createEventReader(e = (/* @__PURE__ */ new Date(0)).toISOString()) {
	let t = e;
	return { read(e, n) {
		return `facts` in e && (t = e.at), eventsOfLine(e, n, t);
	} };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/cascade.js
const TREE_FAMILY$1 = {
	call: `call`,
	content: `part`,
	context: `change`,
	delivery: `delivery`,
	interaction: `interaction`,
	model: `run`,
	response: `response`,
	task: `task`,
	turn: `turn`
};
const ENDS_WITH = {
	call: {
		cut: `interrupted`,
		superseded: `abandoned`
	},
	change: {
		cut: `interrupted`,
		superseded: `interrupted`
	},
	delivery: {
		cut: `handled`,
		superseded: `handled`
	},
	interaction: {
		cut: `interrupted`,
		superseded: `abandoned`
	},
	response: {
		cut: `withdrawn`,
		superseded: `abandoned`
	},
	run: {
		cut: `interrupted`,
		superseded: `abandoned`
	},
	task: {
		cut: `cancelled`,
		superseded: `cancelled`
	},
	turn: {
		cut: `cancelled`,
		superseded: `cancelled`
	}
};
function cascade(e, t) {
	if (!t.some((e) => isFactType(e.type))) return [...t];
	let n = copyView(e);
	let r = [];
	let apply = (e) => {
		foldReceivedEvent(n, {
			...e,
			meta: { endOfLine: !1 }
		}), r.push(stamped(n, e));
	};
	let i = new Set(t.flatMap((t) => {
		let n = endedBy(e, t, !1);
		return n === void 0 || n === `session` ? [] : [`${n.family}:${n.id}`];
	}));
	let cascaded = (e) => e.filter((e) => !i.has(`${e.family}:${e.id}`));
	for (let e of t) {
		let t = endedBy(n, e);
		if (t === void 0) {
			apply(e);
			continue;
		}
		let { outcome: r, reason: i } = e.data;
		let a = {
			reason: reasonFor(t, r, i),
			superseded: r === `abandoned`
		};
		let o = copyView(n);
		foldReceivedEvent(o, {
			...e,
			meta: { endOfLine: !1 }
		});
		let s = cascaded(openUnder(o, t));
		let after = (e) => e.family === `delivery` && t !== `session`;
		for (let e of s.filter((e) => !after(e))) apply(closing(n, e, a, t === `session`));
		apply(e);
		for (let e of s.filter(after)) apply(closing(n, e, a, !1));
	}
	return r;
}
function stamped(e, t) {
	if (!isFactType(t.type)) return t;
	let n = FACT_CATALOG[t.type];
	let r = t.data;
	let i = TREE_FAMILY$1[n.family];
	let a = r[n.idField];
	let o = i !== void 0 && typeof a == `string` && rowOf(e, i, a) !== void 0 ? {
		family: i,
		id: a
	} : refOf(r.owner);
	if (o === void 0) return t;
	let s = scopeOf(e, o);
	return Object.keys(s).length === 0 ? t : {
		...t,
		scope: s
	};
}
function closeUnder(e, t, n) {
	let r = copyView(e);
	return openUnder(r, t).map((e) => {
		let t = closing(r, e, {
			reason: n,
			superseded: !1
		}, !1);
		return foldReceivedEvent(r, {
			...t,
			meta: { endOfLine: !1 }
		}), t;
	});
}
function supersede(e, t, n) {
	let r = copyView(e);
	let i = [];
	for (let e of openUnder(r, `session`)) {
		if (!isOpen(r, e) || !t(e)) continue;
		let a = closing(r, e, {
			reason: n,
			superseded: !0
		}, !1);
		foldReceivedEvent(r, {
			...a,
			meta: { endOfLine: !1 }
		}), i.push(a);
	}
	return i;
}
function reasonFor(e, t, n) {
	if (e === `session`) return `session-ended`;
	switch (e.family) {
		case `turn`: return t === `completed` ? `turn-ended` : `turn-${t}`;
		case `run`: return t === `abandoned` ? `model-call-retried` : `steered`;
		case `task`: return n ?? `task-ended`;
		case `interaction`: return n ?? `interaction-${t ?? `ended`}`;
		case `change`: return `context-change-failed`;
		default: return `${e.family}-${t ?? `ended`}`;
	}
}
function endedBy(e, t, n = !0) {
	if (!isFactType(t.type) || !isTerminalType(t.type)) return;
	if (t.type === `session.ended`) return `session`;
	let r = FACT_CATALOG[t.type];
	let i = TREE_FAMILY$1[r.family];
	let a = t.data[r.idField];
	if (i === void 0 || typeof a != `string`) return;
	let o = {
		family: i,
		id: a
	};
	return !n || isOpen(e, o) ? o : void 0;
}
function closing(e, t, n, r) {
	let { reason: i, superseded: a } = n;
	let o = ENDS_WITH[t.family];
	let s = a ? o.superseded : o.cut;
	let c = scopeOf(e, t);
	switch (t.family) {
		case `interaction`: return {
			data: {
				interactionId: t.id,
				outcome: s,
				reason: i
			},
			scope: c,
			type: `interaction.settled`
		};
		case `response`: return {
			data: {
				outcome: s,
				reason: i,
				responseId: t.id
			},
			type: `response.settled`
		};
		case `call`: return {
			data: {
				callId: t.id,
				outcome: s,
				reason: i
			},
			scope: c,
			type: `call.settled`
		};
		case `run`: return {
			data: {
				outcome: s,
				runId: t.id
			},
			scope: c,
			type: `model.settled`
		};
		case `task`: return {
			data: {
				outcome: s,
				reason: i,
				taskId: t.id
			},
			scope: c,
			type: `task.ended`
		};
		case `change`: return {
			data: {
				changeId: t.id,
				kind: rowOf(e, `change`, t.id).kind,
				outcome: s
			},
			scope: c,
			type: `context.settled`
		};
		case `delivery`: {
			let n = rowOf(e, `delivery`, t.id)?.turnId;
			return r || n === void 0 ? {
				data: {
					deliveryId: t.id,
					outcome: `failed`,
					reason: i
				},
				type: `delivery.settled`
			} : {
				data: {
					deliveryId: t.id,
					outcome: s,
					turnId: n
				},
				type: `delivery.settled`
			};
		}
		default: {
			let n = rowOf(e, `turn`, t.id)?.reply;
			return {
				data: {
					outcome: s,
					...n !== void 0 && n.length > 0 && { reply: n },
					turnId: t.id
				},
				scope: c,
				type: `turn.settled`
			};
		}
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/publication.js
function eventsOf(e) {
	return Array.isArray(e) ? e : [e];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/checker.js
const TREE_FAMILY = {
	call: `call`,
	content: `part`,
	context: `change`,
	delivery: `delivery`,
	interaction: `interaction`,
	model: `run`,
	response: `response`,
	task: `task`,
	turn: `turn`
};
const ID_FIELDS = {
	callId: `call`,
	changeId: `change`,
	deliveryId: `delivery`,
	interactionId: `interaction`,
	responseId: `response`,
	runId: `run`,
	taskId: `task`,
	turnId: `turn`
};
function referencesOf(e, t) {
	let n = [];
	for (let [r, i] of Object.entries(e)) {
		if (r === t) continue;
		let e = ID_FIELDS[r];
		if (e !== void 0 && typeof i == `string` && n.push({
			family: e,
			id: i
		}), r === `owner` || r === `subject` || r === `startedBy`) {
			let e = refOf(i);
			e !== void 0 && n.push(e);
		}
	}
	return n;
}
function createStreamChecker(e = {}) {
	let t = e.seed === void 0 ? emptySessionView() : copyView(e.seed);
	let n = /* @__PURE__ */ new Set();
	let r = /* @__PURE__ */ new Set();
	let i = t.position - 1;
	return { check(n, r) {
		let a = [];
		if (r <= i) return a;
		i = r;
		let report = (e, t, n = {}) => a.push({
			message: t,
			position: r,
			rule: e,
			...n
		});
		if (`progress` in n) return checkProgress(n.progress, report), foldReceivedEvent(t, {
			meta: { position: {
				index: 0,
				line: r
			} },
			type: ``
		}), a;
		if (!Array.isArray(n.facts) || n.facts.length === 0) return report(`envelope`, `A commit holds at least one fact.`), a;
		let o = [];
		n.facts.forEach((i, a) => {
			let s = i;
			let c = {
				index: a,
				type: s?.type
			};
			let fail = (e, t) => report(e, t, c);
			if (typeof s != `object` || !s || typeof s.type != `string`) fail(`envelope`, `A fact has no type.`);
			else {
				if (s.type.split(`.`).length !== 2 && fail(`envelope`, `"${s.type}" isn't family.verb.`), isFactType(s.type)) {
					let n = e.validate?.(s, `fact`);
					if (n !== void 0) {
						fail(`schema`, n);
						return;
					}
					if (t.session.status === `ended`) {
						fail(`after-session-end`, `${s.type} follows session.ended.`);
						return;
					}
					let r = checkFact(s, fail);
					r !== void 0 && o.push({
						index: a,
						ref: r
					});
				}
				foldReceivedEvent(t, {
					...s,
					meta: {
						at: n.at,
						endOfLine: a === n.facts.length - 1,
						position: {
							index: a,
							line: r
						}
					}
				});
			}
		}), checkWaitPromises(n.facts, report);
		for (let { index: e, ref: n } of o) {
			let r = n === `session` ? `the session` : `${n.family} "${n.id}"`;
			for (let i of openUnder(t, n)) report(`closure`, `${i.family} "${i.id}" is still open when ${r} ends.`, { index: e });
		}
		return a;
	} };
	function checkFact(e, n) {
		let r = FACT_CATALOG[e.type];
		let i = e.data;
		if (isTerminalType(e.type) && !isKnownOutcome(e.type, i.outcome) && n(`closed-outcome`, `${e.type} has outcome "${String(i.outcome)}", outside its closed set.`), e.type === `session.started`) {
			t.session.status !== `new` && n(`introduced-twice`, `session.started appears twice.`);
			return;
		}
		if (t.session.status === `new` && n(`introduce-before-reference`, `${e.type} precedes session.started.`), e.type === `session.ended`) return `session`;
		for (let a of referencesOf(i, r.idField)) rowOf(t, a.family, a.id) === void 0 && n(`introduce-before-reference`, `${e.type} names ${a.family} "${a.id}" before it was introduced.`);
		if (e.type === `turn.started`) {
			let e = activeTurn(t);
			e !== void 0 && n(`one-open-turn`, `turn ${String(i.turnId)} started while turn ${e.turnId} is open.`);
		}
		if (e.type === `turn.paused`) for (let { interactionId: r } of e.data.awaiting) {
			let i = t.interactions[r];
			let a = i !== void 0 && (interactionOwner(t, i).turnId === e.data.turnId || subjectTurn(t, i) === e.data.turnId);
			i?.status === `open` && a || n(`paused-on-person`, `turn.paused awaits "${r}", not open under its turn.`);
		}
		e.type === `call.started` && checkCleared(e.data, n), e.type === `call.started` && e.data.taskId !== void 0 && t.tasks[e.data.taskId]?.status === `ended` && n(`serves-running-task`, `call.started names task "${e.data.taskId}" after it ended.`);
		let a = TREE_FAMILY[r.family];
		let o = i[r.idField];
		if (a === void 0 || typeof o != `string`) return;
		let s = {
			family: a,
			id: o
		};
		let c = rowOf(t, a, o);
		switch (r.role) {
			case `introduces`:
				c !== void 0 && n(`introduced-twice`, `${e.type} introduces ${a} "${o}" again.`);
				return;
			case `complete`: {
				c !== void 0 && n(`one-terminal`, `${a} "${o}" completes twice.`);
				let r = i.runId === void 0 ? refOf(e.scope?.turnId === void 0 ? void 0 : { turnId: e.scope.turnId }) : refOf({ runId: String(i.runId) });
				if (r === void 0) {
					n(`schema`, `${a} "${o}" names no run, and its scope names no turn.`);
					return;
				}
				rowOf(t, r.family, r.id) === void 0 ? i.runId === void 0 && n(`introduce-before-reference`, `${a} "${o}" names turn "${r.id}" before it was introduced.`) : isOpen(t, r) || n(`closure`, `${a} "${o}" completes after its ${r.family} settled.`);
				return;
			}
			case `updates`:
				c === void 0 ? n(`introduce-before-reference`, `${e.type} names ${a} "${o}" before it was introduced.`) : isOpen(t, s) ? checkAttempt(e, n) : n(`one-terminal`, `${e.type} updates ${a} "${o}" after it ended.`);
				return;
			case `terminal`:
				if (c === void 0) {
					n(`introduce-before-reference`, `${e.type} ends ${a} "${o}" before it was introduced.`);
					return;
				}
				if (!isOpen(t, s)) {
					n(`one-terminal`, `${e.type} ends ${a} "${o}" a second time.`);
					return;
				}
				return s;
			default: return;
		}
	}
	function checkWaitPromises(e, n) {
		e.forEach((e, r) => {
			let i = e?.type === `turn.paused` || e?.type === `delivery.settled` && e.data.outcome === `awaiting-input` ? e.data.turnId : void 0;
			if (i !== void 0 && waiting(t, i)?.on !== `interaction` && n(`paused-on-person`, `${e.type} announces a wait turn ${i} doesn't have.`, { index: r }), e?.type !== `interaction.settled` || e.data.outcome !== `accepted` && e.data.outcome !== `declined`) return;
			let own = (e) => e?.request.kind === `approval` && e.origin === void 0;
			let a = t.interactions[e.data.interactionId];
			own(a) && Object.values(t.interactions).filter((e) => own(e) && e.introducedAt === a.introducedAt && e.status === `open`).length > 0 && n(`batch-settles-together`, `"${a.interactionId}" settled apart from its batch.`, { index: r });
		});
	}
	function checkCleared(e, n) {
		let { callId: r, clearedBy: i } = e;
		let a = Object.values(t.interactions).filter((e) => e.request.kind === `approval` && e.origin === void 0 && `callId` in e.subject && e.subject.callId === r).sort((e, t) => e.introducedAt - t.introducedAt);
		let o = i !== void 0 && `interactionId` in i ? i.interactionId : void 0;
		let s = a.at(-1);
		s === void 0 ? o !== void 0 && n(`cleared-before-start`, `call "${r}" names "${o}", not an approval of it.`) : a.some((e) => e.status === `open`) ? n(`cleared-before-start`, `call "${r}" starts while its approval is open.`) : s.outcome === `accepted` ? o !== s.interactionId && n(`cleared-before-start`, `call "${r}" starts cleared by ${JSON.stringify(i ?? null)}, not by its approval "${s.interactionId}".`) : n(`cleared-before-start`, `call "${r}" starts after its approval settled "${String(s.outcome)}".`);
	}
	function checkAttempt(e, n) {
		if (e.type !== `model.started` && e.type !== `model.retried`) return;
		let { attempt: r, runId: i } = e.data;
		let a = t.runs[i]?.attempt;
		e.type === `model.started` && a !== void 0 && r <= a && n(`attempts`, `run "${i}" starts attempt ${r} after attempt ${a}.`), e.type === `model.retried` && r !== a && n(`attempts`, `run "${i}" retries attempt ${r}, but its current is ${a}.`);
	}
	function checkProgress(i, a) {
		let o = i;
		if (typeof o != `object` || !o || !isProgressType(o.type)) return;
		let s = { type: o.type };
		let c = e.validate?.(o, `progress`);
		if (c !== void 0) a(`schema`, c, s);
		else if (t.session.status === `ended`) a(`after-session-end`, `${o.type} follows session.ended.`, s);
		else switch (o.type) {
			case `content.delta`: {
				let { partId: e, kind: r } = o.data;
				if (t.parts[e] !== void 0) a(`progress`, `content.delta for part "${e}" after it completed.`, s);
				else if (!n.has(e)) {
					r === void 0 && a(`progress`, `content.delta for unannounced part "${e}" has no kind.`, s);
					let i = o.scope?.runId;
					i !== void 0 && isOpen(t, {
						family: `run`,
						id: i
					}) || a(`progress`, `content.delta announces part "${e}" outside an open run.`, s), n.add(e);
				}
				return;
			}
			case `call.input`: {
				let { callId: e, name: n } = o.data;
				let i = t.calls[e];
				i !== void 0 && i.status === `settled` ? a(`progress`, `call.input for call "${e}" after it settled.`, s) : i === void 0 && !r.has(e) && (n === void 0 && a(`progress`, `call.input for unannounced call "${e}" has no name.`, s), r.add(e));
				return;
			}
			case `call.progress`:
				isOpen(t, {
					family: `call`,
					id: o.data.callId
				}) || a(`progress`, `call.progress for call "${o.data.callId}" that isn't running.`, s);
				return;
		}
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/current.js
const LIVE_PROJECTIONS_GLOBAL_KEY = Symbol.for(`eve.live-session-projections`);
const liveProjections = globalThis[LIVE_PROJECTIONS_GLOBAL_KEY] ??= /* @__PURE__ */ new WeakMap();
function enterSessionProjection(e, t) {
	liveProjections.set(e, { projection: storedProjection(t) });
}
function enterSessionProjectionAt(e, t) {
	liveProjections.set(e, { projection: t ?? storedProjection(void 0) });
}
function ensureSessionProjection(e, t) {
	liveProjections.has(e) || enterSessionProjection(e, t);
}
function liveProjection(e = contextStorage.getStore()) {
	return e === void 0 ? void 0 : liveProjections.get(e)?.projection;
}
function currentProjection(e = contextStorage.getStore()) {
	let t = e === void 0 ? void 0 : liveProjections.get(e);
	if (t === void 0) throw Error(`Session lifecycle requires an initialized projection.`);
	return t.projection;
}
function projectionFor(e, t) {
	return liveProjections.get(e)?.projection ?? storedProjection(t);
}
function nextLinePosition(e) {
	return currentProjection(e).view.position;
}
function recordPublishedLine(e, t, n, r) {
	let i = liveProjections.get(e);
	if (i === void 0) throw Error(`Session publication requires an initialized projection.`);
	i.projection = advance(i.projection, t, n, r);
}
function checkFoldedLine(e, t, n) {
	if (!checksSessionEvents() || !(`facts` in t)) return;
	let r = `facts` in t && t.facts[0]?.type === `session.started`;
	let a = createStreamChecker({ seed: e.session.status === `new` && !r ? {
		...e,
		session: {
			...e.session,
			status: `open`
		}
	} : e }).check(t, n);
	if (a.length !== 0) throw Error(`Session event contract: ${a.map((e) => `${e.rule} at ${e.position}:${e.index ?? `progress`}: ${e.message}`).join(`; `)}`);
}
function advanceView(e, t, n) {
	if (!(`facts` in t)) return {
		...e,
		position: Math.max(e.position, n + 1)
	};
	let r = copyView(e);
	return foldLine(r, t, n, { retention: `operational` }), r;
}
function enteredView(e) {
	return liveProjections.get(e)?.projection.view;
}
function advance(e, t, n, r) {
	return n < e.view.position ? e : foldSession({
		...e,
		view: advanceView(e.view, t, n)
	}, r);
}
function currentView(e = contextStorage.getStore()) {
	return currentProjection(e).view;
}
const appliedSessions = /* @__PURE__ */ new WeakMap();
function recordAppliedSession(e, t) {
	appliedSessions.set(e, t);
}
function appliedSession(e) {
	return appliedSessions.get(e);
}
function saveSessionProjection(e, t) {
	return saveProjection(e, currentProjection(t));
}
function saveProjection(e, t) {
	return {
		...e,
		state: {
			...e.state,
			["eve.harness.sessionProjection"]: t
		}
	};
}
function stepProjection(e, t) {
	return ensureSessionProjection(e, t), {
		read: () => currentProjection(e),
		record: (t) => foldPublication(e, t)
	};
}
function foldPublication(e, t) {
	let n = cascade(currentProjection(e).view, eventsOf(t));
	for (let t of linesOf(n, (/* @__PURE__ */ new Date()).toISOString())) {
		let n = `facts` in t ? t.facts : [t.progress];
		checkFoldedLine(currentView(e), t, nextLinePosition(e)), recordPublishedLine(e, t, nextLinePosition(e), n);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-projection/session-view.js
const KEY = Symbol.for(`eve.session-view-registry.v1`);
const snapshots = globalThis[KEY] ??= /* @__PURE__ */ new WeakMap();
const immutableRows = /* @__PURE__ */ new WeakMap();
function immutable(e) {
	if (typeof e != `object` || !e) return e;
	let t = immutableRows.get(e);
	if (t !== void 0) return t;
	let n = structuredClone(e);
	let r = [n];
	let i = /* @__PURE__ */ new Set();
	for (; r.length > 0;) {
		let e = r.pop();
		if (!i.has(e)) {
			i.add(e);
			for (let t of Object.values(e)) typeof t == `object` && t && r.push(t);
			Object.freeze(e);
		}
	}
	return immutableRows.set(e, n), immutableRows.set(n, n), n;
}
function table(e) {
	return Object.freeze(Object.fromEntries(Object.entries(e).map(([e, t]) => [e, immutable(t)])));
}
function snapshotOf(e, t = emptyPreviews(), n = []) {
	let r = Object.freeze({});
	return snapshots.set(r, {
		tables: Object.freeze({
			position: e.position,
			session: immutable(e.session),
			calls: table(e.calls),
			changes: table(e.changes),
			children: table(e.children),
			deliveries: table(e.deliveries),
			interactions: table(e.interactions),
			parts: table(e.parts),
			responses: table(e.responses),
			runs: table(e.runs),
			tasks: table(e.tasks),
			turns: table(e.turns),
			usage: immutable(e.usage),
			selection: immutable(e.selection)
		}),
		previews: Object.freeze({
			calls: table(t.calls),
			parts: table(t.parts)
		}),
		pending: immutable(n)
	}), r;
}
function snapshotState(e) {
	let t = snapshots.get(e);
	if (t === void 0) throw TypeError(`Invalid SessionView. Use emptySessionView() or a snapshot supplied by eve.`);
	return t;
}
function sessionTables(e) {
	return snapshotState(e).tables;
}
export { advance, appliedSession, buildCallbackContext, cascade, closeUnder, createEventReader, createStreamChecker, currentProjection, currentView, enterSessionProjection, enterSessionProjectionAt, enteredView, eventsOf, eventsOfLine, linesOf, liveProjection, nextLinePosition, projectionFor, recordAppliedSession, recordPublishedLine, sandboxOf, saveProjection, saveSessionProjection, sessionTables, snapshotOf, stepProjection, supersede, withRuntimeSandboxLifecycle };

//# sourceMappingURL=eve36.mjs.map