import { createSandboxEnvironment, defineSandbox, getSandboxEnvironmentRuntime } from "./eve25.mjs";
import { isObject } from "./eve14.mjs";
import { toErrorMessage } from "./eve22.mjs";
import { SANDBOX_AGENT_ENV, SandboxSessionGoneError, SandboxTemplateNotProvisionedError, ToolSessionSandboxUnsupportedError, copyDirectoryAtomically, createSandboxProviderIdentity, pathExists, resolveLocalProviderSessionRootPath, resolveLocalProviderTemplateRootPath, sandboxConnectionDisposal, touchDirectory, withAdoptedSandboxSessionStates, withPackageUserAgent, withRecordedSandboxProvider, withSandboxConnectionDisposal } from "./eve59.mjs";
import { shellQuote } from "./eve60.mjs";
import { isEveDevEnvironment } from "./eve28.mjs";
import { createLogger } from "./eve15.mjs";
import { decodeVercelOidcTokenClaims } from "./eve37.mjs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { access, mkdir, readFile, rename, rm, stat, utimes, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { getVercelOidcToken } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/oidc/index.js";
import { Readable, Writable } from "node:stream";
import { dirname as dirname$1 } from "node:path/posix";
import { Worker } from "node:worker_threads";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/docker-cli.js
var DockerUnavailableError = class extends Error {
	hint = "Install and start Docker Desktop, OrbStack, Colima, or another runtime exposing a Docker-compatible `docker` CLI (or point EVE_DOCKER_PATH at one, e.g. Podman). Alternatively use the dependency-free JustBashSandbox, VercelSandbox, or DefaultSandbox to pick by availability.";
	constructor(e) {
		super("The Docker sandbox provider requires Docker, but the `docker` CLI was not found.", { cause: e }), this.name = `DockerUnavailableError`;
	}
};
var DockerDaemonUnavailableError = class extends Error {
	hint = "Start Docker Desktop (or your Docker-compatible runtime) and retry. Alternatively use the dependency-free JustBashSandbox (installed automatically by `eve dev`, or `pnpm add -D just-bash`), VercelSandbox, or DefaultSandbox to pick by availability.";
	constructor(e) {
		super(`The Docker sandbox provider requires a running Docker daemon, but it is not reachable. Docker reported: ${e}`), this.name = `DockerDaemonUnavailableError`;
	}
};
async function assertDockerDaemonAvailable(e) {
	let t = await e.run([
		`version`,
		`--format`,
		`{{.Server.Version}}`
	]);
	if (t.exitCode !== 0) throw new DockerDaemonUnavailableError(firstLine(t.stderr) || `exit ${t.exitCode}`);
}
function resolveDockerExecutable() {
	let e = process.env.EVE_DOCKER_PATH?.trim();
	return e !== void 0 && e.length > 0 ? e : `docker`;
}
let cachedLinuxDockerAvailability;
function isLinuxDockerDaemonAvailableSync() {
	return cachedLinuxDockerAvailability ??= readAdoptedAvailability() ?? probeLinuxDockerDaemonSync(), cachedLinuxDockerAvailability;
}
function readAdoptedAvailability() {
	let e = process.env["EVE_DEVELOPMENT_LINUX_DOCKER_AVAILABLE"];
	return e === `1` || e !== `0` && void 0;
}
function probeLinuxDockerDaemonSync() {
	try {
		let e = spawnSync(resolveDockerExecutable(), [
			`version`,
			`--format`,
			`{{.Server.Os}}`
		], {
			encoding: `utf8`,
			stdio: [
				`ignore`,
				`pipe`,
				`ignore`
			],
			timeout: 5e3,
			windowsHide: !0
		});
		return e.status === 0 && e.stdout.trim().toLowerCase() === `linux`;
	} catch {
		return !1;
	}
}
function createDockerCli() {
	return {
		async run(e, t = {}) {
			throwIfAborted(t.signal);
			let n = spawn(resolveDockerExecutable(), e, {
				signal: t.signal,
				stdio: [
					t.stdin === void 0 ? `ignore` : `pipe`,
					`pipe`,
					`pipe`
				],
				windowsHide: !0
			});
			let r = [];
			let i = [];
			n.stdout?.on(`data`, (e) => r.push(e)), n.stderr?.on(`data`, (e) => i.push(e)), t.stdin !== void 0 && n.stdin?.end(t.stdin);
			let a = await new Promise((e, t) => {
				n.on(`error`, (e) => t(adaptSpawnError(e))), n.on(`close`, (t) => e(t ?? 1));
			});
			let o = Buffer.concat(r);
			return {
				exitCode: a,
				stderr: Buffer.concat(i).toString(`utf8`),
				stdout: o.toString(`utf8`),
				stdoutBytes: o
			};
		},
		stream(e, t = {}) {
			throwIfAborted(t.signal);
			let n = spawn(resolveDockerExecutable(), e, {
				signal: t.signal,
				stdio: [
					`pipe`,
					`pipe`,
					`pipe`
				],
				windowsHide: !0
			});
			t.stdin !== !0 && n.stdin.end();
			let r = new Promise((e, t) => {
				n.on(`error`, (e) => t(adaptSpawnError(e))), n.on(`close`, (t) => e(t ?? 1));
			});
			return r.catch(() => {}), {
				stdin: t.stdin === !0 ? Writable.toWeb(n.stdin) : void 0,
				stdout: Readable.toWeb(n.stdout),
				stderr: Readable.toWeb(n.stderr),
				async wait() {
					return { exitCode: await r };
				},
				async kill() {
					n.kill(`SIGKILL`), await r.catch(() => {});
				}
			};
		}
	};
}
function adaptSpawnError(e) {
	return e.code === `ENOENT` ? new DockerUnavailableError(e) : e.code === `ABORT_ERR` ? new DOMException(`The operation was aborted.`, `AbortError`) : e;
}
function throwIfAborted(e) {
	if (e?.aborted) throw new DOMException(`The operation was aborted.`, `AbortError`);
}
function firstLine(e) {
	return e.split(`
`, 1)[0]?.trim() ?? ``;
}
function getDevelopmentSandboxRunId() {
	let e = process.env["EVE_DEVELOPMENT_SANDBOX_RUN_ID"];
	return e === void 0 || e.trim() === `` ? void 0 : e;
}
function withDevelopmentSandboxTags(e) {
	let t = getDevelopmentSandboxRunId();
	return t === void 0 ? e : {
		...e,
		["devRunId"]: t
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/docker-utils.js
function expectDockerSuccess(e, t) {
	if (e.exitCode !== 0) {
		let n = e.stderr.trim() || e.stdout.trim() || `exit code ${e.exitCode}`;
		throw Error(`Failed to ${t}: ${n}`);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/docker-base-setup.js
function buildDockerBaseSetupScript() {
	return [
		`set -e`,
		`mkdir -p /workspace`,
		`command -v bash >/dev/null 2>&1 || { echo "the sandbox image must provide bash" >&2; exit 70; }`,
		`if [ ! /dev/fd -ef /proc/self/fd ]; then`,
		`  [ ! -e /dev/fd ] || { echo "the sandbox runtime must expose open descriptors through /dev/fd" >&2; exit 70; }`,
		`  [ -d /proc/self/fd ] || { echo "the sandbox runtime must provide /proc/self/fd" >&2; exit 70; }`,
		`  ln -s /proc/self/fd /dev/fd 2>/dev/null || [ /dev/fd -ef /proc/self/fd ]`,
		`fi`,
		`test /dev/fd -ef /proc/self/fd || { echo "the sandbox runtime must expose open descriptors through /dev/fd" >&2; exit 70; }`
	].join(`
`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/sandbox/provider.js
function resolveIdleTimeoutMs(e, t) {
	if (t === void 0) return 3e5;
	if (t === !1 || typeof t == `number` && Number.isFinite(t) && t >= 0) return t;
	throw Error(`Sandbox provider "${e}" received idleTimeoutMs ${typeof t == `string` ? JSON.stringify(t) : String(t)}. Pass a non-negative number of milliseconds, 0 to stop the sandbox as soon as the session goes idle, or false to never stop it.`);
}
function defineSandboxProvider(e) {
	return {
		name: e.name,
		environment(t) {
			let { idleTimeoutMs: n, prepare: r, ...i } = t ?? {};
			return createSandboxEnvironment({
				idleTimeoutMs: resolveIdleTimeoutMs(e.name, n),
				implementation: e.environment(i),
				prepare: r,
				providerName: e.name,
				stateProtocolVersion: e.stateProtocolVersion ?? 1
			});
		}
	};
}
const DOCKER_KEEPALIVE_ARGS = [`-c`, `sleep 2147483647`];
async function startDockerContainer(e) {
	let t = [
		`run`,
		`-d`,
		`--name`,
		e.containerName,
		`--label`,
		`eve.sandbox=1`,
		`--label`,
		`eve.sandbox.role=${e.role}`
	];
	for (let [n, r] of Object.entries(withDevelopmentSandboxTags(e.tags) ?? {})) t.push(`--label`, `eve.sandbox.tag.${n}=${r}`);
	for (let [n, r] of Object.entries({
		...SANDBOX_AGENT_ENV,
		...e.options.env
	})) t.push(`-e`, `${n}=${r}`);
	e.initialNetworkPolicy === `deny-all` && t.push(`--network`, `none`), e.resourcesPath !== void 0 && t.push(`--mount`, `type=bind,src=${e.resourcesPath},dst=/eve/resources,readonly`), t.push(`--workdir`, "/workspace", `--entrypoint`, `/bin/sh`, e.image, ...DOCKER_KEEPALIVE_ARGS), expectDockerSuccess(await e.cli.run(t), `start sandbox container "${e.containerName}" from "${e.image}"`);
}
async function runDockerBaseSetup(e, t) {
	expectDockerSuccess(await e.run([
		`exec`,
		`--user`,
		`root`,
		t,
		`/bin/sh`,
		`-c`,
		buildDockerBaseSetupScript()
	]), `prepare base runtime in sandbox container "${t}"`);
}
async function stopDockerContainerIfRunning(e, t) {
	await e.run([
		`stop`,
		`-t`,
		`0`,
		t
	]).catch(() => {});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/docker-network.js
function assertDockerNetworkPolicy(e) {
	if (e !== `allow-all` && e !== `deny-all`) throw Error(`The local Docker sandbox provider supports only the "allow-all" and "deny-all" network policies. Domain-level allow-lists and credential brokering require the Vercel provider (VercelSandbox).`);
}
async function setDockerNetworkPolicy(e, t, n) {
	assertDockerNetworkPolicy(n);
	let r = await e.run([
		`container`,
		`inspect`,
		`--format`,
		`{{json .NetworkSettings.Networks}}`,
		t
	]);
	expectDockerSuccess(r, `inspect networks of sandbox container "${t}"`);
	let i = JSON.parse(r.stdout.trim() === `` ? `{}` : r.stdout);
	if (typeof i != `object` || !i) throw Error(`Docker returned invalid network settings for "${t}".`);
	let a = Object.keys(i);
	if (n === `deny-all`) for (let n of a) expectDockerSuccess(await e.run([
		`network`,
		`disconnect`,
		`--force`,
		n,
		t
	]), `disconnect sandbox container "${t}" from network "${n}"`);
	else a.includes(`bridge`) || (a.includes(`none`) && expectDockerSuccess(await e.run([
		`network`,
		`disconnect`,
		`--force`,
		`none`,
		t
	]), `detach sandbox container "${t}" from the none network`), expectDockerSuccess(await e.run([
		`network`,
		`connect`,
		`bridge`,
		t
	]), `connect sandbox container "${t}" to the bridge network`));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/docker-connection.js
function createDockerConnection(e) {
	let { cli: t, containerIdentity: n } = e;
	async function killSpawnTree(e) {
		await t.run([
			`exec`,
			n,
			`bash`,
			`-c`,
			`pid_file="$1"
target="$(cat "$pid_file" 2>/dev/null)" || exit 0
[ -n "$target" ] || exit 0
kill_tree() {
  local parent="$1" dir child ppid line
  for dir in /proc/[0-9]*; do
    child="\${dir#/proc/}"
    ppid=""
    while IFS= read -r line; do
      case "$line" in
        PPid:*) ppid="\${line#PPid:}"; ppid="\${ppid//[^0-9]/}"; break ;;
      esac
    done < "$dir/status" 2>/dev/null
    [ "$ppid" = "$parent" ] && kill_tree "$child"
  done
  kill -9 "$parent" 2>/dev/null
}
kill_tree "$target"
rm -f "$pid_file"
exit 0`,
			`eve-kill-tree`,
			e
		]).catch(() => {});
	}
	return {
		extensions: { setNetworkPolicy: (e) => setDockerNetworkPolicy(t, n, e) },
		async spawn(e) {
			let r = [
				`exec`,
				...e.stdin === !0 ? [`-i`] : [],
				`-w`,
				e.workingDirectory
			];
			for (let [t, n] of Object.entries(e.env)) r.push(`-e`, `${t}=${n}`);
			let i = `/tmp/.eve-sbx-spawn-${randomUUID()}.pid`;
			let a = `echo "$$" > ${shellQuote(i)}; bash -lc ${shellQuote(e.command)}; status=$?; rm -f ${shellQuote(i)}; exit $status`;
			r.push(n, `bash`, `-c`, a);
			let o = t.stream(r, {
				signal: e.signal,
				stdin: e.stdin
			});
			return e.signal?.addEventListener(`abort`, () => void killSpawnTree(i), { once: !0 }), {
				stdin: o.stdin,
				stdout: o.stdout,
				stderr: o.stderr,
				async wait() {
					return await o.wait();
				},
				async kill() {
					await killSpawnTree(i), await o.kill();
				}
			};
		},
		async readFile(e) {
			let r = shellQuote(e.path);
			let i = await t.run([
				`exec`,
				n,
				`bash`,
				`-lc`,
				`if [ -e ${r} ]; then exec cat ${r}; else exit 43; fi`
			], { signal: e.signal });
			return i.exitCode === 43 ? null : (expectDockerSuccess(i, `read "${e.path}" from sandbox container`), i.stdoutBytes);
		},
		async removePath(e) {
			let r = `${e.recursive === !0 ? `r` : ``}${e.force === !0 ? `f` : ``}`;
			let i = [
				`exec`,
				n,
				`rm`,
				...r.length > 0 ? [`-${r}`] : [],
				`--`,
				e.path
			];
			expectDockerSuccess(await t.run(i, { signal: e.signal }), `remove "${e.path}" from sandbox container`);
		},
		stop: () => stopDockerContainerIfRunning(t, n),
		async writeFiles(e) {
			for (let r of e.files) expectDockerSuccess(await t.run([
				`exec`,
				`-i`,
				n,
				`bash`,
				`-lc`,
				`mkdir -p ${shellQuote(dirname$1(r.path))} && cat > ${shellQuote(r.path)}`
			], {
				signal: e.signal,
				stdin: r.content
			}), `write "${r.path}" into sandbox container`);
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/eve-image.js
const tag = process.env.EVE_SANDBOX_IMAGE_TAG?.trim() || `dockerfile-a22b7f0d63c2`;
const DEFAULT_EVE_SANDBOX_IMAGE = `ghcr.io/vercel/eve:${tag}`;
const VERCEL_EVE_SANDBOX_IMAGE = `vcr.vercel.com/vercel/eve/base:${tag}`;
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/docker-options.js
const DEFAULT_DOCKER_SANDBOX_IMAGE = DEFAULT_EVE_SANDBOX_IMAGE;
function resolveDockerSandboxOptions(e = {}) {
	return {
		env: e.env ?? {},
		image: e.image ?? DEFAULT_DOCKER_SANDBOX_IMAGE,
		pullPolicy: e.pullPolicy ?? `if-not-present`
	};
}
function createDockerSandboxOptionsHash(e) {
	return createHash(`sha256`).update(JSON.stringify(dockerOptionsForHash(e))).digest(`hex`).slice(0, 20);
}
function dockerOptionsForHash(e) {
	return {
		env: sortStringRecord(e.env),
		image: e.image,
		pullPolicy: e.pullPolicy
	};
}
function sortStringRecord(e) {
	return Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)));
}
function dockerTemplateImageReference(e) {
	return dockerTemplateImageReferenceFromTag(dockerTemplateImageTag(e));
}
function dockerTemplateImageReferenceFromTag(e) {
	return `eve-sandbox-template:${e}`;
}
function dockerTemplateImageTag(e) {
	return `${e.templateKey.toLowerCase()}-${e.optionsHash}`;
}
function resolveDockerTemplateMarkerPath(e, t) {
	return join(resolveDockerTemplateMarkersDirectory(e), dockerTemplateImageTag(t));
}
async function touchDockerTemplateMarker(e, t) {
	await mkdir(dirname(e), { recursive: !0 });
	try {
		let t = /* @__PURE__ */ new Date();
		await utimes(e, t, t);
	} catch {
		await writeFile(e, `${t}\n`);
	}
}
async function dockerImageExists(e, t) {
	return (await e.run([
		`image`,
		`inspect`,
		`--format`,
		`{{.Id}}`,
		t
	])).exitCode === 0;
}
async function commitDockerTemplateImage(e) {
	let t = await e.cli.run([
		`commit`,
		`--change`,
		`LABEL eve.sandbox=1`,
		`--change`,
		`LABEL eve.sandbox.role=template`,
		`--change`,
		`LABEL eve.sandbox.template-key=${e.templateKey}`,
		e.containerIdentity,
		e.imageReference
	]);
	if (t.exitCode === 0) return `committed`;
	let n = !1;
	if (/already(?:\s*|-)?exists/iu.test(`${t.stderr}\n${t.stdout}`)) {
		for (let t of [
			0,
			25,
			50,
			100,
			200,
			400,
			800
		]) if (t > 0 && await new Promise((e) => setTimeout(e, t)), await dockerImageExists(e.cli, e.imageReference)) {
			n = !0;
			break;
		}
	}
	return n || expectDockerSuccess(t, `commit sandbox template image "${e.imageReference}"`), `reused`;
}
async function ensureDockerBaseImage(e, t) {
	if (t.pullPolicy === `always`) expectDockerSuccess(await e.run([`pull`, t.image]), `pull base image "${t.image}"`);
	else if (!await dockerImageExists(e, t.image)) {
		if (t.pullPolicy === `never`) throw Error(`The local sandbox base image "${t.image}" is not present locally and pullPolicy is "never". Pull the image manually or relax the pull policy.`);
		expectDockerSuccess(await e.run([`pull`, t.image]), `pull base image "${t.image}"`);
	}
}
function resolveDockerTemplateMarkersDirectory(e) {
	return join(e, `docker`, `templates`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/dockerfile.js
async function materializeSandboxDockerfile(e) {
	let t;
	try {
		t = await e.files.read(`Dockerfile`);
	} catch (e) {
		if (e instanceof Error && `code` in e && e.code === `ENOENT`) return;
		throw e;
	}
	let n = await e.files.list();
	let r = createHash(`sha256`);
	let i = await Promise.all(n.map(async (t) => ({
		content: await e.files.read(t),
		path: t
	})));
	for (let e of i) r.update(e.path).update(`\0`).update(e.content).update(`\0`);
	let a = r.digest(`hex`);
	let o = join(e.storagePath, `dockerfiles`, a);
	try {
		return await access(join(o, `Dockerfile`)), {
			contentHash: a,
			contextPath: o,
			path: join(o, `Dockerfile`)
		};
	} catch (e) {
		if (!isFileNotFoundError(e)) throw e;
	}
	let s = `${o}.${randomUUID()}.tmp`;
	await Promise.all(i.map(async (e) => {
		let t = join(s, e.path);
		await mkdir(dirname(t), { recursive: !0 }), await writeFile(t, e.content);
	})), n.includes(`Dockerfile`) || (await mkdir(s, { recursive: !0 }), await writeFile(join(s, `Dockerfile`), t)), await mkdir(dirname(o), { recursive: !0 });
	try {
		await rename(s, o);
	} catch (e) {
		try {
			await access(join(o, `Dockerfile`));
		} catch {
			throw e;
		}
	} finally {
		await rm(s, {
			force: !0,
			recursive: !0
		});
	}
	return {
		contentHash: a,
		contextPath: o,
		path: join(o, `Dockerfile`)
	};
}
function dockerfileImageReference(e) {
	return `eve-sandbox-dockerfile:${createHash(`sha256`).update(`${e.templateKey}:${e.dockerfile.contentHash}`).digest(`hex`).slice(0, 24)}`;
}
async function buildSandboxDockerfile(e) {
	expectDockerSuccess(await e.cli.run([
		`build`,
		`--file`,
		e.dockerfile.path,
		`--tag`,
		e.imageReference,
		e.dockerfile.contextPath
	]), `build sandbox Dockerfile "${e.dockerfile.path}"`);
}
function isFileNotFoundError(e) {
	return e instanceof Error && `code` in e && e.code === `ENOENT`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/sandbox-recorded-data-error.js
function invalidSandboxSessionStateError(e) {
	return Error(`Invalid ${e} session state. This session's recorded sandbox state does not match the format this eve version expects, usually because the session started under a different eve version. Start a new session to get a fresh sandbox.`);
}
function invalidPreparedSandboxArtifactError(e) {
	return Error(`Invalid prepared ${e} artifact. The artifact recorded by \`eve build\` does not match the format this eve version expects, usually because the build used a different eve version. Run \`eve build\` with the eve version this runtime uses, then redeploy.`);
}
const templatePreparations = /* @__PURE__ */ new Map();
function createDockerSandboxProvider(e, t) {
	let n = t ?? createDockerCli();
	let r = resolveDockerSandboxOptions(e);
	let i = createDockerSandboxOptionsHash(r);
	let a;
	function ensureDaemon() {
		return a ??= assertDockerDaemonAvailable(n).catch((e) => {
			throw a = void 0, e;
		}), a;
	}
	async function inspectContainerRunning(e) {
		let t = await n.run([
			`container`,
			`inspect`,
			`--format`,
			`{{.State.Running}}`,
			e
		]);
		if (t.exitCode === 0) return t.stdout.trim() === `true`;
		/no such (?:container|object)/iu.test(t.stderr) || (a = void 0, expectDockerSuccess(t, `inspect sandbox session container "${e}"`));
	}
	async function openDockerSession(e, t, i, a, o) {
		await ensureDaemon();
		let s = await inspectContainerRunning(a);
		if (s === void 0) {
			if (!o) throw new SandboxSessionGoneError(`Docker sandbox session container "${a}" no longer exists.`);
			let c = requirePreparedDockerArtifact(i);
			if (!await dockerImageExists(n, c.imageReference)) throw new SandboxTemplateNotProvisionedError({
				providerName: "docker",
				reason: "The Docker daemon has no image with that name: it was removed, for example by `docker image prune -a`, or the build used another Docker daemon.",
				templateKey: c.imageReference
			});
			try {
				await startDockerContainer({
					cli: n,
					containerName: a,
					image: c.imageReference,
					initialNetworkPolicy: t?.networkPolicy ?? `allow-all`,
					options: r,
					role: `session`,
					tags: {
						agent: e.session.id,
						sessionId: e.session.id
					}
				}), s = !0;
			} catch (e) {
				if (s = /is already in use/u.test(toErrorMessage(e)) ? await inspectContainerRunning(a) : void 0, s === void 0) throw e;
			}
		}
		return s || expectDockerSuccess(await n.run([`start`, a]), `restart sandbox session container "${a}"`), createDockerConnection({
			cli: n,
			containerIdentity: await resolveDockerHandleIdentity(n, a)
		});
	}
	return {
		async onSessionEnd(e, t, { signal: r }) {
			await ensureDaemon();
			let i = t?.containerName ?? dockerSessionName(e);
			let a = await n.run([
				`rm`,
				`-f`,
				i
			], { signal: r });
			a.exitCode !== 0 && !/no such container/iu.test(a.stderr) && expectDockerSuccess(a, `delete sandbox session container "${i}"`);
		},
		async onSessionIdle(e, t, { signal: r }) {
			await ensureDaemon();
			let i = t?.containerName ?? dockerSessionName(e);
			let a = await n.run([
				`stop`,
				`-t`,
				`0`,
				i
			], { signal: r });
			a.exitCode !== 0 && !/no such container/iu.test(a.stderr) && expectDockerSuccess(a, `stop idle sandbox session container "${i}"`);
		},
		async prepare(e) {
			e.log(`checking Docker daemon`), await ensureDaemon();
			let t = await materializeSandboxDockerfile({
				files: e.files,
				storagePath: e.storagePath
			});
			let a = e.templateKey({
				dockerfile: t?.contentHash,
				optionsHash: i,
				version: 2
			}).slice(0, 24);
			let o = {
				optionsHash: i,
				templateKey: a
			};
			let s = dockerTemplateImageReference(o);
			let c = resolveDockerTemplateMarkerPath(e.storagePath, o);
			let l = templatePreparations.get(s);
			if (l !== void 0) return await l, await touchDockerTemplateMarker(c, s), { imageReference: s };
			let u = (async () => {
				if (e.log(`checking cached template image "${s}"`), await dockerImageExists(n, s)) {
					e.log(`reusing cached template image`);
					return;
				}
				let i = await e.resourcesDirectory();
				let o = r.image;
				t === void 0 ? (e.log(`checking base image "${r.image}"`), await ensureDockerBaseImage(n, r)) : (o = dockerfileImageReference({
					dockerfile: t,
					templateKey: a
				}), e.log(`building sandbox Dockerfile "${t.path}"`), await buildSandboxDockerfile({
					cli: n,
					dockerfile: t,
					imageReference: o
				}));
				let c = `${a}-build-${randomUUID().slice(0, 8)}`;
				e.log(`starting template build container`), await startDockerContainer({
					cli: n,
					containerName: c,
					image: o,
					initialNetworkPolicy: `allow-all`,
					options: r,
					resourcesPath: i,
					role: `template-build`
				});
				try {
					let t = await resolveDockerHandleIdentity(n, c);
					e.log(`preparing base runtime inside container`), await runDockerBaseSetup(n, t), await e.populate(createDockerConnection({
						cli: n,
						containerIdentity: t
					}), i === void 0 ? void 0 : { mountedAt: "/eve/resources" }), e.log(`stopping template build container`), expectDockerSuccess(await n.run([
						`stop`,
						`-t`,
						`0`,
						t
					]), `stop template build container "${c}"`), e.log(`committing template image "${s}"`), await commitDockerTemplateImage({
						cli: n,
						containerIdentity: t,
						imageReference: s,
						templateKey: a
					}) === `reused` && e.log(`reusing concurrently published template image`);
				} finally {
					await n.run([
						`rm`,
						`-f`,
						c
					]).catch(() => {}), t !== void 0 && await n.run([`rmi`, o]).catch(() => {});
				}
			})().finally(() => {
				templatePreparations.delete(s);
			});
			return templatePreparations.set(s, u), await u, await touchDockerTemplateMarker(c, s), { imageReference: s };
		},
		async resume(e, t, n) {
			return await openDockerSession(e, void 0, t, requireDockerSessionState(n).containerName, !1);
		},
		async start(e, t, n) {
			t?.networkPolicy !== void 0 && assertDockerNetworkPolicy(t.networkPolicy);
			let r = dockerSessionName(e);
			return {
				connection: await openDockerSession(e, t, n, r, !0),
				state: {
					containerName: r,
					version: 2
				}
			};
		}
	};
}
function dockerSessionName(e) {
	return `eve-sbx-${createSandboxProviderIdentity({
		namespace: e.storagePath,
		sessionId: e.session.id,
		version: 2
	}).slice(0, 32)}`;
}
function requirePreparedDockerArtifact(e) {
	if (!isObject(e) || typeof e.imageReference != `string`) throw invalidPreparedSandboxArtifactError(`Docker sandbox`);
	return { imageReference: e.imageReference };
}
function requireDockerSessionState(e) {
	if (!isObject(e) || e.version !== 2 || typeof e.containerName != `string`) throw invalidSandboxSessionStateError(`Docker sandbox`);
	return {
		containerName: e.containerName,
		version: 2
	};
}
async function resolveDockerHandleIdentity(e, t) {
	let n = await e.run([
		`container`,
		`inspect`,
		`--format`,
		`{{.Id}}`,
		t
	]);
	expectDockerSuccess(n, `resolve sandbox container identity for "${t}"`);
	let r = n.stdout.trim();
	if (r.length === 0) throw Error(`Docker returned an empty identity for sandbox container "${t}".`);
	return r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/setup/scaffold/workspace-glob.js
function escapeRegex(e) {
	return e.replace(/[\\^$+?.()|[\]{}]/gu, `\\$&`);
}
function workspacePatternToRegex(e) {
	let t = e.replaceAll(`\\`, `/`).replace(/^\.\/+/u, ``);
	let n = `^`;
	for (let e = 0; e < t.length; e += 1) {
		let r = t[e];
		r === `*` ? t[e + 1] === `*` ? (n += `.*`, e += 1) : n += `[^/]*` : n += escapeRegex(r ?? ``);
	}
	return n += `$`, new RegExp(n, `u`);
}
function workspaceRelativePath(e, t) {
	return relative(e, resolve(t)).split(sep).join(`/`);
}
function workspacePatternClaimsRelativePath(e, t) {
	let n = e.replaceAll(`\\`, `/`).replace(/^\.\/+/u, ``);
	return n === `.` || n === t || workspacePatternToRegex(n).test(t);
}
function workspacePatternsClaimProject(e, t, n) {
	let r = workspaceRelativePath(t, n);
	let i = e.filter((e) => !e.startsWith(`!`));
	let a = e.filter((e) => e.startsWith(`!`)).map((e) => e.slice(1));
	return i.some((e) => workspacePatternClaimsRelativePath(e, r)) ? !a.some((e) => workspacePatternClaimsRelativePath(e, r)) : !1;
}
[
	`minimumReleaseAge: 0`,
	`minimumReleaseAgeStrict: true`,
	`allowBuilds:`,
	...[{
		name: `esbuild`,
		line: `  esbuild: true`
	}, {
		name: `sharp`,
		line: `  sharp: false`
	}].map(({ line: e }) => e),
	``
].join(`
`);
function findAncestorPnpmWorkspaceRoot(e) {
	let t = dirname(resolve(e));
	for (;;) {
		if (existsSync(join(t, `pnpm-workspace.yaml`))) return t;
		let e = dirname(t);
		if (e === t) return;
		t = e;
	}
}
function parsePnpmWorkspacePackagePatterns(e) {
	let t = e.split(/\r?\n/u);
	let n = t.findIndex((e) => /^\s*packages:/u.test(e));
	if (n < 0) return;
	let r = /^\s*packages:\s*\[(.*)\]\s*(?:#.*)?$/u.exec(t[n] ?? ``);
	if (r !== null) {
		let e = r[1].trim();
		return e.length === 0 ? [] : e.split(`,`).map((e) => e.trim().replace(/^['"]|['"]$/gu, ``)).filter((e) => e.length > 0);
	}
	if (t[n]?.trim() !== `packages:`) return;
	let i = [];
	for (let e of t.slice(n + 1)) {
		if (/^\S/u.test(e)) break;
		let t = /^\s*-\s*(.+?)\s*$/u.exec(e);
		t !== null && i.push(t[1].replace(/^['"]|['"]$/gu, ``));
	}
	return i;
}
function findClaimingAncestorPnpmWorkspaceRoot(e) {
	let t = findAncestorPnpmWorkspaceRoot(e);
	if (t === void 0) return;
	let n;
	try {
		n = parsePnpmWorkspacePackagePatterns(readFileSync(join(t, "pnpm-workspace.yaml"), `utf8`));
	} catch {
		return t;
	}
	return n === void 0 || workspacePatternsClaimProject(n, t, e) ? t : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/setup/primitives/pm/pnpm-build-policy.js
function blockRange(e, t) {
	let n = e.findIndex((e) => RegExp(`^${t}:`).test(e));
	if (n < 0) return;
	if (!RegExp(`^${t}:\\s*(?:#.*)?$`).test(e[n] ?? ``)) throw Error(`Cannot safely update ${t} because it does not use block-style YAML in pnpm-workspace.yaml.`);
	let r = n + 1;
	for (; r < e.length && !/^\S/u.test(e[r] ?? ``);) r += 1;
	return {
		start: n,
		end: r
	};
}
function unquoteYamlScalar(e) {
	let t = e.trim();
	if (t.startsWith(`"`) && t.endsWith(`"`)) try {
		let e = JSON.parse(t);
		if (typeof e == `string`) return e;
	} catch {
		return t;
	}
	return t.startsWith(`'`) && t.endsWith(`'`) ? t.slice(1, -1).replaceAll(`''`, `'`) : t;
}
function mappingEntry(e) {
	let t = /^\s+("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^:#][^:]*?):\s*(true|false)\s*(?:#.*)?$/u.exec(e);
	if (t !== null) return {
		key: unquoteYamlScalar(t[1]),
		value: t[2] === `true`
	};
}
function sequenceEntry(e) {
	let t = /^\s+-\s+(.*?)(?:\s+#.*)?$/u.exec(e);
	return t === null ? void 0 : unquoteYamlScalar(t[1]);
}
function policyEntries(e, t, n) {
	let r = blockRange(e, t);
	let i = /* @__PURE__ */ new Map();
	if (r === void 0) return i;
	for (let t of e.slice(r.start + 1, r.end)) if (n === `mapping`) {
		let e = mappingEntry(t);
		e !== void 0 && i.set(e.key, e.value);
	} else {
		let e = sequenceEntry(t);
		e !== void 0 && i.set(e, !0);
	}
	return i;
}
function removePolicyEntries(e, t, n, r) {
	let i = blockRange(e, t);
	if (i === void 0) return;
	for (let t = i.end - 1; t > i.start; --t) {
		let i = n === `mapping` ? mappingEntry(e[t] ?? ``)?.key : sequenceEntry(e[t] ?? ``);
		i !== void 0 && r.has(i) && e.splice(t, 1);
	}
	let a = blockRange(e, t);
	if (a !== void 0 && !e.slice(a.start + 1, a.end).some((e) => (n === `mapping` ? mappingEntry(e) : sequenceEntry(e)) !== void 0)) {
		let t = e.slice(a.start + 1, a.end).filter((e) => e.trimStart().startsWith(`#`));
		e.splice(a.start, a.end - a.start, ...t);
	}
}
function appendPolicyEntries(e, t, n, r) {
	let i = blockRange(e, t);
	if (i === void 0) {
		for (; e.at(-1) === ``;) e.pop();
		e.length > 0 && e.push(``), e.push(`${t}:`), i = {
			start: e.length - 1,
			end: e.length
		};
	}
	let a = policyEntries(e, t, n);
	let o = r.filter((e) => !a.has(e));
	if (o.length === 0) return;
	let s = o.map((e) => n === `mapping` ? `  ${JSON.stringify(e)}: true` : `  - ${JSON.stringify(e)}`);
	e.splice(i.end, 0, ...s);
}
function withPnpmBuildPolicy(e, t, n) {
	let r = [...new Set(t)].sort();
	let i = new Set(r);
	let a = e.replace(/\r\n/gu, `
`).split(`
`);
	for (removePolicyEntries(a, `allowBuilds`, `mapping`, i), removePolicyEntries(a, `ignoredOptionalDependencies`, `sequence`, i), n === `allow-builds` ? appendPolicyEntries(a, `allowBuilds`, `mapping`, r) : appendPolicyEntries(a, `ignoredOptionalDependencies`, `sequence`, r); a.at(-1) === ``;) a.pop();
	return `${a.join(`
`)}\n`;
}
function withPnpmOptionalDependencyDefaults(e, t) {
	let n = e.replace(/\r\n/gu, `
`).split(`
`);
	let r = [
		policyEntries(n, `allowBuilds`, `mapping`),
		policyEntries(n, `ignoredOptionalDependencies`, `sequence`),
		policyEntries(n, `onlyBuiltDependencies`, `sequence`),
		policyEntries(n, `ignoredBuiltDependencies`, `sequence`)
	];
	let i = t.filter((e) => !r.some((t) => t.has(e)));
	return i.length === 0 ? e : withPnpmBuildPolicy(e, i, `ignore-optional`);
}
async function ensurePnpmOptionalDependencyDefaults(e, t) {
	let n = join(await owningPnpmWorkspaceRoot(e), "pnpm-workspace.yaml");
	let r = await readWorkspacePolicy(n);
	let i = withPnpmOptionalDependencyDefaults(r, t);
	i !== r && (await writeFile(n, i, `utf8`), console.info(`[eve:dev] updated optional dependency defaults in "${n}".`));
}
async function readWorkspacePolicy(e) {
	try {
		return await readFile(e, `utf8`);
	} catch (e) {
		if (e.code === `ENOENT`) return ``;
		throw e;
	}
}
async function owningPnpmWorkspaceRoot(e) {
	try {
		return await access(join(e, "pnpm-workspace.yaml")), e;
	} catch (e) {
		if (e.code !== `ENOENT`) throw e;
	}
	return findClaimingAncestorPnpmWorkspaceRoot(e) ?? e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/optional-package-import.js
async function importInstalledEnginePackage(e) {
	return await import(await resolveInstalledEnginePackageEntrypointHref(e));
}
async function importOptionalEnginePackage(e) {
	try {
		return await e.importModule();
	} catch (t) {
		try {
			return await importInstalledEnginePackage(e);
		} catch (n) {
			throw Error(e.missingMessage, { cause: AggregateError([t, n]) });
		}
	}
}
async function resolveInstalledEnginePackageEntrypointHref(e) {
	let t = findInstalledPackageRoot(e);
	let n = join(t, `package.json`);
	let r = resolvePackageEntryPoint(JSON.parse(await readFile(n, `utf8`)));
	if (r.startsWith(`/`)) throw Error(`Invalid absolute entrypoint for optional package "${e.packageName}".`);
	return pathToFileURL(join(t, r)).href;
}
function findInstalledPackageRoot(e) {
	let t = e.packageName.split(`/`);
	let n = [];
	let r = e.appRoot;
	for (;;) {
		let i = join(r, `node_modules`, ...t);
		if (n.push(i), existsSync(join(i, `package.json`))) return i;
		let a = dirname(r);
		if (a === r) throw Error(`Could not find installed optional dependency "${e.packageName}". Checked: ${n.join(`, `)}`);
		r = a;
	}
}
function resolvePackageEntryPoint(e) {
	let t = readDotExport(e.exports);
	return t === void 0 ? typeof e.module == `string` && e.module.length > 0 ? e.module : typeof e.main == `string` && e.main.length > 0 ? e.main : `index.js` : t;
}
function readDotExport(e) {
	if (typeof e == `string` && e.length > 0) return e;
	if (typeof e != `object` || !e) return;
	let t = `.` in e ? e[`.`] : e;
	if (typeof t == `string` && t.length > 0) return t;
	if (typeof t != `object` || !t) return;
	let n = t;
	if (typeof n.import == `string` && n.import.length > 0) return n.import;
	if (typeof n.default == `string` && n.default.length > 0) return n.default;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/optional-package-install.js
function detectProjectPackageManager(e) {
	return resolveProjectInstallation(e).packageManager;
}
function resolveProjectInstallation(e) {
	let t = resolve(e);
	try {
		t = realpathSync.native(t);
	} catch {}
	let n = t;
	for (;;) {
		if (existsSync(join(t, `pnpm-lock.yaml`)) || existsSync(join(t, `pnpm-workspace.yaml`))) return {
			root: t,
			packageManager: `pnpm`
		};
		if (existsSync(join(t, `yarn.lock`))) return {
			root: t,
			packageManager: `yarn`
		};
		if (existsSync(join(t, `bun.lock`)) || existsSync(join(t, `bun.lockb`))) return {
			root: t,
			packageManager: `bun`
		};
		if (existsSync(join(t, `package-lock.json`))) return {
			root: t,
			packageManager: `npm`
		};
		let e = dirname(t);
		if (e === t) return {
			root: n,
			packageManager: `npm`
		};
		t = e;
	}
}
const INSTALL_ARGUMENTS = {
	bun: [`add`, `--dev`],
	npm: [`install`, `--save-dev`],
	pnpm: [`add`, `-D`],
	yarn: [`add`, `-D`]
};
const OPTIONAL_PACKAGE_LOCK_TIMEOUT_MS = 6e5;
const pendingOptionalPackageInstalls = /* @__PURE__ */ new Map();
async function installPackageIntoProject(e) {
	let t = detectProjectPackageManager(e.appRoot);
	t === `pnpm` && e.ignoredOptionalDependencies?.length && await ensurePnpmOptionalDependencyDefaults(e.appRoot, e.ignoredOptionalDependencies);
	let n = [...INSTALL_ARGUMENTS[t], e.packageName];
	console.info(`[eve:dev] installing optional dependency "${e.packageName}" via \`${t} ${n.join(` `)}\`...`);
	let r = spawn(t, n, {
		cwd: e.appRoot,
		shell: shouldSpawnPackageManagerWithShell(),
		stdio: [
			`ignore`,
			`pipe`,
			`pipe`
		],
		windowsHide: !0
	});
	let i = [];
	r.stdout?.on(`data`, (e) => i.push(e)), r.stderr?.on(`data`, (e) => i.push(e));
	let a = await new Promise((e, t) => {
		r.on(`error`, t), r.on(`close`, (t) => e(t ?? 1));
	});
	if (a !== 0) {
		let n = Buffer.concat(i).toString(`utf8`).trim();
		throw Error(`Failed to install "${e.packageName}" with ${t} (exit ${a}).` + (n.length > 0 ? `\n${n.slice(-2e3)}` : ``));
	}
	console.info(`[eve:dev] installed "${e.packageName}".`);
}
async function loadOptionalEnginePackage(e) {
	try {
		return await e.importModule();
	} catch (t) {
		if (!e.autoInstall || !isEveDevEnvironment()) throw Error(e.missingMessage, { cause: t });
		let n = e.importInstalledModule ?? (async () => await importInstalledEnginePackage({
			appRoot: e.appRoot,
			packageName: e.packageName
		}));
		let r = e.importInstalledModule === void 0 ? async () => await isInstalledEnginePackageLoadable(e) : async () => {
			try {
				return await n(), !0;
			} catch {
				return !1;
			}
		};
		try {
			await withOptionalPackageInstallLock(e, async () => {
				await r() || await installPackageIntoProject({
					appRoot: e.appRoot,
					packageName: e.installPackageName ?? e.packageName,
					ignoredOptionalDependencies: e.ignoredOptionalDependencies
				});
			});
		} catch (t) {
			throw Error(`${e.missingMessage} Automatic installation failed: ${toMessage(t)}`, { cause: t });
		}
		try {
			return await n();
		} catch (t) {
			throw Error(`${e.missingMessage} Automatic installation completed, but "${e.packageName}" still could not be loaded from "${e.appRoot}". This usually means the package manager installed into a different workspace, node_modules is unavailable, or the Node/package-manager environment changed while eve dev was running. Last load error: ${toMessage(t)}`, { cause: t });
		}
	}
}
async function isInstalledEnginePackageLoadable(e) {
	try {
		return await importEntrypointInWorker(await resolveInstalledEnginePackageEntrypointHref(e)), !0;
	} catch {
		return !1;
	}
}
async function importEntrypointInWorker(e) {
	let t = new Worker(`
const { parentPort, workerData } = require("node:worker_threads");

(async () => {
  try {
    await import(workerData.entrypointHref);
    parentPort.postMessage({ ok: true });
  } catch (error) {
    parentPort.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
})();
`, {
		eval: !0,
		workerData: { entrypointHref: e }
	});
	await new Promise((e, n) => {
		let r = !1;
		let settle = (e) => {
			r || (r = !0, t.off(`error`, handleError), t.off(`exit`, handleExit), t.off(`message`, handleMessage), t.terminate().catch(() => {}), e());
		};
		let handleError = (e) => settle(() => n(e));
		let handleExit = (e) => {
			e !== 0 && settle(() => n(Error(`Optional dependency worker exited before loading module (code ${e}).`)));
		};
		let handleMessage = (t) => {
			let r = t;
			settle(() => {
				r.ok === !0 ? e() : n(Error(typeof r.message == `string` ? r.message : `Optional dependency worker failed to load module.`));
			});
		};
		t.once(`error`, handleError), t.once(`exit`, handleExit), t.once(`message`, handleMessage);
	});
}
async function withOptionalPackageInstallLock(e, t) {
	let n = resolveProjectInstallation(e.appRoot).root;
	let r = (pendingOptionalPackageInstalls.get(n) ?? Promise.resolve()).catch(() => {}).then(() => withOptionalPackageInstallFileLock(n, t));
	pendingOptionalPackageInstalls.set(n, r);
	try {
		await r;
	} finally {
		pendingOptionalPackageInstalls.get(n) === r && pendingOptionalPackageInstalls.delete(n);
	}
}
async function withOptionalPackageInstallFileLock(e, t) {
	let n = join(e, `.eve`, `optional-package-install.lock`);
	await acquireLock(n);
	try {
		await t();
	} finally {
		await rm(n, {
			force: !0,
			recursive: !0
		}).catch(() => {});
	}
}
async function acquireLock(e) {
	let t = Date.now();
	for (;;) {
		await mkdir(dirname(e), { recursive: !0 });
		try {
			await mkdir(e), await writeFile(join(e, `owner.json`), `${JSON.stringify({
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				pid: process.pid
			})}\n`);
			return;
		} catch (n) {
			if (!isFileExistsError(n)) throw n;
			await waitForExistingLock(e, t);
		}
	}
}
async function waitForExistingLock(e, t) {
	let n = await stat(e).catch((e) => {
		if (isNotFoundError(e)) return null;
		throw e;
	});
	if (n !== null) {
		if (Date.now() - n.mtimeMs > 18e5) await rm(e, {
			force: !0,
			recursive: !0
		}).catch(() => {});
		else {
			if (Date.now() - t > OPTIONAL_PACKAGE_LOCK_TIMEOUT_MS) throw Error(`Timed out waiting for optional package install lock "${e}" after ${OPTIONAL_PACKAGE_LOCK_TIMEOUT_MS}ms.`);
			await new Promise((e) => setTimeout(e, 250));
		}
	}
}
function shouldSpawnPackageManagerWithShell(e = process.platform) {
	return e === `win32`;
}
function isFileExistsError(e) {
	return typeof e == `object` && !!e && `code` in e && e.code === `EEXIST`;
}
function isNotFoundError(e) {
	return typeof e == `object` && !!e && `code` in e && e.code === `ENOENT`;
}
function toMessage(e) {
	return e instanceof Error ? e.message : String(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/multiplexed-command.js
function createOutputChannel() {
	let e = !1;
	let t;
	return {
		stream: new ReadableStream({
			cancel() {
				e = !0;
			},
			start(e) {
				t = e;
			}
		}),
		close() {
			e || t.close();
		},
		enqueue(n) {
			e || t.enqueue(n);
		},
		error(n) {
			e || t.error(n);
		}
	};
}
function createStdinStream(e, t) {
	let n;
	return new WritableStream({
		start(e) {
			n = AbortSignal.any([...t, e.signal]);
		},
		async write(t) {
			await e.writeStdin(t, { abortSignal: n });
		},
		async close() {
			await e.closeStdin({ abortSignal: n });
		},
		async abort() {
			let n = AbortSignal.any([...t]);
			n.aborted || await e.closeStdin({ abortSignal: n });
		}
	});
}
function adaptMultiplexedCommandToSandboxProcess(e) {
	let { abortSignal: t, command: n } = e;
	let r = new TextEncoder();
	let i = createOutputChannel();
	let a = createOutputChannel();
	let o = {
		stderr: a,
		stdout: i
	};
	let s = (async () => {
		try {
			for await (let i of n.logs({ signal: t })) o[e.getOutput(i)].enqueue(r.encode(i.data));
			i.close(), a.close();
		} catch (e) {
			let n = t?.aborted ? t.reason : e;
			throw i.error(n), a.error(n), n;
		}
	})();
	let c;
	let l;
	let u = new AbortController();
	let kill = () => (u.abort(), l ??= Promise.resolve().then(() => n.kill()));
	let killOnAbort = () => void kill().catch(() => void 0);
	let disarmKill = () => t?.removeEventListener(`abort`, killOnAbort);
	return t?.aborted && killOnAbort(), t?.addEventListener(`abort`, killOnAbort, { once: !0 }), s.then(disarmKill, () => void 0), {
		stdin: e.stdin === void 0 ? void 0 : createStdinStream(e.stdin, t === void 0 ? [u.signal] : [u.signal, t]),
		stderr: a.stream,
		stdout: i.stream,
		wait() {
			return c ??= Promise.resolve().then(async () => {
				let e = await n.wait({ signal: t });
				return disarmKill(), await s, { exitCode: e.exitCode };
			});
		},
		kill
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/just-bash-runtime.js
const JUST_BASH_PACKAGE = {
	importModule: async () => await import(`just-bash`),
	missingMessage: "The just-bash sandbox provider requires the `just-bash` package, which is not bundled with eve. Install it in your application (for example `pnpm add -D just-bash`), or use DockerSandbox or DefaultSandbox instead.",
	packageName: `just-bash`
};
async function installJustBashModule(e) {
	return await loadOptionalEnginePackage({
		...JUST_BASH_PACKAGE,
		appRoot: e.appRoot,
		autoInstall: e.autoInstall,
		ignoredOptionalDependencies: [`@mongodb-js/zstd`, `node-liblzma`]
	});
}
async function importJustBashModule(e) {
	return await importOptionalEnginePackage({
		...JUST_BASH_PACKAGE,
		appRoot: e
	});
}
async function createBashSandbox(e) {
	let { justBash: t } = e;
	let n = resolveLocalSandboxFilesystemRootPath(e.rootPath);
	let r = resolveLocalSandboxMetadataPath(e.rootPath);
	let i = await readLocalMetadata(r);
	await mkdir(n, { recursive: !0 });
	let a = new t.ReadWriteFs({
		allowSymlinks: !0,
		maxFileReadSize: 2 ** 53 - 1,
		root: n
	});
	let o = a;
	let s = e.experimental?.filesystem;
	if (s !== void 0) try {
		o = await s({
			defaultFilesystem: a,
			resolveProjectPath: (t) => e.resolveProjectPath(t),
			storagePath: e.storagePath,
			justBash: t
		});
	} catch (e) {
		throw Error(`Failed to create the custom just-bash filesystem.`, { cause: e });
	}
	await o.mkdir("/workspace", { recursive: !0 });
	let c = await t.Sandbox.create({
		cwd: "/workspace",
		customCommands: [t.defineCommand(`realpath`, async (e, t) => {
			let n = e.at(-1);
			if (e.length !== 4 || e[0] !== `-e` || e[1] !== `-z` || e[2] !== `--` || !n) return {
				stdout: ``,
				stderr: `realpath: expected -e -z -- path`,
				exitCode: 2
			};
			try {
				let e = await t.fs.realpath(n);
				return await t.fs.stat(e), {
					stdout: e + `\0`,
					stderr: ``,
					exitCode: 0
				};
			} catch (e) {
				return {
					stdout: ``,
					stderr: `realpath: ${String(e)}`,
					exitCode: 1
				};
			}
		}), ...e.experimental?.customCommands ?? []],
		env: i === null ? void 0 : { ...i.env },
		fs: o,
		network: { dangerouslyAllowFullInternetAccess: !0 }
	});
	return {
		async captureState() {
			await writeLocalMetadata(r, {
				env: { ...c.bashEnvInstance.getEnv() },
				version: 1
			});
		},
		async readFile({ path: e }) {
			try {
				return await o.readFileBuffer(e);
			} catch (t) {
				if (!await o.exists(e)) return null;
				throw t;
			}
		},
		async removePath(e) {
			await o.rm(e.path, {
				force: e.force,
				recursive: e.recursive
			});
		},
		async spawn(e) {
			if (e.signal?.aborted) throw new DOMException(`The operation was aborted.`, `AbortError`);
			if (e.stdin === !0) throw Error("The just-bash sandbox does not support `stdin` on spawn yet.");
			let t = `( cd ${shellQuote(e.workingDirectory)} && {\n${e.command}\n} )`;
			return adaptMultiplexedCommandToSandboxProcess({
				command: await c.runCommand({
					args: [t],
					cmd: `eval`,
					detached: !0,
					env: {
						...SANDBOX_AGENT_ENV,
						...e.env
					},
					signal: e.signal
				}),
				getOutput: (e) => e.type
			});
		},
		async stop() {
			await c.stop();
		},
		async writeFiles({ files: e }) {
			for (let t of e) await o.mkdir(dirname(t.path), { recursive: !0 }), await o.writeFile(t.path, t.content);
		}
	};
}
function resolveLocalSandboxFilesystemRootPath(e) {
	return `${e}/fs`;
}
function resolveLocalSandboxMetadataPath(e) {
	return `${e}/metadata.json`;
}
async function readLocalMetadata(e) {
	if (!await pathExists(e)) return null;
	let t = JSON.parse(await readFile(e, `utf8`));
	return !isObject(t) || t.version !== 1 || !isStringRecord(t.env) ? null : {
		env: t.env,
		version: 1
	};
}
async function writeLocalMetadata(e, t) {
	await mkdir(dirname(e), { recursive: !0 }), await writeFile(e, `${JSON.stringify(t, null, 2)}\n`);
}
function isStringRecord(e) {
	return isObject(e) && Object.values(e).every((e) => typeof e == `string`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/just-bash.js
const JUST_BASH_CACHE_DIRECTORY_NAME = `just-bash`;
function createJustBashSandboxProvider(e = {}) {
	let t = e.autoInstall ?? !0;
	async function connect(t, n) {
		return await createBashSandbox({
			experimental: e.experimental,
			justBash: await importJustBashModule(t.resolveProjectPath(`.`)),
			resolveProjectPath: (e) => t.resolveProjectPath(e),
			rootPath: n,
			storagePath: t.storagePath
		});
	}
	return {
		async onSessionEnd(e, t) {
			await rm(t?.rootPath ?? sessionRootPath(e), {
				force: !0,
				recursive: !0
			});
		},
		async prepare(e) {
			let n = e.templateKey({ version: 2 }).slice(0, 24);
			let r = resolveTemplateRootPath(e.storagePath, n);
			if (await pathExists(r)) return await touchDirectory(r), e.log(`reusing cached template filesystem`), { templateKey: n };
			let i = `${r}.${randomUUID()}.tmp`;
			let a = !1;
			let o = await createBashSandbox({
				justBash: await installJustBashModule({
					appRoot: e.resolveProjectPath(`.`),
					autoInstall: t
				}),
				resolveProjectPath: (t) => e.resolveProjectPath(t),
				rootPath: i,
				storagePath: e.storagePath
			});
			try {
				await e.populate(o), await o.captureState(), await mkdir(dirname(r), { recursive: !0 });
				try {
					await rename(i, r), a = !0;
				} catch (e) {
					if (await pathExists(r)) return { templateKey: n };
					throw e;
				}
			} finally {
				await o.stop(), a || await rm(i, {
					force: !0,
					recursive: !0
				});
			}
			return { templateKey: n };
		},
		async resume(e, t, n) {
			let { rootPath: r } = requireJustBashSessionState(n);
			if (!await pathExists(r)) throw new SandboxSessionGoneError(`just-bash session root "${r}" no longer exists.`);
			return await connect(e, r);
		},
		async start(e, t, n) {
			let r = requirePreparedJustBashArtifact(n);
			let i = sessionRootPath(e);
			return await ensureSessionRoot(resolveTemplateRootPath(e.storagePath, r.templateKey), i), {
				connection: await connect(e, i),
				state: {
					rootPath: i,
					version: 2
				}
			};
		},
		toolSessions: !0
	};
}
function sessionRootPath(e) {
	return resolveSessionRootPath(e.storagePath, createSandboxProviderIdentity({
		sessionId: e.session.id,
		version: 2
	}).slice(0, 24));
}
async function ensureSessionRoot(e, t) {
	if (!await pathExists(t)) {
		if (!await pathExists(e)) throw new SandboxTemplateNotProvisionedError({
			providerName: "just-bash",
			reason: `The template directory does not exist: it was deleted, or the build ran on another machine.`,
			templateKey: e
		});
		await copyDirectoryAtomically(e, t);
	}
}
function requirePreparedJustBashArtifact(e) {
	if (!isObject(e) || typeof e.templateKey != `string`) throw invalidPreparedSandboxArtifactError(`just-bash sandbox`);
	return { templateKey: e.templateKey };
}
function requireJustBashSessionState(e) {
	if (!isObject(e) || e.version !== 2 || typeof e.rootPath != `string`) throw invalidSandboxSessionStateError(`just-bash sandbox`);
	return {
		rootPath: e.rootPath,
		version: 2
	};
}
function resolveTemplateRootPath(e, t) {
	return resolveLocalProviderTemplateRootPath(e, JUST_BASH_CACHE_DIRECTORY_NAME, t);
}
function resolveSessionRootPath(e, t) {
	return resolveLocalProviderSessionRootPath(e, JUST_BASH_CACHE_DIRECTORY_NAME, t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/sandbox/providers/docker.js
function defineDockerSandboxProvider(e) {
	return defineSandboxProvider({
		name: "docker",
		environment: (t) => createDockerSandboxProvider(t, e)
	});
}
const provider = defineDockerSandboxProvider();
const DockerSandbox = {
	...provider,
	dockerfile(e = {}) {
		return provider.environment(e);
	},
	image(e, t = {}) {
		return provider.environment({
			...t,
			image: e
		});
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/sandbox/providers/just-bash.js
const JustBashSandbox = defineSandboxProvider({
	name: `just-bash`,
	environment: (e) => createJustBashSandboxProvider(e)
});
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-timeout.js
const log = createLogger(`execution.sandbox.vercel`);
function createVercelTimeout(e) {
	let t = Math.max(1, Math.min(6e4, Math.floor((e.timeout ?? 18e5) / 3)));
	let n = 0;
	let r = !1;
	let i;
	let a;
	let o;
	let s = 0;
	let c = !1;
	async function extend() {
		try {
			let i = e.timeout;
			if (i === void 0 || r || n === 0 || Date.now() < s) return;
			let a = e.currentSession();
			if (a.status !== `running` && a.status !== `pending`) return;
			let l = (a.startedAt ?? a.createdAt).getTime() + a.timeout - Date.now();
			if (l <= 0 || l > i / 2) return;
			s = Date.now() + t;
			let u = new AbortController();
			o = u, await a.extendTimeout(i - l, { signal: AbortSignal.any([u.signal, AbortSignal.timeout(Math.min(1e4, t))]) }), c = !1;
		} catch (t) {
			o?.signal.aborted ? s = 0 : c || (c = !0, log.warn(`failed to extend an active Vercel sandbox's timeout; its current deadline still applies`, {
				error: t,
				sandboxName: e.name
			}));
		} finally {
			o = void 0;
		}
	}
	async function renew() {
		return await a, a ??= extend().finally(() => {
			a = void 0;
		});
	}
	function schedule() {
		r || n === 0 || i !== void 0 || (i = setTimeout(() => {
			i = void 0, renew().then(schedule);
		}, t), i.unref());
	}
	async function acquire(e) {
		if (e?.throwIfAborted(), r) throw Error(`The Vercel sandbox connection is closed. Request the sandbox again before using it.`);
		n++;
		let t = !1;
		let release = () => {
			t || (t = !0, e?.removeEventListener(`abort`, release), --n === 0 && (clearTimeout(i), i = void 0, o?.abort()));
		};
		if (e?.addEventListener(`abort`, release, { once: !0 }), await renew(), schedule(), r) throw release(), Error(`The Vercel sandbox connection closed before the operation started.`);
		return e?.throwIfAborted(), release;
	}
	return {
		acquire,
		async run(e, t) {
			let n = await acquire(t);
			try {
				return await e();
			} finally {
				n();
			}
		},
		async close() {
			r = !0, clearTimeout(i), i = void 0, o?.abort(), await a;
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-errors.js
function isVercelSnapshotUnavailableError(e) {
	return errorChainContainsStatus(e, 410);
}
function isVercelSnapshotNotFoundError(e) {
	for (let t of walkErrorChain(e)) if (readErrorStatus(t) === 410 && isObject(t) && (isObject(t.json) && isObject(t.json.error) ? t.json.error : void 0)?.code === `snapshot_not_found`) return !0;
	return !1;
}
function isVercelSandboxNameConflictError(e) {
	for (let t of walkErrorChain(e)) {
		let e = readErrorStatus(t);
		if (e === 409 || e === 400 && /\bsandbox with the name\b.*\balready exists\b/is.test(readErrorText(t))) return !0;
	}
	return !1;
}
function readErrorText(e) {
	if (!isObject(e)) return ``;
	let t = [];
	typeof e.message == `string` && t.push(e.message), typeof e.text == `string` && t.push(e.text);
	let n = isObject(e.json) && isObject(e.json.error) ? e.json.error : void 0;
	return n !== void 0 && typeof n.message == `string` && t.push(n.message), t.join(`
`);
}
function isVercelSandboxMissingError(e) {
	return errorChainContainsStatus(e, 404);
}
function errorChainContainsStatus(e, t) {
	for (let n of walkErrorChain(e)) if (readErrorStatus(n) === t) return !0;
	return !1;
}
function readErrorStatus(e) {
	if (isObject(e)) return typeof e.status == `number` ? e.status : typeof e.statusCode == `number` ? e.statusCode : isObject(e.response) && typeof e.response.status == `number` ? e.response.status : void 0;
}
function* walkErrorChain(e) {
	let t = e;
	let n = /* @__PURE__ */ new Set();
	for (; t != null && !n.has(t);) n.add(t), yield t, t = isObject(t) ? t.cause : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-credentials.js
function getVercelSandboxFetch(e) {
	let t = Reflect.get(e, `fetch`);
	return withPackageUserAgent(typeof t == `function` ? t : void 0);
}
async function getVercelSandboxCredentials(e) {
	let t = readNonEmptyString(e, `teamId`) ?? readNonEmptyEnvironmentVariable(`VERCEL_TEAM_ID`) ?? readNonEmptyEnvironmentVariable(`VERCEL_ORG_ID`);
	let n = readNonEmptyString(e, `projectId`) ?? readNonEmptyEnvironmentVariable(`VERCEL_PROJECT_ID`);
	let withIds = (e) => e && t && n ? {
		projectId: n,
		teamId: t,
		token: e
	} : void 0;
	let r = withIds(readNonEmptyString(e, `token`));
	if (r) return r;
	let i = withIds(readNonEmptyEnvironmentVariable(`VERCEL_TOKEN`));
	if (i && !readNonEmptyEnvironmentVariable(`VERCEL_OIDC_TOKEN`)) return i;
	try {
		let e = await getVercelOidcToken({
			project: n,
			team: t,
			expirationBufferMs: 3e5
		});
		return withIds(e) ?? getVercelSandboxCredentialsFromOidcToken(e);
	} catch (e) {
		if (i) return i;
		throw e;
	}
}
async function resolveVercelSandboxCredentials(e) {
	try {
		return await getVercelSandboxCredentials(e);
	} catch {
		return {};
	}
}
function readNonEmptyString(e, t) {
	let n = Reflect.get(e, t);
	return typeof n == `string` && n.trim().length > 0 ? n.trim() : void 0;
}
function readNonEmptyEnvironmentVariable(e) {
	let t = process.env[e];
	return typeof t == `string` && t.trim().length > 0 ? t.trim() : void 0;
}
function getVercelSandboxCredentialsFromOidcToken(e) {
	let t = decodeVercelOidcTokenClaims(e);
	if (t.ownerId === void 0 || t.projectId === void 0) throw Error(`Invalid Vercel OIDC token: missing owner_id or project_id.`);
	return {
		projectId: t.projectId,
		teamId: t.ownerId,
		token: e
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-options.js
function resolveVercelSandboxTags(e, t) {
	let n = {};
	if (e !== void 0) for (let [t, r] of Object.entries(e)) n[t] = r;
	if (t !== void 0) for (let [e, r] of Object.entries(t)) n[e] = r;
	let r = Object.keys(n).length;
	if (r !== 0) {
		if (r > 5) throw Error(`Vercel Sandbox supports at most 5 tags. eve reserves "agent", "channel", and "sessionId"; remove or consolidate custom tags.`);
		return n;
	}
}
async function ensureVercelSandboxTags(e, t) {
	t === void 0 || areVercelSandboxTagsEqual(e.tags, t) || await e.update({ tags: t });
}
function areVercelSandboxTagsEqual(e, t) {
	let n = e ?? {};
	let r = Object.entries(n);
	let i = Object.entries(t);
	return r.length === i.length && i.every(([e, t]) => n[e] === t);
}
function errorMessage(e) {
	if (e instanceof Error) {
		let t = Reflect.get(e, `json`);
		let n = Reflect.get(e, `text`);
		let r = typeof n == `string` && n.length > 0 ? n : t === void 0 ? void 0 : JSON.stringify(t);
		return r === void 0 ? e.message : `${e.message}: ${r}`;
	}
	return String(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-lookup.js
async function getNamedVercelSandbox(e) {
	try {
		return await e.sandboxModule.Sandbox.get(await getVercelSandboxGetOptions(e));
	} catch (t) {
		if (isVercelSandboxMissingError(t)) return null;
		throw Error(`Failed to look up Vercel sandbox "${e.sandboxName}": ${errorMessage(t)}`, { cause: t });
	}
}
async function isVercelSnapshotCreated(e) {
	try {
		return (await e.sandboxModule.Snapshot.get({
			...await resolveVercelSandboxCredentials(e.createOptions),
			fetch: getVercelSandboxFetch(e.createOptions),
			signal: e.createOptions.signal,
			snapshotId: e.snapshotId
		})).status === `created`;
	} catch (t) {
		if (isVercelSandboxMissingError(t) || isVercelSnapshotUnavailableError(t)) return !1;
		throw Error(`Failed to look up Vercel snapshot "${e.snapshotId}": ${errorMessage(t)}`, { cause: t });
	}
}
async function getVercelSandboxGetOptions(e) {
	return {
		...await resolveVercelSandboxCredentials(e.createOptions),
		fetch: getVercelSandboxFetch(e.createOptions),
		name: e.sandboxName,
		resume: !1,
		signal: e.createOptions.signal
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-base-runtime.js
async function ensureVercelSandboxBaseRuntime(e) {
	let t = createVercelTimeout(e);
	try {
		await t.run(() => runSandboxInitializationStep(e, {
			failureMessage: `Failed to initialize Vercel sandbox base runtime.`,
			script: buildDockerBaseSetupScript()
		}));
	} finally {
		await t.close();
	}
}
async function applyInitialVercelNetworkPolicy(e, t) {
	t !== void 0 && await e.update({ networkPolicy: t });
}
function withBaseSetupNetworkPolicy(e) {
	return {
		...e,
		networkPolicy: `allow-all`
	};
}
function createVercelNetworkPolicySetter(e) {
	return async (t) => {
		await e.update({ networkPolicy: toVercelNetworkPolicy(t) });
	};
}
function toVercelNetworkPolicy(e) {
	return e;
}
async function runSandboxInitializationStep(e, t) {
	let n = await runInitializationCommand(e, t.script);
	if (n === null) return;
	let r = await runInitializationCommandWithSudo(e, t.script);
	if (r === null) return;
	let i = [n, r].filter(Boolean).join(`
`);
	throw Error(`${t.failureMessage}${i ? `\n${i}` : ``}`);
}
async function runInitializationCommand(e, t) {
	return await readInitializationFailure(await e.runCommand({
		args: [`-lc`, t],
		cmd: `bash`
	}));
}
async function runInitializationCommandWithSudo(e, t) {
	return await readInitializationFailure(await e.runCommand({
		args: [
			`-n`,
			`bash`,
			`-lc`,
			t
		],
		cmd: `sudo`
	}));
}
async function readInitializationFailure(e) {
	if (e.exitCode === 0) return null;
	let t = await e.stdout();
	let n = await e.stderr();
	return [t.trim(), n.trim()].filter(Boolean).join(`
`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-create-sdk.js
async function createVercelEveImageSandbox(e) {
	let { image: t, runtime: n, source: r, ...i } = e.createOptions;
	let a = {
		...i,
		...await resolveVercelSandboxCredentials(e.createOptions),
		fetch: getVercelSandboxFetch(e.createOptions)
	};
	return r?.type === `snapshot` ? await e.sandboxModule.Sandbox.create({
		...a,
		source: r
	}) : await e.sandboxModule.Sandbox.create({
		...a,
		source: r,
		image: t ?? VERCEL_EVE_SANDBOX_IMAGE
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-lifecycle.js
async function deleteNamedVercelSandbox(e) {
	let t = await getNamedVercelSandbox({
		createOptions: e.signal === void 0 ? e.createOptions : {
			...e.createOptions,
			signal: e.signal
		},
		sandboxModule: e.sandboxModule,
		sandboxName: e.sandboxName
	});
	if (t !== null) try {
		await stopVercelSandbox(t), await t.delete({
			deleteOrphanSnapshots: !0,
			signal: e.signal
		});
	} catch (e) {
		if (!isVercelSandboxMissingError(e)) throw e;
	}
}
async function deleteUnusableVercelSandbox(e) {
	await (await e.sandboxModule.Sandbox.get({
		...await resolveVercelSandboxCredentials(e.createOptions),
		fetch: getVercelSandboxFetch(e.createOptions),
		name: e.sandboxName,
		resume: !1
	})).delete({ deleteOrphanSnapshots: !0 });
}
async function stopVercelSandbox(e, t) {
	(e.status === `running` || e.status === `pending`) && await e.stop(t === void 0 ? void 0 : { signal: t });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel-read-stream.js
function normalizeVercelReadStream(e, t) {
	if (e === null) return t(), null;
	let n = isWebReadableStream(e) ? e : e instanceof Readable ? Readable.toWeb(e) : void 0;
	if (n === void 0) throw TypeError(`Vercel Sandbox returned an unsupported file stream.`);
	let r = n.getReader();
	let finish = () => {
		t(), r.releaseLock();
	};
	return new ReadableStream({
		async pull(e) {
			try {
				let { done: t, value: n } = await r.read();
				t ? (finish(), e.close()) : e.enqueue(n);
			} catch (t) {
				finish(), e.error(t);
			}
		},
		async cancel(e) {
			t();
			try {
				await r.cancel(e);
			} finally {
				finish();
			}
		}
	});
}
function isWebReadableStream(e) {
	return `getReader` in e && typeof e.getReader == `function`;
}
function withToolSessionRetention(e) {
	return {
		...e,
		keepLastSnapshots: { count: 1 },
		snapshotExpiration: 864e5
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bindings/vercel.js
function createVercelSandbox(e = {}) {
	let t = e.loadSandboxModule ?? (async () => await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/sandbox/index.js"));
	let n = {
		...e.createOptions,
		env: {
			...SANDBOX_AGENT_ENV,
			...e.createOptions?.env
		},
		timeout: e.createOptions?.timeout ?? DEFAULT_SANDBOX_TIMEOUT_MS
	};
	let r = e.createSandbox ?? createVercelEveImageSandbox;
	let i = n.image ?? VERCEL_EVE_SANDBOX_IMAGE;
	let a = n.source === void 0 && (i === VERCEL_EVE_SANDBOX_IMAGE || i === "vcr.vercel.com/vercel/eve/git:git-d74c717f1d17");
	return {
		async onSessionEnd(e, r, { signal: i }) {
			await deleteNamedVercelSandbox({
				createOptions: n,
				sandboxModule: await t(),
				sandboxName: r?.sandboxName ?? vercelSessionName(e.session.id),
				signal: i
			});
		},
		async onSessionIdle(e, r, { signal: i }) {
			let a = await getNamedVercelSandbox({
				createOptions: i === void 0 ? n : {
					...n,
					signal: i
				},
				sandboxModule: await t(),
				sandboxName: r?.sandboxName ?? vercelSessionName(e.session.id)
			});
			if (a !== null) try {
				await stopVercelSandbox(a, i);
			} catch (e) {
				if (!isVercelSandboxMissingError(e)) throw e;
			}
		},
		async prepare(e) {
			if (e.isEmpty && n.source === void 0) return {};
			try {
				let a = `eve-sbx-tpl-vercel-${e.templateKey({
					createOptions: vercelIdentityOptions(n),
					resolvedImage: n.source === void 0 ? i : void 0,
					version: 4
				}).slice(0, 32)}`;
				return { snapshotId: await ensureTemplate({
					context: e,
					createOptions: n,
					createSandbox: r,
					loadSandboxModule: t,
					templateKey: a
				}) };
			} catch (e) {
				throw Error(`Failed to prepare Vercel sandbox snapshot: ${errorMessage(e)}`, { cause: e });
			}
		},
		async resume(e, r, i) {
			requirePreparedVercelTemplate(r);
			let a = requireVercelSessionState(i);
			let o = await t();
			let s = await getNamedVercelSandbox({
				createOptions: n,
				sandboxModule: o,
				sandboxName: a.sandboxName
			});
			if (s === null) throw new SandboxSessionGoneError(`Vercel sandbox session "${a.sandboxName}" no longer exists.`);
			try {
				await ensureVercelSandboxBaseRuntime(s);
			} catch (e) {
				throw isVercelSnapshotNotFoundError(e) ? new SandboxSessionGoneError(`Vercel sandbox session "${a.sandboxName}" can no longer resume: its snapshot expired or was deleted.`) : e;
			}
			return createVercelConnection(s);
		},
		async start(e, t, n) {
			let r = vercelSessionName(e.session.id);
			return {
				connection: createVercelConnection(await openSession(e, t, n, r)),
				state: {
					sandboxName: r,
					version: 3
				}
			};
		},
		toolSessions: !0
	};
	async function openSession(e, i, o, s) {
		let c = requirePreparedVercelTemplate(o);
		let { mounts: l, networkPolicy: u, ...d } = i ?? {};
		let f = e.kind === `tool-session`;
		let p = {
			...n,
			...d,
			...u === void 0 ? {} : { networkPolicy: toVercelNetworkPolicy(u) },
			env: {
				...SANDBOX_AGENT_ENV,
				...d.env ?? n.env
			}
		};
		let m = f ? withToolSessionRetention(p) : p;
		let h = resolveVercelSandboxTags(m.tags, { sessionId: e.session.id });
		let g = await t();
		let _ = {
			createOptions: m,
			createSandbox: r,
			mounts: l === void 0 ? void 0 : toVercelMounts(l),
			sandboxModule: g,
			sessionKey: s,
			snapshotId: c.snapshotId,
			tags: h
		};
		try {
			return (await ensureUsableSession({
				expired: f ? isVercelSnapshotNotFoundError : isVercelSnapshotUnavailableError,
				inheritsBaseRuntime: c.snapshotId !== void 0 && l === void 0 && a,
				input: _,
				session: await ensureSession(_)
			})).sandbox;
		} catch (t) {
			throw isVercelSnapshotUnavailableError(t) && c.snapshotId !== void 0 ? new SandboxTemplateNotProvisionedError({
				providerName: `vercel`,
				reason: `The Vercel Sandbox snapshot expired or was deleted.`,
				templateKey: c.snapshotId
			}) : Error(`Failed to open Vercel sandbox session "${e.session.id}": ${errorMessage(t)}`, { cause: t });
		}
	}
}
function vercelSessionName(e) {
	return `eve-sbx-vercel-${createSandboxProviderIdentity({
		sessionId: e,
		version: 2
	}).slice(0, 32)}`;
}
function vercelIdentityOptions(e) {
	if (e === void 0) return;
	let t = /* @__PURE__ */ new Set([
		`fetch`,
		`projectId`,
		`signal`,
		`teamId`,
		`token`
	]);
	return Object.fromEntries(Object.entries(e).filter(([e]) => !t.has(e)));
}
function requireVercelSessionState(e) {
	if (!isObject(e) || e.version !== 3 || typeof e.sandboxName != `string`) throw invalidSandboxSessionStateError(`Vercel sandbox`);
	return {
		sandboxName: e.sandboxName,
		version: 3
	};
}
function requirePreparedVercelTemplate(e) {
	if (!isObject(e) || e.snapshotId !== void 0 && typeof e.snapshotId != `string`) throw invalidPreparedSandboxArtifactError(`Vercel sandbox`);
	return e.snapshotId === void 0 ? {} : { snapshotId: e.snapshotId };
}
function toVercelMounts(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, `mode` in t ? {
		drive: t.drive,
		mode: t.mode
	} : {
		drive: t.name,
		mode: `read-write`
	}]));
}
async function ensureTemplate(e) {
	let t = await e.loadSandboxModule();
	let n = await getNamedVercelSandbox({
		createOptions: e.createOptions,
		sandboxModule: t,
		sandboxName: e.templateKey
	});
	let r = n?.sourceSnapshotId;
	if (r !== void 0 && await isVercelSnapshotCreated({
		createOptions: e.createOptions,
		sandboxModule: t,
		snapshotId: r
	})) return e.context.log(`reusing prepared sandbox template`), r;
	let i = await prepareTemplateSnapshot(e, t);
	return await publishTemplatePointer(e, t, n, i).catch((t) => {
		e.context.log(`could not publish sandbox template: ${errorMessage(t)}`);
	}), i;
}
async function prepareTemplateSnapshot(e, t) {
	let n = await e.createSandbox({
		sandboxModule: t,
		createOptions: withBaseSetupNetworkPolicy({
			...e.createOptions,
			name: `${e.templateKey}-${randomBytes(4).toString(`hex`)}`,
			persistent: !1
		})
	});
	try {
		e.context.log(`preparing base runtime inside sandbox`), await ensureVercelSandboxBaseRuntime(n), await applyInitialVercelNetworkPolicy(n, e.createOptions.networkPolicy);
		let t = createVercelConnection(n);
		try {
			await e.context.populate(t);
		} finally {
			await sandboxConnectionDisposal(t)?.();
		}
		return await ensureVercelSandboxBaseRuntime(n), (await n.snapshot()).snapshotId;
	} finally {
		await n.delete().catch((t) => {
			e.context.log(`could not delete sandbox ${n.name}: ${errorMessage(t)}`);
		});
	}
}
async function publishTemplatePointer(e, t, n, r) {
	if (n !== null) try {
		await n.delete();
	} catch (e) {
		if (!isVercelSandboxMissingError(e)) throw e;
	}
	let { image: i, runtime: a, source: o, ...s } = e.createOptions;
	let c;
	try {
		c = await e.createSandbox({
			sandboxModule: t,
			createOptions: {
				...s,
				name: e.templateKey,
				persistent: !1,
				source: {
					snapshotId: r,
					type: `snapshot`
				}
			}
		});
	} catch (e) {
		if (isVercelSandboxNameConflictError(e)) return;
		throw e;
	}
	await stopVercelSandbox(c);
}
async function ensureUsableSession(e) {
	let ensureBaseRuntime = async (t) => {
		t.created && e.inheritsBaseRuntime || await ensureVercelSandboxBaseRuntime(t.sandbox);
	};
	try {
		return await ensureBaseRuntime(e.session), e.session;
	} catch (t) {
		if (e.session.created || !e.expired(t)) throw t;
	}
	try {
		await deleteUnusableVercelSandbox({
			createOptions: e.input.createOptions,
			sandboxModule: e.input.sandboxModule,
			sandboxName: e.session.sandbox.name
		});
	} catch (e) {
		if (!isVercelSandboxMissingError(e)) throw e;
	}
	let t = await ensureSession(e.input);
	return await ensureBaseRuntime(t), t;
}
async function ensureSession(e) {
	let t = e.sessionKey;
	let n = await getNamedVercelSandbox({
		createOptions: e.createOptions,
		sandboxModule: e.sandboxModule,
		sandboxName: t
	});
	if (n !== null) return await ensureVercelSandboxTags(n, e.tags), {
		created: !1,
		sandbox: n
	};
	let r = createSessionCreateParams(e, t);
	e.tags !== void 0 && (r.tags = e.tags);
	try {
		return {
			created: !0,
			sandbox: await e.createSandbox({
				createOptions: r,
				sandboxModule: e.sandboxModule
			})
		};
	} catch (n) {
		if (!isVercelSandboxNameConflictError(n)) throw n;
		let r = await getNamedVercelSandbox({
			...e,
			sandboxName: t
		});
		if (r === null) throw n;
		return {
			created: !1,
			sandbox: r
		};
	}
}
function createSessionCreateParams(e, t) {
	let n = { ...e.createOptions };
	if (e.mounts !== void 0 && (n.mounts = e.mounts), e.snapshotId === void 0) return {
		...n,
		name: t,
		persistent: !0
	};
	let { image: r, runtime: i, source: a, ...o } = n;
	return {
		...o,
		name: t,
		persistent: !0,
		source: {
			snapshotId: e.snapshotId,
			type: `snapshot`
		}
	};
}
function createVercelConnection(e) {
	let t;
	let n = !1;
	let r;
	let activeTimeout = async () => {
		for (; r !== void 0;) await r;
		if (n) throw Error(`This sandbox handle belongs to a finished execution scope. Call ctx.getSandbox() in the current scope.`);
		return t ??= createVercelTimeout(e);
	};
	let close = (n = !1) => {
		let i = Promise.resolve(r).catch(() => void 0).then(async () => {
			let r = t;
			t = void 0, await r?.close(), n && await stopVercelSandbox(e);
		}).finally(() => {
			r === i && (r = void 0);
		});
		return r = i, i;
	};
	let i = createVercelNetworkPolicySetter(e);
	let a = {
		extensions: {
			name: e.name,
			setNetworkPolicy: async (e) => (await activeTimeout()).run(() => i(e))
		},
		async readFile(t) {
			let n = await (await activeTimeout()).acquire(t.signal);
			try {
				return normalizeVercelReadStream(await e.readFile({ path: t.path }, { signal: t.signal }), n);
			} catch (e) {
				throw n(), e;
			}
		},
		async removePath(t) {
			await (await activeTimeout()).run(() => e.fs.rm(t.path, {
				force: t.force,
				recursive: t.recursive,
				signal: t.signal
			}), t.signal);
		},
		async spawn(t) {
			let n = await (await activeTimeout()).acquire(t.signal);
			try {
				let r = await e.runCommand({
					args: [`-lc`, t.command],
					cmd: `bash`,
					cwd: t.workingDirectory,
					detached: !0,
					env: t.env,
					signal: t.signal,
					stdin: t.stdin
				});
				let i = r.wait({ signal: t.signal });
				return i.then(n, n), adaptMultiplexedCommandToSandboxProcess({
					abortSignal: t.signal,
					command: {
						async kill() {
							await r.kill(), n();
						},
						logs: (e) => r.logs(e),
						wait: () => i
					},
					getOutput: (e) => e.stream,
					stdin: t.stdin === !0 ? r : void 0
				});
			} catch (e) {
				throw n(), e;
			}
		},
		stop: () => close(!0),
		async writeFiles(t) {
			t.files.length !== 0 && await (await activeTimeout()).run(async () => {
				await e.writeFiles(await resolveVercelWriteFiles(e, t.files, t.signal), { signal: t.signal });
			}, t.signal);
		}
	};
	return withSandboxConnectionDisposal(a, async () => {
		n = !0, await close();
	});
}
async function resolveVercelWriteFiles(e, t, n) {
	let r = [];
	let i = [];
	let a = 0;
	for (let o of t) {
		let t = Buffer.byteLength(o.path) + 1;
		i.length > 0 && a + t > 65536 && (r.push(...await resolveVercelPaths(e, i, n)), i = [], a = 0), i.push(o.path), a += t;
	}
	return r.push(...await resolveVercelPaths(e, i, n)), t.map((e, t) => {
		let n = r[t];
		if (n === void 0 || !n.startsWith(`/`)) throw Error(`Failed to resolve Vercel Sandbox write path: ${e.path}`);
		return {
			content: e.content,
			path: n
		};
	});
}
async function resolveVercelPaths(e, t, n) {
	let r = await e.runCommand({
		args: [
			`-m`,
			`-z`,
			`--`,
			...t
		],
		cmd: `realpath`,
		signal: n
	});
	if (r.exitCode !== 0) {
		let e = (await r.stderr()).trim();
		throw Error(`Failed to resolve Vercel Sandbox write paths with realpath: ${e}`);
	}
	let i = (await r.stdout()).split(`\0`).slice(0, -1);
	if (i.length !== t.length) throw Error(`Failed to resolve Vercel Sandbox write paths: realpath printed ${i.length} paths for ${t.length} files.`);
	return i;
}
const DEFAULT_SANDBOX_TIMEOUT_MS = 18e5;
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/sandbox/providers/vercel.js
const VercelSandbox = defineSandboxProvider({
	name: `vercel`,
	environment: (e) => createVercelSandbox({ createOptions: e })
});
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/sandbox/providers/default.js
const SELECTED_PROVIDERS = [
	`docker`,
	`just-bash`,
	`vercel`
];
const NO_PROVIDER_MESSAGE = `DefaultSandbox has no sandbox provider for this build: it did not run on Vercel, no Docker daemon was reachable, and production builds do not fall back to just-bash. Start Docker and rebuild, deploy to Vercel, or select a provider explicitly in your sandbox module, such as agent/sandbox/sandbox.ts.`;
const JUST_BASH_NETWORK_POLICY_MESSAGE = `DefaultSandbox selected just-bash, which always allows network access and accepts only the "allow-all" network policy. Start Docker so DefaultSandbox selects it, or select VercelSandbox or DockerSandbox explicitly.`;
const DefaultSandbox = defineSandboxProvider({
	name: `default`,
	environment(e) {
		if (e.justBash && Object.keys(e.justBash).some((e) => e !== `autoInstall` && e !== `prepare`)) throw Error(`DefaultSandbox justBash settings support autoInstall and prepare only. Use JustBashSandbox.environment({ experimental }) for customCommands or filesystem.`);
		let t = /* @__PURE__ */ new Map();
		let provider = (n) => {
			let r = t.get(n);
			return r === void 0 && (r = getSandboxEnvironmentRuntime(createEnvironment(n, e)), t.set(n, r)), r;
		};
		function requireProvider(e, t) {
			let n = provider(e);
			if (t === `tool-session` && n.implementation.toolSessions !== !0) throw new ToolSessionSandboxUnsupportedError(e);
			return n;
		}
		function recordedProvider(e, t) {
			let n = isDefaultSandboxSessionState(e) ? e : null;
			let r = n?.provider ?? (isDefaultSandboxPreparedArtifact(t) ? t.provider : null);
			if (r === null) return;
			let i = provider(r);
			let a = n?.stateProtocolVersion === i.stateProtocolVersion ? n.state : null;
			return {
				implementation: i.implementation,
				state: a
			};
		}
		let n = {
			async onSessionEnd(e, t, n) {
				let r = recordedProvider(t, void 0);
				await r?.implementation.onSessionEnd(e, r.state, n);
			},
			async onSessionIdle(e, t, n) {
				let r = recordedProvider(t, void 0);
				await r?.implementation.onSessionIdle?.(e, r.state, n);
			},
			async prepare(e) {
				let t = selectProvider();
				return t === null ? (e.log(NO_PROVIDER_MESSAGE), { provider: null }) : {
					artifact: await provider(t).implementation.prepare(e),
					provider: t
				};
			},
			async start(e, t, n) {
				if (n.provider === null) throw Error(NO_PROVIDER_MESSAGE);
				let r = requireProvider(n.provider, e.kind);
				let i = await r.implementation.start(e, innerOpenOptions(n.provider, t), n.artifact);
				return {
					connection: withNetworkPolicy(i.connection),
					state: {
						provider: n.provider,
						state: i.state,
						stateProtocolVersion: r.stateProtocolVersion
					}
				};
			},
			async resume(e, t, n) {
				if (t.provider === null || t.provider !== n.provider) throw new SandboxSessionGoneError(`The session's ${n.provider} sandbox cannot resume because this build selected ${t.provider ?? `no provider`}.`);
				let r = requireProvider(n.provider, e.kind);
				if (n.stateProtocolVersion !== r.stateProtocolVersion) throw new SandboxSessionGoneError(`The session's ${n.provider} sandbox state uses protocol ${n.stateProtocolVersion}, not ${r.stateProtocolVersion}.`);
				return withNetworkPolicy(await r.implementation.resume(e, t.artifact, n.state));
			},
			toolSessions: !0
		};
		return withRecordedSandboxProvider(n, recordedProvider), withAdoptedSandboxSessionStates(n, (e) => {
			let t = e.providerName;
			if (isSelectedProvider(t)) return {
				provider: t,
				state: e.state,
				stateProtocolVersion: e.stateProtocolVersion
			};
		});
	}
});
function selectProvider() {
	return process.env.VERCEL?.trim() ? `vercel` : isLinuxDockerDaemonAvailableSync() ? `docker` : isEveDevEnvironment() ? `just-bash` : null;
}
function createEnvironment(e, t) {
	switch (e) {
		case `docker`: return DockerSandbox.environment(t.docker ?? {});
		case `just-bash`: return JustBashSandbox.environment(t.justBash ?? {});
		case `vercel`: return VercelSandbox.environment(t.vercel ?? {});
	}
}
function innerOpenOptions(e, t) {
	if (e !== `just-bash`) return t;
	if (t?.networkPolicy !== void 0 && t.networkPolicy !== `allow-all`) throw Error(JUST_BASH_NETWORK_POLICY_MESSAGE);
}
function withNetworkPolicy(e) {
	let t = e.extensions ?? {};
	return typeof Reflect.get(t, `setNetworkPolicy`) == `function` ? e : {
		...e,
		extensions: {
			...t,
			setNetworkPolicy: rejectJustBashNetworkPolicy
		}
	};
}
async function rejectJustBashNetworkPolicy(e) {
	if (e !== `allow-all`) throw Error(JUST_BASH_NETWORK_POLICY_MESSAGE);
}
function isSelectedProvider(e) {
	return SELECTED_PROVIDERS.some((t) => t === e);
}
function isDefaultSandboxSessionState(e) {
	return isObject(e) && isSelectedProvider(e.provider) && typeof e.stateProtocolVersion == `number` && `state` in e;
}
function isDefaultSandboxPreparedArtifact(e) {
	return isObject(e) && (e.provider === null || isSelectedProvider(e.provider) && `artifact` in e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/framework/sources/modules/sandbox.js
const environment = DefaultSandbox.environment();
var sandbox_default = defineSandbox(() => environment.open());
export { environment, sandbox_default };

//# sourceMappingURL=eve58.mjs.map