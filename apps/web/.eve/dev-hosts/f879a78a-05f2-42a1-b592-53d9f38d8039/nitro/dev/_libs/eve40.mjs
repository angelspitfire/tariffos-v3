// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/tool-label.js
function toolLabel(e, t) {
	if (typeof t != `string` && typeof t != `number`) return e;
	let n = String(t).trim();
	return n === `` ? e : `${e} ${n}`;
}
export { toolLabel };

//# sourceMappingURL=eve40.mjs.map