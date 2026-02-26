import { ConvexHttpClient } from "convex/browser";
import {
  getConvexUrl,
  parseCommonTaskFields,
  parseFlags,
} from "./task_cli_utils.mjs";

try {
  const flags = parseFlags(process.argv.slice(2));
  const fields = parseCommonTaskFields(flags);

  if (!fields.title) {
    throw new Error("Missing task title. Use --title or TASK_TITLE");
  }

  const client = new ConvexHttpClient(getConvexUrl());
  const id = await client.mutation("tasks:create", fields);

  console.log(JSON.stringify({ ok: true, id }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
