import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Income } from '../types/income'

export function useIncomeByMonth(year: number, month: number,  reloadKey = 0) {
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [incomes, setIncomes] = useState<Income[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_incomes_by_month_2', {
        year: year,
        month: month
      })

      if (error) {
        console.error('Error al obtener los ingresos del mes:', error)
        setTotal(0)
        setIncomes([])
      } else {
        setIncomes(data || [])
        
        // Calcular el total desde los ingresos
        // const totalAmount = data?.reduce((acc:number, income:any) => acc + income.amount, 0) || 0
        // setTotal(totalAmount)
      }
      console.log(incomes);
      
      setLoading(false)
    }

    if (year && month) fetchData()
  }, [year, month, reloadKey])

  return { total, incomes, loading }
}
