<?php

namespace Database\Seeders;

use App\Models\LeaveCategory;
use Illuminate\Database\Seeder;

class LeaveCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sick Leave', 'max_days' => 15, 'max_instances' => null, 'requires_document' => true],
            ['name' => 'Vacation Leave', 'max_days' => 10, 'max_instances' => null, 'requires_document' => false],
            ['name' => 'School-Related Leave', 'max_days' => 5, 'max_instances' => 3, 'requires_document' => true],
            ['name' => 'Bereavement Leave', 'max_days' => 3, 'max_instances' => 2, 'requires_document' => false],
        ];

        foreach ($categories as $category) {
            LeaveCategory::query()->updateOrCreate(
                ['name' => $category['name']],
                ['status' => 'active', ...$category],
            );
        }
    }
}
