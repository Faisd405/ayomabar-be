import { z } from 'zod';

// Note response schema
export const NoteResponseSchema = z.object({
  id: z.number(),
  content: z.string(),
  userId: z.number(),
  createdAt: z.string().datetime(),
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

// Paginated notes response schema
export const PaginatedNotesResponseSchema = z.object({
  notes: z.array(NoteResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Base response schema for notes
export const NoteBaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});