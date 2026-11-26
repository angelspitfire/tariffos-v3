import { parseJsonObject, parseJsonValue } from "./eve8.mjs";
import { z } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/zod/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/json-schemas.js
const jsonValueSchema = z.unknown().transform((e, t) => {
	try {
		return parseJsonValue(e);
	} catch (e) {
		return t.addIssue({
			code: `custom`,
			message: formatJsonParseError(e, `Expected a JSON-serializable value.`)
		}), z.NEVER;
	}
});
const jsonObjectSchema = z.unknown().transform((e, t) => {
	try {
		return parseJsonObject(e);
	} catch (e) {
		return t.addIssue({
			code: `custom`,
			message: formatJsonParseError(e, `Expected a JSON-serializable object.`)
		}), z.NEVER;
	}
});
function formatJsonParseError(e, t) {
	return e instanceof Error ? e.message : t;
}
export { jsonObjectSchema, jsonValueSchema };

//# sourceMappingURL=eve9.mjs.map