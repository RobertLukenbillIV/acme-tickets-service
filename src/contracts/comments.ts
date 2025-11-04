import { z } from 'zod';
import { BaseEntitySchema } from './base';

/**
 * Comment schema
 */
export const CommentSchema = BaseEntitySchema.extend({
  content: z.string().min(1).max(2000),
  ticketId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type Comment = z.infer<typeof CommentSchema>;

/**
 * Create comment request
 */
export const CreateCommentRequestSchema = z.object({
  content: z.string().min(1).max(2000),
  ticketId: z.string().uuid(),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;

/**
 * Update comment request
 */
export const UpdateCommentRequestSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
});

export type UpdateCommentRequest = z.infer<typeof UpdateCommentRequestSchema>;
