<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

#[Signature('boneyard:routes')]
#[Description('Regenerate boneyard.config.json\'s route list from the app\'s registered routes, so the boneyard-js CLI crawls every page without manual curation.')]
class GenerateBoneyardRoutes extends Command
{
    /**
     * A route whose name OR uri contains any of these substrings is not a real
     * page (JSON/search/CRUD-mutation endpoint, auth-only screen) and is
     * excluded even though it's a plain GET route with no {param} segments.
     */
    private const DENYLIST = [
        'pagination-search',
        'metrics',
        'export',
        'download',
        'print',
        'search',
        'lookup',
        'options',
        '.store',
        '.update',
        '.destroy',
        'logout',
        'sanctum.',
        '_debugbar',
        'login',
        'register',
        'password.',
        'verification.',
        'confirm-password',
    ];

    public function handle(): void
    {
        $configPath = base_path('boneyard.config.json');
        $config = json_decode(file_get_contents($configPath), true) ?? [];

        Artisan::call('route:list', ['--json' => true]);
        $routes = json_decode(Artisan::output(), true) ?? [];

        $pages = collect($routes)
            ->filter(fn ($route) => in_array('GET', explode('|', $route['method'] ?? ''), true))
            ->filter(fn ($route) => ! str_starts_with($route['uri'], 'api/'))
            ->filter(fn ($route) => ! str_contains($route['uri'], '{'))
            ->filter(function ($route) {
                $name = $route['name'] ?? '';
                if ($name === '') {
                    return false;
                }
                $haystack = $name.' '.$route['uri'];
                foreach (self::DENYLIST as $needle) {
                    if (str_contains($haystack, $needle)) {
                        return false;
                    }
                }

                return true;
            })
            ->map(fn ($route) => '/'.ltrim($route['uri'], '/'))
            ->unique()
            ->sort()
            ->values()
            ->all();

        $config['routes'] = $pages;
        file_put_contents($configPath, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");

        $this->info(count($pages).' route(s) written to boneyard.config.json.');
    }
}
