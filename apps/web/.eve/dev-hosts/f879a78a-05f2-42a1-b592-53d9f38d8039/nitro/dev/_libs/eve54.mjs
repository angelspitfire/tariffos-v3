import { cause, conforming, envelopeOf, errorInfo, id, known } from "./eve27.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/session.js
const traceContext = z.object({
	spanId: z.string(),
	traceFlags: z.number().int(),
	traceId: z.string()
});
const sessionStartedData = conforming()(z.object({
	parent: z.object({
		callId: id,
		sessionId: id
	}).optional(),
	predecessor: z.object({ sessionId: id }).optional(),
	runtime: z.object({
		agentId: z.string(),
		agentName: z.string().optional(),
		build: z.object({
			deployedAt: z.string().optional(),
			gitBranch: z.string().optional(),
			gitSha: z.string().optional()
		}).optional(),
		eveVersion: z.string()
	}).optional(),
	trace: traceContext.optional()
}));
const sessionEndedData = conforming()(z.object({
	cause: cause.optional(),
	error: errorInfo.optional(),
	outcome: known()
}));
const sessionSchemas = {
	"session.ended": envelopeOf(`session.ended`, sessionEndedData),
	"session.started": envelopeOf(`session.started`, sessionStartedData)
};
export { sessionSchemas, traceContext };

//# sourceMappingURL=eve54.mjs.map