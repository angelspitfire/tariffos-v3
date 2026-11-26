// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/json.js
const INVALID_JSON_VALUE_CANDIDATE = Symbol(`invalid-json-value-candidate`);
function parseJsonValue(e) {
	let t = normalizeJsonValueCandidate(e);
	if (t === INVALID_JSON_VALUE_CANDIDATE) throw TypeError(`Expected a JSON-serializable value.`);
	return t;
}
function parseJsonObject(e) {
	let t = parseJsonValue(e);
	if (!isJsonObjectValue(t)) throw TypeError(`Expected a JSON-serializable object.`);
	return t;
}
function normalizeJsonValueCandidate(e, t = /* @__PURE__ */ new WeakSet()) {
	if (e === null || typeof e == `boolean` || typeof e == `string`) return e;
	if (typeof e == `number`) return Number.isFinite(e) ? e : INVALID_JSON_VALUE_CANDIDATE;
	if (Array.isArray(e)) {
		let n = [];
		for (let r of e) {
			let e = normalizeJsonValueCandidate(r, t);
			if (e === INVALID_JSON_VALUE_CANDIDATE) return INVALID_JSON_VALUE_CANDIDATE;
			n.push(e);
		}
		return n;
	}
	if (typeof e != `object` || e === void 0 || !isPlainObject(e) || t.has(e)) return INVALID_JSON_VALUE_CANDIDATE;
	t.add(e);
	let n = {};
	for (let [r, i] of Object.entries(e)) {
		if (i === void 0) continue;
		let e = normalizeJsonValueCandidate(i, t);
		if (e === INVALID_JSON_VALUE_CANDIDATE) return INVALID_JSON_VALUE_CANDIDATE;
		n[r] = e;
	}
	return t.delete(e), n;
}
function isJsonObjectValue(e) {
	return e !== null && !Array.isArray(e) && typeof e == `object`;
}
function isPlainObject(e) {
	let t = Object.getPrototypeOf(e);
	return t === null || Object.getPrototypeOf(t) === null;
}
export { parseJsonObject, parseJsonValue };

//# sourceMappingURL=eve8.mjs.map