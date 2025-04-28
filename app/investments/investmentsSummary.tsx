'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, TrendingUp, Wallet, DollarSign, BarChart3, LineChart, Percent } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'

export default function InvestmentsSummary() {
  const [investments, setInvestments] = useState<any[]>([])
  const [contributions, setContributions] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: invData, error: invError } = await supabase.from('investments').select('*')
      const { data: contribData, error: contribError } = await supabase.from('investment_contributions').select('*')
      const { data: snapData, error: snapError } = await supabase.from('investment_snapshots').select('*')

      if (!invError && !contribError && !snapError) {
        setInvestments(invData || [])
        setContributions(contribData || [])
        setSnapshots(snapData || [])
      } else {
        console.error('Error loading investments summary.')
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0)
  const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  const grandTotal = totalInvested + totalContributions
  const numberOfInvestments = investments.length

  const noSnapshots = snapshots.length === 0
  const latestSnapshotTotal = noSnapshots
    ? grandTotal
    : snapshots.reduce((sum, snap) => sum + (snap.amount || 0), 0)

  const gainOrLoss = latestSnapshotTotal - grandTotal
  const gainOrLossPercentage = grandTotal > 0 ? (gainOrLoss / grandTotal) * 100 : 0

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
        <Wallet className="h-10 w-10 text-blue-600" />
        <div>
          <p className="text-slate-600 text-sm">Cantidad de Inversiones</p>
          <p className="text-2xl font-bold text-slate-900">{numberOfInvestments}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
        <DollarSign className="h-10 w-10 text-green-600" />
        <div>
          <p className="text-slate-600 text-sm">Total Inicial Invertido</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalInvested, investments[0]?.currency)}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
        <BarChart3 className="h-10 w-10 text-emerald-600" />
        <div>
          <p className="text-slate-600 text-sm">Total General (Inicial + Abonos)</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(grandTotal, investments[0]?.currency)}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
        <LineChart className="h-10 w-10 text-purple-600" />
        <div>
          <p className="text-slate-600 text-sm">Valor Actual</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(latestSnapshotTotal, investments[0]?.currency)}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
        <TrendingUp className="h-10 w-10 text-amber-500" />
        <div>
          <p className="text-slate-600 text-sm">Ganancia/Pérdida</p>
          <p className={`text-2xl font-bold ${gainOrLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(gainOrLoss, investments[0]?.currency)}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
        <Percent className="h-10 w-10 text-indigo-600" />
        <div>
          <p className="text-slate-600 text-sm">% de Crecimiento</p>
          <p className={`text-2xl font-bold ${gainOrLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>{gainOrLossPercentage.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  )
}
