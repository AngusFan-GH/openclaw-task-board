import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("user"),
        v.literal("agent"),
        v.literal("subagent"),
        v.literal("cron"),
      ),
    ),
    taskType: v.optional(
      v.union(
        v.literal("coding"),
        v.literal("browsing"),
        v.literal("message"),
        v.literal("ops"),
        v.literal("analysis"),
      ),
    ),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("waiting"),
      v.literal("done"),
      v.literal("failed"),
      v.literal("canceled"),
    ),
    lastAction: v.optional(v.string()),
    lastActionAt: v.optional(v.number()),
    relatedId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    assignee: v.union(v.literal("me"), v.literal("you")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_task_type", ["taskType"])
    .index("by_assignee", ["assignee"]),

  calendar: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    source: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["scheduledFor"]),

  memories: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  pipeline: defineTable({
    title: v.string(),
    stage: v.union(
      v.literal("idea"),
      v.literal("drafting"),
      v.literal("review"),
      v.literal("published"),
    ),
    owner: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_dueAt", ["dueAt"]),

  team: defineTable({
    name: v.string(),
    role: v.string(),
    focus: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("away")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_role", ["role"]),

  office: defineTable({
    title: v.string(),
    category: v.union(
      v.literal("policy"),
      v.literal("tool"),
      v.literal("link"),
      v.literal("note"),
    ),
    detail: v.string(),
    location: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]),
});
