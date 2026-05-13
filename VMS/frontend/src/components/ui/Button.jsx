import React from 'react'

const variants = {
  primary:
    'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-950/20 ring-1 ring-blue-500/30 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98]',
  secondary:
    'border border-slate-200/90 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]',
  danger:
    'bg-gradient-to-b from-red-600 to-red-700 text-white shadow-md shadow-red-900/15 ring-1 ring-red-500/25 hover:from-red-500 hover:to-red-600 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
}

export default function Button({ children, className = '', variant = 'primary', ...rest }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-45'
  return (
    <button
      type="button"
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
