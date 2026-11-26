import { cause, conforming, envelopeOf, errorInfo, id, jsonValue, known, valueReference } from "./eve27.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/call.js
const owner = conforming()(z.union([
	z.object({ runId: id }),
	z.object({ callId: id }),
	z.object({ turnId: id })
]));
const clearedBySchema = conforming()(z.union([z.object({ policy: z.string() }), z.object({ interactionId: id })]));
const callSchemas = {
	"call.requested": envelopeOf(`call.requested`, conforming()(z.object({
		callId: id,
		capability: z.object({
			kind: known(),
			name: z.string(),
			remote: z.literal(!0).optional(),
			label: z.string().optional(),
			hidden: z.literal(!0).optional()
		}),
		input: jsonValue.optional(),
		inputError: errorInfo.optional(),
		inputRef: valueReference.optional(),
		owner
	}))),
	"call.settled": envelopeOf(`call.settled`, conforming()(z.object({
		callId: id,
		cause: cause.optional(),
		error: errorInfo.optional(),
		outcome: known(),
		output: jsonValue.optional(),
		outputOf: z.object({ callId: id }).optional(),
		outputRef: valueReference.optional(),
		reason: z.string().optional(),
		label: z.string().optional()
	}))),
	"call.started": envelopeOf(`call.started`, conforming()(z.object({
		callId: id,
		clearedBy: clearedBySchema.optional(),
		taskId: id.optional()
	})))
};
const callProgressSchemas = {
	"call.input": envelopeOf(`call.input`, conforming()(z.object({
		callId: id,
		delta: z.string(),
		kind: known().optional(),
		name: z.string().optional()
	}))),
	"call.progress": envelopeOf(`call.progress`, conforming()(z.object({
		callId: id,
		output: jsonValue,
		label: z.string().optional()
	})))
};
export { callProgressSchemas, callSchemas, clearedBySchema };

//# sourceMappingURL=eve45.mjs.map