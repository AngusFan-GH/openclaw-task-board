import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    assignee: v.union(v.literal("me"), v.literal("you")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
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
});
