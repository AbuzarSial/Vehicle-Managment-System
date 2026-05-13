import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

/**
 * Shell layout: fixed sidebar + scrollable main column (topbar + page content via Outlet).
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_130%_70%_at_50%_-15%,theme(colors.blue.50/70),theme(colors.slate.50)_50%,theme(colors.stone.100/80))] text-slate-800">
      <div
        className={`relative shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
          sidebarOpen ? 'w-[260px] lg:w-[272px]' : 'w-0'
        }`}
      >
        <Sidebar id="app-sidebar" />
      </div>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-auto p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
