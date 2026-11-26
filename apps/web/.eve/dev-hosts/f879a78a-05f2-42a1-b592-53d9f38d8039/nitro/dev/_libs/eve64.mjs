import { frameworkTool } from "./eve26.mjs";
import { defineJsonSchema } from "./eve23.mjs";
import { defineTool } from "./eve32.mjs";
import { toolOutput } from "./eve44.mjs";
import { isEveDevEnvironment } from "./eve28.mjs";
import { shellQuote } from "./eve60.mjs";
import { capLineLength, truncateTail } from "./eve63.mjs";
import { toolLabel } from "./eve40.mjs";
import { randomUUID } from "node:crypto";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/bash.js
const LAUNCHER = `d=$1
mkdir -p "$d" 2>/dev/null || { eval "$2"; exit; }
trap 'exit 0' USR1
echo "$$" > "$d/launcher"
set -m
(
  trap : TERM INT
  (eval "$2") > "$d/stdout" 2> "$d/stderr"
  code=$?
  echo "$code" > "$d/exit"
  exit "$code"
) < /dev/null > /dev/null 2>&1 &
pid=$!
set +m
echo "$pid" > "$d/pid"
wait "$pid" 2> /dev/null
code=$?
mkdir "$d/claimed" 2> /dev/null || exit 0
cat "$d/stdout"
cat "$d/stderr" >&2
for f in "$d/stdout" "$d/stderr"; do
  [ "$(($(wc -c < "$f")))" -gt 51199 ] || [ "$(($(wc -l < "$f")))" -gt 1999 ] && exit "$code"
done
rm -rf "$d"
exit "$code"`;
async function executeBashOnSandbox(e, t, n = {}) {
	let r = formatCommand(t.command);
	logDevelopmentSandboxCommand(`eve: starting sandbox command: ${r}`);
	let { timeout: i } = t;
	let a = i !== void 0 && Number.isFinite(i) ? Math.min(Math.max(i, 1), 120) : 60;
	let o = await withDevelopmentSandboxProgress(r, () => runCommand(e, t.command, a, n.abortSignal));
	return logDevelopmentSandboxCommand(o.status === `running` ? `eve: sandbox command still running as pid ${o.pid}: ${r}` : `eve: sandbox command finished (exit ${o.exitCode}): ${r}`), o;
}
async function runCommand(e, t, n, r) {
	r?.throwIfAborted();
	let i = randomUUID().slice(0, 8);
	let a = `/tmp/.eve/jobs/${i}`;
	let o = new AbortController();
	let cancel = () => {
		o.abort(r?.reason), Promise.resolve(e.run({ command: `kill -TERM -- -"$(cat ${shellQuote(a)}/pid 2>/dev/null)" 2>/dev/null; rm -rf ${shellQuote(a)}` })).catch(() => {});
	};
	r?.addEventListener(`abort`, cancel, { once: !0 });
	try {
		let r = await e.spawn({
			signal: o.signal,
			command: launchCommand(t, a)
		});
		let s = Promise.all([
			readTail(r.stdout),
			readTail(r.stderr),
			r.wait()
		]).then(([e, t, { exitCode: n }]) => ({
			exitCode: n,
			stderr: t,
			stdout: e
		}));
		let c = await waitUpTo(s, n * 1e3);
		if (c !== void 0) return await completed(e, a, c);
		let l = await claimRunningJob(e, a, i, n);
		return l === void 0 ? await completed(e, a, await s) : (s.catch(() => {}), l);
	} finally {
		r?.removeEventListener(`abort`, cancel);
	}
}
function launchCommand(e, t) {
	return [
		`if command -v bash >/dev/null 2>&1 && kill -0 "$$" 2>/dev/null; then`,
		`  set -- ${shellQuote(t)} ${shellQuote(e)}`,
		`  eval ${shellQuote(LAUNCHER)}`,
		`fi`,
		`eval ${shellQuote(e)}`
	].join(`
`);
}
async function claimRunningJob(e, t, n, r) {
	let i = `eve-bash:${n}`;
	let a = await e.run({ command: [
		`cd ${shellQuote(t)} 2>/dev/null && mkdir claimed 2>/dev/null || exit 0`,
		`kill -USR1 "$(cat launcher)" 2>/dev/null`,
		`printf '%s %s %s %s\\n' ${i} "$(cat pid)" "$(($(wc -c < stdout)))" "$(($(wc -c < stderr)))"`,
		`tail -c 51200 stdout`,
		`tail -c 51200 stderr >&2`
	].join(`
`) });
	let o = RegExp(`(?:^|\\n)${i} (\\d+) (\\d+) (\\d+)\\n`).exec(a.stdout);
	if (o === null) return;
	let s = Number(o[1]);
	let c = a.stdout.slice(o.index + o[0].length);
	return {
		...formatStreams({
			stderr: {
				omittedBytes: Math.max(0, Number(o[3]) - Buffer.byteLength(a.stderr)),
				text: a.stderr
			},
			stdout: {
				omittedBytes: Math.max(0, Number(o[2]) - Buffer.byteLength(c)),
				text: c
			}
		}, t),
		message: `The command is still running after ${r} seconds as process group ${s}; this result includes its output so far. It keeps writing to ${t}/stdout and ${t}/stderr, and writes its exit code to ${t}/exit when it finishes. Check on it with later commands such as \`tail ${t}/stdout\` or \`cat ${t}/exit\`, and stop it with \`kill -- -${s}\`. To wait for it in one call instead of polling, run \`while [ ! -e ${t}/exit ] && kill -0 -- -${s} 2>/dev/null; do sleep 1; done; cat ${t}/exit 2>/dev/null || echo "process group ${s} exited without an exit code"\` with a \`timeout\` of up to 120 seconds.`,
		outputDirectory: t,
		pid: s,
		status: `running`
	};
}
async function readTail(e) {
	let t = new TextDecoder();
	let n = [];
	let r = 0;
	let i = 0;
	let a = ``;
	let o = 0;
	let append = (e) => {
		a.length <= 2e3 && (a += e.slice(0, 2001 - a.length));
	};
	let finishLine = () => {
		let e = Buffer.byteLength(capLineLength(a)) + 1;
		for (n.push({
			bytes: e,
			text: a
		}), i += e, a = ``, o++; i - n[r].bytes > 51200 || n.length - r > 2e3;) i -= n[r].bytes, r++;
		r > n.length - r && (n.splice(0, r), r = 0);
	};
	let decode = (e) => {
		let t = 0;
		for (let n = e.indexOf(`
`); n !== -1; n = e.indexOf(`
`, t)) append(e.slice(t, n)), finishLine(), t = n + 1;
		append(e.slice(t));
	};
	for await (let n of e) decode(t.decode(n, { stream: !0 }));
	return decode(t.decode()), {
		text: [...n.slice(r).map((e) => e.text), a].join(`
`),
		totalLines: o + (a === `` ? 0 : 1)
	};
}
async function waitUpTo(e, t) {
	let n;
	try {
		return await Promise.race([e, new Promise((e) => {
			n = setTimeout(() => e(void 0), t);
		})]);
	} finally {
		clearTimeout(n);
	}
}
async function completed(e, t, { exitCode: n, stderr: r, stdout: i }) {
	let a = formatStreams({
		stderr: r,
		stdout: i
	});
	return a.truncated && await hasJobOutput(e, t) && (a = formatStreams({
		stderr: r,
		stdout: i
	}, t)), {
		...a,
		exitCode: n,
		status: `completed`
	};
}
async function hasJobOutput(e, t) {
	try {
		return (await e.run({ command: `test -f ${shellQuote(t)}/stdout` })).exitCode === 0;
	} catch {
		return !1;
	}
}
function formatStreams(e, t) {
	let n = formatStream(`stdout`, e.stdout, t);
	let r = formatStream(`stderr`, e.stderr, t);
	return {
		stderr: r.output,
		stdout: n.output,
		truncated: n.truncated || r.truncated
	};
}
function formatStream(e, t, n) {
	let r = truncateTail(t.text);
	let i = `totalLines` in t ? t.totalLines : t.omittedBytes === 0 ? r.totalLines : void 0;
	return i !== void 0 && r.outputLines >= i ? {
		output: r.output,
		truncated: !1
	} : {
		output: `[${e} truncated: ${i === void 0 ? `showing last ${r.outputLines} lines` : `showing last ${r.outputLines} of ${i} lines`}${n === void 0 ? `` : `; full output: ${n}/${e}`}]\n${r.output}`,
		truncated: !0
	};
}
async function withDevelopmentSandboxProgress(e, t) {
	if (!isEveDevEnvironment()) return await t();
	let n = Date.now();
	let r = setInterval(() => {
		logDevelopmentSandboxCommand(`eve: waiting for sandbox command (${Math.round((Date.now() - n) / 1e3)}s elapsed): ${e}`);
	}, 5e3);
	r.unref?.();
	try {
		return await t();
	} catch (t) {
		throw logDevelopmentSandboxCommand(`eve: sandbox command failed: ${e}`), t;
	} finally {
		clearInterval(r);
	}
}
function logDevelopmentSandboxCommand(e) {
	isEveDevEnvironment() && console.log(e);
}
function formatCommand(e) {
	let t = e.replaceAll(/\s+/g, ` `).trim();
	return t.length <= 240 ? t : `${t.slice(0, 239)}…`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/bash.js
const BASH_INPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		command: {
			type: `string`,
			description: `The shell command to execute.`
		},
		timeout: {
			type: `number`,
			description: `Seconds to wait for the command before it keeps running in the background. Defaults to 60; values above 120 wait 120, and values below 1 wait 1.`
		}
	},
	required: [`command`],
	additionalProperties: !1
});
const BASH_OUTPUT_SCHEMA = defineJsonSchema({ oneOf: [{
	type: `object`,
	properties: {
		status: { const: `completed` },
		exitCode: { type: `number` },
		stderr: { type: `string` },
		stdout: { type: `string` },
		truncated: { type: `boolean` }
	},
	required: [
		`status`,
		`exitCode`,
		`stderr`,
		`stdout`,
		`truncated`
	],
	additionalProperties: !1
}, {
	type: `object`,
	properties: {
		status: { const: `running` },
		pid: { type: `number` },
		outputDirectory: { type: `string` },
		message: { type: `string` },
		stderr: { type: `string` },
		stdout: { type: `string` },
		truncated: { type: `boolean` }
	},
	required: [
		`status`,
		`pid`,
		`outputDirectory`,
		`message`,
		`stderr`,
		`stdout`,
		`truncated`
	],
	additionalProperties: !1
}] });
const bash = frameworkTool(defineTool({
	label: { start: (e) => toolLabel(`Run`, e.command) },
	description: `Execute a shell command in the shared workspace environment. The call waits 60 seconds for the command, or \`timeout\` seconds from 1 to 120. For builds, installs, and test suites whose full output you need, pass a larger \`timeout\` instead of shortening or splitting the command. The result is the command's stdout, then any stderr after a \`[stderr]\` line, or \`(no output)\`. A command that fails ends with \`[exit code: N]\` and is reported as an error. A command still running after the wait keeps running in the background, and a final note says how to check on or stop it.`,
	async execute(e, t) {
		return await executeBashOnSandbox(await t.getSandbox(), e, { abortSignal: t.abortSignal });
	},
	inputSchema: BASH_INPUT_SCHEMA,
	outputSchema: BASH_OUTPUT_SCHEMA,
	toModelOutput: bashModelOutput
}));
const BASH_OUTPUT_KEYS = /* @__PURE__ */ new Set([
	`exitCode`,
	`message`,
	`outputDirectory`,
	`pid`,
	`status`,
	`stderr`,
	`stdout`,
	`truncated`
]);
function bashModelOutput(e) {
	if (typeof e == `string`) return toolOutput.text(e);
	if (!isBashResult(e)) return toolOutput.json(e);
	let t = [e.stdout, e.stderr && `[stderr]\n${e.stderr}`].filter((e) => e.length > 0).map((e) => e.endsWith(`
`) ? e : `${e}\n`).join(`
`);
	return e.status === `running` ? toolOutput.text(`${t}${e.message}`) : e.exitCode === 0 ? toolOutput.text(t === `` ? `(no output)` : t) : toolOutput.errorText(`${t}[exit code: ${e.exitCode}]`);
}
function isBashResult(e) {
	if (typeof e != `object` || !e) return !1;
	let t = e;
	return Object.keys(t).every((e) => BASH_OUTPUT_KEYS.has(e)) && typeof t.stdout == `string` && typeof t.stderr == `string` && (t.status === `completed` && typeof t.exitCode == `number` || t.status === `running` && typeof t.message == `string`);
}
export { BASH_INPUT_SCHEMA, BASH_OUTPUT_SCHEMA, bash };

//# sourceMappingURL=eve64.mjs.map