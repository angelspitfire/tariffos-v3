// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/guards.js
function isObject(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
function isNonEmptyString(e) {
	return typeof e == `string` && e.length > 0;
}
function readNonEmptyString(e) {
	return isNonEmptyString(e) ? e : void 0;
}
function isThenable(e) {
	return isObject(e) && typeof e.then == `function`;
}
function isErrnoCode(e, t) {
	return e instanceof Error && `code` in e && e.code === t;
}
function isPlainRecord(e) {
	if (!isObject(e)) return !1;
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}
export { isErrnoCode, isNonEmptyString, isObject, isPlainRecord, isThenable, readNonEmptyString };

//# sourceMappingURL=eve14.mjs.map