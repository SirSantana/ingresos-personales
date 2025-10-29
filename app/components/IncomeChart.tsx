import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Income {
  amount: number
  created_at: string
  source_id: string | number
}

interface IncomeChartProps {
  incomes?: Income[]
  selectedDate?: Date
}

export default function IncomeChart({ 
  incomes = [],
  selectedDate = new Date()
}: IncomeChartProps) {
  
  // Process data for chart
  const chartData = useMemo(() => {
    if (!incomes.length) return []
    
    // Group by date
    const dateMap: Record<string, number> = {}
    incomes.forEach(income => {
      const date = income.created_at.includes('T') 
        ? income.created_at.split('T')[0] 
        : income.created_at
      if (!dateMap[date]) dateMap[date] = 0
      dateMap[date] += income.amount
    })
    
    // Convert to array and sort
    return Object.entries(dateMap)
      .map(([date, amount]) => {
        const [year, month, day] = date.split('-')
        return {
          date,
          amount,
          displayDate: parseInt(day, 10)
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [incomes])

  const maxValue = useMemo(() => {
    if (!chartData.length) return 0
    return Math.max(...chartData.map(d => d.amount))
  }, [chartData])

  const avgValue = useMemo(() => {
    if (!chartData.length) return 0
    const sum = chartData.reduce((acc, d) => acc + d.amount, 0)
    return Math.round(sum / chartData.length)
  }, [chartData])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-lg">
          <p className="text-xs text-gray-400 font-normal mb-1">
            Día {payload[0].payload.displayDate}
          </p>
          <p className="text-lg font-light text-gray-900">
            ${payload[0].value.toLocaleString('es-CO')}
          </p>
        </div>
      )
    }
    return null
  }

  if (!chartData.length) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <p className="text-lg font-normal text-gray-400">
            No hay datos para mostrar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl">
        
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-light text-gray-900 tracking-wide mb-2">
            Tendencia de Ingresos
          </h2>
          <p className="text-sm font-normal text-gray-400">
            Evolución diaria del período
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-16 mb-16">
          <div className="text-center">
            <p className="text-sm font-normal text-gray-400 mb-3 tracking-wide">
              Máximo
            </p>
            <p className="text-4xl font-light text-gray-900">
              ${maxValue.toLocaleString('es-CO')}
            </p>
          </div>
          
          <div className="w-px h-16 bg-gray-200"></div>
          
          <div className="text-center">
            <p className="text-sm font-normal text-gray-400 mb-3 tracking-wide">
              Promedio
            </p>
            <p className="text-4xl font-light text-gray-900">
              ${avgValue.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96 mb-8 w-[100vw] relative left-1/2 right-1/2 -translate-x-1/2 sm:w-full sm:left-0 sm:right-0 sm:translate-x-0">
  <ResponsiveContainer width="100%" height="100%">
            <LineChart 
  data={chartData}
  margin={{ top: 20, right: 20, left: -40, bottom: 20 }}
>
              <CartesianGrid 
                strokeDasharray="0" 
                stroke="#E5E7EB" 
                vertical={false}
                strokeWidth={1}
              />
              <XAxis 
                dataKey="displayDate" 
                stroke="#9CA3AF"
                strokeWidth={1}
                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 400 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                strokeWidth={1}
                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 400 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                width={80}
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D1D5DB', strokeWidth: 1 }} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#111827" 
                strokeWidth={2}
                dot={{ 
                  fill: '#111827', 
                  strokeWidth: 0, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#111827',
                  strokeWidth: 0
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-px bg-gray-900"></div>
          <p className="text-xs font-normal text-gray-400">
            Ingresos diarios
          </p>
        </div>
        
      </div>
    </div>
  )
}