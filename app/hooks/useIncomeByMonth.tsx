import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Income } from '../types/income'

// Cache simple en memoria (clave: '2025-04')
const incomeCache = new Map<string, Income[]>()

export function useIncomeByMonth(year: number, month: number, reloadKey = 0) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cacheKey = `${year}-${month.toString().padStart(2, '0')}`

    const fetchData = async () => {
      setLoading(true)

      // Si no hay reload y ya existe en cache, usamos eso
      if (reloadKey === 0 && incomeCache.has(cacheKey)) {
        setIncomes(incomeCache.get(cacheKey) || [])
        setLoading(false)
        return
      }

      // Si no está en cache o se forzó reload
      const { data, error } = await supabase.rpc('get_incomes_by_month_2', {
        year,
        month
      })

      if (error) {
        console.error('Error al obtener los ingresos del mes:', error)
        setIncomes([])
      } else {
        incomeCache.set(cacheKey, data || [])
        setIncomes(data || [])
      }

      setLoading(false)
    }

    if (year && month) fetchData()
  }, [year, month, reloadKey])

  return { incomes, loading }
}
