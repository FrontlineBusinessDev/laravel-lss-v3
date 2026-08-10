-- ============================================================================
-- Export queries: lcss_v2 (legacy DB) -> CSV templates for lss-v3 import
-- Run each SELECT against the lcss_v2 database and export the result grid
-- as CSV (column headers already match each *_template.csv exactly).
-- Tables in lcss_v2 are prefixed `lcssv2_`.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) academic_industry_template.csv  (name, abbreviation, description)
--    Only active industries are exported. lcss_v2 has no description column.
-- ----------------------------------------------------------------------------
SELECT
    industry_name        AS name,
    industry_abbreviation AS abbreviation,
    ''                    AS description
FROM lcssv2_industry
WHERE industry_is_active = 1
ORDER BY industry_name;


-- ----------------------------------------------------------------------------
-- 2) academic_level_template.csv  (name, abbreviation, description)
--    lcss_v2 has no abbreviation/description columns for this table.
-- ----------------------------------------------------------------------------
SELECT
    academic_level_name AS name,
    ''                   AS abbreviation,
    ''                   AS description
FROM lcssv2_academic_level
WHERE academic_level_is_active = 1
ORDER BY academic_level_name;


-- ----------------------------------------------------------------------------
-- 3) academic_program_template.csv  (name, abbreviation, description)
--    lcss_v2 has no description column.
-- ----------------------------------------------------------------------------
SELECT
    academic_program_name         AS name,
    academic_program_abbreviation AS abbreviation,
    ''                             AS description
FROM lcssv2_academic_program
WHERE academic_program_is_active = 1
ORDER BY academic_program_name;


-- ----------------------------------------------------------------------------
-- 4) academic_program_type_template.csv  (name, abbreviation, description)
--    lcss_v2 has no description column (program_type_citation_value is a
--    citation placeholder, not a description, so it is intentionally excluded).
-- ----------------------------------------------------------------------------
SELECT
    program_type_name         AS name,
    program_type_abbreviation AS abbreviation,
    ''                         AS description
FROM lcssv2_program_type
WHERE program_type_is_active = 1
ORDER BY program_type_name;


-- ----------------------------------------------------------------------------
-- 5) partner_schools_template.csv
--    (school_name, abbreviation, contact_person, contact_email, address)
-- ----------------------------------------------------------------------------
SELECT
    partner_school_name           AS school_name,
    partner_school_abbreviation   AS abbreviation,
    partner_school_contact_person AS contact_person,
    partner_school_email          AS contact_email,
    partner_school_address        AS address
FROM lcssv2_partner_school
WHERE partner_school_is_active = 1
ORDER BY partner_school_name;


-- ----------------------------------------------------------------------------
-- 6) batches_template.csv
--    (batch_code, setup, industry, program_type, date_started,
--     projected_end_date, is_open, is_completed, is_dissolved)
--    lcss_v2's batch table has no start/end date columns, so they are
--    derived from the min/max of the trainees assigned to each batch.
-- ----------------------------------------------------------------------------
SELECT
    b.batch_number                         AS batch_code,
    b.batch_setup                          AS setup,
    i.industry_name                        AS industry,
    pt.program_type_name                   AS program_type,
    MIN(NULLIF(t.trainee_start_date, ''))  AS date_started,
    MAX(NULLIF(t.trainee_end_date, ''))    AS projected_end_date,
    b.batch_is_open                        AS is_open,
    b.batch_is_completed                   AS is_completed,
    b.batch_is_dissolved                   AS is_dissolved
FROM lcssv2_batch b
LEFT JOIN lcssv2_industry i     ON i.industry_aid = b.batch_industry_id
LEFT JOIN lcssv2_program_type pt ON pt.program_type_aid = b.batch_program_type_id
LEFT JOIN lcssv2_trainee t      ON t.trainee_batch_id = b.batch_aid
GROUP BY b.batch_aid, b.batch_number, b.batch_setup, i.industry_name,
         pt.program_type_name, b.batch_is_open, b.batch_is_completed, b.batch_is_dissolved
ORDER BY b.batch_number;


-- ----------------------------------------------------------------------------
-- 7) trainees_template.csv
--    (first_name, last_name, email, batch_code, school_name, program_name,
--     level_name, gender, birthday, birth_place, address, mobile_number,
--     emergency_contact_name, emergency_contact_number, required_hours,
--     f2f_hours_rate, online_hours_rate, discount_percent, is_active)
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_fname             AS first_name,
    tr.trainee_lname             AS last_name,
    tr.trainee_email             AS email,
    b.batch_number                AS batch_code,
    ps.partner_school_name        AS school_name,
    ap.academic_program_name      AS program_name,
    al.academic_level_name        AS level_name,
    tr.trainee_gender             AS gender,
    tr.trainee_birth_date         AS birthday,
    tr.trainee_birth_place        AS birth_place,
    tr.trainee_address            AS address,
    tr.trainee_mobile_number      AS mobile_number,
    tr.trainee_emergency_name     AS emergency_contact_name,
    tr.trainee_emergency_number   AS emergency_contact_number,
    tr.trainee_required_hours     AS required_hours,
    tr.trainee_f2f_hours_rate     AS f2f_hours_rate,
    tr.trainee_online_hours_rate  AS online_hours_rate,
    tr.trainee_discount           AS discount_percent,
    tr.trainee_is_active          AS is_active
