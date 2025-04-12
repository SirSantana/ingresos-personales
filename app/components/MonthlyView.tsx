'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabaseClient'

async function fetchIncomesOfMonth(date: Date) {
  const start = startOfMonth(date).toISOString()
  const end = endOfMonth(date).toISOString()
  const { data, error } = await supabase
    .from('daily_incomes')
    .select('created_at, amount')
    .gte('created_at', start)
    .lte('created_at', end)
  if (error) {
    console.error('Error fetching monthly incomes:', error)
    return []
  }
  return data
}

const groupIncomesByCreatedAt = (data: { created_at: string; amount: number }[]) => {
  const map: Record<string, number> = {}
  data.forEach(({ created_at, amount }) => {
    const dateKey = format(parseISO(created_at), 'yyyy-MM-dd')
    if (!map[dateKey]) map[dateKey] = 0
    map[dateKey] += amount
  })
  return map
}

export default function MonthlyView({
  selectedDate,
  onDaySelect,
  reloadKey, // <- nueva prop
}: {
  selectedDate: Date
  onDaySelect: (date: Date) => void
  reloadKey?: number // <- opcional, para refrescar sin cambiar la fecha
}) {
  const [days, setDays] = useState<Date[]>([])
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    const allDays = eachDayOfInterval({ start, end })
    setDays(allDays)
  }, [selectedDate])

  useEffect(() => {
    const loadMonthly = async () => {
      const rawData = await fetchIncomesOfMonth(selectedDate)
      const grouped = groupIncomesByCreatedAt(rawData)
      setMonthlyTotals(grouped)
    }
    loadMonthly()
  }, [selectedDate, reloadKey])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">
        Ingresos de {format(selectedDate, 'MMMM yyyy', { locale: es })}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const total = monthlyTotals[key] || 0
          return (
            <div
              key={day.toISOString()}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base text-gray-700 font-semibold">
                  {format(day, 'd MMMM', { locale: es })}
                </h3>
                {total > 0 ? (
                  <p className="text-green-600 font-bold text-sm mt-2">
                    ${total.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm mt-2">Sin ingresos</p>
                )}
              </div>

              <button
                className="mt-4 text-sm bg-blue-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-blue-700 transition"
                onClick={() => onDaySelect(day)}
              >
                Agregar / Editar ingresos
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
