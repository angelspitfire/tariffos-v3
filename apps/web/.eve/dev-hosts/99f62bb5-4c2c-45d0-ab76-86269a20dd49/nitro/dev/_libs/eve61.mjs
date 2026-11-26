import { callProgressSchemas, callSchemas } from "./eve45.mjs";
import { cause, conforming, envelopeOf, errorInfo, id, jsonValue, known, principal, usage, userPart, valueReference } from "./eve27.mjs";
import { interactionSchemas } from "./eve56.mjs";
import { sessionSchemas, traceContext } from "./eve54.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/child.js
const childSchemas = {
	"child.opened": envelopeOf(`child.opened`, conforming()(z.object({
		name: z.string(),
		owner: z.union([z.object({ callId: id }), z.object({ taskId: id })]),
		sessionId: id,
		stream: z.string()
	}))),
	"child.sent": envelopeOf(`child.sent`, conforming()(z.object({
		callId: id,
		childDeliveryId: id,
		sessionId: id
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/content.js
const contentSchemas = { "content.completed": envelopeOf(`content.completed`, conforming()(z.object({
	fallbackText: z.string().optional(),
	interrupted: z.literal(!0).optional(),
	kind: z.string(),
	mediaType: z.string().optional(),
	partId: id,
	phase: z.string(),
	runId: id.optional(),
	value: jsonValue.optional(),
	valueRef: valueReference.optional()
}))) };
const contentProgressSchemas = { "content.delta": envelopeOf(`content.delta`, conforming()(z.object({
	delta: z.string(),
	kind: z.string().optional(),
	partId: id
}))) };
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/context.js
const contextSchemas = {
	"context.settled": envelopeOf(`context.settled`, conforming()(z.object({
		changeId: id,
		error: errorInfo.optional(),
		kind: z.string(),
		outcome: known(),
		selects: z.object({ turnId: id }).nullable().optional()
	}))),
	"context.started": envelopeOf(`context.started`, conforming()(z.object({
		cause: cause.optional(),
		changeId: id,
		kind: z.string(),
		trigger: z.object({ inputTokens: z.number().int().nonnegative() }).optional(),
		turnId: id.optional()
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/delivery.js
const deliverySource = conforming()(z.union([
	z.object({
		channel: z.string(),
		scheduleId: z.string().optional(),
		hook: z.string().optional()
	}),
	z.object({ control: z.string() }),
	z.object({ callback: z.string() })
]));
const importedMessage = conforming()(z.object({
	id: z.string().optional(),
	role: z.enum([`user`, `assistant`]),
	text: z.string()
}));
const deliverySchemas = {
	"delivery.admitted": envelopeOf(`delivery.admitted`, conforming()(z.object({
		deliveryId: id,
		principal: principal.optional(),
		source: deliverySource.optional()
	}))),
	"delivery.consumed": envelopeOf(`delivery.consumed`, conforming()(z.object({
		deliveryId: id,
		history: z.array(importedMessage).optional(),
		parts: z.array(userPart),
		turnId: id
	}))),
	"delivery.settled": envelopeOf(`delivery.settled`, conforming()(z.object({
		deliveryId: id,
		outcome: known(),
		reason: z.string().optional(),
		turnId: id.optional()
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/model.js
const attempt = z.number().int().nonnegative();
const owner = conforming()(z.union([z.object({ turnId: id }), z.object({ changeId: id })]));
const modelSchemas = {
	"model.requested": envelopeOf(`model.requested`, conforming()(z.object({
		owner,
		runId: id
	}))),
	"model.retried": envelopeOf(`model.retried`, conforming()(z.object({
		attempt,
		error: errorInfo,
		runId: id
	}))),
	"model.settled": envelopeOf(`model.settled`, conforming()(z.object({
		error: errorInfo.optional(),
		finishReason: z.string().optional(),
		generationId: z.string().optional(),
		outcome: known(),
		runId: id
	}))),
	"model.started": envelopeOf(`model.started`, conforming()(z.object({
		attempt,
		modelId: z.string(),
		runId: id
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/response.js
const responseSchemas = {
	"response.admitted": envelopeOf(`response.admitted`, conforming()(z.object({ responseId: id }))),
	"response.settled": envelopeOf(`response.settled`, conforming()(z.object({
		outcome: known(),
		reason: z.string().optional(),
		responseId: id
	}))),
	"response.submitted": envelopeOf(`response.submitted`, conforming()(z.object({
		deliveryId: id,
		interactionId: id,
		responseId: id,
		value: z.object({
			optionId: z.string().optional(),
			text: z.string().optional()
		}).optional()
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/task.js
const taskSchemas = {
	"task.ended": envelopeOf(`task.ended`, conforming()(z.object({
		error: errorInfo.optional(),
		outcome: known(),
		reason: z.string().optional(),
		taskId: id
	}))),
	"task.started": envelopeOf(`task.started`, conforming()(z.object({
		kind: z.string(),
		name: z.string(),
		startedBy: z.object({ callId: id }),
		taskId: id
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/turn.js
const turnSchemas = {
	"turn.paused": envelopeOf(`turn.paused`, conforming()(z.object({
		awaiting: z.array(z.object({ interactionId: id })),
		turnId: id
	}))),
	"turn.settled": envelopeOf(`turn.settled`, conforming()(z.object({
		cause: cause.optional(),
		error: errorInfo.optional(),
		outcome: known(),
		reply: z.array(id).optional(),
		turnId: id
	}))),
	"turn.started": envelopeOf(`turn.started`, conforming()(z.object({
		cause,
		follows: id.nullable(),
		trace: traceContext.optional(),
		turnId: id
	})))
};
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/usage.js
const usageSchemas = { "usage.recorded": envelopeOf(`usage.recorded`, conforming()(z.object({
	kind: z.string(),
	owner: z.union([
		z.object({ runId: id }),
		z.object({ callId: id }),
		z.object({ changeId: id })
	]).optional(),
	usage
}))) };
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/schemas.js
const FACT_SCHEMAS = {
	...sessionSchemas,
	...deliverySchemas,
	...turnSchemas,
	...modelSchemas,
	...contentSchemas,
	...callSchemas,
	...taskSchemas,
	...interactionSchemas,
	...responseSchemas,
	...childSchemas,
	...contextSchemas,
	...usageSchemas
};
const PROGRESS_SCHEMAS = {
	...contentProgressSchemas,
	...callProgressSchemas
};
function schemaViolation(e, t) {
	let n = typeof e == `object` && e ? e.type : void 0;
	if (typeof n != `string`) return `A ${t} has no type.`;
	let r = (t === `fact` ? FACT_SCHEMAS : PROGRESS_SCHEMAS)[n];
	if (r === void 0) return;
	let i = r.safeParse(e);
	return i.success ? void 0 : `${n}: ${z.prettifyError(i.error)}`;
}
export { FACT_SCHEMAS, PROGRESS_SCHEMAS, schemaViolation };

//# sourceMappingURL=eve61.mjs.map