// 'use client'

// import { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabaseClient'
// import { format } from 'date-fns'
// import { motion } from 'framer-motion'

// const rituals = [
//   { key: 'agradecer', label: 'Agradecer por 3 cosas' },
//   { key: 'visualizar', label: 'Visualizar tus metas' },
//   { key: 'leer', label: 'Leer o escuchar algo inspirador' },
//   { key: 'afirmaciones', label: 'Decir tus afirmaciones' },
//   { key: 'registrar_ingresos', label: 'Registrar ingresos si los hay' }
// ]

// const moods = ['😄 Feliz', '😌 Tranquilo', '😔 Triste', '😕 Ansioso', '💪 Motivado', '😴 Cansado']

// const affirmations = [
//   'Soy capaz de crear valor y atraer abundancia.',
//   'Cada día mejoro mis hábitos financieros.',
//   'Soy disciplinado y merezco mis resultados.',
//   'Estoy en paz con mi progreso y mi proceso.',
//   'Mis pensamientos crean mi realidad.'
// ]

// export default function DailyRituals() {
//   const [ritualsState, setRitualsState] = useState<any>({})
//   const [loading, setLoading] = useState(true)
//   const [gratitude, setGratitude] = useState('')
//   const [savedGratitudes, setSavedGratitudes] = useState<string[]>([])
//   const [currentRitualIndex, setCurrentRitualIndex] = useState(0)
//   const today = format(new Date(), 'yyyy-MM-dd')

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true)

//       // 1. Ritual del día
//       const { data, error } = await supabase
//         .from('daily_rituals')
//         .select('*')
//         .eq('date', today)
//         .single()

//       if (error) {
//         const { data: newData } = await supabase
//           .from('daily_rituals')
//           .insert({ date: today })
//           .select()
//           .single()
//         setRitualsState(newData || {})
//       } else {
//         setRitualsState(data || {})
//       }

//       // 2. Gratitudes anteriores desde localStorage
//       const stored = JSON.parse(localStorage.getItem('gratitudes') || '[]')
//       setSavedGratitudes(stored)

//       setLoading(false)
//     }

//     fetchData()
//   }, [today])

//   const handleToggle = async (key: string) => {
//     const updated = { ...ritualsState, [key]: !ritualsState[key] }
//     setRitualsState(updated)
//     await supabase.from('daily_rituals').update({ [key]: updated[key] }).eq('date', today)
//   }

//   const handleMoodChange = async (mood: string) => {
//     const updated = { ...ritualsState, mood }
//     setRitualsState(updated)
//     await supabase.from('daily_rituals').update({ mood }).eq('date', today)
//   }

//   const handleSaveGratitude = () => {
//     if (!gratitude.trim()) return
//     const updated = [...savedGratitudes, gratitude]
//     localStorage.setItem('gratitudes', JSON.stringify(updated))
//     setSavedGratitudes(updated)
//     setGratitude('')
//   }

//   const handleNextRitual = () => {
//     if (currentRitualIndex < rituals.length - 1) {
//       setCurrentRitualIndex(currentRitualIndex + 1)
//     }
//   }

//   if (loading) return <p>Cargando ritual...</p>

//   return (
//     <div className="h-screen flex flex-col justify-between bg-white p-6">
//       <motion.h2
//         className="text-2xl font-bold text-center"
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         Buen día, Miguel 🌞<br />
//         Hoy es {format(new Date(), 'eeee d MMMM', { locale: undefined })}
//       </motion.h2>

//       <p className="text-center text-gray-500 text-sm">
//         Completaste {rituals.filter(r => ritualsState?.[r.key]).length} de {rituals.length} rituales hoy.
//       </p>

//       <div className="flex-grow space-y-6 overflow-y-auto">
//         {currentRitualIndex < rituals.length && (
//           <div>
//             <h3 className="text-xl font-semibold text-center">{rituals[currentRitualIndex].label}</h3>
//             <label className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={!!ritualsState?.[rituals[currentRitualIndex].key]}
//                 onChange={() => handleToggle(rituals[currentRitualIndex].key)}
//                 className="w-5 h-5"
//               />
//               <span>{rituals[currentRitualIndex].label}</span>
//             </label>
//             <button
//               onClick={handleNextRitual}
//               className="w-full bg-blue-600 text-white py-3 rounded-xl mt-4 hover:bg-blue-700"
//             >
//               Siguiente Ritual
//             </button>
//           </div>
//         )}

