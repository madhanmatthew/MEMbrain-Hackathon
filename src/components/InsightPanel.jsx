import { useState } from 'react'
import { searchMemories } from '../api/membrain'

export default function InsightPanel({ goals }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // 🧠 SMART LOCAL INSIGHTS
  const generateInsights = (query, goals) => {
  const insights = []
  const q = query.toLowerCase()

  goals.forEach(goal => {
    const events = goal.events || []

    const negatives = events.filter(e =>
      e.text.toLowerCase().includes("lost") ||
      e.text.toLowerCase().includes("delay") ||
      e.text.toLowerCase().includes("issue")
    )

    const positives = events.filter(e =>
      e.text.toLowerCase().includes("closed") ||
      e.text.toLowerCase().includes("growth") ||
      e.text.toLowerCase().includes("increase") ||
      e.text.toLowerCase().includes("viral")
    )

    // 🧠 BROADER "PROBLEM" DETECTION
    if (
      q.includes("off track") ||
      q.includes("not growing") ||
      q.includes("not increasing") ||
      q.includes("problem") ||
      q.includes("issue") ||
      q.includes("why")
    ) {
      if (negatives.length > 0) {
        insights.push({
          goalName: goal.name,
          insight: `Problems detected: ${negatives.map(e => e.text).join(", ")}`,
          score: "High relevance"
        })
      }
    }

    // ⚠️ ATTENTION
    if (
      q.includes("attention") ||
      q.includes("focus") ||
      q.includes("improve")
    ) {
      if (events.length < 2) {
        insights.push({
          goalName: goal.name,
          insight: "Low activity — this goal needs more focus",
          score: "Priority"
        })
      }
    }

    // 📊 PATTERNS
    if (
      q.includes("pattern") ||
      q.includes("trend") ||
      q.includes("inconsistent")
    ) {
      if (positives.length && negatives.length) {
        insights.push({
          goalName: goal.name,
          insight: "Mixed signals — inconsistent progress observed",
          score: "Pattern found"
        })
      } else if (positives.length) {
        insights.push({
          goalName: goal.name,
          insight: "Consistent positive momentum",
          score: "Good trend"
        })
      }
    }

    // 🚀 PERFORMANCE (NEW — IMPORTANT)
    if (
      q.includes("performing") ||
      q.includes("doing well") ||
      q.includes("growth")
    ) {
      if (positives.length > 0) {
        insights.push({
          goalName: goal.name,
          insight: `Positive drivers: ${positives.map(e => e.text).join(", ")}`,
          score: "Strong"
        })
      }
    }
  })

  return insights
}

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      // 🔥 FIRST: USE SMART LOCAL INSIGHTS
      const localInsights = generateInsights(query, goals)

      if (localInsights.length > 0) {
        setResults(localInsights)
      } else {
        // 🔁 FALLBACK TO MEMBRAIN
        const data = await searchMemories(query)
        const memories = data.results ?? data.memories ?? []

        const mapped = memories.slice(0, 3).map(m => ({
          goalName: m.metadata?.name ?? 'Related memory',
          insight: m.content ?? m.text ?? 'Insight from memory',
          score: m.score ? (m.score * 100).toFixed(0) + '%' : null
        }))

        setResults(mapped)
      }

    } catch (err) {
      console.error('Search failed:', err)

      // 🔥 EVEN ON ERROR → USE LOCAL
      const fallback = generateInsights(query, goals)
      setResults(fallback)
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
          Analyzing goal memory...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          No strong signals found — try adding more events.
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
                {r.score}
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
          {[
            'Why is my top goal off track?',
            'Which goal needs attention?',
            'What patterns do you see?'
          ].map(q => (
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