FROM lcssv2_trainee tr
LEFT JOIN lcssv2_batch b            ON b.batch_aid = tr.trainee_batch_id
LEFT JOIN lcssv2_partner_school ps  ON ps.partner_school_aid = tr.trainee_school_id
LEFT JOIN lcssv2_academic_program ap ON ap.academic_program_aid = tr.trainee_academic_program_id
LEFT JOIN lcssv2_academic_level al  ON al.academic_level_aid = tr.trainee_academic_level_id
ORDER BY tr.trainee_lname, tr.trainee_fname;


-- ----------------------------------------------------------------------------
-- 8) payments_template.csv
--    (trainee_email, amount_paid, payment_date, official_receipt_number,
--     receipt_link)
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email               AS trainee_email,
    p.payment_amount                AS amount_paid,
    p.payment_date                  AS payment_date,
    p.payment_official_receipt      AS official_receipt_number,
    p.payment_official_receipt_link AS receipt_link
FROM lcssv2_payment p
JOIN lcssv2_trainee tr ON tr.trainee_aid = p.payment_trainee_id
ORDER BY p.payment_date;


-- ----------------------------------------------------------------------------
-- 9) tasks_template.csv
--    (trainee_email, trainer_email, task_title, description, date,
--     time_goal, time_spent, grade, remarks, is_complete)
--    "date" is taken from when the trainee started the task
--    (task_list_time_started); falls back to task_list_created if not set.
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email                                                AS trainee_email,
    trn.trainer_email                                               AS trainer_email,
    tk.task_title                                                   AS task_title,
    tk.task_description                                             AS description,
    COALESCE(
        DATE(NULLIF(tl.task_list_time_started, '0000-00-00 00:00:00')), 
        CURRENT_DATE()
    )                                                               AS date,
    tk.task_time_goal                                               AS time_goal,
    COALESCE(
        NULLIF(NULLIF(TRIM(tl.task_list_time_spent), ''), '00:00'), 
        '00:00'
    )                                                               AS time_spent,
    tl.task_list_task_grade                                         AS grade,
    tl.task_list_task_remarks                                       AS remarks,
    tk.task_is_complete                                             AS is_complete
FROM lcssv2_task_list tl
JOIN lcssv2_task tk          ON tk.task_aid = tl.task_list_task_id
JOIN lcssv2_trainee tr       ON tr.trainee_aid = tl.task_list_trainee_id
LEFT JOIN lcssv2_trainer trn ON trn.trainer_aid = tk.task_trainer_id
ORDER BY tr.trainee_email, tl.task_list_time_started;


-- ----------------------------------------------------------------------------
-- 10) behavioral_evaluations_template.csv
--     (trainee_email, trainer_email, date, question_text, score, remarks)
--     Per-question scores come from trainee_behavioral_evaluation_answer;
--     the free-text remarks live on the aggregate trainee_behavioral_evaluation
--     row, matched here by trainee/trainer/date.
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email  AS trainee_email,
    trn.trainer_email AS trainer_email,
    a.behavioral_evaluation_answer_date AS date,
    q.trainer_evaluation_questionnaire_description AS question_text,
    a.behavioral_evaluation_answer_score AS score,
    e.behavioral_evaluation_remarks AS remarks
FROM lcssv2_trainee_behavioral_evaluation_answer a
JOIN lcssv2_trainee tr  ON tr.trainee_aid = a.behavioral_evaluation_answer_trainee_id
JOIN lcssv2_trainer trn ON trn.trainer_aid = a.behavioral_evaluation_answer_trainer_id
JOIN lcssv2_trainer_evaluation_questionnaire q
     ON q.trainer_evaluation_questionnaire_aid = a.behavioral_evaluation_answer_question_id
LEFT JOIN lcssv2_trainee_behavioral_evaluation e
     ON e.behavioral_evaluation_trainee_id = a.behavioral_evaluation_answer_trainee_id
    AND e.behavioral_evaluation_trainer_id = a.behavioral_evaluation_answer_trainer_id
    AND e.behavioral_evaluation_date = a.behavioral_evaluation_answer_date
ORDER BY tr.trainee_email, a.behavioral_evaluation_answer_date;


-- ----------------------------------------------------------------------------
-- 11) learning_outcomes_template.csv  (trainee_email, outcome_text)
--     Only outcomes still marked active on the trainee are exported.
-- ----------------------------------------------------------------------------
SELECT
    tr.trainee_email    AS trainee_email,
    lo.learning_outcomes_name AS outcome_text
FROM lcssv2_trainee_lo tlo
JOIN lcssv2_trainee tr           ON tr.trainee_aid = tlo.trainee_lo_trainee_id
JOIN lcssv2_learning_outcomes lo ON lo.learning_outcomes_aid = tlo.trainee_lo_learning_outcome_id
WHERE tlo.trainee_lo_is_active = 1
ORDER BY tr.trainee_email;