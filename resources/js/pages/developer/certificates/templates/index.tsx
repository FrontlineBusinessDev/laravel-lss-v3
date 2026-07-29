import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/Button';
import CertificatesPrimaryLayout from '@/layouts/certificates/CertificatesPrimaryLayout';
import { CertificateTemplateList } from '../citations/CertificateTemplateList';

/**
 * The Inertia route for GET /certificates/templates (BaseController::index())
 * passes no props beyond `user`, so this page just mounts the shared,
 * correctly-typed CertificateTemplateList component (also used embedded on
 * the Citations page) — a single unified list across all template types.
 * Which type a *new* template is for is chosen in-flow via
 * NewTemplateTypeModal, not via page-level tabs. The "New template" trigger
 * itself renders here, in CertificatesPrimaryLayout's actionNode slot, same
 * as Citations' "Add citation" button — CertificateTemplateList registers
 * the imperative opener via onRegisterOpenNew.
 */
export default function index() {
    const [openNew, setOpenNew] = useState<() => void>(() => () => {});
    const registerOpenNew = useCallback((fn: () => void) => setOpenNew(() => fn), []);

    return (
        <CertificatesPrimaryLayout
            data-cy="certificate-templates-index-layout"
            actionNode={
                <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => openNew()}
                    data-cy="certificate-templates-index-button-new"
                >
                    New template
                </Button>
            }
        >
            <div data-cy="certificate-templates-index-div">
                <CertificateTemplateList onRegisterOpenNew={registerOpenNew} />
            </div>
        </CertificatesPrimaryLayout>
    );
}
