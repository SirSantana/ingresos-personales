import { useState } from 'react'

interface Milestone {
  amount: number
  label: string
}

interface IncomeMilestonesProps {
  totalIncome?: number
  modeGlobal?: 'month' | 'year'
  customMilestones?: Milestone[]
}

const defaultMilestones: Milestone[] = [
  { amount: 10,    label: 'Primer billete' },
  { amount: 50,    label: 'Café del mes' },
  { amount: 100,   label: 'Triple dígitos' },
  { amount: 250,   label: 'Un cuarto de mil' },
  { amount: 500,   label: 'Medio camino' },
  { amount: 1000,  label: 'Cuatro ceros' },
  { amount: 2500,  label: 'Creciendo fuerte' },
  { amount: 5000,  label: 'Mitad a cinco cifras' },
  { amount: 10000, label: 'Cinco cifras' },
  { amount: 25000, label: 'Meta del mes' },
]

function fmt(n: number) {
  if (n >= 1000) return '$' + (n / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + 'k'
  return '$' + n.toLocaleString('es-CO')
}

function fmtFull(n: number) {
  return '$' + n.toLocaleString('es-CO')
}

export default function IncomeMilestones({
  totalIncome = 1200,
  modeGlobal = 'month',
  customMilestones,
}: IncomeMilestonesProps) {
  const milestones = customMilestones ?? defaultMilestones
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ]
  const currentMonth = months[new Date().getMonth()]

  const currentIndex = milestones.findIndex(m => totalIncome < m.amount)
  const allDone = currentIndex === -1
  const doneCount = allDone ? milestones.length : currentIndex

  const spinePct = allDone
    ? 100
    : doneCount === 0
    ? 0
    : (doneCount / milestones.length) * 100

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-16"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <div className="w-full max-w-md flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="uppercase text-gray-400 tracking-widest mb-3"
            style={{ fontSize: 11, letterSpacing: '0.18em' }}
          >
            {modeGlobal === 'month' ? `Hitos de ${currentMonth}` : 'Hitos del año'}
          </p>
          <p
            className="font-light text-gray-900 tracking-tight leading-none"
            style={{ fontSize: 56 }}
          >
            {fmtFull(totalIncome)}
          </p>
          <p className="text-gray-400 mt-2 font-light" style={{ fontSize: 13 }}>
            acumulados este {modeGlobal === 'month' ? 'mes' : 'año'}
          </p>
        </div>

        {/* Milestones track */}
        <div className="w-full relative" style={{ paddingLeft: 56 }}>

          {/* Spine */}
          <div
            className="absolute"
            style={{
              left: 15,
              top: 16,
              bottom: 16,
              width: 1,
              background: '#e5e7eb',
            }}
          >
            <div
              style={{
                width: '100%',
                background: '#111827',
                height: `${spinePct}%`,
                transition: 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>

          {/* Items */}
          {milestones.map((m, i) => {
            const isDone = totalIncome >= m.amount
            const isCurrent = i === currentIndex
            const isLocked = !isDone && !isCurrent

            const prev = i > 0 ? milestones[i - 1].amount : 0
            const pct = isCurrent
              ? Math.min(((totalIncome - prev) / (m.amount - prev)) * 100, 100)
              : 0
            const remaining = m.amount - totalIncome

            return (
              <div
                key={m.amount}
                className="relative flex items-start gap-5"
                style={{
                  paddingBottom: i < milestones.length - 1 ? 36 : 0,
                  opacity: isLocked ? 0.35 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                {/* Node */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{ left: -56, top: 0, width: 32, height: 32 }}
                >
                  <div
                    className="flex items-center justify-center rounded-full transition-all duration-500"
                    style={{
                      width: 32,
                      height: 32,
                      background: isDone ? '#111827' : 'white',
                      border: isDone
                        ? 'none'
                        : isCurrent
                        ? '2px solid #111827'
                        : '1.5px solid #d1d5db',
                      boxShadow: isCurrent
                        ? '0 0 0 6px rgba(17,24,39,0.08)'
                        : 'none',
                    }}
                  >
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2.5 7L5.5 10L11.5 4"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : isCurrent ? (
                      <div
                        className="rounded-full"
                        style={{ width: 8, height: 8, background: '#111827' }}
                      />
                    ) : (
                      <div
                        className="rounded-full"
                        style={{ width: 6, height: 6, background: '#d1d5db' }}
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1" style={{ paddingTop: 4 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-gray-900 tracking-tight"
                      style={{
                        fontSize: isDone ? 22 : isCurrent ? 26 : 18,
                        fontWeight: isCurrent ? 500 : isDone ? 500 : 400,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {fmt(m.amount)}
                    </span>
                    {isCurrent && (
                      <span
                        className="text-gray-500 rounded-full"
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          background: 'rgba(17,24,39,0.07)',
                        }}
                      >
                        siguiente
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 font-light" style={{ fontSize: 12 }}>
                    {m.label}
                  </p>

                  {isCurrent && (
                    <div className="mt-3" style={{ width: 140 }}>
                      <div
                        className="rounded-full overflow-hidden mb-1"
                        style={{ height: 3, background: '#e5e7eb' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct.toFixed(1)}%`,
                            background: '#111827',
                            transition: 'width 1s ease',
                          }}
                        />
                      </div>
                      <p className="text-gray-400" style={{ fontSize: 11 }}>
                        {fmtFull(remaining)} restante
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <p style={{ fontSize: 11, color: '#d1d5db', letterSpacing: '0.04em' }}>
            {doneCount} de {milestones.length} hitos alcanzados
          </p>
        </div>

      </div>
    </div>
  )
}