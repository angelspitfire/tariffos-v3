import { createLogger } from "./eve15.mjs";
import { hasInternalRefScheme } from "./eve16.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/data.js
const SCHEME_PREFIX = /^[a-z][a-z\d+.-]*:/i;
const REFERENCE = { kind: `reference` };
const UNREADABLE = { kind: `unreadable` };
function readFileData(e) {
	if (e instanceof Uint8Array) return {
		bytes: Buffer.isBuffer(e) ? e : Buffer.from(e),
		kind: `bytes`
	};
	if (e instanceof ArrayBuffer) return {
		bytes: Buffer.from(new Uint8Array(e)),
		kind: `bytes`
	};
	if (e instanceof URL) return e.protocol === `data:` ? decodeDataUrl(e.href) : {
		kind: `link`,
		url: e
	};
	if (typeof e == `string`) return readStringData(e);
	if (typeof e != `object` || !e) return UNREADABLE;
	let t = e;
	switch (t.type) {
		case `data`: return readFileData(t.data);
		case `url`: return t.url instanceof URL || typeof t.url == `string` ? readFileData(t.url) : UNREADABLE;
		case `text`: return typeof t.text == `string` ? {
			bytes: Buffer.from(t.text, `utf8`),
			kind: `bytes`
		} : UNREADABLE;
		case `reference`: return REFERENCE;
		default: return isProviderReference(e) ? REFERENCE : UNREADABLE;
	}
}
function isUnresolvedFileData(e) {
	if (e instanceof Uint8Array || e instanceof ArrayBuffer) return !1;
	if (typeof e == `string`) return SCHEME_PREFIX.test(e) && !e.startsWith(`data:`);
	if (e instanceof URL) return e.protocol !== `data:`;
	if (typeof e != `object` || !e) return !0;
	let t = e;
	switch (t.type) {
		case `data`: return isUnresolvedFileData(t.data);
		case `url`: return !0;
		case `text`: return typeof t.text != `string`;
		case `reference`: return !1;
		default: return !isProviderReference(e);
	}
}
function getKnownByteLength(e) {
	return e instanceof Uint8Array || e instanceof ArrayBuffer ? e.byteLength : e instanceof URL ? e.protocol === `data:` ? computeStringByteLength(e.href) : null : typeof e == `string` ? e.startsWith(`data:`) ? computeStringByteLength(e) : SCHEME_PREFIX.test(e) ? null : estimateBase64ByteLength(e) : null;
}
function readStringData(e) {
	if (e.startsWith(`data:`)) return decodeDataUrl(e);
	if (SCHEME_PREFIX.test(e)) {
		if (hasInternalRefScheme(e)) return UNREADABLE;
		let t = URL.parse(e);
		return t === null ? UNREADABLE : {
			kind: `link`,
			url: t
		};
	}
	return {
		bytes: Buffer.from(e, `base64`),
		kind: `bytes`
	};
}
function isProviderReference(e) {
	let t = Object.values(e);
	return t.length > 0 && t.every((e) => typeof e == `string`);
}
function decodeDataUrl(e) {
	let t = e.indexOf(`,`);
	if (t === -1) return UNREADABLE;
	let n = e.slice(5, t);
	let r = e.slice(t + 1);
	if (n.endsWith(`;base64`)) return {
		bytes: Buffer.from(r, `base64`),
		kind: `bytes`
	};
	try {
		return {
			bytes: Buffer.from(decodeURIComponent(r), `utf8`),
			kind: `bytes`
		};
	} catch {
		return UNREADABLE;
	}
}
function computeStringByteLength(e) {
	let t = e.indexOf(`,`);
	if (t === -1) return null;
	let n = e.slice(5, t);
	let r = e.slice(t + 1);
	if (n.endsWith(`;base64`)) return estimateBase64ByteLength(r);
	try {
		return Buffer.byteLength(decodeURIComponent(r), `utf8`);
	} catch {
		return Buffer.byteLength(r, `utf8`);
	}
}
function estimateBase64ByteLength(e) {
	let t = e.trimEnd();
	if (t.length === 0) return 0;
	let n = 0;
	return t.endsWith(`==`) ? n = 2 : t.endsWith(`=`) && (n = 1), Math.max(0, Math.floor(t.length * 3 / 4) - n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/channels/upload-policy.js
const DEFAULT_UPLOAD_POLICY = Object.freeze({
	allowedMediaTypes: `*`,
	maxBytes: 26214400
});
function mergeUploadPolicy(e, t = DEFAULT_UPLOAD_POLICY) {
	if (e === `disabled`) return `disabled`;
	if (e === void 0) return t;
	let n = e.maxBytes ?? t.maxBytes;
	let r = e.allowedMediaTypes ?? t.allowedMediaTypes;
	if (n < 0 || !Number.isFinite(n)) throw RangeError(`UploadPolicy.maxBytes must be a non-negative finite number. Received: ${String(n)}.`);
	return {
		allowedMediaTypes: r,
		maxBytes: n
	};
}
function isMediaTypeAllowed(e, t) {
	if (t === `disabled`) return !1;
	if (t.allowedMediaTypes === `*`) return !0;
	let n = e.toLowerCase();
	for (let e of t.allowedMediaTypes) {
		let t = e.toLowerCase();
		if (t === n) return !0;
		if (t.endsWith(`/*`)) {
			let e = t.slice(0, -1);
			if (n.startsWith(e)) return !0;
		}
	}
	return !1;
}
function evaluateFilePart(e, t) {
	if (t === `disabled` || !isMediaTypeAllowed(e.mediaType, t)) {
		let n = {
			allowedMediaTypes: t === `disabled` || t.allowedMediaTypes === `*` ? [] : [...t.allowedMediaTypes],
			kind: `disallowed-media-type`,
			mediaType: e.mediaType
		};
		return e.filename === void 0 ? n : {
			...n,
			filename: e.filename
		};
	}
	let n = getKnownByteLength(e.data);
	if (n !== null && n > t.maxBytes) {
		let r = {
			byteLength: n,
			kind: `too-large`,
			limit: t.maxBytes,
			mediaType: e.mediaType
		};
		return e.filename === void 0 ? r : {
			...r,
			filename: e.filename
		};
	}
	return null;
}
function collectUploadPolicyViolations(e, t) {
	if (typeof e == `string`) return [];
	let n = [];
	for (let r of e) {
		if (r.type !== `file`) continue;
		let e = evaluateFilePart(r, t);
		e !== null && n.push(e);
	}
	return n;
}
function formatUploadPolicyViolation(e) {
	let t = e.filename ?? e.mediaType;
	if (e.kind === `too-large`) return `${t} (${e.byteLength} bytes) exceeds the ${e.limit}-byte upload limit.`;
	let n = e.allowedMediaTypes.length > 0 ? ` Allowed: ${e.allowedMediaTypes.join(`, `)}.` : ``;
	return `${t} has media type "${e.mediaType}" which is not allowed by this route.${n}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/background-work.js
const log = createLogger(`channel.background-work`);
function createBackgroundWork(e = {}) {
	let t = [];
	let n = !1;
	return {
		waitUntilFor: (r) => (i) => {
			let a = {
				eventType: r,
				settled: !1
			};
			let o = Promise.resolve(i).then(() => {
				a.settled = !0;
			}, (t) => {
				a.settled = !0, log.error(`a channel event handler's waitUntil work failed`, {
					...e,
					eventType: r,
					error: t
				});
			});
			n ? log.warn(`a channel event handler called waitUntil after its step ended; eve won't wait for it`, {
				...e,
				eventType: r
			}) : t.push({
				work: a,
				done: o
			});
		},
		async settle(n = 3e4) {
			if (t.length === 0) return !1;
			let r;
			let i = new Promise((e) => {
				r = setTimeout(() => e(`expired`), n);
			});
			try {
				for (; t.length > 0;) {
					let r = t;
					if (t = [], await Promise.race([Promise.all(r.map(({ done: e }) => e)), i]) !== `expired`) continue;
					let a = [...r, ...t].filter(({ work: e }) => !e.settled);
					t = [], log.warn(`channel event handlers' waitUntil work didn't settle in time; the step goes on without it`, {
						...e,
						eventTypes: [...new Set(a.map(({ work: e }) => e.eventType))],
						timeoutMs: n
					});
					break;
				}
			} finally {
				clearTimeout(r);
			}
			return !0;
		},
		close() {
			n = !0;
		}
	};
}
export { DEFAULT_UPLOAD_POLICY, collectUploadPolicyViolations, createBackgroundWork, formatUploadPolicyViolation, getKnownByteLength, isMediaTypeAllowed, isUnresolvedFileData, mergeUploadPolicy, readFileData };

//# sourceMappingURL=eve53.mjs.map