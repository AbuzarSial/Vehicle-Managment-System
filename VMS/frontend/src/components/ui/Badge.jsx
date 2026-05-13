import React from 'react'

const variants = {
  default: 'bg-slate-100 text-slate-700 ring-slate-400/20',
  warning: 'bg-amber-50 text-amber-900 ring-amber-500/25',
  danger: 'bg-red-50 text-red-900 ring-red-500/20',
  success: 'bg-green-50 text-green-900 ring-green-600/20',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const ring =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'
  return (
    <span className={`${ring} ${variants[variant] ?? variants.default} ${className}`}>{children}</span>
  )
}
