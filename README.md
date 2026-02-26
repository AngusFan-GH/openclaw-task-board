# Next.js + Convex Task Board

A realtime task board built with Next.js App Router and Convex.

## Features

- **Task Board**: full task logging fields + filters + drag/drop status updates
- **Calendar**: scheduled tasks & cron jobs timeline
- **Memory**: searchable memory library (title/content/tags)
- **Content Pipeline**: track content lifecycle (`idea`, `drafting`, `review`, `published`)
- **Team**: maintain roster, role, focus, and availability (`active`, `away`)
- **Office**: shared policies/tools/links/notes reference board
- **System Status panel**: moved into a compact collapsible card in Task Board (collapsed by default)
- **Create Task (Basic + Advanced)**: basic fields stay visible, advanced task-log fields are behind a toggle
- Realtime updates via Convex subscriptions

## Tech Stack

- Next.js (App Router)
- Convex (database + realtime queries/mutations)
- React

## Setup

1. Install dependencies:

```bash
npm install
```

2. Initialize/start Convex in one terminal:

```bash
npx convex dev
```

This generates Convex types and prints your deployment URL.

3. Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_CONVEX_URL=<your_convex_deployment_url>
```

Example:

```bash
NEXT_PUBLIC_CONVEX_URL=https://YOUR-DEPLOYMENT.convex.cloud
```

4. Start Next.js in another terminal:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Project Structure

- `convex/schema.ts`: Convex database schema
- `convex/tasks.ts`: Convex task query/mutations (`list`, `create`, `update`, `move`) with task-log fields
- `convex/pipeline.ts`: content pipeline query/mutations (`list`, `create`, `update`)
- `convex/team.ts`: team query/mutations (`list`, `create`, `update`)
- `convex/office.ts`: office query/mutations (`list`, `create`, `update`)
- `src/app/ConvexClientProvider.tsx`: Convex React provider
- `src/app/page.tsx`: Task board UI
- `src/app/lib/taskLog.ts`: lightweight client helper API for task create/update/status changes
- `src/app/pipeline/page.tsx`: Content Pipeline UI
- `src/app/team/page.tsx`: Team UI
- `src/app/office/page.tsx`: Office UI

## Notes

- Run `npx convex dev` whenever developing Convex functions to keep generated files up-to-date.
- If `NEXT_PUBLIC_CONVEX_URL` is missing, the app throws an explicit startup error.

## UX toggles

- Navigation extras (`Content Pipeline`, `Team`, `Office`) can be hidden with a simple code flag:
  - Edit `src/app/components/NavTabs.tsx`
  - Set `SHOW_EXTRAS = false` (default) to hide extras
  - Set `SHOW_EXTRAS = true` to show extras tabs

## i18n (zh/en)

- The UI uses a lightweight client dictionary (no route-level locale segments).
- Default language is `zh`.
- Use the header toggle (`中文` / `EN`) on the Task Board to switch language.
- The selected language is saved in `localStorage` (`openclaw-locale`) and applies to:
  - Task Board labels
  - Shared navigation tabs
- Dictionary and provider files:
  - `src/app/i18n/dictionaries.ts`
  - `src/app/i18n/I18nProvider.tsx`

## Task sync (CLI)

Use Convex task APIs from scripts:

```bash
CONVEX_URL=<your_convex_url> npm run task:log -- --title "Implement CLI" --source agent --type coding --status in_progress --assignee me --relatedId local-123 --lastAction "started"
```

```bash
CONVEX_URL=<your_convex_url> npm run task:update -- --id <task_id> --status done --lastAction "completed"
```

Or update by exact title:

```bash
CONVEX_URL=<your_convex_url> npm run task:update -- --title "Implement CLI" --status failed --lastAction "blocked by CI" --error-message "lint failed"
```

- Both commands support all task fields in the schema.
- `task:log` supports: `--title --source --type --status --assignee --relatedId --lastAction` (plus optional description/time/error fields).
- `task:update` supports `--id` or `--title`, plus update fields such as `--status --lastAction --error-message`.
- Flags map to `TASK_*` env vars as fallback (`TASK_TITLE`, `TASK_STATUS`, `TASK_SOURCE`, `TASK_TYPE`, `TASK_ASSIGNEE`, `TASK_LAST_ACTION`, `TASK_LAST_ACTION_AT`, `TASK_RELATED_ID`, `TASK_ERROR_MESSAGE`, and `TASK_ID` for updates).

## Auto logging helper (local dev)

Lightweight wrapper that logs `in_progress` before running a command, then `done`/`failed` by exit code:

```bash
CONVEX_URL=<your_convex_url> npm run task:auto -- --title "Local dev build" --source agent --task-type ops -- npm run build
```

Daemon-like runner with heartbeat updates (keeps `lastActionAt` fresh while command runs):

```bash
CONVEX_URL=<your_convex_url> npm run task:daemon -- --title "Long build" --source agent --type ops --relatedId proc-42 --interval-ms 10000 -- npm run build
```

Because task state is persisted through Convex mutations, the board updates in real time as logs/updates/heartbeats arrive.

Example as a Node helper:

```js
import { runWithTaskAutoLog } from "./scripts/task_auto_log.mjs";

await runWithTaskAutoLog({
  title: "Lint project",
  command: "npm",
  args: ["run", "lint"],
  createFields: { source: "agent", taskType: "ops", assignee: "me" },
});
```

## Task Logging Schema

`tasks` now includes:

- `source`: `user | agent | subagent | cron`
- `taskType`: `coding | browsing | message | ops | analysis`
- `status`: `todo | in_progress | blocked | waiting | done | failed | canceled`
- `lastAction`: short text for latest action
- `lastActionAt`: unix ms timestamp for latest action
- `relatedId`: related session/subagent/process ID
- `errorMessage`: optional error detail

The task board UI displays these fields on each card and supports filtering by:

- `status`
- `source`
- `taskType`
- assignee
- text query

## Client Helper API

Use [`src/app/lib/taskLog.ts`](src/app/lib/taskLog.ts) to keep task-log writes consistent.

It exposes:

- `logTask(args)` -> wraps `tasks:create`
- `updateTaskLog(args)` -> wraps `tasks:update`
- `setTaskStatus(args)` -> wraps `tasks:move`
