import React from 'react'
import { NavLink } from 'react-router-dom'
import { navigation } from '../../config/navigation'

function navLinkClass({ isActive }) {
  return [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-blue-600/20 to-blue-900/10 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
  ].join(' ')
}

function NavItem({ item }) {
  return (
    <NavLink to={item.path} end={item.path === '/'} className={navLinkClass}>
      {({ isActive }) => (
        <>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
              isActive
                ? 'bg-blue-400 shadow-[0_0_8px_theme(colors.blue.400)]'
                : 'bg-slate-600 group-hover:bg-slate-400'
            }`}
            aria-hidden
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ id }) {
  return (
    <aside
      id={id}
      className="relative flex h-full min-h-screen w-[260px] shrink-0 flex-col border-r border-slate-800/80 bg-slate-950 lg:w-[272px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(37,99,235,0.07)_0%,transparent_45%),linear-gradient(to_bottom,rgba(15,23,42,0)_0%,rgba(15,23,42,0.88)_100%)]"
      />
      <div className="relative border-b border-white/5 px-5 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-lg shadow-blue-950/40 ring-2 ring-white/10">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-400/90">
              Workshop
            </div>
            <div className="text-lg font-bold tracking-tight text-white">VMS</div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Service pipeline, inventory & billing in one calm workspace.
        </p>
      </div>
      <nav className="relative flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Navigate
        </p>
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.key}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="relative border-t border-white/5 px-5 py-4">
        <div className="rounded-xl bg-slate-900/80 px-3 py-2.5 ring-1 ring-white/5">
          <p className="text-[11px] font-medium text-slate-500">Need help?</p>
          <p className="text-xs text-slate-400">Use Reports for pipeline & stock.</p>
        </div>
      </div>
    </aside>
  )
}
