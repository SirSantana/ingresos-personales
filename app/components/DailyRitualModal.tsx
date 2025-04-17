'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'

const affirmationsList = [
  "Soy capaz de crear valor y atraer abundancia.",
  "Cada día mejoro mis hábitos financieros.",
  "Soy disciplinado y merezco mis resultados.",
]

const motivationalQuote = "Visualízate logrando tus metas. Ya estás en camino."

export default function DailyRitualModal() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [ritualData, setRitualData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gratitude, setGratitude] = useState('')
  const [selectedAffirmation, setSelectedAffirmation] = useState('')
  const [completed, setCompleted] = useState(false)

  const rituals = [
    { key: 'agradecer', label: 'Agradecer por 3 cosas' },
    { key: 'visualizar', label: 'Visualizar tus metas' },
    { key: 'leer', label: 'Leer o escuchar algo inspirador' },
    { key: 'afirmaciones', label: 'Decir tus afirmaciones' },
    { key: 'registrar_ingresos', label: 'Registrar ingresos si los hay' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('daily_rituals')
        .select('*')
        .eq('date', today)
        .single()

      if (error || !data) {
        const { data: newData } = await supabase
          .from('daily_rituals')
          .insert({ date: today })
          .select()
          .single()
        setRitualData(newData || {})
      } else {
        setRitualData(data)
        setGratitude(data.gratitude || '')
      }

      const affirmationOfDay = affirmationsList[Math.floor(Math.random() * affirmationsList.length)]
      setSelectedAffirmation(affirmationOfDay)
      setLoading(false)
    }

    fetchData()
  }, [today])

  const toggleStep = async (key: string) => {
    const updated = { ...ritualData, [key]: !ritualData[key] }
    setRitualData(updated)
    await supabase
      .from('daily_rituals')
      .update({ [key]: updated[key] })
      .eq('date', today)
  }

  const saveGratitude = async () => {
    await supabase
      .from('daily_rituals')
      .update({ gratitude })
      .eq('date', today)
  }

  const handleComplete = async () => {
    await saveGratitude()
    setCompleted(true)
  }

  if (loading) return null
  if (completed) return null // Modal cerrado

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-lg space-y-5 shadow-xl">
        {/* 👋 Bienvenida */}
        <h2 className="text-xl font-semibold">Buen día, Miguel 🌞</h2>
        <p className="text-sm text-gray-600">Hoy es {format(new Date(), 'EEEE d MMMM', { locale: undefined })}. Estás haciendo un gran trabajo.</p>

        {/* ✅ Checklist */}
        <div className="space-y-2">
          {rituals.map(r => (
            <label key={r.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!ritualData[r.key]}
                onChange={() => toggleStep(r.key)}
              />
              {r.label}
            </label>
          ))}
        </div>

        {/* 🙏 Caja de agradecimientos */}
        <div>
          <label className="block font-medium mb-1">Hoy agradezco por...</label>
          <textarea
            className="w-full p-2 border rounded-xl"
            rows={3}
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            onBlur={saveGratitude}
          />
        </div>

        {/* 🧠 Visualización */}
        <div className="p-3 bg-blue-50 rounded-xl text-blue-800 text-sm">
          {motivationalQuote}
        </div>

        {/* 💬 Afirmaciones */}
        <div className="p-3 bg-yellow-50 rounded-xl text-yellow-800 text-sm italic">
          “{selectedAffirmation}”
        </div>

        {/* 🚀 Acción final */}
        <button
          onClick={handleComplete}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          ✅ Comenzar mi día con intención
        </button>
      </div>
    </div>
  )
}
