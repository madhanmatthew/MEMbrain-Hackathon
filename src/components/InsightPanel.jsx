import { useState } from 'react'
import { searchMemories } from '../api/membrain'

export default function InsightPanel({ goals }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchMemories(query)
      const memories = data.results ?? data.memories ?? []
      const mapped = memories.slice(0, 3).map(m => ({
        goalName: m.metadata?.name ?? m.metadata?.goalName ?? m.metadata?.type ?? 'Related memory',
        insight: m.content ?? m.text ?? m.metadata?.why ?? 'No content available',
        score: m.score ? (m.score * 100).toFixed(0) : null,
        health: m.score ?? 0.7
      }))
      setResults(mapped)
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
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
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
        Ask your goals
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
        Powered by Membrain semantic search
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          placeholder="e.g. Why is my revenue goal off track?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
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
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            background: 'var(--purple)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>
          Searching Membrain memory...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          No insights found. Try logging more events first.
        </p>
      )}

      {!loading && results.map((r, i) => (
        <div key={i} style={{
          background: 'var(--bg3)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '10px',
          borderLeft: '3px solid var(--purple)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
              {r.goalName}
            </p>
            {r.score && (
              <span style={{
                fontSize: '11px',
                background: 'var(--bg2)',
                color: 'var(--purple)',
                padding: '2px 8px',
                borderRadius: '99px',
                border: '1px solid var(--border)'
              }}>
                {r.score}% match
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            {r.insight}
          </p>
        </div>
      ))}

      {!searched && goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Why is my top goal off track?', 'Which goal needs attention?', 'What patterns do you see?'].map(q => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: 'var(--muted)',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}