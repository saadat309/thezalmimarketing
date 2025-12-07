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
    features: z
      .array(
        z.object({
          type: z.string(),
          value: z.string(),
        })
      )
      .optional(),

    // ===== PRICING =====
    price_amount: z.coerce
      .number()
      .int()
      .min(0, "Price must be greater than 0"),
    is_discounted: z.boolean().default(false),
    price_original_amount: z.coerce.number().int().min(0).optional(),
    price_period_unit: z
      .enum(["day", "week", "month", "year"])
      .default("month"),
    price_period_value: z.coerce.number().int().min(1).default(1),

    // ===== DISCOUNT (conditional on is_discounted = true) =====
    discount_type: z.enum(["percentage", "fixed"]).optional(),
    discount_value: z.coerce.number().min(0).optional(),

    // ===== INSTALLMENT (conditional on purchase_type = 'installment') =====
    installment_advance_amount: z.coerce.number().int().min(0).optional(),
    installment_total_period_text: z.string().optional(),
    installment_amount: z.coerce.number().int().min(0).optional(),
    installment_display_mode: z.enum(["advance", "installment"]).optional(),

    // ===== TAXATION =====
    vat_amount: z.coerce.number().min(0).max(100).default(0),

    // ===== LOCATION & CATEGORIES =====
    category_id: z.coerce.number().optional(),
    city_id: z.coerce.number().optional(),
    society_id: z.coerce.number().optional(),
    phase_id: z.coerce.number().optional(),

    // ===== LABELS/TAGS =====
    labels: z.array(z.coerce.number()).optional(),

    // ===== RICH TEXT DETAIL DESCRIPTIONS =====
    detail_descriptions: z
      .array(
        z.object({
          heading: z.string().min(1, "Heading is required"),
          text: z.string().min(1, "Description text is required"),
        })
      )
      .optional(),

    // ===== MEDIA & LINKS =====
    embed_link: z.string().url().optional().or(z.string().length(0)),
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
      if (!data.discount_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discount_type"],
          message: "Discount type is required when property is discounted",
        });
      }
      if (data.discount_value === undefined || data.discount_value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discount_value"],
          message: "Discount value is required when property is discounted",
        });
      }
      if (!data.price_original_amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price_original_amount"],
          message: "Original price is required for discounted properties",
        });
      }
    }

    // Conditional validation: if purchase_type is 'installment', installment fields are required
    if (data.purchase_type === "installment") {
      if (!data.installment_amount || data.installment_amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["installment_amount"],
          message: "Installment amount is required and must be greater than 0",
        });
      }
      if (!data.installment_total_period_text) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["installment_total_period_text"],
          message: "Total period is required for installment properties",
        });
      }
    }
  });
