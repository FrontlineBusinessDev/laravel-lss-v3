<?php

namespace App\Http\Controllers;

use App\Http\Responses\InertiaPageResponse;
use App\Models\Batches;
use App\Models\PartnerSchools;
use App\Models\Trainee;
use App\Support\Statuses;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return InertiaPageResponse::csr('public/register/index', [
            'token' => $token,
            'batch' => [
                'batch_code' => $batch->batch_code,
                'setup' => $batch->setup,
                'status' => $batch->status,
                'date_started' => $batch->date_started?->toDateString(),
                'industry' => $batch->academicIndustry?->name,
                'level' => $batch->academicLevel?->name,
                'program' => $batch->academicProgram?->name,
            ],
            // Active partner schools for the affiliation selector (the auth-gated
            // lookup endpoint isn't reachable by guests, so pass them as props).
            'schools' => PartnerSchools::query()
                ->where('status', Statuses::ACTIVE)
                ->orderBy('school_name')
                ->get(['id', 'school_name'])
                ->map(fn(PartnerSchools $s) => ['id' => $s->id, 'name' => $s->school_name]),
        ]);
    }

    /**
     * Persist a guest trainee's registration into app_trainees, plus any
     * uploaded documents into app_trainees_documents.
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        $batch = $this->resolveBatch($token);

        // Registration is only open while the batch is active.
        if ($batch->status !== Statuses::ACTIVE) {
            return back()->with('error', 'Registration for this batch is closed.');
        }

        $validated = $request->validate($this->storeRules());

        DB::transaction(function () use ($request, $validated, $batch) {
            $trainee = Trainee::create([
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

    /** Resolve a Batches by its public token, eager-loading the display relations. */
    protected function resolveBatch(string $token): Batches
    {
        return Batches::query()
            ->where('public_registration_url_id', $token)
            ->where('is_public_url_enable', true)
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
    protected function storeDocument(UploadedFile $file, Trainee $trainee, string $type): void
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
