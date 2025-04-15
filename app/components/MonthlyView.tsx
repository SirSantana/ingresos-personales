'use client'

import { useState, useEffect } from 'react'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useIncomeByMonth } from '../hooks/useIncomeByMonth'
import IncomeEditor from './IncomeEditor'

const sources = [
  { id: '6b8f9bc2-49e3-4d04-bd73-aa0bd3f40d58', name: 'YouTube Llanta Pinchada TV' },
  { id: '841b8e44-d99a-4152-ac14-ec497508cc21', name: 'YouTube Flat Tire TV' },
  { id: '4b872fac-31d5-4a69-924a-ebb728fc7b67', name: 'YouTube Pneu Furado TV' },
  { id: '3f4b4234-4678-4f08-93cc-02d1cdd106e7', name: 'Facebook Quarks-Automotriz' },
  { id: 'af0e5bf0-ee62-4031-aad3-7e7af56d6f9b', name: 'Facebook Quarks-Motos' },
  { id: '3a99e3e2-ee7d-4c71-bdd6-18ec72d0b414', name: 'TikTok Llanta Pinchada TV' },
  { id: '8efd713b-5778-440d-b9d0-e16e0a566390', name: 'Mercado Libre' },
]

function groupIncomesByCreatedAt(data: { created_at: string; amount: number }[]) {
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
  year,
  month
}: {
  selectedDate: Date
  year: number,
  month?: number
}) {
  const [days, setDays] = useState<Date[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const { incomes, loading } = useIncomeByMonth(year, month || 1, reloadKey)
  const incomeMap = groupIncomesByCreatedAt(incomes)

  useEffect(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    setDays(eachDayOfInterval({ start, end }))
  }, [selectedDate, reloadKey])

  const getIncomesByDay = (day: Date) => {
    return incomes.filter((i) => isSameDay(parseISO(i.created_at), day))
  }
  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          Ingresos de {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const total = incomeMap[key] || 0

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
                  onClick={() => setSelectedDay(day)}
                >
                  Agregar / Editar ingresos
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <IncomeEditor
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          sources={sources}
          onSave={() => setReloadKey(k => k + 1)}
          existingIncomes={getIncomesByDay(selectedDay)}
        />
      )}
    </>
  )
}
