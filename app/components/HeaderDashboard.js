import { format } from 'date-fns'
import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export default function Header({ selectedDate, onChange, setModeGlobal }) {
  const [mode, setMode] = useState('month') // 'month' o 'year'

  const handleMode = (e) => {
    setMode(e.target.value)
    setModeGlobal(e.target.value)
  }

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-')
    onChange(new Date(year, month - 1))
  }

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value, 10)
    if (!isNaN(year)) {
      onChange(new Date(year, 0)) 
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
      {/* Controls */}
      <div className="flex items-center gap-3">  
        {/* Mode Selector */}
        <div className="relative">
          <select
            value={mode}
            onChange={handleMode}
            className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-normal rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 cursor-pointer transition-all"
          >
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
        </div>

        {/* Date Input */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
          {mode === 'month' ? (
            <input
              type="month"
              value={format(selectedDate, 'yyyy-MM')}
              onChange={handleMonthChange}
              className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-normal rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 cursor-pointer transition-all"
            />
          ) : (
            <input
              type="number"
              value={format(selectedDate, 'yyyy')}
              onChange={handleYearChange}
              min="2000"
              max="2099"
              className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-normal rounded-xl pl-10 pr-4 py-2.5 w-32 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
            />
          )}
        </div>
      </div>
    </div>
  )
}