import React, { useEffect, useRef, useState } from 'react';

const LINE_COLORS = {
  Blue: '#3B82F6', Yellow: '#EAB308', Red: '#EF4444',
  Green: '#22C55E', Violet: '#8B5CF6', Pink: '#EC4899',
  Magenta: '#D946EF', Orange: '#F97316', Grey: '#9CA3AF',
};

export default function MapCanvas({ stations, highlightPath = [] }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const lastPos  = useRef({ x: 0, y: 0 });

  const highlightIds = new Set(highlightPath.map((s) => s.id));

  // Group stations by line for drawing edges
  const byLine = stations.reduce((acc, s) => {
    if (!acc[s.line]) acc[s.line] = [];
    acc[s.line].push(s);
    return acc;
  }, {});

  // Pan handlers
  const onMouseDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setTransform((t) => ({
      ...t,
      x: t.x + e.clientX - lastPos.current.x,
      y: t.y + e.clientY - lastPos.current.y,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { dragging.current = false; };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({ ...t, scale: Math.min(4, Math.max(0.4, t.scale * delta)) }));
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Build path edges for highlight
  const pathEdges = new Set();
  for (let i = 0; i < highlightPath.length - 1; i++) {
    pathEdges.add(`${highlightPath[i].id}-${highlightPath[i + 1].id}`);
    pathEdges.add(`${highlightPath[i + 1].id}-${highlightPath[i].id}`);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0F172A', borderRadius: 12, overflow: 'hidden' }}>
      {/* Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['+', '−', '⌂'].map((icon, i) => (
          <button key={i} onClick={() => {
            if (i === 0) setTransform((t) => ({ ...t, scale: Math.min(4, t.scale * 1.3) }));
            if (i === 1) setTransform((t) => ({ ...t, scale: Math.max(0.4, t.scale * 0.77) }));
            if (i === 2) setTransform({ x: 0, y: 0, scale: 1 });
          }} style={{
            width: 32, height: 32, borderRadius: 8, background: '#1E293B',
            border: '1px solid #334155', color: '#F1F5F9', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{icon}</button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 10, background: '#1E293B99', borderRadius: 8, padding: '8px 12px' }}>
        {Object.entries(LINE_COLORS).slice(0, 5).map(([line, color]) => (
          <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 20, height: 4, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{line}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 10, zIndex: 20,
          background: '#1E293B', border: '1px solid #334155', borderRadius: 8,
          padding: '8px 12px', pointerEvents: 'none', minWidth: 150,
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#F1F5F9' }}>{tooltip.name}</div>
          <div style={{ fontSize: 11, color: LINE_COLORS[tooltip.line] || '#94A3B8', marginTop: 2 }}>{tooltip.line} Line</div>
          {tooltip.interchange && (
            <div style={{ fontSize: 11, color: '#FCD34D', marginTop: 2 }}>⇄ Interchange</div>
          )}
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>ID: {tooltip.id}</div>
        </div>
      )}

      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: dragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* Draw line edges (connect consecutive stations on same line) */}
          {Object.entries(byLine).map(([line, stns]) => {
            const sorted = [...stns].sort((a, b) => a.id - b.id);
            const color = LINE_COLORS[line] || '#6B7280';
            return sorted.slice(0, -1).map((s, i) => {
              const next = sorted[i + 1];
              const isHighlighted = pathEdges.has(`${s.id}-${next.id}`);
              return (
                <line key={`${s.id}-${next.id}`}
                  x1={s.x} y1={s.y} x2={next.x} y2={next.y}
                  stroke={isHighlighted ? '#FBBF24' : color}
                  strokeWidth={isHighlighted ? 4 : 2.5}
                  strokeOpacity={isHighlighted ? 1 : 0.5}
                />
              );
            });
          })}

          {/* Draw stations */}
          {stations.map((s) => {
            const color = LINE_COLORS[s.line] || '#6B7280';
            const isHighlighted = highlightIds.has(s.id);
            const isFirst = highlightPath[0]?.id === s.id;
            const isLast  = highlightPath[highlightPath.length - 1]?.id === s.id;
            const r = s.interchange ? 7 : 5;

            return (
              <g key={s.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => setTooltip({ ...s, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Glow for highlighted */}
                {isHighlighted && (
                  <circle cx={s.x} cy={s.y} r={r + 5} fill={isFirst || isLast ? '#FBBF24' : '#3B82F6'} opacity={0.25} />
                )}
                <circle
                  cx={s.x} cy={s.y} r={r}
                  fill={isFirst || isLast ? '#FBBF24' : isHighlighted ? '#60A5FA' : color}
                  stroke={s.interchange ? '#F59E0B' : '#0F172A'}
                  strokeWidth={s.interchange ? 2 : 1}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}