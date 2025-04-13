'use client'

import { useState, useEffect } from 'react'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns'
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
  reloadKey,
}: {
  selectedDate: Date
  onDaySelect: (date: Date) => void
  reloadKey?: number
}) {
  const [days, setDays] = useState<Date[]>([])
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, number>>({})
  const [yearlyTotal, setYearlyTotal] = useState<number>(0)

  // Calcular días del mes
  useEffect(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    const allDays = eachDayOfInterval({ start, end })
    setDays(allDays)
  }, [selectedDate])

  // Traer ingresos del mes
  useEffect(() => {
    // const loadMonthly = async () => {
    //   const rawData = await fetchIncomesOfMonth(selectedDate)
    //   const grouped = groupIncomesByCreatedAt(rawData)
    //   setMonthlyTotals(grouped)
    // }
    // loadMonthly()

    const loadMonthly = async () => {
      const start = startOfMonth(selectedDate).toISOString()
      const end = endOfMonth(selectedDate).toISOString()
      const { data, error } = await supabase.rpc('get_incomes_between_dates', {
        start_date: start.split('T')[0], // o directamente el Date.toISOString().slice(0, 10)
        end_date: end.split('T')[0],
      })
      
      if (error) {
        console.error('Error fetching monthly incomes:', error)
        return []
      }
      console.log(data, 'mes');
      
      return data
    }
    loadMonthly().then(setMonthlyTotals)

  }, [selectedDate, reloadKey])

  // Traer ingresos del año completo
  useEffect(() => {
    const fetchYearlyTotal = async () => {
      const { data, error } = await supabase.rpc('get_total_income_by_year', {
        year: 2025,
      })
      
      if (error) {
        console.error('Error al traer total del año:', error)
      } else {
        console.log('Ingresos del año:', data)
        setYearlyTotal(data || 0)
      }
    }

    fetchYearlyTotal()
  }, [selectedDate])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold text-gray-800 mb-2">
        Ingresos de {format(selectedDate, 'MMMM yyyy', { locale: es })}
      </h2>

      <p className="text-gray-600 text-lg mb-8">
        Total del año: <span className="font-semibold text-green-700">${yearlyTotal.toFixed(2)}</span>
      </p>

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
