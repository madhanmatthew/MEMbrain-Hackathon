import { useState } from 'react'
import { storeMemory, waitForJob } from '../api/membrain'
function getEventType(text) {
  const t = text.toLowerCase()

  if (
    t.includes("lost") ||
    t.includes("delay") ||
    t.includes("drop") ||
    t.includes("spike") ||
    t.includes("cost") ||
    t.includes("issue")
  ) {
    return "negative"
  }

  if (
    t.includes("closed") ||
    t.includes("growth") ||
    t.includes("increase") ||
    t.includes("reduced") ||
    t.includes("saved") ||
    t.includes("negotiated") ||
    t.includes("referral")
  ) {
    return "positive"
  }

  return "neutral"
}
export default function EventLog({ goal, onEventAdded }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLog = async () => {
  if (!text.trim()) return
  setLoading(true)
  try {
    const res = await storeMemory({
      content: text,
      metadata: {
        type: 'event',
        goalId: goal.id,
        goalName: goal.name,
        date: new Date().toISOString()
      }
    })
    if (res.job_id) await waitForJob(res.job_id)
    onEventAdded(goal.id, {
      id: res.memory_id ?? Date.now(),
      text,
      date: new Date().toLocaleDateString(),
      sentiment: 'positive'
    })
    setText('')
  } catch (err) {
    console.error('Failed to log event:', err)
  }
  setLoading(false)
}

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
        Log an event
        <span style={{ color: 'var(--muted)', fontWeight: '400', marginLeft: '8px', fontSize: '12px' }}>
          for "{goal.name}"
        </span>
      </h3>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          placeholder="What happened today? e.g. Closed a ₹50k deal"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLog()}
          style={{
            flex: 1,
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleLog}
          disabled={loading || !text.trim()}
          style={{
            background: 'var(--teal)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? '...' : 'Log'}
        </button>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(goal.events ?? []).length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            No events yet — log your first one above
          </p>
        )}
        {[...(goal.events ?? [])].reverse().map(ev => (
          <div key={ev.id} style={{
            background: 'var(--bg3)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: ev.sentiment === 'positive' ? 'var(--teal)' : 'var(--muted)',
                flexShrink: 0
              }} />
              <p style={{ fontSize: '13px', color: 'var(--text)' }}>{ev.text}</p>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{ev.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}