import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useIncomeByYear(year: number) {
  const [incomeByMonth, setIncomeByMonth] = useState<{ mes: number; source_name: string; total: number }[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_monthly_income_by_source_name', {
        year_input: year
      })

      if (error) {
        console.error('Error al obtener los ingresos por año:', error)
        setIncomeByMonth([])
      } else {
        setIncomeByMonth(data || [])
      }

      setLoading(false)
    }

    if (year) fetchData()
  }, [year])

  return { incomeByMonth, loading }
}
