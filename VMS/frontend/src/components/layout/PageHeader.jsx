import React from 'react'

/**
 * Page title row — use inside each route view. Optional right-side slot via children (e.g. buttons).
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="hidden h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-slate-600 via-blue-700 to-blue-900 sm:block" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">{title}</h1>
            {subtitle ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">{children}</div>
      ) : null}
    </div>
  )
}
