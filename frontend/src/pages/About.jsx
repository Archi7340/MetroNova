import React from 'react';

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', padding: 28,
      boxShadow: 'var(--shadow)', ...style,
    }}>{children}</div>
  );
}

function AlgoCard({ icon, name, color, steps, complexity }) {
  return (
    <div style={{
      border: `1.5px solid ${color}25`, borderRadius: 'var(--radius)',
      overflow: 'hidden', background: 'var(--surface)',
    }}>
      <div style={{ background: `${color}0E`, padding: '18px 20px', borderBottom: `1px solid ${color}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{name}</div>
            <code style={{ fontSize: 11, color, background: `${color}15`, padding: '2px 7px', borderRadius: 5 }}>{complexity}</code>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((s, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function About() {
  const algos = [
    {
      icon: '⚡', name: "Dijkstra's Algorithm", color: '#6C63FF',
      complexity: 'O((V+E) log V)',
      steps: [
        'Assign distance ∞ to all nodes; source = 0',
        'Push source into a min-heap priority queue',
        'Pop minimum-distance node; relax all edges',
        'If relaxed distance is smaller, update and push again',
        'Repeat until destination is reached',
        'Reconstruct path using predecessor array',
      ],
    },
    {
      icon: '🔢', name: 'Breadth-First Search', color: '#4A90E2',
      complexity: 'O(V + E)',
      steps: [
        'Mark source as visited; enqueue it',
        'Dequeue front node; explore all unvisited neighbours',
        'Mark each neighbour as visited; record predecessor',
        'Enqueue all new neighbours',
        'Stop when destination is dequeued',
        'Backtrack via predecessor array to get path',
      ],
    },
    {
      icon: '🌐', name: 'Depth-First Search', color: '#34C98A',
      complexity: 'O(V + E)',
      steps: [
        'Push source onto a stack (or use recursion)',
        'Pop top; if unvisited, mark it visited',
        'Push all unvisited neighbours onto stack',
        'Continue until stack is empty',
        'All visited nodes = reachable from source',
        'Use to detect connectivity & count components',
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Hero */}
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,4vw,40px)', color: 'var(--text)', marginBottom: 10 }}>
          About <em style={{ color: 'var(--accent)' }}>MetroNova</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 620 }}>
          A full-stack graph theory application that models the Delhi Metro network using C++ algorithms and visualises them through a modern web interface.
        </p>
      </div>

      {/* Stack overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, animation: 'fadeUp 0.4s 0.1s ease both' }}>
        {[
          { icon: '⚙️', title: 'C++ Engine',    desc: 'Dijkstra, BFS, DFS implemented from scratch using adjacency lists, priority queues, and stacks.', color: '#6C63FF' },
          { icon: '🌐', title: 'Node.js API',   desc: 'Express REST API that spawns the C++ binary, captures JSON output, and serves it to the frontend.', color: '#4A90E2' },
          { icon: '⚛️', title: 'React Client', desc: 'Interactive route planner, animated path visualisation, and side-by-side algorithm comparison.', color: '#34C98A' },
        ].map(({ icon, title, desc, color }) => (
          <Card key={title} style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
              background: `${color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>
          </Card>
        ))}
      </div>

      {/* Algo deep-dives */}
      <div style={{ animation: 'fadeUp 0.4s 0.2s ease both' }}>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>How the Algorithms Work</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Step-by-step breakdown of each algorithm used in MetroNova</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {algos.map(a => <AlgoCard key={a.name} {...a} />)}
        </div>
      </div>

      {/* Graph theory concepts */}
      <Card style={{ animation: 'fadeUp 0.4s 0.3s ease both' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Graph Theory in MetroNova</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { term: 'Graph Type',        def: 'Weighted, undirected — stations are vertices, tracks are edges' },
            { term: 'Edge Weight',       def: 'Travel time in seconds between adjacent stations (90–240s)' },
            { term: 'Adjacency List',    def: 'Each station maps to a list of neighbours + travel-time weights' },
            { term: 'Interchange Node', def: 'Stations where two or more metro lines intersect (high-degree vertices)' },
            { term: 'Fare Calculation', def: 'DMRC distance slabs: ₹10–₹60 based on approximate km travelled' },
            { term: 'Connectivity',     def: 'DFS from any node visits all 94 stations → graph is fully connected' },
          ].map(({ term, def }) => (
            <div key={term} style={{ background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>{term}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{def}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tech stack */}
      <Card style={{ animation: 'fadeUp 0.4s 0.4s ease both' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Tech Stack</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { name: 'C++17',        color: '#6C63FF' },
            { name: 'Node.js',      color: '#34C98A' },
            { name: 'Express',      color: '#4A90E2' },
            { name: 'React 18',     color: '#61DAFB', bg: '#0d1117' },
            { name: 'MongoDB',      color: '#34C98A' },
            { name: 'Mongoose',     color: '#880000' },
            { name: 'Axios',        color: '#5A29E4' },
            { name: 'React Router', color: '#CA4245' },
            { name: 'Dijkstra',     color: '#6C63FF' },
            { name: 'BFS',          color: '#4A90E2' },
            { name: 'DFS',          color: '#34C98A' },
            { name: 'Adjacency List', color: '#F5A623' },
          ].map(({ name, color }) => (
            <span key={name} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: `${color}12`, color, border: `1px solid ${color}30`,
            }}>{name}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
