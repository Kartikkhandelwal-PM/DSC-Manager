import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import TokenIllustration from './illustrations/TokenIllustration';

const STEPS = ['Method', 'Certificate', 'Details', 'Done'];
const stepOf = { method: 0, detect: 1, manual: 1, details: 2, success: 3 };

const mockCert = {
  holder_name: 'Ramesh Kumar', organization: 'ABC & Associates',
  city: 'Ahmedabad', state: 'Gujarat', email: 'ramesh@abcassociates.com',
  serial_number: '3AF12C9D00B4E721', issued_by: 'eMudhra Consumer CA 5',
  issue_date: '2024-04-15', expiry_date: '2027-04-14',
  dsc_purpose: 'Signing', dsc_class: 'Class 3',
  token_label: 'ePass2003', token_serial: 'HW12345678',
};

const inputCls = 'w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white placeholder:text-slate-300 transition-all';

function fmtDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysLeft(expiry) {
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}

/* ── Section divider with label ── */
function FormSection({ label }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{label}</p>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* ── Compact cert summary — reused in Steps 3 & 4 ── */
function CertPreview({ cert }) {
  const days = getDaysLeft(cert.expiry_date);
  const pill = days > 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
             : days > 0  ? 'bg-amber-50  text-amber-700  border-amber-200'
             :              'bg-red-50    text-red-700    border-red-200';

  const Cell = ({ label, value, span, mono }) => {
    if (!value) return null;
    return (
      <div className={`bg-white/80 rounded-xl px-3 py-2.5${span === 2 ? ' col-span-2' : ''}`} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-xs font-semibold text-slate-700 truncate${mono ? ' font-mono' : ''}`}>{value}</p>
      </div>
    );
  };

  const CellSection = ({ label, children }) => (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center gap-2 mb-2.5">
        <p className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest shrink-0">{label}</p>
        <div className="flex-1 h-px bg-blue-100/60" />
      </div>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );

  const hasMgmt    = cert.label || cert.location || cert.assigned_to || cert.notes;
  const hasToken   = cert.token_label || cert.token_serial;

  return (
    <div className="rounded-2xl border border-blue-100 p-5 mb-5" style={{ background: 'linear-gradient(135deg, #f0f7ff, #eef2ff)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <svg style={{ width: 16, height: 16 }} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate leading-snug">{cert.holder_name}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{cert.issued_by}</p>
        </div>
        <span className={`text-xs font-semibold border px-3 py-1 rounded-full shrink-0 ${pill}`}>
          {days > 0 ? `${days}d left` : 'Expired'}
        </span>
      </div>

      {/* Certificate Holder */}
      <CellSection label="Certificate Holder">
        <Cell label="Organization"  value={cert.organization} span={2} />
        <Cell label="City"          value={cert.city} />
        <Cell label="State"         value={cert.state} />
        <Cell label="Email"         value={cert.email} span={2} />
      </CellSection>

      {/* Certificate Info */}
      <CellSection label="Certificate Info">
        <Cell label="Serial No." value={cert.serial_number} span={2} mono />
        <Cell label="Class"      value={cert.dsc_class} />
        <Cell label="Purpose"    value={cert.dsc_purpose} />
        <Cell label="Issue Date" value={fmtDate(cert.issue_date)} />
        <Cell label="Expires"    value={fmtDate(cert.expiry_date)} />
      </CellSection>

      {/* Token / Hardware */}
      {hasToken && (
        <CellSection label="Token / Hardware">
          <Cell label="Token"        value={cert.token_label} />
          <Cell label="Token Serial" value={cert.token_serial} />
        </CellSection>
      )}

      {/* Management */}
      {hasMgmt && (
        <>
          <div className="my-4 h-px bg-blue-100/80" />
          <CellSection label="Management">
            <Cell label="Label"       value={cert.label}       span={2} />
            <Cell label="Location"    value={cert.location} />
            <Cell label="Assigned To" value={cert.assigned_to} />
            <Cell label="Notes"       value={cert.notes}       span={2} />
          </CellSection>
        </>
      )}
    </div>
  );
}

/* ── Step 1: Method ── */
function StepMethod({ onSelect }) {
  return (
    <div className="p-6">
      <h2 className="text-base font-black text-slate-900 mb-1">How would you like to add this DSC?</h2>
      <p className="text-sm text-slate-500 mb-5">Choose the method that works for you</p>
      <div className="space-y-3">
        {[
          {
            key: 'token',
            icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
            title: 'Read from USB Token',
            desc: 'Plug in your DSC token — all certificate details are read automatically',
            cardBg: 'linear-gradient(135deg, #f0f7ff, #eff6ff)',
            cardBorder: '#bfdbfe',
            iconBg: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            iconShadow: '0 4px 12px rgba(29,78,216,0.22)',
            badge: 'Recommended',
          },
          {
            key: 'manual',
            icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
            title: 'Enter Manually',
            desc: 'Type in certificate details — useful when the token is not available',
            cardBg: 'white',
            cardBorder: '#e2e8f0',
            iconBg: 'linear-gradient(135deg, #334155, #475569)',
            iconShadow: 'none',
            badge: null,
          },
        ].map(({ key, icon, title, desc, cardBg, cardBorder, iconBg, iconShadow, badge }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group hover:shadow-md active:scale-[0.99]"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: iconBg, boxShadow: iconShadow }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-sm font-bold text-slate-900">{title}</p>
                {badge && (
                  <span className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2a: Token Detection ── */
function StepDetect({ onDetected, onBack }) {
  const [s, setS]             = useState('checking');
  const [driverInfo, setDriver] = useState(null);
  const [pinData, setPinData] = useState({ pinType: 'pin', attemptsLeft: 3, label: '', error: false });
  const [pin, setPin]         = useState('');
  const [showPin, setShowPin] = useState(false);
  const [multiCerts, setMulti] = useState([]);
  const wsRef    = useRef(null);
  const retryRef = useRef(null);

  const OS = /Mac/.test(typeof navigator !== 'undefined' ? (navigator.platform || navigator.userAgent) : '') ? 'Mac' : 'Windows';

  const handleMsg = useCallback((msg) => {
    switch (msg.type) {
      case 'agent_ready':    setS('ready'); break;
      case 'reading':        setS('reading'); break;
      case 'driver_missing': setS('driver_missing'); setDriver({ brand: msg.brand || null, driverUrl: msg.driverUrl || null }); break;
      case 'pin_required':   setS('pin_required'); setPinData({ pinType: msg.pinType || 'pin', attemptsLeft: msg.attemptsRemaining ?? 3, label: msg.tokenLabel || '', error: false }); break;
      case 'pin_wrong':      setPinData(p => ({ ...p, attemptsLeft: msg.attemptsRemaining, error: true })); break;
      case 'token_locked':   setS('locked'); break;
      case 'certificate':    setS('done'); setTimeout(() => onDetected({ ...msg.certificate, added_method: 'token' }), 700); break;
      case 'multiple_certs': setS('multiple_certs'); setMulti(msg.certificates); break;
      default: break;
    }
  }, [onDetected]);

  const sendWS = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(data));
  }, []);

  useEffect(() => {
    let opened = false;
    let settled = false;
    const ws = new WebSocket('ws://localhost:12345');
    wsRef.current = ws;
    const t = setTimeout(() => { if (!opened) { ws.close(); wsRef.current = null; setS('not_installed'); } }, 3000);
    ws.onopen    = () => { opened = true; clearTimeout(t); handleMsg({ type: 'agent_ready' }); };
    ws.onmessage = e => { try { handleMsg(JSON.parse(e.data)); } catch {} };
    ws.onerror = ws.onclose = () => {
      if (settled) return; settled = true; clearTimeout(t); wsRef.current = null;
      if (!opened) setS('not_installed');
    };
    return () => { ws.close(); clearInterval(retryRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startPolling = () => {
    setS('waiting_agent');
    retryRef.current = setInterval(() => {
      if (wsRef.current) return;
      const ws = new WebSocket('ws://localhost:12345');
      wsRef.current = ws;
      ws.onopen    = () => { clearInterval(retryRef.current); handleMsg({ type: 'agent_ready' }); };
      ws.onmessage = e  => { try { handleMsg(JSON.parse(e.data)); } catch {} };
      ws.onerror = ws.onclose = () => { wsRef.current = null; };
    }, 3000);
  };

  const submitPin  = () => { sendWS({ type: 'submit_pin', pin }); setPin(''); };
  const selectCert = (cert, i) => {
    sendWS({ type: 'select_cert', index: i });
    setS('reading');
    setTimeout(() => handleMsg({ type: 'certificate', certificate: cert }), 1000);
  };

  const sim = {
    token:      () => { setS('reading'); setTimeout(() => handleMsg({ type: 'certificate', certificate: mockCert }), 2500); },
    driver:     () => handleMsg({ type: 'driver_missing', brand: 'Feitian ePass2003', driverUrl: 'https://www.ftsafe.com' }),
    pin:        () => handleMsg({ type: 'pin_required', pinType: 'pin', attemptsRemaining: 3, tokenLabel: 'ePass2003' }),
    multiCerts: () => handleMsg({ type: 'multiple_certs', certificates: [mockCert, { ...mockCert, holder_name: 'Anjali Patel', serial_number: 'AA112233445566BB', dsc_purpose: 'Encryption' }] }),
    locked:     () => handleMsg({ type: 'token_locked' }),
  };

  if (s === 'checking') return (
    <div className="p-6 flex flex-col items-center text-center py-14">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
        <div className="w-8 h-8 rounded-full border-[3px] border-blue-100 border-t-blue-600 animate-spin" />
      </div>
      <h2 className="text-base font-black text-slate-900 mb-1">Checking for KDK DSC Agent</h2>
      <p className="text-sm text-slate-500 mb-4">Connecting to local agent...</p>
      <p className="text-[11px] text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">ws://localhost:12345</p>
    </div>
  );

  if (s === 'not_installed') return (
    <div className="p-6">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-5">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-800">KDK DSC Agent not found</p>
          <p className="text-xs text-amber-700 mt-0.5">Install the agent once to start reading USB tokens.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">KDK DSC Agent v1.0</p>
            <p className="text-xs text-slate-500">Background service · {OS}</p>
          </div>
        </div>
        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold mb-4" style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', opacity: 0.6 }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download for {OS} · Coming Soon
        </div>
        <div className="space-y-2.5">
          {[
            OS === 'Windows' ? 'Extract the downloaded ZIP and run KDK DSC Agent.exe' : 'Open the downloaded .dmg and drag to Applications',
            OS === 'Windows' ? 'Double-click KDK DSC Agent.exe to start — takes about 30 seconds' : 'Launch KDK DSC Agent from Applications',
            OS === 'Windows' ? 'Agent icon will appear in the system tray when ready' : 'Agent starts automatically as a LaunchAgent',
          ].map((txt, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setS('ready')} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors mb-2">
        I've installed it — Connect →
      </button>
      <button onClick={onBack} className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium rounded-xl transition-colors">
        ← Choose a different method
      </button>
    </div>
  );

  if (s === 'waiting_agent') return (
    <div className="p-6 flex flex-col items-center text-center py-14">
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full border-[3px] border-blue-100 border-t-blue-700 animate-spin" />
        <div className="absolute inset-[14px] rounded-full bg-blue-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
      <h2 className="text-base font-black text-slate-900 mb-1">Waiting for agent to start...</h2>
      <p className="text-sm text-slate-500 mb-4">Checking every 3 seconds</p>
      <p className="text-[11px] text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">Retrying ws://localhost:12345</p>
    </div>
  );

  if (s === 'ready') return (
    <div className="p-6">
      <div className="flex flex-col items-center text-center mb-5">
        <h2 className="text-base font-black text-slate-900 mb-1">Plug in your USB Token</h2>
        <p className="text-sm text-slate-500">Agent is active and listening</p>
      </div>
      <div className="flex justify-center mb-4">
        <TokenIllustration state="idle" />
      </div>
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          KDK DSC Agent is running
        </div>
      </div>
      <button onClick={onBack} className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium rounded-xl transition-colors mb-4">
        ← Choose a different method
      </button>
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 text-center">Demo — Simulate Token Events</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Read Token',     fn: sim.token,      cls: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
            { label: 'Driver Missing', fn: sim.driver,     cls: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
            { label: 'PIN Required',   fn: sim.pin,        cls: 'bg-sky-100 text-sky-700 hover:bg-sky-200' },
            { label: 'Multiple Certs', fn: sim.multiCerts, cls: 'bg-violet-100 text-violet-700 hover:bg-violet-200' },
          ].map(({ label, fn, cls }) => (
            <button key={label} onClick={fn} className={`py-2 text-xs font-bold rounded-lg transition-colors ${cls}`}>{label}</button>
          ))}
          <button onClick={sim.locked} className="col-span-2 py-2 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Token Locked</button>
        </div>
      </div>
    </div>
  );

  if (s === 'driver_missing') return (
    <div className="p-6">
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-base font-black text-slate-900 mb-1">Token driver not installed</h2>
        <p className="text-sm text-slate-500">
          {driverInfo?.brand
            ? <>Detected: <span className="font-semibold text-slate-700">{driverInfo.brand}</span></>
            : 'USB token detected but driver is missing'}
        </p>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 mb-4 text-xs text-amber-800 leading-relaxed">
        Without the PKCS#11 driver, the agent cannot read certificates from this token. Install the driver, then click Retry.
      </div>
      {driverInfo?.driverUrl ? (
        <a href={driverInfo.driverUrl} target="_blank" rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold mb-3 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 12px rgba(217,119,6,0.25)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download {driverInfo.brand} Driver
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      ) : (
        <div className="rounded-xl bg-slate-100 p-3.5 mb-3 text-xs text-slate-600 leading-relaxed">
          Install the driver that came with your USB token, then click Retry below.
        </div>
      )}
      <button onClick={() => { sendWS({ type: 'retry_read' }); setS('ready'); }}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
        I've installed the driver — Retry →
      </button>
    </div>
  );

  if (s === 'pin_required') return (
    <div className="p-6">
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${pinData.error ? 'bg-red-100' : 'bg-sky-100'}`}
          style={pinData.error ? { animation: 'shake 0.4s ease' } : {}}
        >
          <svg className={`w-7 h-7 ${pinData.error ? 'text-red-600' : 'text-sky-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-base font-black text-slate-900 mb-1">
          {pinData.error ? 'Incorrect PIN — try again' : `Enter your ${pinData.pinType === 'pin' ? 'PIN' : 'Password'}`}
        </h2>
        <p className="text-sm text-slate-500">
          {pinData.label ? <>Token: <span className="font-semibold text-slate-700">{pinData.label}</span></> : 'Token requires authentication'}
        </p>
      </div>
      <div className="relative mb-3">
        <input
          key={pinData.error ? 'err' : 'ok'}
          type={showPin ? 'text' : 'password'}
          value={pin}
          onChange={e => { setPin(e.target.value); if (pinData.error) setPinData(p => ({ ...p, error: false })); }}
          onKeyDown={e => e.key === 'Enter' && pin && submitPin()}
          placeholder={pinData.pinType === 'pin' ? 'Enter PIN (e.g. 123456)' : 'Enter Password'}
          className="w-full px-4 py-3 pr-11 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal"
          style={{
            background:  pinData.error ? '#fff5f5' : '#f8fafc',
            borderColor: pinData.error ? '#f87171' : '#e2e8f0',
            '--tw-ring-color': pinData.error ? 'rgba(248,113,113,0.4)' : 'rgba(56,189,248,0.4)',
          }}
          autoFocus
        />
        <button onClick={() => setShowPin(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
          {showPin
            ? <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            : <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          }
        </button>
      </div>
      {pinData.attemptsLeft <= 2 && (
        <div className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 mb-4 text-xs font-semibold ${
          pinData.attemptsLeft === 1 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'
        }`}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>{pinData.attemptsLeft === 1 ? 'Last attempt! Token locks permanently after this.' : `${pinData.attemptsLeft} attempts remaining — token locks after 3 wrong entries.`}</span>
        </div>
      )}
      <button disabled={!pin} onClick={submitPin}
        className="w-full py-2.5 text-white text-sm font-bold rounded-xl mb-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', boxShadow: pin ? '0 4px 12px rgba(14,165,233,0.3)' : 'none' }}>
        {pinData.pinType === 'pin' ? 'Submit PIN →' : 'Submit Password →'}
      </button>
      <button onClick={() => setS('ready')} className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium rounded-xl transition-colors">
        Cancel — go back
      </button>
    </div>
  );

  if (s === 'reading') return (
    <div className="p-6 flex flex-col items-center text-center py-12">
      <div className="flex justify-center mb-6">
        <TokenIllustration state="reading" />
      </div>
      <h2 className="text-base font-black text-slate-900 mb-1">Reading certificate...</h2>
      <p className="text-sm text-slate-500 mb-4">Please wait — do not remove the token</p>
      <p className="text-xs font-semibold text-blue-600 animate-pulse">Reading PKCS#11 data...</p>
    </div>
  );

  if (s === 'multiple_certs') return (
    <div className="p-6">
      <h2 className="text-base font-black text-slate-900 mb-1">Multiple certificates found</h2>
      <p className="text-sm text-slate-500 mb-4">Select which certificate to save</p>
      <div className="space-y-2.5">
        {multiCerts.map((cert, i) => (
          <button key={i} onClick={() => selectCert(cert, i)}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{cert.holder_name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{cert.issued_by} · {cert.dsc_class}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5 ${cert.dsc_purpose === 'Signing' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                {cert.dsc_purpose}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Expires {cert.expiry_date}</span>
              <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (s === 'locked') return (
    <div className="p-6">
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-base font-black text-slate-900 mb-1">Token is locked</h2>
        <p className="text-sm text-slate-500">Too many incorrect PIN attempts</p>
      </div>
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4 text-left">
        <p className="text-sm font-semibold text-red-800 mb-2">Your token has been locked for security.</p>
        <p className="text-xs text-red-700 mb-2">Contact your DSC provider to perform an admin (SO) PIN reset:</p>
        <ul className="space-y-1.5">
          {[['eMudhra', '1800-103-7778'], ['Capricorn', '0265-6111200'], ['NSDL', '022-24994200'], ['Sify', '1800-229-5559']].map(([name, num]) => (
            <li key={name} className="flex items-center gap-2 text-xs text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span className="font-semibold">{name}:</span> {num}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={() => setS('ready')} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
        Go back
      </button>
    </div>
  );

  if (s === 'done') return (
    <div className="p-6 flex flex-col items-center text-center py-12">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
        style={{ animation: 'popIn 0.3s ease both', boxShadow: '0 0 0 8px rgba(16,185,129,0.1)' }}>
        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-base font-black text-slate-900">Certificate found!</h2>
      <p className="text-sm text-slate-500 mt-1">All certificate details read successfully</p>
    </div>
  );

  return null;
}

/* ── Step 2b: Manual Entry ── */
function StepManual({ onNext, onBack }) {
  const [f, setF] = useState({
    holder_name: '', organization: '', city: '', state: '', email: '',
    serial_number: '', issued_by: '', issue_date: '', expiry_date: '',
    dsc_class: 'Class 3', dsc_purpose: 'Signing',
    token_label: '', token_serial: '',
  });
  const set   = e => setF(p => ({ ...p, [e.target.name]: e.target.value }));
  const valid = f.holder_name && f.serial_number && f.issued_by && f.expiry_date;

  return (
    <div className="p-6">
      <h2 className="text-base font-black text-slate-900 mb-1">Enter certificate details</h2>
      <p className="text-sm text-slate-500 mb-1">Fill in the information from your DSC certificate</p>

      <FormSection label="Certificate Holder" />
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Holder Name <span className="text-red-400">*</span></label>
          <input type="text" name="holder_name" value={f.holder_name} onChange={set} placeholder="Ramesh Kumar" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organisation</label>
            <input type="text" name="organization" value={f.organization} onChange={set} placeholder="ABC & Associates" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
            <input type="text" name="email" value={f.email} onChange={set} placeholder="ramesh@abc.com" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
            <input type="text" name="city" value={f.city} onChange={set} placeholder="Ahmedabad" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">State</label>
            <input type="text" name="state" value={f.state} onChange={set} placeholder="Gujarat" className={inputCls} />
          </div>
        </div>
      </div>

      <FormSection label="Certificate Info" />
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Serial Number <span className="text-red-400">*</span></label>
          <input type="text" name="serial_number" value={f.serial_number} onChange={set} placeholder="3AF12C9D00B4E721" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Issuing CA <span className="text-red-400">*</span></label>
          <input type="text" name="issued_by" value={f.issued_by} onChange={set} placeholder="eMudhra Consumer CA 5" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">DSC Class</label>
            <select name="dsc_class" value={f.dsc_class} onChange={set} className={inputCls}>
              <option>Class 3</option><option>DGFT</option><option>Document Signer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Purpose</label>
            <select name="dsc_purpose" value={f.dsc_purpose} onChange={set} className={inputCls}>
              <option>Signing</option><option>Encryption</option><option>Signing &amp; Encryption</option>
            </select>
          </div>
        </div>
      </div>

      <FormSection label="Validity" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Issue Date</label>
          <input type="date" name="issue_date" value={f.issue_date} onChange={set} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry Date <span className="text-red-400">*</span></label>
          <input type="date" name="expiry_date" value={f.expiry_date} onChange={set} className={inputCls} />
        </div>
      </div>

      <FormSection label="Token / Hardware" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Token Brand / Label</label>
          <select name="token_label" value={f.token_label} onChange={set} className={inputCls}>
            <option value="">— Select token —</option>
            <option>ePass2003</option>
            <option>WatchData</option>
            <option>PROXKey</option>
            <option>SafeNet iKey</option>
            <option>Feitian ePass</option>
            <option>Aladdin eToken</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Token Serial No.</label>
          <input type="text" name="token_serial" value={f.token_serial} onChange={set} placeholder="HW12345678" className={inputCls} />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 text-sm font-semibold rounded-xl transition-colors border border-slate-200">
          ← Back
        </button>
        <button
          disabled={!valid}
          onClick={() => valid && onNext({ ...f, added_method: 'manual' })}
          className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: valid ? '0 2px 8px rgba(29,78,216,0.3)' : 'none' }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: User Details ── */
function StepDetails({ cert, clients, defaultClientId, onNext, onBack }) {
  const [f, setF] = useState({ label: '', location: '', assigned_to: '', notes: '', client_id: defaultClientId || 'own' });
  const [agreed, setAgreed] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOpen, setClientOpen] = useState(false);
  const clientRef = useRef(null);
  const set = e => setF(p => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    const handler = e => {
      if (clientRef.current && !clientRef.current.contains(e.target)) {
        setClientOpen(false);
        setClientSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedClient   = clients?.find(c => c.id === f.client_id);
  const filteredClients  = (clients || []).filter(c =>
    !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-base font-black text-slate-900 mb-1">Add your details</h2>
      <p className="text-sm text-slate-500 mb-5">These help you manage and locate this DSC — all optional</p>

      <CertPreview cert={cert} />

      <div className="space-y-4">
        {clients && clients.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Assign to Client <span className="text-red-400">*</span>
            </label>
            <div ref={clientRef} className="relative">
              <input
                type="text"
                value={clientOpen ? clientSearch : (selectedClient?.name || '')}
                onChange={e => { setClientSearch(e.target.value); setClientOpen(true); }}
                onFocus={() => { setClientOpen(true); setClientSearch(''); }}
                placeholder="Search client…"
                autoComplete="off"
                className={`${inputCls} pr-8`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className={`w-4 h-4 transition-transform ${clientOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {clientOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="px-3.5 py-3 text-sm text-slate-400">No clients found</div>
                  ) : (
                    filteredClients.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setF(p => ({ ...p, client_id: c.id })); setClientOpen(false); setClientSearch(''); }}
                        className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors flex items-center justify-between ${f.client_id === c.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <span>{c.name}</span>
                        {f.client_id === c.id && (
                          <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Label / Nickname <span className="text-slate-400 font-normal">— optional</span>
          </label>
          <input type="text" name="label" value={f.label} onChange={set} placeholder="e.g. Director Signing DSC" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Location <span className="text-slate-400 font-normal">— optional</span>
            </label>
            <input type="text" name="location" value={f.location} onChange={set} placeholder="e.g. Office Drawer 3" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Assigned To <span className="text-slate-400 font-normal">— optional</span>
            </label>
            <input type="text" name="assigned_to" value={f.assigned_to} onChange={set} placeholder="e.g. Ramesh Kumar" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Notes <span className="text-slate-400 font-normal">— optional</span>
          </label>
          <textarea name="notes" value={f.notes} onChange={set} placeholder="Any remarks about this DSC..." rows={2} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 mt-5 mb-4 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="sr-only peer"
          />
          <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
            {agreed && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          I confirm that I am authorised to register and manage this digital signature certificate within <span className="font-semibold text-slate-700">KDK DSC Manager</span>.
        </p>
      </label>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 text-sm font-semibold rounded-xl transition-colors border border-slate-200">
          ← Back
        </button>
        <button
          disabled={!agreed}
          onClick={() => onNext({ ...cert, ...f })}
          className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: agreed ? '0 2px 8px rgba(29,78,216,0.3)' : 'none' }}
        >
          Save & Add DSC →
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Consent ── */
function StepConsent({ cert, onConfirm, onBack }) {
  const [f, setF] = useState({
    label:        cert?.label        || '',
    location:     cert?.location     || '',
    assigned_to:  cert?.assigned_to  || '',
    notes:        cert?.notes        || '',
    token_label:  cert?.token_label  || '',
    token_serial: cert?.token_serial || '',
  });
  const set = e => setF(p => ({ ...p, [e.target.name]: e.target.value }));

  const ROField = ({ label, value, mono, span }) => value ? (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <div className={`px-3 py-2.5 text-xs rounded-xl bg-slate-100/80 border border-slate-200/60 text-slate-600 truncate${mono ? ' font-mono tracking-wide' : ' font-semibold'}`}>
        {value}
      </div>
    </div>
  ) : null;

  const RWField = ({ label, name, placeholder, children }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</label>
      {children ? (
        <select name={name} value={f[name]} onChange={set}
          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 transition-all text-slate-700 font-medium">
          {children}
        </select>
      ) : (
        <input type="text" name={name} value={f[name]} onChange={set} placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 placeholder:text-slate-300 transition-all font-medium text-slate-700" />
      )}
    </div>
  );

  const ConsentSection = ({ label, badge, children }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200">{badge}</span>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  );

  if (!cert) return null;

  return (
    <div className="p-6">
      <h2 className="text-base font-black text-slate-900 mb-0.5">Review & Confirm</h2>
      <p className="text-sm text-slate-500 mb-5">Check all details. You can still edit management fields before saving.</p>

      {/* Certificate Holder — read-only */}
      <ConsentSection label="Certificate Holder" badge="Read-only">
        <div className="grid grid-cols-2 gap-3">
          <ROField label="Holder Name"  value={cert.holder_name}  span={2} />
          <ROField label="Organisation" value={cert.organization} span={2} />
          <ROField label="City"         value={cert.city} />
          <ROField label="State"        value={cert.state} />
          <ROField label="Email"        value={cert.email}        span={2} />
        </div>
      </ConsentSection>

      {/* Certificate Info — read-only */}
      <ConsentSection label="Certificate Info" badge="Read-only">
        <div className="grid grid-cols-2 gap-3">
          <ROField label="Serial No." value={cert.serial_number} span={2} mono />
          <ROField label="Issued By"  value={cert.issued_by}     span={2} />
          <ROField label="Class"      value={cert.dsc_class} />
          <ROField label="Purpose"    value={cert.dsc_purpose} />
          <ROField label="Issue Date" value={fmtDate(cert.issue_date)} />
          <ROField label="Expires"    value={fmtDate(cert.expiry_date)} />
        </div>
      </ConsentSection>

      {/* Token / Hardware — editable */}
      <ConsentSection label="Token / Hardware">
        <div className="grid grid-cols-2 gap-3">
          <RWField label="Token Brand" name="token_label">
            <option value="">— Select token —</option>
            <option>ePass2003</option><option>WatchData</option><option>PROXKey</option>
            <option>SafeNet iKey</option><option>Feitian ePass</option><option>Aladdin eToken</option><option>Other</option>
          </RWField>
          <RWField label="Token Serial" name="token_serial" placeholder="HW12345678" />
        </div>
      </ConsentSection>

      {/* Management — editable */}
      <ConsentSection label="Management">
        <RWField label="Label / Nickname" name="label" placeholder="e.g. Director Signing DSC" />
        <div className="grid grid-cols-2 gap-3">
          <RWField label="Location"    name="location"    placeholder="e.g. Office Drawer 3" />
          <RWField label="Assigned To" name="assigned_to" placeholder="e.g. Accounts Team" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Notes</label>
          <textarea name="notes" value={f.notes} onChange={set} placeholder="Any remarks..." rows={2}
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 placeholder:text-slate-300 resize-none transition-all font-medium text-slate-700" />
        </div>
      </ConsentSection>

      {/* Authority note */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-100 mb-5">
        <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          By clicking <span className="font-bold">Confirm & Add</span>, you confirm that you are authorised to register and manage this digital signature certificate within KDK DSC Manager.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onConfirm({ ...cert, ...f })}
          className="flex-1 py-3 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 2px 8px rgba(29,78,216,0.25)' }}
        >
          Confirm & Add DSC
        </button>
        <button onClick={onBack} className="px-5 py-3 text-slate-600 text-sm font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
          Back
        </button>
      </div>
    </div>
  );
}

/* ── Sectioned summary helpers (used in StepSuccess) ── */
function SummarySection({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">{children}</div>
    </div>
  );
}
function SF({ l, v, span, mono }) {
  if (!v || v === '—') return null;
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{l}</p>
      <p className={`text-xs font-bold text-slate-800 truncate${mono ? ' font-mono' : ''}`}>{v}</p>
    </div>
  );
}

/* ── Step 5: Success ── */
function StepSuccess({ dsc, onDone, onAddAnother }) {
  const days = getDaysLeft(dsc.expiry_date);
  const pill = days > 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
             : days > 0  ? 'bg-amber-50  text-amber-700  border-amber-200'
             :              'bg-red-50    text-red-700    border-red-200';
  const dot  = days > 90 ? 'bg-emerald-500' : days > 0 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
          style={{ boxShadow: '0 0 0 10px rgba(16,185,129,0.08)', animation: 'popIn 0.35s ease both' }}>
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-900 mb-1">DSC saved successfully!</h2>
      <p className="text-sm text-slate-500 mb-3">
        <span className="font-semibold text-slate-700">{dsc.label || dsc.holder_name}</span> has been added to the dashboard.
      </p>

      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mb-5 ${pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {days > 0 ? `Expires in ${days} days · ${fmtDate(dsc.expiry_date)}` : `Expired · ${fmtDate(dsc.expiry_date)}`}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left mb-5 space-y-4">
        {/* Certificate Holder */}
        <SummarySection label="Certificate Holder">
          <SF l="Holder Name"   v={dsc.holder_name} />
          <SF l="Organization"  v={dsc.organization} />
          {dsc.email       && <SF l="Email"      v={dsc.email}      span />}
          {(dsc.city || dsc.state) && <SF l="City"  v={dsc.city} />}
          {dsc.state       && <SF l="State"      v={dsc.state} />}
        </SummarySection>

        {/* Certificate Info */}
        <SummarySection label="Certificate Info">
          <SF l="Serial No." v={dsc.serial_number} span mono />
          <SF l="Issued By"  v={dsc.issued_by}  span />
          <SF l="Class"      v={dsc.dsc_class} />
          <SF l="Purpose"    v={dsc.dsc_purpose} />
        </SummarySection>

        {/* Validity */}
        <SummarySection label="Validity">
          <SF l="Issue Date"  v={fmtDate(dsc.issue_date)} />
          <SF l="Expiry Date" v={fmtDate(dsc.expiry_date)} />
        </SummarySection>

        {/* Token / Hardware */}
        {(dsc.token_label || dsc.token_serial) && (
          <SummarySection label="Token / Hardware">
            {dsc.token_label  && <SF l="Token"        v={dsc.token_label} />}
            {dsc.token_serial && <SF l="Token Serial" v={dsc.token_serial} />}
          </SummarySection>
        )}

        {/* Management */}
        {(dsc.label || dsc.location || dsc.assigned_to || dsc.notes) && (
          <SummarySection label="Management">
            {dsc.label       && <SF l="Label"       v={dsc.label}       span />}
            {dsc.location    && <SF l="Location"    v={dsc.location} />}
            {dsc.assigned_to && <SF l="Assigned To" v={dsc.assigned_to} />}
            {dsc.notes       && <SF l="Notes"       v={dsc.notes}       span />}
          </SummarySection>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onAddAnother}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
        >
          + Add Another
        </button>
        <button
          onClick={onDone}
          className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}

/* ── Wizard shell ── */
export default function AddDSCWizard({ onClose, onSave, clients, defaultClientId }) {
  const [step, setStep]       = useState('method');
  const [cert, setCert]       = useState(null);
  const [pending, setPending] = useState(null);
  const [saved, setSaved]     = useState(null);
  const idx = stepOf[step] ?? 0;

  const handleMethod      = m  => setStep(m === 'token' ? 'detect' : 'manual');
  const handleBack        = () => { setStep('method'); setCert(null); };
  const handleCert        = c  => { setCert(c); setStep('details'); };
  const handleDetailsBack = () => {
    if (cert?.added_method === 'manual') { setStep('manual'); }
    else { setStep('method'); setCert(null); }
  };
  const handleDetails     = d  => { setSaved(d); setStep('success'); onSave(d); };
  const handleAddAnother  = () => { setStep('method'); setCert(null); setPending(null); setSaved(null); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step !== 'success' ? onClose : undefined} />
      <div
        className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.28)', maxHeight: '90vh', animation: 'popIn 0.25s ease both' }}
      >
        {/* ── Dark gradient header ── */}
        <div className="shrink-0 px-6 pt-5 pb-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
          <div style={{ position: 'absolute', right: -28, top: -28, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 28, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <div className="relative z-10">
            {/* Title row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg style={{ width: 14, height: 14 }} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none">Add DSC</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Digital Signature Certificate</p>
                </div>
              </div>
              {step !== 'success' && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Step indicators */}
            <div className="flex items-start">
              {STEPS.map((label, i) => (
                <Fragment key={label}>
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 mt-3 mx-1.5 rounded-full transition-all duration-400 ${i <= idx ? 'bg-white/55' : 'bg-white/15'}`} />
                  )}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all duration-300 ${
                        i < idx  ? 'bg-white text-blue-800'
                        : i === idx ? 'bg-white text-blue-800'
                        : 'bg-white/15 text-white/35'
                      }`}
                      style={i === idx ? { boxShadow: '0 0 0 3px rgba(255,255,255,0.2)' } : {}}
                    >
                      {i < idx
                        ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        : i + 1}
                    </div>
                    <span className={`text-[9px] font-bold leading-none transition-colors duration-300 ${
                      i === idx ? 'text-white' : i < idx ? 'text-white/45' : 'text-white/22'
                    }`}>
                      {label}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div key={step} style={{ animation: 'slideStepIn 0.22s ease both' }}>
            {step === 'method'  && <StepMethod   onSelect={handleMethod} />}
            {step === 'detect'  && <StepDetect   onDetected={handleCert} onBack={handleBack} />}
            {step === 'manual'  && <StepManual   onNext={handleCert}     onBack={handleBack} />}
            {step === 'details' && <StepDetails  cert={cert} clients={clients} defaultClientId={defaultClientId} onNext={handleDetails} onBack={handleDetailsBack} />}
            {step === 'success' && <StepSuccess  dsc={saved} onDone={onClose} onAddAnother={handleAddAnother} />}
          </div>
        </div>
      </div>
    </div>
  );
}
