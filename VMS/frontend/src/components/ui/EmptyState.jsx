import React from 'react'

export default function EmptyState({ title = 'No data', message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {message ? <p className="mt-2 text-sm text-slate-500">{message}</p> : null}
    </div>
  )
}
