import { always, inheritApprovalContext, isApprovalRecheck, principalScope, requesterOnlyResponse, resolveApprovalPolicy, scopeApprovalEvaluation, steeredModelCall, turnSteeredMessage } from "./eve11.mjs";
import { AuthKey, ChannelInstrumentationKey, ContextKey, ContinuationTokenKey, InitiatorAuthKey, SessionIdKey, SteeredByKey, loadContext } from "./eve13.mjs";
import { ScheduleDispatcher, createScheduleCollectionPayload, namedScopeDefinition, normalizeScheduleCollectionDefinition, projectScheduleRecord, readScheduleCollectionSource, requireCompiledBundle, scheduleDisplayName, validateSchedulePayload, validateScheduleTimezone } from "./eve21.mjs";
import { scheduleCollectionToolPrefix } from "./eve17.mjs";
import { normalizeInstrumentationChannelKind, readSessionSchedule } from "./eve16.mjs";
import { installedDurableHost } from "./eve31.mjs";
import { defineTool } from "./eve32.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/schedules/validation.js
const SCHEDULE_IDENTIFIER = /^[0-9A-Za-z][0-9A-Za-z._-]{0,255}$/u;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::00)?$/u;
function validateScheduleName(e) {
	let t = e.trim();
	if (!SCHEDULE_IDENTIFIER.test(t)) throw Error(`Schedule name must be 1–256 characters, start with an ASCII letter or digit, and contain only letters, digits, '.', '_', and '-'.`);
	return t;
}
function resolveScheduleTiming(e, t = Date.now()) {
	if (e.type !== `delay`) return validateScheduleExpression(e);
	if (!Number.isSafeInteger(e.minutes) || e.minutes < 1 || e.minutes > 525600) throw Error(`Schedule delay must be a whole number from 1 through 525600 minutes.`);
	if (Object.keys(e).some((e) => e !== `type` && e !== `minutes`)) throw Error(`Relative schedule delays accept only type and minutes; no timezone is needed.`);
	return {
		type: `single`,
		at: (/* @__PURE__ */ new Date(Math.ceil((t + e.minutes * 6e4) / 6e4) * 6e4)).toISOString().slice(0, 16),
		timezone: `UTC`
	};
}
function validateScheduleExpression(e) {
	if (e.type === `cron`) {
		let t = e.cron.trim().replace(/\s+/gu, ` `);
		if (t.split(` `).length !== 5) throw Error(`Schedule cron expressions must contain exactly five fields.`);
		let n = {
			type: `cron`,
			cron: t
		};
		if (e.timezone !== void 0 && (n.timezone = validateScheduleTimezone(e.timezone)), e.jitter !== void 0) {
			if (!Number.isSafeInteger(e.jitter) || e.jitter < 1 || e.jitter > 15) throw Error(`Schedule jitter must be an integer from 1 through 15 minutes.`);
			n.jitter = e.jitter;
		}
		return n;
	}
	if (!LOCAL_DATE_TIME.test(e.at)) throw Error(`One-time schedules require a minute-precision local datetime in "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:00" format without an offset or fractional seconds.`);
	let t = {
		type: `single`,
		at: e.at
	};
	return e.timezone !== void 0 && (t.timezone = validateScheduleTimezone(e.timezone)), t;
}
function validateScheduleListLimit(e) {
	if (e !== void 0) {
		if (!Number.isSafeInteger(e) || e < 1 || e > 100) throw Error(`Schedule list limit must be an integer from 1 through 100.`);
		return e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/schedules/dispatch-occurrence.js
async function dispatchScheduledOccurrence(e) {
	let t = {
		...e.occurrence,
		displayName: scheduleDisplayName(e.occurrence.name)
	};
	let { provider: n } = e.definition;
	let providerContext = () => createScheduleProviderContext({
		abortSignal: new AbortController().signal,
		application: e.payload.eve.application,
		bundle: () => e.bundle,
		collection: e.collection,
		runtime: () => e.runtime,
		definition: e.definition,
		namespace: e.namespace,
		operationId: randomUUID(),
		scope: e.payload.envelope.scope
	});
	let r = await new ScheduleDispatcher({
		runtime: e.runtime,
		channels: e.bundle.graph.root.channels
	}).triggerCollection({
		collectionId: e.collection,
		definition: e.definition,
		occurrence: t,
		payload: e.payload,
		schedule: {
			async disable() {
				await n.disable(providerContext(), t.name);
			},
			async delete() {
				await n.delete(providerContext(), t.name);
			}
		},
		verifyDelivery: e.verifyDelivery
	});
	await e.definition.events?.[`occurrence.dispatched`]?.({
		collection: e.collection,
		executionId: e.occurrence.executionId,
		name: t.name,
		occurrence: t,
		scheduledAt: e.occurrence.scheduledAt,
		scheduleId: e.occurrence.scheduleId,
		sessionIds: r.sessions.map((e) => e.sessionId),
		schedule: e.payload.envelope,
		type: `occurrence.dispatched`
	});
}
function createScheduleProviderContext(e) {
	return {
		abortSignal: e.abortSignal,
		collection: e.collection,
		namespace: e.namespace ?? deriveScheduleNamespace(e.application, e.collection, e.scope),
		operationId: e.operationId,
		target: {
			key: e.application,
			deliver: async ({ payload: t, occurrence: n }) => {
				await dispatchScheduledOccurrence({
					bundle: e.bundle(),
					collection: e.collection,
					runtime: e.runtime(),
					definition: e.definition,
					occurrence: {
						...n,
						collection: e.collection
					},
					payload: t
				});
			}
		}
	};
}
function deriveScheduleNamespace(e, t, n) {
	if (e.trim().length === 0) throw Error(`Schedule application must not be empty.`);
	return `eve-${createHash(`sha256`).update(JSON.stringify([
		`eve-schedule-namespace-v2`,
		e,
		t,
		n
	])).digest(`base64url`)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/schedules/scope.js
function byPrincipal(e) {
	return principalScope(e.session.auth);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/schedules/collection-client.js
function noScheduledRuns() {
	throw Error(`This host keeps no scheduled runs: run a schedule's occurrence from a deployed agent.`);
}
const NO_SCHEDULED_RUNS = {
	createSession: async () => noScheduledRuns(),
	dispatchContinuation: async () => noScheduledRuns(),
	dispatchSession: async () => noScheduledRuns(),
	getEventStream: async () => noScheduledRuns(),
	getLineStream: async () => noScheduledRuns(),
	getStreamTailIndex: async () => noScheduledRuns(),
	resolveContinuation: async () => noScheduledRuns()
};
function createScheduleCollectionClient(e, t) {
	let n = t.operationId ?? randomUUID;
	let contextFor = (e, n) => {
		let r = {
			...t,
			operation: e
		};
		return n !== void 0 && (r.name = n), r;
	};
	let resolveNamespace = async (r, i) => {
		if (steeredModelCall()) throw Error(turnSteeredMessage(`dynamic schedules`));
		let a = contextFor(r, i);
		let o = e.scope === void 0 ? byPrincipal(a) : await e.scope({
			...a,
			operation: r
		});
		if (o === null) throw Error(`Schedule ${r} is not available in this context.`);
		return validateScope(o), {
			scope: o,
			provider: createScheduleProviderContext({
				abortSignal: t.abortSignal,
				application: t.application,
				bundle: () => requireCompiledBundle(loadContext()),
				collection: t.collection,
				runtime: () => installedDurableHost()?.createRuntime({ compiledArtifactsSource: requireCompiledBundle(loadContext()).compiledArtifactsSource }) ?? NO_SCHEDULED_RUNS,
				definition: e,
				operationId: n(),
				scope: o
			})
		};
	};
	let prepareEnvelope = async (n, r, i, a, o) => {
		let s = principalReference(t.session.auth.current);
		if (s === null) throw Error(`Writing a schedule payload requires an authenticated principal.`);
		let c = await validateSchedulePayload(e.inputSchema, n);
		let l = e.preparePayload === void 0 ? c : await e.preparePayload(c, {
			...contextFor(i, a),
			operation: i,
			name: a,
			expression: o
		});
		return createScheduleCollectionPayload({
			application: t.application,
			collection: t.collection,
			envelope: {
				version: 3,
				payload: l,
				scope: r,
				principal: s
			}
		}).envelope;
	};
	let validateTiming = async (t) => {
		let n = resolveScheduleTiming(t);
		await e.provider.validateExpression?.(n);
	};
	let prepareUpdate = async (t, n) => {
		let r = Object.keys(n).filter((e) => e !== `expression` && e !== `payload`);
		if (r.length > 0) throw Error(`Schedule update does not support: ${r.join(`, `)}.`);
		if (n.expression === void 0 && n.payload === void 0) throw Error(`Schedule update requires an expression or replacement payload.`);
		let i = validateScheduleName(t);
		n.expression !== void 0 && await validateTiming(n.expression);
		let { scope: a, provider: o } = await resolveNamespace(`update`, i);
		let s = await e.provider.get(o, i);
		if (s === null) throw Error(`Schedule was not found in the authorized scope.`);
		return {
			prepared: snapshotPreparedWrite({
				name: i,
				namespace: o.namespace,
				expression: n.expression,
				envelope: n.payload === void 0 ? void 0 : await prepareEnvelope(n.payload, a, `update`, i, n.expression ?? s.expression)
			}),
			provider: o
		};
	};
	let prepareCreation = async (e) => {
		let t = validateScheduleName(e.name);
		await validateTiming(e.expression);
		let { scope: n, provider: r } = await resolveNamespace(`create`, t);
		return {
			prepared: snapshotPreparedWrite({
				displayName: t,
				expression: e.expression,
				envelope: await prepareEnvelope(e.payload, n, `create`, t, e.expression)
			}),
			provider: r
		};
	};
	return {
		async prepareCreate(e) {
			return (await prepareCreation(e)).prepared;
		},
		async create(n, r) {
			let { prepared: i, provider: a } = await prepareCreation(n);
			if (r !== void 0 && !isDeepStrictEqual(i, r)) throw Error(`Schedule creation changed after approval. Request a new creation approval; no schedule was written.`);
			let o = `${i.displayName.slice(0, 218)}--${randomUUID()}`;
			let s = resolveScheduleTiming(n.expression);
			let c = createScheduleCollectionPayload({
				application: t.application,
				collection: t.collection,
				envelope: i.envelope
			});
			return projectScheduleRecord(await e.provider.create(a, {
				expression: s,
				name: o,
				payload: c
			}));
		},
		async prepareUpdate(e, t) {
			return (await prepareUpdate(e, t)).prepared;
		},
		async update(n, r, i) {
			let { prepared: a, provider: o } = await prepareUpdate(n, r);
			if (i !== void 0 && !isDeepStrictEqual(a, i)) throw Error(`Schedule update changed after approval. Request a new update approval; no schedule was written.`);
			let s = {
				expression: a.expression === void 0 ? void 0 : resolveScheduleTiming(a.expression),
				payload: a.envelope === void 0 ? void 0 : createScheduleCollectionPayload({
					application: t.application,
					collection: t.collection,
					envelope: a.envelope
				})
			};
			return projectScheduleRecord(await e.provider.update(o, a.name, s));
		},
		async delete(t) {
			let n = validateScheduleName(t);
			let { provider: r } = await resolveNamespace(`delete`, n);
			return await e.provider.delete(r, n);
		},
		async disable(t) {
			let n = validateScheduleName(t);
			let { provider: r } = await resolveNamespace(`disable`, n);
			return projectScheduleRecord(await e.provider.disable(r, n));
		},
		async enable(t) {
			let n = validateScheduleName(t);
			let { provider: r } = await resolveNamespace(`enable`, n);
			return projectScheduleRecord(await e.provider.enable(r, n));
		},
		async get(t) {
			let n = validateScheduleName(t);
			let { provider: r } = await resolveNamespace(`get`, n);
			let i = await e.provider.get(r, n);
			return i === null ? null : projectScheduleRecord(i);
		},
		async invoke(t) {
			let n = validateScheduleName(t);
			let { provider: r } = await resolveNamespace(`invoke`, n);
			await e.provider.invoke(r, n);
		},
		async list(t = {}) {
			let n = validateScheduleListLimit(t.limit);
			let { provider: r } = await resolveNamespace(`list`);
			let i = {};
			t.cursor?.trim() && (i.cursor = t.cursor.trim()), n !== void 0 && (i.limit = n);
			let a = await e.provider.list(r, i);
			return {
				...a,
				data: a.data.map(projectScheduleRecord)
			};
		}
	};
}
function snapshotPreparedWrite(e) {
	let t = JSON.stringify(e);
	if (Buffer.byteLength(t) > 65536) throw Error(`Prepared schedule write exceeds the 64 KB limit, including timing and payload.`);
	return JSON.parse(t);
}
function principalReference(e) {
	if (e === null || e.principalType === `anonymous` || e.principalType === `runtime`) return null;
	let t = {
		type: e.principalType,
		authenticator: e.authenticator,
		principalId: e.principalId
	};
	return e.issuer !== void 0 && (t.issuer = e.issuer), e.subject !== void 0 && (t.subject = e.subject), t;
}
function validateScope(e) {
	let t = typeof e == `string` ? [e] : e;
	if (t.length === 0 || t.some((e) => typeof e != `string` || e.trim().length === 0)) throw Error(`Schedule scope must be a non-empty string or tuple of non-empty strings.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/experimental/schedules/client.js
async function schedules(e, t = {}) {
	if (e.scopes === void 0) {
		if (t.scope !== void 0) throw Error(`schedules(): this definition declares no "scopes", so it takes no scope "${t.scope}".`);
		return await bindScheduleCollection(e);
	}
	if (t.scope === void 0) throw Error(`schedules(): this definition declares scopes; pass one as { scope }: ${Object.keys(e.scopes).join(`, `)}.`);
	return await bindScheduleCollection(namedScopeDefinition(e, t.scope));
}
async function bindScheduleCollection(e) {
	let t = readScheduleCollectionSource(e);
	if (t === void 0) throw Error(`schedules(): argument must be a defineDynamicSchedules() definition exported from a module in agent/schedules/.`);
	let n = normalizeScheduleCollectionDefinition(e, `Invalid dynamic schedules definition ${t.logicalPath}.`);
	let r = loadContext();
	let i = r.get(SteeredByKey);
	return createScheduleCollectionClient(n, {
		abortSignal: new AbortController().signal,
		session: {
			id: r.get(SessionIdKey) ?? ``,
			schedule: readSessionSchedule(r),
			auth: {
				current: r.get(AuthKey) ?? null,
				initiator: r.get(InitiatorAuthKey) ?? null,
				...i !== void 0 && i.length > 0 && { steeredBy: i }
			}
		},
		channel: {
			kind: normalizeInstrumentationChannelKind(r.get(ChannelInstrumentationKey)?.kind),
			continuationToken: r.get(ContinuationTokenKey),
			metadata: r.get(ChannelInstrumentationKey)?.metadata ?? {}
		},
		application: t.application,
		collection: t.collection
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/schedule-collection-tools.js
const PreparedWritesKey = new ContextKey(`eve.schedulePreparedWrites`);
const nameSchema = z.string().min(1).max(256).regex(/^[0-9A-Za-z][0-9A-Za-z._-]*$/).describe(`Readable display label; it may repeat. Creation returns a unique management name.`);
const nameInput = z.object({ name: z.string().min(1).max(256).describe(`Exact unique management name returned by create/get/list, not the display label.`) }).strict();
const timezoneSchema = z.string().describe(`IANA timezone; omission means UTC. Delays need no timezone.`);
const expressionSchema = z.discriminatedUnion(`type`, [
	z.object({
		type: z.literal(`cron`),
		cron: z.string().describe(`Five-field cron: minute hour day-of-month month day-of-week.`),
		timezone: timezoneSchema.optional(),
		jitter: z.number().int().min(1).max(15).optional()
	}).strict(),
	z.object({
		type: z.literal(`single`),
		at: z.string().describe(`Local YYYY-MM-DDTHH:mm, without offset or fractions.`),
		timezone: timezoneSchema.optional()
	}).strict(),
	z.object({
		type: z.literal(`delay`),
		minutes: z.number().int().min(1).max(525600)
	}).strict()
]);
const timingGuidance = `For relative requests use expression { type: 'delay', minutes: 1 }; eve resolves timing after approval and rounds up to minute precision (up to 59 seconds later). Do not guess the clock or ask for a timezone for delays.`;
function scheduleCollectionTools(e, t) {
	return e.tool === !1 ? null : scheduleTools([{
		definition: e,
		collection: t
	}], scheduleCollectionToolPrefix(t));
}
function scheduleScopesTools(e, t) {
	if (e.length === 0) throw Error(`Schedule tools "${t}" have no scopes.`);
	return scheduleTools(e, t);
}
function scheduleTools(e, t) {
	let n = e[0];
	let r = n.scope !== void 0;
	let memberOf = (t) => {
		if (!r) return n;
		let i = t?.scope;
		let a = e.find((e) => e.scope === i);
		if (a === void 0) throw Error(`Schedule scope must be one of: ${e.map((e) => e.scope).join(`, `)}.`);
		return a;
	};
	let withoutScope = (e) => {
		let { scope: t, ...n } = e;
		return n;
	};
	let bind = (e) => bindScheduleCollection(e.definition);
	let client = (e) => schedules(e.definition);
	let i = r ? { scope: z.enum(e.map((e) => e.scope)).describe(`Which schedules the call acts on. ${e.map((e) => e.description === void 0 ? `"${e.scope}"` : `"${e.scope}": ${e.description}`).join(` `)}`) } : {};
	let a = `${t}__`;
	let keyFor = (e, t) => `${a}${e}:${t}`;
	let o = z.object({
		...i,
		name: nameSchema,
		expression: expressionSchema,
		payload: n.definition.inputSchema
	}).strict();
	let s = o.partial({
		expression: !0,
		payload: !0
	}).extend({ name: nameInput.shape.name }).refine((e) => e.expression !== void 0 || e.payload !== void 0, { message: `Schedule update requires an expression or replacement payload.` });
	let c = z.object({
		...i,
		name: nameInput.shape.name
	}).strict();
	let memberPolicy = (e, t, n) => {
		let i = memberOf(t);
		return {
			context: r ? scopeApprovalEvaluation(e, i.scope) : e,
			policy: n(i)
		};
	};
	let operationApproval = (t, i) => {
		let policyOf = (e) => e.definition.approval?.[t] ?? i;
		if (!r) return policyOf(n);
		if (e.every((e) => policyOf(e) === void 0)) return;
		let a = { request: async (e) => {
			let t = memberPolicy(e, e.toolInput, policyOf);
			return t.policy === void 0 ? `not-applicable` : await resolveApprovalPolicy(t.policy)(t.context);
		} };
		return e.some((e) => {
			let t = policyOf(e);
			return typeof t == `object` && t.response !== void 0;
		}) && (a.response = async (e) => {
			let t = policyOf(memberOf(e.request.toolInput));
			return typeof t == `object` && t.response !== void 0 ? await t.response(e) : requesterOnlyResponse(e);
		}), a;
	};
	let gatesResponses = (t) => e.some((e) => {
		let n = e.definition.approval?.[t];
		return typeof n == `object` && n.response !== void 0;
	});
	let l = writeApproval((e) => memberOf(e).definition.approval?.create ?? always(), gatesResponses(`create`), (e, t) => memberPolicy(e, t, () => void 0).context, (e) => keyFor(`create`, e), async (e) => {
		let t = await o.parseAsync(e);
		return (await bind(memberOf(t))).prepareCreate(withoutScope(t));
	}, (e) => e.envelope.payload);
	let u = writeApproval((e) => memberOf(e).definition.approval?.update ?? always(), gatesResponses(`update`), (e, t) => memberPolicy(e, t, () => void 0).context, (e) => keyFor(`update`, e), async (e) => {
		let t = await s.parseAsync(e);
		let { name: n, expression: r, payload: i } = t;
		let a = await bind(memberOf(t));
		return r === void 0 ? a.prepareUpdate(n, { payload: i }) : a.prepareUpdate(n, {
			expression: r,
			payload: i
		});
	}, (e) => e.envelope?.payload);
	let define = (e, t, r, i, a) => {
		let o = n.definition.description;
		return defineTool({
			deferred: n.definition.tool === `deferred`,
			description: `${o ? `${o}\n\n` : ``}${t}`,
			inputSchema: r,
			approval: a,
			label: { start: (t) => t.name ? `${e}: ${scheduleDisplayName(t.name)}` : e },
			execute: i
		});
	};
	let takeApproved = (e) => ({
		approved: loadContext().get(PreparedWritesKey)?.[e],
		forget: () => {
			let t = { ...loadContext().get(PreparedWritesKey) };
			delete t[e], loadContext().set(PreparedWritesKey, t);
		}
	});
	return {
		[`${a}create`]: define(`Create schedule`, `Create future work, not an immediate action. The display name may repeat; use the returned unique name for management. ${timingGuidance} Preparation validates the destination before approval; a changed prepared payload requires fresh approval.`, o, async (e, t) => {
			let { approved: n, forget: r } = takeApproved(keyFor(`create`, t.callId));
			if (n === void 0 || !(`displayName` in n)) throw Error(`Schedule creation has no prepared approval snapshot. Request creation again.`);
			let i = await (await bind(memberOf(e))).create(withoutScope(e), n);
			return r(), i;
		}, l),
		[`${a}update`]: define(`Update schedule`, `Replace timing and/or the complete payload of an existing schedule. A payload replacement prepares new work and makes the updating caller its creator; timing-only updates preserve ownership. State and dispatch target are unchanged. Already started work is not cancelled. ${timingGuidance}`, s, async (e, t) => {
			let { approved: n, forget: r } = takeApproved(keyFor(`update`, t.callId));
			if (n === void 0 || !(`name` in n)) throw Error(`Schedule update has no prepared approval snapshot. Request update again.`);
			let { name: i, ...a } = withoutScope(e);
			let o = await (await bind(memberOf(e))).update(i, a, n);
			return r(), o;
		}, u),
		[`${a}get`]: define(`Read schedule`, `Read timing/state; stored payload is not returned.`, c, async (e) => await (await client(memberOf(e))).get(e.name), operationApproval(`get`)),
		[`${a}list`]: define(`List schedules`, `List identity, timing/state, and timestamps; payload is not returned.`, z.object({
			...i,
			cursor: z.string().optional(),
			limit: z.number().int().min(1).max(100).optional()
		}).strict(), async (e) => await (await client(memberOf(e))).list(withoutScope(e)), operationApproval(`list`)),
		[`${a}enable`]: define(`Enable schedule`, `Enable future occurrences.`, c, async (e) => await (await client(memberOf(e))).enable(e.name), operationApproval(`enable`, always())),
		[`${a}disable`]: define(`Disable schedule`, `Disable future occurrences; already started work is not cancelled.`, c, async (e) => await (await client(memberOf(e))).disable(e.name), operationApproval(`disable`, always())),
		[`${a}invoke`]: define(`Run schedule`, `Enqueue an extra occurrence as the stored creator; acceptance is not execution success.`, c, async (e) => (await (await client(memberOf(e))).invoke(e.name), { accepted: !0 }), operationApproval(`invoke`, always())),
		[`${a}delete`]: define(`Delete schedule`, `Delete a schedule; already started work is not cancelled.`, c, async (e) => ({ deleted: await (await client(memberOf(e))).delete(e.name) }), operationApproval(`delete`, always()))
	};
}
function writeApproval(e, t, n, r, i, a) {
	let o = { request: async (t) => {
		if ((t.session?.auth?.steeredBy ?? []).length > 0) return {
			type: `denied`,
			reason: turnSteeredMessage(`dynamic schedules`)
		};
		try {
			let o = await i(t.toolInput);
			let s = r(t.callId);
			let c = loadContext().get(PreparedWritesKey) ?? {};
			if (isApprovalRecheck(t)) {
				if (c[s] === void 0 || !isDeepStrictEqual(c[s], o)) return {
					type: `denied`,
					reason: `The prepared schedule changed or its approval expired. Request a new approval.`
				};
			} else {
				let e = {
					...Object.fromEntries(Object.entries(c).filter(([e]) => e !== s).slice(-31)),
					[s]: o
				};
				for (; Buffer.byteLength(JSON.stringify(e)) > 524288;) delete e[Object.keys(e)[0]];
				loadContext().set(PreparedWritesKey, e);
			}
			let l = a(o);
			let u = e(t.toolInput);
			let d = n(t, t.toolInput);
			let f = inheritApprovalContext(d, {
				...d,
				toolInput: {
					...t.toolInput,
					payload: l
				},
				payload: l
			});
			return typeof u == `function` ? await u(f) : await u.request(f);
		} catch (e) {
			return {
				type: `denied`,
				reason: e instanceof Error ? e.message : `Schedule preparation failed.`
			};
		}
	} };
	return t && (o.response = async (t) => {
		let n = e(t.request.toolInput);
		if (typeof n == `function` || n.response === void 0) return requesterOnlyResponse(t);
		let i = loadContext().get(PreparedWritesKey)?.[r(t.request.callId)];
		if (i === void 0) return {
			status: `rejected`,
			reason: `The prepared schedule approval expired. Request approval again.`
		};
		let o = a(i);
		return await n.response({
			...t,
			request: {
				...t.request,
				toolInput: {
					...t.request.toolInput,
					payload: o
				}
			},
			payload: o
		});
	}), o;
}
export { scheduleCollectionTools, scheduleScopesTools };

//# sourceMappingURL=eve30.mjs.map