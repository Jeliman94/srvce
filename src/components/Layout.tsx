import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roleLabels } from '../lib/permissions'
import type { Role } from '../types'

const navItems: { to: string; label: string; roles: Role[] }[] = [
  { to: '/', label: 'Přehled', roles: ['admin', 'technik', 'recepce'] },
  { to: '/zakazky', label: 'Zakázky', roles: ['admin', 'technik', 'recepce'] },
  { to: '/kalendar', label: 'Kalendář', roles: ['admin', 'technik', 'recepce'] },
  { to: '/zakaznici', label: 'Zákazníci', roles: ['admin', 'recepce'] },
  { to: '/zarizeni', label: 'Zařízení', roles: ['admin', 'recepce', 'technik'] },
  { to: '/uzivatele', label: 'Uživatelé', roles: ['admin'] },
  { to: '/nastaveni', label: 'Nastavení', roles: ['admin'] },
]

export function Layout() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
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
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
