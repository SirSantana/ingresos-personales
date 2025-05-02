'use client'
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Home, BarChart, GitCommit, Zap, Target, ChevronRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Definición de tipos
type CategoryType = 'Ingresos' | 'Ciclos' | 'Rituales' | 'Metas';

// Componentes de iconos dinámicos
const iconComponents = {
  BarChart: BarChart,
  GitCommit: GitCommit,
  Zap: Zap,
  Target: Target
};

interface CardData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  progress: number;
  icon: keyof typeof iconComponents;
  gradientFrom: string;
  gradientTo: string;
}

// Componente principal
export default function ComponentDashboard() {
  // Estado para categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Ingresos');
  const router = useRouter();
  // Referencia para el contenedor del slider
  const sliderRef = useRef<HTMLDivElement>(null);

  // Datos de las categorías
  const categories: CategoryType[] = ['Ingresos', 'Ciclos', 'Rituales', 'Metas'];

  // Datos de las cards para cada categoría
  const cardData: Record<CategoryType, CardData[]> = {
    'Ingresos': [
      {
        id: 1,
        title: 'Salario',
        subtitle: '$5,250',
        description: 'Ingreso principal mensual',
        progress: 85,
        icon: 'BarChart',
        gradientFrom: 'from-blue-400',
        gradientTo: 'to-indigo-600'
      },
      {
        id: 2,
        title: 'Inversiones',
        subtitle: '$1,850',
        description: 'Rendimientos trimestrales',
        progress: 62,
        icon: 'BarChart',
        gradientFrom: 'from-purple-400',
        gradientTo: 'to-pink-600'
      },
      {
        id: 3,
        title: 'Freelance',
        subtitle: '$3,200',
        description: 'Proyectos extras',
        progress: 78,
        icon: 'BarChart',
        gradientFrom: 'from-sky-400',
        gradientTo: 'to-cyan-600'
      },
    ],
    'Ciclos': [
      {
        id: 1,
        title: 'Sueño',
        subtitle: '7.5h',
        description: 'Ciclo de descanso diario',
        progress: 75,
        icon: 'GitCommit',
        gradientFrom: 'from-indigo-400',
        gradientTo: 'to-violet-600'
      },
      {
        id: 2,
        title: 'Productividad',
        subtitle: '5h',
        description: 'Trabajo enfocado diario',
        progress: 65,
        icon: 'GitCommit',
        gradientFrom: 'from-emerald-400',
        gradientTo: 'to-teal-600'
      },
      {
        id: 3,
        title: 'Ejercicio',
        subtitle: '45min',
        description: '5 veces por semana',
        progress: 50,
        icon: 'GitCommit',
        gradientFrom: 'from-orange-400',
        gradientTo: 'to-amber-600'
      },
    ],
    'Rituales': [
      {
        id: 1,
        title: 'Meditación',
        subtitle: '20min',
        description: 'Práctica matutina',
        progress: 90,
        icon: 'Zap',
        gradientFrom: 'from-rose-400',
        gradientTo: 'to-red-600'
      },
      {
        id: 2,
        title: 'Journaling',
        subtitle: '15min',
        description: 'Reflexión diaria',
        progress: 80,
        icon: 'Zap',
        gradientFrom: 'from-fuchsia-400',
        gradientTo: 'to-pink-600'
      },
      {
        id: 3,
        title: 'Lectura',
        subtitle: '45min',
        description: 'Antes de dormir',
        progress: 70,
        icon: 'Zap',
        gradientFrom: 'from-blue-400',
        gradientTo: 'to-indigo-600'
      },
    ],
    'Metas': [
      {
        id: 1,
        title: 'Ahorro',
        subtitle: '$25,000',
        description: 'Meta anual',
        progress: 45,
        icon: 'Target',
        gradientFrom: 'from-green-400',
        gradientTo: 'to-emerald-600'
      },
      {
        id: 2,
        title: 'Desarrollo',
        subtitle: 'App Personal',
        description: 'Proyecto Q2',
        progress: 65,
        icon: 'Target',
        gradientFrom: 'from-cyan-400',
        gradientTo: 'to-blue-600'
      },
      {
        id: 3,
        title: 'Fitness',
        subtitle: 'Maratón',
        description: 'Noviembre 2025',
        progress: 30,
        icon: 'Target',
        gradientFrom: 'from-amber-400',
        gradientTo: 'to-orange-600'
      },
    ],
  };

  // Determinar el ícono correspondiente para cada categoría
  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'Ingresos': return <BarChart className="w-5 h-5" />;
      case 'Ciclos': return <GitCommit className="w-5 h-5" />;
      case 'Rituales': return <Zap className="w-5 h-5" />;
      case 'Metas': return <Target className="w-5 h-5" />;
      default: return <BarChart className="w-5 h-5" />;
    }
  };

  // Animación para el slider de categorías
  const categoryVariants = {
    active: {
      scale: 1.05,
      backgroundColor: '#111827',
      color: '#ffffff',
      transition: { duration: 0.2 }
    },
    inactive: {
      scale: 1,
      backgroundColor: 'rgba(243, 244, 246, 1)',
      color: '#4B5563',
      transition: { duration: 0.2 }
    }
  };

  // Animación para las cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen overflow-hidden">
      {/* Header con efecto de glassmorphism */}
      <div className="relative pt-12 px-6 pb-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl"></div>

        <div className="relative flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hola Lito, Tu Puedes!</h1>
            <p className="text-gray-200 text-sm mt-1">{new Date().toLocaleDateString()}</p>
          </div>
          
        </div>

        <div className="absolute -bottom-0 left-0 right-0 h-6 bg-gray-50 rounded-t-3xl"></div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 pt-8 pb-24">
        {/* Selector de categorías */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Categorías</h2>
          <div className="flex space-x-3 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap"
                variants={categoryVariants}
                animate={selectedCategory === category ? "active" : "inactive"}
                whileTap={{ scale: 0.97 }}
              >
                {getCategoryIcon(category)}
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Título de la sección */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{selectedCategory}</h2>
          <button className="text-sm text-blue-600 font-medium flex items-center">
            Ver todo
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        {/* Slider de Cards */}
        <div ref={sliderRef} className="overflow-x-auto hide-scrollbar -mx-1 px-1">
          <div className="flex space-x-4 py-2">
            {cardData[selectedCategory]?.map((card, index) => {
              const IconComponent = iconComponents[card.icon as keyof typeof iconComponents];

              return (
                <motion.div
                  key={card.id}
                  className="flex-shrink-0 w-64 rounded-2xl overflow-hidden shadow-sm"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Card */}
                  <div className="relative h-full">
                    {/* Fondo con gradiente */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}`} />

                    {/* Patrones decorativos */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white transform translate-x-[-50%] translate-y-[-50%]"></div>
                      <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-white transform translate-x-[30%] translate-y-[30%]"></div>
                    </div>

                    {/* Contenido */}
                    <div className="relative p-5 h-52 flex flex-col justify-between">
                      {/* Icono superior */}
                      <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl w-fit">
                        {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                      </div>

                      {/* Información */}
                      <div className="mt-auto">
                        <h3 className="text-white font-semibold text-lg">{card.title}</h3>
                        <p className="text-white text-2xl font-bold">{card.subtitle}</p>
                        <p className="text-white/80 text-sm mt-1">{card.description}</p>

                        {/* Barra de progreso */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-white/90 mb-1">
                            <span>Progreso</span>
                            <span>{card.progress}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-1.5">
                            <div
                              className="bg-white h-1.5 rounded-full"
                              style={{ width: `${card.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas resumidas */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Total Ingresos</span>
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <BarChart size={16} className="text-green-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-800">$10,300</p>
              <p className="text-green-600 text-xs flex items-center mt-1">
                <span>↑ 12.5%</span>
                <span className="text-gray-500 ml-1">vs. mes anterior</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Metas Cumplidas</span>
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <Target size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-800">4 de 7</p>
              <p className="text-blue-600 text-xs flex items-center mt-1">
                <span>57%</span>
                <span className="text-gray-500 ml-1">completado</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center py-4 px-6">
            <motion.button
              className="flex flex-col items-center"
              whileTap={{ scale: 0.9 }}
            >
              <div className="p-2 bg-blue-50 rounded-xl">
                <Home size={20} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 mt-1">Inicio</span>
            </motion.button>

            <motion.button
              className="flex flex-col items-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('dashboard')}
            >
              <div className="p-2 bg-gray-100 rounded-xl">
                <BarChart size={20} className="text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 mt-1">Ingresos</span>
            </motion.button>

            <motion.button
              className="flex flex-col items-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('ciclos')}
            >
              <div className="p-2 bg-gray-100 rounded-xl">
                <GitCommit size={20} className="text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 mt-1">Ciclos</span>
            </motion.button>

            <motion.button
              className="flex flex-col items-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('goals')}
            >
              <div className="p-2 bg-gray-100 rounded-xl">
                <Target size={20} className="text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 mt-1">Metas</span>
            </motion.button>
            <motion.button
              className="flex flex-col items-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('daily-rituals')}
            >
              <div className="p-2 bg-gray-100 rounded-xl">
                <Target size={20} className="text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 mt-1">Daily Rituals</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}