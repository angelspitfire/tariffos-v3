function isEveDevEnvironment() {
	return process.env["EVE_DEV"] === `1`;
}
function isLocalDevelopmentServer() {
	return process.env.VERCEL && process.env.VERCEL_ENV === `development` ? !0 : isEveDevEnvironment();
}
function resolveInstrumentationEnvironment() {
	return isEveDevEnvironment() || process.env.VERCEL_ENV === `development` ? `development` : process.env.VERCEL_ENV === `preview` ? `preview` : `production`;
}
export { isEveDevEnvironment, isLocalDevelopmentServer, resolveInstrumentationEnvironment };

//# sourceMappingURL=eve28.mjs.map