import { isBlockedDestinationHost } from "./eve29.mjs";
import { lookup } from "node:dns";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/public-destination.js
var UnsafeDestinationError = class extends Error {
	constructor(e = `URL must not target localhost, private, link-local, or reserved IP addresses.`) {
		super(e), this.name = `UnsafeDestinationError`;
	}
};
function assertPublicHostname(e, t) {
	if (isBlockedDestinationHost(e, t)) throw new UnsafeDestinationError();
}
async function createPublicDispatcher(e) {
	let { Agent: t, Dispatcher1Wrapper: n } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/undici@8.12.4/node_modules/undici/index.js");
	return new n(new t({ connect: { lookup: createPublicLookup(e) } }));
}
function findUnsafeDestinationError(e) {
	return e instanceof UnsafeDestinationError ? e : e instanceof Error && e.cause instanceof UnsafeDestinationError ? e.cause : void 0;
}
function fetchWithDispatcher(e, t) {
	return fetch(e, t);
}
function createPublicLookup(e) {
	return (t, n, r) => {
		lookup(t, {
			all: !0,
			verbatim: !0
		}, (i, a) => {
			if (i !== null) {
				r(i, ``, 0);
				return;
			}
			if (a.some(({ address: t }) => isBlockedDestinationHost(t, e))) {
				r(new UnsafeDestinationError(), ``, 0);
				return;
			}
			let o = n.family === void 0 || n.family === 0 ? a : a.filter(({ family: e }) => e === n.family);
			if (o.length === 0) {
				let e = Error(`Unable to resolve URL hostname "${t}" in the requested IP family.`);
				Object.assign(e, { code: `ENOTFOUND` }), r(e, ``, 0);
				return;
			}
			if (n.all === !0) {
				r(null, o);
				return;
			}
			let s = o[0];
			r(null, s.address, s.family);
		});
	};
}
async function readBoundedResponse(e, t) {
	let n = parseContentLength(e.headers.get(`content-length`));
	if (n !== void 0 && n > t) throw await cancelResponseBody(e), new ResponseTooLargeError(t);
	let r = await readBoundedBody(e, t);
	let i = r.byteLength === 0 ? null : Uint8Array.from(r).buffer;
	return new Response(i, {
		headers: e.headers,
		status: e.status,
		statusText: e.statusText
	});
}
function parseContentLength(e) {
	if (e === null) return;
	let t = Number.parseInt(e, 10);
	return Number.isFinite(t) && t >= 0 ? t : void 0;
}
async function readBoundedBody(e, t) {
	if (e.body === null) return /* @__PURE__ */ new Uint8Array();
	let n = e.body.getReader();
	let r = [];
	let i = 0;
	try {
		for (;;) {
			let { done: e, value: a } = await n.read();
			if (e) break;
			if (i += a.byteLength, i > t) throw await n.cancel(), new ResponseTooLargeError(t);
			r.push(a);
		}
	} finally {
		n.releaseLock();
	}
	let a = new Uint8Array(i);
	let o = 0;
	for (let e of r) a.set(e, o), o += e.byteLength;
	return a;
}
async function cancelResponseBody(e) {
	try {
		await e.body?.cancel();
	} catch {}
}
var ResponseTooLargeError = class extends Error {
	constructor(e) {
		super(`Response too large (exceeds ${e} bytes).`), this.name = `ResponseTooLargeError`;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/web-fetch/request.js
const REDIRECT_STATUSES = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
const WEB_FETCH_DESTINATION_POLICY = { allowLoopback: !1 };
async function requestPublicUrl(e, t) {
	let n = parseHttpsUrl(e);
	for (let e = 0;; e++) {
		let { dispatcher: r, response: i } = await requestOnce(n, t);
		try {
			let r = i.headers.get(`location`);
			if (r !== null && REDIRECT_STATUSES.has(i.status) && e < 10) {
				await cancelResponseBody(i), n = parseHttpsUrl(new URL(r, n).toString());
				continue;
			}
			return await readBoundedResponse(i, t.maxResponseSize);
		} finally {
			await r.close();
		}
	}
}
function parseHttpsUrl(e) {
	let t;
	try {
		t = new URL(e);
	} catch {
		throw Error(`URL must be a valid absolute https:// URL.`);
	}
	if (t.protocol !== `https:`) throw Error(`URL must start with https://`);
	return t;
}
async function requestOnce(e, t) {
	assertPublicHostname(e.hostname, WEB_FETCH_DESTINATION_POLICY);
	let n = await createPublicDispatcher(WEB_FETCH_DESTINATION_POLICY);
	try {
		return {
			dispatcher: n,
			response: await fetchWithDispatcher(e, {
				dispatcher: n,
				headers: t.headers,
				redirect: `manual`,
				signal: t.signal
			})
		};
	} catch (e) {
		throw await n.close(), e;
	}
}
export { UnsafeDestinationError, assertPublicHostname, createPublicDispatcher, fetchWithDispatcher, findUnsafeDestinationError, readBoundedResponse, requestPublicUrl };

//# sourceMappingURL=eve71.mjs.map