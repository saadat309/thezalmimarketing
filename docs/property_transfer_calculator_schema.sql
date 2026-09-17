-- ============================================================
-- PROPERTY TRANSFER CALCULATOR
-- TABLE CREATION ONLY
-- ============================================================

-- 1. Calculator Phases
USE zalmimarketing;
CREATE TABLE calculator_phases (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    city_id BIGINT UNSIGNED NOT NULL,
    society_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_phase_location (
        city_id,
        society_id,
        name
    ),

    KEY idx_calculator_phases_city (city_id),
    KEY idx_calculator_phases_society (society_id),
    KEY idx_calculator_phases_active (is_active),

    CONSTRAINT fk_calculator_phases_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id),

    CONSTRAINT fk_calculator_phases_society
        FOREIGN KEY (society_id)
        REFERENCES societies(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 2. Calculator Blocks
CREATE TABLE calculator_blocks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    calculator_phase_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_block_phase_name (
        calculator_phase_id,
        name
    ),

    KEY idx_calculator_blocks_phase (calculator_phase_id),
    KEY idx_calculator_blocks_active (is_active),

    CONSTRAINT fk_calculator_blocks_phase
        FOREIGN KEY (calculator_phase_id)
        REFERENCES calculator_phases(id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 3. Calculator Property Types
CREATE TABLE calculator_property_types (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    property_type VARCHAR(80) NOT NULL,
    label VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_property_type (
        category,
        property_type
    ),

    KEY idx_calculator_property_types_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 4. Calculator DC / FBR Rates
CREATE TABLE calculator_rates (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    calculator_phase_id BIGINT UNSIGNED NOT NULL,
    calculator_block_id BIGINT UNSIGNED NULL,
    calculator_property_type_id BIGINT UNSIGNED NOT NULL,

    dc_per_marla DECIMAL(18,2) NULL,
    dc_per_sqft DECIMAL(18,4) NULL,

    fbr_per_marla DECIMAL(18,2) NULL,
    fbr_per_sqft DECIMAL(18,4) NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_rate_scope (
        calculator_phase_id,
        calculator_block_id,
        calculator_property_type_id
    ),

    KEY idx_calculator_rates_phase (calculator_phase_id),
    KEY idx_calculator_rates_block (calculator_block_id),
    KEY idx_calculator_rates_property_type (
        calculator_property_type_id
    ),
    KEY idx_calculator_rates_active (is_active),

    CONSTRAINT fk_calculator_rates_phase
        FOREIGN KEY (calculator_phase_id)
        REFERENCES calculator_phases(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_calculator_rates_block
        FOREIGN KEY (calculator_block_id)
        REFERENCES calculator_blocks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_calculator_rates_property_type
        FOREIGN KEY (calculator_property_type_id)
        REFERENCES calculator_property_types(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 5. Calculator Transfer Fees
CREATE TABLE calculator_transfer_fees (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    calculator_phase_id BIGINT UNSIGNED NOT NULL,
    calculator_block_id BIGINT UNSIGNED NULL,

    category VARCHAR(50) NOT NULL,

    reference_amount DECIMAL(18,2) NOT NULL,
    reference_size DECIMAL(18,4) NOT NULL,
    reference_unit ENUM('marla', 'sqft') NOT NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_transfer_fee_scope (
        calculator_phase_id,
        calculator_block_id,
        category
    ),

    KEY idx_calculator_transfer_fees_phase (
        calculator_phase_id
    ),
    KEY idx_calculator_transfer_fees_block (
        calculator_block_id
    ),
    KEY idx_calculator_transfer_fees_category (
        category
    ),
    KEY idx_calculator_transfer_fees_active (
        is_active
    ),

    CONSTRAINT fk_calculator_transfer_fees_phase
        FOREIGN KEY (calculator_phase_id)
        REFERENCES calculator_phases(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_calculator_transfer_fees_block
        FOREIGN KEY (calculator_block_id)
        REFERENCES calculator_blocks(id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 6. Calculator Fixed Fees
CREATE TABLE calculator_fees (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    fee_key VARCHAR(80) NOT NULL,
    fee_name VARCHAR(150) NOT NULL,

    amount DECIMAL(18,2) NOT NULL,

    charge_unit ENUM(
        'transaction',
        'property',
        'owner'
    ) NOT NULL DEFAULT 'transaction',

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_fee_key (fee_key),
    KEY idx_calculator_fees_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 7. Calculator Percentage / Tax Rates
CREATE TABLE calculator_tax_rates (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    rate_key VARCHAR(80) NOT NULL,
    rate_name VARCHAR(150) NOT NULL,

    rate DECIMAL(8,4) NOT NULL,

    rate_unit ENUM('percent')
        NOT NULL DEFAULT 'percent',

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_calculator_tax_rate_key (rate_key),
    KEY idx_calculator_tax_rates_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE calculator_fee_rules (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fee_id BIGINT UNSIGNED NOT NULL,

    property_type ENUM('Residential', 'Commercial') NOT NULL,
    unit ENUM('marla', 'kanal') NOT NULL,

    min_area DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_area DECIMAL(10,2) DEFAULT NULL,

    fee_amount DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (fee_id) REFERENCES calculator_fees(id) ON DELETE CASCADE
);


  INSERT INTO calculator_property_types
    (category, property_type, label, sort_order)
VALUES
    ('Residential', 'Plot', 'Plot', 1),
    ('Residential', 'House', 'House', 2),
    ('Residential', 'Appartment', 'Appartment', 3),
    ('Residential', 'File', 'File', 4),

    ('Commercial', 'Plot', 'Plot', 1),
    ('Commercial', 'Plaza/Building', 'Plaza/Building', 2),
    ('Commercial', 'Shop', 'Shop', 3),
    ('Commercial', 'File', 'File', 4),

    ('Sector Shop', 'Plot', 'Plot', 1),
    ('Sector Shop', 'Shop', 'Shop', 2),
    ('Sector Shop', 'File', 'File', 3);

    INSERT INTO calculator_fees
    (fee_key, fee_name, amount, charge_unit)
VALUES
    ('biana', 'Biana', 4000, 'transaction'),
    ('verification', 'Verification', 5250, 'transaction'),
    ('transfer_file_plot_file', 'Transfer File - Plot/File', 7000, 'owner'),
    ('transfer_file_other', 'Transfer File - Other', 8000, 'owner'),
    ('membership_fee_residential', 'Membership Fee - Residential', 150000, 'owner'),
    ('membership_fee_commercial', 'Membership Fee - Commercial/Sector Shop', 200000, 'owner'),
    ('membership_form', 'Membership Form', 2100, 'owner'),
    ('urgent_transfer', 'Urgent Transfer Fee', 70000, 'owner'),
    ('executive_transfer', 'Executive Transfer Fee', 80000, 'owner'),
    ('mutation', 'Mutation', 300, 'transaction'),
    ('plra_service', 'PLRA Service Charges', 3600, 'transaction'),
    ('plra_mutation', 'PLRA Mutation', 200, 'transaction'),
    ('online_psid', 'Online PSID', 15, 'transaction'),
    ('sports_fund', 'Sports Fund', 10500, 'property');

    INSERT INTO calculator_tax_rates
    (rate_key, rate_name, rate, rate_unit)
VALUES
    ('purchaser_236k_filer', 'Purchaser 236K - Filer', 1.25, 'percent'),
    ('purchaser_236k_non_filer', 'Purchaser 236K - Non-Filer', 10.50, 'percent'),
    ('seller_236c_filer', 'Seller 236C - Filer', 2.75, 'percent'),
    ('seller_236c_non_filer', 'Seller 236C - Non-Filer', 11.50, 'percent');


INSERT INTO calculator_fee_rules
(fee_id, property_type, unit, min_area, max_area, fee_amount)
SELECT id, 'Residential', 'marla', 0, 10, 75000
FROM calculator_fees
WHERE fee_key = 'membership_fee_residential';

INSERT INTO calculator_fee_rules
(fee_id, property_type, unit, min_area, max_area, fee_amount)
SELECT id, 'Residential', 'marla', 10, 40, 150000
FROM calculator_fees
WHERE fee_key = 'membership_fee_residential';

INSERT INTO calculator_fee_rules
(fee_id, property_type, unit, min_area, max_area, fee_amount)
SELECT id, 'Residential', 'marla', 40, NULL, 200000
FROM calculator_fees
WHERE fee_key = 'membership_fee_residential';

INSERT INTO calculator_fee_rules
(fee_id, property_type, unit, min_area, max_area, fee_amount)
SELECT id, 'Commercial', 'marla', 0, 4, 150000
FROM calculator_fees
WHERE fee_key = 'membership_fee_commercial';

INSERT INTO calculator_fee_rules
(fee_id, property_type, unit, min_area, max_area, fee_amount)
SELECT id, 'Commercial', 'marla', 4, NULL, 200000
FROM calculator_fees
WHERE fee_key = 'membership_fee_commercial';