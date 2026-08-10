import { parseCsv } from '@/pages/developer/biometrics/biometricsUtils';

/** Converts parsed CSV rows (raw string[][], header row first) into header-keyed objects, matching each backend endpoint's expected field names exactly. */
export function csvRowsToObjects(text: string): { headers: string[]; rows: Record<string, string>[] } {
    const raw = parseCsv(text);
    if (raw.length === 0) return { headers: [], rows: [] };

    const headers = raw[0].map((h) => h.trim());
    const rows = raw.slice(1).map((cells) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
            obj[header] = (cells[i] ?? '').trim();
        });
        return obj;
    });

    return { headers, rows };
}

export function downloadCsvTemplate(fileName: string, template: string) {
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

export interface ImportStepConfig {
    key: string;
    title: string;
    description: string;
    endpoint: string;
    template: string;
    templateFileName: string;
}

const ACADEMIC_TEMPLATE = 'name,abbreviation,description\nInformation and Communication Technologies,ICT,\n';

export const IMPORT_STEPS: ImportStepConfig[] = [
    {
        key: 'academic-industry',
        title: '1a. Academic Industry',
        description: 'Matches by name; creates missing rows automatically.',
        endpoint: 'academic/industry',
        template: ACADEMIC_TEMPLATE,
        templateFileName: 'academic_industry_template.csv',
    },
    {
        key: 'academic-program',
        title: '1b. Academic Program',
        description: 'Matches by name; creates missing rows automatically.',
        endpoint: 'academic/program',
        template: 'name,abbreviation,description\nBachelor of Science in Information Technology,BSIT,\n',
        templateFileName: 'academic_program_template.csv',
    },
    {
        key: 'academic-level',
        title: '1c. Academic Level',
        description: 'Matches by name; creates missing rows automatically.',
        endpoint: 'academic/level',
        template: ACADEMIC_TEMPLATE.replace('Information and Communication Technologies,ICT', 'Fourth Year,'),
        templateFileName: 'academic_level_template.csv',
    },
    {
        key: 'academic-program-type',
        title: '1d. Academic Program Type',
        description: 'Matches by name; creates missing rows automatically.',
        endpoint: 'academic/program-type',
        template: 'name,abbreviation,description\nCollege On-the-Job Training,OJT,\n',
        templateFileName: 'academic_program_type_template.csv',
    },
    {
        key: 'partner-schools',
        title: '2. Partner Schools',
        description: 'Matches by school_name; creates missing rows automatically.',
        endpoint: 'partner-schools',
        template: 'school_name,abbreviation,contact_person,contact_email,address\nBatangas State University - Main,BSU - Main,Mac Mac,macmac@gmail.com,"Batangas, Philippines"\n',
        templateFileName: 'partner_schools_template.csv',
    },
    {
        key: 'batches',
        title: '3. Batches',
        description: 'Run Academic import first. batch_code is reused as-is (must stay below FBS-076 to avoid colliding with new auto-generated batches).',
        endpoint: 'batches',
        template: 'batch_code,setup,industry,program_type,date_started,projected_end_date,is_open,is_completed,is_dissolved\nFBS-036,f2f,Information and Communication Technologies,College On-the-Job Training,2024-03-21,,0,1,0\n',
        templateFileName: 'batches_template.csv',
    },
    {
        key: 'trainees',
        title: '4. Trainees',
        description: 'Run Academic, Partner Schools, and Batches import first.',
        endpoint: 'trainees',
        template: 'first_name,last_name,email,batch_code,school_name,program_name,level_name,gender,birthday,birth_place,address,mobile_number,emergency_contact_name,emergency_contact_number,required_hours,f2f_hours_rate,online_hours_rate,discount_percent,is_active\nMark Ryan,Merin,macmerin24@gmail.com,FBS-036,Batangas State University - Main,Bachelor of Science in Information Technology,Fourth Year,male,2000-01-01,SPC,SPC,09491040057,n/a,000000,420,22,10,20,1\n',
        templateFileName: 'trainees_template.csv',
    },
    {
        key: 'payments',
        title: '5a. Payments',
        description: 'Run Trainees import first — matched by trainee_email.',
        endpoint: 'payments',
        template: 'trainee_email,amount_paid,payment_date,official_receipt_number,receipt_link\nmacmerin24@gmail.com,3000,2024-04-02,asdqw,\n',
        templateFileName: 'payments_template.csv',
    },
    {
        key: 'tasks',
        title: '5b. Tasks & Grades',
        description: 'Run Trainees import first — matched by trainee_email + trainer_email.',
        endpoint: 'tasks',
        template: 'trainee_email,trainer_email,task_title,description,date,time_goal,time_spent,grade,remarks,is_complete\nmacmerin24@gmail.com,mark.bumagat@frontlinebusiness.com.ph,Test,Test task,2024-03-21,3,3,80,,0\n',
        templateFileName: 'tasks_template.csv',
    },
    {
        key: 'behavioral-evaluations',
        title: '5c. Behavioral Evaluations',
        description: 'Run Trainees import first. One row per (trainee, date, question) — only the most recent evaluation per trainee is kept.',
        endpoint: 'behavioral-evaluations',
        template: 'trainee_email,trainer_email,date,question_text,score,remarks\nmacmerin24@gmail.com,mark.bumagat@frontlinebusiness.com.ph,2024-01-09,Reports to work on time and regularly,5,Test lang kay Mark\n',
        templateFileName: 'behavioral_evaluations_template.csv',
    },
    {
        key: 'learning-outcomes',
        title: '5d. Learning Outcomes',
        description: "Run Trainees import first. Outcome's industry must match the trainee's batch industry.",
        endpoint: 'learning-outcomes',
        template: 'trainee_email,outcome_text\nmacmerin24@gmail.com,Apply basic scripting language using Javascript\n',
        templateFileName: 'learning_outcomes_template.csv',
    },
    {
        key: 'citations',
        title: '6. Certificate Citation Templates',
        description: 'Standalone — no trainee dependency. Imports as templates only; placeholder tokens need a manual {{token}} touch-up afterward.',
        endpoint: 'citations',
        template: 'industry,program_type,message\nInformation and Communication Technologies,College On-the-Job Training,"a student of (School name) has successfully completed (Required hours) hours..."\n',
        templateFileName: 'citations_template.csv',
    },
];
