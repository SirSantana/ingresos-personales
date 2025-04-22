'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Calendar, Target, Type, Hash, CheckSquare, X, Save, Clock } from 'lucide-react'

export default function NewWeeklyGoalModal({
  isOpen,
  onClose,
  cycleId,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  cycleId: string
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [week, setWeek] = useState(1)
  const [type, setType] = useState<'quantitative' | 'boolean'>('quantitative')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!title || !week) return
    setLoading(true)

    const { error } = await supabase.from('weekly_goals').insert({
      cycle_id: cycleId,
      title,
      week_number: week,
      type,
      target_value: type === 'quantitative' ? parseFloat(value) : null,
      unit: type === 'quantitative' ? unit : null,
    })

    setLoading(false)

    if (!error) {
      onCreated()
      setTitle('')
      setWeek(1)
      setValue('')
      setUnit('')
    } else {
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="bg-white rounded-2xl w-full max-w-md shadow-xl border-0 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 flex items-center justify-between border-b border-blue-100">
            <Dialog.Title className="text-xl font-semibold text-blue-800 flex items-center gap-2">
              <Target size={20} className="text-blue-600" />
              <span>Nueva Meta Semanal</span>
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="rounded-full p-1.5 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X size={18} className="text-blue-700" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Type size={16} />
                  <span>Título</span>
                </label>
                <input
                style={{color:'black'}}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Escribe el título de tu meta"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar size={16} />
                  <span>Semana</span>
                </label>
                <div className="relative">
                  <select
                  style={{color:'black'}}
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="w-full appearance-none border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Semana {i + 1}
                      </option>
                    ))}
                  </select>
                  <Clock size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <CheckSquare size={16} />
                  <span>Tipo</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType('quantitative')}
                    className={`flex-1 py-2.5 px-3 rounded-lg border ${
                      type === 'quantitative' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cuantitativa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('boolean')}
                    className={`flex-1 py-2.5 px-3 rounded-lg border ${
                      type === 'boolean' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Sí / No
                  </button>
                </div>
              </div>

              {type === 'quantitative' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <Target size={16} />
                      <span>Valor meta</span>
                    </label>
                    <input
                    style={{color:'black'}}
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Ej: 10"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <Hash size={16} />
                      <span>Unidad</span>
                    </label>
                    <input
                    style={{color:'black'}}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Ej: km, horas, páginas..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}