-- ============================================================================
-- Export queries: lcss_v2 (legacy DB) -> CSV templates for lss-v3 import
-- Run each SELECT against the lcss_v2 database and export the result grid
-- as CSV (column headers already match each *_template.csv exactly).
-- Tables in lcss_v2 are prefixed `lcssv2_`.
-- ============================================================================

---

-- 1) academic_industry_template.csv (name, abbreviation, description)
-- Only active industries are exported. lcss_v2 has no description column.

---

SELECT
industry_name AS name,
industry_abbreviation AS abbreviation,
'' AS description
FROM lcssv2_industry
WHERE industry_is_active = 1
ORDER BY industry_name;

---

-- 2) academic_level_template.csv (name, abbreviation, description)
-- lcss_v2 has no abbreviation/description columns for this table.

---

SELECT
academic_level_name AS name,
'' AS abbreviation,
'' AS description
FROM lcssv2_academic_level
WHERE academic_level_is_active = 1
ORDER BY academic_level_name;

---

-- 3) academic_program_template.csv (name, abbreviation, description)
-- lcss_v2 has no description column.

---

SELECT
academic_program_name AS name,
academic_program_abbreviation AS abbreviation,
'' AS description
FROM lcssv2_academic_program
WHERE academic_program_is_active = 1
ORDER BY academic_program_name;

---

-- 4) academic_program_type_template.csv (name, abbreviation, description)
-- lcss_v2 has no description column (program_type_citation_value is a
-- citation placeholder, not a description, so it is intentionally excluded).

---

SELECT
program_type_name AS name,
program_type_abbreviation AS abbreviation,
'' AS description
FROM lcssv2_program_type
WHERE program_type_is_active = 1
ORDER BY program_type_name;

---

-- 5) partner_schools_template.csv
-- (school_name, abbreviation, contact_person, contact_email, address)

---

SELECT
partner_school_name AS school_name,
partner_school_abbreviation AS abbreviation,
partner_school_contact_person AS contact_person,
partner_school_email AS contact_email,
partner_school_address AS address
FROM lcssv2_partner_school
WHERE partner_school_is_active = 1
ORDER BY partner_school_name;

---

-- 6) batches_template.csv
-- (batch_code, setup, industry, program_type, date_started,
-- projected_end_date, is_open, is_completed, is_dissolved)
-- lcss_v2's batch table has no start/end date columns, so they are
-- derived from the min/max of the trainees assigned to each batch.

---

SELECT
b.batch_number AS batch_code,
b.batch_setup AS setup,
i.industry_name AS industry,
pt.program_type_name AS program_type,
MIN(NULLIF(t.trainee_start_date, '')) AS date_started,
MAX(NULLIF(t.trainee_end_date, '')) AS projected_end_date,
b.batch_is_open AS is_open,
b.batch_is_completed AS is_completed,
b.batch_is_dissolved AS is_dissolved
FROM lcssv2_batch b
LEFT JOIN lcssv2_industry i ON i.industry_aid = b.batch_industry_id
LEFT JOIN lcssv2_program_type pt ON pt.program_type_aid = b.batch_program_type_id
LEFT JOIN lcssv2_trainee t ON t.trainee_batch_id = b.batch_aid
GROUP BY b.batch_aid, b.batch_number, b.batch_setup, i.industry_name,
pt.program_type_name, b.batch_is_open, b.batch_is_completed, b.batch_is_dissolved
ORDER BY b.batch_number;
