import { z } from "zod";

export const propertyFormSchema = z
  .object({
    // ===== GENERAL INFORMATION =====
    title: z.string().min(1, "Property name is required"),
    short_desc: z.string().optional(),
    address: z.string().optional(),

    // ===== PROPERTY CLASSIFICATION =====
    property_type: z.enum(["Residential", "Commercial"]),
    is_file: z.boolean().default(false),
    file_type: z.enum(["Allocation", "Affidavit"]).optional(),

    // ===== PURCHASE & FURNISHING =====
    purchase_type: z.enum(["sale", "installment", "rent"]),
    is_furnished: z.boolean().default(true),

    // ===== PHYSICAL SPECIFICATIONS =====
    beds: z.coerce.number().int().min(0).default(0),
    baths: z.coerce.number().int().min(0).default(0),
    area: z.coerce.number().int().min(0).default(0),
    unit: z
      .enum(["sqft", "marla", "kanal", "hectare", "acre", "yard"])
      .optional(),
    features: z.string().optional(),

    // ===== PRICING =====
    price_amount: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .or(z.literal("")),
    is_discounted: z.boolean().default(false),
    price_original_amount: z.coerce.number().int().min(0).optional(),
    price_period_unit: z
      .enum(["day", "week", "month", "year"])
      .default("month"),
    price_period_value: z.coerce.number().int().min(1).default(1),

    // ===== INSTALLMENT (conditional on purchase_type = 'installment') =====
    installment_advance_amount: z.coerce.number().int().min(0).optional(),
    installment_total_period_text: z.string().optional(),
    installment_amount: z.coerce.number().int().min(0).optional(),
    installment_display_mode: z.enum(["advance", "installment"]).optional(),

    // ===== TAXATION =====
    vat_amount: z.coerce.number().min(0).max(100).default(0),

    // ===== LOCATION & CATEGORIES =====
    category_id: z.coerce.number().optional().nullable(),
    city_id: z.coerce.number().optional().nullable(),
    society_id: z.coerce.number().optional().nullable(),
    phase_id: z.coerce.number().optional().nullable(),

    // ===== RELATED PRODUCTS =====
    related_products: z.array(z.coerce.string()).optional(),

    // ===== LABELS/TAGS =====
    labels: z.array(z.coerce.string()).optional(),

    // ===== RICH TEXT DETAILED DESCRIPTION CONTENT =====
    detailed_description_content: z.string().optional(),

    // ===== MEDIA & LINKS =====
    embed_link: z.string().optional(),
    media_id: z.coerce.number().optional(),

    // ===== PUBLISHING =====
    hide: z.boolean().default(false),
    template: z.enum(["default", "minimal", "detailed"]).default("default"),
  })
  .superRefine((data, ctx) => {
    // Conditional validation: if is_file is true, file_type is required
    if (data.is_file && !data.file_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["file_type"],
        message: "File type is required when property is a file",
      });
    }

    // Conditional validation: if is_discounted is true, discount fields are required
    if (data.is_discounted) {
      if (!data.price_original_amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price_original_amount"],
          message: "Original price is required for discounted properties",
        });
      }
    }
  });
