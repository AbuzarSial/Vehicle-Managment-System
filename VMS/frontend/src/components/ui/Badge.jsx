import React from 'react'

const variants = {
  default: 'bg-slate-100 text-slate-700 ring-slate-500/10',
  warning: 'bg-amber-50 text-amber-900 ring-amber-600/20',
  danger: 'bg-red-50 text-red-800 ring-red-600/15',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  const ring = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
  return (
    <span className={`${ring} ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  )
}
