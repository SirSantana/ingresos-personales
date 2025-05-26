'use client'

import { useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/utils/formatCurrency'
import { 
  Loader2, 
  Plus, 
  Wallet, 
  TrendingDown, 
  Calendar,
  Filter,
  ChevronRight,
  X,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Fragment } from 'react'
import NewExpenseModal from './NewExpenseModal'

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  notes?: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Estados para el modal de detalle/edición
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Estados para edición
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    notes: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startOfMonth.toISOString())
        .order('date', { ascending: false })

      if (!error) setExpenses(data || [])
      setLoading(false)
    }

    fetchExpenses()
  }, [refreshKey])

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const categories = [...new Set(expenses.map(e => e.category))]
  const byCategory = categories.map(cat => ({
    name: cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.category === cat).length
  })).sort((a, b) => b.total - a.total)

  const filteredExpenses = selectedCategory 
    ? expenses.filter(e => e.category === selectedCategory)
    : expenses

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-rose-100 text-rose-800 border-rose-200',
    ]
    return colors[index % colors.length]
  }

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setEditForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split('T')[0],
      notes: expense.notes || ''
    })
    setIsEditing(false)
    setShowDetailModal(true)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedExpense) return
    
    setSaveLoading(true)
    const { error } = await supabase
      .from('expenses')
      .update({
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date,
        notes: editForm.notes
      })
      .eq('id', selectedExpense.id)

    setSaveLoading(false)
    
    if (!error) {
      setRefreshKey(k => k + 1)
      setIsEditing(false)
      setShowDetailModal(false)
    } else {
      alert('Error al actualizar el gasto')
    }
  }

  const handleDelete = async () => {
    if (!selectedExpense) return
    
    setDeleteLoading(true)
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', selectedExpense.id)

    setDeleteLoading(false)
    
    if (!error) {
      setRefreshKey(k => k + 1)
      setShowDetailModal(false)
      setShowDeleteModal(false)
    } else {
      alert('Error al eliminar el gasto')
    }
  }

  const closeModals = () => {
    setShowDetailModal(false)
    setShowDeleteModal(false)
    setIsEditing(false)
    setSelectedExpense(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                Gastos del Mes
              </h1>
              <p className="text-slate-600 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {format(new Date(), 'MMMM yyyy', { locale: es })}
              </p>
            </div>
            
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:block">Nuevo Gasto</span>
              <span className="block sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:mb-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Spent Card */}
          <div className="sm:col-span-2 lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-red-50 rounded-xl">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">Total Gastado</p>
                  <p className="text-xl sm:text-3xl font-bold text-slate-900">
                    {formatCurrency(total, 'COP')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{expenses.length} gastos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-50 rounded-xl">
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Categorías</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{categories.length}</p>
              </div>
            </div>
            
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 transition-colors mt-3"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                Quitar filtro
              </button>
            )}
          </div>
        </div>

        {/* Categories - Horizontal Scroll on Mobile */}
        {byCategory.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-shadow duration-200 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 border-b border-slate-200/60">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Por Categoría</h2>
            </div>
            
            {/* Mobile: Horizontal Scroll */}
            <div className="p-4 sm:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {byCategory.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )}
                    className={`flex-shrink-0 w-36 p-3 rounded-xl border-2 transition-all duration-200 text-left group ${
                      selectedCategory === category.name 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : 'hover:border-slate-300'
                    } ${getCategoryColor(index)}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize text-xs truncate">
                          {category.name}
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      
                      <div>
                        <p className="font-bold text-sm">
                          {formatCurrency(category.total, 'COP')}
                        </p>
                        <p className="text-xs opacity-75">
                          {category.count} gasto{category.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden sm:block p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {byCategory.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md ${
                      selectedCategory === category.name 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : 'hover:border-slate-300'
                    } ${getCategoryColor(index)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize text-sm">
                        {category.name}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-bold text-lg">
                        {formatCurrency(category.total, 'COP')}
                      </p>
                      <p className="text-xs opacity-75">
                        {category.count} gasto{category.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-shadow duration-200">
          <div className="p-4 sm:p-6 border-b border-slate-200/60">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              {selectedCategory ? `Gastos en ${selectedCategory}` : 'Todos los Gastos'}
            </h2>
            {selectedCategory && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {filteredExpenses.length} de {expenses.length} gastos
              </p>
            )}
          </div>

          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 text-sm">Cargando gastos...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-3 sm:p-4 bg-slate-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-base sm:text-lg mb-2">
                  {selectedCategory ? `No hay gastos en ${selectedCategory}` : 'No hay gastos registrados'}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {selectedCategory ? 'Intenta con otra categoría' : 'Agrega tu primer gasto para comenzar'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="flex items-center p-3 sm:p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group cursor-pointer active:scale-[0.98]"
                    onClick={() => handleExpenseClick(expense)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors flex-shrink-0">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      </div>
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="font-medium text-slate-900 mb-1 truncate text-sm sm:text-base">
                          {expense.title}
                        </p>
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3 text-xs sm:text-sm text-slate-500">
                          <span className="whitespace-nowrap">{format(new Date(expense.date), 'dd MMM', { locale: es })}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                          <span className="capitalize truncate">{expense.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-sm sm:text-lg whitespace-nowrap">
                          {formatCurrency(expense.amount, 'COP')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expense Detail/Edit Modal */}
        <Transition appear show={showDetailModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeModals}>
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
                    {selectedExpense && (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <Dialog.Title className="text-2xl font-bold text-slate-900 mb-1">
                              {isEditing ? 'Editar Gasto' : 'Detalle del Gasto'}
                            </Dialog.Title>
                            <p className="text-sm text-slate-500">
                              {isEditing ? 'Modifica la información del gasto' : 'Información completa del gasto'}
                            </p>
                          </div>
                          <button
                            onClick={closeModals}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
                          >
                            <X className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                          {/* Title */}
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Descripción
                            </label>
                            {isEditing ? (
                              <input
                              style={{color: 'black'}}
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200"
                              />
                            ) : (
                              <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-xl">
                                {selectedExpense.title}
                              </p>
                            )}
                          </div>

                          {/* Amount */}
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Monto
                            </label>
                            {isEditing ? (
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                  $
                                </span>
                                <input
                                 style={{color: 'black'}}
                                  type="number"
                                  value={editForm.amount}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200"
                                  step="0.01"
                                />
                              </div>
                            ) : (
                              <p className="text-slate-900 font-bold text-xl p-3 bg-slate-50 rounded-xl">
                                {formatCurrency(selectedExpense.amount, 'COP')}
                              </p>
                            )}
                          </div>

                          {/* Category */}
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Categoría
                            </label>
                            {isEditing ? (
                              <input
                               style={{color: 'black'}}
                                type="text"
                                value={editForm.category}
                                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200"
                              />
                            ) : (
                              <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-xl capitalize">
                                {selectedExpense.category}
                              </p>
                            )}
                          </div>

                          {/* Date */}
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Fecha
                            </label>
                            {isEditing ? (
                              <input
                               style={{color: 'black'}}
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200"
                              />
                            ) : (
                              <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-xl">
                                {format(new Date(selectedExpense.date), 'dd MMMM yyyy', { locale: es })}
                              </p>
                            )}
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Notas
                            </label>
                            {isEditing ? (
                              <textarea
                               style={{color: 'black'}}
                                value={editForm.notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-200 resize-none"
                                rows={3}
                              />
                            ) : (
                              <p className="text-slate-900 p-3 bg-slate-50 rounded-xl min-h-[80px]">
                                {selectedExpense.notes || 'Sin notas adicionales'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>

                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200"
                                  disabled={saveLoading}
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={handleSave}
                                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                                  disabled={saveLoading}
                                >
                                  {saveLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    'Guardar Cambios'
                                  )}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors duration-200"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Modal */}
        <Transition appear show={showDeleteModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-slate-900">
                          Eliminar Gasto
                        </Dialog.Title>
                        <p className="text-sm text-slate-500 mt-1">
                          Esta acción no se puede deshacer
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-700 mb-6">
                      ¿Estás seguro de que quieres eliminar el gasto <strong>"{selectedExpense?.title}"</strong>? 
                      Esta acción es permanente y no se puede recuperar.
                    </p>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors duration-200"
                        disabled={deleteLoading}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </>
                        )}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* New Expense Modal */}
        <NewExpenseModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setRefreshKey(k => k + 1)
            setOpen(false)
          }}
        />
      </div>
    </div>
  )
}