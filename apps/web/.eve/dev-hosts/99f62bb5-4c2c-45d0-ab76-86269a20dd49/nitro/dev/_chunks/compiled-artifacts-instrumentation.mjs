import { finalizeInstrumentationProviders, seedInstrumentationProviders, shutdownInstrumentationProviders } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/instrumentation/providers.js";
// .eve/dev-hosts/99f62bb5-4c2c-45d0-ab76-86269a20dd49/artifacts/compiled-artifacts-instrumentation.mjs
seedInstrumentationProviders();
finalizeInstrumentationProviders({ serviceName: "web" });
function installInstrumentationPlugin(nitroApp) {
	nitroApp?.hooks?.hook("close", async () => {
		await shutdownInstrumentationProviders();
	});
}
export { installInstrumentationPlugin };

//# sourceMappingURL=compiled-artifacts-instrumentation.mjs.map