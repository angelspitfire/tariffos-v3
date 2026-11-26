import { frameworkTool } from "./eve26.mjs";
import { defineJsonSchema } from "./eve23.mjs";
import { defineTool } from "./eve32.mjs";
import { toolLabel } from "./eve40.mjs";
import { contextStorage, loadContext } from "./eve13.mjs";
import { ReadFileStateKey, buildReadFileTargetKey, createReadFileStamp, normalizeModelPath, resolveAbsoluteFilePath, setReadFileStamp } from "./eve65.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/write-file.js
function refreshReadFileStamp(e, t, n) {
	let r = contextStorage.getStore();
	if (r === void 0) return;
	let i = normalizeModelPath(e);
	let a = buildReadFileTargetKey(i);
	let o = r.get(ReadFileStateKey)?.byTarget[a];
	let s = createReadFileStamp({
		content: t,
		filePath: i
	});
	o !== void 0 && o.contentHash === s.contentHash && o.byteLength === s.byteLength && setReadFileStamp(r, a, createReadFileStamp({
		content: n,
		filePath: i
	}));
}
async function executeWriteFileOnSandbox(e, t) {
	let { filePath: n, content: r } = t;
	let i = await resolveAbsoluteFilePath(e, n);
	let a = loadContext();
	let o = normalizeModelPath(i);
	let s = buildReadFileTargetKey(o);
	let c = await e.readTextFile({ path: i });
	if (c === null) {
		await e.writeTextFile({
			content: r,
			path: i
		});
		let t = createReadFileStamp({
			content: r,
			filePath: o
		});
		return setReadFileStamp(a, s, t), {
			existed: !1,
			path: o
		};
	}
	let l = a.ensure(ReadFileStateKey, () => ({ byTarget: {} })).byTarget[s];
	if (l === void 0) throw Error(`You must read file ${n} before overwriting it. Use the read_file tool first.`);
	let u = createReadFileStamp({
		content: c,
		filePath: o
	});
	if (u.contentHash !== l.contentHash || u.byteLength !== l.byteLength) throw Error(`File ${n} has been modified since it was last read. Please read the file again before modifying it.`);
	await e.writeTextFile({
		content: r,
		path: i
	});
	let d = createReadFileStamp({
		content: r,
		filePath: o
	});
	return setReadFileStamp(a, s, d), {
		existed: !0,
		path: o
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/write-file.js
const WRITE_FILE_INPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		content: {
			type: `string`,
			description: `Complete replacement file contents.`
		},
		filePath: {
			type: `string`,
			description: `The path to the file to write: absolute, relative to the workspace root, or beginning with $HOME/.`
		}
	},
	required: [`content`, `filePath`],
	additionalProperties: !1
});
const WRITE_FILE_OUTPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		existed: { type: `boolean` },
		path: { type: `string` }
	},
	required: [`existed`, `path`],
	additionalProperties: !1
});
const writeFile = frameworkTool(defineTool({
	label: { start: (e) => toolLabel(`Write`, e.filePath) },
	description: `Writes a file to the local filesystem.

Usage:
- This tool will overwrite the existing file if there is one at the provided path.
- If this is an existing file, you MUST use the read_file tool first to read the file's contents. This tool will fail if you did not read the file first.
- ALWAYS prefer editing existing files in the codebase. NEVER write new files unless explicitly required.
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- Only use emojis if the user explicitly requests it. Avoid writing emojis to files unless asked.`,
	async execute(e, t) {
		return await executeWriteFileOnSandbox(await t.getSandbox(), e);
	},
	inputSchema: WRITE_FILE_INPUT_SCHEMA,
	outputSchema: WRITE_FILE_OUTPUT_SCHEMA
}));
export { WRITE_FILE_INPUT_SCHEMA, WRITE_FILE_OUTPUT_SCHEMA, refreshReadFileStamp, writeFile };

//# sourceMappingURL=eve66.mjs.map