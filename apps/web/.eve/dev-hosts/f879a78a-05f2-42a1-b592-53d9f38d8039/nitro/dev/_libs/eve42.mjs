import "./eve32.mjs";
import { WORKFLOW_TOOL_ENTRY_POINTS } from "./eve5.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/workflow-definition.js
const WORKFLOW_TOOL_BRAND = Symbol.for(`eve:workflow-tool-brand`);
function isWorkflowToolDefinition(e) {
	return typeof e == `object` && !!e && Reflect.get(e, WORKFLOW_TOOL_BRAND) === !0;
}
function readWorkflowToolEntryPoints(e) {
	return WORKFLOW_TOOL_ENTRY_POINTS.filter((t) => Reflect.get(e, t) !== void 0);
}
export { isWorkflowToolDefinition, readWorkflowToolEntryPoints };

//# sourceMappingURL=eve42.mjs.map