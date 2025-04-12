'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { log } from 'node:console'

export default function DailyIncomePage() {
  const [sources, setSources] = useState([])
  const [form, setForm] = useState<Record<string, number>>({})
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    const fetchSources = async () => {
      const { data } = await supabase.from('sources').select('*')
      setSources(data)
    }
    fetchSources()
  }, [])

  const handleChange = (sourceId: string, value: string) => {
    setForm({ ...form, [sourceId]: parseFloat(value) || 0 })
  }

  const handleSubmit = async () => {
    // const user = (await supabase.auth.getUser()).data.user
    // if (!user) return

    const records = sources.map(src => ({
        source_id: src.id,                 // ✅ aquí va el ID (UUID)
        amount: form[src.id] || 0, 
    //   user_id: user.id
    }))
    console.log(records);
    
   const res = await supabase.from('daily_incomes').insert(records)
    console.log(res)
//     alert('Ingresos guardados')
  }

  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-4">Ingresos del día</h1>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <div className="space-y-4">
        {sources.map((src: any) => (
          <div key={src.id} className="flex items-center gap-4">
            <label className="w-40">{src.name}</label>
            <input
              type="number"
              value={form[src.id] || ''}
              onChange={e => handleChange(src.id, e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Guardar ingresos
      </button>
    </div>
  )
}
