/**
 * @file hooks/use-file-upload-field.tsx
 * Drop-in picker for `type: 'file'` FieldDefs — single or multiple, drag &
 * drop, size/type/count validation, and thumbnails for both already-uploaded
 * server files and newly-selected local files.
 *
 * This component itself does not upload anything — it just manages a
 * controlled FileFieldValue. The actual request happens when the form
 * submits (see DataTableField's handleSave, which packs everything into a
 * FormData request whenever a file field is present).
 *
 * If you want per-file progress bars wired through your existing
 * progressBus / useFileUpload.ts system instead of one bulk submit, swap the
 * submit step in DataTableField for that hook — this component's value
 * shape (existing/files/removedIds) is upload-mechanism agnostic, so it
 * still works as the source of "what should be uploaded."
 */

import { Eye, File as FileIcon, UploadCloud, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ImageLightbox } from '@/components/ImageLightbox';
import type { ExistingFile, FileFieldValue } from '@/types/reusable/fields';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes?: number): string {
  if (!bytes) {
    return '';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
function isImageName(name: string, type?: string): boolean {
  if (type) {
    return type.startsWith('image/');
  }
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
}

/**
 * Extracts the file name from a URL/path, dropping any query string or hash.
 * Presigned S3/Spaces URLs append `?X-Amz-…`; without stripping it the derived
 * name keeps the query and `isImageName`'s extension test (anchored on `$`)
 * fails, so an image would be misdetected as a generic file.
 */
function fileNameFromUrl(url: string): string {
  const path = url.split(/[?#]/)[0];
  return path.split('/').pop() || url;
}

/**
 * Normalises whatever shape your API resource sends back for a file/media
 * relation into ExistingFile[]. Accepts:
 *  - null / undefined                  → []
 *  - a single { id, name, url, ... } object
 *  - an array of such objects
 *  - a plain url/path string
 */
export function normalizeExistingFiles(raw: unknown): ExistingFile[] {
  if (!raw) {
    return [];
  }
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((item): ExistingFile | null => {
    if (typeof item === 'string') {
      return {
        id: item,
        name: fileNameFromUrl(item),
        url: item
      };
    }
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const url = String(obj.url ?? obj.path ?? '');
      if (!url) {
        return null;
      }
      return {
        id: obj.id as string | number ?? url,
        name: String(obj.name ?? obj.file_name ?? fileNameFromUrl(url)),
        url,
        size: typeof obj.size === 'number' ? obj.size : undefined,
        type: typeof obj.type === 'string' ? obj.type : undefined
      };
    }
    return null;
  }).filter((f): f is ExistingFile => f !== null);
}
export const emptyFileFieldValue: FileFieldValue = {
  existing: [],
  files: [],
  removedIds: []
};

// ─── thumbnail for a newly-picked local File ───────────────────────────────

function LocalThumb({
  file
}: {
  file: File;
}) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!isImageName(file.name, file.type)) {
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  if (src) {
    return <img src={src} alt={file.name} className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover" data-cy="use-file-upload-field-img-1" />;
  }
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50" data-cy="use-file-upload-field-div-2">
            <FileIcon className="size-4.5 text-slate-400" strokeWidth={1.75} data-cy="use-file-upload-field-file-icon-3" />
        </div>;
}

// ─── FileUploadField ────────────────────────────────────────────────────────

interface FileUploadFieldProps {
  value: FileFieldValue;
  onChange: (value: FileFieldValue) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  preview?: boolean;
  disabled?: boolean;
  error?: string;
  'data-cy'?: string;
}
export function FileUploadField({
  value,
  onChange,
  multiple = false,
  accept,
  maxSizeMB,
  maxFiles,
  preview = true,
  disabled,
  error,
  'data-cy': dataCy = 'use-file-upload-field-input-file'
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  // URL of the image currently open in the full-size lightbox, if any.
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const existing = value?.existing ?? [];
  const files = value?.files ?? [];
  const atCapacity = multiple && !!maxFiles && existing.length + files.length >= maxFiles;
  const addFiles = (incoming: File[]) => {
    if (disabled || incoming.length === 0) {
      return;
    }
    setLocalError(null);
    if (!multiple) {
      const next = incoming[0];
      if (maxSizeMB && next.size > maxSizeMB * 1024 * 1024) {
        setLocalError(`${next.name} is larger than ${maxSizeMB}MB.`);
        return;
      }

      // Picking a new file replaces whatever was there before
      onChange({
        ...value,
        existing: [],
        files: [next]
      });
      return;
    }
    const room = maxFiles ? maxFiles - existing.length - files.length : Infinity;
    if (room <= 0) {
      setLocalError(`You can only attach up to ${maxFiles} files.`);
      return;
    }
    const accepted: File[] = [];
    for (const f of incoming) {
      if (accepted.length >= room) {
        setLocalError(`You can only attach up to ${maxFiles} files.`);
        break;
      }
      if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
        setLocalError(`${f.name} is larger than ${maxSizeMB}MB.`);
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length > 0) {
      onChange({
        ...value,
        files: [...files, ...accepted]
      });
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = ''; // allow picking the same file again later
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && !atCapacity) {
      addFiles(Array.from(e.dataTransfer.files ?? []));
    }
  };
  const removeNew = (idx: number) => onChange({
    ...value,
    files: files.filter((_, i) => i !== idx)
  });
  const removeExisting = (id: string | number) => onChange({
    ...value,
    existing: existing.filter(f => f.id !== id),
    removedIds: [...value.removedIds, id]
  });
  return <div data-cy="use-file-upload-field-div-4">
            <div onClick={() => !disabled && !atCapacity && inputRef.current?.click()} onDragOver={e => {
      e.preventDefault();
      if (!disabled && !atCapacity) {
        setDragOver(true);
      }
    }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} className={['flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors', dragOver ? 'border-primary bg-primary/5' : 'border-slate-200', error ? 'border-rose-300' : '', disabled || atCapacity ? 'cursor-not-allowed opacity-60' : 'hover:border-slate-300 hover:bg-slate-50/40'].join(' ')} data-cy="use-file-upload-field-div-5">
                <UploadCloud className="size-5 text-slate-400" strokeWidth={1.75} data-cy="use-file-upload-field-upload-cloud-6" />
                <p className="text-sm font-medium" data-cy="use-file-upload-field-p-7">
                    {atCapacity ? 'Maximum number of files reached' : `Drag & drop ${multiple ? 'files' : 'a file'} here, or click to browse`}
                </p>
                {accept && !atCapacity && <p className="text-xs text-slate-400" data-cy="use-file-upload-field-p-8">{accept}</p>}
                <input ref={inputRef} type="file" multiple={multiple} accept={accept} disabled={disabled} onChange={handleInputChange} className="hidden" data-cy={dataCy} />
            </div>

            {(localError || error) && <p className="mt-1 text-xs text-rose-500" data-cy="use-file-upload-field-p-10">
                    {localError ?? error}
                </p>}

            {(existing.length > 0 || files.length > 0) && <ul className="mt-3 space-y-2" data-cy="use-file-upload-field-ul-11">
                    {existing.map(f => <li key={f.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2" data-cy="use-file-upload-field-li-12">
                            {preview && isImageName(f.name, f.type) ? <img src={f.url} alt={f.name} className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover" data-cy="use-file-upload-field-img-13" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50" data-cy="use-file-upload-field-div-14">
                                    <FileIcon className="size-4.5 text-slate-400" strokeWidth={1.75} data-cy="use-file-upload-field-file-icon-15" />
                                </div>}
                            <a href={f.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm underline-offset-2 hover:underline" data-cy="use-file-upload-field-a-f-url">
                                {f.name}
                            </a>
                            {f.size != null && <span className="shrink-0 text-xs text-slate-400" data-cy="use-file-upload-field-span-17">
                                    {formatBytes(f.size)}
                                </span>}
                            {preview && isImageName(f.name, f.type) && <button type="button" onClick={() => setLightboxSrc(f.url)} title="View" className="shrink-0 rounded-md p-1 hover:bg-slate-100 hover:text-slate-700" data-cy="use-file-upload-field-button-view">
                                    <Eye className="size-4" strokeWidth={1.75} data-cy="use-file-upload-field-eye-19" />
                                </button>}
                            {!disabled && <button type="button" onClick={() => removeExisting(f.id)} title="Remove" className="shrink-0 rounded-md p-1 hover:bg-rose-50 hover:text-rose-600" data-cy="use-file-upload-field-button-remove">
                                    <X className="size-4" strokeWidth={1.75} data-cy="use-file-upload-field-x-21" />
                                </button>}
                        </li>)}

                    {files.map((f, i) => <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2" data-cy="use-file-upload-field-li-22">
                            {preview ? <LocalThumb file={f} data-cy="use-file-upload-field-local-thumb-23" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50" data-cy="use-file-upload-field-div-24">
                                    <FileIcon className="size-4.5 text-slate-400" strokeWidth={1.75} data-cy="use-file-upload-field-file-icon-25" />
                                </div>}
                            <span className="min-w-0 flex-1 truncate text-sm" data-cy="use-file-upload-field-span-26">
                                {f.name}
                            </span>
                            <span className="shrink-0 text-xs text-slate-400" data-cy="use-file-upload-field-span-27">
                                {formatBytes(f.size)}
                            </span>
                            {!disabled && <button type="button" onClick={() => removeNew(i)} title="Remove" className="shrink-0 rounded-md p-1 hover:bg-rose-50 hover:text-rose-600" data-cy="use-file-upload-field-button-remove-2">
                                    <X className="size-4" strokeWidth={1.75} data-cy="use-file-upload-field-x-29" />
                                </button>}
                        </li>)}
                </ul>}

            <ImageLightbox open={lightboxSrc !== null} src={lightboxSrc ?? ''} onClose={() => setLightboxSrc(null)} data-cy="use-file-upload-field-image-lightbox-set-lightbox-src" />
        </div>;
}