import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
  process.exit(1);
}

const title = process.argv[2];
const status = process.argv[3];

if (!title || !status) {
  console.error(
    "Usage: node scripts/update_task_status.mjs \"title\" <todo|in_progress|done>",
  );
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);
const tasks = await client.query("tasks:list", {});
const task = tasks.find((t) => t.title === title);

if (!task) {
  console.error(`Task not found: ${title}`);
  process.exit(1);
}

await client.mutation("tasks:update", {
  id: task._id,
  status,
});

console.log(`Task updated: ${title} -> ${status}`);
