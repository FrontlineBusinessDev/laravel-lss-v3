<?php

namespace App\Http\Controllers\v1\developer;

use App\Http\Responses\InertiaPageResponse;
use App\Models\Batches;
use App\Models\PartnerSchools;
use App\Models\Trainees;
use App\Support\OgImage;
use App\Support\QrCode;
use App\Support\Statuses;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Guest-facing public batch registration. A batch's system-generated
 * public_registration_url_id is the shareable/QR link target that lands here.
 *
 * NOTE: this is intentionally a plain Controller (NOT BaseController) so it is
 * reachable without the auth middleware BaseController enforces.
 */
class PublicRegistrationController extends Controller
{
    /**
     * Optional guest-uploadable documents, keyed as document_type => form field.
     * Resume is validated as required separately (see storeRules()).
     */
    private const OPTIONAL_DOCUMENTS = [
        'endorsement-letter' => 'endorsement_letter',
        'moa' => 'moa',
        'liability-waiver' => 'liability_waiver',
    ];

    /**
     * Resolve the batch by its public token and render the public form.
     *
     * Rendered CSR (not SSR) for now to avoid a hard dependency on a running
     * Inertia SSR server; swap to InertiaPageResponse::ssr() once one is
     * provisioned if SEO becomes a requirement.
     */
    public function show(string $token): mixed
    {
        $batch = $this->resolveBatch($token);

        // SEO / social-share metadata. `ogImage` is the absolute, guest-reachable
        // 1200x630 branded QR card. The `?v=` cache-buster is keyed on the batch's
        // updated_at so a branding/batch edit forces Facebook/Messenger to re-scrape
        // instead of serving a stale, previously-cached preview.
        $systemName = config('app.name');
        $metaDescription = $this->metaDescription($batch);
        $registerUrl = route('public.register', $token);
        $ogImage = route('public.register.qr', $token) . '?v=' . ($batch->updated_at?->getTimestamp() ?? 1);
        $pageTitle = "Batch Registration · {$batch->batch_code}";

        return InertiaPageResponse::csr('public/register/index', [
            'token' => $token,
            'batch' => [
                'batch_code' => $batch->batch_code,
                'setup' => $batch->setup,
                'status' => $batch->status,
                // Drives the frontend "registration closed" gate alongside status.
                'is_public_url_enable' => (bool) $batch->is_public_url_enable,
                'date_started' => $batch->date_started?->toDateString(),
                'industry' => $batch->academicIndustry?->name,
                'level' => $batch->academicLevel?->name,
                'program' => $batch->academicProgram?->name,
            ],
            'metaDescription' => $metaDescription,
            'registerUrl' => $registerUrl,
            'ogImage' => $ogImage,
            // Active partner schools for the affiliation selector (the auth-gated
            // lookup endpoint isn't reachable by guests, so pass them as props).
            'schools' => PartnerSchools::query()
                ->where('status', Statuses::ACTIVE)
                ->orderBy('school_name')
                ->get(['id', 'school_name'])
                ->map(fn(PartnerSchools $s) => ['id' => $s->id, 'name' => $s->school_name]),
        ])->withViewData([
            // Server-rendered into the Blade <head> so Facebook's non-JS crawler
            // sees the og tags (the Inertia <Head> versions only exist after
            // client hydration, which the scraper never runs). Width/height/type
            // let the scraper pre-size the card; fbAppId is null until configured,
            // in which case the fb:app_id tag is omitted rather than left empty.
            'ogTitle' => $pageTitle,
            'ogDescription' => $metaDescription,
            'ogImage' => $ogImage,
            'ogUrl' => $registerUrl,
            'ogSiteName' => $systemName,
            'ogImageWidth' => 1200,
            'ogImageHeight' => 630,
            'ogImageAlt' => "{$systemName} — register for batch {$batch->batch_code}",
            'fbAppId' => config('services.facebook.app_id'),
        ]);
    }

