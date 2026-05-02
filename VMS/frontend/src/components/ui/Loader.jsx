import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 text-slate-600">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600"
        role="status"
        aria-label={label}
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
