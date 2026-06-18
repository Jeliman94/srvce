import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Stránka nenalezena</h1>
      <Link to="/" className="text-sm text-slate-500 hover:underline">
        Zpět na přehled
      </Link>
    </div>
  )
}
