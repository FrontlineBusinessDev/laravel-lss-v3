import { useRef, useState } from 'react'
import { Link2, CheckCircle2, Circle, UploadCloud, FileText, X, ExternalLink } from 'lucide-react'
import type { Trainee } from '@/types'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE_MB = 10
const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
const ACCEPTED_LABEL = 'PDF, DOC, DOCX, JPG, or PNG'

type Mode = 'link' | 'upload'

interface DocState {
  link?: string
  submittedAt?: string
  fileName?: string
  fileSize?: number
  mode: Mode
  error?: string
}

export function DocumentsTab({ trainee }: { trainee: Trainee }) {
  const [docs, setDocs] = useState<Record<string, DocState>>(() =>
    Object.fromEntries(trainee.documents.map((d) => [d.key, { link: d.link, submittedAt: d.submittedAt, mode: 'link' as Mode }])),
  )
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const submittedCount = trainee.documents.filter((d) => docs[d.key]?.link || docs[d.key]?.fileName).length

  const setMode = (key: string, mode: Mode) => {
    setDocs((prev) => ({ ...prev, [key]: { ...prev[key], mode, error: undefined } }))
  }

  const setLink = (key: string, link: string) => {
    setDocs((prev) => ({
      ...prev,
      [key]: { ...prev[key], link, submittedAt: link ? prev[key]?.submittedAt ?? new Date().toISOString().slice(0, 10) : undefined },
    }))
  }

  const validateFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_TYPES.includes(ext)) return `File type not supported. Accepted: ${ACCEPTED_LABEL}.`
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File exceeds the ${MAX_FILE_SIZE_MB}MB limit.`
    return null
  }

  const handleFile = (key: string, file: File | undefined) => {
    if (!file) return
    const error = validateFile(file)
    if (error) {
      setDocs((prev) => ({ ...prev, [key]: { ...prev[key], error, fileName: undefined, fileSize: undefined } }))
      return
    }
    setDocs((prev) => ({
      ...prev,
      [key]: { ...prev[key], fileName: file.name, fileSize: file.size, link: undefined, submittedAt: new Date().toISOString().slice(0, 10), error: undefined },
    }))
    // note: in production this uploads directly to the FBS Google Drive (contact@frontlinebusiness.com.ph)
  }

  const removeFile = (key: string) => {
    setDocs((prev) => ({ ...prev, [key]: { ...prev[key], fileName: undefined, fileSize: undefined } }))
  }

  const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Required documents</h3>
          <p className="text-xs text-neutral-500">Paste a document link or upload a file directly — uploads are saved to the FBS Google Drive.</p>
        </div>
        <span className="text-xs text-neutral-500">
          {submittedCount} / {trainee.documents.length} submitted
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {trainee.documents.map((doc) => {
          const state = docs[doc.key] ?? { mode: 'link' as Mode }
          const hasSubmission = !!state.link || !!state.fileName
          const isDragOver = dragOverKey === doc.key

          return (
            <div key={doc.key} className="rounded-md border border-neutral-200 p-3.5">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {hasSubmission ? (
                    <CheckCircle2 size={15} className="text-success-600" />
                  ) : (
                    <Circle size={15} className="text-neutral-300" />
                  )}
                  <span className="text-sm font-medium text-ink">
                    {doc.label} {doc.optional && <span className="text-xs font-normal text-neutral-400">(optional)</span>}
                  </span>
                </div>
                {state.submittedAt && <span className="text-xs text-neutral-500">Submitted {state.submittedAt}</span>}
              </div>

              {/* Mode toggle */}
              <div className="mb-2.5 inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setMode(doc.key, 'link')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 transition-colors',
                    state.mode === 'link' ? 'bg-white text-ink shadow-card' : 'text-neutral-500 hover:text-neutral-700',
                  )}
                >
                  <Link2 size={12} /> Paste link
                </button>
                <button
                  onClick={() => setMode(doc.key, 'upload')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 transition-colors',
                    state.mode === 'upload' ? 'bg-white text-ink shadow-card' : 'text-neutral-500 hover:text-neutral-700',
                  )}
                >
                  <UploadCloud size={12} /> Upload file
                </button>
              </div>

              {state.mode === 'link' ? (
                <div className="relative">
                  <Link2 size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={state.link ?? ''}
                    onChange={(e) => setLink(doc.key, e.target.value)}
                    placeholder="Paste document link (e.g. Google Drive URL)"
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white pl-8 pr-2.5 text-xs text-ink transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              ) : (
                <div>
                  {state.fileName ? (
                    <div className="flex items-center justify-between gap-2 rounded-md border border-success-100 bg-success-50 px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText size={15} className="shrink-0 text-success-700" />
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-ink">{state.fileName}</div>
                          <div className="text-[11px] text-neutral-500">{state.fileSize ? formatSize(state.fileSize) : ''}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(doc.key)}
                        aria-label="Remove file"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white hover:text-danger-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOverKey(doc.key)
                      }}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOverKey(null)
                        handleFile(doc.key, e.dataTransfer.files?.[0])
                      }}
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-3 py-5 text-center transition-colors',
                        isDragOver ? 'border-brand-400 bg-brand-50' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100',
                      )}
                    >
                      <UploadCloud size={18} className={isDragOver ? 'text-brand-500' : 'text-neutral-400'} />
                      <span className="text-xs font-medium text-ink">
                        <span className="text-brand-600">Click to upload</span> or drag and drop
                      </span>
                      <input
                        ref={(el) => (fileInputRefs.current[doc.key] = el)}
                        type="file"
                        accept={ACCEPTED_TYPES.join(',')}
                        className="hidden"
                        onChange={(e) => handleFile(doc.key, e.target.files?.[0])}
                      />
                    </label>
                  )}
                  <p className="mt-1.5 text-[11px] text-neutral-400">
                    Accepted formats: {ACCEPTED_LABEL} · Max file size: {MAX_FILE_SIZE_MB}MB
                  </p>
                  {state.error && <p className="mt-1 text-[11px] font-medium text-danger-600">{state.error}</p>}
                </div>
              )}

              {state.link && state.mode === 'link' && (
                <a
                  href={state.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand-500 hover:text-brand-600"
                >
                  Open link <ExternalLink size={10} />
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
