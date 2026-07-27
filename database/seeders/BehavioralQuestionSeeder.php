<?php

namespace Database\Seeders;

use App\Models\BehavioralQuestion;
use App\Support\Statuses;
use Illuminate\Database\Seeder;

class BehavioralQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            ['section' => 'Attendance & Punctuality', 'question' => 'Reports on time and maintains consistent attendance.', 'is_critical' => true],
            ['section' => 'Attendance & Punctuality', 'question' => 'Notifies supervisor promptly of absences or delays.', 'is_critical' => false],
            ['section' => 'Work Ethic', 'question' => 'Completes assigned tasks within expected timeframes.', 'is_critical' => true],
            ['section' => 'Work Ethic', 'question' => 'Demonstrates initiative without needing constant supervision.', 'is_critical' => false],
            ['section' => 'Communication', 'question' => 'Communicates clearly with trainers and peers.', 'is_critical' => false],
            ['section' => 'Communication', 'question' => 'Responds constructively to feedback.', 'is_critical' => false],
            ['section' => 'Teamwork', 'question' => 'Collaborates effectively with team members.', 'is_critical' => false],
            ['section' => 'Professionalism', 'question' => 'Maintains a professional appearance and conduct.', 'is_critical' => true],
        ];

        foreach ($questions as $order => $question) {
            BehavioralQuestion::query()->updateOrCreate(
                ['question' => $question['question']],
                [
                    'section' => $question['section'],
                    'type' => 'rating',
                    'order' => $order,
                    'is_critical' => $question['is_critical'],
                    'status' => Statuses::ACTIVE,
                ],
            );
        }
    }
}
