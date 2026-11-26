import "./eve3.mjs";
import { createRequire } from "node:module";
import { basename, dirname, isAbsolute, join } from "node:path";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/stamped-package-version.js
const STAMPED_PACKAGE_VERSION = `1.4.0`;
function readStampedPackageVersion() {
	return STAMPED_PACKAGE_VERSION.startsWith(`__`) ? void 0 : STAMPED_PACKAGE_VERSION;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/package.js
let cachedPackageInfo;
let cachedPackageLocation;
const WORKFLOW_SOURCE_MODULE_ALIASES = {
	"eve/workflow": `src/internal/workflow/index.ts`,
	workflow: `src/internal/workflow/index.ts`,
	"eve/workflow/api": `src/public/workflow/api.ts`,
	"workflow/api": `src/internal/workflow/runtime.ts`,
	"workflow/runtime": `src/internal/workflow/runtime.ts`,
	"workflow/internal/builtins": `src/internal/workflow/builtins.ts`
};
const WORKFLOW_MODULE_ALIASES = {
	"workflow/errors": `src/compiled/@workflow/errors/index.js`,
	"workflow/internal/private": `src/compiled/@workflow/core/private.js`
};
[...Object.keys(WORKFLOW_SOURCE_MODULE_ALIASES), ...Object.keys(WORKFLOW_MODULE_ALIASES)];
function resolveCurrentModulePath() {
	return typeof import.meta.filename == `string` && isAbsolute(import.meta.filename) ? import.meta.filename : resolveCurrentModulePathFromStack();
}
function resolveCurrentModulePathFromStack() {
	let e = Error.prepareStackTrace;
	try {
		Error.prepareStackTrace = (e, t) => t;
		let e = Error().stack?.[0]?.getFileName();
		if (typeof e != `string` || e.length === 0) throw Error(`Failed to resolve the current module path from the stack trace.`);
		return e.startsWith(`file:`) ? fileURLToPath(e) : e;
	} finally {
		Error.prepareStackTrace = e;
	}
}
const packageRequire = createRequire(resolveCurrentModulePath());
function tryResolveVerifiedPackageRoot(e) {
	try {
		let t = realpathSync.native(e);
		return tryReadInstalledPackageInfo(t, "eve") === void 0 ? void 0 : dirname(t);
	} catch {
		return;
	}
}
function findNearestVerifiedPackageRoot(e) {
	let t = e;
	for (;;) {
		let e = tryResolveVerifiedPackageRoot(join(t, `package.json`));
		if (e !== void 0) return e;
		let n = dirname(t);
		if (n === t) return;
		t = n;
	}
}
function tryResolveDirectBuildLocation(e) {
	let t = dirname(e);
	for (;;) {
		if (basename(t) === `dist`) {
			let e = tryResolveVerifiedPackageRoot(join(dirname(t), `package.json`));
			if (e !== void 0) return {
				packageBuildRoot: t,
				packageRoot: e
			};
		}
		let e = dirname(t);
		if (e === t) return;
		t = e;
	}
}
function isSourceCheckout(e) {
	return existsSync(join(e, `src`, `internal`, `application`, `package.ts`));
}
function findNearestSourceCheckoutRoot(e) {
	let t = e;
	for (;;) {
		if (isSourceCheckout(t)) return t;
		let e = dirname(t);
		if (e === t) return;
		t = e;
	}
}
function tryCreatePackageLocation(e) {
	if (isSourceCheckout(e)) return {
		packageBuildRoot: null,
		packageRoot: e
	};
	let t = join(e, `dist`);
	if (existsSync(t)) return {
		packageBuildRoot: t,
		packageRoot: e
	};
}
function resolveSelfPackageJsonPath(e) {
	return createRequire(e).resolve(`eve/package.json`);
}
function resolvePackageLocationFromModulePath(e, t = resolveSelfPackageJsonPath) {
	let n = realpathSync.native(e);
	let r = tryResolveDirectBuildLocation(n);
	if (r !== void 0) return r;
	let i = findNearestVerifiedPackageRoot(dirname(n));
	if (i !== void 0 && isSourceCheckout(i)) return {
		packageBuildRoot: null,
		packageRoot: i
	};
	try {
		let e = tryResolveVerifiedPackageRoot(t(n));
		let r = e === void 0 ? void 0 : tryCreatePackageLocation(e);
		if (r !== void 0) return r;
	} catch {}
	let a = i === void 0 ? void 0 : tryCreatePackageLocation(i);
	if (a !== void 0) return a;
	throw Error(`Failed to resolve the eve package root from "${e}".`);
}
function resolvePackageLocation() {
	return cachedPackageLocation ??= resolvePackageLocationFromModulePath(resolveCurrentModulePath()), cachedPackageLocation;
}
function resolvePackageBuildRoot() {
	return resolvePackageLocation().packageBuildRoot;
}
function resolvePackageRoot() {
	return resolvePackageLocation().packageRoot;
}
function tryResolvePackageRoot() {
	try {
		return resolvePackageRoot();
	} catch {
		return;
	}
}
function tryResolveLocalPackageRoot(e) {
	try {
		let t = realpathSync.native(e);
		let n = tryResolveDirectBuildLocation(t);
		if (n !== void 0) return n.packageRoot;
		let r = findNearestSourceCheckoutRoot(dirname(t));
		return r === void 0 ? void 0 : tryResolveVerifiedPackageRoot(join(r, `package.json`));
	} catch {
		return;
	}
}
function rewriteSourceFilePathForBuild(e) {
	return e.replace(/\.[cm]?tsx?$/, `.js`);
}
function resolvePackageSourceFilePath(e) {
	let t = resolvePackageBuildRoot();
	return t === null ? join(resolvePackageRoot(), e) : join(t, rewriteSourceFilePathForBuild(e));
}
function resolvePackageDependencyPath(e) {
	try {
		return packageRequire.resolve(e);
	} catch (t) {
		let n = tryResolvePackageRoot();
		let r = n === void 0 || !isSourceCheckout(n) ? void 0 : resolveSourceCheckoutExport(n, e);
		if (r !== void 0) return r;
		throw t;
	}
}
function resolveSourceCheckoutExport(e, t) {
	if (t !== "eve" && !t.startsWith(`eve/`)) return;
	let n = t === "eve" ? `.` : `.${t.slice(3)}`;
	try {
		let t = JSON.parse(readFileSync(join(e, `package.json`), `utf8`)).exports?.[n];
		let r = typeof t == `string` ? t : t?.[`eve-source`] ?? t?.import ?? t?.default;
		if (r === void 0) return;
		let i = r.replace(/^\.\/dist\/src\//, `src/`).replace(/\.[cm]?js$/u, `.ts`);
		let a = join(e, i);
		return existsSync(a) ? a : void 0;
	} catch {
		return;
	}
}
function resolvePackageCompiledFilePath(e) {
	let t = resolvePackageBuildRoot();
	return t === null ? join(resolvePackageRoot(), `.generated`, `compiled`, e.replace(/^src\/compiled\//, ``)) : join(t, e);
}
function normalizeInstalledPackageInfo(e) {
	let t = e;
	if (typeof t.name == `string` && typeof t.version == `string`) return {
		name: t.name,
		version: t.version
	};
}
function tryReadInstalledPackageInfo(e, t) {
	let n = normalizeInstalledPackageInfo(JSON.parse(readFileSync(e, `utf8`)));
	if (n?.name === t) return n;
}
function tryResolveSelfPackageInfo() {
	try {
		return tryReadInstalledPackageInfo(packageRequire.resolve(`eve/package.json`), "eve");
	} catch {
		return;
	}
}
function resolveInstalledPackageInfo() {
	if (cachedPackageInfo) return cachedPackageInfo;
	let e = tryResolveLocalPackageRoot(resolveCurrentModulePath());
	let t = e === void 0 ? void 0 : tryReadInstalledPackageInfo(join(e, `package.json`), "eve");
	if (t) return cachedPackageInfo = t, cachedPackageInfo;
	let n = readStampedPackageVersion();
	return n === void 0 ? (cachedPackageInfo = tryResolveSelfPackageInfo() ?? {
		name: "eve",
		version: `0.0.0`
	}, cachedPackageInfo) : (cachedPackageInfo = {
		name: "eve",
		version: n
	}, cachedPackageInfo);
}
function readWorkflowVersionFromManifest(e) {
	let t = e;
	for (let e of [
		t.devDependencies,
		t.dependencies,
		t.peerDependencies
	]) {
		let t = e?.[`@workflow/core`];
		if (typeof t == `string` && t.trim().length > 0) return t;
	}
}
function resolveExpectedWorkflowVersion() {
	let e = tryResolvePackageRoot();
	if (e !== void 0) try {
		return readWorkflowVersionFromManifest(JSON.parse(readFileSync(join(e, `package.json`), `utf8`)));
	} catch {}
	try {
		return readWorkflowVersionFromManifest(JSON.parse(readFileSync(packageRequire.resolve(`eve/package.json`), `utf8`)));
	} catch {
		return;
	}
}
function resolveWorkflowModulePath(e) {
	let t = WORKFLOW_SOURCE_MODULE_ALIASES[e];
	if (t !== void 0) return resolvePackageSourceFilePath(t);
	let n = WORKFLOW_MODULE_ALIASES[e];
	return n === void 0 ? packageRequire.resolve(e) : resolvePackageCompiledFilePath(n);
}
const STABLE_WORKFLOW_NAMES = /* @__PURE__ */ new Set([
	"workflowEntry",
	"turnWorkflow",
	"sessionTimeoutWorkflow",
	"workflowToolRunWorkflow",
	"connectionEventWorkflow",
	"connectionEventDeliveryWorkflow"
]);
export { STABLE_WORKFLOW_NAMES, resolveExpectedWorkflowVersion, resolveInstalledPackageInfo, resolvePackageDependencyPath, resolvePackageRoot, resolvePackageSourceFilePath, resolveWorkflowModulePath };

//# sourceMappingURL=eve4.mjs.map