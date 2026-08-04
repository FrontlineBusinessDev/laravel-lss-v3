<?php

namespace App\Http\Controllers\v1;

use App\Http\Responses\InertiaPageResponse;
use App\Models\SeminarCertificate;
use App\Models\TraineeCertificate;
use App\Support\QrCode;
use Illuminate\Http\Response;

/**
 * Guest-facing certificate verification. A certificate's system-generated
 * public_id is the QR/shareable link target that lands here — deliberately
 * NOT certificate_no, which is sequential and therefore guessable/enumerable.
 *
 * NOTE: this is intentionally a plain Controller (NOT BaseController) so it is
 * reachable without the auth middleware BaseController enforces, mirroring
 * PublicRegistrationController.
 */
class PublicCertificateController extends Controller
{
    /**
     * Resolve the certificate by its public token and render the verification
     * page. An unknown token renders the same view with valid=false rather
     * than a raw 404, so a guest sees a clear "not verified" state.
     */
    public function show(string $publicId): mixed
    {
        $certificate = $this->resolveCertificate($publicId);

        if (! $certificate) {
            return InertiaPageResponse::csr('public/certificate/index', [
                'valid' => false,
                'doc' => null,
            ]);
        }

        return InertiaPageResponse::csr('public/certificate/index', [
            'valid' => true,
            'doc' => $this->buildDoc($certificate),
        ]);
    }

    /**
     * Guest-reachable QR image encoding this certificate's verification URL —
     * what template `type: 'qr'` elements render as an <img src> on-screen and
     * embed into PNG/PDF export. Deliberately a plain QR (no OG branding —
     * this isn't a social-share card) via the same extension-free QrCode
     * support class used by the batch-registration QR.
     */
    public function qr(string $publicId): Response
    {
        $certificate = $this->resolveCertificate($publicId);
        abort_if(! $certificate, 404);

        $png = QrCode::png(route('public.certificates.show', $publicId));

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Content-Length' => (string) strlen($png),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /** Trainee certificates checked first (more common), then seminar — public_id is unique across both tables. */
    protected function resolveCertificate(string $publicId): TraineeCertificate|SeminarCertificate|null
    {
        return TraineeCertificate::where('public_id', $publicId)
            ->with(['trainee.academicProgram', 'citation', 'template', 'issuedBy'])
            ->first()
            ?? SeminarCertificate::where('public_id', $publicId)
                ->with(['participant.seminar', 'citation', 'template', 'issuedBy'])
                ->first();
    }

    /** Builds a CertificateDoc-shaped array (see resources/js/pages/developer/certificates/CertificatePrint.tsx) for the shared React component. */
    protected function buildDoc(TraineeCertificate|SeminarCertificate $certificate): array
    {
        if ($certificate instanceof TraineeCertificate) {
            $trainee = $certificate->trainee;
            $recipientName = trim("{$trainee->first_name} {$trainee->last_name}");
            $subtitle = $trainee->academicProgram?->name ?? '';
            $courseTitle = $trainee->academicProgram?->name;
            $tokens = ['name' => $recipientName, 'hours' => $trainee->required_hours];
            $defaultCitation = 'This is to certify that {{name}} has completed {{hours}} hours of training.';
            $achievedOutcomes = collect($certificate->learning_outcomes_snapshot ?? [])->pluck('title')->all();
        } else {
            $participant = $certificate->participant;
            $recipientName = $participant->name;
            $subtitle = $participant->seminar?->topic ?? '';
            $courseTitle = $participant->seminar?->topic;
            $tokens = ['name' => $recipientName];
            $defaultCitation = 'This is to certify that {{name}} attended the seminar.';
            $achievedOutcomes = [];
        }

        $citationBody = $certificate->citation?->body_text ?: $defaultCitation;

        return [
            'key' => $certificate->id,
            'recipientName' => $recipientName,
            'subtitle' => $subtitle,
            'citationText' => $this->renderCitation($citationBody, $tokens),
            'certificateNo' => $certificate->certificate_no,
            'issuedDate' => $certificate->issued_at?->toDateString(),
            'courseTitle' => $courseTitle,
            'issuerName' => $certificate->issuedBy ? trim("{$certificate->issuedBy->first_name} {$certificate->issuedBy->last_name}") : null,
            'template' => $certificate->template,
            'achievedOutcomes' => $achievedOutcomes,
            'verificationUrl' => $certificate->verification_url,
        ];
    }

    /** PHP mirror of resources/js/pages/developer/certificates/certificateUtils.ts renderCitation() — {{token}} substitution, unresolved tokens collapse to an em dash. */
    protected function renderCitation(string $bodyText, array $tokens): string
    {
        return (string) preg_replace_callback('/{{\s*(\w+)\s*}}/', function (array $m) use ($tokens) {
            $value = $tokens[$m[1]] ?? null;

            return $value !== null && $value !== '' ? (string) $value : '—';
        }, $bodyText);
    }
}
