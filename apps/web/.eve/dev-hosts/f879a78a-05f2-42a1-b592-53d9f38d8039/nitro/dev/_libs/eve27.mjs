import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/common.js
function conforming() {
	return (e) => e;
}
function known() {
	return z.string();
}
const id = z.string().min(1);
const jsonValue = z.lazy(() => z.union([
	z.null(),
	z.boolean(),
	z.number(),
	z.string(),
	z.array(jsonValue),
	z.record(z.string(), jsonValue)
]));
const scope = conforming()(z.object({
	changeId: id.optional(),
	runId: id.optional(),
	taskId: id.optional(),
	turnId: id.optional()
}));
const cause = conforming()(z.union([
	z.object({ deliveryId: id }),
	z.object({ turnId: id }),
	z.object({ taskId: id }),
	z.object({ callId: id }),
	z.object({ interactionId: id }),
	z.object({ responseId: id }),
	z.object({ changeId: id }),
	z.object({ policy: z.string() }),
	z.object({ hook: z.string() })
]));
const principal = conforming()(z.object({
	id,
	issuer: z.string().optional(),
	type: z.string()
}));
const errorInfo = conforming()(z.object({
	code: z.string(),
	name: z.string().optional(),
	hint: z.string().optional(),
	id: z.string().optional(),
	message: z.string()
}));
const count = z.number().int().nonnegative();
const usage = conforming()(z.object({
	cacheReadTokens: count,
	cacheWriteTokens: count,
	costUsd: z.number().finite().nonnegative().optional(),
	inputTokens: count,
	outputTokens: count
}));
const valueReference = conforming()(z.object({
	mediaType: z.string().optional(),
	preview: z.string().optional(),
	ref: z.string().optional(),
	size: count.optional(),
	withheld: z.literal(!0).optional()
}));
const userPart = conforming()(z.union([z.object({
	kind: z.literal(`text`),
	text: z.string()
}), z.object({
	filename: z.string().optional(),
	kind: z.literal(`file`),
	mediaType: z.string(),
	ref: z.string().optional(),
	size: count.optional(),
	unavailable: z.literal(!0).optional(),
	url: z.string().optional()
})]));
function envelopeOf(e, t) {
	return z.object({
		data: t,
		scope: scope.optional(),
		type: z.literal(e)
	});
}
export { cause, conforming, envelopeOf, errorInfo, id, jsonValue, known, principal, usage, userPart, valueReference };

//# sourceMappingURL=eve27.mjs.map