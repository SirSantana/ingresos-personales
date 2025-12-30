import { useState, useEffect } from 'react'
import { Check, Target, Plus, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

type GoalType = 'money' | 'books' | 'exercise' | 'custom'

interface Goal {
  id: string
  title: string
  type: GoalType
  unit?: string
  final_goal: number
  current_amount?: number
  milestones?: Milestone[]
  isExpanded?: boolean
}

interface Milestone {
  id: string
  goal_id: string
  amount: number
  label?: string
  completed: boolean
}

interface MilestoneTrackerProps {
  supabase?: any
}

// Helper to format based on goal type
const formatValue = (amount: number, type: GoalType, unit?: string): string => {
  if (type === 'money') {
    return `$${Math.round(amount).toLocaleString('es-CO')}`
  }
  if (unit) {
    return `${amount} ${unit}`
  }
  return amount.toString()
}

export default function MilestoneTracker() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalType, setNewGoalType] = useState<GoalType>('money')
  const [newGoalUnit, setNewGoalUnit] = useState('')
  const [newGoalAmount, setNewGoalAmount] = useState('')
  
  const [addingMilestoneToGoal, setAddingMilestoneToGoal] = useState<string | null>(null)
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('')
  const [newMilestoneLabel, setNewMilestoneLabel] = useState('')

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, goalId: string, milestoneId: string) => {
    e.preventDefault();
    if (window.confirm('¿Eliminar este hito?')) {
      removeMilestone(goalId, milestoneId);
    }
  };

  // Fetch goals and milestones
  useEffect(() => {
    if (supabase) {
      fetchGoals()
    } else {
      setLoading(false)
    }
  }, [supabase])

  const fetchGoals = async () => {
    if (!supabase) return
    
    try {
      setLoading(true)
      
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true })

      if (goalsError) throw goalsError

      // Fetch all milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .order('amount', { ascending: true })

      if (milestonesError) throw milestonesError

      // Combine goals with their milestones
      const goalsWithMilestones = (goalsData || []).map((goal: Goal) => ({
        ...goal,
        milestones: (milestonesData || []).filter((m: Milestone) => m.goal_id === goal.id),
        isExpanded: true,
        current_amount: 0
      }))

      setGoals(goalsWithMilestones)
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleGoalExpanded = (goalId: string) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, isExpanded: !g.isExpanded } : g
    ))
  }

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    if (!supabase) return

    const goal = goals.find(g => g.id === goalId)
    const milestone = goal?.milestones?.find(m => m.id === milestoneId)
    
    if (!milestone) return

    try {
      const { error } = await supabase
        .from('milestones')
        .update({ completed: !milestone.completed })
        .eq('id', milestoneId)

      if (error) throw error

      // Update local state
      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { 
              ...g, 
              milestones: g.milestones?.map(m => 
                m.id === milestoneId ? { ...m, completed: !m.completed } : m
              )
            }
          : g
      ))
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  const addGoal = async () => {
    if (!supabase) return

    const finalGoal = parseFloat(newGoalAmount)
    if (!newGoalTitle.trim() || !finalGoal || finalGoal <= 0) return

    try {
      const newGoal = {
        title: newGoalTitle,
        type: newGoalType,
        unit: newGoalType === 'custom' ? newGoalUnit : undefined,
        final_goal: finalGoal
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setGoals(prev => [...prev, { 
        ...data, 
        milestones: [], 
        isExpanded: true,
        current_amount: 0
      }])

      setNewGoalTitle('')
      setNewGoalType('money')
      setNewGoalUnit('')
      setNewGoalAmount('')
      setIsAddingGoal(false)
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const removeGoal = async (goalId: string) => {
    if (!supabase) return

    try {
      // Delete milestones first
      await supabase
        .from('milestones')
        .delete()
        .eq('goal_id', goalId)

      // Delete goal
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.filter(g => g.id !== goalId))
    } catch (error) {
      console.error('Error removing goal:', error)
    }
  }

  const addMilestone = async (goalId: string) => {
    if (!supabase) return

    const amount = parseFloat(newMilestoneAmount)
    const goal = goals.find(g => g.id === goalId)
    
    if (!amount || amount <= 0 || !goal || amount > goal.final_goal) return

    try {
      const newMilestone = {
        goal_id: goalId,
        amount,
        label: newMilestoneLabel || undefined,
        completed: false
      }

      const { data, error } = await supabase
        .from('milestones')
        .insert([newMilestone])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? {
              ...g,
              milestones: [...(g.milestones || []), data].sort((a, b) => a.amount - b.amount)
            }
          : g
      ))

      setNewMilestoneAmount('')
      setNewMilestoneLabel('')
      setAddingMilestoneToGoal(null)
    } catch (error) {
      console.error('Error adding milestone:', error)
    }
  }

  const removeMilestone = async (goalId: string, milestoneId: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) throw error

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, milestones: g.milestones?.filter(m => m.id !== milestoneId) }
          : g
      ))
    } catch (error) {
      console.error('Error removing milestone:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" strokeWidth={1.5} />
      </div>
    )
  }

 return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 tracking-tight mb-2 sm:mb-3">
            Metas e Hitos
          </h2>
          <p className="text-sm sm:text-base font-light text-gray-400">
            {goals.length} {goals.length === 1 ? 'meta activa' : 'metas activas'}
          </p>
        </div>

        {/* Goals List */}
        <div className="space-y-6 sm:space-y-8 mb-8">
          {goals.map((goal) => {
            const completedCount = goal.milestones?.filter(m => m.completed).length || 0
            const totalMilestones = goal.milestones?.length || 0
            const progressPercentage = totalMilestones > 0 
              ? (completedCount / totalMilestones) * 100 
              : 0

            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden  w-[100vw] ml-[50%] -translate-x-1/2 sm:w-full sm:ml-0 sm:translate-x-0">
                
                {/* Goal Header */}
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-light text-gray-900">
                          {goal.title}
                        </h3>
                        {goals.length > 1 && (
                          <button
                            onClick={() => removeGoal(goal.id)}
                            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-900 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                          >
                            <X className="w-3 h-3" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                      
                    </div>
                    
                    <button
                      onClick={() => toggleGoalExpanded(goal.id)}
                      className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-900 flex items-center justify-center transition-colors ml-4"
                    >
                      {goal.isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="relative w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="absolute inset-y-0 left-0 bg-gray-900 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-light text-gray-400">
                      <span>{completedCount} de {totalMilestones} hitos</span>
                      <span>{progressPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Milestones - Collapsible */}
                {goal.isExpanded && (
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                    
                    {totalMilestones > 0 ? (
                      <div className="mb-6">
                        <div className="overflow-x-auto pb-4 -mx-6 px-6 sm:-mx-8 sm:px-8">
                          <div className="relative" style={{ minWidth: 'max-content' }}>
                            
                            {/* Connection Line */}
                            {totalMilestones > 1 && (
                              <div className="absolute top-5 sm:top-6 left-0 right-0 h-px">
                                {/* Gray background line */}
                                <div 
                                  className="absolute h-full bg-gray-200"
                                  style={{ 
                                    left: '20px',
                                    right: '20px'
                                  }}
                                />
                                {/* Black progress line */}
                                <div 
                                  className="absolute h-full bg-gray-900 transition-all duration-500 ease-out"
                                  style={{ 
                                    left: '20px',
                                    width: (() => {
                                      // Find last completed milestone index
                                      let lastCompletedIndex = -1
                                      goal.milestones?.forEach((m, i) => {
                                        if (m.completed) lastCompletedIndex = i
                                      })
                                      
                                      if (lastCompletedIndex === -1) return '0'
                                      
                                      // Calculate width based on milestone positions
                                      const gapSize = 6 * 4 // gap-6 = 24px (6 * 4px)
                                      const milestoneWidth = 80 // min-w-[80px]
                                      const totalWidth = (milestoneWidth * totalMilestones) + (gapSize * (totalMilestones - 1))
                                      const progressWidth = (milestoneWidth * lastCompletedIndex) + (gapSize * lastCompletedIndex)
                                      
                                      return `${progressWidth}px`
                                    })()
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Milestones */}
                            <div className="flex items-start gap-6 sm:gap-8 lg:gap-12">
                              {goal.milestones?.map((milestone) => (
                                <div 
                                  key={milestone.id}
                                  className="flex flex-col items-center gap-3 relative group min-w-[80px]"
                                >
                                  {/* Milestone Button */}
                                  <button
                                    onClick={() => toggleMilestone(goal.id, milestone.id)}
                                    onContextMenu={(e) => handleContextMenu(e, goal.id, milestone.id)}
                                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-10 ${
                                      milestone.completed
                                        ? 'bg-gray-900 border-gray-900'
                                        : 'bg-white border-gray-200 hover:border-gray-400'
                                    }`}
                                  >
                                    {milestone.completed && (
                                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                                    )}
                                  </button>

                                  {/* Amount Label */}
                                  <div className="text-center w-full">
                                    <p className={`text-xs sm:text-sm font-light transition-colors ${
                                      milestone.completed ? 'text-gray-900 font-medium' : 'text-gray-400'
                                    }`}>
                                      {formatValue(milestone.amount, goal.type, goal.unit)}
                                    </p>
                                    {milestone.label && (
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {milestone.label}
                                      </p>
                                    )}
                                  </div>

                                  {/* Delete Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeMilestone(goal.id, milestone.id)
                                    }}
                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3" strokeWidth={2} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-light text-gray-400 text-center py-4 mb-6">
                        No hay hitos definidos
                      </p>
                    )}

                    {/* Add Milestone */}
                    {addingMilestoneToGoal === goal.id ? (
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={newMilestoneAmount}
                          onChange={(e) => setNewMilestoneAmount(e.target.value)}
                          placeholder="Monto del hito"
                          className="w-full py-2 px-4 rounded-full border border-gray-200 focus:border-gray-900 focus:outline-none text-sm font-light text-gray-900"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={newMilestoneLabel}
                          onChange={(e) => setNewMilestoneLabel(e.target.value)}
                          placeholder="Etiqueta (opcional)"
                          className="w-full py-2 px-4 rounded-full border border-gray-200 focus:border-gray-900 focus:outline-none text-sm font-light text-gray-900"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => addMilestone(goal.id)}
                            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                          >
                            <Check className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => {
                              setAddingMilestoneToGoal(null)
                              setNewMilestoneAmount('')
                              setNewMilestoneLabel('')
                            }}
                            className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-900 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingMilestoneToGoal(goal.id)}
                        className="w-full py-2 px-4 rounded-full border border-gray-200 hover:border-gray-900 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-gray-900"
                      >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm font-light">Agregar hito</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Goal */}
        <div className="max-w-2xl mx-auto">
          {!isAddingGoal ? (
            <button
              onClick={() => setIsAddingGoal(true)}
              className="w-full py-4 px-6 rounded-full border border-gray-200 hover:border-gray-900 transition-all duration-300 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-900"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-base font-light">Nueva meta</span>
            </button>
          ) : (
            <div className="p-6 border border-gray-200 rounded-2xl space-y-3">
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Nombre de la meta"
                className="w-full py-3 px-4 rounded-full border border-gray-200 focus:border-gray-900 focus:outline-none text-sm font-light text-gray-900"
                autoFocus
              />
              <select
                value={newGoalType}
                onChange={(e) => setNewGoalType(e.target.value as GoalType)}
                className="w-full py-3 px-4 rounded-full border border-gray-200 focus:border-gray-900 focus:outline-none text-sm font-light text-gray-900"
              >
                <option value="money">Dinero</option>
                <option value="books">Libros</option>
                <option value="exercise">Ejercicio</option>
                <option value="custom">Personalizado</option>
              </select>
              {newGoalType === 'custom' && (
                <input
                  type="text"
                  value={newGoalUnit}
                  onChange={(e) => setNewGoalUnit(e.target.value)}
                  placeholder="Unidad (ej: km, horas)"
                  className="w-full py-3 px-4 rounded-full border border-gray-200 focus:border-gray-900 focus:outline-none text-sm font-light text-gray-900"
                />
              )}
              <input
                type="number"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(e.target.value)}
                placeholder="Monto objetivo"
                className="w-full py-3 px-4 rounded-full border border-gray-200 focus:border-gray-900 focus:outline-none text-sm font-light text-gray-900"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={addGoal}
                  className="flex-1 py-3 px-4 rounded-full bg-gray-900 text-white text-sm font-light hover:bg-gray-800 transition-colors"
                >
                  Crear meta
                </button>
                <button
                  onClick={() => {
                    setIsAddingGoal(false)
                    setNewGoalTitle('')
                    setNewGoalType('money')
                    setNewGoalUnit('')
                    setNewGoalAmount('')
                  }}
                  className="px-4 py-3 rounded-full border border-gray-200 hover:border-gray-900 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}