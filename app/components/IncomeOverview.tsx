import { useState, useEffect } from 'react'
import { TrendingUp, Target, DollarSign, CheckCircle2, BarChart3, Calendar, Sparkles, Clock, BookOpen, Crosshair } from 'lucide-react'

interface IncomeOverviewProps {
  totalIncome: number
  goal?: number
  modeGlobal?: 'month' | 'year'
  onNavigate?: (page: string) => void
}

export default function IncomeOverview({ 
  totalIncome = 28000, 
  goal = 25000, 
  modeGlobal = 'month',
  onNavigate
}: IncomeOverviewProps) {
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  const percentage = Math.min((totalIncome / goal) * 100, 100)
  const remaining = Math.max(goal - totalIncome, 0)
  
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const currentMonth = months[new Date().getMonth()]
  
  const navigationItems = [
    { id: 'stats', icon: TrendingUp, label: 'Estadísticas', page: 'statistics' },
    { id: 'charts', icon: BarChart3, label: 'Gráficas', page: 'charts' },
    { id: 'calendar', icon: Calendar, label: 'Calendario', page: 'calendar' },
    { id: 'affirmations', icon: Sparkles, label: 'Afirmaciones', page: 'affirmations' },
    { id: 'pomodoro', icon: Clock, label: 'Pomodoro', page: 'pomodoro' },
    { id: 'habits', icon: BookOpen, label: 'Hábitos', page: 'habits' },
    { id: 'goals', icon: Crosshair, label: 'Metas', page: 'goals' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > 100) {
        setShowMobileNav(true)
      } else {
        setShowMobileNav(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page)
    } else {
      console.log('Navigate to:', page)
    }
  }
  
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-6 py-12 relative">
      {/* Floating Navigation Icons - Desktop */}
      <div className="fixed top-8 right-8 z-50 hidden lg:flex flex-col gap-3">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.page)}
              className="group relative w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:border-gray-900 hover:shadow-lg transition-all duration-300"
              title={item.label}
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" strokeWidth={1.5} />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-normal rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Mobile Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 transition-transform duration-300 ${
        showMobileNav ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.page)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <span className="text-[10px] font-normal text-gray-600">{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {navigationItems.slice(4).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.page)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <span className="text-[10px] font-normal text-gray-600">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl flex flex-col justify-center lg:pb-0" style={{ minHeight: '80vh' }}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
            <DollarSign className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-normal text-gray-400 tracking-wide">
            Ingresos de {modeGlobal === 'month' ? currentMonth : 'este año'}
          </h3>
        </div>

        {/* Main Amount */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-light text-gray-900 tracking-tight">
              ${totalIncome.toLocaleString('es-CO')}
            </h2>
            {percentage >= 100 && (
              <CheckCircle2 className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" strokeWidth={2} />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <Target className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-lg font-light">
              Meta: ${goal.toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto w-full mb-16">
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                percentage >= 100 
                  ? 'bg-green-500' 
                  : 'bg-gray-900'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center px-1">
            <span className={`text-sm font-medium ${
              percentage >= 100 ? 'text-green-500' : 'text-gray-900'
            }`}>
              {percentage.toFixed(1)}%
            </span>
            <span className="text-sm font-normal text-gray-400">
              {percentage >= 100 
                ? 'Completado' 
                : `${remaining.toLocaleString('es-CO')} restante`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}