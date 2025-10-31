'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Target, Trash2, Check } from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  createdAt: string
  completed: boolean
  progress: number
}

export default function QuarterlyGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    progress: 0
  })

  // ✅ Cargar metas del localStorage solo en el cliente
  useEffect(() => {
    if (typeof window === 'undefined') return

    const keys = Object.keys(localStorage).filter(key => key.startsWith('goal:'))
    const loadedGoals: Goal[] = keys.map(key => {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    }).filter(Boolean)

    setGoals(loadedGoals.sort((a, b) => a.targetDate.localeCompare(b.targetDate)))
  }, [])

  const saveGoal = (goal: Goal) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`goal:${goal.id}`, JSON.stringify(goal))
  }

  const deleteGoal = (goalId: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`goal:${goalId}`)
  }

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return

    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 90)

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      targetDate: targetDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      completed: false,
      progress: 0
    }

    saveGoal(goal)
    setGoals([...goals, goal].sort((a, b) => a.targetDate.localeCompare(b.targetDate)))
    setNewGoal({ title: '', description: '', progress: 0 })
    setShowForm(false)
  }

  const handleUpdateProgress = (goalId: string, newProgress: number) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId
        ? { ...g, progress: newProgress, completed: newProgress >= 100 }
        : g
    )

    const goal = updatedGoals.find(g => g.id === goalId)
    if (goal) {
      saveGoal(goal)
      setGoals(updatedGoals)
    }
  }

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId)
    setGoals(goals.filter(g => g.id !== goalId))
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const stats = useMemo(() => {
    const total = goals.length
    const completed = goals.filter(g => g.completed).length
    const inProgress = goals.filter(g => !g.completed && g.progress > 0).length
    const notStarted = goals.filter(g => g.progress === 0).length
    return { total, completed, inProgress, notStarted }
  }, [goals])

  return (
    <div className="min-h-screen w-full px-6 py-12">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-6">
            Metas a 90 Días
          </h1>
          <p className="text-sm font-normal text-gray-400">
            Visualiza y alcanza tus objetivos trimestrales
          </p>
        </div>

        {/* Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Completadas', value: stats.completed },
              { label: 'En Progreso', value: stats.inProgress },
              { label: 'Sin Iniciar', value: stats.notStarted },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-normal text-gray-400 mb-2 tracking-wide">
                  {s.label}
                </p>
                <p className="text-3xl sm:text-4xl font-light text-gray-900">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Goal Button */}
        {!showForm && (
          <div className="text-center mb-16">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-normal hover:bg-gray-800 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Nueva Meta
            </button>
          </div>
        )}

        {/* Add Goal Form */}
        {showForm && (
          <div className="mb-16 p-6 sm:p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-light text-gray-900 mb-6">Nueva Meta</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-normal text-gray-400 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ej: Aumentar ingresos en 30%"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-base font-normal placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-normal text-gray-400 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Detalles de cómo lograrás esta meta..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-base font-normal placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title.trim()}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-normal hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Crear Meta
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setNewGoal({ title: '', description: '', progress: 0 })
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-normal hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map((goal) => {
              const daysLeft = getDaysRemaining(goal.targetDate)
              const isOverdue = daysLeft < 0
              
              return (
                <div
                  key={goal.id}
                  className={`p-6 sm:p-8 border rounded-2xl transition-all ${
                    goal.completed
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {goal.completed && (
                          <Check className="w-5 h-5 text-gray-900 flex-shrink-0" strokeWidth={2} />
                        )}
                        <h3 className={`text-lg sm:text-xl font-light ${
                          goal.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                        }`}>
                          {goal.title}
                        </h3>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm font-normal text-gray-500 mb-3">
                          {goal.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-normal text-gray-400">
                        <span>
                          {isOverdue
                            ? `${Math.abs(daysLeft)} días vencida`
                            : `${daysLeft} días restantes`}
                        </span>
                        <span>•</span>
                        <span>Meta: {goal.targetDate}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-gray-900" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {!goal.completed && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-normal text-gray-400">Progreso</span>
                        <span className="text-xs font-medium text-gray-900">
                          {goal.progress}%
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gray-900 transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      
                      {/* Progress Controls */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-normal transition-all"
                        >
                          -10%
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-normal transition-all"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 25))}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-normal transition-all"
                        >
                          +25%
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(goal.id, 100)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-normal transition-all ml-auto"
                        >
                          Completar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : !showForm && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
              <Target className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-normal text-gray-400 mb-2">No tienes metas aún</p>
            <p className="text-sm font-normal text-gray-400">
              Comienza creando tu primera meta a 90 días
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
