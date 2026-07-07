import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function Label({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
      {children} {optional && <span className="font-normal text-neutral-400">(optional)</span>}
    </label>
  )
}

const fieldBase =
  'w-full rounded-md border border-neutral-200 bg-white px-2.5 text-sm text-ink placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  optional?: boolean
}
export function TextField({ label, optional, className, ...props }: TextFieldProps) {
  return (
    <div className="mb-3.5">
      <Label optional={optional}>{label}</Label>
      <input className={cn(fieldBase, 'h-9', className)} {...props} />
    </div>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: string[]
}
export function SelectField({ label, options, className, ...props }: SelectFieldProps) {
  return (
    <div className="mb-3.5">
      <Label>{label}</Label>
      <div className="relative">
        <select
          className={cn(
            fieldBase,
            'h-9 cursor-pointer appearance-none pr-8 shadow-card hover:shadow-none',
            className,
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
      </div>
    </div>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  optional?: boolean
}
export function TextAreaField({ label, optional, className, ...props }: TextAreaFieldProps) {
  return (
    <div className="mb-3.5">
      <Label optional={optional}>{label}</Label>
      <textarea className={cn(fieldBase, 'resize-none py-2', className)} rows={3} {...props} />
    </div>
  )
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs leading-relaxed text-neutral-500">
      {children}
    </div>
  )
}
