import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roleLabels } from '../lib/permissions'
import type { Role } from '../types'

const navItems: { to: string; label: string; roles: Role[] }[] = [
  { to: '/', label: 'Přehled', roles: ['admin', 'technik', 'fakturace'] },
  { to: '/zakazky', label: 'Zakázky', roles: ['admin', 'technik', 'fakturace'] },
  { to: '/hotove-servisy', label: 'Hotové servisy', roles: ['admin', 'fakturace'] },
  { to: '/kalendar', label: 'Kalendář', roles: ['admin', 'technik', 'fakturace'] },
  { to: '/zakaznici', label: 'Zákazníci', roles: ['admin'] },
  { to: '/uzivatele', label: 'Uživatelé', roles: ['admin'] },
  { to: '/nastaveni', label: 'Nastavení', roles: ['admin'] },
]

export function Layout() {
  const { user, logout } = useAuth()
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-slate-50">
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="px-5 py-5">
          <p className="text-lg font-semibold text-slate-900">VrataServis</p>
          <p className="text-xs text-slate-500">Servis vrat, bran a závor</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Odhlásit se
          </button>
        </div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Otevřít menu"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="text-base font-semibold text-slate-900">VrataServis</p>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
