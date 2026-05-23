import React, { useEffect, useRef, useState } from 'react';
import { useMetroRoute, useStations } from '../hooks/useMetroRoute';

const LINE_COLORS = {
  Blue:'#4A90E2', Yellow:'#E8A000', Red:'#F05252',
  Green:'#34C98A', Violet:'#9B59B6', Pink:'#E91E8C',
  Magenta:'#C026D3', Airport:'#0EA5E9', Grey:'#9CA3AF',
};

function formatTime(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  return m > 0 ? `${m} min${s % 60 > 0 ? ' ' + (s % 60) + 's' : ''}` : `${s}s`;
}

// Returns the "primary" line for display purposes.
// For multi-line interchange stations we pick the line that
// matches the previous station's primary line — i.e., you are
// still on the same line until you actually need to change.
function getPrimaryLine(station, prevPrimaryLine) {
  const lines = station.line.split(',').map(l => l.trim());
  if (lines.length === 1) return lines[0];
  // If previous line is still served at this station, stay on it
  if (prevPrimaryLine && lines.includes(prevPrimaryLine)) return prevPrimaryLine;
  return lines[0];
}

// Build display-ready path: annotate where actual line changes happen
function buildDisplayPath(path) {
  if (!path || path.length === 0) return [];
  const result = [];
  let activeLine = null;

  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    const primary = getPrimaryLine(s, activeLine);
    const lineChanged = activeLine !== null && primary !== activeLine;
    result.push({ ...s, primaryLine: primary, lineChanged });
    activeLine = primary;
  }
  return result;
}

function Tag({ children, color, bg }) {
  return (
    <span style={{
      display:'inline-block', fontSize:10, fontWeight:700,
      padding:'2px 8px', borderRadius:20, letterSpacing:'0.04em',
      background: bg || (color + '18'), color,
    }}>{children}</span>
  );
}

