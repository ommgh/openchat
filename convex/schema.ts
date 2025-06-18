import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  threads: defineTable({
    userId: v.string(),
    title: v.string(),
    lastMessageAt: v.number(),
  }).index("by_user_lastMessageAt", ["userId", "lastMessageAt"]),

  messages: defineTable({
    threadId: v.id("threads"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
      v.literal("data"),
    ),
    content: v.string(),
    parts: v.optional(v.any()),
  }).index("by_threadId", ["threadId"]),

  messageSummaries: defineTable({
    threadId: v.id("threads"),
    messageId: v.id("messages"),
    content: v.string(),
  })
    .index("by_threadId", ["threadId"])
    .index("by_messageId", ["messageId"]),

  numbers: defineTable({
    value: v.number(),
  }),
});
