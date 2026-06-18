import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersTable } from '../data/repository'
import type { User } from '../types'
import { roleLabels } from '../lib/permissions'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Login() {
  const { user, loginAs } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    usersTable.list().then((list) => setUsers(list.filter((u) => u.active)))
  }, [])

  if (user) return <Navigate to="/" replace />

  async function handleLogin(id: string) {
    setPendingId(id)
    await loginAs(id)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">VrataServis</h1>
          <p className="mt-1 text-sm text-slate-500">
            Servisní systém pro vrata, brány a závory
          </p>
        </div>
        <Card className="p-5">
          <p className="mb-3 text-sm font-medium text-slate-700">Přihlásit se jako:</p>
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleLogin(u.id)}
                disabled={pendingId !== null}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">{u.name}</span>
                  <span className="block text-xs text-slate-500">{roleLabels[u.role]}</span>
                </span>
                {pendingId === u.id ? (
                  <span className="text-xs text-slate-400">Přihlašování…</span>
                ) : (
                  <Button variant="secondary" className="pointer-events-none">
                    Vstoupit
                  </Button>
                )}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Demo přihlášení bez hesla — pro produkční nasazení doplňte ostrou autentizaci
            (např. Supabase Auth).
          </p>
        </Card>
      </div>
    </div>
  )
}
