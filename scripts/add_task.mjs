import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
  process.exit(1);
}

const title = process.argv[2];
const description = process.argv[3] || "";
const assignee = process.argv[4] || "me";

if (!title) {
  console.error("Usage: node scripts/add_task.mjs \"title\" [description] [me|you]");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

await client.mutation("tasks:create", {
  title,
  description: description || undefined,
  status: "todo",
  assignee,
});

console.log("Task created:", title);
