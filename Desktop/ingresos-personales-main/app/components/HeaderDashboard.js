import { format } from 'date-fns'
import { useState } from 'react'

export default function Header({ selectedDate, onChange, setModeGlobal }) {
  const [mode, setMode] = useState('month') // 'month' o 'year'

  const handleMode = (e) => {
    setMode(e.target.value)
    setModeGlobal(e.target.value) // Actualiza el estado global
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
    <div className="flex flex-wrap justify-between items-center gap-4">
      <h1 className="text-3xl font-semibold">Tu Puedes Lito⚽</h1>

      {/* Selector de modo */}
     <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'8px'}}>  
      <select
        value={mode}
        onChange={handleMode}
        className="border px-3 py-2 rounded-lg "
      >
        <option value="month">Filtrar por mes</option>
        <option value="year">Filtrar por año</option>
      </select>

      {/* Input dinámico */}
      {mode === 'month' ? (
        <input
          type="month"
          value={format(selectedDate, 'yyyy-MM')}
          onChange={handleMonthChange}
          className="border px-3 py-2 rounded-lg"
        />
      ) : (
        <input
          type="number"
          value={format(selectedDate, 'yyyy')}
          onChange={handleYearChange}
          min="2000"
          max="2099"
          className="border px-3 py-2 rounded-lg w-[100px]"
        />
      )}</div>
    </div>
  )
}