//         {/* Otras secciones pueden ir aquí como Gratitud, Estado de Ánimo, Afirmaciones, etc. */}

//         <div className="space-y-4">
//           <label className="block font-semibold mb-1">¿Cómo te sientes hoy?</label>
//           <select
//             className="w-full border border-gray-300 rounded-xl p-2"
//             value={ritualsState?.mood || ''}
//             onChange={(e) => handleMoodChange(e.target.value)}
//           >
//             <option value="">Selecciona tu estado de ánimo</option>
//             {moods.map(m => (
//               <option key={m} value={m}>{m}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">Hoy agradezco por...</label>
//           <textarea
//             className="w-full border border-gray-300 rounded-xl p-2"
//             value={gratitude}
//             onChange={(e) => setGratitude(e.target.value)}
//             rows={3}
//           />
//           <button
//             onClick={handleSaveGratitude}
//             className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
//           >
//             Guardar agradecimiento
//           </button>
//         </div>

//         {savedGratitudes.length > 0 && (
//           <div className="text-sm text-gray-500 italic">
//             Agradecimiento pasado: “{savedGratitudes[Math.floor(Math.random() * savedGratitudes.length)]}”
//           </div>
//         )}

//         <div className="bg-gray-100 p-4 rounded-xl">
//           <h3 className="font-semibold mb-2">✨ Afirmación del día</h3>
//           <p className="italic text-gray-700">
//             {affirmations[Math.floor(Math.random() * affirmations.length)]}
//           </p>
//         </div>
//       </div>

//       <button
//         onClick={() => alert('¡Comenzaste tu día con intención!')}
//         className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold hover:bg-green-700 transition"
//       >
//         ✅ Comenzar mi día con intención
//       </button>
//     </div>
//   )
// }
'use client'
import { supabase } from '@/lib/supabaseClient'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Simulación de supabase
// const supabase = {
//   from: () => ({
//     select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: true }) }) }),
//     insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: false }) }) }),
//     update: () => ({ eq: () => Promise.resolve({ data: {}, error: false }) })
//   })
// }

// Emojis para los rituales
const ritualEmojis = {
  agradecer: '🙏',
  visualizar: '🎯',
  leer: '📚',
  afirmaciones: '💭',
  registrar_ingresos: '💰'
}

// Iconos para estados de ánimo
const moodIcons = {
  '😄 Feliz': { icon: '😄', color: 'bg-yellow-500' },
  '😌 Tranquilo': { icon: '😌', color: 'bg-blue-500' },
  '😔 Triste': { icon: '😔', color: 'bg-gray-500' },
  '😕 Ansioso': { icon: '😕', color: 'bg-orange-500' },
  '💪 Motivado': { icon: '💪', color: 'bg-green-500' },
  '😴 Cansado': { icon: '😴', color: 'bg-purple-500' }
}

// Datos de rituales
const rituals = [
  { key: 'agradecer', label: 'Agradecer por 3 cosas', description: 'Encuentra tres momentos, personas o cosas por las que te sientes agradecido' },
  { key: 'visualizar', label: 'Visualizar tus metas', description: 'Tómate un momento para visualizar tus objetivos' },
  { key: 'leer', label: 'Leer algo inspirador', description: '10 minutos de lectura positiva' },
  { key: 'afirmaciones', label: 'Decir tus afirmaciones', description: 'Repite tus afirmaciones matutinas' },
  { key: 'registrar_ingresos', label: 'Registrar ingresos', description: 'Anota tus ingresos del día' }
]

// Afirmaciones
const affirmations = [
  'Soy capaz de crear valor y atraer abundancia.',
  'Cada día mejoro mis hábitos financieros.',
  'Soy disciplinado y merezco mis resultados.',
  'Estoy en paz con mi progreso y mi proceso.',
  'Mis pensamientos crean mi realidad.'
]

