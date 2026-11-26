import { runTask, tasks } from "./task.mjs";
import { H3 } from "file:///Users/afernandez/projects/tariffos-v3/node_modules/.pnpm/h3@2.0.8_crossws@0.4.17_srvx@1.0.8__ocache@0.3.2/node_modules/h3/dist/_entries/node.mjs";
// ../../node_modules/.pnpm/nitro@3.0.261103-rc/node_modules/nitro/dist/runtime/internal/routes/dev-tasks.mjs
const taskHandler = async (event) => {
	const name = event.context.params?.name;
	const body = await event.req.json().catch(() => ({}));
	const payload = {
		...Object.fromEntries(event.url.searchParams.entries()),
		...body.payload ?? body
	};
	return await runTask(name, {
		context: { waitUntil: event.req.waitUntil },
		payload
	});
};
const app = new H3().get("/_nitro/tasks", async () => {
	const _tasks = await Promise.all(Object.entries(tasks).map(async ([name, task]) => {
		return [name, { description: (await task.resolve?.())?.meta?.description }];
	}));
	return {
		tasks: Object.fromEntries(_tasks),
		scheduledTasks: false
	};
}).get("/_nitro/tasks/:name", taskHandler).post("/_nitro/tasks/:name", taskHandler);
export { app as default };

//# sourceMappingURL=dev-tasks.mjs.map