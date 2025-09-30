'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, TrendingUp, PlusCircle, Edit, Calendar } from 'lucide-react'
import NewContributionModal from '../NewContributionModal'
import { formatCurrency } from '@/utils/formatCurrency'
import NewSnapshotModal from '../NewSnapshotModal'

export default function InvestmentDetailPage() {
  const params = useParams()
  const investmentId = params?.id as string

  const [investment, setInvestment] = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [openSnapshotModal, setOpenSnapshotModal] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const handleDeleteContribution = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este abono?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('investment_contributions')
      .delete()
      .eq('id', id)

    if (!error) {
      setRefreshKey((k) => k + 1)
    } else {
      console.error('Error deleting contribution:', error)
      alert('Hubo un error al eliminar el abono.')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const { data: inv, error: invError } = await supabase.from('investments').select('*').eq('id', investmentId).single()
        if (invError) throw invError

        const { data: contribs, error: contribError } = await supabase.from('investment_contributions').select('*').eq('investment_id', investmentId)
        if (contribError) throw contribError

        const { data: snaps, error: snapError } = await supabase.from('investment_snapshots').select('*').eq('investment_id', investmentId).order('date', { ascending: true })
        if (snapError) throw snapError

        setInvestment(inv)
        setContributions(contribs || [])
        setSnapshots(snaps || [])
        if (snaps && snaps.length > 0) {
          setSelectedSnapshotId(snaps[snaps.length - 1].id) // seleccionar el último por defecto
        }

      } catch (err) {
        console.error(err)
        setError('No se pudo cargar la inversión.')
      } finally {
        setLoading(false)
      }
    }

    if (investmentId) {
      fetchData()
    }
  }, [investmentId, refreshKey])

  const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  const totalInvested = (investment?.amount_invested || 0) + totalContributions

  const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId)
  const currentValue = selectedSnapshot ? selectedSnapshot.amount : 0
  const gainOrLoss = currentValue - totalInvested
  const gainOrLossPercentage = totalInvested > 0 ? (gainOrLoss / totalInvested) * 100 : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    )
  }
  console.log(snapshots)
  
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="p-6 max-w-5xl mx-auto">
        {investment && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-7 w-7 text-blue-600" />
                  {investment.asset}
                </h1>
                <p className="text-slate-600 mt-1">{investment.type} - {investment.platform}</p>
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow"
                >
                  <PlusCircle className="h-5 w-5" />
                  Nuevo Abono
                </button>
                <button
                  onClick={() => setOpenSnapshotModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition shadow"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border border-slate-200 mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Resumen Financiero</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Snapshot:</label>
                <select
                  value={selectedSnapshotId}
                  onChange={(e) => setSelectedSnapshotId(e.target.value)}
                  className="w-full border rounded-md p-2 text-slate-700"
                >
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.date).toLocaleDateString()} - {formatCurrency(s.amount, investment.currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600 text-sm">Valor Actual (Snapshot)</p>
                  <p className="font-bold text-slate-900 text-lg">{formatCurrency(currentValue, investment.currency)}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Ganancia/Pérdida</p>
                  <p className={`font-bold text-lg ${gainOrLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(gainOrLoss, investment.currency)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-600 text-sm">% de Crecimiento</p>
                  <p className={`font-bold text-2xl ${gainOrLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>{gainOrLossPercentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border border-slate-200 mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Resumen Inversión</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600 text-sm">Monto Inicial</p>
                  <p className="font-bold text-slate-900 text-lg">{formatCurrency(investment.amount_invested, investment.currency)}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Total Aportado</p>
                  <p className="font-bold text-slate-900 text-lg">{formatCurrency(totalContributions, investment.currency)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-600 text-sm">Total Invertido</p>
                  <p className="font-bold text-blue-600 text-2xl">{formatCurrency(totalInvested, investment.currency)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border border-slate-200 mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Aportes</h2>
              {contributions.length === 0 ? (
                <p className="text-slate-500">No has registrado abonos aún.</p>
              ) : (
                <ul className="space-y-4">
                  {contributions.map((c) => (
                    <li key={c.id} className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-700 font-medium">{new Date(c.date).toLocaleDateString()}</span>
                      <span className="text-slate-900 font-semibold">+{formatCurrency(c.amount.toFixed(2), investment.currency)}</span>
                      <button
                        onClick={() => handleDeleteContribution(c.id)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Snapshots</h2>
              {snapshots.length === 0 ? (
                <p className="text-slate-500">No has registrado Snapshots aún.</p>
              ) : (
                <ul className="space-y-4">
                  {snapshots.map((c) => (
                    <li key={c.id} className="flex justify-between items-center border-b pb-2">
                      <span className="text-slate-700 font-medium">{new Date(c.date).toLocaleDateString()}</span>
                      <span className="text-slate-900 font-semibold">+{formatCurrency(c.amount.toFixed(2), 'COP')}</span>
                      <button
                        onClick={() => handleDeleteContribution(c.id)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <NewContributionModal
              investmentId={investmentId}
              isOpen={open}
              onClose={() => setOpen(false)}
              onCreated={() => {
                setRefreshKey(k => k + 1)
                setOpen(false)
              }}
            />
            <NewSnapshotModal
              investmentId={investmentId}
              isOpen={openSnapshotModal}
              onClose={() => setOpenSnapshotModal(false)}
              onCreated={() => {
                setRefreshKey(k => k + 1)
                setOpenSnapshotModal(false)
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
