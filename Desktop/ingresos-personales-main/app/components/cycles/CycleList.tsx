'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format, isBefore, isAfter, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import NewCycleModal from './NewCycleModal'
import { Calendar, PlusCircle, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

type Cycle = {
  id: string
  title: string
  start_date: string
  end_date: string
}

export default function CycleList() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCycles = async () => {
      setLoading(true)
      setError('')
      
      try {
        const { data, error } = await supabase
          .from('weekly_cycles')
          .select('*')
          .order('start_date', { ascending: false })

        if (error) throw error
        setCycles(data || [])
      } catch (err) {
        console.error('Error fetching cycles:', err)
        setError('No se pudieron cargar los ciclos. Intenta de nuevo más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchCycles()
  }, [refreshKey])

  const getCycleStatus = (startDate: string, endDate: string) => {
    const today = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isBefore(today, start)) {
      return { status: 'upcoming', label: 'Próximo', color: 'text-amber-600 bg-amber-50 border-amber-200' }
    } else if (isAfter(today, end)) {
      return { status: 'completed', label: 'Completado', color: 'text-gray-600 bg-gray-50 border-gray-200' }
    } else {
      return { status: 'active', label: 'Activo', color: 'text-green-600 bg-green-50 border-green-200' }
    }
  }

  const getFormattedDateRange = (startDate: string, endDate: string) => {
    return `${format(new Date(startDate), 'd MMM', { locale: es })} - ${format(new Date(endDate), 'd MMM yyyy', { locale: es })}`
  }

  const getWeeksRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.ceil(diffDays / 7)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mis Ciclos de 12 Semanas</h1>
            <p className="text-gray-500 mt-1">Planifica y realiza seguimiento a tus objetivos trimestrales</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow hover:shadow-md w-full sm:w-auto justify-center"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Nuevo Ciclo</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 shadow-sm p-4 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setRefreshKey(k => k + 1)}
              className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : cycles.length === 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 text-center">
            <div className="flex justify-center mb-3">
              <Calendar className="h-12 w-12 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay ciclos creados</h3>
            <p className="text-gray-500 mb-6">Crea tu primer ciclo de 12 semanas para comenzar a planificar tus objetivos</p>
            <button
              onClick={() => setOpen(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Crear mi primer ciclo</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {cycles.map((cycle) => {
              const { status, label, color } = getCycleStatus(cycle.start_date, cycle.end_date)
              
              return (
                <Link
                  href={`/ciclos/${cycle.id}`}
                  key={cycle.id}
                  className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
                      {label}
                    </span>
                    {status === 'active' && (
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getWeeksRemaining(cycle.end_date)} semanas restantes
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{cycle.title}</h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {getFormattedDateRange(cycle.start_date, cycle.end_date)}
                  </div>
                  
                  <div className="mt-auto pt-3 flex justify-end">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                      Ver detalles <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <NewCycleModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setRefreshKey((k) => k + 1)
            setOpen(false)
          }}
        />
      </div>
    </div>
  )
}