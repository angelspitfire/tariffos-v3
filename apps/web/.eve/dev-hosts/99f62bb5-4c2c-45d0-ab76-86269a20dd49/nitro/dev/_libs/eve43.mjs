// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/behavior.js
const TOOL_BEHAVIOR = Symbol.for(`eve.tool-behavior`);
function attachToolBehavior(e, t) {
	return Object.defineProperty(e, TOOL_BEHAVIOR, {
		configurable: !1,
		enumerable: !1,
		value: t,
		writable: !1
	}), e;
}
export { attachToolBehavior };

//# sourceMappingURL=eve43.mjs.map