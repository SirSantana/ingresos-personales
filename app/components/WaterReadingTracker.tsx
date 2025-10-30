'use client'

import { useState, useEffect, useMemo } from 'react'
import { Droplet, BookOpen, Plus, Minus, TrendingUp, Calendar } from 'lucide-react'

interface DailyData {
  water: number
  pages: number
  date: string
}

const WATER_GOAL = 8
const PAGES_GOAL = 30

export default function WaterReadingTracker() {
  const [activeTab, setActiveTab] = useState<'water' | 'reading'>('water')
  const [showCalendar, setShowCalendar] = useState(false)
  const [todayData, setTodayData] = useState<DailyData>({
    water: 0,
    pages: 0,
    date: new Date().toISOString().split('T')[0]
  })
  const [weekData, setWeekData] = useState<DailyData[]>([])
  const [allData, setAllData] = useState<DailyData[]>([])
  const [isClient, setIsClient] = useState(false)

  // ✅ Garantiza que window y localStorage existan antes de usarlos
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ✅ Simulación de window.storage, compatible con Next.js
  const storage = useMemo(() => {
    if (typeof window === 'undefined') return null

    return {
      async get(key: string) {
        const value = localStorage.getItem(key)
        return value ? { value } : null
      },
      async set(key: string, value: string) {
        localStorage.setItem(key, value)
      },
      async list(prefix: string) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
        return { keys }
      }
    }
  }, [isClient])

  // Cargar datos solo cuando haya window
  useEffect(() => {
    if (!storage) return
    loadTodayData()
    loadWeekData()
    loadAllData()
  }, [storage])

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const result = await storage?.get(`tracker:${today}`)
      if (result && result.value) {
        setTodayData(JSON.parse(result.value))
      } else {
        setTodayData({ water: 0, pages: 0, date: today })
      }
    } catch {
      console.log('Starting fresh tracker')
    }
  }

  const loadWeekData = async () => {
    try {
      const result = await storage?.list('tracker:')
      if (result && result.keys) {
        const data: DailyData[] = []
        for (const key of result.keys) {
          const item = await storage?.get(key)
          if (item && item.value) data.push(JSON.parse(item.value))
        }
        setWeekData(data.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7))
      }
    } catch {
      console.log('No previous data')
    }
  }

  const loadAllData = async () => {
    try {
      const result = await storage?.list('tracker:')
      if (result && result.keys) {
        const data: DailyData[] = []
        for (const key of result.keys) {
          const item = await storage?.get(key)
          if (item && item.value) data.push(JSON.parse(item.value))
        }
        setAllData(data.sort((a, b) => b.date.localeCompare(a.date)))
      }
    } catch {
      console.log('No previous data')
    }
  }

  const saveData = async (newData: DailyData) => {
    if (!storage) return
    try {
      await storage.set(`tracker:${newData.date}`, JSON.stringify(newData))
      setTodayData(newData)
      loadWeekData()
      loadAllData()
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleWaterChange = (delta: number) => {
    const newWater = Math.max(0, todayData.water + delta)
    saveData({ ...todayData, water: newWater })
  }

  const handlePagesChange = (delta: number) => {
    const newPages = Math.max(0, todayData.pages + delta)
    saveData({ ...todayData, pages: newPages })
  }

  const waterProgress = Math.min((todayData.water / WATER_GOAL) * 100, 100)
  const pagesProgress = Math.min((todayData.pages / PAGES_GOAL) * 100, 100)

  const weekAvgWater = weekData.length
    ? Math.round(weekData.reduce((sum, d) => sum + d.water, 0) / weekData.length)
    : 0
  const weekAvgPages = weekData.length
    ? Math.round(weekData.reduce((sum, d) => sum + d.pages, 0) / weekData.length)
    : 0

  const calendarData = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()

    const dataMap: Record<string, DailyData> = {}
    allData.forEach(d => {
      dataMap[d.date] = d
    })

    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({ day, date: dateStr, data: dataMap[dateStr] || null })
    }
    return days
  }, [allData])

  const monthName = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  if (!isClient) return null // ⛔ evita errores durante render SSR

  return (
    <div className="min-h-screen w-full px-6 py-12">
      <div className="max-w-3xl mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-6">
            Hábitos Diarios
          </h1>

          {/* Tabs */}
          <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('water')}
              className={`px-6 py-2.5 rounded-xl text-sm font-normal transition-all ${
                activeTab === 'water'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4" strokeWidth={1.5} />
                Hidratación
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reading')}
              className={`px-6 py-2.5 rounded-xl text-sm font-normal transition-all ${
                activeTab === 'reading'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                Lectura
              </div>
            </button>
          </div>
        </div>

        {!showCalendar ? (
          <>
            {/* Main Counter */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-8">
                {activeTab === 'water' ? (
                  <Droplet className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
                )}
              </div>

              <p className="text-sm font-normal text-gray-400 mb-4 tracking-wide">
                {activeTab === 'water' ? 'Vasos de agua hoy' : 'Páginas leídas hoy'}
              </p>

              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={() => activeTab === 'water' ? handleWaterChange(-1) : handlePagesChange(-10)}
                  className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <Minus className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </button>

                <span className="text-7xl font-light text-gray-900 tracking-tight min-w-[200px] text-center">
                  {activeTab === 'water' ? todayData.water : todayData.pages}
                </span>

                <button
                  onClick={() => activeTab === 'water' ? handleWaterChange(1) : handlePagesChange(10)}
                  className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <Plus className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 transition-all duration-500"
                    style={{ 
                      width: `${activeTab === 'water' ? waterProgress : pagesProgress}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                  <span className="text-xs font-normal text-gray-400">
                    0
                  </span>
                  <span className="text-xs font-normal text-gray-900">
                    {activeTab === 'water' ? waterProgress.toFixed(0) : pagesProgress.toFixed(0)}%
                  </span>
                  <span className="text-xs font-normal text-gray-400">
                    {activeTab === 'water' ? WATER_GOAL : PAGES_GOAL}
                  </span>
                </div>
              </div>

              {/* Goal Status */}
              {((activeTab === 'water' && todayData.water >= WATER_GOAL) ||
                (activeTab === 'reading' && todayData.pages >= PAGES_GOAL)) && (
                <p className="text-sm font-normal text-gray-900 mt-4">
                  ✓ Meta completada
                </p>
              )}
            </div>

            {/* Quick Add Buttons for Pages */}
            {activeTab === 'reading' && (
              <div className="flex items-center justify-center gap-3 mb-16">
                <button
                  onClick={() => handlePagesChange(1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-normal transition-all"
                >
                  +1
                </button>
                <button
                  onClick={() => handlePagesChange(5)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-normal transition-all"
                >
                  +5
                </button>
                <button
                  onClick={() => handlePagesChange(10)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-normal transition-all"
                >
                  +10
                </button>
                <button
                  onClick={() => handlePagesChange(20)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-normal transition-all"
                >
                  +20
                </button>
              </div>
            )}

            {/* Calendar Toggle Button */}
            {activeTab === 'reading' && (
              <div className="text-center mb-16">
                <button
                  onClick={() => setShowCalendar(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-normal hover:bg-gray-800 transition-all"
                >
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  Ver Calendario
                </button>
              </div>
            )}

            {/* Weekly Average */}
            {weekData.length > 0 && (
              <div className="text-center pt-16 border-t border-gray-200">
                <div className="inline-flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  <p className="text-sm font-normal text-gray-400 tracking-wide">
                    Promedio últimos 7 días
                  </p>
                </div>
                <p className="text-4xl font-light text-gray-900">
                  {activeTab === 'water' ? weekAvgWater : weekAvgPages}
                </p>
              </div>
            )}

            {/* Week History */}
            {weekData.length > 0 && (
              <div className="mt-12">
                <div className="grid grid-cols-7 gap-2">
                  {weekData.slice(0, 7).reverse().map((day, index) => {
                    const value = activeTab === 'water' ? day.water : day.pages
                    const goal = activeTab === 'water' ? WATER_GOAL : PAGES_GOAL
                    const height = Math.min((value / goal) * 100, 100)
                    const date = new Date(day.date)
                    const dayName = date.toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 2).toUpperCase()
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-end overflow-hidden">
                          <div 
                            className="w-full bg-gray-900 transition-all duration-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs font-normal text-gray-400">
                          {dayName}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Calendar View */
          <div>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-light text-gray-900">
                {monthName}
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 text-sm font-normal text-gray-600 hover:text-gray-900 transition-all"
              >
                Volver
              </button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {/* Day headers */}
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-normal text-gray-400 mb-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for offset */}
              {Array.from({ length: new Date(calendarData[0]?.date).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Calendar days */}
              {calendarData.map((dayData) => {
                const pages = dayData.data?.pages || 0
                const hasData = pages > 0
                
                return (
                  <div
                    key={dayData.date}
                    className="aspect-square rounded-xl border border-gray-200 transition-all"
                  >
                    <div className="w-full h-full p-2 flex flex-col items-center justify-center gap-0.5">
                      <span className={`text-sm font-light ${
                        hasData ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {dayData.day}
                      </span>
                      
                      {hasData && (
                        <div className="flex items-center gap-0.5">
                          <span className="text-base">📖</span>
                          <span className="text-xs font-medium text-gray-900">
                            {pages}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-12 text-center">
              <p className="text-xs font-normal text-gray-400">
                📖 = Páginas leídas
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}