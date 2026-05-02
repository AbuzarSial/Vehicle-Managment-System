import React from 'react'

/**
 * Top strip — global context (environment, product name). Page titles live in PageHeader.
 */
export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:px-8">
      <span className="text-sm font-medium text-slate-600">Vehicle Service Management</span>
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20">
        Local
      </span>
    </header>
  )
}
