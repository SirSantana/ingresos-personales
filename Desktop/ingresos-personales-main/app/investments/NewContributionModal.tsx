'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PlusCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function NewContributionModal({
  investmentId,
  isOpen,
  onClose,
  onCreated,
}: {
  investmentId: string
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)

    const { error } = await supabase.from('investment_contributions').insert({
      investment_id: investmentId,
      amount: parseFloat(amount),
      date,
    })

    setLoading(false)

    if (!error) {
      onCreated()
    } else {
      console.error('Error saving contribution:', error)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 w-full max-w-md border shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-blue-600" />
              Nuevo Abono
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              disabled={loading}
            >
              ✖
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto Abonado</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                placeholder="Ej: 500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              disabled={loading || !amount}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
