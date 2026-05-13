import React from 'react'

/**
 * Simple dashboard / panel shell — title row + body.
 */
export default function Card({ title, subtitle, badge, actions, children, className = '' }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.03] ${className}`}
    >
      {(title || subtitle || badge || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4">
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-bold tracking-tight text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-xs leading-relaxed text-slate-600">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {badge}
            {actions}
          </div>
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}
