-- ============================================================================
-- Export queries: lcs-v1-prod (legacy v1 DB) -> CSV templates for lss-v3 import
-- Run each SELECT against the legacy v1 database and export the result grid as
-- CSV, matching the column headers already used by database/import/csv/v1/*.csv.
-- Tables in the v1 dump are prefixed `fbs_lcss_`.
-- Mirrors database/import/IMPORT.sql (the v2/lcssv2_ equivalent) — see that file
-- for the shared rationale. Every query here also selects created_at/updated_at,
-- carried over from the row's own legacy `*_created`/`*_datetime` columns (MySQL
-- zero-dates fall back to the creation value; a table with no `*_created` column
-- uses `*_datetime` for both) so the import controllers can stamp the real
-- historical timestamp instead of the import moment.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1a) phase1_academic_industry.csv  (name)
--     v1 has no abbreviation/description columns for this table.
-- ----------------------------------------------------------------------------
SELECT
    industry_name AS name,
    industry_created AS created_at,
    COALESCE(NULLIF(industry_datetime, '0000-00-00 00:00:00'), industry_created) AS updated_at
FROM fbs_lcss_settings_industry
ORDER BY industry_name;


-- ----------------------------------------------------------------------------
-- 1c) phase1_academic_level.csv  (name)
--     fbs_lcss_settings_level has no `_created` column — updated_at falls back
--     to it too, so both columns carry the same (only available) timestamp.
-- ----------------------------------------------------------------------------
SELECT
    settings_level_year AS name,
    settings_level_datetime AS created_at,
    settings_level_datetime AS updated_at
FROM fbs_lcss_settings_level
WHERE settings_level_active = 1
ORDER BY settings_level_year;


-- ----------------------------------------------------------------------------
-- 1b) phase1_academic_program.csv  (name, abbreviation)
--     fbs_lcss_settings_course has no `_created` column either.
-- ----------------------------------------------------------------------------
SELECT
    settings_course_course AS name,
    settings_course_abbreviation AS abbreviation,
    settings_course_datetime AS created_at,
    settings_course_datetime AS updated_at
FROM fbs_lcss_settings_course
WHERE settings_course_active = 1
ORDER BY settings_course_course;


-- ----------------------------------------------------------------------------
-- 1d) phase1_academic_program_type.csv  (name)
-- ----------------------------------------------------------------------------
SELECT
    program_type_name AS name,
    program_type_created AS created_at,
    COALESCE(NULLIF(program_type_datetime, '0000-00-00 00:00:00'), program_type_created) AS updated_at
FROM fbs_lcss_settings_program_type
ORDER BY program_type_name;


-- ----------------------------------------------------------------------------
-- 2) phase2_partner_schools.csv
--    (school_name, abbreviation, contact_person, contact_email, address)
-- ----------------------------------------------------------------------------
SELECT
    school_name AS school_name,
    school_abbreviation AS abbreviation,
    '' AS contact_person,
    school_email AS contact_email,
    school_address AS address,
    school_created AS created_at,
    COALESCE(NULLIF(school_datetime, '0000-00-00 00:00:00'), school_created) AS updated_at
FROM fbs_lcss_settings_school
WHERE school_is_active = 1
ORDER BY school_name;


-- ----------------------------------------------------------------------------
-- 3) phase3_batches.csv
--    (batch_code, setup, industry, program_type, date_started,
--     projected_end_date, is_open, is_completed, is_dissolved)
--    v1's batch table has no start/end date columns, so — same as v2 — they're
--    derived from the min/max of the trainees assigned to each batch. Unlike
--    v2 (a direct trainee_batch_id FK), v1 links trainees to batches through
--    the fbs_lcss_batch_trainees junction table.
--    VERIFIED against real MySQL (verify_lcs_v1): fbs_lcss_batch has NO
--    is_completed column at all (confirmed via SHOW COLUMNS) — it's derived
--    here as "closed and not dissolved". The pre-existing, hand-built
--    csv/v1/phase3_batches.csv has is_completed values that don't consistently
--    match this (or any other) simple derivation from is_open/is_dissolve —
--    e.g. one FBS-002 row there has is_open=1 AND is_completed=1 simultaneously
--    — so treat this column as a best-effort approximation, not a faithful
--    reproduction of that CSV's values.
--    date_started falls back to the batch's own created-date when none of its
--    trainees has a start date on file (4 of 38 v1 batches hit this) — that
--    column is required|date on import, so leaving it blank rejects the row.
-- ----------------------------------------------------------------------------
SELECT
    b.batch_number AS batch_code,
    b.batch_setup AS setup,
    i.industry_name AS industry,
    pt.program_type_name AS program_type,
    COALESCE(MIN(NULLIF(t.trainee_started_date, '')), NULLIF(b.batch_created, ''), b.batch_datetime) AS date_started,
    MAX(NULLIF(t.trainee_completed_date, '')) AS projected_end_date,
    b.batch_is_open AS is_open,
    CASE WHEN b.batch_is_open = 0 AND b.batch_is_dissolve = 0 THEN 1 ELSE 0 END AS is_completed,
    b.batch_is_dissolve AS is_dissolved,
    b.batch_created AS created_at,
    COALESCE(NULLIF(b.batch_datetime, '0000-00-00 00:00:00'), b.batch_created) AS updated_at
FROM fbs_lcss_batch b
LEFT JOIN fbs_lcss_settings_industry i ON i.industry_aid = b.batch_industry_id
LEFT JOIN fbs_lcss_settings_program_type pt ON pt.program_type_aid = b.batch_program_type
LEFT JOIN fbs_lcss_batch_trainees bt ON bt.batch_trainees_batch_id = b.batch_aid AND bt.batch_trainees_is_active = 1
LEFT JOIN fbs_lcss_trainee t ON t.trainee_aid = bt.batch_trainees_id
GROUP BY b.batch_aid, b.batch_number, b.batch_setup, i.industry_name,
         pt.program_type_name, b.batch_is_open, b.batch_is_dissolve,
         b.batch_created, b.batch_datetime
ORDER BY b.batch_number;


-- ----------------------------------------------------------------------------
-- 4) phase4_trainees.csv
--    (first_name, last_name, email, batch_code, school_name, program_name,
--     level_name, gender, birthday, birth_place, address, mobile_number,
--     emergency_contact_name, emergency_contact_number, required_hours,
--     f2f_hours_rate, online_hours_rate, discount_percent, is_active)
--    v1 links a trainee to its batch through fbs_lcss_batch_trainees (no
--    direct trainee_batch_id FK, unlike v2). 30 of 358 v1 trainees have NO row
--    in fbs_lcss_batch_trainees at all (not even inactive), so batch_code
--    falls back to whichever batch their task history (fbs_lcss_task_list ->
--    fbs_lcss_task.task_batch_id) most often points to. This resolves 16 of
--    those 30 with a single unambiguous candidate batch, and picks the lowest
--    batch_aid as a best-effort guess for 2 more with multiple candidate
--    batches (flag for manual review). The remaining ~14 have zero task or
--    payment history anywhere in the dump — there is no real batch to assign
--    them to — so they fall back to a single synthetic sentinel batch code,
--    'FBS-UNASSIGNED-V1', shared by all of them. That batch itself is a single
--    hand-added inactive row in phase3_batches.csv (not queried from source
--    data) — import phase 3 (batches) before phase 4 (trainees) as usual so it
--    exists first.
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_fname AS first_name,
    tr.trainee_lname AS last_name,
    tr.trainee_email AS email,
    COALESCE(b.batch_number, fb.batch_number, 'FBS-UNASSIGNED-V1') AS batch_code,
    s.school_name AS school_name,
    c.settings_course_course AS program_name,
    lvl.settings_level_year AS level_name,
    tr.trainee_gender AS gender,
    tr.trainee_birth_date AS birthday,
    tr.trainee_birth_place AS birth_place,
    tr.trainee_address AS address,
    tr.trainee_mobile AS mobile_number,
    tr.trainee_guardian AS emergency_contact_name,
    tr.trainee_guardian_contact AS emergency_contact_number,
    tr.trainee_required_hours AS required_hours,
    tr.trainee_f2f_rate AS f2f_hours_rate,
    tr.trainee_online_rate AS online_hours_rate,
    tr.trainee_discount AS discount_percent,
    tr.trainee_is_active AS is_active,
    tr.trainee_created AS created_at,
    COALESCE(NULLIF(tr.trainee_datetime, '0000-00-00 00:00:00'), tr.trainee_created) AS updated_at
FROM fbs_lcss_trainee tr
LEFT JOIN fbs_lcss_batch_trainees bt ON bt.batch_trainees_id = tr.trainee_aid AND bt.batch_trainees_is_active = 1
LEFT JOIN fbs_lcss_batch b ON b.batch_aid = bt.batch_trainees_batch_id
LEFT JOIN (
    SELECT tl.task_list_trainee_id AS trainee_id, MIN(tk.task_batch_id) AS batch_id
    FROM fbs_lcss_task_list tl
    JOIN fbs_lcss_task tk ON tk.task_aid = tl.task_list_task_id
    GROUP BY tl.task_list_trainee_id
) tbf ON tbf.trainee_id = tr.trainee_aid
LEFT JOIN fbs_lcss_batch fb ON fb.batch_aid = tbf.batch_id
LEFT JOIN fbs_lcss_settings_school s ON s.school_aid = tr.trainee_school_id
LEFT JOIN fbs_lcss_settings_course c ON c.settings_course_aid = tr.trainee_course_id
LEFT JOIN fbs_lcss_settings_level lvl ON lvl.settings_level_aid = tr.trainee_year_level_id
ORDER BY tr.trainee_lname, tr.trainee_fname;


-- ----------------------------------------------------------------------------
-- 5a) phase5a_payments.csv
--     (trainee_email, amount_paid, payment_date, official_receipt_number,
--      receipt_link)
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email AS trainee_email,
    p.payment_amount AS amount_paid,
    p.payment_date AS payment_date,
    p.payment_official_receipt AS official_receipt_number,
    p.payment_official_receipt_link AS receipt_link,
    p.payment_created AS created_at,
    COALESCE(NULLIF(p.payment_datetime, '0000-00-00 00:00:00'), p.payment_created) AS updated_at
FROM fbs_lcss_payment p
JOIN fbs_lcss_trainee tr ON tr.trainee_aid = p.payment_trainee_id
ORDER BY p.payment_date;


-- ----------------------------------------------------------------------------
-- 5b) phase5b_tasks.csv
--     (trainee_email, trainer_email, task_title, description, date, time_goal,
--      time_spent, grade, remarks, is_complete)
--     Verified against the actual lcs-v1-prod.sql dump (traced task_aid 51/52
--     end-to-end and matched the existing csv/v1/phase5b_tasks.csv row for
--     trainee "andradesheine2@gmail.com" byte-for-byte on time_goal/time_spent/
--     grade). fbs_lcss_task.task_trainee_id is often the literal string "all"
--     (a batch-wide task) — the per-trainee fan-out actually lives in
--     fbs_lcss_task_list (task_list_task_id + task_list_trainee_id), exactly
--     like v2's task_list. Grade is a THIRD table, fbs_lcss_rating_task,
--     matched by (trainee, task) — not present on task or task_list at all.
--     task_goal/task_list_spent are legacy clock strings ("H:MM" or "H:MM:SS");
--     TIME_TO_SEC(...)/3600 converts them to the decimal hours app_tasks
--     expects (confirmed: "4:0" and "4:0:0" both -> 4.0, matching the existing
--     CSV). fbs_lcss_task_list has no separate "created" column, so
--     created_at/updated_at both use task_list_datetime.
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email AS trainee_email,
    u.settings_account_email AS trainer_email,
    tk.task_name AS task_title,
    tk.task_description AS description,
    DATE(tl.task_list_datetime) AS date,
    TIME_TO_SEC(tk.task_goal) / 3600 AS time_goal,
    TIME_TO_SEC(tl.task_list_spent) / 3600 AS time_spent,
    rt.rating_task_rate AS grade,
    tl.task_list_remarks AS remarks,
    tk.task_is_done AS is_complete,
    tl.task_list_datetime AS created_at,
    tl.task_list_datetime AS updated_at
FROM fbs_lcss_task_list tl
JOIN fbs_lcss_task tk ON tk.task_aid = tl.task_list_task_id
JOIN fbs_lcss_trainee tr ON tr.trainee_aid = tl.task_list_trainee_id
LEFT JOIN fbs_lcss_settings_system_user u ON u.settings_account_aid = tk.task_trainor_id
LEFT JOIN fbs_lcss_rating_task rt ON rt.rating_task_task_id = tl.task_list_task_id AND rt.rating_task_trainee_id = tl.task_list_trainee_id
ORDER BY tr.trainee_email, tl.task_list_datetime;


-- ----------------------------------------------------------------------------
-- 5d) phase5d_learning_outcomes.csv  (trainee_email, outcome_text)
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email AS trainee_email,
    lo.learning_outcomes_description AS outcome_text,
    tlo.trainee_lo_created AS created_at,
    COALESCE(NULLIF(tlo.trainee_lo_datetime, '0000-00-00 00:00:00'), tlo.trainee_lo_created) AS updated_at
FROM fbs_lcss_trainee_learning_outcomes tlo
JOIN fbs_lcss_trainee tr ON tr.trainee_aid = tlo.trainee_lo_trainee_id
JOIN fbs_lcss_settings_learning_outcomes lo ON lo.learning_outcomes_aid = tlo.trainee_lo_id
ORDER BY tr.trainee_email;


-- Note: v1 has no equivalent source data for phase 5c (behavioral evaluations)
-- or phase 6 (certificate citations) — database/import/csv/v1/ has no CSV
-- templates for either, matching lss_v2's IMPORT.sql which does cover them.
