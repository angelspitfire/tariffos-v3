// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/skill-paths.js
const MODEL_HOME_ROOT = `$HOME`;
`${MODEL_HOME_ROOT}`;
const sandboxHomeCache = /* @__PURE__ */ new WeakMap();
async function resolveSandboxSkillRoot(e) {
	return await resolveSandboxModelPath({
		path: "$HOME/.agents/skills",
		sandbox: e.sandbox
	});
}
async function resolveSandboxModelPath(e) {
	if (!isModelHomePath(e.path)) return e.path;
	let t = await resolveSandboxHome(e.sandbox);
	if (t !== null) {
		let n = e.path.slice(5);
		return n.length === 0 ? t : `${t === `/` ? `` : t}${n}`;
	}
	return isModelSkillPath(e.path) ? e.sandbox.resolvePath(`skills${e.path.slice(20)}`) : e.path;
}
async function resolveSandboxSkillWritePath(e) {
	return formatSkillPath({
		name: e.name,
		relativePath: e.relativePath,
		root: await resolveSandboxSkillRoot({ sandbox: e.sandbox })
	});
}
function formatSkillPath(e) {
	return `${e.root}/${e.name}/${e.relativePath}`;
}
async function resolveSandboxHome(e) {
	let t = sandboxHomeCache.get(e);
	if (t !== void 0) return await t;
	let n = probeSandboxHome(e);
	return sandboxHomeCache.set(e, n), await n;
}
async function probeSandboxHome(e) {
	try {
		let t = await e.run({ command: `printf '%s\\n' "$HOME"` });
		if (t.exitCode !== 0) return null;
		let n = t.stdout.trim();
		return isUsableSandboxHome(n) ? normalizeSandboxHome(n) : null;
	} catch {
		return null;
	}
}
function isModelHomePath(e) {
	return e === MODEL_HOME_ROOT || e.startsWith(`${MODEL_HOME_ROOT}/`);
}
function isModelSkillPath(e) {
	return e === `$HOME/.agents/skills` || e.startsWith(`$HOME/.agents/skills/`);
}
function isUsableSandboxHome(e) {
	return e.length > 0 && e.startsWith(`/`) && !e.includes(`\0`) && !e.includes(`
`) && !e.includes(`\r`);
}
function normalizeSandboxHome(e) {
	return e === `/` ? e : e.replace(/\/+$/, ``);
}
export { resolveSandboxModelPath, resolveSandboxSkillRoot, resolveSandboxSkillWritePath };

//# sourceMappingURL=eve46.mjs.map