export default function DailyRituals() {
  const [ritualsState, setRitualsState] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [gratitude, setGratitude] = useState('')
  const [savedGratitudes, setSavedGratitudes] = useState<string[]>([])
  const [showGratitudeModal, setShowGratitudeModal] = useState(false)
  const [selectedMood, setSelectedMood] = useState('')
  const [dailyAffirmation, setDailyAffirmation] = useState('')
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const timeOfDay = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅 Buenos días'
    if (hour < 18) return '☀️ Buenas tardes'
    return '🌙 Buenas noches'
  })()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_rituals')
        .select('*')
        .eq('date', today)
        .single()

      if (error) {
        const { data: newData } = await supabase
          .from('daily_rituals')
          .insert({ date: today })
          .select()
          .single()
        setRitualsState(newData || {})
      } else {
        setRitualsState(data || {})
      }

      const stored = JSON.parse(localStorage.getItem('gratitudes') || '[]')
      setSavedGratitudes(stored)
      
      // Selección de afirmación del día
      const affirmationIndex = new Date().getDate() % affirmations.length
      setDailyAffirmation(affirmations[affirmationIndex])
      
      setLoading(false)
    }

    fetchData()
  }, [today])

  const handleToggle = async (key: string) => {
    const updated = { ...ritualsState, [key]: !ritualsState[key] }
    setRitualsState(updated)
    await supabase.from('daily_rituals').update({ [key]: updated[key] }).eq('date', today)
    
    // Abrir modal de gratitud si se selecciona el ritual de agradecer
    if (key === 'agradecer' && !ritualsState[key]) {
      setShowGratitudeModal(true)
    }
  }

  const handleMoodChange = async (mood: string) => {
    setSelectedMood(mood)
    const updated = { ...ritualsState, mood }
    setRitualsState(updated)
    await supabase.from('daily_rituals').update({ mood }).eq('date', today)
  }

  const handleSaveGratitude = () => {
    if (!gratitude.trim()) return
    const updated = [...savedGratitudes, gratitude]
    localStorage.setItem('gratitudes', JSON.stringify(updated))
    setSavedGratitudes(updated)
    setGratitude('')
    setShowGratitudeModal(false)
  }

  const completedRituals = rituals.filter(r => ritualsState[r.key]).length
  const progress = (completedRituals / rituals.length) * 100

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-gray-800">{timeOfDay}, Miguel</h1>
            <p className="text-sm text-gray-500 mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progreso del día</span>
            <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-indigo-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Rituals Grid */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {rituals.map((ritual) => (
            <motion.div
              key={ritual.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${
                ritualsState[ritual.key] ? 'bg-indigo-100 border-indigo-300' : 'bg-white'
              } rounded-2xl p-4 border border-gray-200 shadow-sm cursor-pointer transition-colors`}
              onClick={() => handleToggle(ritual.key)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ritualEmojis[ritual.key as keyof typeof ritualEmojis]}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{ritual.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{ritual.description}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  ritualsState[ritual.key] ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                  {ritualsState[ritual.key] && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mood Section */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">¿Cómo te sientes hoy?</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(moodIcons).map(([mood, data]) => (
              <motion.div
                key={mood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl cursor-pointer text-center ${
                  selectedMood === mood
                    ? `${data.color} text-white`
                    : 'bg-gray-100 text-gray-800'
                }`}
                onClick={() => handleMoodChange(mood)}
              >
                <span className="text-2xl block mb-1">{data.icon}</span>
                <span className="text-xs font-medium">{mood.split(' ')[1]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Affirmation */}
      <div className="max-w-md mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">✨</span>
            <h3 className="font-semibold">Afirmación del día</h3>
          </div>
          <p className="text-lg italic">{dailyAffirmation}</p>
        </motion.div>
      </div>

      {/* Gratitude Modal */}
      <AnimatePresence>
        {showGratitudeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowGratitudeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Hoy agradezco por...</h3>
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Escribe aquí tus agradecimientos del día..."
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowGratitudeModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGratitude}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
              
              {savedGratitudes.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Agradecimientos anteriores</h4>
                  <p className="text-sm text-gray-500 italic">
                    "{savedGratitudes[savedGratitudes.length - 1]}"
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent">
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
            onClick={() => alert('¡Felicitaciones! Has comenzado tu día con intención ✨')}
          >
            {completedRituals === rituals.length
              ? '🎉 ¡Ritual completado!'
              : `✨ ${completedRituals}/${rituals.length} rituales completados`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}