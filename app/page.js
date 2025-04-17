'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GoToDailyRituals from './components/GoToDailyRituals'
import { useRouter } from 'next/navigation'
export default function SplashScreen() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [dailyModal, setDailyModal] = useState(false)
  const router = useRouter()
  useEffect(() => {
    // Simular una carga de 3 segundos
    const timer = setTimeout(() => {
      setDailyModal(true) 
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  // Animación de hojas flotantes
  const FloatingLeaf = ({ delay, initialPosition }) => (
    <motion.div
      initial={{ opacity: 0, y: 0, x: initialPosition.x, rotate: initialPosition.rotate }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: [0, 30, 60, 90],
        x: [initialPosition.x, initialPosition.x + 10, initialPosition.x - 10, initialPosition.x],
        rotate: [initialPosition.rotate, initialPosition.rotate + 15, initialPosition.rotate - 15, initialPosition.rotate + 30],
      }}
      transition={{ 
        duration: 3,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 1
      }}
      className="absolute text-4xl"
    >
      🍂
    </motion.div>
  )

  // Animación de notas musicales
  const MusicNote = ({ delay, initialPosition }) => (
    <motion.div
      initial={{ opacity: 0, y: 0, x: initialPosition.x }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: [0, -40],
        x: [initialPosition.x, initialPosition.x + Math.random() * 10 - 5],
      }}
      transition={{ 
        duration: 2,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 2
      }}
      className="absolute text-2xl"
    >
      ♪
    </motion.div>
  )

  // Animación de estrellas
  const Star = ({ delay, position }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{ 
        duration: 1.5,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 3
      }}
      className="absolute text-yellow-400 text-xl"
      style={position}
    >
      ⭐
    </motion.div>
  )

  // Posiciones iniciales de las hojas
  const leafPositions = [
    { x: '10%', y: '20%', rotate: 0 },
    { x: '30%', y: '10%', rotate: 45 },
    { x: '60%', y: '15%', rotate: -30 },
    { x: '80%', y: '25%', rotate: 60 },
    { x: '20%', y: '70%', rotate: -45 },
    { x: '70%', y: '75%', rotate: 30 },
  ]

  // Posiciones iniciales de las notas musicales
  const musicPositions = [
    { x: '15%', y: '60%' },
    { x: '40%', y: '65%' },
    { x: '65%', y: '55%' },
    { x: '85%', y: '60%' },
  ]

  // Posiciones de las estrellas
  const starPositions = [
    { left: '25%', top: '30%' },
    { left: '40%', top: '15%' },
    { left: '60%', top: '25%' },
    { left: '75%', top: '20%' },
    { left: '30%', top: '40%' },
    { left: '70%', top: '35%' },
  ]

  if (isLoaded) {
    // Aquí puedes redirigir a la página principal o renderizar el contenido principal
    return <div>Contenido principal</div>
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Hojas flotantes */}
      {leafPositions.map((position, index) => (
        <FloatingLeaf 
          key={`leaf-${index}`} 
          delay={index * 0.5} 
          initialPosition={{ x: position.x, rotate: position.rotate }}
        />
      ))}

      {/* Notas musicales */}
      {musicPositions.map((position, index) => (
        <MusicNote 
          key={`note-${index}`} 
          delay={index * 0.7} 
          initialPosition={{ x: position.x }}
        />
      ))}

      {/* Estrellas */}
      {starPositions.map((position, index) => (
        <Star 
          key={`star-${index}`} 
          delay={index * 0.6} 
          position={position}
        />
      ))}

      {/* Contenedor principal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-8 w-[320px] shadow-xl relative z-10"
      >
        {/* Personaje meditando */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="text-8xl">🧘‍♀️</div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold text-purple-900 text-center mb-2"
        >
          Tu puedes Lito⚽
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-gray-600 text-center mb-10"
        >
          Jamas se de por vencido, jamas.
        </motion.p>

        {/* Botón de Get Started */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          onClick={() => setDailyModal(true)}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Vamos con toda
        </motion.button>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          onClick={() => router.push('dashboard')}
          className="w-full text-orange-400 py-4 "
        >
          Ver Ingresos
        </motion.button>
      </motion.div>
      {dailyModal && <GoToDailyRituals />}
    </div>
  )
}