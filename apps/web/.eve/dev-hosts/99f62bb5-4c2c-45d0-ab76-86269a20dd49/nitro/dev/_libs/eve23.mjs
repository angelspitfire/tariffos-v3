import { isObject } from "./eve14.mjs";
import { toErrorMessage } from "./eve22.mjs";
import { parseJsonObject } from "./eve8.mjs";
import { TypeValidationError, asSchema, jsonSchema } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/ai@7.0.181_zod@4.6.7/node_modules/ai/dist/index.js";
import { Validator } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/compiled/@cfworker/json-schema/index.js";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/schema-emission.js
function serializeOutputSchema(e) {
	return e == null ? e : emitJsonSchema(e, `output`);
}
function emitJsonSchema(e, t) {
	let n = getStandardSchemaProperties(e);
	if (n === void 0) return withoutSchemaVersion(parseJsonObject(e));
	let r = readJsonSchemaEmitter(n, t);
	if (r === void 0) throw Error(describeMissingEmitter(n));
	return withoutSchemaVersion(parseJsonObject(r({ target: `draft-07` })));
}
function readJsonSchemaEmitter(e, t) {
	let n = e.jsonSchema;
	if (typeof n != `object` || !n) return;
	let r = n[t];
	return typeof r == `function` ? r : void 0;
}
function getStandardSchemaProperties(e) {
	if (typeof e != `object` || !e || !(`~standard` in e)) return;
	let t = e[`~standard`];
	return typeof t == `object` && t ? t : void 0;
}
function describeMissingEmitter(e) {
	let t = typeof e.vendor == `string` ? e.vendor : `unknown`;
	return t === `zod` ? `Zod 3 cannot emit an output JSON Schema. Upgrade to Zod 4 or provide a plain JSON Schema object.` : `Standard Schema vendor "${t}" does not support JSON Schema conversion. Provide a Standard Schema implementation with JSON Schema conversion or a plain JSON Schema object.`;
}
function withoutSchemaVersion(e) {
	let { $schema: t, ...n } = e;
	return n;
}
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/tools/schema.js
function toInputSchema(e) {
	return toSchema(e, `input`);
}
function toOutputSchema(e) {
	return toSchema(e, `output`);
}
function serializeInputSchema(e) {
	return serializeSchema(e, `input`);
}
function isToolSchema(e) {
	let t = getStandardSchemaProperties(e);
	if (t === void 0) return !1;
	let n = t.jsonSchema;
	return typeof t.validate == `function` && typeof n == `object` && !!n && typeof n.input == `function` && typeof n.output == `function`;
}
function defineJsonSchema(e, t) {
	let emit = () => structuredClone(e);
	let n = { "~standard": {
		version: 1,
		vendor: `eve`,
		validate: createJsonSchemaValidator(e, t),
		jsonSchema: {
			input: emit,
			output: emit
		}
	} };
	return plainJsonSchemas.add(n), n;
}
const plainJsonSchemas = /* @__PURE__ */ new WeakSet();
function refineJsonSchema(e, t) {
	let n = defineJsonSchema(e);
	let r = { "~standard": {
		...n[`~standard`],
		validate: async (e) => {
			let r = await n[`~standard`].validate(e);
			return r.issues === void 0 ? await t(r.value) : r;
		}
	} };
	return plainJsonSchemas.add(r), r;
}
function prepareJsonSchema(e, t) {
	let n = defineJsonSchema(e);
	let r = { "~standard": {
		...n[`~standard`],
		validate: (e) => n[`~standard`].validate(t(e))
	} };
	return plainJsonSchemas.add(r), r;
}
function withOptionalStringProperty(e, t) {
	let emit = () => addOptionalStringProperty(serializeInputSchema(e), t);
	let n = { "~standard": {
		version: 1,
		vendor: `eve`,
		validate: (n) => validateWithProperty(e, t.name, n),
		jsonSchema: {
			input: emit,
			output: emit
		}
	} };
	return plainJsonSchemas.has(e) && plainJsonSchemas.add(n), n;
}
function addOptionalStringProperty(e, t) {
	let n = isObject(e.properties) ? e.properties : {};
	return {
		...e,
		type: e.type ?? `object`,
		properties: {
			...n,
			[t.name]: {
				description: t.description,
				type: `string`
			}
		}
	};
}
async function validateWithProperty(e, t, n) {
	if (!isObject(n) || !(t in n)) return await e[`~standard`].validate(n);
	let { [t]: r, ...i } = n;
	if (typeof r != `string`) return { issues: [{
		message: `Expected "${t}" to be a string.`,
		path: [t]
	}] };
	let a = await e[`~standard`].validate(i);
	return a.issues !== void 0 || !isObject(a.value) ? a : { value: {
		...a.value,
		[t]: r
	} };
}
const UNSPECIFIED_INPUT_SCHEMA = defineJsonSchema({});
function toModelSchema(e, t) {
	if (e === void 0 || typeof e == `function` || !(`~standard` in e)) return e;
	let n = e;
	return jsonSchema(() => toModelJsonSchema(n, t), { validate: async (e) => {
		let t = await n[`~standard`].validate(e);
		return t.issues === void 0 ? {
			success: !0,
			value: t.value
		} : {
			success: !1,
			error: new TypeValidationError({
				value: e,
				cause: t.issues
			})
		};
	} });
}
function toModelJsonSchema(e, t) {
	let n = serializeSchema(e, t);
	return plainJsonSchemas.has(e) ? n : closeObjectSchemas(n);
}
function closeObjectSchemas(e) {
	if (!isObject(e)) return e;
	let t = { ...e };
	let { type: n } = t;
	(n === `object` || Array.isArray(n) && n.includes(`object`)) && (t.additionalProperties = isObject(t.additionalProperties) ? closeObjectSchemas(t.additionalProperties) : !1, isObject(t.properties) && (t.properties = mapValues(t.properties, closeObjectSchemas))), Array.isArray(t.items) ? t.items = t.items.map(closeObjectSchemas) : isObject(t.items) && (t.items = closeObjectSchemas(t.items));
	for (let e of [
		`allOf`,
		`anyOf`,
		`oneOf`
	]) {
		let n = t[e];
		Array.isArray(n) && (t[e] = n.map(closeObjectSchemas));
	}
	return isObject(t.definitions) && (t.definitions = mapValues(t.definitions, closeObjectSchemas)), t;
}
function mapValues(e, t) {
	return Object.fromEntries(Object.entries(e).map(([e, n]) => [e, t(n)]));
}
function toSchema(e, t) {
	return e == null || isToolSchema(e) ? e : defineJsonSchema(toJsonObject(e, t));
}
function serializeSchema(e, t) {
	return e == null ? e : toJsonObject(e, t);
}
function toJsonObject(e, t) {
	if (t === `input` && isLegacyZodSchema(e)) {
		let t = asSchema(e);
		let { $schema: n, ...r } = parseJsonObject(t.jsonSchema);
		return r;
	}
	return emitJsonSchema(e, t);
}
function isLegacyZodSchema(e) {
	let t = getStandardSchemaProperties(e);
	return t !== void 0 && t.vendor === `zod` && readJsonSchemaEmitter(t, `input`) === void 0;
}
function createJsonSchemaValidator(e, t) {
	let n;
	let r = !1;
	let passThrough = (e, t) => (r || (r = !0, console.warn(`[eve] Tool schema cannot validate values locally; passing them through unvalidated: ${t}`)), { value: e });
	return (r) => {
		if (n === void 0) {
			let t = buildValidator(e);
			if (typeof t == `string`) return n = null, passThrough(r, t);
			n = t;
		}
		if (n === null) return { value: r };
		let i;
		try {
			i = n.validate(r);
		} catch (e) {
			return r === void 0 ? { issues: [{ message: `Expected a JSON value.` }] } : passThrough(r, toErrorMessage(e));
		}
		if (!i.valid) return { issues: toIssues(i.errors) };
		let a = applyDefaults(e, e, r);
		let o = t?.(a);
		return o === void 0 ? { value: a } : { issues: [{ message: o }] };
	};
}
function applyDefaults(e, t, n) {
	let r = n;
	for (let n of followRefs(e, t)) {
		let { items: t, properties: i } = n;
		if (isObject(r) && isObject(i)) r = fillProperties(e, i, r);
		else if (Array.isArray(r) && isObject(t)) {
			let n = r;
			let i = n.map((n) => applyDefaults(e, t, n));
			i.some((e, t) => e !== n[t]) && (r = i);
		}
	}
	return r;
}
function fillProperties(e, t, n) {
	let r = n;
	for (let [i, a] of Object.entries(t)) {
		let t = Object.hasOwn(n, i) ? n[i] : void 0;
		let o = t === void 0 ? findDefault(e, a) : applyDefaults(e, a, t);
		o !== t && (r === n && (r = { ...n }), r[i] = o);
	}
	return r;
}
function findDefault(e, t) {
	for (let n of followRefs(e, t)) if (`default` in n) return structuredClone(n.default);
}
function* followRefs(e, t) {
	let n = /* @__PURE__ */ new Set();
	let r = t;
	for (; isObject(r) && !n.has(r);) n.add(r), yield r, r = resolveLocalRef(e, r.$ref);
}
function resolveLocalRef(e, t) {
	if (typeof t != `string` || t !== `#` && !t.startsWith(`#/`)) return;
	let n = e;
	for (let e of decodePointer(t)) {
		if (typeof n != `object` || !n || !Object.hasOwn(n, e)) return;
		n = n[e];
	}
	return n;
}
function buildValidator(e) {
	try {
		let t = structuredClone(e);
		return prepareForValidation(t) ?? new Validator(t, `2020-12`, !1);
	} catch (e) {
		return toErrorMessage(e);
	}
}
const JSON_TYPES = /* @__PURE__ */ new Set([
	`array`,
	`boolean`,
	`integer`,
	`null`,
	`number`,
	`object`,
	`string`
]);
const EXCLUSIVE_BOUNDS = [[`exclusiveMinimum`, `minimum`], [`exclusiveMaximum`, `maximum`]];
const SUBSCHEMA_KEYWORDS = [
	`additionalItems`,
	`additionalProperties`,
	`contains`,
	`else`,
	`if`,
	`not`,
	`propertyNames`,
	`then`,
	`unevaluatedItems`,
	`unevaluatedProperties`
];
const SUBSCHEMA_LIST_KEYWORDS = [
	`allOf`,
	`anyOf`,
	`oneOf`,
	`prefixItems`
];
const SUBSCHEMA_MAP_KEYWORDS = [
	`$defs`,
	`definitions`,
	`dependencies`,
	`dependentSchemas`,
	`patternProperties`,
	`properties`
];
function prepareForValidation(e) {
	if (typeof e == `boolean`) return;
	if (typeof e != `object` || !e || Array.isArray(e)) return `a subschema is neither an object nor a boolean`;
	let t = e;
	delete t.format;
	for (let [e, n] of EXCLUSIVE_BOUNDS) typeof t[e] == `boolean` && (t[e] && typeof t[n] == `number` ? (t[e] = t[n], delete t[n]) : delete t[e]);
	let { enum: n, pattern: r, required: i, type: a } = t;
	if (a !== void 0 && !(Array.isArray(a) ? a.every(isJsonType) : isJsonType(a))) return `unsupported type ${JSON.stringify(a)}`;
	if (n !== void 0 && !Array.isArray(n)) return "`enum` is not an array";
	if (i !== void 0 && !(Array.isArray(i) && i.every((e) => typeof e == `string`))) return "`required` is not an array of strings";
	if (r !== void 0 && !isRegExpSource(r)) return `invalid pattern ${JSON.stringify(r)}`;
	for (let e of SUBSCHEMA_KEYWORDS) if (e in t) {
		let n = prepareForValidation(t[e]);
		if (n !== void 0) return n;
	}
	let o = t.items;
	for (let e of Array.isArray(o) ? o : o === void 0 ? [] : [o]) {
		let t = prepareForValidation(e);
		if (t !== void 0) return t;
	}
	for (let e of SUBSCHEMA_LIST_KEYWORDS) {
		let n = t[e];
		if (n !== void 0) {
			if (!Array.isArray(n)) return `\`${e}\` is not an array`;
			for (let e of n) {
				let t = prepareForValidation(e);
				if (t !== void 0) return t;
			}
		}
	}
	for (let e of SUBSCHEMA_MAP_KEYWORDS) {
		let n = t[e];
		if (n !== void 0) {
			if (typeof n != `object` || !n || Array.isArray(n)) return `\`${e}\` is not an object`;
			for (let [t, r] of Object.entries(n)) {
				if (e === `patternProperties` && !isRegExpSource(t)) return `invalid pattern ${JSON.stringify(t)}`;
				if (e === `dependencies` && Array.isArray(r)) continue;
				let n = prepareForValidation(r);
				if (n !== void 0) return n;
			}
		}
	}
}
function isJsonType(e) {
	return typeof e == `string` && JSON_TYPES.has(e);
}
function isRegExpSource(e) {
	if (typeof e != `string`) return !1;
	try {
		return new RegExp(e, `u`), !0;
	} catch {
		return !1;
	}
}
const CLOSED_OBJECT_KEYWORD = /\/(?:additional|unevaluated)Properties$/;
function toIssues(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		let i = e[n + 1];
		if (CLOSED_OBJECT_KEYWORD.test(r.keywordLocation) && i?.keyword === `false`) {
			let e = decodePointer(i.instanceLocation).at(-1);
			t.push({
				keyword: `false`,
				location: i.instanceLocation,
				message: `Unrecognized key: ${JSON.stringify(e)}`,
				object: r.instanceLocation
			}), n++;
		} else t.push({
			keyword: r.keyword,
			location: r.instanceLocation,
			message: r.error
		});
	}
	let n = t.filter((e) => e.object === void 0 || !t.some((t) => t.object === void 0 && (t.location === e.location || t.location.startsWith(`${e.location}/`))));
	return n.filter((e, t) => {
		let r = n[t + 1];
		return r === void 0 ? !0 : r.location.startsWith(`${e.location}/`) ? !1 : e.keyword !== `$ref` || r.location !== e.location;
	}).map(({ location: e, message: t, object: n }) => {
		let r = decodePointer(n ?? e);
		return r.length === 0 ? { message: t } : {
			message: t,
			path: r
		};
	});
}
function decodePointer(e) {
	return e.split(`/`).slice(1).map((e) => {
		let t = e;
		try {
			t = decodeURIComponent(e);
		} catch {}
		return t.replaceAll(`~1`, `/`).replaceAll(`~0`, `~`);
	});
}
export { UNSPECIFIED_INPUT_SCHEMA, defineJsonSchema, followRefs, isToolSchema, prepareJsonSchema, refineJsonSchema, serializeInputSchema, serializeOutputSchema, toInputSchema, toModelSchema, toOutputSchema, withOptionalStringProperty };

//# sourceMappingURL=eve23.mjs.map