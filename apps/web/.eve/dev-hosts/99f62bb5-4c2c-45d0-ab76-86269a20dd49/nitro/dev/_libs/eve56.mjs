import { cause, conforming, envelopeOf, id, jsonValue, known } from "./eve27.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/protocol/session-events/families/interaction.js
const subject = conforming()(z.union([
	z.object({ callId: id }),
	z.object({ turnId: id }),
	z.object({ taskId: id }),
	z.object({ responseId: id })
]));
const interactionRequestSchema = conforming()(z.object({
	allowFreeform: z.boolean().optional(),
	display: known().optional(),
	initialOptionId: z.string().optional(),
	kind: known(),
	link: z.object({
		label: z.string().optional(),
		url: z.string()
	}).optional(),
	options: z.array(z.object({
		description: z.string().optional(),
		id: z.string(),
		label: z.string(),
		style: known().optional()
	})).optional(),
	prompt: z.string(),
	signIn: z.object({
		callbackUrl: z.string().optional(),
		displayName: z.string().optional(),
		expiresAt: z.string().optional(),
		grant: z.string().optional(),
		instructions: z.string().optional(),
		name: z.string(),
		principal: z.object({
			id: z.string().optional(),
			issuer: z.string().optional(),
			type: z.string()
		}).optional(),
		url: z.string().optional(),
		userCode: z.string().optional(),
		waitsOn: z.string().optional()
	}).optional(),
	title: z.string().optional()
}));
const interactionSchemas = {
	"interaction.opened": envelopeOf(`interaction.opened`, conforming()(z.object({
		audience: z.object({ principalIds: z.array(z.string()) }).optional(),
		interactionId: id,
		origin: z.object({
			call: z.object({
				callId: id,
				input: jsonValue.optional(),
				name: z.string()
			}).optional(),
			interactionId: id,
			sessionId: id
		}).optional(),
		request: interactionRequestSchema,
		subject
	}))),
	"interaction.settled": envelopeOf(`interaction.settled`, conforming()(z.object({
		cause: cause.optional(),
		interactionId: id,
		outcome: known(),
		reason: z.string().optional(),
		response: z.record(z.string(), jsonValue).optional()
	})))
};
export { interactionSchemas };

//# sourceMappingURL=eve56.mjs.map