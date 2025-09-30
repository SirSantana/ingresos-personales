'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Target, 
  PlusCircle, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  Calendar,
  Star,
  Clock,
  ArrowLeft
} from 'lucide-react'

export default function GoalsPage() {
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState([
    { 
      id: 1, 
      title: 'Meditar todos los días', 
      category: 'Bienestar',
      progress: 70,
      currentStreak: 7,
      targetDays: 30,
      color: 'bg-purple-600'
    },
    { 
      id: 2, 
      title: 'Leer 12 libros este año', 
      category: 'Aprendizaje',
      progress: 25,
      currentStreak: 4,
      targetDays: 365,
      color: 'bg-blue-600'
    },
    { 
      id: 3, 
      title: 'Ahorrar para viaje', 
      category: 'Finanzas',
      progress: 45,
      currentStreak: 14,
      targetDays: 60,
      color: 'bg-green-600'
    },
    { 
      id: 4, 
      title: 'Carrera 10km', 
      category: 'Fitness',
      progress: 10,
      currentStreak: 2,
      targetDays: 90,
      color: 'bg-orange-500'
    }
  ])

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const renderGoalStatus = (progress) => {
    if (progress < 25) return { text: 'Inicio', color: 'text-gray-500' }
    if (progress < 50) return { text: 'En progreso', color: 'text-blue-600' }
    if (progress < 75) return { text: 'Avanzado', color: 'text-purple-600' }
    if (progress < 100) return { text: 'Casi completo', color: 'text-green-600' }
    return { text: 'Completo', color: 'text-green-500' }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Mis Metas</h1>
            </div>
            <div className="flex items-center">
              <button className="flex items-center justify-center p-2 bg-purple-100 text-purple-600 rounded-full">
                <PlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <Calendar size={14} />
          <span>{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</span>
        </div>
      </div>

      {/* Goals Summary */}
      <div className="max-w-md mx-auto px-4 pb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">Resumen de progreso</h3>
            <span className="text-xs text-purple-600 font-medium">Ver todos</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{goals.length}</p>
              <p className="text-xs text-gray-500 mt-1">Metas activas</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">1</p>
              <p className="text-xs text-gray-500 mt-1">Completadas</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-500">56%</p>
              <p className="text-xs text-gray-500 mt-1">Promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="max-w-md mx-auto px-4 pb-24">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Metas actuales</h2>
        
        {goals.map((goal) => {
          const status = renderGoalStatus(goal.progress);
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-4 shadow-sm mb-4"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${goal.color} rounded-full flex items-center justify-center text-white mr-3`}>
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{goal.title}</h3>
                    <p className="text-xs text-gray-500">{goal.category}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${status.color} bg-gray-50 px-2 py-1 rounded-md`}>
                  {status.text}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progreso</span>
                  <span className="text-xs font-medium text-gray-700">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`${goal.color} h-1.5 rounded-full`} 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-xs text-gray-700">{goal.currentStreak} días</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{goal.targetDays} días</span>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        >
          <PlusCircle size={24} />
        </motion.button>
      </div>
    </div>
  )
}