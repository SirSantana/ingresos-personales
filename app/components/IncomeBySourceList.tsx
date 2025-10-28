'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { TrendingUp, Zap } from 'lucide-react'

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
  incomesOfDay = [],
  sources = [],
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
    <div className="space-y-6">
      
      {/* Summary Stats */}
      {incomeEntries.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur rounded-2xl border border-white/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Total de Fuentes Activas</p>
              <p className="text-lg font-bold text-gray-900">{incomeEntries.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 font-medium">Fuente Principal</p>
            <p className="text-lg font-bold text-indigo-600">
              {topSourcePercentage.toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Scrollable List */}
      {incomeEntries.length > 0 ? (
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-purple-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-pink-50 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent px-1">
            {incomeEntries.map(({ source, amount }, index) => {
              const sourceDisplayName = cleanSourceName(source.name)
              const percentage = dailyTotal > 0 ? (amount / dailyTotal) * 100 : 0
              const isTopSource = index === 0

              return (
                <div
                  key={source.id}
                  className={`group relative flex flex-col bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 flex-shrink-0 w-56 hover:shadow-xl hover:-translate-y-1 ${
                    isTopSource 
                      ? 'border-indigo-300 ring-2 ring-indigo-100' 
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  {/* Top Badge for #1 */}
                  {isTopSource && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Zap className="w-3 h-3" />
                        Top 1
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Source Logo & Name */}
                    <div className="flex flex-col items-center mb-4 mt-2">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                        isTopSource ? 'bg-gradient-to-br from-indigo-100 to-purple-100' : 'bg-gray-100'
                      }`}>
                        {source.logo && typeof source.logo === 'string' ? (
                          <Image
                            src={source.logo}
                            alt={`${source.name} logo`}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-500">
                            {source.name ? source.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-800 text-sm text-center line-clamp-2 h-10">
                        {sourceDisplayName || 'Fuente'}
                      </h3>
                    </div>

                    {/* Income Amount */}
                    <div className="space-y-2">
                      <div className={`p-3 rounded-xl text-center ${
                        isTopSource 
                          ? 'bg-gradient-to-br from-indigo-50 to-purple-50' 
                          : 'bg-gray-50'
                      }`}>
                        <p className="text-xs text-gray-600 font-medium mb-1">Ingresos</p>
                        <p className={`text-2xl font-bold ${
                          isTopSource ? 'text-indigo-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(amount)}
                        </p>
                      </div>

                      {/* Percentage Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-medium">Participación</span>
                          <span className="text-xs font-bold text-gray-700">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTopSource 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                : 'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 pointer-events-none transition-all duration-300"></div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm font-medium text-center">
            No hay registros de ingresos para este período
          </p>
        </div>
      )}
    </div>
  )
}