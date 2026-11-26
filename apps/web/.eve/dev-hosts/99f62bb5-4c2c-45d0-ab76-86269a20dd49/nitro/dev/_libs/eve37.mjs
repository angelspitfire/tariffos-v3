// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/shared/vercel-project.js
const EMPTY_CLAIMS = {
	ownerId: void 0,
	projectId: void 0
};
const VERCEL_OIDC_ISSUER = `https://oidc.vercel.com`;
function isVercelOidcIssuer(e) {
	return e === VERCEL_OIDC_ISSUER || e?.startsWith(`${VERCEL_OIDC_ISSUER}/`) === !0;
}
function decodeVercelOidcTokenClaims(e) {
	let t = e.split(`.`)[1];
	if (t === void 0 || t.length === 0) return EMPTY_CLAIMS;
	let n;
	try {
		n = JSON.parse(Buffer.from(t, `base64url`).toString(`utf8`));
	} catch {
		return EMPTY_CLAIMS;
	}
	if (typeof n != `object` || !n) return EMPTY_CLAIMS;
	let r = n;
	return {
		ownerId: typeof r.owner_id == `string` ? r.owner_id : void 0,
		projectId: typeof r.project_id == `string` ? r.project_id : void 0
	};
}
function resolveVercelProjectIdFromEnvironment() {
	let e = process.env.VERCEL_PROJECT_ID?.trim();
	if (e !== void 0 && e.length > 0) return e;
	let t = process.env.VERCEL_OIDC_TOKEN?.trim();
	if (t !== void 0 && t.length !== 0) return decodeVercelOidcTokenClaims(t).projectId;
}
export { decodeVercelOidcTokenClaims, isVercelOidcIssuer, resolveVercelProjectIdFromEnvironment };

//# sourceMappingURL=eve37.mjs.map