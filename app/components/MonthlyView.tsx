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
import IncomeChart from './IncomeChart'
import IncomeCalendar from './IncomeCalendar'
import IncomeBarChart from './IncomeBarChart'

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
<IncomeCalendar year={year} month={month} incomes={incomes} />
        
        {/* Income by Source Section */}
        {incomes.length > 0 && (
  <div className="mb-20">
    <IncomeBySourceList 
      incomesOfDay={incomes || []}
      sources={sources || []}
    />
  </div>
)}
<IncomeChart incomes={incomes} />
<IncomeBarChart incomes={incomes}  sources={sources} />
        {/* Daily Income Grid */}
        <div>
  <div className="text-center mb-20">
    <h2 className="text-3xl font-light text-gray-900 tracking-wide mb-2">
      {format(selectedDate, 'MMMM yyyy', { locale: es })}
    </h2>
    <p className="text-sm font-normal text-gray-400">
      Registro diario de ingresos
    </p>
  </div>
  
  {/* Mobile: Horizontal Slider */}
  <div className="lg:hidden overflow-x-auto -mx-6 px-6 pb-4">
    <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
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
            className={`flex-shrink-0 w-[85vw] bg-white rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
              hasIncome 
                ? 'border-gray-900 shadow-lg' 
                : 'border-gray-200'
            } ${isToday ? 'ring-1 ring-gray-900 ring-offset-2' : ''}`}
            style={{ scrollSnapAlign: 'center' }}
            onClick={() => setSelectedDayStr(key)}
          >
            {/* Day Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex flex-col">
                <span className={`text-5xl font-light ${hasIncome ? 'text-gray-900' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </span>
                <span className="text-sm font-normal text-gray-400 tracking-wide mt-1">
                  {getDayName(day)}
                </span>
              </div>
              
              {isToday && (
                <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              )}
            </div>

            {/* Income Content */}
            <div className="mb-6">
              {hasIncome ? (
                <div className="space-y-4">
                  {/* Total */}
                  <div>
                    <p className="text-sm text-gray-400 font-normal mb-2">
                      Total
                    </p>
                    <p className="text-3xl font-light text-gray-900">
                      ${total.toLocaleString('es-CO')}
                    </p>
                  </div>
                  
                  {/* Sources Breakdown */}
                  {Object.keys(bySource).length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {Object.entries(bySource).map(([sourceId, amount], i) => {
                        const source = sources.find(s => s.id === sourceId)
                        return (
                          <div 
                            key={i} 
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-normal text-gray-400 truncate flex-1">
                              {source?.name.replace(/YouTube\s?|Facebook\s?|TikTok\s?/gi, '')}
                            </span>
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              ${amount.toLocaleString('es-CO')}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 flex items-center justify-center mb-3">
                    <Plus className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-gray-400">Sin datos</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDayStr(key)
              }}
              className={`w-full py-3 px-4 rounded-xl font-normal text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                hasIncome
                  ? 'bg-gray-900 text-white active:bg-gray-800'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              {hasIncome ? (
                <>
                  <Edit3 className="w-4 h-4" strokeWidth={2} />
                  Editar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Agregar
                </>
              )}
            </button>
          </div>
        )
      })}
    </div>
  </div>

  {/* Desktop: Grid */}
  <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4 lg:gap-6">
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
          className={`group relative bg-white rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${
            hasIncome 
              ? 'border-gray-900 hover:shadow-lg' 
              : 'border-gray-200 hover:border-gray-400'
          } ${isToday ? 'ring-1 ring-gray-900 ring-offset-2' : ''}`}
          onClick={() => setSelectedDayStr(key)}
        >
          {/* Day Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <span className={`text-3xl font-light ${hasIncome ? 'text-gray-900' : 'text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              <span className="text-xs font-normal text-gray-400 tracking-wide">
                {getDayName(day)}
              </span>
            </div>
            
            {isToday && (
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
            )}
          </div>

          {/* Income Content */}
          <div className="mb-4">
            {hasIncome ? (
              <div className="space-y-3">
                {/* Total */}
                <div>
                  <p className="text-xs text-gray-400 font-normal mb-1">
                    Total
                  </p>
                  <p className="text-xl font-light text-gray-900">
                    ${total.toLocaleString('es-CO')}
                  </p>
                </div>
                
                {/* Sources Breakdown */}
                {Object.keys(bySource).length > 1 && (
                  <div className="space-y-1 pt-2 border-t border-gray-100">
                    {Object.entries(bySource).slice(0, 2).map(([sourceId, amount], i) => {
                      const source = sources.find(s => s.id === sourceId)
                      return (
                        <div 
                          key={i} 
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs font-normal text-gray-400 truncate flex-1">
                            {source?.name.replace(/YouTube\s?|Facebook\s?|TikTok\s?/gi, '')}
                          </span>
                          <span className="text-xs font-normal text-gray-600 ml-2">
                            ${amount.toLocaleString('es-CO')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-10 h-10 flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-gray-300 group-hover:text-gray-900 transition-colors" strokeWidth={1.5} />
                </div>
              </div>
            )}
          </div>

          {/* Action Button - Only visible on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDayStr(key)
            }}
            className={`w-full py-2 px-3 rounded-lg font-normal text-xs transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 ${
              hasIncome
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {hasIncome ? (
              <>
                <Edit3 className="w-3 h-3" strokeWidth={2} />
                Editar
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" strokeWidth={2} />
                Agregar
              </>
            )}
          </button>
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