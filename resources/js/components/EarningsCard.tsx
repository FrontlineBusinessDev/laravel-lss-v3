import { useState } from 'react';
import { Eye, EyeOff, Banknote } from 'lucide-react';
function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
export function EarningsCard({
  amount
}: {
  amount: number;
}) {
  const [visible, setVisible] = useState(true);
  return <div className="rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="earnings-card-div-1">
      <div className="flex items-center justify-between" data-cy="earnings-card-div-2">
        <span className="flex items-center gap-1.5 text-xs text-neutral-500" data-cy="earnings-card-span-total-earnings">
          <Banknote size={14} className="text-neutral-400" data-cy="earnings-card-banknote-4" />
          Total earnings
        </span>
        <button onClick={() => setVisible(v => !v)} aria-label={visible ? 'Hide amount' : 'Show amount'} className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" data-cy="earnings-card-button-set-visible">
          {visible ? <Eye size={14} data-cy="earnings-card-eye-6" /> : <EyeOff size={14} data-cy="earnings-card-eye-off-7" />}
        </button>
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-ink" data-cy="earnings-card-div-8">
        {visible ? formatPHP(amount) : '••••••••'}
      </div>
      <div className="mt-1 text-xs text-neutral-500" data-cy="earnings-card-div-trainee-payments-seminar-registration-fees">Trainee payments + seminar registration fees, year to date</div>
    </div>;
}