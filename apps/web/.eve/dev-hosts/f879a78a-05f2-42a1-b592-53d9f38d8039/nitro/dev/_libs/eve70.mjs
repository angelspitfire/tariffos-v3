import { frameworkTool } from "./eve26.mjs";
import { defineJsonSchema } from "./eve23.mjs";
import { defineTool } from "./eve32.mjs";
import { toolLabel } from "./eve40.mjs";
import { truncateHead } from "./eve63.mjs";
import "./eve3.mjs";
import { requestPublicUrl } from "./eve71.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/web-fetch/html.js
function extractTextFromHtml(e) {
	let t = stripTags(e);
	return t = decodeHtmlEntities(t), t = t.split(`
`).map((e) => e.replace(/[ \t]+/g, ` `).trim()).join(`
`).replace(/\n{3,}/g, `

`).trim(), t;
}
const RAW_TEXT_CLOSE_TAGS = /* @__PURE__ */ new Map([
	[`noscript`, /<\/noscript(?=[\s/>])/gi],
	[`script`, /<\/script(?=[\s/>])/gi],
	[`style`, /<\/style(?=[\s/>])/gi]
]);
const BLOCK_ELEMENTS$1 = /* @__PURE__ */ new Set([
	`article`,
	`aside`,
	`blockquote`,
	`details`,
	`div`,
	`figcaption`,
	`figure`,
	`footer`,
	`h1`,
	`h2`,
	`h3`,
	`h4`,
	`h5`,
	`h6`,
	`header`,
	`li`,
	`main`,
	`nav`,
	`p`,
	`pre`,
	`section`,
	`summary`,
	`tr`
]);
const TAG_NAME_PATTERN = /^(\/?)([^\s/>]+)/;
function stripTags(e) {
	let t = [];
	let n = 0;
	for (; n < e.length;) {
		let r = e.indexOf(`<`, n);
		if (r === -1) break;
		if (e.startsWith(`<!--`, r)) {
			t.push(e.slice(n, r));
			let i = e.indexOf(`-->`, r + 4);
			n = i === -1 ? e.length : i + 3;
			continue;
		}
		let i = e.indexOf(`>`, r + 1);
		if (i === -1) break;
		t.push(e.slice(n, r)), n = i + 1;
		let a = TAG_NAME_PATTERN.exec(e.slice(r + 1, i));
		if (!a) continue;
		let o = a[1] === `/`;
		let s = a[2].toLowerCase();
		if (s === `br` || o && BLOCK_ELEMENTS$1.has(s)) {
			t.push(`
`);
			continue;
		}
		let c = o ? void 0 : RAW_TEXT_CLOSE_TAGS.get(s);
		if (c) {
			c.lastIndex = n;
			let t = c.exec(e) ? e.indexOf(`>`, c.lastIndex) : -1;
			n = t === -1 ? e.length : t + 1;
		}
	}
	return t.push(e.slice(n)), t.join(``);
}
const ENTITY_MAP = {
	"&amp;": `&`,
	"&gt;": `>`,
	"&lt;": `<`,
	"&nbsp;": ` `,
	"&quot;": `"`,
	"&#39;": `'`,
	"&#x27;": `'`,
	"&#x2F;": `/`
};
const ENTITY_PATTERN$1 = new RegExp(Object.keys(ENTITY_MAP).join(`|`), `gi`);
function decodeHtmlEntities(e) {
	return e.replace(ENTITY_PATTERN$1, (e) => ENTITY_MAP[e.toLowerCase()] ?? e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/html-to-markdown.js
const VOID_ELEMENTS = /* @__PURE__ */ new Set([
	`area`,
	`base`,
	`br`,
	`col`,
	`embed`,
	`hr`,
	`img`,
	`input`,
	`link`,
	`meta`,
	`param`,
	`source`,
	`track`,
	`wbr`
]);
const SKIPPED_ELEMENTS = /* @__PURE__ */ new Set([
	`canvas`,
	`iframe`,
	`math`,
	`noscript`,
	`object`,
	`script`,
	`select`,
	`style`,
	`svg`,
	`template`,
	`textarea`
]);
const BLOCK_ELEMENTS = new Set(`address.article.aside.blockquote.body.caption.center.dd.details.dialog.dir.div.dl.dt.fieldset.figcaption.figure.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.li.main.menu.nav.ol.p.pre.section.summary.table.tbody.td.tfoot.th.thead.title.tr.ul`.split(`.`));
const LIST_ELEMENTS = /* @__PURE__ */ new Set([
	`dir`,
	`menu`,
	`ol`,
	`ul`
]);
function convertHtmlToMarkdown(e) {
	return renderBlocks(parseHtml(e).children, 0, []).join(`

`);
}
function parseHtml(e) {
	let t = {
		name: `#root`,
		attrs: ``,
		children: [],
		hasBlock: !1
	};
	let n = [t];
	let r = 0;
	let current = () => n[n.length - 1];
	let pushText = (t) => {
		t > r && current().children.push(e.slice(r, t));
	};
	for (; r < e.length;) {
		let t = e.indexOf(`<`, r);
		if (t === -1) break;
		let i = e.charCodeAt(t + 1);
		let a = isAsciiLetter(i) || i === 47;
		let o = i === 33 || i === 63;
		if (!a && !o) {
			pushText(t + 1), r = t + 1;
			continue;
		}
		if (pushText(t), o) {
			let n = e.startsWith(`<!--`, t) ? `-->` : `>`;
			let i = e.indexOf(n, t + 2);
			r = i === -1 ? e.length : i + n.length;
			continue;
		}
		let s = findTagEnd(e, t + 1);
		if (s === -1) {
			r = t;
			break;
		}
		r = s + 1;
		let c = e.slice(t + 1, s);
		let l = c.charCodeAt(0) === 47;
		let u = /^[a-zA-Z][^\s/>]*/.exec(l ? c.slice(1) : c);
		if (!u) continue;
		let d = u[0].toLowerCase();
		if (l) {
			d === `br` ? current().children.push({
				name: d,
				attrs: ``,
				children: [],
				hasBlock: !1
			}) : closeElement(n, d);
			continue;
		}
		let f = c.charCodeAt(c.length - 1) === 47;
		if (SKIPPED_ELEMENTS.has(d)) {
			(d === `svg` || d === `math`) && f || (r = skipRawText(e, d, r));
			continue;
		}
		closeImplicitly(n, d);
		let p = {
			name: d,
			attrs: c.slice(u[0].length),
			children: [],
			hasBlock: !1
		};
		current().children.push(p), BLOCK_ELEMENTS.has(d) && markBlockAncestors(n), !VOID_ELEMENTS.has(d) && !f && n.length < 128 && n.push(p);
	}
	return r < e.length && current().children.push(e.slice(r)), t;
}
function isAsciiLetter(e) {
	return e >= 65 && e <= 90 || e >= 97 && e <= 122;
}
function findTagEnd(e, t) {
	let n = 0;
	let r = 0;
	for (let i = t; i < e.length; i++) {
		let t = e.charCodeAt(i);
		if (n !== 0) t === n && (n = 0);
		else if ((t === 34 || t === 39) && r === 61) n = t;
		else if (t === 62) return i;
		t > 32 && (r = t);
	}
	return -1;
}
function skipRawText(e, t, n) {
	let r = RegExp(`</${t}(?=[\\s/>])`, `gi`);
	if (r.lastIndex = n, !r.exec(e)) return e.length;
	let i = e.indexOf(`>`, r.lastIndex);
	return i === -1 ? e.length : i + 1;
}
function markBlockAncestors(e) {
	for (let t = e.length - 1; t > 0 && !e[t].hasBlock; t--) e[t].hasBlock = !0;
}
function closeElement(e, t) {
	for (let n = e.length - 1; n > 0; n--) if (e[n].name === t) {
		e.length = n;
		return;
	}
}
function closeImplicitly(e, t) {
	t === `li` ? closeWithin(e, [`li`], LIST_ELEMENTS) : t === `dt` || t === `dd` ? closeWithin(e, [`dt`, `dd`], /* @__PURE__ */ new Set([`dl`])) : t === `tr` ? closeWithin(e, [`tr`], /* @__PURE__ */ new Set([
		`table`,
		`thead`,
		`tbody`,
		`tfoot`
	])) : t === `td` || t === `th` ? closeWithin(e, [`td`, `th`], /* @__PURE__ */ new Set([`tr`, `table`])) : t === `thead` || t === `tbody` || t === `tfoot` ? closeWithin(e, [
		`thead`,
		`tbody`,
		`tfoot`
	], /* @__PURE__ */ new Set([`table`])) : BLOCK_ELEMENTS.has(t) && e[e.length - 1].name === `p` && e.pop();
}
function closeWithin(e, t, n) {
	for (let r = e.length - 1; r > 0; r--) {
		let i = e[r].name;
		if (n.has(i)) return;
		if (t.includes(i)) {
			e.length = r;
			return;
		}
	}
}
function readAttribute(e, t) {
	for (let n of e.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) if (n[1].toLowerCase() === t) return decodeEntities(n[2] ?? n[3] ?? n[4] ?? ``).trim();
}
function renderBlocks(e, t, n) {
	let r = [];
	let flush = () => {
		let e = normalizeInline(renderInline(r));
		e && n.push(e), r = [];
	};
	for (let i of e) typeof i == `string` || !rendersAsBlock(i) ? r.push(i) : (flush(), renderBlockElement(i, t, n));
	return flush(), n;
}
function rendersAsBlock(e) {
	return BLOCK_ELEMENTS.has(e.name) || e.hasBlock && e.name !== `a`;
}
function renderBlockElement(e, t, n) {
	switch (e.name) {
		case `h1`:
		case `h2`:
		case `h3`:
		case `h4`:
		case `h5`:
		case `h6`: {
			let t = normalizeInline(renderInline(e.children)).replace(/\n+/g, ` `);
			t && n.push(`${`#`.repeat(Number(e.name[1]))} ${t}`);
			return;
		}
		case `hr`:
			n.push(`---`);
			return;
		case `pre`:
			n.push(renderCodeBlock(e));
			return;
		case `blockquote`: {
			if (t >= 8) {
				renderBlocks(e.children, t, n);
				return;
			}
			let r = renderBlocks(e.children, t + 1, []).join(`

`);
			r && n.push(prefixLines(r, `> `, `>`));
			return;
		}
		case `ol`:
		case `ul`:
		case `dir`:
		case `menu`:
			renderList(e, t, n);
			return;
		case `table`:
			renderTable(e, t, n);
			return;
		default: renderBlocks(e.children, t, n);
	}
}
function renderList(e, t, n) {
	let r = e.name === `ol` ? readAttribute(e.attrs, `start`) : void 0;
	let i = r !== void 0 && /^\d{1,9}$/.test(r) ? Number(r) : 1;
	let a = [];
	for (let r of e.children) {
		let o = typeof r != `string` && r.name === `li` ? r.children : [r];
		let s = e.name === `ol` ? `${i}. ` : `- `;
		if (t >= 8) {
			let e = n.length;
			renderBlocks(o, t, n), n.length > e && (n[e] = s + n[e], i++);
			continue;
		}
		let c = renderBlocks(o, t + 1, []).join(`
`);
		c && (i++, a.push(s + prefixLines(c, ` `.repeat(s.length), ``, !0)));
	}
	a.length > 0 && n.push(a.join(`
`));
}
function renderCodeBlock(e) {
	let t = readAttribute(e.children.find((e) => typeof e != `string` && e.name === `code`)?.attrs ?? ``, `class`) ?? readAttribute(e.attrs, `class`);
	let n = /(?:^|\s)(?:language|lang)-([\w+#.-]+)/.exec(t ?? ``)?.[1] ?? ``;
	let r = decodeEntities(textContent(e.children)).replace(/^\r?\n/, ``).trimEnd();
	let i = "`".repeat(Math.max(3, longestBacktickRun(r) + 1));
	return `${i}${n}\n${r}\n${i}`;
}
function renderTable(e, t, n) {
	let r = [];
	let i = [];
	let visit = (e) => {
		for (let t of e) typeof t != `string` && (t.name === `tr` ? r.push(t.children.filter((e) => typeof e != `string` && (e.name === `td` || e.name === `th`))) : t.name === `caption` ? i.push(t) : (t.name === `thead` || t.name === `tbody` || t.name === `tfoot`) && visit(t.children));
	};
	if (visit(e.children), r.some((e) => e.some((e) => e.hasBlock))) {
		renderBlocks(e.children, t, n);
		return;
	}
	let a = [];
	for (let e of i) renderBlocks(e.children, t, a);
	let o = r.reduce((e, t) => Math.max(e, t.length), 0);
	if (o > 0) {
		let line = (e) => `| ${Array.from({ length: o }, (t, n) => e[n] ?? ``).join(` | `)} |`;
		let [e, ...t] = r.map((e) => e.map((e) => normalizeInline(renderInline(e.children)).replace(/\n+/g, ` `).replace(/\|/g, `\\|`)));
		a.push([
			line(e),
			line(Array.from({ length: o }, () => `---`)),
			...t.map(line)
		].join(`
`));
	}
	a.length > 0 && n.push(a.join(`

`));
}
function renderInline(e) {
	let t = [];
	for (let n of e) t.push(typeof n == `string` ? renderText(n) : renderInlineElement(n));
	return t.join(``);
}
function renderInlineElement(e) {
	switch (e.name) {
		case `br`: return `
`;
		case `strong`:
		case `b`: return wrap(renderInline(e.children), `**`);
		case `em`:
		case `i`: return wrap(renderInline(e.children), `*`);
		case `del`:
		case `s`:
		case `strike`: return wrap(renderInline(e.children), `~~`);
		case `code`:
		case `kbd`:
		case `samp`: return renderInlineCode(e);
		case `a`: {
			let t = renderInline(e.children);
			let n = readAttribute(e.attrs, `href`);
			if (!n || !t.trim()) return t;
			let r = readAttribute(e.attrs, `title`);
			let i = r ? ` "${r.replace(/"/g, `\\"`)}"` : ``;
			return wrap(t, `[`, `](${escapeUrl(n)}${i})`);
		}
		case `img`: {
			let t = readAttribute(e.attrs, `src`);
			return t ? `![${(readAttribute(e.attrs, `alt`) ?? ``).replace(/\s+/g, ` `)}](${escapeUrl(t)})` : ``;
		}
		case `input`: return ``;
		default: {
			let t = renderInline(e.children);
			return BLOCK_ELEMENTS.has(e.name) ? ` ${t} ` : t;
		}
	}
}
function renderInlineCode(e) {
	let t = decodeEntities(textContent(e.children)).replace(/\s+/g, ` `);
	if (!t.trim()) return t;
	let n = "`".repeat(longestBacktickRun(t) + 1);
	let r = t.startsWith("`") || t.endsWith("`") ? ` ` : ``;
	return `${n}${r}${t}${r}${n}`;
}
function wrap(e, t, n = t) {
	let r = e.trim();
	if (!r) return e;
	let i = e.length - e.trimStart().length;
	let a = e.trimEnd().length;
	return `${e.slice(0, i)}${t}${r}${n}${e.slice(a)}`;
}
function longestBacktickRun(e) {
	let t = 0;
	for (let n of e.matchAll(/`+/g)) t = Math.max(t, n[0].length);
	return t;
}
function renderText(e) {
	return decodeEntities(e.replace(/[ \t\n\r\f]+/g, ` `));
}
function textContent(e) {
	let t = [];
	let visit = (e) => {
		for (let n of e) typeof n == `string` ? t.push(n) : n.name === `br` ? t.push(`
`) : visit(n.children);
	};
	return visit(e), t.join(``);
}
function normalizeInline(e) {
	return e.split(`
`).map((e) => e.replace(/ {2,}/g, ` `).trim()).join(`
`).trim();
}
function prefixLines(e, t, n, r = !1) {
	return e.split(`
`).map((e, i) => r && i === 0 ? e : e ? t + e : n).join(`
`);
}
function escapeUrl(e) {
	return e.replace(/[\s()<>]/g, (e) => encodeURIComponent(e));
}
const NAMED_ENTITIES = /* @__PURE__ */ new Map([
	[`amp`, `&`],
	[`apos`, `'`],
	[`bull`, `•`],
	[`cent`, `¢`],
	[`copy`, `©`],
	[`deg`, `°`],
	[`euro`, `€`],
	[`gt`, `>`],
	[`hellip`, `…`],
	[`laquo`, `«`],
	[`ldquo`, `“`],
	[`lsquo`, `‘`],
	[`lt`, `<`],
	[`mdash`, `—`],
	[`middot`, `·`],
	[`nbsp`, ` `],
	[`ndash`, `–`],
	[`para`, `¶`],
	[`pound`, `£`],
	[`quot`, `"`],
	[`raquo`, `»`],
	[`rdquo`, `”`],
	[`reg`, `®`],
	[`rsquo`, `’`],
	[`sect`, `§`],
	[`times`, `×`],
	[`trade`, `™`],
	[`yen`, `¥`]
]);
const ENTITY_PATTERN = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([a-zA-Z][a-zA-Z0-9]{1,31}));/g;
function decodeEntities(e) {
	return e.includes(`&`) ? e.replace(ENTITY_PATTERN, (e, t, n, r) => {
		if (r !== void 0) return NAMED_ENTITIES.get(r.toLowerCase()) ?? e;
		let i = t === void 0 ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
		return i > 0 && i <= 1114111 && (i < 55296 || i > 57343) ? String.fromCodePoint(i) : `�`;
	}) : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/web-fetch/execute.js
const MAX_RESPONSE_SIZE = 5242880;
async function executeWebFetchTool(e, t) {
	let { url: n, format: r = `markdown`, timeout: i } = e;
	let a = Math.min(i === void 0 ? 3e4 : i * 1e3, 12e4);
	let o = AbortSignal.timeout(a);
	let s = t?.abortSignal === void 0 ? o : AbortSignal.any([t.abortSignal, o]);
	let c = buildHeaders(r);
	let l = await requestPublicUrl(n, {
		headers: c,
		maxResponseSize: MAX_RESPONSE_SIZE,
		signal: s
	});
	let u = l.status === 403 && l.headers.get(`cf-mitigated`) === `challenge` ? await requestPublicUrl(n, {
		headers: {
			...c,
			"User-Agent": "eve"
		},
		maxResponseSize: MAX_RESPONSE_SIZE,
		signal: s
	}) : l;
	let d = await u.arrayBuffer();
	let f = u.headers.get(`content-type`) ?? ``;
	let p = new TextDecoder().decode(d);
	let m = f.includes(`text/html`) || f.trim() === `` && /^\s*<(?:!doctype\s+html|html)[\s>]/i.test(p);
	let h;
	if (h = r === `markdown` && m ? convertHtmlToMarkdown(p) : r === `text` && m ? extractTextFromHtml(p) : p, !u.ok) {
		let e = `Request failed with status code: ${u.status}`;
		h = h.length === 0 ? e : `${e}\n\n${h}`;
	}
	let { output: g, truncated: _ } = truncateHead(h);
	return {
		content: g,
		contentType: f,
		truncated: _,
		url: n
	};
}
function buildHeaders(e) {
	let t;
	return t = e === `markdown` ? `text/markdown;q=1.0, text/x-markdown;q=0.9, text/plain;q=0.8, text/html;q=0.7, */*;q=0.1` : e === `text` ? `text/plain;q=1.0, text/markdown;q=0.9, text/html;q=0.8, */*;q=0.1` : `text/html;q=1.0, application/xhtml+xml;q=0.9, text/plain;q=0.8, text/markdown;q=0.7, */*;q=0.1`, {
		Accept: t,
		"Accept-Language": `en-US,en;q=0.9`,
		"User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36`
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/web-fetch.js
const WEB_FETCH_INPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		format: {
			type: `string`,
			enum: [
				`markdown`,
				`text`,
				`html`
			],
			description: `The format to return the content in (text, markdown, or html). HTML responses are automatically converted to the requested format. Defaults to "markdown".`
		},
		timeout: {
			type: `number`,
			description: `Optional timeout in seconds, greater than 0. Defaults to 30, max 120.`
		},
		url: {
			type: `string`,
			description: `The fully-formed URL to fetch content from. Must start with https://.`
		}
	},
	required: [`url`],
	additionalProperties: !1
}, (e) => e.timeout !== void 0 && !(e.timeout > 0) ? `timeout must be greater than 0 seconds.` : void 0);
const WEB_FETCH_OUTPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: {
		content: { type: `string` },
		contentType: { type: `string` },
		truncated: { type: `boolean` },
		url: { type: `string` }
	},
	required: [
		`content`,
		`contentType`,
		`truncated`,
		`url`
	],
	additionalProperties: !1
});
const webFetch = frameworkTool(defineTool({
	label: { start: (e) => toolLabel(`Fetch`, e.url) },
	description: `Fetch a webpage and return its content in the requested format. Use this to retrieve and analyze content from URLs.

Usage notes:
- The URL must be a fully-formed valid URL starting with https://
- HTML responses are automatically converted to markdown or plain text based on the requested format
- Format options: "markdown" (default), "text", or "html"
- Default timeout is 30 seconds (max 120 seconds)
- Maximum response size is 5 MB; content is further capped at the shared tool-output budget (50 KB / 2000 lines)
- This tool is read-only and does not modify any files`,
	async execute(e, t) {
		return await executeWebFetchTool(e, { abortSignal: t.abortSignal });
	},
	inputSchema: WEB_FETCH_INPUT_SCHEMA,
	outputSchema: WEB_FETCH_OUTPUT_SCHEMA
}));
export { WEB_FETCH_INPUT_SCHEMA, WEB_FETCH_OUTPUT_SCHEMA, webFetch };

//# sourceMappingURL=eve70.mjs.map