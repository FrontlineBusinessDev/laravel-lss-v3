import { isUrlMethodPair, resolveUrlMethodPairComponent } from '@inertiajs/core'
import type { InertiaLinkProps } from '@inertiajs/react'

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** Normalizes an Inertia `<Link href>` value (string or `{url, method}` pair) to a plain URL string. */
export function toUrl(href: NonNullable<InertiaLinkProps['href']>): string {
  if (typeof href === 'string') {
    return href
  }

  if (isUrlMethodPair(href)) {
    return resolveUrlMethodPairComponent(href) ?? ''
  }

  return String(href)
}

/** Formats a Date as `YYYY-MM-DD` for use as an <input type="date"> value/default. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
