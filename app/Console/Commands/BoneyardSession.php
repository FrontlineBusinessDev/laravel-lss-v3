<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Auth\SessionGuard;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Session\Store;
use Illuminate\Support\Str;

#[Signature('boneyard:session')]
#[Description('Mint an authenticated session cookie for the boneyard-js pre-commit hook, without ever touching a password.')]
class BoneyardSession extends Command
{
    private const EMAIL = 'boneyard@frontlinebusiness.com.ph';

    public function handle(Encrypter $encrypter): int
    {
        $user = User::where('email', self::EMAIL)->first();

        if (! $user) {
            $this->error('Boneyard automation account not found. Run: php artisan db:seed --class="Database\Seeders\UserSeeder"');

            return self::FAILURE;
        }

        $cookieName = config('session.cookie');
        $sessionId = Str::random(40);

        $store = new Store(
            $cookieName,
            app('session')->driver()->getHandler(),
            $sessionId,
            config('session.serialization', 'php')
        );
        $store->start();
        $store->put('login_web_'.sha1(SessionGuard::class), $user->getAuthIdentifier());
        $store->save();

        $this->line($encrypter->encrypt(
            CookieValuePrefix::create($cookieName, $encrypter->getKey()).$store->getId(),
            false
        ));

        return self::SUCCESS;
    }
}
