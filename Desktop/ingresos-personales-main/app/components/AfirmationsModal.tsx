'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Array de afirmaciones
const affirmations = [
  {
    affirmation: "Estoy en el camino correcto y cada paso me acerca a mis metas.",
    action: "Coloca tu mano en el corazón y repite 3 veces",
    emoji: "💖"
  },
  {
    affirmation: "Soy merecedor de todo lo bueno que la vida tiene para ofrecerme.",
    action: "Toma una respiración profunda y dilo con convicción",
    emoji: "✨"
  },
  {
    affirmation: "Mi trabajo y dedicación crean abundancia en mi vida.",
    action: "Sonríe mientras repites esta afirmación",
    emoji: "💰"
  },
  {
    affirmation: "Confío en el proceso de la vida y sé que todo está trabajando a mi favor.",
    action: "Cierra los ojos y visualiza mientras lo dices",
    emoji: "🌟"
  },
  {
    affirmation: "Cada día soy más fuerte, más sabio y más capaz.",
    action: "Ponte de pie si es posible y dilo con fuerza",
    emoji: "💪"
  },
  {
    affirmation: "Mi gratitud atrae más razones para estar agradecido.",
    action: "Lleva ambas manos al pecho mientras lo dices",
    emoji: "🙏"
  },
  {
    affirmation: "Libero el miedo y abrazo la confianza en todas las áreas de mi vida.",
    action: "Inhala profundo y suéltalo mientras lo repites",
    emoji: "🌊"
  },
  {
    affirmation: "Soy un imán para las oportunidades y el éxito.",
    action: "Levanta los brazos y sonríe mientras lo afirmas",
    emoji: "🧲"
  },
  {
    affirmation: "Mi intuición me guía hacia las decisiones correctas.",
    action: "Cierra los ojos y confía mientras lo expresas",
    emoji: "🧭"
  },
  {
    affirmation: "Soy la mejor versión de mí mismo en cada momento.",
    action: "Mírate al espejo o imagínate haciéndolo",
    emoji: "🌈"
  }
]

export default function AffirmationsModal({ onClose }: { onClose: () => void }) {
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Cambiar la afirmación cada 10 segundos
    const affirmationInterval = setInterval(() => {
      setCurrentAffirmationIndex((prevIndex) => 
        prevIndex === affirmations.length - 1 ? 0 : prevIndex + 1
      )
    }, 10000)

    // Auto-navegación después de 1 minuto
    const navigationTimer = setTimeout(() => handleClose(), 60000)

    return () => {
      clearInterval(affirmationInterval)
      clearTimeout(navigationTimer)
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 300)  // Navegar después de la animación
  }

  const currentAffirmation = affirmations[currentAffirmationIndex]

  // Función para habilitar audio/micrófono
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    // Aquí podrías añadir lógica para activar el micrófono o reproducir audio
  }

  return (
    <AnimatePresence mode='wait'>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md m-4 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200" />
              <div className="absolute inset-0" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234f46e5' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")"
              }} />
            </div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Título */}

              {/* Emoji con animación flotante */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentAffirmationIndex}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -10, 0] // Animación de flotación
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.5 },
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="text-6xl mb-6"
                >
                  {currentAffirmation.emoji}
                </motion.div>
              </AnimatePresence>

              {/* Afirmación */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentAffirmationIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    "{currentAffirmation.affirmation}"
                  </h3>
                  <p className="text-indigo-600 font-medium">
                    {currentAffirmation.action}
                  </p>
                </motion.div>
              </AnimatePresence>

           

              {/* Button */}
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleClose}
              >
                Continuar con mi día
              </motion.button> */}

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                {affirmations.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentAffirmationIndex ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    animate={{
                      scale: index === currentAffirmationIndex ? 1.2 : 1
                    }}
                  />
                ))}
              </div>

              {/* Skip button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress indicator */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 60, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}