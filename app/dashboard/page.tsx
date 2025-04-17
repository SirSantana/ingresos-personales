'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "../components/DashboardLayout"
import Header from "../components/HeaderDashboard"
import IncomeOverview from "../components/IncomeOverview"
import { supabase } from "@/lib/supabaseClient"
import MonthlyView from "../components/MonthlyView"
import IncomeEditor from "../components/IncomeEditor"
import { useIncomeByMonth } from "../hooks/useIncomeByMonth"
import YearlyIncomeView from "../components/YearlyIncomeView"
import IncomeReportChart from "../components/IncomeReportChart"
import GoToDailyRituals from "../components/GoToDailyRituals"

export default function DashboardPage() {
  const [date, setDate] = useState(new Date())
  const [modeGlobal, setModeGlobal] = useState('month')
  const [incomeMonth, setIncomeMonth] = useState<number>(0)
  // const [incomes, setIncomes] = useState<number>(0)
  // useEffect(() => {
  //   fetchIncomes()
  // }, [date])
  
  // const fetchIncomes = async () => {
  //   const startOfMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
  //   const startOfNextMonth = `${date.getFullYear()}-${(date.getMonth() + 2).toString().padStart(2, '0')}-01`;
  
  //   const { data, error } = await supabase
  //     .from('daily_incomes')
  //     .select('amount')
  //     .filter('created_at', 'gte', startOfMonth)
  //     .filter('created_at', 'lt', startOfNextMonth)
  
  //   if (error) {
  //     console.error('Error fetching incomes:', error)
  //   } else {
  //     const totalIncome = data?.reduce((sum, row) => sum + row.amount, 0) || 0
  //     setIncomes(totalIncome)
  //   }
  // }


  const [month, setMonth] = useState<number | null>(null)
  const [totalYear, setTotalYear] = useState<number>(0)
  
  const [year, setYear]= useState<number>(2025)

  

  const fetchTotalYear = async () => {
    const { data, error } = await supabase.rpc('get_total_income_by_year', { year: year })
    if (!error) setTotalYear(data || 0)
  }
 
  useEffect(() => {
    fetchTotalYear()
  }, [year])
  
  return (
    <DashboardLayout>
      <Header setModeGlobal={setModeGlobal} selectedDate={date} onChange={setDate} />
      {/* <div>
        <p className="text-gray-500 text-sm">Ingreso total del año:</p>
        <p className="text-3xl font-semibold text-green-600">${totalYear.toLocaleString()}</p>
      </div> */}
      <GoToDailyRituals />
      <IncomeOverview totalIncome={modeGlobal === 'month' ? incomeMonth : totalYear} goal={modeGlobal==='month' ? 2500: 25000} modeGlobal={modeGlobal} />
      {modeGlobal === 'month' && (
        <MonthlyView selectedDate={date} year={year} month={date.getMonth() + 1} setIncomeMonth={setIncomeMonth} />
      )}
      {modeGlobal === 'year' &&  <IncomeReportChart />}
     

      {/* <YearlyIncomeView year={year} /> */}
      {/* IncomeTable opcional */}
      {/* {selectedDay && (
        <IncomeEditor
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          sources={sources}
          onSave={() => {
            fetchIncomes()
            refreshMonthlyView()
          }}
        />
      )} */}
    </DashboardLayout>
  )
}
