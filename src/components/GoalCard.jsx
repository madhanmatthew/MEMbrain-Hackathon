import { useState } from 'react'

export default function GoalCard({ goal, onSelect, selected }) {
  const health = goal.health ?? 0.8
  const decayColor = health > 0.6 ? 'var(--teal)' : health > 0.3 ? 'var(--amber)' : 'var(--coral)'
  const daysLeft = goal.target
    ? Math.ceil((new Date(goal.target) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      onClick={() => onSelect(goal)}
      style={{
        background: selected ? 'var(--bg3)' : 'var(--bg2)',
        border: `1px solid ${selected ? 'var(--amber)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: 0.4 + health * 0.6,
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text)', marginBottom: '6px' }}>
            {goal.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            {goal.why}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '16px' }}>
          <PulseCircle color={decayColor} health={health} />
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
            {Math.round(health * 100)}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
        {daysLeft !== null && (
          <Stat label="Days left" value={daysLeft > 0 ? daysLeft : 'Overdue'} warn={daysLeft < 7} />
        )}
        <Stat label="Events" value={goal.events?.length ?? 0} />
        <Stat label="Health" value={health > 0.6 ? 'Good' : health > 0.3 ? 'Fading' : 'Critical'} warn={health < 0.4} />
      </div>

      <div style={{ marginTop: '12px', height: '3px', background: 'var(--bg3)', borderRadius: '2px' }}>
        <div style={{
          height: '100%',
          width: `${health * 100}%`,
          background: decayColor,
          borderRadius: '2px',
          transition: 'width 0.8s ease'
        }} />
      </div>
    </div>
  )
}

function PulseCircle({ color, health }) {
  return (
    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: color,
        opacity: 0.15,
        animation: `pulse ${2 - health}s ease-in-out infinite`
      }} />
      <div style={{
        position: 'absolute', inset: '6px',
        borderRadius: '50%',
        background: color,
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.4); opacity: 0.05; }
        }
      `}</style>
    </div>
  )
}

function Stat({ label, value, warn }) {
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
      <p style={{ fontSize: '13px', fontWeight: '600', color: warn ? 'var(--coral)' : 'var(--text)', marginTop: '2px' }}>
        {value}
      </p>
    </div>
  )
}