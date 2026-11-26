import { frameworkTool } from "./eve26.mjs";
import { toolLabel } from "./eve40.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/provided/web-search.js
const WEB_SEARCH_TOOL_KIND = `eve:web-search-tool`;
function webSearch(e) {
	return frameworkTool({
		kind: WEB_SEARCH_TOOL_KIND,
		provider: e.provider,
		...e.fallback !== void 0 && { fallback: e.fallback }
	});
}
const WEB_SEARCH_TOOL_DESCRIPTION = `Search the web for real-time information. Use this to find up-to-date information about current events, recent developments, or topics that may have changed since the knowledge cutoff.`;
function resolveWebSearchActivityLabel(e) {
	if (typeof e != `object` || !e) return `Search`;
	let t = e;
	let n = t.action;
	let r = typeof n == `object` && n ? n : void 0;
	let i = r?.queries;
	let a = Array.isArray(i) ? i.find((e) => typeof e == `string`) : r?.query ?? r?.url ?? r?.pattern;
	return toolLabel(`Search`, t.query ?? t.objective ?? t.search_query ?? t.searchQuery ?? a);
}
const defaultWebSearch = webSearch({ provider: `parallel` });
function isWebSearchToolDefinition(e) {
	return typeof e == `object` && !!e && e.kind === WEB_SEARCH_TOOL_KIND;
}
export { WEB_SEARCH_TOOL_DESCRIPTION, defaultWebSearch, isWebSearchToolDefinition, resolveWebSearchActivityLabel, webSearch };

//# sourceMappingURL=eve41.mjs.map