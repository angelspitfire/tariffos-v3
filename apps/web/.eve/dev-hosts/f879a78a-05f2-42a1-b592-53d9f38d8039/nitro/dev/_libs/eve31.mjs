import { logicalSessionToken, sessionInboxHookToken } from "./eve12.mjs";
import { walkCauseChain } from "./eve22.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/run-errors.js
var HookNotFoundError = class extends Error {
	name = `HookNotFoundError`;
	token;
	constructor(e) {
		super(`Hook not found`), this.token = e;
	}
};
var NonRetryableError = class extends Error {
	name = `FatalError`;
	fatal = !0;
};
function hasName(e, t) {
	return typeof e == `object` && e && `message` in e && `name` in e ? e.name === t : !1;
}
function anyCause(e, t) {
	for (let n of walkCauseChain(e)) if (t.some((e) => hasName(n, e))) return !0;
	return !1;
}
function isHookNotFound(e) {
	return hasName(e, `HookNotFoundError`);
}
function isRunNotFound(e) {
	return anyCause(e, [`WorkflowRunNotFoundError`]);
}
function isRunExpired(e) {
	return anyCause(e, [`RunExpiredError`, `StreamExpiredError`]);
}
function isRunMissing(e) {
	return anyCause(e, [`WorkflowRunNotFoundError`, `RunExpiredError`]);
}
function isRunInactive(e) {
	return isRunMissing(e) || anyCause(e, [`EntityConflictError`]);
}
function isRunTargetGone(e) {
	return anyCause(e, [
		`HookNotFoundError`,
		`WorkflowRunNotFoundError`,
		`RunExpiredError`,
		`EntityConflictError`
	]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/hosts.js
const HOSTS = Symbol.for(`eve.hosts`);
function hosts() {
	let e = globalThis;
	return e[HOSTS] ??= {
		routes: /* @__PURE__ */ new Set(),
		streams: /* @__PURE__ */ new Map()
	};
}
function installDurableHost(e) {
	let t = hosts();
	if (t.durable === void 0) t.durable = e;
	else if (t.durable.name !== e.name) throw Error(`This realm's durable host is "${t.durable.name}"; "${e.name}" can't replace it.`);
}
function durableHostFor(e) {
	let { durable: t } = hosts();
	if (t === void 0) throw new HookNotFoundError(e);
	return t;
}
function installedDurableHost() {
	return hosts().durable;
}
function sessionSignInCallbacks(e) {
	for (let t of hosts().routes) {
		let n = t.signInCallbacks?.(e);
		if (n !== void 0) return n;
	}
	let { durable: t } = hosts();
	let n = t?.callbackBaseUrl();
	return t === void 0 || n === void 0 ? void 0 : {
		callbackBaseUrl: n,
		deliver: t.deliver
	};
}
function isRetriedStep() {
	return (stepAttempt() ?? 1) > 1;
}
function stepAttempt() {
	for (let e of hosts().routes) {
		let t = e.stepAttempt?.();
		if (t !== void 0) return t;
	}
	return hosts().durable?.stepAttempt();
}
async function deliverToHostedHook(e, t) {
	for (let n of hosts().routes) {
		let r = await n.deliver(e, t);
		if (r === `delivered`) return !0;
		if (r === `gone`) throw new HookNotFoundError(e);
	}
	return !1;
}
function signInDelivery(e) {
	return (t, n) => e({ signIn: t }, n);
}
async function resumeRoutedHook(e, t) {
	await deliverToHostedHook(e, t) || await durableHostFor(e).deliver({ hook: e }, t);
}
async function resumeRoutedSessionInbox(e, t) {
	let n = sessionInboxHookToken(logicalSessionToken(e));
	await deliverToHostedHook(n, t) || await durableHostFor(n).deliver({ session: e }, t);
}
function hostedRunEnded(e) {
	for (let t of hosts().routes) {
		let n = t.runEnded(e);
		if (n !== void 0) return n;
	}
}
function isRunning(e) {
	return e === `pending` || e === `running`;
}
async function routedRunEnded(e) {
	let t = hostedRunEnded(e);
	if (t !== void 0) return t;
	let n = hosts().durable;
	return n === void 0 || await durableRunEnded(n, e);
}
async function durableRunEnded(e, t) {
	try {
		return !isRunning(await e.runStatus(t));
	} catch (e) {
		if (isRunNotFound(e)) return !1;
		if (isRunTargetGone(e)) return !0;
		throw e;
	}
}
async function routedRunLive(e) {
	let t = hostedRunEnded(e);
	if (t !== void 0) return !t;
	try {
		return isRunning(await durableHostFor(e).runStatus(e));
	} catch (e) {
		return !isRunTargetGone(e);
	}
}
async function cancelRoutedRun(e, t) {
	for (let n of hosts().routes) {
		let r = n.cancelRun(e, t);
		if (r !== void 0) return r;
	}
	return await durableHostFor(e).cancelRun(e, t), !0;
}
function sessionLineStore(e) {
	let t = hosts().streams.get(e);
	if (t !== void 0) return t;
	let { durable: n } = hosts();
	if (n === void 0) throw Error(`No host in this realm holds session "${e}".`);
	return n.lineStore;
}
export { NonRetryableError, cancelRoutedRun, deliverToHostedHook, durableRunEnded, installDurableHost, installedDurableHost, isHookNotFound, isRetriedStep, isRunExpired, isRunInactive, isRunMissing, isRunTargetGone, resumeRoutedHook, resumeRoutedSessionInbox, routedRunEnded, routedRunLive, sessionLineStore, sessionSignInCallbacks, signInDelivery };

//# sourceMappingURL=eve31.mjs.map