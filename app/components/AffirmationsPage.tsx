'use client'

import { useState } from 'react'
import { Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

const affirmations = [
  "Mi mente es poderosa y capaz de lograr cualquier cosa que me proponga",
  "Cada día desarrollo más fortaleza mental y confianza en mis habilidades",
  "Mi enfoque es inquebrantable cuando me concentro en mis objetivos",
  "Confío plenamente en mi capacidad para superar cualquier obstáculo",
  "Mi mente está programada para el éxito y la abundancia",
  "Soy el arquitecto de mi propio destino y construyo mi futuro con determinación",
  "Mi potencial es ilimitado y cada día lo descubro más",
  "Transformo los desafíos en oportunidades de crecimiento",
  "Mi disciplina mental me lleva exactamente donde quiero estar",
  "Soy más fuerte de lo que creo y más capaz de lo que imagino",
  "Mi concentración mejora constantemente y logro mis metas con facilidad",
  "Creo firmemente en mi poder interior y en mi capacidad de crear mi realidad",
  "Cada pensamiento que elijo me acerca más a mis sueños",
  "Mi mente es clara, enfocada y resiliente ante cualquier situación",
  "Atraigo el éxito porque mi mentalidad está alineada con mis objetivos"
]

const gratitudes = [
  "Agradezco por la fortaleza mental que me permite enfrentar cada día",
  "Doy gracias por mi capacidad de aprender y crecer constantemente",
  "Agradezco por la claridad mental que guía mis decisiones",
  "Doy gracias por mi disciplina y determinación inquebrantables",
  "Agradezco por cada desafío que fortalece mi carácter",
  "Doy gracias por mi mente resiliente que encuentra soluciones",
  "Agradezco por la sabiduría que desarrollo con cada experiencia",
  "Doy gracias por mi capacidad de mantener el enfoque en lo importante",
  "Agradezco por la energía mental que me impulsa hacia adelante",
  "Doy gracias por mi habilidad de transformar pensamientos en realidad",
  "Agradezco por la confianza que tengo en mi proceso de crecimiento",
  "Doy gracias por mi mente abierta que abraza nuevas posibilidades",
  "Agradezco por la paz mental que cultivo cada día",
  "Doy gracias por mi perseverancia que nunca me deja rendirme",
  "Agradezco por el poder de mi mente para crear la vida que deseo"
]

export default function AffirmationsPage() {
  const [activeTab, setActiveTab] = useState<'affirmation' | 'gratitude'>('affirmation')
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentList = activeTab === 'affirmation' ? affirmations : gratitudes

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : currentList.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev < currentList.length - 1 ? prev + 1 : 0))
  }

  const handleRandom = () => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * currentList.length)
    } while (newIndex === currentIndex && currentList.length > 1)
    setCurrentIndex(newIndex)
  }

  return (
    <div className="min-h-screen w-full px-6 py-12 flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-6">
            Poder Mental
          </h1>
          
          {/* ✅ Responsive Tab Selector */}
          <div
            className="
              flex sm:inline-flex items-center gap-2 p-1 bg-gray-100 rounded-2xl
              overflow-x-auto sm:overflow-visible scrollbar-hide
              snap-x snap-mandatory
            "
          >
            <button
              onClick={() => {
                setActiveTab('affirmation')
                setCurrentIndex(0)
              }}
              className={`flex-shrink-0 snap-center px-6 py-2.5 rounded-xl text-sm font-normal transition-all ${
                activeTab === 'affirmation'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Afirmaciones
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('gratitude')
                setCurrentIndex(0)
              }}
              className={`flex-shrink-0 snap-center px-6 py-2.5 rounded-xl text-sm font-normal transition-all ${
                activeTab === 'gratitude'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" strokeWidth={1.5} />
                Agradecimientos
              </div>
            </button>
          </div>
        </div>

        {/* Current Entry Display */}
        <div className="mb-16">
          <div className="relative">
            {/* Navigation Arrows - Hidden on mobile */}
            <button
              onClick={handlePrevious}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </button>

            {/* Entry Card */}
            <div className="text-center py-16 px-4">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 leading-relaxed">
                "{currentList[currentIndex]}"
              </p>
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center justify-center gap-4 mb-8">
              <button
                onClick={handlePrevious}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2">
              {currentList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-gray-900'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Random Button */}
        <div className="text-center">
          <button
            onClick={handleRandom}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-normal text-sm hover:bg-gray-800 transition-all"
          >
            Sorpréndeme
          </button>
        </div>

        {/* Counter */}
        <div className="text-center mt-12">
          <p className="text-sm font-normal text-gray-400">
            {currentIndex + 1} de {currentList.length}
          </p>
        </div>
      </div>
    </div>
  )
}
