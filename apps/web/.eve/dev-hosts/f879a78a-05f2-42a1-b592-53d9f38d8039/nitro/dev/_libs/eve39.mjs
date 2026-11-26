import { createTraceState } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/traceparent.js
const TRACEPARENT_PATTERN = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/iu;
const EVE_DISPATCH_PARENT_PATTERN = /^([0-9a-f]{16})$/u;
function formatTraceparent(e) {
	if (!(e === void 0 || !validId(e.traceId, 32) || !validId(e.spanId, 16) || !Number.isInteger(e.traceFlags) || e.traceFlags < 0 || e.traceFlags > 255)) return `00-${e.traceId.toLowerCase()}-${e.spanId.toLowerCase()}-${e.traceFlags.toString(16).padStart(2, `0`)}`;
}
function parseTraceparent(e) {
	if (e === null) return;
	let t = TRACEPARENT_PATTERN.exec(e.trim());
	if (t === null) return;
	let n = t[1].toLowerCase();
	let r = t[2].toLowerCase();
	if (validId(n, 32) && validId(r, 16)) return {
		isRemote: !0,
		spanId: r,
		traceFlags: Number.parseInt(t[3], 16),
		traceId: n
	};
}
function readAgentDispatchTraceContext(e, t) {
	if (e === null || t === void 0) return;
	let n = createTraceState(e).get(`eve`);
	let r = (n === void 0 ? null : EVE_DISPATCH_PARENT_PATTERN.exec(n))?.[1];
	return r === void 0 || !validId(r, 16) ? void 0 : {
		...t,
		spanId: r
	};
}
function writeAgentDispatchTracestate(e, t) {
	let n = createTraceState(e);
	return t === void 0 || formatTraceparent(t) === void 0 ? boundedTracestate(n.unset(`eve`)) : boundedTracestate(n.set(`eve`, t.spanId.toLowerCase()));
}
function boundedTracestate(e) {
	let t = e;
	let n = t.serialize();
	let r = n.split(`,`).filter(Boolean);
	for (; r.length > 32 || n.length > 512;) {
		let e = r.at(-1);
		if (e === void 0) return;
		t = t.unset(e.slice(0, e.indexOf(`=`))), n = t.serialize(), r = n.split(`,`).filter(Boolean);
	}
	return n || void 0;
}
function validId(e, t) {
	return e.length === t && /^[0-9a-f]+$/iu.test(e) && !/^0+$/u.test(e);
}
export { formatTraceparent, parseTraceparent, readAgentDispatchTraceContext, writeAgentDispatchTracestate };

//# sourceMappingURL=eve39.mjs.map