import { TrendingUp, Target, DollarSign, CheckCircle2 } from 'lucide-react'

interface IncomeOverviewProps {
  totalIncome: number
  goal?: number
  modeGlobal?: 'month' | 'year'
}

export default function IncomeOverview({ 
  totalIncome, 
  goal = 25000, 
  modeGlobal = 'month' 
}: IncomeOverviewProps) {
  const percentage = Math.min((totalIncome / goal) * 100, 100)
  const remaining = Math.max(goal - totalIncome, 0)
  
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const currentMonth = months[new Date().getMonth()]
  
  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl flex flex-col justify-center" style={{ minHeight: '80vh' }}>
        
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

        {/* Status Message */}
        {/* <div className="text-center">
          {percentage >= 100 ? (
            <p className="text-lg font-normal text-green-500">
              🎉 ¡Excelente trabajo! Has superado tu meta
            </p>
          ) : percentage > 0 ? (
            <p className="text-lg font-normal text-gray-400">
              {percentage >= 75 
                ? '¡Casi lo logras! Un último esfuerzo 💪' 
                : percentage >= 50 
                ? '¡Vas por buen camino! Sigue así 🚀'
                : '¡Cada paso cuenta! Continúa avanzando ✨'}
            </p>
          ) : null}
        </div> */}
        
      </div>
    </div>
  )
}