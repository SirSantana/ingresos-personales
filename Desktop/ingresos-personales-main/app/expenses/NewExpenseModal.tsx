'use client'

import { Dialog, Transition, Listbox } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, 
  X, 
  DollarSign, 
  Tag, 
  Calendar,
  FileText,
  Check,
  ChevronsUpDown,
  AlertCircle
} from 'lucide-react'

const PREDEFINED_CATEGORIES = [
  { id: 'alimentacion', name: 'Alimentación', icon: '🍽️' },
  { id: 'transporte', name: 'Transporte', icon: '🚗' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎬' },
  { id: 'deporte', name: 'Deporte', icon: '⚽' },
  {id:'tecnologia', name: 'Tecnología', icon: '💻'},
  { id: 'salud', name: 'Salud', icon: '🏥' },
  { id: 'educacion', name: 'Educación', icon: '📚' },
  { id: 'hogar', name: 'Hogar', icon: '🏠' },
  { id: 'ropa', name: 'Ropa', icon: '👕' },
  { id: 'servicios', name: 'Servicios', icon: '💡' },
  { id: 'otros', name: 'Otros', icon: '📦' },
]

export default function NewExpenseModal({ isOpen, onClose, onCreated }: {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(PREDEFINED_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!title.trim()) newErrors.title = 'La descripción es requerida'
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0'
    if (useCustomCategory && !customCategory.trim()) newErrors.category = 'La categoría es requerida'
    if (!date) newErrors.date = 'La fecha es requerida'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    const categoryValue = useCustomCategory ? customCategory.trim() : selectedCategory.name
    
    const { error } = await supabase.from('expenses').insert({
      title: title.trim(),
      amount: parseFloat(amount),
      category: categoryValue,
      date,
      notes: notes.trim()
    })
    
    setLoading(false)
    
    if (!error) {
      // Reset form
      setTitle('')
      setAmount('')
      setSelectedCategory(PREDEFINED_CATEGORIES[0])
      setCustomCategory('')
      setUseCustomCategory(false)
      setNotes('')
      setErrors({})
      onCreated()
    } else {
      alert('Error al guardar el gasto')
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTitle('')
      setAmount('')
      setSelectedCategory(PREDEFINED_CATEGORIES[0])
      setCustomCategory('')
      setUseCustomCategory(false)
      setNotes('')
      setErrors({})
      onClose()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-slate-900 mb-1">
                      Nuevo Gasto
                    </Dialog.Title>
                    <p className="text-sm text-slate-500">
                      Registra un nuevo gasto en tu presupuesto
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
                    disabled={loading}
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4" />
                      Descripción
                    </label>
                    <input
                    style={{color: 'black'}}
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.title 
                          ? 'border-red-300 bg-red-50 focus:border-red-400' 
                          : 'border-slate-200 focus:border-blue-400'
                      }`}
                      placeholder="Ej: Almuerzo en restaurante"
                    />
                    {errors.title && (
                      <p className="flex items-center gap-2 text-sm text-red-600 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Amount Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Monto
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                        $
                      </span>
                      <input
                      style={{color: 'black'}}
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value)
                          if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }))
                        }}
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          errors.amount 
                            ? 'border-red-300 bg-red-50 focus:border-red-400' 
                            : 'border-slate-200 focus:border-blue-400'
                        }`}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.amount && (
                      <p className="flex items-center gap-2 text-sm text-red-600 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Category Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Tag className="w-4 h-4" />
                      Categoría
                    </label>
                    
                    <div className="space-y-3">
                     

                      {!useCustomCategory && (
                        <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                          <div className="relative">
                            <Listbox.Button style={{color: 'black'}} className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200">
                              <span className="flex items-center gap-3">
                                <span className="text-lg">{selectedCategory.icon}</span>
                                <span className="block truncate">{selectedCategory.name}</span>
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronsUpDown className="h-5 w-5 text-slate-400" />
                              </span>
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200">
                              {PREDEFINED_CATEGORIES.map((category) => (
                                <Listbox.Option
                                  key={category.id}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-3 pl-4 pr-10 ${
                                      active ? 'bg-blue-50 text-blue-900' : 'text-slate-900'
                                    }`
                                  }
                                  value={category}
                                >
                                  {({ selected }) => (
                                    <>
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg">{category.icon}</span>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {category.name}
                                        </span>
                                      </div>
                                      {selected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                                          <Check className="h-5 w-5" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </div>
                        </Listbox>
                      )}

                      

                      {errors.category && (
                        <p className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Fecha
                    </label>
                    <input
                    style={{color: 'black'}}
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value)
                        if (errors.date) setErrors(prev => ({ ...prev, date: '' }))
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        errors.date 
                          ? 'border-red-300 bg-red-50 focus:border-red-400' 
                          : 'border-slate-200 focus:border-blue-400'
                      }`}
                    />
                    {errors.date && (
                      <p className="flex items-center gap-2 text-sm text-red-600 mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Notes Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4" />
                      Notas (opcional)
                    </label>
                    <textarea
                    style={{color: 'black'}}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200 resize-none"
                      rows={3}
                      placeholder="Información adicional sobre el gasto..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2 min-w-[120px] justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Gasto'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}