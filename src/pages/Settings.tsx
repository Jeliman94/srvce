import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FieldGroup, Input } from '../components/ui/Field'
import { resetDemoData } from '../data/repository'
import { getPricingSettings, savePricingSettings, type PricingSettings } from '../lib/pricing'

export default function Settings() {
  const [done, setDone] = useState(false)
  const [pricing, setPricing] = useState<PricingSettings>(getPricingSettings())
  const [pricingSaved, setPricingSaved] = useState(false)

  function handleReset() {
    if (!confirm('Opravdu obnovit demo data? Všechny vlastní úpravy budou ztraceny.')) return
    resetDemoData()
    setDone(true)
    setTimeout(() => window.location.reload(), 500)
  }

  function updatePricing(patch: Partial<PricingSettings>) {
    setPricing((p) => ({ ...p, ...patch }))
    setPricingSaved(false)
  }

  function handleSavePricing() {
    savePricingSettings(pricing)
    setPricingSaved(true)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-900">Nastavení</h1>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900">Ceník</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sazby pro výpočet ceny servisu. První započatá hodina se účtuje vždy celá, po ní se
          účtuje každá započatá čtvrthodina. Cena za dopravu se účtuje za každý započatý kilometr,
          minimálně však ve výši minimálního cestovného.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Hodinová sazba – soukromá osoba (Kč/h)">
            <Input
              type="number"
              min={0}
              value={pricing.hourlyRatePerson}
              onChange={(e) => updatePricing({ hourlyRatePerson: Number(e.target.value) })}
            />
          </FieldGroup>
          <FieldGroup label="Hodinová sazba – firma (Kč/h)">
            <Input
              type="number"
              min={0}
              value={pricing.hourlyRateCompany}
              onChange={(e) => updatePricing({ hourlyRateCompany: Number(e.target.value) })}
            />
          </FieldGroup>
          <FieldGroup label="Cena za km (Kč)">
            <Input
              type="number"
              min={0}
              value={pricing.kmRate}
              onChange={(e) => updatePricing({ kmRate: Number(e.target.value) })}
            />
          </FieldGroup>
          <FieldGroup label="Minimální cestovné (Kč)">
            <Input
              type="number"
              min={0}
              value={pricing.minTravelFee}
              onChange={(e) => updatePricing({ minTravelFee: Number(e.target.value) })}
            />
          </FieldGroup>
        </div>
        <Button className="mt-4" onClick={handleSavePricing}>
          {pricingSaved ? 'Uloženo' : 'Uložit'}
        </Button>
      </Card>

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
