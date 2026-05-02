import React from 'react'

function StatCard({ label, value, hint, loading, error }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-100" />
      ) : error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      )}
      {hint && !error ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

/**
 * @param {{ loading?: boolean, items: Array<{ key: string, label: string, value: string|number, hint?: string, error?: string }> }} props
 */
export default function StatCards({ loading, items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <StatCard
          key={item.key}
          label={item.label}
          value={item.value}
          hint={item.hint}
          loading={item.loading}
          error={item.error}
        />
      ))}
    </div>
  )
}
