import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'

interface Income {
  amount: number
  created_at: string
  source_id: string | number
}

interface IncomeCalendarProps {
  year?: number
  month?: number
  incomes?: Income[]
}

export default function IncomeCalendar({
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  incomes = []
}: IncomeCalendarProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [currentMonth, setCurrentMonth] = useState(month)

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Group incomes by date
    const incomeMap: Record<string, number> = {}
    incomes.forEach(income => {
      const date = income.created_at.includes('T') 
        ? income.created_at.split('T')[0] 
        : income.created_at
      if (!incomeMap[date]) incomeMap[date] = 0
      incomeMap[date] += income.amount
    })
    
    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        date: dateStr,
        income: incomeMap[dateStr] || 0
      })
    }
    
    return days
  }, [currentYear, currentMonth, incomes])

  const totalMonth = useMemo(() => {
    return calendarData.reduce((sum, day) => sum + day.income, 0)
  }, [calendarData])

  const avgDay = useMemo(() => {
    const daysWithIncome = calendarData.filter(d => d.income > 0).length
    return daysWithIncome > 0 ? Math.round(totalMonth / daysWithIncome) : 0
  }, [calendarData, totalMonth])

  const bestDay = useMemo(() => {
    return calendarData.reduce((best, day) => 
      day.income > best.income ? day : best
    , { day: 0, income: 0 })
  }, [calendarData])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-CO')}`
  }

  return (
    <div className="min-h-screen w-full px-6 py-12">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-6">
            Calendario de Ingresos
          </h1>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <div className="text-center">
            <p className="text-sm font-normal text-gray-400 mb-3 tracking-wide">
              Mejor Día
            </p>
            <p className="text-2xl sm:text-3xl font-light text-gray-900">
              {formatCurrency(bestDay.income)}
            </p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </button>
          
          <h2 className="text-2xl font-light text-gray-900">
            {months[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-12">
          {/* Day headers */}
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-normal text-gray-400 mb-1 sm:mb-2">
              {day}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Calendar days */}
          {calendarData.map((dayData) => {
            const hasIncome = dayData.income > 0
            const isToday = dayData.date === new Date().toISOString().split('T')[0]
            
            return (
              <div
                key={dayData.date}
                className={`aspect-square rounded-lg sm:rounded-xl border transition-all ${
                  isToday ? 'ring-1 ring-gray-900 ring-offset-1 sm:ring-offset-2' : ''
                } ${hasIncome ? 'border-gray-900' : 'border-gray-200'}`}
              >
                <div className="w-full h-full p-1 sm:p-2 flex flex-col items-center justify-center gap-0.5">
                  
                  {hasIncome && (
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                        ${Math.round(dayData.income)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="text-center px-4">
          <p className="text-xs font-normal text-gray-400 mb-2 sm:mb-4">
            💰 = Ingresos del día (en miles)
          </p>
          <p className="text-xs font-normal text-gray-500">
            Los días con borde negro indican ingresos registrados
          </p>
        </div>
        
      </div>
    </div>
  )
}