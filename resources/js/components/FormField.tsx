import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
function Label({
  children,
  optional
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return <label className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="form-field-label-1">
      {children} {optional && <span className="font-normal text-neutral-400" data-cy="form-field-span-optional">(optional)</span>}
    </label>;
}
const fieldBase = 'w-full rounded-md border border-neutral-200 bg-white px-2.5 text-sm text-ink placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  optional?: boolean;
}
export function TextField({
  label,
  optional,
  className,
  ...props
}: TextFieldProps) {
  return <div className="mb-3.5" data-cy="form-field-div-3">
      <Label optional={optional} data-cy="form-field-label-4">{label}</Label>
      <input className={cn(fieldBase, 'h-9', className)} {...props} data-cy="form-field-input-5" />
    </div>;
}
interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}
export function SelectField({
  label,
  options,
  className,
  ...props
}: SelectFieldProps) {
  return <div className="mb-3.5" data-cy="form-field-div-6">
      <Label data-cy="form-field-label-7">{label}</Label>
      <div className="relative" data-cy="form-field-div-8">
        <select className={cn(fieldBase, 'h-9 cursor-pointer appearance-none pr-8 shadow-card hover:shadow-none', className)} {...props} data-cy="form-field-select-9">
          {options.map(o => <option key={o} data-cy="form-field-option-10">{o}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="form-field-chevron-down-11" />
      </div>
    </div>;
}
interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  optional?: boolean;
}
export function TextAreaField({
  label,
  optional,
  className,
  ...props
}: TextAreaFieldProps) {
  return <div className="mb-3.5" data-cy="form-field-div-12">
      <Label optional={optional} data-cy="form-field-label-13">{label}</Label>
      <textarea className={cn(fieldBase, 'resize-none py-2', className)} rows={3} {...props} data-cy="form-field-textarea-14" />
    </div>;
}
export function InfoNote({
  children
}: {
  children: ReactNode;
}) {
  return <div className="mb-5 flex items-start gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs leading-relaxed text-neutral-500" data-cy="form-field-div-15">
      {children}
    </div>;
}