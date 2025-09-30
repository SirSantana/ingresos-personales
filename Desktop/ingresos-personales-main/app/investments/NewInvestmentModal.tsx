'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PlusCircle, Loader2, TrendingUp } from 'lucide-react'

export default function NewInvestmentModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [type, setType] = useState('')
  const [platform, setPlatform] = useState('')
  const [asset, setAsset] = useState('')
  const [amountInvested, setAmountInvested] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)

    const { error } = await supabase.from('investments').insert({
      type,
      platform,
      asset,
      amount_invested: parseFloat(amountInvested),
      currency,
    })

    setLoading(false)

    if (!error) {
      onCreated()
    } else {
      console.error('Error saving investment:', error)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="bg-white rounded-2xl p-6 w-full max-w-md border shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Nueva Inversión
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                disabled={loading}
              >
                <option value="">Selecciona tipo</option>
                <option value="Cripto">Cripto</option>
                <option value="Acciones">Acciones</option>
                <option value="Finca Raíz">Finca Raíz</option>
                <option value="CDT">CDT</option>
                <option value="Uala">Uala</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plataforma</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                placeholder="Binance, NYSE, Bancolombia..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activo</label>
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                placeholder="BTC, AAPL, Fondo Bogotá..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto Invertido</label>
              <input
                type="number"
                value={amountInvested}
                onChange={(e) => setAmountInvested(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                placeholder="Ej: 1000"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border rounded-md p-2 text-slate-800"
                disabled={loading}
              >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
                <option value="EUR">EUR</option>
              </select>
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
              disabled={loading || !type || !asset || !amountInvested}
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
