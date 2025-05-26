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
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import NewExpenseModal from './NewExpenseModal'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Gastos del Mes
            </h1>
            <p className="text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(), 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Nuevo Gasto
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Spent Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <Wallet className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Gastado</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatCurrency(total, 'COP')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <TrendingDown className="h-4 w-4" />
                  {expenses.length} transacciones este mes
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Filter className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Categorías</p>
                <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
              </div>
            </div>
            
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Quitar filtro
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        {byCategory.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Por Categoría</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-shadow duration-200">
          <div className="p-6 border-b border-slate-200/60">
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedCategory ? `Gastos en ${selectedCategory}` : 'Todos los Gastos'}
            </h2>
            {selectedCategory && (
              <p className="text-sm text-slate-500 mt-1">
                {filteredExpenses.length} de {expenses.length} gastos
              </p>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500">Cargando gastos...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg mb-2">
                  {selectedCategory ? `No hay gastos en ${selectedCategory}` : 'No hay gastos registrados'}
                </p>
                <p className="text-slate-400 text-sm">
                  {selectedCategory ? 'Intenta con otra categoría' : 'Agrega tu primer gasto para comenzar'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-slate-900 mb-1">
                          {expense.title}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>{format(new Date(expense.date), 'dd MMM yyyy', { locale: es })}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="capitalize">{expense.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-lg">
                        {formatCurrency(expense.amount, 'COP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
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