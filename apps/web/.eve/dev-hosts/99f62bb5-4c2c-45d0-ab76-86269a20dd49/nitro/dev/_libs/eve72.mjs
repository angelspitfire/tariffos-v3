import { AUTHORED_BUNDLED_MODULE_EXTENSION, AUTHORED_MODULE_BUNDLE_DIRECTORY_PATH, buildWithRolldown, bundleAuthoredModuleMapForGeneration, collectRuntimeModuleBindingsForManifest, compiledModuleMapSchema, createAgentSourceRegistry, createAuthoredModuleBuildOptions, createAuthoredWorkflowDirectivePlugin, createRuntimeLoaderPackageBoundaryPlugin, defineProgrammaticAgentSource, evaluatedBundleSourcemap, loadAuthoredModuleNamespace, loadProgrammaticModuleNamespace, memoizeModuleNamespaceFactories, normalizeExternalDependencies, resolveAuthoredPackageRoot, resolveExtensionBindingMountId, workflowIdForHandling, writeAuthoredModuleCacheFile } from "./eve2.mjs";
import { resolveExpectedWorkflowVersion, resolveInstalledPackageInfo, resolvePackageSourceFilePath } from "./eve4.mjs";
import { createEveCallbackRoutePath, createEveSessionCancelRoutePath, createEveSessionResetRoutePath, createEveSessionRoutePath, createEveSessionStreamRoutePath, createEveSubagentStreamRoutePath } from "./eve6.mjs";
import { parseJsonObject, parseJsonValue } from "./eve8.mjs";
import { CompactionOverLimitError, NO_USAGE, addTokenUsage, aiSdkCapture, applyTransition, awaitedProviderToolCallIds, awaitsProviderToolResult, changeHistory, commitOf, commitTransitions, compactMessages, createGatewayTraceContextHeaders, decideFor, dropClosedRecords, ensureAiSdkWarningLogger, ensureOtelIntegration, estimateRatio, estimateTokens, extractGatewayCostUsd as extractGatewayCostUsd$1, extractTokenUsageDelta, forwardedShareId, gatewayModelId, getInputTokenCount, getRegisteredTelemetryIntegrations, holdsHitlRequests, isConnectionAuthorizationFailedError, joinCommits, lateTaskSpend, markUsageReported, normalizeProviderToolHistory, readHitlState, recordLateSpend as recordLateSpend$1, recordModelUsage, requestRun as requestRun$1, resolveInstrumentationTraceDecision, resolveTraceRootSessionId, retryRun, saveTransition, sessionUsage, sessionView, settleRun, shouldCompact, signInInteractionId, startRun as startRun$1, takeSessionUsageDelta, taskSpend, turnSteeredMessage, unchangedBy, usageSince, withModelPromptMeasurement, withModelUsage, withPromptMeasurement, withUsageSink } from "./eve11.mjs";
import { logicalSessionInboxToken, logicalSessionToken, sessionCommandHookToken, sessionInboxHookToken } from "./eve12.mjs";
import { AgentSessionRuntimeOverridesKey, AuthKey, CapabilitiesKey, ChannelDeliveryKey, ChannelInstrumentationKey, ChannelRequestIdKey, ContextContainer, ContextKey, ContinuationHookTokensKey, ContinuationTokenKey, ConversationIdKey, DeferCallerSteeredClearKey, DynamicSubagentAgentConfigKey, EarlierRemoteCallerKey, HandleEventKey, HistoryStateKey, InitiatorAuthKey, LocalDevRequestKey, OccurrenceIdKey, OtelTraceEnabledKey, ParentSessionKey, ParentTraceContextKey, SandboxKey, SandboxTerminalCleanupKey, ScheduleIdKey, ScheduleInstanceKey, SessionCallbackKey, SessionIdKey, SessionInboxKey, SessionKey, SessionPredecessorKey, SessionTitleKey, SessionTraceSeedKey, SteeredByKey, ToolChannelKey, ToolStubsKey, TraceRootKey, TurnDeliveryIdsKey, contextStorage, loadContext, resolveKey } from "./eve13.mjs";
import { isErrnoCode, isObject, isPlainRecord, isThenable } from "./eve14.mjs";
import { createErrorId, createLogger, formatError, logError, recordErrorOnSpan } from "./eve15.mjs";
import { ConversationContextKey, FACT_CATALOG, SessionNotActiveError, SessionStrandedError, actionIdempotencyKey, activeTurn, applyLiveDeliveryAudienceCeiling, askedCall, attemptIdempotencyKey, callAdapterEventHandler, callRun, channelDeliveryIdempotencyKey, copyView, decidingAnswer, decisionToTraceContentCeiling, defaultContentCapture, defaultDeliverResult, describeStrandedSession, deserializeUrlFilePart, displayProperName, emptySessionView, foldLine, foldReceivedEvent, formatTraceContentCeiling, getAdapterKind, getBlockingWorkflowToolRuns, getInstrumentationRuntime, hasInternalRefScheme, inputIdempotencyKey, instrumentationPrincipal, instrumentationScope, interactionOwner, intersectInstrumentationDecisions, isFactType, isInstrumentationChannelKind, isProgressType, isSampledTrace, isSerializedUrlFilePart, isTerminalType, isWorking, modelCallIdempotencyKey, normalizeChannelAudience, normalizeConversationSpace, normalizeInstrumentationChannelKind, openRequests, openSignIns, openWork, preserveSerializedAgentTraceState, preserveSerializedInstrumentationState, promptQueueHead, pruneAgentTraceState, readActionTraceContext, readAnswerText, readClientContext, readForwardedTraceAssertion, readInstrumentationDecision, readSerializedSessionSchedule, readSessionTraceDecision, readTurnTraceContext, registerWorkflowToolRun, removeBlockingWorkflowToolRuns, resolveConversationContext, resolveTracePolicy, resolveTracePolicyDecision, responderOf, rowOf, runTurn, sessionIdempotencyKey, shouldCaptureInstrumentationContent, structuralProviderMetadata, tasks, toolCallIdempotencyKey, traceContentCeilingToDecision, turnIdempotencyKey, turnScope, waiting } from "./eve16.mjs";
import { buildChannelContext, contextStarted, controlAdmitted, controlSettled, createAttachSessionFn, createChannelDeliveryMetadata, defined, deliveryApplied, errorInfoOf, fact, runRequested, runSettledFacts, runStarted, sessionEndedFacts, usageOf, validateDeliveryIdempotencyKey } from "./eve17.mjs";
import { anchorToTurn, coalesceTurnInputs, createFrameworkUserMessage, createImportedHistoryMessages, createUserMessage, followsToolResults, frameworkMessageKindForStepInput, isUserMessageKind, isUserModelMessage, normalizeMessage, normalizeModelMessages, readConversationId, resolveAssistantStepText, resolveConversationId, selectDeliveryPayloads, turnAnchorOf, userContentOf, validateHarnessModelMessages, writeConversationBaggage, writeForwardedAudienceBaggage, writeForwardedParentSessionBaggage } from "./eve18.mjs";
import { activeTurnId, activeTurnIdOf, checksSessionEvents, committedEndingStep, endingStepKeys, initialSessionProjection, isBetweenTurns, nextChangeId, nextRunId, ownOpenRequestIds, parkedCallsAnswered, queuedInput, runtimeWait, storedProjection, turnPosition } from "./eve19.mjs";
import { decodeSandboxRef, encodeSandboxRef, inlinesSandboxRefAsBytes, isSandboxRefUrl, verifyMediaType } from "./eve20.mjs";
import { ChannelKey, SessionAgentKey, compiledSessionAgent, createCrossChannelToFn, createDiskRuntimeCompiledArtifactsSource, findRegisteredRuntimeTool, formatCapabilityError, formatValidationError, getCompiledRuntimeAgentBundle, getResolvedRuntimeAgentNode, getRuntimeCompiledArtifactsSandboxAppRoot, isDefinedModel, isRuntimeLanguageModel, isSubagentAdapterState, loadCompiledManifest, loadCompiledSessionAgent, modelSignInName, owningSandboxDefinition, readBundledCompiledArtifacts, readInstrumentationSessionContext, relayedInteractionEvents, requireCompiledBundle, resolveDurableCompiledArtifactsSource, resolveRuntimeAgentGraph, resolveRuntimeCompilerArtifactPaths, toCrossChannelTargets } from "./eve21.mjs";
import { toError, toErrorMessage, walkCauseChain } from "./eve22.mjs";
import { UNSPECIFIED_INPUT_SCHEMA, defineJsonSchema, serializeInputSchema, toModelSchema } from "./eve23.mjs";
import { getSandboxEnvironmentRuntime, runWithSandboxConstructorRuntime } from "./eve25.mjs";
import { isFrameworkTool, isInteractionOnly } from "./eve26.mjs";
import { isEveDevEnvironment, isLocalDevelopmentServer, resolveInstrumentationEnvironment } from "./eve28.mjs";
import { NonRetryableError, cancelRoutedRun, durableRunEnded, installDurableHost, installedDurableHost, isHookNotFound, isRetriedStep, isRunInactive, isRunMissing, isRunTargetGone, resumeRoutedHook, resumeRoutedSessionInbox, routedRunEnded, routedRunLive, sessionLineStore, sessionSignInCallbacks, signInDelivery } from "./eve31.mjs";
import { CallbackBaseUrlKey, ConnectionRegistryImpl, ConnectionRegistryKey, DefinitionFailedError, DefinitionsStateKey, McpConnectionClient, NO_INLINE_CALLS, PendingAuthorizationResultKey, ResumeSignInKey, SessionStreamWriteError, ToolStubPlaybackKey, TurnCancelledError, admitHumanInput, agentLimits, agentSessionOwner, agentSettings, announcedKind, answerFromText, appendTaskContext, applyHumanDecisions, askStepApprovals, assertUniqueCoordinationCallIds, bindMemoryInstrumentation, blocked, buildToolSetWithProviderTools, callProgress, callsBackFor, cancel, cancelTask, channelOf, clear, clearedByAttempt, collectWorkflowCalls, compactInput, complete, connectionEventDestination, connectionEventHookToken, continueTurnAuth, controlDeliveryFor, controlled, createAuthorizationExecution, createInvalidToolCallInputError, createMemoryInstrumentation, createPreparedWorkflowToolHarnessDefinition, createPresentedRuntimeActionRequestFromToolCall, createRuntimeToolResultFromMessagePart, createRuntimeToolResultFromStepResult, createRuntimeToolResultFromToolError, createRuntimeToolResultFromValue, createToolExecuteWithAuth, createToolResultMessagePartFromToolError, createWorkflowCallbackUrl, createWorkflowToolHarnessDefinition, discardAttempt, endTask, enforceBudget, evaluateStepModel, evaluateStepValues, evictScopedToken, executeInlineCalls, fail, findTask, finishRun, finishTaskRun, forgetFinishedRuns, getInvalidToolCallInputError, handleAuthorizationError, hasQueuedTurnInput, hasWorkflowAdmission, historyCallNames, humanInputContext, installDefinitions, interruptedAttemptNote, isActiveTaskRun, isCancelledTaskRun, isDynamicModelSelectionError, isInvalidToolCall, isRunnableTool, isScopedAuthorizationRequiredError, isTaskAvailable, isToolResultError, isTurnCancellation, isWorkflowTool, join as join$1, latestTurn, liveRuns, loadAgentRoster, markTaskRunStarted, matchSignIns, normalizeAgentMessage, normalizeDynamicRemoteAgent, openDeferredApprovals, openMemos, ownCallbacks, park, principalKey, principalOf as principalOf$1, projectToolLabel, queueInput, readDynamicSubagentSelections, readHttpStatus, readTaskTable, receive, recordTaskCall, recordTaskRun, recordTaskRunUsage, relay, relayedMirror, removeTask, renderFinalOutputWhileWorkingError, renderTaskReceipt, renderTaskSentReceipt, renderTooManyTasksError, renderUnknownTaskError, requestCall, requestProviderCalls, resolveConnectionPrincipalFromAuth, resolveFrameworkToolFromUpstreamType, resolveInlineAuthorizationInterrupt, resolveProviderToolCallRequest, resolveRuntimeModelReference, resolveTurnPrincipal, resolveWorkflowCallbackBaseUrl, restoreDefinitions, routeAnswer, runEffects, runtimeNodeId, runtimeResultCalls, settle, settleCall, settleHumanInput, settleRemainingTaskCalls, settleSignIns, settleTask, settleTaskCalls, signInsAnswered, signInsEnded, startDispatchedCalls, startTask, steeredByAfter, stepCatalog, stepDraft, stepMessages, stepModel, stepSystem, stopForSignIn, stopInterruptedSteps, stubToolPath, supportsInteractiveAuthorization, suspendStep, takeBlockingFailure, takeDeferredMessage, takeTaskResults, takeTurnFailure, throwIfSessionStreamDead, throwIfTurnAborted, toEntryStep, toEntryStream, toJsonValue, toolModelOutputContext, turnInputOnly, withResult, withoutTurnInput as withoutTurnInput$1, workingTaskIds, writeTaskTable } from "./eve33.mjs";
import { joinEveRoutePath } from "./eve35.mjs";
import { advance, appliedSession, buildCallbackContext, cascade, createEventReader, createStreamChecker, currentProjection, currentView, enterSessionProjection, enterSessionProjectionAt, enteredView, eventsOf, eventsOfLine, linesOf, nextLinePosition, projectionFor, recordAppliedSession, recordPublishedLine, saveProjection, saveSessionProjection, snapshotOf, stepProjection, supersede, withRuntimeSandboxLifecycle } from "./eve36.mjs";
import { isAgentTraceContext, sessionAgent, withConnectionEventSpan } from "./eve38.mjs";
import { formatTraceparent, writeAgentDispatchTracestate } from "./eve39.mjs";
import { resolveWebSearchActivityLabel } from "./eve41.mjs";
import { resolveSandboxModelPath } from "./eve46.mjs";
import { AcceptedSessionIdentityError, StrandedSessionOwnerError, agentDelegation, assertRunnableSessionInbox, assertRunnableSessionOwner, buildSessionAttributes, buildSubagentRootAttributes, callToolStubStep, callbackUrlForProtocol, coalesceDeliverPayloads, createStubValidator, createV26HistoryReader, deriveSessionTitle, encodeLineBytes, failStubSessionStep, findRetiredOwnerRun, findSessionHookHolder, formatRemoteAgentProtocolMismatch, isOwnerDeploymentDeletedError, isRemoteReplyHookToken, isStoredLine, isV26Line, parseSessionCallback, principalIdentity, protocolTwoAnswersSettledOnForward, publishStubFailureStep, publishStubResultStep, readParentLineage, readRemoteAgentProtocolVersion, remoteReplyHookToken, reportStubFailureStep, requireSessionId, resolveRunEncryptionKey, resolveSessionInbox, resumeSessionInbox, resumeSessionStartHook, resumeSignInCallback, routesToOwnerDeployment, runtime_exports, servesRemoteAgentCaller, setWorld, validateToolStubTargets } from "./eve50.mjs";
import { DEFAULT_UPLOAD_POLICY, createBackgroundWork, getKnownByteLength, isMediaTypeAllowed, isUnresolvedFileData, readFileData } from "./eve53.mjs";
import { connectionEventDeliveryWorkflowReference, connectionEventWorkflowReference, sessionTimeoutWorkflowReference, workflowEntryReference, workflowToolRunWorkflowReference } from "./eve55.mjs";
import { SandboxSessionGoneError, SandboxTemplateNotProvisionedError, ToolSessionSandboxUnsupportedError, appendPackageUserAgent, clearSandboxRunning, copyDirectoryAtomically, createConnectionSession, createSandboxProviderIdentity, isRetiredSandboxSessionState, markSandboxRunning, recordedSandboxStopsIdle, resolvePersistedSandboxSessionState, resolveRecordedSandboxProvider, resolveSandboxCacheDirectory, sandboxConnectionDisposal } from "./eve59.mjs";
import { shellQuote } from "./eve60.mjs";
import { truncateTail } from "./eve63.mjs";
import { readMediaMetadata } from "./eve68.mjs";
import { UnsafeDestinationError, assertPublicHostname, createPublicDispatcher, fetchWithDispatcher, findUnsafeDestinationError, readBoundedResponse, requestPublicUrl } from "./eve71.mjs";
import { createRequire } from "node:module";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
import { basename, dirname, extname, join, posix, relative, resolve, sep } from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { mkdir, readFile, readdir, realpath, rename, rm, stat, unlink, utimes, writeFile } from "node:fs/promises";
import { setTimeout as setTimeout$1 } from "node:timers/promises";
import { isDeepStrictEqual } from "node:util";
import { AsyncLocalStorage } from "node:async_hooks";
import { context, trace } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@opentelemetry/api/index.js";
import { AgentSpanIdGenerator } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/index.js";
import { withCapture } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/otel.js";
import { ToolLoopAgent, gateway, isStepCount, streamText, wrapLanguageModel } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js";
import { registerStepFunction } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/private.js";
import { createHook, getStepMetadata, getWorkflowMetadata, getWritable } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/index.js";
import { EntityConflictError, HookConflictError, HookNotFoundError, RunExpiredError, WorkflowRunNotFoundError } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/errors/index.js";
import { modelContent, modelUsage } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@vercel/agent-runs/ai-sdk.js";
import { freeze, isDraftable, produce } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/immer/index.js";
import { hydrateWorkflowArguments } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/serialization.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/ndjson-stream.js
function parseNdjsonStream(e, t = (e) => e) {
	let n = new TextDecoder();
	let r = ``;
	let i;
	let a = !1;
	return new ReadableStream({
		start() {
			i = e().getReader();
		},
		async pull(e) {
			try {
				for (;;) {
					let { value: o, done: s } = await i.read();
					if (a) return;
					if (s) {
						r += n.decode();
						let i = r.trim();
						i.length > 0 && e.enqueue(t(JSON.parse(i))), e.close();
						return;
					}
					r += n.decode(o, { stream: !0 });
					let c = !1;
					for (let n = r.indexOf(`
`); n !== -1; n = r.indexOf(`
`)) {
						let i = r.slice(0, n).trim();
						r = r.slice(n + 1), i.length > 0 && (e.enqueue(t(JSON.parse(i))), c = !0);
					}
					if (c) return;
				}
			} catch (t) {
				if (a) return;
				e.error(t), await i.cancel(t).catch(() => {});
			}
		},
		async cancel(e) {
			a = !0, await i?.cancel(e);
		}
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-event-stream.js
function readSessionRecords(e, t) {
	return parseNdjsonStream(() => sessionLineStore(e).readable(e, t));
}
function readSessionEventStream(e, t, n) {
	let r = new AbortController();
	let i = streamSessionLines(e, {
		startIndex: t,
		signal: n === void 0 ? r.signal : AbortSignal.any([n, r.signal])
	});
	let a = createEventReader();
	return new ReadableStream({
		async pull(e) {
			for (;;) {
				let t = await i.next();
				if (t.done === !0) {
					e.close();
					return;
				}
				let { line: n, position: r } = t.value;
				if (n === void 0) continue;
				let o = a.read(n, r);
				if (o.length !== 0) {
					for (let t of o) e.enqueue(t);
					return;
				}
			}
		},
		async cancel() {
			r.abort(), await i.return(void 0);
		}
	});
}
function readSessionEventHistory(e, t, n) {
	let r = streamSessionEvents(e, {
		follow: !1,
		startIndex: t,
		signal: n
	});
	return new ReadableStream({
		async pull(e) {
			let t = await r.next();
			t.done ? e.close() : e.enqueue(t.value);
		},
		async cancel() {
			await r.return(void 0);
		}
	});
}
function readSessionRecordHistory(e, t) {
	let n;
	let r = 0;
	let i = -1;
	return new ReadableStream({
		async start() {
			i = await readSessionStreamTailIndex(e);
			let a = t ?? 0;
			r = a < 0 ? Math.max(0, i + 1 + a) : a, r <= i && (n = readSessionRecords(e, r).getReader());
		},
		async pull(e) {
			if (n === void 0 || r > i) {
				e.close(), await n?.cancel().catch(() => {});
				return;
			}
			let { done: t, value: a } = await n.read();
			t ? e.close() : (e.enqueue(a), r += 1);
		},
		async cancel() {
			await n?.cancel().catch(() => {});
		}
	});
}
async function readSessionStreamTailIndex(e) {
	return await sessionLineStore(e).tail(e);
}
async function assertSessionHistoryReadable(e) {
	await sessionLineStore(e).assertReadable(e);
}
async function* streamSessionLines(e, t = {}) {
	let { follow: n = !0, signal: r } = t;
	let i = t.startIndex ?? 0;
	if (r?.aborted) return;
	let a;
	let o = i;
	if ((!n || i < 0) && (a = await readSessionStreamTailIndex(e), i < 0 && (o = Math.max(0, a + 1 + i))), !n && a !== void 0 && o > a) return;
	let s = readSessionRecords(e, o).getReader();
	let cancel = () => void s.cancel(r?.reason).catch(() => {});
	r?.addEventListener(`abort`, cancel, { once: !0 });
	try {
		let e = o;
		for (; !r?.aborted;) {
			let { done: t, value: r } = await s.read();
			if (t || (yield {
				line: isStoredLine(r) ? r : void 0,
				position: e,
				record: r
			}, !n && a !== void 0 && e >= a)) return;
			e += 1;
		}
	} finally {
		r?.removeEventListener(`abort`, cancel), await s.cancel().catch(() => {}), s.releaseLock();
	}
}
async function* streamSessionEvents(e, t = {}) {
	let n = createEventReader();
	let r;
	for await (let { line: i, position: a, record: o } of streamSessionLines(e, t)) {
		r === void 0 && isV26Line(o) && (r = createV26HistoryReader(), a > 0 && await readV26Prefix(r, e, a, t.signal));
		let s = r === void 0 ? i : r.read(o, a);
		s !== void 0 && (yield* n.read(s, a));
	}
}
async function readV26Prefix(e, t, n, r) {
	for await (let { position: i, record: a } of streamSessionLines(t, {
		follow: !1,
		signal: r,
		startIndex: 0
	})) {
		if (i >= n) return;
		e.read(a, i);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/user-parts.js
function userPartsOf(e) {
	if (typeof e == `string`) return [{
		kind: `text`,
		text: e
	}];
	let t = [];
	for (let n of e) t.push(n.type === `text` ? {
		kind: `text`,
		text: n.text
	} : filePart(n.data, n.mediaType, n.filename));
	return t;
}
function filePart(e, t, n) {
	if (isSandboxRefUrl(e)) {
		let t = decodeSandboxRef(e);
		return file({
			filename: basenameOf(n ?? t.path),
			mediaType: t.mediaType,
			size: t.size
		});
	}
	if (isTaggedFileData(e)) switch (e.type) {
		case `data`: return file({
			filename: n,
			mediaType: t,
			size: byteLengthOf(e.data)
		});
		case `reference`:
		case `text`: return file({
			filename: n,
			mediaType: t
		});
		case `url`: return file({
			filename: n,
			mediaType: t,
			url: clientUrl(e.url)
		});
	}
	let r = byteLengthOf(e);
	return file(r === void 0 ? {
		filename: n,
		mediaType: t,
		url: clientUrl(e)
	} : {
		filename: n,
		mediaType: t,
		size: r
	});
}
function file(e) {
	let t = {
		kind: `file`,
		mediaType: e.mediaType
	};
	return e.filename !== void 0 && (t.filename = e.filename), e.size !== void 0 && (t.size = e.size), e.url === void 0 ? t.unavailable = !0 : t.url = e.url, t;
}
function isTaggedFileData(e) {
	if (typeof e != `object` || !e) return !1;
	let t = e.type;
	return t === `data` || t === `reference` || t === `text` || t === `url`;
}
function byteLengthOf(e) {
	return getKnownByteLength(e) ?? void 0;
}
function clientUrl(e) {
	if (isSerializedUrlFilePart(e)) try {
		return httpUrl(deserializeUrlFilePart(e));
	} catch {
		return;
	}
	if (e instanceof URL) return httpUrl(e);
	if (!(typeof e != `string` || hasInternalRefScheme(e) || e.startsWith(`data:`))) try {
		return httpUrl(new URL(e));
	} catch {
		return;
	}
}
function httpUrl(e) {
	return e.protocol === `http:` || e.protocol === `https:` ? e.href : void 0;
}
function basenameOf(e) {
	let t = e.replaceAll(`\\`, `/`);
	let n = t.slice(t.lastIndexOf(`/`) + 1);
	return n.length > 0 ? n : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/delivery-facts.js
function planAdmission(e) {
	let { delivery: t } = e;
	let n = [];
	let r = [];
	let i = principalOf(t.auth);
	for (let { input: a, payload: o } of e.payloads) {
		let s = t.payloads.indexOf(o);
		let c = t.deliveryMetadata?.find((e) => e.payloadIndex === s);
		if (c === void 0) throw Error(`Session delivery has no identity. Assign delivery metadata at dispatch before admission.`);
		let l = c.deliveryId;
		let u = defined({
			channel: c.channelKind ?? e.channelKind,
			hook: c.hook,
			scheduleId: t.schedule?.definition
		});
		let d = e.status?.(l);
		if (a === void 0) {
			d !== `settled` && n.push({
				deliveryId: l,
				ignored: {},
				principal: i,
				recorded: d !== void 0,
				source: u
			});
			continue;
		}
		d === void 0 && n.push({
			deliveryId: l,
			principal: i,
			source: u
		});
		let f = defined({
			deliveryId: l,
			history: (a.history?.length ?? 0) > 0 ? a.history : void 0,
			parts: a.message === void 0 ? [] : userPartsOf(a.message)
		});
		let { answers: p, ...m } = a;
		r.push(p === void 0 || p.length === 0 ? {
			...m,
			deliveries: [f]
		} : {
			...m,
			answers: p.map((e, t) => defined({
				interactionId: e.interactionId,
				optionId: e.optionId,
				text: e.text,
				deliveryId: l,
				responseId: `response_${l}_${String(t)}`
			})),
			deliveries: [f]
		});
	}
	return {
		deliveries: n,
		inputs: r
	};
}
function principalOf(e) {
	if (e != null) return defined({
		id: e.principalId,
		issuer: e.issuer,
		type: e.principalType
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/deliveries.js
function admitDeliveries(e, t = {}) {
	let { start: n } = t;
	return commitOf([...n === void 0 ? [] : [fact(`session.started`, n)], ...e.flatMap(({ ignored: e, recorded: t, ...n }) => [...t === !0 ? [] : [fact(`delivery.admitted`, n)], ...e === void 0 ? [] : [fact(`delivery.settled`, {
		deliveryId: n.deliveryId,
		outcome: `ignored`,
		reason: e.reason
	})]])]);
}
function admitControl(e, t, n = {}) {
	return commitOf([controlAdmitted(e, t), ...n.applied === !0 ? [deliveryApplied(e.deliveryId)] : []]);
}
function settleControl(e) {
	return commitOf(controlSettled(e));
}
function failInterruptedControl(e, t, n) {
	return commitOf([...n.recorded ? [] : [controlAdmitted(e, t)], fact(`delivery.settled`, {
		deliveryId: e.deliveryId,
		outcome: `failed`,
		reason: `${t}-interrupted`
	})]);
}
function settleDelivery(e, t, n) {
	return commitOf([fact(`delivery.settled`, {
		deliveryId: e,
		outcome: t,
		reason: n
	})]);
}
function endSession(e, t) {
	return commitOf(sessionEndedFacts(e, t));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/lines.js
async function createLineCommitter() {
	let e = checksSessionEvents() ? (await import("./_12.mjs")).schemaViolation : void 0;
	let t;
	return {
		commit(n, r, i, a = (/* @__PURE__ */ new Date()).toISOString()) {
			e !== void 0 && (t ??= createStreamChecker({
				seed: n,
				validate: e
			}));
			let o = linesOf(cascade(n, eventsOf(r)), a).map((e, t) => ({
				bytes: encodeLineBytes(e),
				line: e,
				position: i + t
			}));
			for (let { line: e, position: n } of o) {
				let r = t?.check(e, n) ?? [];
				if (r.length !== 0) throw t = void 0, Error(`Session event contract: ${r.map((e) => `${e.rule} at ${e.position}:${e.index ?? `progress`}: ${e.message}`).join(`; `)}`);
			}
			return o;
		},
		reset() {
			t = void 0;
		}
	};
}
async function waitForSessionHooksRelease(e, t) {
	await Promise.all([...new Set(e)].map((e) => waitForHookRelease(sessionInboxHookToken(e), t)));
}
async function waitForHookRelease(e, t) {
	let n = Date.now() + 3e4;
	for (;;) {
		if (!await servesSession(e, t)) return;
		if (Date.now() >= n) throw Error(`Timed out waiting for session "${t.sessionId}" to release inbox "${e}".`);
		await new Promise((e) => setTimeout(e, 20));
	}
}
async function servesSession(e, t) {
	let n = await findSessionHookHolder(e);
	if (n === void 0) return !1;
	try {
		if (n.hook !== void 0) return requireSessionId(await n.hook.metadata) === t.sessionId;
	} catch {}
	return n.runId === t.ownerRunId;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/end-stranded-session.js
const log$36 = createLogger(`execution.session-inbox`);
function strandedEndPolicy(e) {
	return `stranded-${e}`;
}
async function endStrandedSession(e, t, n, r) {
	if (n === `reset` && r === void 0) throw Error(`A stranded reset requires its control delivery identity.`);
	let i = typeof t == `string` ? await resolveStrandedSessionId(e) : t.sessionId;
	let { ownerRunId: a } = e;
	let o = await (0, runtime_exports.getWorld)();
	await assertStillServesSession(i, a);
	let s = await listOwnedSessionTokens(o, a);
	return await publishTerminalEvent(i, n, r), await cancelRuns(o, [a, i], `Session ended: its deployment was retired`), await waitForSessionHooksRelease([
		sessionCommandHookToken(i),
		logicalSessionToken(t),
		...s
	], {
		ownerRunId: a,
		sessionId: i
	}), log$36.warn(`Reset stranded session`, {
		currentEveVersion: resolveInstalledPackageInfo().version,
		previousEveVersion: e.eveVersion ?? `unknown`,
		previousSessionId: i,
		trigger: n
	}), i;
}
async function assertStillServesSession(e, t) {
	let n = await findSessionHookHolder(sessionInboxHookToken(sessionCommandHookToken(e)));
	if (n !== void 0 && n.runId !== t) throw Error(`Session "${e}" changed owners while it was being reset. Nothing was ended; retry the request.`);
}
async function publishTerminalEvent(e, t, n) {
	let r = await readRecordedView(e);
	if (r === void 0) return;
	let i = (0, runtime_exports.getRun)(e).getWritable().getWriter();
	let a = (async () => {
		let e = endSession({ view: r }, {
			cause: n === void 0 ? { policy: strandedEndPolicy(t) } : void 0,
			control: n === void 0 ? void 0 : {
				deliveryId: n.deliveryId,
				principal: principalOf(n.auth)
			},
			error: {
				code: `session_stranded`,
				message: `This session is no longer available.`
			},
			outcome: `failed`
		});
		let a = (await createLineCommitter()).commit(r, e, r.position);
		for (let { bytes: e } of a) await i.write(e);
		return await i.close(), !0;
	})();
	a.catch(() => {});
	let o;
	let s = new Promise((e) => {
		o = setTimeout(() => e(!1), 5e3);
	});
	try {
		await Promise.race([a, s]) || log$36.warn(`Timed out finishing the stranded session stream`, { sessionId: e });
	} catch (t) {
		log$36.warn(`Could not finish the stranded session stream`, {
			error: t,
			sessionId: e
		});
	} finally {
		clearTimeout(o), i.releaseLock();
	}
}
async function readRecordedView(e) {
	let t = emptySessionView();
	let n = new AbortController();
	let r = (async () => {
		for await (let r of streamSessionEvents(e, {
			follow: !1,
			signal: n.signal
		})) foldReceivedEvent(t, r);
	})();
	r.catch(() => {});
	let i;
	let a = new Promise((e) => {
		i = setTimeout(() => e(!1), 3e4);
	});
	let o;
	try {
		o = !await Promise.race([r.then(() => !0), a]);
	} catch (t) {
		log$36.warn(`Could not read the stranded session history`, {
			error: t,
			sessionId: e
		});
		return;
	} finally {
		clearTimeout(i);
	}
	if (o) throw n.abort(), Error(`Timed out reading the history of stranded session "${e}". Nothing was ended; retry the request.`);
	return t;
}
async function cancelRuns(e, t, n) {
	for (let r of new Set(t)) try {
		await (0, runtime_exports.cancelRun)(e, r, { cancelReason: n });
	} catch (e) {
		if (!isRunInactive(e)) throw e;
	}
}
async function resolveStrandedSessionId(e) {
	let { attributes: t, runId: n } = e.ownerRun;
	let r = t["$eve.session"];
	if (r !== void 0) return r;
	if (e.hook !== void 0) try {
		return requireSessionId(await e.hook.metadata);
	} catch {}
	if (t["$eve.type"] !== void 0) return n;
	throw Error(`Cannot reset stranded session owner run "${n}": it does not record which session it serves. Cancel the run directly.`);
}
async function listOwnedSessionTokens(e, t) {
	let n = [];
	let r;
	for (let i = 0; i < 10; i++) {
		let i = await e.hooks.list({
			pagination: {
				cursor: r,
				limit: 100
			},
			resolveData: `none`,
			runId: t
		});
		for (let e of i.data) {
			let t = logicalSessionInboxToken(e.token);
			t !== void 0 && n.push(t);
		}
		if (!i.hasMore || i.cursor === null) break;
		r = i.cursor;
	}
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/child-binding.js
function namespaceOf(e) {
	return `eve.child.${e}`;
}
async function recordRemoteChildBinding(e, t) {
	let n = (0, runtime_exports.getRun)(e).getWritable({ namespace: namespaceOf(t.childSessionId) }).getWriter();
	try {
		await n.write(t);
	} finally {
		n.releaseLock();
	}
}
async function readRemoteChildBinding(e, t) {
	let n = (0, runtime_exports.getRun)(e).getReadable({ namespace: namespaceOf(t) });
	try {
		if (await n.getTailIndex() < 0) return;
		let e = n.getReader();
		let r = await e.read();
		return e.releaseLock(), r.done ? void 0 : parseBinding(r.value, t);
	} finally {
		await n.cancel().catch(() => {});
	}
}
function parseBinding(e, t) {
	if (!isObject(e)) return;
	let { callId: n, dynamicBinding: r, earlierProtocol: i, name: a, resolverId: o, streamPath: s, url: c } = e;
	if (typeof n != `string` || typeof a != `string` || typeof s != `string` || typeof c != `string`) return;
	let l = {
		callId: n,
		childSessionId: t,
		name: a,
		streamPath: s,
		url: c
	};
	return typeof o == `string` && (l.resolverId = o), r !== void 0 && (l.dynamicBinding = r), typeof i == `number` && (l.earlierProtocol = i), l;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-prewarm.js
async function prewarmWorkflowSession(e, t) {
	if (t === void 0 || t.length === 0 || t === `latest`) return { status: `unsupported` };
	let n = await (0, runtime_exports.getWorld)();
	if (n.capabilities?.deploymentAffinity !== !0) return { status: `unsupported` };
	let r;
	try {
		r = await (0, runtime_exports.getHookByToken)(sessionInboxHookToken(sessionCommandHookToken(e)));
	} catch (e) {
		if (HookNotFoundError.is(e)) return { status: `no_active_session` };
		throw e;
	}
	let i = await n.runs.get(r.runId, { resolveData: `none` });
	return i.status !== `running` && i.status !== `pending` ? { status: `no_active_session` } : i.deploymentId === t ? { status: `ready` } : i.attributes["$eve.prewarm"] === `1` ? (await resumeSessionInbox({ sessionId: e }, {
		kind: `session-prewarm`,
		expectedOwnerRunId: r.runId,
		targetDeploymentId: t
	}), { status: `accepted` }) : { status: `unsupported` };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/start-claim.js
function assertStartClaims(e) {
	if (e.capabilities?.atomicStartHook?.active !== !0) throw Error(`The configured Workflow world does not support atomic start hooks, which eve needs to start a session. Use the local world, Vercel Workflow, or @workflow/world-postgres 5.1.1 or later.`);
}
function pinRunId(e, t) {
	let n = e.createRunId?.(t) ?? monotonicUlid();
	let r = new Proxy(e, { get(e, t) {
		if (t === `createRunId`) return () => n;
		let r = Reflect.get(e, t, e);
		return typeof r == `function` ? r.bind(e) : r;
	} });
	return {
		runId: `wrun_${n}`,
		world: r
	};
}
const ULID_ALPHABET = `0123456789ABCDEFGHJKMNPQRSTVWXYZ`;
let lastTime = -1;
let lastRandom = [];
function monotonicUlid() {
	let e = Date.now();
	if (e > lastTime) lastTime = e, lastRandom = Array.from(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16)), (e) => e & 31);
	else for (let e = 15; e >= 0; e--) {
		if (lastRandom[e] < 31) {
			lastRandom[e] += 1;
			break;
		}
		lastRandom[e] = 0;
	}
	let t = ``;
	for (let e = lastTime, n = 0; n < 10; n++, e = Math.floor(e / 32)) t = ULID_ALPHABET[e % 32] + t;
	return t + lastRandom.map((e) => ULID_ALPHABET[e]).join(``);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/attributes/normalize.js
function truncateForTag(e, t = 256) {
	if (t <= 0) return ``;
	let n = new TextEncoder();
	if (n.encode(e).length <= t) return e;
	let r = e.length;
	for (; r > 0;) {
		let i = e.charCodeAt(r - 1);
		if (i >= 55296 && i <= 56319) {
			--r;
			continue;
		}
		let a = e.slice(0, r);
		if (n.encode(a).length <= t) return a;
		--r;
	}
	return ``;
}
function normalizeEveAttributes(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) r !== void 0 && (t[n] = truncateForTag(typeof r == `string` ? r : String(r)));
	return t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/public/definitions/state.js
function mountedStateKeyName(e, t) {
	return `eve:mount.v1:${encodeURIComponent(e)}:${encodeURIComponent(t)}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/serialize.js
const log$35 = createLogger(`context.serialize`);
const STATE_LAYOUT_KEY = `eve.stateLayout`;
function serializeContext(e) {
	let t = {};
	for (let [n, r] of e.entries()) try {
		t[n.name] = n.codec ? n.codec.serialize(r) : r;
	} catch (e) {
		throw logError(log$35, `failed to serialize context key`, e, { key: n.name }), e;
	}
	return (t[SessionAgentKey.name] !== void 0 || Object.keys(t).some((e) => e.startsWith(`eve:mount.`))) && (t[STATE_LAYOUT_KEY] = 1), t;
}
async function deserializeContext(e) {
	let t = e;
	let n = new ContextContainer();
	let r = t[SessionAgentKey.name];
	if (t[STATE_LAYOUT_KEY] !== void 0 && t[STATE_LAYOUT_KEY] !== 1 || t[STATE_LAYOUT_KEY] === void 0 && Object.keys(t).some((e) => t[e] !== void 0 && e.startsWith(`eve:mount.`))) throw new IncompatibleStateLayoutError();
	if (r !== void 0) {
		let e = SessionAgentKey.codec;
		if (e === void 0) throw Error(`Context key "${SessionAgentKey.name}" is missing a codec.`);
		let i = await e.deserialize(r, n);
		i.compiled !== void 0 && t[STATE_LAYOUT_KEY] === void 0 && (t = await adoptLegacyStateLayout(t, i.compiled)), n.set(SessionAgentKey, i);
	}
	for (let [e, r] of Object.entries(t)) {
		if (r === void 0 || e === SessionAgentKey.name || e === STATE_LAYOUT_KEY) continue;
		let t = resolveKey(e);
		if (t === void 0) log$35.warn(`dropping unknown context key during deserialization`, { key: e });
		else try {
			n.set(t, t.codec ? await t.codec.deserialize(r, n) : r);
		} catch (t) {
			throw logError(log$35, `failed to deserialize context key`, t, { key: e }), t;
		}
	}
	return n;
}
async function adoptLegacyStateLayout(e, t) {
	let n = await loadCompiledManifest({ compiledArtifactsSource: t.compiledArtifactsSource });
	let r = [n, ...n.subagents.map((e) => e.agent)].flatMap((e) => e.extensionMounts);
	let i = {};
	for (let [t, n] of Object.entries(e)) {
		if (n === void 0) continue;
		if (t === SessionAgentKey.name || resolveKey(t) !== void 0) {
			i[t] = n;
			continue;
		}
		let e = r.flatMap((e) => {
			let n = `${legacyPackageStateNamespace(e.packageName)}.`;
			if (!t.startsWith(n)) return [];
			let r = mountedStateKeyName(e.mountId, t.slice(n.length));
			return resolveKey(r) === void 0 ? [] : [r];
		});
		if (e.length > 1 || e.length === 0 && t.startsWith(`eve.`)) throw new IncompatibleStateLayoutError(t);
		i[e[0] ?? t] = n;
	}
	return i;
}
function legacyPackageStateNamespace(e) {
	return e.replace(/^@/, ``).replace(/[^a-zA-Z0-9._-]+/g, `-`).replace(/^-+|-+$/g, ``) || `extension`;
}
var IncompatibleStateLayoutError = class extends Error {
	constructor(e) {
		super(`Incompatible context state layout${e === void 0 ? `` : ` for key "${e}"`}. This deployment cannot read the saved state. Continue this session on its original deployment or start a new session.`), this.name = `IncompatibleStateLayoutError`;
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/instrumentation.js
function resolveInstrumentationProjection(e) {
	let { invoke: t, log: n, source: r } = e;
	let i;
	try {
		i = t();
	} catch (e) {
		n.warn(`ignoring instrumentation projection after projector failure`, {
			error: formatError(e),
			source: r
		});
		return;
	}
	if (isThenable(i)) n.warn(`ignoring instrumentation projection because it returned a Promise`, { source: r }), Promise.resolve(i).catch((e) => {
		n.warn(`ignored instrumentation projection Promise rejected`, {
			error: formatError(e),
			source: r
		});
	});
	else if (i !== void 0) {
		if (!isPlainRecord(i)) n.warn(`ignoring instrumentation projection because it is not a record`, { source: r });
		else try {
			return parseJsonObject(i);
		} catch (e) {
			n.warn(`ignoring instrumentation projection because it is outside the JSON contract`, {
				error: formatError(e),
				source: r
			});
			return;
		}
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/instrumentation.js
const log$34 = createLogger(`channel.instrumentation`);
function buildChannelInstrumentationProjection(e) {
	let { adapter: t, channelName: n, existingKind: r } = e;
	return {
		channelType: getAdapterKind(t),
		kind: resolveKind({
			adapter: t,
			channelName: n,
			existingKind: r
		}),
		metadata: resolveMetadata(t)
	};
}
function resolveKind(e) {
	let { adapter: t, channelName: n, existingKind: r } = e;
	if (r !== void 0) return r;
	if (n !== void 0 && n.length > 0) return `channel:${n}`;
	let i = getAdapterKind(t);
	return isInstrumentationChannelKind(i) ? i : `channel:${i}`;
}
function resolveMetadata(e) {
	let t = e.instrumentation?.metadata;
	if (t === void 0) return {};
	let { audience: n, ...r } = resolveInstrumentationProjection({
		invoke: () => t(e.state),
		log: log$34,
		source: getAdapterKind(e)
	}) ?? {};
	return r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/channel-context.js
function setChannelContext(e, t, n = {}) {
	let r = e.get(ChannelInstrumentationKey);
	let i = buildChannelInstrumentationProjection({
		adapter: t,
		channelName: n.channelName,
		existingKind: r?.kind
	});
	e.set(ChannelKey, t), e.set(ChannelInstrumentationKey, {
		...i,
		metadata: t.instrumentation?.metadata === void 0 && r !== void 0 ? r.metadata : i.metadata
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/audience.js
function resolveAudience(e, t) {
	return normalize(e, t);
}
function normalize(e, t) {
	let n = e.instrumentation?.audience;
	if (n === void 0) return `unknown`;
	try {
		let e = n(t);
		return isThenable(e) ? (console.warn(`ignoring channel audience classifier because it returned a Promise`), Promise.resolve(e).catch(() => void 0), `unknown`) : normalizeChannelAudience(e);
	} catch {
		return console.warn(`ignoring channel audience classifier after failure`), `unknown`;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/space.js
function resolveSpace(e) {
	let t = e.instrumentation?.space;
	if (t !== void 0) try {
		let n = t({ state: e.state });
		if (isThenable(n)) {
			console.warn(`ignoring channel space projection because it returned a Promise`), Promise.resolve(n).catch(() => void 0);
			return;
		}
		return normalizeConversationSpace(n);
	} catch {
		console.warn(`ignoring channel space projection after failure`);
		return;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/conversation-context.js
function buildConversationContext(e, t) {
	let n = Object.hasOwn(e, `audienceAuth`) ? e.audienceAuth ?? null : e.auth;
	let r = buildChannelInstrumentationProjection({
		adapter: e.adapter,
		channelName: e.channelName
	});
	let i = {
		kind: normalizeInstrumentationChannelKind(r.kind),
		name: e.channelName
	};
	let a = e.inheritedConversation;
	let o = readForwardedTraceAssertion(e.parentTraceContext?.forwardedTracePolicy);
	let s = o?.originAudience ?? a?.audience ?? resolveAudience(e.adapter, {
		state: e.adapter.state,
		caller: toAudienceCaller(n),
		channel: i,
		environment: t
	});
	let c = a === void 0 ? resolveSpace(e.adapter) : a.space;
	return {
		...resolveConversationContext(void 0, {
			channelKind: r.kind,
			environment: t,
			forwardedTracePolicy: o,
			principalType: n?.principalType
		}),
		audience: s,
		channel: i,
		...c !== void 0 && { space: c }
	};
}
function toAudienceCaller(e) {
	return e == null || e.principalType === `anonymous` ? { type: `anonymous` } : {
		type: `principal`,
		principal: {
			attributes: e.attributes,
			authenticator: e.authenticator,
			kind: e.principalType
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/runtime-context.js
function buildRunContext(e) {
	let { agent: t, run: n } = e;
	let r = new ContextContainer();
	let i = n.auth;
	let a = readConversationId(n.conversationId);
	if (a !== void 0 && r.set(ConversationIdKey, a), r.set(SessionAgentKey, t), setChannelContext(r, n.adapter, { channelName: n.channelName }), r.set(ConversationContextKey, buildConversationContext(n, resolveInstrumentationEnvironment())), n.parent === void 0 || n.traceRoot?.kind === `own`) {
		let e = deriveSessionTitle(n.title ?? n.input.message);
		e !== void 0 && r.set(SessionTitleKey, e);
	}
	if (n.channelMetadata !== void 0) {
		let e = r.get(ChannelInstrumentationKey);
		r.set(ChannelInstrumentationKey, {
			channelType: e?.channelType ?? n.channelMetadata.channelType,
			kind: e?.kind ?? n.channelMetadata.kind,
			metadata: n.channelMetadata.metadata
		});
	}
	n.continuationToken !== void 0 && (r.set(ContinuationTokenKey, n.continuationToken), r.set(ContinuationHookTokensKey, [n.continuationToken]));
	let o = n.schedule?.occurrenceId ?? contextStorage.getStore()?.get(OccurrenceIdKey);
	o !== void 0 && r.set(OccurrenceIdKey, o), r.set(AuthKey, i), n.steeredBy !== void 0 && n.steeredBy.length > 0 && r.set(SteeredByKey, n.steeredBy), n.toolStubs !== void 0 && r.set(ToolStubsKey, n.toolStubs), (n.initiatorAuth !== void 0 || n.input.message !== void 0) && r.set(InitiatorAuthKey, n.initiatorAuth ?? i), e.dynamicSubagentAgentConfig !== void 0 && r.set(DynamicSubagentAgentConfigKey, e.dynamicSubagentAgentConfig), e.agentSessionRuntimeOverrides !== void 0 && r.set(AgentSessionRuntimeOverridesKey, e.agentSessionRuntimeOverrides), n.capabilities !== void 0 && r.set(CapabilitiesKey, n.capabilities), n.requestId !== void 0 && r.set(ChannelRequestIdKey, n.requestId);
	let s = n.schedule?.instance ?? contextStorage.getStore()?.get(ScheduleInstanceKey);
	s !== void 0 && r.set(ScheduleInstanceKey, s);
	let c = n.schedule?.definition ?? contextStorage.getStore()?.get(ScheduleIdKey);
	return c !== void 0 && r.set(ScheduleIdKey, c), n.delivery !== void 0 && r.set(ChannelDeliveryKey, n.delivery), n.callback !== void 0 && r.set(SessionCallbackKey, n.callback), n.callback !== void 0 && n.earlierCallerProtocol !== void 0 && r.set(EarlierRemoteCallerKey, n.earlierCallerProtocol), n.parent !== void 0 && r.set(ParentSessionKey, n.parent), n.traceRoot !== void 0 && r.set(TraceRootKey, n.traceRoot), n.parentTraceContext !== void 0 && r.set(ParentTraceContextKey, n.parentTraceContext), r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/runtime-context.js
const log$33 = createLogger(`harness.instrumentation-runtime-context`);
function snapshotInstrumentationRuntimeContext(e) {
	let t = e?.get(AuthKey) ?? null;
	return {
		channel: snapshotForInstrumentation(e?.get(ChannelInstrumentationKey), `channel.instrumentation`),
		currentAuth: snapshotForInstrumentation(t, `session.auth.current`) ?? null,
		initiatorAuth: snapshotForInstrumentation(e?.get(InitiatorAuthKey) ?? t, `session.auth.initiator`) ?? null,
		parent: snapshotForInstrumentation(e?.get(ParentSessionKey), `session.parent`)
	};
}
function buildTelemetryRuntimeContext(e) {
	if (e.providerResolvers !== void 0 && e.providerResolvers.length > 0) {
		if (e.emissionState.runId === void 0) log$33.warn(`cannot resolve instrumentation context without a model run`);
		else return {
			...resolveProviderRuntimeContext(e),
			"eve.environment": e.environment
		};
	}
}
function buildInstrumentationModelStartedInput(e) {
	let t = e.context ?? snapshotInstrumentationRuntimeContext(contextStorage.getStore());
	let n = t.channel;
	return {
		channel: {
			kind: normalizeInstrumentationChannelKind(n?.kind),
			metadata: snapshotForInstrumentation(n?.metadata, `channel.metadata`) ?? {}
		},
		modelInput: e.capturesContent ? snapshotForInstrumentation(e.modelInput, `modelInput`) ?? {
			instructions: void 0,
			messages: []
		} : {
			instructions: void 0,
			messages: []
		},
		session: {
			auth: projectSessionAuth(t),
			id: e.session.sessionId,
			parent: t.parent
		},
		run: {
			id: e.emissionState.runId,
			attempt: e.attempt
		},
		turn: e.emissionState.turnId === void 0 ? void 0 : {
			id: e.emissionState.turnId,
			sequence: e.emissionState.sequence
		}
	};
}
function filterAuthoredRuntimeContext(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(e)) r.startsWith(`eve.`) ? log$33.warn(`ignoring reserved instrumentation runtime context key`, {
		key: r,
		source: t
	}) : n[r] = i;
	return Object.keys(n).length > 0 ? n : void 0;
}
function resolveProviderRuntimeContext(e) {
	let t = e.providerResolvers;
	if (t === void 0 || t.length === 0) return;
	let n = {};
	let r = !1;
	for (let i of t) {
		let t = `provider.runtimeContext`;
		let a = resolveInstrumentationProjection({
			invoke: () => {
				let t = buildInstrumentationModelStartedInput(e);
				return i(t);
			},
			log: log$33,
			source: t
		});
		if (a === void 0) continue;
		let o = filterAuthoredRuntimeContext(a, t);
		o !== void 0 && (Object.assign(n, o), r = !0);
	}
	return r ? n : void 0;
}
function projectSessionAuth(e) {
	return {
		current: e.currentAuth,
		initiator: e.initiatorAuth
	};
}
function snapshotForInstrumentation(e, t) {
	if (e !== void 0) try {
		return parseJsonValue(e);
	} catch (e) {
		log$33.warn(`dropping non-serializable instrumentation snapshot`, {
			error: formatError(e),
			source: t
		});
		return;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/ai-sdk-hook-bridge.js
function createAiSdkHookBridge(e, t, n = directRunInContext, r, i) {
	let a = {
		capturesInputs: t.capturesInputs ?? t.capturesContent,
		capturesOutputs: t.capturesOutputs ?? t.capturesContent,
		modelCallIndexes: /* @__PURE__ */ new Map(),
		modelCallStartEvents: /* @__PURE__ */ new Map(),
		modelKeys: /* @__PURE__ */ new Map(),
		runtimeContext: r !== void 0 && Object.keys(r).length > 0 ? Object.freeze({ ...r }) : void 0,
		scope: e,
		toolKeys: /* @__PURE__ */ new Map(),
		toolCalls: /* @__PURE__ */ new Map(),
		isFrameworkTool: i
	};
	let nextModelCallKey = (e) => {
		let t = a.modelCallIndexes.get(e) ?? 0;
		return a.modelCallIndexes.set(e, t + 1), modelCallIdempotencyKey(a.scope, e, t);
	};
	return {
		onStart(e) {
			a.operation = Object.freeze({
				modelId: e.modelId,
				operationId: e.operationId,
				provider: e.provider
			});
		},
		async onStepStart(e) {
			a.stepNumber = e.stepNumber;
			let n = a.started ? void 0 : toModelStarted(a);
			n !== void 0 && (a.started = !0, await t.publish(n));
		},
		async onLanguageModelCallStart(e) {
			let n = a.stepNumber ?? 0;
			let r = nextModelCallKey(n);
			a.modelKeys.set(e.callId, r);
			let i = toModelCallStarted(a, r, e);
			a.modelCallStartEvents.set(e.callId, {
				event: i,
				stepNumber: n
			}), await t.publish(i);
		},
		async executeLanguageModelCall({ callId: r, execute: i }) {
			let o = a.modelKeys.get(r);
			if (o === void 0) {
				let e = a.modelCallStartEvents.get(r);
				if (e === void 0) return i();
				o = nextModelCallKey(e.stepNumber), a.modelKeys.set(r, o), await t.publish(Object.freeze({
					...e.event,
					idempotencyKey: o
				}));
			}
			try {
				return await n({
					idempotencyKey: o,
					scope: e,
					type: `model.call`
				}, i);
			} catch (n) {
				throw a.modelKeys.get(r) === o && a.modelKeys.delete(r), await t.publish(Object.freeze({
					outcome: `failed`,
					error: n,
					idempotencyKey: o,
					scope: e,
					type: `model.call.settled`
				})), n;
			}
		},
		async onLanguageModelCallEnd(e) {
			let n = a.modelKeys.get(e.callId);
			if (n === void 0) return;
			a.modelKeys.delete(e.callId), a.modelCallStartEvents.delete(e.callId);
			let r = toModelCallCompleted(a, n, e);
			await t.publish(r);
		},
		onToolExecutionStart(e) {
			let t = toolCallIdempotencyKey(a.scope, e.toolCall.toolCallId, a.stepNumber ?? 0);
			a.toolKeys.set(e.toolCall.toolCallId, t);
			let n = toToolCallStarted(a, t, e);
			a.toolCalls.set(e.toolCall.toolCallId, n);
		},
		executeTool({ toolCallId: e, execute: t }) {
			let r = a.toolCalls.get(e);
			return r === void 0 ? t() : n({
				...r,
				type: `tool.call`
			}, t);
		},
		onToolExecutionEnd(e) {
			let t = e.toolCall.toolCallId;
			a.toolKeys.get(t) !== void 0 && (a.toolKeys.delete(t), a.toolCalls.delete(t));
		},
		async onAbort(e) {
			await failOpenOperations(e.reason);
		},
		async onError(e) {
			await failOpenOperations(e.error);
		}
	};
	async function failOpenOperations(n) {
		let r = [];
		for (let i of a.modelKeys.values()) r.push(t.publish(Object.freeze({
			outcome: `failed`,
			error: n,
			idempotencyKey: i,
			scope: e,
			type: `model.call.settled`
		})));
		a.modelKeys.clear(), a.modelCallStartEvents.clear(), a.toolKeys.clear(), a.toolCalls.clear(), await Promise.all(r);
	}
}
const directRunInContext = (e, t) => t();
function toModelStarted(e) {
	if (e.operation !== void 0 && e.stepNumber !== void 0) return Object.freeze({
		idempotencyKey: attemptIdempotencyKey(e.scope),
		operation: e.operation,
		runtimeContext: e.runtimeContext,
		scope: e.scope,
		type: `model.started`
	});
}
function toModelCallStarted(e, t, n) {
	return Object.freeze({
		idempotencyKey: t,
		input: e.capturesInputs ? Object.freeze({
			instructions: n.instructions,
			messages: Object.freeze([...n.messages]),
			tools: n.tools === void 0 ? void 0 : Object.freeze([...n.tools])
		}) : void 0,
		model: Object.freeze({
			modelId: n.modelId,
			provider: n.provider
		}),
		runtimeContext: e.runtimeContext,
		scope: e.scope,
		type: `model.call.started`
	});
}
function toModelCallCompleted(e, t, n) {
	return Object.freeze({
		outcome: `completed`,
		content: e.capturesOutputs ? Object.freeze(modelContent(n.content).map((e) => Object.freeze(e))) : void 0,
		providerMetadata: n.providerMetadata === void 0 ? void 0 : e.capturesOutputs ? n.providerMetadata : structuralProviderMetadata(n.providerMetadata),
		finishReason: n.finishReason,
		idempotencyKey: t,
		responseModelId: n.modelId,
		responseId: n.responseId,
		scope: e.scope,
		type: `model.call.settled`,
		usage: Object.freeze(modelUsage(n.usage))
	});
}
function toToolCallStarted(e, t, n) {
	return Object.freeze({
		capability: {
			kind: `tool`,
			name: n.toolCall.toolName
		},
		callId: n.toolCall.toolCallId,
		frameworkTool: e.isFrameworkTool?.(n.toolCall.toolName) === !0,
		idempotencyKey: t,
		input: e.capturesInputs ? n.toolCall.input : void 0,
		scope: e.scope,
		toolName: n.toolCall.toolName,
		startedAtMs: Date.now(),
		type: `call.requested`
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/runtime-action-settlement-state.js
const RuntimeActionSettlementTimesKey = new ContextKey(`eve.harness.runtimeActionSettlementTimes`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/channel-delivery.js
function deliveryEvent(e, t, n) {
	if (e.type !== `delivery.consumed` && e.type !== `delivery.settled`) return;
	let { deliveryId: r, turnId: i } = e.data;
	let a = channelDeliveryIdempotencyKey(n.sessionId, r);
	if (e.type === `delivery.settled`) return {
		...e.data,
		idempotencyKey: a,
		sessionId: n.sessionId,
		type: e.type
	};
	let o = n.deliveryInput;
	let s = o?.deliveryMetadata?.find((e) => e.deliveryId === r);
	let c = t?.get(ChannelDeliveryKey);
	let l = s ?? (c?.deliveryId === r ? c : void 0);
	let u = s === void 0 ? void 0 : o?.payloads[s.payloadIndex];
	return {
		agentName: n.agentName,
		deliveryId: r,
		delivery: l === void 0 ? void 0 : {
			channelAudience: n.channelAudience,
			channelKind: l.channelKind,
			channelName: l.channelName,
			deliveryId: r,
			requestId: l.requestId,
			requestTraceContext: l.requestTraceContext
		},
		idempotencyKey: a,
		input: n.hooks?.capturesInputs || n.hooks?.capturesContent ? u === void 0 ? { message: e.data.parts } : projectDeliveryInput(u) : void 0,
		rootSessionId: n.rootSessionId ?? n.sessionId,
		sessionId: n.sessionId,
		traceSeed: t?.get(SessionTraceSeedKey),
		traceSessionId: n.traceSessionId,
		turnId: i,
		type: `delivery.consumed`
	};
}
function projectDeliveryInput(e) {
	return {
		context: e.context,
		message: e.message,
		outputSchema: e.outputSchema,
		answers: e.answers?.map(({ optionId: e, text: t }) => ({
			optionId: e,
			text: t
		}))
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/connection-authorization.js
function authorizationReasonCode(e) {
	return e !== void 0 && /^[A-Za-z][\w.-]{0,63}$/.test(e) ? e : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/native-events.js
function attemptScopeOf(e, { runId: t, attempt: n, stepIndex: r, turnId: i }) {
	return instrumentationScope({
		runId: t,
		attempt: n,
		channelAudience: e.channelAudience,
		functionId: e.functionId,
		rootSessionId: e.rootSessionId,
		sessionId: e.sessionId,
		traceSessionId: e.traceSessionId,
		turnId: i
	}, r);
}
function createInstrumentationHandleEvent(e) {
	if (e.hooks === void 0) return e.handleEvent;
	if (e.handleEvent === void 0) return;
	let { handleEvent: t, hooks: n } = e;
	return async (r, i) => {
		let a = Date.now();
		let o = contextStorage.getStore();
		let s = o === void 0 ? void 0 : enteredView(o);
		let c;
		try {
			await t(r, i);
		} catch (e) {
			if (!isTurnCancellation(e) || s === void 0 || o === void 0 || currentView(o).position <= s.position) throw e;
			c = { error: e };
		}
		let l = eventsOf(r);
		let u = s !== void 0 && l.some((e) => isTerminalType(e.type)) ? cascade(s, l) : l;
		let d = s === void 0 ? void 0 : copyView(s);
		if (d !== void 0) for (let e of u) foldReceivedEvent(d, {
			...e,
			meta: { endOfLine: !1 }
		});
		let f = n.capturesInputs ?? n.capturesContent ?? !1;
		let p = n.capturesOutputs ?? n.capturesContent ?? !1;
		let m = {
			attemptScope: (t) => attemptScopeOf(e, t),
			turnScope: (t) => turnScope({
				channelAudience: e.channelAudience,
				functionId: e.functionId,
				rootSessionId: e.rootSessionId,
				sessionId: e.sessionId,
				traceSessionId: e.traceSessionId,
				turnId: t
			}),
			capturesInputs: f,
			capturesOutputs: p,
			capturesPrincipalIds: f && p && shouldCaptureInstrumentationContent({
				audience: normalizeChannelAudience(e.channelAudience),
				environment: e.environment ?? `production`
			}),
			settledAtMs: o?.get(RuntimeActionSettlementTimesKey),
			startedAtMs: a,
			view: d ?? (o === void 0 ? void 0 : currentView(o))
		};
		for (let t of u) {
			if (e.relayed === !0 && !t.type.startsWith(`interaction.`)) continue;
			let r = deliveryEvent(t, o, e);
			r !== void 0 && await n.publish(Object.freeze(r));
			for (let r of instrumentationEventsOf(t, m, e)) await n.publish(Object.freeze(r));
		}
		if (c !== void 0) throw c.error;
	};
}
function instrumentationEventsOf(e, t, n) {
	let { sessionId: r } = n;
	let i = sessionIdempotencyKey(r);
	switch (e.type) {
		case `session.started`: return [{
			agentName: n.agentName,
			channelAudience: n.channelAudience,
			channelKind: n.channelKind,
			idempotencyKey: i,
			parentLineage: n.parentLineage,
			parentTraceContext: n.parentTraceContext,
			rootSessionId: n.rootSessionId ?? r,
			traceSessionId: n.traceSessionId,
			scheduleId: n.scheduleId,
			sessionId: r,
			title: n.title,
			type: `session.started`
		}];
		case `session.ended`: {
			let { cause: n } = e.data;
			let a = n !== void 0 && `turnId` in n ? n.turnId : latestTurnId(t.view);
			let { outcome: o } = e.data;
			return [{
				error: o === `failed` ? Error(e.data.error?.message ?? `The session failed.`) : void 0,
				idempotencyKey: i,
				outcome: o,
				sessionId: r,
				turnId: a,
				type: `session.ended`
			}];
		}
		case `turn.started`: return [{
			idempotencyKey: turnIdempotencyKey(r, e.data.turnId),
			parentLineage: n.parentLineage,
			parentTraceContext: n.parentTraceContext,
			rootSessionId: n.rootSessionId ?? r,
			traceSessionId: n.traceSessionId,
			sequence: turnSequence(e.data.turnId),
			sessionId: r,
			turnId: e.data.turnId,
			type: `turn.started`
		}];
		case `turn.settled`: {
			let { outcome: t, turnId: n } = e.data;
			return [{
				error: t === `failed` ? Error(e.data.error?.message ?? `The turn failed.`) : void 0,
				idempotencyKey: turnIdempotencyKey(r, n),
				outcome: t,
				sessionId: r,
				turnId: n,
				type: `turn.settled`
			}];
		}
		case `model.retried`: {
			let n = runAttempt(t, e.data.runId);
			return n === void 0 ? [] : [{
				error: Error(e.data.error.message),
				idempotencyKey: attemptIdempotencyKey(n),
				scope: n,
				type: `model.retried`
			}];
		}
		case `model.settled`: {
			let n = runAttempt(t, e.data.runId);
			if (n === void 0) return [];
			let { error: r, outcome: i } = e.data;
			let a = attemptIdempotencyKey(n);
			let o = i === `interrupted` && n.turnId !== void 0 && t.view?.turns[n.turnId]?.outcome === `cancelled`;
			return [{
				error: r === void 0 ? void 0 : Error(r.message),
				idempotencyKey: a,
				scope: n,
				outcome: o ? `cancelled` : i,
				type: `model.settled`
			}];
		}
		case `call.requested`: {
			let i = t.view?.calls[e.data.callId];
			let a = i === void 0 ? void 0 : runAttempt(t, callRun(t.view, i));
			if (a === void 0) return [];
			let { callId: o, capability: s } = e.data;
			let c = s.name;
			return [{
				callId: o,
				frameworkTool: s.kind === `skill` || n.isFrameworkTool?.(c) === !0,
				idempotencyKey: actionIdempotencyKey(r, a.turnId, o),
				input: t.capturesInputs ? e.data.input : void 0,
				capability: s,
				scope: a,
				startedAtMs: t.startedAtMs,
				toolName: c,
				type: `call.requested`
			}];
		}
		case `call.settled`: {
			let { callId: n, outcome: i } = e.data;
			let a = t.view?.calls[n];
			let o = a === void 0 ? void 0 : runAttempt(t, callRun(t.view, a));
			if (o === void 0) return [];
			let s = actionIdempotencyKey(r, o.turnId, n);
			let c = i === `completed` ? e.data.output : void 0;
			let l = i === `completed` ? void 0 : e.data.error === void 0 ? e.data.output : Object.assign(Error(e.data.error.message), {
				code: e.data.error.code,
				name: e.data.error.name ?? `Error`
			});
			return [{
				acceptedAtMs: t.settledAtMs?.[n],
				cause: e.data.cause,
				error: t.capturesOutputs ? l : void 0,
				errorCode: e.data.error?.code,
				idempotencyKey: s,
				outcome: i,
				reason: e.data.reason,
				output: t.capturesOutputs ? c : void 0,
				scope: o,
				type: `call.settled`,
				taskId: a?.taskId,
				usage: a?.usage
			}];
		}
		case `interaction.opened`: {
			let n = t.view?.interactions[e.data.interactionId];
			let i = n === void 0 ? void 0 : interactionAttempt(t, n);
			if (n === void 0 || i === void 0 || askedByChildSession(t.view, n)) return [];
			let { request: a } = n;
			let o = askedCall(t.view, n);
			return [{
				call: o === void 0 ? void 0 : {
					callId: o.callId,
					name: o.name
				},
				idempotencyKey: inputIdempotencyKey(r, i.turnId, n.interactionId),
				interactionId: n.interactionId,
				kind: a.kind,
				request: t.capturesOutputs ? {
					allowFreeform: a.allowFreeform,
					display: a.display,
					options: a.options,
					prompt: a.prompt,
					title: a.title
				} : void 0,
				scope: i,
				signIn: a.signIn === void 0 ? void 0 : { name: a.signIn.name },
				type: `interaction.opened`
			}];
		}
		case `interaction.settled`: {
			let n = t.view?.interactions[e.data.interactionId];
			let i = n === void 0 ? void 0 : interactionAttempt(t, n);
			if (n === void 0 || i === void 0 || askedByChildSession(t.view, n)) return [];
			let a = decidingAnswer(n);
			return [{
				answer: !t.capturesInputs || a === void 0 ? void 0 : {
					optionId: a.optionId,
					text: a.text
				},
				idempotencyKey: inputIdempotencyKey(r, i.turnId, n.interactionId),
				interactionId: n.interactionId,
				kind: n.request.kind,
				outcome: e.data.outcome,
				reason: authorizationReasonCode(e.data.reason),
				responder: responderSummary(t.view, e.data.cause, t.capturesPrincipalIds),
				scope: i,
				type: `interaction.settled`
			}];
		}
		default: return [];
	}
}
function responderSummary(e, t, n) {
	if (t === void 0 || !(`responseId` in t)) return;
	let r = responderOf(e, t.responseId);
	return r === void 0 ? void 0 : instrumentationPrincipal(r.type, n ? r.id : void 0);
}
function runAttempt(e, t) {
	let n = t === void 0 ? void 0 : e.view?.runs[t];
	if (n?.attempt === void 0) return;
	let r = runTurn(e.view, n.runId);
	return e.attemptScope({
		runId: n.runId,
		attempt: n.attempt,
		stepIndex: n.step,
		turnId: r
	});
}
function askedByChildSession(e, t) {
	let { origin: n, subject: r } = t;
	return n === void 0 ? !1 : (`callId` in r ? e.calls[r.callId] : void 0)?.capability.kind === `agent` || n.sessionId in e.children;
}
function interactionAttempt(e, t) {
	let n = e.view;
	let { subject: r } = t;
	if (`callId` in r) {
		let t = n.calls[r.callId];
		return t === void 0 ? void 0 : runAttempt(e, callRun(n, t));
	}
	if (`taskId` in r) {
		let t = n.tasks[r.taskId];
		let i = t === void 0 ? void 0 : n.calls[t.startedBy.callId];
		return i === void 0 ? void 0 : runAttempt(e, callRun(n, i));
	}
	if (!(`turnId` in r)) return;
	let i = Object.values(n.runs).filter((e) => e.attempt !== void 0 && runTurn(n, e.runId) === r.turnId);
	return i.length === 0 ? e.turnScope(r.turnId) : runAttempt(e, i.at(-1)?.runId);
}
function latestTurnId(e) {
	return (e === void 0 ? [] : Object.keys(e.turns)).at(-1);
}
function turnSequence(e) {
	let t = /^turn_(\d+)$/.exec(e);
	return t === null ? 0 : Number(t[1]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/prepare-trace-context.js
const log$32 = createLogger(`harness.prepare-trace-context`);
async function prepareTurnTraceContext(e) {
	let t;
	let { channelAudience: n, channelKind: r, channelType: i, traceSeed: a, ...o } = e.session;
	if (!e.sessionStarted && e.instrumentation?.prepareSessionTrace !== void 0) try {
		t = await e.instrumentation.prepareSessionTrace({
			...o,
			channelAudience: n,
			channelKind: r,
			channelType: i,
			idempotencyKey: sessionIdempotencyKey(o.sessionId),
			traceSeed: a,
			type: `session.started`
		});
	} catch (e) {
		warn(`session.started`, e);
	}
	if (e.turnId !== void 0 && e.instrumentation?.prepareTurnTrace !== void 0) try {
		t = await e.instrumentation.prepareTurnTrace({
			...o,
			...e.principals,
			idempotencyKey: turnIdempotencyKey(o.sessionId, e.turnId),
			sequence: e.sequence,
			turnId: e.turnId,
			type: `turn.started`
		});
	} catch (e) {
		warn(`turn.started`, e);
	}
	return a === void 0 && t?.decision !== void 0 && contextStorage.getStore()?.set(SessionTraceSeedKey, t), e.traceContext ?? t;
}
function warn(e, t) {
	log$32.warn(`instrumentation trace preparation failed`, {
		boundary: e,
		error: formatError(t)
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/session-init.js
const log$31 = createLogger(`instrumentation.session-init`);
function initializeSessionInstrumentation(e) {
	let t = getInstrumentationRuntime();
	let n = e.ctx.get(ParentTraceContextKey);
	let r = readForwardedTraceAssertion(n?.forwardedTracePolicy);
	let i = e.ctx.get(ConversationContextKey);
	let a = resolveConversationContext(i, {
		channelKind: e.ctx.get(ChannelInstrumentationKey)?.kind,
		environment: resolveInstrumentationEnvironment(),
		forwardedTracePolicy: r,
		principalType: e.ctx.get(AuthKey)?.principalType
	}, { forwardedOverridesStored: !0 });
	let o = allocateSessionTraceSeed({
		agentName: e.agentName,
		conversation: a,
		channelType: e.ctx.get(ChannelInstrumentationKey)?.channelType,
		forwardedTracePolicy: r,
		parentTraceContext: n,
		runtime: t
	});
	if (o !== void 0 && (e.ctx.set(SessionTraceSeedKey, o), r !== void 0 && log$31.info(`resolved forwarded trace policy`, {
		ceilingEffective: o.decision?.action === `record` ? formatTraceContentCeiling(o.decision) : `drop`,
		ceilingIn: formatTraceContentCeiling(r.ceiling),
		originAudience: r.originAudience
	}), r !== void 0 && n !== void 0)) {
		let t = {
			...n,
			decision: o.decision,
			traceFlags: o.traceFlags
		};
		delete t.forwardedTracePolicy, e.ctx.set(ParentTraceContextKey, t);
	}
	return e.ctx.set(OtelTraceEnabledKey, t?.prepareSessionTrace !== void 0), o?.decision ?? resolveTracePolicy(t?.otelSettings?.tracePolicy, {
		agentName: e.agentName,
		...a
	});
}
function allocateSessionTraceSeed(e) {
	let localDecision = () => resolveTracePolicy(e.runtime?.otelSettings?.tracePolicy, {
		agentName: e.agentName,
		...e.conversation
	});
	if (e.parentTraceContext !== void 0) {
		let t = e.forwardedTracePolicy ? traceContentCeilingToDecision(e.forwardedTracePolicy.ceiling) : void 0;
		let n = readInstrumentationDecision(e.parentTraceContext.decision);
		let r = isSampledTrace(e.parentTraceContext) ? t ? n === void 0 ? t : intersectInstrumentationDecisions(t, n) : n ?? resolveTracePolicyDecision(isSampledTrace(e.parentTraceContext), e.conversation) : { action: `drop` };
		let i = `isRemote` in e.parentTraceContext && e.parentTraceContext.isRemote === !0;
		let a = e.forwardedTracePolicy || i ? intersectInstrumentationDecisions(r, localDecision()) : r;
		let o = e.runtime?.idGenerator ?? new AgentSpanIdGenerator();
		return {
			decision: a,
			...e.forwardedTracePolicy === void 0 ? void 0 : { forwardedTracePolicy: e.forwardedTracePolicy },
			spanId: o.allocateSpanId(),
			traceFlags: a.action === `drop` ? 0 : e.parentTraceContext.traceFlags,
			traceId: i ? o.generateTraceId() : e.parentTraceContext.traceId
		};
	}
	if (e.runtime?.prepareSessionTrace === void 0 || e.runtime.idGenerator === void 0) return;
	let t = localDecision();
	let n = e.runtime.idGenerator.generateTraceId();
	let r = t.action === `record`;
	return {
		decision: t,
		spanId: e.runtime.idGenerator.allocateSpanId(),
		traceFlags: +!!r,
		traceId: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/runtime.js
const TURN_TRACE_STATE_KEY = `eve.harness.turnTrace`;
function bindInstrumentationRuntime(e, t, n) {
	let r = {
		...n,
		traceSessionId: resolveTraceRootSessionId(t, n.sessionId)
	};
	if (readConversationId(t.get(ConversationIdKey)) === void 0 && t.set(ConversationIdKey, t.get(ParentSessionKey)?.rootSessionId ?? r.rootSessionId), e === void 0) return;
	let i;
	let a = e.hooks;
	let o = r.traceSessionId;
	let readSessionContext = () => {
		let e = readInstrumentationSessionContext(contextStorage.getStore() ?? t);
		return {
			...e,
			rootSessionId: e.parent?.rootSessionId ?? r.rootSessionId,
			traceSessionId: o
		};
	};
	let bindHooks = (e) => a.forTrace?.({
		agentName: r.agentName,
		...e.conversation
	}, { ceiling: e.forwardedTracePolicy?.ceiling }) ?? a;
	let captureExecutionRuntime = () => {
		let t = e.otelSettings;
		let n = e.ownsAgentSpans === !0;
		return t !== void 0 && !n && ensureOtelIntegration(), {
			ownsAgentSpans: n,
			otelSettings: t,
			runtimeContextResolvers: e.runtimeContextResolvers,
			tracer: t === void 0 ? void 0 : trace.getTracer(`eve`)
		};
	};
	let preparePreamble = (t, n) => prepareTurnTraceContext({
		...t,
		instrumentation: e,
		principals: n.principals,
		session: {
			agentName: r.agentName,
			channelAudience: n.conversation.audience,
			channelKind: n.conversation.channel.kind,
			channelType: n.instrumentation?.channelType,
			parentLineage: n.parentLineage,
			parentTraceContext: n.parentTraceContext,
			rootSessionId: n.rootSessionId,
			traceSessionId: n.traceSessionId,
			scheduleId: n.scheduleId,
			sessionId: r.sessionId,
			title: n.title,
			traceSeed: n.traceSeed
		}
	});
	let s = e.memoryOperations === !0 ? createMemoryInstrumentation({
		resolveContext: () => {
			let e = readSessionContext();
			return {
				hooks: bindHooks(e),
				rootSessionId: e.rootSessionId,
				traceSessionId: e.traceSessionId
			};
		},
		runInContext: e.runInContext,
		sessionId: r.sessionId
	}) : void 0;
	return {
		prepareDelivery: (e) => {
			i = e;
		},
		createHandleEvent: (e) => {
			let t = readSessionContext();
			return createInstrumentationHandleEvent({
				agentName: r.agentName,
				channelAudience: t.conversation.audience,
				channelKind: t.conversation.channel.kind,
				environment: t.conversation.environment,
				functionId: captureExecutionRuntime().otelSettings?.functionId ?? r.agentName,
				handleEvent: e.handleEvent,
				deliveryInput: i,
				hooks: bindHooks(t),
				relayed: e.relayed,
				rootSessionId: t.rootSessionId,
				traceSessionId: t.traceSessionId,
				parentLineage: t.parentLineage,
				parentTraceContext: t.parentTraceContext,
				scheduleId: t.scheduleId,
				sessionId: r.sessionId,
				title: t.title
			});
		},
		flush: e.forceFlush,
		memory: s,
		prepareExecution: () => {
			let t = captureExecutionRuntime();
			return {
				installAiSdkWarningLogger: ensureAiSdkWarningLogger,
				runStep: async (n, a) => {
					let o = readSessionContext();
					let s = bindHooks(o);
					let c = t.otelSettings;
					let l = resolveInstrumentationTraceDecision(c, r.agentName, o.conversation, o.traceSeed, readSessionTraceDecision(o.context, r.sessionId));
					let u = t.tracer;
					let d = {
						"eve.environment": n.environment,
						"eve.session.id": n.session.sessionId,
						"eve.version": n.eveVersion
					};
					let f = c?.functionId ?? r.agentName;
					f && (d[`ai.telemetry.functionId`] = f);
					let p = u !== void 0 && !t.ownsAgentSpans && l?.action !== `drop` && n.hasInput ? u.startSpan(`ai.eve.turn`, { attributes: d }) : void 0;
					let m = p?.spanContext();
					let h = m === void 0 ? n.session : {
						...n.session,
						state: {
							...n.session.state,
							[TURN_TRACE_STATE_KEY]: {
								spanId: m.spanId,
								traceFlags: m.traceFlags,
								traceId: m.traceId
							}
						}
					};
					let g = p === void 0 ? void 0 : trace.setSpan(context.active(), p);
					if (g === void 0 && u !== void 0) {
						let e = n.session.state?.[TURN_TRACE_STATE_KEY];
						e !== void 0 && (g = trace.setSpan(context.active(), trace.wrapSpanContext({
							...e,
							isRemote: !0
						})));
					}
					let _ = readSessionContext();
					let v = snapshotInstrumentationRuntimeContext(_.context);
					let y = _.conversation;
					let b = y.audience;
					let x = defaultContentCapture(y, _.forwardedTracePolicy?.ceiling);
					let S = l === void 0 ? l : applyLiveDeliveryAudienceCeiling(l, b, _.forwardedTracePolicy, y.environment);
					let C = S === void 0 ? x.recordInputs : S.action === `record` && S.recordInputs;
					let w = l?.action === `drop`;
					let T = {
						recordInputs: !w && (S?.action === `record` ? S.recordInputs : x.recordInputs),
						recordOutputs: !w && (S?.action === `record` ? S.recordOutputs : x.recordOutputs)
					};
					let E = c !== void 0 && !t.ownsAgentSpans ? T : aiSdkCapture(T, s);
					let telemetry = (e) => {
						if (c === void 0 && e.bridgeIntegration === void 0) return;
						let n = {};
						for (let t of Object.keys(e.runtimeContext ?? {})) n[t] = !0;
						let i = c !== void 0 && !(T.recordInputs && T.recordOutputs);
						let integrations = () => getRegisteredTelemetryIntegrations({
							...t.ownsAgentSpans ? { excludeEveOtelIntegration: !0 } : void 0,
							sanitizeEveOtelErrors: i
						});
						return {
							functionId: c?.functionId ?? r.agentName,
							includeRuntimeContext: n,
							integrations: e.bridgeIntegration === void 0 ? i ? [...integrations()] : void 0 : [e.bridgeIntegration, ...integrations()],
							isEnabled: !0,
							recordInputs: E.recordInputs,
							recordOutputs: E.recordOutputs
						};
					};
					let D = {
						channelAudience: b,
						functionId: c?.functionId ?? r.agentName,
						rootSessionId: _.rootSessionId,
						sessionId: r.sessionId,
						traceSessionId: _.traceSessionId
					};
					let run = () => a({
						gatewayTraceContextHeaders: createGatewayTraceContextHeaders,
						createHandleEvent: (e) => createInstrumentationHandleEvent({
							...e,
							...D,
							deliveryInput: i,
							agentName: r.agentName,
							channelKind: y.channel.kind,
							environment: y.environment,
							hooks: s,
							parentLineage: _.parentLineage,
							parentTraceContext: _.parentTraceContext,
							scheduleId: _.scheduleId,
							title: _.title
						}),
						prepareAttempt: (t) => {
							let n = attemptScopeOf(D, t);
							let r = createAiSdkHookBridge(n, s, e.runInContext, t.runtimeContext, t.isFrameworkTool);
							return {
								scope: n,
								telemetry: telemetry({
									bridgeIntegration: r,
									runtimeContext: t.runtimeContext
								})
							};
						},
						preparePreamble: (e) => preparePreamble(e, _),
						recordError: (e) => {
							p !== void 0 && recordErrorOnSpan(p, e);
						},
						resolveRuntimeContext: (e) => buildTelemetryRuntimeContext({
							...e,
							capturesContent: C,
							context: v,
							providerResolvers: t.runtimeContextResolvers
						}),
						session: h,
						setTurnId: (e) => p?.setAttribute(`eve.turn.id`, e),
						telemetry: () => telemetry({}),
						traceContext: m === void 0 || !isValidSpanContext(m) ? void 0 : {
							spanId: m.spanId,
							traceFlags: m.traceFlags,
							traceId: m.traceId
						}
					});
					try {
						return await context.with(withCapture(g ?? context.active(), {
							emit: !0,
							recordInputs: T.recordInputs,
							recordOutputs: T.recordOutputs
						}), run);
					} finally {
						p?.end(), p = void 0;
					}
				}
			};
		},
		preparePreamble: (e) => preparePreamble(e, readSessionContext())
	};
}
function bindSessionInstrumentation(e) {
	let t = {
		agentName: e.agentName,
		rootSessionId: e.rootSessionId,
		traceSessionId: resolveTraceRootSessionId(e.ctx, e.sessionId),
		sessionId: e.sessionId
	};
	return bindInstrumentationRuntime(getInstrumentationRuntime(), e.ctx, t);
}
function isValidSpanContext(e) {
	return /^[0-9a-f]{32}$/u.test(e.traceId) && e.traceId !== `00000000000000000000000000000000` && /^[0-9a-f]{16}$/u.test(e.spanId) && e.spanId !== `0000000000000000`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/initial-entry.js
async function prepareInitialEntry(e, t, n) {
	validateDeliveryIdempotencyKey(t.idempotencyKey), t.input.message !== void 0 && t.delivery === void 0 && (t = {
		...t,
		delivery: createChannelDeliveryMetadata({
			channelKind: t.adapter.kind,
			channelName: t.channelName ?? t.adapter.kind,
			requestId: t.requestId
		})
	});
	let r = t.continuationConflictCommand;
	r !== void 0 && r.delivery === void 0 && (t = {
		...t,
		continuationConflictCommand: {
			...r,
			delivery: t.delivery
		}
	});
	let i = await loadCompiledSessionAgent({
		compiledArtifactsSource: e.compiledArtifactsSource,
		nodeId: e.nodeId
	});
	let a = i.compiled?.graph;
	a !== void 0 && t.toolStubs !== void 0 && t.toolStubs.rootSessionId === void 0 && validateToolStubTargets(t.toolStubs.rules, a);
	let o = buildRunContext({
		agent: i,
		agentSessionRuntimeOverrides: e.agentSessionRuntimeOverrides,
		dynamicSubagentAgentConfig: e.dynamicSubagentAgentConfig,
		run: t
	});
	n !== void 0 && o.set(SessionPredecessorKey, n);
	let s = initializeSessionInstrumentation({
		agentName: i.id,
		ctx: o
	});
	let c = agentLimits(i, o)?.sessionTimeoutMs;
	let l = i.settings.retention ?? (s.action === `record` && s.recordInputs && s.recordOutputs ? void 0 : 0);
	let u = serializeContext(o);
	let d = {
		idempotencyKey: t.idempotencyKey,
		kind: `initial`,
		input: t.input,
		serializedContext: u
	};
	return t.continuationConflictCommand !== void 0 && (d.continuationConflictCommand = t.continuationConflictCommand), c !== void 0 && (d.sessionTimeoutMs = c), l !== void 0 && (d.retention = l), {
		agent: i,
		entry: d,
		input: t,
		serializedContext: u
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-commands.js
function identifyCommand(e) {
	if (e.kind !== `send` || e.delivery !== void 0) return e;
	let t = e.caller === void 0 ? e.schedule === void 0 ? `http` : `schedule` : `subagent`;
	return {
		...e,
		delivery: createChannelDeliveryMetadata({
			channelKind: t,
			channelName: t,
			requestId: e.requestId
		})
	};
}
function activeCommandResult(e, t) {
	return e.kind === `reset` ? {
		previousSessionId: t,
		status: `reset`
	} : e.kind === `send` && e.delivery !== void 0 ? {
		sessionId: t,
		status: `accepted`,
		deliveryId: e.delivery.deliveryId
	} : {
		sessionId: t,
		status: `accepted`
	};
}
function inactiveCommandResult(e) {
	return e.kind === `send` ? { status: `session_not_active` } : e.kind === `cancel` ? { status: `no_active_turn` } : { status: `no_active_session` };
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/invocation/metadata.js
function invocationOwnerKey(e) {
	let t = e === null ? [`anonymous`] : principalIdentity(e);
	return createHash(`sha256`).update(JSON.stringify(t), `utf8`).digest(`hex`);
}
function buildInvocationAttributes(e) {
	return {
		["$eve.invocation_owner"]: e.ownerKey,
		["$eve.invocation_token"]: e.continuationToken
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-runtime.js
const EVE_PACKAGE_INFO = resolveInstalledPackageInfo();
const log$30 = createLogger(`execution.workflow-runtime`);
function sessionHandle(e, t, n) {
	let r;
	return {
		get events() {
			return r ??= readSessionEventStream(e), r;
		},
		sessionId: e,
		...t !== void 0 && { deliveryId: t },
		...n !== void 0 && { claimedContinuation: n }
	};
}
function createWorkflowRuntime(e) {
	installWorkflowHost();
	let startSession = async (t, n, r = 0) => {
		let i = await prepareInitialEntry(e, t, n);
		t = i.input;
		let { agent: a, serializedContext: o } = i;
		let s = i.entry.retention;
		let c = readParentLineage(o);
		let l = {
			...i.entry,
			ownerDeploymentId: await resolveCurrentWorkflowDeploymentId()
		};
		let u = {
			...c.sessionId === void 0 ? buildSessionAttributes({ serializedContext: o }) : buildSubagentRootAttributes({
				identity: { nodeId: runtimeNodeId(a) },
				parentCallId: c.callId,
				parentSessionId: c.sessionId,
				parentTurnId: c.turnId,
				rootSessionId: c.rootSessionId ?? c.sessionId,
				serializedContext: o
			}),
			["$eve.prewarm"]: `1`,
			...t.externalInvocation === void 0 ? {} : buildInvocationAttributes(t.externalInvocation)
		};
		let { continuationToken: d } = t;
		assertStartClaims(await (0, runtime_exports.getWorld)());
		let f = d !== void 0 && d !== ``;
		let p = {
			...l,
			startClaim: f ? `continuation` : `inbox`
		};
		let m;
		try {
			let e = {
				allowReservedAttributes: !0,
				attributes: normalizeEveAttributes(u)
			};
			s !== void 0 && (e.experimental_retention = s), m = await startWorkflowOnDeployment(workflowEntryReference, [p], p.ownerDeploymentId, e, (e) => ({
				token: sessionInboxHookToken(f ? d : sessionCommandHookToken(e)),
				metadata: { ["sessionId"]: e }
			}));
		} catch (e) {
			if (f && HookConflictError.is(e)) return await joinContinuationOwner(t, n, r);
			throw log$30.error(`failed to start workflow run`, { error: formatCapabilityError(e, [t.continuationToken]) }), e;
		}
		return sessionHandle(m.runId, t.delivery?.deliveryId, f ? !0 : void 0);
	};
	let joinContinuationOwner = async (e, t, n) => {
		let r = e.continuationToken;
		let i = e.continuationConflictCommand;
		let a;
		if (i === void 0) a = (await resolveContinuation(r))?.sessionId;
		else {
			let t = await dispatchContinuation({
				command: i,
				continuationToken: r,
				successor: e
			});
			t.status === `accepted` && (a = t.sessionId);
		}
		if (a !== void 0) return sessionHandle(a, e.delivery?.deliveryId, !1);
		if (n + 1 >= 3) throw new SessionNotActiveError({ retryable: !0 });
		return await startSession(e, t, n + 1);
	};
	let dispatchContinuation = async (e) => {
		let { continuationToken: t, successor: n } = e;
		let r = identifyCommand(e.command);
		try {
			return await dispatchWorkflowCommand(t, r);
		} catch (e) {
			if (!(e instanceof StrandedSessionOwnerError)) throw e;
			if (r.kind !== `send` || n === void 0) return await settleStrandedCommand(t, r, e);
			if ((r.payload.answers?.length ?? 0) > 0) throw sessionStrandedError(e, `Its pending requests can no longer be answered; send a new message to start a fresh session.`);
			let i = await endStrandedSession(e, t, `message`);
			return {
				sessionId: (await startSession({
					...n,
					delivery: r.delivery
				}, { sessionId: i })).sessionId,
				deliveryId: r.delivery?.deliveryId,
				status: `accepted`
			};
		}
	};
	return {
		async createSession(e) {
			return await startSession(e);
		},
		dispatchContinuation,
		async dispatchSession(e) {
			return await dispatchWorkflowSessionCommand(e);
		},
		async getEventStream(e, t) {
			return t?.follow === !1 ? readSessionEventHistory(e, t.startIndex, t.signal) : (await assertFollowableSession(e), readSessionEventStream(e, t?.startIndex, t?.signal));
		},
		async getLineStream(e, t) {
			if (t?.follow === !1) return readSessionRecordHistory(e, t.startIndex);
			let n = readSessionRecords(e, t?.startIndex);
			try {
				await assertFollowableSession(e);
			} catch (e) {
				throw await n.cancel().catch(() => {}), e;
			}
			return n;
		},
		async getStreamTailIndex(e) {
			return await readSessionStreamTailIndex(e);
		},
		async readChildBinding(e, t) {
			return await readRemoteChildBinding(e, t);
		},
		async hasRunnableOwner(e) {
			let t = sessionInboxHookToken(sessionCommandHookToken(e));
			let n = await findSessionHookHolder(t);
			if (n === void 0) return !1;
			try {
				return await assertRunnableSessionOwner(n), !0;
			} catch (e) {
				if (e instanceof StrandedSessionOwnerError) return !1;
				throw e;
			}
		},
		resolveContinuation
	};
}
async function dispatchWorkflowCommand(e, t) {
	if (t.kind === `prewarm`) return typeof e == `string` ? { status: `unsupported` } : await prewarmWorkflowSession(e.sessionId, t.targetDeploymentId);
	let n;
	let r;
	let i;
	try {
		let a = await resumeSessionInbox(e, t);
		r = a.inbox, i = a.startAddress, n = {
			runId: a.ownerRunId,
			sessionId: await a.sessionId
		};
	} catch (n) {
		if (n instanceof StrandedSessionOwnerError) throw n;
		if (isInactiveCommandTarget(n)) return inactiveCommandResult(t);
		let r = logicalSessionToken(e);
		throw log$30.error(`failed to dispatch session command`, {
			command: t.kind,
			error: formatCapabilityError(n, [r, sessionInboxHookToken(r)])
		}), n;
	}
	t.kind === `reset` && await waitForSessionHooksRelease([
		sessionCommandHookToken(n.sessionId),
		logicalSessionToken(e),
		...i === void 0 ? [] : [i]
	], {
		ownerRunId: n.runId,
		sessionId: n.sessionId
	});
	let a = activeCommandResult(t, n.sessionId);
	return a.status === `accepted` ? {
		...a,
		inbox: r
	} : a;
}
async function settleStrandedCommand(e, t, n) {
	switch (t.kind) {
		case `reset`: return {
			previousSessionId: await endStrandedSession(n, e, `reset`, t),
			status: `reset`
		};
		case `send`:
		case `clear`: throw sessionStrandedError(n);
		default: return inactiveCommandResult(t);
	}
}
async function assertFollowableSession(e) {
	try {
		await Promise.all([assertRunnableSessionInbox(sessionInboxHookToken(sessionCommandHookToken(e))), assertSessionHistoryReadable(e)]);
	} catch (e) {
		throw e instanceof StrandedSessionOwnerError ? sessionStrandedError(e) : e;
	}
}
function sessionStrandedError(e, t) {
	let n = e.eveVersion === void 0 ? {} : { eveVersion: e.eveVersion };
	return new SessionStrandedError(n, describeStrandedSession(n, t));
}
async function dispatchWorkflowSessionCommand(e) {
	let t = {
		sessionId: e.sessionId,
		inbox: e.inbox
	};
	let n = identifyCommand(e.command);
	try {
		return await dispatchWorkflowCommand(t, n);
	} catch (e) {
		if (!(e instanceof StrandedSessionOwnerError)) throw e;
		return await settleStrandedCommand(t, n, e);
	}
}
function isInactiveCommandTarget(e) {
	if (e instanceof AcceptedSessionIdentityError) return !1;
	if (HookNotFoundError.is(e)) return !0;
	for (let t of walkCauseChain(e)) if (WorkflowRunNotFoundError.is(t) || RunExpiredError.is(t) || EntityConflictError.is(t)) return !0;
	return !1;
}
async function resolveContinuation(e, t) {
	let n;
	try {
		n = await resolveSessionInbox(e);
	} catch (n) {
		if (HookNotFoundError.is(n)) return;
		let r = n;
		if (n instanceof StrandedSessionOwnerError) {
			if (t?.runnable === !0) throw sessionStrandedError(n);
			try {
				return { sessionId: await resolveStrandedSessionId(n) };
			} catch (e) {
				r = e;
			}
		}
		throw log$30.error(`failed to resolve session by continuation token`, { error: formatCapabilityError(r, [e]) }), r;
	}
	if (t?.runnable !== !0) return n;
	try {
		await assertRunnableSessionInbox(sessionInboxHookToken(sessionCommandHookToken(n.sessionId)));
	} catch (e) {
		throw e instanceof StrandedSessionOwnerError ? sessionStrandedError(e) : e;
	}
	return n;
}
async function hasRunEnded(e) {
	return await durableRunEnded(workflowHost, e);
}
async function startWorkflowOnCurrentDeployment(e, t, n) {
	return await startWorkflowOnDeployment(e, t, await resolveCurrentWorkflowDeploymentId(), n);
}
async function startWorkflowOnDeployment(e, t, n, r, i) {
	return await withWorkflowStartContext(async () => {
		if (n.length === 0 || n === `latest`) throw Error(`Workflow starts require an exact deployment id.`);
		let a = {
			...r,
			allowReservedAttributes: !0,
			attributes: {
				...r?.attributes,
				["$eve.version"]: EVE_PACKAGE_INFO.version
			},
			deploymentId: n
		};
		if (i === void 0) return await (0, runtime_exports.start)(e, t, a);
		let o = pinRunId(await (0, runtime_exports.getWorld)(), a);
		let s = await (0, runtime_exports.start)(e, t, {
			...a,
			experimental_hook: i(o.runId),
			world: o.world
		});
		if (s.runId !== o.runId) throw await s.cancel().catch(() => {}), Error(`Workflow started run "${s.runId}" instead of the pinned "${o.runId}", so its claimed hook names the wrong run.`);
		return s;
	});
}
async function resolveCurrentWorkflowDeploymentId() {
	let e = process.env.VERCEL_DEPLOYMENT_ID?.trim() || await (await (0, runtime_exports.getWorld)()).getDeploymentId();
	if (e.length === 0 || e === `latest`) throw Error(`Workflow runtime could not resolve an exact deployment id.`);
	return e;
}
async function withWorkflowStartContext(e) {
	let t = context.active();
	let n = isAgentTraceContext(t) ? trace.deleteSpan(t) : t;
	return await context.with(n, e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/events/owner.js
async function bindingContext(e, t) {
	let n = new ContextContainer({ localDevRequest: void 0 });
	return n.set(SessionAgentKey, await compiledSessionAgent(t)), n.set(AuthKey, e.auth), e.traceSeed !== void 0 && n.set(SessionTraceSeedKey, e.traceSeed), n.set(SessionIdKey, e.sessionId), serializeContext(n);
}
async function startConnectionEventOwner(e, t, n) {
	let r = await readSubscribeOutcome((await startWorkflowOnCurrentDeployment(connectionEventWorkflowReference, [{
		binding: e,
		serializedContext: await bindingContext(e, t)
	}])).runId, n);
	return r && subscriptionFromOutcome(r);
}
async function startConnectionEventDeliveryRun(e) {
	await startWorkflowOnCurrentDeployment(connectionEventDeliveryWorkflowReference, [e]);
}
function subscriptionFromOutcome(e) {
	if (`error` in e) throw Object.assign(Error(e.error), { status: e.status });
	return e.subscription;
}
async function findConnectionEventOwner(e) {
	let t;
	try {
		t = await (0, runtime_exports.getHookByToken)(connectionEventHookToken(e));
	} catch (e) {
		if (HookNotFoundError.is(e)) return;
		throw e;
	}
	let n = await readPublishedOutcomeNow(t.runId);
	if (n === void 0 || `subscription` in n) return {
		owner: await t.metadata,
		subscription: n?.subscription
	};
}
async function retireConnectionEventOwner(e) {
	return resumeWatch(e, { kind: `retire` });
}
async function resumeWatch(e, t) {
	try {
		return await (0, runtime_exports.resumeHook)(connectionEventHookToken(e), t), !0;
	} catch (e) {
		if (HookNotFoundError.is(e)) return !1;
		throw e;
	}
}
async function readSubscribeOutcome(e, t) {
	let n = await readPublishedOutcome(e, t);
	if (n === void 0 || !(`ownerRunId` in n)) return n;
	let r = await readPublishedOutcome(n.ownerRunId, t);
	if (r !== void 0 && `ownerRunId` in r) throw Error(`Event handler ownership did not resolve.`);
	return r;
}
async function readPublishedOutcomeNow(e) {
	let t = (0, runtime_exports.getRun)(e).getReadable({ namespace: "eve.connection-event.subscription" });
	let n = await t.getTailIndex();
	return await t.cancel().catch(() => {}), n < 0 ? void 0 : readPublishedOutcome(e);
}
async function readPublishedOutcome(e, t) {
	let n = (0, runtime_exports.getRun)(e).getReadable({ namespace: "eve.connection-event.subscription" }).getReader();
	let r = AbortSignal.any([AbortSignal.timeout(9e4), ...t === void 0 ? [] : [t]]);
	let i = new Promise((e) => {
		let abort = () => e({
			value: void 0,
			abandoned: !0
		});
		r.aborted ? abort() : r.addEventListener(`abort`, abort, { once: !0 });
	});
	try {
		let e = await Promise.race([n.read(), i]);
		if (`abandoned` in e) return;
		if (e.value === void 0) throw Error(`Event handler ended before subscribing.`);
		return e.value;
	} finally {
		await n.cancel().catch(() => {});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-host/host.js
const workflowLineStore = {
	readable: (e, t) => (0, runtime_exports.getRun)(e).getReadable({ startIndex: t }),
	async tail(e) {
		let t = (0, runtime_exports.getRun)(e).getReadable();
		try {
			let [, n] = await Promise.all([workflowLineStore.assertReadable(e), t.getTailIndex()]);
			return n;
		} finally {
			await t.cancel().catch(() => {});
		}
	},
	async assertReadable(e) {
		let t = await (await (0, runtime_exports.getWorld)()).runs.get(e, { resolveData: `none` });
		if (t.expiredAt !== void 0 && t.expiredAt.getTime() <= Date.now()) throw new RunExpiredError(`Session history is no longer available.`, e, t.status, t.expiredAt);
	}
};
const workflowHost = {
	name: `workflow`,
	deliver: async (e, t) => {
		`hook` in e ? await (0, runtime_exports.resumeHook)(e.hook, t) : `session` in e ? await resumeSessionInbox(e.session, t) : await resumeSignInCallback(e.signIn, t);
	},
	runStatus: async (e) => await (0, runtime_exports.getRun)(e).status,
	cancelRun: async (e, t) => {
		await (0, runtime_exports.cancelRun)(await (0, runtime_exports.getWorld)(), e, { cancelReason: t });
	},
	lineStore: workflowLineStore,
	createRuntime: (e) => createWorkflowRuntime(e),
	connectionEvents: {
		start: (e, t, n) => startConnectionEventOwner(e, t, n),
		find: (e) => findConnectionEventOwner(e),
		retire: (e) => retireConnectionEventOwner(e)
	},
	callbackBaseUrl() {
		try {
			let { url: e } = getWorkflowMetadata();
			return typeof e == `string` ? resolveWorkflowCallbackBaseUrl(e) : void 0;
		} catch (e) {
			if (e instanceof Error && e.name === `NotInWorkflowOrStepContextError`) return;
			throw e;
		}
	},
	stepAttempt() {
		try {
			return getStepMetadata().attempt;
		} catch (e) {
			if (e instanceof Error && e.name === `NotInStepContextError`) return;
			throw e;
		}
	}
};
function installWorkflowHost() {
	installDurableHost(workflowHost);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/builtins.js
installWorkflowHost();
async function __builtin_response_array_buffer() {
	return await this.arrayBuffer();
}
async function __builtin_response_json() {
	return await this.json();
}
async function __builtin_response_text() {
	return await this.text();
}
const EVE_UNSUPPORTED_WORLD_WARNED = Symbol.for(`@workflow/setAttributes//unsupportedWorldWarned`);
function formatUnknownError(e) {
	return e instanceof Error ? e.stack ?? `${e.name}: ${e.message}` : String(e);
}
async function __builtin_set_attributes(e, t) {
	if (e.length === 0) return;
	let n = globalThis;
	let r = n[Symbol.for(`WORKFLOW_STEP_CONTEXT_STORAGE`)]?.getStore?.();
	let i = typeof r?.stepMetadata?.attempt == `number` ? r.stepMetadata.attempt : 3;
	let a = n[Symbol.for(`@workflow/world//cache`)];
	if (typeof a?.runs?.experimentalSetAttributes != `function`) {
		if (n[EVE_UNSUPPORTED_WORLD_WARNED] !== !0) {
			n[EVE_UNSUPPORTED_WORLD_WARNED] = !0;
			let e = a?.name === void 0 ? `` : ` (${a.name})`;
			console.warn(`[eve] setAttributes: the current world implementation${e} does not implement experimentalSetAttributes; this call (and any subsequent setAttributes calls in this process) is a no-op. Attributes will become available once the world adapter adds support.`);
		}
	} else try {
		let n = r?.workflowMetadata?.workflowRunId;
		if (n === void 0) throw Error(`__builtin_set_attributes: no workflow run id available in step context`);
		await a.runs.experimentalSetAttributes(n, e, t);
	} catch (e) {
		if (i < 3) throw e;
		console.error(`[eve] setAttributes: failed to post tags after 3 attempts; dropping the internal attribute write. ${formatUnknownError(e)}`);
	}
}
__builtin_set_attributes.maxRetries = 2;
registerStepFunction("__builtin_response_array_buffer", __builtin_response_array_buffer);
registerStepFunction("__builtin_response_json", __builtin_response_json);
registerStepFunction("__builtin_response_text", __builtin_response_text);
registerStepFunction("__builtin_set_attributes", __builtin_set_attributes);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/invocation.js
const formatSubagentInputByType = {
	runtime(e) {
		return formatSubagentPrompt({
			descriptionLines: [],
			message: e.message,
			name: e.name
		});
	},
	local(e) {
		return formatSubagentPrompt({
			descriptionLines: formatDescriptionLines(e.description),
			message: e.message,
			name: e.name
		});
	},
	remote(e) {
		return formatSubagentPrompt({
			descriptionLines: formatDescriptionLines(e.description),
			message: e.message,
			name: e.name
		});
	}
};
function formatSubagentInput(e) {
	switch (e.type) {
		case `runtime`: return formatSubagentInputByType.runtime(e);
		case `local`: return formatSubagentInputByType.local(e);
		case `remote`: return formatSubagentInputByType.remote(e);
		default: return e;
	}
}
function formatSubagentPrompt(e) {
	let t = [
		`You are the subagent "${e.name}".`,
		...e.descriptionLines,
		``,
		`The caller delegated the following task to you. Complete it and return the result directly. The caller may send follow-up messages after you answer.`,
		``,
		`Caller message:`,
		...typeof e.message == `string` ? [e.message] : []
	].join(`
`);
	return { message: typeof e.message == `string` ? t : [{
		type: `text`,
		text: t
	}, ...e.message] };
}
function formatDescriptionLines(e) {
	return e.trim().length > 0 ? [`Description: ${e}`] : [];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session.js
function createSession(e) {
	return {
		compaction: {},
		continuationToken: e.continuationToken,
		history: [],
		sessionId: e.sessionId,
		...e.rootSessionId !== void 0 && { rootSessionId: e.rootSessionId },
		...e.outputSchema !== void 0 && { outputSchema: e.outputSchema }
	};
}
function mintSubagentContinuationToken(e) {
	return `subagent:${e ?? crypto.randomUUID()}`;
}
function projectToDurableSession(e) {
	let t = e.compaction;
	return {
		continuationToken: e.continuationToken,
		sessionId: e.sessionId,
		...Object.values(t).some((e) => e !== void 0) && { compaction: t },
		...e.rootSessionId !== void 0 && { rootSessionId: e.rootSessionId },
		...e.outputSchema !== void 0 && { outputSchema: e.outputSchema },
		...e.sandboxState !== void 0 && { sandboxState: e.sandboxState },
		...e.state !== void 0 && { state: e.state }
	};
}
function hydrateDurableSession(e) {
	let { compaction: t, ...n } = e;
	return {
		...n,
		compaction: t ?? {}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/tool.js
function buildSubagentRunInput(e) {
	let { action: t, auth: n, capabilities: r, channelMetadata: i, inheritedConversation: a, initiatorAuth: o, session: s, source: c } = e;
	let l = mintSubagentContinuationToken(e.continuationKey);
	let u = {
		callId: t.callId,
		parentContinuationToken: e.parent.continuationToken ?? s.continuationToken,
		parentSessionId: s.sessionId,
		subagentName: t.subagentName
	};
	(e.graph?.nodesByNodeId.get(t.nodeId)?.sandboxRegistry.sandbox?.definition.kind === `parent` || e.selfAgent) && (s.sandboxState !== void 0 && (u.parentSandboxState = s.sandboxState), u.sandboxSessionId = e.sandboxSessionId ?? s.sessionId);
	let d = {
		adapter: {
			kind: "subagent",
			state: u
		},
		auth: n,
		capabilities: r,
		schedule: e.schedule,
		channelMetadata: i,
		inheritedConversation: a,
		continuationToken: l,
		initiatorAuth: o,
		input: {
			message: formatSubagentCallInputMessage({
				action: t,
				source: c
			}),
			outputSchema: t.input.outputSchema
		},
		conversationId: e.parent.conversationId,
		parent: e.parent.lineage,
		parentTraceContext: e.parent.traceContext,
		traceRoot: e.parent.traceRoot
	};
	return e.steeredBy !== void 0 && e.steeredBy.length > 0 && (d.steeredBy = e.steeredBy), {
		childContinuationToken: l,
		runInput: d
	};
}
function formatSubagentCallInputMessage(e) {
	let { message: t } = e.action.input;
	switch (e.source.type) {
		case `local`: return formatSubagentInput({
			description: e.source.description,
			message: t,
			name: e.action.subagentName,
			type: `local`
		}).message;
		case `runtime`: return formatSubagentInput({
			message: t,
			name: e.action.subagentName,
			type: `runtime`
		}).message;
		default: return e.source;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/start.js
function localAgentSendCommand(e, t) {
	let { address: n, context: r } = e;
	return {
		auth: e.auth.current,
		schedule: r.schedule,
		caller: {
			callId: r.parent.callId,
			replyTo: {
				kind: `hook`,
				token: e.replyTo
			},
			subagentName: n.name
		},
		kind: `send`,
		delivery: {
			channelKind: `subagent`,
			channelName: `subagent`,
			deliveryId: t
		},
		payload: {
			message: e.message,
			outputSchema: e.outputSchema
		},
		...e.auth.steeredBy !== void 0 && e.auth.steeredBy.length > 0 && { steeredBy: e.auth.steeredBy }
	};
}
function agentSessionResetCommand(e) {
	return {
		kind: `reset`,
		reason: "The workflow run that opened this session finished.",
		deliveryId: e
	};
}
function prepareLocalAgentSession(e) {
	let { auth: t, context: n, roster: r, target: i } = e;
	let { action: a } = i;
	let { childContinuationToken: o, runInput: s } = buildSubagentRunInput({
		action: a,
		auth: t.current,
		capabilities: n.capabilities,
		schedule: n.schedule,
		channelMetadata: n.channelMetadata,
		continuationKey: e.key,
		graph: r.graph,
		inheritedConversation: n.conversation,
		initiatorAuth: t.initiator,
		parent: createParentContext(n, e.replyTo),
		sandboxSessionId: n.sandbox.sessionId,
		selfAgent: i.source.type === `runtime`,
		session: {
			continuationToken: e.replyTo,
			sandboxState: n.sandbox.state,
			sessionId: n.parent.sessionId
		},
		source: i.source,
		steeredBy: t.steeredBy
	});
	let c = n.toolStubs;
	c !== void 0 && (c = {
		...c,
		agentPath: stubToolPath(c, a.name)
	});
	let l = `agent-session:${e.key}:initial`;
	return {
		address: (e) => ({
			continuationToken: o,
			kind: `local`,
			name: a.name,
			nodeId: a.nodeId,
			sessionId: e
		}),
		childContinuationToken: o,
		deliveryId: l,
		runInput: {
			...s,
			delivery: {
				channelKind: `subagent`,
				channelName: `subagent`,
				deliveryId: l
			},
			toolStubs: c
		},
		runtime: r.childRuntime(i, e.runtimeOverrides)
	};
}
async function resolveAgentSessionStart(e) {
	let { context: t } = e;
	let n = await loadAgentRoster(t);
	let r = n.resolveAction(t.parent.callId, {
		message: e.message,
		outputSchema: e.outputSchema,
		target: e.name
	});
	let i = n.startTarget(r, t.parent.rootSessionId === t.parent.sessionId);
	if (e.model !== void 0 && i.kind === `remote`) throw new NonRetryableError(`ctx.agent("${e.name}", { model }) cannot override a remote agent's model. Configure the model on the receiving agent.`);
	let a = e.model === void 0 ? void 0 : await n.runtimeOverrides(e.name, e.model, e.toolName);
	return {
		agentName: r.name,
		auth: e.auth,
		context: t,
		key: e.key,
		replyTo: e.replyTo,
		roster: n,
		runtimeOverrides: a,
		target: i
	};
}
function createParentContext(e, t) {
	return {
		continuationToken: t,
		conversationId: e.trace.conversationId ?? resolveConversationId(e.parent.rootSessionId),
		lineage: e.parent,
		originAudience: e.trace.originAudience,
		traceContext: e.trace.parentTraceContext,
		traceRoot: e.traceRoot
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/remote-credentials.js
async function remoteAgentCredentials(e) {
	let t = e.resolvers.find(({ nodeId: t }) => t === e.nodeId);
	let { binding: n } = e;
	if (t === void 0 || n === void 0) throw Error(`Remote agent "${e.destination.name}" carries credentials, but this deployment can't build them from what the session kept for its child.`);
	let r = t.logicalPath;
	let i = await foldSessionViewTo(n.session.id, n.position);
	let a = openMemos({
		abortSignal: e.abortSignal ?? new AbortController().signal,
		kept: n.memos,
		label: r,
		restoring: `a remote agent's credentials are built from the memos its child was opened with, and this memo isn't one of them. Key the memo on what the child was opened with`,
		scope: `subagent:${e.nodeId}`,
		sessionId: n.session.id
	});
	let o = {
		channel: n.channel,
		...n.conversation !== void 0 && { conversation: n.conversation },
		now: new Date(n.at),
		session: n.session,
		turn: latestTurn(i),
		view: snapshotOf(i),
		memo: a.memo,
		messages: async () => {
			throw Error(`"${r}" read ctx.messages() while eve rebuilt a remote agent's credentials for its child, where the conversation as it was isn't available. Decide from the conversation inside a memo, so the child keeps the decision.`);
		},
		getSandbox: () => {
			throw Error(`"${r}" called ctx.getSandbox() while eve rebuilt a remote agent's credentials for its child, where the parent's sandbox isn't available. Read the sandbox inside a memo, so the child keeps what it read.`);
		},
		model: { id: n.model ?? `` }
	};
	let s;
	try {
		s = await t.evaluate(o);
	} finally {
		a.close();
	}
	if (s == null || s.kind !== `remote`) throw destinationChanged(e.destination.name);
	let c = await normalizeDynamicRemoteAgent({
		name: t.name,
		value: s
	});
	if (t.name !== e.destination.name || c.config.url !== e.destination.url) throw destinationChanged(e.destination.name);
	return c.credentials ?? {};
}
function destinationChanged(e) {
	return Error(`Remote agent "${e}" now resolves to another destination than the one its child was opened at, so eve doesn't send its credentials. Open a new child.`);
}
async function foldSessionViewTo(e, t) {
	let n = emptySessionView();
	for await (let { line: r, position: i } of streamSessionLines(e, { follow: !1 })) {
		if (i > t) break;
		r !== void 0 && foldLine(n, r, i);
	}
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/cancel-turn.js
const CancelTurnResponseSchema = z.discriminatedUnion(`status`, [z.strictObject({
	ok: z.literal(!0),
	sessionId: z.string().min(1),
	status: z.literal(`accepted`)
}), z.strictObject({
	ok: z.literal(!0),
	status: z.literal(`no_active_turn`)
})]);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/reset-session.js
const ResetResponseSchema = z.discriminatedUnion(`status`, [z.object({
	ok: z.literal(!0),
	previousSessionId: z.string().min(1),
	status: z.literal(`reset`)
}), z.object({
	ok: z.literal(!0),
	status: z.literal(`no_active_session`)
})]);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/remote-route-url.js
function createRemoteAgentRouteUrl(e, t) {
	let n = new URL(t, `http://eve.local`);
	let r = new URL(e);
	return r.pathname = joinEveRoutePath(r.pathname, n.pathname), r.search = n.search, r.hash = n.hash, r.toString();
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/remote.js
const DeliveryReceiptResponseSchema = z.object({
	ok: z.literal(!0),
	sessionId: z.string().min(1),
	deliveryId: z.string().min(1)
});
const AnswerReceiptResponseSchema = DeliveryReceiptResponseSchema.extend({ deliveryId: z.string().min(1).max(256) });
const ProtocolRejectionSchema = z.object({
	code: z.literal("REMOTE_AGENT_PROTOCOL_MISMATCH"),
	ok: z.unknown().optional(),
	protocolVersion: z.unknown().optional(),
	sessionId: z.unknown().optional()
});
const RemoteCancelResponseSchema = z.union([DeliveryReceiptResponseSchema.transform(({ sessionId: e }) => ({
	sessionId: e,
	status: `accepted`
})), CancelTurnResponseSchema]);
const RemoteResetResponseSchema = z.union([DeliveryReceiptResponseSchema.transform(({ sessionId: e }) => ({
	ok: !0,
	previousSessionId: e,
	status: `reset`
})), ResetResponseSchema]);
const CreateSessionResponseSchema = z.object({
	ok: z.literal(!0),
	protocolVersion: z.number().optional(),
	sessionId: z.string().min(1)
}).and(z.union([z.object({ deliveryId: z.string().min(1) }), z.object({ status: z.literal(`accepted`) })]));
const UNKNOWN_REMOTE_OUTCOME = `The request may have completed on the remote agent. Do not retry automatically; check the remote outcome before sending the request again.`;
async function startRemoteAgentSession(e) {
	let t = e.parent?.continuationToken ?? e.session.continuationToken;
	if (!t) throw Error(`Cannot dispatch remote agent without a parent continuation token.`);
	if (!e.callbackBaseUrl) throw Error(`Cannot dispatch remote agent without a callback base URL.`);
	let n = buildForwardedPrincipalField(e);
	let r = {
		capabilities: e.capabilities ?? {},
		callback: {
			callId: e.action.callId,
			subagentName: e.action.remoteAgentName,
			token: t,
			url: callbackUrlForProtocol(createWorkflowCallbackUrl(e.callbackBaseUrl, createEveCallbackRoutePath(t)), 3)
		},
		message: formatRemoteAgentCallInputMessage({
			action: e.action,
			remote: e.remote
		}),
		outputSchema: e.action.input.outputSchema,
		protocolVersion: 3
	};
	n !== void 0 && (r.forwardedPrincipal = n), e.operationId !== void 0 && (r.operationId = e.operationId);
	let post = async () => {
		let t = await resolveRemoteAgentRequestHeaders(e.remote);
		let i = formatTraceparent(e.parent?.traceContext);
		i !== void 0 && setHeader(t, `traceparent`, i), setHeader(t, `tracestate`, writeAgentDispatchTracestate(readHeader(t, `tracestate`), e.parent?.traceContext));
		let a = writeForwardedAudienceBaggage(readHeader(t, `baggage`), buildForwardedTraceAssertion({
			forwardedPrincipal: n,
			originAudience: e.originAudience,
			parentTraceContext: e.parent?.traceContext,
			traceparent: i
		}));
		let o = writeConversationBaggage(a, e.parent?.conversationId);
		return setHeader(t, `baggage`, writeForwardedParentSessionBaggage(o, e.parent?.lineage)), agentDelegation.fetch(createRemoteAgentSessionUrl(e.remote), {
			body: JSON.stringify(r),
			headers: {
				"content-type": `application/json`,
				...t
			},
			method: `POST`
		});
	};
	let i = await post();
	let a = i.ok ? void 0 : await readProtocolRejection(i);
	if (i.status === 409 && a?.refusedBeforeAdmission && servesRemoteAgentCaller(a.version) && a.version < 3 && (r.protocolVersion = a.version, r.callback.url = callbackUrlForProtocol(r.callback.url, a.version), i = await post(), a = i.ok ? void 0 : await readProtocolRejection(i)), !i.ok) throw a ? new NonRetryableError(formatRemoteAgentProtocolMismatch({
		name: e.action.remoteAgentName,
		receiverVersion: a.version
	})) : Error(`Remote agent "${e.action.remoteAgentName}" create-session request failed with HTTP ${i.status}.`);
	let o;
	try {
		o = await i.json();
	} catch {
		throw new NonRetryableError(`Remote agent "${e.action.remoteAgentName}" create-session response was not valid JSON. ${UNKNOWN_REMOTE_OUTCOME}`);
	}
	let s = CreateSessionResponseSchema.safeParse(o);
	if (!s.success) throw new NonRetryableError(`Remote agent "${e.action.remoteAgentName}" create-session response was invalid. ${UNKNOWN_REMOTE_OUTCOME}`);
	let c = readRemoteAgentProtocolVersion(s.data.protocolVersion);
	if (!servesRemoteAgentCaller(c)) throw new NonRetryableError(`${formatRemoteAgentProtocolMismatch({
		name: e.action.remoteAgentName,
		receiverVersion: c
	})} ${UNKNOWN_REMOTE_OUTCOME} Remote session: ${s.data.sessionId}.`);
	return c === 3 ? `deliveryId` in s.data ? {
		deliveryId: s.data.deliveryId,
		sessionId: s.data.sessionId
	} : { sessionId: s.data.sessionId } : {
		earlierProtocol: c,
		sessionId: s.data.sessionId
	};
}
async function readProtocolRejection(e) {
	let t = ProtocolRejectionSchema.safeParse(await e.json().catch(() => void 0));
	if (t.success) return {
		version: readRemoteAgentProtocolVersion(t.data.protocolVersion),
		refusedBeforeAdmission: t.data.ok === !1 && t.data.sessionId === void 0 && typeof t.data.protocolVersion == `number`
	};
}
function buildForwardedTraceAssertion(e) {
	let t = decisionToTraceContentCeiling(e.parentTraceContext?.decision);
	if (e.forwardedPrincipal !== void 0 && e.parentTraceContext !== void 0 && (e.parentTraceContext.traceFlags & 1) == 1 && e.traceparent !== void 0 && t !== void 0) return {
		ceiling: t,
		originAudience: e.originAudience ?? `unknown`
	};
}
async function respondToRemoteAgentSession(e) {
	let t = await fetch(createRemoteAgentRouteUrl(e.remote.url, createEveSessionRoutePath(e.remote.sessionId)), {
		body: JSON.stringify({
			...e.remote.earlierProtocol === 2 ? { inputResponses: e.responses.map(({ interactionId: e, optionId: t, text: n }) => ({
				requestId: e,
				...t !== void 0 && { optionId: t },
				...n !== void 0 && { text: n }
			})) } : { answers: e.responses },
			...e.remote.earlierProtocol === void 0 && e.idempotencyKey !== void 0 && { idempotencyKey: e.idempotencyKey },
			...e.remote.forwardPrincipal === !0 && e.auth != null && { forwardedPrincipal: { current: e.auth } }
		}),
		headers: {
			"content-type": `application/json`,
			...e.headers
		},
		method: `POST`,
		redirect: `error`
	});
	if (!t.ok) throw Error(`Remote agent "${e.remote.name}" input answer failed with HTTP ${t.status}.`);
	if (e.remote.earlierProtocol !== void 0) return;
	let n = AnswerReceiptResponseSchema.safeParse(await t.json().catch(() => null));
	return n.success && n.data.sessionId === e.remote.sessionId ? n.data.deliveryId : void 0;
}
async function continueRemoteAgentSession(e) {
	let t = buildForwardedPrincipalField(e);
	let n = {
		callback: {
			...e.callback,
			url: callbackUrlForProtocol(e.callback.url, e.earlierProtocol ?? 3)
		},
		message: e.message,
		outputSchema: e.outputSchema
	};
	e.earlierProtocol === void 0 && e.idempotencyKey !== void 0 && (n.idempotencyKey = e.idempotencyKey), t !== void 0 && (n.forwardedPrincipal = t);
	let r = await fetch(createRemoteAgentContinueUrl(e.remote, e.sessionId), {
		body: JSON.stringify(n),
		headers: {
			"content-type": `application/json`,
			...await resolveRemoteAgentRequestHeaders(e.remote)
		},
		method: `POST`
	});
	if (!r.ok) {
		let n = r.status === 400 && t !== void 0 ? ` The receiver may support forwarded principals only on session creation; upgrade it before retrying.` : ``;
		throw Error(`Remote agent "${e.remote.name}" continue-session request failed with HTTP ${r.status}.${n}`);
	}
	if (e.earlierProtocol !== void 0) return { sessionId: e.sessionId };
	let i = DeliveryReceiptResponseSchema.safeParse(await r.json().catch(() => null));
	if (!i.success) throw Error(`Remote agent "${e.remote.name}" continue-session response was not a delivery receipt. The message may have been accepted.`);
	return {
		deliveryId: i.data.deliveryId,
		sessionId: i.data.sessionId
	};
}
function buildForwardedPrincipalField(e) {
	if (e.remote.forwardPrincipal !== !0 || e.auth === null || e.auth === void 0) return;
	let t = { current: e.auth };
	return e.initiatorAuth !== null && e.initiatorAuth !== void 0 && (t.initiator = e.initiatorAuth), t;
}
async function cancelRemoteAgentTurn(e) {
	let t = await fetch(createRemoteAgentCancelTurnUrl(e.remote, e.sessionId), {
		headers: await resolveRemoteAgentRequestHeaders(e.remote),
		method: `POST`
	});
	if (!t.ok) throw Error(`Remote agent "${e.remote.name}" cancel-turn request failed with HTTP ${t.status}.`);
	let n;
	try {
		n = await t.json();
	} catch {
		throw Error(`Remote agent "${e.remote.name}" cancel-turn response was not valid JSON.`);
	}
	let r = RemoteCancelResponseSchema.safeParse(n);
	if (!r.success || r.data.status === `accepted` && r.data.sessionId !== e.sessionId) throw Error(`Remote agent "${e.remote.name}" cancel-turn response was invalid.`);
	return r.data.status === `accepted` ? {
		sessionId: r.data.sessionId,
		status: `accepted`
	} : { status: `no_active_turn` };
}
function readHeader(e, t) {
	let n = Object.keys(e).find((e) => e.toLowerCase() === t);
	return n === void 0 ? void 0 : e[n];
}
function setHeader(e, t, n) {
	for (let n of Object.keys(e)) n.toLowerCase() === t && delete e[n];
	n !== void 0 && (e[t] = n);
}
async function resetRemoteAgentSession(e) {
	let t = await resolveRemoteAgentRequestHeaders(e.remote);
	let n = await fetch(createRemoteAgentRouteUrl(e.remote.url, createEveSessionResetRoutePath(e.sessionId)), {
		body: JSON.stringify({ reason: e.reason }),
		headers: {
			"content-type": `application/json`,
			...t
		},
		method: `POST`
	});
	if (!n.ok) throw Error(`Remote agent "${e.remote.name}" reset-session request failed with HTTP ${n.status}.`);
	let r = RemoteResetResponseSchema.safeParse(await n.json());
	if (!r.success || r.data.status === `reset` && r.data.previousSessionId !== e.sessionId) throw Error(`Remote agent "${e.remote.name}" reset-session response was invalid.`);
	return r.data;
}
function resolveRemoteAgentForAction(e) {
	let t = e.registry.get(e.nodeId)?.definition;
	if (e.dynamicRemoteAgent !== void 0) {
		if (t === void 0) throw new NonRetryableError(`Missing remote agent "${e.remoteAgentName}" in runtime registry.`);
		let n = e.dynamicRemoteAgent;
		let r = {
			description: n.description,
			kind: `remote`,
			logicalPath: t.logicalPath,
			name: e.remoteAgentName,
			nodeId: e.nodeId,
			path: n.path,
			sourceId: t.sourceId,
			sourceKind: `module`,
			url: n.url
		};
		return n.forwardPrincipal !== void 0 && (r.forwardPrincipal = n.forwardPrincipal), e.credentials?.auth !== void 0 && (r.auth = e.credentials.auth), e.credentials?.headers !== void 0 && (r.headers = e.credentials.headers), r;
	}
	if (t?.kind !== `remote`) throw new NonRetryableError(`Missing remote agent "${e.remoteAgentName}" in runtime registry.`);
	return t;
}
async function resolveRemoteAgentStreamHeaders(e) {
	if (e.resolverId === void 0) return {};
	let t = /* @__PURE__ */ new Set([e.bundle.graph.root, ...e.bundle.graph.nodesByNodeId.values()]);
	for (let n of t) {
		let { dynamicNodeIds: t, dynamicResolvers: r } = n.subagentRegistry;
		if (t.has(e.resolverId)) return e.dynamicBinding === void 0 ? {} : await resolveRemoteAgentRequestHeaders(await remoteAgentCredentials({
			binding: e.dynamicBinding,
			destination: {
				name: e.name,
				url: e.url
			},
			nodeId: e.resolverId,
			resolvers: r
		}));
		let i = n.subagentRegistry.subagentsByNodeId.get(e.resolverId)?.definition;
		if (i !== void 0) {
			if (i.kind !== `remote` || i.name !== e.name || i.url !== e.url) throw Error(`Remote child stream resolver does not match the authored remote agent.`);
			return await resolveRemoteAgentRequestHeaders(i);
		}
	}
	throw Error(`This remote child's stream doesn't match an authored remote agent.`);
}
function createRemoteAgentSessionUrl(e) {
	return createRemoteAgentRouteUrl(e.url, e.path);
}
function createRemoteAgentCancelTurnUrl(e, t) {
	return createRemoteAgentRouteUrl(e.url, createEveSessionCancelRoutePath(t));
}
function createRemoteAgentContinueUrl(e, t) {
	return createRemoteAgentRouteUrl(e.url, createEveSessionRoutePath(t));
}
async function resolveRemoteAgentRequestHeaders(e) {
	let t = {};
	return e.headers !== void 0 && Object.assign(t, typeof e.headers == `function` ? await e.headers() : e.headers), e.auth !== void 0 && Object.assign(t, (await e.auth()).headers), t;
}
function formatRemoteAgentCallInputMessage(e) {
	let t = normalizeAgentMessage(e.action.input.message);
	return formatSubagentInput({
		description: e.remote.description,
		message: t,
		name: e.action.remoteAgentName,
		type: `remote`
	}).message;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/remote-session.js
async function startRemoteSession(e, t) {
	let { auth: n, context: r, target: i } = e;
	let { action: a } = i;
	let o = remoteReplyToken(e.replyTo, a.name);
	let s = remoteRegistryOf(e.roster, a.remoteAgentName);
	let c = bindingFor(r, a.nodeId);
	let l = resolveRemoteAgentForAction({
		credentials: i.dynamicRemoteAgent === void 0 ? void 0 : await credentialsOf(s, a.nodeId, c, {
			name: a.remoteAgentName,
			url: i.dynamicRemoteAgent.url
		}),
		dynamicRemoteAgent: i.dynamicRemoteAgent,
		nodeId: a.nodeId,
		registry: s.subagentsByNodeId,
		remoteAgentName: a.remoteAgentName
	});
	holdForwardedCaller(l, n.steeredBy, a.remoteAgentName);
	let { callbackBaseUrl: u } = t;
	let d = await startRemoteAgentSession({
		action: a,
		auth: n.current,
		callbackBaseUrl: u,
		capabilities: r.capabilities,
		initiatorAuth: n.initiator,
		operationId: t.operationId,
		originAudience: r.trace.originAudience,
		parent: createParentContext(r, o),
		remote: l,
		session: { continuationToken: o }
	});
	let f = {
		callbackBaseUrl: u,
		kind: `remote`,
		forwardPrincipal: l.forwardPrincipal,
		name: a.remoteAgentName,
		nodeId: a.nodeId,
		resolverId: a.nodeId,
		sessionId: d.sessionId,
		url: l.url
	};
	return c !== void 0 && (f.dynamicBinding = c), d.earlierProtocol !== void 0 && (f.earlierProtocol = d.earlierProtocol), d.deliveryId === void 0 ? { address: f } : {
		address: f,
		deliveryId: d.deliveryId
	};
}
function holdForwardedCaller(e, t, n) {
	if (e.forwardPrincipal === !0 && (t ?? []).length > 0) throw new NonRetryableError(turnSteeredMessage(`remote agent "${n}"`));
}
async function sendRemoteSessionMessage(e, t) {
	let { address: n, context: r } = e;
	let i = remoteReplyToken(e.replyTo, n.name);
	let a = await resolveSessionRemote(r, n);
	return holdForwardedCaller(a, e.auth.steeredBy, n.name), await continueRemoteAgentSession({
		auth: e.auth.current,
		callback: {
			callId: r.parent.callId,
			subagentName: n.name,
			token: i,
			url: createWorkflowCallbackUrl(n.callbackBaseUrl, createEveCallbackRoutePath(i))
		},
		earlierProtocol: n.earlierProtocol,
		idempotencyKey: t,
		message: e.message,
		outputSchema: e.outputSchema,
		remote: a,
		sessionId: n.sessionId
	});
}
function remoteReplyToken(e, t) {
	if (isRemoteReplyHookToken(e)) return e;
	throw new NonRetryableError(`Agent "${t}" is remote, but this call's context doesn't list it as remote, so its reply hook can't take a remote agent's reply. Start the call again.`);
}
async function cancelRemoteSessionTurn(e, t) {
	await cancelRemoteAgentTurn({
		remote: await resolveSessionRemote(e, t),
		sessionId: t.sessionId
	});
}
async function endRemoteSession(e, t) {
	await resetRemoteAgentSession({
		reason: "The workflow run that opened this session finished.",
		remote: await resolveSessionRemote(e, t),
		sessionId: t.sessionId
	});
}
async function resolveSessionRemote(e, t) {
	let n = remoteRegistryOf(await loadAgentRoster(e), t.name);
	let r = e.dynamicSelections[t.nodeId];
	return {
		...resolveRemoteAgentForAction({
			credentials: await credentialsOf(n, t.nodeId, t.dynamicBinding, t),
			dynamicRemoteAgent: r?.kind === `remote` ? r.remoteAgent : void 0,
			nodeId: t.nodeId,
			registry: n.subagentsByNodeId,
			remoteAgentName: t.name
		}),
		url: t.url
	};
}
function bindingFor(e, t) {
	let n = e.dynamicSelections[t];
	return n?.kind === `remote` && n.remoteAgent.credentials === !0 ? n.binding : void 0;
}
async function credentialsOf(e, t, n, r) {
	if (n !== void 0) return await remoteAgentCredentials({
		binding: n,
		destination: r,
		nodeId: t,
		resolvers: e.dynamicResolvers
	});
}
function remoteRegistryOf(e, t) {
	if (e.remote !== void 0) return e.remote;
	throw new NonRetryableError(`Agent "${t}" is remote, which only an agent compiled from files can call.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/sessions-over.js
const log$29 = createLogger(`execution.agent-sessions`);
function agentSessionsOver(e) {
	let { local: t } = e;
	let remoteAccess = (t) => {
		if (e.remote !== void 0) return e.remote;
		throw new NonRetryableError(`Agent "${t}" is remote, and this host can't reach remote agents yet. Run the agent with \`eve dev\` or deploy it.`);
	};
	let end = async (n) => {
		let { address: r, context: i } = n;
		try {
			if (r.kind === `remote`) {
				await endRemoteSession(i, r);
				return;
			}
			await t.command({
				...n,
				address: r
			}, agentSessionResetCommand(e.deliveryId(`reset`, r.sessionId)));
		} catch (e) {
			logError(log$29, `failed to end an agent session`, e, {
				name: r.name,
				sessionId: r.sessionId
			});
		}
	};
	return {
		async open(e) {
			let n = await resolveAgentSessionStart(e);
			let { target: r } = n;
			return await agentDelegation.resume({
				context: e.context,
				agentName: n.agentName
			}, () => r.kind === `remote` ? startRemoteSession({
				...n,
				target: r
			}, {
				callbackBaseUrl: remoteAccess(n.agentName).callbackBaseUrl(),
				operationId: `agent-session:${n.key}`
			}) : t.start(prepareLocalAgentSession({
				...n,
				target: r
			}), n));
		},
		async send(n) {
			let { address: r } = n;
			let i = e.deliveryId(`send`, r.sessionId);
			if (r.kind === `remote`) return await sendRemoteSessionMessage({
				...n,
				address: r
			}, i);
			let a = await t.command({
				...n,
				address: r
			}, localAgentSendCommand({
				...n,
				address: r
			}, i)).catch((e) => {
				throw SessionStrandedError.is(e) ? Error(`Agent "${r.name}" can no longer receive messages: ${e.message}`, { cause: e }) : e;
			});
			if (a.status !== `accepted`) throw Error(`Agent "${r.name}" can no longer receive messages; its session ended.`);
			return {
				deliveryId: i,
				sessionId: a.sessionId
			};
		},
		async cancelTurn(n) {
			let { address: r, context: i } = n;
			try {
				if (r.kind === `remote`) {
					await cancelRemoteSessionTurn(i, r);
					return;
				}
				await t.command({
					...n,
					address: r
				}, {
					kind: `cancel`,
					deliveryId: e.deliveryId(`cancel`, r.sessionId)
				});
			} catch (e) {
				logError(log$29, `failed to cancel an agent session turn`, e, {
					name: r.name,
					sessionId: r.sessionId
				});
			}
		},
		async end({ sessions: e }) {
			await Promise.all(e.map(end));
		},
		async stopLate(n) {
			if (n.address.kind === `remote`) {
				await end(n);
				return;
			}
			let { sessionId: r } = n.address;
			try {
				await t.commandLate(r, agentSessionResetCommand(e.deliveryId(`reset`, r)));
			} catch (e) {
				logError(log$29, `could not stop late child; cleanup is best effort`, e, { sessionId: r });
			}
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/steps.js
const workflowAgentSessions = agentSessionsOver({
	deliveryId: (e, t) => `agent-session:${getWorkflowMetadata().workflowRunId}:${getStepMetadata().stepId}:${t}:${e}`,
	local: {
		async start(e, { context: t }) {
			let n = createWorkflowRuntime(e.runtime);
			let r = await contextStorage.run(new ContextContainer({ localDevRequest: t.localDevRequest }), () => n.createSession(e.runInput));
			return {
				address: e.address(r.sessionId),
				deliveryId: e.deliveryId
			};
		},
		async command(e, t) {
			let { continuationToken: n, sessionId: r } = e.address;
			let i = await dispatchWorkflowSessionCommand({
				command: t,
				sessionId: r
			});
			if (i.status === `accepted` || i.status === `reset`) return i;
			let a = (await resolveContinuation(n))?.sessionId;
			return a === void 0 || a === r ? i : await dispatchWorkflowSessionCommand({
				command: t,
				sessionId: a
			});
		},
		async commandLate(e, t) {
			try {
				await (0, runtime_exports.resumeHook)(sessionInboxHookToken(sessionCommandHookToken(e)), t);
			} catch (n) {
				if (!HookNotFoundError.is(n) || await resumeSessionStartHook(e, t) === void 0) throw n;
			}
		}
	},
	remote: { callbackBaseUrl: () => resolveWorkflowCallbackBaseUrl(getWorkflowMetadata().url) }
});
async function openAgentSessionStep(e) {
	return await workflowAgentSessions.open(e);
}
async function sendAgentSessionMessageStep(e) {
	return await workflowAgentSessions.send(e);
}
async function createRemoteReplyTokenStep() {
	return remoteReplyHookToken(crypto.randomUUID());
}
async function cancelAgentSessionTurnStep(e) {
	await workflowAgentSessions.cancelTurn(e);
}
async function endAgentSessionsStep(e) {
	await workflowAgentSessions.end(e);
}
async function stopLateAgentSessionStep(e) {
	await workflowAgentSessions.stopLate(e);
}
registerStepFunction("step//eve@1.4.0//openAgentSessionStep", openAgentSessionStep);
registerStepFunction("step//eve@1.4.0//sendAgentSessionMessageStep", sendAgentSessionMessageStep);
registerStepFunction("step//eve@1.4.0//createRemoteReplyTokenStep", createRemoteReplyTokenStep);
registerStepFunction("step//eve@1.4.0//cancelAgentSessionTurnStep", cancelAgentSessionTurnStep);
registerStepFunction("step//eve@1.4.0//endAgentSessionsStep", endAgentSessionsStep);
registerStepFunction("step//eve@1.4.0//stopLateAgentSessionStep", stopLateAgentSessionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/close-session-stream-step.js
async function closeSessionStreamStep(e) {
	try {
		let t = e.sessionWritable.getWriter();
		try {
			await t.close();
		} finally {
			t.releaseLock();
		}
	} catch {}
}
registerStepFunction("step//eve@1.4.0//closeSessionStreamStep", closeSessionStreamStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/continuation-conflict-step.js
async function settleContinuationConflictStep(e) {
	await resumeSessionInbox(e.continuationToken, e.command);
}
registerStepFunction("step//eve@1.4.0//settleContinuationConflictStep", settleContinuationConflictStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/active-connections.js
const activeSandboxConnections = /* @__PURE__ */ new Map();
function createKey(e) {
	return `${e.providerName}\0${e.sessionId}`;
}
function trackActiveSandboxConnection(e) {
	activeSandboxConnections.set(createKey(e), e.connection);
}
function untrackActiveSandboxConnection(e) {
	let t = createKey(e);
	(e.connection === void 0 || activeSandboxConnections.get(t) === e.connection) && activeSandboxConnections.delete(t);
}
function isToolSessionId(e) {
	return e.startsWith("tool_session_");
}
const sandboxPreparedArtifactSchema = z.lazy(() => z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.array(sandboxPreparedArtifactSchema),
	z.record(z.string(), sandboxPreparedArtifactSchema)
]));
const sandboxPreparedArtifactsManifestSchema = z.object({
	entries: z.array(z.object({
		artifact: sandboxPreparedArtifactSchema,
		nodeId: z.string().min(1),
		providerName: z.string().min(1)
	}).strict()),
	kind: z.literal("eve-sandbox-prepared-artifacts"),
	version: z.literal(2)
}).strict();
function createSandboxPreparedArtifactsManifest(e) {
	return {
		entries: [...e].sort((e, t) => e.nodeId.localeCompare(t.nodeId)),
		kind: "eve-sandbox-prepared-artifacts",
		version: 2
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/sandbox/prepared-artifacts.js
async function writeSandboxPreparedArtifactsManifest(e) {
	if (e.entries.length === 0) return;
	let t = `${e.compileDirectoryPath}/sandbox-prepared-artifacts.json`;
	let n = null;
	try {
		n = sandboxPreparedArtifactsManifestSchema.parse(JSON.parse(await readFile(t, `utf8`)));
	} catch (e) {
		if (!(e instanceof Error && `code` in e && e.code === `ENOENT`)) throw e;
	}
	let r = new Map(n?.entries.map((e) => [e.nodeId, e]));
	for (let t of e.entries) r.set(t.nodeId, t);
	let i = `${t}.${randomUUID()}.tmp`;
	try {
		await writeFile(i, `${JSON.stringify(createSandboxPreparedArtifactsManifest([...r.values()]), null, 2)}\n`), await rename(i, t);
	} finally {
		await rm(i, { force: !0 });
	}
}
async function loadSandboxPreparedArtifact(e) {
	let t = (await loadSandboxPreparedArtifactsManifest(e.compiledArtifactsSource))?.entries.find((t) => t.nodeId === e.nodeId);
	if (t !== void 0 && t.providerName !== e.providerName) throw Error(`The prepared sandbox artifact for agent node "${e.nodeId}" was created with provider "${t.providerName}", but this process selects provider "${e.providerName}". The sandbox file must select the same provider during the build and at runtime, so a selection that reads the host, such as \`process.env\` or Docker availability, can disagree. Select one provider explicitly, or use DefaultSandbox, which records its choice when the sandbox is prepared. Then rebuild with \`eve build\`, or restart \`eve dev\`.`);
	return t?.artifact;
}
async function loadSandboxPreparedArtifactsManifest(e) {
	if (e.kind === `bundled`) return readBundledCompiledArtifacts()?.sandboxPreparedArtifacts ?? null;
	let t = resolveRuntimeCompilerArtifactPaths(e.appRoot).sandboxPreparedArtifactsPath;
	try {
		return sandboxPreparedArtifactsManifestSchema.parse(JSON.parse(await readFile(t, `utf8`)));
	} catch (e) {
		if (e instanceof Error && `code` in e && e.code === `ENOENT`) return null;
		throw e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/logging-session.js
function createLoggingSandboxSession(e) {
	let { log: t, session: n } = e;
	return {
		...n,
		async run(e) {
			t?.(`preparation run: ${formatCommand(e.command)}`);
			let r = await n.run(e);
			if (r.exitCode === 1) throw Error(formatPreparationRunFailure(e.command, r));
			return r;
		},
		async spawn(e) {
			return t?.(`preparation spawn: ${formatCommand(e.command)}`), await n.spawn(e);
		},
		async writeFile(e) {
			return t?.(`preparation write file: ${e.path}`), await n.writeFile(e);
		},
		async writeBinaryFile(e) {
			return t?.(`preparation write binary file: ${e.path} (${e.content.byteLength} bytes)`), await n.writeBinaryFile(e);
		},
		async writeTextFile(e) {
			return t?.(`preparation write text file: ${e.path} (${e.content.length} chars)`), await n.writeTextFile(e);
		},
		async writeFiles(e) {
			return t?.(`preparation write files: ${e.files.length} files`), await n.writeFiles(e);
		},
		async removePath(e) {
			return t?.(`preparation remove path: ${e.path}`), await n.removePath(e);
		}
	};
}
function formatPreparationRunFailure(e, t) {
	return [
		`Sandbox preparation failed because sandbox.run command exited with code 1:`,
		e,
		``,
		`stdout:`,
		formatCapturedOutput(`stdout`, t.stdout),
		``,
		`stderr:`,
		formatCapturedOutput(`stderr`, t.stderr)
	].join(`
`);
}
function formatCapturedOutput(e, t) {
	let n = truncateTail(t);
	return n.truncated ? `[${e} truncated: showing last ${n.outputLines} of ${n.totalLines} lines]\n${n.output}` : n.output;
}
function formatCommand(e) {
	return truncateOneLine(e);
}
function truncateOneLine(e) {
	let t = e.replaceAll(/\s+/g, ` `).trim();
	return t.length <= 240 ? t : `${t.slice(0, 239)}…`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-graph.js
function createAuthoredModuleGraph(e, t = {}) {
	let n = [...new Set(e.map((e) => resolve(e)))].filter((e) => AUTHORED_BUNDLED_MODULE_EXTENSION.test(e));
	let r = /* @__PURE__ */ new Map();
	let i = /* @__PURE__ */ new Map();
	let a = !1;
	return {
		async entryPath(e, a) {
			let o = externalDependenciesKey(a);
			let s = r.get(o);
			return s === void 0 && (s = writeAuthoredModuleGraph(n, normalizeExternalDependencies(a), t.appRoot).catch((e) => {
				i.set(o, e);
			}), r.set(o, s)), (await s)?.get(resolve(e));
		},
		warnIfBundledPerModule() {
			if (a || i.size === 0) return;
			a = !0;
			let [e] = i.values();
			console.warn(`eve: could not bundle ${n.length} authored modules as one graph, so each module was bundled and evaluated on its own. Build memory then grows with the number of modules. Cause: ${toErrorMessage(e)}`);
		}
	};
}
function externalDependenciesKey(e) {
	return normalizeExternalDependencies(e).join(`\0`);
}
async function writeAuthoredModuleGraph(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	if (e.length === 0) return r;
	let i = resolveAuthoredPackageRoot(e[0]);
	let a = new Map(e.filter((e) => resolveAuthoredPackageRoot(e) === i).map((e, t) => [`entry-${t}`, e]));
	let o = evaluatedBundleSourcemap();
	let s = o === !1 ? `[name]-[hash].mjs` : `[name]-[hash]-mapped.mjs`;
	let c = await buildWithRolldown({
		...createAuthoredModuleBuildOptions({
			packageBoundaryPlugin: createRuntimeLoaderPackageBoundaryPlugin({
				externalDependencies: [...t],
				packageRoot: i
			}),
			packageRoot: i,
			plugins: [createAuthoredWorkflowDirectivePlugin({ appRoot: n ?? i })]
		}),
		input: Object.fromEntries(a),
		preserveEntrySignatures: `strict`,
		write: !1,
		output: {
			chunkFileNames: s,
			codeSplitting: !0,
			comments: !1,
			entryFileNames: s,
			format: `esm`,
			sourcemap: o,
			strictExecutionOrder: !0
		}
	});
	let l = join(i, AUTHORED_MODULE_BUNDLE_DIRECTORY_PATH);
	for (let e of c.output) {
		if (e.type !== `chunk`) continue;
		let t = writeAuthoredModuleCacheFile(l, e.fileName, e.code);
		let n = e.isEntry ? a.get(e.name) : void 0;
		n !== void 0 && r.set(n, t);
	}
	return r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/framework/sources/default-tools.js
const DEFAULT_TOOLS = [
	`bash`,
	`read_file`,
	`write_file`,
	`edit_file`,
	`web_fetch`,
	`web_search`
];
const DEFAULT_TOOL_MODULES = {
	bash: {
		logicalPath: `tools/bash.ts`,
		loadNamespace: () => import("./_14.mjs")
	},
	read_file: {
		logicalPath: `tools/read_file.ts`,
		loadNamespace: () => import("./_17.mjs")
	},
	write_file: {
		logicalPath: `tools/write_file.ts`,
		loadNamespace: () => import("./_15.mjs")
	},
	edit_file: {
		logicalPath: `tools/edit_file.ts`,
		loadNamespace: () => import("./_16.mjs")
	},
	web_fetch: {
		logicalPath: `tools/web_fetch.ts`,
		loadNamespace: () => import("./_18.mjs")
	},
	web_search: {
		logicalPath: `tools/web_search.ts`,
		loadNamespace: () => import("./_6.mjs")
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/framework/sources/registry.js
const revision = `eve@${resolveInstalledPackageInfo().version}:compiled-manifest-v54`;
const localDefaults = defineProgrammaticAgentSource({
	id: `eve:defaults`,
	revision,
	modules: [
		{
			logicalPath: `agent.ts`,
			loadNamespace: () => import("./_8.mjs")
		},
		{
			logicalPath: `sandbox.ts`,
			semanticRevision: `eve:default-sandbox:v1`,
			loadNamespace: () => import("./_11.mjs")
		},
		...DEFAULT_TOOLS.map((e) => DEFAULT_TOOL_MODULES[e])
	]
});
const rootDefaults = defineProgrammaticAgentSource({
	id: `eve:root-defaults`,
	revision,
	modules: [
		{
			logicalPath: `tools/agent.ts`,
			loadNamespace: () => import("./_13.mjs")
		},
		{
			logicalPath: `channels/eve.ts`,
			loadNamespace: () => import("./_9.mjs")
		},
		{
			logicalPath: `channels/home.ts`,
			loadNamespace: () => import("./_10.mjs")
		}
	]
});
const frameworkAgentSourceRegistry = createAgentSourceRegistry([{
	applyTo: `all-local-nodes`,
	source: localDefaults
}, {
	applyTo: `root`,
	source: rootDefaults
}]);
async function loadFrameworkProgrammaticModule(e) {
	return memoizeModuleNamespaceFactories(await loadProgrammaticModuleNamespace({
		backing: e,
		registries: [frameworkAgentSourceRegistry]
	}));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/materialized-authored-modules.js
const MATERIALIZED_MODULES_INDEX = `authored-modules.json`;
async function readMaterializedAuthoredModuleIndex(e) {
	let t = join(e, `.eve`, `compile`, MATERIALIZED_MODULES_INDEX);
	if (!existsSync(t)) return;
	let n = JSON.parse(await readFile(t, `utf8`));
	if (n.version !== 3 || typeof n.fingerprint != `string` || n.fingerprint.length === 0 || typeof n.moduleMap != `string` || n.moduleMap.length === 0 || !isMaterializedInstrumentation(n.instrumentation)) throw Error(`Invalid materialized authored module index at "${t}".`);
	return n;
}
function isMaterializedInstrumentation(e) {
	if (e === void 0) return !0;
	if (typeof e != `object` || !e) return !1;
	let t = e;
	if (t.kind === `directory`) {
		let e = t.modulePathsBySlot;
		return typeof e == `object` && !!e && Object.values(e).every((e) => typeof e == `string`);
	}
	return !1;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/rename-with-retry.js
const TRANSIENT_RENAME_RETRY_DELAYS_MS = [
	10,
	20,
	40,
	80,
	160,
	320,
	640
];
async function renameWithTransientBusyRetry(e, t) {
	for (let n of TRANSIENT_RENAME_RETRY_DELAYS_MS) try {
		await rename(e, t);
		return;
	} catch (e) {
		if (!isTransientRenameError(e)) throw e;
		await new Promise((e) => setTimeout(e, n));
	}
	await rename(e, t);
}
function isTransientRenameError(e) {
	return isErrnoCode(e, `EPERM`) || isErrnoCode(e, `EACCES`) || isErrnoCode(e, `EBUSY`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/authored-module-map-loader.js
async function loadCompiledModuleMapFromAuthoredSource(e) {
	return await hydrateCompiledModuleMapFromManifest(await loadCompiledManifest({ compiledArtifactsSource: e.compiledArtifactsSource }), e.compiledArtifactsSource.appRoot, e.authoredAppRoot, e.moduleGraph);
}
async function hydrateCompiledModuleMapFromManifest(e, t, n = e.appRoot, r) {
	let i = await readMaterializedAuthoredModuleIndex(t);
	if (i !== void 0) return await loadMaterializedCompiledModuleMap({
		moduleMapPath: i.moduleMap,
		runtimeAppRoot: t
	});
	if ([e, ...e.subagents.map((e) => e.agent)].some((e) => e.extensionMounts.length > 0)) {
		let r = join(t, `.eve`, `compile`, `authored-module-map.mjs`);
		let { code: i } = await bundleAuthoredModuleMapForGeneration({
			appRoot: n,
			manifest: e,
			moduleMapPath: r,
			resolveExternalPaths: !0
		});
		let a = `authored-module-map-${createHash(`sha256`).update(i).digest(`hex`)}.mjs`;
		let o = join(t, `.eve`, `compile`, a);
		await mkdir(join(t, `.eve`, `compile`), { recursive: !0 });
		let s = `${o}.${randomUUID()}.tmp`;
		try {
			await writeFile(s, i, { flag: `wx` }), await renameWithTransientBusyRetry(s, o);
		} finally {
			await unlink(s).catch((e) => {
				if (e.code !== `ENOENT`) throw e;
			});
		}
		return await loadMaterializedCompiledModuleMap({
			moduleMapPath: a,
			runtimeAppRoot: t,
			instanceId: randomUUID()
		});
	}
	let a = {};
	let o = [{
		manifest: e,
		nodeId: "__root__"
	}, ...[...e.subagents].sort((e, t) => e.nodeId.localeCompare(t.nodeId)).map((e) => ({
		manifest: e.agent,
		nodeId: e.nodeId
	}))];
	let resolveSourcePath = (t) => resolve(n, relative(e.appRoot, t));
	let s = r === `shared` ? createAuthoredModuleGraph(o.flatMap((e) => listApplicationModuleSourcePaths(e.manifest).map(resolveSourcePath)), { appRoot: n }) : r;
	for (let e of o) a[e.nodeId] = { modules: await hydrateCompiledNodeScope(e.manifest, n, resolveSourcePath, s) };
	return s?.warnIfBundledPerModule(), { nodes: a };
}
function listApplicationModuleSourcePaths(e) {
	return collectRuntimeModuleBindingsForManifest(e).flatMap(({ binding: e }) => e.backing.kind !== `programmatic` && e.owner.kind === `application` ? [e.backing.sourcePath] : []);
}
async function hydrateCompiledNodeScope(e, t, n, r) {
	let i = {};
	for (let { binding: a, sourceId: o } of collectRuntimeModuleBindingsForManifest(e)) i[o] = a.backing.kind === `programmatic` ? await loadFrameworkProgrammaticModule(a.backing) : memoizeModuleNamespaceFactories(await loadAuthoredModuleNamespace(n(a.backing.sourcePath), {
		appRoot: a.owner.kind === `application` ? t : void 0,
		externalDependencies: a.backing.externalDependencies,
		graph: a.owner.kind === `application` ? r : void 0,
		extension: (() => {
			let e = resolveExtensionBindingMountId(a);
			return e === void 0 ? void 0 : { mountId: e };
		})()
	}));
	return i;
}
async function loadMaterializedCompiledModuleMap(e) {
	let t = join(e.runtimeAppRoot, `.eve`, `compile`, e.moduleMapPath);
	let n = await import(`${pathToFileURL(t).href}?generation=${encodeURIComponent(e.instanceId ?? e.moduleMapPath)}`);
	let r = compiledModuleMapSchema.safeParse(n.moduleMap ?? n.default);
	if (!r.success) throw Error(`Expected materialized authored module map "${t}" to export a valid compiled eve module map. ${formatValidationError(r.error)}`);
	return r.data;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/runtime-compiled-artifacts-source.js
function createAuthoredSourceRuntimeCompiledArtifactsSource(e) {
	return createDiskRuntimeCompiledArtifactsSource(e, { moduleMapLoaderPath: resolvePackageSourceFilePath(`src/internal/authored-module-map-loader.ts`) });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/provider-files.js
function createSandboxProviderFiles(e) {
	let t = resolve(e);
	async function resolvePath(e) {
		let n = resolve(t, e);
		let r = relative(t, n);
		if (r === `` || !r.startsWith(`..${sep}`) && r !== `..`) return n;
		throw Error(`Sandbox provider file path escapes the authored sandbox root: ${e}`);
	}
	return {
		async list() {
			return (await readdir(t, {
				recursive: !0,
				withFileTypes: !0
			}).catch((e) => {
				if (e instanceof Error && `code` in e && e.code === `ENOENT`) return [];
				throw e;
			})).filter((e) => e.isFile()).map((e) => relative(t, resolve(e.parentPath, e.name))).sort();
		},
		async read(e) {
			let n = await resolvePath(e);
			let [r, i] = await Promise.all([realpath(t), realpath(n)]);
			let a = relative(r, i);
			if (a.startsWith(`..${sep}`) || a === `..`) throw Error(`Sandbox provider file resolves outside the authored sandbox root: ${e}`);
			return await readFile(i);
		},
		async readText(e) {
			return Buffer.from(await this.read(e)).toString(`utf8`);
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/workspace/seed-files.js
const RESOURCE_WORKSPACE_DIRECTORY = `workspace`;
const RESOURCE_SKILLS_DIRECTORY = `skills`;
async function materializeWorkspaceDirectory(e) {
	let t = await readdir(e, { withFileTypes: !0 });
	let hasDirectory = (e) => t.some((t) => t.name === e && t.isDirectory());
	let n = hasDirectory(RESOURCE_WORKSPACE_DIRECTORY);
	let r = hasDirectory(RESOURCE_SKILLS_DIRECTORY);
	return !n && !r ? {
		skills: [],
		workspace: await readResourceTree(e)
	} : {
		skills: r ? await readResourceTree(join(e, RESOURCE_SKILLS_DIRECTORY)) : [],
		workspace: n ? await readResourceTree(join(e, RESOURCE_WORKSPACE_DIRECTORY)) : []
	};
}
async function readResourceTree(e) {
	let t = [];
	return await addResourceFiles({
		files: t,
		relativeDirectoryPath: `.`,
		sourceDirectoryPath: e
	}), t.sort((e, t) => e.relativePath.localeCompare(t.relativePath)), t;
}
async function addResourceFiles(e) {
	let t = await readdir(e.sourceDirectoryPath, { withFileTypes: !0 });
	for (let n of t) {
		if (!n.isDirectory() && !n.isFile()) continue;
		let t = join(e.sourceDirectoryPath, n.name);
		let r = posix.join(e.relativeDirectoryPath, n.name);
		n.isDirectory() ? await addResourceFiles({
			files: e.files,
			relativeDirectoryPath: r,
			sourceDirectoryPath: t
		}) : e.files.push({
			content: await readFile(t),
			relativePath: r
		});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/prewarm.js
const diskPreparedArtifactStore = { async write(e) {
	await writeSandboxPreparedArtifactsManifest(e);
} };
async function prewarmSandboxes(e) {
	let t = await collectPrewarmTargets(e);
	if (t.length === 0) return;
	let n = e.preparedArtifactStore ?? diskPreparedArtifactStore;
	let r = e.dispatch ?? (async ({ context: e, provider: t }) => await t.implementation.prepare(e));
	e.log?.(`eve: initializing ${formatSandboxTemplateCount(t.length)}...`);
	let i = await Promise.allSettled(t.map(async ({ label: t, nodeId: n, provider: i, ...a }) => {
		let logProviderProgress = (n) => {
			shouldLogSandboxPrewarmProgress(n) && e.log?.(`eve: sandbox template "${t}" (${i.providerName}): ${n}`);
		};
		try {
			return {
				nodeId: n,
				provider: i,
				result: await r({
					context: createSandboxPrepareContext({
						...a,
						appRoot: e.appRoot,
						log: logProviderProgress,
						provider: i,
						storagePath: resolveSandboxCacheDirectory(e.appRoot)
					}),
					provider: i
				})
			};
		} catch (n) {
			let r = formatPrewarmFailureForEnvironment({
				providerName: i.providerName,
				error: n
			});
			throw e.log?.(`eve: failed to initialize sandbox template "${t}" on provider "${i.providerName}": ${toErrorMessage(r)}`), r;
		}
	}));
	let a = i.find((e) => e.status === `rejected`);
	if (a?.status === `rejected`) throw a.reason;
	let o = i.flatMap((e) => e.status === `fulfilled` ? [{
		artifact: e.value.result,
		nodeId: e.value.nodeId,
		providerName: e.value.provider.providerName
	}] : []);
	await n.write({
		compileDirectoryPath: e.compileDirectoryPath,
		entries: o
	}), e.log?.(`eve: initialized ${formatSandboxTemplateCount(t.length)}.`);
}
async function prewarmAppSandboxes(e) {
	let t = e.compiledArtifactsSource ?? createAuthoredSourceRuntimeCompiledArtifactsSource(e.appRoot);
	if (t.kind !== `disk`) throw Error(`prewarmAppSandboxes requires disk-backed compiled artifacts.`);
	let n = await (e.loadAgentGraph ?? loadGraphFromArtifacts)({
		compiledArtifactsSource: t,
		moduleGraph: e.moduleGraph
	});
	await prewarmSandboxes({
		appRoot: getRuntimeCompiledArtifactsSandboxAppRoot(t) ?? e.appRoot,
		compileDirectoryPath: resolveRuntimeCompilerArtifactPaths(t.appRoot).compileDirectoryPath,
		compiledArtifactsSource: t,
		dispatch: e.dispatch,
		graph: n,
		log: e.log,
		preparedArtifactStore: e.preparedArtifactStore
	});
}
async function collectPrewarmTargets(e) {
	let t = [];
	return await Promise.all(collectNodeSandboxes(e.graph).map(async ({ definition: n, nodeId: r, workspaceResourceRoot: i }) => {
		let a = getResolvedRuntimeAgentNode(e.graph, r).agent;
		let o = join(resolve(e.appRoot, relative(a.metadata.appRoot, a.metadata.agentRoot)), `sandbox`);
		let s = getSandboxEnvironmentRuntime(n.environment);
		let c = await loadSandboxProviderResources({
			compileDirectoryPath: e.compileDirectoryPath,
			workspaceResourceRoot: i
		});
		t.push({
			files: createSandboxProviderFiles(o),
			label: formatLabel(r),
			nodeId: r,
			provider: s,
			resources: c,
			sourceRevision: n.revisionHash
		});
	})), t.sort((e, t) => e.label.localeCompare(t.label));
}
async function loadSandboxProviderResources(e) {
	let { contentHash: t, logicalPath: n } = e.workspaceResourceRoot;
	if (t === void 0) return {};
	let r = `${e.compileDirectoryPath}/${n}`;
	return {
		key: t,
		path: r,
		...await materializeWorkspaceDirectory(r)
	};
}
function createSandboxPrepareContext(e) {
	let { log: t, resources: n, storagePath: r } = e;
	let { prepare: i } = e.provider;
	let a = n.workspace ?? [];
	let o = n.skills ?? [];
	let s = n.key === void 0 ? void 0 : n.path;
	return {
		files: e.files,
		isEmpty: a.length === 0 && o.length === 0 && i === void 0,
		log: t,
		async populate(e, n) {
			let r = createConnectionSession(e);
			if (n?.mountedAt !== void 0 && s !== void 0) t(`copying workspace and skills from mounted resources`), await copyMountedResources(r, shellQuote(n.mountedAt));
			else if (a.length > 0 || o.length > 0) {
				t(`writing workspace and skills`);
				let bytes = (e) => typeof e.content == `string` ? Buffer.from(e.content) : e.content;
				await r.writeFiles({ files: [...a.map((e) => ({
					content: bytes(e),
					path: r.resolvePath(e.relativePath)
				})), ...await Promise.all(o.map(async (e) => ({
					content: bytes(e),
					path: await resolveSandboxModelPath({
						path: `\$HOME/.agents/skills/${e.relativePath}`,
						sandbox: r
					})
				})))] });
			}
			i !== void 0 && (t(`running sandbox preparation`), await i(createLoggingSandboxSession({
				log: t,
				session: r
			})));
		},
		resolveProjectPath: (t) => resolve(e.appRoot, t),
		async resourcesDirectory() {
			if (n.key === void 0 || s === void 0) return;
			let t = join(r, e.provider.providerName, `resources`, n.key);
			return await copyDirectoryAtomically(s, t), t;
		},
		storagePath: r,
		templateKey(t) {
			assertSandboxIdentity(t, `identity`, /* @__PURE__ */ new WeakSet());
			for (let e of [`resources`, `sourceRevision`]) if (Object.hasOwn(t, e)) throw Error(`ctx.templateKey() reserves "${e}": eve adds the workspace and skill files and the sandbox source revision itself. Rename that identity field.`);
			let r = n.key;
			return createSandboxProviderIdentity({
				...t,
				resources: {
					skills: r === void 0 ? void 0 : `${r}:skills`,
					workspace: r === void 0 ? void 0 : `${r}:workspace`
				},
				sourceRevision: e.sourceRevision
			});
		}
	};
}
async function copyMountedResources(e, t) {
	let n = shellQuote(e.resolvePath(`.`));
	let r = await e.run({ command: [
		`set -e`,
		`if [ -d ${t}/workspace ]; then cp -a ${t}/workspace/. ${n}/; fi`,
		`if [ -d ${t}/skills ]; then`,
		`  mkdir -p "$HOME/.agents"`,
		`  rm -rf "$HOME/.agents/skills"`,
		`  mkdir -p "$HOME/.agents/skills"`,
		`  cp -a ${t}/skills/. "$HOME/.agents/skills/"`,
		`fi`
	].join(`
`) });
	if (r.exitCode !== 0) throw Error(`Failed to hydrate sandbox resources: ${r.stderr || r.stdout}`);
}
function assertSandboxIdentity(e, t, n) {
	if (e == null || typeof e == `function` || typeof e == `string` || typeof e == `boolean` || typeof e == `number` && Number.isFinite(e)) return;
	let r = typeof e == `object` ? Object.getPrototypeOf(e) : void 0;
	if (typeof e != `object` || !(Array.isArray(e) || r === Object.prototype || r === null)) throw Error(`ctx.templateKey() accepts only JSON values, plain objects, arrays, and functions, but ${t} is ${describeIdentityValue(e)}. Pass a JSON form, such as a string.`);
	if (n.has(e)) throw Error(`ctx.templateKey() cannot hash a circular value at ${t}.`);
	n.add(e);
	for (let [r, i] of Object.entries(e)) assertSandboxIdentity(i, Array.isArray(e) ? `${t}[${r}]` : `${t}.${r}`, n);
	n.delete(e);
}
function describeIdentityValue(e) {
	return typeof e == `object` && e ? `a ${e.constructor?.name ?? `non-plain object`}` : typeof e == `number` ? String(e) : `a ${typeof e}`;
}
async function loadGraphFromArtifacts(e) {
	let [t, n] = await Promise.all([loadCompiledManifest({ compiledArtifactsSource: e.compiledArtifactsSource }), loadCompiledModuleMapFromAuthoredSource({
		compiledArtifactsSource: e.compiledArtifactsSource,
		moduleGraph: e.moduleGraph ?? `shared`
	})]);
	return await resolveRuntimeAgentGraph({
		manifest: t,
		moduleMap: n
	});
}
function collectNodeSandboxes(e) {
	return [...e.nodesByNodeId.entries()].flatMap(([e, t]) => {
		let n = t.sandboxRegistry.sandbox;
		return n.definition.kind === `parent` ? [] : [{
			...n,
			definition: n.definition,
			nodeId: e
		}];
	});
}
function formatLabel(e) {
	return e === "__root__" ? `root` : e;
}
function formatSandboxTemplateCount(e) {
	return `${e} sandbox ${e === 1 ? `template` : `templates`}`;
}
function shouldLogSandboxPrewarmProgress(e) {
	return !e.startsWith(`checking `) && !e.startsWith(`reusing `);
}
function formatPrewarmFailureForEnvironment(e) {
	return !isVercelEnvironment() || !isLocalSandboxProvider(e.providerName) ? e.error : Error(`The ${e.providerName} sandbox provider is not available when deploying on Vercel. Vercel build containers cannot run local Docker containers. Use DefaultSandbox.environment() so eve selects Vercel Sandbox on Vercel, or configure VercelSandbox.environment() explicitly. Original ${e.providerName} error: ${toErrorMessage(e.error)}`, { cause: e.error });
}
function isVercelEnvironment() {
	return !!process.env.VERCEL?.trim();
}
function isLocalSandboxProvider(e) {
	return e === `docker`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/atomic-write-file.js
async function atomicWriteFile(e, t) {
	let n = `${e}.tmp-${process.pid}-${Date.now().toString(36)}`;
	await writeFile(n, t);
	try {
		await renameWithTransientBusyRetry(n, e);
	} catch (e) {
		throw await rm(n, { force: !0 }).catch(() => void 0), e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/output-publication-journal.js
async function writeRecoveryLeaseJournal(e, t) {
	await writeJournal(e, t);
}
async function readRecoveryLeaseJournal(e) {
	let t = await readJournal(e);
	return isRecoveryLeaseJournal(t) ? t : void 0;
}
function resolveJournalFilePath(e) {
	return join(e, `owner.json`);
}
async function writeJournal(e, t) {
	await atomicWriteFile(resolveJournalFilePath(e), `${JSON.stringify(t, null, 2)}\n`);
}
async function readJournal(e) {
	try {
		return JSON.parse(await readFile(resolveJournalFilePath(e), `utf8`));
	} catch (e) {
		if (isErrnoCode(e, `ENOENT`) || e instanceof SyntaxError) return;
		throw e;
	}
}
function isRecoveryLeaseJournal(e) {
	if (typeof e != `object` || !e) return !1;
	let t = e;
	return typeof t.pid == `number` && typeof t.token == `string`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/application/output-publication-lock.js
const INCOMPLETE_LOCK_STALE_MS = 5e3;
function startPublicationJournalHeartbeat(e) {
	let t = resolveJournalFilePath(e);
	let n = setInterval(() => {
		let e = /* @__PURE__ */ new Date();
		utimes(t, e, e).catch(() => void 0);
	}, 1e3);
	return n.unref(), () => {
		clearInterval(n);
	};
}
async function acquireRecoveryLease(e, t) {
	let n = join(e, `lease`);
	let r = {
		pid: process.pid,
		token: t
	};
	try {
		await mkdir(e, { recursive: !0 });
	} catch (e) {
		if (isErrnoCode(e, `ENOENT`)) return;
		throw e;
	}
	for (;;) {
		try {
			await mkdir(n);
			try {
				await writeRecoveryLeaseJournal(n, r);
			} catch (e) {
				throw await rm(n, {
					force: !0,
					recursive: !0
				}), e;
			}
			return {
				async complete() {
					if ((await readRecoveryLeaseJournal(n))?.token !== t) return;
					let r = `${e}.released-${t}`;
					try {
						await renameWithTransientBusyRetry(e, r);
					} catch (e) {
						if (isErrnoCode(e, `ENOENT`)) return;
						throw e;
					}
					await rm(r, {
						force: !0,
						recursive: !0
					});
				},
				async release() {
					if ((await readRecoveryLeaseJournal(n))?.token !== t) return;
					let e = `${n}.released-${t}`;
					try {
						await renameWithTransientBusyRetry(n, e);
					} catch (e) {
						if (isErrnoCode(e, `ENOENT`)) return;
						throw e;
					}
					await rm(e, {
						force: !0,
						recursive: !0
					});
				}
			};
		} catch (e) {
			if (isErrnoCode(e, `ENOENT`)) return;
			if (!isErrnoCode(e, `EEXIST`)) throw e;
		}
		let i = await readRecoveryLeaseJournal(n);
		if (i !== void 0 && isProcessAlive(i.pid) && !await isJournalStale(n) || i === void 0 && !await isPathStale(n)) return;
		let a = `${n}.stale-${t}`;
		try {
			await renameWithTransientBusyRetry(n, a);
		} catch (e) {
			if (isErrnoCode(e, `ENOENT`)) continue;
			throw e;
		}
		await rm(a, {
			force: !0,
			recursive: !0
		});
	}
}
async function isPathStale(e) {
	try {
		return Date.now() - (await stat(e)).mtimeMs >= INCOMPLETE_LOCK_STALE_MS;
	} catch (e) {
		if (isErrnoCode(e, `ENOENT`)) return !0;
		throw e;
	}
}
async function isJournalStale(e) {
	try {
		let t = await stat(resolveJournalFilePath(e));
		return Date.now() - t.mtimeMs >= 15e3;
	} catch (e) {
		if (isErrnoCode(e, `ENOENT`)) return !0;
		throw e;
	}
}
function isProcessAlive(e) {
	try {
		return process.kill(e, 0), !0;
	} catch (e) {
		return !isErrnoCode(e, `ESRCH`);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/development-lazy-prewarm.js
const PREPARATION_WAIT_TIMEOUT_MS = 6e5;
async function ensureDevelopmentSandboxesPrepared(e) {
	if (await loadSandboxPreparedArtifact(e) !== void 0) return;
	let t = e.compiledArtifactsSource;
	let { compileDirectoryPath: n } = resolveRuntimeCompilerArtifactPaths(t.appRoot);
	let r = join(n, `sandbox-preparation.lock`);
	let i = Date.now() + PREPARATION_WAIT_TIMEOUT_MS;
	await mkdir(n, { recursive: !0 });
	let a = randomUUID();
	let o;
	for (; (o = await acquireRecoveryLease(r, a)) === void 0;) {
		if (Date.now() >= i) throw Error(`Timed out after ${PREPARATION_WAIT_TIMEOUT_MS / 6e4} minutes waiting for another request or eve dev worker to prepare sandbox environments (this request needs provider "${e.providerName}"). Check the eve dev output or run \`eve logs\` to see which step is slow, such as an image pull, a Dockerfile build, or a \`prepare\` callback. Retry after preparation finishes, or restart eve dev to cancel it.`);
		await new Promise((e) => setTimeout(e, 250));
	}
	let s = startPublicationJournalHeartbeat(join(r, `lease`));
	try {
		if (await loadSandboxPreparedArtifact(e) !== void 0) return;
		await prewarmAppSandboxes({
			appRoot: t.sandboxAppRoot ?? t.appRoot,
			compiledArtifactsSource: t,
			log: (e) => console.info(e)
		});
	} finally {
		s(), await o.complete();
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/sandbox-provider.js
function isSandboxPreparedArtifact(e) {
	return e === null || typeof e == `boolean` || typeof e == `number` || typeof e == `string` ? !0 : Array.isArray(e) ? e.every(isSandboxPreparedArtifact) : typeof e == `object` && !!e && Object.values(e).every(isSandboxPreparedArtifact);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/sandbox/ensure.js
const pendingSandboxStarts = /* @__PURE__ */ new Map();
const log$28 = createLogger(`execution.sandbox`);
function idleStop(e, t) {
	let n = e.sandbox;
	if (n === null || isToolSessionId(t)) return;
	let r = owningSandboxDefinition(n);
	if (r.kind !== `independent`) return;
	let i = getSandboxEnvironmentRuntime(r.environment);
	let { idleTimeoutMs: a } = i;
	if (i.implementation.onSessionIdle !== void 0 && a !== !1) return {
		idleTimeoutMs: a,
		provider: i
	};
}
function sandboxIdleTimeoutMs(e, t, n) {
	let r = idleStop(e, t);
	if (r !== void 0 && recordedSandboxStopsIdle(r.provider, n)) return r.idleTimeoutMs;
}
async function ensureSandboxAccess(e) {
	let t = e.registry.sandbox;
	let n = t === null ? void 0 : owningSandboxDefinition(t);
	let r = resolvePersistedSandboxSessionState(e.state?.session, n?.kind === `independent` ? getSandboxEnvironmentRuntime(n.environment) : void 0);
	let i = /* @__PURE__ */ new Set();
	let a;
	let o;
	let s;
	let c;
	let l = e.shutdownTracking ?? `session`;
	let u = getRuntimeCompiledArtifactsSandboxAppRoot(e.compiledArtifactsSource) ?? process.cwd();
	let d = e.ownsSandbox === !1 ? void 0 : idleStop(e.registry, e.sessionId);
	let f = d?.idleTimeoutMs;
	let p = e.state?.running !== void 0;
	let captured = () => p && d !== void 0 && recordedSandboxStopsIdle(d.provider, r) ? {
		session: r,
		running: { idleTimeoutMs: d.idleTimeoutMs }
	} : { session: r };
	if (t === null) return {
		async captureState() {
			return captured();
		},
		async end() {},
		idleTimeoutMs: f,
		async get() {
			return null;
		},
		async open() {
			return null;
		},
		prepare() {},
		async release() {},
		async settle() {},
		async stop() {},
		async stopIdle() {}
	};
	let m = owningSandboxDefinition(t);
	let h = t.inheritance?.nodeId ?? e.nodeId;
	async function disposeConnections() {
		let e = [...i];
		i.clear(), await Promise.all(e.map((e) => e()));
	}
	function providerContext(t) {
		let n = contextStorage.getStore() === void 0 ? {
			auth: {
				current: null,
				initiator: null
			},
			id: e.sessionId,
			turn: {
				id: t,
				sequence: 0
			}
		} : buildCallbackContext().session;
		return {
			kind: isToolSessionId(e.sessionId) ? `tool-session` : `session`,
			resolveProjectPath: (e) => resolve(u, e),
			session: {
				...n,
				id: e.sessionId
			},
			storagePath: resolveSandboxCacheDirectory(u)
		};
	}
	function activeDefinition() {
		if (m.kind !== `independent`) throw Error(`Sandbox "${m.logicalPath}" uses defineParentSandbox(), but this agent has no parent sandbox to share. Only a declared subagent can share its parent's sandbox. Give this agent its own sandbox with defineSandbox() and an exported environment.`);
		return m;
	}
	async function loadArtifact(t) {
		let n = await loadSandboxPreparedArtifact({
			compiledArtifactsSource: e.compiledArtifactsSource,
			nodeId: h,
			providerName: t.providerName
		});
		if (n === void 0) throw new SandboxTemplateNotProvisionedError({
			nodeId: h,
			providerName: t.providerName
		});
		return n;
	}
	async function open(e, t, n, i) {
		if (s !== void 0) throw Error("A sandbox definition can open only one sandbox. Call `environment.open()` once in the defineSandbox() selector and return that sandbox.");
		let o = activeDefinition();
		if (n !== o.environment) throw Error(`Sandbox "${o.logicalPath}" opened an environment other than the one it exports as \`environment\`. Call \`open()\` on the exported environment. A selector cannot open an environment created inside the selector or exported by another sandbox file.`);
		if (e !== getSandboxEnvironmentRuntime(o.environment)) throw Error(`Sandbox "${o.logicalPath}" selected a different provider.`);
		if (r !== null) throw Error(`Sandbox "${o.logicalPath}" already opened this session's sandbox. Call \`environment.open()\` once in the defineSandbox() selector and return that sandbox.`);
		let c = await loadArtifact(e);
		return s = (async () => {
			let n = await e.implementation.start(i, t, c);
			if (!isSandboxPreparedArtifact(n.state)) throw Error(`Sandbox provider "${e.providerName}" returned non-serializable session state.`);
			let a = await openSandbox(e, i, n.connection, n.state);
			return r = {
				generation: randomUUID(),
				providerName: e.providerName,
				state: n.state,
				stateProtocolVersion: e.stateProtocolVersion
			}, a;
		})().catch((e) => {
			throw s = void 0, e;
		}), a = await s, a.sandbox;
	}
	async function resumePersisted(e) {
		if (r === null) throw Error(`Sandbox session state is missing.`);
		let t = getSandboxEnvironmentRuntime(activeDefinition().environment);
		if (r.providerName !== t.providerName) throw new SandboxSessionGoneError(`This session's sandbox was created by provider "${r.providerName}", but the agent now selects provider "${t.providerName}". eve cannot move a sandbox between providers, so the session continues in a fresh sandbox without the old sandbox's files.`);
		if (r.stateProtocolVersion !== t.stateProtocolVersion) throw new SandboxSessionGoneError(`Sandbox session state protocol ${r.stateProtocolVersion} is incompatible with provider "${t.providerName}" protocol ${t.stateProtocolVersion}.`);
		let n = await loadArtifact(t);
		let i = r.state;
		return s = t.implementation.resume(e, n, i).then((n) => openSandbox(t, e, n, i)).catch((e) => {
			throw s = void 0, e;
		}), a = await s, track(a), a;
	}
	async function resolveOpened() {
		let t = activeDefinition();
		let n = getSandboxEnvironmentRuntime(t.environment);
		let i = providerContext(`sandbox-initialization`);
		if (i.kind === `tool-session` && n.implementation.toolSessions !== !0) throw new ToolSessionSandboxUnsupportedError(n.providerName);
		if (isEveDevEnvironment() && e.compiledArtifactsSource.kind === `disk` && await ensureDevelopmentSandboxesPrepared({
			compiledArtifactsSource: e.compiledArtifactsSource,
			nodeId: h,
			providerName: n.providerName
		}), r !== null) try {
			return await resumePersisted(i);
		} catch (t) {
			if (!SandboxSessionGoneError.is(t)) throw t;
			log$28.warn(`session sandbox is gone, starting a fresh one`, {
				error: t,
				providerName: r.providerName,
				sessionId: e.sessionId
			}), r = null;
		}
		let a = [
			u,
			h,
			e.sessionId
		].join(`\0`);
		let o = pendingSandboxStarts.get(a);
		for (; o !== void 0;) {
			if (r = await o, r !== null) return await resumePersisted(i);
			o = pendingSandboxStarts.get(a);
		}
		let s = startOpened(i);
		let c = s.then(() => r, () => null);
		pendingSandboxStarts.set(a, c);
		try {
			return await s;
		} finally {
			pendingSandboxStarts.get(a) === c && pendingSandboxStarts.delete(a);
		}
	}
	async function startOpened(e) {
		let t = activeDefinition();
		try {
			let n = await runWithSandboxConstructorRuntime({ open: ({ environment: t, options: n, provider: r }) => open(r, n, t, e) }, async () => t.selector({ session: e.session }));
			if (a === void 0 || n !== a.sandbox) throw Error(`Sandbox "${t.logicalPath}" must return the sandbox it opens.`);
		} catch (e) {
			throw await disposeConnections().catch(() => void 0), await a?.close().catch(() => void 0), a = void 0, s = void 0, r = null, e;
		}
		return track(a), a;
	}
	function requireOpened() {
		return c === void 0 && (p = !0, c = resolveOpened().catch((e) => {
			throw c = void 0, e;
		})), c;
	}
	async function openSession() {
		return (await requireOpened()).sandbox;
	}
	let g = Promise.resolve();
	function enqueue(t) {
		let report = (t) => {
			log$28.warn(`background sandbox preparation failed; it runs again when it is needed`, {
				error: t,
				sessionId: e.sessionId
			});
		};
		g = g.then(async () => {
			try {
				await t();
			} catch {
				await t().catch(report);
			}
		});
	}
	function track(t) {
		l !== `none` && trackActiveSandboxConnection({
			connection: t,
			providerName: t.providerName,
			sessionId: e.sessionId
		});
	}
	function forgetOpened() {
		let e = a;
		return a = void 0, s = void 0, c = void 0, e;
	}
	function forgetSandbox(t) {
		forgetOpened(), o = void 0, untrackActiveSandboxConnection({
			providerName: t,
			sessionId: e.sessionId
		}), r = null, p = !1;
	}
	async function recordedProvider(t) {
		let n = r?.providerName === t.providerName && r.stateProtocolVersion === t.stateProtocolVersion ? r.state : null;
		return await resolveRecordedSandboxProvider(t, n, () => loadSandboxPreparedArtifact({
			compiledArtifactsSource: e.compiledArtifactsSource,
			nodeId: h,
			providerName: t.providerName
		}));
	}
	return {
		environment: m.kind === `independent` ? m.environment : void 0,
		idleTimeoutMs: f,
		async captureState() {
			return s !== void 0 && await s, captured();
		},
		async delete(t) {
			if (e.ownsSandbox === !1) throw Error(`Only the owning session can delete this sandbox.`);
			await g;
			let n = await requireOpened();
			await disposeConnections(), await n.delete(t), forgetSandbox(n.providerName);
		},
		async end(t) {
			if (e.ownsSandbox === !1) return;
			await g, c !== void 0 && await c.catch(() => void 0), await disposeConnections(), await a?.close().catch((t) => {
				log$28.warn(`failed to close a sandbox connection at session end`, {
					error: t,
					sessionId: e.sessionId
				});
			});
			let n = getSandboxEnvironmentRuntime(activeDefinition().environment);
			let r = await recordedProvider(n);
			await r?.implementation.onSessionEnd(providerContext(`sandbox-cleanup`), r.state, { reason: t }), forgetSandbox(n.providerName);
		},
		async get() {
			return await g, await openSession();
		},
		open: openSession,
		prepare(e) {
			enqueue(e === void 0 ? requireOpened : () => e(openSession));
		},
		async settle() {
			await g;
		},
		async release() {
			await g, c !== void 0 && await c.catch(() => void 0), await disposeConnections();
			let t = forgetOpened();
			o !== void 0 && l !== `session` && (untrackActiveSandboxConnection({
				connection: o,
				providerName: o.providerName,
				sessionId: e.sessionId
			}), o = void 0), t === void 0 || l === `session` && !t.closable || (untrackActiveSandboxConnection({
				connection: t,
				providerName: t.providerName,
				sessionId: e.sessionId
			}), await t.close());
		},
		async stop() {
			await g;
			let t = await requireOpened();
			await t.stop(), p = !1, forgetOpened(), t.closable ? untrackActiveSandboxConnection({
				connection: t,
				providerName: t.providerName,
				sessionId: e.sessionId
			}) : o = t;
		},
		async stopIdle({ signal: e }) {
			if (d === void 0) return;
			let t = await recordedProvider(d.provider);
			await t?.implementation.onSessionIdle?.(providerContext(`sandbox-idle`), t.state, { signal: e });
		}
	};
	async function openSandbox(t, n, r, a) {
		let o = sandboxConnectionDisposal(r);
		let s;
		try {
			s = createConnectionSession(r);
		} catch (t) {
			throw await o?.().catch(() => void 0), await r.close?.().catch((t) => {
				log$28.warn(`failed to close a sandbox connection eve could not use`, {
					error: t,
					sessionId: e.sessionId
				});
			}), t;
		}
		o !== void 0 && i.add(o);
		let c = shared(() => r.stop());
		let l = once(async () => await r.close?.());
		let u = {
			closable: r.close !== void 0,
			close: l,
			async delete(e) {
				try {
					await o?.(), await l();
				} finally {
					await t.implementation.onSessionEnd(n, a, {
						signal: e?.signal,
						reason: `deleted`
					});
				}
			},
			providerName: t.providerName,
			sandbox: withRuntimeSandboxLifecycle(s, (e) => u.delete(e), () => u.stop()),
			async stop() {
				try {
					await c();
				} finally {
					await l();
				}
			}
		};
		return u;
	}
}
function shared(e) {
	let t;
	return () => t ??= e().finally(() => {
		t = void 0;
	});
}
function once(e) {
	let t;
	return () => t ??= e().catch((e) => {
		throw t = void 0, e;
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/providers/sandbox.js
const log$27 = createLogger(`context.sandbox`);
const sandboxPrewarmer = {
	name: `sandbox`,
	start(e, t) {
		if (t !== `session`) return;
		let n = e.get(SandboxKey);
		n?.idleTimeoutMs !== 0 && n?.prepare();
	}
};
async function selectSessionSandbox(e) {
	let t = await e.agent?.sandbox();
	if (e.agent === void 0 || t === void 0) return;
	let n = e.channelState;
	let r = n?.parentSandboxState;
	let i = t.registry.sandbox?.definition.kind === `parent`;
	let a = n?.sandboxSessionId;
	let o = i || a !== void 0;
	return {
		agent: e.agent,
		ownsSandbox: !o,
		parentSandboxState: o ? r : void 0,
		sandbox: t,
		sandboxSessionId: o ? a ?? e.sessionId : e.sessionId
	};
}
async function sessionSandboxIdleTimeoutMs(e) {
	let t = await selectSessionSandbox(e);
	if (t !== void 0 && t.ownsSandbox) return sandboxIdleTimeoutMs(t.sandbox.registry, t.sandboxSessionId, e.sandboxState?.session);
}
const sandboxProvider = {
	key: SandboxKey,
	async create(e, t) {
		let n = await selectSessionSandbox({
			agent: e.get(SessionAgentKey),
			channelState: e.get(ChannelKey)?.state,
			sessionId: e.require(SessionIdKey)
		});
		if (n === void 0) return;
		let { agent: r, sandbox: i } = n;
		let a = await ensureSandboxAccess({
			...i.template,
			nodeId: runtimeNodeId(r),
			ownsSandbox: n.ownsSandbox,
			registry: i.registry,
			sessionId: n.sandboxSessionId,
			state: t.sandboxState ?? n.parentSandboxState ?? null
		});
		return e.setVirtualContext(SandboxTerminalCleanupKey, (e) => a.end(e)), { value: a };
	},
	async commit(e, t) {
		await e.settle();
		let n = await e.captureState();
		return {
			...t,
			sandboxState: n
		};
	},
	async dispose(e) {
		await e.release().catch((e) => {
			logError(log$27, `failed to close a step's sandbox connection`, e);
		});
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/durable-session-read.js
function readDurableSession(e) {
	if (e.version !== 2 || e.snapshot?.session === void 0) throw Error(`Unsupported session checkpoint. Start a new session on this deployment.`);
	return e.snapshot.session;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/durable-session-store.js
function createDurableSessionState(e) {
	return projectDurableSessionState(projectToDurableSession(e.session));
}
function createDurableSessionValues(e) {
	return {
		history: e.history,
		sessionState: createDurableSessionState({ session: e })
	};
}
function replaceDurableSessionSnapshot(e) {
	return {
		...e.state,
		...projectDurableSessionState(e.session)
	};
}
function projectDurableSessionState(e) {
	return {
		continuationToken: e.continuationToken,
		hasProxyInputRequests: readHitlState(e.state).relays.size > 0,
		sessionId: e.sessionId,
		version: 2,
		snapshot: { session: e }
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/channel/adapter-context.js
function buildAdapterContext(e, t) {
	let n = buildChannelContext(t);
	let r = {
		ctx: t,
		state: e.state ?? {},
		session: n.session,
		get continuation() {
			return n.continuation;
		}
	};
	return e.createAdapterContext ? e.createAdapterContext(r) : r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/coordination-dispatch-shared.js
async function prepareCoordinationDispatch(e) {
	let t = readDurableSession(e.sessionState);
	let n = runtimeWait(t.state);
	if (n === void 0) return;
	let r = n.tasks;
	if (r.length === 0) return;
	let i = n.event.turnId || activeTurnId(turnPosition(storedProjection(t.state)));
	let a = await deserializeContext(e.serializedContext);
	return {
		...await prepareActionDispatch({
			batch: {
				event: {
					...n.event,
					turnId: i
				},
				requests: r
			},
			ctx: a,
			durableSession: t,
			plan: () => r,
			serializedContext: e.serializedContext
		}),
		sessionState: e.sessionState
	};
}
async function prepareActionDispatch(e) {
	let { batch: t, durableSession: n } = e;
	assertUniqueCoordinationCallIds(t.requests);
	let r = e.ctx;
	enterSessionProjection(r, n.state);
	let i = sessionAgent(r);
	let a = hydrateDurableSession(n);
	let o = r.require(ChannelKey);
	let s = e.plan({
		ctx: r,
		requests: t.requests,
		session: a
	});
	let c = resolveActiveSandboxSessionId(o.state, a.sessionId);
	let l = a.sandboxState ?? resolveOwnerSandboxState(o.state);
	return {
		adapter: o,
		adapterCtx: buildAdapterContext(o, r),
		auth: r.get(AuthKey) ?? null,
		batch: t,
		capabilities: r.get(CapabilitiesKey),
		channelMetadata: r.get(ChannelInstrumentationKey),
		dynamicSubagentSelections: readDynamicSubagentSelections(r),
		inheritedConversation: r.get(ConversationContextKey),
		initiatorAuth: r.get(InitiatorAuthKey) ?? null,
		localDevRequest: r.get(LocalDevRequestKey),
		owner: i,
		parentSession: r.get(ParentSessionKey),
		plan: s,
		sandboxSessionId: c,
		sandboxState: l,
		serializedContext: e.serializedContext,
		session: a,
		steeredBy: r.get(SteeredByKey) ?? [],
		traceRoot: childTraceRoot(r, a.sessionId),
		workflowAgents: i.delegates(r)
	};
}
function childTraceRoot(e, t) {
	if (e.get(TraceRootKey) !== void 0) return {
		kind: `inherited`,
		sessionId: resolveTraceRootSessionId(e, t)
	};
}
function resolveOwnerSandboxState(e) {
	if (typeof e == `object` && e) return e.parentSandboxState;
}
function resolveActiveSandboxSessionId(e, t) {
	if (typeof e != `object` || !e) return t;
	let n = e.sandboxSessionId;
	return typeof n == `string` && n.length > 0 ? n : t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/mcp-client-pool.js
var McpClientPool = class {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n;
	#r;
	#i = /* @__PURE__ */ new WeakMap();
	#a = 0;
	constructor(e = {}) {
		this.#n = e.idleMs ?? 6e4, this.#r = e.maxIdleClients ?? 128;
	}
	get size() {
		return this.#e.size;
	}
	acquire(e, t) {
		let n = `${this.#s(t)}:${e}`;
		let r = this.#e.get(n);
		return r === void 0 && (r = {
			client: new McpConnectionClient(t),
			key: n,
			leases: 0,
			retired: !1
		}, this.#e.set(n, r)), this.#t.set(r.client, r), clearTimeout(r.idleTimer), r.idleTimer = void 0, r.leases += 1, r.client;
	}
	async release(e, t = {}) {
		let n = this.#t.get(e);
		if (n === void 0 || (--n.leases, t.discard !== !0 && e.reusable || (n.retired = !0, this.#e.get(n.key) === n && this.#e.delete(n.key)), n.leases > 0)) return;
		if (this.#t.delete(e), n.retired) {
			await closeQuietly(e);
			return;
		}
		this.#e.delete(n.key), this.#e.set(n.key, n), n.releaseContext = AsyncLocalStorage.snapshot(), n.idleTimer = setTimeout(() => void this.#o(n), this.#n), n.idleTimer.unref?.();
		let r = [...this.#e.values()].filter((e) => e.leases === 0);
		for (let e of r.slice(0, Math.max(0, r.length - this.#r))) this.#o(e);
	}
	async closeIdle() {
		let e = [...this.#e.values()].filter((e) => e.leases === 0);
		await Promise.all(e.map((e) => this.#o(e)));
	}
	async #o(e) {
		this.#e.get(e.key) !== e || e.leases > 0 || (clearTimeout(e.idleTimer), this.#e.delete(e.key), await (e.releaseContext ?? ((e) => e()))(() => closeQuietly(e.client)));
	}
	#s(e) {
		let t = this.#i.get(e);
		return t === void 0 && (t = this.#a++, this.#i.set(e, t)), t;
	}
};
async function closeQuietly(e) {
	await e.close().catch(() => void 0);
}
const mcpClientPool = new McpClientPool();
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/providers/connection.js
const connectionProvider = {
	key: ConnectionRegistryKey,
	create(e, t) {
		let n = e.get(SessionAgentKey)?.connections();
		if (n === void 0) return;
		let r = e.get(SessionKey);
		let i = r === void 0 ? void 0 : {
			pool: mcpClientPool,
			scope: JSON.stringify([
				r.sessionId,
				r.turn.sequence,
				r.auth
			])
		};
		return { value: new ConnectionRegistryImpl(n, i) };
	},
	dispose: (e) => e.dispose()
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/providers/session.js
const sessionProvider = {
	key: SessionKey,
	create(e, t) {
		let n = e.require(AuthKey);
		let r = e.get(SteeredByKey);
		let i = turnPosition(projectionFor(e, t.state));
		let a = activeTurnId(i);
		return { value: Object.freeze({
			auth: {
				current: n,
				initiator: e.get(InitiatorAuthKey) ?? n,
				...r !== void 0 && r.length > 0 && { steeredBy: r }
			},
			parent: e.get(ParentSessionKey),
			predecessor: e.get(SessionPredecessorKey),
			sessionId: e.require(SessionIdKey),
			turn: {
				id: a,
				sequence: i.sequence
			}
		}) };
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/run-step.js
const frameworkProviders = [
	sessionProvider,
	connectionProvider,
	sandboxProvider
];
async function withContextScope(e, t, n, r = {}) {
	let i = [];
	e.clearVirtualContext();
	try {
		for (let n of frameworkProviders) {
			let r = await n.create(e, t);
			r !== void 0 && (e.setVirtualContext(n.key, r.value), i.push(n));
		}
		let a = await contextStorage.run(e, () => n(t)).finally(() => r.drain?.());
		let o = a.session;
		for (let t of i) t.commit !== void 0 && (o = await t.commit(e.require(t.key), o));
		return o === a.session ? a : {
			result: a.result,
			session: o
		};
	} catch (t) {
		let n = [];
		for (let r of i.toReversed()) if (r.rollback !== void 0) try {
			await r.rollback(e.require(r.key), t);
		} catch (e) {
			n.push(e);
		}
		throw n.length > 0 ? AggregateError([t, ...n], `Framework context rollback did not complete.`, { cause: t }) : t;
	} finally {
		for (let t of i.toReversed()) await t.dispose?.(e.require(t.key));
	}
}
async function runStep(e, t, n, r) {
	let i = await withContextScope(e, t, async (e) => {
		let t = await n(e);
		return {
			result: t,
			session: t.session
		};
	}, r);
	return {
		...i.result,
		session: i.session
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-callback-request.js
const log$26 = createLogger(`execution.session-callback`);
const VERCEL_CALLBACK_HOST_ENVS = [
	`VERCEL_URL`,
	`VERCEL_BRANCH_URL`,
	`VERCEL_PROJECT_PRODUCTION_URL`
];
const VERCEL_REQUEST_CONTEXT = Symbol.for(`@vercel/request-context`);
async function postSessionCallbackRequest(e) {
	let t = e.timeoutMs ?? 3e4;
	let n = AbortSignal.timeout(t);
	let r = await resolveSessionCallbackHeaders(e.url);
	let i;
	try {
		i = await requestCallback(e.url, {
			body: JSON.stringify(e.body),
			headers: r,
			signal: n
		});
	} catch (r) {
		let i = findUnsafeDestinationError(r);
		throw i === void 0 ? (e.logFailures !== !1 && log$26.error(`callback delivery failed`, {
			...callbackLogFields(e),
			failure: n.aborted ? `timeout` : `transport`,
			timeoutMs: t,
			error: Error(`Callback request failed before receiving a response.`)
		}), r) : (e.logFailures !== !1 && log$26.error(`callback delivery failed`, {
			...callbackLogFields(e),
			failure: `blocked-destination`,
			error: Error(i.message)
		}), new NonRetryableError(`Callback delivery refused: ${i.message}`));
	}
	return !i.ok && e.logFailures !== !1 && log$26.error(`callback delivery failed`, {
		...callbackLogFields(e),
		failure: `http`,
		statusCode: i.status,
		error: Error(`Callback request failed with HTTP ${i.status}.`)
	}), i;
}
async function requestCallback(e, t) {
	let n = new URL(e);
	if (n.protocol !== `http:` && n.protocol !== `https:`) throw new UnsafeDestinationError(`Callback URL must use http or https.`);
	let r = { allowLoopback: isLocalDevelopmentServer() };
	assertPublicHostname(n.hostname, r);
	let i = await createPublicDispatcher(r);
	try {
		let n = await fetchWithDispatcher(e, {
			...t,
			dispatcher: i,
			method: `POST`,
			redirect: `error`
		});
		return await readBoundedResponse(n, 65536);
	} finally {
		await i.close();
	}
}
function callbackLogFields(e) {
	let t = URL.parse(e.url);
	let n = t?.pathname.match(/^(.*?\/(?:callback|activity))\//)?.[1];
	let r = {
		callbackOrigin: t?.origin,
		callbackPath: n === void 0 ? `[redacted]` : `${n}/[redacted]`
	};
	if (isObject(e.body)) {
		for (let t of [
			`kind`,
			`callId`,
			`sessionId`,
			`childSessionId`,
			`subagentName`,
			`updateEpoch`
		]) typeof e.body[t] == `string` && (r[t] = e.body[t]);
		typeof e.body.updateIndex == `number` && (r.updateIndex = e.body.updateIndex);
	}
	return r;
}
async function resolveSessionCallbackHeaders(e) {
	let t = { "content-type": `application/json` };
	if (process.env.VERCEL !== `1`) return t;
	let n;
	try {
		n = new URL(e);
	} catch {
		return t;
	}
	let r = VERCEL_CALLBACK_HOST_ENVS.some((e) => {
		let t = process.env[e]?.trim();
		return t !== void 0 && t !== `` && URL.parse(`https://${t}`)?.origin === n.origin;
	});
	if (n.protocol !== `https:` || !r && !configuredCallbackOrigins().some((e) => e(n))) return t;
	let i = readAmbientVercelOidcToken();
	return i !== void 0 && (t[`x-vercel-trusted-oidc-idp-token`] = i), t;
}
function configuredCallbackOrigins() {
	let e = process.env.EVE_CALLBACK_TRUSTED_ORIGINS?.trim();
	return e ? e.split(`,`).map((e) => {
		let t = URL.parse(e.trim());
		if (t === null || t.protocol !== `https:` || t.username !== `` || t.password !== `` || t.pathname !== `/` || t.search !== `` || t.hash !== ``) throw invalidCallbackOriginsError();
		if (!t.hostname.includes(`*`)) return (e) => e.origin === t.origin;
		let n = t.hostname.slice(2);
		if (!t.hostname.startsWith(`*.`) || n.includes(`*`) || n.endsWith(`.`) || n.split(`.`).length < 2 || n === `vercel.app`) throw invalidCallbackOriginsError();
		return (e) => {
			let r = e.hostname.slice(0, -(n.length + 1));
			return e.port === t.port && e.hostname.endsWith(`.${n}`) && r !== `` && !r.includes(`.`);
		};
	}) : [];
}
function invalidCallbackOriginsError() {
	return new NonRetryableError("EVE_CALLBACK_TRUSTED_ORIGINS must be a comma-separated list of HTTPS origins without credentials, paths, queries, or fragments. A leading `*.` label (e.g. `https://*.preview.example.com`) matches exactly one subdomain label and needs at least two labels after it; `*.vercel.app` and trailing dots are not allowed.");
}
function readAmbientVercelOidcToken() {
	let e = (globalThis[VERCEL_REQUEST_CONTEXT]?.get?.().headers?.[`x-vercel-oidc-token`] ?? process.env.VERCEL_OIDC_TOKEN)?.trim();
	return e === `` ? void 0 : e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/forward-session-input.js
async function forwardSessionInput(e, t, n) {
	let r = e.get(SessionCallbackKey);
	if (r === void 0 || e.get(EarlierRemoteCallerKey) !== void 0) return !1;
	let i = e.require(SessionIdKey);
	let a = relayedInteractionEvents(currentView(e), t, i);
	if (a.length === 0) return t.type === `interaction.opened`;
	let o = e.get(SessionInboxKey);
	let c = await postSessionCallbackRequest({
		body: {
			callId: r.callId,
			childSessionId: i,
			events: a,
			kind: `subagent-interaction`,
			subagentName: r.subagentName,
			...a.some((e) => e.type === `interaction.opened` && e.data.request.kind !== `sign-in`) && { route: {
				childContinuationToken: e.get(ContinuationTokenKey) ?? sessionCommandHookToken(i),
				inputSource: n ?? `session`,
				...o !== void 0 && { childSessionInbox: o }
			} }
		},
		url: r.url
	});
	if (!c.ok) throw Error(`Remote input callback failed with HTTP ${c.status}.`);
	return !0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/reconcile-session-continuation-token.js
function reconcileSessionContinuationToken(e, t) {
	let n = e.get(ContinuationTokenKey);
	return n === void 0 || n === t.continuationToken ? t : {
		...t,
		continuationToken: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/waiting.js
function announceWaiting(e, t) {
	return commitOf(waitingAnnouncements(e, t));
}
function waitingAnnouncements(e, t) {
	let n = activeTurn(t)?.turnId;
	if (n === void 0) return [];
	let r = waiting(t, n);
	if (r?.on !== `interaction`) return [];
	let i = waiting(e, n);
	let a = new Set(i?.on === `interaction` ? i.interactions.map((e) => e.interactionId) : []);
	let o = openWork(t, { turnId: n }).deliveries.map((e) => e.deliveryId);
	return !Object.values(t.deliveries).some((t) => t.status !== `settled` && e.deliveries[t.deliveryId]?.status !== t.status) && r.interactions.every((e) => a.has(e.interactionId)) ? [] : [{
		data: {
			awaiting: r.interactions.map(({ interactionId: e }) => ({ interactionId: e })),
			turnId: n
		},
		type: `turn.paused`
	}, ...o.map((e) => ({
		data: {
			deliveryId: e,
			outcome: `awaiting-input`,
			turnId: n
		},
		type: `delivery.settled`
	}))];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/publish-session-events.js
const log$25 = createLogger(`execution.publish-session-events`);
function enterSessionStep(e) {
	return {
		...e,
		rerun: isRetriedStep()
	};
}
async function publishSessionEvents(e, t, n) {
	let r = !1;
	return {
		...await publishEventsFromStep(e, `own`, joinCommits(t), n?.canCancelTurn ? () => {
			r = !0;
		} : void 0),
		cancelled: r
	};
}
async function publishEventsFromStep(e, t, n, r) {
	let i = n.filter((e) => !Array.isArray(e) || e.length > 0);
	return i.length === 0 ? {
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	} : (await publishFromSessionStep(await restoreSessionStep(e), {
		cancelTurn: r,
		origin: t,
		async publish(e) {
			for (let t of i) await e(t);
		}
	})).published;
}
async function restoreSessionStep(e) {
	return {
		ctx: await deserializeContext(e.serializedContext),
		durableSession: readDurableSession(e.sessionState),
		sessionWritable: e.sessionWritable,
		rerun: e.rerun
	};
}
async function publishFromSessionStep(e, t) {
	let { ctx: n } = e;
	let r = await publishInSessionScope(e, t);
	let i = t.updateSession?.(r.session, r.result) ?? { session: r.session };
	let a = readSessionProjection(n);
	let o = reconcileSessionContinuationToken(n, saveSessionProjection(dropClosedRecords(i.session, a), n));
	return {
		published: {
			serializedContext: serializeContext(n),
			sessionState: createDurableSessionState({ session: o }),
			...`history` in o && { history: o.history }
		},
		result: i.result
	};
}
async function publishInSessionScope(e, t) {
	let { ctx: n } = e;
	enterSessionProjection(n, e.durableSession.state);
	let r = await readOrphanedLines({
		rerun: e.rerun,
		sessionId: e.durableSession.sessionId,
		position: nextLinePosition(n),
		sessionWritable: e.sessionWritable
	});
	let i = hydrateDurableSession(e.durableSession);
	let a = e.history === void 0 ? i : {
		...i,
		history: validateHarnessModelMessages(e.history)
	};
	let o = bindSessionInstrumentation({
		agentName: sessionAgent(n).id,
		ctx: n,
		rootSessionId: a.rootSessionId ?? a.sessionId,
		sessionId: a.sessionId
	});
	let s = openSessionEventPublisher({
		cancelTurn: t.cancelTurn,
		ctx: n,
		inputSource: t.inputSource,
		orphaned: r,
		origin: t.origin,
		sessionWritable: e.sessionWritable
	});
	try {
		return await withContextScope(n, a, async (e) => {
			let n = o?.createHandleEvent({
				handleEvent: s.publish,
				relayed: t.origin === `relayed`
			}) ?? s.publish;
			let r = await t.publish(n, e);
			return await s.finish(), {
				result: r,
				session: e
			};
		}, { drain: s.drain });
	} finally {
		await o?.flush(), await s.release();
	}
}
const interruptedAttempts = /* @__PURE__ */ new WeakMap();
async function readOrphanedLines(e) {
	if (!e.rerun) return [];
	let { sessionId: t, sessionWritable: n, position: r } = e;
	let i = interruptedAttempts.get(n);
	return i === void 0 && (i = await readLinesFrom(t, r), interruptedAttempts.set(n, i)), i.filter(({ position: e }) => e >= r);
}
function followInterruptedAttempt(e, t) {
	let n = readDurableSession(t);
	let r = storedProjection(n.state);
	let i = (interruptedAttempts.get(e) ?? []).filter(({ position: e }) => e >= r.view.position);
	return i.length === 0 ? t : (log$25.error(`a retried step wrote less than its interrupted attempt; the session follows the stream`, {
		lines: i.length,
		sessionId: t.sessionId
	}), replaceDurableSessionSnapshot({
		session: {
			...n,
			state: {
				...n.state,
				["eve.harness.sessionProjection"]: foldOrphanedLines(r, i)
			}
		},
		state: t
	}));
}
async function readLinesFrom(e, t) {
	let n = await readSessionStreamTailIndex(e);
	if (n + 1 < t) throw Error(`Session checkpoint is ahead of its stream.`);
	let r = [];
	if (n < t) return r;
	let i = t;
	for await (let a of streamSessionLines(e, {
		follow: !1,
		startIndex: t
	})) {
		if (a.position > n) break;
		if (a.line === void 0 || a.position !== i) throw Error(`Cannot reconcile an unreadable or missing session line.`);
		r.push({
			line: a.line,
			position: i++
		});
	}
	if (i !== n + 1) throw Error(`Session stream ended before its reported tail.`);
	return r;
}
function foldOrphanedLines(e, t) {
	let n = e;
	for (let { line: e, position: r } of t) {
		let t = `facts` in e ? eventsOfLine(e, r, e.at) : [];
		n = advance(n, e, r, t);
	}
	return n;
}
async function reconcilePublishedSessionLines(e, t) {
	let n = e ?? initialSessionProjection();
	return foldOrphanedLines(n, await readLinesFrom(t, n.view.position));
}
function sameLine(e, t) {
	if (`progress` in t || `progress` in e) return `progress` in t && `progress` in e && JSON.stringify(e.progress) === JSON.stringify(t.progress);
	let identity = (e) => {
		let { data: t, type: n } = e;
		if (!isFactType(n)) return String(n);
		let r = t[FACT_CATALOG[n].idField];
		return `${n}:${String(r)}`;
	};
	return e.facts.length === t.facts.length && e.facts.every((e, n) => identity(e) === identity(t.facts[n]));
}
function openSessionEventPublisher(e) {
	let { ctx: t } = e;
	let n = [...e.orphaned ?? []];
	let r = createSessionEventDispatcher(e);
	let i = openSessionEventWriter(e.sessionWritable);
	let a = createLineCommitter();
	let o;
	let emitOne = async (e) => {
		let s = await a;
		o === void 0 && (o = copyView(currentView(t)));
		let c = (/* @__PURE__ */ new Date()).toISOString();
		let l = [];
		let u = s.commit(currentView(t), e, nextLinePosition(t), c);
		for (let { line: e, bytes: r } of u) {
			let a = nextLinePosition(t);
			let o = n[0];
			if (o !== void 0) {
				if (o.position !== a || !sameLine(o.line, e)) throw Error(`A retried step published differently from its interrupted attempt.`);
				n.shift();
				let r = `facts` in o.line ? o.line.at : c;
				recordPublishedLine(t, o.line, a, eventsOfLine(o.line, a, r));
				continue;
			}
			await i.write(r).catch((e) => {
				throw s.reset(), e;
			});
			let u = eventsOfLine(e, a, c);
			recordPublishedLine(t, e, a, u);
			let d = `progress` in e;
			let f = currentView(t);
			u.forEach((e) => l.push({
				event: e,
				position: e.meta.position,
				progress: d,
				view: f
			}));
		}
		return await r.deliver(l), l;
	};
	let drain = async () => {
		await s, await r.settle();
	};
	let s = Promise.resolve();
	let emit = (e) => {
		let t = s.then(() => emitOne(e));
		return s = t.then(() => void 0, () => void 0), t;
	};
	let publish = async (t) => {
		let n = e.cancelTurn;
		await r.react(await emit(t), n === void 0 ? void 0 : { cancelTurn: () => n() });
	};
	return {
		dispatcher: r,
		writer: i,
		emit,
		publish,
		drain,
		async finish(e) {
			if (o === void 0) return;
			let n = e?.announce === !1 ? void 0 : announceWaiting(o, currentView(t));
			o = void 0, n !== void 0 && n.length > 0 && await publish(n);
		},
		async release() {
			try {
				await drain();
			} finally {
				r.close(), i.release();
			}
		}
	};
}
function createSessionEventDispatcher(e) {
	let { ctx: t, inputSource: n } = e;
	let r = t.require(ChannelKey);
	let i = buildAdapterContext(r, t);
	let a = n === void 0 ? i : {
		...i,
		inputSource: n
	};
	let o = Promise.resolve();
	let s = createBackgroundWork({ adapterKind: r.kind });
	let c = s.waitUntilFor;
	let saveChannelState = () => setChannelContext(t, {
		...r,
		state: { ...i.state }
	});
	return {
		adapterCtx: i,
		async deliver(e) {
			if (e.length === 0) return;
			let i;
			let committed = async () => {
				if (i === void 0) return;
				let { facts: e, position: t, view: n } = i;
				i = void 0, await callAdapterEventHandler(r, {
					facts: e,
					position: t.line
				}, {
					...a,
					position: t,
					scope: void 0,
					view: n,
					waitUntil: c(`committed`)
				});
			};
			for (let { event: o, position: s, progress: l, view: u } of e) {
				if (i !== void 0 && i.position.line !== s.line && await committed(), await forwardSessionInput(t, o, n)) continue;
				l || (i ??= {
					facts: [],
					position: s,
					view: u
				}).facts.push(o);
				let e = `scope` in o ? o.scope : void 0;
				let d = c(o.type);
				await callAdapterEventHandler(r, o, {
					...a,
					position: s,
					scope: e,
					view: u,
					waitUntil: d
				});
			}
			await committed(), saveChannelState();
		},
		async settle() {
			await s.settle() && saveChannelState();
		},
		close: s.close,
		react(e, n) {
			if (e.length === 0) return Promise.resolve();
			let r = o.then(() => runEffects(t, {
				...n,
				written: e
			}));
			return o = r.catch(() => void 0), r;
		}
	};
}
function openSessionEventWriter(e) {
	let t = e.getWriter();
	let n = !1;
	let release = () => {
		n || (n = !0, t.releaseLock());
	};
	return {
		async write(e) {
			await t.write(e).catch((e) => {
				throw new SessionStreamWriteError(e);
			});
		},
		close: async () => {
			try {
				await t.close();
			} finally {
				release();
			}
		},
		release
	};
}
function readSessionProjection(e) {
	return currentProjection(e);
}
async function publishTerminalSessionEvent(e) {
	let t = e.serializedContext[`eve.sessionId`] ?? ``;
	let n = {
		errorId: e.errorId,
		sessionId: t
	};
	let r = `session.ended`;
	let i = e.projection ?? (e.sessionState === void 0 ? void 0 : storedProjection(readDurableSession(e.sessionState).state));
	try {
		await assertSessionAnchorKeyAvailable(t), i = await reconcilePublishedSessionLines(i, t);
	} catch (e) {
		if (isOwnerDeploymentDeletedError(e)) {
			log$25.warn(`skipping terminal ${r} event: the session anchor deployment was deleted`, {
				...n,
				error: e
			});
			return;
		}
		throw log$25.error(`failed to prepare terminal ${r} event`, {
			...n,
			error: e
		}), e;
	}
	let a;
	let o;
	try {
		a = await deserializeContext(e.serializedContext), enterSessionProjectionAt(a, i), o = openSessionEventPublisher({
			ctx: a,
			origin: `own`,
			sessionWritable: e.sessionWritable
		});
	} catch (t) {
		if (log$25.error(`failed to restore context for terminal ${r} event`, {
			...n,
			error: t
		}), i.view.session.status === `ended`) {
			try {
				await openSessionEventWriter(e.sessionWritable).close();
			} catch {}
			return;
		}
		let a = endSession(i, e.ending);
		await writeUnroutedSessionEvent(e.sessionWritable, i, a).catch((e) => log$25.error(`failed to write terminal ${r} event`, {
			...n,
			error: e
		}));
		return;
	}
	if (i.view.session.status === `ended`) {
		try {
			await o.writer.close();
		} catch {} finally {
			await o.release();
		}
		return;
	}
	let s = a.get(AuthKey) ?? null;
	let c = a.get(SteeredByKey);
	a.setVirtualContext(SessionKey, {
		auth: {
			current: s,
			initiator: a.get(InitiatorAuthKey) ?? s,
			...c !== void 0 && c.length > 0 && { steeredBy: c }
		},
		parent: a.get(ParentSessionKey),
		sessionId: t,
		turn: e.turn ?? {
			id: `turn_0`,
			sequence: 0
		}
	});
	let publish = async (e) => {
		await o.emit(e), await o.writer.close();
	};
	let l;
	try {
		l = bindSessionInstrumentation({
			agentName: sessionAgent(a).id,
			ctx: a,
			rootSessionId: a.get(ParentSessionKey)?.rootSessionId ?? t,
			sessionId: t
		});
	} catch (e) {
		log$25.error(`failed to bind instrumentation for terminal ${r} event`, {
			...n,
			error: e
		});
	}
	let u = l?.createHandleEvent({ handleEvent: publish }) ?? publish;
	try {
		await contextStorage.run(a, () => u(endSession(i, e.ending)));
	} catch (e) {
		isOwnerDeploymentDeletedError(e) ? log$25.warn(`skipping terminal ${r} event: the session anchor deployment was deleted`, {
			...n,
			error: e
		}) : log$25.error(`failed to publish terminal ${r} event`, {
			...n,
			error: e
		});
	} finally {
		await o.release();
		try {
			await l?.flush();
		} catch (e) {
			log$25.error(`failed to flush instrumentation after terminal ${r} event`, {
				...n,
				error: e
			});
		}
	}
}
async function assertSessionAnchorKeyAvailable(e) {
	if (e.length === 0 || installedDurableHost()?.name !== `workflow`) return;
	let t = await (0, runtime_exports.getWorld)();
	if (t.getEncryptionKeyForRun === void 0) return;
	let { deploymentId: n } = await t.runs.get(e, { resolveData: `none` });
	await t.getEncryptionKeyForRun(e, { deploymentId: n });
}
async function writeUnroutedSessionEvent(e, t, n) {
	let r = (await createLineCommitter()).commit(t.view, n, t.view.position);
	let i = openSessionEventWriter(e);
	try {
		for (let { bytes: e } of r) await i.write(e);
		await i.close();
	} finally {
		i.release();
	}
}
async function commitSessionStep(e, t, n) {
	let { state: r } = `ctx` in e ? e.durableSession : readDurableSession(e.sessionState);
	let i = sessionView(storedProjection(r), r);
	let a = t(i);
	if (a.length > 1 && a.some((e) => e.turn !== i.turn) || a.filter((e) => e.signIns !== void 0).length > 1) throw Error(`A transition batch must not overlap turn or sign-in snapshots.`);
	return `ctx` in e ? await commit(e, a, n) : a.every((e) => changesNothing(i, e)) ? {
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	} : await commit(await restoreSessionStep(e), a, n);
}
async function commit(e, t, n) {
	let { published: r } = await publishFromSessionStep(e, {
		inputSource: n.inputSource,
		cancelTurn: n.cancelTurn,
		origin: n.origin,
		async publish(e) {
			let n = commitTransitions(t);
			n.length > 0 && await e(n);
		},
		updateSession: (e) => ({ session: t.reduce((e, t) => saveTransition(e, t), e) })
	});
	return r;
}
function changesNothing(e, t) {
	return t.turn === e.turn && t.events.length === 0 && t.signIns === void 0 && t.relays === void 0 && t.history === void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/value-delta.js
function snapshotValue(e) {
	return Array.isArray(e) ? e.map((e) => snapshotValue(e)) : isPlainObject(e) ? objectLike(e, Object.keys(e).map((t) => [t, snapshotValue(e[t])])) : e;
}
function diffValue(e, t) {
	if (!Object.is(e, t)) return Array.isArray(e) && Array.isArray(t) ? diffArray(e, t) : isPlainObject(e) && isPlainObject(t) && isDictionary(e) === isDictionary(t) ? diffObject(e, t) : {
		kind: `value`,
		value: t
	};
}
function applyValueDelta(e, t) {
	if (t === void 0) return e;
	switch (t.kind) {
		case `value`: return t.value;
		case `array`: {
			if (!Array.isArray(e)) throw deltaMismatch(`an array`);
			let n = e.slice(0, t.length);
			for (let [e, r] of Object.entries(t.set ?? {})) n[Number(e)] = r;
			for (let [r, i] of Object.entries(t.patch ?? {})) n[Number(r)] = applyValueDelta(e[Number(r)], i);
			return n;
		}
		case `object`: {
			if (!isPlainObject(e)) throw deltaMismatch(`an object`);
			let n = Object.keys(e);
			let r = t.set ?? {};
			let i = t.patch ?? {};
			return objectLike(e, (t.keys ?? impliedKeys(n, r)).map((t) => Object.hasOwn(r, t) ? [t, r[t]] : Object.hasOwn(i, t) ? [t, applyValueDelta(e[t], i[t])] : [t, e[t]]));
		}
	}
}
function diffArray(e, t) {
	let n = [];
	let r = [];
	let i = 0;
	for (let a = 0; a < t.length; a++) {
		if (!(a in t) || a < e.length && !(a in e)) return {
			kind: `value`,
			value: t
		};
		if (a >= e.length) {
			n.push([String(a), t[a]]);
			continue;
		}
		let o = diffValue(e[a], t[a]);
		o === void 0 ? i++ : o.kind === `value` ? n.push([String(a), o.value]) : r.push([String(a), o]);
	}
	if (n.length !== 0 || r.length !== 0 || t.length !== e.length) return i === 0 && r.length === 0 ? {
		kind: `value`,
		value: t
	} : {
		...entryChanges(n, r),
		kind: `array`,
		length: t.length
	};
}
function diffObject(e, t) {
	let n = Object.keys(e);
	let r = Object.keys(t);
	let i = [];
	let a = [];
	let o = 0;
	for (let n of r) {
		if (!Object.hasOwn(e, n)) {
			i.push([n, t[n]]);
			continue;
		}
		let r = diffValue(e[n], t[n]);
		r === void 0 ? o++ : r.kind === `value` ? i.push([n, r.value]) : a.push([n, r]);
	}
	let s = entryChanges(i, a);
	let c = !sameKeys(impliedKeys(n, s.set ?? {}), r);
	if (i.length !== 0 || a.length !== 0 || c) return o === 0 && a.length === 0 ? {
		kind: `value`,
		value: t
	} : c ? {
		...s,
		keys: r,
		kind: `object`
	} : {
		...s,
		kind: `object`
	};
}
function entryChanges(e, t) {
	let n = {};
	return e.length > 0 && (n.set = Object.fromEntries(e)), t.length > 0 && (n.patch = Object.fromEntries(t)), n;
}
function impliedKeys(e, t) {
	let n = new Set(e);
	let r = Object.keys(t).filter((e) => !n.has(e));
	return r.length === 0 ? e : [...e, ...r];
}
function sameKeys(e, t) {
	return e.length === t.length && e.every((e, n) => e === t[n]);
}
function isPlainObject(e) {
	if (typeof e != `object` || !e || Array.isArray(e)) return !1;
	let t = Object.getPrototypeOf(e);
	return t === null || Object.getPrototypeOf(t) === null;
}
function isDictionary(e) {
	return Object.getPrototypeOf(e) === null;
}
function objectLike(e, t) {
	let n = Object.fromEntries(t);
	return isDictionary(e) ? Object.assign(Object.create(null), n) : n;
}
function deltaMismatch(e) {
	return Error(`Value delta does not match its base: expected ${e}.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/step-state-delta.js
const SESSION_VALUE_KEYS = [
	`serializedContext`,
	`sessionState`,
	`history`
];
function storedByReference() {
	return process.env.WORKFLOW_VM !== `quickjs`;
}
function nextVersion(e, t) {
	return t.kind === `value` || !isDraftable(e) ? freeze(applyValueDelta(e, t), !0) : produce(e, (e) => applyToDraft(e, t));
}
function applyToDraft(e, t) {
	if (t.kind === `value`) throw Error(`A whole value replaces the draft.`);
	let apply = (t, n) => {
		n.kind === `value` ? e[t] = n.value : applyToDraft(e[t], n);
	};
	if (t.kind === `array`) {
		e.length > t.length && (e.length = t.length);
		for (let [n, r] of Object.entries(t.set ?? {})) e[Number(n)] = r;
		for (let [e, n] of Object.entries(t.patch ?? {})) apply(Number(e), n);
		return;
	}
	let n = t.keys;
	if (n !== void 0) {
		let t = new Set(n);
		for (let n of Object.keys(e)) t.has(n) || delete e[n];
	}
	for (let [n, r] of Object.entries(t.set ?? {})) e[n] = r;
	for (let [e, n] of Object.entries(t.patch ?? {})) apply(e, n);
	if (n !== void 0 && !sameOrder(Object.keys(e), n)) for (let t of n) {
		let n = e[t];
		delete e[t], e[t] = n;
	}
}
function sameOrder(e, t) {
	return e.length === t.length && e.every((e, n) => e === t[n]);
}
async function withSessionStateDelta(e, t) {
	let n = Object.fromEntries(SESSION_VALUE_KEYS.map((t) => [t, snapshotValue(e[t])]));
	let r = enterSessionStep(e);
	let { sessionWritable: i } = r;
	if (i !== void 0 && n.sessionState !== void 0) {
		let e = n.sessionState;
		let t = readDurableSession(e);
		await readOrphanedLines({
			rerun: r.rerun,
			sessionId: e.sessionId,
			position: storedProjection(t.state).view.position,
			sessionWritable: i
		});
	}
	let editable = (e) => typeof e == `object` && e && Object.isFrozen(e) ? snapshotValue(e) : e;
	let a = { ...r };
	`serializedContext` in r && (a.serializedContext = editable(r.serializedContext)), `sessionState` in r && (a.sessionState = editable(r.sessionState));
	let { serializedContext: o, sessionState: s, history: c, ...l } = await t(a);
	let u = s ?? n.sessionState;
	let d = {
		serializedContext: o,
		sessionState: u === void 0 || i === void 0 ? s : followInterruptedAttempt(i, u),
		history: c
	};
	let f = {};
	let p = storedByReference();
	for (let t of SESSION_VALUE_KEYS) {
		let r = d[t] === void 0 ? void 0 : diffValue(n[t], d[t]);
		r !== void 0 && (f[t] = p ? {
			kind: `value`,
			value: nextVersion(e[t], r)
		} : r);
	}
	return {
		...l,
		stateDelta: f
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/start.js
const log$24 = createLogger(`execution.workflow-tool-run`);
function workflowToolRunHookToken(e) {
	return e.entry.entryPoint === `execute` ? crypto.randomUUID() : taskRunHookToken(e.session.id, e.entry.taskId);
}
function taskRunHookToken(e, t) {
	return `eve:task:${e}:${t}`;
}
async function startWorkflowToolCallRun(e, t) {
	let { prestarted: n } = e;
	if (n !== void 0) {
		if (!isSameRunEntry(n.entry, t)) throw Error(`Call "${e.task.callId}" was started for a different entry point.`);
		return await n.run;
	}
	let { task: r, batchEvent: i, session: a } = e;
	return await e.startRun({
		agentContext: e.agentContext,
		callId: r.callId,
		entry: t,
		executeInput: r.executeInput,
		input: r.input,
		owner: e.owner,
		session: {
			auth: e.auth,
			id: a.sessionId,
			parent: e.parentSession,
			turn: {
				id: i.turnId,
				sequence: i.sequence
			}
		},
		stepIndex: i.stepIndex,
		toolName: r.toolName,
		workflowId: r.workflowId
	});
}
function isSameRunEntry(e, t) {
	return e.entryPoint === `execute` || t.entryPoint === `execute` ? e.entryPoint === t.entryPoint : e.entryPoint === t.entryPoint && e.taskId === t.taskId;
}
async function startWorkflowTask(e) {
	let { task: t, batchEvent: n, session: r } = e;
	try {
		let i = await startWorkflowToolCallRun(e, { entryPoint: `execute` });
		return { session: registerWorkflowToolRun(r, {
			callId: t.callId,
			origin: {
				turnId: n.turnId,
				stepIndex: n.stepIndex
			},
			address: i,
			toolName: t.toolName
		}) };
	} catch (e) {
		return logError(log$24, `workflow tool run failed to start`, e, {
			callId: t.callId,
			toolName: t.toolName
		}), {
			result: startFailureResult(t, e),
			session: r
		};
	}
}
function startFailureResult(e, t) {
	return createRuntimeToolResultFromValue({
		callId: e.callId,
		isError: !0,
		output: toError(t),
		toolName: e.toolName
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/stop-runs.js
const log$23 = createLogger(`execution.stop-runs`);
function waitedCallRuns(e) {
	try {
		let t = runtimeWait(e.state)?.event.turnId ?? turnPosition(storedProjection(e.state)).turnId;
		return getBlockingWorkflowToolRuns(e.state, t).map((e) => ({
			ends: !0,
			run: e.address
		}));
	} catch (t) {
		return logError(log$23, `failed to read the workflow tool calls a cancelled turn waits on`, t, { sessionId: e.sessionId }), [];
	}
}
async function stopRuns(e, t, n = {}) {
	let r = (await Promise.all(e.map(async (e) => ({
		target: e,
		told: await tell(e.run, t)
	})))).filter(({ target: e }) => e.ends);
	let i = n.waitForEnd === !1 ? [] : await runsStillRunning(r.filter(({ told: e }) => e).map(({ target: e }) => e.run.runId));
	let a = r.filter(({ told: e }) => !e).map(({ target: e }) => e.run.runId);
	return (await Promise.all([...a, ...i].map(async (e) => await cancelOutright(e, t.reason) ? [e] : []))).flat();
}
async function tell(e, t) {
	try {
		return await resumeRoutedHook(e.hookToken, t), !0;
	} catch (t) {
		return isRunTargetGone(t) || logError(log$23, `failed to tell a run to stop; cancelling it outright`, t, { runId: e.runId }), !1;
	}
}
async function runsStillRunning(e) {
	let t = e;
	let n = Date.now() + 35e3;
	for (; t.length > 0 && Date.now() < n;) t = (await Promise.all(t.map(async (e) => ({
		runId: e,
		live: await routedRunLive(e)
	})))).filter(({ live: e }) => e).map(({ runId: e }) => e), t.length > 0 && await new Promise((e) => setTimeout(e, 250));
	return t;
}
async function cancelOutright(e, t) {
	try {
		return await cancelRoutedRun(e, t);
	} catch (t) {
		return isRunTargetGone(t) || logError(log$23, `failed to cancel a run; it may run to completion`, t, { runId: e }), !1;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/owner-inbox.js
function workflowToolRunFailureOutput(e) {
	if (e.result.status !== `failed`) throw TypeError(`Expected a failed workflow outcome.`);
	let t = parseJsonValueOrUndefined(e.result.error);
	return t !== void 0 && typeof t == `object` && t && !Array.isArray(t) && typeof Reflect.get(t, `code`) == `string` ? t : errorMessage(e.result.error);
}
function errorMessage(e) {
	if (typeof e == `object` && e && `message` in e) {
		let t = e.message;
		if (typeof t == `string`) return t;
	}
	return String(e);
}
function parseJsonValueOrUndefined(e) {
	try {
		return parseJsonValue(e);
	} catch {
		return;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/workflow-target.js
async function ignoreGoneTarget(e) {
	try {
		await e;
	} catch (e) {
		if (!isRunTargetGone(e)) throw e;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/steps.js
const TASK_CANCEL_REASON = `The task was cancelled.`;
async function applyTaskRunMessage(e) {
	let { message: t } = e;
	let n = t.from.taskId;
	let r = readDurableSession(e.sessionState);
	if (n === void 0) return {
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	};
	let i = readTaskTable(r.state);
	let a = isCancelledTaskRun(i, n, t.from.runId);
	let o = storedProjection(r.state).view?.tasks[n]?.status === `ended`;
	if (a && (t.kind === `usage` || t.kind === `outcome`)) {
		let a = countTaskRunUsage(i, n, t);
		return i = t.kind === `outcome` ? finishTaskRun(a.table, n, t.from.runId) : a.table, await commitSessionStep({
			...e,
			sessionState: saveTable(e.sessionState, r, i)
		}, (e) => [lateTaskSpend(e, a.spend)], { origin: `own` });
	}
	if (a && t.kind === `started`) return await ignoreGoneTarget(resumeRoutedHook(findTask(i, n).run.hookToken, {
		kind: `end`,
		reason: TASK_CANCEL_REASON
	})), {
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	};
	if (o || !isActiveTaskRun(i, n, t.from.runId)) return {
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	};
	let s = [];
	let c = [];
	let l;
	switch (t.kind) {
		case `started`: {
			let e = markTaskRunStarted(i, n, t.from.runId);
			i = e.table, e.held !== void 0 && await sendTaskRunCommands(e.held);
			break;
		}
		case `reply`: {
			if (findTask(i, n)?.run?.runId !== t.from.runId) break;
			({table: i, spend: l} = countTaskRunUsage(i, n, t));
			let e = {
				output: t.output,
				status: `completed`
			};
			let r = findTask(i, n);
			let a = settleTaskCalls(i, {
				callIds: t.callIds,
				outcome: e,
				taskId: n
			});
			i = a.table, s.push(...taskSettled(r, a.settled, e));
			break;
		}
		case `usage`:
			({table: i, spend: l} = countTaskRunUsage(i, n, t));
			break;
		case `outcome`: {
			if (findTask(i, n)?.run?.runId !== t.from.runId) break;
			({table: i, spend: l} = countTaskRunUsage(i, n, t));
			let e = toOutcome(t);
			let a = findTask(i, n);
			let o = settleRemainingTaskCalls(i, n, e);
			s.push(...taskSettled(a, o.settled, e)), l !== void 0 && s.push(spent([...s], t.from.callId, l, n)), l = void 0;
			let u = runRequestIds(r, t.from.runId);
			c.push((e) => finishRun(e, {
				requestIds: u,
				taskId: n
			})), s.push((t) => endTask(t, {
				outcome: e,
				taskId: n
			})), i = finishTaskRun(o.table, n, t.from.runId);
			break;
		}
	}
	return await commitTaskDecisions(e, saveTable(e.sessionState, r, i), {
		settles: l === void 0 ? s : [...s, spent(s, t.from.callId, l, n)],
		withdraws: c
	});
}
async function cancelTasksStep(e) {
	return await withSessionStateDelta(e, cancelTasks);
}
async function cancelTasks(e) {
	let t = readDurableSession(e.sessionState);
	let n = readTaskTable(t.state);
	let r = [];
	let i = [];
	let a = {
		reason: e.reason,
		status: `cancelled`
	};
	let o = [];
	let s = e.turnCalls === !0 ? waitedCallRuns(t) : [];
	for (let s of e.taskIds) {
		let e = findTask(n, s);
		let c = cancelTask(n, s);
		if (n = c.table, r.push(...taskSettled(e, c.settled, a)), (e?.resumable === !1 || e?.kind === `agent`) && r.push((e) => endTask(e, {
			outcome: a,
			taskId: s
		})), c.send !== void 0) {
			if (e?.resumable === !1 || e?.kind === `agent`) {
				let e = runRequestIds(t, c.send.run.runId);
				i.push((t) => finishRun(t, {
					requestIds: e,
					taskId: s
				}));
			}
			o.push({
				ends: e?.resumable === !1 || e?.kind === `agent`,
				run: c.send.run
			});
		}
	}
	let c = await commitTaskDecisions(e, saveTable(e.sessionState, t, n), {
		settles: r,
		withdraws: i
	});
	let [l] = await Promise.all([
		stopRuns(o.filter((e) => e.ends), {
			kind: `end`,
			reason: TASK_CANCEL_REASON
		}, { waitForEnd: !1 }),
		stopRuns(o.filter((e) => !e.ends), {
			kind: `cancel`,
			reason: TASK_CANCEL_REASON
		}, { waitForEnd: !1 }),
		stopRuns(s, {
			kind: `cancel`,
			reason: `The turn that called the tool was cancelled.`
		})
	]);
	if (l.length === 0) return c;
	let u = readDurableSession(c.sessionState);
	let d = readTaskTable(u.state);
	let f = new Set(l);
	for (let e of d.tasks) e.run !== void 0 && f.has(e.run.runId) && (d = finishTaskRun(d, e.id, e.run.runId));
	return {
		...c,
		sessionState: saveTable(c.sessionState, u, d)
	};
}
async function commitTaskDecisions(e, t, n) {
	let r = await commitSessionStep({
		...e,
		sessionState: t
	}, (e) => n.withdraws.map((t) => t(e)), { origin: `relayed` });
	return await commitSessionStep({
		...e,
		...r
	}, (e) => n.settles.map((t) => t(e)), { origin: `own` });
}
function spent(e, t, n, r) {
	return (i) => taskSpend(i, {
		settling: e.flatMap((e) => e(i).events),
		sourceCallId: t,
		spend: n,
		taskId: r
	});
}
function taskSettled(e, t, n) {
	return e === void 0 ? [] : [(e) => settleTask(e, {
		calls: t,
		outcome: n
	})];
}
async function sendTaskRunCommands(e) {
	for (let t of e.commands) await ignoreGoneTarget(resumeRoutedHook(e.run.hookToken, toControlMessage(t)));
}
function toControlMessage(e) {
	switch (e.kind) {
		case `cancel`: return {
			kind: `cancel`,
			reason: TASK_CANCEL_REASON
		};
		case `call`: return {
			call: e.call,
			kind: `call`
		};
	}
}
function toOutcome(e) {
	switch (e.result.status) {
		case `completed`: return {
			output: e.result.output,
			status: `completed`
		};
		case `failed`: return {
			error: failureMessage(e),
			status: `failed`
		};
		case `cancelled`: return { status: `cancelled` };
	}
}
function failureMessage(e) {
	let t = workflowToolRunFailureOutput(e);
	if (typeof t == `string`) return t;
	let n = typeof t == `object` && t ? Reflect.get(t, `message`) : void 0;
	return typeof n == `string` ? n : JSON.stringify(t);
}
function countTaskRunUsage(e, t, n) {
	let r = findTask(e, t)?.run;
	if (n.usage === void 0 || r?.runId !== n.from.runId) return { table: e };
	let i = usageSince(n.usage, r.usage);
	let a = i.inputTokens !== 0 || i.outputTokens !== 0 || i.cacheReadTokens !== 0 || i.cacheWriteTokens !== 0 || i.costUsd !== void 0 && (i.costUsd !== 0 || r.usage?.costUsd === void 0);
	return {
		table: recordTaskRunUsage(e, t, n.usage),
		spend: a ? i : void 0
	};
}
function runRequestIds(e, t) {
	return [...readHitlState(e.state).relays].filter(([, e]) => e.runId === t).map(([e]) => e);
}
function saveTable(e, t, n) {
	return replaceDurableSessionSnapshot({
		session: writeTaskTable(t, n),
		state: e
	});
}
registerStepFunction("step//eve@1.4.0//cancelTasksStep", cancelTasksStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tasks/start.js
const log$22 = createLogger(`execution.tasks`);
async function startTaskRun(e, t = storedProjection(e.session.state).view) {
	let { entry: n, session: r, task: i } = e;
	let { taskId: a } = n;
	let o = {
		...e,
		taskId: a
	};
	let s = startReceipt(o, n.entryPoint === `serve`);
	let c = readTaskTable(r.state);
	let l = findTask(c, a);
	if (t.calls[i.callId]?.status === `settled`) return {
		result: s,
		session: r
	};
	if (l === void 0) return {
		result: startFailureResult(i, Error(`Task dispatch record ${a} is unavailable.`)),
		session: r
	};
	let u = tooManyTasks(o, t);
	if (u !== void 0) return {
		result: u,
		refusal: `task-limit`,
		session: writeTaskTable(r, removeTask(c, a))
	};
	let d;
	try {
		d = await startWorkflowToolCallRun(e, n);
	} catch (e) {
		return logError(log$22, `task run failed to start`, e, {
			taskId: a,
			toolName: i.toolName
		}), {
			result: startFailureResult(i, e),
			session: writeTaskTable(r, removeTask(c, a))
		};
	}
	return {
		result: s,
		session: writeTaskTable(r, recordTaskRun(c, a, d)),
		started: taskCallStart(o, l)
	};
}
async function sendToTask(e, t = storedProjection(e.session.state).view) {
	let { session: n, task: r, taskId: i } = e;
	let a = readTaskTable(n.state);
	let o = findTask(a, i);
	if (t.tasks[i]?.status !== `running` || !isTaskAvailable(o, r.toolName)) return {
		result: unknownTaskResult(e),
		refusal: `task-unavailable`,
		session: n
	};
	if (!isWorking(t, i)) {
		let r = tooManyTasks(e, t);
		if (r !== void 0) return {
			result: r,
			refusal: `task-limit`,
			session: n
		};
	}
	let s = recordTaskCall(a, i, {
		agentContext: e.agentContext,
		auth: e.auth,
		callId: r.callId,
		executeInput: r.executeInput,
		input: r.input,
		sequence: e.batchEvent.sequence,
		stepIndex: e.batchEvent.stepIndex,
		turnId: e.batchEvent.turnId
	});
	return s.send !== void 0 && await sendTaskRunCommands(s.send), {
		result: toolResult(e, renderTaskSentReceipt(i)),
		session: writeTaskTable(n, s.table),
		started: taskCallStart(e, o)
	};
}
function runEntryToStart(e, t, n) {
	let { entry: r } = n;
	switch (r.entryPoint) {
		case `execute`: return { entryPoint: `execute` };
		case `task`:
		case `serve`: return findTask(e, r.taskId) === void 0 || t.calls[n.callId]?.status === `settled` ? void 0 : r;
		case `receive`: return;
	}
}
function startsEveryRun(e, t, n) {
	if (n.some((e) => e.entry.entryPoint === `receive`)) return !1;
	let r = n.filter((n) => n.entry.entryPoint !== `execute` && runEntryToStart(e, t, n) !== void 0);
	return workingTasks(t).length + r.length <= 32;
}
function workingTasks(e) {
	return tasks(e, { status: `working` });
}
function tooManyTasks(e, t) {
	let n = workingTasks(t);
	if (n.length < 32) return;
	let r = n.map((e) => e.taskId);
	return createRuntimeToolResultFromValue({
		callId: e.task.callId,
		isError: !0,
		output: {
			code: "TOO_MANY_TASKS",
			message: renderTooManyTasksError(32, r)
		},
		toolName: e.task.toolName
	});
}
function unknownTaskResult(e) {
	return createRuntimeToolResultFromValue({
		callId: e.task.callId,
		isError: !0,
		output: {
			code: "UNKNOWN_TASK",
			message: renderUnknownTaskError(e.taskId, e.task.toolName)
		},
		toolName: e.task.toolName
	});
}
function taskCallStart(e, t) {
	return {
		callId: e.task.callId,
		clearedBy: e.task.clearedBy,
		kind: t.kind,
		name: e.task.toolName,
		taskId: e.taskId,
		turnId: e.batchEvent.turnId
	};
}
function startReceipt(e, t) {
	return toolResult(e, renderTaskReceipt({
		id: e.taskId,
		resumable: t,
		tool: e.task.toolName
	}));
}
function toolResult(e, t) {
	return createRuntimeToolResultFromValue({
		callId: e.task.callId,
		output: t,
		toolName: e.task.toolName
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/delegated-session-context.js
function hasDelegatedSessionContext(e) {
	if (e[`eve.sessionCallback`] !== void 0) return !0;
	let t = e[`eve.channel`];
	return typeof t == `object` && !!t && Reflect.get(t, `kind`) === `subagent`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tracing/eve/agent-invocation-coordinator.js
function resolveToolCallAgentTrace(e) {
	let { serializedContext: t, sessionId: n, turnId: r } = e;
	let i = readActionTraceContext(t, n, r, e.callId) ?? readTurnTraceContext(t, n, r);
	let a = e.conversation?.audience ?? `unknown`;
	let o = e.conversation?.environment ?? `production`;
	let s = readForwardedTraceAssertion(i?.forwardedTracePolicy);
	let c = i?.decision === void 0 ? i : {
		...i,
		decision: applyLiveDeliveryAudienceCeiling(i.decision, a, s, o)
	};
	return {
		conversationId: readConversationId(t[ConversationIdKey.name]),
		originAudience: s?.originAudience ?? a,
		parentTraceContext: c
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/agent-sessions/context.js
function captureAgentSessionContext(e, t) {
	let { batch: n, session: r } = e;
	return {
		agents: e.workflowAgents,
		toolStubs: e.serializedContext["eve.toolStubs"],
		...agentSessionOwner(e.owner.reference),
		capabilities: e.capabilities,
		schedule: readSerializedSessionSchedule(e.serializedContext),
		channelMetadata: e.channelMetadata,
		continuationToken: e.serializedContext[ContinuationTokenKey.name],
		conversation: e.inheritedConversation,
		dynamicSelections: e.dynamicSubagentSelections,
		remoteAgents: e.owner.roster(e.dynamicSubagentSelections).remoteAgentNames(),
		delegated: hasDelegatedSessionContext(e.serializedContext),
		localDevRequest: e.localDevRequest,
		parent: {
			callId: t,
			rootSessionId: r.rootSessionId ?? r.sessionId,
			sessionId: r.sessionId,
			turn: {
				id: n.event.turnId,
				sequence: n.event.sequence
			}
		},
		sandbox: {
			sessionId: e.sandboxSessionId,
			state: e.sandboxState
		},
		traceRoot: e.traceRoot,
		trace: resolveToolCallAgentTrace({
			callId: t,
			conversation: e.inheritedConversation,
			serializedContext: e.serializedContext,
			sessionId: r.sessionId,
			turnId: n.event.turnId
		})
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/coordination-dispatch-step.js
function dispatchCoordinationOn(e) {
	return async (t) => await withSessionStateDelta(t, (t) => dispatchCoordination(t, e));
}
async function publishDispatchedCallsStep(e) {
	return await withSessionStateDelta(e, ({ pending: e, ...t }) => commitSessionStep(t, (t) => [startDispatchedCalls(t, e)], { origin: `own` }));
}
async function dispatchCoordination(e, t) {
	let n = await prepareCoordinationDispatch({
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	});
	if (n === void 0) return {
		results: [],
		serializedContext: e.serializedContext,
		sessionState: e.sessionState,
		pending: {
			executing: [],
			refused: [],
			started: []
		}
	};
	let { batch: r, session: i } = n;
	let a = i;
	let o = [];
	let s = [];
	let c = [];
	let l = [];
	let u = copyView(storedProjection(i.state).view);
	let d = [];
	for (let e of n.plan) {
		if (hasWorkflowAdmission(e)) {
			d.push(e);
			continue;
		}
		let t = createRuntimeToolResultFromValue({
			callId: e.callId,
			toolName: e.toolName,
			output: {
				code: `TOOL_EXECUTION_DENIED`,
				message: `The call was not started: it was not admitted to run, for example because it was made before an upgrade. Make the call again to run it.`,
				tool: { result: `not_run` }
			},
			isError: !0
		});
		o.push(t), c.push({
			policy: `admission`,
			result: t
		}), (e.entry.entryPoint === `task` || e.entry.entryPoint === `serve`) && (a = writeTaskTable(a, removeTask(readTaskTable(a.state), e.entry.taskId)));
	}
	let f = withPrestartedRuns(d.map((i) => ({
		agentContext: captureAgentSessionContext(n, i.callId),
		auth: {
			current: n.auth,
			initiator: n.initiatorAuth,
			...n.steeredBy.length > 0 && { steeredBy: n.steeredBy }
		},
		batchEvent: r.event,
		owner: e.workflowToolRunOwner,
		parentSession: n.parentSession,
		session: a,
		startRun: t,
		task: i
	})), readTaskTable(a.state), u);
	for (let e of f) {
		let { task: t } = e;
		let n = await dispatchWorkflowCall({
			...e,
			session: a
		}, u);
		if (a = n.session, n.result === void 0 ? t.entry.entryPoint === `execute` && l.push({
			callId: t.callId,
			clearedBy: t.clearedBy
		}) : o.push(n.result), n.started !== void 0) {
			s.push(n.started);
			let e = sessionView({
				...storedProjection(a.state),
				view: u
			}, a.state);
			foldLine(u, {
				at: (/* @__PURE__ */ new Date()).toISOString(),
				facts: startTask(e, n.started).events
			}, u.position);
		}
		n.refusal !== void 0 && n.result !== void 0 && c.push({
			policy: n.refusal,
			result: n.result
		});
	}
	return (l.length > 0 || s.length > 0) && (a = markSandboxRunning(a, await sessionSandboxIdleTimeoutMs({
		agent: n.owner,
		channelState: n.adapter.state,
		sandboxState: a.sandboxState,
		sessionId: i.sessionId
	}))), {
		results: o,
		serializedContext: e.serializedContext,
		sessionState: a === i ? n.sessionState : createDurableSessionState({ session: a }),
		pending: {
			executing: l,
			refused: c,
			started: s
		}
	};
}
function withPrestartedRuns(e, t, n) {
	let r = e.map((e) => e.task);
	let i = r.map((e) => runEntryToStart(t, n, e));
	return i.filter((e) => e !== void 0).length > 1 && startsEveryRun(t, n, r) ? e.map((e, t) => {
		let n = i[t];
		if (n === void 0) return e;
		let r = startWorkflowToolCallRun(e, n);
		return r.catch(() => {}), {
			...e,
			prestarted: {
				entry: n,
				run: r
			}
		};
	}) : e;
}
async function dispatchWorkflowCall(e, t) {
	let { entry: n } = e.task;
	switch (n.entryPoint) {
		case `execute`: return await startWorkflowTask(e);
		case `task`:
		case `serve`: return await startTaskRun({
			...e,
			entry: n
		}, t);
		case `receive`: return await sendToTask({
			...e,
			taskId: n.taskId
		}, t);
	}
}
registerStepFunction("step//eve@1.4.0//publishDispatchedCallsStep", publishDispatchedCallsStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/pending-history.js
const PENDING_HISTORY_STATE_KEY = `eve.session.pendingHistory`;
function withPendingHistory(e, t) {
	return t === void 0 || t.length === 0 ? e : {
		...e,
		[PENDING_HISTORY_STATE_KEY]: t
	};
}
function readPendingHistory(e) {
	return e?.[PENDING_HISTORY_STATE_KEY] ?? [];
}
function withoutPendingHistory(e) {
	if (e === void 0 || !(PENDING_HISTORY_STATE_KEY in e)) return e;
	let { [PENDING_HISTORY_STATE_KEY]: t, ...n } = e;
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/initial-session-values.js
function createInitialSessionValues(e) {
	let t = createSession({
		continuationToken: e.continuationToken,
		outputSchema: e.outputSchema,
		rootSessionId: e.rootSessionId,
		sessionId: e.sessionId
	});
	let n = withPendingHistory(t.state, e.history);
	let r = projectToDurableSession(n === t.state ? t : {
		...t,
		state: n
	});
	return {
		history: t.history,
		state: {
			continuationToken: r.continuationToken,
			hasProxyInputRequests: !1,
			sessionId: r.sessionId,
			version: 2,
			snapshot: { session: r }
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/create-session-step.js
async function createSessionStep(e) {
	if ((await getCompiledRuntimeAgentBundle({
		compiledArtifactsSource: resolveDurableCompiledArtifactsSource(e.compiledArtifactsSource),
		nodeId: e.nodeId
	})).turnAgent.configResolver === !0 && e.dynamicSubagentAgentConfig === void 0) throw Error(`Dynamic subagent execution requires a selected concrete agent config.`);
	return createInitialSessionValues(e);
}
registerStepFunction("step//eve@1.4.0//createSessionStep", createSessionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/workflow-sandbox.js
const WORKFLOW_SANDBOX_MODULE_KEY = Symbol.for(`eve.workflowSandbox.module`);
async function loadWorkflowSandboxModule() {
	let e = globalThis[WORKFLOW_SANDBOX_MODULE_KEY];
	if (e === void 0) throw Error("The workflow program runtime is not installed in this server. eve installs it only for agents whose manifest declares a generated-program tool; rebuild with `eve build` after adding one.");
	return e;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/code-mode/sandbox.js
var ProgramCallError = class extends Error {
	name = `ProgramCallError`;
};
const BUSY_RETRY_DELAYS_MS = [
	250,
	500,
	1e3,
	2e3,
	4e3,
	8e3
];
const LINE_TERMINATOR_RE = /[\r\n\u2028\u2029]/u;
function buildBasePrelude(e) {
	let t = String(65536);
	return [
		`const [console, __readLogs, __formatError] = (() => {`,
		`const logs = []; let logBytes = 0;`,
		`const utf8Bytes = (s) => { let n = 0; for (let i = 0; i < s.length; i += 1) { const c = s.charCodeAt(i); if (c < 0x80) n += 1; else if (c < 0x800) n += 2; else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) { n += 4; i += 1; } else n += 3; } return n; };`,
		`const text = (value) => { if (typeof value === "string") return value; try { const json = JSON.stringify(value); return json === undefined ? String(value) : json; } catch { return String(value); } };`,
		`const log = (...args) => { if (logBytes >= ${t}) return; const line = args.map(text).join(" "); const cost = utf8Bytes(JSON.stringify(line)) + 1; if (logBytes + cost > ${t}) { logBytes = ${t}; logs.push("(console output truncated)"); return; } logBytes += cost; logs.push(line); };`,
		`const formatError = (error) => ({ message: error instanceof Error ? error.message : text(error), name: error instanceof Error ? error.name : "", stack: error instanceof Error ? String(error.stack ?? "") : "" });`,
		`return [Object.freeze({ debug: log, error: log, info: log, log, warn: log }), () => logs.slice(), formatError];`,
		`})();`,
		`const __bridge = (kind, payload) => ${e}[kind](JSON.stringify(payload)).then(JSON.parse);`
	].join(` `);
}
function wrapProgram(e, t, n) {
	let r = buildBasePrelude(t);
	return `${n !== void 0 && n.length > 0 ? `${r} ${n}` : r} try { const __value = await (async () => {${e}\n})(); return JSON.stringify({ ok: true, value: __value === undefined ? null : __value, logs: __readLogs() }); } catch (__error) { return JSON.stringify({ ok: false, error: __formatError(__error), logs: __readLogs() }); }`;
}
const runEncodingLimit = (e) => e * 6 + 1024;
async function runProgramSandbox(e) {
	if (e.prelude !== void 0 && LINE_TERMINATOR_RE.test(e.prelude)) throw Error(`Program sandbox prelude must be a single line.`);
	let t = Buffer.byteLength(e.code);
	if (t > 262144) return failed(`EXECUTE_SOURCE_TOO_LARGE: the program is ${String(t)} bytes, over the ${String(262144)} byte limit.`);
	let n = e.hostNamespace ?? `__eve`;
	let r = e.audience ?? `eve.execute/v1`;
	let i = e.errorCode ?? `EXECUTE_CALL_ERROR`;
	let a = e.errorName ?? `WorkflowProgramError`;
	let { createRunner: o, createSignedContinuationCodec: s, getHostFunctionContext: c, RunError: l } = await loadWorkflowSandboxModule();
	let { maxAgeMs: u, signingKey: d } = e.security;
	let f = o({
		continuationAudience: r,
		continuationCodec: s({
			maxAgeMs: u,
			secret: d
		})
	});
	let guestError = (e, t, n) => {
		let r = new l(e, t);
		return r.name = n, r;
	};
	let bridge = (e) => async (t) => {
		let n = c();
		let r = {
			index: n.requestIndex,
			interrupt: () => n.interrupt({ index: n.requestIndex }),
			...n.resume !== void 0 && { resumed: { resolution: n.resume.resolution } }
		};
		let o = e.errorCode ?? i;
		let s = e.errorName ?? a;
		let l;
		try {
			l = parseBridgeJson(t, `${e.label} input`, 1048576);
		} catch (e) {
			throw guestError(toErrorMessage(e), o, s);
		}
		let u;
		try {
			u = await e.handle(r, l);
		} catch (e) {
			throw e instanceof ProgramCallError ? guestError(e.message, o, s) : e;
		}
		let d = JSON.stringify(u ?? null);
		let f = Buffer.byteLength(d);
		if (f > 4194304) throw guestError(`EXECUTE_OUTPUT_TOO_LARGE: ${e.label} returned ${String(f)} bytes of JSON, over the ${String(4194304)} byte limit for one result.`, o, s);
		return d;
	};
	let p = {};
	for (let [t, n] of Object.entries(e.handlers)) p[t] = bridge(n);
	let m = wrapProgram(``, n, e.prelude);
	let h = {
		cpuTimeoutMs: 3e4,
		maxBridgeRequests: 2048,
		maxContinuationBytes: 8388608,
		maxHostFunctionArgumentsBytes: runEncodingLimit(1048576),
		maxHostFunctionOutputBytes: runEncodingLimit(4194304),
		maxInFlightBridgeRequests: 2048,
		maxResultBytes: runEncodingLimit(1179648),
		maxSourceBytes: 262144 + Buffer.byteLength(m),
		maxStackSizeBytes: 2097152,
		memoryLimitBytes: 67108864,
		timeoutMs: 3e5
	};
	let g = wrapProgram(e.code, n, e.prelude);
	let start = () => f.run({
		abortSignal: e.abortSignal,
		continuation: e.resume?.continuation,
		continuationContext: { callId: e.callId },
		hostFunctions: { [n]: p },
		limits: h,
		resolutions: e.resume?.resolutions.map((e) => ({ ...e })),
		source: g
	});
	let _;
	for (let t = 0;; t += 1) try {
		_ = await start();
		break;
	} catch (n) {
		if (e.abortSignal?.aborted === !0) throw e.abortSignal.reason;
		if (!l.isInstance(n)) throw n;
		let r = BUSY_RETRY_DELAYS_MS[t];
		if (n.code === `RUN_CONCURRENCY_LIMIT` && r !== void 0) {
			await delayWithAbort(r, e.abortSignal);
			continue;
		}
		return failed(runFailureMessage(n));
	}
	if (_.status === `interrupted`) return {
		continuation: _.continuation,
		pending: _.interruptions.map((e) => ({
			index: e.payload.index,
			interruptionId: e.id
		})),
		status: `interrupted`
	};
	let v;
	try {
		v = parseBridgeJson(_.value, `result`, 1179648);
	} catch (e) {
		return failed(toErrorMessage(e));
	}
	if (!isObject(v)) return failed(`The program returned no result.`);
	let y = clampHostLogs(v.logs);
	if (v.ok === !0) {
		let e = parseJsonValue(v.value ?? null);
		let t = Buffer.byteLength(JSON.stringify(e));
		return t > 1048576 ? {
			error: `EXECUTE_VALUE_TOO_LARGE: the program's result is ${String(t)} bytes of JSON, over the ${String(1048576)} byte limit.`,
			logs: y,
			status: `failed`
		} : {
			logs: y,
			result: e,
			status: `completed`
		};
	}
	return {
		error: guestFailureMessage(v.error),
		logs: y,
		status: `failed`
	};
}
function failed(e) {
	return {
		error: e,
		logs: [],
		status: `failed`
	};
}
function clampHostLogs(e) {
	if (!Array.isArray(e)) return [];
	let t = [];
	let n = 0;
	for (let r of e) {
		let e = String(r);
		let i = Buffer.byteLength(JSON.stringify(e)) + 1;
		if (n + i > 65536) {
			t.at(-1) !== `(console output truncated)` && t.push(`(console output truncated)`);
			break;
		}
		n += i, t.push(e);
	}
	return t;
}
function runFailureMessage(e) {
	switch (e.code) {
		case `RUN_DETACHED_BRIDGE_REQUEST`: return `The program returned while a call was still pending. Await every call before returning, including calls passed to Promise.race or Promise.any.`;
		case `RUN_CPU_TIMEOUT`: return `EXECUTE_CPU_LIMIT_REACHED: the program ran more than ${String(30)} seconds of JavaScript in one step, not counting time spent waiting on calls.`;
		case `RUN_TIMEOUT`: return `EXECUTE_TIME_LIMIT_REACHED: the program ran for more than ${String(5)} minutes without waiting on a person, an agent, or a workflow.`;
		case `RUN_CONTINUATION_TOO_LARGE`: return continuationTooLargeMessage();
		case `RUN_CONCURRENCY_LIMIT`: return `EXECUTE_RUNTIME_BUSY: no program runtime was free. Run the program again.`;
		default: return /continuation/iu.test(e.message) && /limit|large|exceed/iu.test(e.message) ? continuationTooLargeMessage() : e.message;
	}
}
function continuationTooLargeMessage() {
	return `EXECUTE_CONTINUATION_LIMIT_REACHED: the results the program holds while it waits are over ${String(8)} MiB. Return less from each call, or make fewer calls per program.`;
}
function guestFailureMessage(e) {
	if (!isObject(e)) return `The program failed.`;
	let t = typeof e.message == `string` ? e.message : `The program failed.`;
	let n = typeof e.name == `string` && e.name !== `` ? `${e.name}: ` : ``;
	let r = typeof e.stack == `string` ? /\(run\.js:(\d+):\d+\)/u.exec(e.stack)?.[1] : void 0;
	let i = r === void 0 ? 0 : Number(r) - 2;
	return `${n}${t}${i > 0 ? ` (line ${String(i)})` : ``}`;
}
function parseBridgeJson(e, t, n) {
	if (typeof e != `string`) throw TypeError(`The program's ${t} must be JSON text.`);
	let r = Buffer.byteLength(e);
	if (r > n) throw RangeError(`EXECUTE_VALUE_TOO_LARGE: the program's ${t} is ${String(r)} bytes of JSON, over the ${String(n)} byte limit.`);
	return JSON.parse(e);
}
async function delayWithAbort(e, t) {
	if (t?.aborted === !0) throw t.reason;
	await new Promise((n, r) => {
		let onAbort = () => {
			clearTimeout(i), r(t?.reason);
		};
		let i = setTimeout(() => {
			t?.removeEventListener(`abort`, onAbort), n();
		}, e);
		t?.addEventListener(`abort`, onAbort, { once: !0 });
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/dynamic-workflow/schema.js
const AGENT_INPUT_KEYS = /* @__PURE__ */ new Set([
	`files`,
	`message`,
	`outputSchema`
]);
const FILE_KEYS = /* @__PURE__ */ new Set([
	`filename`,
	`mediaType`,
	`url`
]);
const ASK_KEYS = /* @__PURE__ */ new Set([
	`allowFreeform`,
	`display`,
	`initialOptionId`,
	`options`,
	`prompt`,
	`title`
]);
const ASK_OPTION_KEYS = /* @__PURE__ */ new Set([
	`description`,
	`id`,
	`label`,
	`style`
]);
const ASK_DISPLAYS = /* @__PURE__ */ new Set([
	`confirmation`,
	`select`,
	`text`
]);
const ASK_OPTION_STYLES = /* @__PURE__ */ new Set([
	`danger`,
	`default`,
	`primary`
]);
function readWorkflowProgramAgentCall(e) {
	let t = parseJsonObject(e);
	if (typeof t.target != `string` || t.target.trim() === ``) throw TypeError(`Workflow program ctx.agent() requires a non-empty agent name.`);
	let n = parseJsonObject(t.input);
	if (typeof n.message != `string`) throw TypeError(`Workflow program ctx.agent() requires a "message" string.`);
	assertKnownKeys(n, AGENT_INPUT_KEYS, `Workflow program ctx.agent()`);
	let r = { message: n.message };
	return n.outputSchema !== void 0 && (r.outputSchema = parseJsonObject(n.outputSchema)), n.files !== void 0 && (r.files = readWorkflowProgramAgentFiles(n.files)), {
		input: r,
		target: t.target
	};
}
function readWorkflowProgramAskRequest(e) {
	let t = parseJsonObject(e);
	if (assertKnownKeys(t, ASK_KEYS, `Workflow program ctx.ask()`), typeof t.prompt != `string` || t.prompt.trim() === ``) throw TypeError(`Workflow program ctx.ask() requires a non-empty "prompt" string.`);
	let n = { prompt: t.prompt };
	if (t.title !== void 0) {
		if (typeof t.title != `string`) throw TypeError(`Workflow program ctx.ask() "title" must be a string.`);
		n.title = t.title;
	}
	if (t.display !== void 0) {
		if (typeof t.display != `string` || !ASK_DISPLAYS.has(t.display)) throw TypeError(`Workflow program ctx.ask() "display" must be "confirmation", "select", or "text".`);
		n.display = t.display;
	}
	if (t.allowFreeform !== void 0) {
		if (typeof t.allowFreeform != `boolean`) throw TypeError(`Workflow program ctx.ask() "allowFreeform" must be a boolean.`);
		n.allowFreeform = t.allowFreeform;
	}
	if (t.options !== void 0) {
		if (!Array.isArray(t.options)) throw TypeError(`Workflow program ctx.ask() "options" must be an array.`);
		n.options = t.options.map((e) => readAskOption(e));
	}
	if (t.initialOptionId !== void 0) {
		if (typeof t.initialOptionId != `string`) throw TypeError(`Workflow program ctx.ask() "initialOptionId" must be a string.`);
		if (n.display === `select` && !n.options?.some((e) => e.id === t.initialOptionId)) throw TypeError(`Workflow program ctx.ask() "initialOptionId" ${JSON.stringify(t.initialOptionId)} must match one of the question's option ids.`);
		n.initialOptionId = t.initialOptionId;
	}
	return n;
}
function readWorkflowProgramSleepSeconds(e) {
	if (typeof e != `number` || !Number.isFinite(e) || e <= 0 || e > 31536e3) throw RangeError(`Workflow program ctx.sleep() requires a finite number of seconds greater than 0 and at most 31536000.`);
	return e;
}
function readWorkflowProgramProgressUpdate(e) {
	return parseJsonValue(e);
}
function readWorkflowProgramAgentFiles(e) {
	if (!Array.isArray(e)) throw TypeError(`Workflow program ctx.agent() "files" must be an array.`);
	if (e.length > 63) throw RangeError(`Workflow program ctx.agent() accepts at most ${String(63)} files.`);
	return e.map((e) => {
		let t = parseJsonObject(e);
		if (assertKnownKeys(t, FILE_KEYS, `Workflow program ctx.agent() "files" entry`), typeof t.url != `string`) throw TypeError(`Workflow program ctx.agent() file entries require an HTTPS "url" string.`);
		let n;
		try {
			n = new URL(t.url);
		} catch {
			throw TypeError(`Workflow program ctx.agent() file entries require an https:// "url", not inline bytes or base64.`);
		}
		if (n.protocol !== `https:`) throw TypeError(`Workflow program ctx.agent() file entries require an https:// "url", not inline bytes or base64.`);
		if (typeof t.mediaType != `string` || t.mediaType.trim() === ``) throw TypeError(`Workflow program ctx.agent() file entries require a non-empty "mediaType" string.`);
		if (t.filename !== void 0 && (typeof t.filename != `string` || t.filename.trim() === ``)) throw TypeError(`Workflow program ctx.agent() file entry "filename" must be a non-empty string.`);
		return t.filename === void 0 ? {
			mediaType: t.mediaType,
			url: t.url
		} : {
			filename: t.filename,
			mediaType: t.mediaType,
			url: t.url
		};
	});
}
function readAskOption(e) {
	let t = parseJsonObject(e);
	if (assertKnownKeys(t, ASK_OPTION_KEYS, `Workflow program ctx.ask() "options" entry`), typeof t.id != `string` || t.id.trim() === ``) throw TypeError(`Workflow program ctx.ask() options require a non-empty "id" string.`);
	if (typeof t.label != `string` || t.label.trim() === ``) throw TypeError(`Workflow program ctx.ask() options require a non-empty "label" string.`);
	let n = {
		id: t.id,
		label: t.label
	};
	if (t.description !== void 0) {
		if (typeof t.description != `string`) throw TypeError(`Workflow program ctx.ask() option "description" must be a string.`);
		n.description = t.description;
	}
	if (t.style !== void 0) {
		if (typeof t.style != `string` || !ASK_OPTION_STYLES.has(t.style)) throw TypeError(`Workflow program ctx.ask() option "style" must be "primary", "danger", or "default".`);
		n.style = t.style;
	}
	return n;
}
function assertKnownKeys(e, t, n) {
	let r = Object.keys(e).find((e) => !t.has(e));
	if (r !== void 0) throw TypeError(`${n} does not accept unknown field "${r}".`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/dynamic-workflow/program-step.js
async function runWorkflowProgramStep(e) {
	let t = /* @__PURE__ */ new Map();
	let n = [];
	let r = 0;
	let resumeResult = (e) => {
		let t = e;
		if (t.status === `failed`) throw new ProgramCallError(t.error);
		return t.output ?? null;
	};
	let i = await runProgramSandbox({
		audience: `eve.workflow-program/v1`,
		callId: e.callId,
		code: e.program.js,
		errorCode: `WORKFLOW_PROGRAM_ERROR`,
		errorName: `WorkflowProgramError`,
		handlers: {
			agent: {
				errorCode: `WORKFLOW_PROGRAM_AGENT_ERROR`,
				errorName: `WorkflowProgramAgentError`,
				label: `ctx.agent()`,
				handle: async (e, n) => {
					if (e.resumed !== void 0) return resumeResult(e.resumed.resolution);
					let r;
					try {
						r = readWorkflowProgramAgentCall(n);
					} catch (e) {
						throw new ProgramCallError(toErrorMessage(e));
					}
					return t.set(e.index, {
						kind: `agent`,
						...r
					}), e.interrupt();
				}
			},
			ask: {
				label: `ctx.ask()`,
				handle: async (e, n) => {
					if (e.resumed !== void 0) return resumeResult(e.resumed.resolution);
					let r;
					try {
						r = readWorkflowProgramAskRequest(parseJsonObject(n).request);
					} catch (e) {
						throw new ProgramCallError(toErrorMessage(e));
					}
					return t.set(e.index, {
						kind: `ask`,
						request: r
					}), e.interrupt();
				}
			},
			progress: {
				label: `ctx.progress()`,
				handle: async (e, t) => {
					let i;
					try {
						let e = parseJsonObject(t);
						if (!Object.hasOwn(e, `update`)) throw TypeError(`Workflow program ctx.progress() requires a JSON-serializable update value.`);
						i = readWorkflowProgramProgressUpdate(e.update);
					} catch (e) {
						throw new ProgramCallError(toErrorMessage(e));
					}
					let a = Buffer.byteLength(JSON.stringify(i));
					if (a > 16384) throw new ProgramCallError(`WORKFLOW_PROGRAM_PROGRESS_TOO_LARGE: ctx.progress() update is ${String(a)} bytes of JSON, over the ${String(16384)} byte limit.`);
					if (n.length >= 64) throw new ProgramCallError(`WORKFLOW_PROGRAM_PROGRESS_LIMIT_REACHED: ctx.progress() may be called at most ${String(64)} times per step.`);
					if (r + a > 65536) throw new ProgramCallError(`WORKFLOW_PROGRAM_PROGRESS_LIMIT_REACHED: ctx.progress() updates in one step exceed the ${String(65536)} byte limit.`);
					return r += a, n.push(i), null;
				}
			},
			sleep: {
				label: `ctx.sleep()`,
				handle: async (e, n) => {
					if (e.resumed !== void 0) return resumeResult(e.resumed.resolution);
					let r;
					try {
						r = readWorkflowProgramSleepSeconds(parseJsonObject(n).seconds);
					} catch (e) {
						throw new ProgramCallError(toErrorMessage(e));
					}
					return t.set(e.index, {
						kind: `sleep`,
						seconds: r
					}), e.interrupt();
				}
			}
		},
		hostNamespace: `__eve`,
		prelude: buildWorkflowProgramPrelude(e.program.agents),
		resume: e.resume,
		security: e.program.continuationSecurity
	});
	return i.status === `completed` ? {
		logs: i.logs,
		progress: n,
		result: i.result,
		status: `completed`
	} : i.status === `failed` ? {
		error: i.error,
		logs: i.logs,
		progress: n,
		status: `failed`
	} : {
		continuation: i.continuation,
		pending: i.pending.map(({ index: e, interruptionId: n }) => {
			let r = t.get(e);
			if (r === void 0) throw Error(`A workflow program waits on a call it never made.`);
			return {
				action: r,
				id: n
			};
		}),
		progress: n,
		status: `interrupted`
	};
}
function buildWorkflowProgramPrelude(e) {
	return [
		`const __agents = Object.freeze(Object.fromEntries(Object.entries(${serializeSingleLineJson(e ?? {})}).map(([name, meta]) => [name, Object.freeze(meta)])));`,
		`const ctx = Object.freeze({`,
		`agents: __agents,`,
		`agent: (target, input) => __bridge("agent", { target, input }),`,
		`ask: (request) => __bridge("ask", { request }),`,
		`sleep: (seconds) => __bridge("sleep", { seconds }),`,
		`progress: (update) => __bridge("progress", { update }),`,
		`});`
	].join(` `);
}
function serializeSingleLineJson(e) {
	return JSON.stringify(e).replaceAll(`\u2028`, `\\u2028`).replaceAll(`\u2029`, `\\u2029`);
}
registerStepFunction("step//eve@1.4.0//runWorkflowProgramStep", runWorkflowProgramStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/dynamic-workflow/security-step.js
const WORKFLOW_PROGRAM_CONTINUATION_MAX_AGE_MS = 321408e5;
async function createWorkflowProgramContinuationSecurityStep() {
	return {
		maxAgeMs: WORKFLOW_PROGRAM_CONTINUATION_MAX_AGE_MS,
		signingKey: randomBytes(32).toString(`base64url`)
	};
}
registerStepFunction("step//eve@1.4.0//createWorkflowProgramContinuationSecurityStep", createWorkflowProgramContinuationSecurityStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/completion-step.js
async function completeLegacyDriverStep(e) {
	let t = e.sessionWritable.getWriter();
	try {
		await t.close();
	} finally {
		t.releaseLock();
	}
	try {
		await (0, runtime_exports.resumeHook)(e.completionToken, {
			kind: `turn-result`,
			action: {
				kind: `done`,
				...e.result,
				serializedContext: e.serializedContext,
				sessionState: {
					...e.sessionState,
					snapshot: {
						version: 1,
						session: {
							...e.sessionState.snapshot.session,
							history: e.history
						}
					}
				}
			}
		});
	} catch (e) {
		if (!HookNotFoundError.is(e)) throw e;
	}
}
registerStepFunction("step//eve@1.4.0//completeLegacyDriverStep", completeLegacyDriverStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/terminate-child-sessions-step.js
const log$21 = createLogger(`execution.terminate-child-sessions`);
async function terminateChildSessionsStep(e) {
	let t;
	try {
		t = liveRuns(readDurableSession(e.sessionState).state);
	} catch (t) {
		logError(log$21, `failed to read child sessions for termination`, t, { parentSessionId: e.sessionState.sessionId });
		return;
	}
	await stopRuns(t.map((e) => ({
		ends: !0,
		run: e
	})), {
		kind: `end`,
		reason: `The session ended.`
	});
}
async function reportChildSessionTeardownFailureStep(e) {
	logError(log$21, `failed to terminate child sessions`, e.error, { parentSessionId: e.parentSessionId });
}
registerStepFunction("step//eve@1.4.0//terminateChildSessionsStep", terminateChildSessionsStep);
registerStepFunction("step//eve@1.4.0//reportChildSessionTeardownFailureStep", reportChildSessionTeardownFailureStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/settle-cancelled-turn-step.js
async function settleCancelledTurnStep(e) {
	return await withSessionStateDelta(e, settleCancelledTurn);
}
async function settleCancelledTurn(e) {
	let t = {
		...await restoreSessionStep(e),
		history: e.history
	};
	let n = t.durableSession.state;
	let r = runtimeWait(n)?.event.turnId ?? activeTurnIdOf(storedProjection(n)) ?? ``;
	let i = controlled(e.control, `cancel`, (e) => cancel(sessionView(storedProjection(n), n), { cause: e }));
	let { published: a, result: o } = await publishFromSessionStep(t, {
		origin: `own`,
		publish: (e, t) => applyTransition(t, i, e),
		updateSession(t, n) {
			let a = n ?? saveTransition(t, i);
			let o = removeBlockingWorkflowToolRuns({
				...a,
				outputSchema: void 0
			}, r);
			let s = sessionUsage(a);
			let c = s.inputTokens + s.outputTokens + s.cacheReadTokens + s.cacheWriteTokens === 0 && s.costUsd === void 0;
			if (!e.reportUsage || c) return { session: o };
			let l = takeSessionUsageDelta(o);
			return {
				result: l.delta,
				session: l.session
			};
		}
	});
	return o === void 0 ? a : {
		...a,
		usage: o
	};
}
registerStepFunction("step//eve@1.4.0//settleCancelledTurnStep", settleCancelledTurnStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/interrupt-step.js
async function interruptLegacySessionStep(e) {
	let { history: t, ...n } = e.originalSession;
	let r = {
		...e.sessionState,
		snapshot: { session: n }
	};
	try {
		await terminateChildSessionsStep({ sessionState: r });
	} catch (e) {
		logError(createLogger(`execution.legacy-session`), `could not cooperatively stop legacy children`, e);
	}
	let i = await (0, runtime_exports.getWorld)();
	let a = e.originalSession.state;
	let o = /* @__PURE__ */ new Set();
	let s = a?.[`eve.runtime.workflowToolRuns`];
	if (Array.isArray(s)) for (let e of s) isObject(e) && typeof e.runId == `string` && o.add(e.runId);
	let c = a?.[`eve.agent.handles`];
	if (isObject(c) && Array.isArray(c.handles)) for (let e of c.handles) isObject(e) && isObject(e.address) && (e.address.kind === `agent/local` || e.address.kind === `agent/self`) && typeof e.address.sessionId == `string` && o.add(e.address.sessionId);
	let l = a?.[`eve.tasks`];
	if (isObject(l) && Array.isArray(l.tasks)) for (let e of l.tasks) isObject(e) && typeof e.taskRunId == `string` && o.add(e.taskRunId);
	for (let t of o) if (t && t !== e.sessionState.sessionId) try {
		await (0, runtime_exports.cancelRun)(i, t, { cancelReason: `Session upgraded` });
	} catch (e) {
		if (![...walkCauseChain(e)].some((e) => EntityConflictError.is(e) || RunExpiredError.is(e) || WorkflowRunNotFoundError.is(e))) throw e;
	}
	if (e.input.inputCommitted || isBetweenTurns(storedProjection(readDurableSession(e.sessionState).state))) return {
		history: e.history,
		sessionState: e.sessionState,
		serializedContext: e.serializedContext
	};
	return await settleCancelledTurn(enterSessionStep({
		history: e.history,
		reportUsage: !1,
		sessionWritable: e.input.sessionWritable,
		serializedContext: e.serializedContext,
		sessionState: e.sessionState
	}));
}
registerStepFunction("step//eve@1.4.0//interruptLegacySessionStep", interruptLegacySessionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/input.js
function readLegacyTurnInput(e) {
	if (!isObject(e) || e.version !== 1 && e.version !== 2) throw Error(`Unsupported legacy turn input version.`);
	let t = e.stepInput;
	if (!isObject(t) || typeof e.completionToken != `string` || !e.completionToken) throw Error(`Invalid legacy turn input.`);
	let n = isObject(e.initialStep) && isObject(e.initialStep.result) ? e.initialStep.result : void 0;
	let r = n?.sessionState ?? t.sessionState;
	let i = n?.serializedContext ?? t.serializedContext;
	if (!isObject(r) || typeof r.sessionId != `string` || !r.sessionId || !isObject(i) || t.parentWritable === void 0) throw Error(`Legacy turn input has no session checkpoint or output stream.`);
	let a = t.input;
	if (n === void 0 && a !== void 0 && (!isObject(a) || ![
		`deliver`,
		`clear`,
		`compact`,
		`runtime-action-result`
	].includes(String(a.kind)) || a.kind === `deliver` && !Array.isArray(a.payloads))) throw Error(`Unsupported legacy turn delivery.`);
	let o = n === void 0 && isObject(a) && a.kind === `deliver` ? a : void 0;
	return {
		completionToken: e.completionToken,
		capabilities: e.capabilities,
		retention: e.retention,
		sessionWritable: t.parentWritable,
		serializedContext: i,
		sessionState: r,
		delivery: o,
		inputCommitted: n !== void 0
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/imported-conversation.js
function normalizeHistory(e) {
	let t = [];
	let n = /* @__PURE__ */ new Map();
	let settle = () => {
		n.size !== 0 && (t.push({
			role: `tool`,
			content: [...n].map(([e, t]) => ({
				type: `tool-result`,
				toolCallId: e,
				toolName: t,
				output: {
					type: `error-text`,
					value: `Interrupted by the session upgrade. Start this work again if it is still needed.`
				}
			}))
		}), n.clear());
	};
	for (let r of e) {
		let e = r;
		if (e.role === `assistant` && Array.isArray(e.content)) e = {
			...e,
			content: e.content.filter((e) => e.type !== `tool-approval-request`)
		};
		else if (e.role === `tool` && (e = {
			...e,
			content: e.content.filter((e) => e.type !== `tool-approval-response`)
		}, e.content.length === 0)) continue;
		if (e.role !== `tool` && settle(), e.role === `assistant` && Array.isArray(e.content)) for (let t of e.content) t.type === `tool-call` && n.set(t.toolCallId, t.toolName);
		if (e.role === `tool`) for (let t of e.content) t.type === `tool-result` && n.delete(t.toolCallId);
		let i = e.kind;
		t.push(e.role === `user` && !isUserMessageKind(i) ? {
			...e,
			kind: `user`
		} : e);
	}
	return settle(), validateHarnessModelMessages(t);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/snapshot.js
const PRESERVED_FRAMEWORK_STATE = /* @__PURE__ */ new Set([`eve.harness.sessionRuntimeTokenLimit`]);
const LEGACY_USAGE_KEY = `eve.harness.turnUsage`;
const REPORTED_USAGE_KEY = `eve.harness.reportedSessionUsage`;
function readLegacySnapshot(e) {
	let t = e.snapshot;
	if (!isObject(t) || t.version !== 1 || !isObject(t.session) || t.session.sessionId !== e.sessionId || !Array.isArray(t.session.history)) throw Error(`Unsupported legacy session snapshot.`);
	return t.session;
}
function importConversation(e) {
	let { history: t, ...n } = e;
	let r = Object.fromEntries(Object.entries(e.state ?? {}).filter(([e]) => !e.startsWith(`eve.`) || PRESERVED_FRAMEWORK_STATE.has(e)));
	let i = legacyUsage(e.state?.[REPORTED_USAGE_KEY]);
	return i !== void 0 && (r[REPORTED_USAGE_KEY] = i), {
		history: normalizeHistory(t),
		sessionState: {
			version: 2,
			sessionId: e.sessionId,
			continuationToken: e.continuationToken,
			hasProxyInputRequests: !1,
			snapshot: { session: {
				...n,
				state: {
					...r,
					["eve.harness.sessionProjection"]: importProjection(e)
				}
			} }
		}
	};
}
function importProjection(e) {
	let t = e.state?.[`eve.harness.emission`];
	let n = initialSessionProjection();
	let r = legacyUsage(isObject(e.state?.[LEGACY_USAGE_KEY]) ? e.state[LEGACY_USAGE_KEY].session : void 0);
	let i = r === void 0 ? n : {
		...n,
		view: withModelUsage(n.view, r)
	};
	if (!isObject(t) || typeof t.sequence != `number`) return i;
	let { view: a } = i;
	let o = t.sessionStarted === !0 ? `open` : `new`;
	let s = typeof t.turnId == `string` ? t.turnId : ``;
	if (s === ``) return {
		...i,
		view: {
			...a,
			session: {
				status: o,
				turnCount: t.sequence
			}
		}
	};
	let c = typeof t.stepIndex == `number` ? t.stepIndex : 0;
	let l = {
		cause: { hook: `legacy` },
		follows: null,
		introducedAt: 0,
		startedAt: (/* @__PURE__ */ new Date(0)).toISOString(),
		status: `running`,
		turnId: s,
		...c > 0 && { runs: c }
	};
	return {
		...i,
		view: {
			...a,
			session: {
				latestTurnId: s,
				status: o,
				turnCount: t.sequence + 1
			},
			turns: { [s]: l }
		}
	};
}
function legacyUsage(e) {
	if (!isObject(e)) return;
	let count = (t) => typeof e[t] == `number` ? e[t] : 0;
	return usageOf({
		cacheReadTokens: count(`cacheReadTokens`),
		cacheWriteTokens: count(`cacheWriteTokens`),
		costUsd: e.sawCost === !0 && typeof e.costUsd == `number` ? e.costUsd : void 0,
		inputTokens: count(`inputTokens`),
		outputTokens: count(`outputTokens`)
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/legacy-session/prepare-step.js
const RETIRED_CONTEXT_KEYS = [
	`eve.activityObserver`,
	`eve.activityPendingBlockers`,
	`eve.activityRootTurnId`,
	`eve.connectionSearchResults`,
	`eve.internal.backgroundToolExecution`,
	`eve.mode`,
	`eve.pendingSkillAnnouncement`,
	`eve.pendingTurnSleepDuration`,
	`eve.subagentDepth`,
	`eve.tasksEnabled`,
	`eve.todo`,
	`eve.turnTaskDelivery`,
	`eve.turnTaskState`
];
async function prepareLegacySessionStep(e) {
	let t = readLegacyTurnInput(e);
	let n = readLegacySnapshot(t.sessionState);
	let { history: r, sessionState: i } = importConversation(n);
	let a = await (0, runtime_exports.getWorld)();
	let o = await a.runs.get(i.sessionId);
	let s = await hydrateWorkflowArguments(o.input, o.runId, await resolveRunEncryptionKey(a, o));
	let c = Array.isArray(s) && isObject(s[0]) ? s[0] : void 0;
	if (c === void 0) throw Error(`Cannot read the original session timeout.`);
	let l = c.sessionTimeoutMs;
	if (l !== void 0 && l !== !1 && (typeof l != `number` || !Number.isFinite(l) || l < 0)) throw Error(`Invalid original session timeout.`);
	let u = l ?? 2592e6;
	let d = {
		...t.serializedContext,
		"eve.sessionId": i.sessionId,
		["eve.sessionInbox"]: { sessionId: i.sessionId }
	};
	delete d[`eve.sessionCallback`];
	for (let e of RETIRED_CONTEXT_KEYS) delete d[e];
	let f = d[`eve.channel`];
	return isObject(f) && f.kind === `subagent` && isObject(f.state) && (d[`eve.channel`] = {
		...f,
		state: {
			...f.state,
			parentContinuationToken: ``
		}
	}), {
		input: {
			...t,
			retention: t.retention ?? c.retention
		},
		history: r,
		originalSession: n,
		sessionState: i,
		serializedContext: d,
		sessionTimeoutMs: u,
		deploymentId: process.env.VERCEL_DEPLOYMENT_ID?.trim() || await a.getDeploymentId()
	};
}
registerStepFunction("step//eve@1.4.0//prepareLegacySessionStep", prepareLegacySessionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/input-queue.js
function isSteeringDelivery(e, t, n) {
	let r = n?.paused === !0 || n?.heldOnPerson === !0;
	return (n?.heldOnPerson === !0 || (e.turnPolicy ?? `steer`) === `steer`) && (e.caller === void 0 || e.caller.callId === t.callerCallId) && (e.auth === void 0 || principalOf$1(e.auth) === t.principal || !r && joinsAnotherTurn(e));
}
function joinsAnotherTurn(e) {
	return e.principalPolicy === `retain` && e.auth != null && principalOf$1(e.auth) !== "anonymous";
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/hitl-proxy.js
const CONSUMED_MESSAGE_KEYS = /* @__PURE__ */ new Set([
	`context`,
	`message`,
	"__eveInputText"
]);
function routeDeliverPayload(e) {
	let t = readHitlState(e.state).relays;
	let n = storedProjection(e.state);
	let taken = (t) => e.allowRoute?.(t) === !1;
	let routeOf = (e) => taken(e) ? void 0 : t.get(e);
	let r = resolveMessageAgainstFirstRequest({
		enabled: e.resolveMessage === !0,
		payload: e.payload,
		projection: n,
		routeOf,
		taken
	});
	let [i] = r.answers;
	let a = [...e.payload.answers ?? [], ...r.answers];
	let o = /* @__PURE__ */ new Map();
	let s = [];
	let c = /* @__PURE__ */ new Set();
	let l;
	for (let e of a) {
		let t = routeOf(e.interactionId);
		if (t === void 0) {
			s.push(e);
			continue;
		}
		if (c.has(e.interactionId)) continue;
		c.add(e.interactionId), n.view.interactions[e.interactionId]?.request.kind === `budget` && e.optionId === "deny" && (l = {
			answer: e,
			kind: `cancel-turn`
		});
		let r = JSON.stringify([
			t.childContinuationToken,
			t.childSessionInbox?.sessionId ?? ``,
			t.remote?.sessionId ?? ``,
			t.inputSource ?? null,
			t.workflowAsk?.control ?? null
		]);
		let i = o.get(r) ?? {
			answers: [],
			relay: t
		};
		i.answers.push(e), o.set(r, i);
	}
	let u = [...o.values()].map(({ answers: t, relay: n }) => ({
		childContinuationToken: n.childContinuationToken,
		payload: { answers: t },
		...n.childSessionInbox !== void 0 && { childSessionInbox: n.childSessionInbox },
		...i !== void 0 && t.includes(i) && { message: e.payload.message },
		...n.workflowAsk !== void 0 && { workflowAsk: n.workflowAsk },
		...n.remote !== void 0 && { remote: n.remote },
		...n.inputSource !== void 0 && { inputSource: n.inputSource }
	}));
	let d = {};
	for (let [t, n] of Object.entries(e.payload)) t !== `answers` && n !== void 0 && (r.consumed && CONSUMED_MESSAGE_KEYS.has(t) || (d[t] = n));
	return s.length > 0 && (d.answers = s), {
		forChildren: u,
		forSelf: Object.keys(d).length > 0 ? d : void 0,
		parentAction: l
	};
}
function resolveMessageAgainstFirstRequest(e) {
	let t = {
		answers: [],
		consumed: !1
	};
	if (!e.enabled || (e.payload.answers?.length ?? 0) > 0) return t;
	let n = readAnswerText(e.payload);
	if (n === void 0) return t;
	let r = promptQueueHead(e.projection.view, e.taken);
	if (r === void 0 || e.routeOf(r.interactionId) === void 0) return t;
	let i = answerFromText(n, r);
	return i === void 0 ? t : {
		answers: [i],
		consumed: !0
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/answer.js
async function sendWorkflowAskAnswers(e, t, n) {
	for (let r of t ?? []) {
		let { optionId: t, text: i } = r;
		let a = n === void 0 ? {
			optionId: t,
			status: `answered`,
			text: i
		} : {
			optionId: t,
			responder: n,
			status: `answered`,
			text: i
		};
		let o = {
			kind: `answer`,
			requestId: r.interactionId,
			response: a
		};
		await resumeRoutedHook(e.control, o);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/proxied-deliver-step.js
async function routeProxiedDeliverStep(e) {
	return await withSessionStateDelta(e, routeProxiedDeliver);
}
async function routeProxiedDeliver(e) {
	let t = readHitlState(readDurableSession(e.sessionState).state).relays;
	let { delivery: n, serializedContext: r } = await deliverChannelAnswers({
		...e,
		routable: (e) => t.has(e.interactionId)
	});
	let i = readDurableSession(e.sessionState);
	let a = /* @__PURE__ */ new Map();
	let o = /* @__PURE__ */ new Map();
	let s;
	let c = !hasDelegatedSessionContext(r) && !(n.deliveryMetadata ?? []).some((e) => e.hook !== void 0) && isSteeringDelivery(n, {
		callerCallId: void 0,
		principal: resolveTurnPrincipal(void 0, r)
	}, { heldOnPerson: !0 });
	let l = /* @__PURE__ */ new Set();
	let u = [];
	let d = !1;
	let f = storedProjection(i.state).view;
	let p = activeTurn(f);
	let m = p === void 0 ? void 0 : waiting(f, p.turnId);
	let askedTurn = (e) => {
		let t = interactionOwner(f, e).turnId;
		return t !== void 0 && f.turns[t]?.status === `running` ? t : m?.on === `interaction` && m.interactions.some((t) => t.interactionId === e.interactionId) ? p?.turnId : void 0;
	};
	let h = [];
	let g = [];
	for (let [e, t] of n.payloads.entries()) {
		let r = routeDeliverPayload({
			allowRoute: (e) => !l.has(e),
			payload: t,
			resolveMessage: c,
			state: i.state
		});
		s ??= r.parentAction, r.forSelf !== void 0 && a.set(e, r.forSelf);
		let p = (n.deliveryMetadata ?? []).filter((t) => t.payloadIndex === e);
		let m = p[0]?.deliveryId;
		if (r.forChildren.length > 0 && m !== void 0) {
			let e = r.forChildren.find((e) => e.message !== void 0);
			let i = r.forChildren.flatMap((e) => e.payload.answers).map((e) => f.interactions[e.interactionId]).find((e) => e !== void 0 && askedTurn(e) !== void 0);
			let a = i === void 0 ? void 0 : askedTurn(i);
			e !== void 0 && a !== void 0 && (d = !0), r.forSelf === void 0 && a !== void 0 && u.push(...p.map((e) => e.deliveryId));
			for (let t of p) h.push({
				consumed: r.forSelf === void 0 && a !== void 0 ? {
					parts: e?.message === void 0 ? [] : userPartsOf(e.message),
					turnId: a
				} : void 0,
				continues: r.forSelf !== void 0 || void 0,
				deliveryId: t.deliveryId,
				principal: principalOf(n.auth),
				source: t.channelKind === void 0 ? void 0 : { channel: t.channelKind }
			});
			for (let e of r.forChildren) for (let n of e.payload.answers) {
				let e = (t.answers ?? []).indexOf(n);
				let r = {};
				n.optionId !== void 0 && (r.optionId = n.optionId), n.text !== void 0 && (r.text = n.text), g.push({
					deliveryId: m,
					interactionId: n.interactionId,
					responseId: `response_${m}_forwarded_${e === -1 ? `typed_0` : String(e)}`,
					value: r
				});
			}
		}
		for (let [e, t] of r.forChildren.entries()) {
			if (t.workflowAsk !== void 0 || t.message !== void 0) for (let { interactionId: e } of t.payload.answers) l.add(e);
			let n = JSON.stringify([
				t.childContinuationToken,
				t.childSessionInbox?.sessionId ?? ``,
				t.remote?.sessionId ?? ``,
				t.inputSource ?? null,
				t.workflowAsk?.control ?? null
			]);
			let r = o.get(n) ?? {
				workflowAsk: t.workflowAsk,
				remote: t.remote,
				childContinuationToken: t.childContinuationToken,
				childSessionInbox: t.childSessionInbox,
				metadata: [],
				payloads: [],
				answeredBy: /* @__PURE__ */ new Map()
			};
			for (let { interactionId: e } of t.payload.answers) {
				let t = r.answeredBy.get(e) ?? /* @__PURE__ */ new Set();
				r.answeredBy.set(e, t.add(m));
			}
			let i = r.payloads.length;
			r.payloads.push(t.payload);
			for (let t of p) r.metadata.push({
				...t,
				deliveryId: forwardedShareId(t.deliveryId, e),
				payloadIndex: i
			});
			o.set(n, r);
		}
	}
	let _ = {
		serializedContext: joinAnswerToTurn(r, {
			auth: d ? n.auth : void 0,
			deliveryIds: u
		}),
		sessionState: e.sessionState
	};
	let v = !1;
	let y = h.filter((e) => e.consumed !== void 0);
	let b = y.length === 0 ? _ : await commitSessionStep({
		..._,
		rerun: e.rerun,
		sessionWritable: e.sessionWritable
	}, (e) => [routeAnswer(e, {
		deliveries: y,
		forwarded: [],
		decided: []
	})], {
		origin: `own`,
		cancelTurn: () => {
			v = !0;
		}
	});
	if (v) {
		let t = storedProjection(readDurableSession(b.sessionState).state).view;
		let r = (n.deliveryMetadata ?? []).filter(({ deliveryId: e, payloadIndex: n }) => a.has(n) && t.deliveries[e]?.status !== `settled`);
		if (r.length === 0) return {
			...b,
			kind: `cancel-turn`
		};
		let i = await publishSessionEvents({
			...b,
			rerun: e.rerun,
			sessionWritable: e.sessionWritable
		}, [admitDeliveries(r.map(({ channelKind: e, deliveryId: r }) => ({
			deliveryId: r,
			ignored: {},
			principal: principalOf(n.auth),
			recorded: t.deliveries[r] !== void 0,
			source: e === void 0 ? void 0 : { channel: e }
		})))]);
		return {
			kind: `cancel-turn`,
			serializedContext: i.serializedContext,
			sessionState: i.sessionState
		};
	}
	let x = {};
	let S = [];
	for (let [e, i] of o) if (i.workflowAsk !== void 0) {
		let e = coalesceDeliverPayloads(i.payloads).answers ?? [];
		S.push(...e.map((e) => ({
			answer: e,
			outcome: `accepted`
		}))), await sendWorkflowAskAnswers(i.workflowAsk, e, principalOf(n.auth));
	} else {
		let a = {
			...n,
			deliveryMetadata: i.metadata.length === 0 ? void 0 : i.metadata,
			payloads: i.payloads
		};
		let o = i.remote;
		if (o !== void 0) {
			let a = await deserializeContext(r);
			let c = await resolveRemoteAgentStreamHeaders({
				bundle: requireCompiledBundle(a),
				name: o.name,
				dynamicBinding: o.dynamicBinding,
				resolverId: o.resolverId,
				url: o.url
			});
			let l = coalesceDeliverPayloads(i.payloads).answers ?? [];
			let u = await respondToRemoteAgentSession({
				remote: o,
				headers: c,
				auth: n.auth,
				idempotencyKey: await answersIdempotencyKey(n, e),
				responses: remoteAnswers(f, l)
			});
			for (let [e, n] of i.answeredBy) {
				let r = t.get(e);
				let [i, ...a] = n;
				u !== void 0 && r !== void 0 && (i === void 0 || a.length > 0 || (x[e] = {
					...r,
					receipts: {
						...r.receipts,
						[u]: i
					}
				}));
			}
			if (o.earlierProtocol === 2) for (let e of protocolTwoAnswersSettledOnForward({
				answers: l,
				decidedHere: s?.answer.interactionId,
				kindOf: (e) => f.interactions[e]?.request.kind
			})) S.push({
				answer: e,
				outcome: `accepted`
			});
		} else await resumeRoutedSessionInbox(i.childSessionInbox ?? i.childContinuationToken, a);
	}
	let C = await commitSessionStep({
		...b,
		rerun: e.rerun,
		sessionWritable: e.sessionWritable
	}, (e) => [routeAnswer(e, {
		decided: s === void 0 ? S : [...S, {
			answer: s.answer,
			outcome: `declined`
		}],
		deliveries: h,
		forwarded: g,
		relays: Object.keys(x).length === 0 ? void 0 : x
	})], { origin: `relayed` });
	if (s !== void 0) return {
		...C,
		kind: s.kind
	};
	let w = [...a].sort(([e], [t]) => e - t);
	let T = w.length === 0 ? void 0 : selectDeliveryPayloads(n, w.map(([e, t]) => ({
		index: e,
		payload: t
	})));
	return {
		...C,
		kind: `continue`,
		remainder: T
	};
}
function remoteAnswers(e, t) {
	return t.map((t) => ({
		...t,
		interactionId: e.interactions[t.interactionId]?.origin?.interactionId ?? t.interactionId
	}));
}
async function answersIdempotencyKey(e, t) {
	let n = (e.deliveryMetadata ?? []).map((e) => e.deliveryId);
	if (n.length === 0) return;
	let r = JSON.stringify([n, t]);
	let i = await crypto.subtle.digest(`SHA-256`, new TextEncoder().encode(r));
	return `eve-answers:${Array.from(new Uint8Array(i), (e) => e.toString(16).padStart(2, `0`)).join(``)}`;
}
function joinAnswerToTurn(e, t) {
	let n = { ...e };
	if (t.auth !== void 0 && (n[AuthKey.name] = continueTurnAuth(e[AuthKey.name], t.auth)), t.deliveryIds.length > 0) {
		let e = n[TurnDeliveryIdsKey.name] ?? [];
		n[TurnDeliveryIdsKey.name] = [.../* @__PURE__ */ new Set([...e, ...t.deliveryIds])];
	}
	return n;
}
async function mapHeldAnswersStep(e) {
	return await withSessionStateDelta(e, async (e) => {
		let t = new Set(e.requestIds);
		let n = await deliverChannelAnswers({
			...e,
			routable: (e) => t.has(e.interactionId)
		});
		return n.delivery === e.delivery ? { delivery: void 0 } : {
			delivery: n.delivery,
			serializedContext: n.serializedContext
		};
	});
}
async function deliverChannelAnswers(e) {
	let { routable: t } = e;
	if (!e.delivery.payloads.some((e) => e.answers?.some((e) => !t(e)) === !0)) return e;
	let n = await deserializeContext(e.serializedContext);
	let r = n.require(ChannelKey);
	if (r.deliver === void 0) return e;
	let i = r.state ?? {};
	let a = !1;
	let o = [];
	for (let s of e.delivery.payloads) {
		if (s.answers === void 0) {
			o.push(s);
			continue;
		}
		let c = [];
		for (let o of s.answers) {
			if (t(o)) {
				c.push(o);
				continue;
			}
			let l = buildAdapterContext({
				...r,
				state: structuredClone(i)
			}, n);
			let u = (await r.deliver({
				...s,
				...e.delivery.auth !== void 0 && { auth: e.delivery.auth },
				answers: [o],
				message: void 0
			}, l))?.answers?.filter(t) ?? [];
			u.length === 0 ? c.push(o) : (a = !0, i = l.state, c.push(...u));
		}
		o.push({
			...s,
			answers: c
		});
	}
	if (!a) return e;
	let s = await deserializeContext(e.serializedContext);
	return setChannelContext(s, {
		...r,
		state: i
	}), {
		delivery: {
			...e.delivery,
			payloads: o
		},
		serializedContext: serializeContext(s)
	};
}
registerStepFunction("step//eve@1.4.0//routeProxiedDeliverStep", routeProxiedDeliverStep);
registerStepFunction("step//eve@1.4.0//mapHeldAnswersStep", mapHeldAnswersStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/report-dropped-wire-payload-step.js
const log$20 = createLogger(`execution.wire`);
async function reportDroppedWirePayloadStep(e) {
	log$20.error(`dropping undecodable wire payload`, {
		detail: e.detail,
		family: e.family
	});
}
registerStepFunction("step//eve@1.4.0//reportDroppedWirePayloadStep", reportDroppedWirePayloadStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/end-sandbox-step.js
const log$19 = createLogger(`execution.session.finalization`);
async function reportSessionSandboxCleanupFailureStep(e) {
	logError(log$19, `failed to clean up terminal session sandbox`, e.error, {
		outcome: e.outcome,
		sessionId: e.sessionId
	});
}
async function endSessionSandboxStep(e) {
	let t = await deserializeContext(e.serializedContext);
	await withContextScope(t, hydrateDurableSession(readDurableSession(e.sessionState)), async (n) => (await t.get(SandboxTerminalCleanupKey)?.(e.reason), {
		result: void 0,
		session: n
	}));
}
registerStepFunction("step//eve@1.4.0//reportSessionSandboxCleanupFailureStep", reportSessionSandboxCleanupFailureStep);
registerStepFunction("step//eve@1.4.0//endSessionSandboxStep", endSessionSandboxStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/hook-ownership.js
async function claimHookOwnership(e) {
	let t;
	try {
		t = await e.getConflict();
	} catch (t) {
		return await disposeAndThrow(e, t);
	}
	if (t !== null) return await disposeAndThrow(e, createHookConflictError(e.token, t.runId));
}
async function disposeHook(e) {
	await e.dispose();
}
async function disposeAndThrow(e, t) {
	try {
		await disposeHook(e);
	} catch {}
	throw t;
}
function createHookConflictError(e, t) {
	let n = ` (run "${t}")`;
	return Object.assign(Error(`Hook token "${e}" is already in use${n}`), {
		conflictingRunId: t,
		name: `HookConflictError`,
		token: e
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/handoff-state.js
function isSessionStateIdleForHandoff(e) {
	let { state: t } = readDurableSession(e.sessionState);
	let n = getBlockingWorkflowToolRuns(t);
	if (holdsHitlRequests(t)) return !1;
	let r = storedProjection(t);
	return n.length === 0 && activeTurnIdOf(r) === void 0 && openRequests(r.view).length === 0 && openSignIns(r.view).length === 0 && queuedInput(t) === void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/map-with-concurrency.js
async function mapWithConcurrency(e, t, n) {
	let r = Array.from({ length: e.length });
	let i = 0;
	return await Promise.all(Array.from({ length: Math.min(t, e.length) }, async () => {
		for (; i < e.length;) {
			let t = i;
			i += 1, r[t] = await n(e[t]);
		}
	})), r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/handover-tracing.js
function traceSessionHandover(e, t, n, r) {
	try {
		let i = trace.getActiveSpan();
		if (i === void 0) return;
		let a = getStepMetadata();
		let o = {
			"eve.session.id": t,
			"eve.handoff.attempt_key": n,
			"workflow.run.id": getWorkflowMetadata().workflowRunId,
			"workflow.step.id": a.stepId,
			"eve.handoff.step_attempt": a.attempt,
			...r
		};
		for (let [e, t] of Object.entries(o)) t !== void 0 && i.setAttribute(e, t);
		i.addEvent(`eve.session.handover.${e}`, o);
	} catch {}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/handoff-steps.js
const log$18 = createLogger(`execution.handoff`);
async function startSuccessorStep(e) {
	let { activationToken: t, anchorRunId: n, checkpoint: r, sessionWritable: i, targetDeploymentId: a, ...o } = e;
	let { capabilities: s } = await (0, runtime_exports.getWorld)();
	if (s?.hookForceClaim !== !0 || s.hookRetention?.active !== !0) return log$18.warn(`session handoff unavailable: the Workflow world cannot force-claim hooks`, { sessionId: n }), { kind: `unsupported` };
	if (!isSessionStateIdleForHandoff(r)) return { kind: `not-idle` };
	let c = {
		...o,
		activationToken: t,
		checkpoint: r,
		handoffVersion: 3,
		kind: `handoff`,
		ownerDeploymentId: a,
		sessionWritable: i,
		sessionId: n
	};
	return {
		kind: `started`,
		runId: (await startWorkflowOnDeployment(workflowEntryReference, [c], a, r.retention === void 0 ? void 0 : { experimental_retention: r.retention })).runId
	};
}
async function hasRunEndedStep(e) {
	return await hasRunEnded(e.runId);
}
async function prepareSuccessorStep(e) {
	let { migration: t } = e;
	let unreadable = (t) => (log$18.warn(`session handoff refused: this deployment cannot read the checkpoint`, {
		detail: t,
		readableCheckpointVersion: 19,
		sessionId: e.sessionId
	}), {
		kind: `incompatible`,
		reason: `checkpoint-version`
	});
	if (t.kind === `incompatible`) return unreadable(t.detail);
	let refuse = (e) => {
		if (t.kind === `pre-v27`) return unreadable(e);
		throw Error(e);
	};
	let n = t.kind === `pre-v27` ? t.imported.checkpoint : t.checkpoint;
	let r = n.sessionTimeoutMs;
	if (r !== !1 && (typeof r != `number` || !Number.isFinite(r) || r < 0)) return refuse(`Session checkpoint contains an invalid timeout duration.`);
	let i;
	try {
		i = await deserializeContext(n.serializedContext);
	} catch (e) {
		if (e instanceof IncompatibleStateLayoutError) return unreadable(e.message);
		throw e;
	}
	let a = sessionAgent(i);
	let o = readDurableSession(n.sessionState).sandboxState?.session;
	if (o != null && !isRetiredSandboxSessionState(o)) {
		let e = (await a.sandbox())?.registry.sandbox;
		if (e === void 0) return refuse(`Session checkpoint sandbox has no agent sandbox to resolve its provider.`);
		let t = owningSandboxDefinition(e);
		if (t.kind !== `independent`) return refuse(`Session checkpoint sandbox has no resolved provider.`);
		let n = getSandboxEnvironmentRuntime(t.environment);
		let r = resolvePersistedSandboxSessionState(o, n);
		if (r?.providerName !== n.providerName || r.stateProtocolVersion !== n.stateProtocolVersion) return refuse(`Session checkpoint sandbox provider state is incompatible.`);
	}
	return isSessionStateIdleForHandoff(n) ? await holdsEveryAddress(e.source) ? (await recordSessionOwner(e.sessionId), t.kind === `pre-v27` && log$18.info(`session handoff accepted from an owner before v27`, { sessionId: e.sessionId }), { kind: `valid` }) : { kind: `source-gone` } : refuse(`Session checkpoint contains pending work and cannot be handed off.`);
}
async function holdsEveryAddress(e) {
	return (await mapWithConcurrency(e.hookTokens, 16, (e) => findSessionHookHolder(sessionInboxHookToken(e)))).every((t) => t?.runId === e.runId);
}
async function reportSessionHandoffRetainedStep(e) {
	log$18.warn(`session handoff failed; the current owner keeps the session`, {
		...e,
		checkpointVersion: 19
	});
}
async function recordSessionOwnerStep(e) {
	await recordSessionOwner(e.sessionId);
}
async function recordSessionOwner(e) {
	let { setAttributes: t } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/index.js");
	await t({
		["$eve.session"]: e,
		["$eve.prewarm"]: `1`,
		["$eve.version"]: resolveInstalledPackageInfo().version
	}, { allowReservedAttributes: !0 });
}
async function signalSessionOwnerActivationStep(e) {
	try {
		await (0, runtime_exports.resumeHook)(e.token, e.activation);
	} catch (e) {
		if (!HookNotFoundError.is(e)) throw e;
	}
}
async function reportSessionTakenOverOutsideAttemptStep(e) {
	log$18.error(`session taken over with no handoff attempt open; this run leaves without finalizing`, { sessionId: e.sessionId });
}
async function reportHandoverPartStuckStep(e) {
	log$18.warn(`session handover part keeps failing; the previous owner keeps retrying`, e);
}
async function sendSessionHandoverPartStep(e) {
	let t = {
		"eve.handoff.buffered_payload_count": e.bufferedPayloadCount,
		"eve.handoff.part_index": e.part.index
	};
	e.part.index === 0 && traceSessionHandover(`forwarding_started`, e.sessionId, e.part.attemptKey, t);
	try {
		let n = await (0, runtime_exports.resumeHook)(sessionInboxHookToken(sessionCommandHookToken(e.sessionId)), {
			...e.part,
			kind: `handover`
		});
		return traceSessionHandover(e.part.final === !0 ? `final_submitted` : `part_submitted`, e.sessionId, e.part.attemptKey, {
			...t,
			"eve.handoff.destination_run_id": n.runId
		}), `delivered`;
	} catch (e) {
		if (HookNotFoundError.is(e)) return `session-ended`;
		throw e;
	}
}
async function signalSessionAnchorStep(e) {
	let t = e.sessionId ?? (e.token.endsWith(`:anchor`) ? e.token.slice(0, -7) : void 0);
	let n = !1;
	try {
		let r = await (0, runtime_exports.resumeHook)(e.token, e.result);
		t ??= r.runId;
		let i = await (0, runtime_exports.getWorld)();
		if (i.getEncryptionKeyForRun !== void 0) try {
			let e = r.resumeContext?.deploymentId ?? (await i.runs.get(r.runId, { resolveData: `none` })).deploymentId;
			await i.getEncryptionKeyForRun(r.runId, { deploymentId: e });
		} catch (e) {
			isOwnerDeploymentDeletedError(e) && (n = !0);
		}
	} catch (e) {
		if (HookNotFoundError.is(e)) return;
		if (!isOwnerDeploymentDeletedError(e)) throw e;
		n = !0;
	}
	if (n) {
		if (t !== void 0 && t.length > 0) try {
			await (0, runtime_exports.cancelRun)(await (0, runtime_exports.getWorld)(), t, { cancelReason: `Session ended: its deployment was retired` });
		} catch (e) {
			if (!isRunInactive(e)) throw e;
		}
		log$18.warn(`cancelled session anchor whose deployment was deleted`, {
			anchorRunId: t,
			token: e.token
		});
	}
}
async function readSessionStreamTailStep(e) {
	return await readSessionStreamTailIndex(e.sessionId);
}
async function endRetiredTaskRunsStep(e) {
	log$18.info(`ending task runs retired by a session handoff`, {
		runIds: e.runs.map((e) => e.runId),
		sessionId: e.sessionId
	}), await stopRuns(e.runs.map((e) => ({
		ends: !0,
		run: e
	})), {
		kind: `end`,
		reason: `The session moved to a new deployment.`
	}, { waitForEnd: !1 });
}
registerStepFunction("step//eve@1.4.0//startSuccessorStep", startSuccessorStep);
registerStepFunction("step//eve@1.4.0//hasRunEndedStep", hasRunEndedStep);
registerStepFunction("step//eve@1.4.0//prepareSuccessorStep", prepareSuccessorStep);
registerStepFunction("step//eve@1.4.0//reportSessionHandoffRetainedStep", reportSessionHandoffRetainedStep);
registerStepFunction("step//eve@1.4.0//recordSessionOwnerStep", recordSessionOwnerStep);
registerStepFunction("step//eve@1.4.0//signalSessionOwnerActivationStep", signalSessionOwnerActivationStep);
registerStepFunction("step//eve@1.4.0//reportSessionTakenOverOutsideAttemptStep", reportSessionTakenOverOutsideAttemptStep);
registerStepFunction("step//eve@1.4.0//reportHandoverPartStuckStep", reportHandoverPartStuckStep);
registerStepFunction("step//eve@1.4.0//sendSessionHandoverPartStep", sendSessionHandoverPartStep);
registerStepFunction("step//eve@1.4.0//signalSessionAnchorStep", signalSessionAnchorStep);
registerStepFunction("step//eve@1.4.0//readSessionStreamTailStep", readSessionStreamTailStep);
registerStepFunction("step//eve@1.4.0//endRetiredTaskRunsStep", endRetiredTaskRunsStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/idle-sandbox-step.js
const log$17 = createLogger(`execution.session.idle-sandbox`);
const IDLE_STOP_TIMEOUT_MS = 12e4;
async function withinIdleStopTimeout(e) {
	let t = new AbortController();
	let n;
	let r = new Promise((e, r) => {
		n = setTimeout(() => {
			let e = Error(`The sandbox provider did not stop the idle sandbox within ${IDLE_STOP_TIMEOUT_MS / 1e3} seconds.`);
			t.abort(e), r(e);
		}, IDLE_STOP_TIMEOUT_MS);
	});
	try {
		await Promise.race([e(t.signal), r]);
	} finally {
		clearTimeout(n);
	}
}
async function stopIdleSessionSandboxStep(e) {
	return await withSessionStateDelta(e, stopIdleSessionSandbox);
}
async function stopIdleSessionSandbox(e) {
	let t = readDurableSession(e.sessionState);
	try {
		let n = await deserializeContext(e.serializedContext);
		await withContextScope(n, hydrateDurableSession(t), async (e) => {
			let t = n.get(SandboxKey);
			return t !== void 0 && await withinIdleStopTimeout((e) => t.stopIdle({ signal: e })), {
				result: void 0,
				session: e
			};
		});
	} catch (t) {
		log$17.warn(`failed to stop an idle session sandbox; the provider's own timeout still applies`, {
			error: t,
			sessionId: e.sessionState.sessionId
		});
	}
	return { sessionState: replaceDurableSessionSnapshot({
		session: {
			...t,
			sandboxState: clearSandboxRunning(t.sandboxState)
		},
		state: e.sessionState
	}) };
}
registerStepFunction("step//eve@1.4.0//stopIdleSessionSandboxStep", stopIdleSessionSandboxStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/prewarm.js
const log$16 = createLogger(`context.prewarm`);
const sessionPrewarmers = [sandboxPrewarmer];
function startSessionPrewarmers(e, t) {
	for (let n of sessionPrewarmers) try {
		n.start(e, t);
	} catch (r) {
		log$16.warn(`session prewarmer failed to start; its work runs when needed`, {
			error: r,
			phase: t,
			prewarmer: n.name,
			sessionId: e.get(SessionIdKey)
		});
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/prewarm-step.js
const log$15 = createLogger(`execution.session.prewarm`);
async function prewarmSessionStep(e) {
	return await withSessionStateDelta(e, prewarmSession);
}
async function prewarmSession(e) {
	try {
		let t = await deserializeContext(e.serializedContext);
		let r = await withContextScope(t, hydrateDurableSession(readDurableSession(e.sessionState)), async (e) => (startSessionPrewarmers(t, `session`), {
			result: void 0,
			session: e
		}));
		return {
			sandboxRunning: r.session.sandboxState?.running,
			serializedContext: serializeContext(t),
			sessionState: replaceDurableSessionSnapshot({
				session: projectToDurableSession(r.session),
				state: e.sessionState
			})
		};
	} catch (t) {
		return log$15.warn(`session prewarm failed; the first turn does this work instead`, {
			error: t,
			sessionId: e.sessionState.sessionId
		}), {};
	}
}
registerStepFunction("step//eve@1.4.0//prewarmSessionStep", prewarmSessionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/settle-control-delivery-step.js
async function settleControlDeliveryStep(e) {
	return await withSessionStateDelta(e, (t) => publishSessionEvents(t, [settleControl(e.settlement)]));
}
registerStepFunction("step//eve@1.4.0//settleControlDeliveryStep", settleControlDeliveryStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/settle-duplicate-delivery-step.js
async function settleDuplicateDeliveryStep(e) {
	return await withSessionStateDelta(e, (t) => {
		let n = storedProjection(readDurableSession(t.sessionState).state).view;
		let { deliveries: r } = planAdmission({
			channelKind: `http`,
			delivery: e.delivery,
			payloads: e.delivery.payloads.flatMap((t, r) => {
				let i = e.delivery.deliveryMetadata?.find((e) => e.payloadIndex === r);
				return i !== void 0 && n.deliveries[i.deliveryId] !== void 0 ? [] : [{
					payload: t,
					input: void 0
				}];
			})
		});
		return publishSessionEvents(t, [admitDeliveries(r.map((e) => e.ignored === void 0 ? e : {
			...e,
			ignored: { reason: `duplicate idempotency key` }
		}))]);
	});
}
registerStepFunction("step//eve@1.4.0//settleDuplicateDeliveryStep", settleDuplicateDeliveryStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/task-tool-tracing-step.js
async function startTaskToolCallsStep() {
	return Date.now();
}
registerStepFunction("step//eve@1.4.0//startTaskToolCallsStep", startTaskToolCallsStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/timeout-steps.js
async function startSessionTimeoutStep(e) {
	return { runId: (await startWorkflowOnCurrentDeployment(sessionTimeoutWorkflowReference, [e])).runId };
}
async function signalSessionTimeoutStep(e) {
	try {
		await resumeSessionInbox(e.token, {
			kind: `session-timeout`,
			ownerRunId: e.ownerRunId
		});
	} catch (t) {
		if (t instanceof StrandedSessionOwnerError) {
			if (t.ownerRunId !== e.ownerRunId) return;
			await endStrandedSession(t, e.token, `timeout`);
			return;
		}
		if (!isInactiveTimeoutTarget(t)) throw t;
	}
}
async function cancelSessionTimeoutStep(e) {
	try {
		await (0, runtime_exports.cancelRun)(await (0, runtime_exports.getWorld)(), e.runId, { cancelReason: `Session ended before its timeout` });
	} catch (e) {
		if (!isInactiveTimeoutTarget(e)) throw e;
	}
}
function isInactiveTimeoutTarget(e) {
	for (let t of walkCauseChain(e)) if (HookNotFoundError.is(t) || WorkflowRunNotFoundError.is(t) || RunExpiredError.is(t) || EntityConflictError.is(t)) return !0;
	return !1;
}
registerStepFunction("step//eve@1.4.0//startSessionTimeoutStep", startSessionTimeoutStep);
registerStepFunction("step//eve@1.4.0//signalSessionTimeoutStep", signalSessionTimeoutStep);
registerStepFunction("step//eve@1.4.0//cancelSessionTimeoutStep", cancelSessionTimeoutStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/terminal-session-completion-step.js
async function emitTerminalSessionCompletionStep(e) {
	let { cause: t, control: n, settles: r, ...i } = e;
	await publishTerminalSessionEvent({
		...i,
		ending: {
			cause: t,
			control: n,
			settles: r,
			outcome: `completed`
		}
	});
}
registerStepFunction("step//eve@1.4.0//emitTerminalSessionCompletionStep", emitTerminalSessionCompletionStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/rule.js
function evaluateSemanticErrorRules(e, t) {
	for (let n of e) {
		let e = t.chain.find((e) => n.when(e));
		if (e === void 0) continue;
		let r = {
			id: n.id,
			name: n.name,
			tags: n.tags,
			message: typeof n.message == `string` ? n.message : n.message(e)
		};
		let i = typeof n.hint == `function` ? n.hint(e) : n.hint;
		return i !== void 0 && i.length > 0 && (r.hint = i), r;
	}
	return null;
}
function nameIs(...e) {
	return (t) => t.name !== void 0 && e.includes(t.name);
}
function codeIs(...e) {
	return (t) => t.code !== void 0 && e.includes(t.code);
}
function statusCodeIs(...e) {
	return (t) => t.statusCode !== void 0 && e.includes(t.statusCode);
}
function typeIs(...e) {
	return (t) => t.type !== void 0 && e.includes(t.type);
}
function messageIs(...e) {
	return (t) => e.includes(t.message.trim());
}
function messageMatches(e) {
	return (t) => e.test(t.message);
}
function allOf(...e) {
	return (t) => e.every((e) => e(t));
}
function anyOf(...e) {
	return (t) => e.some((e) => e(t));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/signals.js
function extractErrorSignals(e) {
	let t = [];
	for (let n of walkCauseChain(e)) {
		if (!isObject(n)) continue;
		let e = { message: typeof n.message == `string` ? n.message : `` };
		typeof n.name == `string` && n.name.length > 0 && (e.name = n.name);
		let r = readProviderErrorBodies(n);
		let i = readErrorField(n, r, `code`);
		i !== void 0 && (e.code = i), typeof n.statusCode == `number` && (e.statusCode = n.statusCode);
		let a = readErrorField(n, r, `type`);
		a !== void 0 && (e.type = a), typeof n.hint == `string` && n.hint.length > 0 && (e.hint = n.hint), t.push(e);
	}
	return { chain: t };
}
function readProviderErrorBodies(e) {
	if (typeof e.responseBody != `string`) return [e.data];
	try {
		return [e.data, JSON.parse(e.responseBody)];
	} catch {
		return [e.data];
	}
}
function readErrorField(e, t, n) {
	let r = e[n];
	if (typeof r == `string` && r.length > 0) return r;
	for (let e of t) {
		let t = readBodyField(e, n);
		if (t !== void 0) return t;
	}
}
function readBodyField(e, t) {
	if (!isObject(e)) return;
	let n = e.error;
	if (isObject(n) && typeof n[t] == `string`) {
		let e = n[t];
		return e.length > 0 ? e : void 0;
	}
	let r = e[t];
	return typeof r == `string` && r.length > 0 ? r : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/rules/gateway.js
const GATEWAY_AUTH_FAILURE_SUMMARY_NAME = `AI Gateway authentication failed`;
const gatewayAuthenticationFailure = anyOf(nameIs(`GatewayAuthenticationError`), typeIs(`authentication_error`), messageMatches(/AI Gateway authentication/i));
const GATEWAY_RULES = [
	{
		id: `gateway-billing-required`,
		name: `AI Gateway billing setup required`,
		tags: [
			`gateway`,
			`config`,
			`recoverable`
		],
		when: messageMatches(/AI Gateway requires a valid credit card on file/),
		message: (e) => e.message,
		hint: `Add a valid credit card or credits in the Vercel dashboard, then retry.`
	},
	{
		id: `gateway-credit-check-throttled`,
		name: `AI Gateway credit check throttled`,
		tags: [`gateway`, `transient`],
		when: messageMatches(/credit balance verification is temporarily throttled/i),
		message: `AI Gateway temporarily throttled its credit balance check.`,
		hint: `Retries are automatic; if it persists, wait a moment and retry.`
	},
	{
		id: `gateway-credit-exhausted`,
		name: `AI Gateway credit balance exhausted`,
		tags: [
			`gateway`,
			`config`,
			`recoverable`
		],
		when: anyOf(typeIs(`insufficient_funds`), messageMatches(/A positive credit balance is required/i)),
		message: `AI Gateway requires a positive credit balance to process requests.`,
		hint: `Add credits in the Vercel dashboard, then retry.`
	},
	{
		id: `gateway-budget-exhausted`,
		name: `AI Gateway project budget exceeded`,
		tags: [
			`gateway`,
			`config`,
			`recoverable`
		],
		when: anyOf(typeIs(`quota_for_entity_exceeded`), messageMatches(/Project budget exceeded/i)),
		message: `The AI Gateway project budget has been exceeded.`,
		hint: `Ask your administrator to increase the project budget, then retry.`
	},
	{
		id: `gateway-free-tier-model-restricted`,
		name: `Model unavailable on AI Gateway free tier`,
		tags: [
			`gateway`,
			`config`,
			`recoverable`
		],
		when: messageMatches(/Free tier users do not have access to this model/),
		message: (e) => e.message,
		hint: `Switch to a model available on the free tier or upgrade your Vercel plan, then retry.`
	},
	{
		id: `gateway-free-tier-rate-limited`,
		name: `AI Gateway free tier rate limit exceeded`,
		tags: [`gateway`, `recoverable`],
		when: messageMatches(/Free tier requests on this model are rate-limited/),
		message: (e) => e.message,
		hint: `Wait for the free-tier limit to reset or upgrade your Vercel plan, then retry.`
	},
	{
		id: `gateway-auth-invalid-api-key`,
		name: GATEWAY_AUTH_FAILURE_SUMMARY_NAME,
		tags: [`gateway`, `config`],
		when: allOf(gatewayAuthenticationFailure, messageMatches(/Invalid API key/i)),
		message: `AI Gateway rejected the provided API key.`,
		hint: "Update or unset `AI_GATEWAY_API_KEY` (check your shell profile if you did not set it for this project) — manage keys at https://vercel.com/dashboard/ai/api-keys. Unsetting it falls back to OIDC via `eve link`."
	},
	{
		id: `gateway-auth-invalid-oidc-token`,
		name: GATEWAY_AUTH_FAILURE_SUMMARY_NAME,
		tags: [`gateway`, `config`],
		when: allOf(gatewayAuthenticationFailure, messageMatches(/Invalid OIDC token/i)),
		message: `AI Gateway rejected the OIDC token.`,
		hint: "Run `eve link` to refresh `VERCEL_OIDC_TOKEN` in `.env.local`, or set `AI_GATEWAY_API_KEY` — create a key at https://vercel.com/dashboard/ai/api-keys."
	},
	{
		id: `gateway-auth-missing-credentials`,
		name: GATEWAY_AUTH_FAILURE_SUMMARY_NAME,
		tags: [`gateway`, `config`],
		when: gatewayAuthenticationFailure,
		message: `AI Gateway received no credentials.`,
		hint: "Run `eve link` to populate `VERCEL_OIDC_TOKEN`, or set `AI_GATEWAY_API_KEY` — create a key at https://vercel.com/dashboard/ai/api-keys."
	},
	{
		id: `model-not-found`,
		name: `Model not found`,
		tags: [`gateway`, `config`],
		when: anyOf(nameIs(`GatewayModelNotFoundError`, `AI_NoSuchModelError`), typeIs(`model_not_found`)),
		message: `The requested model is not available.`,
		hint: "Check the model id in `agent.ts` (`model:`) or switch models with `/model` in `eve dev` — browse available models at https://vercel.com/ai-gateway/models."
	},
	{
		id: `gateway-rate-limited`,
		name: `AI Gateway rate limit exceeded`,
		tags: [`gateway`, `transient`],
		when: anyOf(nameIs(`GatewayRateLimitError`), typeIs(`rate_limit_exceeded`)),
		message: `AI Gateway rate-limited the request.`,
		hint: `Retries are automatic; if it persists, reduce request volume or review your plan limits at https://vercel.com/ai-gateway.`
	},
	{
		id: `gateway-upstream-unavailable`,
		name: `Model provider unavailable`,
		tags: [`gateway`, `transient`],
		when: anyOf(nameIs(`GatewayTimeoutError`), typeIs(`timeout_error`, `overloaded_error`)),
		message: `The model provider is overloaded or timing out upstream of AI Gateway.`,
		hint: "This is transient — retry shortly, or switch models with `/model` in `eve dev`."
	},
	{
		id: `gateway-stream-timeout`,
		name: `AI Gateway stream timed out`,
		tags: [`gateway`, `transient`],
		when: codeIs(`gateway_stream_timeout`),
		message: `AI Gateway ended the model stream before the response finished.`,
		hint: "eve already retried the request. Split the task into smaller turns, or switch models with `/model` in `eve dev`."
	},
	{
		id: `gateway-stream-terminated`,
		name: `AI Gateway stream terminated`,
		tags: [`gateway`, `transient`],
		when: anyOf(codeIs(`gateway_stream_terminated`), messageIs(`Upstream stream ended before terminal chunk`)),
		message: `AI Gateway's stream from the model provider ended before the response finished.`
	}
];
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/rules/model-provider.js
const MODEL_PROVIDER_RULES = [
	{
		id: `model-context-overflow`,
		name: `Model context window exceeded`,
		tags: [`model-provider`, `recoverable`],
		when: anyOf(codeIs(`context_length_exceeded`), allOf(statusCodeIs(400, 413), messageMatches(/prompt is too long|exceed context limit|input is too long|maximum context length|exceeds the context window|input token count.*exceeds the maximum/i))),
		message: `The request exceeds the model's context window.`,
		hint: "Send a shorter message or start a new session. If this repeats, lower `compaction.threshold` in `agent.ts` so compaction runs sooner, or shorten the agent's instructions, tools, or memory."
	},
	{
		id: `model-provider-api-key-missing`,
		name: `Model provider API key missing`,
		tags: [`model-provider`, `config`],
		when: anyOf(nameIs(`LoadAPIKeyError`, `AI_LoadAPIKeyError`), messageMatches(/API key is missing/i)),
		message: `The model provider could not load an API key.`,
		hint: "Export the provider's API key environment variable (for example `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY`) and try again."
	},
	{
		id: `empty-model-response`,
		name: `Empty model response`,
		tags: [`model-provider`, `transient`],
		when: nameIs(`EmptyModelResponseError`),
		message: (e) => e.message
	},
	{
		id: `model-response-content-filtered`,
		name: `Model response filtered`,
		tags: [
			`model-provider`,
			`recoverable`,
			`refused`
		],
		when: nameIs(`ContentFilteredModelResponseError`),
		message: `The model provider filtered this response.`,
		hint: `Review the request and its context against your model provider's content policy.`
	},
	{
		id: `model-request-cyber-policy-refused`,
		name: `Model request refused`,
		tags: [
			`model-provider`,
			`recoverable`,
			`refused`
		],
		when: codeIs(`cyber_policy`),
		message: `The model provider refused this request for possible cybersecurity risk.`,
		hint: `Review the request against your model provider's usage policies.`
	},
	{
		id: `model-request-bio-policy-refused`,
		name: `Model request refused`,
		tags: [
			`model-provider`,
			`recoverable`,
			`refused`
		],
		when: codeIs(`bio_policy`),
		message: `The model provider refused this request for possible biological risk.`,
		hint: `Review the request against your model provider's usage policies.`
	},
	{
		id: `model-capability-unsupported`,
		name: `Model capability not supported`,
		tags: [`model-provider`],
		when: nameIs(`AI_UnsupportedFunctionalityError`),
		message: `The selected model does not support a capability this agent uses (a tool type, modality, or feature).`,
		hint: `Remove the unsupported tool or switch to a model that supports it.`
	}
];
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/rules/sandbox.js
const passThroughMessage = (e) => e.message;
const passThroughHint = (e) => e.hint;
const SANDBOX_RULES = [{
	id: `sandbox-docker-cli-missing`,
	name: `Docker CLI not found`,
	tags: [`sandbox`, `config`],
	when: nameIs(`DockerUnavailableError`),
	message: passThroughMessage,
	hint: passThroughHint
}, {
	id: `sandbox-docker-daemon-unreachable`,
	name: `Docker daemon unreachable`,
	tags: [`sandbox`, `config`],
	when: nameIs(`DockerDaemonUnavailableError`),
	message: passThroughMessage,
	hint: passThroughHint
}];
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/rules/system.js
const NETWORK_ERROR_CODES = [
	`ECONNREFUSED`,
	`ECONNRESET`,
	`EAI_AGAIN`,
	`ENOTFOUND`,
	`EPIPE`,
	`ETIMEDOUT`,
	`UND_ERR_BODY_TIMEOUT`,
	`UND_ERR_CONNECT_TIMEOUT`,
	`UND_ERR_HEADERS_TIMEOUT`,
	`UND_ERR_SOCKET`
];
const NETWORK_FAILURE_HINT = `Check your internet connection and that the target service is reachable, then try again.`;
const SYSTEM_RULES = [
	{
		id: `port-already-in-use`,
		name: `Port already in use`,
		tags: [`system`, `config`],
		when: codeIs(`EADDRINUSE`),
		message: "The port is already in use — another process (perhaps another `eve dev`) is listening on it.",
		hint: "Stop that process or pass a different `--port`."
	},
	{
		id: `disk-full`,
		name: `Disk full`,
		tags: [`system`],
		when: codeIs(`ENOSPC`),
		message: `The disk is full, so writes are failing.`,
		hint: `Free up space and retry.`
	},
	{
		id: `network-request-failed`,
		name: `Network request failed`,
		tags: [`system`, `transient`],
		when: codeIs(...NETWORK_ERROR_CODES),
		message: (e) => networkFailureMessage(e.code ?? `network error`),
		hint: NETWORK_FAILURE_HINT
	},
	{
		id: `network-request-failed`,
		name: `Network request failed`,
		tags: [`system`, `transient`],
		when: messageIs(`fetch failed`, `socket hang up`, `terminated`),
		message: (e) => networkFailureMessage(e.message.trim()),
		hint: NETWORK_FAILURE_HINT
	}
];
function networkFailureMessage(e) {
	return `A network request failed before completing (${e}).`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/rules/workflow.js
const WORKFLOW_RULES = [
	{
		id: `workflow-store-version-mismatch`,
		name: `Local session store incompatible`,
		tags: [`workflow`],
		when: nameIs(`NewerSchemaError`),
		message: "The local workflow store (`.eve/.workflow-data`) was written by a newer eve version.",
		hint: `Upgrade eve, or remove that directory to reset local sessions, then retry.`
	},
	{
		id: `workflow-store-inaccessible`,
		name: `Local session store inaccessible`,
		tags: [`workflow`],
		when: nameIs(`DataDirAccessError`),
		message: "The local workflow store (`.eve/.workflow-data`) could not be created or accessed.",
		hint: `Check filesystem permissions and free disk space, then retry.`
	},
	{
		id: `workflow-replay-divergence`,
		name: `Durable replay diverged`,
		tags: [`workflow`],
		when: nameIs(`ReplayDivergenceError`),
		message: `The durable workflow replay diverged from the recorded run — usually caused by code changing mid-session in a way the runtime cannot reconcile.`,
		hint: "Start a fresh session (`/new` in `eve dev`)."
	},
	{
		id: `workflow-event-log-corrupted`,
		name: `Durable event log corrupted`,
		tags: [`workflow`],
		when: nameIs(`CorruptedEventLogError`),
		message: `The durable event log for this run is corrupted.`,
		hint: "Remove `.eve/.workflow-data` to reset local sessions, then retry."
	},
	{
		id: `workflow-run-not-found`,
		name: `Session run not found`,
		tags: [`workflow`],
		when: nameIs(`WorkflowRunNotFoundError`),
		message: `This session's durable run no longer exists (the local store was reset or pruned).`,
		hint: `Start a new session.`
	}
];
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/semantic-errors/index.js
const CATALOG = [
	...GATEWAY_RULES,
	...MODEL_PROVIDER_RULES,
	...WORKFLOW_RULES,
	...SANDBOX_RULES,
	...SYSTEM_RULES
];
function summarizeKnownError(e) {
	return evaluateSemanticErrorRules(CATALOG, extractErrorSignals(e));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/failure-summary.js
function summarizeFailure(e, t) {
	let n = formatError(e);
	let r = summarizeKnownError(e);
	let i = n;
	if (r !== null) {
		let e = {
			...n,
			message: r.message,
			name: r.name,
			semanticErrorId: r.id
		};
		i = r.hint === void 0 ? e : {
			...e,
			hint: r.hint
		};
	}
	return {
		code: typeof i.name == `string` ? i.name : t,
		details: i,
		message: typeof i.message == `string` ? i.message : String(e)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/terminal-session-failure-step.js
const log$14 = createLogger(`execution.workflow-entry`);
async function emitTerminalSessionFailureStep(e) {
	let { code: t, details: n, message: r } = summarizeFailure(e.error, `WORKFLOW_EXECUTION_FAILED`);
	let i = e.serializedContext[`eve.sessionId`] ?? ``;
	log$14.error(`workflow loop threw — ending the session failed`, {
		sessionId: i,
		errorId: typeof n.errorId == `string` ? n.errorId : void 0,
		code: t
	}), await publishTerminalSessionEvent({
		ending: {
			cause: e.turnId === void 0 ? void 0 : { turnId: e.turnId },
			error: errorInfoOf({
				code: t,
				details: n,
				message: r
			}),
			outcome: `failed`
		},
		errorId: typeof n.errorId == `string` ? n.errorId : void 0,
		projection: e.projection,
		sessionState: e.sessionState,
		serializedContext: e.serializedContext,
		sessionWritable: e.sessionWritable,
		turnId: e.turnId
	});
}
registerStepFunction("step//eve@1.4.0//emitTerminalSessionFailureStep", emitTerminalSessionFailureStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/agent-router-workflow.js
async function runAgentRouterTask(e, t) {
	throw new Error("You attempted to execute workflow runAgentRouterTask function directly. To start a workflow, use start(runAgentRouterTask) from eve/workflow/api");
}
async function chooseTarget(e, t, n) {
	let r = Object.keys(t);
	if (r.length === 0) throw Error(`agentRouter requires at least one available agent with a description.`);
	return r.length === 1 ? r[0] : (await decideFor(`agent-routing`, {
		signal: n,
		state: { message: e },
		questions: { route: {
			type: `choice`,
			instructions: `Which subagent should handle this task?`,
			criteria: t
		} }
	})).answers.route.choice;
}
runAgentRouterTask.workflowId = `workflow//eve@1.4.0//runAgentRouterTask`;
runAgentRouterTask.workflowId = "workflow//eve@1.4.0//runAgentRouterTask";
registerStepFunction("step//eve@1.4.0//chooseTarget", chooseTarget);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/children.js
function openChild(e, t) {
	return commitOf([{
		...fact(`child.opened`, e),
		scope: scoped(t)
	}]);
}
function recordChildSent(e, t) {
	return commitOf([{
		...fact(`child.sent`, e),
		scope: scoped(t)
	}]);
}
function scoped(e) {
	return e.taskId === void 0 ? { turnId: e.turnId } : {
		turnId: e.turnId,
		taskId: e.taskId
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/apply-run-messages.js
function workflowToolRunReportEvents(e, t, n) {
	let { view: r } = storedProjection(readDurableSession(e.sessionState).state);
	let i = r?.calls[t.callId];
	return r !== void 0 && (i === void 0 || i.status === `settled`) ? [] : [callProgress(t.callId, n)];
}
async function childOpenedEvent(e, t, { from: n, session: r }) {
	let i = r.kind === `remote` ? createEveSubagentStreamRoutePath({
		callId: n.callId,
		childSessionId: r.sessionId,
		parentSessionId: t
	}) : createEveSessionStreamRoutePath(r.sessionId);
	if (r.kind === `remote`) {
		let a = {
			callId: n.callId,
			childSessionId: r.sessionId,
			name: r.name,
			streamPath: i,
			url: r.url
		};
		r.resolverId !== void 0 && (a.resolverId = r.resolverId), r.dynamicBinding !== void 0 && (a.dynamicBinding = parseJsonValue(r.dynamicBinding)), r.earlierProtocol !== void 0 && (a.earlierProtocol = r.earlierProtocol), await e.recordRemoteBinding(t, a);
	}
	return openChild({
		name: r.name,
		owner: { callId: n.callId },
		sessionId: r.sessionId,
		stream: i
	}, {
		taskId: n.taskId,
		turnId: n.turnId
	});
}
function childSentEvent({ deliveryId: e, from: t, sessionId: n }) {
	return recordChildSent({
		callId: t.callId,
		childDeliveryId: e,
		sessionId: n
	}, {
		taskId: t.taskId,
		turnId: t.turnId
	});
}
function applyRunMessagesOn(e) {
	return async (t) => await withSessionStateDelta(t, async ({ canCancelTurn: t, messages: n, ...r }) => {
		let i = r;
		let a = !1;
		let o = [];
		let publish = async () => {
			if (o.length === 0) return;
			let e = await publishSessionEvents(i, o, { canCancelTurn: t });
			i = {
				...i,
				serializedContext: e.serializedContext,
				sessionState: e.sessionState
			}, a ||= e.cancelled, o = [];
		};
		for (let t of n) {
			let n = t.from.taskId;
			let r = readDurableSession(i.sessionState).state;
			let a = n !== void 0 && (!isActiveTaskRun(readTaskTable(r), n, t.from.runId) || storedProjection(r).view?.tasks[n]?.status === `ended`);
			t.kind === `agent-started` ? a ? await e.stopLate({
				address: t.session,
				context: t.context,
				key: t.from.runId
			}) : o.push(await childOpenedEvent(e, i.sessionState.sessionId, t)) : t.kind === `agent-sent` ? a || o.push(childSentEvent(t)) : t.kind === `report` ? a || o.push(...workflowToolRunReportEvents(i, t.from, t.update)) : (await publish(), i = {
				...i,
				...await applyTaskRunMessage({
					...i,
					message: t
				})
			});
		}
		return await publish(), {
			cancelled: a,
			serializedContext: i.serializedContext,
			sessionState: i.sessionState
		};
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/apply-run-messages-step.js
const WORKFLOW_CHILDREN = {
	recordRemoteBinding: recordRemoteChildBinding,
	stopLate: stopLateAgentSessionStep
};
async function applyRunMessagesStep(e) {
	return await applyRunMessagesOn(WORKFLOW_CHILDREN)(e);
}
registerStepFunction("step//eve@1.4.0//applyRunMessagesStep", applyRunMessagesStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/poll-until.js
async function pollUntil(e, t) {
	let n = Date.now() + t;
	for (let t = 20;; t = Math.min(t * 2, 200)) {
		let r = await e();
		if (r !== void 0 || Date.now() >= n) return r;
		await new Promise((e) => setTimeout(e, t));
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/interrupt.js
const INTERRUPT = { kind: `interrupt` };
const RUN_START_TIMEOUT_MS = 3e4;
async function interruptWorkflowToolRun(e) {
	if (await pollUntil(async () => {
		try {
			return await resumeRoutedHook(e.hookToken, INTERRUPT), !0;
		} catch (e) {
			if (!isRunTargetGone(e)) throw e;
		}
		return await routedRunEnded(e.runId) ? !0 : void 0;
	}, RUN_START_TIMEOUT_MS) === void 0) throw Error(`Workflow tool run "${e.runId}" did not start taking commands within ${RUN_START_TIMEOUT_MS / 1e3} seconds, so it has not received the interrupt yet.`);
}
registerStepFunction("step//eve@1.4.0//interruptWorkflowToolRun", interruptWorkflowToolRun);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/resume-hook-step.js
async function resumeHookStep(e, t, n) {
	try {
		await resumeRoutedHook(e, t);
	} catch (e) {
		if (n?.ifPresent === !0 && isRunTargetGone(e)) return;
		throw e;
	}
}
registerStepFunction("step//eve@1.4.0//resumeHookStep", resumeHookStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/workflow/withdraw-step.js
async function withdrawWorkflowToolRunQuestionStep(e) {
	return await withSessionStateDelta(e, withdrawWorkflowToolRunQuestion);
}
async function withdrawWorkflowToolRunQuestion(e) {
	let t = {
		kind: `withdrawn`,
		requestId: e.requestId
	};
	return await ignoreGoneTarget(resumeRoutedHook(e.control, t)), await relayWithdrawnRequests(e, (t, n) => t === e.requestId && n.workflowAsk !== void 0 && n.runId === e.runId);
}
async function withdrawFinishedRunQuestionsStep(e) {
	return await withSessionStateDelta(e, (e) => relayWithdrawnRequests(e, (t, n) => n.runId === e.runId));
}
async function relayWithdrawnRequests(e, t) {
	let { state: n } = readDurableSession(e.sessionState);
	let r = [...readHitlState(n).relays].filter(([e, n]) => t(e, n)).map(([e]) => e);
	return await commitSessionStep(e, (e) => [finishRun(e, { requestIds: r })], { origin: `relayed` });
}
registerStepFunction("step//eve@1.4.0//withdrawWorkflowToolRunQuestionStep", withdrawWorkflowToolRunQuestionStep);
registerStepFunction("step//eve@1.4.0//withdrawFinishedRunQuestionsStep", withdrawFinishedRunQuestionsStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-host/start-run.js
const startWorkflowToolRun = async (e) => {
	let t = workflowToolRunHookToken(e);
	return {
		hookToken: t,
		runId: (await startWorkflowOnCurrentDeployment(workflowToolRunWorkflowReference, [{
			...e,
			hookToken: t
		}])).runId
	};
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-host/dispatch-step.js
async function dispatchCoordinationStep(e) {
	return await dispatchCoordinationOn(startWorkflowToolRun)(e);
}
registerStepFunction("step//eve@1.4.0//dispatchCoordinationStep", dispatchCoordinationStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/playback.js
var StubPlayback = class {
	rules;
	results = /* @__PURE__ */ new Map();
	positions = /* @__PURE__ */ new Map();
	constructor(e) {
		this.rules = e.map((e) => ({
			...e,
			constraints: Object.entries(e.match ?? {}).map(([t, n]) => {
				try {
					return {
						property: t,
						validator: createStubValidator(n)
					};
				} catch (n) {
					throw Error(`Could not create validator for matcher "${t}" in tool stub "${e.id}".`, { cause: n });
				}
			})
		}));
	}
	get matchedRuleCount() {
		return this.positions.size;
	}
	call(e) {
		let t = this.results.get(e.callId);
		if (t !== void 0) return t;
		if (this.results.size >= 1e4) return {
			kind: `error`,
			error: `Tool stub session exceeded 10,000 calls. Start a new eval session.`
		};
		let n = this.rules.filter((t) => t.tool === e.tool);
		if (e.persistent && n.some((e) => e.constraints.length > 0)) return this.record(e, {
			kind: `error`,
			error: `Persistent tool "${e.tool}" requires an unconditional stub.`
		});
		let r = n.find((t) => t.constraints.every(({ property: t, validator: n }) => isObject(e.input) && Object.hasOwn(e.input, t) && n.validate(e.input[t]).valid));
		if (r === void 0) return this.record(e, { kind: `real` });
		let i = r.outcomes ?? [r.outcome];
		let a = Math.min(this.positions.get(r.id) ?? 0, i.length - 1);
		return this.positions.set(r.id, a + 1), this.record(e, {
			kind: `stub`,
			ruleId: r.id,
			position: a,
			outcome: i[a]
		});
	}
	record(e, t) {
		return this.results.set(e.callId, t), t;
	}
	fail(e, t) {
		return this.results.get(e)?.kind === `stub` ? {
			kind: `error`,
			error: t
		} : { kind: `real` };
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tool-stubs/playback.js
async function withStubPlayback(e, t, n) {
	if (e === void 0 || e.rootSessionId !== void 0) return await n();
	let r;
	try {
		r = new StubPlayback(e.rules);
	} catch (e) {
		throw await publishStubFailureStep(e instanceof Error ? e.message : `Could not create tool stub validators.`), e;
	}
	let i = createHook({ token: e.token });
	let a = !1;
	let serve = async () => {
		for await (let e of i) {
			let t = r.matchedRuleCount;
			let n = e.kind === `failure` ? r.fail(e.callId, e.error) : r.call(e.call);
			n.kind === `error` && !a && (await publishStubFailureStep(n.error), a = !0), await publishStubResultStep({
				callId: e.kind === `call` ? e.call.callId : `${e.callId}:failure`,
				result: n,
				matchedRuleId: n.kind === `stub` && r.matchedRuleCount > t ? n.ruleId : void 0
			});
		}
		throw Error(`Tool stub playback ended before its session.`);
	};
	try {
		await claimHookOwnership(i);
		let e = n();
		let r = serve().catch(async () => (await publishStubFailureStep(`Tool stub playback failed.`), await failStubSessionStep(t), await e));
		return await Promise.race([e, r]);
	} finally {
		await disposeHook(i);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-host/tool-stubs.js
const workflowToolStubs = {
	serve: (e, t, n) => withStubPlayback(e, t, n),
	call: (e, t) => callToolStubStep(e, t),
	fail: (e, t, n) => reportStubFailureStep(e, t, n)
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/parent-notification.js
const log$13 = createLogger(`execution.delegated-parent-notification`);
const SUBAGENT_EXECUTION_FAILED = `SUBAGENT_EXECUTION_FAILED`;
const ZERO_TOKEN_USAGE = {
	cacheReadTokens: 0,
	cacheWriteTokens: 0,
	inputTokens: 0,
	outputTokens: 0
};
async function notifyTurnCallerStep(e) {
	if (e.caller === void 0) return;
	let t = createSettledTurnResult({
		caller: e.caller,
		lifecycle: e.lifecycle,
		sessionId: e.sessionId,
		settled: e.settled
	});
	e.caller.replyTo.kind === `callback` ? await postSettledTurnCallback({
		result: t,
		sessionId: e.sessionId,
		url: e.caller.replyTo.url
	}) : await resumeSettledTurnHook(e.caller.replyTo.token, t);
}
async function notifyCancelledTaskCallerStep(e) {
	let t = e.usage ?? ZERO_TOKEN_USAGE;
	let n = {
		code: SUBAGENT_EXECUTION_FAILED,
		message: `The agent invocation was cancelled.`
	};
	let r = {
		callId: e.caller.callId,
		isError: !0,
		kind: `subagent-result`,
		origin: `child`,
		outcome: {
			kind: e.lifecycle ?? `parked`,
			result: { kind: `cancelled` },
			usageDelta: t
		},
		output: n,
		subagentName: e.caller.subagentName
	};
	let i = e.usage === void 0 ? r : {
		...r,
		usage: e.usage
	};
	e.caller.replyTo.kind === `callback` ? await postSettledTurnCallback({
		result: i,
		sessionId: e.sessionId,
		url: e.caller.replyTo.url
	}) : await resumeSettledTurnHook(e.caller.replyTo.token, i);
}
function createSettledTurnResult(e) {
	let t = e.settled.usage ?? ZERO_TOKEN_USAGE;
	if (e.settled.isError === !0) {
		let n = {
			code: SUBAGENT_EXECUTION_FAILED,
			message: toErrorMessage(e.settled.output)
		};
		return {
			callId: e.caller.callId,
			isError: !0,
			kind: `subagent-result`,
			origin: `child`,
			outcome: {
				kind: e.lifecycle,
				result: {
					error: n,
					kind: `failed`
				},
				usageDelta: t
			},
			output: n,
			subagentName: e.caller.subagentName
		};
	}
	let n = parseJsonValue(e.settled.output);
	let r = {
		callId: e.caller.callId,
		kind: `subagent-result`,
		origin: `child`,
		outcome: {
			kind: e.lifecycle,
			result: {
				kind: `succeeded`,
				output: n
			},
			usageDelta: t
		},
		output: n,
		subagentName: e.caller.subagentName
	};
	return e.settled.usage === void 0 ? r : {
		...r,
		usage: e.settled.usage
	};
}
async function resolveInitialTurnCallerStep(e) {
	let t = e.serializedContext[SessionCallbackKey.name];
	if (t !== void 0) {
		let e = parseSessionCallback(t);
		if (!e.ok) throw Error(`Serialized session callback is invalid.`, { cause: e.cause });
		return {
			callId: e.callback.callId,
			replyTo: {
				kind: `callback`,
				token: e.callback.token,
				url: e.callback.url
			},
			subagentName: e.callback.subagentName
		};
	}
	let n = (await deserializeContext(e.serializedContext)).get(ChannelKey);
	if (n?.kind === "subagent" && isSubagentAdapterState(n.state)) return {
		callId: n.state.callId,
		replyTo: {
			kind: `hook`,
			token: n.state.parentContinuationToken
		},
		subagentName: n.state.subagentName
	};
}
function bindTurnCallerContext(e, t) {
	if (e === void 0) return t;
	if (e.replyTo.kind === `callback`) {
		let n = {
			callId: e.callId,
			subagentName: e.subagentName,
			token: e.replyTo.token,
			url: e.replyTo.url
		};
		return {
			...t,
			[SessionCallbackKey.name]: n
		};
	}
	let n = t[ChannelKey.name];
	if (typeof n != `object` || !n || Reflect.get(n, `kind`) !== "subagent" || !isSubagentAdapterState(Reflect.get(n, `state`))) throw Error(`Delegated local turn is missing its subagent adapter binding.`);
	let r = {
		...Reflect.get(n, `state`),
		callId: e.callId,
		parentContinuationToken: e.replyTo.token,
		subagentName: e.subagentName
	};
	return {
		...t,
		[ChannelKey.name]: {
			...n,
			state: r
		}
	};
}
async function postSettledTurnCallback(e) {
	let { sessionId: t } = e;
	e.result.isError === !0 ? await postCallbackPayload({
		payload: {
			callId: e.result.callId,
			error: e.result.output,
			kind: `turn.failed`,
			outcome: e.result.outcome,
			sessionId: t,
			subagentName: e.result.subagentName
		},
		url: e.url
	}) : await postCallbackPayload({
		payload: {
			callId: e.result.callId,
			kind: `turn.completed`,
			outcome: e.result.outcome,
			output: e.result.output,
			sessionId: t,
			subagentName: e.result.subagentName
		},
		url: e.url
	});
}
const NOT_PENDING_RETRY_DELAYS_MS = [
	250,
	500,
	1e3,
	2e3,
	4e3
];
async function postCallbackPayload(e) {
	for (let t = 0;; t += 1) {
		let n = await postSessionCallbackRequest({
			body: e.payload,
			url: e.url
		});
		if (n.ok) return;
		if (!await isCallbackNotPending(n)) throw Error(`Turn callback failed with HTTP ${n.status}.`);
		let r = NOT_PENDING_RETRY_DELAYS_MS[t];
		if (r === void 0) {
			log$13.warn(`turn caller no longer waits for this result`, { kind: Reflect.get(e.payload, `kind`) });
			return;
		}
		await new Promise((e) => setTimeout(e, r));
	}
}
async function isCallbackNotPending(e) {
	if (e.status !== 404) return !1;
	let t = await e.json().catch(() => void 0);
	return typeof t != `object` || !t ? !1 : Reflect.get(t, `code`) === "CALLBACK_NOT_PENDING" || Reflect.get(t, `error`) === "Session callback not pending.";
}
async function resumeSettledTurnHook(e, t) {
	try {
		await resumeRoutedHook(e, {
			kind: `runtime-action-result`,
			results: [t]
		});
	} catch (e) {
		if (!isHookNotFound(e)) throw e;
		log$13.warn(`turn caller hook no longer exists`, { callId: t.callId });
	}
}
registerStepFunction("step//eve@1.4.0//notifyTurnCallerStep", notifyTurnCallerStep);
registerStepFunction("step//eve@1.4.0//notifyCancelledTaskCallerStep", notifyCancelledTaskCallerStep);
registerStepFunction("step//eve@1.4.0//resolveInitialTurnCallerStep", resolveInitialTurnCallerStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/errors.js
var EveAttachmentError = class extends Error {
	kind;
	adapterKind;
	cause;
	constructor(e) {
		super(e.message), this.name = `EveAttachmentError`, this.kind = e.kind, e.adapterKind !== void 0 && (this.adapterKind = e.adapterKind), e.cause !== void 0 && (this.cause = e.cause);
	}
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/limited-read.js
function maxBytesOf(e) {
	return e === `disabled` ? 0 : e.maxBytes;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/public-link.js
const GENERIC_MEDIA_TYPES = /* @__PURE__ */ new Set([`application/octet-stream`, `binary/octet-stream`]);
function createPublicDownloads(e) {
	let t = 0;
	let n = Promise.resolve();
	return async (r, i) => {
		if (r.protocol === `https:` && ++t > 10) throw refusal(i, `eve downloads at most 10 links per message.`);
		let a = n.then(() => fetchPublicAttachment(r, i, e));
		return n = a.catch(() => void 0), await a;
	};
}
async function fetchPublicAttachment(e, t, n) {
	if (e.protocol !== `https:`) throw refusal(t, `eve downloads only public https:// links.`);
	let r;
	try {
		r = await requestPublicUrl(e.href, {
			headers: {},
			maxResponseSize: n,
			signal: AbortSignal.timeout(3e4)
		});
	} catch (e) {
		throw refusal(t, `The link could not be downloaded.`, e);
	}
	if (!r.ok) throw refusal(t, `The link returned HTTP ${r.status}.`);
	let i = r.headers.get(`content-type`)?.split(`;`, 1)[0]?.trim().toLowerCase();
	if (i === `text/html`) throw refusal(t, `The link returned a web page instead of a file.`);
	let a = Buffer.from(await r.arrayBuffer());
	return i === void 0 || i === `` || GENERIC_MEDIA_TYPES.has(i) ? { bytes: a } : {
		bytes: a,
		mediaType: i
	};
}
function refusal(e, t, n) {
	return new EveAttachmentError({
		adapterKind: e,
		cause: n,
		kind: `resolver-threw`,
		message: t
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/attachment-staging.js
const log$12 = createLogger(`harness.attachment-staging`);
const UNSAFE_FILENAME_CHARS = /[^\w.-]+/g;
const CACHED_REF_BYTES_LIMIT = 67108864;
const cachedRefBytes = /* @__PURE__ */ new Map();
let cachedRefBytesTotal = 0;
const MEDIA_TYPE_EXTENSIONS = {
	"application/pdf": `.pdf`,
	"image/gif": `.gif`,
	"image/jpeg": `.jpg`,
	"image/png": `.png`,
	"image/webp": `.webp`
};
async function stageAttachmentsForAdapter(e, t, n) {
	if (typeof e == `string`) return e;
	let r = reconstitueFilePartUrls(e);
	let i = n.ctx.get(ChannelKey)?.uploadPolicy;
	let a = createPublicDownloads(maxBytesOf(i ?? DEFAULT_UPLOAD_POLICY));
	return Promise.all(r.map(async (e) => e.type === `file` ? stageFilePart(e, t, n, a, i) : e));
}
async function stageAttachmentsToSandbox(e) {
	if (typeof e == `string` || !Array.isArray(e) || !hasFileParts$1(e)) return e;
	let t = loadContext();
	let n = await activeSandbox(t.get(SandboxKey));
	if (n === null) return e.map((e) => e.type === `file` && !isSandboxRefUrl(e.data) && readFileData(e.data).kind !== `reference` ? attachmentNote(e, `could not be stored: no sandbox is available.`) : e);
	let r = t.get(ChannelKey);
	return stageAttachmentsForAdapter(e, n, r ? buildAdapterContext(r, t) : {
		ctx: t,
		state: {},
		session: buildChannelContext(t).session
	});
}
async function stageToolResultMedia(e) {
	if (!e.some(hasInlineToolResultFile)) return [...e];
	let t = await activeSandbox(contextStorage.getStore()?.get(SandboxKey));
	return Promise.all(e.map(async (e) => {
		if (e.role !== `tool` || !hasInlineToolResultFile(e)) return e;
		let n = await Promise.all(e.content.map(async (e) => e.type === `tool-result` ? {
			...e,
			output: await stageToolOutputFiles(e.output, t)
		} : e));
		return {
			...e,
			content: n
		};
	}));
}
async function hydrateSandboxAttachments(e) {
	let t = replaceUnresolvedFileParts(e);
	if (!messagesContainSandboxRef(t)) return t;
	let n = loadContext();
	let r = sandboxRefReader(n.get(SandboxKey), n.get(SessionIdKey));
	return Promise.all(t.map(async (e) => {
		if (!messageContainsSandboxRef(e)) return e;
		let t = await hydrateMessageContent(e.content, r);
		return {
			...e,
			content: t
		};
	}));
}
function sandboxRefReader(e, t) {
	let n;
	return async (r) => {
		let i = cacheKey(t, r);
		let a = i === void 0 ? void 0 : readCachedRefBytes(i);
		if (a !== void 0) return a;
		if (e === void 0) throw Error(`Cannot hydrate attachment ${r.path}: no SandboxKey is bound on the active eve context. Hydration must run inside a step scope with the framework sandbox provider installed.`);
		n ??= activeSandbox(e);
		let o = await readSandboxRefBytes(r, await n);
		return o !== null && i !== void 0 && cacheRefBytes(i, o), o;
	};
}
function cacheKey(e, t) {
	if (e !== void 0) return JSON.stringify([
		e,
		t.path,
		t.size,
		t.mediaType
	]);
}
function readCachedRefBytes(e) {
	let t = cachedRefBytes.get(e);
	return t !== void 0 && (cachedRefBytes.delete(e), cachedRefBytes.set(e, t)), t;
}
function cacheRefBytes(e, t) {
	if (!(t.byteLength > CACHED_REF_BYTES_LIMIT || cachedRefBytes.has(e))) {
		cachedRefBytes.set(e, Buffer.from(t)), cachedRefBytesTotal += t.byteLength;
		for (let [e, t] of cachedRefBytes) {
			if (cachedRefBytesTotal <= CACHED_REF_BYTES_LIMIT) break;
			cachedRefBytes.delete(e), cachedRefBytesTotal -= t.byteLength;
		}
	}
}
async function activeSandbox(e) {
	if (e === void 0) return null;
	try {
		return await e.open();
	} catch (e) {
		return log$12.warn(`session sandbox unavailable, degrading attachments to text`, { error: e }), null;
	}
}
function replaceUnresolvedFileParts(e) {
	let t = !1;
	let n = e.map((e) => {
		if (e.role !== `user` || !Array.isArray(e.content) || !e.content.some(isUnresolvedFilePart)) return e;
		t = !0;
		let n = e.content.map((e) => isUnresolvedFilePart(e) ? attachmentNote(e, `could not be retrieved.`) : e);
		return {
			...e,
			content: n
		};
	});
	return t ? n : e;
}
function isUnresolvedFilePart(e) {
	return e.type === `file` && !isSandboxRefUrl(e.data) && isUnresolvedFileData(e.data);
}
function hasFileParts$1(e) {
	for (let t of e) if (t.type === `file`) return !0;
	return !1;
}
function messagesContainSandboxRef(e) {
	for (let t of e) if (messageContainsSandboxRef(t)) return !0;
	return !1;
}
function messageContainsSandboxRef(e) {
	let t = e.content;
	if (!Array.isArray(t)) return !1;
	for (let e of t) if (isSandboxRefFilePart(e) || e.type === `tool-result` && contentOutputParts(e.output).some(isToolOutputRefFile)) return !0;
	return !1;
}
function contentOutputParts(e) {
	return e.type === `content` ? e.value : [];
}
function hasInlineToolResultFile(e) {
	return e.role === `tool` && e.content.some((e) => e.type === `tool-result` && contentOutputParts(e.output).some(isInlineToolOutputFile));
}
function isInlineToolOutputFile(e) {
	return e.type === `file` && e.data.type === `data`;
}
function isToolOutputRefFile(e) {
	return e.type === `file` && e.data.type === `url` && isSandboxRefUrl(e.data.url);
}
async function stageToolOutputFiles(e, t) {
	if (e.type !== `content` || !e.value.some(isInlineToolOutputFile)) return e;
	let n = await Promise.all(e.value.map(async (e) => {
		if (!isInlineToolOutputFile(e) || e.data.type !== `data`) return e;
		let n = readFileData(e.data.data);
		if (n.kind === `link`) return e;
		if (t === null || n.kind !== `bytes`) return unstoredFileNote(e);
		try {
			let r = await writeSandboxRef(n.bytes, e.mediaType, e.filename, t);
			return {
				...e,
				data: {
					type: `url`,
					url: encodeSandboxRef(r)
				},
				mediaType: r.mediaType
			};
		} catch (t) {
			return log$12.warn(`sandbox write failed for a tool-result file, degrading it to text`, { error: t }), unstoredFileNote(e);
		}
	}));
	return {
		...e,
		value: n
	};
}
function unstoredFileNote(e) {
	return {
		text: `Returned file ${e.filename ?? `file`} (${e.mediaType}) could not be stored.`,
		type: `text`
	};
}
function isSandboxRefFilePart(e) {
	return typeof e == `object` && !!e && e.type === `file` && isSandboxRefUrl(e.data);
}
async function hydrateMessageContent(e, t) {
	return Array.isArray(e) ? (await Promise.all(e.map(async (e) => {
		if (isSandboxRefFilePart(e)) {
			let n = decodeSandboxRef(e.data);
			let r = renderSandboxRefAsTextPart(n);
			if (!inlinesSandboxRefAsBytes(n)) return [r];
			let i = await t(n);
			return i === null ? [renderMissingSandboxRef(n)] : [r, {
				...e,
				data: i,
				mediaType: n.mediaType
			}];
		}
		if (e.type === `tool-result`) {
			let n = e;
			return [{
				...n,
				output: await hydrateToolOutput(n.output, t)
			}];
		}
		return [e];
	}))).flat() : e;
}
async function hydrateToolOutput(e, t) {
	if (e.type !== `content` || !e.value.some(isToolOutputRefFile)) return e;
	let n = await Promise.all(e.value.map(async (e) => {
		if (!isToolOutputRefFile(e) || e.data.type !== `url`) return [e];
		let n = decodeSandboxRef(e.data.url);
		let r = renderSandboxRefAsTextPart(n);
		if (!inlinesSandboxRefAsBytes(n)) return [r];
		let i = await t(n);
		return i === null ? [renderMissingSandboxRef(n)] : [r, {
			...e,
			data: {
				data: Buffer.from(i).toString(`base64`),
				type: `data`
			}
		}];
	}));
	return {
		...e,
		value: n.flat()
	};
}
async function readSandboxRefBytes(e, t) {
	if (t === null) return null;
	let n = await t.readBinaryFile({ path: e.path });
	return n === null ? (log$12.warn(`sandbox-ref attachment bytes missing on hydration — degrading to text reference`, {
		mediaType: e.mediaType,
		path: e.path,
		size: e.size
	}), null) : n.byteLength !== e.size || sha256Prefix(n) !== basename(dirname(e.path)) ? (log$12.warn(`sandbox-ref attachment bytes changed since staging — degrading to text reference`, {
		mediaType: e.mediaType,
		path: e.path,
		size: e.size
	}), null) : n;
}
function renderMissingSandboxRef(e) {
	return {
		text: `FileNotFound: Current snapshot may be newer and does not contain ${e.path}.`,
		type: `text`
	};
}
function moveToolResultFilesToUserMessages(e) {
	let t = [];
	let n = [];
	for (let r of e) {
		if (r.role !== `tool` && n.length > 0 && (t.push(createReturnedFilesMessage(n)), n = []), r.role !== `tool`) {
			t.push(r);
			continue;
		}
		let e = r.content.map((e) => {
			if (e.type !== `tool-result` || e.output.type !== `content`) return e;
			let t = e.output.value.map((e) => {
				if (e.type !== `file`) return e;
				let t = {
					data: e.data,
					mediaType: e.mediaType,
					type: `file`
				};
				return e.filename !== void 0 && (t.filename = e.filename), n.push(t), {
					text: `Attached file ${e.filename ?? `file`} (${e.mediaType}) follows this tool result.`,
					type: `text`
				};
			});
			return {
				...e,
				output: {
					...e.output,
					value: t
				}
			};
		});
		t.push({
			...r,
			content: e
		});
	}
	return n.length > 0 && t.push(createReturnedFilesMessage(n)), t;
}
function createReturnedFilesMessage(e) {
	return createFrameworkUserMessage(`context.state`, [{
		text: `Files returned by the preceding tool results:`,
		type: `text`
	}, ...e]);
}
function renderSandboxRefAsTextPart(e) {
	return {
		text: `Attached file ${e.path} (${e.mediaType})`,
		type: `text`
	};
}
async function stageFilePart(e, t, n, r, i) {
	if (isSandboxRefUrl(e.data)) return e;
	let a = readFileData(e.data);
	if (a.kind === `bytes`) return stageResolvedBytes(e, { bytes: a.bytes }, t, i);
	if (a.kind === `reference`) return e;
	if (a.kind === `unreadable`) return log$12.warn(`attachment data is not bytes, base64, or a URL — degrading to text part`, {
		filename: e.filename,
		mediaType: e.mediaType
	}), attachmentNote(e, `could not be read.`);
	let o;
	try {
		o = await resolveLink(a.url, n, r);
	} catch (t) {
		if (!(t instanceof EveAttachmentError)) throw t;
		return log$12.warn(`attachment resolver failed — degrading to text part`, {
			adapterKind: t.adapterKind,
			error: t.cause,
			filename: e.filename,
			kind: t.kind
		}), attachmentNote(e, `could not be retrieved: ${t.message}`);
	}
	return stageResolvedBytes(e, o, t, i);
}
function attachmentNote(e, t) {
	return {
		text: `Attachment ${e.filename?.trim() || `file`} ${t}`,
		type: `text`
	};
}
async function stageResolvedBytes(e, t, n, r) {
	let i = verifyMediaType(t.bytes, t.mediaType ?? e.mediaType ?? `application/octet-stream`);
	if (r !== void 0) {
		let n = maxBytesOf(r);
		if (t.bytes.byteLength > n) return attachmentNote(e, `was not accepted: it is ${t.bytes.byteLength} bytes, over this channel's ${n}-byte upload limit.`);
		if (!isMediaTypeAllowed(i, r)) return attachmentNote(e, `was not accepted: this channel doesn't accept ${i} files.`);
	}
	let a = await writeSandboxRef(t.bytes, i, t.filename ?? e.filename, n);
	return {
		...e,
		data: encodeSandboxRef(a),
		filename: a.path,
		mediaType: a.mediaType
	};
}
async function writeSandboxRef(e, t, n, r) {
	let i = verifyMediaType(e, t);
	let a = sha256Prefix(e);
	let o = `.eve/attachments/${a}/${safeFilename(n, a, i)}`;
	await r.writeBinaryFile({
		content: e,
		path: o
	});
	let s = {
		...readMediaMetadata(e, i),
		path: r.resolvePath(o)
	};
	let c = cacheKey(contextStorage.getStore()?.get(SessionIdKey), s);
	return c !== void 0 && inlinesSandboxRefAsBytes(s) && cacheRefBytes(c, e), s;
}
async function resolveLink(e, t, n) {
	let r = t.ctx.get(ChannelKey);
	let i = r === void 0 ? `none` : getAdapterKind(r);
	if (r?.fetchFile !== void 0) {
		let n;
		try {
			n = await r.fetchFile(e.href, t);
		} catch (e) {
			throw e instanceof EveAttachmentError ? new EveAttachmentError({
				adapterKind: i,
				cause: e.cause,
				kind: e.kind,
				message: e.message
			}) : new EveAttachmentError({
				adapterKind: i,
				cause: e,
				kind: `resolver-threw`,
				message: `Attachment retrieval failed in the "${i}" channel.`
			});
		}
		if (n !== null) return Buffer.isBuffer(n) ? { bytes: n } : n;
	}
	return n(e, i);
}
function reconstitueFilePartUrls(e) {
	let t = !1;
	let n = e.map((e) => e.type === `file` && isSerializedUrlFilePart(e.data) ? (t = !0, {
		...e,
		data: deserializeUrlFilePart(e.data)
	}) : e);
	return t ? n : e;
}
function sha256Prefix(e) {
	return createHash(`sha256`).update(e).digest(`hex`).slice(0, 16);
}
function safeFilename(e, t, n) {
	let r = e === void 0 ? `` : basename(e).replace(UNSAFE_FILENAME_CHARS, `_`);
	let i = r.length > 0 ? r : `file-${t}`;
	let a = MEDIA_TYPE_EXTENSIONS[n];
	return a === void 0 || extname(i) !== `` ? i : `${i}${a}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/cancelled-turn-message.js
async function preserveCancelledTurnMessage(e, t) {
	let n = normalizeMessage(t?.message);
	if (n === void 0) return e;
	let r = await stageAttachmentsToSandbox(userContentOf(n));
	let i = frameworkMessageKindForStepInput(t);
	return changeHistory(e, { append: [i === void 0 ? createUserMessage(`user`, r) : createFrameworkUserMessage(i, r)] });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/cancelled-model-call-batch.js
const log$11 = createLogger(`execution.cancelled-turn`);
async function cancelledWithoutCheckpoint(e, t, n) {
	let r = appliedSession(e);
	let i = r ?? t;
	let a = n;
	if (r !== void 0) {
		let e = takeDeferredMessage(r);
		i = e.session, e.message !== void 0 && (a = {
			...n,
			message: e.message
		});
	}
	return await preserveStoppedTurnMessage(e, i, a);
}
async function preserveStoppedTurnMessage(e, t, n) {
	if (e.get(SandboxKey) === void 0 && hasFileParts(n?.message)) try {
		return (await withContextScope(e, t, async (e) => ({
			result: void 0,
			session: await preserveCancelledTurnMessage(e, n)
		}))).session;
	} catch (t) {
		log$11.warn(`staging a cancelled turn's attachments failed`, { error: t }), e.clearVirtualContext();
	}
	return await contextStorage.run(e, () => preserveCancelledTurnMessage(t, n));
}
function hasFileParts(e) {
	return Array.isArray(e) && e.some((e) => e.type === `file`);
}
async function createCancelledModelCallBatchResult(e) {
	let t = serializeContext(e.ctx);
	let n = e.checkpoint?.result.session ?? await cancelledWithoutCheckpoint(e.ctx, e.initialSession, e.stepInput);
	let r = {
		...e.checkpoint?.serializedContext ?? e.beforeBatchContext,
		[AuthKey.name]: t[AuthKey.name],
		[TurnDeliveryIdsKey.name]: t[TurnDeliveryIdsKey.name],
		[DefinitionsStateKey.name]: t[DefinitionsStateKey.name],
		[ChannelKey.name]: t[ChannelKey.name],
		...ChannelInstrumentationKey.name in t && { [ChannelInstrumentationKey.name]: t[ChannelInstrumentationKey.name] }
	};
	return SteeredByKey.name in t ? r[SteeredByKey.name] = t[SteeredByKey.name] : delete r[SteeredByKey.name], {
		action: `cancelled`,
		serializedContext: preserveSerializedInstrumentationState(preserveSerializedAgentTraceState(r, t), t),
		...createDurableSessionValues(saveSessionProjection(markSandboxRunning(n, e.sandboxIdleTimeoutMs), e.ctx))
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/pending-turn-state.js
function pausedOnInteraction(e, t) {
	return {
		attemptIds: sessionView(t, e.state).signIns.flatMap((e) => e.attemptId === void 0 ? [] : [e.attemptId]),
		on: `interaction`,
		requestIds: [...ownOpenRequestIds(sessionView(t, e.state))]
	};
}
function pausedOnTasks(e) {
	return {
		on: `tasks`,
		taskIds: e
	};
}
function pausedOnCalls(e) {
	let t = runtimeWait(e.state);
	if (t !== void 0) return {
		callIds: t.callIds,
		dispatch: t.tasks.length > 0,
		on: `calls`,
		taskToolCalls: t.taskToolCalls
	};
}
function waitsOnAnything(e, t) {
	return openSignIns(t.view).length > 0 || ownOpenRequestIds(sessionView(t, e.state)).size > 0 || (runtimeWait(e.state)?.callIds.length ?? 0) > 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/turn-step-result.js
function resolveSessionStepResult(e, t) {
	let n = {
		serializedContext: t,
		...createDurableSessionValues(e.session)
	};
	if (e.steered) return {
		action: `continue`,
		...n
	};
	if (e.next !== null && typeof e.next == `object` && `done` in e.next) return {
		action: `done`,
		output: e.next.output,
		isError: e.next.isError,
		...n,
		usage: sessionUsage(e.session),
		usageDelta: takeSessionUsageDelta(e.session).delta
	};
	if (e.held?.kind === `tasks`) return {
		action: `paused`,
		...pausedOnTasks(e.held.taskIds),
		...n
	};
	if (e.held?.kind === `request`) {
		let t = storedProjection(e.session.state);
		return {
			action: `paused`,
			...pausedOnInteraction(e.session, t),
			...n
		};
	}
	if (e.next !== null) return {
		action: `continue`,
		...n
	};
	let r = e.settledTurn === void 0 ? void 0 : takeSessionUsageDelta(e.session);
	let i = r === void 0 ? n : {
		serializedContext: t,
		...createDurableSessionValues(r.session)
	};
	return pausedOrParked(e.session, i, e.settledTurn === void 0 ? void 0 : {
		output: e.settledTurn.output,
		isError: e.settledTurn.isError,
		usage: r?.delta
	});
}
function pausedOrParked(e, t, n) {
	let r = pausedOnCalls(e);
	return r === void 0 ? {
		action: `parked`,
		...n !== void 0 && { settled: n },
		...t
	} : {
		action: `paused`,
		...r,
		...t
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tool-stub-host.js
function requireToolStubs(e) {
	if (e === void 0) throw Error(`This host can't serve tool stubs; run the stubbed eval on Workflow.`);
	return e;
}
function toolStubPlayback(e, t) {
	let n = requireToolStubs(e);
	return {
		call: (e) => n.call(t, e),
		fail: (e, r) => n.fail(t, e, r)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/tools/channel-to.js
function createToolChannelTo(e) {
	return (t, n) => {
		if (e.delegated) throw Error(`ctx.to() isn't available in a delegated session (a subagent, a root copy, or a remote agent call): a session it started would outlive the delegation and act for the caller. Return the result to the caller, and send from a tool on the root agent.`);
		return { async send(r, i) {
			let a = (await e.loadAgent()).compiled;
			if (a === void 0) throw Error(`ctx.to() reaches the channels of an agent compiled from files; an agent this process holds has none.`);
			let o = createCrossChannelToFn(e.createRuntime({ compiledArtifactsSource: a.compiledArtifactsSource }), toCrossChannelTargets(a.graph.root.channels));
			return await contextStorage.run(new ContextContainer(), () => o(t, n).send(r, i));
		} };
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/authorization-callback-match.js
function matchAuthorizationCallbacks(e, t) {
	let n = [];
	let r = [];
	let i = /* @__PURE__ */ new Set();
	for (let a of t) {
		let t = a.authorizationCallback;
		if (t === void 0) {
			r.push(a);
			continue;
		}
		let o = e.find((e) => e.name === t.connectionName && typeof t.attemptId == `string` && e.attemptId === t.attemptId);
		let s = o?.attemptId;
		o === void 0 || s === void 0 || o.principal === void 0 || i.has(s) || (i.add(s), n.push({
			challenge: o,
			result: {
				attemptId: s,
				callback: t.callback,
				hookUrl: o.hookUrl,
				instanceId: o.instanceId,
				name: o.name,
				principal: o.principal,
				resume: o.resume
			}
		}));
	}
	return {
		matches: n,
		remainingPayloads: r
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/answer-caller.js
function attributeAnswers(e) {
	let { stepInput: t } = e;
	let n = t?.answers ?? [];
	if (t === void 0 || t.message !== void 0 || n.length === 0) return;
	let r = storedProjection(e.state).view;
	let i = openRequests(r);
	let a = new Map(i.flatMap((e) => e.origin === void 0 && interactionOwner(r, e).taskId === void 0 ? [[e.interactionId, e.request.kind]] : []));
	let o = new Set(i.map((e) => e.interactionId));
	let s = e.owner !== void 0 && principalOf$1(e.owner) !== principalOf$1(e.responder);
	let c = n.filter((e) => !s || o.has(e.interactionId));
	if (c.length !== n.length || c.some((e) => a.has(e.interactionId))) return {
		...t,
		answers: c.map((t) => a.get(t.interactionId) === `approval` ? {
			...t,
			responder: e.responder
		} : t)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/interrupted-step.js
const log$10 = createLogger(`execution.interrupted-step`);
function readInterruptedAttempt(e, t) {
	let n = /* @__PURE__ */ new Map();
	let r = /* @__PURE__ */ new Map();
	let i = /* @__PURE__ */ new Set();
	let a;
	let o = !1;
	let s;
	let call = (e) => {
		let t = n.get(e);
		return t === void 0 && n.set(e, t = {
			name: ``,
			started: !1
		}), t;
	};
	for (let { line: e, position: n } of t) if (`facts` in e) for (let t of eventsOfLine(e, n, e.at)) switch (t.type) {
		case `call.requested`:
			Object.assign(call(t.data.callId), {
				input: t.data.input,
				name: t.data.capability.name
			});
			break;
		case `call.started`:
			call(t.data.callId).started = !0;
			break;
		case `call.settled`:
			call(t.data.callId).outcome = t.data.outcome;
			break;
		case `interaction.settled`:
			i.add(t.data.interactionId);
			break;
		case `content.completed`:
			t.data.kind === `text` && typeof t.data.value == `string` && r.set(t.data.partId, t.data.value);
			break;
		case `turn.settled`: {
			let e = (t.data.reply ?? []).flatMap((e) => r.get(e) ?? []);
			s = {
				failed: t.data.outcome === `failed`,
				...e.length > 0 && { text: e.join(`

`) }
			};
			break;
		}
		case `session.ended`:
			a = t.data.outcome;
			break;
		case `context.settled`: t.data.kind === `clear` && t.data.outcome === `completed` && (o = !0);
	}
	return {
		calls: n,
		cleared: o,
		sessionEnded: a,
		settledInteractions: i,
		settledTurn: s,
		since: e
	};
}
async function recoverInterruptedStep(e) {
	let { attempt: t, ctx: n } = e;
	let r = e.session;
	let publish = async (t) => {
		r = await e.publish(t, r);
	};
	let view = () => sessionView(currentProjection(n), r.state);
	let closeAttempt = async (e) => {
		let t = currentProjection(n).view;
		let r = supersede(t, (n) => {
			let r = rowOf(t, n.family, n.id);
			return r !== void 0 && e(n, r);
		}, `step-interrupted`);
		r.length > 0 && await publish(r);
	};
	let introduced = (e) => e.introducedAt >= t.since;
	let finish = (e) => {
		let t = saveSessionProjection(dropClosedRecords(reconcileSessionContinuationToken(n, e.session), currentProjection(n)), n);
		return { result: resolveSessionStepResult({
			...e,
			session: t
		}, serializeContext(n)) };
	};
	if (t.sessionEnded !== void 0) return finish({
		next: {
			done: !0,
			isError: t.sessionEnded === `failed`,
			output: t.settledTurn?.text ?? ``
		},
		session: r
	});
	if (e.control !== void 0) {
		await closeAttempt(({ family: e }, t) => (e === `run` || e === `change`) && introduced(t)), t.cleared && (r = saveTransition(r, clearedByAttempt(view())));
		let { delivery: i, kind: a } = e.control;
		let o = i === void 0 ? void 0 : currentProjection(n).view.deliveries[i.deliveryId]?.status;
		return i !== void 0 && o !== `settled` && await publish(failInterruptedControl(i, a, { recorded: o !== void 0 })), finish({
			next: null,
			session: r
		});
	}
	let { settledTurn: i } = t;
	if (i !== void 0 && activeTurnIdOf(currentProjection(n)) === void 0) return r = changeHistory(r, { append: createImportedHistoryMessages(e.stepInput?.history ?? []) }), r = await preserveStoppedTurnMessage(n, r, e.stepInput), i.text !== void 0 && (r = changeHistory(r, { append: [{
		content: i.text,
		role: `assistant`
	}] })), finish({
		next: null,
		session: r,
		settledTurn: {
			isError: i.failed,
			output: i.text ?? ``
		}
	});
	let a = stopInterruptedSteps(view(), t);
	let o = new Set(view().turn.suspended.filter((e) => !a.turn.suspended.includes(e)).flatMap((e) => e.requests.map((e) => e.interactionId)));
	await closeAttempt(({ family: e, id: n }, r) => {
		switch (e) {
			case `run`:
			case `change`: return introduced(r);
			case `call`: return r.taskId === void 0 && (introduced(r) || t.calls.get(n)?.started === !0);
			case `interaction`: return !view().relayedRequestIds.has(n) && (introduced(r) || o.has(n));
			default: return !1;
		}
	});
	let s = activeTurnIdOf(currentProjection(n));
	let c = s === void 0 ? 0 : turnInterruptions(r.state, s) + 1;
	r = saveTransition(r, a);
	let l = interruptedAttemptNote(t.calls);
	if (l !== void 0 && (r = changeHistory(r, { append: [l] })), e.failed?.stopped === !0 || e.failed === void 0 && c <= 3) {
		let { settledInteractions: n } = t;
		let i = e.stepInput?.answers?.filter((e) => !n.has(e.interactionId));
		return {
			session: s === void 0 ? r : withTurnInterruptions(r, s, c),
			stepInput: e.stepInput === void 0 ? void 0 : {
				...e.stepInput,
				answers: i
			}
		};
	}
	e.admission.length > 0 && await publish(e.admission);
	let u = (e.stepInput?.deliveries ?? []).filter(({ deliveryId: e }) => currentProjection(n).view.deliveries[e]?.status === `admitted`);
	u.length > 0 && await publish(commitTransitions([receive(view(), { deliveries: u })]));
	let d = activeTurnIdOf(currentProjection(n));
	if (d === void 0) return finish({
		next: null,
		session: r
	});
	r = await preserveStoppedTurnMessage(n, r, e.stepInput);
	let f = e.failed === void 0 ? {
		code: `STEP_INTERRUPTED`,
		details: { errorId: createErrorId() },
		message: `This turn was interrupted too many times to continue.`
	} : {
		code: `TURN_FAILED`,
		details: { errorId: createErrorId() },
		message: `This turn failed before it finished. Send another message to continue.`
	};
	return log$10.error(`turn failed`, {
		code: f.code,
		errorName: e.failed?.error.name,
		errorId: f.details.errorId,
		sessionId: r.sessionId,
		turnId: d
	}), r = await applyTransition(r, fail(view(), f), publish), finish({
		next: null,
		session: r,
		settledTurn: {
			isError: !0,
			output: f.message
		}
	});
}
const INTERRUPTIONS_STATE_KEY = `eve.turn-interruptions`;
function turnInterruptions(e, t) {
	let n = e?.[INTERRUPTIONS_STATE_KEY];
	return n?.turnId === t ? n.count : 0;
}
function withTurnInterruptions(e, t, n) {
	return {
		...e,
		state: {
			...e.state,
			[INTERRUPTIONS_STATE_KEY]: {
				count: n,
				turnId: t
			}
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/step-decision-check.js
function stepDisagreement(e, t) {
	if (e.action === `done` || e.action === `cancelled`) return;
	let n = activeTurn(t)?.turnId;
	let r = n === void 0 ? `no-turn` : waiting(t, n)?.on ?? `session`;
	let i = e.action === `paused` ? e.on === `interaction` ? `interaction` : `work` : e.action;
	if (!(i === `interaction` && r === `interaction` || i === `work` && r === `work` || i === `continue` && r === `session` || i === `parked` && (r === `no-turn` || r === `interaction`))) return e.action === `paused` && e.on === `calls` && (e.dispatch || e.taskToolCalls.length > 0) && r === `session` ? `dispatch-deferred` : `${i}-but-${r}`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/turn-event-handler.js
function createTurnEventHandler(e) {
	let { publisher: t } = e;
	let n = e.conversation;
	return async (r, i) => {
		i !== void 0 && (n = i);
		let a = await t.emit(r);
		let o = a.some(({ event: e }) => e.type === `turn.settled` || e.type === `session.ended`);
		let s = e.canCancelTurn && !o ? ({ reason: t }) => e.hookCancellation.abort(new TurnCancelledError(t)) : void 0;
		await t.dispatcher.react(a, {
			abortSignal: e.abortSignal,
			conversation: n,
			cancelTurn: s,
			cancelBeforeTurn: s
		}), throwIfTurnAborted(e.hookCancellation.signal);
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/actions/results.js
function resolveRuntimeActionResultsForCallIds(e) {
	let t = new Set(e.pendingCallIds);
	let n = /* @__PURE__ */ new Map();
	for (let r of e.results) t.has(r.callId) && n.set(r.callId, r);
	let r = [];
	for (let t of e.pendingCallIds) {
		let e = n.get(t);
		if (e === void 0) return;
		r.push(e);
	}
	return r;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/final-output.js
const FINAL_OUTPUT_BESIDE_PENDING_CALLS = `Your reply wasn't delivered because other calls in this response were still running. Use their results, then call eve__reply again.`;
function buildFinalOutputTool(e) {
	let t = toModelSchema(defineJsonSchema(e), `input`);
	return {
		description: `Reply with your final answer in the required structure by calling this tool. Call it when you are done, as your final step; do not answer in prose.`,
		inputSchema: t,
		outputSchema: t
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/response.js
function withCallResults(e) {
	let { calls: t, stepResult: n } = e;
	return {
		approvalRequests: t.approvals,
		policyApprovals: t.policyApprovals,
		content: n.content,
		finishReason: n.finishReason,
		...e.invalidInputToolCallIds === void 0 ? {} : { invalidInputToolCallIds: e.invalidInputToolCallIds },
		providerMetadata: n.providerMetadata,
		response: {
			...n.response,
			messages: appendMissingToolResultMessages({
				append: [...t.parts, ...e.answers],
				responseMessages: e.responseMessages
			})
		},
		signIns: t.signIns,
		text: n.text,
		toolCalls: n.toolCalls,
		toolResults: [...n.toolResults ?? [], ...t.toolResults],
		usage: n.usage
	};
}
function hasUnansweredToolCall(e) {
	let t = /* @__PURE__ */ new Set();
	let n = /* @__PURE__ */ new Set();
	for (let r of e) if (Array.isArray(r.content)) for (let e of r.content) typeof e == `object` && e && (e.type === `tool-call` && t.add(e.toolCallId), e.type === `tool-result` && n.add(e.toolCallId));
	for (let e of t) if (!n.has(e)) return !0;
	return !1;
}
function appendMissingToolResultMessages(e) {
	let t = extractToolResultCallIds(e.responseMessages);
	let n = historyCallNames(e.responseMessages);
	let r = e.append.filter((e) => !t.has(e.toolCallId)).map((e) => ({
		...e,
		toolName: n.get(e.toolCallId) ?? e.toolName
	}));
	if (r.length === 0) return [...e.responseMessages];
	let i = e.responseMessages.at(-1);
	let a = i?.role === `tool` ? i : void 0;
	let o = /* @__PURE__ */ new Map();
	for (let t of e.responseMessages) if (t.role === `assistant` && Array.isArray(t.content)) for (let e of t.content) e.type === `tool-call` && !o.has(e.toolCallId) && o.set(e.toolCallId, o.size);
	let position = (e) => (e.type === `tool-result` ? o.get(e.toolCallId) : void 0) ?? o.size;
	let s = [...a?.content ?? [], ...r].sort((e, t) => position(e) - position(t));
	return [...a === void 0 ? e.responseMessages : e.responseMessages.slice(0, -1), {
		role: `tool`,
		content: s
	}];
}
function extractToolResultCallIds(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (Array.isArray(n.content)) for (let e of n.content) typeof e == `object` && e && e.type === `tool-result` && t.add(e.toolCallId);
	return t;
}
function isLocalOrWorkflowTool(e) {
	return isRunnableTool(e) || isWorkflowTool(e);
}
function answerSkippedToolCalls(e, t, n) {
	let { finishReason: r } = e;
	if (r === `stop` || r === `tool-calls`) return [];
	let i = `The tool did not run because the model response ended early (finish reason: ${r}). Call the tool again if you still need its result.`;
	return (e.toolCalls ?? []).filter((e) => isLocalOrWorkflowTool(t.get(e.toolName)) && e.providerExecuted !== !0 && !isInvalidToolCall(e) && getInvalidToolCallInputError({ toolCall: e }) === void 0 && !n.has(e.toolCallId)).map((e) => ({
		output: {
			type: `error-text`,
			value: i
		},
		toolCallId: e.toolCallId,
		toolName: e.toolName,
		type: `tool-result`
	}));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/turn-client-context.js
const TURN_CLIENT_CONTEXT_STATE_KEY = `eve.harness.turnClientContext`;
function getTurnClientContextState(e, t) {
	let n = e?.[TURN_CLIENT_CONTEXT_STATE_KEY];
	return n?.turnId === t ? n : void 0;
}
function setTurnClientContextState(e, t) {
	return {
		...e,
		state: {
			...e.state,
			[TURN_CLIENT_CONTEXT_STATE_KEY]: t
		}
	};
}
function clearTurnClientContextState(e) {
	if (e.state?.[TURN_CLIENT_CONTEXT_STATE_KEY] === void 0) return e;
	let { [TURN_CLIENT_CONTEXT_STATE_KEY]: t, ...n } = e.state;
	return {
		...e,
		state: n
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/step/after-model.js
const log$9 = createLogger(`harness.tool-loop`);
function getInvalidToolCallInputErrors(e) {
	let t = [];
	for (let n of e.toolCalls) {
		if (n.toolName === "eve__reply") continue;
		let e = getInvalidToolCallInputError({ toolCall: n });
		e !== void 0 && t.push(e);
	}
	return t;
}
async function handleStepResult(e, t) {
	let { promptMessages: n, result: r } = t;
	let i = resolveAssistantStepText(r.response.messages, r.text);
	let a = getInvalidToolCallInputErrors({ toolCalls: r.toolCalls });
	let o = /* @__PURE__ */ new Set([
		...r.invalidInputToolCallIds ?? [],
		...r.toolCalls.filter(isInvalidToolCall).map((e) => e.toolCallId),
		...a.map((e) => e.toolCallId)
	]);
	let s = appendMissingToolResultMessages({
		append: a.map((e) => createToolResultMessagePartFromToolError(e)),
		responseMessages: r.response.messages
	});
	let c = /* @__PURE__ */ new Set();
	for (let e of [...r.content ?? [], ...r.toolResults ?? []]) (e.type === `tool-result` || e.type === `tool-error`) && e.providerExecuted === !0 && c.add(e.toolCallId);
	let l = normalizeProviderToolHistory({
		messages: s,
		providerExecutedOutcomeIds: c
	});
	let u = await stageToolResultMedia(l.messages);
	e.session = {
		...e.session,
		compaction: withPromptMeasurement(e.session.compaction, {
			promptMessages: n,
			inputTokens: r.usage?.inputTokens,
			modelId: stepReference(e).id,
			promptMessageCount: t.durableModelPromptMessageCount,
			requestEnvelopeTokens: t.requestEnvelopeTokens
		})
	};
	let d = r.approvalRequests ?? [];
	let f = /* @__PURE__ */ new Set([...d.map((e) => e.call.callId), ...extractToolResultCallIds(u)]);
	let p = (r.toolCalls ?? []).filter((e) => !o.has(e.toolCallId)).filter((e) => !f.has(e.toolCallId)).filter((e) => isWorkflowTool(t.catalog.get(e.toolName)));
	let m = resolveInlineAuthorizationInterrupt({ signIns: r.signIns ?? [] });
	if (p.length > 0 || d.length > 0 || m) {
		let { sequence: i, stepIndex: a, turnId: o } = e.position();
		let s = collectWorkflowCalls({
			clearances: r.policyApprovals ?? {},
			session: e.session,
			toolCalls: p,
			tools: t.catalog,
			turnId: o
		});
		e.session = changeHistory(s.session, { extend: n });
		let c = {
			...!l.outcomeEndsResponse && await stepEndsTurn(r, u, t.endsTurnTools) && { endsTurn: !0 },
			event: {
				sequence: i,
				stepIndex: a,
				turnId: o
			},
			messages: answerCallsThatWontRun(u, r),
			tasks: s.workflowRequests
		};
		return d.length > 0 ? await askStepApprovals(e, {
			...c,
			requests: d,
			tools: t.catalog
		}) : await e.apply(suspendStep(e.view(), c)), m ? stopForSignIn(e, m) : park(e);
	}
	let h = e.session.outputSchema === void 0 ? void 0 : extractFinalOutput(r);
	let g = h !== void 0;
	let _ = workingTaskIds(e.session);
	let v = g && _.length > 0;
	let y = v ? rejectFinalOutput(u, r, _) : u;
	let b = g && !v ? [{
		content: JSON.stringify(h),
		role: `assistant`
	}] : y;
	e.session = changeHistory(e.session, { extend: [...n, ...b] });
	let x = g && !v;
	let S = await stepEndsTurn(r, u, t.endsTurnTools);
	return !x && (y.at(-1)?.role === `tool` && !S || l.outcomeEndsResponse || hasQueuedTurnInput(e.view())) ? {
		next: e.runStep,
		session: e.session
	} : _.length > 0 ? {
		held: {
			kind: `tasks`,
			taskIds: _
		},
		next: null,
		session: e.session
	} : settleTurn(e, {
		result: r,
		stepOutput: S ? null : i
	});
}
function answerCallsThatWontRun(e, t) {
	let n = extractToolResultCallIds(e);
	return (t.toolCalls ?? []).filter((e) => e.toolName === "eve__reply").map((e) => ({
		output: {
			type: `error-text`,
			value: FINAL_OUTPUT_BESIDE_PENDING_CALLS
		},
		toolCallId: e.toolCallId,
		toolName: e.toolName,
		type: `tool-result`
	})).filter((e) => !n.has(e.toolCallId)).reduce((e, t) => withResult(e, t), [...e]);
}
async function stepEndsTurn(e, t, n) {
	let r = e.toolCalls ?? [];
	if (r.length === 0) return !1;
	let i = /* @__PURE__ */ new Map();
	for (let e of t) if (e.role === `tool`) for (let t of e.content) t.type === `tool-result` && i.set(t.toolCallId, t.output);
	let a = new Map((e.toolResults ?? []).map((e) => [e.toolCallId, e.output]));
	return await callsEndTurn(r.map((e) => {
		let t = i.get(e.toolCallId);
		return {
			failed: t === void 0 || isToolResultError(t),
			output: a.get(e.toolCallId),
			toolCallId: e.toolCallId,
			toolName: e.toolName
		};
	}), n);
}
async function callsEndTurn(e, t) {
	let n = !1;
	for (let r of e) {
		let e = t.get(r.toolName);
		e === void 0 || r.failed || (typeof e != `function` || await callEndsTurn(e, r.output, r)) && (n = !0);
	}
	return n;
}
async function callEndsTurn(e, t, n) {
	try {
		return await e(t) === !0;
	} catch (e) {
		return log$9.warn(`endsTurn threw; continuing the turn`, {
			callId: n.toolCallId,
			error: e,
			toolName: n.toolName
		}), !1;
	}
}
function rejectFinalOutput(e, t, n) {
	let r = (t.toolCalls ?? []).find((e) => e.toolName === "eve__reply");
	if (r === void 0) return [...e];
	let i = {
		output: {
			type: `error-text`,
			value: renderFinalOutputWhileWorkingError(n)
		},
		toolCallId: r.toolCallId,
		toolName: "eve__reply",
		type: `tool-result`
	};
	return [...e, {
		content: [i],
		role: `tool`
	}];
}
const OUTPUT_SCHEMA_NOT_FULFILLED = {
	code: `OUTPUT_SCHEMA_NOT_FULFILLED`,
	message: `The agent could not produce a result matching the requested schema.`
};
function extractFinalOutput(e) {
	return (e.toolCalls ?? []).find((e) => e.toolName === "eve__reply" && !isInvalidToolCall(e))?.input;
}
async function settleTurn(e, t) {
	let { result: n, stepOutput: r } = t;
	let i = await failTurnForEffect(e);
	if (i !== void 0) return i;
	let a = e.session.outputSchema;
	if (e.session = clearTurnClientContextState(e.session), a === void 0) return await e.apply(complete(e.view()), e.session.history), {
		next: null,
		session: e.session,
		settledTurn: { output: r ?? `` }
	};
	let o = n === void 0 ? void 0 : extractFinalOutput(n);
	return o === void 0 ? (e.session = {
		...e.session,
		outputSchema: void 0
	}, await e.apply(fail(e.view(), OUTPUT_SCHEMA_NOT_FULFILLED)), {
		next: null,
		session: e.session,
		settledTurn: {
			isError: !0,
			output: OUTPUT_SCHEMA_NOT_FULFILLED.message
		}
	}) : (e.session = {
		...e.session,
		outputSchema: void 0
	}, await e.apply(complete(e.view()), e.session.history), {
		next: null,
		session: e.session,
		settledTurn: { output: o }
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/prompt-cache.js
const ANTHROPIC_CACHE_MARKERS = Object.freeze({
	"5m": Object.freeze({
		anthropic: Object.freeze({ cacheControl: Object.freeze({ type: `ephemeral` }) }),
		bedrock: Object.freeze({ cachePoint: Object.freeze({ type: `default` }) })
	}),
	"1h": Object.freeze({
		anthropic: Object.freeze({ cacheControl: Object.freeze({
			type: `ephemeral`,
			ttl: `1h`
		}) }),
		bedrock: Object.freeze({ cachePoint: Object.freeze({
			type: `default`,
			ttl: `1h`
		}) })
	})
});
function mergeGatewayAutoCaching(e, t) {
	let n = e?.gateway !== void 0 && typeof e.gateway == `object` && e.gateway !== null ? e.gateway : void 0;
	let r = n?.caching ?? `auto`;
	let i = {
		...n,
		caching: r
	};
	return r === `auto` && t === `anthropic` && (i.cacheAnchorMessageIndex = n?.cacheAnchorMessageIndex ?? 0), {
		...e,
		gateway: i
	};
}
function omitGatewayAutoCaching(e) {
	let t = e.gateway;
	if (typeof t != `object` || !t || Array.isArray(t)) return { ...e };
	let { caching: n, ...r } = t;
	return {
		...e,
		gateway: n === `auto` ? r : t
	};
}
function applyLastToolCacheBreakpoint(e, t) {
	let n = Object.entries(e);
	if (n.length === 0) return e;
	let r = {};
	for (let e = 0; e < n.length; e++) {
		let [i, a] = n[e];
		if (e === n.length - 1) {
			let e = a.providerOptions !== void 0 && typeof a.providerOptions == `object` ? a.providerOptions : void 0;
			r[i] = {
				...a,
				providerOptions: {
					...e,
					...ANTHROPIC_CACHE_MARKERS[t.ttl]
				}
			};
		} else r[i] = a;
	}
	return r;
}
function applySystemCacheBreakpoint(e, t) {
	if (e.length === 0) return [...e];
	let n = [...e];
	let r = n[n.length - 1];
	return n[n.length - 1] = {
		...r,
		providerOptions: {
			...r.providerOptions,
			...ANTHROPIC_CACHE_MARKERS[t.ttl]
		}
	}, n;
}
function applyConversationCacheControl(e, t) {
	if (e.length === 0) return [...e];
	let n = [...e];
	let mark = (e) => {
		let r = n[e];
		r !== void 0 && (n[e] = {
			...r,
			providerOptions: {
				...r.providerOptions,
				...ANTHROPIC_CACHE_MARKERS[t.ttl]
			}
		});
	};
	mark(n.length - 1);
	for (let e = n.length - 2; e >= 0; e--) if (n[e]?.role === `assistant`) {
		mark(e);
		break;
	}
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/tools.js
async function prepareModelTools(e, t) {
	let { catalog: n, profile: r } = t;
	let i = await buildToolSetWithProviderTools({
		describe: n.describe,
		disabledProviderTools: t.disabledProviderTools,
		profile: r,
		tools: n.advertised
	});
	e.session.outputSchema !== void 0 && (i["eve__reply"] = buildFinalOutputTool(e.session.outputSchema));
	let a = r.anthropicCache ? applyLastToolCacheBreakpoint(i, r.anthropicCache) : i;
	for (let e of Object.values(a)) e.inputSchema = toModelSchema(e.inputSchema, `input`), e.outputSchema !== void 0 && (e.outputSchema = toModelSchema(e.outputSchema, `output`));
	return a;
}
function endsTurnTools(e, t) {
	return t ? new Map([...e.entries].flatMap(([e, t]) => t.endsTurn === void 0 || t.endsTurn === !1 ? [] : [[e, t.endsTurn]])) : /* @__PURE__ */ new Map();
}
function frameworkToolNames(e) {
	return new Set([
		...e.advertised.values(),
		...e.entries.values(),
		e.get("eve:load-skill")
	].flatMap((e) => e?.frameworkTool === !0 ? [e.name] : []));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/step/intake.js
async function settleRuntimeWork(e, t) {
	let n = runtimeWait(e.session.state);
	if (n === void 0) {
		if (await recordLateSpend(e, t?.delegatedUsage, /* @__PURE__ */ new Set()), t?.delegatedUsage === void 0) return {
			endsTurn: !1,
			input: t,
			waited: !1
		};
		let { delegatedUsage: n, ...r } = t;
		return {
			endsTurn: !1,
			input: r,
			waited: !1
		};
	}
	let r = resolveRuntimeActionResultsForCallIds({
		pendingCallIds: n.callIds,
		results: t?.runtimeActionResults ?? []
	});
	if (r === void 0) return;
	let i = forgetFinishedRuns(e.session, r, n.event.turnId);
	e.session = i.session, await e.apply(finishRun(e.view(), { requestIds: i.requestIds }));
	let a = await stepCatalog(e);
	let o = await runtimeResultCalls(r, a);
	let s = (await stageToolResultMedia([{
		role: `tool`,
		content: o.map(({ part: e }) => e)
	}])).flatMap((e) => e.role === `tool` ? e.content.filter((e) => e.type === `tool-result`) : []);
	let c = t?.delegatedUsage ?? {};
	await recordLateSpend(e, c, new Set(o.map(({ part: e }) => e.toolCallId)));
	let l = e.view().turn.suspended;
	await e.apply(settle(e.view(), { results: o.map((e, t) => ({
		...e,
		part: s[t],
		usage: c[e.part.toolCallId]
	})) }));
	let u = new Set(o.map(({ part: e }) => e.toolCallId));
	let d = l.length > 0 && parkedCallsAnswered(l, u) && await callsEndTurn(o.map(({ part: e, result: t }) => ({
		failed: t.isError === !0,
		output: t.output,
		toolCallId: e.toolCallId,
		toolName: e.toolName
	})), endsTurnTools(a, e.endsTurn));
	if (t === void 0) return {
		endsTurn: d,
		input: t,
		waited: !0
	};
	let { delegatedUsage: f, runtimeActionResults: p, ...m } = t;
	return {
		endsTurn: d,
		input: m,
		waited: !0
	};
}
async function recordLateSpend(e, t, n) {
	let r = Object.entries(t ?? {}).filter(([e]) => !n.has(e));
	r.length > 0 && await e.publish(recordLateSpend$1(r.map(([, e]) => e)));
}
async function prepareTurnInput(e, t, n) {
	let r = activeTurnId(e.position());
	let i = getTurnClientContextState(e.session.state, r);
	let a = readClientContext(t);
	let o = (a ?? i?.messages)?.map((e) => createFrameworkUserMessage(`context.instruction`, e)) ?? [];
	let s = [...createImportedHistoryMessages(t?.history ?? []), ...(t?.context ?? []).map((e) => anchorToTurn(createFrameworkUserMessage(`context.instruction`, e), r))];
	let c = frameworkMessageKindForStepInput(t);
	let l = normalizeMessage(t?.message);
	let u = l !== void 0 && !n.consumedMessage ? await stageAttachmentsToSandbox(userContentOf(l)) : void 0;
	return u !== void 0 && (isContinuation(e, t) && s.push(anchorToTurn(createFrameworkUserMessage(`context.instruction`, CONTINUATION_NOTE), r)), s.push(anchorToTurn(c === void 0 ? createUserMessage(`user`, u) : createFrameworkUserMessage(c, u), r))), {
		clientContext: a,
		ephemeral: o,
		hasUserMessage: u !== void 0 && c === void 0,
		message: u,
		messages: s,
		storedClientContext: i,
		turnId: r
	};
}
const CONTINUATION_NOTE = `The next message was sent automatically after the last turn, not by a person.`;
function isContinuation(e, t) {
	let n = t?.deliveries ?? [];
	let r = e.view().projection.view.deliveries;
	return n.length > 0 && n.every(({ deliveryId: e }) => {
		let t = r[e]?.source;
		return t !== void 0 && `hook` in t && t.hook !== void 0;
	});
}
function followingToolResults(e) {
	return [...e.hasUserMessage ? [{
		content: "…",
		role: `assistant`
	}] : [], ...e.messages];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/tool-history-repair.js
function repairToolHistory(e) {
	let t = closeProviderCalls(e.messages, e.endsRequest === !0);
	let n = [...t];
	let r = e.insertionIndex;
	let i = new Set(extractToolResultCallIds(n));
	let a = /* @__PURE__ */ new Set();
	for (let e of n) if (e.role === `assistant` && Array.isArray(e.content)) for (let t of e.content) t.type === `tool-approval-request` && i.add(t.toolCallId), t.type === `tool-call` && ((a.has(t.toolCallId) || t.providerExecuted === !0) && i.add(t.toolCallId), a.add(t.toolCallId));
	for (let e of t) if (e.role === `assistant` && Array.isArray(e.content)) for (let t of e.content) {
		if (t.type !== `tool-call` || i.has(t.toolCallId)) continue;
		let a = n.indexOf(e);
		let o = withResult(n, {
			type: `tool-result`,
			toolCallId: t.toolCallId,
			toolName: t.toolName,
			output: {
				type: `error-text`,
				value: `The previous attempt ended without a recorded result; execution outcome is unknown; verify external state before repeating side effects.`
			}
		});
		r !== void 0 && o.length > n.length && a < r && r++, n = o;
	}
	return {
		messages: n,
		insertionIndex: r
	};
}
function closeProviderCalls(e, t) {
	let n = extractToolResultCallIds(e);
	let r = t ? awaitedProviderToolCallIds(e) : /* @__PURE__ */ new Set();
	let i = new Set(e.flatMap((e) => e.role === `assistant` && Array.isArray(e.content) ? e.content.flatMap((e) => e.type === `tool-approval-request` ? [e.toolCallId] : []) : []));
	return e.map((e) => {
		if (e.role !== `assistant` || !Array.isArray(e.content)) return e;
		let t = e.content;
		let a = t.some((e) => e.type === `tool-call` && e.providerExecuted !== !0);
		let dangling = (e) => e.type === `tool-call` && e.providerExecuted === !0 && !n.has(e.toolCallId) && !r.has(e.toolCallId) && !i.has(e.toolCallId) && !n.has(anthropicCaller(e.providerOptions) ?? ``);
		return !a || !t.some(dangling) ? e : {
			...e,
			content: t.map((e) => e.type === `tool-call` && dangling(e) ? {
				...e,
				providerExecuted: !1
			} : e)
		};
	});
}
function anthropicCaller(e) {
	let t = e?.anthropic?.caller;
	return typeof t?.toolId == `string` ? t.toolId : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/step/prompt.js
async function settleHistory(e, t) {
	let n = repairToolHistory({
		endsRequest: t.messages.length === 0,
		messages: e.session.history,
		insertionIndex: t.storedClientContext?.insertionIndex
	});
	let r = changeHistory(e.session, { repaired: n.messages });
	let i = [...r.history];
	if (t.storedClientContext !== void 0 && n.insertionIndex !== void 0) {
		let e = {
			...t.storedClientContext,
			insertionIndex: n.insertionIndex
		};
		t = {
			...t,
			storedClientContext: e
		}, r = setTurnClientContextState(r, e);
	}
	if (!hasUnansweredToolCall(i)) {
		let n = await appendTaskContext({
			messages: i,
			outputContext: toolModelOutputContext,
			session: r,
			tools: await stepCatalog(e)
		});
		r = n.session, i.push(...n.messages.map((e) => e.role === `user` ? anchorToTurn(e, t.turnId) : e));
	}
	return {
		messages: i,
		session: r,
		turn: t
	};
}
function commitTurnInput(e, t) {
	return e.session = t.session, t.clientContext !== void 0 && (e.session = setTurnClientContextState(e.session, t.clientContext)), e.session = changeHistory(e.session, { extend: t.messages }), {
		clientContext: getTurnClientContextState(e.session.state, t.turn.turnId),
		messages: [...e.session.history]
	};
}
async function previewPrompt(e, t) {
	let n = await settleHistory(e, t);
	let r = validateHarnessModelMessages(n.messages);
	return {
		...n,
		clientContext: turnClientContext(r, n.turn),
		messages: withTurnInput(r, n.turn)
	};
}
function turnClientContext(e, t) {
	return t.clientContext === void 0 ? t.storedClientContext : {
		insertionIndex: t.storedClientContext?.insertionIndex ?? e.length,
		messages: t.clientContext,
		turnId: t.turnId
	};
}
function withTurnInput(e, t) {
	return [...e, ...followsToolResults(e) ? followingToolResults(t) : t.messages];
}
function withClientContext(e, t = e.messages) {
	let { clientContext: n } = e;
	if (n === void 0 || n.messages.length === 0) return [...t];
	let r = Math.min(Math.max(0, n.insertionIndex), t.length);
	for (; r < t.length && isAnnouncement(t[r]);) r += 1;
	return [
		...t.slice(0, r),
		...n.messages.map((e) => createFrameworkUserMessage(`context.instruction`, e)),
		...t.slice(r)
	];
}
function isAnnouncement(e) {
	return e.role === `user` && (e.kind === `context.state` || e.kind === `context.instruction`) && turnAnchorOf(e) === void 0;
}
function projectPrompt(e) {
	return validateHarnessModelMessages(normalizeModelMessages(withClientContext(e)));
}
function compactPrompt(e, t, n) {
	let { clientContext: r } = t;
	if (r !== void 0) {
		let i = Math.max(0, t.messages.length - r.insertionIndex);
		t.clientContext = {
			...r,
			insertionIndex: Math.max(0, n.length - i)
		}, e.session = setTurnClientContextState(e.session, t.clientContext);
	}
	t.messages = n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/step/context.js
const log$8 = createLogger(`harness.step`);
function stepReference(e) {
	if (e.model === void 0) throw Error(`The step read its model before eve chose it.`);
	return e.model.reference;
}
function createStep(e) {
	let { ctx: t, live: n } = e;
	let r = t?.get(ParentSessionKey) !== void 0 || t?.get(SessionCallbackKey) !== void 0;
	let i = {
		session: e.session,
		frameworkToolNames: /* @__PURE__ */ new Set(),
		config: e.config,
		ctx: t,
		runStep: e.runStep,
		publish: e.publish,
		emit: e.emit,
		instrumentation: e.instrumentation,
		hasDelegatedCaller: r,
		finalReplyOnly: r || t?.get(ScheduleIdKey) !== void 0,
		endsTurn: !r && e.session.outputSchema === void 0,
		view: () => sessionView(n.read(), i.session.state),
		position: () => turnPosition(n.read()),
		async apply(r, a) {
			let o = `events` in r ? r : unchangedBy(r, i.view().turn);
			i.session = dropClosedRecords(await applyTransition(i.session, o, e.publish, a), n.read()), t !== void 0 && recordAppliedSession(t, i.session);
		}
	};
	return i;
}
async function openTurn(e, t) {
	let { config: n, ctx: r } = e;
	let i;
	try {
		let i = e.position();
		let a = await e.instrumentation?.preparePreamble({
			sequence: i.sequence,
			sessionStarted: i.sessionStarted,
			traceContext: e.instrumentation?.traceContext,
			turnId: activeTurnId(i)
		});
		await e.apply(receive(e.view(), {
			deliveries: t.deliveries,
			predecessor: r?.get(SessionPredecessorKey),
			runtime: n.runtimeIdentity,
			trace: a
		}), [...e.session.history, ...t.input]);
	} catch (e) {
		i = { error: e };
	}
	if (i !== void 0) return failBoundaryEvent(e, i.error);
	e.instrumentation?.setTurnId(e.position().turnId);
}
async function prepareModelCall(e, t) {
	throwIfTurnAborted(e.config.abortSignal);
	let n = validateHarnessModelMessages(withClientContext(t));
	try {
		await evaluateStepValues(e, {
			abortSignal: e.config.abortSignal,
			conversation: n
		});
	} catch (t) {
		if (!(t instanceof DefinitionFailedError)) throw t;
		return failTurn(e, t, `REACTION_FAILED`);
	}
}
async function failTurnForEffect(e) {
	let t = takeTurnFailure(e.ctx);
	if (t !== void 0) return failTurn(e, Error(t), `HOOK_FAILED`);
}
async function failTurn(e, t, n, r = toErrorMessage(t)) {
	throwIfTurnAborted(e.config.abortSignal), e.instrumentation?.recordError(t);
	let i = createErrorId();
	return log$8.error(`turn failed`, {
		code: n,
		error: t,
		errorId: i,
		sessionId: e.session.sessionId,
		turnId: activeTurnId(e.position())
	}), await e.apply(fail(e.view(), {
		code: n,
		details: { errorId: i },
		message: r
	})), {
		next: null,
		session: e.session,
		settledTurn: {
			isError: !0,
			output: r
		}
	};
}
async function failBoundaryEvent(e, t) {
	if (throwIfTurnAborted(e.config.abortSignal), isDynamicModelSelectionError(t)) return failModelSelection(e, t);
	throw t;
}
async function failModelSelection(e, t) {
	if (throwIfTurnAborted(e.config.abortSignal), isTurnCancellation(t) || (e.instrumentation?.recordError(t), e.emit === void 0)) throw t;
	let n = createErrorId();
	let r = toErrorMessage(t);
	let { session: i } = e;
	return log$8.error(`model selection failed terminally`, {
		error: t,
		errorId: n,
		sessionId: i.sessionId,
		turnId: activeTurnId(e.position())
	}), await e.apply(fail(e.view(), {
		code: `MODEL_SELECTION_FAILED`,
		details: { errorId: n },
		message: r,
		terminal: !0
	})), {
		next: e.hasDelegatedCaller ? {
			done: !0,
			isError: !0,
			output: r
		} : {
			done: !0,
			output: ``
		},
		session: e.session
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/generation-steering.js
var GenerationSteeredError = class extends Error {
	constructor() {
		super(`Model generation superseded by steering.`), this.name = `GenerationSteeredError`;
	}
};
var GenerationSteering = class {
	controller = new AbortController();
	active = !1;
	effectsStarted = !1;
	steeringSignal;
	signal;
	outputStarted;
	constructor(e) {
		this.steeringSignal = e.steeringSignal, this.outputStarted = e.outputStarted === !0, this.signal = e.steeringSignal === void 0 && e.abortSignal !== void 0 ? e.abortSignal : e.abortSignal === void 0 ? this.controller.signal : AbortSignal.any([e.abortSignal, this.controller.signal]), this.steeringSignal?.addEventListener(`abort`, this.onSteering);
	}
	get interrupted() {
		return this.controller.signal.aborted;
	}
	begin() {
		this.active = !0, this.onSteering(), this.check();
	}
	end() {
		this.active = !1;
	}
	protectToolExecution() {
		this.check(), this.effectsStarted = !0;
	}
	beforeEvent(e) {
		this.active && (this.check(), (e.type === `interaction.opened` || e.type === `model.settled` && e.data.outcome === `failed` || e.type === `turn.settled`) && (this.effectsStarted = !0), (e.type === `call.input` || e.type === `content.delta` && e.data.kind === `text` && e.data.delta.length > 0 || e.type === `content.completed` && (e.data.kind === `result` || e.data.kind === `text` && typeof e.data.value == `string` && e.data.value.length > 0)) && (this.outputStarted = !0));
	}
	check() {
		if (this.interrupted) throw this.controller.signal.reason;
	}
	dispose() {
		this.steeringSignal?.removeEventListener(`abort`, this.onSteering);
	}
	onSteering = () => {
		this.active && !this.effectsStarted && !this.outputStarted && this.steeringSignal?.aborted && this.controller.abort(new GenerationSteeredError());
	};
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/compaction/config.js
const UNKNOWN_WINDOW_THRESHOLD = 1e5;
const TARGET_SHARE = .5;
function compactionConfig(e, t) {
	let n = agentSettings(e).thresholdPercent ?? .9;
	let r = stepReference(e);
	let i = r.contextWindowTokens;
	let a = i === void 0 ? UNKNOWN_WINDOW_THRESHOLD : Math.max(1, Math.floor(i * n));
	return {
		...withModelPromptMeasurement(e.session.compaction, r.id, t),
		...i !== void 0 && { contextWindowTokens: i },
		recentWindowSize: 10,
		target: Math.min(a, Math.floor((i ?? UNKNOWN_WINDOW_THRESHOLD) * TARGET_SHARE)),
		threshold: a,
		thresholdPercent: n
	};
}
function againstWindow(e, t) {
	return {
		...e,
		target: Math.floor(t * TARGET_SHARE),
		threshold: t
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/model.js
function buildGatewayAttributionHeaders(e, t) {
	if (!e.gateway) return;
	let n = t?.agentName ?? t?.agentId;
	let r = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
	let i = r ? `https://${r}` : void 0;
	let a = Object.fromEntries(appendPackageUserAgent(new Headers()));
	return n && (a[`x-title`] = n), i && (a[`http-referer`] = i), a;
}
function withGatewayTraceContext(e, t, n) {
	if (!t.gateway || n === void 0) return e;
	let r = globalThis.AI_SDK_DEFAULT_PROVIDER ?? gateway;
	if (typeof e == `string` && typeof r.languageModel != `function`) return e;
	let i = typeof e == `string` ? r.languageModel(e) : e;
	return i.provider.split(`.`)[0] === `gateway` ? wrapLanguageModel({
		model: i,
		middleware: { async transformParams({ params: e }) {
			let t = n();
			return t === void 0 ? e : {
				...e,
				headers: {
					...e.headers,
					...t
				}
			};
		} }
	}) : e;
}
async function resolveEffectiveRuntimeModel(e, t) {
	let n = t === void 0 ? await stepModel(e) : await evaluateStepModel(e, t);
	if (n === void 0) throw Error(`The dynamic model returned no model, so there's none to call. Return a model from its render or record.`);
	return {
		choice: n,
		model: n.model ?? await e.config.resolveModel(n.reference)
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/errors.js
const UNSUPPORTED_PROVIDER_TOOL_MATCHERS = [
	(e) => /tool type ['"]([\w.-]+)['"] is not supported/i.exec(e)?.[1],
	(e) => /Input tag ['"]([\w.-]+)['"] found using ['"]type['"] does not match/i.exec(e)?.[1],
	(e) => /Invalid value: ['"]([\w.-]+)['"]/i.exec(e)?.[1],
	(e) => /web search is not supported for this request/i.test(e) ? `web_search` : void 0
];
function extractUpstreamRejectionMessage(e) {
	let t = readModelCallErrorSignals(e);
	if (isTransientHttpStatus(t.statusCode ?? t.upstreamStatusCode)) return null;
	let n = t.apiErrorMessage;
	if (n !== void 0) return {
		name: upstreamRejectionName(t),
		message: n
	};
	if (t.statusCode === 400 && isGatewayErrorSignal(t)) return {
		name: `AI Gateway model request rejected`,
		message: `AI Gateway rejected the model request before the agent produced a response.`
	};
	let r = formatApiCallErrorFallback(t);
	return r === void 0 ? null : {
		name: upstreamRejectionName(t),
		message: r
	};
}
function upstreamRejectionName(e) {
	return isGatewayErrorSignal(e) ? `AI Gateway model request rejected` : `Model provider API error`;
}
function isTransientHttpStatus(e) {
	return e === 408 || e === 429 || e !== void 0 && e >= 500;
}
function extractUnsupportedProviderToolTypes(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of walkCauseChain(e)) {
		collectUnsupportedToolTypesFromValue(readObjectField(n, `data`), t);
		let e = readStringField(n, `responseBody`);
		if (e !== void 0) try {
			collectUnsupportedToolTypesFromValue(JSON.parse(e), t);
		} catch {
			collectUnsupportedToolTypes(e, t);
		}
	}
	return [...t];
}
function collectUnsupportedToolTypes(e, t) {
	for (let n of UNSUPPORTED_PROVIDER_TOOL_MATCHERS) {
		let r = n(e);
		r !== void 0 && t.add(r);
	}
}
function collectUnsupportedToolTypesFromValue(e, t) {
	if (e != null) {
		if (typeof e == `string`) collectUnsupportedToolTypes(e, t);
		else if (Array.isArray(e)) for (let n of e) collectUnsupportedToolTypesFromValue(n, t);
		else if (isObject(e)) for (let n of Object.values(e)) collectUnsupportedToolTypesFromValue(n, t);
	}
}
function extractModelCallErrorDetails(e) {
	let t = readModelCallErrorSignals(e);
	let n = {};
	return e instanceof ContentFilteredModelResponseError && (n.finishReason = `content-filter`, appendJsonField(n, `generationId`, e.generationId)), appendJsonField(n, `apiErrorMessage`, t.apiErrorMessage), appendJsonField(n, `gatewayName`, t.gatewayName), appendJsonField(n, `gatewayType`, t.gatewayType), appendJsonField(n, `statusCode`, t.statusCode), appendJsonField(n, `generationId`, t.generationId), appendJsonField(n, `upstreamStatusCode`, t.upstreamStatusCode), appendJsonField(n, `upstreamType`, t.upstreamType), appendJsonField(n, `upstreamMessage`, t.upstreamMessage), appendJsonField(n, `responseBodySnippet`, t.responseBodySnippet), n;
}
function readErrorName(e) {
	if (e instanceof Error || isObject(e) && typeof e.name == `string`) return e.name;
}
function readErrorMessage(e) {
	return e instanceof Error || isObject(e) && typeof e.message == `string` ? e.message : ``;
}
var EmptyModelResponseError = class extends Error {
	constructor(e) {
		super(`The model did not return a response. Please try again.`, e), this.name = `EmptyModelResponseError`;
	}
};
var ModelStreamStalledError = class extends Error {
	isRetryable = !0;
	constructor(e) {
		super(`The model stopped responding. Please try again.`, e), this.name = `ModelStreamStalledError`;
	}
};
var ContentFilteredModelResponseError = class extends Error {
	generationId;
	constructor(e) {
		super(`The model provider filtered this response.`), this.name = `ContentFilteredModelResponseError`, this.generationId = e;
	}
};
function normalizeModelStreamError(e) {
	let t = toError(e);
	return t === e || Object.defineProperty(t, "cause", {
		configurable: !0,
		value: e
	}), t;
}
function isNoOutputGeneratedError(e) {
	for (let t of walkCauseChain(e)) if (readErrorName(t) === `AI_NoOutputGeneratedError`) return !0;
	return !1;
}
var ModelCredentialFailure = class extends Error {
	code;
	scoped;
	constructor(e, t, n) {
		super(`${e}: ${t.scope}`, { cause: n }), this.name = `ModelCredentialFailure`, this.code = e, this.scoped = t;
	}
};
function credentialFailureCode(e) {
	return isConnectionAuthorizationFailedError(e) ? `MODEL_AUTHORIZATION_FAILED` : `MODEL_CREDENTIAL_FAILED`;
}
function credentialErrorIn(e) {
	for (let t of walkCauseChain(e)) if (t instanceof ModelCredentialFailure || isScopedAuthorizationRequiredError(t)) return t;
}
function rejectsCredential(e) {
	return readModelCallErrorSignals(e).statusCode === 401;
}
function refusesCredential(e) {
	let t = readModelCallErrorSignals(e).statusCode;
	return t !== void 0 && t >= 400 && t < 500 && classifyModelCallError(e) === `terminal`;
}
function classifyModelCallError(e) {
	if (isTurnCancellation(e) || credentialErrorIn(e) !== void 0) return `terminal`;
	if (e instanceof EmptyModelResponseError) return `recoverable`;
	if (hasRetryableFlag(e)) return `retry`;
	let t = summarizeKnownError(e);
	if (t?.tags.includes(`recoverable`) === !0) return `recoverable`;
	if (t?.tags.includes(`config`) === !0) return `terminal`;
	if (t?.tags.includes(`transient`) === !0 || readErrorName(e) === `AI_TypeValidationError`) return `retry`;
	let n = readModelCallErrorSignals(e);
	if (n.statusCode === 402) return `recoverable`;
	if (isRetryableGatewayType(n.upstreamType)) return `retry`;
	if (isTerminalGatewayType(n.upstreamType) || n.gatewayType === `invalid_request_error` || n.gatewayName === `GatewayInvalidRequestError`) return `terminal`;
	let r = n.statusCode;
	if (r !== void 0) {
		if (r === 408 || r === 409 || r === 429 || r >= 500) return `retry`;
		if (isAmbiguousGatewayInternalBadRequest(n)) return `recoverable`;
		if (r >= 400 && r < 500) return `terminal`;
	}
	return `recoverable`;
}
function hasRetryableFlag(e) {
	for (let t of walkCauseChain(e)) if (isObject(t) && t.isRetryable === !0) return !0;
	return !1;
}
function readModelCallErrorSignals(e) {
	let t = findGatewayError(e);
	let n = findUpstreamApiCallError(e);
	let r = readStringField(n, `responseBody`);
	let i = readGatewayErrorBody(n);
	return {
		apiCallError: n !== void 0,
		apiErrorMessage: i?.apiErrorMessage ?? firstInformativeApiMessage([readErrorMessage(n)]),
		gatewayName: readErrorName(t),
		gatewayType: readStringField(t, `type`),
		generationId: readStringField(t, `generationId`) ?? i?.generationId,
		responseBodySnippet: r === void 0 ? void 0 : truncateSnippet(r, 1e3),
		statusCode: readStatusCode(t) ?? readStatusCode(n) ?? findStatusCode(e),
		upstreamMessage: i?.message,
		upstreamStatusCode: readStatusCode(n),
		upstreamType: i?.type
	};
}
function findGatewayError(e) {
	for (let t of walkCauseChain(e)) {
		let e = readErrorName(t);
		let n = readStringField(t, `type`);
		if (e?.startsWith(`Gateway`) || n?.endsWith(`_error`) || n === `rate_limit_exceeded`) return t;
	}
}
function findUpstreamApiCallError(e) {
	for (let t of walkCauseChain(e)) if (readErrorName(t) === `AI_APICallError` || readStringField(t, `responseBody`) !== void 0 || readObjectField(t, `data`) !== void 0 || readObjectField(t, `requestBodyValues`) !== void 0) return t;
}
function readGatewayErrorBody(e) {
	let t = readGatewayErrorBodyFromValue(readObjectField(e, `data`));
	if (t !== void 0) return t;
	let n = readStringField(e, `responseBody`);
	if (n !== void 0) try {
		return readGatewayErrorBodyFromValue(JSON.parse(n));
	} catch {
		return;
	}
}
function readGatewayErrorBodyFromValue(e) {
	if (!isObject(e)) return;
	let t = readObjectField(e, `error`);
	let n = readStringField(e, `generationId`);
	let r = readStringField(t, `message`) ?? readStringField(e, `message`);
	let i = readStringField(t, `type`) ?? readStringField(e, `type`);
	let a = firstInformativeApiMessage([
		r,
		...readNestedApiErrorMessages(t),
		...readNestedApiErrorMessages(e)
	]);
	return r === void 0 && i === void 0 && n === void 0 && a === void 0 ? void 0 : {
		apiErrorMessage: a,
		generationId: n,
		message: r,
		type: i
	};
}
function readStatusCode(e) {
	if (isObject(e)) return typeof e.statusCode == `number` ? e.statusCode : void 0;
}
function findStatusCode(e) {
	for (let t of walkCauseChain(e)) {
		let e = readStatusCode(t);
		if (e !== void 0) return e;
	}
}
function readStringField(e, t) {
	if (!isObject(e)) return;
	let n = e[t];
	return typeof n == `string` && n.length > 0 ? n : void 0;
}
function readObjectField(e, t) {
	if (!isObject(e)) return;
	let n = e[t];
	return isObject(n) ? n : void 0;
}
function readNestedApiErrorMessages(e) {
	if (!isObject(e)) return [];
	let t = [];
	return appendString(t, readStringField(e, `message`)), appendString(t, readStringField(e, `error_description`)), appendNestedApiFieldMessages(t, e.error), appendNestedApiFieldMessages(t, e.code), t;
}
function appendNestedApiFieldMessages(e, t) {
	typeof t == `string` ? appendString(e, t) : isObject(t) && (appendString(e, readStringField(t, `message`)), appendString(e, readStringField(t, `error`)), appendString(e, readStringField(t, `description`)), appendString(e, readStringField(t, `error_description`)), appendNestedApiFieldMessages(e, t.error));
}
function appendString(e, t) {
	t !== void 0 && e.push(t);
}
function firstInformativeApiMessage(e) {
	for (let t of e) if (t !== void 0 && isInformativeApiMessage(t)) return truncateSnippet(t, 800);
}
function isInformativeApiMessage(e) {
	let t = e.trim();
	return t.length > 0 && t !== `[object Object]` && t !== `AI_APICallError` && t !== `Bad Request` && t !== `Internal Server Error`;
}
function formatApiCallErrorFallback(e) {
	if (!e.apiCallError) return;
	let t = e.statusCode ?? e.upstreamStatusCode;
	let n = e.responseBodySnippet;
	let r = e.upstreamType !== void 0 && isInformativeApiMessage(e.upstreamType) ? e.upstreamType : void 0;
	if (t === void 0 && n === void 0 && r === void 0) return;
	let i = [t === void 0 ? void 0 : `HTTP ${t}`, r].filter((e) => e !== void 0).join(`, `);
	let a = i.length === 0 ? `Model provider API request failed` : `Model provider API request failed (${i})`;
	return n === void 0 ? `${a}.` : `${a}: ${n}`;
}
function isRetryableGatewayType(e) {
	return e === `overloaded_error` || e === `rate_limit_exceeded` || e === `timeout_error`;
}
function isTerminalGatewayType(e) {
	return e === `authentication_error` || e === `invalid_request_error` || e === `model_not_found`;
}
function isGatewayErrorSignal(e) {
	return e.gatewayName !== void 0 || e.gatewayType !== void 0;
}
function isAmbiguousGatewayInternalBadRequest(e) {
	return e.statusCode === 400 && (e.gatewayName === `GatewayInternalServerError` || e.gatewayType === `internal_server_error`) && (e.upstreamType === void 0 || e.upstreamType === `internal_server_error`);
}
function appendJsonField(e, t, n) {
	(typeof n == `string` && n.length > 0 || typeof n == `number` && Number.isFinite(n)) && (e[t] = n);
}
function truncateSnippet(e, t) {
	return e.length <= t ? e : `${e.slice(0, t)}...<truncated>`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/credential.js
async function credentialedModel(e) {
	if (!isDefinedModel(e)) return { model: e };
	let t = createAuthorizationExecution();
	let n = scopedAuthorization(e);
	let create = async () => createdModel(e, await credentialFor(t, n), n);
	let r = await create();
	let i = !1;
	return {
		model: wrapLanguageModel({
			middleware: {
				wrapGenerate: ({ params: e }) => r.doGenerate(e),
				wrapStream: ({ params: e }) => r.doStream(e)
			},
			model: r
		}),
		scoped: n,
		async renew(e) {
			await evictScopedToken(n), i && t.requireAuth(n, e), i = !0, r = await create();
		}
	};
}
function scopedAuthorization(e) {
	return {
		authorization: e.auth,
		connection: { url: `` },
		scope: modelSignInName(e)
	};
}
async function credentialFor(e, t) {
	try {
		return await e.getToken(t);
	} catch (e) {
		throw isScopedAuthorizationRequiredError(e) ? e : new ModelCredentialFailure(credentialFailureCode(e), t, e);
	}
}
function createdModel(e, t, n) {
	try {
		let n = e.create(t);
		if (!isRuntimeLanguageModel(n)) throw Error(`create returned no language model.`);
		return wrapLanguageModel({
			middleware: {},
			model: n
		});
	} catch (e) {
		throw new ModelCredentialFailure(`MODEL_CREATE_FAILED`, n, e);
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/restriction.js
function decide(e, t, n) {
	return t.reduce((t, r) => e.meet(t, r(n)), e.open);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/retry.js
const log$7 = createLogger(`harness.tool-loop`);
const ALLOW_RETRY = {
	delayMs: 0,
	retry: !0
};
const STOP_RETRY = { retry: !1 };
const retryLaw = {
	meet: (e, t) => e.retry ? t.retry ? {
		delayMs: Math.max(e.delayMs, t.delayMs),
		retry: !0
	} : t : e,
	open: ALLOW_RETRY
};
const BUILT_IN = [
	({ error: e }) => classifyModelCallError(e) === `retry` ? ALLOW_RETRY : STOP_RETRY,
	({ attempt: e }) => e < 3 ? ALLOW_RETRY : STOP_RETRY,
	({ attempt: e, error: t }) => e >= 2 && summarizeKnownError(t)?.id === `gateway-stream-timeout` ? STOP_RETRY : ALLOW_RETRY,
	({ attempt: e }) => ({
		delayMs: 500 * 2 ** (e - 1) + Math.floor(Math.random() * 250),
		retry: !0
	})
];
async function runModelCallWithRetries(e, t, n) {
	let r = [...BUILT_IN, ...t.policies ?? []];
	for (let i = 1;; i++) {
		n?.throwIfAborted();
		try {
			return await e();
		} catch (e) {
			throwIfSessionStreamDead(e), n?.throwIfAborted();
			let a = decide(retryLaw, r, {
				attempt: i,
				error: e
			});
			if (!a.retry) throw e;
			let { delayMs: o } = a;
			log$7.warn(`model call failed transiently — retrying`, {
				attempt: i,
				delayMs: o,
				sessionId: t.sessionId,
				turnId: t.turnId,
				error: e
			}), await t.onRetry?.(e), await setTimeout$1(o, void 0, { signal: n });
		}
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-profile.js
function resolveModelProfile(e, t) {
	let n = typeof e == `string` ? `gateway` : lowerCaseOrEmpty(e.provider);
	let r = typeof e == `string` ? e : lowerCaseOrEmpty(e.modelId);
	let i = n.split(`.`)[0];
	if (i === `gateway`) {
		let e = r.split(`/`)[0];
		return {
			anthropicCache: e === `anthropic` && t?.anthropic?.ttl === `1h` ? { ttl: `1h` } : void 0,
			filesOutsideToolResults: !1,
			gateway: !0,
			googleSearchDropsTools: PRE_GEMINI_3_MODEL.test(r),
			provider: e
		};
	}
	return {
		anthropicCache: t?.anthropic !== void 0 || n.includes(`anthropic`) || n.includes(`bedrock`) && r.includes(`anthropic`) ? { ttl: t?.anthropic?.ttl ?? `5m` } : void 0,
		filesOutsideToolResults: n.endsWith(`.chat`),
		gateway: !1,
		googleSearchDropsTools: PRE_GEMINI_3_MODEL.test(r),
		provider: i
	};
}
const PRE_GEMINI_3_MODEL = /(^|\/)gemini-(?:[12](?:[.-]|$)|pro(?:-vision)?$|robotics-er-1\.5(?:[.-]|$))/i;
function lowerCaseOrEmpty(e) {
	return typeof e == `string` ? e.toLowerCase() : ``;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/context-changes.js
function startChange(e) {
	return commitOf([contextStarted(e)]);
}
function startSummaryRun(e) {
	return commitOf([runRequested({ changeId: e.changeId }, e.runId), runStarted({
		attempt: 0,
		modelId: e.modelId,
		runId: e.runId
	})]);
}
function completeCompaction(e) {
	let { runId: t } = e;
	return commitOf([...e.summarized ? runSettledFacts({
		finishReason: `stop`,
		outcome: `completed`,
		runId: t,
		usage: e.usage
	}) : e.runOpen ? runSettledFacts({
		outcome: `abandoned`,
		runId: t
	}) : [], {
		data: {
			changeId: e.changeId,
			kind: `compaction`,
			outcome: `completed`
		},
		type: `context.settled`
	}]);
}
function failChange(e, t) {
	if (e.changes[t.changeId]?.status !== `running`) return commitOf([]);
	let n = {
		code: `COMPACTION_FAILED`,
		message: toErrorMessage(t.error)
	};
	let r = openWork(e, { changeId: t.changeId }).runs;
	let { spent: i } = t;
	return commitOf([...r.flatMap(({ runId: e }) => runSettledFacts({
		error: n,
		outcome: `failed`,
		runId: e,
		...i?.runId === e && { usage: i.usage }
	})), {
		data: {
			changeId: t.changeId,
			error: n,
			kind: e.changes[t.changeId]?.kind ?? `compaction`,
			outcome: `failed`
		},
		type: `context.settled`
	}]);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/objects.js
function mergeObjects(e, t) {
	let n = {
		...e,
		...t
	};
	for (let [r, i] of Object.entries(t ?? {})) {
		let t = e[r];
		isPlainRecord(t) && isPlainRecord(i) && (n[r] = mergeObjects(t, i));
	}
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/provider-safety.js
function mergeProviderSafetyIdentifier(e, t, n) {
	if (n === null) return t;
	let r = invocationOwnerKey(n);
	let i = e === `openai` ? { openai: { safetyIdentifier: r } } : e === `anthropic` ? { anthropic: { metadata: { userId: r } } } : void 0;
	return i === void 0 ? t : mergeObjects(i, t);
}
function resolveCallProviderOptions(e) {
	let { session: t } = e;
	let n = mergeProviderSafetyIdentifier(e.profile.provider, e.providerOptions, e.auth);
	return e.profile.gateway ? mergeGatewaySessionId(n, resolveConversationId(t.rootSessionId ?? t.sessionId)) : PROMPT_CACHE_KEY_PROVIDERS.has(e.profile.provider) ? mergeOpenAIPromptCacheKey(n, t.sessionId) : n;
}
const PROMPT_CACHE_KEY_PROVIDERS = /* @__PURE__ */ new Set([`openai`, `codex`]);
function mergeOpenAIPromptCacheKey(e, t) {
	return mergeObjects({ openai: { promptCacheKey: createHash(`sha256`).update(t, `utf8`).digest(`base64url`) } }, e);
}
function mergeGatewaySessionId(e, t) {
	let n = e?.gateway;
	let r = typeof n == `object` && n && !Array.isArray(n) ? n : void 0;
	return typeof r?.sessionId == `string` && r.sessionId.trim() ? e : {
		...e,
		gateway: {
			...r,
			sessionId: t
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/compaction/step.js
const log$6 = createLogger(`harness.tool-loop`);
function assertFixedPartFits(e) {
	let t = e.requestEnvelopeTokens + e.protectedTokens;
	if (t >= e.threshold) throw new CompactionOverLimitError(`The agent's system prompt, tools, memory and context take ~${Math.round(t)} tokens, over this model's ~${e.threshold}-token compaction limit. Shorten the instructions, remove tools or trim memory, or raise \`compaction.threshold\`.`);
}
async function compactHistory(e) {
	let { config: t } = e;
	let n = controlDeliveryFor(e.view(), t.controlDelivery);
	let { deliveryId: r } = n;
	if (e.session.history.length === 0) return await e.apply(admitControl(n, `compact`, { applied: !0 })), {
		next: null,
		session: e.session
	};
	let i = validateHarnessModelMessages(e.session.history);
	await e.apply(admitControl(n, `compact`), i);
	let { projection: a } = e.view();
	let o = lazyChange(e, {
		changeId: nextChangeId(a),
		prompt: i,
		runId: nextRunId(a),
		started: {
			cause: { deliveryId: r },
			kind: `compaction`
		}
	});
	let s = `applied`;
	try {
		let n = await resolveEffectiveRuntimeModel(e, {
			abortSignal: t.abortSignal,
			conversation: i
		});
		e.model = n.choice;
		let r = compactionConfig(e);
		await summarizeHistory(e, {
			compaction: r,
			betweenTurns: !0,
			change: o,
			compact: !0,
			messages: i,
			turnModel: () => credentialedModel(n.model),
			promptMessages: i,
			requestEnvelopeTokens: r.requestEnvelopeTokens
		});
	} catch (t) {
		s = `failed`, logError(log$6, `manual session compaction failed`, t, { sessionId: e.session.sessionId });
	}
	let c = s === `failed` ? `compaction-failed` : void 0;
	return await e.apply(settleDelivery(r, s, c)), {
		next: null,
		session: e.session
	};
}
async function historyBeforeCall(e, t) {
	let n = validateHarnessModelMessages(t.promptMessages);
	let r = compactionConfig(e, {
		messages: n,
		requestEnvelopeTokens: t.requestEnvelopeTokens
	});
	try {
		return await compactUnder(e, t, n, r);
	} catch (i) {
		if (!(i instanceof CompactionOverLimitError)) throw i;
		let a = r.contextWindowTokens;
		let o = {
			sessionId: e.session.sessionId,
			turnId: e.position().turnId
		};
		if (a === void 0) {
			log$6.warn(`${i.message} eve doesn't know this model's context window, so it sends the request as it is. Set \`modelContextWindowTokens\` in \`agent.ts\` to compact against it.`, o);
			return;
		}
		if (a > r.threshold) {
			log$6.warn(`${i.message} eve compacts against the model's ~${a}-token context window instead.`, o);
			try {
				return await compactUnder(e, t, n, againstWindow(r, a));
			} catch (e) {
				if (!(e instanceof CompactionOverLimitError)) throw e;
			}
		}
		throw new CompactionOverLimitError(`The agent's system prompt, tools, memory and context leave no room for the conversation in this model's ~${a}-token context window. Shorten the instructions, remove tools or trim memory.`);
	}
}
async function compactUnder(e, t, n, r) {
	let i = r.requestEnvelopeTokens;
	if (!shouldCompact(n, r, t.requestEnvelopeTokens, i)) return;
	let a = getInputTokenCount(n, r, t.requestEnvelopeTokens, i);
	let { projection: o } = e.view();
	let s = e.position().turnId;
	return await summarizeHistory(e, {
		change: lazyChange(e, {
			changeId: nextChangeId(o),
			prompt: n,
			runId: nextRunId(o),
			started: {
				kind: `compaction`,
				trigger: { inputTokens: a },
				turnId: s
			}
		}),
		compaction: r,
		messages: t.messages,
		turnModel: async () => ({
			model: t.model,
			renew: t.renew
		}),
		promptMessages: n,
		requestEnvelopeTokens: t.requestEnvelopeTokens,
		telemetryTurnId: activeTurnId(e.position())
	});
}
function lazyChange(e, t) {
	let n = !1;
	return {
		changeId: t.changeId,
		runId: t.runId,
		get opened() {
			return n;
		},
		async open() {
			if (n) return;
			n = !0, await e.publish(startChange({
				changeId: t.changeId,
				...t.started
			}), t.prompt);
			let r = takeBlockingFailure(e.ctx);
			if (r !== void 0) throw r;
		}
	};
}
async function summarizeHistory(e, t) {
	let { change: n } = t;
	let r = validateHarnessModelMessages(t.messages);
	let { compaction: i } = t;
	let a = [];
	let o;
	let s = !1;
	let summarize = async (r) => {
		await n.open(), o ??= await summaryExecutor(e, t), s || (s = !0, await e.publish(startSummaryRun({
			changeId: n.changeId,
			modelId: o.modelId,
			runId: n.runId
		})));
		let i = await o.summarize(r);
		if (a.push(i.usage), i.text.trim().length === 0) throw Error(`The compaction model returned an empty summary. Finish reason: ${i.finishReason}.`);
		return i.text;
	};
	let c;
	let l;
	try {
		let e = await compactMessages(r, historyConfig(i, t), summarize, t.compact === !0, t.betweenTurns !== !0);
		c = e.messages, l = e.stage, isDeepStrictEqual(c, r) || await n.open();
	} catch (r) {
		throwIfSessionStreamDead(r);
		let i = summaryUsageOf(a);
		throw countSummaryUsage(e, t.betweenTurns, i), n.opened && await e.publish(failChange(e.view().projection.view, {
			changeId: n.changeId,
			error: r,
			...i !== void 0 && { spent: {
				runId: n.runId,
				usage: i
			} }
		})), r;
	}
	let u = isDeepStrictEqual(c, r);
	if (n.opened && await settleChange(e, {
		...t,
		runOpen: s,
		summaryUsage: a
	}, u ? r : c), u) return;
	let d = changeHistory(e.session, { rewrite: c });
	return e.session = {
		...d,
		compaction: {
			...d.compaction,
			lastStage: l
		}
	}, c;
}
async function settleChange(e, t, n) {
	let { change: r } = t;
	let i = summaryUsageOf(t.summaryUsage);
	countSummaryUsage(e, t.betweenTurns, i), await e.publish(completeCompaction({
		changeId: r.changeId,
		runId: r.runId,
		runOpen: t.runOpen,
		summarized: t.summaryUsage.length > 0,
		usage: i
	}), n);
}
function historyConfig(e, t) {
	let n = t.requestEnvelopeTokens ?? 0;
	let r = Math.max(0, estimateTokens(t.promptMessages) - estimateTokens(t.messages));
	let { threshold: i } = e;
	assertFixedPartFits({
		protectedTokens: r,
		requestEnvelopeTokens: n,
		threshold: i
	});
	let a = n + r;
	return {
		...e,
		target: Math.max(1, Math.floor(e.target - a * estimateRatio(e))),
		threshold: Math.max(1, i - a)
	};
}
async function compactionModel(e, t) {
	return await credentialedModel(await e.config.resolveModel(t));
}
async function summaryExecutor(e, t) {
	let { config: n, session: r } = e;
	let i = stepReference(e);
	let a = agentSettings(e).compactionModel ?? i;
	let { model: o, renew: s } = a === i ? await t.turnModel() : await compactionModel(e, a);
	let c = resolveModelProfile(o);
	let l = {
		abortSignal: n.abortSignal,
		headers: buildGatewayAttributionHeaders(c, n.runtimeIdentity),
		model: withGatewayTraceContext(o, c, e.instrumentation?.gatewayTraceContextHeaders),
		providerOptions: resolveCallProviderOptions({
			auth: e.ctx.get(AuthKey) ?? null,
			profile: c,
			providerOptions: a.providerOptions,
			session: r
		}),
		telemetry: e.instrumentation?.prepareAttempt({
			attempt: 0,
			runId: t.change.runId,
			runtimeContext: { "eve.compaction.request": `summary` },
			...t.telemetryTurnId !== void 0 && { turnId: t.telemetryTurnId }
		}).telemetry
	};
	let u = {
		sessionId: r.sessionId,
		turnId: e.position().turnId
	};
	let summarize = (e) => runModelCallWithRetries(() => streamCompactionSummary({
		...l,
		...e
	}), u, n.abortSignal);
	return {
		modelId: gatewayModelId(o) ?? `unknown`,
		async summarize(e) {
			for (;;) try {
				return await summarize(e);
			} catch (e) {
				if (s === void 0 || !rejectsCredential(e)) throw e;
				await s(e);
			}
		}
	};
}
function countSummaryUsage(e, t, n) {
	n !== void 0 && t === !0 && (e.session = markUsageReported(e.session, n));
}
function summaryUsageOf(e) {
	let t = e.filter((e) => e !== void 0);
	if (t.length !== 0) return t.reduce((e, t) => addTokenUsage(e, usageOf(t)), NO_USAGE);
}
function compactedTurnInput(e) {
	return e.findLast((e) => isUserModelMessage(e) && e.kind === `user`);
}
async function streamCompactionSummary(e) {
	let t = streamText({
		...e,
		onError: () => {}
	});
	for await (let e of t.fullStream) if (e.type === `error`) throw normalizeModelStreamError(e.error);
	let [n, r, i, a] = await Promise.all([
		t.text,
		t.finishReason,
		t.usage,
		t.providerMetadata
	]);
	return {
		finishReason: r,
		text: n,
		usage: extractTokenUsageDelta({
			costUsd: extractGatewayCostUsd$1(a),
			usage: i
		})
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/credential-failure.js
async function pauseForModelSignIn(e, t, n) {
	if (!supportsInteractiveAuthorization(t.scoped.authorization)) return await failModelCredential(e, `MODEL_AUTHORIZATION_FAILED`, t.cause, t.scoped);
	let r;
	try {
		r = await handleAuthorizationError(t, { evictToken: !1 });
	} catch (n) {
		return await failModelCredential(e, credentialFailureCode(n), n, t.scoped);
	}
	return await n?.(), await stopForSignIn(e, r);
}
async function failModelCredential(e, t, n, r) {
	return await failTurn(e, n, t, credentialFailureMessage(t, providerName(e.view(), r), n));
}
function credentialFailureMessage(e, t, n) {
	switch (e) {
		case `MODEL_AUTHORIZATION_FAILED`: return signInFailureMessage(t, n);
		case `MODEL_CREATE_FAILED`: return `eve couldn't build the model from the ${t} credential.`;
		case `MODEL_CREDENTIAL_FAILED`: return `eve couldn't get the ${t} credential.`;
	}
}
function signInFailureMessage(e, t) {
	if (!isConnectionAuthorizationFailedError(t)) return refusesCredential(t) ? `${e} rejected the credential.` : `The turn got no ${e} credential.`;
	switch (t.reason) {
		case "access_denied":
		case `sign_in_cancelled`: return `The ${e} sign-in ended without a credential.`;
		case `sign_in_unavailable`: return `A scheduled turn can't ask for the ${e} sign-in.`;
		case `principal_required`: return `The ${e} credential needs a signed-in user.`;
		case `token_rejected_after_authorization`: return `${e} rejected the credential from the sign-in.`;
		case `app_not_installed`:
		case `authorization_callback_unavailable`: return `The turn got no ${e} credential.`;
		default: return `${e}: ${t.message}`;
	}
}
function providerName(e, t) {
	let n = Object.values(e.projection.view.interactions).flatMap((e) => e.request.signIn ?? []).findLast((e) => e.name === t.scope);
	return t.authorization.displayName ?? n?.displayName ?? displayProperName(t.scope);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/workflow-stream-error.js
const WORKFLOW_STREAM_WRITE_ERROR_PATTERN = /^Stream (write|close) failed: HTTP (\d+)(?: \(([^)]*)\))?/;
function extractWorkflowStreamWriteErrorDetails(e) {
	for (let t of causeChainMessages(e)) {
		let e = parseStreamErrorMessage(t);
		if (e !== null) return e;
	}
	return null;
}
function parseStreamErrorMessage(e) {
	let t = WORKFLOW_STREAM_WRITE_ERROR_PATTERN.exec(e);
	if (t === null) return null;
	let n = Number(t[2]);
	let r = { operation: t[1] ?? `` };
	Number.isFinite(n) && (r.statusCode = n);
	for (let e of (t[3] ?? ``).split(`; `)) e.startsWith(`PUT `) ? r.url = e.slice(4) : e.startsWith(`x-vercel-id=`) ? r.vercelId = e.slice(12) : e.startsWith(`x-vercel-error=`) && (r.vercelError = e.slice(15));
	return r;
}
function* causeChainMessages(e) {
	let t = /* @__PURE__ */ new Set();
	let n = e;
	for (; n != null && !t.has(n);) if (t.add(n), n instanceof Error) yield n.message, n = n.cause;
	else if (isObject(n) && typeof n.message == `string`) yield n.message, n = n.cause;
	else return;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/failure.js
const log$5 = createLogger(`harness.tool-loop`);
function modelCallErrorInfo(e) {
	return {
		code: `MODEL_CALL_FAILED`,
		message: summarizeKnownError(e)?.message ?? extractUpstreamRejectionMessage(e)?.message ?? toErrorMessage(e)
	};
}
async function reportModelCallFailure(e, t, n) {
	if (e.instrumentation?.recordError(t), e.emit === void 0) throw t;
	let { sessionId: r } = e.session;
	let { turnId: i } = e.position();
	let a = createErrorId();
	let o = {
		errorId: a,
		sessionId: r,
		turnId: i
	};
	let s = extractWorkflowStreamWriteErrorDetails(t);
	if (s !== null) return log$5.error(`workflow stream write failed — parking session for retry by the user`, {
		...s,
		...o,
		error: t
	}), await e.apply(fail(e.view(), {
		code: `WORKFLOW_STREAM_WRITE_FAILED`,
		details: {
			...s,
			errorId: a
		},
		message: toErrorMessage(t),
		usage: n
	})), {
		next: null,
		session: e.session
	};
	let c = summarizeKnownError(t);
	let l = c === null ? extractUpstreamRejectionMessage(t) : null;
	let u = c?.message ?? l?.message ?? toErrorMessage(t);
	let d = c?.hint === void 0 ? u : `${u} ${c.hint}`;
	let f = extractModelCallErrorDetails(t);
	let p = c === null ? l === null ? {
		...formatError(t, a),
		...f
	} : {
		errorId: a,
		message: toErrorMessage(t),
		name: l.name,
		...f
	} : {
		errorId: a,
		message: c.message,
		name: c.name,
		semanticErrorId: c.id,
		...f,
		...c.hint !== void 0 && { hint: c.hint }
	};
	let m = classifyModelCallError(t) === `terminal`;
	if (m && c !== null ? log$5.error(`${c.name}: ${c.message}`, {
		...o,
		hint: c.hint
	}) : log$5.error(l?.message ?? (m ? `model call failed terminally` : `model call failed — parking session for retry by the user`), c !== null || l !== null ? {
		...o,
		details: f
	} : {
		...o,
		error: t
	}), await e.apply(fail(e.view(), {
		code: `MODEL_CALL_FAILED`,
		details: p,
		message: u,
		...m && { terminal: !0 },
		usage: n
	})), m) return {
		next: e.hasDelegatedCaller ? {
			done: !0,
			isError: !0,
			output: d
		} : {
			done: !0,
			output: ``
		},
		session: e.session
	};
	if (c?.tags.includes(`refused`) === !0 && i !== void 0) {
		let t = withoutTurnInput(e.session.history, i);
		t !== void 0 && (e.session = changeHistory(e.session, { rewrite: t }));
	}
	return e.session = {
		...e.session,
		outputSchema: void 0
	}, {
		next: null,
		session: e.session,
		settledTurn: {
			isError: !0,
			output: d
		}
	};
}
const REFUSED_TURN_NOTE = createFrameworkUserMessage(`context.instruction`, `The model provider refused a response in this turn, so the turn ended with an error and the request that started it was removed from this conversation. Any tool calls that follow ran before the refusal.`);
function withoutTurnInput(e, t) {
	let n = !1;
	let r = e.flatMap((r, i) => turnAnchorOf(r) === t ? n ? [] : (n = !0, e[i - 1]?.content === REFUSED_TURN_NOTE.content ? [] : [REFUSED_TURN_NOTE]) : [r]);
	return n ? r : void 0;
}
async function reportCompactionFailure(e, t) {
	let { sessionId: n } = e.session;
	return log$5.error(t.message, {
		sessionId: n,
		turnId: e.position().turnId
	}), await e.apply(fail(e.view(), {
		code: `COMPACTION_FAILED`,
		message: t.message
	})), e.session = {
		...e.session,
		outputSchema: void 0
	}, {
		next: null,
		session: e.session,
		settledTurn: {
			isError: !0,
			output: t.message
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/recovery.js
const log$4 = createLogger(`harness.tool-loop`);
function recoverModelCall(e, t, n) {
	if (t.retryReason === void 0) {
		if (t.disabledProviderTools === void 0) {
			let t = extractUnsupportedProviderToolTypes(e);
			let r = [...new Set(t.flatMap((e) => resolveFrameworkToolFromUpstreamType(e) ?? []))];
			if (r.length > 0) return log$4.warn(`disabling unsupported provider tool(s); retrying step once`, {
				...n,
				disabled: r,
				upstreamTypes: t
			}), {
				disabledProviderTools: new Set(r),
				extraSystemNote: buildDisabledToolNote(r)
			};
		}
		if (e instanceof EmptyModelResponseError) return log$4.warn(`empty model response; reissuing the model call once`, n), {
			...t,
			retryReason: `empty-response`,
			trailingUserNote: EMPTY_RESPONSE_NUDGE
		};
	}
}
function buildDisabledToolNote(e) {
	let t = e.join(`, `);
	return `The following ${e.length === 1 ? `tool is` : `tools are`} not available with the current model and has been removed: ${t}. Proceed using the remaining tools or your training knowledge.`;
}
function isEmptyModelResponse(e) {
	return e.toolCalls.length === 0 && e.toolResults.length === 0 && resolveAssistantStepText(e.response.messages, e.text) === null;
}
function rethrowNoOutputAsEmptyResponse(e) {
	throw isNoOutputGeneratedError(e) ? new EmptyModelResponseError({ cause: e }) : e;
}
const EMPTY_RESPONSE_NUDGE = `Your previous reply was empty and was not delivered. Continue the current user request. Reuse completed results when they satisfy the request. If existing results are stale or insufficient, use the appropriate read tools to get fresh results. Do not repeat writes or other side effects that already completed. Do not mention this notice.`;
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/request.js
function modelInstructions(e) {
	let { anthropicCache: t, gateway: n, provider: r } = e.profile;
	let [i = ``, ...a] = typeof e.instructions == `string` ? [e.instructions] : e.instructions;
	let o = e.extraSystemNote ?? ``;
	let s = n && r === `anthropic`;
	if (t === void 0 && typeof e.instructions == `string` && o === ``) return e.instructions;
	if (t === void 0 && !s) return systemMessage([
		o,
		i,
		...a
	]);
	let c = systemMessage([i]);
	let l = systemMessage([o, ...a]);
	let u = [...c === void 0 ? [] : t ? applySystemCacheBreakpoint([c], t) : [c], ...l === void 0 ? [] : [l]];
	return u.length > 1 ? u : u[0];
}
function systemMessage(e) {
	let t = e.filter((e) => e !== ``).join(`

`);
	return t === `` ? void 0 : {
		role: `system`,
		content: t
	};
}
function withTrailingUserNote(e, t) {
	return t ? [...e, createFrameworkUserMessage(`execution.retry`, t)] : [...e];
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/unique-call-ids.js
function withUniqueCallIds(e, t) {
	return wrapLanguageModel({
		model: resolved(e),
		middleware: uniqueCallIds(new Set(t))
	});
}
function resolved(e) {
	return typeof e == `string` ? (Reflect.get(globalThis, `AI_SDK_DEFAULT_PROVIDER`) ?? gateway).languageModel(e) : e;
}
function uniqueCallIds(e) {
	return {
		specificationVersion: `v4`,
		wrapStream: async ({ doStream: t }) => {
			let { stream: n, ...r } = await t();
			return {
				...r,
				stream: n.pipeThrough(renameRepeatedCalls(e))
			};
		}
	};
}
function renameRepeatedCalls(e) {
	let t = /* @__PURE__ */ new Map();
	let n = /* @__PURE__ */ new Set();
	let introduce = (n) => {
		let r = n;
		for (let t = 2; e.has(r); t++) r = `${n}_${t}`;
		return e.add(r), r === n ? t.delete(n) : t.set(n, r), r;
	};
	let current = (e) => t.get(e) ?? e;
	return new TransformStream({ transform(e, t) {
		switch (e.type) {
			case `tool-input-start`:
				n.add(e.id), t.enqueue({
					...e,
					id: introduce(e.id)
				});
				return;
			case `tool-input-delta`:
			case `tool-input-end`:
				t.enqueue({
					...e,
					id: current(e.id)
				});
				return;
			case `tool-call`: {
				let r = n.delete(e.toolCallId) ? current(e.toolCallId) : introduce(e.toolCallId);
				t.enqueue({
					...e,
					toolCallId: r
				});
				return;
			}
			case `tool-result`:
			case `tool-approval-request`:
				t.enqueue({
					...e,
					toolCallId: current(e.toolCallId)
				});
				return;
			default: t.enqueue(e);
		}
	} });
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/interruptible-stream.js
async function* interruptStreamOnFailure(e, t) {
	let n = e[Symbol.asyncIterator]();
	let r = !1;
	try {
		for (;;) {
			let e = await nextOrFailure(n, t);
			if (e.done) {
				r = !0;
				return;
			}
			yield e.value;
		}
	} finally {
		if (!r && n.return !== void 0) try {
			let e = n.return();
			Promise.resolve(e).catch(() => {});
		} catch {}
	}
}
function nextOrFailure(e, t) {
	return t.aborted ? Promise.reject(t.reason) : new Promise((n, r) => {
		let onFailure = () => {
			r(t.reason);
		};
		t.addEventListener(`abort`, onFailure, { once: !0 });
		let i;
		try {
			i = e.next();
		} catch (e) {
			t.removeEventListener(`abort`, onFailure), r(e);
			return;
		}
		i.then((e) => {
			t.removeEventListener(`abort`, onFailure), n(e);
		}, (e) => {
			t.removeEventListener(`abort`, onFailure), r(e);
		});
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/session-machine/content.js
function completeParts(e) {
	return commitOf(e.map((e) => fact(`content.completed`, e)));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/stream-actions.js
function createProviderStreamActionBatch(e) {
	let t = /* @__PURE__ */ new Map();
	let n = Promise.resolve();
	let r;
	let i;
	let a = !1;
	let o;
	let emitPendingActions = async () => {
		if (a) {
			t.clear();
			return;
		}
		if (t.size === 0) return;
		let n = [...t.values()];
		t.clear();
		let r = e.state.runId ?? `${e.state.turnId}.run`;
		await e.emitFn(requestProviderCalls(n.map(({ action: e, presentationLabel: t, hidden: n }) => ({
			action: e,
			owner: { runId: r },
			label: t,
			hidden: n
		}))));
	};
	let scheduleFlush = () => {
		if (a || i !== void 0) return;
		let e;
		let t = new Promise((t) => {
			e = t;
		});
		o = e, i = setTimeout(() => {
			i = void 0, o = void 0, e?.();
		}, 0), n = n.then(() => t).then(emitPendingActions).catch((e) => {
			r ??= e;
		});
	};
	let releaseFlushTimer = () => {
		if (i === void 0) return;
		clearTimeout(i), i = void 0;
		let e = o;
		o = void 0, e?.();
	};
	return {
		async cancel() {
			a = !0, t.clear(), releaseFlushTimer(), await n;
		},
		observe(e) {
			a || (t.set(e.action.callId, e), scheduleFlush());
		},
		async flush() {
			if (!a) {
				if (releaseFlushTimer(), await n, r !== void 0) throw r;
				await emitPendingActions();
			}
		}
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/ordered-stream-emitter.js
const MAX_PENDING_DELTA_CHARACTERS = 65536;
function createOrderedStreamEmitter(e, t = {}) {
	let n = t.maxPendingEvents ?? 64;
	if (!Number.isInteger(n) || n < 1) throw RangeError(`maxPendingEvents must be a positive integer.`);
	let r = [];
	let i = /* @__PURE__ */ new Set();
	let a = /* @__PURE__ */ new Set();
	let o = !1;
	let s = 0;
	let c = 0;
	let l;
	let u = !1;
	let d = !1;
	let f = new AbortController();
	let throwIfFailed = () => {
		if (u) throw l;
	};
	let settleIdleWaiters = () => {
		for (let e of a) e();
		a.clear();
	};
	let hasCapacity = () => c < n && s < MAX_PENDING_DELTA_CHARACTERS;
	let settleCapacityWaiters = () => {
		if (hasCapacity()) {
			for (let e of i) e();
			i.clear();
		}
	};
	let pump = async () => {
		if (!(d || u)) {
			for (d = !0; r.length > 0;) {
				let t = r.shift();
				if (t === void 0) break;
				s -= t.deltaCharacters, c -= t.sourceEvents, settleCapacityWaiters();
				try {
					await e(t.publication ?? materializeEvent(t), t.messages);
				} catch (e) {
					u || (l = e, u = !0, f.abort(e)), r.length = 0, s = 0, c = 0, settleCapacityWaiters();
					break;
				}
			}
			d = !1, settleIdleWaiters();
		}
	};
	let waitForIdle = async () => {
		!d && r.length === 0 || await new Promise((e) => {
			a.add(e);
		}), throwIfFailed();
	};
	let waitForCapacity = async () => {
		hasCapacity() || (await new Promise((e) => {
			i.add(e);
		}), throwIfFailed());
	};
	return {
		async closeAndDrain() {
			o = !0, pump(), await waitForIdle();
		},
		async emit(e, t) {
			if (throwIfFailed(), o) throw TypeError(`Cannot emit after the ordered stream emitter has closed.`);
			let i = eventsOf(e);
			let a = i[0];
			if (a === void 0) return;
			if (i.length > 1) {
				r.push({
					publication: e,
					deltaCharacters: 0,
					event: a,
					messages: t,
					sourceEvents: i.length
				}), c += i.length, pump(), c >= n && await waitForCapacity(), throwIfFailed();
				return;
			}
			let l = r.length - 1;
			let u = r[l];
			let d = appendDelta(a);
			u === void 0 || u.publication !== void 0 || !mergeAdjacentEmissions(u, a, t) ? r.push({
				deltaCharacters: d?.length ?? 0,
				event: a,
				messages: t,
				...!isProgressType(a.type) && { publication: e },
				sourceEvents: 1
			}) : (u.deltaCharacters += d?.length ?? 0, u.sourceEvents += 1), s += d?.length ?? 0, c += 1, pump(), (c >= n || s >= MAX_PENDING_DELTA_CHARACTERS) && await waitForCapacity(), throwIfFailed();
		},
		failureSignal: f.signal
	};
}
function mergeAdjacentEmissions(e, t, n) {
	let r = appendKey(e.event);
	let i = appendKey(t);
	return r !== void 0 || i !== void 0 ? r === void 0 || r !== i || !isAppendEvent(e.event) || !isAppendEvent(t) ? !1 : (e.deltaParts ??= [appendDelta(e.event)], e.deltaParts.push(appendDelta(t)), e.messages = n, !0) : e.event.type === `call.progress` && t.type === `call.progress` && e.event.data.callId === t.data.callId && (e.event = t, e.messages = n, !0);
}
function appendKey(e) {
	switch (e.type) {
		case `content.delta`: return `${e.type}:${e.data.partId}`;
		case `call.input`: return `${e.type}:${e.data.callId}`;
		default: return;
	}
}
function isAppendEvent(e) {
	return appendKey(e) !== void 0;
}
function appendDelta(e) {
	switch (e.type) {
		case `content.delta`:
		case `call.input`: return e.data.delta;
		default: return;
	}
}
function materializeEvent(e) {
	if (e.deltaParts === void 0) return e.event;
	let { event: t } = e;
	return t.type === `content.delta` || t.type === `call.input` ? {
		...t,
		data: {
			...t.data,
			delta: e.deltaParts.join(``)
		}
	} : t;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/finish-reason.js
function normalizeAssistantStepFinishReason(e) {
	switch (e) {
		case `content-filter`:
		case `error`:
		case `length`:
		case `stop`:
		case `tool-calls`: return e;
		default: return `other`;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/emission.js
async function emitStreamContent(e, t, n, r) {
	let i = createOrderedStreamEmitter(e);
	let a = createProviderStreamActionBatch({
		emitFn: i.emit,
		state: t
	});
	try {
		return await consumeStreamContent(i.emit, t, interruptStreamOnFailure(n, i.failureSignal), a, r);
	} finally {
		try {
			await a.cancel();
		} finally {
			await i.closeAndDrain();
		}
	}
}
function finalPhase(e, t) {
	return e === `tool-calls` || t && e === `stop` ? `narration` : `reply`;
}
function textPhaseBefore(e, t) {
	return e === "eve__task_wait" && !t ? `reply` : `narration`;
}
async function consumeStreamContent(e, t, n, r, i) {
	let a = t.runId ?? `${t.turnId}.run`;
	let o = {
		runId: a,
		turnId: t.turnId
	};
	let s = 0;
	let nextPartId = () => `${a}.${String(s++)}`;
	let c = ``;
	let l;
	let u = ``;
	let d;
	let f = `stop`;
	let p;
	let m = /* @__PURE__ */ new Set();
	let h = /* @__PURE__ */ new Set();
	let g = /* @__PURE__ */ new Set();
	let _ = /* @__PURE__ */ new Set();
	let v = [];
	let y = /* @__PURE__ */ new Map();
	let b = /* @__PURE__ */ new Map();
	let completePart = async (t, n, r, i) => {
		await e(completeParts([{
			kind: n,
			partId: t,
			phase: i,
			runId: a,
			value: r
		}]));
	};
	let flushCurrentMessage = async (e = `narration`) => {
		u.length !== 0 && d !== void 0 && (await completePart(d, `text`, u, e), u = ``, d = void 0);
	};
	let flushCurrentReasoning = async () => {
		c.trim().length > 0 && l !== void 0 && await completePart(l, `reasoning`, c, `narration`), c = ``, l = void 0;
	};
	let emitActionInput = async (t, n) => {
		let r = b.get(t);
		if (r === void 0) return;
		let a = r.announced ? {
			data: {
				callId: t,
				delta: n
			},
			type: `call.input`
		} : {
			data: {
				callId: t,
				delta: n,
				kind: announcedKind(r.toolName, i?.tools.get(r.toolName)),
				name: r.toolName
			},
			scope: o,
			type: `call.input`
		};
		r.announced = !0, await e(a);
	};
	let emitActionRequest = async (t) => {
		let { action: n } = t;
		m.has(n.callId) || (u.trim().length > 0 && await flushCurrentMessage(n.kind === `tool-call` ? textPhaseBefore(n.toolName, i?.finalReplyOnly === !0) : `narration`), m.add(n.callId), y.set(n.callId, n.input), await e(requestCall({
			action: n,
			owner: { runId: a },
			label: t.presentationLabel,
			hidden: t.hidden
		})));
	};
	let collectProviderToolCall = async (e) => {
		if (g.has(e.toolCallId) || (g.add(e.toolCallId), m.has(e.toolCallId))) return;
		m.add(e.toolCallId), u.trim().length > 0 && await flushCurrentMessage();
		let t = resolveProviderToolCallRequest(e, i?.tools ?? /* @__PURE__ */ new Map());
		t.toolError === void 0 ? (y.set(t.request.action.callId, t.request.action.input), r.observe(t.request)) : (_.add(e.toolCallId), await emitInvalidCall({
			callId: e.toolCallId,
			input: {},
			kind: `tool-call`,
			toolName: e.toolName
		}, createRuntimeToolResultFromToolError(t.toolError)), v.push(createToolResultMessagePartFromToolError(t.toolError)));
	};
	let settleProviderCall = async (e, t) => {
		let n = i?.sessionCall(e.toolCallId);
		n?.status !== `settled` && (n === void 0 && await collectProviderToolCall(e), await r.flush(), await emitActionResult(t));
	};
	let emitInvalidCall = async (t, n) => {
		m.add(t.callId);
		let r = typeof n.output == `string` ? n.output : JSON.stringify(n.output ?? null);
		await e(requestCall({
			action: t,
			hidden: i?.tools.get(t.toolName)?.label === !1,
			inputError: {
				code: `INVALID_TOOL_INPUT`,
				message: r
			},
			owner: { runId: a }
		})), await emitActionResult(n);
	};
	let emitActionResult = async (t) => {
		if (h.has(t.callId)) return;
		h.add(t.callId);
		let n = t.isError === !0 ? void 0 : projectToolLabel(i?.tools.get(t.toolName), `complete`, y.get(t.callId), t.output);
		await e(settleCall(t, { label: n }));
	};
	let emitToolCall = async (e) => {
		if (isInvalidToolCall(e)) _.add(e.toolCallId);
		else if (!(i === void 0 || i.excludedActionToolNames.has(e.toolName))) try {
			await emitActionRequest(createPresentedRuntimeActionRequestFromToolCall({
				toolCall: e,
				tools: i.tools
			}));
		} catch (t) {
			if (t instanceof TypeError) {
				let n = createInvalidToolCallInputError({
					error: t,
					toolCall: e
				});
				_.add(e.toolCallId), u.trim().length > 0 && await flushCurrentMessage(), await emitInvalidCall({
					callId: e.toolCallId,
					input: {},
					kind: `tool-call`,
					toolName: e.toolName
				}, createRuntimeToolResultFromToolError(n)), v.push(createToolResultMessagePartFromToolError(n));
				return;
			}
			throw t;
		}
	};
	try {
		for await (let t of n) if (p === void 0) switch (t.type) {
			case `reasoning-delta`: {
				await r.flush(), c += t.text;
				let n = l === void 0;
				l ??= nextPartId(), await e(n ? {
					data: {
						delta: t.text,
						kind: `reasoning`,
						partId: l
					},
					scope: o,
					type: `content.delta`
				} : {
					data: {
						delta: t.text,
						partId: l
					},
					type: `content.delta`
				});
				break;
			}
			case `text-delta`: {
				await r.flush(), await flushCurrentReasoning(), u += t.text;
				let n = d === void 0;
				d ??= nextPartId(), await e(n ? {
					data: {
						delta: t.text,
						kind: `text`,
						partId: d
					},
					scope: o,
					type: `content.delta`
				} : {
					data: {
						delta: t.text,
						partId: d
					},
					type: `content.delta`
				});
				break;
			}
			case `tool-input-start`:
				if (i === void 0 || t.providerExecuted === !0 || i.tools.get(t.toolName)?.behavior?.handling?.kind === `provider-tool` || i.excludedActionToolNames.has(t.toolName) || i.tools.get(t.toolName)?.label === !1) {
					b.delete(t.id);
					break;
				}
				await r.flush(), u.trim().length > 0 && await flushCurrentMessage(textPhaseBefore(t.toolName, i.finalReplyOnly === !0)), b.set(t.id, {
					announced: !1,
					toolName: t.toolName
				});
				break;
			case `tool-input-delta`:
				if (!b.has(t.id)) break;
				await r.flush(), await emitActionInput(t.id, t.delta);
				break;
			case `tool-input-end`:
				b.delete(t.id);
				break;
			case `tool-call`: {
				let e = t;
				b.delete(e.toolCallId), e.providerExecuted === !0 ? await collectProviderToolCall(e) : (await r.flush(), await emitToolCall(e));
				break;
			}
			case `tool-result`: {
				let e = t;
				if (e.providerExecuted !== !0 || e.preliminary === !0) break;
				await settleProviderCall({
					input: `input` in e ? e.input : void 0,
					toolCallId: e.toolCallId,
					toolName: e.toolName
				}, createRuntimeToolResultFromStepResult(e));
				break;
			}
			case `tool-error`: {
				let e = t;
				if (e.providerExecuted !== !0) break;
				await settleProviderCall(e, createRuntimeToolResultFromToolError(e));
				break;
			}
			case `finish-step`:
				f = normalizeAssistantStepFinishReason(t.finishReason), await r.flush();
				break;
			case `error`:
				p = normalizeModelStreamError(t.error);
				break;
			case `abort`: throw new DOMException(t.reason ?? `The model stream was aborted.`, `AbortError`);
		}
	} catch (t) {
		if (i?.interruptSignal?.aborted === !0) {
			let t = [];
			l !== void 0 && c.length > 0 && t.push({
				partId: l,
				runId: a,
				kind: `reasoning`,
				phase: `narration`,
				value: c,
				interrupted: !0
			}), d !== void 0 && u.length > 0 && t.push({
				partId: d,
				runId: a,
				kind: `text`,
				phase: `narration`,
				value: u,
				interrupted: !0
			}), t.length > 0 && await e(completeParts(t));
		}
		throw t;
	}
	if (await r.flush(), p !== void 0) throw p;
	return await flushCurrentReasoning(), f !== `content-filter` && u.trim().length > 0 && d !== void 0 && await completePart(d, `text`, u, finalPhase(f, i?.held === !0)), {
		invalidInputToolCallIds: _,
		trailingInlineToolResultParts: v
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/request-envelope.js
async function estimateRequestEnvelope(e) {
	let t = await Promise.all(Object.entries(e.tools).map(async ([e, t]) => {
		let n = typeof t.inputSchema == `function` ? t.inputSchema() : t.inputSchema;
		let r = n === void 0 ? void 0 : `jsonSchema` in n ? await n.jsonSchema : serializeInputSchema(n);
		return {
			name: e,
			description: t.description,
			inputSchema: r,
			id: t.type === `provider` ? t.id : void 0,
			args: t.type === `provider` ? t.args : void 0
		};
	}));
	return Math.max(0, estimateTokens({
		instructions: e.instructions,
		messages: e.messages,
		tools: t
	}) - estimateTokens(e.history));
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/step-hooks.js
function buildStepHooks(e) {
	let t = e.session;
	let n;
	return {
		onStepEnd: async (e) => {
			n(e);
		},
		onStepStart: async ({ messages: t }) => {
			await e.startStep?.(t);
		},
		prepareStep: async ({ messages: n }) => {
			let { profile: r } = e;
			let i = { messages: r.anthropicCache ? applyConversationCacheControl(n, r.anthropicCache) : n };
			let a = resolveCallProviderOptions({
				auth: e.auth ?? contextStorage.getStore()?.get(AuthKey) ?? null,
				profile: r,
				providerOptions: e.model.providerOptions,
				session: t
			});
			return r.gateway && r.anthropicCache === void 0 ? i.providerOptions = mergeGatewayAutoCaching(a, r.provider) : a !== void 0 && (i.providerOptions = r.gateway ? omitGatewayAutoCaching(a) : a), i;
		},
		stepResult: new Promise((e) => {
			n = e;
		})
	};
}
async function emitStepActions(e, t, n, r) {
	let { runId: i } = t;
	for (let t of r) await e(settleCall(createRuntimeToolResultFromMessagePart(t, t.toolName)));
	if (i === void 0) return;
	let a = finalOutputOf(n);
	await e(settleRun({
		finishReason: normalizeAssistantStepFinishReason(n.finishReason),
		generationId: readGatewayGenerationId(n.providerMetadata),
		outcome: `completed`,
		runId: i,
		usage: runUsageOf({
			costUsd: extractGatewayCostUsd(n.providerMetadata),
			usage: n.usage
		})
	}, a === void 0 ? void 0 : {
		kind: `result`,
		partId: `${i}.result`,
		phase: `reply`,
		runId: i,
		value: a
	}));
}
function finalOutputOf(e) {
	let t = (e.toolCalls ?? []).find((e) => e.toolName === "eve__reply" && !isInvalidToolCall(e));
	return t === void 0 ? void 0 : toJsonValue(t.input);
}
function runUsageOf(e) {
	let { usage: t } = e;
	if (t !== void 0 || e.costUsd !== void 0) return usageOf({
		cacheReadTokens: t?.inputTokenDetails?.cacheReadTokens,
		cacheWriteTokens: t?.inputTokenDetails?.cacheWriteTokens,
		costUsd: e.costUsd,
		inputTokens: t?.inputTokens,
		outputTokens: t?.outputTokens
	});
}
function extractGatewayCostUsd(e) {
	let t = readGatewayMetadata(e)?.cost;
	if (typeof t == `number` && Number.isFinite(t)) return t;
	if (typeof t == `string`) {
		let e = Number(t);
		return Number.isFinite(e) ? e : void 0;
	}
}
function readGatewayGenerationId(e) {
	let t = readGatewayMetadata(e)?.generationId;
	return typeof t == `string` && t.length > 0 ? t : void 0;
}
function readGatewayMetadata(e) {
	let t = e?.gateway;
	return t && typeof t == `object` && !Array.isArray(t) ? t : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/call.js
const environment$1 = process.env.NODE_ENV ?? `unknown`;
const log$3 = createLogger(`harness.tool-loop`);
const MODEL_OUTPUT_TIMEOUT_MS = 6e5;
var ModelCaller = class {
	profile;
	attributionHeaders;
	projectedMessages;
	turnMessages;
	request;
	modelMessages = [];
	requestEnvelopeTokens = 0;
	system = ``;
	unkeptUsage;
	compactionFailure;
	attemptIndex = 0;
	started;
	acceptedOutput = !1;
	step;
	prompt;
	input;
	constructor(e, t, n) {
		this.step = e, this.prompt = t, this.input = n, this.profile = resolveModelProfile(n.model, stepReference(e).promptCache), this.attributionHeaders = buildGatewayAttributionHeaders(this.profile, e.config.runtimeIdentity), this.projectedMessages = n.projectedMessages, this.turnMessages = n.turnMessages, this.request = {
			history: t.messages,
			historyState: e.ctx.get(HistoryStateKey) ?? {},
			nonSystemMessages: n.projectedMessages
		};
	}
	async call() {
		let e = {};
		let t = {
			policies: [() => this.compactionFailure === void 0 ? ALLOW_RETRY : STOP_RETRY],
			onRetry: (e) => this.prepareRetry(e),
			sessionId: this.step.session.sessionId,
			turnId: this.step.position().turnId
		};
		for (;;) try {
			return await runModelCallWithRetries(() => this.attempt(e), t, this.input.generation.signal);
		} catch (n) {
			if (throwIfSessionStreamDead(n), this.compactionFailure !== void 0) throw this.compactionFailure.error;
			throwIfTurnAborted(this.step.config.abortSignal), this.input.generation.check();
			let { renewCredential: r } = this.input;
			if (r !== void 0 && rejectsCredential(n)) {
				await r(n), await this.prepareRetry(n);
				continue;
			}
			let i = recoverModelCall(n, e, t);
			if (i === void 0) throw n;
			await this.prepareRetry(n), e = i;
		}
	}
	async prepareRetry(e) {
		let { step: t } = this;
		let n = t.position().runId;
		let r = this.started;
		this.started = void 0;
		let i = this.takeUnkeptUsage();
		n !== void 0 && (this.acceptedOutput ? (await t.apply(discardAttempt(t.view(), {
			ending: `retried`,
			runId: n,
			usage: i
		})), this.acceptedOutput = !1, await this.input.newRun()) : r !== void 0 && await t.apply(retryRun({
			attempt: r,
			error: modelCallErrorInfo(e),
			runId: n,
			usage: i
		})));
	}
	async failIfCompactionFailed() {
		if (this.compactionFailure === void 0) return;
		let { error: e } = this.compactionFailure;
		return e instanceof CompactionOverLimitError ? reportCompactionFailure(this.step, e) : reportModelCallFailure(this.step, e);
	}
	async abandon() {
		return this.input.generation.end(), await this.discard(`retried`);
	}
	async steered() {
		return throwIfTurnAborted(this.step.config.abortSignal), this.input.generation.end(), {
			next: this.step.runStep,
			session: changeHistory(this.step.session, { extend: await this.discard(`steered`) }),
			steered: !0
		};
	}
	async discard(e) {
		let { step: t } = this;
		t.ctx.set(HistoryStateKey, this.request.historyState);
		let n = t.position().runId;
		return n !== void 0 && await t.apply(discardAttempt(t.view(), {
			ending: e,
			runId: n,
			usage: this.takeUnkeptUsage()
		})), this.request.history;
	}
	takeUnkeptUsage() {
		let e = this.unkeptUsage;
		return this.unkeptUsage = void 0, e;
	}
	async buildRequest() {
		let { prompt: e, step: t } = this;
		let n = {
			currentInput: new Set(this.turnMessages),
			historyState: t.ctx.get(HistoryStateKey) ?? {},
			record: e.messages
		};
		let r = await stepDraft(t, n);
		this.system = await stepSystem(t, r);
		let i = await stepMessages(r, {
			call: n,
			project: (t) => projectPrompt({
				...e,
				messages: [...t]
			})
		});
		this.request = {
			history: i.record,
			historyState: i.historyState,
			nonSystemMessages: i.view
		};
	}
	framing(e, t) {
		let n = e.trailingUserNote;
		let r = n !== void 0 && awaitsProviderToolResult(t);
		return {
			instructions: modelInstructions({
				extraSystemNote: r ? [e.extraSystemNote, n].filter((e) => e !== void 0).join(`

`) : e.extraSystemNote,
				instructions: this.system,
				profile: this.profile
			}),
			messages: r ? [...t] : withTrailingUserNote(t, n)
		};
	}
	async prepare(e) {
		let t = await prepareModelTools(this.step, {
			catalog: this.input.catalog,
			disabledProviderTools: e.disabledProviderTools,
			profile: this.profile
		});
		return await this.buildRequest(), this.requestEnvelopeTokens = await estimateRequestEnvelope({
			history: this.projectedMessages,
			...this.framing(e, this.request.nonSystemMessages),
			tools: t
		}), t;
	}
	async compact(e, t) {
		let { step: n, prompt: r } = this;
		let i;
		try {
			i = await historyBeforeCall(n, {
				messages: r.messages,
				model: this.input.model,
				renew: this.input.renewCredential,
				promptMessages: withClientContext(r),
				requestEnvelopeTokens: this.requestEnvelopeTokens
			});
		} catch (e) {
			throw this.compactionFailure = { error: e }, e;
		}
		if (i === void 0) return t;
		compactPrompt(n, r, i);
		let a = compactedTurnInput(r.messages);
		return this.turnMessages = a === void 0 ? this.input.turnMessages : [...this.input.turnMessages, a], this.projectedMessages = projectPrompt(r), await this.prepare(e);
	}
	async attempt(e) {
		let { step: t } = this;
		let { generation: n, model: r } = this.input;
		let i = await this.compact(e, await this.prepare(e));
		let a = this.attemptIndex++;
		await this.input.startRun(a), this.started = a, this.requestEnvelopeTokens = Math.max(0, this.requestEnvelopeTokens - (estimateTokens(this.request.history) - estimateTokens(this.prompt.messages))), n.begin(), this.modelMessages = await hydrateSandboxAttachments(this.request.nonSystemMessages), this.profile.filesOutsideToolResults && (this.modelMessages = moveToolResultFilesToUserMessages(this.modelMessages));
		let { instructions: o, messages: s } = this.framing(e, this.modelMessages);
		let c = t.instrumentation?.resolveRuntimeContext({
			attempt: a,
			emissionState: t.position(),
			environment: environment$1,
			modelInput: {
				instructions: o,
				messages: this.modelMessages
			},
			session: t.session
		}) ?? {};
		e.retryReason && (c[`eve.retry.reason`] = e.retryReason);
		let l = t.position();
		let u = t.instrumentation?.prepareAttempt({
			isFrameworkTool: (e) => t.frameworkToolNames.has(e),
			runId: l.runId,
			attempt: a,
			runtimeContext: c,
			stepIndex: l.stepIndex,
			turnId: activeTurnId(l)
		});
		let d = buildStepHooks({
			auth: t.ctx.get(AuthKey) ?? null,
			model: stepReference(t),
			profile: this.profile,
			session: t.session
		});
		let f = {
			headers: this.attributionHeaders,
			instructions: o,
			model: withUniqueCallIds(withGatewayTraceContext(r, this.profile, this.step.instrumentation?.gatewayTraceContextHeaders), [...Object.keys(t.view().projection.view.calls), ...historyCallNames(s).keys()]),
			onLanguageModelCallEnd: (e) => {
				n.interrupted || (this.unkeptUsage = runUsageOf({
					costUsd: extractGatewayCostUsd$1(e.providerMetadata),
					usage: e.usage
				}));
			},
			onError(e) {
				n.interrupted || summarizeKnownError(e.error)?.tags.includes(`config`) !== !0 && logError(log$3, `tool-loop stream error`, e.error);
			},
			onStepEnd: d.onStepEnd,
			onStepStart: d.onStepStart,
			prepareStep: d.prepareStep,
			reasoning: stepReference(t).reasoning ?? agentSettings(t).reasoning,
			runtimeContext: c,
			stopWhen: isStepCount(1),
			telemetry: u?.telemetry,
			timeout: {
				chunkMs: MODEL_OUTPUT_TIMEOUT_MS,
				firstChunkMs: MODEL_OUTPUT_TIMEOUT_MS
			},
			tools: i
		};
		let p = new ToolLoopAgent(f);
		try {
			return await this.stream(p, s, d.stepResult, u?.telemetry);
		} catch (e) {
			if (throwIfSessionStreamDead(e), n.check(), isAbortError(e) && !n.signal.aborted) throw new ModelStreamStalledError({ cause: e });
			return rethrowNoOutputAsEmptyResponse(e);
		}
	}
	async stream(e, t, n, r) {
		let { step: i } = this;
		let { catalog: a, generation: o } = this.input;
		let s = /* @__PURE__ */ new Set(["eve__reply"]);
		let c = await e.stream({
			abortSignal: o.signal,
			messages: t
		});
		let { invalidInputToolCallIds: l, trailingInlineToolResultParts: u } = await emitStreamContent(async (e, t) => {
			this.acceptedOutput = !0, await i.publish(e, t);
		}, i.position(), toEntryStream(interruptStreamOnFailure(c.fullStream, o.signal), a.resolve), {
			excludedActionToolNames: s,
			held: i.finalReplyOnly && workingTaskIds(i.session).length > 0,
			finalReplyOnly: i.finalReplyOnly,
			sessionCall: (e) => i.view().projection.view.calls[e],
			tools: a,
			interruptSignal: o.signal
		});
		throwIfTurnAborted(i.config.abortSignal), o.check();
		let [d, f] = toEntryStep(...await Promise.all([n, c.responseMessages]), a.resolve);
		assertUsableResponse(d, f, {
			allowEmptyStop: !i.hasDelegatedCaller,
			hasInlineResults: u.length > 0
		});
		let p = await this.runInlineCalls(d, t, {
			excludedCallIds: l,
			telemetry: r
		});
		let m = answerSkippedToolCalls(d, a, l);
		return this.unkeptUsage = void 0, await emitStepActions(i.publish, i.position(), d, m), withCallResults({
			answers: [...u, ...m],
			calls: p,
			invalidInputToolCallIds: l,
			responseMessages: f,
			stepResult: d
		});
	}
	async runInlineCalls(e, t, n) {
		let { finishReason: r } = e;
		if (r !== `stop` && r !== `tool-calls`) return NO_INLINE_CALLS;
		let { step: i } = this;
		let a = await executeInlineCalls({
			abortSignal: this.input.generation.signal,
			approvalMemory: this.input.approvalMemory,
			beforeExecute: () => this.input.generation.protectToolExecution(),
			excludedCallIds: n.excludedCallIds ?? /* @__PURE__ */ new Set(),
			messages: t,
			modelCallId: e.callId,
			publish: i.publish,
			telemetry: n.telemetry,
			toolCalls: e.toolCalls ?? [],
			tools: this.input.catalog
		});
		return throwIfTurnAborted(i.config.abortSignal), a;
	}
};
function assertUsableResponse(e, t, n) {
	if (e.finishReason === `content-filter`) throw new ContentFilteredModelResponseError(readGatewayGenerationId(e.providerMetadata));
	if (!(n.allowEmptyStop && e.finishReason === `stop`) && isEmptyModelResponse(e) && extractToolResultCallIds(t).size === 0 && !n.hasInlineResults) throw new EmptyModelResponseError();
}
function isAbortError(e) {
	return e instanceof Error && (e.name === `AbortError` || e.name === `TimeoutError`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/model-call/run.js
async function runModelStep(e, t) {
	let { generation: n } = t;
	let r = await previewPrompt(e, t.turn);
	let i = await prepareModelCall(e, r);
	if (i !== void 0) return i;
	let a = commitTurnInput(e, r);
	let o = await enforceBudget(e, a.messages);
	if (o !== void 0) return o;
	let s = await resolveModel(e);
	if (`failed` in s) return s.failed;
	let c = await requestRun(e, a);
	if (c !== void 0) return c;
	let l = projectPrompt(a);
	let u = await stepCatalog(e);
	e.frameworkToolNames = frameworkToolNames(u);
	let { approvalMemory: d } = humanInputContext(e);
	let f = new ModelCaller(e, a, {
		approvalMemory: d,
		catalog: u,
		generation: n,
		model: s.model,
		renewCredential: s.renew,
		newRun: async () => {
			if (await requestRun(e, a) !== void 0) throw Error(`eve couldn't request the replacement model run.`);
		},
		startRun: async (t) => await startRun(e, t),
		projectedMessages: l,
		turnMessages: t.turn.messages
	});
	let p;
	try {
		p = await f.call();
	} catch (t) {
		throwIfSessionStreamDead(t), throwIfTurnAborted(e.config.abortSignal);
		let r = credentialErrorIn(t);
		if (r !== void 0) return n.interrupted ? f.steered() : r instanceof ModelCredentialFailure ? await failModelCredential(e, r.code, r.cause, r.scoped) : await pauseForModelSignIn(e, r, async () => {
			let t = await f.abandon();
			e.session = changeHistory(e.session, { extend: t });
		});
		let i = await f.failIfCompactionFailed();
		return i === void 0 ? n.interrupted ? f.steered() : s.scoped !== void 0 && refusesCredential(t) ? await failModelCredential(e, `MODEL_AUTHORIZATION_FAILED`, t, s.scoped) : reportModelCallFailure(e, t, f.takeUnkeptUsage()) : i;
	}
	await recordModelUsage(e, {
		model: s.model,
		tools: u.advertised.size
	});
	let m;
	try {
		n.check(), m = await handleStepResult(e, {
			catalog: u,
			durableModelPromptMessageCount: a.clientContext === void 0 || a.clientContext.messages.length === 0 ? f.modelMessages.length : void 0,
			endsTurnTools: endsTurnTools(u, e.endsTurn),
			promptMessages: f.request.history,
			requestEnvelopeTokens: f.requestEnvelopeTokens,
			result: p
		});
	} catch (t) {
		if (throwIfSessionStreamDead(t), throwIfTurnAborted(e.config.abortSignal), n.interrupted) return f.steered();
		throw t;
	}
	return e.ctx.set(HistoryStateKey, f.request.historyState), m;
}
async function resolveModel(e) {
	let t;
	try {
		t = await resolveEffectiveRuntimeModel(e);
	} catch (t) {
		return { failed: await failModelSelection(e, t) };
	}
	e.model = t.choice;
	try {
		return await credentialedModel(t.model);
	} catch (t) {
		let n = credentialErrorIn(t);
		if (n === void 0) throw t;
		return { failed: await failOrAsk(e, n) };
	}
}
async function requestRun(e, t) {
	try {
		await e.apply(requestRun$1({ turnId: activeTurnId(e.position()) }, nextRunId(e.view().projection)), validateHarnessModelMessages(withClientContext(t)));
	} catch (t) {
		return await failBoundaryEvent(e, t);
	}
}
async function startRun(e, t) {
	let n = e.position().runId;
	if (n === void 0) return;
	let r = stepReference(e).id;
	await e.apply(startRun$1({
		attempt: t,
		modelId: r,
		runId: n
	}));
}
async function failOrAsk(e, t) {
	return isScopedAuthorizationRequiredError(t) ? await pauseForModelSignIn(e, t) : await failModelCredential(e, t.code, t.cause, t.scoped);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/harness/kernel.js
const environment = process.env.NODE_ENV ?? `unknown`;
const eveVersion = resolveInstalledPackageInfo().version;
function createKernel(e) {
	e.instrumentation?.installAiSdkWarningLogger();
	async function runStep(t, n) {
		let executeStep = async (r) => {
			let i = r?.session ?? t;
			let a = contextStorage.getStore();
			if (a === void 0) throw Error(`A session step runs inside its session's context.`);
			let o = stepProjection(a, i.state);
			let s = new GenerationSteering({
				abortSignal: e.abortSignal,
				steeringSignal: e.steeringSignal,
				outputStarted: turnPosition(o.read()).assistantOutputStarted
			});
			try {
				let e = await executeStepBody(a, i, s, o, n, r);
				return {
					...e,
					session: saveProjection(e.session, o.read())
				};
			} finally {
				s.dispose();
			}
		};
		return e.instrumentation?.runStep({
			environment,
			eveVersion,
			hasInput: hasStepInput(n),
			session: t
		}, executeStep) ?? executeStep();
	}
	async function executeStepBody(t, n, r, i, a, o) {
		let s = o?.createHandleEvent({
			isFrameworkTool: (e) => c.frameworkToolNames.has(e),
			handleEvent: e.handleEvent
		}) ?? e.handleEvent;
		let publish = async (e, t) => {
			let n = eventsOf(e);
			for (let e of n) r.beforeEvent(e);
			s !== void 0 && await s(e, t), s === void 0 && i.record(e);
		};
		let c = createStep({
			config: e,
			ctx: t,
			emit: s,
			instrumentation: o,
			live: i,
			publish,
			runStep,
			session: n
		});
		return await withUsageSink(publish, () => runStages(c, a, r));
	}
	async function runStages(t, n, r) {
		if (e.clearOnly === !0) return clearContext(t);
		if (e.compactOnly === !0) return compactHistory(t);
		let i = endingStepKeys(t.view());
		let a = await runtimeResults(t, n);
		if (`ended` in a) return a.ended;
		let o = await answers(t, a);
		if (`ended` in o) return o.ended;
		let s = await turnInput(t, n, o);
		if (`ended` in s) return s.ended;
		let c = await failTurnForEffect(t);
		if (c !== void 0) return c;
		let l = await applyHumanDecisions(t, o.decided);
		if (l !== void 0) return l;
		if (blocked(t.view(), t.session.state)) return park(t);
		if (hasQueuedTurnInput(t.view()) && !awaitsProviderToolResult(t.session.history)) {
			let e = o.input && {
				...o.input,
				message: s.message
			};
			return await t.apply(queueInput(t.view(), turnInputOnly(e))), {
				next: t.runStep,
				session: t.session
			};
		}
		if ((a.endsTurn || committedEndingStep(t.view(), i)) && s.messages.length === 0 && !hasQueuedTurnInput(t.view())) {
			let e = workingTaskIds(t.session);
			return e.length > 0 ? {
				held: {
					kind: `tasks`,
					taskIds: e
				},
				next: null,
				session: t.session
			} : settleTurn(t, { stepOutput: null });
		}
		return runModelStep(t, {
			generation: r,
			turn: s
		});
	}
	return runStep;
}
async function runtimeResults(e, t) {
	let n = await settleRuntimeWork(e, t);
	return n === void 0 ? { ended: {
		next: null,
		session: e.session
	} } : (await e.apply(openDeferredApprovals(e.view())), n);
}
async function answers(e, t) {
	let n = await admitHumanInput(e, t.input, { takeQueued: !t.waited });
	if (n.kind === `stop`) return { ended: n.result };
	let r = await settleHumanInput(e, n);
	let { input: i, message: a } = n;
	return (r.approved.length > 0 || r.settledApprovals || awaitsProviderToolResult(e.session.history) && activeTurnIdOf(e.view().projection) !== void 0) && (await e.apply(queueInput(e.view(), turnInputOnly(i))), i = withoutTurnInput$1(i), a = void 0), r.approved.length === 0 && blocked(e.view(), e.session.state) ? (await e.apply(queueInput(e.view(), compactInput(i))), { ended: await park(e) }) : {
		decided: r,
		input: i,
		intake: n,
		message: a
	};
}
async function turnInput(e, t, { input: n, intake: r, message: i }) {
	let a = await prepareTurnInput(e, n, { consumedMessage: r.consumedMessage });
	let o = deliveriesOf(t, n);
	if (r.opensTurn) {
		let t = await openTurn(e, {
			deliveries: o,
			input: [...a.ephemeral, ...a.messages],
			message: i
		});
		if (t !== void 0) return { ended: t };
	} else o !== void 0 && await e.apply(join$1(e.view(), { deliveries: o }));
	return !r.opensTurn && activeTurnIdOf(e.view().projection) === void 0 ? { ended: {
		next: null,
		session: e.session
	} } : a;
}
async function clearContext(e) {
	let t = controlDeliveryFor(e.view(), e.config.controlDelivery);
	await e.apply(controlled(t, `clear`, (t) => clear(e.view(), { cause: t })));
	let n = takeTaskResults(readTaskTable(e.session.state)).table;
	return {
		next: null,
		session: writeTaskTable(e.session, n)
	};
}
function deliveriesOf(...e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.flatMap((e) => e?.deliveries ?? [])) t.has(n.deliveryId) || t.set(n.deliveryId, n);
	return t.size === 0 ? void 0 : [...t.values()];
}
function hasStepInput(e) {
	return e === void 0 ? !1 : e.message !== void 0 || (e.answers?.length ?? 0) > 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/node-step.js
const log$2 = createLogger(`execution.node-step`);
function createExecutionNodeStep(e) {
	let t = createRuntimeModelResolver(e.modelResolutionScope);
	let n = createNodeHarnessTools({ node: e.node });
	let r = e.instrumentation;
	let i = r?.prepareExecution();
	let a = createKernel({
		steeringSignal: e.steeringSignal,
		abortSignal: e.abortSignal,
		capabilities: e.capabilities,
		clearOnly: e.clearOnly,
		compactOnly: e.compactOnly,
		controlDelivery: e.controlDelivery,
		handleEvent: e.handleEvent,
		instrumentation: i,
		signInCompletions: e.signInCompletions,
		typedAnswers: e.typedAnswers,
		resolveModel: t,
		runtimeIdentity: buildRuntimeIdentity(e.agent),
		sessionUsageLimit: e.sessionUsageLimit,
		tools: n,
		setAttributes: e.setAttributes
	});
	return r === void 0 ? a : async (e, t) => {
		try {
			return await a(e, t);
		} finally {
			await r.flush();
		}
	};
}
function buildRuntimeIdentity(e) {
	let t = resolveInstalledPackageInfo();
	let n = {
		agentId: e.id,
		agentName: e.name,
		eveVersion: t.version
	};
	let r = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
	let i = process.env.VERCEL_GIT_COMMIT_REF?.trim();
	let a = process.env.VERCEL_DEPLOYMENT_CREATED_AT?.trim();
	return r || i || a ? {
		...n,
		build: {
			deployedAt: a || void 0,
			gitBranch: i || void 0,
			gitSha: r || void 0
		}
	} : n;
}
function createRuntimeModelResolver(e) {
	return (t) => resolveRuntimeModelReference(t, e);
}
function createNodeHarnessTools(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.node.turnAgent.tools) {
		let r = resolveHarnessToolDefinition({
			node: e.node,
			tool: n
		});
		r !== null && t.set(n.name, r);
	}
	return t;
}
function resolveHarnessToolDefinition(e) {
	let t = findRegisteredRuntimeTool(e.node.toolRegistry, e.tool.name);
	let n = workflowIdForHandling(e.tool.behavior?.handling);
	return n === void 0 ? t === null ? (log$2.warn(`declared tool is not registered — omitting from toolset`, {
		toolName: e.tool.name,
		nodeId: e.node.nodeId
	}), null) : createRegisteredHarnessToolDefinition({
		behavior: e.tool.behavior,
		definition: t.definition,
		rootOnly: e.tool.rootOnly
	}) : t === null ? createPreparedWorkflowToolHarnessDefinition(e.tool) : createWorkflowToolHarnessDefinition({
		executeInput: t.definition.executeInput,
		definition: createRegisteredHarnessToolDefinition({
			behavior: e.tool.behavior,
			definition: t.definition,
			rootOnly: e.tool.rootOnly
		}),
		workflowId: n
	});
}
function createRegisteredHarnessToolDefinition(e) {
	let t = e.definition;
	let n = t.execute;
	return {
		availableInSubagents: t.availableInSubagents,
		label: t.label ?? (t.owner.kind === `framework` && t.name === "web_search" ? { start: resolveWebSearchActivityLabel } : void 0),
		behavior: e.behavior,
		deferred: t.deferred,
		description: t.description,
		endsTurn: t.endsTurn,
		executeInput: t.executeInput,
		execute: resolveAuthoredExecute({
			rawExecute: n,
			scope: t.name
		}),
		frameworkTool: isFrameworkTool(t) || t.owner.kind === `framework`,
		inputSchema: t.inputSchema ?? UNSPECIFIED_INPUT_SCHEMA,
		...isInteractionOnly(t) && { interactionOnly: !0 },
		name: t.name,
		approval: t.approval,
		outputSchema: t.outputSchema,
		rootOnly: e.rootOnly,
		toModelOutput: t.toModelOutput
	};
}
function resolveAuthoredExecute(e) {
	let { rawExecute: t, scope: n } = e;
	return t === void 0 ? void 0 : createToolExecuteWithAuth({
		execute: t,
		scope: n
	});
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/model-call-batching.js
function canContinueModelCallBatch(e) {
	return e.lastCall || e.steeringSignal?.aborted === !0 || e.result.steered === !0 || typeof e.result.next != `function` ? !1 : !waitsOnAnything(e.result.session, e.projection);
}
async function runModelCallBatch(e) {
	let t = e.initialSession;
	let n = e.initialInput;
	let r = 0;
	for (;;) {
		let i = r + 1 >= e.modelCallsPerStep;
		let a = await e.runStep({
			firstCall: r === 0,
			lastCall: i,
			session: t,
			stepInput: n
		});
		if (r++, !canContinueModelCallBatch({
			lastCall: i,
			steeringSignal: e.steeringSignal,
			result: a,
			projection: storedProjection(a.session.state)
		})) return a;
		t = a.session, n = void 0;
	}
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session/turn-step.js
const log$1 = createLogger(`execution.turn-step`);
function recordPendingUsage(e, t) {
	for (let [n, r] of Object.entries(t)) r !== void 0 && ((e.usage ??= {})[n] = r);
}
function writePendingUsage(e, t) {
	let n = e.usage;
	if (n !== void 0) {
		e.usage = void 0;
		let r = e.usageWrite;
		e.usageWrite = (async () => {
			await r, await t.setAttributes(n);
		})().catch(() => {});
	}
	return e.usageWrite ?? Promise.resolve();
}
function turnStepOn(e) {
	return async (t) => await withSessionStateDelta(t, (t) => runSessionStep({
		...t,
		serializedContext: bindTurnCallerContext(t.caller, t.serializedContext)
	}, e));
}
async function runSessionStep(e, t) {
	let n = {};
	try {
		return await runSessionStepBody(e, n, t);
	} finally {
		let e = writePendingUsage(n, t);
		try {
			await n.title;
		} finally {
			await e;
		}
	}
}
async function runSessionStepBody(e, t, n) {
	let r = e.input?.delivery;
	let i = r;
	let a = e.input?.runtimeResults;
	let o = readDurableSession(e.sessionState);
	let s = await deserializeContext(e.serializedContext);
	enterSessionProjection(s, o.state);
	let c = await readOrphanedLines({
		sessionId: o.sessionId,
		position: nextLinePosition(s),
		sessionWritable: e.sessionWritable,
		rerun: e.recover !== void 0 || e.rerun
	});
	let l = c.length > 0 || e.recover !== void 0 ? readInterruptedAttempt(nextLinePosition(s), c) : void 0;
	c.length > 0 && enterSessionProjectionAt(s, foldOrphanedLines(currentProjection(s), c));
	let u = s.require(ChannelKey);
	let d = sessionAgent(s);
	let f = requireCompiledBundle(s);
	n.callbackBaseUrl !== void 0 && s.set(CallbackBaseUrlKey, n.callbackBaseUrl);
	let { signIns: p } = readHitlState(o.state);
	let m;
	if (p.length > 0 && i !== void 0) {
		let { matches: e, remainingPayloads: t } = matchAuthorizationCallbacks(p, i.payloads);
		if (i = {
			...i,
			payloads: t
		}, e.length > 0) {
			let r = e.map((e) => e.result.attemptId);
			let a = e.map((e) => e.result);
			let c = s.get(CallbackBaseUrlKey);
			if (c !== void 0 && n.deliver !== void 0) {
				let t = ownCallbacks(o.sessionId, c);
				let r = storedProjection(o.state).view;
				await settleSignIns(signInDelivery(n.deliver), e.flatMap(({ challenge: e, result: n }) => {
					let i = ownSignInAnswer(r, e, n.callback);
					if (i !== void 0) return signInsAnswered(r, i, t);
					let a = n.callback.params.error;
					return a === void 0 ? [] : signInsEnded(r, {
						interactionId: signInInteractionId(e),
						reason: a
					}, t);
				}));
			}
			s.set(PendingAuthorizationResultKey, a);
			let l = sessionView(storedProjection(o.state), o.state);
			let u = matchSignIns(l, { attemptIds: r });
			if (u.events.length !== 0) throw Error(`matchSignIns must not emit events.`);
			o = saveTransition(o, u), m = e, t.length === 0 && (i = void 0);
		}
	}
	i?.payloads.some((e) => e.message !== void 0) && (s.delete(ScheduleIdKey), s.delete(ScheduleInstanceKey), s.delete(OccurrenceIdKey), i.schedule !== void 0 && (s.set(ScheduleIdKey, i.schedule.definition), i.schedule.instance !== void 0 && s.set(ScheduleInstanceKey, i.schedule.instance), i.schedule.occurrenceId !== void 0 && s.set(OccurrenceIdKey, i.schedule.occurrenceId)));
	let h = s.get(AuthKey);
	let g = s.get(SteeredByKey);
	let _ = s.has(InitiatorAuthKey);
	let v = turnPosition(currentProjection(s));
	let y = isBetweenTurns(currentProjection(s));
	let b = i?.payloads.some((e) => e.message !== void 0) === !0;
	let x = !y && openRequests(currentProjection(s).view).some((e) => e.request.kind === `approval`) && b && (g?.length ?? 0) > 0 && i?.steeredBy === void 0 && i?.auth != null && principalOf$1(i.auth) !== "anonymous" && principalOf$1(i.auth) === principalOf$1(h);
	y && v.sessionStarted && setSteeredBy(s, []), i?.auth !== void 0 && (y ? (s.set(AuthKey, i.auth ?? null), s.has(InitiatorAuthKey) || s.set(InitiatorAuthKey, i.auth ?? null)) : b && principalOf$1(i.auth) === principalOf$1(h) && s.set(AuthKey, i.auth ?? null)), i !== void 0 && b && (i.steeredBy === void 0 ? !y && !x && (i.principalPolicy === `retain` || i.auth !== void 0 && principalOf$1(i.auth) === principalOf$1(h)) && setSteeredBy(s, steeredByAfter(g ?? [], h, i.auth)) : setSteeredBy(s, i.steeredBy));
	let S = i === void 0 ? m?.find(({ challenge: e }) => e.candidateId === void 0)?.challenge.requester : void 0;
	S !== void 0 && s.set(AuthKey, S);
	let C = {
		...hydrateDurableSession(o),
		history: validateHarnessModelMessages(e.history)
	};
	let sandboxIdleTimeoutMs = (e) => sessionSandboxIdleTimeoutMs({
		agent: d,
		channelState: s.get(ChannelKey)?.state,
		sandboxState: e.sandboxState,
		sessionId: o.sessionId
	});
	let w = bindSessionInstrumentation({
		agentName: d.id,
		ctx: s,
		rootSessionId: C.rootSessionId ?? C.sessionId,
		sessionId: C.sessionId
	});
	if (bindMemoryInstrumentation(s, w?.memory), !v.sessionStarted && !s.has(SessionTitleKey) && !s.has(ParentSessionKey)) {
		let e = r?.payloads.find((e) => e.message !== void 0)?.message;
		let i = deriveSessionTitle(r?.title ?? e);
		i !== void 0 && (s.set(SessionTitleKey, i), t.title = n.setAttributes({ "$eve.title": i }));
	}
	r !== void 0 && (await contextStorage.run(s, () => w?.preparePreamble({
		sequence: v.sequence,
		sessionStarted: v.sessionStarted
	})), w?.prepareDelivery(r));
	let T = new AbortController();
	let E = openSessionEventPublisher({
		cancelTurn: e.input?.control === void 0 ? () => T.abort(new TurnCancelledError()) : void 0,
		ctx: s,
		origin: `own`,
		sessionWritable: e.sessionWritable
	});
	let { adapterCtx: D } = E.dispatcher;
	let O = e.abortSignal === void 0 ? T.signal : AbortSignal.any([e.abortSignal, T.signal]);
	try {
		let c = {
			...f.graph.root,
			turnAgent: f.turnAgent
		};
		let p = d.settings.limits?.sessionUsage;
		let b = !1;
		let S = createTurnEventHandler({
			abortSignal: O,
			canCancelTurn: e.input?.control === void 0,
			conversation: C.history,
			hookCancellation: T,
			publisher: E
		});
		let handleEvent = async (e, t) => {
			eventsOf(e).some((e) => e.type === `context.settled` && e.data.kind === `compaction` && e.data.outcome === `completed`) && (b = !0), await S(e, t);
		};
		let k = i !== void 0 && !y ? structuredClone(D.state) : void 0;
		let A;
		let j;
		if (i !== void 0) {
			let e = [];
			let t = i.payloads.some((e) => e.message !== void 0) ? readPendingHistory(o.state) : [];
			let n = 0;
			try {
				for (let r of i.payloads) {
					let a = i.auth === void 0 ? r : {
						...r,
						auth: i.auth
					};
					let o = u.deliver ? await u.deliver(a, D) : defaultDeliverResult(a);
					if (o == null) {
						e.push({
							input: void 0,
							payload: r
						});
						continue;
					}
					let s = [...n === 0 ? t : [], ...r.history ?? []];
					n += 1, e.push({
						input: s.length === 0 ? o : {
							...o,
							history: s
						},
						payload: r
					});
				}
			} catch (e) {
				throw await w?.flush(), e;
			}
			j = planAdmission({
				channelKind: s.get(ChannelInstrumentationKey)?.kind ?? getAdapterKind(u),
				delivery: r ?? i,
				status: (e) => currentProjection(s).view.deliveries[e]?.status,
				payloads: e
			}), n > 0 && t.length > 0 && (C = {
				...C,
				state: withoutPendingHistory(C.state)
			}), A = j.inputs.length === 0 ? void 0 : j.inputs.reduce(coalesceTurnInputs);
		}
		let M = i?.auth === void 0 ? void 0 : attributeAnswers({
			owner: y ? void 0 : h ?? null,
			responder: i.auth,
			state: o.state,
			stepInput: A
		});
		M !== void 0 && (A = M, _ || s.delete(InitiatorAuthKey));
		let N = i !== void 0 && A === void 0 && !y;
		let P = s.get(AuthKey);
		M !== void 0 || N ? P = h : i !== void 0 && !y && (P = A?.message === void 0 ? h : continueTurnAuth(h, i.auth, i.principalPolicy)), P === void 0 ? s.delete(AuthKey) : s.set(AuthKey, P), y && v.sessionStarted && setSteeredBy(s, []);
		let F = x && i !== void 0 && M === void 0 && !N && A?.message !== void 0;
		if (i !== void 0 && M === void 0 && !N && A?.message !== void 0 ? i.steeredBy === void 0 ? !y && !F && setSteeredBy(s, steeredByAfter(g ?? [], P, i.auth)) : setSteeredBy(s, i.steeredBy) : y || setSteeredBy(s, g ?? []), N) D.state = k;
		else if (r?.payloads.some((e) => e.message !== void 0)) {
			let e = r.deliveryMetadata?.map((e) => e.deliveryId) ?? [];
			s.set(TurnDeliveryIdsKey, v.turnId ? [.../* @__PURE__ */ new Set([...s.get(TurnDeliveryIdsKey) ?? [], ...e])] : e);
		} else !v.sessionStarted && s.get(ChannelDeliveryKey) !== void 0 && s.set(TurnDeliveryIdsKey, [s.require(ChannelDeliveryKey).deliveryId]);
		if (a !== void 0 && (a.acceptedAtMsByCallId !== void 0 && s.set(RuntimeActionSettlementTimesKey, a.acceptedAtMsByCallId), A = {
			...A,
			delegatedUsage: a.delegatedUsage,
			runtimeActionResults: a.results
		}), r !== void 0) setChannelContext(s, {
			...u,
			state: { ...D.state }
		});
		let I = !1;
		let admissionFacts = (e) => {
			if (j === void 0 || admitDeliveries(j.deliveries).length === 0) return admitDeliveries([]);
			let t = s.get(ParentSessionKey);
			return admitDeliveries(j.deliveries, { start: turnPosition(currentProjection(s)).sessionStarted ? void 0 : {
				parent: t === void 0 ? void 0 : {
					callId: t.callId,
					sessionId: t.sessionId
				},
				predecessor: s.get(SessionPredecessorKey),
				runtime: e
			} });
		};
		let publishAdmission = async (e) => {
			let t = admissionFacts(e);
			if (t.length === 0) return;
			let n = sessionProvider.create(s, C);
			s.setVirtualContext(SessionKey, n.value);
			let r = await connectionProvider.create(s, C);
			r !== void 0 && s.setVirtualContext(ConnectionRegistryKey, r.value);
			let i = await sandboxProvider.create(s, C);
			i !== void 0 && s.setVirtualContext(SandboxKey, i.value);
			let a = w?.createHandleEvent({ handleEvent }) ?? handleEvent;
			try {
				await contextStorage.run(s, () => a(t));
			} finally {
				if (await E.drain().finally(() => r?.value.dispose()), i !== void 0) {
					let e = await i.value.captureState();
					JSON.stringify(e) !== JSON.stringify(C.sandboxState ?? null) && (I = !0, C = {
						...C,
						sandboxState: e
					});
				}
			}
		};
		let consumeCancelledInput = async () => {
			let e = currentProjection(s);
			let t = (A?.deliveries ?? []).filter(({ deliveryId: t }) => e.view.deliveries[t]?.status === `admitted`);
			if (t.length === 0) return;
			let n = commitTransitions([receive(sessionView(e, C.state), { deliveries: t })]);
			let r = createTurnEventHandler({
				abortSignal: O,
				canCancelTurn: !1,
				conversation: C.history,
				hookCancellation: new AbortController(),
				publisher: E
			});
			let i = w?.createHandleEvent({ handleEvent: r }) ?? r;
			await contextStorage.run(s, () => i(n));
		};
		if (i !== void 0 && A === void 0 && y) {
			await publishAdmission(buildRuntimeIdentity(d)).catch(ignoreTurnCancellation), await w?.flush();
			let t = saveSessionProjection(reconcileSessionContinuationToken(s, C), s);
			return pausedOrParked(t, {
				serializedContext: serializeContext(s),
				...t === C && !I ? {
					history: e.history,
					sessionState: e.sessionState
				} : createDurableSessionValues(t)
			});
		}
		let L = buildRuntimeIdentity(d);
		let R;
		let prepareDefinitions = (e) => R ??= (async () => {
			try {
				let t = await d.revision();
				await contextStorage.run(s, () => restoreDefinitions(s, {
					abortSignal: O,
					conversation: e.history,
					revision: t
				}));
			} catch (e) {
				throw await w?.flush(), e;
			}
		})();
		if (l !== void 0) {
			C = markSandboxRunning(C, await sandboxIdleTimeoutMs(C));
			let t = await recoverInterruptedStep({
				admission: admissionFacts(L),
				attempt: l,
				control: e.input?.control === void 0 ? void 0 : {
					delivery: e.input.controlDelivery,
					kind: e.input.control
				},
				ctx: s,
				failed: e.recover,
				publish: async (e, t) => (await withContextScope(s, t, async (t) => {
					await prepareDefinitions(t);
					let n = createTurnEventHandler({
						abortSignal: O,
						canCancelTurn: !1,
						conversation: t.history,
						hookCancellation: new AbortController(),
						publisher: E
					});
					return await (w?.createHandleEvent({ handleEvent: n }) ?? n)(e), {
						result: void 0,
						session: t
					};
				}, { drain: E.drain })).session,
				session: C,
				stepInput: A
			}).catch(async (e) => {
				throw await w?.flush(), e;
			});
			if (`result` in t) return await w?.flush(), t.result.action === `done` && await E.writer.close().catch(() => {}), t.result;
			C = t.session, A = t.stepInput;
		}
		await prepareDefinitions(C);
		try {
			await publishAdmission(L);
		} catch (e) {
			if (!isTurnCancellation(e)) throw await w?.flush(), e;
		}
		let z = d.settings.modelCallsPerStep ?? 1;
		let B = s.get(CapabilitiesKey);
		let runHarnessStep = async (r, i, a, o) => createExecutionNodeStep({
			steeringSignal: e.steeringSignal,
			abortSignal: O,
			capabilities: B,
			clearOnly: e.input?.control === `clear`,
			compactOnly: e.input?.control === `compact`,
			controlDelivery: e.input?.controlDelivery,
			createRuntime: n.createRuntime,
			handleEvent,
			signInCompletions: a,
			typedAnswers: !hasDelegatedSessionContext(e.serializedContext),
			instrumentation: w,
			modelResolutionScope: {
				moduleMap: f.moduleMap,
				nodeId: f.nodeId
			},
			agent: d,
			node: c,
			sessionUsageLimit: p,
			setAttributes: async (e) => {
				recordPendingUsage(t, e), o && writePendingUsage(t, n);
			}
		})(r, i);
		let V;
		let H;
		try {
			if (e.recover?.stopped === !0) throw new TurnCancelledError();
			throwIfTurnAborted(O), H = await runModelCallBatch({
				steeringSignal: e.steeringSignal,
				initialInput: A,
				initialSession: C,
				modelCallsPerStep: z,
				runStep: async ({ firstCall: r, lastCall: i, session: a, stepInput: o }) => {
					let c = await runStep(s, a, async (a) => {
						r && e.input?.control === void 0 && startSessionPrewarmers(s, `turn`), s.setVirtualContext(HandleEventKey, handleEvent), r && F && s.setVirtualContext(DeferCallerSteeredClearKey, !0), n.deliver !== void 0 && s.setVirtualContext(ResumeSignInKey, signInDelivery(n.deliver));
						let c = s.get(ToolStubsKey);
						c !== void 0 && s.setVirtualContext(ToolStubPlaybackKey, toolStubPlayback(n.toolStubs, c)), s.setVirtualContext(ToolChannelKey, {
							channel: channelOf(s),
							to: createToolChannelTo({
								createRuntime: n.createRuntime,
								delegated: hasDelegatedSessionContext(e.serializedContext),
								loadAgent: () => d
							})
						});
						let l = r && A?.outputSchema !== void 0 ? {
							...a,
							outputSchema: A.outputSchema
						} : a;
						await installDefinitions(s);
						let u = r && m !== void 0 ? m.map(({ challenge: e }) => e) : void 0;
						let f = await runHarnessStep(l, o, u, i);
						return canContinueModelCallBatch({
							lastCall: i,
							steeringSignal: e.steeringSignal,
							result: f,
							projection: currentProjection(s)
						}) || writePendingUsage(t, n), await E.finish({ announce: stoppedForPerson(f) }), f;
					}, { drain: E.drain });
					c.settledTurn === void 0 && throwIfTurnAborted(O);
					let l = {
						...c,
						session: saveSessionProjection(c.session, s)
					};
					return recordAppliedSession(s, l.session), V = {
						result: l,
						serializedContext: serializeContext(s)
					}, l;
				}
			});
		} catch (r) {
			if (writePendingUsage(t, n), !isTurnCancellation(r) && !O.aborted) throw await w?.flush(), r;
			return V === void 0 && await consumeCancelledInput(), await E.drain(), createCancelledModelCallBatchResult({
				beforeBatchContext: e.serializedContext,
				checkpoint: V,
				ctx: s,
				initialSession: C,
				sandboxIdleTimeoutMs: await sandboxIdleTimeoutMs(V?.result.session ?? C),
				stepInput: A
			});
		}
		writePendingUsage(t, n), await E.drain();
		let U = saveSessionProjection(dropClosedRecords(reconcileSessionContinuationToken(s, H.session), currentProjection(s)), s);
		pruneAgentTraceState(s, U.sessionId, U.state), dropClosedSignInResults(s);
		let W = serializeContext(s);
		H = {
			...H,
			session: U
		};
		let G = resolveSessionStepResult(H, W);
		if (checksSessionEvents()) {
			let e = stepDisagreement(G, currentProjection(s).view);
			e !== void 0 && e !== `dispatch-deferred` && log$1.warn(`a turn step's decision disagrees with the session's tables`, { disagreement: e });
		}
		return G.action === `done` && await E.writer.close(), b ? {
			...G,
			compacted: !0
		} : G;
	} finally {
		await E.release();
	}
}
function dropClosedSignInResults(e) {
	let t = e.get(PendingAuthorizationResultKey);
	if (t === void 0) return;
	let { interactions: n } = currentProjection(e).view;
	let r = t.filter((e) => n[signInInteractionId(e)]?.status === `open`);
	r.length !== t.length && (e.delete(PendingAuthorizationResultKey), r.length > 0 && e.set(PendingAuthorizationResultKey, r));
}
function stoppedForPerson(e) {
	return e.held === void 0 ? e.next === null && e.settledTurn === void 0 : e.held.kind === `request`;
}
function ignoreTurnCancellation(e) {
	if (!isTurnCancellation(e)) throw e;
}
function setSteeredBy(e, t) {
	t.length === 0 ? e.delete(SteeredByKey) : e.set(SteeredByKey, t);
}
function ownSignInAnswer(e, t, n) {
	let r = signInInteractionId(t);
	let i = e.interactions[r]?.request.signIn;
	let a = n.params.error;
	if (!(i === void 0 || a !== void 0 && a !== "access_denied")) return {
		interactionId: r,
		outcome: a === void 0 ? `accepted` : `declined`,
		signIn: i
	};
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/attributes/emit.js
let WARNED_ABOUT_TAG_FAILURE = !1;
async function setEveAttributes(e) {
	let t = normalizeEveAttributes(e);
	if (Object.keys(t).length !== 0) try {
		let { setAttributes: e } = await import("file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@workflow/core/index.js");
		await e(t, { allowReservedAttributes: !0 });
	} catch (e) {
		if (isTerminalRunAttributeError(e)) return;
		WARNED_ABOUT_TAG_FAILURE || (WARNED_ABOUT_TAG_FAILURE = !0, console.warn(`[eve] setEveAttributes failed; suppressing further warnings this process.`, {
			keys: Object.keys(t),
			error: e.message
		}));
	}
}
function isTerminalRunAttributeError(e) {
	return e instanceof Error && e.message.startsWith(`Cannot set attributes on run in terminal state`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-host/turn-step.js
function workflowStepHost() {
	let e;
	try {
		let t = getWorkflowMetadata();
		typeof t.url == `string` && (e = resolveWorkflowCallbackBaseUrl(t.url));
	} catch {}
	return {
		callbackBaseUrl: e,
		createRuntime: createWorkflowRuntime,
		setAttributes: setEveAttributes,
		toolStubs: workflowToolStubs,
		deliver: (e, t) => workflowHost.deliver(e, t)
	};
}
async function turnStep(e) {
	return e.handover !== void 0 && traceSessionHandover(`inbox_unblocked`, e.sessionState.sessionId, e.handover.attemptKey, {
		"eve.handoff.buffered_payload_count": e.handover.payloadCount,
		"eve.handoff.applied_at_ms": e.handover.appliedAtMs,
		"eve.handoff.applied_at_clock": `workflow`
	}), await turnStepOn(workflowStepHost())(e);
}
registerStepFunction("step//eve@1.4.0//turnStep", turnStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/events/dispatch-step.js
function resolveBinding(e, t) {
	let n = requireCompiledBundle(e).resolvedAgent.connections.find((e) => e.connectionName === t.connectionName);
	let r = n?.experimental_events;
	if (n === void 0 || r === void 0 || t.instanceId !== n.instanceId || r.connector !== t.connector) return;
	let i = resolveConnectionPrincipalFromAuth(t.connectionName, r.authorization, t.auth);
	if (principalKey(i) === t.principalKey) return {
		binding: t,
		connection: n,
		events: r,
		principal: i
	};
}
function accepts(e, t) {
	let { delivery: n } = t;
	return t.connectionName === e.connectionName && !(`event` in n && n.event.name !== e.request.name);
}
async function dispatchConnectionEventStep(e) {
	let t = await deserializeContext(e.serializedContext);
	let { delivery: n } = e.payload;
	let r = accepts(e.binding, e.payload) ? resolveBinding(t, e.binding) : void 0;
	if (r === void 0) return;
	let { binding: i, connection: a } = r;
	let o = requireCompiledBundle(t);
	let { callbacks: s } = r.events;
	t.setVirtualContext(AuthKey, i.auth);
	let c = `event` in n ? `onEvent` : n.control.type === `gap` ? `onGap` : `onTerminated`;
	await withConnectionEventSpan({
		ctx: t,
		connectionName: a.connectionName,
		operation: c,
		bindingId: i.id,
		subscriptionId: n.subscriptionId,
		deliveryId: n.deliveryId,
		requestTraceContext: e.payload.requestTraceContext
	}, async (e) => {
		let t = {
			auth: i.auth,
			deliveryId: n.deliveryId,
			origin: {
				sessionId: i.sessionId,
				connectionName: i.connectionName,
				subscriptionId: n.subscriptionId
			},
			attachSession: createAttachSessionFn(createWorkflowRuntime({ compiledArtifactsSource: o.compiledArtifactsSource }), {
				turnPolicy: `queue`,
				channelKind: `mcp-events`,
				channelName: i.connectionName,
				requestId: n.deliveryId,
				requestTraceContext: e
			})
		};
		`event` in n ? await s.onEvent({
			...t,
			event: n.event
		}) : n.control.type === `gap` ? await s.onGap?.({
			...t,
			cursor: n.control.cursor,
			truncated: n.control.truncated
		}) : await s.onTerminated?.({
			...t,
			error: n.control.error
		});
	}), `control` in n && n.control.type === `terminated` && await retireConnectionEventOwner(i.id);
}
registerStepFunction("step//eve@1.4.0//dispatchConnectionEventStep", dispatchConnectionEventStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/runtime/connections/events/lifecycle-step.js
async function openConnectionEventStep(e) {
	let t = createHash(`sha256`).update(JSON.stringify([e.binding.id, getWorkflowMetadata().workflowRunId])).digest(`hex`);
	let n = await subscribeConnectionEvent(e.serializedContext, e.binding, t);
	return await publishOutcome(n), n;
}
async function subscribeConnectionEvent(e, t, n) {
	let r = await deserializeContext(e);
	let i = resolveBinding(r, t);
	if (i === void 0) return { error: `This connection no longer accepts the subscription's binding.` };
	let { connection: a } = i;
	try {
		let e = await withConnectionEventSpan({
			ctx: r,
			connectionName: a.connectionName,
			bindingId: t.id,
			operation: `subscribe`
		}, async () => (await createAdapter(i)).subscribe({
			...t.request,
			idempotencyKey: n,
			options: { timeout: 3e4 }
		}));
		return { subscription: structuredClone(e) };
	} catch (e) {
		let t = readHttpStatus(e);
		if (t === void 0 || !isRefusal(t)) throw e;
		return {
			error: e instanceof Error ? e.message : String(e),
			status: t
		};
	}
}
async function unsubscribeConnectionEventStep(e) {
	let t = await deserializeContext(e.serializedContext);
	let n = resolveBinding(t, e.binding);
	if (n === void 0) return `pending`;
	try {
		return (await withConnectionEventSpan({
			ctx: t,
			connectionName: n.connection.connectionName,
			bindingId: e.binding.id,
			subscriptionId: e.subscriptionId,
			operation: `unsubscribe`
		}, async () => (await createAdapter(n)).unsubscribe({
			id: e.subscriptionId,
			options: { timeout: 3e4 }
		}))).cleanupStatus === `pending` ? `pending` : `done`;
	} catch (e) {
		let t = readHttpStatus(e);
		return t === 404 || t === 410 ? `done` : `pending`;
	}
}
async function startConnectionEventDeliveryStep(e) {
	await startConnectionEventDeliveryRun(e);
}
function createAdapter({ connection: e, principal: t, events: n }) {
	return n.backend.createAdapter({
		principal: t,
		connection: { url: e.url },
		destination: { path: connectionEventDestination(e.connectionName) }
	});
}
function isRefusal(e) {
	return e >= 400 && e < 500 && e !== 408 && e !== 429;
}
async function publishConnectionEventOutcomeStep(e) {
	await publishOutcome(e);
}
async function publishOutcome(e) {
	let t = getWritable({ namespace: "eve.connection-event.subscription" }).getWriter();
	try {
		await t.write(e);
	} finally {
		t.releaseLock();
	}
}
registerStepFunction("step//eve@1.4.0//openConnectionEventStep", openConnectionEventStep);
registerStepFunction("step//eve@1.4.0//unsubscribeConnectionEventStep", unsubscribeConnectionEventStep);
registerStepFunction("step//eve@1.4.0//startConnectionEventDeliveryStep", startConnectionEventDeliveryStep);
registerStepFunction("step//eve@1.4.0//publishConnectionEventOutcomeStep", publishConnectionEventOutcomeStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/subagents/event-proxy-step.js
async function runProxySubagentEventStep(e) {
	return await withSessionStateDelta(e, async (e) => emitProxiedSubagentEvent({
		...await restoreSessionStep(e),
		workflowAsk: e.workflowAsk,
		runId: e.runId,
		hookPayload: e.hookPayload
	}));
}
async function emitProxiedSubagentEvent(e) {
	let { hookPayload: t, runId: n, workflowAsk: r } = e;
	let { sessionId: i } = e.durableSession;
	let a = sessionSignInCallbacks(i);
	let o = a === void 0 ? void 0 : ownCallbacks(i, a.callbackBaseUrl);
	if (a !== void 0 && o !== void 0) {
		let n = storedProjection(e.durableSession.state).view;
		await settleSignIns(signInDelivery(a.deliver), [...relayedAnswers(n, t).flatMap((e) => signInsAnswered(n, e, o)), ...relayedEndings(n, t).flatMap((e) => signInsEnded(n, e, o))]);
	}
	return await commitSessionStep(e, (i) => [relay(i, {
		callsBack: o === void 0 ? void 0 : callsBackFor(o),
		payload: t,
		relays: readHitlState(e.durableSession.state).relays,
		runId: n,
		workflowAsk: r
	})], {
		origin: `relayed`,
		inputSource: t.route === void 0 ? void 0 : JSON.stringify([t.route.childContinuationToken, t.route.inputSource ?? null])
	});
}
function relayedAnswers(e, t) {
	return t.events.flatMap((n) => {
		if (n.type !== `interaction.settled`) return [];
		let { interactionId: r, outcome: i } = n.data;
		if (i !== `accepted` && i !== `declined`) return [];
		let a = relayedMirror(e, t, r);
		let o = a?.request.signIn;
		return a?.status !== `open` || o === void 0 ? [] : [{
			interactionId: r,
			outcome: i,
			signIn: o
		}];
	});
}
function relayedEndings(e, t) {
	return t.events.flatMap((n) => {
		if (n.type !== `interaction.settled`) return [];
		let { interactionId: r, outcome: i } = n.data;
		if (i === `accepted` || i === `declined`) return [];
		let a = relayedMirror(e, t, r);
		return a?.status !== `open` || a.request.signIn === void 0 ? [] : [{
			interactionId: r,
			reason: n.data.reason ?? i
		}];
	});
}
registerStepFunction("step//eve@1.4.0//runProxySubagentEventStep", runProxySubagentEventStep);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/stranded-replay-guard.js
const log = createLogger(`execution.session-inbox.stranded-replay-guard`);
const STRANDED_RUNS = {
	["workflowEntry"]: `session`,
	["turnWorkflow"]: `session`,
	["workflowToolRunWorkflow"]: `retire`,
	["connectionEventWorkflow"]: `retire`,
	["sessionTimeoutWorkflow"]: `replay`,
	["connectionEventDeliveryWorkflow"]: `replay`
};
function guardStrandedSessionReplay(e) {
	if (routesToOwnerDeployment(e)) return e;
	let { name: t } = resolveInstalledPackageInfo();
	let n = /* @__PURE__ */ new Map();
	for (let [e, r] of Object.entries(STRANDED_RUNS)) r !== `replay` && n.set(`workflow//${t}//${e}`, r);
	let r = e.createQueueHandler.bind(e);
	return e.createQueueHandler = (t, i) => r(t, async (r, a) => {
		let o = n.get(a.queueName.slice(t.length));
		let s = readRunId(r);
		if (!(o !== void 0 && s !== void 0 && await skipRetiredRun(e, s, o))) return await i(r, a);
	}), e;
}
async function skipRetiredRun(e, t, n) {
	let r = await readRetiredRun(e, t);
	if (r === void 0) return !1;
	switch (strandedReplayAction(r, n)) {
		case `replay`: return !1;
		case `retire`: return await retireRun(e, r), !0;
		case `park`: return logParkedSession(r), !0;
	}
}
function strandedReplayAction(e, t) {
	return e.status !== `pending` && e.status !== `running` ? `replay` : t === `retire` || e.attributes["$eve.type"] === `subagent` ? `retire` : `park`;
}
async function readRetiredRun(e, t) {
	try {
		return await findRetiredOwnerRun(e, t);
	} catch (e) {
		if (isRunMissing(e)) return;
		throw e;
	}
}
async function retireRun(e, t) {
	try {
		await (0, runtime_exports.cancelRun)(e, t.runId, { cancelReason: `Run retired: its eve deployment is no longer available` });
	} catch (e) {
		if (!isRunInactive(e)) throw e;
	}
	log.warn(`Retired stranded run`, {
		runId: t.runId,
		workflowName: t.workflowName,
		previousEveVersion: t.attributes["$eve.version"] ?? `unknown`,
		currentEveVersion: resolveInstalledPackageInfo().version
	});
}
function logParkedSession(e) {
	log.warn(`Skipping replay of stranded session run "${e.runId}" (owner eve ${e.attributes["$eve.version"] ?? `unknown`}, current ${resolveInstalledPackageInfo().version}). It remains active until an ordinary channel message, an explicit reset, or its session timeout ends it.`);
}
function readRunId(e) {
	if (typeof e != `object` || !e || `__healthCheck` in e) return;
	let t = e.runId;
	return typeof t == `string` && t.length > 0 ? t : void 0;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/world-compatibility.js
const WORKFLOW_COMPATIBILITY_PACKAGES = [`@workflow/core`, `@workflow/world`];
function parseVersionLine(e) {
	let t = /(\d+)\.(?:\d+|x|\*)(?:\.(?:\d+|x|\*))?(?:-([0-9A-Za-z.-]+))?/.exec(e.trim());
	if (t === null) return;
	let n = Number(t[1]);
	if (!Number.isInteger(n)) return;
	let r = t[2];
	return {
		major: n,
		prereleaseTag: r === void 0 ? void 0 : r.split(`.`)[0]
	};
}
function readDeclaredWorkflowDependency(e) {
	for (let t of WORKFLOW_COMPATIBILITY_PACKAGES) {
		let n = e.dependencies?.[t] ?? e.peerDependencies?.[t];
		if (typeof n == `string` && n.trim().length > 0) return {
			packageName: t,
			range: n
		};
	}
}
function isDefiniteLineMismatch(e, t) {
	return e.major !== t.major || e.prereleaseTag !== void 0 && t.prereleaseTag !== void 0 && e.prereleaseTag !== t.prereleaseTag;
}
function formatExpectedLine(e) {
	return e.prereleaseTag === void 0 ? `${String(e.major)}.x` : `${String(e.major)}.0.0-${e.prereleaseTag} line`;
}
function assertWorkflowWorldCompatibility(e) {
	let t = readDeclaredWorkflowDependency(e.worldManifest);
	if (t === void 0) return;
	let n = parseVersionLine(t.range);
	let r = parseVersionLine(e.expectedWorkflowVersion);
	if (n === void 0 || r === void 0 || !isDefiniteLineMismatch(n, r)) return;
	let i = n.prereleaseTag === void 0 ? `${String(n.major)}.x` : `${String(n.major)}.x (${n.prereleaseTag} line)`;
	throw Error(`Configured Workflow world "${e.worldPackageName}" targets ${t.packageName} ${i}, but this eve release requires the ${t.packageName} ${formatExpectedLine(r)}. Install a matching world, e.g. \`pnpm add ${e.worldPackageName}@${e.expectedWorkflowVersion}\`.`);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/workflow/validate-world.js
function validateWorkflowWorld(e) {
	if (assertConfiguredWorldCompatibility(e.packageName), !isWorkflowWorld(e.world)) throw Error(`Configured Workflow world factory did not return a valid World.`);
}
function assertConfiguredWorldCompatibility(e) {
	if (e === void 0) return;
	let t = resolveExpectedWorkflowVersion();
	if (t === void 0) return;
	let n;
	try {
		let t = createRequire(import.meta.url).resolve(`${e}/package.json`);
		n = JSON.parse(readFileSync(t, `utf8`));
	} catch {
		return;
	}
	assertWorkflowWorldCompatibility({
		expectedWorkflowVersion: t,
		worldManifest: n,
		worldPackageName: e
	});
}
function isWorkflowWorld(e) {
	return typeof e == `object` && !!e && `createQueueHandler` in e && typeof e.createQueueHandler == `function` && `events` in e && typeof e.events == `object` && e.events !== null && `specVersion` in e && typeof e.specVersion == `number`;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/install-workflow-world.js
async function installWorkflowWorld(e) {
	validateWorkflowWorld(e);
	let t = guardStrandedSessionReplay(e.world);
	setWorld(t), await (0, runtime_exports.getWorld)(), installedWorld = t, await t.start?.();
}
let installedWorld;
async function closeWorkflowWorld() {
	let e = installedWorld;
	if (installedWorld = void 0, e?.close === void 0) return;
	let t;
	let n = new Promise((e) => {
		t = setTimeout(() => {
			console.error(`[eve] Workflow world close timed out; continuing shutdown.`), e();
		}, 5e3), t.unref?.();
	});
	try {
		await Promise.race([e.close(), n]);
	} catch (e) {
		console.error(`[eve] failed to close the Workflow world: ${toErrorMessage(e)}`);
	} finally {
		clearTimeout(t);
	}
}
export { closeWorkflowWorld, installWorkflowWorld };

//# sourceMappingURL=eve72.mjs.map