-- Promote prior synthetic File directory JSON rows into the source-shaped
-- properties table. Keep the transitional table intact for rollback/audit.
WITH legacy_files AS (
  SELECT record_json, ROW_NUMBER() OVER (ORDER BY slug) AS row_number
  FROM staging_directories
  WHERE kind = 'files'
)
INSERT OR IGNORE INTO properties (
  id, title, property_type, is_file, file_type, purchase_type, is_furnished,
  short_desc, address, features, beds, baths, area, unit, price_amount,
  is_discounted, price_original_amount, price_period_unit, price_period_value,
  installment_advance_amount, installment_total_period_text, installment_amount,
  installment_display_mode, category_id, city_id, society_id, phase_id,
  embed_link, hide, created_at, updated_at, detail_description_id, slug
)
SELECT
  (SELECT COALESCE(MAX(id), 0) FROM properties) + row_number,
  COALESCE(json_extract(record_json, '$.title'), ''),
  COALESCE(json_extract(record_json, '$.adminForm.property_type'), 'Residential'),
  1,
  COALESCE(json_extract(record_json, '$.fileType'), 'Affidavit'),
  COALESCE(json_extract(record_json, '$.purchaseType'), 'sale'),
  1,
  COALESCE(json_extract(record_json, '$.shortDescription'), ''),
  COALESCE(json_extract(record_json, '$.address'), ''),
  '', 0, 0,
  CAST(COALESCE(json_extract(record_json, '$.area.value'), 0) AS INTEGER),
  json_extract(record_json, '$.area.unit'),
  CAST(COALESCE(json_extract(record_json, '$.price.amount'), 0) AS INTEGER),
  0, 0, 'month', 1, 0, NULL, 0, 'installment',
  NULL,
  (SELECT id FROM cities WHERE slug = json_extract(record_json, '$.city') LIMIT 1),
  (SELECT id FROM societies WHERE slug = json_extract(record_json, '$.society') LIMIT 1),
  (SELECT id FROM phases WHERE slug = json_extract(record_json, '$.phase') LIMIT 1),
  '',
  CASE WHEN json_extract(record_json, '$.public') = 1 THEN 0 ELSE 1 END,
  COALESCE(json_extract(record_json, '$.updatedAt'), CURRENT_TIMESTAMP),
  COALESCE(json_extract(record_json, '$.updatedAt'), CURRENT_TIMESTAMP),
  NULL,
  json_extract(record_json, '$.slug')
FROM legacy_files
WHERE json_extract(record_json, '$.slug') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM properties existing
    WHERE existing.slug = json_extract(legacy_files.record_json, '$.slug')
  );
