import "./eve4.mjs";
import "./eve3.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/workflow-references.js
const STABLE_ID_BASE = "eve";
const workflowEntryReference = { workflowId: `workflow//${STABLE_ID_BASE}//workflowEntry` };
const sessionTimeoutWorkflowReference = { workflowId: `workflow//${STABLE_ID_BASE}//sessionTimeoutWorkflow` };
const workflowToolRunWorkflowReference = { workflowId: `workflow//${STABLE_ID_BASE}//workflowToolRunWorkflow` };
const connectionEventWorkflowReference = { workflowId: `workflow//${STABLE_ID_BASE}//connectionEventWorkflow` };
const connectionEventDeliveryWorkflowReference = { workflowId: `workflow//${STABLE_ID_BASE}//connectionEventDeliveryWorkflow` };
export { connectionEventDeliveryWorkflowReference, connectionEventWorkflowReference, sessionTimeoutWorkflowReference, workflowEntryReference, workflowToolRunWorkflowReference };

//# sourceMappingURL=eve55.mjs.map