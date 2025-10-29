import { useMemo } from 'react'
import { TrendingUp, Award } from 'lucide-react'

interface Income {
  amount: number
  created_at: string
  source_id: string | number
}

interface Source {
  id: string | number
  name: string
  logo?: string
}

interface IncomeBySourceListProps {
  incomesOfDay?: Income[]
  sources?: Source[]
  date?: Date
}

// Helper to format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0'
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace('COP', '').trim()
}

// Clean source names
const cleanSourceName = (name: string): string => {
  return name.replace(/YouTube\s?|Facebook\s?|TikTok\s?/gi, '').trim()
}

export default function IncomeBySourceList({
  incomesOfDay = [
    { amount: 15000, created_at: '2024-01-01', source_id: '1' },
    { amount: 8000, created_at: '2024-01-01', source_id: '2' },
    { amount: 5000, created_at: '2024-01-01', source_id: '3' },
  ],
  sources = [
    { id: '1', name: 'YouTube Principal', logo: '' },
    { id: '2', name: 'TikTok Creator', logo: '' },
    { id: '3', name: 'Facebook Ads', logo: '' },
  ],
  date
}: IncomeBySourceListProps) {

  // Calculate total income per source
  const incomeBySource = useMemo(() => {
    const map: Record<string, number> = {}
    incomesOfDay.forEach((income: Income) => {
      const sourceId = String(income.source_id)
      if (!map[sourceId]) map[sourceId] = 0
      map[sourceId] += income.amount
    })
    return map
  }, [incomesOfDay])

  // Get the total income
  const dailyTotal: number = useMemo(() => {
    return incomesOfDay.reduce((acc: number, curr: Income) => acc + curr.amount, 0)
  }, [incomesOfDay])

  // Find the source object
  const findSourceById = (sourceId: string | number): Source | undefined => {
    return sources.find((source: Source) => String(source.id) === String(sourceId))
  }

  // Get entries as an array, filter, map, and SORT
  const incomeEntries = useMemo(() => {
    const entries = Object.entries(incomeBySource) as [string, number][]

    return entries
      .filter(([sourceId, amount]) => amount > 0)
      .map(([sourceId, amount]) => {
        const source = findSourceById(sourceId)
        return source ? { source, amount } : null
      })
      .filter((item): item is { source: Source, amount: number } => item !== null)
      .sort((a, b) => b.amount - a.amount)
  }, [incomeBySource, sources])

  // Calculate top source percentage
  const topSourcePercentage = incomeEntries.length > 0 && dailyTotal > 0
    ? (incomeEntries[0].amount / dailyTotal) * 100
    : 0

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl">
        
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-light text-gray-900 tracking-wide">
            Fuentes de Ingresos
          </h2>
        </div>

        {incomeEntries.length > 0 ? (
          <>
            {/* Summary */}
            <div className="flex items-center justify-center gap-16 mb-24">
              <div className="text-center">
                <p className="text-sm font-normal text-gray-400 mb-3 tracking-wide">
                  Fuentes Activas
                </p>
                <p className="text-5xl font-light text-gray-900">
                  {incomeEntries.length}
                </p>
              </div>
              
              <div className="w-px h-16 bg-gray-200"></div>
              
              <div className="text-center">
                <p className="text-sm font-normal text-gray-400 mb-3 tracking-wide">
                  Principal
                </p>
                <p className="text-5xl font-light text-gray-900">
                  {topSourcePercentage.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {incomeEntries.map(({ source, amount }, index) => {
                const sourceDisplayName = cleanSourceName(source.name)
                const percentage = dailyTotal > 0 ? (amount / dailyTotal) * 100 : 0
                const isTopSource = index === 0

                return (
                  <div key={source.id} className="text-center">
                    {/* Logo/Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
                      {source.logo && typeof source.logo === 'string' ? (
                        <img
                          src={source.logo}
                          alt={`${source.name} logo`}
                          className="w-12 h-12 object-contain opacity-40"
                        />
                      ) : (
                        <span className="text-3xl font-light text-gray-300">
                          {source.name ? source.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>

                    {/* Source Name with Badge */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <h3 className="text-lg font-normal text-gray-600">
                        {sourceDisplayName || 'Fuente'}
                      </h3>
                      {isTopSource && (
                        <Award className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Amount */}
                    <p className="text-4xl lg:text-5xl font-light text-gray-900 mb-3 tracking-tight">
                      {formatCurrency(amount)}
                    </p>

                    {/* Percentage */}
                    <p className="text-sm font-normal text-gray-400">
                      {percentage.toFixed(1)}%
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mx-auto h-px bg-gray-200 mt-6">
                      <div
                        className="h-full bg-gray-900 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8">
              <TrendingUp className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-normal text-gray-400">
              No hay registros de ingresos para este período
            </p>
          </div>
        )}
        
      </div>
    </div>
  )
}