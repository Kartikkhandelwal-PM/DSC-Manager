export default function EmptyState() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-64 h-48">
      <ellipse cx="150" cy="208" rx="90" ry="9" fill="#e2e8f0"/>

      {/* back card */}
      <rect x="100" y="28" width="148" height="100" rx="16" fill="#ede9fe" stroke="#ddd6fe" strokeWidth="1.5"/>
      <rect x="118" y="52" width="64" height="8" rx="4" fill="#c4b5fd"/>
      <rect x="118" y="66" width="100" height="6" rx="3" fill="#ddd6fe"/>
      <rect x="118" y="78" width="80" height="6" rx="3" fill="#ddd6fe"/>

      {/* main card */}
      <rect x="52" y="52" width="148" height="108" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
      {/* card top accent */}
      <rect x="52" y="52" width="148" height="5" rx="3" fill="url(#cardGrad)"/>
      <rect x="52" y="55" width="148" height="2" fill="url(#cardGrad)" opacity="0.5"/>

      {/* card content */}
      <rect x="72" y="74" width="56" height="7" rx="3.5" fill="#818cf8"/>
      <rect x="72" y="87" width="108" height="5" rx="2.5" fill="#e2e8f0"/>
      <rect x="72" y="98" width="88" height="5" rx="2.5" fill="#e2e8f0"/>

      {/* progress bar */}
      <rect x="72" y="118" width="108" height="5" rx="2.5" fill="#f1f5f9"/>
      <rect x="72" y="118" width="60" height="5" rx="2.5" fill="url(#progressGrad)"/>

      {/* USB token */}
      <rect x="72" y="134" width="54" height="18" rx="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.2"/>
      <rect x="118" y="139" width="10" height="8" rx="2" fill="#a5b4fc"/>
      <rect x="79" y="138" width="28" height="10" rx="3" fill="#818cf8" opacity="0.5"/>

      {/* location pin */}
      <circle cx="156" cy="145" r="8" fill="#fef3c7" stroke="#fde68a" strokeWidth="1.2"/>
      <path d="M156 141 C153.8 141 152 142.8 152 145 C152 147.5 156 151 156 151 C156 151 160 147.5 160 145 C160 142.8 158.2 141 156 141Z" fill="#f59e0b"/>
      <circle cx="156" cy="145" r="1.5" fill="white"/>

      {/* Plus button */}
      <circle cx="172" cy="68" r="20" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
      <line x1="172" y1="61" x2="172" y2="75" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="165" y1="68" x2="179" y2="68" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round"/>

      <defs>
        <linearGradient id="cardGrad" x1="52" y1="52" x2="200" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1d4ed8"/><stop offset="1" stopColor="#1e3a8a"/>
        </linearGradient>
        <linearGradient id="progressGrad" x1="72" y1="120" x2="132" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1d4ed8"/><stop offset="1" stopColor="#1e3a8a"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
