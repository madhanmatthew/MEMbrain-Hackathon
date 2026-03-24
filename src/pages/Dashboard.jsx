import { useState } from 'react'
import GoalForm from '../components/GoalForm'
import GoalCard from '../components/GoalCard'
import EventLog from '../components/EventLog'
import InsightPanel from '../components/InsightPanel'

export default function Dashboard() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Hit ₹10L revenue by Q3',
      why: 'Needed to hire 2 more employees and expand operations',
      target: '2026-09-30',
      health: 0.75,
      events: [
        { id: 1, text: 'Closed ₹50k deal with Acme Corp', date: '20 Mar', sentiment: 'positive' },
        { id: 2, text: 'Lost a ₹30k prospect to competitor', date: '18 Mar', sentiment: 'neutral' },
      ]
    },
    {
      id: 2,
      name: 'Cut operational costs by 20%',
      why: 'Margins are too thin, need to optimize vendor contracts',
      target: '2026-06-30',
      health: 0.35,
      events: []
    }
  ])

  const [selectedGoal, setSelectedGoal] = useState(goals[0])
  const [showForm, setShowForm] = useState(false)

  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal])
    setShowForm(false)
    setSelectedGoal(goal)
  }

  const addEvent = (goalId, event) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, events: [...(g.events ?? []), event], health: Math.min(1, (g.health ?? 0.5) + 0.05) }
        : g
    ))
    setSelectedGoal(prev => prev?.id === goalId
      ? { ...prev, events: [...(prev.events ?? []), event], health: Math.min(1, (prev.health ?? 0.5) + 0.05) }
      : prev
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        goals={goals}
        selected={selectedGoal}
        onSelect={setSelectedGoal}
        onNewGoal={() => setShowForm(true)}
      />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {showForm ? (
          <div style={{ maxWidth: '520px' }}>
            <button
              onClick={() => setShowForm(false)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}
            >
              ← Back
            </button>
            <GoalForm onGoalCreated={addGoal} />
          </div>
        ) : selectedGoal ? (
          <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--amber)' }}>{selectedGoal.name}</h1>
              <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '14px' }}>{selectedGoal.why}</p>
            </div>
            <EventLog goal={selectedGoal} onEventAdded={addEvent} />
            <InsightPanel goals={goals} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</p>
            <p>Select a goal or create a new one</p>
          </div>
        )}
      </main>
    </div>
  )
}

function Sidebar({ goals, selected, onSelect, onNewGoal }) {
  return (
    <aside style={{
      width: '300px',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--amber)' }}>GoalPulse</h1>
        <button
          onClick={onNewGoal}
          style={{
            background: 'var(--amber)',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + New
        </button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 4px', marginBottom: '4px' }}>
        Your goals
      </p>

      {goals.map(g => (
        <GoalCard
          key={g.id}
          goal={g}
          selected={selected?.id === g.id}
          onSelect={onSelect}
        />
      ))}

      {goals.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          No goals yet
        </p>
      )}
    </aside>
  )
}