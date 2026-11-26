import "./eve8.mjs";
import { isSessionInboxAddress } from "./eve12.mjs";
import { ContextContainer, HistoryStateKey, ParentSessionKey, SessionIdKey, SessionKey, SteeredByKey, TraceRootKey, contextScopeValue, contextStorage, withContextScopeValue } from "./eve13.mjs";
import { isErrnoCode, isObject } from "./eve14.mjs";
import { createLogger } from "./eve15.mjs";
import { applyLiveDeliveryAudienceCeiling, defaultContentCapture, getInstrumentationRuntime, interactionOwner, isSampledTrace, readInstrumentationDecision, readSessionTraceDecision, resolveTracePolicy, resolveTracePolicyDecision } from "./eve16.mjs";
import { defined, delegatedUsageFact, fact, runRequested, runSettledFacts, runStarted, runUsageRecorded, usageOf } from "./eve17.mjs";
import { createFrameworkUserMessage, isFrameworkUserMessage, resolveConversationId, stripEveTraceBaggage, validateHarnessModelMessages, withOperationTraceContext } from "./eve18.mjs";
import { activeTurnIdOf, checksSessionEvents, readTurnState, storedProjection, writeTurnState } from "./eve19.mjs";
import { decodeSandboxRef, estimateMediaTokens, inlinesSandboxRefAsBytes, isSandboxRefUrl, readImageDimensions } from "./eve20.mjs";
import { SessionAgentKey, formatLanguageModelGatewayId, readInstrumentationSessionContext, withChannelAudience } from "./eve21.mjs";
import { isEveDevEnvironment } from "./eve28.mjs";
import { isLoopbackHostname } from "./eve29.mjs";
import { createRequire } from "node:module";
import { delimiter, join } from "node:path";
import { createHash } from "node:crypto";
import { mkdir, readFile, realpath, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { setTimeout } from "node:timers/promises";
import { promisify } from "node:util";
import { context, createContextKey, propagation, trace } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
import { Experimental_DecisionRefusalError } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/provider/index.js";
import { currentCapture } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/index.js";
import * as aiSdk from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js";
import { createGateway, registerTelemetry } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js";
import { secrets } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/just-secrets/index.js";
import { execFile } from "node:child_process";
import { getVercelOidcToken } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/oidc/index.js";
import { OpenTelemetry } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@ai-sdk/otel/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/approval/definition.js
function resolveApprovalPolicy(e) {
	return typeof e == `function` ? e : e.request;
}
function sameResponder(e, t) {
	return e.authenticator === t.authenticator && (e.issuer ?? ``) === (t.issuer ?? ``) && e.principalType === t.principalType && e.principalId === t.principalId;
}
function requesterOnlyResponse(e) {
	let t = e.request.principal;
	return t === null || sameResponder(t, e.response.principal) ? { status: `allowed` } : {
		reason: "Only the person who requested this action can respond to this approval.",
		status: `rejected`
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/approval/status.js
function normalizeApprovalStatus(e) {
	if (e === void 0) return;
	if (e === !1) return `not-applicable`;
	if (e === !0) return `user-approval`;
	let t = typeof e == `object` && e ? Reflect.get(e, `type`) : e;
	if (t !== `not-applicable` && t !== `approved` && t !== `denied` && t !== `user-approval`) throw Error(`An approval policy must return an approval status, a boolean, or undefined.`);
	if (typeof e != `object` || !e) return t;
	let n = Reflect.get(e, `reason`);
	if (n !== void 0 && (typeof n != `string` || t !== `approved` && t !== `denied`)) throw Error(`Only approved and denied approval statuses accept a string reason.`);
	return t === `approved` || t === `denied` ? n === void 0 ? { type: t } : {
		type: t,
		reason: n
	} : { type: t };
}
function approvalDecision(e) {
	let t = normalizeApprovalStatus(e);
	let n = typeof t == `object` ? t.type : t;
	let r = typeof t == `object` ? t.reason : void 0;
	return n === `user-approval` ? {
		denied: !1,
		awaitsPerson: !0
	} : n === `denied` ? {
		denied: !0,
		reason: r
	} : n === `approved` ? {
		denied: !1,
		clearedBy: { policy: `approval` }
	} : { denied: !1 };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/approval/evaluation.js
const NO_MEMORY = {
	pending: [],
	remembered: {}
};
const evaluationKey = Symbol.for(`eve.approval-evaluation`);
function approvalEvaluation(e) {
	return e[evaluationKey];
}
async function evaluateApproval(e, t, n = {}) {
	let { memory: r = NO_MEMORY, recheck: i = !1 } = n;
	let a = /* @__PURE__ */ new WeakMap();
	let scoped = (e) => JSON.stringify([t.toolName, e]);
	let o = Object.freeze({
		ask: (e) => {
			let t = Object.freeze({ type: `user-approval` });
			return a.set(t, {
				...e,
				key: scoped(e.key)
			}), t;
		},
		read: (e) => ({
			entry: r.remembered[scoped(e)],
			pending: r.pending.includes(scoped(e))
		}),
		recheck: i
	});
	let s = {
		...t,
		[evaluationKey]: o
	};
	let { asked: c, value: l } = await trackSteeredAsk(() => e(s));
	let u = approvalDecision(l);
	if (u.awaitsPerson !== !0) return u;
	if (i) return { denied: !1 };
	let d = typeof l == `object` && l ? a.get(l) : void 0;
	return {
		...u,
		...c && { callerOnly: !0 },
		...d !== void 0 && { remember: d }
	};
}
function rememberDecision(e, t, n) {
	let { remember: r } = t;
	return r === void 0 ? e : {
		...e,
		[r.key]: {
			interactionId: t.interactionId,
			outcome: n,
			...r.state !== void 0 && { state: r.state }
		}
	};
}
function inheritApprovalContext(e, t) {
	let n = approvalEvaluation(e);
	return n === void 0 || approvalEvaluation(t) === n ? t : {
		...t,
		[evaluationKey]: n
	};
}
function scopeApprovalEvaluation(e, t) {
	let n = approvalEvaluation(e);
	if (n === void 0) return e;
	let scoped = (e) => JSON.stringify([t, e]);
	let r = Object.freeze({
		ask: (e) => n.ask({
			...e,
			key: scoped(e.key)
		}),
		read: (e) => n.read(scoped(e)),
		recheck: n.recheck
	});
	return {
		...e,
		[evaluationKey]: r
	};
}
function isApprovalRecheck(e) {
	return approvalEvaluation(e)?.recheck === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/announcements.js
function announcementDigest(e, t) {
	return createHash(`sha256`).update(JSON.stringify([e, t])).digest(`base64url`).slice(0, 22);
}
function keptAnnouncements(e, t) {
	let n = new Set(t.flatMap((e) => e.role === `user` ? [announcementDigest(e.kind, e.content)] : []));
	let r = Object.entries(e.messages ?? {}).filter(([, e]) => n.has(e));
	return r.length === 0 ? {} : {
		announcements: Object.fromEntries(r.flatMap(([t]) => {
			let n = e.announcements?.[t];
			return n === void 0 ? [] : [[t, n]];
		})),
		messages: Object.fromEntries(r)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/provider-tool-history.js
function normalizeProviderToolHistory(e) {
	let t = findProviderToolCallsToNormalize(e);
	if (e.providerExecutedOutcomeIds.size === 0) return {
		messages: [...e.messages],
		outcomeEndsResponse: !1
	};
	let n = [];
	let r = -1;
	let i = -1;
	let a = 0;
	for (let o of e.messages) {
		if (o.role !== `assistant` || !Array.isArray(o.content)) {
			n.push(o), o.role === `assistant` && typeof o.content == `string` && o.content.trim().length > 0 && (i = a), a += 1;
			continue;
		}
		let s = [];
		let c = [];
		let l = !1;
		let u = [];
		let d = o.content.some((e) => e.type === `tool-result` && t.has(e.toolCallId));
		let flushAssistant = () => {
			s.length !== 0 && (n.push({
				...o,
				content: s
			}), s = []);
		};
		let flushTool = () => {
			c.length !== 0 && (n.push({
				role: `tool`,
				content: c
			}), c = []);
		};
		for (let n of o.content) n.type === `tool-result` && t.has(n.toolCallId) ? (flushAssistant(), c.push(n)) : d && n.type === `tool-call` && n.providerExecuted !== !0 && !t.has(n.toolCallId) ? u.push(n) : (flushTool(), l && n.type !== `tool-result` && flushAssistant(), l = n.type === `tool-result`, s.push(n.type === `tool-call` && t.has(n.toolCallId) ? {
			...n,
			providerExecuted: !1
		} : n)), n.type === `tool-result` && e.providerExecutedOutcomeIds.has(n.toolCallId) ? r = a : n.type === `text` && n.text.trim().length > 0 && (i = a), a += 1;
		flushTool(), s.push(...u), flushAssistant();
	}
	return {
		messages: n,
		outcomeEndsResponse: r >= 0 && r > i
	};
}
function awaitsProviderToolResult(e) {
	return awaitedProviderToolCallIds(e).size > 0;
}
function awaitedProviderToolCallIds(e) {
	let t = e.length;
	for (; t > 0 && e[t - 1].role === `tool`;) --t;
	let n = e[t - 1];
	if (t === e.length || n?.role !== `assistant` || !Array.isArray(n.content)) return /* @__PURE__ */ new Set();
	let r = /* @__PURE__ */ new Set();
	for (let i of [...n.content, ...e.slice(t).flatMap(toolContent)]) i.type === `tool-result` && r.add(i.toolCallId);
	return new Set(n.content.flatMap((e) => e.type === `tool-call` && e.providerExecuted === !0 && !r.has(e.toolCallId) ? [e.toolCallId] : []));
}
function toolContent(e) {
	return e.role === `tool` ? e.content : [];
}
function findProviderToolCallsToNormalize(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.messages) {
		if (n.role !== `assistant` || !Array.isArray(n.content)) continue;
		let r = n.content.some((t) => t.type === `tool-call` && t.providerExecuted !== !0 && !e.providerExecutedOutcomeIds.has(t.toolCallId));
		for (let i of n.content) i.type === `tool-call` && e.providerExecutedOutcomeIds.has(i.toolCallId) && (i.providerExecuted !== !0 || r) && t.add(i.toolCallId);
	}
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/token-estimate.js
const REMOTE_URL = /^https?:\/\//i;
function estimateTokens(e) {
	let t = 0;
	let n = JSON.stringify(e, (e, n) => {
		let r = estimateFilePartTokens(n);
		if (r === void 0) return n;
		t += r;
		let { mediaType: i, type: a } = n;
		return {
			mediaType: i,
			type: a
		};
	});
	return Math.ceil(Buffer.byteLength(n ?? ``) / 4) + t;
}
function estimateFilePartTokens(e) {
	if (typeof e != `object` || !e) return;
	let t = e;
	if (t.type === `image` && t.image !== void 0) return estimateFileDataTokens(t.image, typeof t.mediaType == `string` ? t.mediaType : `image/*`);
	if (!(t.type !== `file` && t.type !== `media` || typeof t.mediaType != `string`)) return estimateFileDataTokens(t.data, t.mediaType);
}
function estimateFileDataTokens(e, t) {
	if (isSandboxRefUrl(e)) return estimateSandboxRefTokens(e);
	if (e instanceof URL) return estimateRemoteTokens(t);
	if (isTaggedFileData(e)) switch (e.type) {
		case `data`: return estimateInlineTokens(e.data, t);
		case `url`: return isSandboxRefUrl(e.url) ? estimateSandboxRefTokens(e.url) : estimateRemoteTokens(t);
		case `reference`: return estimateRemoteTokens(t);
		default: return;
	}
	return estimateInlineTokens(e, t);
}
function estimateSandboxRefTokens(e) {
	let t = decodeSandboxRef(e);
	return inlinesSandboxRefAsBytes(t) ? estimateMediaTokens(t) : void 0;
}
function isTaggedFileData(e) {
	return typeof e == `object` && !!e && !(e instanceof Uint8Array) && !(e instanceof ArrayBuffer) && typeof e.type == `string`;
}
function estimateRemoteTokens(e) {
	return e.startsWith(`image/`) ? estimateMediaTokens({
		mediaType: e,
		size: 0
	}) : void 0;
}
function estimateInlineTokens(e, t) {
	if (typeof e == `string`) {
		if (REMOTE_URL.test(e)) return estimateRemoteTokens(t);
		let n = e.startsWith(`data:`) ? e.slice(e.indexOf(`,`) + 1) : e;
		let r = Math.floor(n.length * 3 / 4);
		return estimateMediaTokens(withHeaderMetadata(base64Header(n), t, r));
	}
	if (e instanceof Uint8Array || e instanceof ArrayBuffer) {
		let n = e instanceof Uint8Array ? e : new Uint8Array(e);
		return estimateMediaTokens(withHeaderMetadata(n, t, n.byteLength));
	}
}
function base64Header(e) {
	return Buffer.from(e.slice(0, 98304), `base64`);
}
function withHeaderMetadata(e, t, n) {
	return t.startsWith(`image/`) ? {
		...readImageDimensions(e),
		mediaType: t,
		size: n
	} : {
		mediaType: t,
		size: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/compaction/prompt.js
const COMPACTION_SYSTEM_PROMPT = `You are performing a CONTEXT CHECKPOINT COMPACTION. Create a handoff summary for another LLM that will resume the task.

Include:

- Current progress and key decisions made
- Important context, constraints, or user preferences
- What remains to be done, with clear next steps
- Any critical data, examples, or references needed to continue

Be concise, structured, and focused on helping the next LLM seamlessly continue the work. Write in the same language as the conversation. Do not continue the conversation, answer its questions, or invent facts. Only output the handoff summary.`;
const COMPACTION_PROMPT_ENVELOPE = {
	prompt: formatCompactionPrompt({
		previousCheckpoint: ``,
		transcript: ``
	}),
	system: COMPACTION_SYSTEM_PROMPT
};
function createCompactionPrompt(e) {
	let t = e.messages.map((e) => ({
		content: renderCompactionMessageContent(e),
		role: e.role
	}));
	return degradeOversizedTranscript(e, t), {
		prompt: formatCompactionPrompt({
			previousCheckpoint: e.previousCheckpoint?.trim() ?? `(none)`,
			transcript: formatCompactionTranscript(t)
		}),
		system: COMPACTION_SYSTEM_PROMPT
	};
}
function degradeOversizedTranscript(e, t) {
	let n = e.transcriptBudgetTokens;
	if (n === void 0) return;
	let i = estimateTokens(formatCompactionPrompt({
		previousCheckpoint: e.previousCheckpoint?.trim() ?? `(none)`,
		transcript: formatCompactionTranscript(t)
	})) - n;
	for (let n = 0; n < t.length && i > 0; n += 1) {
		let r = t[n];
		let a = e.messages[n];
		if (r === void 0 || a === void 0) continue;
		let o = renderCompactionMessageContent(a, Math.max(2e3, r.content.length - Math.ceil(i * 4) - 64));
		o.length >= r.content.length || (i -= (Buffer.byteLength(r.content) - Buffer.byteLength(o)) / 4, t[n] = {
			content: o,
			role: r.role
		});
	}
}
function formatCompactionPrompt(e) {
	return `<previous-checkpoint>
${e.previousCheckpoint}
</previous-checkpoint>

<conversation>
Conversation transcript:
${e.transcript}
</conversation>

Update the previous checkpoint with the newer information in the conversation. If there is no previous checkpoint, create one from the conversation.

Make completed work explicit so the next model does not repeat it. Keep completed work separate from current and remaining work, and do not describe completed work as pending unless later messages show it must be redone. Preserve exact file paths, function names, commands, error messages, identifiers, and measured values when they are needed to continue.

Large tool outputs are the main thing to compress: reduce each to the findings the next model needs — what was searched or read, what it established, and the exact identifiers involved — rather than reproducing the output. The next model cannot see the originals, so nothing it would need to act on may be lost.`;
}
function formatCompactionTranscript(e) {
	let t = e.filter((e) => e.content.trim().length > 0).map((e) => `### ${e.role}\n${e.content.trim()}`);
	return t.length === 0 ? `(empty)` : t.join(`

`);
}
function renderCompactionMessageContent(e, t) {
	return typeof e.content == `string` ? renderConversationText(e.content, t) : e.content.map((e) => renderCompactionContentPart(e, t)).filter((e) => e.length > 0).join(`
`).trim();
}
function renderCompactionContentPart(e, t) {
	switch (e.type) {
		case `text`: return renderConversationText(e.text, t);
		case `reasoning`: return ``;
		case `file`: return renderAttachedFileStub(e.filename, e.mediaType);
		case `tool-call`: return renderTranscriptToolCall(e, t);
		case `tool-result`: return renderTranscriptToolResult(e, t);
		default: return ``;
	}
}
function renderTranscriptToolCall(e, t) {
	return renderToolCall(e, t === void 0 ? 2e3 : 280);
}
function renderTranscriptToolResult(e, t) {
	let n = t === void 0 ? 2e3 : 280;
	let r = e.isError ? `errored` : `returned`;
	let i = renderToolResultOutput(e.output, n);
	return i ? `Tool ${e.toolName} ${r} ${i}` : `Tool ${e.toolName} ${r}`;
}
function renderToolResultOutput(e, t) {
	let n = contentToolOutputParts(e);
	return capPayload(n === void 0 ? serializeToolResultOutput(e) : n.map((e) => renderContentToolOutputPart(e, t)).filter((e) => e.length > 0).join(` `), t);
}
function serializeToolResultOutput(e) {
	if (typeof e == `object` && e) {
		let t = e;
		if ((t.type === `text` || t.type === `error-text`) && typeof t.value == `string`) return t.value;
	}
	return JSON.stringify(e) ?? ``;
}
function contentToolOutputParts(e) {
	if (typeof e != `object` || !e) return;
	let t = e;
	return t.type === `content` && Array.isArray(t.value) ? t.value : void 0;
}
function stubContentOutputFileParts(e) {
	let t = contentToolOutputParts(e);
	if (t === void 0) return e;
	let n = !1;
	let r = t.map((e) => {
		if (typeof e != `object` || !e) return e;
		let t = e;
		return t.type !== `file` && t.type !== `media` ? e : (n = !0, {
			text: renderAttachedFileStub(contentFileName(e), typeof t.mediaType == `string` ? t.mediaType : `unknown`),
			type: `text`
		});
	});
	return n ? {
		type: `content`,
		value: r
	} : e;
}
function renderContentToolOutputPart(e, t) {
	if (typeof e != `object` || !e) return renderPayload(e, t);
	let n = e;
	return n.type === `text` && typeof n.text == `string` ? n.text : n.type === `file` || n.type === `media` ? renderAttachedFileStub(contentFileName(e), typeof n.mediaType == `string` ? n.mediaType : `unknown`) : renderPayload(e, t);
}
function contentFileName(e) {
	let { data: t, filename: n } = e;
	let r = t;
	return r?.type === `url` && isSandboxRefUrl(r.url) ? decodeSandboxRef(r.url).path : typeof n == `string` ? n : void 0;
}
function renderToolCall(e, t) {
	let n = renderPayload(e.input, t);
	return n ? `Called ${e.toolName} with ${n}` : `Called ${e.toolName}`;
}
function renderPayload(e, t) {
	return e === void 0 ? `` : capPayload(JSON.stringify(e) ?? ``, t);
}
function renderAttachedFileStub(e, t) {
	return `Attached file ${e ?? `attachment`} (${t})`;
}
function renderConversationText(e, t) {
	return t === void 0 ? e.trim() : capText(e, t);
}
function sliceUtf16Safe(e, t) {
	if (t <= 0) return ``;
	if (e.length <= t) return e;
	let n = t;
	let r = e.charCodeAt(n - 1);
	return r >= 55296 && r <= 56319 && --n, e.slice(0, n);
}
function clipMiddleUtf16Safe(e, t) {
	if (e.length <= t) return e;
	let n = t - elisionMarker(e.length).length;
	let r = sliceUtf16Safe(e, Math.ceil(n * .6));
	let i = e.length - (n - r.length);
	let a = e.charCodeAt(i);
	a >= 56320 && a <= 57343 && (i += 1);
	let o = e.slice(i);
	return `${r}${elisionMarker(i - r.length)}${o}`;
}
function elisionMarker(e) {
	return ` … [${e} chars omitted] … `;
}
function capPayload(e, t) {
	return clipMiddleUtf16Safe(e.replace(/\s+/g, ` `).trim(), t);
}
function capText(e, t) {
	let n = e.replace(/\s+/g, ` `).trim();
	return n.length <= t ? n : `${sliceUtf16Safe(n, t).trimEnd()}…`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/compaction/over-limit-error.js
var CompactionOverLimitError = class extends Error {
	name = `CompactionOverLimitError`;
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/compaction/engine.js
function estimateRatio(e) {
	return e.estimateRatio ?? 1.6;
}
const COMPACTION_PROMPT_OVERHEAD_TOKENS = estimateTokens([{
	content: COMPACTION_PROMPT_ENVELOPE.system,
	role: `system`
}, createFrameworkUserMessage(`context.compaction`, COMPACTION_PROMPT_ENVELOPE.prompt)]);
function getInputTokenCount(e, t, n = 0, r = 0) {
	let i = t.lastKnownInputTokens;
	let a = t.lastKnownPromptMessageCount;
	if (i === void 0 || a === void 0 || !Number.isInteger(a) || a < 0 || a > e.length) return estimateTokens(e) + n;
	let o = e.slice(a);
	return i + (o.length === 0 ? 0 : estimateTokens(o)) + Math.max(0, n - r);
}
function withoutPromptMeasurement(e) {
	let { lastKnownInputTokens: t, lastKnownPromptMessageCount: n, measurementsByModel: r, ...i } = e;
	return i;
}
function withPromptMeasurement(e, t) {
	let { lastStage: n, requestEnvelopeTokens: r, ...i } = withoutPromptMeasurement(e);
	let { measurementsByModel: a } = e;
	if (t.inputTokens === void 0 || t.promptMessageCount === void 0) return a === void 0 ? i : {
		...i,
		measurementsByModel: a
	};
	let { inputTokens: o } = t;
	let s = t.promptMessages === void 0 ? void 0 : estimateTokens(t.promptMessages) + (t.requestEnvelopeTokens ?? 0);
	let c = {
		inputTokens: t.inputTokens,
		promptMessageCount: t.promptMessageCount,
		...t.requestEnvelopeTokens !== void 0 && { requestEnvelopeTokens: t.requestEnvelopeTokens }
	};
	return {
		...i,
		...n !== void 0 && e.lastKnownInputTokens === void 0 && { lastStage: n },
		...s !== void 0 && s > 0 && o > 0 && { estimateRatio: o / s },
		lastKnownInputTokens: c.inputTokens,
		lastKnownPromptMessageCount: c.promptMessageCount,
		...c.requestEnvelopeTokens !== void 0 && { requestEnvelopeTokens: c.requestEnvelopeTokens },
		measurementsByModel: {
			...a,
			[t.modelId]: c
		}
	};
}
function withModelPromptMeasurement(e, t, n) {
	let r = e.measurementsByModel?.[t];
	if (r === void 0) return e;
	let { requestEnvelopeTokens: i, ...a } = e;
	let o = {
		...a,
		lastKnownInputTokens: r.inputTokens,
		lastKnownPromptMessageCount: r.promptMessageCount,
		...r.requestEnvelopeTokens !== void 0 && { requestEnvelopeTokens: r.requestEnvelopeTokens }
	};
	if (n !== void 0) {
		let t = getInputTokenCount(n.messages, o, n.requestEnvelopeTokens, r.requestEnvelopeTokens);
		if (getInputTokenCount(n.messages, e, n.requestEnvelopeTokens, e.requestEnvelopeTokens) > t) return e;
	}
	return o;
}
function shouldCompact(e, t, n = 0, r = 0) {
	return e.length > 0 && getInputTokenCount(e, t, n, r) + COMPACTION_PROMPT_OVERHEAD_TOKENS > t.threshold;
}
function evaluateThreshold(e, t) {
	let n = estimateTokens(e);
	return {
		estimatedTokens: n,
		type: n <= t.threshold ? `within-limit` : `over-limit`
	};
}
function startStage(e) {
	return e === void 0 ? `tail` : e === `tail` ? `text-tail` : `summary-only`;
}
const COMPACTION_HEURISTICS = [fixedTailHeuristic];
async function compactMessages(e, t, n, r = !1, i = !0) {
	let { conversation: a, previousCheckpoint: o } = extractPreviousCheckpoint(e);
	for (let e of COMPACTION_HEURISTICS) {
		let s = await e({
			config: t,
			conversation: a,
			forceSummary: r,
			previousCheckpoint: o,
			resume: i,
			summarize: n
		});
		if (s.type === `compacted`) return {
			messages: s.messages,
			stage: s.stage
		};
	}
	throw overLimitError(t);
}
async function fixedTailHeuristic({ config: e, conversation: t, forceSummary: n, previousCheckpoint: r, resume: i, summarize: a }) {
	let withResumptionGuard = (e, t, n) => i ? resumeAfter(e, t, n) : e;
	let o = keptTailBudget(e);
	let s = n ? {
		...e,
		recentWindowSize: 1
	} : e;
	let planTail = (e) => {
		let t = i ? findLastRealUserIndex(e) : -1;
		let n = e[t];
		let r = n === void 0 ? void 0 : fitCurrentMessage(n, o);
		let a = r?.replay ?? n;
		let c = selectRecentWindowSize(e, s, o);
		return a !== void 0 && t < e.length - c && (c = selectRecentWindowSize(e, s, Math.max(0, o - estimateTokens([a])))), {
			currentIndex: t,
			fit: r,
			keep: c,
			replay: a
		};
	};
	let c = startStage(e.lastStage);
	let l = capToolResults(t);
	let { currentIndex: u, fit: d, keep: f, replay: p } = planTail(l);
	let m = u < 0 ? void 0 : l[u];
	let h = m === void 0 ? void 0 : omitFiles(m);
	let g = h === void 0 ? void 0 : fitCurrentMessage(h, 1)?.replay;
	let _ = h !== void 0 && g !== void 0 && estimateTokens([g]) < estimateTokens([h]) ? g : h;
	let v = withResumptionGuard(checkpointHead(``), _, 1 / 0);
	if (evaluateThreshold(v, e).type === `over-limit`) throw overLimitError(e);
	let { recent: y } = splitMessagesForCompaction(l, f);
	let b = createCompactionPrompt({
		messages: d === void 0 ? l : l.map((e, t) => t === u ? d.cut : e),
		previousCheckpoint: r,
		transcriptBudgetTokens: e.threshold
	});
	let x = await a({
		messages: [createFrameworkUserMessage(`context.compaction`, b.prompt)],
		system: b.system
	});
	let fits = (t) => evaluateThreshold(t, e).type === `within-limit`;
	let S = estimateRatio(e);
	let reachesTarget = (t) => Math.ceil(estimateTokens(t) * S) <= e.target;
	if (c === `tail`) {
		let t = withResumptionGuard([...checkpointHead(x), ...y], p, e.threshold);
		if (reachesTarget(t)) return {
			messages: t,
			stage: `tail`,
			type: `compacted`
		};
	}
	if (c !== `summary-only`) {
		let t = keepNonToolResultMessages(y);
		let n = withResumptionGuard([...checkpointHead(x), ...t], p, e.threshold);
		if (reachesTarget(n)) return {
			messages: n,
			stage: `text-tail`,
			type: `compacted`
		};
	}
	let C = withResumptionGuard(checkpointHead(x), p, e.threshold);
	if (fits(C)) return {
		messages: C,
		stage: `summary-only`,
		type: `compacted`
	};
	let withClippedSummary = (t) => {
		let build = (n) => withResumptionGuard(checkpointHead(n < MIN_CLIP_CHARS ? sliceUtf16Safe(x, n) : clipMiddleUtf16Safe(x, n)), t, e.threshold);
		if (!fits(build(0))) return;
		let n = 0;
		let r = x.length;
		for (; n < r;) {
			let e = Math.ceil((n + r) / 2);
			fits(build(e)) ? n = e : r = e - 1;
		}
		return build(n);
	};
	let w = withClippedSummary(p);
	if (w !== void 0) return {
		messages: w,
		stage: `summary-only`,
		type: `compacted`
	};
	let T = e.threshold - estimateTokens(withResumptionGuard(checkpointHead(``), void 0, e.threshold));
	return {
		messages: withClippedSummary(h === void 0 ? void 0 : fitCurrentMessage(h, T)?.replay ?? h) ?? withClippedSummary(_) ?? v,
		stage: `summary-only`,
		type: `compacted`
	};
}
function overLimitError(e) {
	return new CompactionOverLimitError(`The agent's system prompt, tools and memory leave only ~${e.threshold} tokens for the conversation, too few to compact it. Shorten the instructions, remove tools or trim memory, or raise \`compaction.threshold\`.`);
}
function capToolResults(e) {
	return e.map((e) => {
		if (e.role !== `tool` || typeof e.content == `string`) return e;
		let t = !1;
		let n = e.content.map((e) => {
			if (e.type !== `tool-result`) return e;
			let n = stubContentOutputFileParts(e.output);
			let r = serializeToolResultOutput(n);
			return r.length <= 2e3 ? n === e.output ? e : (t = !0, {
				...e,
				output: n
			}) : (t = !0, {
				...e,
				output: {
					type: n.type === `error-text` ? `error-text` : `text`,
					value: `[Truncated by eve: tool result reduced during context compaction. Re-run the tool if you need the full output.]

${clipMiddleUtf16Safe(r, 1887)}`
				}
			});
		});
		return t ? {
			...e,
			content: n
		} : e;
	});
}
function resumeAfter(e, t, n) {
	let r = e.at(-1)?.role;
	let i = t !== void 0 && e.some((e) => e.role === `user` && e.content === t.content);
	return r !== void 0 && r !== `assistant` ? r === `tool` && t !== void 0 && !i && estimateTokens([t]) <= n && !awaitsProviderToolResult(e) ? [...e, t] : e : [...e, t !== void 0 && !i ? t : createFrameworkUserMessage(`execution.continuation`, "Continue.")];
}
function fitCurrentMessage(e, t) {
	let n = messageText(e);
	if (n === void 0 || t <= 0 || estimateTokens([e]) <= t) return;
	let note = (e) => `\n\n[eve: ${e} characters from the middle of this message were cut during context compaction to fit the context window.]\n\n`;
	let split = (t, n) => splitMessageText(e, t, n, note(n - t));
	let r = Math.floor(t * 4);
	for (; r > 0;) {
		r = Math.min(r, n.length);
		let e = Math.floor(r * .2);
		let i = sliceUtf16Safe(n, e).length;
		let a = n.length - (r - e);
		let o = n.charCodeAt(a);
		if (o >= 56320 && o <= 57343 && (a += 1), i < a) {
			let e = split(i, a);
			if (estimateTokens([e.replay]) <= t) return e;
		}
		r = Math.floor(r * .9) - 1;
	}
	return split(0, n.length);
}
const MIN_CLIP_CHARS = 40;
function checkpointHead(e) {
	return [createFrameworkUserMessage(`context.compaction`, "Summary of our conversation so far:"), {
		content: e,
		role: `assistant`
	}];
}
function omitFiles(e) {
	if (typeof e.content == `string`) return e;
	let t = [];
	let n = !1;
	for (let r of e.content) r.type === `text` ? t.push(r) : n || (n = !0, t.push({
		type: `text`,
		text: `[eve: a file in this message was omitted during context compaction: it is too large for the context window.]`
	}));
	return n ? {
		...e,
		content: t
	} : e;
}
function messageText(e) {
	if (typeof e.content == `string`) return e.content;
	let t = e.content.flatMap((e) => e.type === `text` ? [e.text] : []);
	return t.length === 0 ? void 0 : t.join(``);
}
function splitMessageText(e, t, n, r) {
	if (typeof e.content == `string`) return {
		cut: {
			...e,
			content: e.content.slice(t, n)
		},
		replay: {
			...e,
			content: `${e.content.slice(0, t)}${r}${e.content.slice(n)}`
		}
	};
	let i = 0;
	let a = !1;
	let o = [];
	let s = [];
	for (let c of e.content) {
		if (c.type !== `text`) {
			o.push(c), s.push(c);
			continue;
		}
		let e = Math.max(0, Math.min(c.text.length, t - i));
		let l = Math.max(e, Math.min(c.text.length, n - i));
		i += c.text.length, l > e && o.push({
			...c,
			text: c.text.slice(e, l)
		});
		let u = c.text.slice(0, e);
		let d = c.text.slice(l);
		let f = l > e && !a;
		f && (a = !0);
		let p = `${u}${f ? r : ``}${d}`;
		p.length > 0 && s.push({
			...c,
			text: p
		});
	}
	return a || s.push({
		type: `text`,
		text: r
	}), {
		cut: {
			...e,
			content: o
		},
		replay: {
			...e,
			content: s
		}
	};
}
function findLastRealUserIndex(e) {
	for (let t = e.length - 1; t >= 0; --t) {
		let n = e[t];
		if (n?.role === `user` && !isFrameworkUserMessage(n)) return t;
	}
	return -1;
}
function extractPreviousCheckpoint(e) {
	let t = e[0];
	let n = e[1];
	return t?.role !== `user` || t.content !== "Summary of our conversation so far:" || n?.role !== `assistant` ? {
		conversation: [...e],
		previousCheckpoint: void 0
	} : {
		conversation: e.slice(2),
		previousCheckpoint: assistantMessageText(n)
	};
}
function keepNonToolResultMessages(e) {
	let t = [];
	for (let n of e) if (n.role !== `tool`) {
		if (n.role === `assistant`) {
			let e = assistantMessageText(n);
			e.length > 0 && t.push({
				content: e,
				role: `assistant`
			});
		} else t.push(n);
	}
	return t;
}
function assistantMessageText(e) {
	return typeof e.content == `string` ? e.content.trim() : e.content.filter((e) => e.type === `text`).map((e) => e.text).join(``).trim();
}
function keptTailBudget(e) {
	return Math.min(2e4, Math.floor(e.threshold / 2));
}
function selectRecentWindowSize(e, t, n) {
	let r = Math.min(t.recentWindowSize, Math.max(e.length - 1, 0));
	let i = 0;
	let a = 0;
	for (let t = e.length - 1; t >= 0 && i < r; --t) {
		let r = e[t];
		if (r === void 0) continue;
		let o = estimateTokens([r]);
		if (a + o > n) break;
		a += o, i += 1;
	}
	return i;
}
function splitMessagesForCompaction(e, t) {
	if (t <= 0) return {
		older: [...e],
		recent: []
	};
	let n = e.length - t;
	for (; n < e.length && opensWithEarlierResult(e[n]);) n += 1;
	return {
		older: e.slice(0, n),
		recent: e.slice(n)
	};
}
function opensWithEarlierResult(e) {
	if (e.role === `tool`) return !0;
	if (e.role !== `assistant` || !Array.isArray(e.content)) return !1;
	let t = new Set(e.content.flatMap((e) => e.type === `tool-call` ? [e.toolCallId] : []));
	return e.content.some((e) => e.type === `tool-result` && !t.has(e.toolCallId));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/history.js
function changeHistory(e, t) {
	let n = applyChange(e, t);
	return n !== e && checksSessionEvents() && assertAnswersFollowCalls(n.history), n;
}
function applyChange(e, t) {
	if (`append` in t) return t.append.length === 0 ? e : {
		...e,
		history: validateHarnessModelMessages([...e.history, ...t.append])
	};
	if (`extend` in t) {
		let n = validateHarnessModelMessages(t.extend);
		return assertKeeps(e.history, n), {
			...e,
			history: n
		};
	}
	if (`repaired` in t) return {
		...e,
		history: validateHarnessModelMessages(t.repaired)
	};
	let n = validateHarnessModelMessages(t.rewrite);
	let r = contextStorage.getStore();
	let i = r?.get(HistoryStateKey);
	return r !== void 0 && i !== void 0 && r.set(HistoryStateKey, keptAnnouncements(i, n)), {
		...e,
		compaction: withoutPromptMeasurement(e.compaction),
		history: n
	};
}
function assertKeeps(e, t) {
	if (!checksSessionEvents()) return;
	let n = 0;
	for (let [r, i] of e.entries()) {
		for (; n < t.length && !sameMessage(i, t[n]);) n += 1;
		if (n === t.length) throw Error(`History was extended from ${e.length} to ${t.length} messages without message ${r} (${i.role}). A change to earlier messages is a rewrite: use changeHistory(session, { rewrite }).`);
		n += 1;
	}
}
function answersFollowCalls(e) {
	let t = /* @__PURE__ */ new Set();
	let n = /* @__PURE__ */ new Set();
	for (let [r, i] of e.entries()) if (typeof i.content != `string`) {
		for (let e of i.content) if (e.type === `tool-call` && t.add(e.toolCallId), e.type === `tool-result`) {
			if (!t.has(e.toolCallId)) return `History message ${r} answers tool call ${e.toolCallId}, which no earlier message made.`;
			if (n.has(e.toolCallId)) return `History message ${r} answers tool call ${e.toolCallId} a second time.`;
			n.add(e.toolCallId);
		}
	}
}
function assertAnswersFollowCalls(e) {
	let t = answersFollowCalls(e);
	if (t !== void 0) throw Error(t);
}
function sameMessage(e, t) {
	return e === t || JSON.stringify(e) === JSON.stringify(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/interaction-facts.js
function interactionOpened(e) {
	let { audience: t, interactionId: n, origin: r, request: i, subject: a } = e;
	return fact(`interaction.opened`, {
		audience: t,
		interactionId: n,
		origin: r,
		request: i,
		subject: a
	});
}
function approvalOpened(e) {
	return interactionOpened({
		interactionId: e.interactionId,
		request: e.request,
		subject: { callId: e.call.callId }
	});
}
function signInInteractionId(e) {
	return e.attemptId ?? e.name;
}
function signInOpened(e, t) {
	return fact(`interaction.opened`, signInRequest(e, t));
}
function signInRequest(e, t) {
	let n = e.challenge;
	let r = defined({
		callbackUrl: e.hookUrl,
		displayName: n.displayName,
		expiresAt: n.expiresAt,
		grant: e.grant,
		instructions: n.instructions,
		name: e.name,
		principal: signInPrincipal(e.principal),
		url: n.url,
		userCode: n.userCode
	});
	let i = defined({
		kind: `sign-in`,
		link: n.url === void 0 ? void 0 : { url: n.url },
		prompt: t.prompt ?? n.instructions ?? `Authorization required for ${e.name}`,
		signIn: r
	});
	return defined({
		audience: e.principalId === void 0 ? void 0 : { principalIds: [e.principalId] },
		interactionId: signInInteractionId(e),
		origin: t.origin,
		request: i,
		subject: t.subject
	});
}
function signInPrincipal(e) {
	if (e !== void 0) return e.type === `app` ? { type: `app` } : e.issuer === void 0 ? {
		id: e.id,
		type: `user`
	} : {
		id: e.id,
		issuer: e.issuer,
		type: `user`
	};
}
function interactionSettled(e, t, n = {}) {
	let r = n.response === void 0 ? void 0 : defined({
		optionId: n.response.optionId,
		text: n.response.text
	});
	return fact(`interaction.settled`, {
		cause: n.cause,
		interactionId: e,
		outcome: t,
		reason: n.reason,
		response: r !== void 0 && Object.keys(r).length > 0 ? r : void 0
	});
}
function responseSubmitted(e) {
	let { deliveryId: t, interactionId: n, responseId: r, value: i } = e;
	return fact(`response.submitted`, {
		deliveryId: t,
		interactionId: n,
		responseId: r,
		value: i !== void 0 && Object.keys(i).length > 0 ? i : void 0
	});
}
function responseAdmitted(e) {
	return {
		type: `response.admitted`,
		data: { responseId: e }
	};
}
function responseSettled(e, t, n) {
	return fact(`response.settled`, {
		outcome: t,
		reason: n,
		responseId: e
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/relays.js
const FORWARDED_SHARE = /^(.+)_forwarded_\d+$/;
function forwardedShareId(e, t) {
	return t === 0 ? e : `${e}_forwarded_${t}`;
}
function forwardedFrom(e) {
	return FORWARDED_SHARE.exec(e)?.[1] ?? e;
}
function parseRelay(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return;
	let t = Reflect.get(e, `childContinuationToken`);
	if (typeof t != `string`) return;
	let n = { childContinuationToken: t };
	let r = Reflect.get(e, `inputSource`);
	if (r !== void 0) {
		if (typeof r != `string` || r.length === 0) return;
		n.inputSource = r;
	}
	let i = Reflect.get(e, `childSessionInbox`);
	if (i !== void 0) {
		if (!isSessionInboxAddress(i)) return;
		n.childSessionInbox = i;
	}
	let a = Reflect.get(e, `remote`);
	if (a !== void 0) {
		let e = parseRemoteAgentBinding(a);
		if (e === void 0) return;
		n.remote = e;
	}
	let o = Reflect.get(e, `workflowAsk`);
	if (o !== void 0) {
		let e = isRecord(o) ? Reflect.get(o, `control`) : void 0;
		if (typeof e != `string` || e.length === 0) return;
		n.workflowAsk = { control: e };
	}
	let s = Reflect.get(e, `runId`);
	if (s !== void 0) {
		if (typeof s != `string` || s.length === 0) return;
		n.runId = s;
	}
	let c = Reflect.get(e, `receipts`);
	return isRecord(c) && Object.values(c).every((e) => typeof e == `string`) && (n.receipts = c), n;
}
function parseRemoteAgentBinding(e) {
	if (!isRecord(e)) return;
	let t = Reflect.get(e, `name`);
	let n = Reflect.get(e, `url`);
	let r = Reflect.get(e, `resolverId`);
	let i = Reflect.get(e, `forwardPrincipal`);
	let a = Reflect.get(e, `sessionId`);
	let o = Reflect.get(e, `dynamicBinding`);
	let s = Reflect.get(e, `earlierProtocol`);
	if ((s === void 0 || typeof s == `number` && Number.isInteger(s)) && typeof t == `string` && t && typeof n == `string` && n && typeof a == `string` && a && (r === void 0 || typeof r == `string` && r) && (i === void 0 || typeof i == `boolean`)) return {
		name: t,
		url: n,
		sessionId: a,
		...r !== void 0 && { resolverId: r },
		...i !== void 0 && { forwardPrincipal: i },
		...o !== void 0 && { dynamicBinding: o },
		...s !== void 0 && { earlierProtocol: s }
	};
}
function isRecord(e) {
	return typeof e == `object` && !!e && !Array.isArray(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/sign-ins.js
function withSignIns(e, t) {
	let n = resolveActiveAuthorizationChallenges(t);
	let r = supersededChallenges(e, n);
	return [...e.filter((e) => !r.includes(e)), ...n];
}
function resolveActiveAuthorizationChallenges(e) {
	return e.filter((t, n) => !e.slice(n + 1).some((e) => sameSignIn(t, e)));
}
function supersededChallenges(e, t) {
	return e.filter((e) => t.some((t) => sameSignIn(e, t)));
}
function terminalSignInFailure(e, t) {
	let n = activeTurnIdOf(e);
	if (n === void 0) return;
	let r = e.view;
	return Object.values(r.interactions).find((e) => {
		let i = e.request.signIn;
		return i !== void 0 && interactionOwner(r, e).turnId === n && rulesOutReasking(e) && sameSignIn({
			candidateId: `responseId` in e.subject ? e.subject.responseId : void 0,
			grant: i.grant,
			name: i.name,
			principal: i.principal
		}, t);
	});
}
function rulesOutReasking(e) {
	let { outcome: t } = e;
	switch (t) {
		case void 0:
		case `accepted`:
		case `invalid`: return !1;
		case `failed`: return e.response?.retryable === !1;
		case `declined`:
		case `withdrawn`:
		case `interrupted`:
		case `abandoned`:
		case `expired`: return !0;
		default: return t;
	}
}
function sameSignIn(e, t) {
	let n = e.grant !== void 0 && e.grant === t.grant && e.candidateId === t.candidateId;
	return (e.name === t.name || n) && samePrincipal(e.principal, t.principal);
}
function sameRelayedSignIn(e, t) {
	return e.grant !== void 0 && e.grant === t.grant && samePrincipal(e.principal, t.principal) && callbackOrigin(e.callbackUrl) !== void 0 && callbackOrigin(e.callbackUrl) === callbackOrigin(t.callbackUrl);
}
function waitingSignIn(e, t, n, r = /* @__PURE__ */ new Set()) {
	let i = t.request.signIn;
	if (i === void 0 || i.waitsOn !== void 0 || `responseId` in t.subject || n === void 0 || !n(t)) return t;
	let a = Object.values(e.interactions).find((e) => e.status === `open` && !r.has(e.interactionId) && !(`responseId` in e.subject) && e.request.signIn !== void 0 && e.request.signIn.waitsOn === void 0 && sameRelayedSignIn(e.request.signIn, i));
	return a === void 0 ? t : {
		...t,
		request: {
			...t.request,
			signIn: {
				...i,
				waitsOn: a.interactionId
			}
		}
	};
}
function callbackOrigin(e) {
	if (e !== void 0 && URL.canParse(e)) return new URL(e).origin;
}
function samePrincipal(e, t) {
	return e === void 0 || t === void 0 ? e === t : e.type === t.type && e.id === t.id && e.issuer === t.issuer;
}
function signInAttemptKey(e) {
	return e.attemptId ?? e.candidateId ?? e.name;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/hitl/requests.js
const REQUESTS_KEY = `eve.runtime.hitl.requests`;
function readRequests(e) {
	let t = e?.[REQUESTS_KEY];
	return isObject(t) ? t : {};
}
function record(e) {
	return isObject(e) && !Array.isArray(e) ? e : {};
}
function readHitlState(e) {
	let t = readRequests(e);
	let n;
	return {
		signIns: Array.isArray(t.signIns) ? t.signIns : [],
		responders: record(t.responders),
		get relays() {
			return n ??= new Map(Object.entries(record(t.relays)).flatMap(([e, t]) => {
				let n = parseRelay(t);
				return n === void 0 ? [] : [[e, n]];
			}));
		}
	};
}
function holdsHitlRequests(e) {
	let t = e?.[REQUESTS_KEY];
	if (t === void 0) return !1;
	if (!isObject(t) || Array.isArray(t)) return !0;
	let { signIns: n, relays: r } = t;
	return n !== void 0 || r !== void 0 && (!isObject(r) || Object.keys(r).length > 0);
}
function writeHitlState(e, t, n) {
	let r = e.state?.[REQUESTS_KEY];
	if (t.signIns === void 0 && t.relays === void 0 && t.responders === void 0 && r !== void 0 && (!isObject(r) || Array.isArray(r))) return e;
	let i = readRequests(e.state);
	let a = readHitlState(e.state);
	let o = { ...i };
	let put = (e, t) => {
		Object.keys(t).length > 0 ? o[e] = t : delete o[e];
	};
	(t.signIns !== void 0 || n !== void 0 && a.signIns.length > 0) && put(`signIns`, resolveActiveAuthorizationChallenges(t.signIns ?? a.signIns).filter((e) => n?.interactions[signInInteractionId(e)]?.status !== `settled`));
	let kept = (e, t) => Object.fromEntries(Object.entries(e).filter(([e]) => t(e)));
	if (t.relays !== void 0 || n !== void 0 && a.relays.size > 0) {
		let e = {
			...record(i.relays),
			...t.relays
		};
		put(`relays`, kept(e, (t) => n === void 0 || parseRelay(e[t]) === void 0 || n.interactions[t]?.status === `open`));
	}
	(t.responders !== void 0 || n !== void 0) && put(`responders`, kept({
		...a.responders,
		...t.responders
	}, (e) => n === void 0 || (n.responses[e]?.status ?? `settled`) !== `settled`));
	let s = { ...e.state };
	return delete s[REQUESTS_KEY], Object.keys(o).length > 0 && (s[REQUESTS_KEY] = o), {
		...e,
		state: Object.keys(s).length > 0 ? s : void 0
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/commit.js
function transition(e) {
	return e;
}
function unchangedBy(e, t) {
	return transition({
		events: e,
		turn: t
	});
}
function commitOf(e) {
	return e;
}
function commitTransitions(e) {
	return commitOf(e.flatMap((e) => e.events));
}
function joinCommits(e) {
	let t = [];
	for (let n of e) {
		let e = t.at(-1);
		Array.isArray(n) && Array.isArray(e) ? t[t.length - 1] = commitOf([...e, ...n]) : (!Array.isArray(n) || n.length > 0) && t.push(n);
	}
	return t;
}
function sessionView(e, t) {
	let n = readHitlState(t);
	return {
		projection: e,
		relayedRequestIds: new Set(n.relays.keys()),
		responders: n.responders,
		signIns: n.signIns.filter((t) => e.view.interactions[signInInteractionId(t)]?.status !== `settled`),
		turn: readTurnState(t)
	};
}
async function applyTransition(e, t, n, r) {
	return t.events.length > 0 && await n(commitOf(t.events), r), saveTransition(e, t);
}
function saveTransition(e, t) {
	let n = writeTurnState(writeHitlState(e, t), t.turn);
	if (t.history === void 0) return n;
	if (!(`history` in n)) throw Error(`A transition that changes history needs the session's history.`);
	return changeHistory(n, t.history);
}
function committedMessages(e) {
	return e.history !== void 0 && `append` in e.history ? e.history.append : [];
}
function dropClosedRecords(e, t) {
	return writeHitlState(e, {}, t.view);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/runs.js
function requestRun(e, t) {
	return commitOf([runRequested(e, t)]);
}
function startRun(e) {
	return commitOf([runStarted(e)]);
}
function retryRun(e) {
	let { usage: t, ...n } = e;
	return commitOf([fact(`model.retried`, n), ...t === void 0 ? [] : [runUsageRecorded(e.runId, t)]]);
}
function settleRun(e, t) {
	return commitOf([...t === void 0 ? [] : [fact(`content.completed`, t)], ...runSettledFacts(e)]);
}
function recordUsage$1(e) {
	return commitOf([fact(`usage.recorded`, {
		kind: e.kind,
		...e.callId !== void 0 && { owner: { callId: e.callId } },
		usage: e.usage
	})]);
}
function recordLateSpend(e) {
	return commitOf(e.map((e) => delegatedUsageFact(void 0, e)));
}
function taskSpend(e, t) {
	let n = t.settling.filter((e) => e.type === `call.settled`);
	let r = n.find((e) => e.data.callId === t.sourceCallId) ?? n[0];
	return transition({
		events: [r === void 0 ? {
			...delegatedUsageFact(void 0, t.spend),
			scope: { taskId: t.taskId }
		} : delegatedUsageFact(r.data.callId, t.spend)],
		turn: e.turn
	});
}
function lateTaskSpend(e, t) {
	return transition({
		events: t === void 0 ? [] : [delegatedUsageFact(void 0, t)],
		turn: e.turn
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/usage-sink.js
const SINK = Symbol.for(`eve.usageSink`);
const log$2 = createLogger(`harness.usage-sink`);
async function withUsageSink(e, t) {
	let n = [];
	let r = await withContextScopeValue(SINK, {
		pending: n,
		publish: e
	}, t);
	return await Promise.all(n), r;
}
function withUsageCall(e, t) {
	let n = contextScopeValue(SINK);
	return n === void 0 ? t() : withContextScopeValue(SINK, {
		...n,
		callId: e
	}, t);
}
function withUsageInEffect(e) {
	let t = contextScopeValue(SINK);
	if (t === void 0) return e();
	let { callId: n, ...r } = t;
	return withContextScopeValue(SINK, {
		...r,
		inEffect: !0
	}, e);
}
async function recordUsage(e, t = {}) {
	let n = contextScopeValue(SINK);
	if (n === void 0) return;
	let r = usageOf(e);
	let i = n.publish(recordUsage$1({
		callId: n.callId,
		kind: t.kind ?? `auxiliary`,
		usage: r
	}));
	if (n.inEffect !== !0) return await i;
	n.pending.push(i.catch((e) => log$2.error(`recording usage failed`, { error: e })));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/token-usage-math.js
function addTokenUsage(e, t) {
	return {
		cacheReadTokens: e.cacheReadTokens + t.cacheReadTokens,
		cacheWriteTokens: e.cacheWriteTokens + t.cacheWriteTokens,
		costUsd: e.costUsd === void 0 && t.costUsd === void 0 ? void 0 : (e.costUsd ?? 0) + (t.costUsd ?? 0),
		inputTokens: e.inputTokens + t.inputTokens,
		outputTokens: e.outputTokens + t.outputTokens
	};
}
function usageSince(e, t) {
	return t === void 0 ? e : {
		cacheReadTokens: e.cacheReadTokens - t.cacheReadTokens,
		cacheWriteTokens: e.cacheWriteTokens - t.cacheWriteTokens,
		costUsd: e.costUsd === void 0 ? void 0 : e.costUsd - (t.costUsd ?? 0),
		inputTokens: e.inputTokens - t.inputTokens,
		outputTokens: e.outputTokens - t.outputTokens
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-usage.js
const REPORTED_SESSION_USAGE_STATE_KEY = `eve.harness.reportedSessionUsage`;
const NO_USAGE = {
	cacheReadTokens: 0,
	cacheWriteTokens: 0,
	inputTokens: 0,
	outputTokens: 0
};
function sessionUsage(e) {
	return storedProjection(e.state).view.usage.total;
}
function turnUsage(e, t) {
	let n = NO_USAGE;
	for (let r of Object.values(e.runs)) {
		if (r.usage === void 0) continue;
		let { owner: i } = r;
		(`turnId` in i ? i.turnId : e.changes[i.changeId]?.turnId) === t && (n = addTokenUsage(n, r.usage));
	}
	return n;
}
function takeSessionUsageDelta(e) {
	let t = sessionUsage(e);
	return {
		delta: usageSince(t, reportedUsage(e.state)),
		session: withReported(e, t)
	};
}
function markUsageReported(e, t) {
	return withReported(e, addTokenUsage(reportedUsage(e.state), t));
}
function withModelUsage(e, t) {
	return {
		...e,
		usage: {
			byKind: { model: t },
			total: t
		}
	};
}
function reportedUsage(e) {
	return e?.[REPORTED_SESSION_USAGE_STATE_KEY] ?? NO_USAGE;
}
function withReported(e, t) {
	return {
		...e,
		state: {
			...e.state,
			[REPORTED_SESSION_USAGE_STATE_KEY]: t
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/usage.js
function gatewayModelId(e) {
	try {
		return formatLanguageModelGatewayId(e);
	} catch {
		return;
	}
}
function extractTokenUsageDelta(e) {
	let t = e.usage;
	if (t !== void 0 || e.costUsd !== void 0) return {
		cacheReadTokens: t?.inputTokenDetails?.cacheReadTokens,
		cacheWriteTokens: t?.inputTokenDetails?.cacheWriteTokens,
		costUsd: e.costUsd,
		inputTokens: t?.inputTokens,
		outputTokens: t?.outputTokens
	};
}
function extractGatewayCostUsd(e) {
	let t = readGatewayMetadata(e)?.cost;
	if (typeof t == `number` && Number.isFinite(t)) return t;
	if (typeof t == `string`) {
		let e = Number(t);
		return Number.isFinite(e) ? e : void 0;
	}
}
function readGatewayMetadata(e) {
	let t = e?.gateway;
	return t && typeof t == `object` && !Array.isArray(t) ? t : void 0;
}
async function recordModelUsage(e, t) {
	let { setAttributes: n } = e.config;
	if (n === void 0) return;
	let r = turnUsage(e.view().projection.view, e.position().turnId);
	await n({
		"$eve.model": gatewayModelId(t.model),
		"$eve.input_tokens": r.inputTokens,
		"$eve.output_tokens": r.outputTokens,
		"$eve.cache_read_tokens": r.cacheReadTokens,
		"$eve.cache_write_tokens": r.cacheWriteTokens,
		"$eve.cost_usd": r.costUsd,
		"$eve.tool_count": t.tools
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/ai-sdk-warnings.js
const log$1 = createLogger(`harness.ai-sdk-warnings`);
function ensureAiSdkWarningLogger() {
	globalThis.AI_SDK_LOG_WARNINGS === void 0 && (globalThis.AI_SDK_LOG_WARNINGS = process.env.AI_SDK_LOG_WARNINGS !== `false` && logAiSdkWarnings);
}
const logAiSdkWarnings = ({ warnings: e, provider: t, model: n }) => {
	for (let r of e) {
		let e = {
			model: n,
			provider: t,
			warning: r
		};
		let i = `message` in r ? r.message : r.details ?? r.feature;
		r.type === `compatibility` ? log$1.info(i, e) : log$1.warn(i, e);
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-auth/store.js
async function readModelSecret(e) {
	try {
		let t = await secrets.get({
			service: `eve`,
			name: e
		});
		if (t !== null && Buffer.byteLength(t) > 2560) throw Error();
		return t ?? void 0;
	} catch {
		throw Error(`Cannot read the OS secret store. Unlock it and retry /login.`);
	}
}
async function writeModelSecret(e, t) {
	try {
		if (Buffer.byteLength(t) > 2560) throw Error();
		await secrets.set({
			service: `eve`,
			name: e,
			value: t
		});
	} catch {
		throw Error(`Cannot save to the OS secret store. Unlock it and retry /login.`);
	}
}
let cachedVercelSession;
let cachedVercelSessionClientId;
async function writeVercelSession(e, t) {
	let { accessToken: n, expiresAt: r, ...i } = e;
	await writeModelSecret(`vercel`, JSON.stringify({
		clientId: t,
		...i
	})), cachedVercelSession = e, cachedVercelSessionClientId = t;
}
async function readVercelSession(e) {
	let t = await readModelSecret(`vercel`);
	if (t === void 0) return;
	let n;
	try {
		n = JSON.parse(t);
	} catch {
		throw Error(`Saved Vercel login is invalid. Run /login to sign in again.`);
	}
	if (isObject(n) && n.clientId === e) {
		if (typeof n.refreshToken != `string` || typeof n.teamId != `string` || typeof n.teamName != `string`) throw Error(`Saved Vercel login is invalid. Run /login to sign in again.`);
		return {
			accessToken: cachedVercelSessionClientId === e && cachedVercelSession?.refreshToken === n.refreshToken ? cachedVercelSession.accessToken : ``,
			refreshToken: n.refreshToken,
			expiresAt: cachedVercelSessionClientId === e && cachedVercelSession?.refreshToken === n.refreshToken ? cachedVercelSession.expiresAt : 0,
			teamId: n.teamId,
			teamName: n.teamName
		};
	}
}
function modelKeySecretName(e) {
	return e === `ai-gateway-key` ? e : `${e}-key`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-auth/api-key.js
const KEY_ENV = {
	openai: `OPENAI_API_KEY`,
	anthropic: `ANTHROPIC_API_KEY`,
	"ai-gateway-key": `AI_GATEWAY_API_KEY`
};
async function resolveModelApiKey(e) {
	let t = process.env[KEY_ENV[e]];
	let n = isEveDevEnvironment() && process.env["EVE_MODEL_CONNECTION"] === e ? process.env.EVE_MODEL_KEY_SOURCE : void 0;
	if (t?.trim() && n !== `secret`) return t;
	if (isEveDevEnvironment() && n !== `environment`) {
		let t = await readModelSecret(modelKeySecretName(e));
		if (t) return t;
	}
	throw Error(n === `secret` ? `The selected saved API key is unavailable. Run /login to reconnect.` : `Set ${KEY_ENV[e]}${isEveDevEnvironment() ? ` or connect with /login` : ` in the server environment`}.`);
}
async function authJson(e, t = {}, n = 256e3, r = 15e3) {
	let i = AbortSignal.timeout(r);
	let a = await fetch(e, {
		...t,
		redirect: `error`,
		signal: t.signal ? AbortSignal.any([t.signal, i]) : i
	});
	let o = a.body?.getReader();
	let s = ``;
	let c = new TextDecoder();
	if (o) try {
		let e = 0;
		for (;;) {
			let t = await o.read();
			if (t.done) break;
			if (e += t.value.byteLength, e > n) throw Error(`Authentication response was too large. Retry /login.`);
			s += c.decode(t.value, { stream: !0 });
		}
		s += c.decode();
	} finally {
		await o.cancel();
	}
	let l;
	try {
		l = JSON.parse(s);
	} catch {
		throw Error(`The provider returned an invalid authentication response. Retry /login.`);
	}
	if (!isObject(l)) throw Error(`The provider returned an invalid authentication response. Retry /login.`);
	if (!a.ok && typeof l.error != `string`) throw Error(`Authentication failed (${a.status}). Retry /login.`);
	return l;
}
async function vercelOAuthEndpoints(e) {
	let t = await authJson(`https://vercel.com/.well-known/openid-configuration`, { signal: e });
	let endpoint = (e) => {
		let t = typeof e == `string` ? URL.parse(e) : null;
		if (!t || ![`https://vercel.com`, `https://api.vercel.com`].includes(t.origin) || t.username || t.password) throw Error(`Vercel returned an unexpected OAuth endpoint. Retry /login.`);
		return t.href;
	};
	return {
		device: endpoint(t.device_authorization_endpoint),
		token: endpoint(t.token_endpoint)
	};
}
function sessionFromToken(e, t) {
	if (typeof e.error == `string`) throw Error(`Vercel login expired. Retry /login.`);
	if (typeof e.access_token != `string` || typeof e.expires_in != `number` || !Number.isFinite(e.expires_in) || e.expires_in <= 0) throw Error(`Vercel did not return a usable token. Retry /login.`);
	let n = typeof e.refresh_token == `string` ? e.refresh_token : t?.refreshToken;
	if (!n) throw Error(`Vercel did not return a refresh token. Retry /login.`);
	return {
		accessToken: e.access_token,
		refreshToken: n,
		expiresAt: Date.now() + e.expires_in * 1e3,
		teamId: t?.teamId ?? ``,
		teamName: t?.teamName ?? ``
	};
}
async function resolveVercelSession(e) {
	let t = await readVercelSession("cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp");
	if (!t) throw Error(`Sign in to Vercel with /login.`);
	if (t.expiresAt > Date.now() + 6e4 && t.accessToken !== e) return t;
	let n = join(homedir(), `.eve`, `auth`);
	await mkdir(n, {
		recursive: !0,
		mode: 448
	});
	let r = join(n, `vercel-refresh.lock`);
	let i = Date.now() + 35e3;
	for (;;) try {
		await mkdir(r);
		break;
	} catch (e) {
		if (!isErrnoCode(e, `EEXIST`)) throw e;
		let t = await stat(r).catch(() => void 0);
		if (t && Date.now() - t.mtimeMs > 3e5) {
			await rm(r, {
				recursive: !0,
				force: !0
			});
			continue;
		}
		if (Date.now() > i) throw Error(`Vercel credentials are busy. Close other eve sessions and retry /login.`);
		await setTimeout(100);
	}
	try {
		if (t = await readVercelSession("cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp"), !t) throw Error(`Sign in to Vercel with /login.`);
		return t.expiresAt > Date.now() + 6e4 && t.accessToken !== e || (t = sessionFromToken(await authJson((await vercelOAuthEndpoints()).token, {
			method: `POST`,
			body: new URLSearchParams({
				client_id: "cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp",
				grant_type: `refresh_token`,
				refresh_token: t.refreshToken
			})
		}), t), await writeVercelSession(t, "cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp")), t;
	} finally {
		await rm(r, {
			recursive: !0,
			force: !0
		});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-auth/development-broker-client.js
function developmentModelBrokerAvailable() {
	return isEveDevEnvironment() && !!(process.env.EVE_DEV_CONTROL_URL && process.env["EVE_DEV_WORKFLOW_TRANSPORT_SECRET"]);
}
async function readDevelopmentModelCredential(e, t, n) {
	if (!developmentModelBrokerAvailable()) return;
	let r = new URL("/eve/v1/dev/internal/model-credential", process.env.EVE_DEV_CONTROL_URL);
	if (!isLoopbackHostname(r.hostname) || r.protocol !== `http:` || r.username || r.password) throw Error(`The local model connection is unavailable. Restart eve dev.`);
	r.searchParams.set(`provider`, e);
	let i = { ["x-eve-dev-workflow-transport"]: process.env["EVE_DEV_WORKFLOW_TRANSPORT_SECRET"] };
	t && (i["x-eve-model-rejected-token-sha256"] = createHash(`sha256`).update(t).digest(`hex`));
	let a = await authJson(r.href, {
		headers: i,
		signal: n
	}, 256e3, 75e3);
	if (typeof a.token != `string` || !a.token || ![
		`api-key`,
		`oauth`,
		`oidc`
	].includes(String(a.kind))) throw Error(`The model connection is unavailable. Run /login to reconnect.`);
	return {
		kind: a.kind,
		token: a.token,
		...typeof a.teamId == `string` && { teamId: a.teamId },
		...typeof a.teamName == `string` && { teamName: a.teamName },
		...typeof a.accountId == `string` && { accountId: a.accountId },
		...typeof a.accountLabel == `string` && { accountLabel: a.accountLabel }
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-auth/vercel-cli.js
async function readObject(e) {
	try {
		let t = await readFile(e, `utf8`);
		if (Buffer.byteLength(t) > 65536) return;
		let n = JSON.parse(t);
		return isObject(n) ? n : void 0;
	} catch {
		return;
	}
}
async function readCliConfiguration() {
	let e = homedir();
	let t = process.platform === `darwin` ? join(e, `Library`, `Application Support`) : process.platform === `win32` ? process.env.APPDATA ?? join(e, `AppData`, `Roaming`) : process.env.XDG_DATA_HOME ?? join(e, `.local`, `share`);
	for (let n of [
		join(t, `com.vercel.cli`),
		join(e, `.now`),
		join(t, `now`)
	]) {
		let e = await readObject(join(n, `config.json`));
		if (e !== void 0) return {
			directory: n,
			config: e,
			teamId: typeof e.currentTeam == `string` ? e.currentTeam : void 0
		};
	}
}
async function readVercelCliConnection() {
	let e = await readCliConfiguration();
	if (!e?.teamId) return;
	let t = await readCliToken(e);
	return t === void 0 ? void 0 : {
		token: t,
		teamId: e.teamId
	};
}
async function readCliToken(e) {
	if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
	if (!e) return;
	let { directory: t, config: n } = e;
	let r = process.env.VERCEL_TOKEN_STORAGE ?? n.credStorage ?? `file`;
	let i = join(t, `auth.json`);
	let a;
	if (r === `file` && (a = await readObject(i)), !a && (r === `keyring` || r === `auto`)) {
		let e = `cli:${createHash(`sha256`).update(i).digest(`hex`).slice(0, 16)}`;
		try {
			let t = await readCliKeyring(e);
			let n = t && t.length <= 65536 ? JSON.parse(t) : void 0;
			isObject(n) && (a = n);
		} catch {
			if (r === `keyring`) return;
		}
		!a && r === `auto` && (a = await readObject(i));
	}
	if (typeof a?.token == `string` && a.token) return a.token;
}
async function refreshVercelCliConnection() {
	try {
		await promisify(execFile)(`vercel`, [`whoami`], {
			timeout: 15e3,
			maxBuffer: 65536,
			windowsHide: !0
		});
	} catch {
		throw Error(`Vercel CLI access expired. Run /login to reconnect.`);
	}
}
async function readCliKeyring(e) {
	for (let t of (process.env.PATH ?? ``).split(delimiter)) try {
		let n = await realpath(join(t, process.platform === `win32` ? `vercel.cmd` : `vercel`));
		let r = createRequire(n);
		process.platform === `win32` && (r = createRequire(r.resolve(`vercel/package.json`)));
		try {
			r = createRequire(r.resolve(`@vercel/cli-auth/package.json`));
		} catch {}
		return new (r("@napi-rs/keyring")).Entry(`com.vercel.vercel-cli`, e).getPassword() ?? void 0;
	} catch {}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-auth/gateway-credential.js
async function resolveGatewayModelCredential(e) {
	let t = process.env["EVE_MODEL_CONNECTION"];
	if (t === `vercel` || t === `vercel-cli`) {
		t === `vercel-cli` && e && await refreshVercelCliConnection();
		let n = t === `vercel` ? await resolveVercelSession(e) : await readVercelCliConnection();
		if (!n) throw Error(`Vercel CLI credentials are unavailable. Run /login.`);
		return {
			kind: `oauth`,
			token: `accessToken` in n ? n.accessToken : n.token,
			teamId: process.env.EVE_MODEL_TEAM ?? n.teamId,
			teamName: process.env.EVE_MODEL_TEAM_NAME ?? (`teamName` in n ? n.teamName : n.teamId)
		};
	}
	return t === `ai-gateway-key` ? {
		kind: `api-key`,
		token: await resolveModelApiKey(`ai-gateway-key`)
	} : t !== `ai-gateway-project` && process.env.AI_GATEWAY_API_KEY?.trim() ? {
		kind: `api-key`,
		token: process.env.AI_GATEWAY_API_KEY
	} : {
		kind: `oidc`,
		token: await getVercelOidcToken()
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/model-auth/transport.js
function createLocalGateway() {
	if (!isEveDevEnvironment() || Reflect.get(globalThis, `AI_SDK_DEFAULT_PROVIDER`) != null) return;
	let e = process.env["EVE_MODEL_CONNECTION"];
	if (!developmentModelBrokerAvailable() && e !== `vercel` && e !== `vercel-cli` && e !== `ai-gateway-key` && e !== `ai-gateway-project`) return;
	let resolve = async (e, t) => await readDevelopmentModelCredential(`gateway`, e, t) ?? await resolveGatewayModelCredential(e);
	return createGateway({
		apiKey: `eve-local-credential`,
		fetch: async (e, t) => {
			let n = new Headers(t?.headers);
			let authenticate = (e) => {
				n.set(`authorization`, `Bearer ${e.token}`), n.delete("x-vercel-ai-gateway-team"), e.teamId && n.set("x-vercel-ai-gateway-team", e.teamId);
			};
			let r = await resolve(void 0, t?.signal);
			authenticate(r);
			let i = await fetch(e, {
				...t,
				headers: n
			});
			return i.status !== 401 || r.kind !== `oauth` || t?.body !== void 0 && t.body !== null && typeof t.body != `string` ? i : (await i.body?.cancel(), authenticate(await resolve(r.token, t?.signal)), fetch(e, {
				...t,
				headers: n
			}));
		}
	});
}
function localGatewayModel(e) {
	return createLocalGateway()?.languageModel(e);
}
function localGatewayDecisionModel(e) {
	return createLocalGateway()?.decisionModel(e);
}
function resolveDecisionModel(e) {
	if (typeof e != `string`) return e;
	let t = localGatewayDecisionModel(e);
	if (t !== void 0) return t;
	let n = Reflect.get(globalThis, `AI_SDK_DEFAULT_PROVIDER`) ?? Reflect.get(aiSdk, `gateway`);
	let r = n == null ? void 0 : Reflect.get(n, `decisionModel`) ?? Reflect.get(n, `evaluationModel`);
	if (typeof r != `function`) return e;
	try {
		return r.call(n, e) ?? e;
	} catch {
		return e;
	}
}
function resolveAiSdkDecide() {
	let e = Reflect.get(aiSdk, `decide`) ?? Reflect.get(aiSdk, `experimental_decide`);
	if (typeof e != `function`) throw Error(`decide requires an installed "ai" package that exports decide or experimental_decide. Install a version of "ai" supported by eve, such as ai@^7.0.137.`);
	return e;
}
function decideWithMetadata({ model: e = "typesafe-ai/jev", state: t, questions: n, maxRetries: r, signal: i, providerOptions: a }, o) {
	let s = resolveAiSdkDecide();
	if (ensureAiSdkWarningLogger(), typeof e != `string` && typeof Reflect.get(e, `doDecide`) != `function` && typeof Reflect.get(e, `doEvaluate`) != `function`) throw TypeError(`decide requires a provider decision model implementation, not just its identity.`);
	return s({
		model: typeof e == `string` ? localGatewayDecisionModel(e) ?? e : e,
		state: t,
		questions: n,
		maxRetries: r,
		abortSignal: i,
		providerOptions: a,
		...o
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/trace-root.js
function resolveTraceRootSessionId(e, t) {
	let n = e.get(TraceRootKey);
	return n?.kind === `own` ? t : n?.kind === `inherited` ? n.sessionId : e.get(ParentSessionKey)?.rootSessionId ?? t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/decision-results.js
function decisionResults(e, t) {
	return Object.entries(e).flatMap(([e, n], r) => {
		let i = {
			question_index: r,
			question_name: e
		};
		if (`refused` in t) return t.refused.includes(e) ? [{
			...i,
			type: `refusal`
		}] : [];
		let a = t.answers[e];
		if (a?.type === `refusal`) return [{
			...i,
			type: `refusal`
		}];
		if (a?.type !== n.type) return [];
		if (n.type === `boolean` && typeof a.probability == `number`) return [{
			...i,
			type: `predicate`,
			probability: a.probability
		}];
		if (n.type === `choice` && typeof a.choice == `string`) {
			let e = {
				...i,
				type: `choice`,
				value: a.choice
			};
			let t = a.probabilities?.[a.choice];
			return typeof t == `number` && (e.probability = t), [e];
		}
		if (n.type === `score` && typeof a.score == `number`) {
			let e = n.criteria;
			return e.length < 2 || !e.every((e) => typeof e == `string`) ? [] : [{
				...i,
				type: `score`,
				value: a.score,
				levels: [...e]
			}];
		}
		return [];
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/ai-sdk-telemetry.js
function aiSdkCapture(e, t) {
	return {
		recordInputs: e.recordInputs || t.authoredCapturesInputs === !0,
		recordOutputs: e.recordOutputs || t.authoredCapturesOutputs === !0
	};
}
const log = createLogger(`harness.ai-sdk-telemetry`);
let registered = !1;
let eveOtelIntegration;
let errorSafeEveOtelIntegration;
let warnedMissingEveOtelIntegration = !1;
function ensureOtelIntegration() {
	registered || (registered = !0, eveOtelIntegration = new OpenTelemetry({ runtimeContext: !0 }), errorSafeEveOtelIntegration = telemetryWithoutErrorContent(eveOtelIntegration), registerTelemetry(eveOtelIntegration));
}
function getRegisteredTelemetryIntegrations(e) {
	let t = globalThis.AI_SDK_TELEMETRY_INTEGRATIONS ?? [];
	let n = e?.excludeEveOtelIntegration === !0 ? t.filter((e) => e !== eveOtelIntegration) : t;
	if (e?.sanitizeEveOtelErrors !== !0) return n;
	let r = !1;
	let i = n.map((e) => e !== eveOtelIntegration || errorSafeEveOtelIntegration === void 0 ? e : (r = !0, errorSafeEveOtelIntegration));
	return !r && e.excludeEveOtelIntegration !== !0 && !warnedMissingEveOtelIntegration && (warnedMissingEveOtelIntegration = !0, log.warn(`could not sanitize eve's AI SDK OpenTelemetry integration`, { reason: eveOtelIntegration === void 0 ? `eve OpenTelemetry integration was not registered` : `registered integration identity did not match` })), i;
}
function telemetryWithoutErrorContent(e) {
	let genericError = () => Error(`AI SDK operation failed`);
	return new Proxy(e, { get(e, t) {
		if (t === `onError` && e.onError !== void 0) return (t) => e.onError(typeof t == `object` && t ? {
			...t,
			error: genericError()
		} : genericError());
		if (t === `onToolExecutionEnd` && e.onToolExecutionEnd !== void 0) return (t) => e.onToolExecutionEnd(t.toolOutput.type === `tool-error` ? {
			...t,
			toolOutput: {
				...t.toolOutput,
				error: genericError()
			}
		} : t);
		let n = Reflect.get(e, t);
		return typeof n == `function` ? n.bind(e) : n;
	} });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/trace-decision.js
function resolveInstrumentationTraceDecision(e, t, n, r, i) {
	if (e !== void 0) return r?.decision === void 0 ? i === void 0 ? r === void 0 ? resolveTracePolicy(e.tracePolicy, {
		agentName: t,
		...n
	}) : resolveTracePolicyDecision(isSampledTrace(r), n) : i : readInstrumentationDecision(r.decision);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/gateway.js
const SUPPRESS_TRACING_KEY = createContextKey(`OpenTelemetry SDK Context Key SUPPRESS_TRACING`);
const traceContextSetter = { set(e, t, n) {
	e[t] = n;
} };
function createGatewayTraceContextHeaders() {
	let e = context.active();
	if (e.getValue(SUPPRESS_TRACING_KEY) === !0 || trace.getSpan(e) === void 0) return;
	let t = {};
	return propagation.inject(e, t, traceContextSetter), stripEveTraceBaggage(t), Object.keys(t).length === 0 ? void 0 : t;
}
function gatewayCostAttributes(e) {
	return {
		"gen_ai.usage.cost": e.cost,
		"gen_ai.usage.gateway_cost": e.gatewayCost,
		"gen_ai.usage.input_cost": e.inputCost,
		"gen_ai.usage.output_cost": e.outputCost,
		"gen_ai.generation.id": e.generationId
	};
}
function readGatewayCostData(e) {
	if (e === void 0) return;
	let t = e.gateway;
	if (typeof t != `object` || !t || Array.isArray(t)) return;
	let n = t;
	return {
		cost: readUsd(n.cost),
		gatewayCost: readUsd(n.gatewayCost),
		inputCost: readUsd(n.inputInferenceCost),
		outputCost: readUsd(n.outputInferenceCost),
		generationId: typeof n.generationId == `string` && n.generationId.length > 0 ? n.generationId : void 0
	};
}
function readUsd(e) {
	if (typeof e != `string` || e.trim() === ``) return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/operation-input.js
function eveTurnIdentity(e) {
	return {
		conversationId: resolveConversationId(e.rootSessionId ?? e.sessionId),
		runId: e.sessionId,
		turnId: e.turnId
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/decide.js
async function decideWithTracing(e, t) {
	let n = getInstrumentationRuntime();
	if (n === void 0) return decideWithMetadata(e);
	let r = contextStorage.getStore() ?? new ContextContainer();
	let i = readInstrumentationSessionContext(r);
	let a = r.get(SessionAgentKey)?.name ?? `eve`;
	let o = i.forwardedTracePolicy?.ceiling;
	let s = n.hooks.forTrace?.({
		agentName: a,
		...i.conversation
	}, { ceiling: o }) ?? n.hooks;
	let c = n.otelSettings;
	let l = n.decision;
	if (c === void 0 || l === void 0) return decideWithMetadata(e, { telemetry: aiSdkCapture(defaultContentCapture(i.conversation, o), s) });
	let u = r.get(SessionIdKey);
	let d = r.get(SessionKey)?.turn.id;
	let f = u === void 0 || d === void 0 ? void 0 : await n.readTurnTraceContext?.(u, d);
	let p = resolveInstrumentationTraceDecision(c, a, i.conversation, i.traceSeed, u === void 0 ? void 0 : readSessionTraceDecision(r, u));
	let m = p === void 0 ? void 0 : applyLiveDeliveryAudienceCeiling(p, i.audience, i.forwardedTracePolicy, i.conversation.environment);
	let h = currentCapture();
	let g = m?.action === `record`;
	let _ = {
		emit: g && h?.emit !== !1,
		recordInputs: g && m.recordInputs && h?.recordInputs !== !1,
		recordOutputs: g && m.recordOutputs && h?.recordOutputs !== !1
	};
	let v = withChannelAudience(context.active(), i.audience);
	u !== void 0 && (v = withOperationTraceContext(v, {
		sessionId: u,
		rootSessionId: i.parent?.rootSessionId,
		traceSessionId: resolveTraceRootSessionId(r, u)
	}));
	let y = resolveDecisionModel(e.model ?? "typesafe-ai/jev");
	let b = await l({
		modelId: typeof y == `string` ? y : y.modelId,
		provider: typeof y == `string` ? void 0 : y.provider,
		purpose: t,
		identity: u === void 0 || d === void 0 ? void 0 : eveTurnIdentity({
			sessionId: u,
			rootSessionId: i.parent?.rootSessionId,
			turnId: d
		}),
		agentName: c.functionId ?? a,
		capture: _,
		parent: f ?? i.traceSeed,
		context: v
	});
	let x = {
		integrations: [...getRegisteredTelemetryIntegrations({ excludeEveOtelIntegration: !0 })],
		...aiSdkCapture(b.capture, s)
	};
	try {
		let t = await b.run(() => decideWithMetadata({
			...e,
			model: y
		}, { telemetry: x }));
		return b.attributes({
			"gen_ai.response.id": t.response.id,
			"gen_ai.response.model": t.response.modelId,
			...gatewayCostAttributes(readGatewayCostData(t.providerMetadata) ?? {})
		}), await b.complete({
			output: decisionResults(e.questions, { answers: t.answers }),
			usage: {
				inputTokens: t.usage.inputTokens,
				outputTokens: t.usage.outputTokens
			}
		}), t;
	} catch (t) {
		throw await b.complete(Experimental_DecisionRefusalError.isInstance(t) ? { output: decisionResults(e.questions, { refused: t.questionIds }) } : {
			failed: !0,
			errorCode: `decision_error`
		}), t;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/ai/decide.js
async function decideFor(e, t) {
	let n = await decideWithTracing(t, e);
	return await recordUsage({
		costUsd: extractGatewayCostUsd(n.providerMetadata),
		inputTokens: n.usage.inputTokens,
		outputTokens: n.usage.outputTokens
	}, { kind: `decision` }), {
		answers: n.answers,
		usage: {
			inputTokens: n.usage.inputTokens,
			outputTokens: n.usage.outputTokens,
			totalTokens: n.usage.totalTokens
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/approval/policies.js
function always() {
	return () => `user-approval`;
}
const STEERED_APPROVAL_POLICY = Symbol.for(`eve.approval.steered`);
const STEERED_ASKED = Symbol.for(`eve.approval.steeredAsked`);
async function trackSteeredAsk(e) {
	let t = { asked: !1 };
	return {
		value: await withContextScopeValue(STEERED_ASKED, t, e),
		asked: t.asked
	};
}
function markSteeredApprovalPolicy(e) {
	return Object.defineProperty(e, STEERED_APPROVAL_POLICY, { value: !0 }), e;
}
function isSteeredApprovalPolicy(e) {
	return typeof e == `function` && e[STEERED_APPROVAL_POLICY] === !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/connections/errors.js
var ConnectionAuthorizationRequiredError = class extends Error {
	connectionName;
	constructor(e, t) {
		super(t?.message ?? `Connection "${e}" requires authorization.`), this.name = `ConnectionAuthorizationRequiredError`, this.connectionName = e;
	}
};
var ConnectionAuthorizationFailedError = class extends Error {
	connectionName;
	reason;
	retryable;
	constructor(e, t) {
		super(t?.message ?? `Connection "${e}" authorization failed.`), this.name = `ConnectionAuthorizationFailedError`, this.connectionName = e, this.reason = t?.reason, this.retryable = t?.retryable ?? !0;
	}
};
function isConnectionAuthorizationRequiredError(e) {
	return e instanceof Error && e.name === `ConnectionAuthorizationRequiredError`;
}
function isConnectionAuthorizationFailedError(e) {
	return e instanceof Error && e.name === `ConnectionAuthorizationFailedError`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/identity-hold.js
const MODEL_CALL = Symbol.for(`eve.modelCall`);
function withModelCall(e) {
	return withContextScopeValue(MODEL_CALL, !0, e);
}
function steeredModelCall(e = contextStorage.getStore()) {
	return contextScopeValue(MODEL_CALL) === !0 && (e?.get(SteeredByKey) ?? []).length > 0;
}
function turnSteeredMessage(e) {
	return `Another person's message joined this turn after its caller last spoke, so ${e} can't use the caller's identity. Ask the caller to confirm in this conversation, then try again.`;
}
function holdCallerIdentity(e, t, n = `connection "${e}"`) {
	if (steeredModelCall(t)) throw new ConnectionAuthorizationFailedError(e, {
		message: turnSteeredMessage(n),
		reason: `turn_steered`,
		retryable: !1
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/principal-scope.js
const DISABLED_PRINCIPAL_TYPES = /* @__PURE__ */ new Set([`anonymous`, `runtime`]);
const PRINCIPAL_SCOPE_TRACKER = Symbol.for(`eve.principalScopeTracker`);
async function trackPrincipalScope(e) {
	let t = { used: !1 };
	return {
		value: await withContextScopeValue(PRINCIPAL_SCOPE_TRACKER, t, e),
		used: t.used
	};
}
function principalScope(e) {
	let t = e.current;
	if (t === null || DISABLED_PRINCIPAL_TYPES.has(t.principalType)) return null;
	let n = contextScopeValue(PRINCIPAL_SCOPE_TRACKER);
	return n !== void 0 && (n.used = !0), t.principalType === `local-dev` ? `local-dev` : JSON.stringify([
		t.principalType,
		t.authenticator,
		t.issuer ?? null,
		t.principalId
	]);
}
export { CompactionOverLimitError, ConnectionAuthorizationFailedError, ConnectionAuthorizationRequiredError, NO_USAGE, addTokenUsage, aiSdkCapture, always, announcementDigest, applyTransition, approvalDecision, approvalOpened, awaitedProviderToolCallIds, awaitsProviderToolResult, changeHistory, commitOf, commitTransitions, committedMessages, compactMessages, createGatewayTraceContextHeaders, decideFor, dropClosedRecords, ensureAiSdkWarningLogger, ensureOtelIntegration, estimateRatio, estimateTokens, evaluateApproval, extractGatewayCostUsd, extractTokenUsageDelta, forwardedFrom, forwardedShareId, gatewayModelId, getInputTokenCount, getRegisteredTelemetryIntegrations, holdCallerIdentity, holdsHitlRequests, inheritApprovalContext, interactionOpened, interactionSettled, isApprovalRecheck, isConnectionAuthorizationFailedError, isConnectionAuthorizationRequiredError, isSteeredApprovalPolicy, joinCommits, lateTaskSpend, localGatewayModel, markSteeredApprovalPolicy, markUsageReported, normalizeApprovalStatus, normalizeProviderToolHistory, principalScope, readHitlState, recordLateSpend, recordModelUsage, rememberDecision, requestRun, requesterOnlyResponse, resolveActiveAuthorizationChallenges, resolveApprovalPolicy, resolveInstrumentationTraceDecision, resolveTraceRootSessionId, responseAdmitted, responseSettled, responseSubmitted, retryRun, sameRelayedSignIn, sameResponder, saveTransition, scopeApprovalEvaluation, sessionUsage, sessionView, settleRun, shouldCompact, signInAttemptKey, signInInteractionId, signInOpened, startRun, steeredModelCall, supersededChallenges, takeSessionUsageDelta, taskSpend, terminalSignInFailure, trackPrincipalScope, transition, turnSteeredMessage, unchangedBy, usageSince, waitingSignIn, withModelCall, withModelPromptMeasurement, withModelUsage, withPromptMeasurement, withSignIns, withUsageCall, withUsageInEffect, withUsageSink };

//# sourceMappingURL=eve11.mjs.map