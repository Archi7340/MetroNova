import React, { useEffect, useState, useRef } from 'react';
import { useMetroRoute, useStations } from '../hooks/useMetroRoute';
import axios from 'axios';

const LINE_COLORS = {
  Blue: '#4A90E2', Yellow: '#F5A623', Red: '#F05252',
  Green: '#34C98A', Violet: '#9B59B6',
};

function formatTime(s) {
  if (!s && s !== 0) return '—';
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ── Section card ──────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', padding: 28,
      boxShadow: 'var(--shadow)', ...style,
    }}>
      {children}
    </div>
  );
}

// ── Algo result column ────────────────────────────────────────────────────────
function AlgoColumn({ icon, name, color, complexityTime, complexitySpace, useCase, result, loading }) {
  return (
    <div style={{
      flex: 1, border: `1.5px solid ${color}30`,
      borderRadius: 'var(--radius)', overflow: 'hidden',
      background: 'var(--surface)',
      boxShadow: `0 4px 20px ${color}12`,
    }}>
      {/* Header */}
      <div style={{ background: `${color}10`, padding: '18px 20px', borderBottom: `1.5px solid ${color}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{name}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{useCase}</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', background: `${color}15`, color, padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>
            Time: {complexityTime}
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', background: `${color}15`, color, padding: '3px 8px', borderRadius: 6, display: 'inline-block', marginTop: 4 }}>
            Space: {complexitySpace}
          </div>
        </div>
      </div>

      {/* Result body */}
      <div style={{ padding: '18px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${color}30`, borderTopColor: color, animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Computing…</div>
          </div>
        )}

        {!loading && !result && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>
            Select stations and run
          </div>
        )}

        {!loading && result && !result.found && (
          <div style={{ color: '#F05252', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
            No path found
          </div>
        )}

        {!loading && result?.found && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Travel Time', value: formatTime(result.totalTime), icon: '⏱' },
              { label: 'Stops',       value: result.stops,                  icon: '🛑' },
              { label: 'Fare',        value: `₹${result.fare}`,            icon: '💰' },
              { label: 'Stations',    value: result.path?.length,           icon: '📍' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--card)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{icon} {label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}

            {/* Mini path preview */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.04em' }}>PATH PREVIEW</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {result.path.slice(0, 5).map((s, i) => (
                  <React.Fragment key={s.id}>
                    <span style={{ fontSize: 11, background: `${LINE_COLORS[s.line] || '#6C63FF'}15`, color: LINE_COLORS[s.line] || '#6C63FF', padding: '2px 7px', borderRadius: 20 }}>{s.name}</span>
                    {i < Math.min(4, result.path.length - 1) && <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>→</span>}
                  </React.Fragment>
                ))}
                {result.path.length > 5 && <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>…+{result.path.length - 5} more</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DFS result display (no path, just reachability) ────────────────────────
function DFSColumn({ result, loading, stationName }) {
  return (
    <div style={{
      flex: 1, border: '1.5px solid #34C98A30',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      background: 'var(--surface)',
      boxShadow: '0 4px 20px #34C98A12',
    }}>
      <div style={{ background: '#34C98A10', padding: '18px 20px', borderBottom: '1.5px solid #34C98A20' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>🌐</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>DFS</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          Network reachability from source station. Explores all reachable stations using depth-first traversal.
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', background: '#34C98A15', color: '#34C98A', padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>Time: O(V + E)</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', background: '#34C98A15', color: '#34C98A', padding: '3px 8px', borderRadius: 6, display: 'inline-block', marginTop: 4 }}>Space: O(V)</div>
        </div>
      </div>

      <div style={{ padding: '18px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #34C98A30', borderTopColor: '#34C98A', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Traversing…</div>
          </div>
        )}
        {!loading && !result && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>Select a station and run</div>
        )}
        {!loading && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--card)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Reachable from {stationName || 'source'}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#34C98A' }}>{result.reachableFromStart}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>of {result.totalStations} total stations</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--card)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Network connected?</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: result.connected ? '#34C98A' : '#F05252' }}>
                {result.connected ? '✓ Fully Connected' : '✗ Disconnected'}
              </div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--card)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Components</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#4A90E2' }}>{result.components}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Analysis() {
  const { stations, loading: stLoading, fetchAll } = useStations();
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [running, setRunning] = useState(false);
  const [dijRes, setDijRes]   = useState(null);
  const [bfsRes, setBfsRes]   = useState(null);
  const [dfsRes, setDfsRes]   = useState(null);
  const [winner, setWinner]   = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runAll = async () => {
    if (!from || !to) return;
    setRunning(true);
    setDijRes(null); setBfsRes(null); setDfsRes(null); setWinner(null);
    try {
      const [d, b, dfs] = await Promise.all([
        axios.get('/api/route', { params: { from, to, algo: 'dijkstra' } }),
        axios.get('/api/route', { params: { from, to, algo: 'bfs' } }),
        axios.get('/api/stations/connectivity'),
      ]);
      setDijRes(d.data);
      setBfsRes(b.data);
      setDfsRes(dfs.data);
      // determine winner
      if (d.data.found && b.data.found) {
        if (d.data.totalTime < b.data.totalTime) setWinner('dijkstra');
        else if (b.data.stops < d.data.stops)   setWinner('bfs');
        else setWinner('tie');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const fromStation = stations.find(s => String(s.id) === String(from));
  const grouped = stations.reduce((acc, s) => { const line = s.line.split(',')[0].trim(); if (!acc[line]) acc[line] = []; acc[line].push(s); return acc; }, {});

  const selectStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text)', fontSize: 14,
    outline: 'none', cursor: 'pointer', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237B7894' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36,
  };

  // bar chart data
  const metrics = dijRes?.found && bfsRes?.found ? [
    { label: 'Travel Time (s)', dij: dijRes.totalTime, bfs: bfsRes.totalTime, unit: 's' },
    { label: 'Stops',           dij: dijRes.stops,     bfs: bfsRes.stops,     unit: '' },
    { label: 'Fare (₹)',        dij: dijRes.fare,       bfs: bfsRes.fare,     unit: '₹' },
    { label: 'Stations in path', dij: dijRes.path?.length, bfs: bfsRes.path?.length, unit: '' },
  ] : [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px,4vw,40px)', color: 'var(--text)', marginBottom: 8 }}>
          Algorithm <em style={{ color: 'var(--accent)' }}>Analysis</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>Compare Dijkstra, BFS, and DFS side-by-side on the same route</p>
      </div>

      {/* Input card */}
      <Card style={{ animation: 'fadeUp 0.4s 0.1s ease both' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>FROM STATION</label>
            <select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>
              <option value="">Select station</option>
              {Object.entries(grouped).map(([line, stns]) => (
                <optgroup key={line} label={`${line} Line`}>
                  {stns.map(s => <option key={s.id} value={s.id}>{s.name}{s.interchange ? ' ⇄' : ''}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 7, letterSpacing: '0.04em' }}>TO STATION</label>
            <select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>
              <option value="">Select station</option>
              {Object.entries(grouped).map(([line, stns]) => (
                <optgroup key={line} label={`${line} Line`}>
                  {stns.map(s => <option key={s.id} value={s.id}>{s.name}{s.interchange ? ' ⇄' : ''}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <button onClick={runAll} disabled={running || !from || !to}
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'linear-gradient(135deg,var(--accent),#9B8FFF)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: (!from || !to) ? 'not-allowed' : 'pointer',
              opacity: (!from || !to) ? 0.5 : 1, whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
              fontFamily: "'DM Sans',sans-serif",
            }}>
            {running ? '⏳ Running…' : '⚡ Run All Algorithms'}
          </button>
        </div>
      </Card>

      {/* Three columns */}
      <div style={{ display: 'flex', gap: 20, animation: 'fadeUp 0.4s 0.2s ease both' }}>
        <AlgoColumn
          icon="⚡" name="Dijkstra" color="#6C63FF"
          complexityTime="O((V+E) log V)" complexitySpace="O(V)"
          useCase="Finds the minimum-weight path between two nodes using a priority queue. Best for weighted graphs where edge weights differ."
          result={dijRes} loading={running}
        />
        <AlgoColumn
          icon="🔢" name="BFS" color="#4A90E2"
          complexityTime="O(V + E)" complexitySpace="O(V)"
          useCase="Explores all neighbours level by level. Finds the path with the fewest number of edges (stops), ignoring weights."
          result={bfsRes} loading={running}
        />
        <DFSColumn result={dfsRes} loading={running} stationName={fromStation?.name} />
      </div>

      {/* Comparison chart */}
      {metrics.length > 0 && (
        <Card style={{ animation: 'fadeUp 0.4s 0.3s ease both' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Side-by-Side Comparison</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>Visual breakdown of key metrics</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {metrics.map(({ label, dij, bfs, unit }) => {
              const max = Math.max(dij, bfs, 1);
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--muted)' }}>
                    <span style={{ fontWeight: 600 }}>{label}</span>
                    <span>Dijkstra: <b style={{ color: '#6C63FF' }}>{unit === '₹' ? '₹' : ''}{dij}{unit === 's' ? 's' : ''}</b> · BFS: <b style={{ color: '#4A90E2' }}>{unit === '₹' ? '₹' : ''}{bfs}{unit === 's' ? 's' : ''}</b></span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[{ val: dij, color: '#6C63FF', lbl: 'Dijkstra' }, { val: bfs, color: '#4A90E2', lbl: 'BFS' }].map(({ val, color, lbl }) => (
                      <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 52, fontSize: 11, color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}>{lbl}</span>
                        <div style={{ flex: 1, height: 12, background: 'var(--card)', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 6,
                            width: `${(val / max) * 100}%`,
                            background: color,
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                            minWidth: val > 0 ? 8 : 0,
                          }} />
                        </div>
                        <span style={{ width: 40, fontSize: 12, fontWeight: 700, color }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Winner callout */}
      {winner && (
        <Card style={{ background: 'linear-gradient(135deg,rgba(108,99,255,0.06),rgba(74,144,226,0.06))', animation: 'fadeUp 0.4s 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 36 }}>
              {winner === 'dijkstra' ? '⚡' : winner === 'bfs' ? '🔢' : '🤝'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 3 }}>
                {winner === 'tie'
                  ? 'Both algorithms found the same route!'
                  : `${winner === 'dijkstra' ? 'Dijkstra' : 'BFS'} is better for this journey`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {winner === 'dijkstra' && `Saves ${formatTime(bfsRes.totalTime - dijRes.totalTime)} travel time`}
                {winner === 'bfs'      && `${dijRes.stops - bfsRes.stops} fewer stops`}
                {winner === 'tie'      && 'Both paths are equivalent in time and stops'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Complexity reference table */}
      <Card style={{ animation: 'fadeUp 0.4s 0.5s ease both' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Complexity Reference</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--card)' }}>
                {['Algorithm', 'Time Complexity', 'Space Complexity', 'Data Structure', 'Best For', 'Metro Use Case'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { algo: 'Dijkstra', time: 'O((V+E) log V)', space: 'O(V)', ds: 'Min-Heap (Priority Queue)', best: 'Weighted shortest path', use: 'Minimum travel time', color: '#6C63FF' },
                { algo: 'BFS',      time: 'O(V + E)',       space: 'O(V)', ds: 'Queue (FIFO)',             best: 'Unweighted shortest path', use: 'Fewest stops', color: '#4A90E2' },
                { algo: 'DFS',      time: 'O(V + E)',       space: 'O(V)', ds: 'Stack / Recursion',       best: 'Reachability / cycle detection', use: 'Network connectivity', color: '#34C98A' },
              ].map((row, i) => (
                <tr key={row.algo} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--card)40' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: row.color }}>{row.algo}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--accent)', fontSize: 12 }}>{row.time}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--accent)', fontSize: 12 }}>{row.space}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{row.ds}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text)' }}>{row.best}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
