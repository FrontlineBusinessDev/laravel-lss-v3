import CertificatesPrimaryLayout from '@/layouts/certificates/CertificatesPrimaryLayout';
import { CertificateTemplateList } from '../citations/CertificateTemplateList';

/**
 * The Inertia route for GET /certificates/templates (BaseController::index())
 * passes no props beyond `user`, so this page just mounts the shared,
 * correctly-typed CertificateTemplateList component (also used embedded on
 * the Citations page) — a single unified list across all template types.
 * Which type a *new* template is for is chosen in-flow via
 * NewTemplateTypeModal, not via page-level tabs.
 */
export default function index() {
    return (
        <CertificatesPrimaryLayout data-cy="certificate-templates-index-layout">
            <div data-cy="certificate-templates-index-div">
                <CertificateTemplateList />
            </div>
        </CertificatesPrimaryLayout>
    );
}
