'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import NewWeeklyGoalModal from './NewWeeklyCycleModal'
import {
  Calendar,
  ChevronLeft,
  PlusCircle,
  CheckCircle,
  Target,
  BarChart,
  Clock,
  Loader2,
  AlertCircle,
  CheckSquare,
  Hash,
  ArrowRight,
  PencilLine
} from 'lucide-react'
import { format, addDays, addWeeks, differenceInWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import UpdateProgressModal from './UpdateProgressModal'
import Link from 'next/link'

type WeeklyGoal = {
  id: string
  title: string
  week_number: number
  target_value: number
  unit: string
  type: 'quantitative' | 'boolean'
}

type Cycle = {
  id: string
  title: string
  start_date: string
  end_date: string
}
type WeeklyProgress = {
  goal_id: string
  value: number
}
export default function CycleDetail() {
  const params = useParams()
  const router = useRouter()
  const cycleId = params?.slug as string

  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [goals, setGoals] = useState<WeeklyGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentWeek, setCurrentWeek] = useState<number | null>(null)

  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const [selectedGoal, setSelectedGoal] = useState<WeeklyGoal | null>(null)

  // función para abrir el modal de progreso
  const openProgressModal = (goal: WeeklyGoal) => setSelectedGoal(goal)
  const [progress, setProgress] = useState<WeeklyProgress[]>([])

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: p } = await supabase
        .from('weekly_progress')
        .select('goal_id, value')
        .in('goal_id', goals.map((g) => g.id))

      setProgress(p || [])
    }

    if (goals.length > 0) {
      fetchProgress()
    }
  }, [goals])
  useEffect(() => {
    if (!cycleId) return

    const fetchCycle = async () => {
      setLoading(true)
      setError('')

      try {
        const { data: c, error: cycleError } = await supabase
          .from('weekly_cycles')
          .select('*')
          .eq('id', cycleId)
          .single()

        if (cycleError) throw cycleError

        const { data: g, error: goalsError } = await supabase
          .from('weekly_goals')
          .select('*')
          .eq('cycle_id', cycleId)
          .order('week_number', { ascending: true })

        if (goalsError) throw goalsError

        setCycle(c)
        setGoals(g || [])

        // Calculate current week based on start date
        if (c) {
          const startDate = new Date(c.start_date)
          const today = new Date()
          const diffWeeks = differenceInWeeks(today, startDate)

          // Set current week between 1-12 range
          if (diffWeeks >= 0 && diffWeeks < 12) {
            setCurrentWeek(diffWeeks + 1)
          } else if (diffWeeks < 0) {
            setCurrentWeek(null) // Not started yet
          } else {
            setCurrentWeek(12) // Completed
          }
        }
      } catch (err) {
        console.error('Error fetching cycle details:', err)
        setError('No se pudo cargar la información del ciclo.')
      } finally {
        setLoading(false)
      }
    }

    fetchCycle()
  }, [cycleId, refreshKey])

  const goalsByWeek = Array.from({ length: 12 }, (_, i) => {
    const week = i + 1
    return {
      week,
      goals: goals.filter((g) => g.week_number === week),
      startDate: cycle ? format(addWeeks(new Date(cycle.start_date), i), 'd MMM', { locale: es }) : '',
      endDate: cycle ? format(addDays(addWeeks(new Date(cycle.start_date), i + 1), -1), 'd MMM', { locale: es }) : '',
      isCurrentWeek: week === currentWeek
    }
  })
  const getGoalProgress = (goalId: string) => {
    return progress.find((p) => p.goal_id === goalId)?.value ?? 0
  }
  const openModalForWeek = (week: number) => {
    setSelectedWeek(week)
    setOpen(true)
  }

  const getProgressBarColor = (week: number) => {
    if (currentWeek === null) return 'bg-slate-200'
    if (week < currentWeek) return 'bg-emerald-500'
    if (week === currentWeek) return 'bg-amber-500'
    return 'bg-slate-200'
  }

  const getWeekStatus = (week: number) => {
    if (currentWeek === null) return { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Pendiente' }
    if (week < currentWeek) return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Completada' }
    if (week === currentWeek) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Actual' }
    return { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Próxima' }
  }

  const getGoalIcon = (type: string) => {
    if (type === 'quantitative') return <BarChart className="h-4 w-4 mr-1 text-blue-600" />
    return <CheckSquare className="h-4 w-4 mr-1 text-blue-600" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-slate-700 font-medium">Cargando detalles del ciclo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md border border-red-100">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-3">Error al cargar</h2>
          <p className="text-slate-700 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/cycles')}
              className="px-5 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition flex items-center gap-2 font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {cycle && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-slate-200">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => router.push('/ciclos')}
                      className="text-slate-600 hover:text-slate-900 transition hover:bg-slate-100 p-1 rounded-full"
                      aria-label="Volver a ciclos"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{cycle.title}</h1>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Calendar className="h-4 w-4" />
                    <p>
                      {format(new Date(cycle.start_date), 'd MMM yyyy', { locale: es })} - {format(new Date(cycle.end_date), 'd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {currentWeek && (
                    <div className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center border border-amber-200">
                      <Clock className="h-4 w-4 mr-1.5" />
                      Semana actual: {currentWeek}/12
                    </div>
                  )}
                  <button
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Agregar meta</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative w-full h-6 bg-slate-200 rounded-full mb-8 overflow-hidden shadow-inner">
              {currentWeek && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentWeek / 12) * 100)}%` }}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-700">
                  {currentWeek ? `${Math.round((currentWeek / 12) * 100)}% completado` : 'Ciclo no iniciado'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {goalsByWeek.map(({ week, goals, startDate, endDate, isCurrentWeek }) => {
                const { color, label } = getWeekStatus(week)

                return (
                  <div
                  onClick={() => router.push(`/ciclos/${cycleId}/week/${week}`)}
                    key={week}
                    className={`bg-white border rounded-lg shadow-md p-5 flex flex-col ${isCurrentWeek ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                      }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-full h-8 w-8 flex items-center justify-center bg-blue-600 text-white font-bold shadow-sm`}>
                          {week}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Semana {week}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color} border`}>
                        {label}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 mb-4 flex items-center gap-1.5 font-medium bg-slate-50 p-2 rounded-md border border-slate-200">
                      <Calendar className="h-4 w-4" />
                      <span>{startDate}</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <span>{endDate}</span>
                    </div>

                    <div className="flex-grow">
                      {goals.length > 0 ? (
                        <div className="space-y-3">
                          {goals.map((g) => {
                            const progressValue = getGoalProgress(g.id)
                            const isComplete = g.type === 'quantitative'
                              ? progressValue >= g.target_value
                              : progressValue === 1

                            return (
                              <div key={g.id} className="p-3 bg-blue-50 rounded-md border border-blue-100 shadow-sm hover:shadow transition">
                                <div className="flex items-center mb-1.5">
                                  {getGoalIcon(g.type)}
                                  <span className="font-semibold text-slate-800 text-sm">{g.title}</span>
                                </div>

                                {g.type === 'quantitative' && (
                                  <div className="flex items-center justify-between text-sm bg-white p-2 rounded border border-blue-100 mb-1">
                                    <span className="text-slate-600">Meta: {g.target_value} {g.unit}</span>
                                    <span className="font-semibold text-emerald-600">
                                      {progressValue} / {g.target_value}
                                    </span>
                                  </div>
                                )}

                                {g.type === 'boolean' && (
                                  <p className={`text-sm font-medium ${progressValue === 1 ? 'text-green-600' : progressValue === 0 ? 'text-red-600' : 'text-slate-500'
                                    }`}>
                                    {progressValue === 1 ? '✅ Completada' : progressValue === 0 ? '❌ No completada' : 'Sin actualizar'}
                                  </p>
                                )}

                                <button
                                   onClick={(e) => {
                                    e.stopPropagation() // ⛔ evita que el clic suba al Link
                                    openProgressModal(g)
                                  }}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                                >
                                  <PencilLine className="h-3 w-3" /> Actualizar progreso
                                </button>
                                
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="h-24 flex flex-col items-center justify-center text-slate-500 text-sm border border-dashed border-slate-300 rounded-lg bg-slate-50">
                          <Calendar className="h-5 w-5 mb-1 text-slate-400" />
                          Sin metas definidas
                        </div>
                      )}
                    </div>

                    <button
                     onClick={(e) => {
                      e.stopPropagation() // ⛔ evita que el clic suba al Link
                      openModalForWeek(week)
                    }}
                      className="mt-4 text-blue-700 hover:text-blue-800 text-sm flex items-center justify-center py-2 px-3 border border-blue-200 rounded-md hover:bg-blue-50 transition font-medium shadow-sm hover:shadow"
                    >
                      <PlusCircle className="h-4 w-4 mr-1.5" />
                      Agregar meta
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
        <NewWeeklyGoalModal
          isOpen={open}
          onClose={() => setOpen(false)}
          cycleId={cycleId}
          onCreated={() => {
            setRefreshKey((k) => k + 1)
            setOpen(false)
            setSelectedWeek(null)
          }}
        />
        {selectedGoal && (
          <UpdateProgressModal
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onUpdated={() => setRefreshKey((k) => k + 1)}
          />
        )}
      </div>
    </div>
  )
}