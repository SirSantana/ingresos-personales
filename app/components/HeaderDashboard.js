import { format } from 'date-fns'

export default function Header({ selectedDate, onChange }) {
  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-')
    onChange(new Date(year, month - 1))
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <input
        type="month"
        value={format(selectedDate, 'yyyy-MM')}
        onChange={handleMonthChange}
        className="border px-3 py-2 rounded-lg"
      />
    </div>
  )
}
