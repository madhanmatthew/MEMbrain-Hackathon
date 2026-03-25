import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function TrendGraph({ goals }) {
  const ref = useRef()

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 400
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }

    const allData = goals.map(goal => {
      let score = 0

      return goal.events?.map((e, i) => {
        if (e.sentiment === 'positive') score += 1
        else if (e.sentiment === 'negative') score -= 1

        return {
          x: i,
          y: score
        }
      }) || []
    })

    const x = d3.scaleLinear()
      .domain([0, 5])
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([-5, 5])
      .range([height - margin.bottom, margin.top])

    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX)

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    // Lines
    allData.forEach((data, i) => {
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", i === 0 ? "#EF9F27" : "#1D9E75")
        .attr("stroke-width", 2)
        .attr("d", line)
    })

  }, [goals])

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ color: 'var(--amber)', marginBottom: '10px' }}>
        Goal Trends
      </h3>

      <svg
        ref={ref}
        width={800}
        height={400}
        style={{
          background: "#0f0f13",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      />
    </div>
  )
}