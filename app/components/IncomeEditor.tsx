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
  id?: string
}

type Props = {
  date: Date
  isOpen: boolean
  onClose: () => void
  sources: Source[]
  onSave: () => void
  existingIncomes: {
    id: string
    source_id: string
    amount: number
    created_at: string
  }[]
}

export default function IncomeEditor({
  date,
  isOpen,
  onClose,
  sources,
  onSave,
  existingIncomes
}: Props) {
  const [form, setForm] = useState<{ [key: string]: FormValue }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prefill: { [key: string]: FormValue } = {}
    existingIncomes?.forEach((row) => {
      prefill[row.source_id] = {
        amount: row.amount.toString(),
        id: row.id,
      }
    })
    setForm(prefill)
  }, [existingIncomes, isOpen])

  const handleChange = (sourceId: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        amount: value,
      },
    }))
    console.log(form, value);
    
  }

  const handleSave = async () => {
    setLoading(true)

    const entries = Object.entries(form).filter(([_, value]) => {
      const n = parseFloat(value.amount)
      return !isNaN(n)
    })

    const createdAt = new Date(date.setHours(8, 0, 0, 0)).toISOString()

    for (const [source_id, { amount, id }] of entries) {
      const numericAmount = parseFloat(amount)

      if (id) {
        await supabase
          .from('daily_incomes')
          .update({
            amount: numericAmount,
            created_at: createdAt,
          })
          .eq('id', id)
      } else {
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