    /**
     * Guest-reachable 1200x630 branded share card (logo + system name +
     * description + batch details + QR), rendered as a PNG for the register
     * page's og:image / twitter:image. Social scrapers (Facebook) don't render
     * SVG, so this endpoint must be a raster at the Open Graph 1.91:1 ratio.
     *
     * The branded card needs gd; if it's unavailable the catch falls back to a
     * gd-free, non-clipped 1200x630 padded QR so the endpoint never 500s. Note
     * the `?v=` query the caller appends is ignored here — it only busts the
     * scraper/CDN cache.
     */
    public function qr(string $token): Response
    {
        $batch = $this->resolveBatch($token);
        $registerUrl = route('public.register', $token);

        try {
            $png = OgImage::render(
                $registerUrl,
                config('app.name'),
                $this->metaDescription($batch),
                $this->metaDetails($batch),
            );
        } catch (\Throwable $e) {
            report($e);
            $png = QrCode::paddedOg($registerUrl);
        }

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Content-Length' => (string) strlen($png),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /** Human-readable share/description line built from the batch's attributes. */
    protected function metaDescription(Batches $batch): string
    {
        $program = $batch->academicProgram?->name ?? 'training program';
        $setup = $batch->setup === 'f2f' ? 'Face to Face' : 'Online';

        return "Register for {$program} ({$setup}) — batch {$batch->batch_code}. "
            . 'Complete your application online in a few minutes.';
    }

    /** Compact one-line batch specifics rendered onto the share card. */
    protected function metaDetails(Batches $batch): string
    {
        $program = $batch->academicProgram?->name ?? 'Training Program';
        $setup = $batch->setup === 'f2f' ? 'Face to Face' : 'Online';

        return "{$program}  ·  {$setup}  ·  Batch {$batch->batch_code}";
    }

    /**
     * Persist a guest trainee's registration into app_trainees, plus any
     * uploaded documents into app_trainees_documents.
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        $batch = $this->resolveBatch($token);

        // Registration is only open while the batch is active AND the public
        // link is enabled (mirrors the show() gate, so a disabled link can't be
        // submitted to directly).
        if ($batch->status !== Statuses::ACTIVE || ! $batch->is_public_url_enable) {
            return back()->with('error', 'Registration for this batch is closed.');
        }

        $validated = $request->validate($this->storeRules());

        DB::transaction(function () use ($request, $validated, $batch) {
            $trainee = Trainees::create([
                'batch_id' => $batch->id,
                'school_id' => $validated['school_id'],
                'public_url_id' => (string) Str::ulid(),
                'status' => Statuses::ACTIVE,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'birthday' => $validated['birthday'],
                'birth_place' => $validated['birth_place'],
                'gender' => $validated['gender'],
                'mobile_number' => $validated['mobile_number'],
                'emergency_contact_name' => $validated['emergency_contact_name'],
                'emergency_contact_number' => $validated['emergency_contact_number'],
                'required_hours' => $validated['required_hours'],
                'address' => $validated['address'],
            ]);

            // Resume is required; the rest are optional.
            $this->storeDocument($request->file('resume'), $trainee, 'resume');

            foreach (self::OPTIONAL_DOCUMENTS as $type => $field) {
                if ($request->hasFile($field)) {
                    $this->storeDocument($request->file($field), $trainee, $type);
                }
            }
        });

        return redirect()
            ->route('public.register', $token)
            ->with('success', 'Registration submitted successfully. Our team will be in touch.');
    }

    /**
     * Resolve a Batches by its public token, eager-loading the display relations.
     * Resolves by token only — a genuinely unknown token 404s (correct), while a
     * known-but-disabled link resolves so callers can render a graceful "closed"
     * state instead of a 404 (see show()/store() gates on is_public_url_enable).
     */
    protected function resolveBatch(string $token): Batches
    {
        return Batches::query()
            ->where('public_registration_url_id', $token)
            ->with(['academicIndustry:id,name', 'academicLevel:id,name', 'academicProgram:id,name'])
            ->firstOrFail();
    }

    /**
     * Validation rules for the guest form. Mirrors the app_trainees /
     * app_trainees_documents schema (resume required, other docs optional).
     */
    protected function storeRules(): array
    {
        $file = ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'];

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:app_trainees,email'],
            'birthday' => ['required', 'date', 'before:today'],
            'birth_place' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'mobile_number' => ['required', 'string', 'max:50'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            'address' => ['required', 'string', 'max:1000'],
            'school_id' => ['required', 'integer', 'exists:app_settings_partner_schools,id'],
            'resume' => ['required', ...$file],
            'endorsement_letter' => ['nullable', ...$file],
            'moa' => ['nullable', ...$file],
            'liability_waiver' => ['nullable', ...$file],
        ];
    }

    /**
     * Store one uploaded document PRIVATELY on the default cloud disk and record
     * its metadata against the trainee.
     */
    protected function storeDocument(UploadedFile $file, Trainees $trainee, string $type): void
    {
        $disk = config('filesystems.default');
        $folder = env('AWS_S3_STORAGE', 'laravel-ls-system') . '/trainee-documents';
        $path = Storage::disk($disk)->putFile($folder, $file, 'private');

        $trainee->documents()->create([
            'status' => Statuses::ACTIVE,
            'document_type' => $type,
            'original_name' => $file->getClientOriginalName(),
            'file_name' => basename($path),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);
    }
}