function RouteStep({ station, isFirst, isLast }) {
  const color = LINE_COLORS[station.primaryLine] || '#6C63FF';
  return (
    <div style={{ display:'flex', gap:14 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:18, flexShrink:0 }}>
        <div style={{
          width: isFirst || isLast ? 16 : station.interchange ? 12 : 10,
          height: isFirst || isLast ? 16 : station.interchange ? 12 : 10,
          borderRadius:'50%',
          border:`2.5px solid ${color}`,
          background: station.interchange || isFirst || isLast ? color : '#fff',
          boxShadow: station.interchange ? `0 0 0 3px ${color}28` : 'none',
          flexShrink:0, zIndex:1, marginTop:4,
        }}/>
        {!isLast && <div style={{ width:2, flex:1, minHeight:16, background:color, opacity:0.22, marginTop:2 }}/>}
      </div>

      <div style={{ paddingBottom: isLast ? 0 : 10, flex:1 }}>
        {/* Line change banner — only when it actually changes */}
        {station.lineChanged && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:5,
            fontSize:10, fontWeight:700, color:'#E8A000',
            background:'#E8A00012', border:'1px solid #E8A00030',
            borderRadius:6, padding:'2px 8px', marginBottom:5,
            letterSpacing:'0.05em',
          }}>
            ⇄ CHANGE TO {station.primaryLine.toUpperCase()} LINE
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
          <span style={{ fontSize:13.5, fontWeight: isFirst || isLast ? 700 : 400, color:'var(--text)' }}>
            {station.name}
          </span>
          {station.interchange && !isFirst && !isLast && (
            <Tag color="#E8A000">INTERCHANGE</Tag>
          )}
          {isFirst && <Tag color={color}>START</Tag>}
          {isLast  && <Tag color={color}>END</Tag>}
        </div>

        {/* Show all lines served at interchange, else just primary */}
        <div style={{ display:'flex', gap:5, marginTop:3, flexWrap:'wrap' }}>
          {station.line.split(',').map(l => l.trim()).map(l => (
            <span key={l} style={{
              fontSize:11, fontWeight:500,
              color: LINE_COLORS[l] || '#6C63FF',
              background: (LINE_COLORS[l] || '#6C63FF') + '12',
              padding:'1px 6px', borderRadius:10,
            }}>{l} Line</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, accent }) {
  return (
    <div style={{
      background:'var(--surface)', borderRadius:'var(--radius-sm)',
      padding:'16px 18px', flex:1, minWidth:90,
      border:'1px solid var(--border)',
    }}>
      <div style={{ fontSize:20, marginBottom:5 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:700, color: accent||'var(--accent)' }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const { result, loading, error, findRoute } = useMetroRoute();
  const { stations, loading:stLoading, fetchAll } = useStations();
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');
  const [algo, setAlgo] = useState('dijkstra');
  const resultRef = useRef(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (result && resultRef.current)
      resultRef.current.scrollIntoView({ behavior:'smooth', block:'start' });
  }, [result]);

  const handleSubmit = e => { e.preventDefault(); if (from && to) findRoute(from, to, algo); };

  const grouped = stations.reduce((acc, s) => {
    // Use first line for grouping
    const line = s.line.split(',')[0].trim();
    if (!acc[line]) acc[line] = [];
    acc[line].push(s);
    return acc;
  }, {});

  const selectStyle = {
    width:'100%', padding:'11px 14px',
    borderRadius:'var(--radius-sm)', border:'1.5px solid var(--border)',
    background:'var(--surface)', color:'var(--text)', fontSize:14,
    outline:'none', cursor:'pointer', appearance:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237B7894' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:36,
  };

  const displayPath = buildDisplayPath(result?.path);

  // Count actual line changes
  const lineChanges = displayPath.filter(s => s.lineChanged).length;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign:'center', marginBottom:48, animation:'fadeUp 0.5s ease both' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'rgba(108,99,255,0.10)', color:'var(--accent)',
          borderRadius:30, padding:'5px 16px', fontSize:12, fontWeight:600,
          letterSpacing:'0.05em', marginBottom:18,
        }}>
          <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--accent)',display:'inline-block',animation:'pulse-ring 1.5s ease infinite' }}/>
          GRAPH-POWERED NAVIGATION
        </div>
        <h1 style={{
          fontFamily:"'DM Serif Display',serif",
          fontSize:'clamp(32px,5vw,52px)', color:'var(--text)',
          lineHeight:1.15, letterSpacing:'-1px', marginBottom:14,
        }}>
          Navigate Delhi Metro<br/>
          <em style={{ color:'var(--accent)', fontStyle:'italic' }}>Intelligently</em>
        </h1>
        <p style={{ color:'var(--muted)', fontSize:16, maxWidth:480, margin:'0 auto' }}>
          Real-time route planning powered by Dijkstra & BFS graph algorithms
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:28, alignItems:'start' }}>
        {/* Form */}
        <div style={{
          background:'var(--surface)', borderRadius:'var(--radius)',
          padding:28, border:'1px solid var(--border)', boxShadow:'var(--shadow)',
          animation:'fadeUp 0.5s 0.1s ease both',
        }}>
          <h2 style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>Find Route</h2>
          <p style={{ fontSize:12, color:'var(--muted)', marginBottom:24 }}>Select stations and algorithm</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:7,letterSpacing:'0.04em' }}>STARTING STATION</label>
              <select value={from} onChange={e=>setFrom(e.target.value)} style={selectStyle} required>
                <option value="">Select station</option>
                {Object.entries(grouped).map(([line,stns])=>(
                  <optgroup key={line} label={`${line} Line`}>
                    {stns.map(s=><option key={s.id} value={s.id}>{s.name}{s.interchange?' ⇄':''}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ display:'flex', justifyContent:'center' }}>
              <button type="button" onClick={()=>{setFrom(to);setTo(from);}}
                style={{ width:36,height:36,borderRadius:'50%',background:'var(--card)',border:'1.5px solid var(--border)',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)' }}>
                ⇅
              </button>
            </div>

            <div>
              <label style={{ fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:7,letterSpacing:'0.04em' }}>DESTINATION STATION</label>
              <select value={to} onChange={e=>setTo(e.target.value)} style={selectStyle} required>
                <option value="">Select station</option>
                {Object.entries(grouped).map(([line,stns])=>(
                  <optgroup key={line} label={`${line} Line`}>
                    {stns.map(s=><option key={s.id} value={s.id}>{s.name}{s.interchange?' ⇄':''}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize:12,fontWeight:600,color:'var(--muted)',display:'block',marginBottom:7,letterSpacing:'0.04em' }}>ALGORITHM</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{key:'dijkstra',label:'Dijkstra',sub:'Fastest time',icon:'⚡'},{key:'bfs',label:'BFS',sub:'Fewest stops',icon:'🔢'}].map(({key,label,sub,icon})=>(
                  <button type="button" key={key} onClick={()=>setAlgo(key)} style={{
                    padding:'10px 12px', borderRadius:'var(--radius-sm)',
                    border:`1.5px solid ${algo===key?'var(--accent)':'var(--border)'}`,
                    background: algo===key?'rgba(108,99,255,0.07)':'var(--surface)',
                    cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                  }}>
                    <div style={{ fontSize:15,marginBottom:2 }}>{icon}</div>
                    <div style={{ fontSize:13,fontWeight:600,color:algo===key?'var(--accent)':'var(--text)' }}>{label}</div>
                    <div style={{ fontSize:11,color:'var(--muted)' }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading||!from||!to||stLoading} style={{
              padding:'13px', borderRadius:'var(--radius-sm)', border:'none',
              background:'linear-gradient(135deg,var(--accent),#9B8FFF)',
              color:'#fff', fontWeight:700, fontSize:15,
              cursor:(!from||!to)?'not-allowed':'pointer',
              opacity:(!from||!to)?0.55:1,
              boxShadow:'0 4px 16px rgba(108,99,255,0.3)',
              fontFamily:"'DM Sans',sans-serif",
            }}>
              {loading ? '⏳ Calculating…' : '🚇 Find Route'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop:16,padding:12,background:'#FEF2F2',borderRadius:'var(--radius-sm)',color:'#DC2626',fontSize:13,border:'1px solid #FECACA' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Result */}
        <div style={{ animation:'fadeUp 0.5s 0.2s ease both' }} ref={resultRef}>
          {!result && !loading && (
            <div style={{ background:'var(--surface)',borderRadius:'var(--radius)',border:'1.5px dashed var(--border)',padding:'60px 24px',textAlign:'center' }}>
              <div style={{ fontSize:48,marginBottom:16 }}>🗺️</div>
              <div style={{ fontWeight:600,fontSize:16,color:'var(--text)',marginBottom:8 }}>Ready to plan your journey</div>
              <div style={{ color:'var(--muted)',fontSize:13 }}>Select your stations to begin</div>
            </div>
          )}

          {loading && (
            <div style={{ background:'var(--surface)',borderRadius:'var(--radius)',border:'1px solid var(--border)',padding:'60px 24px',textAlign:'center' }}>
              <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid var(--border)',borderTopColor:'var(--accent)',animation:'spin 0.8s linear infinite',margin:'0 auto 16px' }}/>
              <div style={{ color:'var(--muted)',fontSize:13 }}>Running {algo} algorithm…</div>
            </div>
          )}

          {result && !loading && (
            <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
              {/* Stats */}
              <div style={{ display:'flex', gap:12 }}>
                <StatBox icon="⏱" label="Travel Time" value={formatTime(result.totalTime)} accent="var(--accent)"/>
                <StatBox icon="🛑" label="Stops"       value={result.stops}                accent="#34C98A"/>
                <StatBox icon="💰" label="Fare"         value={`₹${result.fare}`}          accent="#E8A000"/>
                <StatBox icon="🔄" label="Line Changes" value={lineChanges}                accent="#F05252"/>
              </div>

              {/* Algo badge */}
              <div style={{ background:'var(--surface)',borderRadius:'var(--radius)',border:'1px solid var(--border)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:'rgba(108,99,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>
                    {result.algorithm==='dijkstra'?'⚡':'🔢'}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14 }}>{result.algorithm==='dijkstra'?'Dijkstra Algorithm':'BFS Algorithm'}</div>
                    <div style={{ fontSize:12,color:'var(--muted)' }}>{result.algorithm==='dijkstra'?'Minimum weighted path — O((V+E) log V)':'Fewest stops — O(V+E)'}</div>
                  </div>
                </div>
                <Tag color={result.found?'#34C98A':'#F05252'} bg={result.found?'#34C98A15':'#F0525215'}>
                  {result.found?'✓ Route Found':'✗ No Route'}
                </Tag>
              </div>

              {/* Path */}
              {result.found && (
                <div style={{ background:'var(--surface)',borderRadius:'var(--radius)',border:'1px solid var(--border)',overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontWeight:700,fontSize:14 }}>Route Path</span>
                    <div style={{ display:'flex',gap:12,fontSize:12,color:'var(--muted)' }}>
                      <span>{result.path.length} stations</span>
                      {lineChanges > 0 && <span style={{ color:'#E8A000',fontWeight:600 }}>{lineChanges} line change{lineChanges>1?'s':''}</span>}
                    </div>
                  </div>
                  <div style={{ padding:'20px', maxHeight:420, overflowY:'auto' }}>
                    {displayPath.map((station, idx) => (
                      <RouteStep
                        key={station.id + '-' + idx}
                        station={station}
                        isFirst={idx === 0}
                        isLast={idx === displayPath.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
