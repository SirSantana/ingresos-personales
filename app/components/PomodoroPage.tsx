'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react'

type TimerMode = 'focus' | 'break' | 'longBreak'

const TIMER_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Solo acceder a localStorage en el cliente
  useEffect(() => {
    if (typeof window === 'undefined') return
    loadPomodoros()
  }, [])

  const loadPomodoros = () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const stored = localStorage.getItem(`pomodoros:${today}`)
      if (stored) setCompletedPomodoros(parseInt(stored))
    } catch (error) {
      console.log('No se pudo cargar pomodoros:', error)
    }
  }

  const savePomodoros = (count: number) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(`pomodoros:${today}`, count.toString())
    } catch (error) {
      console.error('Error guardando pomodoros:', error)
    }
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)

    if (mode === 'focus') {
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)
      savePomodoros(newCount)

      if (newCount % 4 === 0) {
        setMode('longBreak')
        setTimeLeft(TIMER_DURATIONS.longBreak)
      } else {
        setMode('break')
        setTimeLeft(TIMER_DURATIONS.break)
      }
    } else {
      setMode('focus')
      setTimeLeft(TIMER_DURATIONS.focus)
    }

    const audio = new Audio('/notify.wav')
    audio.play().catch(() => {})
  }

  const handlePlayPause = () => setIsRunning(!isRunning)
  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_DURATIONS[mode])
  }

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_DURATIONS[newMode])
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-6">Enfoque Profundo</h1>

        <div   className="
              flex sm:inline-flex items-center gap-2 p-1 bg-gray-100 rounded-2xl
              overflow-x-auto sm:overflow-visible scrollbar-hide
              snap-x snap-mandatory
            ">
          {[
            { key: 'focus', label: 'Enfoque', icon: Target },
            { key: 'break', label: 'Descanso', icon: Coffee },
            { key: 'longBreak', label: 'Descanso Largo', icon: Coffee },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleModeChange(key as TimerMode)}
              className={`px-6 py-2.5 rounded-xl text-sm transition-all ${
                mode === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {label}
              </div>
            </button>
          ))}
        </div>

        <div className="relative inline-block mb-16">
          <svg className="w-80 h-80 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" stroke="#E5E7EB" strokeWidth="2" fill="none" />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#111827"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-light text-gray-900 tracking-tight">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-16">
          <button
            onClick={handleReset}
            className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            <RotateCcw className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800 transition-all shadow-lg"
          >
            {isRunning ? (
              <Pause className="w-8 h-8 text-white" strokeWidth={1.5} fill="white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" strokeWidth={1.5} fill="white" />
            )}
          </button>

          <div className="w-14 h-14" />
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-3 tracking-wide">Pomodoros Completados Hoy</p>
          <p className="text-5xl font-light text-gray-900">{completedPomodoros}</p>
        </div>
      </div>
    </div>
  )
}
