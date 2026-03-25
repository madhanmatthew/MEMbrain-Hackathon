import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GoalForm from '../components/GoalForm'
import GoalCard from '../components/GoalCard'
import EventLog from '../components/EventLog'
import InsightPanel from '../components/InsightPanel'
import Constellation from '../components/Constellation'
import TrendGraph from '../components/TrendGraph'

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 696 316" fill="none" style={{ opacity: 0.4 }}>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="rgba(239,159,39,1)"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const [highlightText, setHighlightText] = useState('')
  const [view, setView] = useState('constellation')
  const [showForm, setShowForm] = useState(false)
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Hit ₹10L revenue by Q3',
      why: 'Scale team and operations',
      target: '2026-09-30',
      health: 0.75,
      events: [
        { id: 1, text: 'Closed ₹50k deal', date: '20 Mar', sentiment: 'positive' },
        { id: 2, text: 'Lost ₹30k prospect', date: '18 Mar', sentiment: 'negative' },
      ]
    },
    {
      id: 2,
      name: 'Reach 50k monthly visitors',
      why: 'Increase conversions and brand reach',
      target: '2026-08-31',
      health: 0.5,
      events: [
        { id: 3, text: 'Launched ad campaign', date: '15 Mar', sentiment: 'positive' },
        { id: 4, text: 'SEO issues detected', date: '12 Mar', sentiment: 'negative' },
      ]
    }
  ])
  const [selectedGoal, setSelectedGoal] = useState(goals[0])

  const addGoal = (goal) => {
    const newGoal = { ...goal, id: Date.now(), events: [], health: 0.5 }
    setGoals(prev => [...prev, newGoal])
    setSelectedGoal(newGoal)
    setShowForm(false)
  }

  const addEvent = (goalId, event) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, events: [...(g.events ?? []), event] } : g
    ))
    setSelectedGoal(prev =>
      prev?.id === goalId ? { ...prev, events: [...(prev.events ?? []), event] } : prev
    )
  }

  const healthAvg = goals.length ? (goals.reduce((s, g) => s + g.health, 0) / goals.length * 100).toFixed(0) : 0
  const totalEvents = goals.reduce((s, g) => s + (g.events?.length ?? 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f0f0f0', position: 'relative', overflow: 'hidden', display: 'flex' }}>

      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(239,159,39,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(127,119,221,0.04) 0%, transparent 60%)' }} />
      </div>

      {/* SIDEBAR */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '280px', flexShrink: 0,
          background: 'rgba(15,15,25,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'relative', zIndex: 10,
          overflowY: 'auto'
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: '20px', fontWeight: '800', color: '#EF9F27', letterSpacing: '-0.5px' }}
            >
              GoalPulse
            </motion.h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>powered by Membrain</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            style={{
              background: '#EF9F27', color: '#000',
              border: 'none', borderRadius: '8px',
              padding: '7px 13px', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer'
            }}
          >
            + New
          </motion.button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Avg health', value: `${healthAvg}%` },
            { label: 'Total events', value: totalEvents },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#EF9F27', marginTop: '2px' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 4px', marginBottom: '4px' }}>
          Your goals
        </p>

        <AnimatePresence>
          {goals.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GoalCard goal={g} selected={selectedGoal?.id === g.id} onSelect={setSelectedGoal} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {selectedGoal && (
            <motion.div
              key={selectedGoal.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
              style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >

              {/* Header */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: selectedGoal.health > 0.6 ? '#1D9E75' : selectedGoal.health > 0.3 ? '#EF9F27' : '#D85A30'
                    }}
                  />
                  <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#EF9F27', letterSpacing: '-0.5px' }}>
                    {selectedGoal.name}
                  </h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', paddingLeft: '22px' }}>
                  {selectedGoal.why}
                </p>

                {/* Health bar */}
                <div style={{ marginTop: '16px', paddingLeft: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal health</span>
                    <span style={{ fontSize: '11px', color: '#EF9F27', fontWeight: '700' }}>{Math.round(selectedGoal.health * 100)}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedGoal.health * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: selectedGoal.health > 0.6 ? '#1D9E75' : selectedGoal.health > 0.3 ? '#EF9F27' : '#D85A30',
                        borderRadius: '2px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Event Log */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: 'rgba(15,15,28,0.7)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <EventLog goal={selectedGoal} onEventAdded={addEvent} />
              </motion.div>

              {/* Insight Panel */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: 'rgba(15,15,28,0.7)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <InsightPanel goals={goals} onHighlight={setHighlightText} />
              </motion.div>

              {/* View toggle */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'constellation', label: '🌌 Graph' },
                  { key: 'line', label: '📈 Trends' }
                ].map(v => (
                  <motion.button
                    key={v.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setView(v.key)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: view === v.key ? '#EF9F27' : 'rgba(255,255,255,0.06)',
                      color: view === v.key ? '#000' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {v.label}
                  </motion.button>
                ))}
              </div>

              {/* Graph area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: 'rgba(10,10,18,0.8)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  minHeight: '300px'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {view === 'constellation'
                      ? <Constellation goals={goals} highlightText={highlightText} />
                      : <TrendGraph goals={goals} />
                    }
                  </motion.div>
                </AnimatePresence>
              </motion.div>

            </motion.div>
          )}

          {!selectedGoal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: '48px' }}
              >
                🎯
              </motion.div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>Select a goal or create a new one</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                style={{
                  background: '#EF9F27', color: '#000',
                  border: 'none', borderRadius: '10px',
                  padding: '12px 24px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer', marginTop: '8px'
                }}
              >
                + Create your first goal
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100
            }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                background: 'rgba(18,18,30,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '32px',
                width: '440px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#EF9F27', fontSize: '16px', fontWeight: '700' }}>Create new goal</h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <GoalForm onGoalCreated={addGoal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}