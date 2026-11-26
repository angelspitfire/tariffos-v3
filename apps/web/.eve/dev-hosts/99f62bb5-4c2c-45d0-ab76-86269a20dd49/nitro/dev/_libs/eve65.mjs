import { ContextKey } from "./eve13.mjs";
import { resolveSandboxModelPath } from "./eve46.mjs";
import { posix } from "node:path";
import { createHash } from "node:crypto";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/file-state.js
const ReadFileStateKey = new ContextKey(`eve.readFile`);
function normalizeModelPath(e) {
	return posix.normalize(e);
}
function buildReadFileTargetKey(e) {
	return e;
}
function createReadFileStamp(e) {
	let t = createHash(`sha256`).update(e.content, `utf8`).digest(`hex`);
	return {
		byteLength: Buffer.byteLength(e.content, `utf8`),
		contentHash: t,
		filePath: e.filePath
	};
}
function setReadFileStamp(e, t, n) {
	let r = e.ensure(ReadFileStateKey, () => ({ byTarget: {} }));
	e.set(ReadFileStateKey, { byTarget: {
		...r.byTarget,
		[t]: n
	} });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/require-sandbox.js
async function resolveAbsoluteFilePath(e, t) {
	let n = await resolveSandboxModelPath({
		path: t,
		sandbox: e
	});
	if (n === `$HOME` || n.startsWith(`$HOME/`)) throw Error(`Cannot resolve "${t}": the sandbox has no usable $HOME. Use an absolute path or a path relative to the workspace root.`);
	return e.resolvePath(n);
}
export { ReadFileStateKey, buildReadFileTargetKey, createReadFileStamp, normalizeModelPath, resolveAbsoluteFilePath, setReadFileStamp };

//# sourceMappingURL=eve65.mjs.map