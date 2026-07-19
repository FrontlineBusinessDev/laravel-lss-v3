import TraineeTasksPrimaryLayout from '@/layouts/tasks/TraineeTasksPrimaryLayout';
import DailyTaskSheetTab from '@/pages/trainee/tasks/DailyTaskSheetTab';

export default function TraineeDailyTaskPage() {
    return (
        <TraineeTasksPrimaryLayout data-cy="trainee-daily-task-layout">
            <DailyTaskSheetTab data-cy="trainee-daily-task-daily-task-sheet-tab" />
        </TraineeTasksPrimaryLayout>
    );
}
