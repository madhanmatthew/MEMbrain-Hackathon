import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#EF9F27', '#7F77DD', '#1D9E75', '#D85A30', '#ED93B1']

export default function TrendGraph({ goals }) {
  const ref = useRef()
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState(null)
  const [activeGoals, setActiveGoals] = useState(() => goals.map(g => g.id))
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const toggleGoal = (id) => {
    setActiveGoals(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.getBoundingClientRect().width || 800
    const width = containerWidth
    const height = 320
    const margin = { top: 30, right: 30, bottom: 50, left: 50 }

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    // Background
    svg.append('rect')
      .attr('width', width).attr('height', height)
      .attr('fill', 'transparent')

    // Grid lines
    const gridColor = 'rgba(255,255,255,0.04)'

    // Build per-goal data
    const allSeries = goals
      .filter(g => activeGoals.includes(g.id))
      .map((goal, gi) => {
        let score = 0.5
        const points = [{ x: 0, y: score, label: 'Start', event: null }]
        goal.events?.forEach((e, i) => {
          if (e.sentiment === 'positive') score = Math.min(1, score + 0.15)
          else if (e.sentiment === 'negative') score = Math.max(0, score - 0.12)
          points.push({ x: i + 1, y: score, label: e.text, event: e, goalName: goal.name })
        })
        return { goal, points, color: COLORS[gi % COLORS.length] }
      })

    const maxX = Math.max(...allSeries.map(s => s.points.length - 1), 4)

    const x = d3.scaleLinear()
      .domain([0, maxX])
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])

    // Horizontal grid
    const yTicks = [0, 0.25, 0.5, 0.75, 1]
    yTicks.forEach(tick => {
      svg.append('line')
        .attr('x1', margin.left).attr('x2', width - margin.right)
        .attr('y1', y(tick)).attr('y2', y(tick))
        .attr('stroke', tick === 0.5 ? 'rgba(255,255,255,0.1)' : gridColor)
        .attr('stroke-dasharray', tick === 0.5 ? '4 4' : '0')
        .attr('stroke-width', 1)
    })

    // Y axis labels
    const yLabels = { 0: 'Critical', 0.25: 'Low', 0.5: 'Neutral', 0.75: 'Good', 1: 'Peak' }
    yTicks.forEach(tick => {
      svg.append('text')
        .attr('x', margin.left - 8)
        .attr('y', y(tick) + 4)
        .attr('text-anchor', 'end')
        .attr('fill', 'rgba(255,255,255,0.25)')
        .attr('font-size', '10px')
        .attr('font-family', 'sans-serif')
        .text(yLabels[tick])
    })

    // X axis labels
    for (let i = 0; i <= maxX; i++) {
      svg.append('text')
        .attr('x', x(i))
        .attr('y', height - margin.bottom + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.2)')
        .attr('font-size', '10px')
        .attr('font-family', 'sans-serif')
        .text(i === 0 ? 'Start' : `E${i}`)
    }

    // Vertical grid
    for (let i = 0; i <= maxX; i++) {
      svg.append('line')
        .attr('x1', x(i)).attr('x2', x(i))
        .attr('y1', margin.top).attr('y2', height - margin.bottom)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
    }

    // Draw each series
    allSeries.forEach(({ goal, points, color }) => {
      if (points.length < 2) return

      const lineGen = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveMonotoneX)

      const areaGen = d3.area()
        .x(d => x(d.x))
        .y0(height - margin.bottom)
        .y1(d => y(d.y))
        .curve(d3.curveMonotoneX)

      // Gradient fill
      const gradId = `grad-${goal.id}`
      const defs = svg.append('defs')
      const grad = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0').attr('y1', '0')
        .attr('x2', '0').attr('y2', '1')
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.25)
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0)

      // Area
      svg.append('path')
        .datum(points)
        .attr('fill', `url(#${gradId})`)
        .attr('d', areaGen)

      // Line with animation
      const path = svg.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', lineGen)

      const totalLength = path.node().getTotalLength()
      path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)

      // Data points
      points.forEach((d, i) => {
        if (i === 0) return
        const circle = svg.append('circle')
          .attr('cx', x(d.x))
          .attr('cy', y(d.y))
          .attr('r', 5)
          .attr('fill', color)
          .attr('stroke', '#080810')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .style('opacity', 0)

        circle.transition().delay(1200 + i * 80).duration(300).style('opacity', 1)

        circle
          .on('mouseover', function (event) {
            d3.select(this).attr('r', 8).attr('stroke-width', 3)
            const [mx, my] = d3.pointer(event, svg.node())
            setTooltip({
              x: mx, y: my,
              text: d.label,
              goalName: goal.name,
              color,
              sentiment: d.event?.sentiment,
              health: Math.round(d.y * 100)
            })
            setHoveredPoint(d)
          })
          .on('mouseout', function () {
            d3.select(this).attr('r', 5).attr('stroke-width', 2)
            setTooltip(null)
            setHoveredPoint(null)
          })
      })
    })

    // Milestone labels (last point of each series)
    allSeries.forEach(({ goal, points, color }) => {
      const last = points[points.length - 1]
      if (!last || points.length < 2) return
      svg.append('text')
        .attr('x', x(last.x) + 10)
        .attr('y', y(last.y) + 4)
        .attr('fill', color)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', 'sans-serif')
        .text(goal.name.length > 18 ? goal.name.slice(0, 18) + '…' : goal.name)
        .style('opacity', 0)
        .transition().delay(1400).duration(400).style('opacity', 1)
    })

  }, [goals, activeGoals])

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ color: '#EF9F27', fontSize: '16px', fontWeight: '700', margin: 0 }}>Goal Trends</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '3px' }}>
            Health score over time · hover points for details
          </p>
        </div>

        {/* Legend / toggles */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {goals.map((g, i) => {
            const color = COLORS[i % COLORS.length]
            const active = activeGoals.includes(g.id)
            return (
              <motion.button
                key={g.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleGoal(g.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '99px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: active ? color : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: active ? color : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                  maxWidth: '120px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {g.name.length > 16 ? g.name.slice(0, 16) + '…' : g.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <svg ref={ref} style={{ width: '100%', display: 'block' }} />

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                left: tooltip.x + 16,
                top: tooltip.y - 60,
                background: 'rgba(15,15,28,0.95)',
                border: `1px solid ${tooltip.color}40`,
                borderRadius: '10px',
                padding: '10px 14px',
                pointerEvents: 'none',
                zIndex: 50,
                minWidth: '160px',
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${tooltip.color}20`
              }}
            >
              <p style={{ fontSize: '11px', color: tooltip.color, fontWeight: '700', marginBottom: '4px' }}>
                {tooltip.goalName}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px', lineHeight: 1.4 }}>
                {tooltip.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: tooltip.sentiment === 'positive' ? '#1D9E75' : tooltip.sentiment === 'negative' ? '#D85A30' : '#888'
                }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  Health: {tooltip.health}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(goals.length, 4)}, 1fr)`, gap: '10px', marginTop: '20px' }}>
        {goals.map((g, i) => {
          const color = COLORS[i % COLORS.length]
          const positives = g.events?.filter(e => e.sentiment === 'positive').length ?? 0
          const negatives = g.events?.filter(e => e.sentiment === 'negative').length ?? 0
          return (
            <div key={g.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color}25`,
              borderRadius: '10px', padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.name.length > 20 ? g.name.slice(0, 20) + '…' : g.name}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#1D9E75' }}>{positives}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>positive</p>
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#D85A30' }}>{negatives}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>negative</p>
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700', color }}>
                    {Math.round(g.health * 100)}%
                  </p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>health</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}