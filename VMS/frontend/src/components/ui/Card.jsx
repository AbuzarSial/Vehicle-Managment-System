import React from 'react'

/**
 * Simple dashboard / panel shell — title row + body.
 */
export default function Card({ title, subtitle, badge, actions, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || subtitle || badge || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {badge}
            {actions}
          </div>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
