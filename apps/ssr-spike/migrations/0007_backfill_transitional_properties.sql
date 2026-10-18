-- Preserve the prior synthetic D1 editor rows when switching from the
-- transitional JSON adapter to source-shaped tables. No media values are copied.
INSERT OR IGNORE INTO labels (name, is_badge, is_filter, hide, slug)
SELECT json_extract(label.value, '$.name'), 1, 1, 0, json_extract(label.value, '$.slug')
FROM staging_properties AS staging, json_each(staging.property_json, '$.labels') AS label
WHERE json_extract(label.value, '$.slug') IS NOT NULL;

INSERT OR IGNORE INTO detail_descriptions (id, text, created_at, updated_at, hide)
SELECT staging.id, json_extract(staging.property_json, '$.descriptionHtml'), staging.created_at, staging.created_at, 0
FROM staging_properties AS staging
WHERE length(COALESCE(json_extract(staging.property_json, '$.descriptionHtml'), '')) > 0;

UPDATE detail_descriptions
SET text = (SELECT json_extract(staging.property_json, '$.descriptionHtml')
    FROM staging_properties AS staging WHERE staging.id = detail_descriptions.id),
    updated_at = CURRENT_TIMESTAMP,
    hide = 0
WHERE id IN (SELECT id FROM staging_properties
  WHERE length(COALESCE(json_extract(property_json, '$.descriptionHtml'), '')) > 0);

INSERT INTO properties (
  id, title, property_type, is_file, file_type, purchase_type, is_furnished, short_desc, address, features,
  beds, baths, area, unit, price_amount, is_discounted, price_original_amount, price_period_unit, price_period_value,
  installment_advance_amount, installment_total_period_text, installment_amount, installment_display_mode, media_id,
  category_id, city_id, society_id, phase_id, embed_link, hide, created_at, updated_at, detail_description_id, slug
)
SELECT
  staging.id,
  COALESCE(json_extract(staging.property_json, '$.title'), staging.title),
  COALESCE(json_extract(staging.property_json, '$.adminForm.property_type'), json_extract(staging.property_json, '$.propertyType'), staging.property_type),
  COALESCE(json_extract(staging.property_json, '$.fileOnly'), staging.file_only, 0),
  COALESCE(json_extract(staging.property_json, '$.adminForm.file_type'), 'Affidavit'),
  COALESCE(json_extract(staging.property_json, '$.adminForm.purchase_type'), json_extract(staging.property_json, '$.purchaseType'), staging.purchase_type),
  COALESCE(json_extract(staging.property_json, '$.adminForm.is_furnished'), json_extract(staging.property_json, '$.isFurnished'), 1),
  COALESCE(json_extract(staging.property_json, '$.shortDescription'), ''),
  COALESCE(json_extract(staging.property_json, '$.location.address'), ''),
  COALESCE(json_extract(staging.property_json, '$.adminForm.features'), ''),
  COALESCE(json_extract(staging.property_json, '$.beds'), staging.beds, 0),
  COALESCE(json_extract(staging.property_json, '$.baths'), staging.baths, 0),
  COALESCE(CAST(json_extract(staging.property_json, '$.area.value') AS INTEGER), CAST(staging.area_value AS INTEGER), 0),
  COALESCE(json_extract(staging.property_json, '$.area.unit'), staging.area_unit),
  COALESCE(CAST(json_extract(staging.property_json, '$.price') AS INTEGER), 0),
  COALESCE(json_extract(staging.property_json, '$.adminForm.is_discounted'), json_extract(staging.property_json, '$.isDiscounted'), 0),
  COALESCE(CAST(json_extract(staging.property_json, '$.adminForm.price_original_amount') AS INTEGER), 0),
  COALESCE(json_extract(staging.property_json, '$.adminForm.price_period_unit'), 'month'),
  COALESCE(json_extract(staging.property_json, '$.adminForm.price_period_value'), 1),
  COALESCE(CAST(json_extract(staging.property_json, '$.adminForm.installment_advance_amount') AS INTEGER), 0),
  json_extract(staging.property_json, '$.adminForm.installment_total_period_text'),
  COALESCE(CAST(json_extract(staging.property_json, '$.adminForm.installment_amount') AS INTEGER), 0),
  COALESCE(json_extract(staging.property_json, '$.adminForm.installment_display_mode'), 'installment'),
  NULL,
  (SELECT id FROM categories WHERE slug = json_extract(staging.property_json, '$.category.slug') LIMIT 1),
  (SELECT id FROM cities WHERE slug = json_extract(staging.property_json, '$.location.city.slug') LIMIT 1),
  (SELECT id FROM societies WHERE slug = json_extract(staging.property_json, '$.location.society.slug') LIMIT 1),
  (SELECT id FROM phases WHERE slug = json_extract(staging.property_json, '$.location.phase.slug') LIMIT 1),
  COALESCE(json_extract(staging.property_json, '$.adminForm.embed_link'), ''),
  CASE WHEN COALESCE(json_extract(staging.property_json, '$.public'), staging.is_public, 0) = 1 THEN 0 ELSE 1 END,
  COALESCE(json_extract(staging.property_json, '$.createdAt'), staging.created_at),
  COALESCE(json_extract(staging.property_json, '$.updatedAt'), staging.created_at),
  CASE WHEN length(COALESCE(json_extract(staging.property_json, '$.descriptionHtml'), '')) > 0 THEN staging.id ELSE NULL END,
  staging.slug
FROM staging_properties AS staging
WHERE 1
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title, property_type = excluded.property_type, is_file = excluded.is_file,
  file_type = excluded.file_type, purchase_type = excluded.purchase_type, is_furnished = excluded.is_furnished,
  short_desc = excluded.short_desc, address = excluded.address, features = excluded.features,
  beds = excluded.beds, baths = excluded.baths, area = excluded.area, unit = excluded.unit,
  price_amount = excluded.price_amount, is_discounted = excluded.is_discounted,
  price_original_amount = excluded.price_original_amount, price_period_unit = excluded.price_period_unit,
  price_period_value = excluded.price_period_value, installment_advance_amount = excluded.installment_advance_amount,
  installment_total_period_text = excluded.installment_total_period_text, installment_amount = excluded.installment_amount,
  installment_display_mode = excluded.installment_display_mode, media_id = NULL,
  category_id = excluded.category_id, city_id = excluded.city_id, society_id = excluded.society_id,
  phase_id = excluded.phase_id, embed_link = excluded.embed_link, hide = excluded.hide,
  created_at = excluded.created_at, updated_at = excluded.updated_at,
  detail_description_id = excluded.detail_description_id, slug = excluded.slug;

DELETE FROM property_labels
WHERE property_id IN (SELECT id FROM staging_properties);

INSERT OR IGNORE INTO property_labels (property_id, label_id, position)
SELECT staging.id, labels.id, CAST(label.key AS INTEGER)
FROM staging_properties AS staging,
  json_each(staging.property_json, '$.labels') AS label
JOIN labels ON labels.slug = json_extract(label.value, '$.slug');

DELETE FROM property_related_properties
WHERE property_id IN (SELECT id FROM staging_properties);

INSERT OR IGNORE INTO property_related_properties (property_id, related_property_id, position)
SELECT staging.id, related.id, CAST(related_slug.key AS INTEGER)
FROM staging_properties AS staging,
  json_each(staging.property_json, '$.adminForm.related_products') AS related_slug
JOIN properties AS related ON related.slug = related_slug.value AND related.id != staging.id;
