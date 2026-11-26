// ../../node_modules/.pnpm/eve@1.4.0_@opentelemetry+api@1.10.0_ai@7.0.181_zod@4.6.7__next@16.4.6_@babel+core@7.29._7106a6b4633fcf609cecb5c210405702/node_modules/eve/dist/src/execution/session-inbox/address.js
function isSessionInboxAddress(e) {
	return typeof e == `object` && !!e && `sessionId` in e && typeof e.sessionId == `string` && e.sessionId.length > 0 && !e.sessionId.includes(`:`);
}
function isReservedSessionCommandToken(e) {
	return e.startsWith(`eve:session:`) || e.startsWith(`eve:inbox:`);
}
function sessionCommandHookToken(e) {
	return `eve:session:${e}:inbox`;
}
function isSessionCommandHookToken(e) {
	return /^eve:session:[^:]+:inbox$/.test(e);
}
const SESSION_INBOX_HOOK_TOKEN_PREFIX = `eve:inbox:v1:`;
function sessionInboxHookToken(e) {
	return `${SESSION_INBOX_HOOK_TOKEN_PREFIX}${e}`;
}
function isSessionInboxHookToken(e) {
	return e.startsWith(SESSION_INBOX_HOOK_TOKEN_PREFIX);
}
function logicalSessionInboxToken(e) {
	return isSessionInboxHookToken(e) ? e.slice(13) : void 0;
}
function logicalSessionToken(e) {
	if (typeof e == `string`) return e;
	if (!isSessionInboxAddress(e)) throw Error(`Session inbox target has an invalid address.`);
	return sessionCommandHookToken(e.sessionId);
}
export { isReservedSessionCommandToken, isSessionCommandHookToken, isSessionInboxAddress, isSessionInboxHookToken, logicalSessionInboxToken, logicalSessionToken, sessionCommandHookToken, sessionInboxHookToken };

//# sourceMappingURL=eve12.mjs.map