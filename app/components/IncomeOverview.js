import { format } from 'date-fns'

export default function IncomeOverview({ totalIncome, goal = 25000, modeGlobal='month' }) {
  const percentage = Math.min((totalIncome / goal) * 100, 100)
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">Ingresos acumulados {modeGlobal === 'month' ? `${format(new Date(), 'MMMM yyyy')}` : 'del año'}</p>
          <h2 className="text-4xl font-bold">${totalIncome.toLocaleString()}</h2>
        </div>
        <div className="bg-pink-500 text-white px-4 py-2 rounded-xl">
          Meta: ${goal.toLocaleString()}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-right text-gray-600">
        {percentage.toFixed(1)}% alcanzado
      </p>
    </div>
  )
}
