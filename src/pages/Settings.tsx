import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { resetDemoData } from '../data/repository'

export default function Settings() {
  const [done, setDone] = useState(false)

  function handleReset() {
    if (!confirm('Opravdu obnovit demo data? Všechny vlastní úpravy budou ztraceny.')) return
    resetDemoData()
    setDone(true)
    setTimeout(() => window.location.reload(), 500)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-900">Nastavení</h1>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900">Ukládání dat</h2>
        <p className="mt-1 text-sm text-slate-500">
          Aplikace v tomto režimu ukládá veškerá data lokálně v prohlížeči (localStorage). Pro
          víceuživatelské nasazení se sdíleným přístupem doplňte v <code>src/lib</code> napojení
          na Supabase – datový model v <code>src/types</code> a SQL schéma v{' '}
          <code>supabase/migrations</code> jsou na to připravené.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900">Demo data</h2>
        <p className="mt-1 text-sm text-slate-500">
          Obnoví výchozí ukázková data zákazníků a zakázek a smaže vaše úpravy.
        </p>
        <Button variant="danger" className="mt-3" onClick={handleReset}>
          {done ? 'Obnoveno…' : 'Obnovit demo data'}
        </Button>
      </Card>
    </div>
  )
}
