import { useState, useEffect } from 'react'
import { useIncomeByYear } from '../hooks/useIncomeByYear'
import Image from 'next/image'

let meses

export const sources = [
  {
    id: '6b8f9bc2-49e3-4d04-bd73-aa0bd3f40d58',
    name: 'YouTube Llanta Pinchada TV',
    logo: '/logos/youtube.png'
  },
  {
    id: '841b8e44-d99a-4152-ac14-ec497508cc21',
    name: 'YouTube Flat Tire TV',
    logo: '/logos/youtube.png'
  },
  {
    id: '4b872fac-31d5-4a69-924a-ebb728fc7b67',
    name: 'YouTube Pneu Furado TV',
    logo: '/logos/youtube.png'
  },
  {
    id: '3f4b4234-4678-4f08-93cc-02d1cdd106e7',
    name: 'Facebook Quarks-Automotriz',
    logo: '/logos/facebook.png'
  },
  {
    id: 'af0e5bf0-ee62-4031-aad3-7e7af56d6f9b',
    name: 'Facebook Quarks-Motos',
    logo: '/logos/facebook.png'
  },
  {
    id: '3a99e3e2-ee7d-4c71-bdd6-18ec72d0b414',
    name: 'TikTok Llanta Pinchada TV',
    logo: '/logos/tiktok.png'
  },
  {
    id: '8efd713b-5778-440d-b9d0-e16e0a566390',
    name: 'Mercado Libre',
    logo: '/logos/mercado-libre.png'
  }
]

export default function IncomeStats() {
  const [year, setYear] = useState(2025)
  const { incomeByMonth, loading } = useIncomeByYear(year)

  // Ingresos por mes (Sumando todos los ingresos de todas las fuentes)
  const getMonthlyData = () => {
    const monthlyData = new Array(12).fill(0) // Inicializamos un array con 12 ceros (por los 12 meses del año)

    incomeByMonth.forEach(data => {
      const { mes, total } = data
      monthlyData[mes - 1] += total // Sumamos los ingresos por mes
    })

    return monthlyData
  }

  // Ingresos por fuente
  const getSourceData = () => {
    return sources.map(source => {
      const totalSource = incomeByMonth
        .filter(item => item.source_name === source.name)
        .reduce((acc, item) => acc + item.total, 0)
      return { name: source.name, total: totalSource }
    })
  }

  // Promedio mensual de ingresos
  const getAverageIncome = () => {
    const totalIncome = incomeByMonth.reduce((acc, item) => acc + item.total, 0)
    return totalIncome / incomeByMonth.length
  }

  // Top 3 fuentes de ingresos
  const getTop3Sources = () => {
    const sourceData = getSourceData()
    return sourceData
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  }

  const monthlyData = getMonthlyData()
  const sourceData = getSourceData()
  const averageIncome = getAverageIncome()
  const top3Sources = getTop3Sources()

  
  function cleanSourceName(name: string) {
    return name
      .replace(/YouTube\s?/i, '')
      .replace(/Facebook\s?/i, '')
      .replace(/TikTok\s?/i, '')
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {monthlyData.map((total, index) => {
        const incomesThisMonth = incomeByMonth.filter(item => item.mes === index + 1)

        const sourcesByMonth = sources.map(source => {
          const sourceIncome = incomesThisMonth
            .filter(item => item.source_name === source.name)
            .reduce((acc, item) => acc + item.total, 0)
          return { name: source.name, total: sourceIncome }
        }).filter(s => s.total > 0)

        return (
          <div
            key={index}
            style={{
              background: '#f9fafb',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '20px',
              marginBottom: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, fontWeight: 600, color: '#111827' }}>
                ${total.toFixed(2)}
              </h2>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][index]}
              </span>
            </div>

            {/* Lista de fuentes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sourcesByMonth.map((source, idx) => {
                const fullSource = sources.find(s => s.name === source.name)

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={fullSource?.logo}
                        alt={source.name}
                        style={{ width: '20px', height: '20px', borderRadius: '6px', objectFit: 'contain' }}
                      />
                      <span style={{ fontSize: '15px', color: '#374151' }}>{cleanSourceName(source.name)}</span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>
                      ${source.total.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}



      {loading ? (
        <p className="mt-4">Cargando...</p>
      ) : (
        <>
          {/* Ingresos Totales por Mes */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700">Ingresos Totales por Mes</h3>
            <ul className="mt-4">
              {monthlyData.map((total, index) => (
                <li key={index} className="mb-2">
                  <strong>{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][index]}</strong>: ${total.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          {/* Ingresos Totales por Fuente */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ingresos Totales por Fuente</h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sourceData.map((source, index) => {
          const cleanName = cleanSourceName(source.name)
          const fullSource = sources.find(s => s.name === source.name)

          return (
            <li
              key={index}
              className="flex items-center gap-4 bg-white shadow-sm rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Logo o fallback */}
              {fullSource?.logo ? (
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Image src={fullSource.logo} alt={cleanName} width={28} height={28} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold uppercase">
                  {cleanName
                    .split(' ')
                    .map(word => word[0])
                    .slice(0, 2)
                    .join('')}
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <p className="text-sm text-gray-500">Fuente</p>
                <p className="font-medium text-gray-800">{cleanName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-green-600 font-semibold">${source.total.toFixed(2)}</p>
              </div>
            </li>
          )
        })}
            </ul>
          </div>


          {/* Promedio Mensual de Ingresos */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700">Promedio de Ingresos Mensuales</h3>
            <p className="mt-2 text-lg">${averageIncome.toFixed(2)}</p>
          </div>

          {/* Top 3 Fuentes de Ingresos */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700">Top 3 Fuentes de Ingresos</h3>
            <ul className="mt-4">
              {top3Sources.map((source, index) => (
                <li key={index} className="mb-2">
                  <strong>{index + 1}. {source.name}</strong>: ${source.total.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
