import React from 'react'

export default function EmptyState({ title = 'No data', message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50/90 to-white px-6 py-16 text-center shadow-inner shadow-slate-900/[0.03]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-600/15">
        <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {message ? <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">{message}</p> : null}
    </div>
  )
}
