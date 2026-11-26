function createEveDescendantStreamRoutePath(e) {
	return `/eve/v1/session/${encodeURIComponent(e)}/descendants/stream`;
}
function createEveSessionRoutePath(e) {
	return `/eve/v1/session/${encodeURIComponent(e)}`;
}
function createEveSessionCancelRoutePath(e) {
	return `/eve/v1/session/${encodeURIComponent(e)}/cancel`;
}
function createEveSubagentStreamRoutePath(e) {
	return `/eve/v1/session/${encodeURIComponent(e.parentSessionId)}/subagents/${encodeURIComponent(e.callId)}/${encodeURIComponent(e.childSessionId)}/stream`;
}
function createEveSessionResetRoutePath(e) {
	return `/eve/v1/session/${encodeURIComponent(e)}/reset`;
}
function createEveSessionStreamRoutePath(e) {
	return `/eve/v1/session/${encodeURIComponent(e)}/stream`;
}
function createEveConnectionCallbackRoutePath(e, t, n) {
	return `/eve/v1/connections/${encodeURIComponent(e)}/callback/${encodeURIComponent(t)}/${encodeURIComponent(n)}`;
}
function parseEveConnectionCallbackRoutePath(e) {
	let [t, n, r, i, a] = e.split(`/`).slice(-5);
	if (t !== `connections` || r !== `callback` || !n || !i || !a) return;
	let [o, s, c] = [
		n,
		i,
		a
	].map(decodedSegment);
	if (o !== void 0 && s !== void 0 && c !== void 0) return {
		attemptId: s,
		name: o,
		token: c
	};
}
function decodedSegment(e) {
	try {
		return decodeURIComponent(e);
	} catch (e) {
		if (e instanceof URIError) return;
		throw e;
	}
}
function createEveCallbackRoutePath(e) {
	return `/eve/v1/callback/${encodeURIComponent(e)}`;
}
export { createEveCallbackRoutePath, createEveConnectionCallbackRoutePath, createEveDescendantStreamRoutePath, createEveSessionCancelRoutePath, createEveSessionResetRoutePath, createEveSessionRoutePath, createEveSessionStreamRoutePath, createEveSubagentStreamRoutePath, parseEveConnectionCallbackRoutePath };

//# sourceMappingURL=eve6.mjs.map