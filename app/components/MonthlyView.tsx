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
import IncomeBySourceList from './IncomeBySourceList'
import { Plus, Edit3, Sparkles } from 'lucide-react'

const IncomeEditor = dynamic(() => import('./IncomeEditor'), { ssr: false })

interface MonthlyViewProps {
  selectedDate: Date
  year: number
  month?: number
  setIncomeMonth: (income: number) => void
}

export default function MonthlyView({
  selectedDate,
  year,
  month,
  setIncomeMonth
}: MonthlyViewProps) {
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

  // Get day name abbreviation
  const getDayName = (day: Date) => {
    return format(day, 'EEE', { locale: es }).slice(0, 2).toUpperCase()
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        
        {/* Income by Source Section */}
        {incomes.length > 0 && (
          <div className="mb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 shadow-sm border border-indigo-100/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Ingresos por Fuente
              </h2>
            </div>
            <IncomeBySourceList 
              incomesOfDay={incomes || []}
              sources={sources || []}
            />
          </div>
        )}

        {/* Daily Income Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>Registro Diario</span>
            <span className="text-sm font-normal text-gray-500">
              {format(selectedDate, 'MMMM yyyy', { locale: es })}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const total = incomeMap[key] || 0
              const incomesOfDay = incomeDetailsMap[key] || []
              const hasIncome = total > 0
              const isToday = format(new Date(), 'yyyy-MM-dd') === key

              const bySource: Record<string, number> = {}
              incomesOfDay.forEach((inc) => {
                if (!bySource[inc.source_id]) bySource[inc.source_id] = 0
                bySource[inc.source_id] += inc.amount
              })

              return (
                <div
                  key={key}
                  className={`group relative bg-white rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
                    hasIncome 
                      ? 'border-2 border-blue-200 shadow-md hover:shadow-xl hover:-translate-y-1' 
                      : 'border border-gray-200 hover:border-blue-200 hover:shadow-md'
                  } ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                  onClick={() => setSelectedDayStr(key)}
                >
                  {/* Day Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col">
                      <span className={`text-3xl font-bold ${hasIncome ? 'text-blue-600' : 'text-gray-300'} ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {getDayName(day)}
                      </span>
                    </div>
                    
                    {hasIncome ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-700">Activo</span>
                      </div>
                    ) : isToday ? (
                      <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full">
                        <span className="text-xs font-bold text-blue-700">Hoy</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Income Content */}
                  <div className="mb-4">
                    {hasIncome ? (
                      <div className="space-y-3">
                        {/* Total */}
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                          <p className="text-xs text-gray-600 font-medium mb-1">Total del día</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${total.toLocaleString('es-CO')}
                          </p>
                        </div>
                        
                        {/* Sources Breakdown */}
                        <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                          {Object.entries(bySource).map(([sourceId, amount], i) => {
                            const source = sources.find(s => s.id === sourceId)
                            return (
                              <div 
                                key={i} 
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-xs font-medium text-gray-700 truncate flex-1">
                                  {source?.name.replace(/YouTube\s?|Facebook\s?|TikTok\s?/gi, '')}
                                </span>
                                <span className="text-xs font-bold text-gray-900 ml-2 whitespace-nowrap">
                                  ${amount.toLocaleString('es-CO')}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-50 transition-colors">
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Sin datos</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDayStr(key)
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      hasIncome
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                        : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700'
                    }`}
                  >
                    {hasIncome ? (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Agregar
                      </>
                    )}
                  </button>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 pointer-events-none transition-all duration-300"></div>
                </div>
              )
            })}
          </div>
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