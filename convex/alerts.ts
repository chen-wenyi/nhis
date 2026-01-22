import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { alert } from './schema';

// export const list = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db
//       .query('todos')
//       .withIndex('by_creation_time')
//       .order('desc')
//       .collect()
//   },
// })

export const add = mutation({
  args: { alerts: v.array(alert) },
  handler: async (ctx, { alerts }) => {
    return await ctx.db.insert('alerts', {
      updatedAt: Date.now(),
      alerts,
    });
  },
});

// export const toggle = mutation({
//   args: { id: v.id('todos') },
//   handler: async (ctx, args) => {
//     const todo = await ctx.db.get(args.id)
//     if (!todo) {
//       throw new Error('Todo not found')
//     }
//     return await ctx.db.patch(args.id, {
//       completed: !todo.completed,
//     })
//   },
// })

// export const remove = mutation({
//   args: { id: v.id('todos') },
//   handler: async (ctx, args) => {
//     return await ctx.db.delete(args.id)
//   },
// })
