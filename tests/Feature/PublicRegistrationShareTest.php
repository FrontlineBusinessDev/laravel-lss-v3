<?php

use App\Models\Batches;
use App\Support\QrCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The public register page's social share card: a 1200x630 (Open Graph 1.91:1)
 * og:image plus the sized, HTTPS, cache-busted meta tags a scraper needs. The
 * branded card requires gd; where gd is absent the controller falls back to a
 * gd-free padded QR — both are 1200x630, so these assertions hold either way.
 */
function makeShareBatch(array $overrides = []): Batches
{
    $industryId = DB::table('app_settings_academic_industry')->insertGetId(['name' => 'Information Technology']);
    $levelId = DB::table('app_settings_academic_level')->insertGetId(['name' => 'Tertiary', 'year_level' => '4th Year']);
    $programId = DB::table('app_settings_academic_program')->insertGetId(['name' => 'BS Computer Science', 'course_name' => 'Computer Science']);

    return Batches::create(array_merge([
        'status' => 'active',
        'batch_code' => 'FBS-TEST-01',
        'public_registration_url_id' => (string) Str::ulid(),
        'is_public_url_enable' => true,
        'date_started' => now()->toDateString(),
        'setup' => 'f2f',
        'academic_industry_id' => $industryId,
        'academic_level_id' => $levelId,
        'academic_program_id' => $programId,
    ], $overrides));
}

test('qr endpoint returns a 1200x630 png with the right headers', function () {
    $batch = makeShareBatch();

    $response = $this->get(route('public.register.qr', $batch->public_registration_url_id));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toBe('image/png');
    expect($response->headers->get('Content-Length'))->not->toBeNull();
    // Long-lived cache so scrapers/CDNs don't re-render on every fetch (the
    // ?v=updated_at query is what busts it after a batch edit).
    expect($response->headers->get('Cache-Control'))->toContain('max-age=86400');

    $size = getimagesizefromstring($response->getContent());
    expect($size)->not->toBeFalse();
    expect([$size[0], $size[1]])->toBe([1200, 630]);
});

test('qr endpoint also answers HEAD (some scrapers probe before GET)', function () {
    $token = makeShareBatch()->public_registration_url_id;

    $this->call('HEAD', route('public.register.qr', $token))->assertOk();
});

test('og:title and og:description are present and non-empty', function () {
    $html = $this->get(route('public.register', makeShareBatch()->public_registration_url_id))->getContent();

    expect($html)
        ->toMatch('#property="og:title" content="[^"]+"#')
        ->toMatch('#property="og:description" content="[^"]+"#');
});

test('register page renders sized, cache-busted og and twitter tags', function () {
    $html = $this->get(route('public.register', makeShareBatch()->public_registration_url_id))->getContent();

    expect($html)
        ->toContain('property="og:image:width" content="1200"')
        ->toContain('property="og:image:height" content="630"')
        ->toContain('property="og:image:type" content="image/png"')
        ->toContain('property="og:image:secure_url"')
        ->toContain('property="og:site_name"')
        ->toContain('name="twitter:card" content="summary_large_image"')
        // og:image is absolute and cache-busted so scrapers re-fetch on change.
        ->toMatch('#property="og:image" content="[^"]+/qr\?v=\d+"#');
});

test('fb:app_id is emitted only when configured', function () {
    $token = makeShareBatch()->public_registration_url_id;

    config(['services.facebook.app_id' => null]);
    expect($this->get(route('public.register', $token))->getContent())
        ->not->toContain('fb:app_id');

    config(['services.facebook.app_id' => '1234567890']);
    expect($this->get(route('public.register', $token))->getContent())
        ->toContain('property="fb:app_id" content="1234567890"');
});

test('paddedOg fallback is a 1200x630 png', function () {
    $size = getimagesizefromstring(QrCode::paddedOg('https://example.test/register/abc'));

    expect($size)->not->toBeFalse();
    expect([$size[0], $size[1]])->toBe([1200, 630]);
    expect($size['mime'])->toBe('image/png');
});
