import { ConvexHttpClient } from "convex/browser";
import {
  cleanString,
  firstDefined,
  getConvexUrl,
  parseCommonTaskFields,
  parseFlags,
} from "./task_cli_utils.mjs";

try {
  const flags = parseFlags(process.argv.slice(2));
  const fields = parseCommonTaskFields(flags);
  const inputId = cleanString(firstDefined(flags.id, process.env.TASK_ID));
  const title = cleanString(firstDefined(flags.title, process.env.TASK_TITLE));

  const client = new ConvexHttpClient(getConvexUrl());
  let id = inputId;
  if (!id && title) {
    const tasks = await client.query("tasks:list", {});
    const candidate = tasks.find((task) => task.title === title);
    if (!candidate) {
      throw new Error(`Task not found for title: ${title}`);
    }
    id = candidate._id;
  }

  if (!id) {
    throw new Error("Missing task id/title. Use --id|--title or TASK_ID|TASK_TITLE");
  }

  const updates = { id, ...fields };
  const hasUpdates = Object.keys(updates).some(
    (key) => key !== "id" && updates[key] !== undefined,
  );

  if (!hasUpdates) {
    throw new Error("No update fields provided. Pass flags or TASK_* env vars.");
  }

  await client.mutation("tasks:update", updates);

  console.log(JSON.stringify({ ok: true, id }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
