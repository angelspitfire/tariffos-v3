// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/media-metadata.js
const MAX_IMAGE_TOKENS = 4784;
function estimateMediaTokens(e) {
	if (e.mediaType.startsWith(`image/`)) {
		if (e.width === void 0 || e.height === void 0) return MAX_IMAGE_TOKENS;
		let t = Math.ceil(e.width / 28) * Math.ceil(e.height / 28);
		return Math.min(t, MAX_IMAGE_TOKENS);
	}
	return e.mediaType === `application/pdf` && e.pages !== void 0 ? e.pages * 3e3 : Math.ceil(e.size / 3);
}
const GENERIC_MEDIA_TYPE = `application/octet-stream`;
const PDF_MEDIA_TYPE = `application/pdf`;
function verifyMediaType(e, t) {
	let n = t.toLowerCase();
	if (!(n.startsWith(`image/`) || n === PDF_MEDIA_TYPE || n === GENERIC_MEDIA_TYPE)) return t;
	let r = detectImageMediaType(e) ?? (hasPdfHeader(e) ? PDF_MEDIA_TYPE : void 0);
	return r === void 0 ? VERIFIABLE_MEDIA_TYPES.has(n) ? GENERIC_MEDIA_TYPE : t : r;
}
const INLINE_IMAGE_MEDIA_TYPES = /* @__PURE__ */ new Set([
	`image/gif`,
	`image/jpeg`,
	`image/png`,
	`image/webp`
]);
const VERIFIABLE_MEDIA_TYPES = /* @__PURE__ */ new Set([
	...INLINE_IMAGE_MEDIA_TYPES,
	`image/jpg`,
	PDF_MEDIA_TYPE
]);
function hasPdfHeader(e) {
	return readAscii(e, 0, 5) === `%PDF-`;
}
function detectImageMediaType(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength);
	let ascii = (t, n) => readAscii(e, t, n);
	if (e.byteLength >= 8 && t.getUint32(0) === 2303741511 && t.getUint32(4) === 218765834) return `image/png`;
	if (e.byteLength >= 3 && t.getUint16(0) === 65496 && e[2] === 255) return `image/jpeg`;
	if (ascii(0, 6) === `GIF87a` || ascii(0, 6) === `GIF89a`) return `image/gif`;
	if (ascii(0, 4) === `RIFF` && ascii(8, 12) === `WEBP`) return `image/webp`;
}
function readImageDimensions(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength);
	let ascii = (t, n) => readAscii(e, t, n);
	if (e.byteLength >= 24 && t.getUint32(0) === 2303741511) return dimensions(t.getUint32(16), t.getUint32(20));
	if (e.byteLength >= 10 && ascii(0, 4) === `GIF8`) return dimensions(t.getUint16(6, !0), t.getUint16(8, !0));
	if (e.byteLength >= 4 && t.getUint16(0) === 65496) return readJpegDimensions(e, t);
	if (e.byteLength >= 30 && ascii(0, 4) === `RIFF` && ascii(8, 12) === `WEBP`) {
		let n = ascii(12, 16);
		if (n === `VP8 `) return dimensions(t.getUint16(26, !0) & 16383, t.getUint16(28, !0) & 16383);
		if (n === `VP8L`) {
			let e = t.getUint32(21, !0);
			return dimensions((e & 16383) + 1, (e >>> 14 & 16383) + 1);
		}
		if (n === `VP8X`) return dimensions(readUint24(e, 24) + 1, readUint24(e, 27) + 1);
	}
}
function readJpegDimensions(e, t) {
	let n = 2;
	for (; n + 9 < e.byteLength;) {
		if (e[n] !== 255) return;
		let r = e[n + 1];
		if (r === 255) n += 1;
		else {
			if (r >= 192 && r <= 207 && r !== 196 && r !== 200 && r !== 204) return dimensions(t.getUint16(n + 7), t.getUint16(n + 5));
			n += 2 + t.getUint16(n + 2);
		}
	}
}
function readAscii(e, t, n) {
	return String.fromCharCode(...e.subarray(t, Math.min(n, e.byteLength)));
}
function readUint24(e, t) {
	return e[t] | e[t + 1] << 8 | e[t + 2] << 16;
}
function dimensions(e, t) {
	return e > 0 && t > 0 ? {
		height: t,
		width: e
	} : void 0;
}
const PATH_QUERY_KEY = `path`;
const SIZE_QUERY_KEY = `size`;
const TYPE_QUERY_KEY = `type`;
const METADATA_QUERY_KEYS = [
	`width`,
	`height`,
	`pages`
];
const INLINE_IMAGE_MAX_SIDE_PX = 8e3;
function isValidSize(e) {
	return Number.isFinite(e) && Number.isInteger(e) && e >= 0;
}
function encodeSandboxRef(e) {
	if (typeof e.path != `string` || e.path.length === 0) throw RangeError(`SandboxRef.path must be a non-empty string.`);
	if (!isValidSize(e.size)) throw RangeError(`SandboxRef.size must be a non-negative integer. Received: ${String(e.size)}.`);
	if (typeof e.mediaType != `string` || e.mediaType.length === 0) throw RangeError(`SandboxRef.mediaType must be a non-empty string.`);
	let t = new URL("eve-sandbox:");
	t.searchParams.set(PATH_QUERY_KEY, e.path), t.searchParams.set(SIZE_QUERY_KEY, String(e.size)), t.searchParams.set(TYPE_QUERY_KEY, e.mediaType);
	for (let n of METADATA_QUERY_KEYS) {
		let r = e[n];
		r !== void 0 && isValidSize(r) && t.searchParams.set(n, String(r));
	}
	return t;
}
function decodeSandboxRef(e) {
	let t = e instanceof URL ? e : new URL(e);
	if (t.protocol !== `eve-sandbox:`) throw Error(`SandboxRef URL must use scheme "eve-sandbox:". Got: "${t.protocol}".`);
	let n = t.searchParams.get(PATH_QUERY_KEY);
	if (n === null || n === ``) throw Error(`SandboxRef URL is missing the required "path" query param.`);
	let r = t.searchParams.get(SIZE_QUERY_KEY);
	if (r === null || r === ``) throw Error(`SandboxRef URL is missing the required "size" query param.`);
	let i = Number(r);
	if (!isValidSize(i)) throw Error(`SandboxRef URL "size" must be a non-negative integer. Got: ${JSON.stringify(r)}.`);
	let a = t.searchParams.get(TYPE_QUERY_KEY);
	if (a === null || a === ``) throw Error(`SandboxRef URL is missing the required "type" query param.`);
	let o = {
		mediaType: a,
		path: n,
		size: i
	};
	for (let e of METADATA_QUERY_KEYS) {
		let n = Number(t.searchParams.get(e) ?? NaN);
		isValidSize(n) && n > 0 && (o[e] = n);
	}
	return o;
}
function inlinesSandboxRefAsBytes(e) {
	return INLINE_IMAGE_MEDIA_TYPES.has(e.mediaType) ? e.size <= 3145728 && (e.width ?? 0) <= INLINE_IMAGE_MAX_SIDE_PX && (e.height ?? 0) <= INLINE_IMAGE_MAX_SIDE_PX : e.mediaType === `application/pdf` && e.size <= 20971520;
}
function isSandboxRefUrl(e) {
	return e instanceof URL && e.protocol === `eve-sandbox:`;
}
export { decodeSandboxRef, detectImageMediaType, encodeSandboxRef, estimateMediaTokens, hasPdfHeader, inlinesSandboxRefAsBytes, isSandboxRefUrl, readImageDimensions, verifyMediaType };

//# sourceMappingURL=eve20.mjs.map