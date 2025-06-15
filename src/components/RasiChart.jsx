import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function RasiChart({ planets }) {
  const ref = useRef();
  useEffect(() => {
    const svg = d3.select(ref.current);
    const size = 200;
    const r = size / 2 - 10;
    svg.attr('viewBox', `0 0 ${size} ${size}`);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`);
    const arc = d3.arc().innerRadius(0).outerRadius(r);
    for (let i = 0; i < 12; i++) {
      g.append('path')
        .attr('d', arc({ startAngle: (i / 12) * 2 * Math.PI, endAngle: ((i + 1) / 12) * 2 * Math.PI }))
        .attr('fill', 'none')
        .attr('stroke', '#ccc');
    }
    if (Array.isArray(planets)) {
      planets.forEach(p => {
        const angle = (((p.sign - 1) * 30 + p.degree) * Math.PI) / 180;
        const x = (r - 10) * Math.cos(angle);
        const y = (r - 10) * Math.sin(angle);
        g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('font-size', 8)
          .text(p.name[0]);
      });
    }
  }, [planets]);
  return <svg ref={ref} />;
}
