// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-definition/source-identity.js
const DEFINITION_KEY = Symbol.for(`eve.definition-source-key`);
const RESOLVED_REGISTRY_SYMBOL = Symbol.for(`eve.resolved-definition-sources`);
const FALLBACK_REGISTRY_SYMBOL = Symbol.for(`eve.fallback-definition-sources`);
const registryContainer = globalThis;
registryContainer[RESOLVED_REGISTRY_SYMBOL] ??= /* @__PURE__ */ new WeakMap(), registryContainer[FALLBACK_REGISTRY_SYMBOL] ??= /* @__PURE__ */ new Map();
const resolvedSources = registryContainer[RESOLVED_REGISTRY_SYMBOL];
const fallbackSources = registryContainer[FALLBACK_REGISTRY_SYMBOL];
function stampDefinitionKey(e, t) {
	Object.defineProperty(e, DEFINITION_KEY, {
		configurable: !0,
		value: t
	});
}
function connectionDefinitionKey(e, t) {
	return `connection:${JSON.stringify([e, t])}`;
}
function registerDefinitionSource(e, t, n) {
	let r = resolvedSources.get(e);
	r === void 0 || r.kind !== t.kind ? resolvedSources.set(e, {
		kind: t.kind,
		names: /* @__PURE__ */ new Set([t.name])
	}) : r.names.add(t.name), n !== void 0 && registerFallbackSource(n, e, t);
}
function registerFallbackSource(e, t, n) {
	let r = fallbackSources.get(e);
	r === void 0 ? fallbackSources.set(e, {
		definitions: new WeakSet([t]),
		firstEntry: n,
		kind: n.kind,
		names: /* @__PURE__ */ new Set([n.name])
	}) : r.kind !== `ambiguous` && (r.kind === n.kind && (r.definitions.has(t) || r.names.has(n.name)) ? (r.definitions.add(t), r.names.add(n.name)) : fallbackSources.set(e, {
		conflict: `${formatDefinitionSourceForWarning(r.firstEntry)} and ${formatDefinitionSourceForWarning(n)}`,
		kind: `ambiguous`,
		warned: !1
	}));
}
function formatDefinitionSourceForWarning(e) {
	return e.logicalPath === void 0 ? `${e.kind} "${e.name}"` : `${e.kind} "${e.name}" from "${e.logicalPath}"`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/dynamic/definition.js
const DYNAMIC_SENTINEL = Symbol.for(`eve.dynamic`);
function assertDynamicFunction(e, t) {
	if (typeof e != `function`) throw typeof e == `object` && e && `events` in e ? Error(`${t} takes a function of the session, not an events map: defineDynamic(async (ctx) => value). Key work that should run once per session, turn, or tenant with ctx.memo(key, fn).`) : Error(`${t} takes a function: defineDynamic(async (ctx) => value).`);
}
function isDynamicSentinel(e) {
	return typeof e == `object` && !!e && DYNAMIC_SENTINEL in e;
}
function dynamicEvaluate(e) {
	return e[DYNAMIC_SENTINEL];
}
function assertDynamicSentinelKeys(e, t) {
	assertDynamicFunction(dynamicEvaluate(e), `${t} defineDynamic()`);
	let n = Object.keys(e);
	if (n.length > 0) throw Error(`${t} defineDynamic() takes only a function; unknown key(s): ${n.join(`, `)}. Packaging configuration such as build.externalDependencies belongs on the root agent.ts.`);
}
export { assertDynamicSentinelKeys, connectionDefinitionKey, dynamicEvaluate, isDynamicSentinel, registerDefinitionSource, stampDefinitionKey };

//# sourceMappingURL=eve10.mjs.map