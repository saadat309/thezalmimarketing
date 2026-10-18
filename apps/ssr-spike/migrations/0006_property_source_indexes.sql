-- Additional lookup indexes from the source MySQL property/label tables.
CREATE INDEX IF NOT EXISTS idx_labels_created_at ON labels (created_at);
CREATE INDEX IF NOT EXISTS idx_labels_updated_at ON labels (updated_at);
CREATE INDEX IF NOT EXISTS idx_properties_is_furnished ON properties (is_furnished);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties (area);
CREATE INDEX IF NOT EXISTS idx_properties_unit ON properties (unit);
CREATE INDEX IF NOT EXISTS idx_properties_type_purchase ON properties (property_type, purchase_type);
CREATE INDEX IF NOT EXISTS idx_property_labels_label_id ON property_labels (label_id);
CREATE INDEX IF NOT EXISTS idx_property_related_related_id ON property_related_properties (related_property_id);
