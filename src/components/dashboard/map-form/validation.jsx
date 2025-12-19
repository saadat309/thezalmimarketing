import { z } from "zod";

export const mapFormSchema = z.object({
  title: z.string().min(1, "Map title is required"),
  description: z.string().nullable().optional(),
  map_pic: z.string().nullable().optional(),
  map_thumb: z.string().nullable().optional(),
  pdf: z.string().nullable().optional(),
  embed_link: z.string().nullable().optional(),
  hide: z.boolean().default(false),
  city_id: z.coerce.number().nullable().optional(),
  society_id: z.coerce.number().nullable().optional(),
  phase_id: z.coerce.number().nullable().optional(),
});