<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Same login credentials the laravel-fbs ticket system used
     * (password: 123123qQ!), remapped onto the 3 LSS roles so
     * `php artisan migrate:fresh --seed` gives you one ready-to-use
     * account per role.
     */
    public function run(): void
    {
        $this->makeUser('developer@frontlinebusiness.com.ph', 'Dev', 'Eloper', 'developer');
        $this->makeUser('contact@frontlinebusiness.com.ph', 'Admin', 'Frontline', 'admin');
        // $this->makeUser('emmanuel.manalo@frontlinebusiness.com.ph', 'Emmanuel', 'Manalo', 'trainer');
        $this->makeUser('vincent.ramirez@frontlinebusiness.com.ph', 'Vincent', 'Ramirez', 'trainer');
        // $this->makeUser('emmszhii@gmail.com', 'James', 'Reid', 'trainee');

        // A couple more trainers so seeded Tasks (see TaskSeeder) have varied
        // trainer_id assignments instead of piling everything onto one account.
        User::factory()
            ->count(2)
            ->create()
            ->each(fn(User $user) => $user->assignRole('trainer'));
    }

    protected function makeUser(string $email, string $first, string $last, string $role): User
    {
        $roleId = Role::where('name', $role)->first();
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'first_name'            => $first,
                'last_name'             => $last,
                'role_id'               => $roleId?->id,
                'password'              => Hash::make('123123qQ!'),
                'status'                => 'active',
                'email_verified_at'     => now(),
            ]
        );
        $user->assignRole($role);
        // $user->syncRoles([$role]);
        return $user;
    }
}
