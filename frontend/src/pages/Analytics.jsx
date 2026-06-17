import React, { useEffect, useState } from 'react';
import { useStations } from '../hooks/UseMetroRoute';

const LINE_COLORS = {
  Blue: '#3B82F6', Yellow: '#EAB308', Red: '#EF4444',
  Green: '#22C55E', Violet: '#8B5CF6', Pink: '#EC4899',
};

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: '#1E293B', borderRadius: 12, padding: '18px 20px',
      border: '1px solid #334155', flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || '#F1F5F9' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function Analytics() {
  const { stations, interchanges, connectivity, loading, fetchAll } = useStations();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <div style={{ color: '#94A3B8', padding: 40, textAlign: 'center' }}>Loading network data…</div>;

  const lineStats = stations.reduce((acc, s) => {
    if (!acc[s.line]) acc[s.line] = 0;
    acc[s.line]++;
    return acc;
  }, {});

  const maxLineCount = Math.max(...Object.values(lineStats), 1);

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', color: '#F1F5F9' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Network Analytics</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>Delhi Metro graph statistics and connectivity analysis</p>

      {/* Top stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatBadge label="Total Stations"   value={stations.length}      color="#60A5FA" />
        <StatBadge label="Interchange Nodes" value={interchanges.length} color="#FBBF24" />
        <StatBadge label="Metro Lines"       value={Object.keys(lineStats).length} color="#34D399" />
        {connectivity && <>
          <StatBadge label="Graph Components" value={connectivity.components} color="#F87171" />
          <StatBadge label="Fully Connected"   value={connectivity.connected ? '✅ Yes' : '❌ No'} color="#A78BFA" />
        </>}
      </div>

      {/* Stations per line */}
      <div style={{ background: '#1E293B', borderRadius: 14, padding: 24, marginBottom: 24, border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#94A3B8' }}>Stations per Line</h2>
        {Object.entries(lineStats).sort((a, b) => b[1] - a[1]).map(([line, count]) => (
          <div key={line} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: LINE_COLORS[line] || '#94A3B8', fontWeight: 500 }}>{line} Line</span>
              <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{count} stations</span>
            </div>
            <div style={{ height: 8, background: '#0F172A', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${(count / maxLineCount) * 100}%`,
                background: LINE_COLORS[line] || '#6B7280',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Interchange stations list */}
      <div style={{ background: '#1E293B', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#94A3B8' }}>
          Interchange Stations ({interchanges.length})
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {interchanges.map((s) => (
            <span key={s.id} style={{
              background: '#0F172A', border: '1px solid #F59E0B44', borderRadius: 20,
              padding: '4px 12px', fontSize: 12, color: '#FCD34D',
            }}>
              ⇄ {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Graph theory concepts */}
      <div style={{ marginTop: 24, background: '#1E293B', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#94A3B8' }}>Graph Properties</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
          {[
            ['Graph Type', 'Weighted Undirected'],
            ['Data Structure', 'Adjacency List'],
            ['Pathfinding', 'Dijkstra + BFS + DFS'],
            ['Time Complexity (Dijkstra)', 'O((V + E) log V)'],
            ['Time Complexity (BFS)', 'O(V + E)'],
            ['Space Complexity', 'O(V + E)'],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#0F172A', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: '#64748B', fontSize: 11, marginBottom: 2 }}>{k}</div>
              <div style={{ color: '#F1F5F9', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
