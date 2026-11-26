import "./eve12.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/key.js
const KEY_REGISTRY_GLOBAL_KEY = Symbol.for(`eve.context-key-registry`);
const globalKeyRegistryContainer = globalThis;
globalKeyRegistryContainer[KEY_REGISTRY_GLOBAL_KEY] === void 0 && (globalKeyRegistryContainer[KEY_REGISTRY_GLOBAL_KEY] = /* @__PURE__ */ new Map());
const keyRegistry = globalKeyRegistryContainer[KEY_REGISTRY_GLOBAL_KEY];
var ContextKey = class {
	name;
	codec;
	constructor(e, t = {}) {
		this.name = e, this.codec = t.codec;
		let n = keyRegistry.get(e);
		if (n !== void 0 && n.codec === void 0 != (this.codec === void 0)) throw Error(`ContextKey name collision: "${e}" is already registered ${n.codec ? `with` : `without`} a codec, but a key ${this.codec ? `with` : `without`} a codec is being registered under the same name. This silently breaks context serialization — use a distinct name.`);
		keyRegistry.set(e, this);
	}
};
function resolveKey(e) {
	return keyRegistry.get(e);
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tool-stubs/types.js
const stubResponseNamespace = (e) => `eve.tool-stubs.${e}`;
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/keys.js
const AuthKey = new ContextKey(`eve.auth`);
const ToolStubsKey = new ContextKey("eve.toolStubs");
const InitiatorAuthKey = new ContextKey(`eve.initiatorAuth`);
const SteeredByKey = new ContextKey(`eve.steeredBy`);
const DeferCallerSteeredClearKey = new ContextKey(`eve.deferCallerSteeredClear`);
const SessionIdKey = new ContextKey(`eve.sessionId`);
const ConversationIdKey = new ContextKey(`eve.conversationId`);
const SessionInboxKey = new ContextKey("eve.sessionInbox");
const ContinuationTokenKey = new ContextKey(`eve.continuationToken`);
const ContinuationHookTokensKey = new ContextKey(`eve.continuationHookTokens`);
const ChannelRequestIdKey = new ContextKey(`eve.channelRequestId`);
const LocalDevRequestKey = new ContextKey(`eve.internal.localDevRequest`);
const OccurrenceIdKey = new ContextKey(`eve.scheduleOccurrenceId`);
const ScheduleIdKey = new ContextKey(`eve.scheduleId`);
const ScheduleInstanceKey = new ContextKey(`eve.scheduleInstance`);
const SessionTitleKey = new ContextKey(`eve.sessionTitle`);
const ChannelDeliveryKey = new ContextKey(`eve.channelDelivery`);
const TurnDeliveryIdsKey = new ContextKey(`eve.turnDeliveryIds`);
const HistoryStateKey = new ContextKey(`eve.historyState`);
const ChannelInstrumentationKey = new ContextKey(`eve.channelInstrumentation`);
const ParentSessionKey = new ContextKey(`eve.parentSession`);
const SessionPredecessorKey = new ContextKey(`eve.sessionPredecessor`);
const TraceRootKey = new ContextKey(`eve.traceRoot`);
const ParentTraceContextKey = new ContextKey(`eve.parentTraceContext`);
const SessionTraceSeedKey = new ContextKey(`eve.sessionTraceSeed`);
const OtelTraceEnabledKey = new ContextKey(`eve.otelTraceEnabled`);
const CapabilitiesKey = new ContextKey(`eve.capabilities`);
const SessionCallbackKey = new ContextKey("eve.sessionCallback");
const EarlierRemoteCallerKey = new ContextKey("eve.earlierRemoteCaller");
const SessionKey = new ContextKey(`eve.session`);
const SandboxKey = new ContextKey(`eve.sandbox`);
const SandboxTerminalCleanupKey = new ContextKey(`eve.internal.sandboxTerminalCleanup`);
const HandleEventKey = new ContextKey(`eve.internal.handleEvent`);
const ToolChannelKey = new ContextKey(`eve.internal.toolChannel`);
const DynamicSubagentAgentConfigKey = new ContextKey(`eve.dynamicSubagentAgentConfig`);
const AgentSessionRuntimeOverridesKey = new ContextKey(`eve.agentSessionRuntimeOverrides`);
const DynamicSkillSandboxKey = new ContextKey(`eve.dynamicSkillSandbox`);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/context/container.js
const EVE_CONTEXT_STORAGE_KEY = Symbol.for(`eve.context-storage`);
var ContextContainer = class {
	_durableValues = /* @__PURE__ */ new Map();
	_virtualValues = /* @__PURE__ */ new Map();
	constructor(e) {
		let t = e !== void 0 && Object.hasOwn(e, `localDevRequest`) ? e.localDevRequest : contextStorage.getStore()?.localDevRequest;
		t !== void 0 && this._durableValues.set(LocalDevRequestKey.name, t);
	}
	get localDevRequest() {
		return this.get(LocalDevRequestKey);
	}
	get(e) {
		return this._virtualValues.has(e.name) ? this._virtualValues.get(e.name) : this._durableValues.get(e.name);
	}
	require(e) {
		if (!this.has(e)) throw Error(`Context key "${e.name}" is not set.`);
		return this.get(e);
	}
	has(e) {
		return this._virtualValues.has(e.name) || this._durableValues.has(e.name);
	}
	set(e, t) {
		let n = typeof t == `function` ? t(this.get(e)) : t;
		return this._durableValues.set(e.name, n), n;
	}
	ensure(e, t) {
		return this.has(e) ? this.require(e) : this.set(e, t());
	}
	delete(e) {
		let t = this._durableValues.delete(e.name);
		let n = this._virtualValues.delete(e.name);
		return t || n;
	}
	clearVirtualContext() {
		this._virtualValues.clear();
	}
	setVirtualContext(e, t) {
		this._virtualValues.set(e.name, t);
	}
	*entries() {
		for (let [e, t] of this._durableValues) {
			let n = resolveKey(e);
			n !== void 0 && (yield [n, t]);
		}
	}
};
const globalContextStorage = globalThis;
globalContextStorage[EVE_CONTEXT_STORAGE_KEY] === void 0 && (globalContextStorage[EVE_CONTEXT_STORAGE_KEY] = new AsyncLocalStorage());
const storage = globalContextStorage[EVE_CONTEXT_STORAGE_KEY];
const contextStorage = {
	getStore: () => storage.getStore()?.context,
	run: (e, t) => storage.run({ context: e }, t)
};
function contextScopeValue(e) {
	return storage.getStore()?.values?.get(e);
}
function withContextScopeValue(e, t, n) {
	let r = storage.getStore();
	let i = new Map(r?.values);
	return i.set(e, t), storage.run({
		context: r?.context,
		values: i
	}, n);
}
function loadContext() {
	let e = contextStorage.getStore();
	if (e === void 0) throw Error(`No active eve context. Call this function only from code eve runs, such as tools, hooks, channel handlers, and model callbacks.`);
	return e;
}
export { AgentSessionRuntimeOverridesKey, AuthKey, CapabilitiesKey, ChannelDeliveryKey, ChannelInstrumentationKey, ChannelRequestIdKey, ContextContainer, ContextKey, ContinuationHookTokensKey, ContinuationTokenKey, ConversationIdKey, DeferCallerSteeredClearKey, DynamicSkillSandboxKey, DynamicSubagentAgentConfigKey, EarlierRemoteCallerKey, HandleEventKey, HistoryStateKey, InitiatorAuthKey, LocalDevRequestKey, OccurrenceIdKey, OtelTraceEnabledKey, ParentSessionKey, ParentTraceContextKey, SandboxKey, SandboxTerminalCleanupKey, ScheduleIdKey, ScheduleInstanceKey, SessionCallbackKey, SessionIdKey, SessionInboxKey, SessionKey, SessionPredecessorKey, SessionTitleKey, SessionTraceSeedKey, SteeredByKey, ToolChannelKey, ToolStubsKey, TraceRootKey, TurnDeliveryIdsKey, contextScopeValue, contextStorage, loadContext, resolveKey, stubResponseNamespace, withContextScopeValue };

//# sourceMappingURL=eve13.mjs.map