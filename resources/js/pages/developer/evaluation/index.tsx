import { useState } from 'react';
import { evaluationQuestions as initialQuestions, evaluationResponses as initialResponses, questionSetsByCategory, currentUser } from '@/data/mockData';
import type { EvaluationQuestion, EvaluationResponse } from '@/types';
import { cn } from '@/lib/utils';
import { OverviewTab } from './OverviewTab';
import { TrainersQuestionnaireTab } from './TrainersQuestionnaireTab';
import { SeminarQuestionnaireTab } from './SeminarQuestionnaireTab';
const TABS = ['Overview', 'Trainers questionnaire', 'Seminar questionnaire'] as const;
export default function EvaluationPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Overview');
  const [questions, setQuestions] = useState<EvaluationQuestion[]>(initialQuestions);
  const [responses, setResponses] = useState<EvaluationResponse[]>(initialResponses);
  const [trainerSets, setTrainerSets] = useState<string[]>(questionSetsByCategory.Trainer);
  const [seminarSets, setSeminarSets] = useState<string[]>(questionSetsByCategory.Seminar);
  return <div data-cy="index-div-1">
      <div className="mb-4" data-cy="index-div-2">
        <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-evaluation">Evaluation</h1>
        <p className="text-sm text-neutral-500" data-cy="index-p-trainee-to-trainer-and-participant-to-speaker-feedback-questionnaires">Trainee-to-trainer and participant-to-speaker feedback questionnaires</p>
      </div>

      <div className="mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5 lss-scrollbar" data-cy="index-div-5">
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn('shrink-0 whitespace-nowrap pb-2.5 text-xs font-medium transition-colors', tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700')} data-cy="index-button-set-tab">
            {t}
          </button>)}
      </div>

      {tab === 'Overview' && <OverviewTab questions={questions} responses={responses} onChangeResponses={setResponses} data-cy="index-overview-tab-7" />}

      {tab === 'Trainers questionnaire' && <TrainersQuestionnaireTab questions={questions} onChange={setQuestions} currentUserName={currentUser.name} sets={trainerSets} onAddSet={name => setTrainerSets(prev => [...prev, name])} data-cy="index-trainers-questionnaire-tab-set-questions" />}

      {tab === 'Seminar questionnaire' && <SeminarQuestionnaireTab questions={questions} onChange={setQuestions} currentUserName={currentUser.name} sets={seminarSets} onAddSet={name => setSeminarSets(prev => [...prev, name])} data-cy="index-seminar-questionnaire-tab-set-questions" />}
    </div>;
}