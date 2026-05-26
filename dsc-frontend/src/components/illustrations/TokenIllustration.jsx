export default function TokenIllustration({ state = 'idle' }) {
  const isReading = state === 'reading';
  const isDone    = state === 'done';

  const ledColor  = isDone ? '#22c55e' : isReading ? '#f59e0b' : '#818cf8';
  const ledGlow   = isDone ? '#22c55e' : '#f59e0b';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 150 }}>

      {/* Pulse rings when reading */}
      {isReading && (
        <>
          <div style={{
            position: 'absolute', width: 130, height: 130, borderRadius: '50%',
            border: '2px solid #818cf8', opacity: 0.25,
            animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite',
          }} />
          <div style={{
            position: 'absolute', width: 100, height: 100, borderRadius: '50%',
            border: '2px solid #1d4ed8', opacity: 0.18,
            animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.45s',
          }} />
        </>
      )}

      <svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: 240, height: 130, position: 'relative', zIndex: 10 }}>

        {/* ═══════════════════════════════════
            GROUND SHADOW
        ═══════════════════════════════════ */}
        <ellipse cx="105" cy="122" rx="68" ry="7" fill="#e0e7ff" opacity="0.55" />

        {/* ═══════════════════════════════════
            USB DSC SECURITY TOKEN
            (modelled after ePass2003 / WatchData form factor)
        ═══════════════════════════════════ */}

        {/* Token body */}
        <rect x="8" y="42" width="150" height="46" rx="10" fill="url(#tokenBody)" />

        {/* Top sheen */}
        <rect x="8" y="42" width="150" height="15" rx="10" fill="white" opacity="0.08" />

        {/* Bottom shadow line */}
        <rect x="13" y="79" width="140" height="9" rx="5" fill="black" opacity="0.13" />

        {/* ── Gold smart-card chip ── */}
        <rect x="22" y="51" width="36" height="28" rx="5" fill="#f59e0b" />
        <rect x="22" y="51" width="36" height="28" rx="5" fill="url(#chipShine)" />
        {/* Chip contact grid lines */}
        {[30, 37, 44, 51].map(x => (
          <line key={`cv-${x}`} x1={x} y1="51" x2={x} y2="79" stroke="#d97706" strokeWidth="0.75" opacity="0.65" />
        ))}
        {[62, 71].map(y => (
          <line key={`ch-${y}`} x1="22" y1={y} x2="58" y2={y} stroke="#d97706" strokeWidth="0.75" opacity="0.65" />
        ))}
        {/* Inner chip die */}
        <rect x="28" y="57" width="24" height="14" rx="2.5" fill="#fbbf24" opacity="0.45" />
        <rect x="31" y="60" width="18" height="8" rx="1.5" fill="#d97706" opacity="0.3" />

        {/* ── Brand label area ── */}
        <rect x="70" y="53" width="50" height="7" rx="3.5" fill="white" opacity="0.2" />
        <rect x="70" y="65" width="38" height="5" rx="2.5" fill="white" opacity="0.13" />
        <rect x="70" y="75" width="26" height="4" rx="2" fill="white" opacity="0.08" />

        {/* ── LED status indicator ── */}
        <circle cx="143" cy="52" r={isDone ? 5.5 : 4.5} fill={ledColor}>
          {isReading && (
            <animate attributeName="opacity" values="1;0.2;1" dur="0.65s" repeatCount="indefinite" />
          )}
        </circle>
        {/* LED glow */}
        {(isReading || isDone) && (
          <circle cx="143" cy="52" r="9" fill={ledGlow} opacity="0.22">
            {isReading && (
              <animate attributeName="r" values="6;11;6" dur="0.65s" repeatCount="indefinite" />
            )}
          </circle>
        )}

        {/* ── USB-A Connector (right end of token body) ── */}
        {/* Metal housing */}
        <rect x="154" y="49" width="23" height="32" rx="3" fill="#1e293b" />
        {/* Upper contact bar */}
        <rect x="156" y="53" width="19" height="10" rx="1.5" fill="#64748b" />
        {/* Lower contact area */}
        <rect x="156" y="64" width="19" height="9" rx="1.5" fill="#334155" />
        {/* Side notches */}
        <rect x="154" y="55" width="3" height="6" rx="1" fill="#0f172a" opacity="0.4" />
        <rect x="154" y="69" width="3" height="6" rx="1" fill="#0f172a" opacity="0.4" />

        {/* ═══════════════════════════════════
            LAPTOP / PC USB PORT
        ═══════════════════════════════════ */}

        {/* Device body */}
        <rect x="184" y="28" width="52" height="74" rx="7" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* USB-A port slot */}
        <rect x="184" y="46" width="20" height="38" rx="3.5" fill="#1e293b" />
        {/* Port inner contact guide */}
        <rect x="186" y="52" width="16" height="11" rx="1.5" fill="#334155" />
        {/* Port inner bottom */}
        <rect x="186" y="65" width="16" height="9" rx="1" fill="#0f172a" opacity="0.6" />

        {/* Device decorative slots (look like ventilation / status lights) */}
        {[34, 44, 54, 64, 74, 84].map((y, i) => (
          <rect
            key={y}
            x={208} y={y}
            width={[34, 26, 30, 22, 28, 18][i]}
            height={4} rx={2}
            fill="#e2e8f0"
          />
        ))}

        {/* ═══════════════════════════════════
            DATA FLOW PARTICLES (reading state)
        ═══════════════════════════════════ */}
        {isReading && [
          { delay: '0s',    r: 3.5, opacity: 0.75 },
          { delay: '0.3s',  r: 2.8, opacity: 0.55 },
          { delay: '0.6s',  r: 2.2, opacity: 0.35 },
        ].map(({ delay, r, opacity }, i) => (
          <circle key={i} cx="170" cy="65" r={r} fill="#818cf8" opacity={opacity}>
            <animate attributeName="cx" values="162;181;162" dur="0.9s" begin={delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${opacity};0;${opacity}`} dur="0.9s" begin={delay} repeatCount="indefinite" />
          </circle>
        ))}

        {/* ═══════════════════════════════════
            SUCCESS CHECKMARK OVERLAY
        ═══════════════════════════════════ */}
        {isDone && (
          <g style={{ animation: 'popIn 0.3s ease both' }}>
            <circle cx="83" cy="65" r="26" fill="#22c55e" opacity="0.1" />
            <circle cx="83" cy="65" r="18" fill="#22c55e" />
            <path d="M74.5 65l7 7 11.5-11.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        <defs>
          <linearGradient id="tokenBody" x1="8" y1="42" x2="158" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#312e81" />
            <stop offset="0.4" stopColor="#4338ca" />
            <stop offset="1" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="chipShine" x1="22" y1="51" x2="58" y2="79" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.4" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
