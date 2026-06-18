# VrataServis

Servisní systém pro firmu zabývající se servisem garážových vrat, bran a
závor. Běží jako webová aplikace v prohlížeči – evidence zákazníků a
servisních zakázek, kanban přehled zakázek, kalendář naplánovaných
zásahů a správa uživatelů s rolemi.

## Demo

Nasazeno na GitHub Pages: https://jeliman94.github.io/srvce/

## Role

- **Administrátor** – plný přístup, správa uživatelů a nastavení, jediný
  kdo zakládá zákazníky/zakázky a plánuje technika (přiřazení +
  termín zásahu).
- **Technik** – může pracovat na jakékoliv zakázce (ne jen na té, na kterou
  je naplánovaný) – mění stav, zapisuje čas příjezdu a odjezdu, spotřebovaný
  materiál a práci.
- **Fakturace** – jen prohlížení: vidí všechny zakázky a přehled hotových
  servisů (odpracované hodiny + čas cesty k zákazníkovi a zpět).

## Spuštění

```bash
npm install
npm run dev
```

Report „Hotové servisy" počítá čas cesty a kilometry k zákazníkovi a zpět
přes [Mapy.cz API](https://api.mapy.cz) (stejný výpočet jako
compact-hk.cz/servis/cesty: čas/vzdálenost jedné cesty firma → zákazník
× 2). Vyžaduje API klíč v proměnné `VITE_MAPY_API_KEY` – zkopírujte
`.env.example` do `.env` a klíč doplňte. Bez něj report zobrazí u cesty „—".
Pro nasazení na GitHub Pages je potřeba klíč uložit jako repository secret
`VITE_MAPY_API_KEY` (Settings → Secrets and variables → Actions) – workflow
`.github/workflows/deploy-pages.yml` ho při buildu předá do `npm run build`.

Aplikace se otevře na `http://localhost:5173`. Na přihlašovací obrazovce
vyberte jednoho z demo uživatelů (bez hesla) – `Jana Nováková` (admin),
`Petr Svoboda` / `Tomáš Dvořák` (technik), `Lucie Horáková` (fakturace).

```bash
npm run build   # typecheck + produkční build do dist/
npm run lint    # ESLint
```

## Ukládání dat

V tomto stavu aplikace ukládá veškerá data **lokálně v prohlížeči**
(`localStorage`), aby šla okamžitě používat a testovat bez nutnosti
zakládat účet u externí služby. Datová vrstva (`src/lib/localTable.ts`)
má ale stejné asynchronní API, jaké má skutečný backend (Supabase) –
`list/get/insert/update/remove` vrací `Promise`. Díky tomu lze později
přejít na sdílenou databázi tak, že se v `src/data/repository.ts`
nahradí `LocalTable` instance klientem Supabase, beze změny ve
zbytku aplikace (komponenty a stránky volají jen tato repozitářová
rozhraní).

Typy v `src/types/index.ts` odpovídají tabulkám v
`supabase/migrations/0001_init.sql` – to je SQL schéma připravené pro
budoucí napojení na Supabase (zákazníci, zakázky, uživatelé,
role, RLS politiky). Postup migrace:

1. Založit projekt na [supabase.com](https://supabase.com) a spustit
   `supabase/migrations/0001_init.sql`.
2. Nainstalovat `@supabase/supabase-js` a vytvořit klienta s
   `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` v `.env`.
3. V `src/data/repository.ts` nahradit `LocalTable` voláními
   Supabase klienta (`from('customers').select()` apod.).
4. Skutečné přihlášení nahradit Supabase Auth (dnes je v
   `src/context/AuthContext.tsx` jen výběr uživatele bez hesla).

V Nastavení (role admin) lze data kdykoliv vrátit do výchozího demo
stavu.

## Struktura

- `src/types` – datový model (Customer, ServiceOrder, User…)
- `src/data` – seed data a repozitáře nad `LocalTable`
- `src/lib` – formátování, popisky stavů, oprávnění podle role
- `src/context/AuthContext.tsx` – přihlášený uživatel
- `src/hooks/useEntities.ts` – načtení a lookup zákazníků/zakázek/uživatelů
- `src/components` – sdílené UI a formuláře (modaly)
- `src/pages` – jednotlivé obrazovky a routy
