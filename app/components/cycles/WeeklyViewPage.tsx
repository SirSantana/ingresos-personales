'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { format, addWeeks, addDays } from 'date-fns'
import { Calendar, Loader2, AlertCircle } from 'lucide-react'
import { es } from 'date-fns/locale'

export default function WeeklyViewComponent() {
  const params = useParams()
  const cycleId = params?.id as string
  const weekNumber = parseInt(params?.weekNumber as string)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cycle, setCycle] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const { data: c } = await supabase
          .from('weekly_cycles')
          .select('*')
          .eq('id', cycleId)
          .single()

        const { data: g } = await supabase
          .from('weekly_goals')
          .select('*')
          .eq('cycle_id', cycleId)
          .eq('week_number', weekNumber)

        if (g && g.length > 0) {
          const { data: p } = await supabase
            .from('weekly_progress')
            .select('*')
            .in('goal_id', g.map((goal) => goal.id))

          setProgress(p || [])
        } else {
          setProgress([])
        }

        setCycle(c)
        setGoals(g || [])
      } catch (err) {
        console.error(err)
        setError('Error al cargar la información')
      } finally {
        setLoading(false)
      }
    }

    if (cycleId && weekNumber) fetchData()
  }, [cycleId, weekNumber])

  const getProgress = (goalId: string) => {
    return progress.find((p) => p.goal_id === goalId)?.value ?? 0
  }

  const getGoalStatus = (goal: any, value: number) => {
    if (goal.type === 'quantitative') {
      if (value >= goal.target_value) return '✅ Completada'
      if (value > 0) return '🔄 En progreso'
      return '❌ No cumplida'
    } else {
      if (value === 1) return '✅ Completada'
      if (value === 0) return '❌ No cumplida'
      return '⏳ Pendiente'
    }
  }

  const getWeekDates = () => {
    if (!cycle) return { start: '', end: '' }
    const start = addWeeks(new Date(cycle.start_date), weekNumber - 1)
    const end = addDays(start, 6)
    return {
      start: format(start, 'd MMM', { locale: es }),
      end: format(end, 'd MMM', { locale: es })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  const { start, end } = getWeekDates()

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Semana {weekNumber} del ciclo "{cycle?.title}"</h1>
      <p className="text-sm text-slate-600 flex items-center gap-1 mb-6">
        <Calendar className="h-4 w-4" /> {start} – {end}
      </p>

      <div className="space-y-5">
        {goals.map((goal) => {
          const value = getProgress(goal.id)
          const status = getGoalStatus(goal, value)

          return (
            <div
              key={goal.id}
              className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
            >
              <h2 className="font-semibold text-lg text-slate-800 mb-2">{goal.title}</h2>
              <p className="text-sm text-slate-600 mb-1">
                {goal.type === 'quantitative'
                  ? `Meta: ${goal.target_value} ${goal.unit}`
                  : 'Meta binaria (Sí / No)'}
              </p>
              <p className="text-sm font-medium">Progreso: {value}</p>
              <p className="text-sm mt-2">Estado: {status}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
