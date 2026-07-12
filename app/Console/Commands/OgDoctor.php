<?php

namespace App\Console\Commands;

use App\Models\Batches;
use App\Support\OgImage;
use App\Support\QrCode;
use Illuminate\Console\Command;

/**
 * Diagnoses the batch share-card (og:image) pipeline end to end so a "renders as
 * a plain link" report can be pinned to a concrete cause instead of guesswork:
 *   - is gd + FreeType present? (the branded card needs it; without it the route
 *     serves the gd-free padded-QR fallback rather than 500ing)
 *   - does the card actually encode to a valid 1200x630 PNG?
 *   - what absolute og:image / og:url would a scraper be handed? (a wrong host or
 *     an http:// scheme is the usual reason Messenger silently drops the preview)
 *
 * Usage: php artisan og:doctor {token?}
 * With no token it uses the most recent batch that has a public link.
 */
class OgDoctor extends Command
{
    protected $signature = 'og:doctor {token? : A batch public_registration_url_id to test against}';

    protected $description = 'Diagnose the batch social-share (og:image) pipeline';

    public function handle(): int
    {
        $this->newLine();
        $this->info('OG share-card diagnostics');
        $this->line(str_repeat('-', 52));

        $gd = $this->reportGd();

        $batch = $this->resolveBatch($this->argument('token'));
        if ($batch === null) {
            $this->warn('No batch with a public registration link found — skipping the live render check.');
            $this->line('Enable a batch public URL, or pass a token: php artisan og:doctor {token}');

            return $gd ? self::SUCCESS : self::FAILURE;
        }

        $this->reportUrls($batch);
        $rendered = $this->reportRender($batch);

        $this->newLine();
        $this->line('Re-scrape note: a link shared before these tags existed stays cached as a');
        $this->line('plain link. Force a refresh in the Facebook Sharing Debugger to re-fetch.');
        $this->newLine();

        return $rendered ? self::SUCCESS : self::FAILURE;
    }

    /** Report gd + FreeType availability (the branded card's hard requirements). */
    private function reportGd(): bool
    {
        $hasGd = function_exists('imagecreatetruecolor');
        $hasFreeType = function_exists('imagettftext');

        $this->line('gd extension     : '.($hasGd ? '<info>available</info>' : '<error>MISSING</error>'));
        $this->line('FreeType (fonts) : '.($hasFreeType ? '<info>available</info>' : '<error>MISSING</error>'));

        if (! $hasGd || ! $hasFreeType) {
            $this->warn('Branded card unavailable — the endpoint will serve the gd-free padded-QR fallback.');
            $this->warn('Install php-gd with FreeType in the runtime image to get the branded card.');
        }

        return $hasGd && $hasFreeType;
    }

    private function resolveBatch(?string $token): ?Batches
    {
        $query = Batches::query()
            ->with(['academicProgram:id,name'])
            ->whereNotNull('public_registration_url_id');

        if ($token !== null) {
            return $query->where('public_registration_url_id', $token)->first();
        }

        return $query->latest('id')->first();
    }

    /** Print, and sanity-check, the exact absolute URLs a scraper would receive. */
    private function reportUrls(Batches $batch): void
    {
        $token = (string) $batch->public_registration_url_id;
        $registerUrl = route('public.register', $token);
        $ogImage = route('public.register.qr', $token).'?v='.($batch->updated_at?->getTimestamp() ?? 1);

        $this->newLine();
        $this->line('Batch            : '.$batch->batch_code);
        $this->line('og:url           : '.$registerUrl);
        $this->line('og:image         : '.$ogImage);

        if (app()->environment(['production', 'staging']) && ! str_starts_with($ogImage, 'https://')) {
            $this->warn('og:image is not https:// — scrapers reject non-secure images. Check APP_URL / trustProxies / forceScheme.');
        }
    }

    /** Render the card (branded, else fallback) and validate it is a 1200x630 PNG. */
    private function reportRender(Batches $batch): bool
    {
        $registerUrl = route('public.register', (string) $batch->public_registration_url_id);
        $program = $batch->academicProgram?->name ?? 'Training Program';
        $setup = $batch->setup === 'f2f' ? 'Face to Face' : 'Online';
        $description = "Register for {$program} ({$setup}) — batch {$batch->batch_code}.";
        $details = "{$program}  ·  {$setup}  ·  Batch {$batch->batch_code}";

        $this->newLine();

        try {
            $png = OgImage::render($registerUrl, (string) config('app.name'), $description, $details);
            $source = 'branded card (gd)';
        } catch (\Throwable $e) {
            $this->warn('Branded render failed: '.$e->getMessage());
            $png = QrCode::paddedOg($registerUrl);
            $source = 'padded-QR fallback (gd-free)';
        }

        $size = getimagesizefromstring($png);
        if ($size === false) {
            $this->error('Rendered bytes are not a valid image.');

            return false;
        }

        $ok = $size[0] === 1200 && $size[1] === 630;
        $this->line('Rendered by      : '.$source);
        $this->line('Dimensions       : '.$size[0].'x'.$size[1].' '.($ok ? '<info>OK</info>' : '<error>WRONG (need 1200x630)</error>'));
        $this->line('Byte size        : '.number_format(strlen($png)).' bytes');

        return $ok;
    }
}
