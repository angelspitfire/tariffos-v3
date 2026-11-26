import { resolveInstalledPackageInfo } from "./eve4.mjs";
import "./eve48.mjs";
import "./eve55.mjs";
import { dirname, join, posix } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { access, cp, mkdir, rename, rm, utimes } from "node:fs/promises";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/stream-utils.js
async function streamToBuffer(e) {
	let t = [];
	for await (let n of e) t.push(n);
	return Buffer.concat(t);
}
function bufferToStream(e) {
	return new ReadableStream({ start(t) {
		t.enqueue(e), t.close();
	} });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/session.js
const SANDBOX_AGENT_ENV = { AI_AGENT: `eve` };
function createConnectionSession(e) {
	let t = e.workspaceRoot ?? "/workspace";
	if (!posix.isAbsolute(t)) throw Error(`Sandbox connection workspaceRoot must be an absolute path, but received "${t}".`);
	let resolveSandboxPath = (e) => posix.resolve(t, e);
	async function read(t) {
		return await e.readFile({
			signal: t.signal,
			path: resolveSandboxPath(t.path)
		});
	}
	async function readBytes(e) {
		let t = await read(e);
		return t === null ? null : ArrayBuffer.isView(t) ? Buffer.from(t) : await streamToBuffer(t);
	}
	async function write(t, n) {
		await e.writeFiles({
			signal: t.signal,
			files: [{
				content: n,
				path: resolveSandboxPath(t.path)
			}]
		});
	}
	async function spawn(t) {
		let n = await e.spawn({
			signal: t.signal,
			stdin: t.stdin,
			command: t.command,
			env: t.env ?? {},
			workingDirectory: resolveSandboxPath(t.workingDirectory ?? `.`)
		});
		if (t.stdin === !0 && n.stdin === void 0) throw await Promise.resolve(n.kill()).catch(() => void 0), Error("This sandbox provider does not support `stdin` on spawn.");
		return n;
	}
	let n = {
		resolvePath: resolveSandboxPath,
		async run(e) {
			let t = await spawn(e);
			let [n, r, { exitCode: i }] = await Promise.all([
				collectStreamToString(t.stdout),
				collectStreamToString(t.stderr),
				t.wait()
			]);
			return {
				exitCode: i,
				stderr: r,
				stdout: n
			};
		},
		spawn,
		async readFile(e) {
			let t = await read(e);
			return t === null || !ArrayBuffer.isView(t) ? t : bufferToStream(new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
		},
		readBinaryFile: (e) => readBytes(e),
		async readTextFile(e) {
			validateReadTextFileOptions(e);
			let t = await readBytes(e);
			return t === null ? null : applyLineRange(decodeBytes(t, e.encoding ?? `utf-8`), e);
		},
		async writeFile(e) {
			await write(e, await streamToBuffer(e.content));
		},
		async writeBinaryFile(e) {
			await write(e, Buffer.from(e.content));
		},
		async writeTextFile(e) {
			let t = e.encoding ?? `utf-8`;
			await write(e, Buffer.from(e.content, t));
		},
		async writeFiles(t) {
			await e.writeFiles({
				signal: t.signal,
				files: t.files.map((e) => ({
					content: e.content,
					path: resolveSandboxPath(e.path)
				}))
			});
		},
		async removePath(t) {
			await e.removePath({
				signal: t.signal,
				force: t.force,
				path: resolveSandboxPath(t.path),
				recursive: t.recursive
			});
		}
	};
	let r = e.extensions ?? {};
	let i = Object.keys(r).filter((e) => Object.hasOwn(n, e) || e === `delete` || e === `stop`);
	if (i.length > 0) throw Error(`Sandbox connection extensions cannot replace the session members eve provides: ${i.join(`, `)}. Rename them.`);
	return {
		...r,
		...n
	};
}
async function collectStreamToString(e) {
	let t = await streamToBuffer(e);
	return new TextDecoder().decode(t);
}
function validateReadTextFileOptions(e) {
	let { startLine: t, endLine: n } = e;
	if (t !== void 0 && (!Number.isInteger(t) || t < 1)) throw Error(`startLine must be a positive integer (1-based).`);
	if (n !== void 0 && (!Number.isInteger(n) || n < 1)) throw Error(`endLine must be a positive integer (1-based).`);
	if (t !== void 0 && n !== void 0 && t > n) throw Error(`startLine must not be greater than endLine.`);
}
function splitLinesPreservingEndings(e) {
	let t = [];
	let n = 0;
	for (let r = 0; r < e.length; r++) e[r] === `\r` ? r + 1 < e.length && e[r + 1] === `
` ? (t.push(e.slice(n, r + 2)), n = r + 2, r++) : (t.push(e.slice(n, r + 1)), n = r + 1) : e[r] === `
` && (t.push(e.slice(n, r + 1)), n = r + 1);
	return n < e.length && t.push(e.slice(n)), t;
}
function applyLineRange(e, t) {
	if (t.startLine === void 0 && t.endLine === void 0) return e;
	let n = splitLinesPreservingEndings(e);
	let r = n.length;
	let i = t.startLine ?? 1;
	let a = Math.min(t.endLine ?? r, r);
	return i > r ? `` : n.slice(i - 1, a).join(``);
}
function decodeBytes(e, t) {
	return t === `utf-8` || t === `utf8` ? new TextDecoder(`utf-8`, { fatal: !0 }).decode(e) : Buffer.from(e.buffer, e.byteOffset, e.byteLength).toString(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/sandbox-session-gone-error.js
var SandboxSessionGoneError = class SandboxSessionGoneError extends Error {
	constructor(e) {
		super(e), this.name = `SandboxSessionGoneError`;
	}
	static is(e) {
		return e instanceof SandboxSessionGoneError || e instanceof Error && e.name === `SandboxSessionGoneError`;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/sandbox-template-error.js
var SandboxTemplateNotProvisionedError = class SandboxTemplateNotProvisionedError extends Error {
	providerName;
	templateKey;
	constructor(e) {
		super(`nodeId` in e ? `No prepared "${e.providerName}" sandbox environment is recorded for agent node "${e.nodeId}". eve prepares sandbox environments during \`eve build\` and never prepares them in production. Run \`eve build\` without \`--skip-sandbox-prewarm\` and deploy that output with this runtime.` : `Sandbox template "${e.templateKey}" for provider "${e.providerName}" is not available to this runtime. ` + (e.reason === void 0 ? `` : `${e.reason} `) + "The runtime only uses templates that `eve build` prepared and never recreates them. Run `eve build` again and deploy its output."), this.name = `SandboxTemplateNotProvisionedError`, this.providerName = e.providerName, this.templateKey = `nodeId` in e ? e.nodeId : e.templateKey;
	}
	static is(e) {
		return e instanceof SandboxTemplateNotProvisionedError || typeof e == `object` && !!e && Reflect.get(e, `name`) === `SandboxTemplateNotProvisionedError` && typeof Reflect.get(e, `providerName`) == `string` && typeof Reflect.get(e, `templateKey`) == `string`;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/paths.js
function resolveSandboxCacheDirectory(e) {
	return join(e, `.eve`, `sandbox-cache`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/provider-identity.js
function createSandboxProviderIdentity(e) {
	return createHash(`sha256`).update(serialize(e, /* @__PURE__ */ new WeakSet())).digest(`hex`);
}
function serialize(e, t) {
	if (e === null || typeof e == `boolean` || typeof e == `number` || typeof e == `string`) return JSON.stringify(e);
	if (e === void 0) return `undefined`;
	if (typeof e == `function`) return `function:${e.toString()}`;
	if (Array.isArray(e)) return `[${e.map((e) => serialize(e, t)).join(`,`)}]`;
	if (typeof e != `object`) throw Error(`Unsupported sandbox provider identity value: ${typeof e}`);
	if (t.has(e)) throw Error(`Sandbox provider identity values cannot be circular.`);
	t.add(e);
	let n = `{${Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e.localeCompare(t)).map(([e, n]) => `${JSON.stringify(e)}:${serialize(n, t)}`).join(`,`)}}`;
	return t.delete(e), n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/local-provider-utils.js
async function pathExists(e) {
	try {
		return await access(e), !0;
	} catch {
		return !1;
	}
}
async function copyDirectoryAtomically(e, t) {
	let n = `${t}.${randomUUID()}.tmp`;
	await rm(n, {
		force: !0,
		recursive: !0
	}), await mkdir(dirname(t), { recursive: !0 });
	try {
		await cp(e, n, {
			recursive: !0,
			verbatimSymlinks: !0
		}), await rename(n, t);
	} catch (e) {
		if (await rm(n, {
			force: !0,
			recursive: !0
		}).catch(() => {}), await pathExists(t)) return;
		throw e;
	}
}
async function touchDirectory(e) {
	let t = /* @__PURE__ */ new Date();
	await utimes(e, t, t);
}
function resolveLocalProviderTemplateRootPath(e, t, n) {
	return join(resolveLocalProviderTemplatesDirectory(e, t), n);
}
function resolveLocalProviderTemplatesDirectory(e, t) {
	return join(e, t, `templates`);
}
function resolveLocalProviderSessionRootPath(e, t, n) {
	return join(e, t, `sessions`, n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/sandbox/state.js
function clearSandboxRunning(e) {
	return e?.running === void 0 ? e : { session: e.session };
}
function markSandboxRunning(e, t) {
	return t === void 0 ? e : {
		...e,
		sandboxState: {
			session: e.sandboxState?.session ?? null,
			running: { idleTimeoutMs: t }
		}
	};
}
function isRetiredSandboxSessionState(e) {
	return e.providerName === void 0 || e.providerName === `microsandbox`;
}
const adopters = /* @__PURE__ */ new WeakMap();
function withAdoptedSandboxSessionStates(e, t) {
	return adopters.set(e, t), e;
}
function resolvePersistedSandboxSessionState(e, t) {
	if (e == null || isRetiredSandboxSessionState(e)) return null;
	if (t === void 0 || e.providerName === t.providerName) return e;
	let n = adopters.get(t.implementation)?.(e);
	return n === void 0 ? e : {
		...e,
		providerName: t.providerName,
		state: n,
		stateProtocolVersion: t.stateProtocolVersion
	};
}
const recordedSandboxProviderLookups = /* @__PURE__ */ new WeakMap();
function withRecordedSandboxProvider(e, t) {
	return recordedSandboxProviderLookups.set(e, t), e;
}
async function resolveRecordedSandboxProvider(e, t, n) {
	let r = recordedSandboxProviderLookups.get(e.implementation);
	return r === void 0 ? {
		implementation: e.implementation,
		state: t
	} : r(t, await n());
}
function recordedSandboxStopsIdle(e, t) {
	if (t == null) return !0;
	let n = recordedSandboxProviderLookups.get(e.implementation);
	let r = n === void 0 ? e : n(t.state, void 0);
	return r === void 0 || r.implementation.onSessionIdle !== void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/sandbox-tool-session-error.js
var ToolSessionSandboxUnsupportedError = class extends Error {
	constructor(e) {
		super(`Sandbox provider "${e}" cannot keep a sandbox between invokeTool calls, so a call with a key cannot open one. Call without a key for a sandbox that lasts one call, or use Vercel Sandbox, just-bash, or a custom provider that sets \`toolSessions: true\`.`), this.name = `ToolSessionSandboxUnsupportedError`;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/user-agent.js
function buildPackageUserAgent() {
	let { name: e, version: t } = resolveInstalledPackageInfo();
	return `${e}/${t}`;
}
function joinUserAgentProducts(...e) {
	return e.filter(Boolean).join(` `);
}
function appendUserAgentProduct(e, t) {
	let n = e.get(`user-agent`);
	return n?.split(/\s+/).includes(t) || e.set(`user-agent`, joinUserAgentProducts(n, t)), e;
}
function appendPackageUserAgent(e) {
	return appendUserAgentProduct(e, buildPackageUserAgent());
}
function withPackageUserAgent(e) {
	return (t, n) => {
		let r = new Headers(n?.headers ?? (typeof t == `object` && `headers` in t ? t.headers : void 0));
		return appendPackageUserAgent(r), (e ?? globalThis.fetch)(t, {
			...n,
			headers: r
		});
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/connection-disposal.js
const disposals = /* @__PURE__ */ new WeakMap();
function withSandboxConnectionDisposal(e, t) {
	let n;
	return disposals.set(e, () => n ??= t()), e;
}
function sandboxConnectionDisposal(e) {
	return disposals.get(e);
}
export { SANDBOX_AGENT_ENV, SandboxSessionGoneError, SandboxTemplateNotProvisionedError, ToolSessionSandboxUnsupportedError, appendPackageUserAgent, clearSandboxRunning, copyDirectoryAtomically, createConnectionSession, createSandboxProviderIdentity, isRetiredSandboxSessionState, markSandboxRunning, pathExists, recordedSandboxStopsIdle, resolveLocalProviderSessionRootPath, resolveLocalProviderTemplateRootPath, resolvePersistedSandboxSessionState, resolveRecordedSandboxProvider, resolveSandboxCacheDirectory, sandboxConnectionDisposal, touchDirectory, withAdoptedSandboxSessionStates, withPackageUserAgent, withRecordedSandboxProvider, withSandboxConnectionDisposal };

//# sourceMappingURL=eve59.mjs.map