import { useState } from 'react'

export default function GoalForm({ onGoalCreated }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [why, setWhy] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name || !why) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    onGoalCreated({
      id: Date.now(),
      name,
      target,
      why,
      health: Math.random() * 0.5 + 0.5,
      createdAt: new Date().toISOString(),
      events: []
    })
    setName(''); setTarget(''); setWhy('')
    setLoading(false)
  }

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '28px',
    }}>
      <h2 style={{ color: 'var(--amber)', marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>
        + New Goal
      </h2>

      <label style={labelStyle}>Goal name</label>
      <input
        placeholder="e.g. Hit ₹10L revenue by Q3"
        value={name}
        onChange={e => setName(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>Target date</label>
      <input
        type="date"
        value={target}
        onChange={e => setTarget(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>Why does this matter?</label>
      <textarea
        placeholder="Write the reasoning behind this goal..."
        value={why}
        onChange={e => setWhy(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !name || !why}
        style={{
          ...btnStyle,
          opacity: loading || !name || !why ? 0.5 : 1,
          cursor: loading || !name || !why ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Saving to Membrain...' : 'Save Goal'}
      </button>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: 'var(--muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: '14px',
  marginBottom: '16px',
  outline: 'none',
}

const btnStyle = {
  width: '100%',
  background: 'var(--amber)',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '14px',
  fontWeight: '600',
}