import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// define the Alert type used in the schema
export const alert = v.object({
  identifier: v.string(),
  sent: v.string(),
  references: v.optional(v.string()),
  info: v.object({
    // 'category', 'event', 'responseType', 'urgency', 'severity', 'certainty', 'onset', 'expires', 'senderName', 'headline', 'description', 'instruction', 'web', 'parameter', 'area'
    area: v.object({
      areaDesc: v.string(),
      polygon: v.array(v.string()),
    }),
    category: v.string(),
    event: v.string(),
    responseType: v.string(),
    urgency: v.string(),
    severity: v.string(),
    certainty: v.string(),
    onset: v.string(),
    expires: v.string(),
    senderName: v.string(),
    headline: v.string(),
    description: v.string(),
    instruction: v.string(),
    web: v.string(),
    parameter: v.array(
      v.object({
        valueName: v.string(),
        value: v.string(),
      }),
    ),
  }),
  Signature: v.any(),
  msgType: v.any(),
  scope: v.string(),
  sender: v.string(),
  xmlns: v.string(),
  status: v.string(),
  _history: v.any(), // This will hold an array of previous Alert objects
});

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  alerts: defineTable({
    updatedAt: v.number(),
    alerts: v.array(alert),
  }),
});
