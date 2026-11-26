import "./eve3.mjs";
import { STABLE_WORKFLOW_NAMES, resolvePackageDependencyPath, resolvePackageRoot, resolvePackageSourceFilePath, resolveWorkflowModulePath } from "./eve4.mjs";
import { WORKFLOW_TOOL_ENTRY_POINTS } from "./eve5.mjs";
import "./eve6.mjs";
import { isDynamicSentinel } from "./eve10.mjs";
import { createRequire } from "node:module";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { dirname, extname, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, statSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readFile, stat } from "node:fs/promises";
import { hostname } from "node:os";
import { parse } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/jsonc-parser/index.js";
import { parseArgs } from "node:util";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/discover/filesystem.js
const SUPPORTED_AUTHORED_MODULE_FILE_EXTENSIONS = [
	`.cts`,
	`.mts`,
	`.cjs`,
	`.mjs`,
	`.ts`,
	`.js`
];
function normalizeLogicalPath(e) {
	return e.replaceAll(sep, `/`).replace(/^\.\//, ``).replace(/^\/+/, ``);
}
function getSupportedModuleBaseName(e) {
	if (isTypeScriptDeclarationFileName(e)) return null;
	for (let t of SUPPORTED_AUTHORED_MODULE_FILE_EXTENSIONS) if (e.endsWith(t) && e.length > t.length) return e.slice(0, -t.length);
	return null;
}
function isTypeScriptDeclarationFileName(e) {
	return /\.d\.(?:cts|mts|ts)$/.test(e);
}
function stripLogicalPathExtension(e) {
	let t = normalizeLogicalPath(e);
	let n = t.lastIndexOf(`/`);
	let r = t.lastIndexOf(`.`);
	return r === -1 || r < n ? t : t.slice(0, r);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/source-graph-paths.js
function validateProgrammaticLogicalPathInternal(e, t) {
	if (e.length === 0 || isAbsolute(e) || e.includes(`\\`)) throw Error(`Programmatic module logical path "${e}" must be a relative POSIX path.`);
	let n = normalizeLogicalPath(e);
	if (n === `.` || n.startsWith(`../`) || n.includes(`/../`) || posix.normalize(n) !== n) throw Error(`Programmatic module logical path "${e}" may not traverse directories.`);
	let r = n.split(`/`);
	let i = r.at(-1);
	if (getSupportedModuleBaseName(i) === null) throw Error(`Programmatic module logical path "${e}" must use a supported JavaScript or TypeScript extension.`);
	let a = r[0];
	let o = stripLogicalPathExtension(n);
	if (!(r.length === 1 && [
		`agent`,
		`memory`,
		`sandbox`,
		`instrumentation`
	].includes(o) || a === `sandbox` && r.length === 2 && getSupportedModuleBaseName(i) === `sandbox` || [
		`channels`,
		`connections`,
		`hooks`,
		`instructions`,
		`memory`,
		`schedules`,
		`skills`,
		`tools`
	].includes(a) && r.length >= 2 || t && a === `extensions` && r.length === 2)) throw Error(`Programmatic module logical path "${e}" does not select an eve module slot.`);
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/source-graph.js
function memoizeModuleNamespaceFactories(e) {
	return Object.freeze(Object.fromEntries(Object.entries(e).map(([e, t]) => {
		if (typeof t != `function`) return [e, t];
		let n;
		return [e, new Proxy(t, { apply(e, t, r) {
			return r.length > 0 ? Reflect.apply(e, t, r) : (n ??= Promise.resolve().then(() => Reflect.apply(e, t, r)), n);
		} })];
	})));
}
var ImmutableProgrammaticSourceMap = class {
	#e;
	constructor(e) {
		this.#e = new Map(e), Object.freeze(this);
	}
	get size() {
		return this.#e.size;
	}
	get [Symbol.toStringTag]() {
		return `ImmutableProgrammaticSourceMap`;
	}
	[Symbol.iterator]() {
		return this.#e[Symbol.iterator]();
	}
	entries() {
		return this.#e.entries();
	}
	forEach(e, t) {
		this.#e.forEach((n, r) => e.call(t, n, r, this));
	}
	get(e) {
		return this.#e.get(e);
	}
	has(e) {
		return this.#e.has(e);
	}
	keys() {
		return this.#e.keys();
	}
	values() {
		return this.#e.values();
	}
};
function defineProgrammaticAgentSource(e) {
	return defineProgrammaticAgentSourceInternal(e, !1);
}
function defineProgrammaticAgentSourceInternal(e, t) {
	let n = expectNonEmpty(e.id, `Programmatic agent source id`);
	let r = expectNonEmpty(e.revision, `Programmatic agent source "${n}" revision`);
	let i = /* @__PURE__ */ new Set();
	let a = e.modules.map((e) => {
		let r = validateProgrammaticLogicalPathInternal(e.logicalPath, t);
		if (i.has(r)) throw Error(`Programmatic agent source "${n}" declares "${r}" more than once.`);
		i.add(r);
		let a = e.semanticRevision === void 0 ? void 0 : expectNonEmpty(e.semanticRevision, `Programmatic module "${n}:${r}" semanticRevision`);
		return Object.freeze({
			exportName: e.exportName,
			loadNamespace: e.loadNamespace,
			logicalPath: r,
			semanticRevision: a
		});
	});
	return Object.freeze({
		id: n,
		modules: Object.freeze(a),
		revision: r
	});
}
function createAgentSourceRegistry(e, t = {}) {
	let n = /* @__PURE__ */ new Map();
	let addSource = (e, t = !1) => {
		let r = defineProgrammaticAgentSourceInternal(e, t);
		if (n.has(r.id)) throw Error(`Programmatic agent source id "${r.id}" is registered more than once.`);
		return n.set(r.id, r), r;
	};
	let r = e.map((e) => {
		let t = addSource(e.source);
		return Object.freeze({
			applyTo: e.applyTo,
			source: t
		});
	});
	for (let e of t.extensionDeclarations ?? []) addSource(e, !0);
	return Object.freeze({
		registrations: Object.freeze(r),
		sources: new ImmutableProgrammaticSourceMap(n)
	});
}
async function loadProgrammaticModuleNamespace(e) {
	let t = e.registries.map((t) => t.sources.get(e.backing.registryId)).filter((e) => e !== void 0);
	if (t.length !== 1) throw Error(`Expected exactly one registered programmatic source "${e.backing.registryId}", found ${t.length}.`);
	let n = t[0];
	if (n.revision !== e.backing.revision) throw Error(`Programmatic source "${n.id}" revision mismatch: artifact requires "${e.backing.revision}", registry provides "${n.revision}".`);
	let r = n.modules.find((t) => t.logicalPath === e.backing.moduleId);
	if (r === void 0) throw Error(`Programmatic source "${n.id}" does not register module "${e.backing.moduleId}".`);
	if (r.semanticRevision !== e.backing.semanticRevision) throw Error(`Programmatic module "${n.id}:${r.logicalPath}" semantic revision does not match the compiled binding.`);
	let i = await r.loadNamespace();
	if (typeof i != `object` || !i) throw Error(`Programmatic module "${n.id}:${r.logicalPath}" loader must return a module namespace object.`);
	return i;
}
function expectNonEmpty(e, t) {
	if (e.trim().length === 0) throw Error(`${t} must be non-empty.`);
	return e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module.js
function interopAuthoredModuleNamespace(e) {
	if (typeof e != `object` || !e) return e;
	let t = Reflect.get(e, `default`);
	return typeof t == `object` && t && Reflect.get(t, `__esModule`) === !0 ? t : e;
}
function getAuthoredModuleExport(e, t) {
	return e[t.exportName ?? `default`];
}
async function materializeAuthoredModuleExport(e) {
	return typeof e == `function` ? await e() : e;
}
function expectObjectRecord(e, t) {
	if (typeof e != `object` || !e || Array.isArray(e)) throw Error(t);
	return e;
}
function expectString(e, t) {
	if (typeof e != `string`) throw Error(t);
	return e;
}
function expectBoolean(e, t) {
	if (typeof e != `boolean`) throw Error(t);
	return e;
}
function expectAgentToolExposure(e, t) {
	return e === `deferred` ? e : expectBoolean(e, `${t} Expected "tool" to be true, false, or "deferred".`);
}
function expectPositiveInteger(e, t) {
	if (typeof e != `number` || !Number.isInteger(e) || e <= 0) throw Error(t);
	return e;
}
function expectFunction(e, t) {
	if (typeof e != `function`) throw Error(t);
	return e;
}
function expectProviderOptions(e, t) {
	let n = expectObjectRecord(e, t);
	let r = {};
	for (let [e, i] of Object.entries(n)) r[e] = expectObjectRecord(i, t);
	return r;
}
function expectOnlyKnownKeys(e, t, n) {
	let r = new Set(t);
	for (let t of Object.keys(e)) if (!r.has(t)) throw Error(`${n} Unknown key "${t}".`);
}
function getOptionalStringRecordProperty(e, t, n) {
	let r = e[t];
	if (r === void 0) return;
	let i = expectObjectRecord(r, n);
	let a = {};
	for (let [e, t] of Object.entries(i)) a[e] = expectString(t, n);
	return a;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/extension-mount-bindings.js
function bindingMountId(e) {
	return e.backing.mountId;
}
function extensionOverridePaths(e) {
	return new Map([e, ...e.subagents.map((e) => e.agent)].flatMap((e) => [...Object.values(e.bindings), ...e.remoteAgents.map((e) => e.binding)].flatMap((e) => e.backing.kind === `filesystem` && e.owner.kind === `application` && bindingMountId(e) !== void 0 ? [[e.backing.sourcePath, bindingMountId(e)]] : [])));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/import-specifier.js
const WINDOWS_DRIVE_ABSOLUTE_PATH_PATTERN = /^\/?[A-Za-z]:[\\/]/;
const WINDOWS_UNC_ABSOLUTE_PATH_PATTERN = /^\\\\[^\\]/;
function isWindowsAbsolutePath(e) {
	return WINDOWS_DRIVE_ABSOLUTE_PATH_PATTERN.test(e) || WINDOWS_UNC_ABSOLUTE_PATH_PATTERN.test(e);
}
function convertWindowsPathToFileUrl(e) {
	let t = e.replaceAll(`\\`, `/`);
	return t.startsWith(`//`) ? new URL(`file:${t}`).href : (/^\/[A-Za-z]:\//.test(t) && (t = t.slice(1)), new URL(`file:///${t}`).href);
}
function splitPathSpecifierSuffix(e) {
	let t = e.indexOf(`?`);
	let n = e.indexOf(`#`);
	let r = t === -1 ? n : n === -1 ? t : Math.min(t, n);
	return r === -1 ? {
		path: e,
		suffix: ``
	} : {
		path: e.slice(0, r),
		suffix: e.slice(r)
	};
}
function normalizeEsmImportSpecifier(e) {
	if (e.startsWith(`file://`)) return e;
	let { path: t, suffix: n } = splitPathSpecifierSuffix(e);
	return isWindowsAbsolutePath(t) ? `${convertWindowsPathToFileUrl(t)}${n}` : e.replaceAll(`\\`, `/`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-cache.js
const LEASE_DIRECTORY_NAME = `.leases`;
const leases = /* @__PURE__ */ new Map();
let heartbeat;
function writeAuthoredModuleCacheFile(e, t, n) {
	registerLease(e);
	let r = join(e, t);
	try {
		let e = /* @__PURE__ */ new Date();
		utimesSync(r, e, e);
	} catch (t) {
		if (t.code !== `ENOENT`) return replaceFile(r, n), r;
		try {
			writeFileSync(r, n);
		} catch (t) {
			if (t.code !== `ENOENT`) throw t;
			leases.delete(e), registerLease(e), writeFileSync(r, n);
		}
	}
	return r;
}
function registerLease(e) {
	if (leases.has(e)) return;
	let t = {
		host: hostname(),
		pid: process.pid,
		since: Date.now()
	};
	let n = join(e, LEASE_DIRECTORY_NAME, `${process.pid}-${randomUUID()}.json`);
	leases.set(e, {
		path: n,
		lease: t
	});
	try {
		writeLease(n, t);
	} catch {}
	heartbeat === void 0 && (heartbeat = setInterval(refreshLeases, 6e4).unref(), process.once(`exit`, releaseLeases));
}
function writeLease(e, t) {
	mkdirSync(join(e, `..`), { recursive: !0 }), writeFileSync(e, JSON.stringify(t));
}
function refreshLeases() {
	let e = /* @__PURE__ */ new Date();
	for (let { path: t, lease: n } of leases.values()) try {
		utimesSync(t, e, e);
	} catch {
		try {
			writeLease(t, n);
		} catch {}
	}
}
function releaseLeases() {
	for (let { path: e } of leases.values()) try {
		unlinkSync(e);
	} catch {}
}
function replaceFile(e, t) {
	let n = `${e}.${randomUUID()}.tmp`;
	try {
		writeFileSync(n, t), renameSync(n, e);
	} catch {
		try {
			unlinkSync(n);
		} catch {}
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/path-inside.js
function isPathInsideOrEqual(e, t) {
	let n = relative(resolve(t), resolve(e));
	return n === `` || n !== `..` && !n.startsWith(`..${sep}`) && !isAbsolute(n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/host-traced-dependencies.js
function matchesHostTracedDependency(e, t) {
	return t.some((t) => t.endsWith(`*`) ? e.startsWith(t.slice(0, -1)) : e === t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/installed-packages.js
const NODE_MODULES_SEGMENT = `/node_modules/`;
function installedDependencyClosure(e, t) {
	let n = t?.includeOptional ?? !0;
	let r = [];
	let i = /* @__PURE__ */ new Set();
	let a = e.map(toCanonicalPath$2);
	for (let e = a.pop(); e !== void 0; e = a.pop()) {
		if (i.has(e)) continue;
		i.add(e);
		let t = readPackageManifest(e, n);
		r.push({
			name: t.name,
			root: e
		});
		for (let n of t.dependencies) {
			let t = findInstalledDependencyRoot(n, e);
			t === void 0 ? r.push({
				name: n,
				root: ``
			}) : a.push(t);
		}
	}
	return r;
}
function createInstalledPackageScope(e) {
	let t;
	let roots = () => t ??= new Set(installedDependencyClosure(e).map((e) => e.root).filter((e) => e !== ``));
	let n = /* @__PURE__ */ new Map();
	return {
		includes(t) {
			if (e.length === 0) return !1;
			let r = dirname(toCanonicalPath$2(t));
			let i = n.get(r);
			if (i === void 0) {
				let e = installedPackageRoot(t);
				i = e !== void 0 && roots().has(e), n.set(r, i);
			}
			return i;
		},
		nodeModulesDirectories() {
			let e = /* @__PURE__ */ new Set();
			for (let t of roots()) {
				let n = t.replaceAll(`\\`, `/`);
				let r = n.lastIndexOf(NODE_MODULES_SEGMENT);
				r !== -1 && e.add(n.slice(r + 14));
			}
			return [...e];
		},
		rootsOutsideNodeModules() {
			return [...roots()].filter((e) => !e.replaceAll(`\\`, `/`).includes(NODE_MODULES_SEGMENT));
		}
	};
}
function installedPackageRoot(e) {
	let t = dirname(toCanonicalPath$2(e));
	for (;;) {
		if (readPackageManifest(t).name !== void 0) return t;
		let e = dirname(t);
		if (e === t) return;
		t = e;
	}
}
function readPackageManifest(e, t = !0) {
	try {
		let n = JSON.parse(readFileSync(join(e, `package.json`), `utf8`));
		let r = [
			...objectKeys(n.dependencies),
			...t ? objectKeys(n.optionalDependencies) : [],
			...peerDependencyNames(n, t)
		];
		return {
			name: typeof n.name == `string` ? n.name : void 0,
			dependencies: [...new Set(r)]
		};
	} catch {
		return {
			name: void 0,
			dependencies: []
		};
	}
}
function objectKeys(e) {
	return typeof e == `object` && e ? Object.keys(e) : [];
}
function peerDependencyNames(e, t) {
	let n = objectKeys(e.peerDependencies);
	if (t) return n;
	let r = e.peerDependenciesMeta !== null && typeof e.peerDependenciesMeta == `object` ? e.peerDependenciesMeta : void 0;
	return r === void 0 ? n : n.filter((e) => {
		let t = r[e];
		return !(typeof t == `object` && t && t.optional === !0);
	});
}
function findInstalledDependencyRoot(e, t) {
	let n = (createRequire(join(t, `package.json`)).resolve.paths(e) ?? []).map((t) => join(t, e, `package.json`)).find(existsSync);
	return n === void 0 ? void 0 : toCanonicalPath$2(dirname(n));
}
function toCanonicalPath$2(e) {
	try {
		return realpathSync.native(e);
	} catch {
		return resolve(e);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-package-boundary.js
const RESOLVE_EXTENSIONS = [
	`.ts`,
	`.tsx`,
	`.mts`,
	`.cts`,
	`.js`,
	`.jsx`,
	`.mjs`,
	`.cjs`,
	`.json`
];
function createGenerationPackageBoundaryPlugin(e) {
	let t = /* @__PURE__ */ new Map();
	return {
		name: `eve-generation-package-boundary`,
		async resolveId(n, r, i) {
			if (!isPackageImport$1(n) || e.extensionSpecifiers?.has(n)) return;
			if (isFrameworkRuntimeImport(n, r)) return e.extensionSpecifiers?.has(n) ? void 0 : {
				external: !0,
				id: toExternalModuleId(resolveFrameworkRuntimeImport(n), i.kind)
			};
			if (n.startsWith(`#`)) {
				let t = resolvePackageImport(n, r, e.packageRoot);
				if (t !== void 0) return { id: t };
			}
			let a = await resolveConfiguredExternalModule.call(this, {
				externalDependencies: e.externalDependencies,
				importer: r,
				kind: i.kind,
				packageRoot: e.packageRoot,
				source: n
			});
			if (a !== void 0) return {
				external: !0,
				id: e.resolveExternalPaths ? toExternalModuleId(normalizeEsmImportSpecifier(a.resolvedId), i.kind) : n
			};
			if (e.hostBundle === void 0) return;
			let o = await this.resolve(n, r, {
				kind: i.kind,
				skipSelf: !0
			});
			if (o !== null && typeof o.id == `string` && !o.id.startsWith(`\0`) && isNodeModulesPath$2(o.id) && !isFrameworkPackagePath(o.id) && canHostBundleInstalledPackage(o.id, e.hostBundle.tracedDependencies, t)) {
				let t = installedPackageRoot(o.id);
				return t !== void 0 && e.hostBundle.externalPackageRoots.add(t), {
					external: !0,
					id: toExternalModuleId(normalizeEsmImportSpecifier(o.id), i.kind)
				};
			}
		}
	};
}
function createRuntimeLoaderPackageBoundaryPlugin(e) {
	let t = toCanonicalPath$1(e.packageRoot);
	return {
		name: `eve-runtime-loader-package-boundary`,
		async resolveId(n, r, i) {
			if (!isPackageImport$1(n) || e.extensionSpecifiers?.has(n) === !0) return;
			if (isFrameworkRuntimeImport(n, r)) return {
				external: !0,
				id: toExternalModuleId(resolveRuntimeLoaderFrameworkImport(n), i.kind)
			};
			if (n.startsWith(`#`)) {
				let t = resolvePackageImport(n, r, e.packageRoot);
				if (t !== void 0) return isFrameworkPackagePath(t) ? {
					external: !0,
					id: toExternalModuleId(normalizeEsmImportSpecifier(t), i.kind)
				} : { id: t };
			}
			let a = await resolveConfiguredExternalModule.call(this, {
				externalDependencies: e.externalDependencies,
				importer: r,
				kind: i.kind,
				packageRoot: e.packageRoot,
				source: n
			});
			if (a !== void 0) return {
				external: !0,
				id: toExternalModuleId(normalizeEsmImportSpecifier(resolveExistingExternalFilePath(a.resolvedId) ?? a.resolvedId), i.kind)
			};
			let o = r === void 0 || r.startsWith(`\0`) ? void 0 : resolve(r);
			if (o !== void 0 && isPathInsideOrEqual(toCanonicalPath$1(o), t)) {
				let e = await this.resolve(n, r, {
					kind: i.kind,
					skipSelf: !0
				});
				if (e === null || typeof e.id != `string`) throw Error(`Cannot resolve package "${n}" imported from "${o}". Install it with your package manager (e.g. \`pnpm install\`); a running \`eve dev\` retries on the next rebuild.`);
				if (isNodeModulesPath$2(e.id)) return {
					external: !0,
					id: n
				};
			}
		}
	};
}
async function resolveConfiguredExternalModule(e) {
	let t = resolveConfiguredExternalDependency(e.source, e.externalDependencies);
	if (t === void 0) return;
	let n = await this.resolve(e.source, e.importer, {
		kind: e.kind,
		skipSelf: !0
	});
	if (n === null && (n = await this.resolve(e.source, join(e.packageRoot, `package.json`), {
		kind: e.kind,
		skipSelf: !0
	})), n === null || typeof n.id != `string`) throw Error(`Cannot resolve external package "${e.source}".`);
	return {
		packageName: t,
		resolvedId: n.id
	};
}
function normalizeExternalDependencies(e = []) {
	return [...new Set(e)].sort();
}
function resolveConfiguredExternalDependency(e, t) {
	return t.find((t) => e === t || e.startsWith(`${t}/`));
}
function canHostBundleInstalledPackage(e, t, n) {
	let r = installedPackageRoot(e);
	if (r === void 0) return !1;
	if (t.length === 0) return !0;
	let i = n.get(r);
	return i === void 0 && (i = installedDependencyClosure([r], { includeOptional: !1 }), n.set(r, i)), i.every((e) => e.name === void 0 || !matchesHostTracedDependency(e.name, t));
}
function nearestPackageRoot(e) {
	let t = dirname(toCanonicalPath$1(e));
	for (;;) {
		if (existsSync(join(t, `package.json`))) return t;
		let e = dirname(t);
		if (e === t) return;
		t = e;
	}
}
function resolvePackageImport(e, t, n) {
	let r = t === void 0 || t.startsWith(`\0`) ? n : nearestPackageRoot(t) ?? n;
	try {
		let t = createRequire(join(r, `package.json`)).resolve(e);
		return isPathInsideOrEqual(toCanonicalPath$1(t), toCanonicalPath$1(r)) ? t : void 0;
	} catch {
		return;
	}
}
let canonicalFrameworkPackageRoot;
function isFrameworkPackagePath(e) {
	return canonicalFrameworkPackageRoot ??= toCanonicalPath$1(resolvePackageRoot()), nearestPackageRoot(e) === canonicalFrameworkPackageRoot;
}
function toExternalModuleId(e, t) {
	return t === `require-call` && e.startsWith(`file:`) ? fileURLToPath(e) : e;
}
function resolveExistingExternalFilePath(e) {
	if (existsSync(e)) return e;
	for (let t of RESOLVE_EXTENSIONS) {
		let n = `${e}${t}`;
		if (existsSync(n)) return n;
	}
}
function isPackageImport$1(e) {
	return isPathImport(e) || /^(?:node|data|file):/.test(e) ? !1 : !e.startsWith(`@/`);
}
function isPathImport(e) {
	return e.startsWith(`.`) || e.startsWith(`/`) || /^[A-Za-z]:[\\/]/.test(e);
}
const SELF_MODIFICATION_MOUNT_SPECIFIERS = /* @__PURE__ */ new Set([
	`eve/self-modification`,
	`eve/extensions/self-modification/local`,
	`eve/extensions/self-modification/remote`
]);
function isFrameworkRuntimeImport(e, t) {
	return SELF_MODIFICATION_MOUNT_SPECIFIERS.has(e) ? !1 : e === `eve` || e.startsWith(`eve/`) ? !0 : e === `workflow` || e.startsWith(`workflow/`) || e.startsWith(`@workflow/`) ? t === void 0 || !isNodeModulesPath$2(t) : !1;
}
function resolveFrameworkRuntimeImport(e) {
	return e === `eve` || e.startsWith(`eve/`) ? e : normalizeEsmImportSpecifier(resolveWorkflowModulePath(e));
}
function resolveRuntimeLoaderFrameworkImport(e) {
	return e === `eve` || e.startsWith(`eve/`) ? normalizeEsmImportSpecifier(resolvePackageDependencyPath(e)) : resolveFrameworkRuntimeImport(e);
}
function isNodeModulesPath$2(e) {
	return e.replaceAll(`\\`, `/`).includes(`/node_modules/`);
}
function isAuthoredSourcePath(e) {
	return isAbsolute(e) && !isNodeModulesPath$2(e);
}
function resolveAuthoredPackageRoot(e) {
	let t = findAuthoredPackageRoot(dirname(e));
	if (t === void 0) throw Error(`Failed to resolve the authored package root for "${e}".`);
	return t;
}
function findAuthoredPackageRoot(e) {
	let t = e;
	for (;;) {
		if (existsSync(join(t, `package.json`))) return realpathSync(t);
		let e = dirname(t);
		if (e === t) return;
		t = e;
	}
}
function toCanonicalPath$1(e) {
	try {
		return realpathSync(e);
	} catch {
		return resolve(e);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/filters.js
const ESCAPE_REGEX_RE = /[-/\\^$*+?.()|[\]{}]/g;
const EITHER_SEPARATOR = `[\\\\/]`;
function escapeRegex(e) {
	return e.replace(ESCAPE_REGEX_RE, `\\$&`);
}
function exactRegex(e, t) {
	return RegExp(`^${escapeRegex(e)}$`, t);
}
function prefixRegex(e, t) {
	return RegExp(`^${escapeRegex(e)}`, t);
}
function pathSource(e) {
	return e.split(/[\\/]/).map(escapeRegex).join(EITHER_SEPARATOR);
}
function packageModulesRegex(e) {
	let t = `${EITHER_SEPARATOR}node_modules${EITHER_SEPARATOR}`;
	return RegExp(`^${pathSource(e)}(?!.*${t})${EITHER_SEPARATOR}`, process.platform === `win32` ? `i` : void 0);
}
function include(e) {
	return {
		kind: `include`,
		expr: e
	};
}
function exclude(e) {
	return {
		kind: `exclude`,
		expr: e
	};
}
function or(...e) {
	return {
		kind: `or`,
		args: e
	};
}
function not(e) {
	return {
		kind: `not`,
		expr: e
	};
}
function id(e) {
	return {
		kind: `id`,
		pattern: e,
		params: {}
	};
}
function importerId(e) {
	return {
		kind: `importerId`,
		pattern: e,
		params: {}
	};
}
function resolveIdFilter(e, t) {
	return t === void 0 ? { id: e } : [include({
		kind: `and`,
		args: [id(e), t]
	})];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-asset-import-plugin.js
const AUTHORED_ASSET_CODE_EXTENSIONS = [
	`.ts`,
	`.tsx`,
	`.mts`,
	`.cts`,
	`.js`,
	`.jsx`,
	`.mjs`,
	`.cjs`,
	`.json`
];
const RESOLVE_FILTER = /^(?:\.|\/|[A-Za-z]:[\\/])/;
function createAuthoredAssetImportPlugin(e) {
	let t = toCanonicalPath(e.packageRoot);
	let n = [/\?raw$/, new RegExp(String.raw`\.(?!(?:${AUTHORED_ASSET_CODE_EXTENSIONS.map((e) => e.slice(1)).join(`|`)}|node)(?:[?#]|$))[^./?#]*(?:[?#].*)?$`)];
	let handles = (t) => e.authoredSourceOnly !== !0 || isAuthoredSourcePath(t) || e.handlesInstalledModule?.(t) === !0;
	let r = /* @__PURE__ */ new Set();
	return {
		name: `eve-authored-asset-import`,
		resolveId: {
			filter: resolveIdFilter(RESOLVE_FILTER, e.importerFilter),
			handler(e, n) {
				if (!isPotentialAuthoredAssetImport(e) || n === void 0 || !handles(n)) return;
				let { path: i, suffix: a } = splitImportSuffix(e);
				let o = isAbsolute(i) ? i : resolve(dirname(n), i);
				if (!isFile(o)) return;
				let s = toCanonicalPath(o);
				let c = findAuthoredPackageRoot(dirname(toCanonicalPath(n))) ?? t;
				if (!isPathInsideOrEqual(s, t) && !isPathInsideOrEqual(s, c)) throw Error(`Authored asset import "${e}" from "${n}" resolves outside package root "${c}".`);
				let l = `${s}${a}`;
				return r.add(l), l;
			}
		},
		load: {
			filter: { id: n },
			async handler(e) {
				let { path: t, suffix: n } = splitImportSuffix(e);
				if (!isPotentialAuthoredAssetImport(e) || !(r.has(e) || handles(t))) return;
				if (n === `?raw`) {
					let e = await readAssetText(t);
					return e === void 0 ? void 0 : {
						code: `export default ${JSON.stringify(e)};`,
						moduleType: `js`
					};
				}
				let i = await readAssetDataUrl(t);
				if (i !== void 0) return {
					code: `export default ${JSON.stringify(i)};`,
					moduleType: `js`
				};
			}
		}
	};
}
function isFile(e) {
	try {
		return statSync(e).isFile();
	} catch {
		return !1;
	}
}
function toCanonicalPath(e) {
	let t = resolve(e);
	try {
		return realpathSync.native(t);
	} catch {
		return t;
	}
}
async function readAssetText(e) {
	try {
		return await readFile(e, `utf8`);
	} catch (e) {
		if (isPathNotFoundError$1(e)) return;
		throw e;
	}
}
function isPotentialAuthoredAssetImport(e) {
	if (e.startsWith(`\0`) || e.startsWith(`node:`) || e.startsWith(`data:`) || e.startsWith(`file:`)) return !1;
	let { path: t, suffix: n } = splitImportSuffix(e);
	if (!t.startsWith(`.`) && !t.startsWith(`/`) && !/^[A-Za-z]:[\\/]/.test(t)) return !1;
	if (n === `?raw`) return !0;
	let r = extname(t);
	return r.length > 0 && r !== `.node` && !AUTHORED_ASSET_CODE_EXTENSIONS.includes(r);
}
function splitImportSuffix(e) {
	let t = e.indexOf(`?`);
	let n = e.indexOf(`#`);
	let r = t === -1 ? n : n === -1 ? t : Math.min(t, n);
	return r === -1 ? {
		path: e,
		suffix: ``
	} : {
		path: e.slice(0, r),
		suffix: e.slice(r)
	};
}
async function readAssetDataUrl(e) {
	try {
		let t = await readFile(e);
		return `data:${getAssetMimeType(e)};base64,${t.toString(`base64`)}`;
	} catch (e) {
		if (isPathNotFoundError$1(e)) return;
		throw e;
	}
}
function isPathNotFoundError$1(e) {
	return typeof e == `object` && !!e && `code` in e && (e.code === `ENOENT` || e.code === `ENOTDIR`);
}
function getAssetMimeType(e) {
	switch (extname(e).toLowerCase()) {
		case `.css`: return `text/css`;
		case `.csv`: return `text/csv`;
		case `.gif`: return `image/gif`;
		case `.html`: return `text/html`;
		case `.jpg`:
		case `.jpeg`: return `image/jpeg`;
		case `.png`: return `image/png`;
		case `.svg`: return `image/svg+xml`;
		case `.txt`: return `text/plain`;
		case `.wasm`: return `application/wasm`;
		case `.webp`: return `image/webp`;
		default: return `application/octet-stream`;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-package-tsconfig-paths.js
const NON_PACKAGE_IMPORT_FILTER = /^(?:\.|\/|[A-Za-z]:[\\/]|node:|data:|file:)/;
const packageTsConfigPathsCache = /* @__PURE__ */ new Map();
const nearestPackageRootCache = /* @__PURE__ */ new Map();
function createAuthoredPackageTsConfigPathsPlugin(e) {
	let t = createCachedStatProbe();
	let n = e.authoredSourceOnly === !0 ? packageModulesRegex(realpathSync.native(resolvePackageRoot())) : void 0;
	return {
		name: `eve-package-tsconfig-paths`,
		resolveId: {
			filter: n === void 0 ? { id: { exclude: NON_PACKAGE_IMPORT_FILTER } } : [
				exclude(id(NON_PACKAGE_IMPORT_FILTER)),
				exclude(importerId(n)),
				...e.importerFilter === void 0 ? [] : [include(e.importerFilter)]
			],
			async handler(r, i, a) {
				if (i === void 0 || !isPackageImport(r) || n?.test(i) === !0 || e.authoredSourceOnly === !0 && isNodeModulesPath$2(i) && e.handlesInstalledModule?.(i) !== !0) return;
				let o = resolve(i);
				if (isPathInsideOrEqual(o, e.appPackageRoot)) return;
				let s = await resolveNearestPackageRoot(o, t);
				if (s === void 0 || isPathInsideOrEqual(s, e.appPackageRoot)) return;
				let c = await loadPackageTsConfigPaths(s);
				if (c !== void 0) for (let n of createTsConfigPathCandidates(r, c)) {
					let r = await this.resolve(n, i, {
						kind: a.kind,
						skipSelf: !0
					});
					if (r !== null) return r;
					let o = await resolveExistingPath(n, e.extensions, t);
					if (o !== void 0) return { id: o };
				}
			}
		}
	};
}
function loadPackageTsConfigPaths(e) {
	let t = packageTsConfigPathsCache.get(e);
	if (t !== void 0) return t;
	let n = readPackageTsConfigPaths(e);
	return packageTsConfigPathsCache.set(e, n), n;
}
async function readPackageTsConfigPaths(e) {
	let t = await readPackageConfig(e);
	if (t === void 0) return;
	let n = [];
	let r = parse(t.source, n, { allowTrailingComma: !0 });
	if (n.length > 0 || !isObjectRecord(r)) return;
	let i = r.compilerOptions;
	if (!isObjectRecord(i) || !isObjectRecord(i.paths)) return;
	let a = dirname(t.path);
	let o = typeof i.baseUrl == `string` ? resolve(a, i.baseUrl) : a;
	let s = Object.entries(i.paths).flatMap(([e, t]) => !Array.isArray(t) || !t.every((e) => typeof e == `string`) ? [] : [{
		pattern: e,
		targets: t
	}]).sort((e, t) => t.pattern.length - e.pattern.length);
	if (s.length !== 0) return {
		baseDirectory: o,
		entries: s
	};
}
async function readPackageConfig(e) {
	for (let t of [`tsconfig.json`, `jsconfig.json`]) {
		let n = join(e, t);
		try {
			return {
				path: n,
				source: await readFile(n, `utf8`)
			};
		} catch (e) {
			if (!isPathNotFoundError(e)) throw e;
		}
	}
}
function createTsConfigPathCandidates(e, t) {
	let n = [];
	for (let r of t.entries) {
		let i = matchTsConfigPathPattern(e, r.pattern);
		if (i !== void 0) for (let e of r.targets) {
			let r = e.includes(`*`) ? e.replaceAll(`*`, i) : e;
			n.push(resolve(t.baseDirectory, r));
		}
	}
	return n;
}
function matchTsConfigPathPattern(e, t) {
	let n = t.indexOf(`*`);
	if (n === -1) return e === t ? `` : void 0;
	let r = t.slice(0, n);
	let i = t.slice(n + 1);
	if (e.startsWith(r) && e.endsWith(i)) return e.slice(r.length, e.length - i.length);
}
async function resolveExistingPath(e, t, n) {
	if (await existsAsFile(e, n)) return e;
	for (let r of t) {
		let t = `${e}${r}`;
		if (await existsAsFile(t, n)) return t;
	}
	for (let r of t) {
		let t = join(e, `index${r}`);
		if (await existsAsFile(t, n)) return t;
	}
}
async function existsAsFile(e, t) {
	return (await t(e))?.isFile() ?? !1;
}
function resolveNearestPackageRoot(e, t) {
	let n = dirname(e);
	let r = nearestPackageRootCache.get(n);
	if (r !== void 0) return r;
	let i = findNearestPackageRoot(n, t);
	return nearestPackageRootCache.set(n, i), i;
}
async function findNearestPackageRoot(e, t) {
	let n = e;
	for (;;) {
		if (await pathExists(join(n, `package.json`), t)) return n;
		let e = dirname(n);
		if (e === n) return;
		n = e;
	}
}
async function pathExists(e, t) {
	return await t(e) !== void 0;
}
function createCachedStatProbe() {
	let e = /* @__PURE__ */ new Map();
	return (t) => {
		let n = e.get(t);
		if (n !== void 0) return n;
		let r = stat(t).catch(() => void 0);
		return e.set(t, r), r;
	};
}
function isPathNotFoundError(e) {
	return typeof e == `object` && !!e && `code` in e && (e.code === `ENOENT` || e.code === `ENOTDIR`);
}
function isPackageImport(e) {
	return e.startsWith(`.`) || e.startsWith(`/`) || /^[A-Za-z]:[\\/]/.test(e) ? !1 : !/^(?:node|data|file):/.test(e);
}
function isObjectRecord(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-relative-extension-resolver.js
const PATH_IMPORT_FILTER = /^(?:\.|\/|[A-Za-z]:[\\/])/;
function createAuthoredRelativeExtensionResolverPlugin(e) {
	let t = createCachedFileProbe();
	return {
		name: `eve-authored-relative-extension-resolver`,
		resolveId: {
			filter: resolveIdFilter(PATH_IMPORT_FILTER, e.importerFilter),
			handler(n, r) {
				if (r === void 0 || r.startsWith(`\0`) || !isPathImport(n) || e.authoredSourceOnly === !0 && !isAuthoredSourcePath(r) && e.handlesInstalledModule?.(r) !== !0) return;
				let i = resolveExistingImportPath(isAbsolute(n) ? n : resolve(dirname(r), n), e.extensions, t);
				if (i === void 0) return;
				let a = isNodeModulesPath$2(i) ? toRealModulePath(i) : i;
				let o = findPackageJsonPath(a, t);
				return o === void 0 ? { id: a } : {
					id: a,
					packageJsonPath: o
				};
			}
		}
	};
}
function findPackageJsonPath(e, t) {
	for (let n = dirname(e);; n = dirname(n)) {
		let e = join(n, `package.json`);
		if (t(e)) return e;
		if (dirname(n) === n) return;
	}
}
function createCachedFileProbe() {
	let e = /* @__PURE__ */ new Map();
	return (t) => {
		let n = e.get(t);
		if (n !== void 0) return n;
		let r = !1;
		try {
			r = statSync(t).isFile();
		} catch {}
		return e.set(t, r), r;
	};
}
function resolveExistingImportPath(e, t, n) {
	if (n(e)) return e;
	for (let r of t) {
		let t = `${e}${r}`;
		if (n(t)) return t;
	}
	for (let r of t) {
		let t = join(e, `index${r}`);
		if (n(t)) return t;
	}
}
function toRealModulePath(e) {
	try {
		return realpathSync(e);
	} catch {
		return e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/authored-plugins.js
const NODE_MODULES = /[\\/]node_modules[\\/]/;
function createAuthoredPlugins(e) {
	let t = e.authoredSourceOnly ?? !1;
	let n = e.extensions ?? RESOLVE_EXTENSIONS;
	let r = createInstalledPackageScope(e.hostBundledPackageRoots ?? []);
	let i = r.includes;
	let a = t ? createAuthoredImporterFilter(r) : void 0;
	return [
		createAuthoredAssetImportPlugin({
			authoredSourceOnly: t,
			handlesInstalledModule: i,
			importerFilter: a,
			packageRoot: e.packageRoot
		}),
		createAuthoredRelativeExtensionResolverPlugin({
			authoredSourceOnly: t,
			extensions: n,
			handlesInstalledModule: i,
			importerFilter: a
		}),
		createAuthoredPackageTsConfigPathsPlugin({
			appPackageRoot: e.packageRoot,
			authoredSourceOnly: t,
			extensions: n,
			handlesInstalledModule: i,
			importerFilter: a
		})
	];
}
function createAuthoredImporterFilter(e) {
	let t = not(importerId(NODE_MODULES));
	let n = [...importerInside(NODE_MODULES.source, e.nodeModulesDirectories()), ...importerInside(`^`, e.rootsOutsideNodeModules())];
	return n.length === 0 ? t : or(t, ...n);
}
function importerInside(e, t) {
	if (t.length === 0) return [];
	let n = t.map(pathSource).join(`|`);
	return [importerId(new RegExp(String.raw`${e}(?:${n})[\\/]`, `i`))];
}
function resolveAuthoredTsConfigPath(e) {
	for (let t of [`tsconfig.json`, `jsconfig.json`]) {
		let n = join(e, t);
		if (existsSync(n)) return n;
	}
	return !1;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/node-esm-compat-banner.js
const BANNER_LINES = [
	{
		importLine: `import { fileURLToPath as __eveFileURLToPath } from "node:url";`,
		declarationLine: `const __filename = __eveFileURLToPath(import.meta.url);`,
		bindingName: `__filename`
	},
	{
		importLine: `import { dirname as __eveDirname } from "node:path";`,
		declarationLine: `const __dirname = __eveDirname(__filename);`,
		bindingName: `__dirname`
	},
	{
		importLine: `import { createRequire as __eveCreateRequire } from "node:module";`,
		declarationLine: `const require = __eveCreateRequire(import.meta.url);`,
		bindingName: `require`
	}
];
const FILENAME_BANNER_LINE = BANNER_LINES[0];
const DIRNAME_BANNER_LINE = BANNER_LINES[1];
function buildNodeEsmCompatBanner(e) {
	let t = [];
	let n = [];
	let r = collectTopLevelVariableBindings(e);
	let i = r.has(FILENAME_BANNER_LINE.bindingName);
	let a = r.has(DIRNAME_BANNER_LINE.bindingName);
	for (let e of BANNER_LINES) r.has(e.bindingName) || (t.push(e.importLine), n.push(e === DIRNAME_BANNER_LINE && i ? `const __dirname = __eveDirname(__eveFileURLToPath(import.meta.url));` : e.declarationLine));
	return i && !a && t.unshift(FILENAME_BANNER_LINE.importLine), n.length === 0 ? `` : [...t, ...n].join(`
`);
}
function collectTopLevelVariableBindings(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.body) if (n.type === `VariableDeclaration`) for (let e of n.declarations ?? []) e.id.type === `Identifier` && e.id.name !== void 0 && t.add(e.id.name);
	return t;
}
function createNodeEsmCompatBannerPlugin() {
	return {
		name: `eve-node-esm-compat-banner`,
		renderChunk(e, t) {
			let n = buildNodeEsmCompatBanner(mayDeclareCompatibilityBinding(e) ? this.parse(e) : { body: [] });
			return n === `` ? null : {
				code: `${n}\n${e}`,
				map: createPrependedLineSourceMap({
					insertedLineCount: n.split(`
`).length,
					source: t?.fileName ?? `eve-node-esm-compat-banner-input`,
					sourceContent: e
				})
			};
		}
	};
}
const DECLARATION_TRIVIA = String.raw`(?:\s|/\*(?:[^*]|\*(?!/))*\*/|//[^\r\n\u2028\u2029]*[\r\n\u2028\u2029])*`;
const DECLARATION_START = String.raw`(?:(?<![\w$"'\x60])(?:var|let|const|using)\b|,)${DECLARATION_TRIVIA}`;
const BINDING_END = String.raw`(?![\w$])`;
const COMPATIBILITY_BINDING_DECLARATION = new RegExp(String.raw`${DECLARATION_START}(?:__filename|__dirname|require)${BINDING_END}`);
const IDENTIFIER_ESCAPE = String.raw`\\u(?:[\da-fA-F]{4}|\{[\da-fA-F]+\})`;
const ESCAPED_IDENTIFIER_DECLARATION = new RegExp(String.raw`${DECLARATION_START}([\w$]*(?:${IDENTIFIER_ESCAPE}[\w$]*)+)`, `g`);
const IDENTIFIER_ESCAPE_PATTERN = new RegExp(IDENTIFIER_ESCAPE, `g`);
function mayDeclareCompatibilityBinding(e) {
	return COMPATIBILITY_BINDING_DECLARATION.test(e) || declaresEscapedCompatibilityBinding(e);
}
function declaresEscapedCompatibilityBinding(e) {
	if (!e.includes(`\\u`)) return !1;
	for (let t of e.matchAll(ESCAPED_IDENTIFIER_DECLARATION)) {
		let e = t[1].replace(IDENTIFIER_ESCAPE_PATTERN, (e) => {
			let t = Number.parseInt(e.slice(2).replace(/[{}]/g, ``), 16);
			return t <= 1114111 ? String.fromCodePoint(t) : `�`;
		});
		if (BANNER_LINES.some((t) => t.bindingName === e)) return !0;
	}
	return !1;
}
function createPrependedLineSourceMap({ insertedLineCount: e, source: t, sourceContent: n }) {
	let r = n.split(`
`).length;
	return {
		version: 3,
		sources: [t],
		sourcesContent: [n],
		names: [],
		mappings: `${`;`.repeat(e)}AAAA${`;AACA`.repeat(r - 1)}`
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/pseudo-packages.js
const PSEUDO_PACKAGES = /* @__PURE__ */ new Set([
	`server-only`,
	`client-only`,
	`next/dist/compiled/server-only`,
	`next/dist/compiled/client-only`
]);
const PSEUDO_PACKAGE_ID_PREFIX = `\0eve-pseudo-package:`;
function createPseudoPackagePlugin() {
	return {
		name: `eve-pseudo-packages`,
		resolveId: {
			filter: { id: [...PSEUDO_PACKAGES].map((e) => exactRegex(e)) },
			handler: (e) => ({ id: `${PSEUDO_PACKAGE_ID_PREFIX}${e}` })
		},
		load: {
			filter: { id: prefixRegex(PSEUDO_PACKAGE_ID_PREFIX) },
			handler: () => ({
				code: ``,
				moduleType: `js`
			})
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/vendored-dependency-log.js
function normalizePath(e) {
	return e.replaceAll(`\\`, `/`);
}
function isNodeModulesPath$1(e) {
	return normalizePath(e).split(`/`).includes(`node_modules`);
}
function hasPathSegments(e, t) {
	let n = normalizePath(e).split(`/`).filter(Boolean);
	return n.some((e, r) => t.every((e, t) => n[r + t] === e));
}
function isCompiledVendorPath(e) {
	return hasPathSegments(e, [`.generated`, `compiled`]) || hasPathSegments(e, [
		`dist`,
		`src`,
		`compiled`
	]);
}
function getLogFilePaths(e) {
	if (typeof e != `object` || !e) return [];
	let t = e;
	let n = Array.isArray(t.ids) ? t.ids : [];
	return [
		t.id,
		...n,
		t.loc?.file
	].filter((e) => typeof e == `string`);
}
function isVendoredDependencyWarning(e) {
	let t = getLogFilePaths(e);
	return t.length > 0 && t.every((e) => isNodeModulesPath$1(e) || isCompiledVendorPath(e));
}
function onVendoredDependencyLog(e, t, n) {
	e === `warn` && isVendoredDependencyWarning(t) || n(e, t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/rolldown.js
let rolldownPromise;
let rolldownParseAstPromise;
function loadRolldown() {
	return rolldownPromise ??= import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/rolldown@1.3.2/node_modules/rolldown/dist/index.mjs"), rolldownPromise;
}
function loadRolldownParseAst() {
	return rolldownParseAstPromise ??= import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/rolldown@1.3.2/node_modules/rolldown/dist/parse-ast-index.mjs"), rolldownParseAstPromise;
}
function inferRolldownParserLanguage(e) {
	return e.endsWith(`.tsx`) ? `tsx` : e.endsWith(`.jsx`) ? `jsx` : /\.[cm]?ts$/.test(e) ? `ts` : `js`;
}
async function parseWithRolldownAst(e, t) {
	let { parseAst: n } = await loadRolldownParseAst();
	return n(t, {
		astType: `ts`,
		lang: inferRolldownParserLanguage(e),
		range: !0,
		sourceType: `module`
	}, e);
}
async function buildWithRolldown(e) {
	assertCustomRolldownConditionNames(e);
	let { build: t } = await loadRolldown();
	return await t({
		checks: { bundlerTimings: !1 },
		onLog: onRolldownBuildLog,
		...e,
		plugins: [createPseudoPackagePlugin(), e.plugins],
		experimental: {
			...e.experimental,
			attachDebugInfo: `none`
		}
	});
}
function onRolldownBuildLog(e, t, n) {
	e === `warn` && t.code === `UNRESOLVED_IMPORT` ? n(e, t) : onVendoredDependencyLog(e, t, n);
}
const ROLLDOWN_STANDARD_CONDITION_NAMES = /* @__PURE__ */ new Set([
	`browser`,
	`default`,
	`import`,
	`node`,
	`require`
]);
function assertCustomRolldownConditionNames(e) {
	for (let t of e.resolve?.conditionNames ?? []) if (ROLLDOWN_STANDARD_CONDITION_NAMES.has(t)) throw Error(`Rolldown resolves the standard condition ${JSON.stringify(t)} per import edge; conditionNames may contain only eve-specific additions.`);
}
const MAX_BFS_VISITED_MODULES = 2e3;
const SINGLE_CHUNK_HINT_PREFIX = `Hint: eve bundles authored code into one file with codeSplitting: false, so extra chunks usually come from a dynamic import() edge, a plugin emitting an extra chunk, or a bundler chunk-splitting edge case.`;
async function buildSingleRolldownChunk(e, t) {
	let n = /* @__PURE__ */ new Map();
	let r = t.cwd ?? process.cwd();
	return getSingleRolldownChunk(await buildWithRolldown({
		...t,
		plugins: [t.plugins, createSingleChunkGraphPlugin(n)],
		write: !1,
		output: {
			...t.output,
			codeSplitting: !1
		}
	}), e, r, n);
}
function createSingleChunkGraphPlugin(e) {
	return {
		name: `eve-single-chunk-module-graph`,
		generateBundle: {
			order: `post`,
			handler(t, n) {
				let r = 0;
				for (let e of Object.values(n)) if (e.type === `chunk` && ++r > 1) break;
				if (!(r <= 1)) for (let t of this.getModuleIds()) {
					let n = this.getModuleInfo(t);
					n !== null && e.set(t, {
						importedIds: [...n.importedIds],
						dynamicallyImportedIds: [...n.dynamicallyImportedIds],
						importers: [...n.importers],
						dynamicImporters: [...n.dynamicImporters],
						isEntry: n.isEntry
					});
				}
			}
		}
	};
}
function getSingleRolldownChunk(e, t, n, r) {
	let i = e.output.filter((e) => e.type === `chunk`);
	let a = i[0];
	if (a === void 0) throw Error(`Expected one bundled ${t}, but Rolldown emitted no chunks.`);
	if (i.length !== 1) throw Error(formatMultipleRolldownChunksError(t, i, n, r));
	return a;
}
function resolveRealCwd(e) {
	try {
		return realpathSync(e);
	} catch {
		return e;
	}
}
function formatModuleId(e, t, n) {
	if (e.includes(`\0`)) return e.replaceAll(`\0`, `\\0`);
	if (!isAbsolute(e)) return e;
	let r = relative(t, e);
	let i = n === t ? r : relative(n, e);
	let a = i.length < r.length ? i : r;
	return a.length === 0 ? `.` : a.replaceAll(`\\`, `/`);
}
function formatChunkSummaryLine(e, t, n) {
	let r = e.isEntry ? `entry` : `non-entry`;
	let i;
	if (e.moduleIds.length === 0) i = e.facadeModuleId === null ? `(no modules)` : `(no inlined modules; facade for ${formatModuleId(e.facadeModuleId, t, n)})`;
	else {
		let r = e.moduleIds.slice(0, 8).map((e) => formatModuleId(e, t, n));
		let a = e.moduleIds.length - r.length;
		i = a > 0 ? `${r.join(`, `)}, +${a} more` : r.join(`, `);
	}
	return `  - ${e.fileName} (${r}): ${i}`;
}
function collectEntryModuleIds(e, t, n) {
	let r = /* @__PURE__ */ new Set();
	for (let t of e) t.isEntry && t.facadeModuleId !== null && r.add(t.facadeModuleId);
	for (let [e, t] of n) t.isEntry && r.add(e);
	let i = [...r].filter((e) => !t.has(e));
	return i.length > 0 ? i : [...r];
}
function findShortestEntryParents(e, t) {
	let n = /* @__PURE__ */ new Map();
	let r = /* @__PURE__ */ new Set();
	let i = [];
	for (let t of e) r.has(t) || r.size >= MAX_BFS_VISITED_MODULES || (r.add(t), i.push({
		id: t,
		depth: 0
	}));
	let enqueue = (e, t, a, o) => {
		r.has(t) || r.size >= MAX_BFS_VISITED_MODULES || (r.add(t), n.set(t, {
			from: e,
			kind: a
		}), i.push({
			id: t,
			depth: o
		}));
	};
	for (let e = 0; e < i.length; e += 1) {
		let n = i[e];
		if (n === void 0 || n.depth >= 32) continue;
		let r = t.get(n.id);
		if (r === void 0) continue;
		let a = n.depth + 1;
		for (let e of r.importedIds) enqueue(n.id, e, `static`, a);
		for (let e of r.dynamicallyImportedIds) enqueue(n.id, e, `dynamic`, a);
	}
	return n;
}
function directImporterEdges(e) {
	if (e === void 0) return [];
	let t = [];
	for (let n of new Set(e.importers)) t.push({
		from: n,
		kind: `static`
	});
	for (let n of new Set(e.dynamicImporters)) t.push({
		from: n,
		kind: `dynamic`
	});
	return t;
}
function formatEdgeArrow(e) {
	return e === `dynamic` ? ` --import()--> ` : ` -> `;
}
function formatImporterChain(e, t, n, r, i) {
	let a = [
		formatModuleId(e, r, i),
		formatEdgeArrow(t.kind),
		formatModuleId(t.from, r, i)
	];
	let o = /* @__PURE__ */ new Set([t.from]);
	let s = t.from;
	for (let e = 0; e < 32; e += 1) {
		let e = n.get(s);
		if (e === void 0 || o.has(e.from)) break;
		o.add(e.from), a.push(formatEdgeArrow(e.kind), formatModuleId(e.from, r, i)), s = e.from;
	}
	return a.reverse(), a.join(``);
}
function formatMultipleRolldownChunksError(e, t, n, r) {
	let i = resolveRealCwd(n);
	let a = [`Expected one bundled ${e}, but Rolldown emitted ${t.length} chunks:`];
	for (let e of t.slice(0, 10)) a.push(formatChunkSummaryLine(e, n, i));
	t.length > 10 && a.push(`  - ... +${t.length - 10} more chunks`);
	let o = /* @__PURE__ */ new Set();
	let s = [];
	for (let e of t) if (!e.isEntry) for (let t of e.moduleIds) o.has(t) || (o.add(t), (!t.startsWith(`\0rolldown/`) || r.has(t)) && s.push(t));
	if (s.length > 0) {
		let e = findShortestEntryParents(collectEntryModuleIds(t, o, r), r);
		a.push(`Non-entry chunk module importers:`);
		for (let t of s.slice(0, 10)) {
			a.push(`  - ${formatModuleId(t, n, i)}`);
			let o = directImporterEdges(r.get(t));
			if (o.length === 0) a.push(`    (no recorded importers)`);
			else {
				for (let r of o.slice(0, 5)) a.push(`    ${formatImporterChain(t, r, e, n, i)}`);
				o.length > 5 && a.push(`    ... +${o.length - 5} more importers`);
			}
		}
		s.length > 10 && a.push(`  - ... +${s.length - 10} more non-entry modules`), a.push(`${SINGLE_CHUNK_HINT_PREFIX} Check the non-entry modules and import() edges listed above.`);
	} else a.push(`${SINGLE_CHUNK_HINT_PREFIX} Check the extra entry chunks listed above.`);
	return a.join(`
`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-conditions.js
function authoredModuleConditions(e = process.execArgv, t = process.env.NODE_OPTIONS ?? ``) {
	let { values: n } = parseArgs({
		args: [...splitNodeOptions(t), ...e],
		allowPositionals: !0,
		strict: !1,
		options: { conditions: {
			type: `string`,
			multiple: !0,
			short: `C`
		} }
	});
	return [.../* @__PURE__ */ new Set([`eve-source`, ...n.conditions ?? []])].filter((e) => typeof e == `string` && !ROLLDOWN_STANDARD_CONDITION_NAMES.has(e));
}
function splitNodeOptions(e) {
	let t = [];
	let n = ``;
	let r = !1;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		a === `\\` && r && i + 1 < e.length ? n += e[++i] : a === `"` ? r = !r : /\s/.test(a) && !r ? (n.length > 0 && t.push(n), n = ``) : n += a;
	}
	return n.length > 0 && t.push(n), t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-build-options.js
function createAuthoredModuleBuildOptions(e) {
	return {
		cwd: e.packageRoot,
		platform: `node`,
		plugins: [
			...e.plugins,
			...createAuthoredPlugins({ packageRoot: e.packageRoot }),
			createNodeEsmCompatBannerPlugin(),
			e.packageBoundaryPlugin
		],
		resolve: {
			conditionNames: authoredModuleConditions(),
			extensions: [...RESOLVE_EXTENSIONS]
		},
		tsconfig: resolveAuthoredTsConfigPath(e.packageRoot)
	};
}
function evaluatedBundleSourcemap() {
	return process.sourceMapsEnabled ? `inline` : !1;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/extension-mount-plugin.js
const MOUNT_QUERY = `?eve-mount=`;
function canonicalize$1(e) {
	try {
		return realpathSync(e);
	} catch {
		return resolve(e);
	}
}
function within(e, t) {
	return e === t || e.startsWith(`${t}${sep}`);
}
function isExtensionModule(e, t) {
	return within(e, t) || within(e, join(dirname(t), `_chunks`));
}
function createExtensionMountPlugin(e, t = /* @__PURE__ */ new Map()) {
	if (e.length === 0) return null;
	let n = /* @__PURE__ */ new Map();
	let canonical = (e) => {
		let t = n.get(e);
		return t === void 0 && (t = canonicalize$1(e), n.set(e, t)), t;
	};
	let r = e.map((e) => ({
		...e,
		root: canonical(e.sourceRoot)
	}));
	let i = /* @__PURE__ */ new Map();
	for (let e of r) {
		if (e.mountSourcePath === void 0) continue;
		let t = canonical(resolve(e.mountSourcePath));
		i.set(t, [...i.get(t) ?? [], e]);
	}
	let a = new Map(r.map((e) => [e.mountId, e]));
	let o = new Map([...t].map(([e, t]) => [canonical(e), a.get(t)]));
	return {
		name: `eve-extension-mount`,
		async resolveId(e, t) {
			if (e === `eve/context`) return;
			let n = e.indexOf(MOUNT_QUERY);
			let s = n >= 0 ? decodeURIComponent(e.slice(n + 11)) : void 0;
			let c = t?.indexOf(MOUNT_QUERY) ?? -1;
			let l = c >= 0 ? decodeURIComponent(t.slice(c + 11)) : void 0;
			let u = n >= 0 ? e.slice(0, n) : e;
			let d = c >= 0 ? t.slice(0, c) : t;
			let f = d === void 0 ? void 0 : canonical(d);
			let p = f === void 0 ? [] : i.get(f) ?? [];
			let m = p.length === 1 ? p[0] : p.find((e) => l !== void 0 && e.mountId.startsWith(`${l}/`));
			let h = m !== void 0 && (u === m.specifier || u === m.programmaticImport?.specifier) ? m : void 0;
			let g = f === void 0 ? void 0 : o.get(f);
			let _ = s ?? h?.mountId ?? l ?? m?.mountId ?? g?.mountId;
			let v = _ === void 0 ? void 0 : a.get(_);
			if (_ !== void 0 && v === void 0) throw Error(`Unknown extension mount "${_}".`);
			let y = v !== void 0 && f !== void 0 && !isExtensionModule(f, v.root) && o.get(f) === v;
			let b = v !== void 0 && (u === v.specifier || u === v.programmaticImport?.specifier) ? v : void 0;
			let x = await this.resolve(b?.programmaticImport?.entryPath ?? u, d, {
				skipSelf: !0,
				kind: `import-statement`
			});
			if (x === null || x.id.startsWith(`\0`)) return x;
			if (x.external) {
				if (b === void 0) return x;
				throw Error(`Extension export "${u}" for mount "${_}" was externalized; it must be bundled to isolate its configuration.`);
			}
			if (!/\.(?:[cm]?[jt]sx?|json)$/.test(x.id)) return x;
			let S = canonical(x.id);
			if (v !== void 0 && (b !== void 0 || !y && isExtensionModule(S, v.root))) return { id: `${x.id}${MOUNT_QUERY}${encodeURIComponent(_)}` };
			if (y) return x;
			if (v === void 0 && (t === void 0 || t.startsWith(`\0`))) return;
			let C = r.filter((e) => isExtensionModule(S, e.root));
			if (v !== void 0) {
				let e = C.filter((e) => v.mountId.startsWith(`${e.mountId}/`)).sort((e, t) => t.mountId.length - e.mountId.length)[0] ?? (C.length === 1 ? C[0] : void 0);
				return e === void 0 ? x : { id: `${x.id}${MOUNT_QUERY}${encodeURIComponent(e.mountId)}` };
			}
			let w = C.filter((e) => !r.some((t) => e.mountId.startsWith(`${t.mountId}/`)));
			let T = w.length > 0 ? w : C;
			if (T.length > 1) throw Error(`Import "${e}" from "${t}" refers to multiple extension mounts (${T.map((e) => e.mountId).join(`, `)}). Import it from an owned mount or contribution instead.`);
			return T.length === 1 ? { id: `${x.id}${MOUNT_QUERY}${encodeURIComponent(T[0].mountId)}` } : void 0;
		},
		load: {
			filter: { id: new RegExp(escapeRegex(MOUNT_QUERY)) },
			handler(e) {
				let t = e.indexOf(MOUNT_QUERY);
				if (t < 0) return;
				let n = e.slice(0, t);
				if (!/\.(?:[cm]?[jt]sx?|json)$/.test(n)) return;
				let r = n.slice(n.lastIndexOf(`.`) + 1);
				let i = r === `json` ? `json` : r === `tsx` ? `tsx` : r === `jsx` ? `jsx` : [
					`ts`,
					`mts`,
					`cts`
				].includes(r) ? `ts` : `js`;
				return {
					code: readFileSync(n, `utf8`),
					moduleType: i
				};
			}
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-bundle.js
function createAuthoredModuleBundleError(e, t) {
	let n = t instanceof Error ? t.message : String(t);
	let r = [];
	return (/\.node(?:\b|["'?])/i.test(n) || /native addon|native module|invalid utf-?8|Could not load .*\.node/i.test(n)) && r.push(`If this comes from a native Node package, keep that package external with agent build.externalDependencies so Vercel/Nitro traces it instead of bundling it.`), /Unexpected character|No loader is configured|Could not load|Unknown file extension/i.test(n) && r.push(`If this comes from an asset import, eve only supports assets that Rolldown can emit for a Node ESM bundle; otherwise load the file through fs/import.meta.url or externalize the package.`), Error([
		`Failed to bundle authored module "${e}".`,
		n,
		...r.map((e) => `Hint: ${e}`)
	].join(`
`));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-evaluation-error.js
function createAuthoredModuleEvaluationError(e, t) {
	let n = describeInstalledPackageLoadFailure(t);
	return Error([
		`Failed to evaluate authored module:`,
		`  ${e}`,
		...n === void 0 ? [] : [``, n]
	].join(`
`), { cause: t });
}
function describeInstalledPackageLoadFailure(e) {
	if (!(e instanceof Error)) return;
	let t = e;
	if (t.code !== `ERR_MODULE_NOT_FOUND` || typeof t.url != `string`) return;
	let n = filePathFromUrl(t.url);
	if (n === void 0 || extname(n) !== ``) return;
	let r = findInstalledPackage(n);
	if (r === void 0) return;
	let i = toPackageRelativePath(r.root, n);
	return findExistingModulePath(n) === void 0 ? [
		`Failed to load an installed package:`,
		`  Package: ${r.name} (loaded outside the authored bundle)`,
		`  Missing: ${i}`,
		`  Reason: Package output may be incomplete, incorrectly installed, or incompatible with a standalone Node runtime.`,
		`  Hint: Verify the installed package version and output, use a Node-compatible entrypoint, or report the missing module to the package publisher.`
	].join(`
`) : [
		`Failed to load an installed package:`,
		`  Package: ${r.name} (loaded outside the authored bundle)`,
		`  Import: ${i}`,
		`  Reason: Node's ESM loader does not infer file extensions for relative imports.`,
		`  Hint: Use a Node-compatible package or entrypoint, or report the extensionless import to the package publisher.`
	].join(`
`);
}
function findExistingModulePath(e) {
	for (let t of [
		`.js`,
		`.mjs`,
		`.cjs`
	]) {
		let n = `${e}${t}`;
		try {
			if (statSync(n).isFile()) return n;
		} catch {}
	}
}
function toPackageRelativePath(e, t) {
	return relative(e, t).replaceAll(`\\`, `/`);
}
function filePathFromUrl(e) {
	try {
		let t = new URL(e);
		return t.protocol === `file:` ? fileURLToPath(t) : void 0;
	} catch {
		return;
	}
}
function findInstalledPackage(e) {
	let t = dirname(resolve(e));
	for (;;) {
		let e = join(t, `package.json`);
		if (existsSync(e) && isNodeModulesPath(e)) try {
			let n = JSON.parse(readFileSync(e, `utf8`));
			if (typeof n.name == `string` && n.name.length > 0) return {
				name: n.name,
				root: t
			};
		} catch {
			return;
		}
		let n = dirname(t);
		if (n === t) return;
		t = n;
	}
}
function isNodeModulesPath(e) {
	return e.replaceAll(`\\`, `/`).includes(`/node_modules/`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/bundler/extension-scope-plugin.js
const VIRTUAL_PREFIX = `\0eve-ext-scope:`;
function canonicalize(e) {
	try {
		return realpathSync(e);
	} catch {
		return resolve(e);
	}
}
function importerPath(e) {
	let t = e.indexOf(`?`);
	return canonicalize(t === -1 ? e : e.slice(0, t));
}
function shimSource(e) {
	return [
		`import { defineMountedState } from "eve/internal/mount-state";`,
		`export function defineState(name, initial) {`,
		`  return defineMountedState(${JSON.stringify(e)}, name, initial);`,
		`}`,
		``
	].join(`
`);
}
function scopeHooks(e, t) {
	return {
		name: e,
		resolveId: {
			filter: { id: exactRegex(`eve/context`) },
			handler(e, n) {
				if (e !== `eve/context` || n === void 0 || n.startsWith(`\0`)) return;
				let r = t(n);
				if (r !== void 0) return `${VIRTUAL_PREFIX}context:${encodeURIComponent(r)}`;
			}
		},
		load: {
			filter: { id: prefixRegex(VIRTUAL_PREFIX) },
			handler(e) {
				if (!e.startsWith(VIRTUAL_PREFIX)) return;
				let t = e.slice(15);
				let n = t.indexOf(`:`);
				return t.slice(0, n) === `context` ? {
					code: shimSource(decodeURIComponent(t.slice(n + 1))),
					moduleType: `js`
				} : void 0;
			}
		}
	};
}
function createExtensionScopePlugin(e) {
	if (e.length === 0) return null;
	let t = e.map((e) => ({
		root: canonicalize(e.sourceRoot),
		mountId: e.mountId
	}));
	return scopeHooks(`eve-extension-scope`, (e) => {
		let n = e.indexOf(`?eve-mount=`);
		if (n >= 0) {
			let r = decodeURIComponent(e.slice(n + 11));
			let i = t.find((e) => e.mountId === r);
			if (i === void 0) throw Error(`Unknown extension mount "${r}".`);
			return isExtensionModule(importerPath(e), i.root) ? i.mountId : void 0;
		}
		let r = importerPath(e);
		let i = t.filter((e) => isExtensionModule(r, e.root));
		if (i.length !== 0) {
			if (i.length > 1) throw Error(`Ambiguous extension scope for "${r}".`);
			return i[0].mountId;
		}
	});
}
function createFixedMountScopePlugin(e) {
	return scopeHooks(`eve-extension-scope-fixed`, () => e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow-bundle/workflow-directive-ast.js
function mayContainWorkflowDirective(e) {
	return e.includes(`use step`) || e.includes(`use workflow`) || e.includes(`\\`);
}
function readWorkflowDirective(e) {
	let t = e?.expression;
	let n = e?.directive ?? (e?.type === `ExpressionStatement` && t?.type === `Literal` ? t.value : void 0);
	return n === `use step` || n === `use workflow` ? n : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow-bundle/workflow-source-ast.js
const MAX_CACHED_SOURCE_LENGTH = 1048576;
const cache = /* @__PURE__ */ new Map();
let cachedSourceLength = 0;
async function parseWorkflowSourceAst(e, t) {
	let n = `${inferRolldownParserLanguage(e)}\0${t}`;
	if (cache.has(n)) {
		let e = cache.get(n);
		return cache.delete(n), cache.set(n, e), e;
	}
	let r = await parseWithRolldownAst(e, t);
	if (n.length > MAX_CACHED_SOURCE_LENGTH || cache.has(n)) return r;
	cache.set(n, r), cachedSourceLength += n.length;
	for (let e of cache.keys()) {
		if (cachedSourceLength <= MAX_CACHED_SOURCE_LENGTH) break;
		cache.delete(e), cachedSourceLength -= e.length;
	}
	return r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow-bundle/authored-workflow-directives.js
function formatEntryPointMethods() {
	return new Intl.ListFormat(`en`, { type: `disjunction` }).format(WORKFLOW_TOOL_ENTRY_POINTS.map((e) => `"${e}"`));
}
const REMOVED_WORKFLOW_HELPERS = /* @__PURE__ */ new Set([`agent`, `ask`]);
async function prepareAuthoredWorkflowDirectives(e) {
	if (!mayContainWorkflowDirective(e.source) && !e.source.includes(`workflow`) && !e.source.includes(`defineWorkflowTool`)) return {
		hasDirectives: !1,
		hasWorkflowDirective: !1,
		source: e.source
	};
	let n = await parseWorkflowSourceAst(/\.[cm]?js$/.test(e.filePath) ? `${e.filePath}.jsx` : e.filePath, e.source);
	let r = n.body ?? [];
	visit(n, (t) => {
		let n = t.source?.value ?? (t.type === `CallExpression` && t.callee?.name === `require` ? t.arguments?.[0]?.value : void 0);
		if (n === `eve/workflow`) {
			let n = t.specifiers?.find(isRemovedWorkflowHelper);
			if (n !== void 0) throw Error(`${e.filePath}: "${specifierName(n)}" is no longer exported from "eve/workflow". Use defineWorkflowTool() from "eve/tools" and call ctx.agent(target, input) or ctx.ask(request) in its executor.`);
		}
		if (typeof n == `string` && (n === `workflow` || n.startsWith(`workflow/`))) throw Error(`${e.filePath}: Import from \`eve/workflow\` (or \`eve/workflow/api\`) instead of "${n}". Only documented exports are supported; other Workflow SDK subpaths and exports are not public eve APIs.`);
	});
	for (let t of r) {
		if (typeof t.directive != `string`) break;
		let n = readWorkflowDirective(t);
		if (n !== void 0) throw Error(`${JSON.stringify(n)} in "${e.filePath}" is a module-level directive. Put it as the first statement of the function it marks: a top-level "async function" declaration or the ${formatEntryPointMethods()} method of a default-exported defineWorkflowTool().`);
	}
	let i = /* @__PURE__ */ new Set();
	for (let e of r) {
		let t = e.type === `FunctionDeclaration` ? e : e.type === `ExportNamedDeclaration` && e.declaration?.type === `FunctionDeclaration` ? e.declaration : void 0;
		t !== void 0 && i.add(t);
	}
	let a = workflowToolDefiners(r);
	let o = [...findDefaultExportEntryPoints(r), ...findTopLevelToolEntryPoints(r, a)];
	for (let e of o) i.add(e.fn);
	assertWorkflowToolEntryPoints(e.filePath, r, n, a);
	let s = collectDirectiveFunctions(n);
	if (s.length === 0) return {
		hasDirectives: !1,
		hasWorkflowDirective: !1,
		source: e.source
	};
	let c = s.some((e) => e.directive === `use workflow`);
	for (let t of s) {
		if (!i.has(t.fn)) {
			let r = nestedToolEntryPoint(n, a, t.fn);
			throw Error(r === void 0 ? `${JSON.stringify(t.directive)} in "${e.filePath}" marks ${describeFunction(t.fn)}. Workflow directives must mark a top-level "async function" declaration or the ${formatEntryPointMethods()} method of a defineWorkflowTool() that is the default export or a top-level const.` : `${JSON.stringify(t.directive)} in "${e.filePath}" marks the "${r}" of a defineWorkflowTool() that isn't declared at the top level of the module, such as one created inside defineDynamic(). A workflow can't read the variables around it, so eve can only compile it at the top level: assign the defineWorkflowTool() to a top-level const, and return that const from defineDynamic().`);
		}
		if (t.fn.async !== !0) throw Error(`${JSON.stringify(t.directive)} in "${e.filePath}" marks ${describeFunction(t.fn)}, which is not async. Declare it with "async function".`);
		let r = o.find((e) => e.fn === t.fn);
		if (r !== void 0 && t.directive !== `use workflow`) throw Error(`"use step" in "${e.filePath}" marks ${r.owner}'s "${r.name}" method. A tool's "${r.name}" can be a workflow ("use workflow"); steps are the helper functions it calls.`);
	}
	let l = o.filter((e) => s.some((t) => t.fn === e.fn));
	if (l.length === 0) return {
		hasDirectives: !0,
		hasWorkflowDirective: c,
		source: e.source
	};
	for (let t of l) if (declaresTopLevelBinding(r, t.hoistedName)) throw Error(`"use workflow" in "${e.filePath}" marks the "${t.name}" method, but the module also declares a top-level "${t.hoistedName}" binding. eve hoists that method to a top-level "async function ${t.hoistedName}"; rename the existing binding.`);
	return {
		hasDirectives: !0,
		hasWorkflowDirective: c,
		source: hoistEntryPointMethods(e.source, l)
	};
}
function assertWorkflowToolEntryPoints(e, t, n, r) {
	if (r.names.size === 0 && r.namespaces.size === 0) return;
	let i = t.find((e) => e.type === `ExportDefaultDeclaration`);
	visit(n, (n) => {
		if (n.type !== `CallExpression` || n === i?.declaration || !isWorkflowToolDefiner(n.callee, r)) return;
		let a = n.arguments?.[0];
		if (a?.type === `ObjectExpression`) for (let n of a.properties ?? []) {
			if (n.type !== `Property` || n.computed === !0) continue;
			let r = readPropertyName(n.key);
			if (r === void 0 || !WORKFLOW_TOOL_ENTRY_POINTS.some((e) => e === r)) continue;
			let i = unwrapExpression(n.value);
			let a = localFunction(t, i);
			if (a === void 0) continue;
			let o = readLeadingDirective(a);
			if (!(o === `use workflow` || o !== void 0 && a === i)) throw Error(`The "${r}" of a defineWorkflowTool() in "${e}" is ${a.type === `FunctionDeclaration` ? `the function "${a.id?.name}"` : describeFunction(a)} without "use workflow", so it can't run as a workflow. Declare it as a top-level "async function" that starts with "use workflow", and pass that function as "${r}".`);
		}
	});
}
function workflowToolDefiners(e) {
	let t = /* @__PURE__ */ new Set();
	let n = /* @__PURE__ */ new Set();
	for (let r of e) {
		if (r.type !== `ImportDeclaration`) continue;
		let e = r.source?.value;
		if (e === `eve` || e === `eve/tools`) for (let e of r.specifiers ?? []) {
			let r = e.local?.name;
			r !== void 0 && (e.type === `ImportNamespaceSpecifier` && n.add(r), e.type === `ImportSpecifier` && specifierName(e) === `defineWorkflowTool` && t.add(r));
		}
	}
	return {
		names: t,
		namespaces: n
	};
}
function isWorkflowToolDefiner(e, t) {
	return e?.type === `Identifier` ? t.names.has(e.name ?? ``) : e?.type !== `MemberExpression` || e.computed === !0 ? !1 : e.object?.type === `Identifier` && t.namespaces.has(e.object.name ?? ``) && readPropertyName(e.property) === `defineWorkflowTool`;
}
function localFunction(e, t) {
	if (t !== void 0) {
		if (isFunctionLike(t)) return t;
		if (t.type === `Identifier`) for (let n of e) {
			let e = n.type === `ExportNamedDeclaration` ? n.declaration : n;
			if (e != null) {
				if (e.type === `FunctionDeclaration` && e.id?.name === t.name) return e;
				if (e.type === `VariableDeclaration`) for (let n of e.declarations ?? []) {
					if (n.id?.name !== t.name) continue;
					let e = unwrapExpression(n.init);
					return e !== void 0 && isFunctionLike(e) ? e : void 0;
				}
			}
		}
	}
}
function unwrapExpression(e) {
	let t = isAstNode$1(e) ? e : void 0;
	for (; t !== void 0 && (t.type === `TSAsExpression` || t.type === `TSSatisfiesExpression` || t.type === `TSNonNullExpression` || t.type === `ParenthesizedExpression`);) t = isAstNode$1(t.expression) ? t.expression : void 0;
	return t;
}
function findDefaultExportEntryPoints(e) {
	let t = e.find((e) => e.type === `ExportDefaultDeclaration`)?.declaration;
	return inlineEntryPoints((t?.type === `CallExpression` ? t.arguments?.[0] : t) ?? void 0, `the default export`, (e) => e);
}
function findTopLevelToolEntryPoints(e, t) {
	let n = [];
	for (let r of e) {
		let e = r.type === `ExportNamedDeclaration` ? r.declaration : r;
		if (e?.type === `VariableDeclaration` && e.kind === `const`) for (let r of e.declarations ?? []) {
			let e = r.id?.type === `Identifier` ? r.id.name : void 0;
			let i = unwrapExpression(r.init);
			e !== void 0 && i?.type === `CallExpression` && isWorkflowToolDefiner(i.callee, t) && n.push(...inlineEntryPoints(i.arguments?.[0], `"${e}"`, (t) => `${e}$${t}`));
		}
	}
	return n;
}
function inlineEntryPoints(e, t, n) {
	if (e?.type !== `ObjectExpression`) return [];
	let r = [];
	for (let i of e.properties ?? []) {
		if (i.type !== `Property` || i.kind !== `init` || i.computed === !0) continue;
		let e = readPropertyName(i.key);
		let a = i.value;
		e !== void 0 && WORKFLOW_TOOL_ENTRY_POINTS.some((t) => t === e) && isAstNode$1(a) && isFunctionLike(a) && r.push({
			fn: a,
			hoistedName: n(e),
			name: e,
			owner: t,
			property: i
		});
	}
	return r;
}
function nestedToolEntryPoint(e, t, n) {
	let r;
	return visit(e, (e) => {
		if (r !== void 0 || e.type !== `CallExpression` || !isWorkflowToolDefiner(e.callee, t)) return;
		let i = e.arguments?.[0];
		if (i?.type === `ObjectExpression`) for (let e of i.properties ?? []) e.type === `Property` && e.value === n && (r = readPropertyName(e.key));
	}), r;
}
function hoistEntryPointMethods(e, t) {
	let n = [...t].sort((e, t) => (t.property.start ?? 0) - (e.property.start ?? 0));
	let r = e;
	let i = [];
	for (let e of n) {
		let t = hoistEntryPointMethod(r, e);
		r = t.source, i.unshift(t.declaration);
	}
	return `${r}${i.map((e) => `\n${e}\n`).join(``)}`;
}
function hoistEntryPointMethod(e, t) {
	let { fn: n, hoistedName: r, name: i, property: a } = t;
	if (a.start === void 0 || a.end === void 0 || !isAstNode$1(n.body) || n.body.start === void 0 || n.body.end === void 0) throw Error(`Cannot hoist a "${i}" method without source ranges.`);
	let o = n.params ?? [];
	let s = o[0];
	let c = o[o.length - 1];
	let l = s?.start === void 0 || c?.end === void 0 ? `` : e.slice(s.start, c.end);
	let u = sliceNode(e, n.typeParameters);
	let d = sliceNode(e, n.returnType);
	let f = e.slice(n.body.start, n.body.end);
	let p = `async function${n.generator === !0 ? `*` : ``} ${r}${u}(${l})${d} ${f}`;
	let m = r === i ? i : `${i}: ${r}`;
	return {
		declaration: p,
		source: `${e.slice(0, a.start)}${m}${e.slice(a.end)}`
	};
}
function sliceNode(e, t) {
	return t == null || t.start === void 0 || t.end === void 0 ? `` : e.slice(t.start, t.end);
}
function declaresTopLevelBinding(e, t) {
	for (let n of e) {
		let e = n.type === `ExportNamedDeclaration` ? n.declaration : n;
		if (e != null) {
			if ((e.type === `FunctionDeclaration` || e.type === `ClassDeclaration`) && e.id?.name === t) return !0;
			if (e.type === `VariableDeclaration`) {
				for (let n of e.declarations ?? []) if (n.id?.name === t) return !0;
			}
			if (e.type === `ImportDeclaration`) {
				for (let n of e.specifiers ?? []) if (n.local?.name === t) return !0;
			}
		}
	}
	return !1;
}
function collectDirectiveFunctions(e) {
	let t = [];
	return visit(e, (e) => {
		if (!isFunctionLike(e)) return;
		let n = readLeadingDirective(e);
		n !== void 0 && t.push({
			directive: n,
			fn: e
		});
	}), t;
}
function readLeadingDirective(e) {
	if (isAstNode$1(e.body) && e.body.type === `BlockStatement` && Array.isArray(e.body.body)) return readWorkflowDirective(e.body.body[0]);
}
function describeFunction(e) {
	return e.type === `FunctionDeclaration` ? e.id?.name === void 0 ? `a nested function declaration` : `the nested function "${e.id.name}"` : e.type === `ArrowFunctionExpression` ? `an arrow function` : e.id?.name === void 0 ? `a function expression` : `the function "${e.id.name}"`;
}
function readPropertyName(e) {
	if (e != null) {
		if (e.type === `Identifier`) return e.name;
		if (e.type === `Literal` && typeof e.value == `string`) return e.value;
	}
}
function isFunctionLike(e) {
	return e.type === `FunctionDeclaration` || e.type === `FunctionExpression` || e.type === `ArrowFunctionExpression`;
}
function specifierName(e) {
	let t = e.type === `ImportSpecifier` ? e.imported : e.local;
	return t?.name ?? t?.value;
}
function isRemovedWorkflowHelper(e) {
	if (e.type !== `ImportSpecifier` && e.type !== `ExportSpecifier`) return !1;
	let t = specifierName(e);
	return typeof t == `string` && REMOVED_WORKFLOW_HELPERS.has(t);
}
function visit(e, t) {
	if (!e.type?.startsWith(`TS`)) {
		t(e);
		for (let n of Object.values(e)) if (Array.isArray(n)) for (let e of n) isAstNode$1(e) && visit(e, t);
		else isAstNode$1(n) && visit(n, t);
	}
}
function isAstNode$1(e) {
	return typeof e == `object` && !!e && typeof e.type == `string`;
}
const agentToolServeWorkflowReference = { workflowId: `workflow//eve//agentToolServeWorkflow` };
function workflowIdForHandling(e) {
	if (e?.kind === `dispatch`) switch (e.target.kind) {
		case `workflow-tool-call`: return e.target.workflowId;
		case `remote-agent-call`:
		case `self-agent-call`:
		case `subagent-call`: return agentToolServeWorkflowReference.workflowId;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow-bundle/workflow-transformer.js
const BUILTIN_STEP_NAMES = /* @__PURE__ */ new Set([
	`__builtin_response_array_buffer`,
	`__builtin_response_json`,
	`__builtin_response_text`,
	`__builtin_set_attributes`
]);
async function transformWorkflowDirectives(e) {
	if (e.mode === !1 || !mayContainWorkflowDirective(e.source)) return {
		code: e.source,
		workflowManifest: {}
	};
	let t = await parseWorkflowSource(e.filename, e.source);
	let n = findDirectiveFunctions(t);
	let r = e.authorizeSteps === !0;
	let i = r && n.some((e) => e.directive === `use step` && !BUILTIN_STEP_NAMES.has(e.name));
	if (n.length === 0) return {
		code: e.source,
		workflowManifest: {}
	};
	let a = e.moduleSpecifier ?? `./${stripJavaScriptExtension(e.filename)}`;
	let o = e.stableModuleSpecifier ?? a;
	let s = {};
	let c = [];
	let l = [];
	let u = !1;
	let d = e.authored ? `eve/internal/workflow-step-execution` : `#execution/tools/workflow/step-execution.js`;
	for (let t of n) {
		if (t.directive === `use step`) {
			let n = createStepId(a, t.name);
			s.steps ??= {};
			let i = s.steps[e.filename] ??= {};
			i[t.name] = { stepId: n };
			let o = authorizationTwinId(a, t.name, r);
			if (o !== void 0 && (i[`${t.name}${AUTHORIZATION_STEP_SUFFIX}`] = { stepId: o }), e.mode === `workflow`) {
				let e = t.exportPrefix.length > 0 ? `export ` : ``;
				c.push({
					end: t.rangeEnd,
					start: t.rangeStart,
					text: `${e}var ${t.name} = ${createStepProxy(a, t.name, r)};`
				});
			} else if (e.mode === `metadata`) continue;
			else if (c.push({
				end: t.directiveEnd,
				start: t.directiveStart,
				text: ``
			}), e.mode === `step`) {
				u = !0;
				let e = o === void 0 ? t.name : `withWorkflowStepScope(${t.name})`;
				l.push(`registerStepFunction(${JSON.stringify(n)}, ${e});`), o !== void 0 && l.push(`registerStepFunction(${JSON.stringify(o)}, withWorkflowStepAuthorization(${t.name}));`);
			} else l.push(`${t.name}.stepId = ${JSON.stringify(n)};`);
			continue;
		}
		let n = createWorkflowId(e.stableWorkflowNames?.has(t.name) === !0 ? o : a, t.name);
		s.workflows ??= {};
		let i = s.workflows[e.filename] ??= {};
		i[t.name] = { workflowId: n }, e.mode === `workflow` ? (c.push({
			end: t.directiveEnd,
			start: t.directiveStart,
			text: ``
		}), l.push(`${t.name}.workflowId = ${JSON.stringify(n)};`), l.push(`globalThis.__private_workflows.set(${JSON.stringify(n)}, ${t.name});`)) : (e.mode === `metadata` || c.push({
			end: t.directiveEnd,
			start: t.directiveStart,
			text: `throw new Error(${JSON.stringify(`You attempted to execute workflow ${t.name} function directly. To start a workflow, use start(${t.name}) from eve/workflow/api`)});`
		}), l.push(`${t.name}.workflowId = ${JSON.stringify(n)};`));
	}
	let f = `/**__internal_workflows${JSON.stringify(s)}*/;`;
	let p = [];
	u && p.push(`import { registerStepFunction } from "workflow/internal/private";`), i && e.mode === `workflow` ? p.push(`import { workflowToolStep } from ${JSON.stringify(`#execution/tools/workflow/step.js`)};`) : i && u && p.push(`import { withWorkflowStepAuthorization, withWorkflowStepScope } from ${JSON.stringify(d)};`);
	let m = [...p, f].join(`
`);
	let h = n.some((e) => e.directive === `use workflow`);
	if (e.mode === `workflow` && !h && e.authored !== !0) return {
		code: `${m}\n${createWorkflowStepProxySource(e.source, t, n, a, r)}`,
		workflowManifest: s
	};
	e.mode === `workflow` && e.authored === !0 && c.push(...removeEveDefinerDefaultExport(t));
	let g = applySourceReplacements(e.source, c);
	return {
		code: `${m}\n${e.mode === `workflow` ? await stripUnusedValueImports(e.filename, g) : g}${l.length > 0 ? `\n${l.join(`
`)}\n` : ``}`,
		workflowManifest: s
	};
}
async function parseWorkflowSource(e, t) {
	return await parseWorkflowSourceAst(e, t);
}
function createWorkflowStepProxySource(e, t, n, r, i) {
	let a = findExportedLiteralValueDeclarations(e, t);
	let o = n.filter((e) => e.directive === `use step`).map((e) => `${e.exported ? `export ` : ``}var ${e.name} = ${createStepProxy(r, e.name, i)};`);
	let s = [...a, ...o];
	return s.length > 0 ? `${s.join(`
`)}\n` : ``;
}
const AUTHORIZATION_STEP_SUFFIX = `:eve-authorization`;
function authorizationTwinId(e, t, n) {
	if (n && !BUILTIN_STEP_NAMES.has(t)) return createStepId(e, `${t}${AUTHORIZATION_STEP_SUFFIX}`);
}
function createStepProxy(e, t, n) {
	let useStep = (e) => `globalThis[Symbol.for("WORKFLOW_USE_STEP")](${JSON.stringify(e)})`;
	let r = useStep(createStepId(e, t));
	let i = authorizationTwinId(e, t, n);
	return i === void 0 ? r : `workflowToolStep(${r}, ${useStep(i)})`;
}
function findDirectiveFunctions(e) {
	let t = [];
	let n = collectLocalNamesReExportedAtModuleLevel(e);
	for (let r of e.body ?? []) {
		let e = readTopLevelFunctionDeclaration(r);
		if (e === null) continue;
		let i = e.fn;
		let a = i.id?.name;
		let o = readBlockStatements(i.body);
		if (i.async !== !0 || a === void 0 || o === void 0) continue;
		let s = readFunctionDirective(o[0]);
		s !== null && t.push({
			directive: s.value,
			directiveEnd: s.end,
			directiveStart: s.start,
			exportPrefix: e.exported ? `export ` : ``,
			exported: e.exported || n.has(a),
			name: a,
			rangeEnd: e.end,
			rangeStart: e.start
		});
	}
	return t;
}
function collectLocalNamesReExportedAtModuleLevel(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.body ?? []) if (n.type === `ExportNamedDeclaration` && (n.source === void 0 || n.source === null) && (n.declaration === void 0 || n.declaration === null)) for (let e of n.specifiers ?? []) {
		let n = e.local?.name;
		n !== void 0 && t.add(n);
	}
	return t;
}
function readTopLevelFunctionDeclaration(e) {
	return e.type === `FunctionDeclaration` ? readFunctionDeclarationRange(e, !1, e) : e.type !== `ExportNamedDeclaration` || e.declaration?.type !== `FunctionDeclaration` ? null : readFunctionDeclarationRange(e.declaration, !0, e);
}
function readFunctionDeclarationRange(e, t, n) {
	return e.start === void 0 || e.end === void 0 || n.start === void 0 || n.end === void 0 ? null : {
		end: n.end,
		exported: t,
		fn: e,
		start: n.start
	};
}
function readBlockStatements(e) {
	return e === void 0 || isAstNodeList(e) ? e : e.body;
}
function isAstNodeList(e) {
	return Array.isArray(e);
}
function readFunctionDirective(e) {
	let t = readWorkflowDirective(e);
	return t === void 0 || e?.start === void 0 || e.end === void 0 ? null : {
		end: e.end,
		start: e.start,
		value: t
	};
}
function applySourceReplacements(e, t) {
	let n = ``;
	let r = 0;
	for (let i of [...t].sort((e, t) => e.start - t.start)) n += e.slice(r, i.start), n += i.text, r = i.end;
	return n + e.slice(r);
}
function removeEveDefinerDefaultExport(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.body ?? []) {
		if (n.type !== `ImportDeclaration` || n.importKind === `type`) continue;
		let e = n.source?.value;
		if (typeof e == `string` && /^eve(?:\/|$)/.test(e)) for (let e of n.specifiers ?? []) {
			if (e.importKind === `type`) continue;
			let n = e.local?.name;
			n !== void 0 && t.add(n);
		}
	}
	let n = [];
	for (let r of e.body ?? []) {
		if (r.type !== `ExportDefaultDeclaration` || r.start === void 0) continue;
		let e = r.declaration;
		if (e?.type !== `CallExpression` || r.end === void 0) continue;
		let i = e.callee;
		let a = i?.type === `MemberExpression` ? i.object : i;
		a?.type === `Identifier` && t.has(a.name ?? ``) && n.push({
			end: r.end,
			start: r.start,
			text: ``
		});
	}
	return n;
}
async function stripUnusedValueImports(e, t) {
	let n = await parseWorkflowSource(e, t);
	let r = collectReferencedIdentifiers(n);
	let i = [];
	for (let e of n.body ?? []) {
		if (e.type !== `ImportDeclaration` || e.start === void 0 || e.end === void 0) continue;
		let n = readValueImportBindings(e);
		n.length > 0 && n.every((e) => !r.has(e)) && i.push({
			end: extendRemovalEnd(t, e.end),
			start: e.start,
			text: ``
		});
	}
	return i.length > 0 ? applySourceReplacements(t, i) : t;
}
function findExportedLiteralValueDeclarations(e, t) {
	let n = [];
	let r = collectLocalReExportAliases(t);
	for (let i of t.body ?? []) if (i.type === `ExportNamedDeclaration` && i.declaration?.type === `VariableDeclaration` && i.declaration.kind === `const` && i.start !== void 0 && i.end !== void 0 && (i.declaration.declarations ?? []).every(isLiteralValueDeclarator)) n.push(e.slice(i.start, i.end).trim());
	else if (i.type === `VariableDeclaration` && (i.kind === `const` || i.kind === `var` || i.kind === `let`)) for (let t of i.declarations ?? []) {
		if (!isLiteralValueDeclarator(t) || t.start === void 0 || t.end === void 0) continue;
		let a = t.id?.name;
		if (a === void 0) continue;
		let o = r.get(a);
		if (o === void 0 || o.length === 0) continue;
		let s = e.slice(t.start, t.end).trim();
		let c = o.map((e) => e === a ? a : `${a} as ${e}`);
		n.push(`${i.kind} ${s};\nexport { ${c.join(`, `)} };`);
	}
	return n;
}
function collectLocalReExportAliases(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.body ?? []) if (n.type === `ExportNamedDeclaration` && (n.source === void 0 || n.source === null) && (n.declaration === void 0 || n.declaration === null)) for (let e of n.specifiers ?? []) {
		let n = e.local?.name;
		let r = e.exported?.name ?? n;
		if (n !== void 0 && r !== void 0) {
			let e = t.get(n) ?? [];
			e.push(r), t.set(n, e);
		}
	}
	return t;
}
function isLiteralValueDeclarator(e) {
	return isLiteralValueExpression(e.init);
}
function isLiteralValueExpression(e) {
	return e == null ? !1 : e.type === `Literal` ? e.value === null || typeof e.value == `boolean` || typeof e.value == `number` || typeof e.value == `string` : e.type === `TemplateLiteral` && (e.expressions ?? []).length === 0 ? !0 : e.type === `TSAsExpression` || e.type === `TSSatisfiesExpression` || e.type === `TSNonNullExpression` || e.type === `TSTypeAssertion` ? isLiteralValueExpression(e.expression) : e.type === `UnaryExpression` && e.argument?.type === `Literal` && typeof e.argument.value == `number`;
}
function readValueImportBindings(e) {
	return e.importKind === `type` ? [] : (e.specifiers ?? []).filter((e) => e.importKind !== `type`).map((e) => e.local?.name).filter((e) => e !== void 0);
}
function collectReferencedIdentifiers(e) {
	let t = /* @__PURE__ */ new Set();
	return visitAstNode(e, (e) => {
		e.type === `Identifier` && typeof e.name == `string` && t.add(e.name);
	}), t;
}
function visitAstNode(e, t) {
	if (!(e.type === `ImportDeclaration` || e.type?.startsWith(`TS`))) {
		t(e);
		for (let n of Object.values(e)) if (Array.isArray(n)) for (let e of n) isAstNode(e) && visitAstNode(e, t);
		else isAstNode(n) && visitAstNode(n, t);
	}
}
function isAstNode(e) {
	return typeof e == `object` && !!e && typeof e.type == `string`;
}
function extendRemovalEnd(e, t) {
	let n = t;
	for (; n < e.length && (e[n] === ` ` || e[n] === `	`);) n += 1;
	return e[n] === `\r` && e[n + 1] === `
` ? n + 2 : e[n] === `
` ? n + 1 : n;
}
function stripJavaScriptExtension(e) {
	return e.replace(/\.(?:[cm]?[jt]sx?)$/, ``);
}
function createWorkflowId(e, t) {
	return `workflow//${e}//${t}`;
}
function createStepId(e, t) {
	return BUILTIN_STEP_NAMES.has(t) ? t : `step//${e}//${t}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow-bundle/workflow-builders.js
const packageJsonCache = /* @__PURE__ */ new Map();
const projectDepsCache = /* @__PURE__ */ new Map();
async function applyWorkflowTransform(e, t, n, r, i, a = /* @__PURE__ */ new Set([...STABLE_WORKFLOW_NAMES, "agentToolServeWorkflow"])) {
	let o = i ?? process.cwd();
	let s = r === void 0 ? isAbsolute(e) ? e : join(o, e) : r;
	let { moduleSpecifier: c, stableModuleSpecifier: l } = resolveModuleSpecifier(s, o, n === `metadata`);
	if (r !== void 0 && isAuthoredApplicationModule(r, o)) {
		let e = n === !1 ? void 0 : await prepareAuthoredWorkflowDirectives({
			filePath: r,
			source: t
		});
		return transformWorkflowDirectives({
			authored: !0,
			authorizeSteps: !0,
			filename: authoredRelativePath(r, o),
			mode: e?.hasDirectives === !0 && n,
			moduleSpecifier: authoredModuleIdBase(r, o),
			source: e?.source ?? t,
			stableModuleSpecifier: void 0,
			stableWorkflowNames: a
		});
	}
	return transformWorkflowDirectives({
		authorizeSteps: isPackageTestFixtureModule(s),
		filename: e,
		mode: n,
		moduleSpecifier: c,
		source: t,
		stableModuleSpecifier: l,
		stableWorkflowNames: a
	});
}
function isPackageTestFixtureModule(e) {
	return e.replace(/\\/g, `/`).includes(`/src/internal/testing/`);
}
function isAuthoredApplicationModule(e, t) {
	if (!isAbsolute(e)) return !1;
	let n = toRealPath(t).replace(/\\/g, `/`).replace(/\/$/, ``);
	let r = toRealPath(e).replace(/\\/g, `/`);
	if (isInNodeModules(r)) return !1;
	if (!r.startsWith(`${n}/`)) {
		let e = findPackageRoot(n);
		if (e === null || findPackageRoot(dirname(r)) !== e) return !1;
	}
	return findPackageJson(r)?.name !== "eve";
}
function authoredRelativePath(e, t) {
	return toRelativeImportPath(toRealPath(e), toRealPath(t)).replace(/^\.\//, ``);
}
function authoredModuleIdBase(e, t) {
	let n = stripJavaScriptExtension(authoredRelativePath(e, t));
	return n.startsWith(`../`) ? n : `./${n}`;
}
const packageRootCache = /* @__PURE__ */ new Map();
function findPackageRoot(e) {
	let t = packageRootCache.get(e);
	if (t !== void 0) return t;
	let n = dirname(e);
	let r = existsSync(join(e, `package.json`)) ? e : n === e ? null : findPackageRoot(n);
	return packageRootCache.set(e, r), r;
}
function toRealPath(e) {
	try {
		return realpathSync(e);
	} catch {
		return resolve(e);
	}
}
function resolveModuleSpecifier(e, t, n = !1) {
	let r = isInNodeModules(e);
	let i = !r && isWorkspacePackage(e, t);
	let a = findPackageJson(e);
	if (n && a !== null) return {
		moduleSpecifier: `${a.name}@${a.version}`,
		stableModuleSpecifier: a.name
	};
	if (!r && !i) return {
		moduleSpecifier: void 0,
		stableModuleSpecifier: a?.name === "eve" ? "eve" : void 0
	};
	if (a === null) return {
		moduleSpecifier: void 0,
		stableModuleSpecifier: void 0
	};
	let o = resolveExportSubpath(e, a);
	let s = o ? `${a.name}${o}` : a.name;
	return {
		moduleSpecifier: `${s}@${a.version}`,
		stableModuleSpecifier: s
	};
}
function findPackageJson(e) {
	let t = dirname(e);
	let n = [];
	for (; t !== dirname(t);) {
		let e = packageJsonCache.get(t);
		if (e !== void 0) {
			for (let t of n) packageJsonCache.set(t, e);
			return e;
		}
		n.push(t);
		let r = join(t, `package.json`);
		if (existsSync(r)) try {
			let e = JSON.parse(readFileSync(r, `utf8`));
			if (typeof e.name == `string` && typeof e.version == `string`) {
				let r = {
					dir: t,
					exports: e.exports,
					main: e.main,
					module: e.module,
					name: e.name,
					version: e.version
				};
				packageJsonCache.set(t, r);
				for (let e of n) packageJsonCache.set(e, r);
				return r;
			}
		} catch {}
		t = dirname(t);
	}
	for (let e of n) packageJsonCache.set(e, null);
	return null;
}
function resolveExportSubpath(e, t) {
	if (t.exports === null || typeof t.exports != `object` || Array.isArray(t.exports)) return ``;
	let n = e.replace(/\\/g, `/`);
	let r = t.dir.replace(/\\/g, `/`);
	let i = n.startsWith(`${r}/`) ? `./${n.substring(r.length + 1)}` : null;
	if (i === null) return ``;
	for (let [e, n] of Object.entries(t.exports)) {
		let t = resolveExportTarget(n);
		if (t !== null && normalizeExportPath(t) === i) return e === `.` ? `` : e.substring(1);
	}
	return ``;
}
function resolveExportTarget(e) {
	if (typeof e == `string`) return e;
	if (Array.isArray(e)) {
		for (let t of e) {
			let e = resolveExportTarget(t);
			if (e !== null) return e;
		}
		return null;
	}
	if (typeof e == `object` && e) for (let t of [
		`workflow`,
		`default`,
		`require`,
		`import`,
		`node`
	]) {
		let n = e[t];
		let r = resolveExportTarget(n);
		if (r !== null) return r;
	}
	return null;
}
function normalizeExportPath(e) {
	return e.startsWith(`./`) ? e : `./${e}`;
}
function isInNodeModules(e) {
	return e.split(sep).join(`/`).includes(`/node_modules/`);
}
function getProjectDependencies(e) {
	let t = projectDepsCache.get(e);
	if (t !== void 0) return t;
	let n = /* @__PURE__ */ new Set();
	let r = join(e, `package.json`);
	if (existsSync(r)) try {
		let e = JSON.parse(readFileSync(r, `utf8`));
		for (let t of [
			`dependencies`,
			`devDependencies`,
			`peerDependencies`,
			`optionalDependencies`
		]) {
			let r = e[t];
			if (typeof r == `object` && r && !Array.isArray(r)) for (let e of Object.keys(r)) n.add(e);
		}
	} catch {}
	return projectDepsCache.set(e, n), n;
}
function isWorkspacePackage(e, t) {
	if (isInNodeModules(e)) return !1;
	let n = findPackageJson(e);
	return n === null || resolve(n.dir) === resolve(t) ? !1 : getProjectDependencies(t).has(n.name);
}
function toRelativeImportPath(e, t) {
	let n = t.replace(/\\/g, `/`);
	let r = e.replace(/\\/g, `/`);
	let i = r.startsWith(`${n}/`) ? r.substring(n.length + 1) : relative(t, e).replace(/\\/g, `/`);
	return i.startsWith(`.`) || (i = `./${i}`), i;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-loader.js
const AUTHORED_BUNDLED_MODULE_EXTENSION = /\.[cm]?[jt]sx?$/;
const AUTHORED_MODULE_BUNDLE_DIRECTORY_PATH = join(`node_modules`, `.cache`, `eve`, `authored-modules`);
const inFlightModuleLoads = /* @__PURE__ */ new Map();
function loadAuthoredModuleNamespace(e, t = {}) {
	let n = createInFlightModuleLoadKey(resolve(e), t);
	let r = inFlightModuleLoads.get(n);
	if (r !== void 0) return r;
	let i = (async () => {
		try {
			return await doLoadAuthoredModuleNamespace(e, t);
		} finally {
			inFlightModuleLoads.delete(n);
		}
	})();
	return inFlightModuleLoads.set(n, i), i;
}
async function doLoadAuthoredModuleNamespace(e, t) {
	return expectObjectRecord(interopAuthoredModuleNamespace(AUTHORED_BUNDLED_MODULE_EXTENSION.test(e) ? await loadBundledAuthoredModule(e, t) : await import(createFileImportSpecifier(e))), `Expected "${e}" to export a module namespace object.`);
}
function createFileImportSpecifier(e) {
	let t = e.replaceAll(`\\`, `/`);
	return /^[A-Za-z]:\//.test(t) ? `file:///${encodeURI(t)}` : t.startsWith(`/`) ? `file://${encodeURI(t)}` : t;
}
async function bundleAuthoredModuleCode(e, t = {}) {
	let n = resolveAuthoredPackageRoot(e);
	let r = t.extension?.entry;
	let i = t.extension?.mountId;
	let a = r === void 0 ? [] : [...t.extension?.ancestors ?? [], {
		...r,
		mountId: i
	}];
	return await buildAuthoredModuleBundle(e, t, {
		packageBoundaryPlugin: createRuntimeLoaderPackageBoundaryPlugin({
			externalDependencies: normalizeExternalDependencies(t.externalDependencies),
			packageRoot: n,
			extensionSpecifiers: new Set(a.map((e) => e.specifier))
		}),
		plugins: [
			...r === void 0 ? [] : [{
				name: `eve-compile-mount-entry`,
				resolveId(e) {
					return e === `\0eve-compile-mount-entry` ? e : void 0;
				},
				load(t) {
					if (t !== `\0eve-compile-mount-entry`) return;
					let n = a.map((e) => `import ${JSON.stringify(`${e.mountSourcePath}?eve-mount=${encodeURIComponent(e.mountId)}`)};`);
					let r = `${e}?eve-mount=${encodeURIComponent(i)}`;
					return `${n.join(` `)} export * from ${JSON.stringify(r)}; import entry from ${JSON.stringify(r)}; export default entry;`;
				}
			}],
			createAuthoredWorkflowDirectivePlugin({ appRoot: t.appRoot ?? n }),
			...r === void 0 ? [] : [createExtensionMountPlugin(a)]
		],
		sourcemap: evaluatedBundleSourcemap()
	});
}
async function bundleAuthoredModuleMapForGeneration(e) {
	let t = resolveAuthoredPackageRoot(e.manifest.agentRoot);
	let n = resolvePackageSourceFilePath(usesDevelopmentExtensionModules(e.manifest) ? `src/internal/development-programmatic-source-loader.ts` : `src/internal/programmatic-source-loader.ts`);
	let r = normalizeExternalDependencies([...e.manifest.config.build?.externalDependencies ?? [], ...e.manifest.subagents.flatMap((e) => e.configResolver === void 0 ? e.agent.config.build?.externalDependencies ?? [] : [])]);
	let i = createCompiledModuleMapSource({
		manifest: e.manifest,
		moduleMapPath: e.moduleMapPath,
		programmaticLoaderImportSpecifier: n
	});
	let a = [e.manifest, ...e.manifest.subagents.map((e) => e.agent)].flatMap((e) => e.extensionMounts);
	let o = createExtensionScopePlugin([e.manifest, ...e.manifest.subagents.map((e) => e.agent)].flatMap((e) => e.extensionMounts.map((e) => ({
		mountId: e.mountId,
		sourceRoot: e.sourceRoot
	}))));
	let s = new AuthoredWorkflowSourceRecorder(e.appRoot);
	try {
		let c = await buildSingleRolldownChunk(`authored module map`, {
			...createAuthoredModuleBuildOptions({
				packageBoundaryPlugin: createGenerationPackageBoundaryPlugin({
					externalDependencies: r,
					packageRoot: t,
					extensionSpecifiers: new Set(a.map((e) => e.specifier)),
					resolveExternalPaths: e.resolveExternalPaths,
					hostBundle: e.hostBundle
				}),
				packageRoot: t,
				plugins: [
					createVirtualGenerationModuleMapPlugin({
						id: e.moduleMapPath,
						source: i
					}),
					createExternalRuntimeImportPlugin(n),
					createAuthoredWorkflowDirectivePlugin({
						appRoot: e.appRoot,
						recorder: s
					}),
					s.graphPlugin(),
					createExtensionMountPlugin(a, extensionOverridePaths(e.manifest)),
					o
				]
			}),
			input: e.moduleMapPath,
			output: {
				comments: !1,
				format: `esm`,
				sourcemap: !1
			}
		});
		return {
			authoredWorkflowModules: s.modules(),
			code: c.code,
			sourceModules: s.sourceModules().filter((t) => t !== e.moduleMapPath),
			workflowSourceFingerprint: s.fingerprint()
		};
	} catch (t) {
		throw createAuthoredModuleBundleError(e.moduleMapPath, t);
	}
}
function usesDevelopmentExtensionModules(e) {
	return [e, ...e.subagents.map((e) => e.agent)].some((e) => Object.values(e.bindings).some((e) => e.backing.kind === `programmatic` && e.backing.registryId.startsWith(`eve:development-extension:`)));
}
function createExternalRuntimeImportPlugin(e) {
	let t = normalizeEsmImportSpecifier(e);
	return {
		name: `eve-external-runtime-import`,
		resolveId(e) {
			return e === t ? {
				external: !0,
				id: t
			} : void 0;
		}
	};
}
var AuthoredWorkflowSourceRecorder = class {
	#e;
	#t = /* @__PURE__ */ new Set();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Map();
	#i = /* @__PURE__ */ new Set();
	constructor(e) {
		this.#e = e;
	}
	record(e, t, n) {
		this.#r.set(e, t), (n.steps !== void 0 || n.workflows !== void 0) && this.#t.add(e), Object.values(n.workflows ?? {})[0] !== void 0 && this.#i.add(e);
	}
	sourceModules() {
		return [...this.#r.keys()].sort();
	}
	graphPlugin() {
		let e = this.#n;
		return {
			name: `eve-authored-module-graph`,
			buildEnd() {
				for (let t of this.getModuleIds()) {
					let n = this.getModuleInfo(t);
					n !== null && e.set(t, [...n.importedIds, ...n.dynamicallyImportedIds]);
				}
			}
		};
	}
	modules() {
		return {
			directiveModules: [...this.#t].sort(),
			workflowModules: [...this.#i].sort()
		};
	}
	fingerprint() {
		if (this.#t.size === 0) return;
		let e = /* @__PURE__ */ new Set();
		let t = [...this.#t];
		for (let n = t.shift(); n !== void 0; n = t.shift()) !e.has(n) && this.#r.has(n) && (e.add(n), t.push(...this.#n.get(n) ?? []));
		let n = createHash(`sha256`);
		for (let t of [...e].sort()) n.update(relative(this.#e, t).split(sep).join(`/`)).update(`\0`).update(this.#r.get(t) ?? ``).update(`\0`);
		return n.digest(`hex`);
	}
};
function createVirtualGenerationModuleMapPlugin(e) {
	return {
		name: `eve-generation-module-map`,
		resolveId(t) {
			return t === e.id ? t : void 0;
		},
		load(t) {
			return t === e.id ? {
				code: e.source,
				moduleType: `js`
			} : void 0;
		}
	};
}
async function buildAuthoredModuleBundle(e, t, n) {
	let r = resolveAuthoredPackageRoot(e);
	try {
		return (await buildSingleRolldownChunk(`authored module for "${e}"`, {
			...createAuthoredModuleBuildOptions({
				packageBoundaryPlugin: n.packageBoundaryPlugin,
				packageRoot: r,
				plugins: [...n.plugins, t.extension === void 0 ? null : createFixedMountScopePlugin(t.extension.mountId)]
			}),
			input: t.extension?.entry === void 0 ? e : `\0eve-compile-mount-entry`,
			output: {
				comments: !1,
				format: `esm`,
				sourcemap: n.sourcemap
			}
		})).code;
	} catch (t) {
		throw createAuthoredModuleBundleError(e, t);
	}
}
function createAuthoredWorkflowDirectivePlugin(e) {
	return {
		name: `eve-authored-workflow-directives`,
		async transform(t, n) {
			if (!AUTHORED_BUNDLED_MODULE_EXTENSION.test(n) || isNodeModulesPath$2(n) || !isAuthoredApplicationModule(n, e.appRoot)) return;
			let r = await applyWorkflowTransform(n, t, `client`, n, e.appRoot);
			return e.recorder?.record(n, t, r.workflowManifest), r.code === t ? void 0 : {
				code: r.code,
				map: null
			};
		}
	};
}
async function loadBundledAuthoredModule(e, t) {
	let n = t.extension === void 0 ? await t.graph?.entryPath(e, t.externalDependencies ?? []) : void 0;
	let r = n === void 0 ? await writeAuthoredModuleBundle(e, t) : createFileImportSpecifier(n);
	try {
		return await import(r);
	} catch (t) {
		throw createAuthoredModuleEvaluationError(e, t);
	}
}
async function writeAuthoredModuleBundle(e, t) {
	let n = await bundleAuthoredModuleCode(e, t);
	let r = normalizeExternalDependencies(t.externalDependencies);
	let i = createHash(`sha1`).update(e).update(`\0`).update(r.join(`\0`)).update(`\0`).update(t.extension?.mountId ?? ``).update(`\0`).update(n).digest(`hex`);
	let o = writeAuthoredModuleCacheFile(join(resolveAuthoredPackageRoot(e), AUTHORED_MODULE_BUNDLE_DIRECTORY_PATH), `${i}.mjs`, n);
	let s = t.extension?.evaluationId ?? ``;
	return `${createFileImportSpecifier(o)}?v=${i}&instance=${encodeURIComponent(s)}`;
}
function createInFlightModuleLoadKey(e, t) {
	return `${e}\0${normalizeExternalDependencies(t.externalDependencies).join(`\0`)}\0${t.extension?.mountId ?? ``}\0${t.extension?.evaluationId ?? ``}\0${t.appRoot ?? ``}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/load-binding-namespace.js
function resolveExtensionBindingMountId(e) {
	return e.owner.kind === `extension` ? e.owner.mountId : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/module-map.js
const compiledModuleNodeScopeSchema = z.object({ modules: z.record(z.string(), z.object({}).passthrough()) }).strict();
const compiledModuleMapSchema = z.object({ nodes: z.record(z.string(), compiledModuleNodeScopeSchema) }).strict();
function createCompiledModuleMapSource(e) {
	let t = dirnameFilesystemPath(e.moduleMapPath);
	let n = e.importSpecifierStyle ?? `relative`;
	let r = 0;
	let i = !1;
	let a = collectBoundNodeScopes(e.manifest).map((e) => {
		let a = new Map(e.mounts.map((e) => [e.mountSourceId, e]));
		let o = new Map(e.mounts.map((e) => [e.mountId, e.mountSourceId]));
		let s = new Map(e.modules.map((e) => [e.sourceId, `module_${r++}`]));
		return {
			modules: orderBoundModules(e.modules, (e) => o.get(bindingMountId(e) ?? ``)).map(({ binding: e, sourceId: r }) => {
				let o = s.get(r);
				if (e.backing.kind === `filesystem`) {
					let i = createImportSpecifier({
						fromDirectory: t,
						importSpecifierStyle: n,
						targetPath: e.backing.sourcePath
					}) + (bindingMountId(e) === void 0 ? `` : `?eve-mount=${encodeURIComponent(bindingMountId(e))}`);
					let s = bindingMountId(e) !== void 0 && !a.has(r);
					return {
						bindingName: o,
						importSpecifier: s ? void 0 : i,
						initializer: `memoizeModuleNamespaceFactories(interopAuthoredModuleNamespace(${s ? `await import(${JSON.stringify(i)})` : `imported_${o}`}))`,
						sourceId: r
					};
				}
				let c = a.get(r);
				if (c?.programmaticImport !== void 0) {
					let e = `${c.programmaticImport.specifier}?eve-mount=${encodeURIComponent(c.mountId)}`;
					return {
						bindingName: o,
						initializer: `memoizeModuleNamespaceFactories({ default: (await import(${JSON.stringify(e)})).default(${JSON.stringify(c.programmaticImport.config)}) })`,
						sourceId: r
					};
				}
				return i = !0, {
					bindingName: o,
					initializer: `await loadProgrammaticModule(${JSON.stringify(e.backing)})`,
					sourceId: r
				};
			}),
			nodeId: e.nodeId
		};
	});
	let o = a.flatMap((e) => e.modules);
	let s = o.flatMap((e) => e.importSpecifier === void 0 ? [] : [`import * as imported_${e.bindingName} from ${JSON.stringify(e.importSpecifier)};`]);
	let c = o.flatMap((e) => e.initializer === void 0 ? [] : [`const ${e.bindingName} = ${e.initializer};`]);
	return [
		`// Generated by eve. Do not edit by hand.`,
		...i || o.length > 0 ? [`import { interopAuthoredModuleNamespace, loadFrameworkProgrammaticModule as loadProgrammaticModule, memoizeModuleNamespaceFactories } from ${JSON.stringify(normalizeEsmImportSpecifier(e.programmaticLoaderImportSpecifier ?? `eve/internal/programmatic-source-loader`))};`] : [],
		...s,
		...i || o.length > 0 ? [``] : [],
		...c,
		...c.length > 0 ? [``] : [],
		`export const moduleMap = ${renderModuleMap(a)};`,
		``,
		`export default moduleMap;`,
		``
	].join(`
`);
}
function collectRuntimeModuleBindingsForManifest(e) {
	let t = new Map(Object.entries(e.bindings).filter(([, e]) => e.usage.runtimeEntry));
	for (let n of e.remoteAgents) if (n.binding.usage.runtimeEntry) {
		if (t.has(n.sourceId)) throw Error(`Remote agent binding "${n.sourceId}" collides with a node binding.`);
		t.set(n.sourceId, n.binding);
	}
	return orderBoundModules([...t].sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => ({
		binding: t,
		sourceId: e
	})));
}
function orderBoundModules(e, t) {
	let n = new Map(e.map((e) => [e.sourceId, e]));
	let r = [];
	let i = /* @__PURE__ */ new Set();
	let a = /* @__PURE__ */ new Set();
	let visit = (e) => {
		if (a.has(e.sourceId)) return;
		if (i.has(e.sourceId)) throw Error(`Compiled module dependency cycle includes "${e.sourceId}".`);
		i.add(e.sourceId);
		let o = t?.(e.binding);
		if (o !== void 0 && o !== e.sourceId) {
			let e = n.get(o);
			e !== void 0 && visit(e);
		}
		i.delete(e.sourceId), a.add(e.sourceId), r.push(e);
	};
	for (let t of e) visit(t);
	return r;
}
function collectBoundNodeScopes(e) {
	return [{
		modules: collectRuntimeModuleBindingsForManifest(e),
		mounts: e.extensionMounts,
		nodeId: "__root__"
	}, ...[...e.subagents].sort((e, t) => e.nodeId.localeCompare(t.nodeId)).map((e) => ({
		modules: collectRuntimeModuleBindingsForManifest(e.agent),
		mounts: e.agent.extensionMounts,
		nodeId: e.nodeId
	}))];
}
function renderModuleMap(e) {
	return renderFrozenObject([{
		key: `nodes`,
		value: renderFrozenObject(e.map((e) => ({
			key: e.nodeId,
			value: renderFrozenObject([{
				key: `modules`,
				value: renderFrozenObject(e.modules.map((e) => ({
					key: e.sourceId,
					value: e.bindingName
				})))
			}], 3)
		})))
	}], 0);
}
function renderFrozenObject(e, t = 1) {
	if (e.length === 0) return `Object.freeze({})`;
	let n = `  `.repeat(t);
	let r = `  `.repeat(t + 1);
	return [
		`Object.freeze({`,
		e.map((e) => `${r}${JSON.stringify(e.key)}: ${e.value.replaceAll(`
`, `\n${r}`)}`).join(`,
`),
		`${n}})`
	].join(`
`);
}
function createImportSpecifier(e) {
	if (e.importSpecifierStyle === `absolute`) return normalizeEsmImportSpecifier(normalizeFilesystemPath(e.targetPath));
	let t = relativeFilesystemPath(e.fromDirectory, e.targetPath);
	return t.startsWith(`.`) ? t : `./${t}`;
}
function dirnameFilesystemPath(e) {
	let t = splitFilesystemPath(e);
	return t.segments.length === 0 ? t.root.length === 0 ? `.` : t.root : createFilesystemPath(t.root, t.segments.slice(0, -1));
}
function relativeFilesystemPath(e, t) {
	let n = splitFilesystemPath(e);
	let r = splitFilesystemPath(t);
	if (n.root !== r.root) return normalizeFilesystemPath(t);
	let i = 0;
	for (; i < n.segments.length && i < r.segments.length && n.segments[i] === r.segments[i];) i += 1;
	return [...Array.from({ length: n.segments.length - i }, () => `..`), ...r.segments.slice(i)].join(`/`) || `.`;
}
function normalizeFilesystemPath(e) {
	let t = splitFilesystemPath(e);
	return createFilesystemPath(t.root, t.segments);
}
function splitFilesystemPath(e) {
	let t = e.replaceAll(`\\`, `/`);
	let n = ``;
	let r = t;
	let i = t.match(/^[A-Za-z]:/);
	i === null ? t.startsWith(`/`) && (n = `/`, r = t.slice(1)) : (n = i[0], r = t.slice(n.length), r.startsWith(`/`) && (n += `/`, r = r.slice(1)));
	let a = [];
	for (let e of r.split(`/`)) e.length !== 0 && e !== `.` && (e === `..` ? a.length > 0 && a.at(-1) !== `..` ? a.pop() : n.length === 0 && a.push(e) : a.push(e));
	return {
		root: n,
		segments: a
	};
}
function createFilesystemPath(e, t) {
	return e === `/` ? t.length === 0 ? `/` : `/${t.join(`/`)}` : e.endsWith(`/`) ? t.length === 0 ? e : `${e}${t.join(`/`)}` : e.length > 0 ? t.length === 0 ? e : `${e}/${t.join(`/`)}` : t.length === 0 ? `.` : t.join(`/`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/framework/host-inventory.js
const HOST_HTTP_INVENTORY = Object.freeze([
	{
		capability: `workflow`,
		method: `ALL`,
		path: "/.well-known/workflow/v1/flow"
	},
	{
		capability: `development`,
		method: `GET`,
		path: "/eve/v1/dev/runtime-artifacts"
	},
	{
		capability: `development`,
		method: `GET`,
		path: "/eve/v1/dev/runtime-artifacts/rebuild"
	},
	{
		capability: `development`,
		method: `POST`,
		path: "/eve/v1/dev/runtime-artifacts/rebuild"
	},
	{
		capability: `development`,
		method: `POST`,
		path: "/eve/v1/dev/runtime-artifacts/suspend"
	},
	{
		capability: `development`,
		method: `POST`,
		path: "/eve/v1/dev/runtime-artifacts/resume"
	},
	{
		capability: `development`,
		method: `ALL`,
		path: "/eve/v1/dev/internal/workflow-world"
	},
	{
		capability: `development`,
		method: `ALL`,
		path: "/eve/v1/dev/internal/workflow-world/stream"
	},
	{
		capability: `schedule`,
		method: `POST`,
		path: "/eve/v1/dev/schedules/:scheduleId"
	}
]);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/validate-artifact.js
function validateCompiledAgentManifest(e) {
	let t = /* @__PURE__ */ new Map([["__root__", e]]);
	for (let n of e.subagents) t.has(n.nodeId) && fail(`subagent node id "${n.nodeId}" is duplicated`), t.set(n.nodeId, n.agent), validateSubagentRecord(n);
	validateSubagentTree(e, t), validateCompiledAgentResources(e, { activeResourceSourceIds: e.subagents.filter((e) => e.parentNodeId === "__root__").map((e) => e.sourceId) });
	for (let t of e.subagents) validateCompiledAgentResources(t.agent, {
		additionalModuleSources: t.configResolver === void 0 ? [] : [t.configResolver],
		activeResourceSourceIds: e.subagents.filter((e) => e.parentNodeId === t.nodeId).map((e) => e.sourceId)
	});
	for (let [n, r] of t) validateUniqueIdentities([
		...r.tools.map((e) => ({
			identity: e.name,
			kind: `tool`
		})),
		...r.remoteAgents.map((e) => ({
			identity: e.name,
			kind: `remote agent`
		})),
		...e.subagents.filter((e) => e.parentNodeId === n).map((e) => ({
			identity: e.name,
			kind: `local agent`
		}))
	], `tool and subagent public name`);
}
function validateSubagentTree(e, t) {
	let n = new Map(e.subagents.map((e) => [e.nodeId, e.parentNodeId]));
	for (let r of e.subagents) {
		t.has(r.parentNodeId) || fail(`subagent node "${r.nodeId}" has missing parent "${r.parentNodeId}"`);
		let e = /* @__PURE__ */ new Set();
		let i = r.nodeId;
		for (; i !== "__root__";) {
			e.has(i) && fail(`subagent graph contains a cycle at node "${i}"`), e.add(i);
			let t = n.get(i);
			t === void 0 && fail(`subagent node "${r.nodeId}" is not reachable from the root`), i = t;
		}
	}
}
function validateCompiledModuleMap(e, t) {
	let n = new Map([[`__root__`, new Set(collectRuntimeModuleBindingsForManifest(e).map((e) => e.sourceId))], ...e.subagents.map((e) => [e.nodeId, new Set(collectRuntimeModuleBindingsForManifest(e.agent).map((e) => e.sourceId))])]);
	let r = Object.keys(t.nodes);
	(r.length !== n.size || r.some((e) => !n.has(e))) && fail(`compiled module map node set does not match the manifest`);
	for (let [e, r] of n) {
		let n = t.nodes[e];
		n === void 0 && fail(`compiled module map node "${e}" is missing`);
		let i = Object.keys(n.modules);
		(i.length !== r.size || i.some((e) => !r.has(e))) && fail(`compiled module map sources for node "${e}" do not match its bindings`);
	}
}
function validateCompiledAgentResources(e, t = {}) {
	validateUniqueIdentities(e.tools.map((e) => ({
		identity: e.name,
		kind: `tool`
	})), `tool name`), validateUniqueIdentities(e.skills.map((e) => ({
		identity: e.name,
		kind: `skill`
	})), `skill name`), validateUniqueIdentities(e.instructions.map((e) => ({
		identity: e.name,
		kind: `instructions`
	})), `instructions name`), validateUniqueIdentities(e.connections.map((e) => ({
		identity: e.connectionName,
		kind: `connection`
	})), `connection name`), validateUniqueIdentities(e.definitions.map(({ kind: e, slug: t }) => ({
		identity: `${e} ${t}`,
		kind: e
	})), `definition`), validateUniqueIdentities(e.schedules.map((e) => ({
		identity: e.name,
		kind: `schedule`
	})), `schedule name`), validateUniqueIdentities(e.scheduleCollections.map((e) => ({
		identity: e.name,
		kind: `schedule collection`
	})), `schedule collection name`);
	let n = collectReferencedModuleSources(e);
	for (let e of t.additionalModuleSources ?? []) n.set(e.sourceId, { logicalPath: e.logicalPath });
	for (let [t, r] of n) {
		let n = e.bindings[t];
		n === void 0 && fail(`module source "${t}" has no compiled binding`), validateBinding(t, r.logicalPath, n);
	}
	for (let t of Object.keys(e.bindings)) n.has(t) || fail(`compiled binding "${t}" is not referenced by its node manifest`);
	let r = /* @__PURE__ */ new Set([
		...n.keys(),
		...collectActiveResourceSourceIds(e),
		...e.remoteAgents.map((e) => e.sourceId),
		...t.activeResourceSourceIds ?? []
	]);
	let i = /* @__PURE__ */ new Set();
	for (let n of e.sourceComposition.entries) n.kind === `disabled` ? (i.has(n.source.sourceId) && fail(`disabled composition source "${n.source.sourceId}" is duplicated`), i.add(n.source.sourceId), e.bindings[n.source.sourceId] !== void 0 && fail(`disabled source "${n.source.sourceId}" retains an active binding`)) : r.has(n.winnerSourceId) || i.has(n.winnerSourceId) || e.sourceComposition.entries.some((e) => e.kind === `disabled` && e.source.sourceId === n.winnerSourceId) || t.allowUnknownResourceWinners === !0 || fail(`shadowed source "${n.source.sourceId}" has dangling winner "${n.winnerSourceId}"`);
	validateChannelRoutePlan(e);
	for (let t of e.remoteAgents) validateBinding(t.sourceId, t.logicalPath, t.binding), t.parentNodeId.length === 0 && fail(`remote agent "${t.sourceId}" has no parent`);
}
function validateSubagentRecord(e) {
	if (e.name === `agent` && fail(`subagent name "agent" is reserved for the built-in root-copy target`), (e.backing.kind !== `resource` || e.backing.sourcePath.length === 0) && fail(`subagent "${e.nodeId}" has no physical resource backing`), e.parentNodeId.length === 0 && fail(`subagent "${e.nodeId}" has no parent`), e.configResolver !== void 0) {
		let t = e.agent.bindings[e.configResolver.sourceId];
		t === void 0 && fail(`dynamic subagent "${e.nodeId}" config resolver has no binding`), validateBinding(e.configResolver.sourceId, e.configResolver.logicalPath, t);
	}
}
function validateBinding(e, t, n) {
	!n.usage.compile && !n.usage.runtimeEntry && fail(`compiled binding "${e}" has no compile or runtime usage`), n.logicalPath !== t && fail(`compiled binding "${e}" targets "${n.logicalPath}", not "${t}"`), n.owner.kind === `extension` && n.backing.kind === `filesystem` && n.backing.extensionScope === void 0 && fail(`extension-owned filesystem binding "${e}" has no extension scope`);
}
function collectReferencedModuleSources(e) {
	let t = /* @__PURE__ */ new Map();
	let add = (e) => {
		let n = t.get(e.sourceId);
		n !== void 0 && n.logicalPath !== e.logicalPath && fail(`module source "${e.sourceId}" is referenced with two logical paths`), t.set(e.sourceId, { logicalPath: e.logicalPath });
	};
	`config` in e && (add(e.config.source), e.config.model?.source !== void 0 && add(e.config.model.source), e.config.dynamicModel !== void 0 && add(e.config.dynamicModel));
	for (let t of e.channelRoutes.effective) add(t);
	for (let t of e.channelRoutes.shadowed) t.source.backing.kind !== `resource` && add(t.source);
	for (let t of e.connections) add(t);
	for (let t of e.definitions) add(t);
	for (let t of e.tools) add(t);
	for (let t of e.instructions) t.sourceKind === `module` && add(t);
	for (let t of e.skills) t.sourceKind === `module` && add(t);
	for (let t of e.schedules) t.sourceKind === `module` && add(t);
	for (let t of e.scheduleCollections) add(t);
	add(e.sandbox);
	for (let t of e.extensionMounts) add({
		logicalPath: t.mountLogicalPath,
		sourceId: t.mountSourceId
	});
	return t;
}
function collectActiveResourceSourceIds(e) {
	return [
		...e.instructions.filter((e) => e.sourceKind !== `module`).map((e) => e.sourceId),
		...e.skills.filter((e) => e.sourceKind !== `module`).map((e) => e.sourceId),
		...e.schedules.filter((e) => e.sourceKind !== `module`).map((e) => e.sourceId),
		...e.sandboxWorkspaces.map((e) => e.sourceId)
	];
}
function validateChannelRoutePlan(e) {
	let t = /* @__PURE__ */ new Set();
	let n = /* @__PURE__ */ new Set();
	for (let r of e.channelRoutes.effective) {
		let i = routeIdentity(r);
		t.has(i) && fail(`effective channel route "${i}" is duplicated`), t.add(i), n.add(r.sourceId), e.bindings[r.sourceId] === void 0 && fail(`effective channel route source "${r.sourceId}" has no binding`), HOST_HTTP_INVENTORY.find((e) => methodsOverlap(r.method, e.method) && patternsOverlap(r.urlPath, e.path)) !== void 0 && fail(`effective route ${r.method} ${r.urlPath} overlaps reserved host route`);
	}
	for (let t of e.channelRoutes.shadowed) n.has(t.winnerSourceId) || fail(`shadowed channel route has dangling winner "${t.winnerSourceId}"`);
	let r = /* @__PURE__ */ new Set();
	for (let t of e.channelRoutes.preflight) {
		let n = normalizePattern(t.urlPath);
		r.has(n) && fail(`generated preflight "${n}" is duplicated`), r.add(n), t.sourceIds.length === 0 && fail(`generated preflight "${n}" has no causes`);
		for (let r of t.sourceIds) e.channelRoutes.effective.find((e) => e.sourceId === r && e.cors !== void 0 && e.method !== `WEBSOCKET` && patternsOverlap(e.urlPath, t.urlPath)) === void 0 && fail(`generated preflight "${n}" has invalid cause "${r}"`);
	}
}
function routeIdentity(e) {
	return `${e.method} ${normalizePattern(e.urlPath)}`;
}
function normalizePattern(e) {
	return splitPath(e).map((e) => isParameter(e) ? `:` : e).join(`/`);
}
function patternsOverlap(e, t) {
	let n = splitPath(e);
	let r = splitPath(t);
	return n.length === r.length && n.every((e, t) => e === r[t] || isParameter(e) || isParameter(r[t]));
}
function splitPath(e) {
	return e.replace(/^\/+|\/+$/g, ``).split(`/`);
}
function isParameter(e) {
	return e.startsWith(`:`) || /^\[[^\]]+\]$/.test(e);
}
function methodsOverlap(e, t) {
	return e === `ALL` || t === `ALL` || e === t;
}
function validateUniqueIdentities(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = n.get(r.identity);
		e !== void 0 && fail(`${t} "${r.identity}" is shared by ${e} and ${r.kind}`), n.set(r.identity, r.kind);
	}
}
function fail(e) {
	throw Error(`Invalid compiled eve artifact: ${e}.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/agent-definition.js
const ANTHROPIC_PROMPT_CACHE_TTLS = [`5m`, `1h`];
function isDynamicModelDefinition(e) {
	return isDynamicSentinel(e);
}
const AGENT_WORKFLOW_RETENTION_VALUES = [0, `default`];
export { AGENT_WORKFLOW_RETENTION_VALUES, ANTHROPIC_PROMPT_CACHE_TTLS, AUTHORED_BUNDLED_MODULE_EXTENSION, AUTHORED_MODULE_BUNDLE_DIRECTORY_PATH, buildWithRolldown, bundleAuthoredModuleMapForGeneration, collectRuntimeModuleBindingsForManifest, compiledModuleMapSchema, createAgentSourceRegistry, createAuthoredModuleBuildOptions, createAuthoredWorkflowDirectivePlugin, createRuntimeLoaderPackageBoundaryPlugin, defineProgrammaticAgentSource, evaluatedBundleSourcemap, expectAgentToolExposure, expectBoolean, expectFunction, expectObjectRecord, expectOnlyKnownKeys, expectPositiveInteger, expectProviderOptions, expectString, getAuthoredModuleExport, getOptionalStringRecordProperty, isDynamicModelDefinition, loadAuthoredModuleNamespace, loadProgrammaticModuleNamespace, materializeAuthoredModuleExport, memoizeModuleNamespaceFactories, normalizeExternalDependencies, resolveAuthoredPackageRoot, resolveExtensionBindingMountId, stripLogicalPathExtension, validateCompiledAgentManifest, validateCompiledModuleMap, workflowIdForHandling, writeAuthoredModuleCacheFile };

//# sourceMappingURL=eve2.mjs.map