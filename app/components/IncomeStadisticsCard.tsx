import { useState } from 'react'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target } from 'lucide-react'

// Helper to get days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

// Helper to get the day of the month (1-based)
const getDayOfMonth = (date: Date) => {
  return date.getDate()
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

interface IncomeStatisticsCardProps {
  totalIncome: number
  lastMonthIncome?: number
  periodName?: string
}

export default function IncomeStatisticsCard({ 
  totalIncome, 
  lastMonthIncome = 18000, 
  periodName = 'este mes' 
}: IncomeStatisticsCardProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const daysPassed = getDayOfMonth(now)
  const totalDaysInPeriod = getDaysInMonth(currentYear, currentMonth)

  // Basic Calculations
  const averageDailyIncome = daysPassed > 0 ? totalIncome / daysPassed : 0
  const daysRemaining = totalDaysInPeriod - daysPassed
  const projectedIncome = daysPassed > 0 && daysRemaining >= 0 
    ? totalIncome + (averageDailyIncome * daysRemaining) 
    : null

  // Calculations vs Last Month
  const incomeChangeFromLastMonth = totalIncome - (lastMonthIncome || 0)
  const percentageChange = (lastMonthIncome && lastMonthIncome > 0)
    ? (incomeChangeFromLastMonth / lastMonthIncome) * 100
    : null

  const isPositiveChange = incomeChangeFromLastMonth >= 0

  const stats = [
    {
      icon: DollarSign,
      label: 'Promedio Diario',
      value: formatCurrency(averageDailyIncome),
    },
    {
      icon: Target,
      label: 'Proyección de Cierre',
      value: projectedIncome !== null ? formatCurrency(projectedIncome) : 'N/A',
    },
    {
      icon: Calendar,
      label: 'Días Transcurridos',
      value: `${daysPassed} de ${totalDaysInPeriod}`,
    },
  ]

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl">
        
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-light text-gray-900 tracking-wide">
            Estadísticas
          </h2>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-24">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-6">
                  <Icon className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-normal text-gray-400 mb-3 tracking-wide">
                  {stat.label}
                </p>
                <p className="text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Comparison Section */}
        {percentageChange !== null && lastMonthIncome !== undefined && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-normal text-gray-400 mb-2 tracking-wide">
                vs. Mes Anterior
              </p>
              <p className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
                {formatCurrency(lastMonthIncome)}
              </p>
              
              <div className="inline-flex items-center gap-3">
                {isPositiveChange ? (
                  <TrendingUp className="w-6 h-6 text-green-500" strokeWidth={1.5} />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                )}
                <span className={`text-2xl font-light ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositiveChange ? '+' : ''}{percentageChange.toFixed(1)}%
                </span>
              </div>
              
              <p className="text-sm font-normal text-gray-400 mt-4">
                {isPositiveChange ? '+' : ''}{formatCurrency(incomeChangeFromLastMonth)}
              </p>
            </div>

            {/* Visual indicator line */}
            <div className="relative w-full h-px bg-gray-200 my-12">
              <div 
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                  isPositiveChange ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(percentageChange), 100)}%` }}
              />
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}