import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/discover/diagnostics.js
const discoverDiagnosticSeveritySchema = z.union([z.literal(`error`), z.literal(`warning`)]);
z.object({
	code: z.string(),
	message: z.string(),
	severity: discoverDiagnosticSeveritySchema,
	sourcePath: z.string()
}).strict();
const discoverDiagnosticsSummarySchema = z.object({
	errors: z.number().finite(),
	warnings: z.number().finite()
}).strict();
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/web-search.js
const WEB_SEARCH_FALLBACK_PROVIDERS = [
	`exa`,
	`parallel`,
	`browserbase`,
	`tako`
];
const WEB_SEARCH_PROVIDERS = [...WEB_SEARCH_FALLBACK_PROVIDERS, `native`];
export { WEB_SEARCH_FALLBACK_PROVIDERS, WEB_SEARCH_PROVIDERS, discoverDiagnosticsSummarySchema };

//# sourceMappingURL=eve7.mjs.map