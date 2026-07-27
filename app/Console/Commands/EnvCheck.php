<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Deploy-time smoke check: reports what environment/config a running
 * container actually has, so a bad Hostinger env var or a missing DB
 * connection is caught before it's a support ticket.
 *
 * Usage: php artisan app:env-check
 */
class EnvCheck extends Command
{
    protected $signature = 'app:env-check';

    protected $description = 'Report the current APP_ENV, database target, and runtime status';

    public function handle(): int
    {
        $this->newLine();
        $this->info('Environment check');
        $this->line(str_repeat('-', 52));

        $this->reportApp();
        $dbOk = $this->reportDatabase();
        $this->reportRuntime();
        $storageOk = $this->reportStorage();

        return ($dbOk && $storageOk) ? self::SUCCESS : self::FAILURE;
    }

    private function reportApp(): void
    {
        $this->line('APP_ENV          : '.app()->environment());
        $this->line('APP_DEBUG        : '.(config('app.debug') ? '<comment>true</comment>' : 'false'));
        $this->line('APP_URL          : '.config('app.url'));
        $this->line('HTTPS enforced   : '.(app()->environment(['production', 'staging']) ? '<info>yes</info>' : 'no'));
    }

    private function reportDatabase(): bool
    {
        $connection = config('database.default');
        $this->line('DB connection    : '.$connection);

        try {
            DB::connection()->getPdo();
            $this->line('DB reachable     : <info>yes</info>');

            return true;
        } catch (\Throwable $e) {
            $this->line('DB reachable     : <error>NO</error> — '.$e->getMessage());

            return false;
        }
    }

    private function reportRuntime(): void
    {
        $this->line('Cache store      : '.config('cache.default'));
        $this->line('Queue connection : '.config('queue.default'));

        $server = config('octane.server');
        $binary = base_path($server === 'frankenphp' ? 'frankenphp' : '');
        $binaryStatus = $server === 'frankenphp'
            ? (is_file($binary) && is_executable($binary) ? '<info>present, executable</info>' : '<error>MISSING or not executable</error>')
            : 'n/a';

        $this->line('Octane server    : '.$server);
        $this->line('FrankenPHP binary: '.$binaryStatus);
    }

    private function reportStorage(): bool
    {
        $writable = is_writable(storage_path('logs'));
        $this->line('storage/logs     : '.($writable ? '<info>writable</info>' : '<error>NOT WRITABLE</error>'));

        return $writable;
    }
}
