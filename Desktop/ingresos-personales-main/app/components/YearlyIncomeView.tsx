import React, { useState } from 'react'
import { useIncomeByYear } from '../hooks/useIncomeByYear'

export default function YearlyIncomeReport({year }: { year: number }) {
  const { incomeByMonth, loading } = useIncomeByYear(year)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold text-gray-800 mb-2">
        Reporte de Ingresos para el Año {year}
      </h2>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="mt-6">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">Mes</th>
                <th className="px-4 py-2 border-b text-left">Fuente</th>
                <th className="px-4 py-2 border-b text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {incomeByMonth.map(({ mes, source_name, total }) => (
                <tr key={`${mes}-${source_name}`}>
                  <td className="px-4 py-2 border-b">{mes}</td>
                  <td className="px-4 py-2 border-b">{source_name}</td>
                  <td className="px-4 py-2 border-b">${total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
