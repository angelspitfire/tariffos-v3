import { AGENT_WORKFLOW_RETENTION_VALUES, ANTHROPIC_PROMPT_CACHE_TTLS } from "./eve2.mjs";
import { WEB_SEARCH_FALLBACK_PROVIDERS, WEB_SEARCH_PROVIDERS, discoverDiagnosticsSummarySchema } from "./eve7.mjs";
import { jsonObjectSchema } from "./eve9.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/extension-mount.js
const mountIdSchema = z.string().min(1);
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/remote-agent-node.js
const compiledRemoteAgentNodeSchema = z.object({
	backing: z.object({
		kind: z.literal(`resource`),
		sourcePath: z.string()
	}).strict(),
	binding: z.object({
		backing: z.discriminatedUnion(`kind`, [z.object({
			externalDependencies: z.array(z.string()).readonly(),
			extensionScope: z.object({
				namespace: z.string(),
				sourceRoot: z.string()
			}).strict().optional(),
			kind: z.literal(`filesystem`),
			mountId: z.string().optional(),
			sourcePath: z.string()
		}).strict(), z.object({
			kind: z.literal(`programmatic`),
			mountId: z.string().optional(),
			moduleId: z.string(),
			registryId: z.string(),
			revision: z.string(),
			semanticRevision: z.string().optional()
		}).strict()]),
		logicalPath: z.string(),
		owner: z.discriminatedUnion(`kind`, [
			z.object({ kind: z.literal(`application`) }).strict(),
			z.object({
				feature: z.string(),
				kind: z.literal(`framework`)
			}).strict(),
			z.object({
				kind: z.literal(`extension`),
				mountId: mountIdSchema,
				namespace: z.string(),
				packageName: z.string()
			}).strict()
		]),
		usage: z.object({
			compile: z.boolean(),
			runtimeEntry: z.boolean()
		}).strict()
	}).strict(),
	description: z.string(),
	entryPath: z.string(),
	exportName: z.string().optional(),
	logicalPath: z.string(),
	name: z.string(),
	nodeId: z.string(),
	owner: z.discriminatedUnion(`kind`, [
		z.object({ kind: z.literal(`application`) }).strict(),
		z.object({
			feature: z.string(),
			kind: z.literal(`framework`)
		}).strict(),
		z.object({
			kind: z.literal(`extension`),
			mountId: mountIdSchema,
			namespace: z.string(),
			packageName: z.string()
		}).strict()
	]),
	parentNodeId: z.string(),
	path: z.string(),
	rootPath: z.string(),
	tool: z.union([z.boolean(), z.literal(`deferred`)]).optional(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`),
	url: z.string().optional()
}).strict();
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiler/manifest-schema.js
const agentSourceOwnerSchema = z.discriminatedUnion(`kind`, [
	z.object({ kind: z.literal(`application`) }).strict(),
	z.object({
		feature: z.string().min(1),
		kind: z.literal(`framework`)
	}).strict(),
	z.object({
		kind: z.literal(`extension`),
		mountId: mountIdSchema,
		namespace: z.string().min(1),
		packageName: z.string().min(1)
	}).strict()
]);
const moduleSourceRefSchema = z.object({
	exportName: z.string().optional(),
	sourceKind: z.literal(`module`),
	logicalPath: z.string(),
	sourceId: z.string()
}).strict();
const filesystemModuleBackingSchema = z.object({
	externalDependencies: z.array(z.string()).readonly(),
	extensionScope: z.object({
		namespace: z.string(),
		sourceRoot: z.string()
	}).strict().optional(),
	mountId: z.string().optional(),
	kind: z.literal(`filesystem`),
	sourcePath: z.string()
}).strict();
const programmaticModuleBackingSchema = z.object({
	kind: z.literal(`programmatic`),
	mountId: z.string().optional(),
	moduleId: z.string(),
	registryId: z.string(),
	revision: z.string(),
	semanticRevision: z.string().optional()
}).strict();
const resourceSourceBackingSchema = z.object({
	kind: z.literal(`resource`),
	sourcePath: z.string()
}).strict();
const agentModuleBackingSchema = z.discriminatedUnion(`kind`, [filesystemModuleBackingSchema, programmaticModuleBackingSchema]);
const compiledModuleBindingSchema = z.object({
	backing: agentModuleBackingSchema,
	logicalPath: z.string(),
	owner: agentSourceOwnerSchema,
	usage: z.object({
		compile: z.boolean(),
		runtimeEntry: z.boolean()
	}).strict()
}).strict();
const agentSourceDescriptorSchema = z.object({
	backing: z.discriminatedUnion(`kind`, [
		filesystemModuleBackingSchema,
		programmaticModuleBackingSchema,
		resourceSourceBackingSchema
	]),
	form: z.enum([`derived`, `direct`]),
	layer: z.enum([
		`framework-default`,
		`extension-package`,
		`extension-override`,
		`application`
	]),
	logicalPath: z.string(),
	owner: agentSourceOwnerSchema,
	sourceId: z.string()
}).strict();
const agentSourceCompositionSchema = z.object({ entries: z.array(z.discriminatedUnion(`kind`, [z.object({
	kind: z.literal(`shadowed`),
	source: agentSourceDescriptorSchema,
	winnerSourceId: z.string()
}).strict(), z.object({
	kind: z.literal(`disabled`),
	source: agentSourceDescriptorSchema
}).strict()])).readonly() }).strict();
const compiledDynamicModelDefinitionSchema = z.object({
	exportName: z.string().optional(),
	sourceKind: z.literal(`module`),
	logicalPath: z.string(),
	sourceId: z.string()
}).strict();
const channelMethodSchema = z.union([
	z.literal(`GET`),
	z.literal(`HEAD`),
	z.literal(`POST`),
	z.literal(`PUT`),
	z.literal(`PATCH`),
	z.literal(`DELETE`),
	z.literal(`OPTIONS`),
	z.literal(`WEBSOCKET`)
]);
const compiledChannelCorsSchema = z.object({
	origin: z.union([
		z.literal(`*`),
		z.literal(`null`),
		z.array(z.string())
	]).optional(),
	methods: z.union([z.literal(`*`), z.array(z.string())]).optional(),
	allowHeaders: z.union([z.literal(`*`), z.array(z.string())]).optional(),
	exposeHeaders: z.union([z.literal(`*`), z.array(z.string())]).optional(),
	credentials: z.boolean().optional(),
	maxAge: z.union([z.string(), z.literal(!1)]).optional(),
	preflight: z.object({ statusCode: z.number().int().min(100).max(599).optional() }).strict().optional()
}).strict();
const compiledVercelConnectMetadataSchema = z.object({
	connector: z.string(),
	requirement: z.object({
		method: z.string().optional(),
		reference: z.string(),
		service: z.string(),
		subjectTypes: z.array(z.enum([`app`, `user`])).readonly()
	}).strict().optional()
}).strict();
const compiledChannelDefinitionSchema = z.object({
	kind: z.literal(`channel`),
	name: z.string(),
	logicalPath: z.string(),
	method: channelMethodSchema,
	urlPath: z.string(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`),
	exportName: z.string().optional(),
	adapterKind: z.string().optional(),
	cors: compiledChannelCorsSchema.optional(),
	manifest: jsonObjectSchema.optional(),
	vercelConnect: compiledVercelConnectMetadataSchema.optional()
}).strict();
const compiledChannelPreflightDefinitionSchema = z.object({
	cors: compiledChannelCorsSchema,
	method: z.literal(`OPTIONS`),
	sourceIds: z.array(z.string()).readonly(),
	urlPath: z.string()
}).strict();
const compiledShadowedChannelRouteSchema = z.object({
	method: channelMethodSchema,
	source: agentSourceDescriptorSchema,
	urlPath: z.string(),
	winnerSourceId: z.string()
}).strict();
const compiledChannelRoutePlanSchema = z.object({
	effective: z.array(compiledChannelDefinitionSchema).readonly(),
	preflight: z.array(compiledChannelPreflightDefinitionSchema).readonly(),
	shadowed: z.array(compiledShadowedChannelRouteSchema).readonly()
}).strict();
const modelRoutingSchema = z.union([z.object({
	kind: z.literal(`gateway`),
	target: z.string(),
	byok: z.string().optional()
}).strict(), z.object({
	kind: z.literal(`external`),
	provider: z.string()
}).strict()]);
const compiledRuntimeModelReferenceSchema = z.object({
	contextWindowTokens: z.number().int().positive().optional(),
	id: z.string(),
	source: moduleSourceRefSchema.optional(),
	sourceField: z.literal(`compaction.model`).optional(),
	promptCache: z.object({ anthropic: z.object({ ttl: z.literal(ANTHROPIC_PROMPT_CACHE_TTLS).optional() }).strict().optional() }).strict().optional(),
	providerOptions: z.record(z.string(), jsonObjectSchema).optional(),
	routing: modelRoutingSchema
}).strict();
const compiledAgentBuildDefinitionSchema = z.object({ externalDependencies: z.array(z.string()).optional() }).strict();
const compiledAgentWorkflowWorldDefinitionSchema = z.string();
const compiledAgentWorkflowDefinitionSchema = z.object({
	modelCallsPerStep: z.number().int().positive().optional(),
	retention: z.literal(AGENT_WORKFLOW_RETENTION_VALUES).optional(),
	world: compiledAgentWorkflowWorldDefinitionSchema.optional()
}).strict();
const compiledAgentCompactionDefinitionSchema = z.object({
	model: compiledRuntimeModelReferenceSchema.optional(),
	thresholdPercent: z.number().finite().min(0).max(1).optional()
}).strict();
const sessionTimeoutSchema = z.union([z.number().int().positive(), z.literal(!1)]);
const compiledAgentLimitsDefinitionSchema = z.object({
	sessionTimeoutMs: sessionTimeoutSchema.optional(),
	sessionUsage: z.boolean().optional()
}).strict();
const compiledAgentConfigBaseFields = {
	approval: z.boolean().optional(),
	build: compiledAgentBuildDefinitionSchema.optional(),
	compaction: compiledAgentCompactionDefinitionSchema.optional(),
	defaultTools: z.boolean().optional(),
	description: z.string().optional(),
	experimental: z.object({ workflow: compiledAgentWorkflowDefinitionSchema.optional() }).strict().optional(),
	name: z.string(),
	reasoning: z.enum([
		`provider-default`,
		`none`,
		`minimal`,
		`low`,
		`medium`,
		`high`,
		`xhigh`
	]).optional(),
	source: moduleSourceRefSchema,
	tool: z.union([z.boolean(), z.literal(`deferred`)]).optional(),
	limits: compiledAgentLimitsDefinitionSchema.optional()
};
const compiledAgentConfigSchema = z.union([z.object({
	...compiledAgentConfigBaseFields,
	model: compiledRuntimeModelReferenceSchema
}).strict(), z.object({
	...compiledAgentConfigBaseFields,
	dynamicModel: compiledDynamicModelDefinitionSchema
}).strict()]);
const compiledInstructionsBaseFields = {
	content: z.string(),
	name: z.string(),
	logicalPath: z.string(),
	role: z.enum([`system`, `user`]),
	sourceId: z.string()
};
const compiledInstructionsSchema = z.discriminatedUnion(`sourceKind`, [z.object({
	...compiledInstructionsBaseFields,
	owner: agentSourceOwnerSchema,
	sourceKind: z.literal(`markdown`)
}).strict(), z.object({
	...compiledInstructionsBaseFields,
	sourceKind: z.literal(`module`)
}).strict()]);
const compiledSkillBaseFields = {
	name: z.string(),
	deferred: z.boolean().optional(),
	description: z.string(),
	license: z.string().optional(),
	content: z.string(),
	metadata: z.record(z.string(), z.string()).optional(),
	sourceId: z.string(),
	logicalPath: z.string()
};
const compiledSkillSourceSchema = z.discriminatedUnion(`sourceKind`, [
	z.object({
		...compiledSkillBaseFields,
		owner: agentSourceOwnerSchema,
		sourceKind: z.literal(`markdown`)
	}).strict(),
	z.object({
		...compiledSkillBaseFields,
		sourceKind: z.literal(`module`),
		exportName: z.string().optional()
	}).strict(),
	z.object({
		...compiledSkillBaseFields,
		owner: agentSourceOwnerSchema,
		sourceKind: z.literal(`skill-package`),
		skillId: z.string(),
		skillFilePath: z.string(),
		rootPath: z.string(),
		assetsPath: z.string().optional(),
		referencesPath: z.string().optional(),
		scriptsPath: z.string().optional()
	}).strict()
]);
const compiledScheduleBaseFields = {
	cron: z.string(),
	timezone: z.string().optional(),
	hasRun: z.boolean(),
	name: z.string(),
	logicalPath: z.string(),
	markdown: z.string().optional(),
	sourceId: z.string()
};
const compiledScheduleDefinitionSchema = z.discriminatedUnion(`sourceKind`, [z.object({
	...compiledScheduleBaseFields,
	owner: agentSourceOwnerSchema,
	sourceKind: z.literal(`markdown`)
}).strict(), z.object({
	...compiledScheduleBaseFields,
	sourceKind: z.literal(`module`)
}).strict()]);
const compiledScheduleCollectionDefinitionSchema = z.object({
	application: z.string(),
	description: z.string().optional(),
	logicalPath: z.string(),
	name: z.string(),
	providerKind: z.string(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`),
	namedScope: z.object({
		definition: z.string(),
		name: z.string()
	}).strict().optional(),
	tools: z.union([z.boolean(), z.literal(`deferred`)]).optional()
}).strict();
const compiledSandboxDefinitionSchema = z.object({
	providerName: z.string().optional(),
	environmentExportName: z.string().optional(),
	inheritsParent: z.boolean().optional(),
	exportName: z.string().optional(),
	logicalPath: z.string(),
	revisionHash: z.string(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`)
}).strict();
const compiledSandboxWorkspaceSchema = z.object({
	logicalPath: z.string(),
	rootEntries: z.array(z.string()).readonly(),
	sourceId: z.string(),
	sourcePath: z.string()
}).strict();
const compiledWorkspaceResourceRootSchema = z.object({
	contentHash: z.string().optional(),
	logicalPath: z.string(),
	rootEntries: z.array(z.string()).readonly()
}).strict();
const compiledConnectionDefinitionSchema = z.object({
	experimental_events: z.literal(!0).optional(),
	connectionName: z.string(),
	description: z.string(),
	exportName: z.string().optional(),
	logicalPath: z.string(),
	protocol: z.enum([`mcp`, `openapi`]).default(`mcp`),
	sourceId: z.string(),
	sourceKind: z.literal(`module`),
	url: z.string(),
	vercelConnect: compiledVercelConnectMetadataSchema.optional()
}).strict();
const compiledToolBehaviorSchema = z.object({
	availability: z.array(z.literal(`root-session`)).readonly(),
	handling: z.discriminatedUnion(`kind`, [
		z.object({
			action: z.literal(`self-agent`),
			kind: z.literal(`dispatch`)
		}).strict(),
		z.object({
			fallback: z.enum(WEB_SEARCH_FALLBACK_PROVIDERS).optional(),
			kind: z.literal(`provider-tool`),
			provider: z.enum(WEB_SEARCH_PROVIDERS)
		}).strict(),
		z.object({
			entryPoint: z.enum([
				`execute`,
				`task`,
				`serve`
			]),
			kind: z.literal(`workflow-tool`),
			workflowId: z.string()
		}).strict()
	]).optional(),
	shape: z.object({ suspend: z.enum([`none`, `workflow`]) }).strict().optional()
}).strict();
const compiledToolDefinitionSchema = z.object({
	availableInSubagents: z.boolean().optional(),
	behavior: compiledToolBehaviorSchema.optional(),
	deferred: z.boolean().optional(),
	description: z.string(),
	exportName: z.string().optional(),
	hasExecute: z.boolean(),
	hasModelOutputProjection: z.boolean(),
	inputSchema: jsonObjectSchema.nullable(),
	logicalPath: z.string(),
	modelInputSchema: jsonObjectSchema.optional(),
	name: z.string(),
	outputSchema: jsonObjectSchema.optional(),
	requiresApproval: z.boolean(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`),
	workflowProgram: z.object({ maxSubagents: z.number().int().positive() }).strict().optional()
}).strict();
const compiledDefinitionSchema = z.object({
	description: z.string().optional(),
	eventNames: z.array(z.string()).readonly().optional(),
	exportName: z.string().optional(),
	extensionNamespace: z.string().optional(),
	kind: z.enum([
		`connection`,
		`hook`,
		`instructions`,
		`memory`,
		`skill`,
		`tool`
	]),
	logicalPath: z.string(),
	slug: z.string(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`)
}).strict();
const compiledExtensionMountSchema = z.object({
	externalDependencies: z.array(z.string()).readonly(),
	namespace: z.string(),
	packageName: z.string(),
	specifier: z.string(),
	mountId: mountIdSchema,
	sourceRoot: z.string(),
	mountSourceId: z.string(),
	mountSourcePath: z.string(),
	mountLogicalPath: z.string(),
	programmaticImport: z.object({
		specifier: z.string(),
		entryPath: z.string(),
		config: jsonObjectSchema
	}).strict().optional()
}).strict();
const compiledAgentResourceFields = {
	agentRoot: z.string(),
	appRoot: z.string(),
	bindings: z.record(z.string(), compiledModuleBindingSchema),
	channelRoutes: compiledChannelRoutePlanSchema,
	connections: z.array(compiledConnectionDefinitionSchema),
	definitions: z.array(compiledDefinitionSchema),
	diagnosticsSummary: discoverDiagnosticsSummarySchema,
	sourceComposition: agentSourceCompositionSchema,
	extensionMounts: z.array(compiledExtensionMountSchema).default([]),
	sandbox: compiledSandboxDefinitionSchema,
	sandboxWorkspaces: z.array(compiledSandboxWorkspaceSchema),
	schedules: z.array(compiledScheduleDefinitionSchema),
	scheduleCollections: z.array(compiledScheduleCollectionDefinitionSchema).default([]),
	remoteAgents: z.array(compiledRemoteAgentNodeSchema),
	skills: z.array(compiledSkillSourceSchema).readonly(),
	instructions: z.array(compiledInstructionsSchema).readonly().default([]),
	tools: z.array(compiledToolDefinitionSchema),
	workspaceResourceRoot: compiledWorkspaceResourceRootSchema
};
const compiledAgentResourcesSchema = z.object(compiledAgentResourceFields).strict();
const compiledAgentNodeManifestSchema = z.object({
	...compiledAgentResourceFields,
	config: compiledAgentConfigSchema
}).strict();
const compiledSubagentNodeBaseFields = {
	backing: resourceSourceBackingSchema,
	entryPath: z.string(),
	logicalPath: z.string(),
	name: z.string(),
	nodeId: z.string(),
	owner: agentSourceOwnerSchema,
	parentNodeId: z.string(),
	rootPath: z.string(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`),
	exportName: z.string().optional()
};
const compiledDynamicSubagentDefinitionSchema = z.object({
	exportName: z.string().optional(),
	logicalPath: z.string(),
	sourceId: z.string(),
	sourceKind: z.literal(`module`)
}).strict();
const compiledSubagentNodeSchema = z.union([z.object({
	...compiledSubagentNodeBaseFields,
	agent: compiledAgentNodeManifestSchema,
	description: z.string()
}).strict(), z.object({
	...compiledSubagentNodeBaseFields,
	agent: compiledAgentResourcesSchema,
	configResolver: compiledDynamicSubagentDefinitionSchema
}).strict()]);
const compiledAgentManifestSchema = z.object({
	...compiledAgentResourceFields,
	config: compiledAgentConfigSchema,
	kind: z.literal("eve-agent-compiled-manifest"),
	subagents: z.array(compiledSubagentNodeSchema),
	version: z.literal(56)
}).strict();
export { agentModuleBackingSchema, agentSourceCompositionSchema, agentSourceDescriptorSchema, agentSourceOwnerSchema, channelMethodSchema, compiledAgentBuildDefinitionSchema, compiledAgentCompactionDefinitionSchema, compiledAgentConfigBaseFields, compiledAgentConfigSchema, compiledAgentLimitsDefinitionSchema, compiledAgentManifestSchema, compiledAgentNodeManifestSchema, compiledAgentResourceFields, compiledAgentResourcesSchema, compiledAgentWorkflowDefinitionSchema, compiledAgentWorkflowWorldDefinitionSchema, compiledChannelCorsSchema, compiledChannelDefinitionSchema, compiledChannelPreflightDefinitionSchema, compiledChannelRoutePlanSchema, compiledConnectionDefinitionSchema, compiledDefinitionSchema, compiledDynamicModelDefinitionSchema, compiledDynamicSubagentDefinitionSchema, compiledExtensionMountSchema, compiledInstructionsBaseFields, compiledInstructionsSchema, compiledModuleBindingSchema, compiledRuntimeModelReferenceSchema, compiledSandboxDefinitionSchema, compiledSandboxWorkspaceSchema, compiledScheduleBaseFields, compiledScheduleCollectionDefinitionSchema, compiledScheduleDefinitionSchema, compiledShadowedChannelRouteSchema, compiledSkillBaseFields, compiledSkillSourceSchema, compiledSubagentNodeBaseFields, compiledSubagentNodeSchema, compiledToolBehaviorSchema, compiledToolDefinitionSchema, compiledVercelConnectMetadataSchema, compiledWorkspaceResourceRootSchema, filesystemModuleBackingSchema, modelRoutingSchema, moduleSourceRefSchema, programmaticModuleBackingSchema, resourceSourceBackingSchema, sessionTimeoutSchema };

//# sourceMappingURL=eve.mjs.map