import React from 'react'
import { NavLink } from 'react-router-dom'
import { navigation } from '../../config/navigation'

function navClass({ isActive }) {
  return [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'border border-indigo-100 bg-indigo-50 text-indigo-800'
      : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:w-64">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">VMS</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {navigation.map((item) => (
            <li key={item.key}>
              <NavLink to={item.path} end={item.path === '/'} className={navClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
