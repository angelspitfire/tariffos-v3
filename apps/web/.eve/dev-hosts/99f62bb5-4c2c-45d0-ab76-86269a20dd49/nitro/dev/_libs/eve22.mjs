import { isObject } from "./eve14.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/errors.js
function toErrorMessage(e) {
	return e instanceof Error ? e.message : typeof e == `string` ? e : e == null ? String(e) : isObject(e) ? typeof e.message == `string` && e.message.length > 0 ? e.message : safeJsonStringify(e) : String(e);
}
function toError(e) {
	if (e instanceof Error) return e;
	let t = Error(toErrorMessage(e));
	return isObject(e) && (typeof e.name == `string` && e.name.length > 0 && (t.name = e.name), typeof e.stack == `string` && e.stack.length > 0 && (t.stack = e.stack), `cause` in e && e.cause !== void 0 && e.cause !== e && (t.cause = e.cause)), t;
}
function* walkCauseChain(e) {
	let t = /* @__PURE__ */ new Set();
	let n = e;
	for (; isObject(n) && !t.has(n);) t.add(n), yield n, n = n.cause;
}
function safeJsonStringify(e) {
	try {
		return JSON.stringify(e) ?? String(e);
	} catch {
		return String(e);
	}
}
export { toError, toErrorMessage, walkCauseChain };

//# sourceMappingURL=eve22.mjs.map