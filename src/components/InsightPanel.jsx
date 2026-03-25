import { useState } from 'react'
import { searchMemories } from '../api/membrain'

// 🧠 NEW: FINAL INSIGHT BUILDER (SAFE)
function buildFinalInsight({ problems = [], positives = [], patterns = [], query = "" }) {
  const q = query.toLowerCase()

  const mainProblem = problems[0]
  const mainPositive = positives[0]

  // 🧠 CASE 1 — WHY / OFF TRACK (MOST IMPORTANT)
  if (q.includes("why") || q.includes("off track")) {
    if (problems.length > 0 && patterns.length > 0) {
      return `Your goal is currently off track primarily because of ${mainProblem}. At the same time, your activity shows inconsistent progress, meaning positive and negative outcomes are not balanced — this instability is driving the issue.`
    }

    if (problems.length > 0) {
      return `Your goal is off track mainly due to ${mainProblem}, which is directly impacting progress and slowing momentum.`
    }

    if (patterns.length > 0) {
      return `Your goal appears off track due to inconsistent performance — results are fluctuating instead of progressing steadily.`
    }
  }

  // 🧠 CASE 2 — PATTERNS / TRENDS
  if (q.includes("pattern") || q.includes("trend") || q.includes("inconsistent")) {
    if (patterns.length > 0 && problems.length > 0) {
      return `There is a clear pattern of instability — while some progress is being made, setbacks like ${mainProblem} are interrupting consistency.`
    }

    if (patterns.length > 0) {
      return `Your progress pattern is inconsistent, indicating uneven execution or irregular activity affecting results.`
    }
  }

  // 🧠 CASE 3 — PERFORMANCE
  if (q.includes("performing") || q.includes("growth")) {
    if (positives.length > 0) {
      return `Your goal is performing well, supported by positive events like ${mainPositive}, which indicate strong forward momentum.`
    }
  }

  // 🧠 CASE 4 — ATTENTION
  if (q.includes("attention") || q.includes("focus")) {
    return `This goal requires more attention due to low activity, which limits progress and prevents consistent improvement.`
  }

  // 🧠 DEFAULT (fallback)
  if (problems.length > 0 && positives.length > 0) {
    return `Your goal is experiencing mixed outcomes — positive progress exists, but issues like ${mainProblem} are holding it back.`
  }

  if (problems.length > 0) {
    return `Your goal is being impacted by ${mainProblem}, which is slowing down overall progress.`
  }

  if (positives.length > 0) {
    return `Your goal is progressing positively, with strong signals such as ${mainPositive}.`
  }

  return `There is not enough activity to clearly determine the progress of this goal yet.`
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
          patterns,
          query 
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
        const seen = new Set()
const unique = []

localInsights.forEach(item => {
  const key = item.goalName + item.insight

  if (!seen.has(key)) {
    seen.add(key)
    unique.push(item)
  }
})

setResults(unique)
      } else {
        const data = await searchMemories(query)
        const memories = data.results ?? data.memories ?? []

        const mapped = memories.slice(0, 3).map(m => ({
          goalName: 'Relevant insight',
          insight: (m.content ?? '').slice(0, 120),
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
        <button
  onClick={handleSearch}
  disabled={loading || !query.trim()}
  style={{
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '80px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
    opacity: loading ? 0.6 : 1
  }}
>
  {loading ? '...' : 'Ask'}
</button>
      </div>
      {searched && !loading && results.length > 0 && (
  <div style={{
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <p style={{
      fontSize: '13px',
      color: 'var(--text)',
      fontWeight: '600'
    }}>
      Insights
    </p>

    <span style={{
      fontSize: '11px',
      color: 'var(--muted)'
    }}>
      {results.length} signals detected
    </span>
  </div>
)}
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
            borderLeft: r.isFinal ? '4px solid #a78bfa' : '3px solid var(--purple)',
background: r.isFinal ? 'rgba(167,139,250,0.08)' : 'var(--bg3)'
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