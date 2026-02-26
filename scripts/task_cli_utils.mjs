export const STATUS_VALUES = [
  "todo",
  "in_progress",
  "blocked",
  "waiting",
  "done",
  "failed",
  "canceled",
];
export const ASSIGNEE_VALUES = ["me", "you"];
export const SOURCE_VALUES = ["user", "agent", "subagent", "cron"];
export const TASK_TYPE_VALUES = ["coding", "browsing", "message", "ops", "analysis"];

export function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const withoutPrefix = token.slice(2);
    if (!withoutPrefix) continue;

    if (withoutPrefix.includes("=")) {
      const [key, ...rest] = withoutPrefix.split("=");
      flags[key] = rest.join("=");
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags[withoutPrefix] = next;
      i += 1;
    } else {
      flags[withoutPrefix] = "true";
    }
  }
  return flags;
}

export function getConvexUrl() {
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
  }
  return convexUrl;
}

export function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== "");
}

export function parseMaybeNumber(value, field) {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for ${field}: ${value}`);
  }
  return parsed;
}

export function validateEnum(value, allowed, field) {
  if (value === undefined) return undefined;
  if (!allowed.includes(value)) {
    throw new Error(`Invalid ${field}: ${value}. Allowed: ${allowed.join(", ")}`);
  }
  return value;
}

export function cleanString(value) {
  if (value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

export function parseCommonTaskFields(flags, env = process.env) {
  return {
    title: cleanString(firstDefined(flags.title, env.TASK_TITLE)),
    description: cleanString(firstDefined(flags.description, env.TASK_DESCRIPTION)),
    status: validateEnum(
      cleanString(firstDefined(flags.status, env.TASK_STATUS)),
      STATUS_VALUES,
      "status",
    ),
    assignee: validateEnum(
      cleanString(firstDefined(flags.assignee, env.TASK_ASSIGNEE)),
      ASSIGNEE_VALUES,
      "assignee",
    ),
    source: validateEnum(
      cleanString(firstDefined(flags.source, env.TASK_SOURCE)),
      SOURCE_VALUES,
      "source",
    ),
    taskType: validateEnum(
      cleanString(firstDefined(flags.taskType, flags["task-type"], flags.type, env.TASK_TYPE)),
      TASK_TYPE_VALUES,
      "taskType",
    ),
    lastAction: cleanString(firstDefined(flags.lastAction, flags["last-action"], env.TASK_LAST_ACTION)),
    lastActionAt: parseMaybeNumber(
      firstDefined(flags.lastActionAt, flags["last-action-at"], env.TASK_LAST_ACTION_AT),
      "lastActionAt",
    ),
    relatedId: cleanString(firstDefined(flags.relatedId, flags["related-id"], env.TASK_RELATED_ID)),
    errorMessage: cleanString(
      firstDefined(flags.errorMessage, flags["error-message"], env.TASK_ERROR_MESSAGE),
    ),
  };
}
