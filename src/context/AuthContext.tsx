import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { usersTable } from '../data/repository'

const STORAGE_KEY = 'srvce:auth:userId'

interface AuthContextValue {
  user: User | null
  loading: boolean
  loginAs: (userId: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (!savedId) {
      setLoading(false)
      return
    }
    usersTable.get(savedId).then((found) => {
      setUser(found ?? null)
      setLoading(false)
    })
  }, [])

  async function loginAs(userId: string) {
    const found = await usersTable.get(userId)
    if (!found) throw new Error('Uživatel nenalezen')
    localStorage.setItem(STORAGE_KEY, userId)
    setUser(found)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives alongside its provider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth musí být použito uvnitř AuthProvider')
  return ctx
}
