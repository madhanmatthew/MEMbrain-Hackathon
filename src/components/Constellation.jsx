import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function Constellation({ goals }) {
  const ref = useRef()

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 500

    // 🌌 Container for zoom
    const container = svg.append("g")

    // 🔍 Zoom + Pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform)
      })

    svg.call(zoom)

    // 🧠 Build nodes + links
    const nodes = []
    const links = []

    goals.forEach(goal => {
      nodes.push({
        id: "g-" + goal.id,
        label: goal.name,
        type: "goal"
      })

      goal.events?.forEach(ev => {
        const eventId = "e-" + ev.id

        nodes.push({
          id: eventId,
          label: ev.text,
          type: "event"
        })

        links.push({
          source: "g-" + goal.id,
          target: eventId
        })
      })
    })

    // ✨ Glow effect
    const defs = svg.append("defs")

    const glow = defs.append("filter").attr("id", "glow")
    glow.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur")

    const merge = glow.append("feMerge")
    merge.append("feMergeNode").attr("in", "coloredBlur")
    merge.append("feMergeNode").attr("in", "SourceGraphic")

    // 🌠 Initial positions
    nodes.forEach(d => {
      d.x = width / 2 + (Math.random() - 0.5) * 300
      d.y = height / 2 + (Math.random() - 0.5) * 300
    })

    // ⚡ Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(160))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    // 🔗 Links
    const link = container.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#444")
      .attr("stroke-width", 1.2)

    // 🌟 Nodes
    const node = container.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => d.type === "goal" ? 18 : 8)
      .attr("fill", d => d.type === "goal" ? "#EF9F27" : "#1D9E75")
      .attr("stroke", "#fff")
      .attr("stroke-width", d => d.type === "goal" ? 2 : 0)
      .attr("filter", "url(#glow)")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )

    // 📝 Labels (only goals)
    const text = container.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.type === "goal" ? d.label : "")
      .attr("fill", "#fff")
      .attr("font-size", "11px")

    // 🟢 TOOLTIP (NEW)
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#111")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)

    // 🔥 Hover interaction + tooltip
    node.on("mouseover", function (event, d) {
      node.attr("opacity", n => n.id === d.id ? 1 : 0.2)

      link.attr("opacity", l =>
        l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
      )

      // show tooltip ONLY for events
      if (d.type === "event") {
        tooltip
          .style("opacity", 1)
          .html(d.label)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
      }
    })

    node.on("mouseout", function () {
      node.attr("opacity", 1)
      link.attr("opacity", 1)
      tooltip.style("opacity", 0)
    })

    // 🎯 Click focus
    node.on("click", (event, d) => {
      const scale = 1.5
      const x = width / 2 - d.x * scale
      const y = height / 2 - d.y * scale

      svg.transition().duration(600).call(
        zoom.transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      )
    })

    // 🔄 Tick update (WITH BOUNDARY FIX)
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node
        .attr("cx", d => d.x = Math.max(20, Math.min(width - 20, d.x)))
        .attr("cy", d => d.y = Math.max(20, Math.min(height - 20, d.y)))

      text
        .attr("x", d => d.x + 12)
        .attr("y", d => d.y + 4)
    })

    simulation.alpha(1).restart()

    // 🔁 Reset zoom
    svg.on("dblclick", () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity)
    })

    // 🖱️ Drag
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

  }, [goals])

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ color: 'var(--amber)', marginBottom: '10px' }}>
        Goal Constellation
      </h3>

      <svg
        ref={ref}
        width={800}
        height={500}
        style={{
          background: "#0f0f13",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      />
    </div>
  )
}