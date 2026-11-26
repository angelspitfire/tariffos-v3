import { defineJsonSchema } from "./eve23.mjs";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/framework/agent-contract.js
const SUBAGENT_TOOL_INPUT_SCHEMA = defineJsonSchema({
	type: `object`,
	properties: { message: {
		type: `string`,
		description: `The message to send to the agent, with everything it needs to do the work.`
	} },
	required: [`message`],
	additionalProperties: !1
});
export { SUBAGENT_TOOL_INPUT_SCHEMA };

//# sourceMappingURL=eve24.mjs.map