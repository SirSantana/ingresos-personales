import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp, Target, DollarSign } from 'lucide-react'

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
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
              Ingresos {modeGlobal === 'month' 
                ? format(new Date(), 'MMMM yyyy', { locale: es }) 
                : 'del año'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          {/* Income Amount */}
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-2">
              ${totalIncome.toLocaleString('es-CO')}
            </h2>
            <div className="flex items-center gap-2 text-blue-100">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {percentage.toFixed(1)}% de la meta alcanzado
              </span>
            </div>
          </div>

          {/* Goal Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-200" />
              <div>
                <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">
                  Meta
                </p>
                <p className="text-2xl font-bold text-white">
                  ${goal.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100 font-medium">Progreso</span>
            <span className="text-white font-semibold">
              ${remaining.toLocaleString('es-CO')} restantes
            </span>
          </div>
          
          <div className="relative w-full h-4 bg-white/10 backdrop-blur rounded-full overflow-hidden">
            {/* Progress fill with gradient */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${percentage}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            
            {/* Percentage marker */}
            {percentage > 10 && (
              <div 
                className="absolute inset-y-0 flex items-center transition-all duration-700"
                style={{ left: `${Math.min(percentage - 5, 95)}%` }}
              >
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {percentage >= 100 && (
          <div className="mt-6 p-4 bg-emerald-500/20 backdrop-blur rounded-xl border border-emerald-400/30">
            <p className="text-emerald-100 text-sm font-medium text-center">
              🎉 ¡Felicitaciones! Has alcanzado tu meta
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}