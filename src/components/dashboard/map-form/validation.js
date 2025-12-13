import { z } from "zod";

export const mapFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  hide: z.boolean().default(false),
  mapImage: z.array(z.any()).optional(),
  mapPdf: z.array(z.any()).optional(),
});
