'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PlusCircle, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import NewInvestmentModal from './NewInvestmentModal'
import Link from 'next/link'
import { formatCurrency } from '@/utils/formatCurrency'
import InvestmentsSummary from './investmentsSummary'

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchInvestments = async () => {
      setLoading(true)
      setError('')

      try {
        const { data, error } = await supabase.from('investments').select('*')
        if (error) throw error
        setInvestments(data || [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las inversiones.')
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [refreshKey])

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mis Inversiones</h1>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow"
          >
            <PlusCircle className="h-5 w-5" />
            Nueva Inversión
          </button>
        </div>
    <InvestmentsSummary />
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex justify-center text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        ) : investments.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <p>No tienes inversiones registradas aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((inv) => (
              <Link
              href={`/investments/${inv.id}`}
                key={inv.id}
                className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">{inv.asset}</h2>
                </div>
                <p className="text-sm text-slate-600 mb-1">{inv.type} - {inv.platform}</p>
                <p className="text-sm font-medium text-slate-700">Inversion Inicial:  {formatCurrency(inv.amount_invested.toFixed(2), inv.currency)} {inv.currency}</p>
              </Link>
            ))}
          </div>
        )}

        <NewInvestmentModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false)
            setRefreshKey((k) => k + 1)
          }}
        />
      </div>
    </div>
  )
}
