import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
        role="status"
        aria-label={label}
      />
      <span className="text-sm">{label}</span>
    </div>
  )
}
