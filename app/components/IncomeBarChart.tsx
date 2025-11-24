import { useMemo } from 'react'

interface Income {
  amount: number
  source_id: string | number
}

interface Source {
  id: string | number
  name: string
  logo?: string
}

interface IncomeBarChartProps {
  incomes?: Income[]
  sources?: Source[]
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  const safeAmount = isNaN(amount) ? 0 : amount
  return `$${Math.round(safeAmount).toLocaleString('es-CO')}`
}

// Clean source names
const cleanSourceName = (name: string): string => {
  return name.replace(/YouTube\s?|Facebook\s?|TikTok\s?/gi, '').trim()
}

export default function IncomeBarChart({
  incomes = [],
  sources = []
}: IncomeBarChartProps) {

  const sortedData = useMemo(() => {
    const map: Record<string, number> = {}

    incomes.forEach((income) => {
      const sourceId = String(income.source_id)
      if (!map[sourceId]) map[sourceId] = 0
      map[sourceId] += income.amount
    })

    const entries = Object.entries(map)
      .map(([sourceId, amount]) => {
        const source = sources.find(s => String(s.id) === sourceId)
        return source ? { source, amount } : null
      })
      .filter((item): item is { source: Source, amount: number } => item !== null)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5

    return entries
  }, [incomes, sources])

  const maxAmount = sortedData.length > 0 ? sortedData[0].amount : 1

  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
        <p className="text-gray-400 text-sm">No hay datos disponibles</p>
      </div>
    )
  }

  const BAR_CONTAINER_HEIGHT = '180px' 
  const MIN_BAR_HEIGHT = 25 

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
      <h3 className="text-sm font-medium text-gray-500 mb-6 sm:mb-8">Top Fuentes</h3>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-end justify-between gap-2 sm:gap-3 lg:gap-4 min-w-[350px] sm:min-w-0" style={{ height: '240px' }}>
          
          {sortedData.map((item, index) => {
            const rawHeightPercentage = (item.amount / maxAmount) * 100
            const adjustedHeight = Math.max(rawHeightPercentage, MIN_BAR_HEIGHT)
            
            const sourceDisplayName = cleanSourceName(item.source.name)

            return (
              <div 
                key={item.source.id}
                className="flex-1 min-w-[70px] sm:min-w-0 flex flex-col items-center gap-2 sm:gap-3"
              >
                <div className="w-full flex flex-col items-center" style={{ height: BAR_CONTAINER_HEIGHT }}>
                  <div className="w-full flex-1 flex flex-col justify-end">
                    
                    <div
                      className="w-full rounded-xl sm:rounded-2xl bg-gray-100 hover:bg-gray-200 relative transition-all duration-300 flex flex-col items-center justify-end py-2 px-1 shadow-sm"
                      style={{ 
                        height: `${adjustedHeight}%`,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {/* ✅ Valor del Ingreso (Monto) */}
                      <span className="text-xs font-semibold text-gray-600 text-center leading-none">
                        {formatCurrency(item.amount)}
                      </span>
                      
                      {/* ❌ ELIMINADO: Se quitó el div contenedor blanco (bg-white) y sus dimensiones/sombras. 
                          Ahora solo queda la imagen o el texto de iniciales, manteniendo el margin-bottom. */}
                      {item.source.logo && typeof item.source.logo === 'string' ? (
                        <img
                          src={item.source.logo}
                          alt={item.source.name}
                          // Ajustamos el tamaño directamente a la imagen, sin un div contenedor blanco
                          className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0 mb-1"
                        />
                      ) : (
                        // Para las iniciales, usamos un span con el mismo tamaño
                        <span className="w-5 h-5 sm:w-6 sm:h-6 text-xs font-bold text-gray-400 flex items-center justify-center flex-shrink-0 mb-1">
                          {sourceDisplayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}