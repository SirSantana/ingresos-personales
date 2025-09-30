import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'


export default function ProgressBarRituals({ progress=40 }) {
  const router = useRouter()
  return (
    <div onClick={() => router.push('/daily-rituals')} className="max-w-md mx-auto  py-6"> {/* Ajuste de padding vertical */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100"> {/* Tarjeta mejorada con borde y sombra */}

        <div className="flex justify-between items-center mb-3"> {/* Ajuste de margen inferior */}
          {/* Título del progreso */}
          <span className="text-sm font-medium text-gray-700">Progreso del día</span> {/* Texto ligeramente más oscuro */}
          {/* Porcentaje del progreso - Destacado */}
          <span className="text-base font-bold text-indigo-700">{Math.round(progress)}%</span> {/* Porcentaje más grande y negrita */}
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden"> {/* Fondo de la barra, redondeada, altura, ocultar desbordamiento */}
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-inner" // Relleno con gradiente, sombra interna
            initial={{ width: 0 }} // Empieza sin ancho
            animate={{ width: `${progress}%` }} // Anima al ancho del progreso
            transition={{ duration: 0.6, ease: "easeOut" }} // Duración y tipo de transición
          />
        </div>

      </div>
    </div>

  )
}