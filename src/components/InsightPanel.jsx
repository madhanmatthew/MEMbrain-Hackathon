import { useState } from 'react'
import { searchMemories } from '../api/membrain'

// 🧠 NEW: FINAL INSIGHT BUILDER (SAFE)
function buildFinalInsight({ problems = [], positives = [], patterns = [] }) {
  let mainReason = ""
  let supportingReason = ""

  if (problems.length > 0) {
    mainReason = `due to recent setbacks such as ${problems[0]}`
  } else if (patterns.length > 0) {
    mainReason = `due to inconsistent performance`
  } else if (positives.length > 0) {
    mainReason = `with generally positive progress`
  } else {
    mainReason = `due to limited activity`
  }

  if (patterns.length > 0) {
    supportingReason = `inconsistent signals across events`
  } else if (positives.length > 0 && problems.length > 0) {
    supportingReason = `both positive and negative signals`
  } else if (positives.length > 0) {
    supportingReason = `some positive momentum`
  } else {
    supportingReason = `low activity levels`
  }

  return `Your goal appears to be affected ${mainReason}, with ${supportingReason}. This is likely causing the observed inconsistency.`
}

export default function InsightPanel({ goals, onHighlight }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // 🧠 UPDATED: SMART INSIGHTS WITH FINAL INSIGHT
  const generateInsights = (query, goals) => {
    const insights = []
    const q = query.toLowerCase()

    goals.forEach(goal => {
      const events = goal.events || []

      const problems = []
      const positives = []
      const patterns = []

      const negatives = events.filter(e =>
        e.text.toLowerCase().includes("lost") ||
        e.text.toLowerCase().includes("delay") ||
        e.text.toLowerCase().includes("issue")
      )

      const positiveEvents = events.filter(e =>
        e.text.toLowerCase().includes("closed") ||
        e.text.toLowerCase().includes("growth") ||
        e.text.toLowerCase().includes("increase") ||
        e.text.toLowerCase().includes("viral")
      )

      // PROBLEMS
      if (
        q.includes("off track") ||
        q.includes("not growing") ||
        q.includes("problem") ||
        q.includes("issue") ||
        q.includes("why")
      ) {
        if (negatives.length > 0) {
          problems.push(...negatives.map(e => e.text))

          insights.push({
            goalName: goal.name,
            insight: `Problems detected: ${problems.join(", ")}`,
            score: "High relevance"
          })
        }
      }

      // ATTENTION
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

      // PATTERNS
      if (
        q.includes("pattern") ||
        q.includes("trend") ||
        q.includes("inconsistent") ||
        q.includes("why")
      ) {
        if (positiveEvents.length && negatives.length) {
          patterns.push("mixed signals")

          insights.push({
            goalName: goal.name,
            insight: "Mixed signals — inconsistent progress observed",
            score: "Pattern found"
          })
        } else if (positiveEvents.length) {
          positives.push(...positiveEvents.map(e => e.text))

          insights.push({
            goalName: goal.name,
            insight: "Consistent positive momentum",
            score: "Good trend"
          })
        }
      }

      // PERFORMANCE
      if (
        q.includes("performing") ||
        q.includes("growth")
      ) {
        if (positiveEvents.length > 0) {
          positives.push(...positiveEvents.map(e => e.text))

          insights.push({
            goalName: goal.name,
            insight: `Positive drivers: ${positives.join(", ")}`,
            score: "Strong"
          })
        }
      }

      // 🔥 NEW: FINAL INSIGHT (ONLY IF DATA EXISTS)
      if (problems.length || positives.length || patterns.length) {
        const finalInsight = buildFinalInsight({
          problems,
          positives,
          patterns
        })

        insights.push({
          goalName: goal.name,
          insight: finalInsight,
          score: "Final Insight",
          isFinal: true
        })
      }
    })

    return insights
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const localInsights = generateInsights(query, goals)

      if (localInsights.length > 0) {
        setResults(localInsights)
      } else {
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
          }}
        />
        <button onClick={handleSearch}>
          {loading ? '...' : 'Ask'}
        </button>
      </div>

      {!loading && results.map((r, i) => (
        <div
          key={i}
          onClick={() => onHighlight(r.goalName)}
          style={{
            cursor: 'pointer',
            background: 'var(--bg3)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '10px',
            borderLeft: r.isFinal ? '4px solid #a78bfa' : '3px solid var(--purple)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontWeight: '600' }}>{r.goalName}</p>
            {r.score && <span>{r.score}</span>}
          </div>

          <p style={{
            marginTop: '6px',
            color: r.isFinal ? '#a78bfa' : 'var(--muted)',
            fontWeight: r.isFinal ? '600' : 'normal'
          }}>
            {r.insight}
          </p>
        </div>
      ))}
    </div>
  )
}