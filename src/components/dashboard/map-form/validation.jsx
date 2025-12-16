import { z } from "zod";

export const mapFormSchema = z.object({
  title: z.string().min(1, "Map title is required"),
  description: z.string().optional(),
  map_pic: z.string().optional(),
  map_thumb: z.string().optional(),
  pdf: z.string().optional(),
  embed_link: z.string().optional(),
  hide: z.boolean().default(false),
  city_id: z.coerce.number().optional(),
  society_id: z.coerce.number().optional(),
  phase_id: z.coerce.number().optional(),
});