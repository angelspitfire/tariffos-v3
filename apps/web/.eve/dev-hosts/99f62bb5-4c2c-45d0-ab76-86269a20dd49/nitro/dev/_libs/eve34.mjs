import { FINAL_REPLY_TASK_SYSTEM_BLOCK, SECTION_ORDER, SKILL_NAME_PATTERN, TASK_SYSTEM_BLOCK, agentModel, authoredEvaluate, callableOf, closestNames, compareCodeUnits, compiledAgentRoster, completeConnectionSignIn, connectionDefinition, connectionSignInEntry, connectionToolName, connectionToolSignature, connections, entrySignature, hookDefinition, instructions, instructionsDefinition, isAgentTool, isBrandedSkillEntry, isEmptyQuery, listConnectionTools, listingFailureMessage, loadModelDefinition, memoryDefinition, memoryToolsDefinition, namedEntries, once, parentModel, pendingApprovalsNote, rankCandidates, readDynamicSubagentSelections, resolveSessionUsageLimit, section, sessionOffersTasks, slotValueOf, slotsOf, staticTools, subagentDefinition, toolDefinition, toolsDefinition, unknownSkillMessage, withTaskTools, workspace } from "./eve33.mjs";
import { defineJsonSchema, serializeInputSchema, toInputSchema } from "./eve23.mjs";
import { declared } from "./eve35.mjs";
import { isObject } from "./eve14.mjs";
import { compiledBundleOf, eveNamespaceReservation, resolveRuntimeCompiledArtifactsVersionedCacheKey, serializeDurableCompiledArtifactsSource } from "./eve21.mjs";
import { resolveSandboxSkillRoot, resolveSandboxSkillWritePath } from "./eve46.mjs";
import { DynamicSkillSandboxKey, ParentSessionKey, SandboxKey } from "./eve13.mjs";
import { parseJsonValue } from "./eve8.mjs";
import { scheduleCollectionToolSlot } from "./eve17.mjs";
import "./eve24.mjs";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/approvals.js
const approvals = {
	contribute: ({ call: e, step: t }) => {
		let n = e === void 0 ? void 0 : t?.view?.();
		let r = n === void 0 ? void 0 : pendingApprovalsNote(n);
		return r === void 0 ? {} : { system: [section(`eve.approvals`, r, {
			order: SECTION_ORDER.approvals,
			part: `own`
		})] };
	},
	id: `eve.approvals`,
	label: `eve's note on pending approvals`
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/builtins.js
const builtins = {
	contribute: ({ container: e, step: t }) => ({ arrange: (n) => {
		let r = once(async () => t !== void 0 && (hasRunningTask(t) || sessionOffersTasks({
			ctx: e,
			session: t.session,
			tools: [...(await n.tools()).entries.values()].map(({ definition: e }) => e)
		})));
		return {
			system: async () => [...await n.system(), ...await r() ? [section(`eve.tasks`, t.finalReplyOnly ? FINAL_REPLY_TASK_SYSTEM_BLOCK : TASK_SYSTEM_BLOCK, {
				order: SECTION_ORDER.tasks,
				part: `own`
			})] : []],
			tools: async () => {
				let e = await n.tools();
				if (!await r()) return e;
				let t = new Map([...e.entries].map(([e, t]) => [e, t.definition]));
				let i = [...withTaskTools(t)].filter(([t]) => !e.entries.has(t));
				return {
					...e,
					entries: new Map([...e.entries, ...i.map(([e, t]) => [e, { definition: t }])])
				};
			}
		};
	} }),
	id: `eve.builtins`,
	label: `eve's builtins`
};
function hasRunningTask(e) {
	let t = e.view?.().projection.view.tasks ?? {};
	return Object.values(t).some((e) => e.status === `running`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/search.js
function searchDescription({ connections: e, skills: t, tools: n }) {
	return [
		`Search your own catalog for tools, agents, skills, and connected services that aren't in your tool list. Use it when nothing in your tool list fits the request; it doesn't search the web.`,
		n ? `A result with \`tool\` has the exact name, description, and TypeScript signature: call it with eve__tool({ name, input }).` : void 0,
		t ? `A result with \`skill\` has the name and description: load it with eve__skill({ name }).` : void 0,
		"`searched` counts the entries the query covered, and `remaining` counts the matches past `limit`: when `remaining` is 0, nothing else the query covered matched. Connections under `unavailable` weren't searched.",
		`When you already know a name or connection, from the catalog listing, an earlier result, or an error, search it directly: the exact name, or "<connection>__", which is faster and returns only that connection's tools.`,
		e ? `A connection that needs sign-in appears as a tool named after the connection: calling it with eve__tool({ name }) asks the user to sign in. \`searched\` counts its tools only after sign-in.` : void 0
	].filter((e) => e !== void 0).join(` `);
}
const SEARCH_INPUT_SCHEMA = toInputSchema({
	type: `object`,
	properties: {
		query: {
			type: `string`,
			minLength: 1,
			description: `Words describing the capability, such as 'list open issues'; an exact name; or a namespace prefix such as 'linear__', which searches only that connection's tools.`
		},
		limit: {
			type: `integer`,
			minimum: 1,
			maximum: 50,
			description: `Maximum results, best matches first. Defaults to 10.`
		}
	},
	required: [`query`],
	additionalProperties: !1
});
const SEARCH_LABEL = {
	start: (e) => `Search tools${labelQuery(e)}`,
	complete: (e, t) => {
		let { results: n, unavailable: r = [] } = t;
		let i = `Searched tools${labelQuery(e)}, found ${n.length === 0 ? `nothing` : String(n.length)}`;
		if (n.length > 0 || r.length === 0) return i;
		let a = r.length === 1 ? `connection` : `connections`;
		return `${i}; ${String(r.length)} ${a} unavailable`;
	}
};
function labelQuery(e) {
	let t = e.query?.trim();
	return t ? ` for “${t}”` : ``;
}
function createSearchTool(e) {
	return {
		description: searchDescription(e.reach),
		execute: (t) => search(e, t),
		frameworkTool: !0,
		inputSchema: SEARCH_INPUT_SCHEMA,
		label: SEARCH_LABEL,
		name: "eve__search"
	};
}
async function search(e, t) {
	let n = t.query ?? ``;
	if (isEmptyQuery(n)) throw Error(`eve__search needs at least one word in query, such as a capability ("list open issues") or a name or connection prefix ("linear__").`);
	let r = parseNamespace(n);
	let inScope = (e) => r === void 0 || inNamespace(e, r);
	let i = [...e.deferred.map((t) => entryCandidate(t, e.describe)), ...e.skills.map(skillCandidate)].filter((e) => inScope(e.fullName));
	let a = [];
	let { registry: o } = e;
	if (o !== void 0) {
		let e = o.getConnections().filter(({ connectionName: e }) => r === void 0 || mayOwnNamespace(e, r));
		let t = await Promise.all(e.map((e) => searchConnection(o, e)));
		for (let e of t) `unavailable` in e ? a.push(e.unavailable) : i.push(...e.candidates.filter((e) => inScope(e.fullName)));
	}
	if (r !== void 0 && i.length === 0 && a.length === 0) throw Error(unknownNamespaceMessage(r, o?.getConnections() ?? []));
	let s = clampInteger(t.limit, 1, 50, 10);
	let c = rankCandidates(n, i);
	let l = c.slice(0, s).map((e) => e.result());
	let u = {
		results: l,
		remaining: c.length - l.length,
		searched: i.length
	};
	return a.length > 0 ? {
		...u,
		unavailable: a
	} : u;
}
function parseNamespace(e) {
	let t = (e.trim().split(/\s+/u)[0] ?? ``).replace(/^[^A-Za-z0-9_-]+/u, ``);
	let n = t.slice(0, Math.max(0, t.lastIndexOf(`__`))).replace(/_+$/u, ``);
	return n === `` ? void 0 : n;
}
function inNamespace(e, t) {
	return e === t || e.startsWith(`${t}__`);
}
function mayOwnNamespace(e, t) {
	return inNamespace(e, t) || t.startsWith(`${e}__`);
}
function unknownNamespaceMessage(e, t) {
	if (t.some(({ connectionName: t }) => t === e)) return `Connection "${e}" has no tools.`;
	let n = closestNames(e, t.map(({ connectionName: e, description: t }) => ({
		description: t,
		name: e
	})));
	return `No entries are named "${e}__…". ${n.length > 0 ? `Closest connections: ${n.join(`, `)}.` : `Find names in the catalog listing or your tool list, or call eve__search with plain words.`}`;
}
async function searchConnection(e, t) {
	let n = t.connectionName;
	let r;
	try {
		r = await listConnectionTools(t, await completeConnectionSignIn(e, t));
	} catch (e) {
		return { unavailable: {
			connection: n,
			error: listingFailureMessage(n, e)
		} };
	}
	return `failure` in r ? { unavailable: {
		connection: n,
		error: r.failure
	} } : `authorization` in r ? { candidates: [signInCandidate(e, t)] } : { candidates: r.tools.map((e) => toolCandidate(t, e)) };
}
function entryCandidate(e, t) {
	let n = serializeInputSchema(e.inputSchema);
	let r = t(e);
	return {
		description: r,
		inputSchema: n,
		name: e.name,
		result: () => ({
			description: r,
			signature: entrySignature(e, n),
			tool: e.name
		}),
		fullName: e.name
	};
}
function skillCandidate({ description: e, name: t, path: n }) {
	return {
		description: e,
		fullName: t,
		name: t,
		result: () => ({
			description: e,
			path: n,
			skill: t
		})
	};
}
function toolCandidate(e, t) {
	let n = connectionToolName(e.connectionName, t.name);
	return {
		connection: {
			description: e.description,
			name: e.connectionName
		},
		description: t.description,
		inputSchema: t.inputSchema,
		name: t.name,
		result: () => ({
			description: t.description,
			signature: connectionToolSignature(e, t),
			tool: n
		}),
		fullName: n
	};
}
function signInCandidate(e, t) {
	let n = connectionSignInEntry(e, t);
	return {
		description: t.description,
		name: t.connectionName,
		result: () => ({
			description: n.description,
			signature: entrySignature(n),
			tool: n.name
		}),
		fullName: n.name
	};
}
function clampInteger(e, t, n, r) {
	return typeof e != `number` || !Number.isFinite(e) ? r : Math.min(n, Math.max(t, Math.trunc(e)));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/catalog-tools.js
const CALL_TOOL_DESCRIPTION = `Call a tool that isn't in your tool list by its exact name from eve__search, with \`input\` matching its signature.`;
const SEARCHABLE_SKILL_DESCRIPTION = `Load a skill's instructions when the request clearly matches a listed skill or one eve__search found, or the user asks for it, then follow them.`;
function catalogReach(e) {
	let t = [...e.skills.values()];
	let n = e.connections.length > 0;
	return {
		connections: n,
		searchableSkills: t.some((e) => e.deferred),
		skills: t.length > 0,
		tools: n || e.deferred.size > 0
	};
}
function catalogTools(e, t, n) {
	let r = t.tools || t.searchableSkills;
	let i = /* @__PURE__ */ new Set([
		...r ? ["eve__search"] : [],
		...t.tools ? ["eve__tool"] : [],
		...t.skills ? ["eve__skill"] : []
	]);
	let a = /* @__PURE__ */ new Map();
	return r && a.set("eve__search", {
		announcements: n.catalog,
		definition: createSearchTool({
			deferred: [...e.deferred.values()],
			describe: e.describe,
			reach: {
				connections: t.connections,
				skills: t.searchableSkills,
				tools: t.tools
			},
			registry: e.registry,
			skills: [...e.skills.values()].filter((e) => e.deferred)
		})
	}), t.tools && a.set("eve__tool", callRoute(e, i, t)), t.skills && a.set("eve__skill", {
		...skillRoute(e, i, t),
		announcements: n.skills
	}), a;
}
function routeEntry(e, t, n) {
	return {
		definition: {
			description: t,
			frameworkTool: !0,
			inputSchema: defineJsonSchema(n.inputSchema),
			name: e
		},
		route: n
	};
}
function callRoute(e, t, n) {
	return routeEntry("eve__tool", n.connections ? `${CALL_TOOL_DESCRIPTION} Prefer connected services over web search or general knowledge when a request relates to them.` : CALL_TOOL_DESCRIPTION, {
		explain: (t, n) => isConnectionTool(t.name, e.connections) ? n : [...n, { message: `Signature: ${entrySignature(t)}` }],
		inputSchema: {
			type: `object`,
			properties: {
				name: {
					type: `string`,
					description: `The tool's exact name, as eve__search returns it.`
				},
				input: {
					type: `object`,
					description: `Arguments matching the tool's signature. Defaults to {}.`
				}
			},
			required: [`name`],
			additionalProperties: !1
		},
		target: (n) => {
			let r = targetName(n);
			if (r === void 0) return miss(`Name the tool to call.`);
			if (t.has(r)) return miss(`"${r}" is in your tool list; call it directly.`);
			let i = e.get(r);
			return i === void 0 ? miss(unknownEntryMessage(r, e)) : callableByName(i) ? {
				at: `input`,
				input: n.input ?? {},
				name: r
			} : miss(`"${r}" is in your tool list; call it directly.`);
		}
	});
}
function skillRoute(e, t, n) {
	let r = n.searchableSkills;
	return routeEntry("eve__skill", r ? SEARCHABLE_SKILL_DESCRIPTION : `Load a skill's instructions when the request clearly matches one of your listed skills or the user asks for it, then follow them.`, {
		inputSchema: {
			type: `object`,
			properties: { name: {
				type: `string`,
				description: r ? `The skill's name, from your listed skills or eve__search.` : `The skill's name, from your listed skills.`
			} },
			required: [`name`],
			additionalProperties: !1
		},
		target: (n) => {
			let i = targetName(n);
			if (i === void 0) return miss(`Name the skill to load.`);
			if (e.skills.has(i)) return {
				input: { name: i },
				name: "eve:load-skill"
			};
			let a = e.connections.map((e) => e.connectionName);
			if (t.has(i)) return miss(`"${i}" is a tool in your tool list, not a skill; call it directly.`);
			let o = a.includes(i) ? void 0 : e.get(i);
			return miss(o === void 0 ? unknownSkillMessage(i, e.skills, a, r) : o.deferred === !0 ? `"${i}" is a tool, not a skill; call it with eve__tool({ name: "${i}" }).` : `"${i}" is a tool in your tool list, not a skill; call it directly.`);
		}
	});
}
function targetName(e) {
	return isObject(e) && typeof e.name == `string` ? e.name : void 0;
}
function miss(e) {
	return {
		issue: e,
		path: `name`
	};
}
function callableByName(e) {
	return e.deferred === !0 || eveNamespaceReservation(e.name) === void 0 && (e.execute !== void 0 || e.workflowId !== void 0);
}
function isConnectionTool(e, t) {
	return t.some(({ connectionName: t }) => e.startsWith(connectionToolName(t, ``)));
}
function unknownEntryMessage(e, t) {
	if (t.skills.has(e)) return `"${e}" is a skill; load it with eve__skill({ name: "${e}" }).`;
	let n = [...t.deferred.values()].map(({ description: e, name: t }) => ({
		description: e,
		name: t
	}));
	let r = closestNames(e, n);
	return `No tool named "${e}".${r.length > 0 ? ` Closest tools: ${r.join(`, `)}.` : ` Find tools with eve__search.`}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/catalog/listing.js
function catalogAnnouncements(e) {
	let t = listCatalog(e);
	let n = reachableNames(e);
	return { catalog: {
		initial: EMPTY_LISTING,
		value: JSON.stringify(t),
		render: (e) => renderCatalogAnnouncement(parseListing(e), t, n)
	} };
}
function listCatalog(e) {
	let t = [...e.deferred.values()];
	let n = [];
	t.some((e) => !isAgentTool(e)) && n.push(`tools`), t.some(isAgentTool) && n.push(`agents`), [...e.skills.values()].some(({ deferred: e }) => e) && n.push(`skills`);
	let r = capped([...namespaceCounts(e)].sort(([e, t], [n, r]) => r - t || compareCodeUnits(e, n)).map(([e]) => e), 20);
	return {
		connections: capped(e.connections.map(({ connectionName: e, description: t }) => ({
			description: t,
			name: e
		})).sort((e, t) => compareCodeUnits(e.name, t.name)), 20),
		kinds: n,
		namespaces: {
			...r,
			items: [...r.items].sort(compareCodeUnits)
		}
	};
}
const EMPTY_LISTING = JSON.stringify(listCatalog({
	connections: [],
	deferred: /* @__PURE__ */ new Map(),
	entries: /* @__PURE__ */ new Map(),
	skills: /* @__PURE__ */ new Map()
}));
function namespaceCounts(e) {
	let t = new Set(e.connections.map(({ connectionName: e }) => e));
	let n = /* @__PURE__ */ new Map();
	for (let r of deferredNames(e)) {
		let e = namespaceOf(r);
		e !== `` && !t.has(e) && n.set(e, (n.get(e) ?? 0) + 1);
	}
	return n;
}
function reachableNames(e) {
	return /* @__PURE__ */ new Set([...[...e.entries.keys(), ...e.skills.keys()].map(namespaceOf), ...e.connections.map(({ connectionName: e }) => e)]);
}
function namespaceOf(e) {
	return e.slice(0, Math.max(0, e.indexOf(`__`)));
}
function deferredNames(e) {
	return [...[...e.deferred.values()].map(({ name: e }) => e), ...[...e.skills.values()].filter(({ deferred: e }) => e).map(({ name: e }) => e)];
}
function capped(e, t) {
	return {
		items: e.slice(0, t),
		more: e.length > t
	};
}
function renderCatalogAnnouncement(e, t, n) {
	if (isEmpty(t)) return `The catalog changed. It is empty now: eve__search finds nothing.`;
	if (e === void 0 || isEmpty(e)) return renderListing(t);
	let r = [...e.namespaces.items, ...e.connections.items.map(({ name: e }) => e)].filter((e) => !n.has(e));
	return [
		`The catalog changed.`,
		renderListing(t),
		...r.length > 0 ? [`No longer available: ${r.join(`, `)}`] : []
	].join(`
`);
}
function renderListing({ connections: e, kinds: t, namespaces: n }) {
	let a = [`${t.length === 0 ? `Your connections have more tools` : `You have more ${joinWords(t)}`} than are loaded here. Before saying you have no tool for a task, look for one with eve__search, which searches your own catalog, not the web. ${t.includes(`skills`) ? t.length === 1 && e.items.length === 0 ? `Load them with eve__skill({ name }).` : `Call tools with eve__tool({ name, input }) and load skills with eve__skill({ name }).` : `Call them with eve__tool({ name, input }).`}`];
	if (n.items.length > 0) {
		let e = [...n.items, ...n.more ? [`and more`] : []];
		a.push(`Namespaces, whose entries are named <namespace>__<name>; search one with "<namespace>__": ${e.join(`, `)}`);
	}
	return e.items.length > 0 && a.push(`Connections, whose tools are named <connection>__<tool>; search one connection's tools with "<connection>__":`, ...e.items.map(formatConnection), ...e.more ? [`- and more`] : []), a.join(`
`);
}
function joinWords(e) {
	return e.length <= 2 ? e.join(` and `) : `${e.slice(0, -1).join(`, `)}, and ${e.at(-1)}`;
}
function formatConnection(e) {
	return e.description.length === 0 ? `- ${e.name}` : `- ${e.name}: ${e.description}`;
}
function isEmpty(e) {
	return e.kinds.length === 0 && e.connections.items.length === 0;
}
function parseListing(e) {
	if (e !== void 0) try {
		return JSON.parse(e);
	} catch {
		return;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/skills/instructions.js
const NO_SKILLS = `Available skills: none`;
function formatAvailableSkillsSection(e) {
	return e.length === 0 ? null : [
		`Available skills`,
		`Listed skills are available in this run. Do not claim a listed skill is inaccessible unless activation or workspace inspection actually fails.`,
		`Dynamic skill announcements replace earlier dynamic skills and override static skills with the same name. Static skills omitted from a dynamic announcement remain available.`,
		`If the user names a skill or the request clearly matches one of the descriptions below, load it with eve__skill({ name }) before proceeding.`,
		`If multiple skills match, activate the minimal set that covers the task. After activation, follow the returned instructions instead of improvising around them.`,
		`If activation fails, say so briefly and continue with the best available alternative.`,
		`Skill files live under \`\$HOME/.agents/skills/<skill>/\`, with \`skills/<skill>/\` under the workspace root as the fallback when \`$HOME\` is unavailable.`,
		"When a loaded SKILL.md mentions sibling files such as `references/foo.md`, resolve them relative to the directory containing that specific SKILL.md.",
		...e.map(formatAvailableSkillLine)
	].join(`
`);
}
function dynamicSkillAnnouncements(e) {
	let t = formatAvailableSkillsSection(e.filter((e) => !e.deferred).map(({ description: e, name: t, path: n }) => ({
		description: e,
		hasFiles: n !== void 0,
		name: t
	}))) ?? NO_SKILLS;
	return { skills: {
		initial: NO_SKILLS,
		value: t,
		render: () => t
	} };
}
function formatAvailableSkillLine(e) {
	let t = `- ${e.name}: ${e.description}`;
	return e.hasFiles === !1 ? t : `${t} (path: ${skillFilePath(e.name)})`;
}
function skillFilePath(e) {
	return `\$HOME/.agents/skills/${e}/SKILL.md`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/catalog.js
const catalog = {
	contribute: (e) => {
		let { step: t } = e;
		return t === void 0 ? {} : { arrange: (n) => {
			let r = once(async () => {
				let r = await n.tools();
				let i = callableOf({
					ctx: e.container,
					endsTurn: t.endsTurn,
					session: t.session,
					table: r
				});
				return {
					callable: i,
					offered: await offered(e, i),
					table: r
				};
			});
			return { tools: async () => {
				let { callable: e, offered: t, table: n } = await r();
				let i = [...catalogTools(e, t, {
					catalog: catalogAnnouncements(e),
					skills: dynamicSkillAnnouncements([...e.skills.values()].filter(({ source: e }) => e !== void 0))
				})].filter(([e]) => !n.entries.has(e));
				return {
					...n,
					entries: new Map([...n.entries, ...i])
				};
			} };
		} };
	},
	id: `eve.catalog`,
	label: `eve's catalog tools`
};
async function offered(e, t) {
	let n = catalogReach(t);
	return union(n, (await e.keep((e, t) => {
		let r = union(n, t);
		return Object.values(r).includes(!0) ? { value: { ...r } } : null;
	}))?.value);
}
function union(e, t) {
	return {
		connections: e.connections || t?.connections === !0,
		searchableSkills: e.searchableSkills || t?.searchableSkills === !0,
		skills: e.skills || t?.skills === !0,
		tools: e.tools || t?.tools === !0
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/skill-package.js
function stripSkillFrontmatter(e) {
	return e.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ``);
}
function skillPackageRevision(e) {
	let t = createHash(`sha256`);
	for (let n of e.files) t.update(`${n.relativePath}\0${n.content.byteLength}\0`).update(n.content);
	return t.digest(`hex`);
}
function normalizeSkillPackage(e) {
	assertSafeSkillPackageName(e.name);
	let t = [{
		content: Buffer.from(e.content, `utf8`),
		relativePath: `SKILL.md`
	}];
	for (let [n, r] of Object.entries(e.files ?? {})) assertSafeSkillPackageFilePath(n), t.push({
		content: contentToBuffer(r),
		relativePath: n
	});
	return t.sort((e, t) => comparePaths(e.relativePath, t.relativePath)), {
		deferred: e.deferred,
		description: e.description,
		files: t,
		license: e.license,
		content: e.content,
		metadata: e.metadata === void 0 ? void 0 : { ...e.metadata },
		name: e.name
	};
}
async function writeSkillPackageToSandbox(e) {
	let t = await Promise.all(e.skill.files.map(async (t) => ({
		content: t.content,
		path: await resolveSandboxSkillWritePath({
			name: e.skill.name,
			relativePath: t.relativePath,
			sandbox: e.sandbox
		})
	})));
	await e.sandbox.writeFiles({ files: t });
}
async function removeSkillPackageFromSandbox(e) {
	assertSafeSkillPackageName(e.name);
	let t = await resolveSandboxSkillRoot({ sandbox: e.sandbox });
	await e.sandbox.removePath({
		force: !0,
		path: `${t}/${e.name}`,
		recursive: !0
	});
}
function assertSafeSkillPackageName(e) {
	if (e.length === 0 || e.startsWith(`.`) || e.includes(`/`) || e.includes(`\\`) || e.includes(`..`) || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(e) || /^[A-Za-z]:/.test(e)) throw Error(`Expected skill name to be a non-empty shell-safe path segment starting with an alphanumeric character and containing only alphanumerics, ".", "_", or "-".`);
}
function assertSafeSkillPackageFilePath(e) {
	if (e === `SKILL.md`) throw Error(`Skill package files must not include "SKILL.md"; eve generates it.`);
	if (e.length === 0 || e.startsWith(`/`) || e.includes(`\\`) || /^[A-Za-z]:/.test(e) || e.split(`/`).some((e) => e.length === 0 || e === `.` || e === `..`)) throw Error(`Expected skill package file paths to be relative POSIX paths.`);
}
function contentToBuffer(e) {
	return typeof e == `string` ? Buffer.from(e, `utf8`) : Buffer.from(e);
}
function comparePaths(e, t) {
	return e < t ? -1 : +(e > t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/skills.js
const skills = {
	contribute: ({ container: e }) => {
		let t = compiledBundleOf(e)?.resolvedAgent.skills ?? [];
		return {
			tools: () => ({ skills: new Map(t.map((e) => [e.name, {
				deferred: e.deferred === !0,
				description: e.description,
				markdown: e.content,
				name: e.name,
				path: skillFilePath(e.name)
			}])) }),
			arrange: (e) => ({ system: async () => {
				let n = new Set(t.map(({ name: e }) => e));
				let r = skillsSection([...(await e.tools()).skills.values()].filter(({ name: e }) => n.has(e)));
				return [...await e.system(), ...r === void 0 ? [] : [r]];
			} })
		};
	},
	id: `eve.skills`,
	label: `the agent's skills`
};
function skillsSection(e) {
	let t = formatAvailableSkillsSection(e.filter((e) => e.deferred !== !0).map(({ description: e, name: t }) => ({
		description: e,
		name: t
	})));
	return t === null ? void 0 : section(`eve.skills`, t, { order: SECTION_ORDER.skills });
}
function skillDefinition(e) {
	let t = skillId(e);
	let n = authoredEvaluate(e.evaluate);
	return {
		contribute: (r) => ({ tools: async () => {
			let i = await r.keep(async (t) => {
				let r = namedEntries(e, await n(t), SKILLS).map(({ entry: e, name: t }) => normalizeSkillPackage({
					...e,
					name: t
				}));
				if (r.length === 0) return null;
				let i = r.filter((e) => e.files.length > 1);
				return {
					value: parseJsonValue(r.map(toDurableSkill)),
					...i.length > 0 && { live: i }
				};
			});
			let a = slotValueOf(i?.value ?? null);
			return { skills: new Map((a ?? []).map((e) => [e.name, {
				deferred: e.deferred === !0,
				description: e.description,
				markdown: stripSkillFrontmatter(e.markdown),
				name: e.name,
				path: e.revision === void 0 ? void 0 : skillFilePath(e.name),
				source: t
			}])) };
		} }),
		id: t,
		install: syncDynamicSkillFiles,
		label: e.logicalPath
	};
}
function ownedSkills(e) {
	let t = compiledBundleOf(e);
	if (t === void 0) return [];
	let n = /* @__PURE__ */ new Set();
	let r = new Map(slotsOf(e, `skill`).map((e) => [e.id, e]));
	return declared(t.resolvedAgent, `skill`).flatMap((e) => {
		let t = r.get(skillId(e));
		if (t === void 0) return [];
		let { id: i, live: a, slot: o } = t;
		return [{
			id: i,
			live: a,
			skills: (slotValueOf(o.value) ?? []).filter((e) => !n.has(e.name) && (n.add(e.name), !0))
		}];
	});
}
async function syncDynamicSkillFiles(e) {
	let t = e.get(SandboxKey);
	if (t === void 0) return;
	let n = /* @__PURE__ */ new Set();
	let r = /* @__PURE__ */ new Map();
	let i = /* @__PURE__ */ new Map();
	for (let { live: t, skills: a } of ownedSkills(e)) {
		let e = new Map((t ?? []).map((e) => [e.name, e]));
		for (let t of a) {
			if (n.add(t.name), t.revision === void 0) continue;
			r.set(t.name, t.revision);
			let a = e.get(t.name)?.files;
			a !== void 0 && i.set(t.name, {
				description: t.description,
				files: a,
				content: t.markdown,
				name: t.name
			});
		}
	}
	(r.size !== 0 || Object.keys(e.get(DynamicSkillSandboxKey) ?? {}).length !== 0) && t.prepare(async (a) => {
		let o = e.get(DynamicSkillSandboxKey) ?? {};
		let s = sandboxIdentity(await t.captureState());
		let mark = (e) => `${s}#${r.get(e) ?? ``}`;
		let c = Object.keys(o).filter((e) => !n.has(e));
		let l = c.filter((e) => s !== null && o[e]?.startsWith(`${s}#`) === !0);
		let u = [...r.keys()].filter((e) => i.has(e) && (s === null || o[e] !== mark(e)));
		if (c.length === 0 && u.length === 0) return;
		let d = { ...o };
		for (let e of c) l.includes(e) || delete d[e];
		if (l.length === 0 && u.length === 0) {
			e.set(DynamicSkillSandboxKey, d);
			return;
		}
		let f = await a();
		for (let e of l) await removeSkillPackageFromSandbox({
			name: e,
			sandbox: f
		}), delete d[e];
		for (let n of u) {
			let a = i.get(n);
			if (a === void 0) continue;
			delete d[n], e.set(DynamicSkillSandboxKey, { ...d }), await removeSkillPackageFromSandbox({
				name: n,
				sandbox: f
			}), await writeSkillPackageToSandbox({
				sandbox: f,
				skill: a
			});
			let o = sandboxIdentity(await t.captureState());
			o !== null && (d[n] = `${o}#${r.get(n)}`);
		}
		e.set(DynamicSkillSandboxKey, d);
	});
}
function skillId(e) {
	return `skill:${e.extensionNamespace ?? ``}:${e.slug}`;
}
const SKILLS = {
	is: isBrandedSkillEntry,
	made: `defineSkill()`,
	noun: `skill`,
	pattern: SKILL_NAME_PATTERN,
	qualifiedPattern: SKILL_NAME_PATTERN,
	rule: "Expected ASCII letters, digits, underscores, and dashes only, starting with a letter or digit, up to 64 characters."
};
function toDurableSkill(e) {
	let t = {
		markdown: e.content,
		description: e.description,
		name: e.name
	};
	return e.deferred === !0 && (t.deferred = !0), e.files.length > 1 && (t.revision = skillPackageRevision(e)), t;
}
function sandboxIdentity(e) {
	return e.session === null ? null : JSON.stringify(e.session);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/agent-definitions.js
function agentDefinitionsOf(e) {
	let { files: t } = e;
	return [
		...t.hooks,
		...e.model,
		instructions,
		...e.instructions,
		workspace,
		connections,
		...e.connections,
		staticTools,
		...t.dynamicSubagents,
		...t.memory,
		...e.tools,
		...t.scheduleTools,
		...e.skills,
		skills,
		approvals,
		builtins,
		catalog,
		parentModel
	];
}
function settingsOf(e) {
	let t;
	return {
		compaction: {
			model: e.compactionModel,
			thresholdPercent: e.compactionThresholdPercent
		},
		limits: {
			sessionTimeoutMs: e.sessionTimeoutMs,
			get sessionUsage() {
				return t ??= { limit: usageLimit(e.sessionUsage?.()) }, t.limit;
			}
		},
		modelCallsPerStep: e.modelCallsPerStep,
		reasoning: e.reasoning,
		retention: e.retention
	};
}
function usageLimit(e) {
	return e === !1 ? () => !1 : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/session-agent.js
function createSessionAgent(e) {
	let t;
	let n;
	let r;
	return {
		adapters: e.adapters,
		...e.compiled !== void 0 && { compiled: e.compiled },
		connections: e.connections,
		definitions: () => {
			if (r === void 0) {
				let t = e.contents().then(agentDefinitionsOf);
				r = t, t.catch(() => {
					r === t && (r = void 0);
				});
			}
			return r;
		},
		delegates: e.delegates,
		roster: e.roster,
		revision: e.revision,
		sandbox: e.sandbox,
		get id() {
			return e.id();
		},
		get name() {
			return e.name?.();
		},
		get nodeId() {
			return e.nodeId?.();
		},
		get reference() {
			return t ??= e.reference();
		},
		get settings() {
			return n ??= e.settings();
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/metadata.js
function compiledDelegates(e, t) {
	let n = /* @__PURE__ */ new Map();
	e.nodeId === void 0 && t.get(ParentSessionKey) === void 0 && n.set("agent", { description: e.resolvedAgent.config?.description ?? `` });
	for (let [t, r] of e.subagentRegistry.subagentsByName ?? []) {
		let e = r.definition.description;
		e !== void 0 && n.set(t, { description: e });
	}
	for (let e of Object.values(readDynamicSubagentSelections(t))) n.set(e.prepared.name, { description: e.kind === `subagent` ? e.agentConfig.description : e.remoteAgent.description });
	return Object.fromEntries(n);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/definitions/compiled-agent.js
const agents = /* @__PURE__ */ new WeakMap();
function fromCompiledBundle(e) {
	let t = agents.get(e);
	if (t !== void 0) return t;
	let n = createSessionAgent({
		adapters: e.adapterRegistry,
		compiled: e,
		connections: () => {
			let t = e.graph.root.agent;
			if (t === void 0) return;
			let n = t.definitions.some(({ kind: e }) => e === `connection`);
			return t.connections.length === 0 && !n ? void 0 : t.connections;
		},
		contents: () => agentContentsOf(e),
		delegates: (t) => compiledDelegates(e, t),
		id: () => e.turnAgent.id,
		name: () => e.resolvedAgent.config?.name,
		nodeId: () => e.nodeId,
		reference: () => ({
			kind: `bundle`,
			nodeId: e.nodeId,
			source: serializeDurableCompiledArtifactsSource(e.compiledArtifactsSource)
		}),
		revision: async () => {
			let t = process.env.VERCEL_DEPLOYMENT_ID?.trim();
			return t ? `deployment:${t}` : await resolveRuntimeCompiledArtifactsVersionedCacheKey(e.compiledArtifactsSource);
		},
		roster: (t) => compiledAgentRoster(e, t),
		sandbox: async () => ({
			registry: e.graph.root.sandboxRegistry,
			template: { compiledArtifactsSource: e.compiledArtifactsSource }
		}),
		settings: () => compiledSettings(e)
	});
	return agents.set(e, n), n;
}
function compiledSettings(e) {
	let t = e.resolvedAgent.config;
	return settingsOf({
		compactionModel: e.turnAgent.compactionModel,
		compactionThresholdPercent: t?.compaction?.thresholdPercent,
		modelCallsPerStep: t?.experimental?.workflow?.modelCallsPerStep,
		reasoning: e.turnAgent.reasoning,
		retention: t?.experimental?.workflow?.retention,
		sessionTimeoutMs: t?.limits?.sessionTimeoutMs,
		sessionUsage: () => resolveSessionUsageLimit(e)
	});
}
async function agentContentsOf(e) {
	let t = e.resolvedAgent;
	let n = await loadModelDefinition(e);
	let r = agentModel(e);
	return {
		connections: declared(t, `connection`).map(connectionDefinition),
		files: {
			dynamicSubagents: e.subagentRegistry.dynamicResolvers.map(subagentDefinition),
			hooks: declared(t, `hook`).map(hookDefinition),
			memory: [...declared(t, `memory`).map(memoryDefinition), ...declared(t, `memory`).filter((e) => e.offersTools === !0).map(memoryToolsDefinition)],
			scheduleTools: scheduleToolsDefinitions(declared(t, `schedules`).filter((e) => e.offersTools === !0))
		},
		instructions: declared(t, `instructions`).map(instructionsDefinition),
		model: [r, n].filter((e) => e !== void 0),
		skills: declared(t, `skill`).map(skillDefinition),
		tools: declared(t, `tool`).map(toolDefinition)
	};
}
function scheduleToolsDefinitions(e) {
	let t = /* @__PURE__ */ new Map();
	let n = [];
	for (let r of e) {
		let e = scheduleCollectionToolSlot(r);
		let i = {
			logicalPath: `tools/${e}.ts`,
			slug: e
		};
		if (r.namedScope === void 0) {
			n.push(toolsDefinition(i, async () => {
				let { scheduleCollectionTools: e } = await import("./_4.mjs");
				return e(r.definition, r.name);
			}));
			continue;
		}
		let a = t.get(e);
		if (a !== void 0) {
			a.push(r);
			continue;
		}
		let o = [r];
		t.set(e, o), n.push(toolsDefinition(i, async () => {
			let { scheduleScopesTools: t } = await import("./_4.mjs");
			return t(o.map((e) => ({
				collection: e.name,
				definition: e.definition,
				scope: e.namedScope.name,
				description: e.namedScope.description
			})), e);
		}));
	}
	return n;
}
export { agentContentsOf, fromCompiledBundle };

//# sourceMappingURL=eve34.mjs.map