import { spawn } from "node:child_process";
import {
  cleanString,
  firstDefined,
  parseCommonTaskFields,
  parseFlags,
} from "./task_cli_utils.mjs";
import { TaskSyncRuntime } from "./task_runtime.mjs";

try {
  const rawArgs = process.argv.slice(2);
  const split = rawArgs.indexOf("--");
  const flagArgs = split >= 0 ? rawArgs.slice(0, split) : rawArgs;
  const cmdArgs = split >= 0 ? rawArgs.slice(split + 1) : [];
  const flags = parseFlags(flagArgs);
  const fields = parseCommonTaskFields(flags);
  const title = cleanString(firstDefined(flags.title, process.env.TASK_TITLE, fields.title));
  const [command, ...args] = cmdArgs;

  if (!title) throw new Error("Missing task title. Use --title or TASK_TITLE");
  if (!command) {
    throw new Error("Missing command. Use: npm run task:daemon -- --title ... -- <cmd>");
  }

  const runtime = new TaskSyncRuntime({
    intervalMs: Number(firstDefined(flags.intervalMs, flags["interval-ms"], 15000)),
  });
  const id = await runtime.start({
    ...fields,
    title,
    status: "in_progress",
    lastAction: cleanString(firstDefined(flags.lastAction, flags["last-action"])) ?? "started",
    lastActionAt: Date.now(),
  });

  const child = spawn(command, args, { stdio: "inherit", shell: true });
  const exitCode = await new Promise((resolve, reject) => {
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", reject);
  });

  if (exitCode === 0) {
    await runtime.done({ lastAction: "completed", lastActionAt: Date.now() });
  } else {
    await runtime.fail(`exit:${exitCode}`, { lastAction: "failed", lastActionAt: Date.now() });
  }

  console.log(JSON.stringify({ ok: exitCode === 0, id, exitCode }, null, 2));
  process.exit(exitCode);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

