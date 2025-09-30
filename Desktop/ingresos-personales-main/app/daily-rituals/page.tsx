
'use client'
import { supabase } from '@/lib/supabaseClient'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, getDaysInMonth, startOfMonth, getDay, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import AffirmationsModal from '../components/AfirmationsModal'
import ProgressBarRituals from '../components/ProgressBarRituals'


const MonthDays = () => {
  const today = new Date()
  const currentDate = today.getDate()
  const daysInMonth = getDaysInMonth(today)
  const firstDayOfMonth = startOfMonth(today)
  const startDay = getDay(firstDayOfMonth) // 0 (Domingo) a 6 (Sábado)

  // Días de la semana abreviados
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Generar los días del mes
  const days = []
  // Espacios vacíos para los primeros días que no son del mes
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }

  // Días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-2">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Días de la semana */}
          {weekDays.map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}

          {/* Días del mes */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`py-2 rounded-full ${day === currentDate ? 'bg-indigo-100 font-bold' : ''}`}
            >
              {day ? (
                <>
                  <div className="text-sm">{day}</div>
                  {day === 11 && <div className="text-[10px] text-gray-500">Mon</div>}
                  {day === 12 && <div className="text-[10px] text-gray-500">Tue</div>}
                  {day === 13 && <div className="text-[10px] text-gray-500">Wed</div>}
                  {day === 14 && <div className="text-[10px] text-gray-500">Thu</div>}
                  {day === 15 && <div className="text-[10px] text-gray-500">Fri</div>}
                </>
              ) : (
                <div className="h-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  const [showAffirmationsModal, setShowAffirmationsModal] = useState(false)

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
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100"> {/* Subtle shadow and border */}
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center"> {/* Flex layout */}

          {/* Left Icon - Placeholder for Grid */}
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 cursor-pointer hover:border-gray-400 transition-colors duration-200">
            {/* Example Grid Icon SVG (from Heroicons) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
          </div>

          {/* Center Text: Date & Name */}
          {/* Note: The image shows Date then Name, reversing your original order */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center flex-grow px-2" // Centered text block, allow it to grow
          >
            {/* Date - Primary text */}
            <p className="text-base sm:text-lg font-semibold text-gray-800">
              {/* Format date like the image: Day, DD Mon YY (using es locale) */}
              {format(new Date(), "EEEE, dd MMM yy", { locale: es })}
            </p>
            {/* Name - Secondary text */}
            {/* Using 'Miguel' from your original code */}
            <p className="text-sm text-gray-500 mt-0.5">
              Miguel
            </p>
          </motion.div>

          {/* Right Icon - Placeholder for Notification Bell */}
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 cursor-pointer hover:border-gray-400 transition-colors duration-200">
            {/* Example Bell Icon SVG (from Heroicons) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l1.707 1.707A.5.5 0 018 14h4a.5.5 0 01.354-.146L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
        </div>
      </header>
      {/* <MonthDays /> */}

      {/* Progress Bar Section */}
      <ProgressBarRituals progress={progress} />

      {/* Rituals Grid */}
      <div className="max-w-md mx-auto px-4 py-6"> {/* Ajuste de padding vertical */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5"> {/* Ajuste de espacio entre elementos */}
          {rituals.map((ritual) => (
            <motion.div
              key={ritual.key}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }} // Sombra más pronunciada al pasar el ratón
              whileTap={{ scale: 0.98 }} // Efecto de escala al hacer clic
              // Estilos condicionales para el estado completado
              className={`${ritualsState[ritual.key]
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-400 shadow-md' // Fondo degradado claro, borde más fuerte, sombra media
                  : 'bg-white border-gray-200 shadow-sm' // Fondo blanco por defecto, borde sutil, sombra ligera
                } rounded-xl p-5 border cursor-pointer transition-all duration-200 ease-in-out transform`} // Bordes redondeados, padding, borde, cursor, transición y transform
              onClick={() => handleToggle(ritual.key)}
            >
              <div className="flex items-center justify-between gap-4"> {/* Contenedor flexible para emoji, texto y estado */}

                {/* Emoji */}
                <span className="text-3xl flex-shrink-0">{ritualEmojis[ritual.key as keyof typeof ritualEmojis]}</span> {/* Emoji más grande, no se encoge */}

                {/* Texto: Etiqueta y Descripción */}
                <div className="flex-grow pr-4"> {/* Permite que el bloque de texto crezca, añade padding a la derecha */}
                  <h3 className={`font-semibold text-gray-800 text-base sm:text-lg ${ritualsState[ritual.key] ? 'text-indigo-800' : ''}`}> {/* Etiqueta más grande, color cambia al completar */}
                    {ritual.label}
                  </h3>
                  <p className={`text-sm text-gray-600 mt-1 ${ritualsState[ritual.key] ? 'text-indigo-700' : ''}`}> {/* Descripción ligeramente más grande, color cambia al completar */}
                    {ritual.description}
                  </p>
                </div>

                {/* Indicador de Estado (Checkbox) */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ // Tamaño fijo, no se encoge
                  ritualsState[ritual.key]
                    ? 'bg-indigo-600 border-indigo-600' // Fondo sólido y borde del mismo color al completar
                    : 'bg-gray-300 border-gray-300' // Fondo y borde gris por defecto
                  } border-2 transition-colors duration-200`}> {/* Borde de 2px, transición de colores */}
                  {ritualsState[ritual.key] && (
                    <motion.svg
                      initial={{ scale: 0.5, opacity: 0 }} // Empieza más pequeño e invisible
                      animate={{ scale: 1, opacity: 1 }} // Anima a tamaño completo y visible
                      transition={{ type: "spring", stiffness: 500, damping: 30 }} // Animación tipo "spring"
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /> {/* Trazo del checkmark más grueso */}
                    </motion.svg>
                  )}
                </div>
              </div>
              {/* Se eliminó el div antiguo del checkbox en la parte inferior */}
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
                className={`p-3 rounded-xl cursor-pointer text-center ${selectedMood === mood
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
      <div onClick={() => setShowAffirmationsModal(true)} className="max-w-md mx-auto px-4 py-4">
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
      {showAffirmationsModal && <AffirmationsModal onClose={() => setShowAffirmationsModal(false)} />}
    </div>
  )
}