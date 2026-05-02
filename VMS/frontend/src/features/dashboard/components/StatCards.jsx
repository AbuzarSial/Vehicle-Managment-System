import React from 'react'

/** Restrained slate + navy accents — cohesive, not rainbow. */
const accents = [
  'from-slate-600 to-slate-800',
  'from-blue-700 to-blue-900',
  'from-slate-700 to-blue-900',
  'from-blue-600 to-blue-800',
  'from-slate-600 to-blue-800',
  'from-blue-800 to-slate-900',
]

function StatCard({ label, value, hint, loading, error, accentClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02] transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.07]">
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${accentClass} opacity-[0.92]`}
        aria-hidden
      />
      <p className="pl-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-3 ml-3 h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
      ) : error ? (
        <p className="mt-2 pl-3 text-sm font-medium text-red-600">{error}</p>
      ) : (
        <p className="mt-2 pl-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
      )}
      {hint && !error ? (
        <p className="mt-2 pl-3 text-xs leading-relaxed text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

/**
 * @param {{ items: Array<{ key: string, label: string, value: string|number, hint?: string, loading?: boolean, error?: string }> }} props
 */
export default function StatCards({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <StatCard
          key={item.key}
          label={item.label}
          value={item.value}
          hint={item.hint}
          loading={item.loading}
          error={item.error}
          accentClass={accents[i % accents.length]}
        />
      ))}
    </div>
  )
}
