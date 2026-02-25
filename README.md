# Next.js + Convex Task Board

A realtime task board built with Next.js App Router and Convex.

## Features

- Track tasks with status: `todo`, `in_progress`, `done`
- Track assignee: `me` vs `you`
- Create tasks with title, optional description, and assignee
- Move tasks across board columns
- Reassign tasks between `me` and `you`
- Realtime board updates via Convex subscriptions

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
- `convex/tasks.ts`: Convex task query/mutations (`list`, `create`, `update`, `move`)
- `src/app/ConvexClientProvider.tsx`: Convex React provider
- `src/app/page.tsx`: Task board UI

## Notes

- Run `npx convex dev` whenever developing Convex functions to keep generated files up-to-date.
- If `NEXT_PUBLIC_CONVEX_URL` is missing, the app throws an explicit startup error.
