import { frameworkTool } from "./eve26.mjs";
import { SandboxKey, contextStorage, loadContext } from "./eve13.mjs";
import { defineJsonSchema } from "./eve23.mjs";
import { defineTool } from "./eve32.mjs";
import { toolOutput, toolOutputPart } from "./eve44.mjs";
import { buildReadFileTargetKey, createReadFileStamp, normalizeModelPath, resolveAbsoluteFilePath, setReadFileStamp } from "./eve65.mjs";
import { toolLabel } from "./eve40.mjs";
import { capLineLength } from "./eve63.mjs";
import { detectImageMediaType, hasPdfHeader, inlinesSandboxRefAsBytes } from "./eve20.mjs";
import { readMediaMetadata } from "./eve68.mjs";
import { basename } from "node:path";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/read-file.js
async function executeReadFileOnSandbox(e, t) {
	let { filePath: n, offset: r, limit: i } = t;
	let a = await resolveAbsoluteFilePath(e, n);
	let o = normalizeModelPath(a);
	let s = await e.readBinaryFile({ path: a });
	if (s === null) throw Error(`File not found: ${o}. Verify the path exists and is accessible in the sandbox.`);
	if (hasPdfHeader(s)) return buildFileReadResult(s, o, `application/pdf`);
	let c = decodeUtf8(s);
	if (c === void 0 || c.includes(`\0`)) {
		let e = detectImageMediaType(s);
		if (e !== void 0) return buildFileReadResult(s, o, e);
		throw Error(`File "${o}" appears to be a binary file. read_file only supports text files, PNG, JPEG, GIF, or WebP images, and PDFs.`);
	}
	let l = r ?? 1;
	let u = i ?? 2e3;
	if (l < 1) throw Error(`offset must be >= 1. Received: ${l}.`);
	let d = c.split(`
`);
	let f = d.length > 0 && d[d.length - 1] === `` ? d.length - 1 : d.length;
	if (f === 0) {
		if (l > 1) throw Error(`offset ${l} is past the end of the file (0 lines). Use the default offset to read an empty file.`);
	} else if (l > f) throw Error(`offset ${l} is past the end of the file (${f} lines).`);
	let p = createReadFileStamp({
		content: c,
		filePath: o
	});
	let m = buildReadFileTargetKey(o);
	if (setReadFileStamp(loadContext(), m, p), f === 0) return {
		content: ``,
		path: o,
		totalLines: 0,
		truncated: !1
	};
	let h = l - 1;
	let g = Math.min(h + u, f);
	let _ = d.slice(h, g);
	let v = [];
	let y = 0;
	let b = !1;
	for (let e = 0; e < _.length; e++) {
		let t = `${l + e}: ${capLineLength(_[e] ?? ``)}`;
		let n = Buffer.byteLength(t, `utf8`) + 1;
		if (y + n > 51200 && v.length > 0) {
			b = !0;
			break;
		}
		v.push(t), y += n;
	}
	let x = v.join(`
`);
	let S = l + v.length - 1;
	return S < f || b ? {
		content: x,
		nextOffset: S + 1,
		path: o,
		totalLines: f,
		truncated: !0
	} : {
		content: x,
		path: o,
		totalLines: f,
		truncated: !1
	};
}
function decodeUtf8(e) {
	try {
		return new TextDecoder(`utf-8`, { fatal: !0 }).decode(e);
	} catch {
		return;
	}
}
function buildFileReadResult(e, t, n) {
	let r = readMediaMetadata(e, n);
	let i = n === `application/pdf`;
	if (!inlinesSandboxRefAsBytes({
		...r,
		path: t
	})) throw Error(i ? `PDF "${t}" is ${e.byteLength} bytes; read_file shows PDFs up to 20 MiB. Split it or extract its text in the sandbox first.` : `Image "${t}" is ${describeImage(r)}; read_file shows images up to 3 MiB and 8000 pixels per side. Resize or crop it in the sandbox first.`);
	let a = r.pages === void 0 ? `` : `, ${r.pages} ${r.pages === 1 ? `page` : `pages`}`;
	return {
		content: `${i ? `PDF` : `Image`} ${t} (${n}, ${e.byteLength} bytes${a}).`,
		file: r,
		path: t,
		totalLines: 0,
		truncated: !1
	};
}
function describeImage(e) {
	let t = `${e.size} bytes`;
	return e.width === void 0 ? t : `${e.width}x${e.height} pixels, ${t}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/read-file.js
const READ_FILE_INPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		filePath: {
			type: `string`,
			description: `The path to the file to read: absolute, relative to the workspace root, or beginning with $HOME/.`
		},
		limit: {
			type: `integer`,
			minimum: 1,
			description: `Maximum number of lines to return. Defaults to 2000.`
		},
		offset: {
			type: `integer`,
			minimum: 1,
			description: `1-based line number to start from. Defaults to 1.`
		}
	},
	required: [`filePath`],
	additionalProperties: !1
});
const READ_FILE_OUTPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		content: { type: `string` },
		file: {
			type: `object`,
			properties: {
				height: {
					type: `integer`,
					minimum: 1
				},
				mediaType: { type: `string` },
				pages: {
					type: `integer`,
					minimum: 1
				},
				size: {
					type: `integer`,
					minimum: 0
				},
				width: {
					type: `integer`,
					minimum: 1
				}
			},
			required: [`mediaType`, `size`],
			additionalProperties: !1
		},
		nextOffset: {
			type: `integer`,
			minimum: 1
		},
		path: { type: `string` },
		totalLines: {
			type: `integer`,
			minimum: 0
		},
		truncated: { type: `boolean` }
	},
	required: [
		`content`,
		`path`,
		`totalLines`,
		`truncated`
	],
	additionalProperties: !1
});
const readFile = frameworkTool(defineTool({
	label: { start: (e) => toolLabel(`Read`, e.filePath) },
	description: `Read a file from the local filesystem. If the path does not exist, an error is returned.

Usage:
- The filePath parameter is an absolute path, a path relative to the workspace root (where \`bash\` commands start), or a path beginning with $HOME/.
- By default, this tool returns up to 2000 lines from the start of the file.
- The offset parameter is the line number to start from (1-indexed).
- To read later sections, call this tool again with a larger offset.
- Contents are returned with each line prefixed by its line number as \`<line>: <content>\`. For example, if a file has contents "foo\\n", you will receive "1: foo\\n".
- Any line longer than 2000 characters is truncated.
- PNG, JPEG, GIF, and WebP images up to 3 MiB and PDFs up to 20 MiB are shown to you as files, including files named in \`Attached file <path>\` references.
- Call this tool in parallel when you know there are multiple files you want to read.
- Avoid tiny repeated slices (30 line chunks). If you need more context, read a larger window.`,
	async execute(e, t) {
		return await executeReadFileOnSandbox(await t.getSandbox(), e);
	},
	inputSchema: READ_FILE_INPUT_SCHEMA,
	outputSchema: READ_FILE_OUTPUT_SCHEMA,
	async toModelOutput(e) {
		if (e.file === void 0) return toolOutput.json(e);
		let t = await contextStorage.getStore()?.get(SandboxKey)?.get();
		let n = t == null ? null : await t.readBinaryFile({ path: await resolveAbsoluteFilePath(t, e.path) });
		return n === null ? toolOutput.text(`${e.content} The file could not be loaded.`) : n.byteLength === e.file.size ? toolOutput.content([toolOutputPart.text(e.content), toolOutputPart.file(Buffer.from(n).toString(`base64`), {
			filename: basename(e.path),
			mediaType: e.file.mediaType
		})]) : toolOutput.text(`${e.content} The file changed after it was read; read it again.`);
	}
}));
export { READ_FILE_INPUT_SCHEMA, READ_FILE_OUTPUT_SCHEMA, readFile };

//# sourceMappingURL=eve69.mjs.map