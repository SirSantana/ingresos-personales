'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MonthlyView from './components/MonthlyView'
import IncomeEditor from './components/IncomeEditor'

const sources = [
{id: '6b8f9bc2-49e3-4d04-bd73-aa0bd3f40d58', created_at: '2025-04-11T17:26:53.19664+00:00', name: 'YouTube Llanta Pinchada TV'},
{id: '841b8e44-d99a-4152-ac14-ec497508cc21', created_at: '2025-04-11T17:27:08.005209+00:00', name: 'YouTube Flat Tire TV'},

{id: '4b872fac-31d5-4a69-924a-ebb728fc7b67', created_at: '2025-04-11T17:27:24.45994+00:00', name: 'YouTube Pneu Furado TV'},

{id: '3f4b4234-4678-4f08-93cc-02d1cdd106e7', created_at: '2025-04-11T17:27:41.879392+00:00', name: 'Facebook Quarks-Automotriz'},

{id: 'af0e5bf0-ee62-4031-aad3-7e7af56d6f9b', created_at: '2025-04-11T17:27:56.905301+00:00', name: 'Facebook Quarks-Motos'},

{id: '3a99e3e2-ee7d-4c71-bdd6-18ec72d0b414', created_at: '2025-04-11T17:28:16.798192+00:00', name: 'TikTok Llanta Pinchada TV'},

{id: '8efd713b-5778-440d-b9d0-e16e0a566390', created_at: '2025-04-11T17:28:30.013321+00:00', name: 'Mercado Libre'},
]

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  
  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1>Hola</h1>
      {/* <MonthlyView onDaySelect={(day) => setSelectedDay(day)} /> */}

      {selectedDay && (
        <IncomeEditor
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          sources={sources}
        />
      )}
    </main>
  )
}
