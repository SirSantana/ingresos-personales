'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, TrendingUp, TrendingDown, Calendar, DollarSign, Target } from 'lucide-react'

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
  lastMonthIncome, 
  periodName = 'este mes' 
}: IncomeStatisticsCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

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
      label: `Promedio Diario (${periodName})`,
      value: formatCurrency(averageDailyIncome),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Calendar,
      label: 'Días Transcurridos',
      value: `${daysPassed} de ${totalDaysInPeriod}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Target,
      label: 'Días Restantes',
      value: daysRemaining >= 0 ? daysRemaining.toString() : '0',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: TrendingUp,
      label: `Proyección Fin ${periodName}`,
      value: projectedIncome !== null ? formatCurrency(projectedIncome) : 'N/A',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Card Header */}
      <div
        className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50/50 transition-colors border-b border-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Estadísticas de Ingresos</h2>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="stats-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-6 space-y-6">
              
              {/* Comparison with Last Month */}
              {percentageChange !== null && lastMonthIncome !== undefined && (
                <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2">
                        vs. Mes Anterior
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(lastMonthIncome)}
                      </p>
                      <div className={`flex items-center gap-2 ${isPositiveChange ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositiveChange ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-bold">
                          {isPositiveChange ? '+' : ''}{percentageChange.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          ({isPositiveChange ? '+' : ''}{formatCurrency(incomeChangeFromLastMonth)})
                        </span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-full ${isPositiveChange ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {isPositiveChange ? (
                        <TrendingUp className={`w-8 h-8 ${isPositiveChange ? 'text-emerald-600' : 'text-red-600'}`} />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 font-medium mb-1.5 leading-tight">
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold text-gray-900 truncate">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}