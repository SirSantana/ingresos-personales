'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns'
import { es } from 'date-fns/locale'
import dynamic from 'next/dynamic'
import { useIncomeByMonth } from '../hooks/useIncomeByMonth'
import { Income } from '../types/income'
import { sources } from './IncomeReportChart'

// Lazy load del editor
const IncomeEditor = dynamic(() => import('./IncomeEditor'), { ssr: false })



export default function MonthlyView({
  selectedDate,
  year,
  month,
  setIncomeMonth
}: {
  selectedDate: Date
  year: number
  month?: number,
  setIncomeMonth: (income: number) => void
}) {
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const { incomes = [], loading } = useIncomeByMonth(year, month || 1, reloadKey)
  
  const days = useMemo(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    return eachDayOfInterval({ start, end })
  }, [selectedDate, reloadKey])

  const incomeMap = useMemo(() => {
    const map: Record<string, number> = {}
    incomes.forEach(({ created_at, amount }) => {
      const dateKey = format(parseISO(created_at), 'yyyy-MM-dd')
      if (!map[dateKey]) map[dateKey] = 0
      map[dateKey] += amount
    })
    return map
  }, [incomes])

  const totalIncome = useMemo(() => {
    return incomes.reduce((acc, curr) => acc + curr.amount, 0)
  }, [incomes])

  // ✅ Propagamos al padre en un efecto, pero sin causar doble render innecesario
  useEffect(() => {
    setIncomeMonth(totalIncome)
  }, [totalIncome, setIncomeMonth])

  const incomeDetailsMap = useMemo(() => {
    const map: Record<string, Income[]> = {}
    incomes.forEach((income) => {
      const dateKey = format(parseISO(income.created_at), 'yyyy-MM-dd')
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(income)
    })
    return map
  }, [incomes])

  const selectedDay = useMemo(() => {
    return selectedDayStr ? parseISO(selectedDayStr) : null
  }, [selectedDayStr])

  return (
    <>
      <div className=" max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          Ingresos de {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const total = incomeMap[key] || 0
            const incomesOfDay = incomeDetailsMap[key] || []

            const bySource: Record<string, number> = {}
            incomesOfDay.forEach((inc) => {
              if (!bySource[inc.source_id]) bySource[inc.source_id] = 0
              bySource[inc.source_id] += inc.amount
            })

            return (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {total > 0 ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 600, color: '#111827' }}>
                          ${total.toFixed(2)}
                        </h2>
                        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                          {format(day, 'd MMMM', { locale: es })}
                        </span>
                      </div>

                      <ul className="mt-4 space-y-3">
                        {Object.entries(bySource).map(([sourceId, amount], i) => {
                          const source = sources.find(s => s.id === sourceId)

                          return (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                              {/* Logo redondo */}


                              {/* Nombre + monto */}
                              <div className="flex justify-between items-center w-full">
                                <span className="truncate">{source?.name}</span>
                                <span className="font-medium text-gray-900">${amount.toFixed(2)}</span>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm mt-3 italic">Sin Registros</p>
                  )}
                </div>

                <button
                  className="mt-5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all"
                  onClick={() => setSelectedDayStr(key)}
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
          onClose={() => setSelectedDayStr(null)}
          date={selectedDay}
          sources={sources}
          onSave={() => setReloadKey(k => k + 1)}
          existingIncomes={incomeDetailsMap[format(selectedDay, 'yyyy-MM-dd')] || []}
        />
      )}
    </>
  )
}
