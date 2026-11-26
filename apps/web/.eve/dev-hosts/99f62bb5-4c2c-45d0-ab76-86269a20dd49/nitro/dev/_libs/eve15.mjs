import { isNonEmptyString, isObject } from "./eve14.mjs";
import { inspect } from "node:util";
import { SpanStatusCode, trace } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
import { getErrorMessage } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/provider/index.js";
import { currentCapture } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/index.js";
import { truncateTelemetryText } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/otel.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/logging.js
const LEVEL_SEVERITY = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40
};
function createLogger(e) {
	return {
		debug(t, n) {
			write(`debug`, e, t, n);
		},
		info(t, n) {
			write(`info`, e, t, n);
		},
		warn(t, n) {
			write(`warn`, e, t, n);
		},
		error(t, n) {
			write(`error`, e, t, n), recordOnActiveSpan(t, n);
		}
	};
}
function logError(e, t, n, r) {
	let i = formatError(n);
	return e.error(t, {
		...r,
		error: i
	}), typeof i.errorId == `string` ? i.errorId : createErrorId();
}
function createErrorId() {
	return crypto.randomUUID();
}
function formatError(e, t) {
	let n = {
		errorId: t ?? createErrorId(),
		message: extractErrorMessage(e)
	};
	let r = extractErrorName(e);
	return r !== void 0 && (n.name = r), n.detail = inspectError(e), n;
}
function extractErrorName(e) {
	if (e instanceof Error) return e.name === `Error` ? void 0 : e.name;
	if (isObject(e) && isNonEmptyString(e.name) && e.name !== `Error`) return e.name;
}
function extractErrorMessage(e) {
	return isObject(e) && !(e instanceof Error) && typeof e.message == `string` ? e.message : getErrorMessage(e);
}
function recordErrorOnSpan(e, t) {
	if (currentCapture()?.recordOutputs === !1) {
		e.setStatus({ code: SpanStatusCode.ERROR });
		return;
	}
	let n = truncateTelemetryText(t instanceof Error ? t.message : getErrorMessage(t), 4096);
	let r = t instanceof Error ? truncateTelemetryText(t.name, 128) : `Error`;
	e.setStatus({
		code: SpanStatusCode.ERROR,
		message: n
	}), e.recordException({
		message: n,
		name: r,
		stack: inspectError(t)
	});
}
function resolveThreshold() {
	let e = process.env.EVE_LOG_LEVEL?.toLowerCase();
	return e === `debug` || e === `info` || e === `warn` || e === `error` ? LEVEL_SEVERITY[e] : LEVEL_SEVERITY.info;
}
function write(e, t, n, r) {
	if (LEVEL_SEVERITY[e] < resolveThreshold()) return;
	let a = e === `error` ? console.error : e === `warn` ? console.warn : console.log;
	let o = `[eve:${t}] ${n}`;
	r === void 0 ? a(o) : a(o, renderFields(r));
}
function renderFields(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) r !== void 0 && (t[n] = r instanceof Error ? formatError(r) : r);
	return t;
}
function recordOnActiveSpan(e, t) {
	let n = trace.getActiveSpan();
	if (n === void 0) return;
	let r = t?.error;
	if (currentCapture()?.recordOutputs === !1) (r instanceof Error || isFormattedError(r)) && n.setStatus({ code: SpanStatusCode.ERROR });
	else if (r instanceof Error) recordErrorOnSpan(n, r);
	else if (isFormattedError(r)) {
		let e = truncateTelemetryText(r.message, 4096);
		n.setStatus({
			code: SpanStatusCode.ERROR,
			message: e
		}), n.recordException({
			message: e,
			name: typeof r.name == `string` ? truncateTelemetryText(r.name, 128) : `Error`,
			stack: typeof r.detail == `string` ? truncateTelemetryText(r.detail, 8192) : void 0
		});
	} else n.addEvent(e, t ? renderFields(t) : void 0);
}
function isFormattedError(e) {
	return isObject(e) && typeof e.errorId == `string` && typeof e.message == `string`;
}
function inspectError(e) {
	return truncate(inspect(e, {
		breakLength: 1 / 0,
		compact: !1,
		depth: 10,
		maxStringLength: 8192
	}), 16384);
}
function truncate(e, t) {
	if (Buffer.byteLength(e, `utf8`) <= t) return e;
	let n = e.slice(0, t);
	for (; Buffer.byteLength(n, `utf8`) > t && n.length > 0;) n = n.slice(0, -1);
	return `${n}<…truncated>`;
}
export { createErrorId, createLogger, formatError, logError, recordErrorOnSpan };

//# sourceMappingURL=eve15.mjs.map