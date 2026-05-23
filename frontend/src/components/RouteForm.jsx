import React, { useState } from 'react';

const LINE_COLORS = {
  Blue: '#2563EB', Yellow: '#EAB308', Red: '#DC2626',
  Green: '#16A34A', Violet: '#7C3AED', Pink: '#DB2777',
  Magenta: '#C026D3', Orange: '#EA580C', Grey: '#6B7280',
};

export default function RouteForm({ stations, onFind, onCompare, loading }) {
  const [from, setFrom]     = useState('');
  const [to, setTo]         = useState('');
  const [algo, setAlgo]     = useState('dijkstra');
  const [mode, setMode]     = useState('single'); // 'single' | 'compare'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    if (mode === 'compare') onCompare(from, to);
    else onFind(from, to, algo);
  };

  const grouped = stations.reduce((acc, s) => {
    if (!acc[s.line]) acc[s.line] = [];
    acc[s.line].push(s);
    return acc;
  }, {});

  const selectStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #334155', background: '#1E293B',
    color: '#F1F5F9', fontSize: 14, cursor: 'pointer',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* From */}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
          FROM STATION
        </label>
        <select value={from} onChange={(e) => setFrom(e.target.value)} style={selectStyle} required>
          <option value="">Select departure station</option>
          {Object.entries(grouped).map(([line, stns]) => (
            <optgroup key={line} label={`${line} Line`}>
              {stns.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.interchange ? ' ⇄' : ''}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Swap button */}
      <button
        type="button"
        onClick={() => { setFrom(to); setTo(from); }}
        style={{
          alignSelf: 'center', background: '#334155', border: 'none',
          borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
          color: '#F1F5F9', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Swap stations"
      >⇅</button>

      {/* To */}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
          TO STATION
        </label>
        <select value={to} onChange={(e) => setTo(e.target.value)} style={selectStyle} required>
          <option value="">Select destination station</option>
          {Object.entries(grouped).map(([line, stns]) => (
            <optgroup key={line} label={`${line} Line`}>
              {stns.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.interchange ? ' ⇄' : ''}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['single', 'compare'].map((m) => (
          <button
            key={m} type="button"
            onClick={() => setMode(m)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              fontWeight: 500, border: '1.5px solid',
              borderColor: mode === m ? '#3B82F6' : '#334155',
              background: mode === m ? '#1D4ED8' : 'transparent',
              color: mode === m ? '#fff' : '#94A3B8',
            }}
          >
            {m === 'single' ? '🔍 Find Route' : '⚡ Compare Algorithms'}
          </button>
        ))}
      </div>

      {/* Algorithm selector (single mode only) */}
      {mode === 'single' && (
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'dijkstra', label: 'Dijkstra', desc: 'Fastest time' },
            { key: 'bfs',      label: 'BFS',      desc: 'Fewest stops' },
          ].map(({ key, label, desc }) => (
            <button
              key={key} type="button"
              onClick={() => setAlgo(key)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: algo === key ? '#10B981' : '#334155',
                background: algo === key ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: algo === key ? '#10B981' : '#94A3B8',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !from || !to}
        style={{
          padding: '12px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: loading ? '#334155' : 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
          color: '#fff', fontWeight: 700, fontSize: 15,
          opacity: (!from || !to) ? 0.5 : 1,
        }}
      >
        {loading ? '⏳ Calculating…' : mode === 'compare' ? '⚡ Compare' : '🚇 Find Route'}
      </button>
    </form>
  );
}