import React from 'react';

function formatTime(s) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export default function CompareResult({ compared }) {
  if (!compared) return null;
  const { dijkstra, bfs } = compared;

  const cards = [
    {
      algo: 'Dijkstra',
      icon: '⚡',
      result: dijkstra,
      color: '#3B82F6',
      desc: 'Shortest travel time using weighted edges',
    },
    {
      algo: 'BFS',
      icon: '🔢',
      result: bfs,
      color: '#10B981',
      desc: 'Fewest stops, unweighted traversal',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: '#64748B' }}>Algorithm comparison — same source & destination</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {cards.map(({ algo, icon, result, color, desc }) => (
          <div key={algo} style={{
            background: '#1E293B', borderRadius: 12, padding: 16,
            border: `1.5px solid ${color}44`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, color, fontSize: 15 }}>{algo}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{desc}</div>
              </div>
            </div>

            {result.found ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: '⏱ Time',  value: formatTime(result.totalTime) },
                  { label: '🛑 Stops', value: result.stops },
                  { label: '💰 Fare',  value: `₹${result.fare}` },
                  { label: '📍 Via',   value: `${result.path.length} stations` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748B' }}>{label}</span>
                    <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#EF4444', fontSize: 13 }}>No route found</div>
            )}
          </div>
        ))}
      </div>

      {/* Winner callout */}
      {dijkstra.found && bfs.found && (
        <div style={{
          background: '#0F172A', borderRadius: 10, padding: 12,
          border: '1px solid #334155', fontSize: 13, color: '#94A3B8',
          display: 'flex', gap: 16, justifyContent: 'center',
        }}>
          {dijkstra.totalTime < bfs.totalTime
            ? <span>⚡ Dijkstra is <strong style={{ color: '#3B82F6' }}>{formatTime(bfs.totalTime - dijkstra.totalTime)} faster</strong></span>
            : <span>Both routes have identical travel time</span>
          }
          {dijkstra.stops < bfs.stops
            ? <span> · BFS uses <strong style={{ color: '#10B981' }}>{bfs.stops - dijkstra.stops} fewer stops</strong></span>
            : dijkstra.stops > bfs.stops
            ? <span> · BFS uses <strong style={{ color: '#10B981' }}>{dijkstra.stops - bfs.stops} fewer stops</strong></span>
            : null
          }
        </div>
      )}
    </div>
  );
}