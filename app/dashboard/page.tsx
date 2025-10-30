'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "../components/DashboardLayout"
import Header from "../components/HeaderDashboard"
import IncomeOverview from "../components/IncomeOverview"
import { supabase } from "@/lib/supabaseClient"
import MonthlyView from "../components/MonthlyView"
import IncomeReportChart from "../components/IncomeReportChart"
import ProgressBarRituals from "../components/ProgressBarRituals"
import IncomeStatisticsCard from "../components/IncomeStadisticsCard"
import IncomeChart from "../components/IncomeChart"
import AffirmationsPage from "../components/AffirmationsPage"
import PomodoroTimer from "../components/PomodoroPage"
import WaterReadingTracker from "../components/WaterReadingTracker"


export default function DashboardPage() {
  const [date, setDate] = useState(new Date())
  const [modeGlobal, setModeGlobal] = useState<'month' | 'year'>('month')
  const [incomeMonth, setIncomeMonth] = useState<number>(0)
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
    
      <IncomeOverview totalIncome={modeGlobal === 'month' ? incomeMonth : totalYear} goal={modeGlobal==='month' ? 2500: 25000} modeGlobal={modeGlobal} />
      <IncomeStatisticsCard totalIncome={modeGlobal === 'month' ? incomeMonth : totalYear} lastMonthIncome={incomeMonth} />
      {/* <ProgressBarRituals progress={40} /> */}
      
      
      {modeGlobal === 'month' && (
        <MonthlyView selectedDate={date} year={year} month={date.getMonth() + 1} setIncomeMonth={setIncomeMonth} />
      )}
      {modeGlobal === 'year' &&  <IncomeReportChart />}
      <AffirmationsPage/>
      <PomodoroTimer />
      <WaterReadingTracker />
     
      {/* IncomeTable opcional */}
     
    </DashboardLayout>
  )
}
