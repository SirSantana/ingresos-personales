'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'

type Source = {
  id: string
  name: string
}

type FormValue = {
  amount: string
  id?: string // id del income si ya existe
}

type Props = {
  date: Date
  isOpen: boolean
  onClose: () => void
  sources: Source[]
  onSave: () => void
}

export default function IncomeEditor({ date, isOpen, onClose, sources, onSave }: Props) {
  const [form, setForm] = useState<{ [key: string]: FormValue }>({})
  const [loading, setLoading] = useState(false)
  const [loadingIncomes, setLoadingIncomes] = useState(false)

  useEffect(() => {
    const fetchIncomes = async () => {
      setLoadingIncomes(true)
      const formattedDate = date.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('daily_incomes')
        .select('id, source_id, amount, created_at')
        .gte('created_at', `${formattedDate}T00:00:00.000Z`)
        .lt('created_at', `${formattedDate}T23:59:59.999Z`)

      if (error) {
        console.error('Error fetching incomes:', error)
        setLoadingIncomes(false)
        return
      }

      const prefill: { [key: string]: FormValue } = {}
      data?.forEach((row) => {
        prefill[row.source_id] = {
          amount: row.amount.toString(),
          id: row.id,
        }
      })

      setForm(prefill)
      setLoadingIncomes(false)
    }

    if (isOpen) {
      fetchIncomes()
    }
  }, [isOpen, date])

  const handleChange = (sourceId: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        amount: value,
      },
    }))
  }

  const handleSave = async () => {
    setLoading(true)

    const entries = Object.entries(form).filter(([_, value]) => {
      const n = parseFloat(value.amount)
      return !isNaN(n) && n > 0
    })

    const createdAt = new Date(date.setHours(8, 0, 0, 0)).toISOString()

    for (const [source_id, { amount, id }] of entries) {
      const numericAmount = parseFloat(amount)

      if (id) {
        // Actualizar si ya existe
        await supabase
          .from('daily_incomes')
          .update({
            amount: numericAmount,
            created_at: createdAt,
          })
          .eq('id', id)
      } else {
        // Insertar si no existe
        await supabase
          .from('daily_incomes')
          .insert({
            source_id,
            amount: numericAmount,
            created_at: createdAt,
          })
      }
    }

    setLoading(false)
    onSave()
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel
          style={{ overflowY: 'auto' }}
          className="bg-white rounded-2xl shadow-xl h-[50vh] w-full max-w-md p-6 sm:p-8 border border-gray-200"
        >
          <Dialog.Title className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Ingresos del {format(date, 'dd MMMM yyyy')}
          </Dialog.Title>

          {loadingIncomes ? (
            <div className="text-center text-gray-500 py-12">Cargando ingresos...</div>
          ) : (
            <div className="space-y-5">
              {sources.map((source) => (
                <div key={source.id}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {source.name}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form[source.id]?.amount || ''}
                    onChange={(e) => handleChange(source.id, e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
