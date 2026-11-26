import { readImageDimensions } from "./eve20.mjs";
import { constants, inflateSync } from "node:zlib";
// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/internal/attachments/read-media-metadata.js
function readMediaMetadata(e, t) {
	let n = {
		mediaType: t,
		size: e.byteLength
	};
	if (t.startsWith(`image/`)) {
		let t = readImageDimensions(e);
		return t === void 0 ? n : {
			...n,
			...t
		};
	}
	if (t === `application/pdf`) {
		let t = countPdfPages(e);
		return t === void 0 ? n : {
			...n,
			pages: t
		};
	}
	return n;
}
function countPdfPages(e) {
	let t = Buffer.from(e.buffer, e.byteOffset, e.byteLength);
	let n = t.toString(`latin1`);
	let r = countPageObjects(n) || countObjectStreamPages(t, n);
	return r > 0 ? r : void 0;
}
function countPageObjects(e) {
	return e.match(/\/Type\s*\/Page(?![A-Za-z])/g)?.length ?? 0;
}
function countObjectStreamPages(e, t) {
	let n = /\/Type\s*\/ObjStm(?![A-Za-z])/g;
	let r = 0;
	let i = 0;
	let a = 16777216;
	for (let o = n.exec(t); o !== null; o = n.exec(t)) {
		if (++i > 1e4) return 0;
		let s = t.indexOf(`stream`, o.index);
		let c = t.indexOf(`endstream`, s);
		if (s < 0 || c < 0) return 0;
		n.lastIndex = c;
		let l = s + (t.startsWith(`stream\r
`, s) ? 8 : 7);
		try {
			let t = inflateSync(e.subarray(l, c), {
				finishFlush: constants.Z_SYNC_FLUSH,
				maxOutputLength: a
			});
			a -= t.byteLength, r += countPageObjects(t.toString(`latin1`));
		} catch {
			return 0;
		}
	}
	return r;
}
export { readMediaMetadata };

//# sourceMappingURL=eve68.mjs.map