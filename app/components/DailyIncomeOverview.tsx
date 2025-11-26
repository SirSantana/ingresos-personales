import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface Income {
  amount: number
  created_at: string
  source_id: string | number
}

interface DailyIncomeViewerProps {
  incomes?: Income[]
  initialDate?: Date
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return `$${Math.round(amount).toLocaleString('es-CO')}`
}

// Helper to format date
const formatDate = (date: Date): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`
}

// Helper to get short date
const formatShortDate = (date: Date): string => {
  return `${date.getDate()}/${date.getMonth() + 1}`
}

// Helper to get date key
const getDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to add days to date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function DailyIncomeViewer({
  incomes = [],
  initialDate = new Date()
}: DailyIncomeViewerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate)

  // Calculate income by date
  const incomeByDate = useMemo(() => {
    const map: Record<string, number> = {}
    
    incomes.forEach((income) => {
      const date = new Date(income.created_at)
      const dateKey = getDateKey(date)
      if (!map[dateKey]) map[dateKey] = 0
      map[dateKey] += income.amount
    })
    
    return map
  }, [incomes])

  // Get income for 7 days (3 before, current, 3 after)
  const daysRange = useMemo(() => {
    const days = []
    for (let i = -3; i <= 3; i++) {
      const date = addDays(selectedDate, i)
      const dateKey = getDateKey(date)
      days.push({
        date,
        dateKey,
        income: incomeByDate[dateKey] || 0,
        isCurrent: i === 0
      })
    }
    return days
  }, [selectedDate, incomeByDate])

  const currentDay = daysRange.find(d => d.isCurrent)!
  const previousDay = daysRange.find((d, idx) => idx === 2)!

  const currentIncome = currentDay.income
  const previousIncome = previousDay.income

  // Calculate change from previous day
  const changeAmount = currentIncome - previousIncome
  const changePercentage = previousIncome > 0 
    ? ((changeAmount / previousIncome) * 100) 
    : currentIncome > 0 ? 100 : 0

  const isPositiveChange = changeAmount >= 0
  const hasCurrentIncome = currentIncome > 0

  // Navigation handlers
  const goToPreviousDay = () => {
    setSelectedDate(addDays(selectedDate, -1))
  }

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = getDateKey(new Date()) === getDateKey(selectedDate)

  // Calculate max for chart scaling
  const maxIncome = Math.max(...daysRange.map(d => d.income), 1)

  return (
    <div className="min-h-screen w-full flex items-center justify-between px-4 sm:px-6 py-8 sm:py-12">
      <div  className="w-full max-w-5xl flex flex-col justify-between min-h-screen py-8">
        
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <button
            onClick={goToPreviousDay}
            className="group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-900 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-900 transition-colors" strokeWidth={1.5} />
          </button>

          <div className="flex-1 text-center px-4">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-sm sm:text-lg font-light text-gray-400 tracking-wide">
                {formatDate(selectedDate)}
              </h3>
            </div>
            
          </div>

          <button
            onClick={goToNextDay}
            className="group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-900 transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-900 transition-colors" strokeWidth={1.5} />
          </button>
        </div>

        {/* Current Day Income */}
        <div className="text-center mb-12 sm:mb-20">
          <p className="text-base sm:text-xl font-light text-gray-400 tracking-wide mb-4 sm:mb-6">
            Ingreso del día
          </p>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 tracking-tight mb-6 sm:mb-8">
            {formatCurrency(currentIncome)}
          </h2>

          {/* Change Indicator */}
          {previousIncome > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <div className="inline-flex items-center gap-2 sm:gap-3">
                {isPositiveChange ? (
                  <TrendingUp className={`w-5 h-5 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`} strokeWidth={1.5} />
                ) : (
                  <TrendingDown className="text-red-500 w-5 h-5" strokeWidth={1.5} />
                )}
                <span className={`text-base sm:text-lg font-light ${
                  isPositiveChange ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositiveChange ? '+' : ''}{changePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-gray-400">
                <span className="text-sm sm:text-base font-light">
                  ({isPositiveChange ? '+' : ''}{formatCurrency(changeAmount)})
                </span>
                <span className="text-sm sm:text-base font-light">
                  vs. día anterior
                </span>
              </div>
            </div>
          )}

          {!hasCurrentIncome && (
            <p className="text-sm sm:text-lg font-light text-gray-400 mt-4">
              Sin ingresos registrados
            </p>
          )}
        </div>

        {/* Visual Timeline - 7 days */}
        <div className="w-full">
          <div className="flex items-end justify-between gap-1 sm:gap-2 lg:gap-4 h-48 sm:h-56 lg:h-64">
            
            {daysRange.map((day, index) => {
              const heightPercentage = day.income > 0 
                ? Math.min((day.income / maxIncome) * 100, 100)
                : 5

              return (
                <div 
                  key={day.dateKey}
                  className="flex-1 flex flex-col items-center gap-2 sm:gap-3"
                >
                  {/* Bar */}
                  <div className="w-full flex flex-col justify-end h-40 sm:h-48 lg:h-56">
                    <div
                      className={`w-full rounded-t transition-all duration-700 ${
                        day.isCurrent 
                          ? 'bg-gray-900' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      style={{ height: `${heightPercentage}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <div className="text-center">
                    <span className={`block text-xs sm:text-sm font-light tracking-wide ${
                      day.isCurrent 
                        ? 'font-medium text-gray-900' 
                        : 'text-gray-400'
                    }`}>
                      {formatShortDate(day.date)}
                    </span>
                    {day.income > 0 && (
                      <span className="block text-[10px] sm:text-xs font-light text-gray-400 mt-1">
                        {formatCurrency(day.income)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

          </div>
        </div>

      </div>
    </div>
  )
}