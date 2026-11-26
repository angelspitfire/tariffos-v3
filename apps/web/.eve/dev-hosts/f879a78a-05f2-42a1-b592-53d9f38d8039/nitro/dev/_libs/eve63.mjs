function truncateHead(e) {
	return truncateByDirection(e, `head`);
}
function truncateTail(e) {
	return truncateByDirection(e, `tail`);
}
function truncateByDirection(e, t) {
	let n = e.split(`
`);
	let r = countLogicalLines(n);
	let i = t === `head`;
	let a = [];
	let o = 0;
	let s = i ? 0 : n.length - 1;
	let c = i ? 1 : -1;
	for (let e = s; e >= 0 && e < n.length && a.length < 2e3; e += c) {
		let t = capLineLength(n[e] ?? ``);
		let r = Buffer.byteLength(t, `utf8`) + 1;
		if (o + r > 51200 && a.length > 0) break;
		a.push(t), o += r;
	}
	return i || a.reverse(), {
		output: a.join(`
`),
		outputLines: a.length,
		totalLines: r,
		truncated: a.length < r
	};
}
function capLineLength(e) {
	return e.length <= 2e3 ? e : e.slice(0, 2e3) + ` [truncated]`;
}
function countLogicalLines(e) {
	return e.length > 0 && e[e.length - 1] === `` ? e.length - 1 : e.length;
}
export { capLineLength, truncateHead, truncateTail };

//# sourceMappingURL=eve63.mjs.map