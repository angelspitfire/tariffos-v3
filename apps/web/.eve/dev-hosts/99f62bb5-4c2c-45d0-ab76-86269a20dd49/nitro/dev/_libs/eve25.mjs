import { ContextContainer, contextStorage } from "./eve13.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/sandbox-environment.js
const ENVIRONMENT = Symbol.for(`eve.sandbox-environment`);
const PROVIDER_RUNTIME = Symbol.for(`eve.sandbox-provider-runtime`);
const SELECTOR_ENVIRONMENT = Symbol.for(`eve.sandbox-selector-environment`);
const RUNTIMES = Symbol.for(`eve.sandbox-constructor-runtimes`);
const globals = globalThis;
const runtimes = globals[RUNTIMES] ??= /* @__PURE__ */ new WeakMap();
function createSandboxEnvironment(e) {
	let t = {
		[ENVIRONMENT]: !0,
		[PROVIDER_RUNTIME]: e,
		provider: e.providerName,
		async open(...n) {
			let r = n[0];
			let i = contextStorage.getStore();
			let a = i === void 0 ? void 0 : runtimes.get(i);
			if (a === void 0) throw Error("Sandbox environments can only open sandboxes inside defineSandbox(). Use `ctx.getSandbox()` to reach the session's sandbox from tools and other runtime code.");
			return await a.open({
				environment: t,
				options: r,
				provider: e
			});
		}
	};
	return t;
}
function getSandboxEnvironmentRuntime(e) {
	return e[PROVIDER_RUNTIME];
}
function getBoundSandboxEnvironment(e) {
	let t = typeof e == `function` ? Reflect.get(e, SELECTOR_ENVIRONMENT) : void 0;
	return isSandboxEnvironment(t) ? t : void 0;
}
function isSandboxEnvironment(e) {
	return typeof e == `object` && !!e && Reflect.get(e, ENVIRONMENT) === !0 && typeof Reflect.get(e, `provider`) == `string` && typeof Reflect.get(e, `open`) == `function`;
}
async function runWithSandboxConstructorRuntime(e, t) {
	let n = contextStorage.getStore();
	let r = n ?? new ContextContainer();
	let i = runtimes.get(r);
	runtimes.set(r, e);
	try {
		return n === void 0 ? await contextStorage.run(r, t) : await t();
	} finally {
		i === void 0 ? runtimes.delete(r) : runtimes.set(r, i);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/definitions/sandbox.js
const SELECTOR = Symbol.for(`eve.sandbox-selector`);
const PARENT = Symbol.for(`eve.sandbox-parent-definition`);
function defineSandbox(e) {
	return Object.defineProperty(e, SELECTOR, { value: !0 }), e;
}
function defineParentSandbox() {
	let e = defineSandbox(async () => {
		throw Error(`Parent sandbox selection is resolved by eve.`);
	});
	return Object.defineProperty(e, PARENT, { value: !0 }), e;
}
export { createSandboxEnvironment, defineParentSandbox, defineSandbox, getBoundSandboxEnvironment, getSandboxEnvironmentRuntime, isSandboxEnvironment, runWithSandboxConstructorRuntime };

//# sourceMappingURL=eve25.mjs.map