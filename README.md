# Next.js + Convex Task Board

A realtime task board built with Next.js App Router and Convex.

## Features

- **Task Board**: full task logging fields + filters + drag/drop status updates
- **Calendar**: scheduled tasks & cron jobs timeline
- **Memory**: searchable memory library (title/content/tags)
- **Content Pipeline**: track content lifecycle (`idea`, `drafting`, `review`, `published`)
- **Team**: maintain roster, role, focus, and availability (`active`, `away`)
- **Office**: shared policies/tools/links/notes reference board
- **System Status panel**: current running process IDs (from in-progress tasks with `relatedId`) and latest update timestamps
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

## Task sync (CLI)

To add tasks programmatically (e.g., from automation):

```bash
CONVEX_URL=<your_convex_url> npm run task:add "Title" "optional description" me
```

- `me` or `you` controls the assignee.
- Tasks are created in `todo` status.

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
