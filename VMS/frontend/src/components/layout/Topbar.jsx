import React from 'react'

function SidebarToggleIcon({ expanded }) {
  if (expanded) {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  )
}

/**
 * Top strip — global context (environment, product name). Page titles live in PageHeader.
 */
export default function Topbar({ sidebarOpen, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/75 px-5 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mt-0.5 shrink-0 rounded-xl border border-slate-200/90 bg-white p-2 text-slate-600 shadow-sm ring-slate-900/[0.04] transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-label={sidebarOpen ? 'Hide navigation sidebar' : 'Show navigation sidebar'}
          >
            <SidebarToggleIcon expanded={sidebarOpen} />
          </button>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-800">
              Vehicle Service Management
            </span>
            <span className="mt-0.5 block text-xs font-medium text-slate-500">
              Operations · PKR · Pakistan demo data
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/80 sm:inline">
            v1 API
          </span>
          <span className="rounded-full bg-gradient-to-r from-blue-50 to-slate-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-600/15">
            Ready
          </span>
        </div>
      </div>
    </header>
  )
}
