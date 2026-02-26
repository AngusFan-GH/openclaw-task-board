import { spawn } from "node:child_process";
import {
  cleanString,
  firstDefined,
  parseFlags,
  parseCommonTaskFields,
} from "./task_cli_utils.mjs";
import { TaskSyncRuntime } from "./task_runtime.mjs";

export async function runWithTaskAutoLog(options) {
  const {
    title,
    command,
    args,
    createFields = {},
    startAction = "started",
    doneAction = "completed",
    failAction = "failed",
  } = options;

  if (!title) throw new Error("runWithTaskAutoLog requires title");
  if (!command) throw new Error("runWithTaskAutoLog requires command");

  const runtime = new TaskSyncRuntime();
  const id = await runtime.start({
    ...createFields,
    title,
    status: "in_progress",
    lastAction: startAction,
    lastActionAt: Date.now(),
  });

  const child = spawn(command, args, { stdio: "inherit", shell: true });
  const exitCode = await new Promise((resolve, reject) => {
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", reject);
  });

  if (exitCode === 0) {
    await runtime.done({
      status: "done",
      lastAction: doneAction,
      lastActionAt: Date.now(),
    });
  } else {
    await runtime.fail(`exit:${exitCode}`, {
      status: "failed",
      lastAction: failAction,
      lastActionAt: Date.now(),
    });
  }

  return { id, exitCode };
}

if (process.argv[1]?.endsWith("task_auto_log.mjs")) {
  try {
    const rawArgs = process.argv.slice(2);
    const split = rawArgs.indexOf("--");
    const flagArgs = split >= 0 ? rawArgs.slice(0, split) : rawArgs;
    const cmdArgs = split >= 0 ? rawArgs.slice(split + 1) : [];
    const flags = parseFlags(flagArgs);
    const fields = parseCommonTaskFields(flags);

    const title = cleanString(firstDefined(flags.title, process.env.TASK_TITLE, fields.title));
    const startAction = cleanString(
      firstDefined(flags.startAction, flags["start-action"], process.env.TASK_START_ACTION),
    );
    const doneAction = cleanString(
      firstDefined(flags.doneAction, flags["done-action"], process.env.TASK_DONE_ACTION),
    );
    const failAction = cleanString(
      firstDefined(flags.failAction, flags["fail-action"], process.env.TASK_FAIL_ACTION),
    );

    const [command, ...args] = cmdArgs;
    if (!title) throw new Error("Missing task title. Use --title or TASK_TITLE");
    if (!command) throw new Error("Missing command. Use: node scripts/task_auto_log.mjs ... -- <cmd>");

    const { id, exitCode } = await runWithTaskAutoLog({
      title,
      command,
      args,
      createFields: fields,
      startAction,
      doneAction,
      failAction,
    });

    console.log(JSON.stringify({ ok: exitCode === 0, id, exitCode }, null, 2));
    process.exit(exitCode);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
