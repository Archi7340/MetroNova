import React from 'react';

const LINE_COLORS = {
  Blue: '#2563EB',
  Yellow: '#CA8A04',
  Red: '#DC2626',
  Green: '#16A34A',
  Violet: '#7C3AED',
  Pink: '#DB2777',
  Magenta: '#C026D3',
  Orange: '#EA580C',
  Grey: '#6B7280',
};


function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0
    ? `${m} min ${s > 0 ? s + 's' : ''}`.trim()
    : `${s}s`;
}

function StatCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        background: '#1E293B',
        borderRadius: 10,
        padding: '12px 16px',
        border: '1px solid #334155',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 20 }}>{icon}</div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: color || '#F1F5F9',
          marginTop: 4,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#64748B',
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function RouteResult({ result }) {
  if (!result) return null;

  if (!result.found) {
    return (
      <div
        style={{
          padding: 20,
          background: '#450a0a',
          borderRadius: 12,
          border: '1px solid #991b1b',
          color: '#FCA5A5',
        }}
      >
        ❌ No route found between these stations.
      </div>
    );
  }

  const { path, totalTime, fare, stops, algorithm } = result;

  // REAL interchange count
  const interchangeCount = path.reduce((count, station, idx) => {
    if (idx === 0) return 0;

    const prev = path[idx - 1];

    return prev.name === station.name &&
      prev.line !== station.line
      ? count + 1
      : count;
  }, 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Algorithm badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            background: '#1D4ED8',
            color: '#BFDBFE',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 20,
          }}
        >
          {algorithm === 'dijkstra'
            ? '⚡ Dijkstra — Fastest Time'
            : '🔢 BFS — Fewest Stops'}
        </span>

        {interchangeCount > 0 && (
          <span
            style={{
              fontSize: 11,
              color: '#94A3B8',
            }}
          >
            {interchangeCount} interchange
            {interchangeCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 10,
        }}
      >
        <StatCard
          icon="⏱"
          label="Travel Time"
          value={formatTime(totalTime)}
          color="#34D399"
        />

        <StatCard
          icon="🛑"
          label="Stops"
          value={stops}
          color="#60A5FA"
        />

        <StatCard
          icon="💰"
          label="Fare"
          value={`₹${fare}`}
          color="#FBBF24"
        />
      </div>

      {/* Route path */}
      <div
        style={{
          background: '#0F172A',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #1E293B',
          maxHeight: 360,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: '#64748B',
            marginBottom: 12,
          }}
        >
          ROUTE PATH
        </div>

        {path.map((station, idx) => {
          const color =
            LINE_COLORS[station.line] || '#6B7280';

          const isFirst = idx === 0;
          const isLast = idx === path.length - 1;

          const prev =
            idx > 0 ? path[idx - 1] : null;

          // ONLY TRUE WHEN SAME STATION + DIFFERENT LINE
          const changedLine =
            prev &&
            prev.name === station.name &&
            prev.line !== station.line;

          return (
            <div
              key={`${station.id}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              {/* Timeline */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 20,
                }}
              >
                <div
                  style={{
                    width: isFirst || isLast ? 14 : 10,
                    height: isFirst || isLast ? 14 : 10,
                    borderRadius: '50%',
                    background: changedLine
                      ? '#F59E0B'
                      : color,
                    border: `2px solid ${
                      changedLine
                        ? '#D97706'
                        : color
                    }`,
                    marginTop: 4,
                  }}
                />

                {!isLast && (
                  <div
                    style={{
                      width: 2,
                      flexGrow: 1,
                      minHeight: 20,
                      background: color,
                      opacity: 0.35,
                    }}
                  />
                )}
              </div>

              {/* Station details */}
              <div
                style={{
                  flex: 1,
                  paddingBottom: isLast ? 0 : 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      color: '#F1F5F9',
                      fontSize: 14,
                      fontWeight:
                        isFirst || isLast
                          ? 700
                          : 400,
                    }}
                  >
                    {station.name}
                  </span>

                  {/* START */}
                  {isFirst && (
                    <span
                      style={{
                        fontSize: 10,
                        background: '#1E3A8A',
                        color: '#BFDBFE',
                        padding: '2px 6px',
                        borderRadius: 10,
                      }}
                    >
                      START
                    </span>
                  )}

                  {/* END */}
                  {isLast && (
                    <span
                      style={{
                        fontSize: 10,
                        background: '#14532D',
                        color: '#BBF7D0',
                        padding: '2px 6px',
                        borderRadius: 10,
                      }}
                    >
                      END
                    </span>
                  )}

                  {/* CHANGE LINE */}
                  {changedLine && (
                    <span
                      style={{
                        fontSize: 10,
                        background: '#78350F',
                        color: '#FCD34D',
                        padding: '2px 6px',
                        borderRadius: 10,
                      }}
                    >
                      CHANGE LINE
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: color,
                    fontWeight: 500,
                    background: color + '22',
                    padding: '2px 8px',
                    borderRadius: 10,
                    display: 'inline-block',
                    marginTop: 4,
                  }}
                >
                  {station.line} Line
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}