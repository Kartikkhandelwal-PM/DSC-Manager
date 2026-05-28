import { useState } from 'react';
import AddDSCWizard from '../components/AddDSCWizard';
import DSCDetailPanel from '../components/DSCDetailPanel';
import StatusBadge from '../components/StatusBadge';
import { mockDSCs, mockClients, getStatus, getDaysLeft } from '../data/mockDSCs';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const TYPE_CFG = {
  'CA Firm': { bg: '#f3e8ff', text: '#6b21a8' },
  'Company': { bg: '#e0f2fe', text: '#075985' },
  'LLP':     { bg: '#ccfbf1', text: '#134e4a' },
  'self':    { bg: '#dbeafe', text: '#1e40af' },
};

function clientHealth(id, dscs, threshold) {
  const list = dscs.filter(d => d.client_id === id);
  if (!list.length) return 'empty';
  if (list.some(d => getStatus(d.expiry_date, threshold) === 'Expired'))       return 'critical';
  if (list.some(d => getStatus(d.expiry_date, threshold) === 'Expiring Soon')) return 'warning';
  return 'good';
}

const HEALTH_DOT = { good: '#22c55e', warning: '#f59e0b', critical: '#ef4444', empty: '#475569' };

function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysText(n) {
  if (n <= 0)  return 'Expired';
  if (n <= 90) return `${n}d left`;
  return `${Math.floor(n / 30)}mo left`;
}

// Color matches the status badge: green = Active, amber = Expiring Soon, red = Expired.
// Within Expiring Soon, ≤30 days becomes red to signal critical urgency.
function daysColor(n, threshold) {
  if (n <= 0)         return '#dc2626'; // Expired
  if (n <= threshold) return n <= 30 ? '#dc2626' : '#d97706'; // Expiring Soon
  return '#16a34a'; // Active
}

/* ─── Settings Panel ───────────────────────────────────────────────────────── */

const USER_EMAIL = 'Kartik.khandelwal@kdksoftware.com';

function SettingsPanel({ threshold, onThresholdChange, extraEmails, onExtraEmailsChange, onClose }) {
  const [days,        setDays]       = useState(String(threshold));
  const [localEmails, setLocalEmails] = useState(extraEmails);
  const [newEmail,    setNewEmail]   = useState('');
  const [daysErr,     setDaysErr]    = useState('');
  const [emailErr,    setEmailErr]   = useState('');
  const [saved,       setSaved]      = useState(false);

  const daysNum = parseInt(days, 10);
  const daysValid = days !== '' && !isNaN(daysNum) && daysNum >= 1 && daysNum <= 365;

  const isDirty = (daysValid && daysNum !== threshold) ||
    JSON.stringify(localEmails) !== JSON.stringify(extraEmails);

  const addEmailToList = () => {
    const v = newEmail.trim().toLowerCase();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailErr('Enter a valid email address'); return; }
    if (v === USER_EMAIL.toLowerCase() || localEmails.includes(v)) { setEmailErr('This email is already added'); return; }
    setEmailErr('');
    setLocalEmails(prev => [...prev, v]);
    setNewEmail('');
  };

  const removeEmailFromList = email => setLocalEmails(prev => prev.filter(e => e !== email));

  const handleSave = () => {
    if (!daysValid) { setDaysErr('Enter a number between 1 and 365'); return; }
    setDaysErr('');
    onThresholdChange(daysNum);
    onExtraEmailsChange(localEmails);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const allEmails = [USER_EMAIL, ...localEmails];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-white flex flex-col overflow-hidden rounded-2xl"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.22)', maxHeight: '85vh', animation: 'popIn 0.22s ease both' }}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Settings</p>
              <p className="text-[11px] text-slate-400 mt-0.5">KDK DSC Manager</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* ── Info banner ── */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              Email alerts will be sent to <span className="font-bold">{allEmails.length === 1 ? '1 address' : `${allEmails.length} addresses`}</span> below whenever a DSC has expired or is expiring within <span className="font-bold">{daysValid ? daysNum : threshold} days</span>.
            </p>
          </div>

          {/* ── Alert Threshold ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Threshold</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">Send reminder email this many days before a DSC expires:</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={days}
                  onChange={e => { setDays(e.target.value.replace(/\D/g, '')); setDaysErr(''); setSaved(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="90"
                  className="w-20 px-3 py-2.5 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all text-center"
                />
                <span className="text-sm text-slate-500 font-medium">days before expiry</span>
              </div>
              {daysErr
                ? <p className="text-xs text-red-500 mt-2">{daysErr}</p>
                : <p className="text-xs text-slate-400 mt-2">Currently set to <span className="font-bold text-slate-600">{threshold} days</span></p>
              }
            </div>
          </div>

          {/* ── Reminder Recipients ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reminder Recipients</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Primary */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{USER_EMAIL}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Primary · cannot be removed</p>
                </div>
              </div>

              {/* Added emails */}
              {localEmails.map(email => (
                <div key={email} className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-700 flex-1 min-w-0 truncate">{email}</p>
                  <button onClick={() => { removeEmailFromList(email); setSaved(false); }} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="email" value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setEmailErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && addEmailToList()}
                  placeholder="Add another email address…"
                  className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white placeholder:text-slate-300 transition-all"
                />
                <button
                  onClick={addEmailToList}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {emailErr && <p className="text-xs text-red-500 mt-1">{emailErr}</p>}
            </div>
          </div>

        </div>

        {/* ── Footer — universal Save ── */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 bg-white">
          {saved ? (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200" style={{ animation: 'fadeUpIn 0.2s ease both' }}>
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-bold text-emerald-700">Settings saved successfully</span>
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="w-full py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: isDirty ? '0 2px 8px rgba(29,78,216,0.3)' : 'none' }}
            >
              Save Changes
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */

/* ─── User Menu (sidebar bottom) ───────────────────────────────────────────── */

const USER = {
  name:     'Kartik Khandelwal',
  email:    'Kartik.khandelwal@kdksoftware.com',
  role:     'OWNER',
  firm:     'KDK Software',
  initials: 'VS',
};

function UserMenu({ onOpenSettings }) {
  const [open, setOpen] = useState(false);

  const items = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
      label: 'Profile', action: null,
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
      label: 'Settings', action: () => { setOpen(false); onOpenSettings(); },
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
      label: 'Subscription', action: null,
    },
  ];

  return (
    <div style={{ position: 'relative', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.10)', flexShrink: 0 }}>

      {/* Backdrop */}
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />}

      {/* Popup */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 10, right: 10,
          background: '#1e2124', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.55)', overflow: 'hidden', zIndex: 100,
          animation: 'fadeUpIn 0.18s ease both',
        }}>
          {/* User info */}
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>{USER.name}</p>
            <p style={{ fontSize: 12, color: '#a0a0a0', marginTop: 3, lineHeight: 1.5 }}>{USER.email}</p>
            <span style={{
              display: 'inline-block', marginTop: 8,
              fontSize: 10, fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              background: 'rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 5,
            }}>{USER.role}</span>
          </div>

          {/* Menu items */}
          <div style={{ padding: '6px 0' }}>
            {items.map(({ icon, label, action }) => (
              <PopupMenuItem key={label} icon={icon} label={label} onClick={action} />
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
            <PopupMenuItem
              icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />}
              label="Sign Out"
              danger
            />
          </div>
        </div>
      )}

      {/* Trigger row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 11, background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${open ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
      >
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800, flexShrink: 0, letterSpacing: '0.04em' }}>
          {USER.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{USER.name}</p>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#7a7a7a', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{USER.firm}</p>
        </div>
        <svg style={{ width: 15, height: 15, color: '#606060', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

function PopupMenuItem({ icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', background: hov ? (danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)') : 'transparent', border: 'none', cursor: onClick ? 'pointer' : 'default', textAlign: 'left', transition: 'background 0.12s' }}
    >
      <svg style={{ width: 16, height: 16, color: danger ? '#f87171' : '#8a8a8a', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        {icon}
      </svg>
      <span style={{ fontSize: 13, fontWeight: 500, color: danger ? '#f87171' : '#d0d8e4' }}>{label}</span>
    </button>
  );
}

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */

const TYPE_AVATAR = {
  'CA Firm': { bg: 'rgba(167,139,250,0.18)', color: '#c4b5fd', badge: { label: 'CA',  bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' } },
  'Company': { bg: 'rgba(56,189,248,0.15)',  color: '#7dd3fc', badge: { label: 'Co',  bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8' } },
  'LLP':     { bg: 'rgba(52,211,153,0.15)',  color: '#6ee7b7', badge: { label: 'LLP', bg: 'rgba(52,211,153,0.12)',  color: '#34d399' } },
};

function Sidebar({ clients, dscs, activeClient, onClientSelect, threshold, onOpenSettings }) {
  const [q, setQ] = useState('');

  const selfClient   = clients.find(c => c.id === 'own');
  const otherClients = clients.filter(c => c.id !== 'own');

  const filtered = otherClients.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.type.toLowerCase().includes(q.toLowerCase())
  );
  const showSelf = !q || 'my own dscs'.includes(q.toLowerCase());

  const totalAlerts = dscs.filter(d => getStatus(d.expiry_date, threshold) !== 'Active').length;

  return (
    <aside style={{ width: 264, background: '#15171a', borderRight: '1px solid rgba(255,255,255,0.09)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>

      {/* Brand */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <img src={`${import.meta.env.BASE_URL}logo3.png`} alt="KDK Software DSC Manager" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* Search */}
      <div style={{ padding: '14px 14px 10px', flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#636363', marginBottom: 10, paddingLeft: 2 }}>Clients</p>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#636363', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search clients…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 9, color: '#dde3ec', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.55)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
          />
        </div>
      </div>

      {/* Client list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 14px' }}>

        {/* All Clients */}
        {!q && (
          <SidebarRow
            active={activeClient === 'all'}
            onClick={() => onClientSelect('all')}
            avatarBg="rgba(99,102,241,0.18)"
            avatarColor="#a5b4fc"
            avatarContent={
              <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            }
            label="All Clients"
            sub={`${dscs.length} certificates`}
            alertCount={totalAlerts}
          />
        )}

        {/* My Own DSCs — amber/gold card */}
        {showSelf && selfClient && (() => {
          const list   = dscs.filter(d => d.client_id === 'own');
          const cnt    = list.length;
          const alerts = list.filter(d => getStatus(d.expiry_date, threshold) !== 'Active').length;
          const health = clientHealth('own', dscs, threshold);
          return (
            <SidebarRow
              key="own"
              active={activeClient === 'own'}
              onClick={() => onClientSelect('own')}
              isSelf
              avatarBg="rgba(251,191,36,0.18)"
              avatarColor="#fbbf24"
              avatarContent={
                <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
              label={selfClient.name}
              sub={`${cnt} DSC${cnt !== 1 ? 's' : ''} · Personal`}
              alertCount={alerts}
              healthColor={HEALTH_DOT[health]}
            />
          );
        })()}

        {/* Section label before client list */}
        {(showSelf || !q) && filtered.length > 0 && (
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#636363', padding: '12px 4px 6px' }}>
            Clients{!q ? ` · ${otherClients.length}` : ''}
          </p>
        )}

        {/* Individual client cards */}
        {filtered.length === 0 && q && (
          <p style={{ textAlign: 'center', color: '#7a7a7a', fontSize: 12, padding: '20px 0' }}>No clients found</p>
        )}
        {filtered.map(client => {
          const list    = dscs.filter(d => d.client_id === client.id);
          const cnt     = list.length;
          const alerts  = list.filter(d => getStatus(d.expiry_date, threshold) !== 'Active').length;
          const health  = clientHealth(client.id, dscs, threshold);
          const ta      = TYPE_AVATAR[client.type];
          return (
            <SidebarRow
              key={client.id}
              active={activeClient === client.id}
              onClick={() => onClientSelect(client.id)}
              avatarBg={ta?.bg}
              avatarColor={ta?.color}
              avatarContent={<span style={{ fontSize: 12, fontWeight: 800 }}>{client.name.charAt(0)}</span>}
              label={client.name}
              sub={`${client.type} · ${cnt} DSC${cnt !== 1 ? 's' : ''}`}
              alertCount={alerts}
              healthColor={HEALTH_DOT[health]}
            />
          );
        })}
      </div>

      <UserMenu onOpenSettings={onOpenSettings} />
    </aside>
  );
}

function SidebarRow({ active, onClick, avatarContent, label, sub, alertCount, healthColor, avatarBg, avatarColor, isSelf }) {
  const [hovered, setHovered] = useState(false);

  const activeBg     = isSelf ? 'rgba(251,191,36,0.12)' : 'rgba(29,78,216,0.16)';
  const activeBorder = isSelf ? 'rgba(251,191,36,0.38)' : 'rgba(59,130,246,0.38)';
  const activeAvatar = isSelf ? '#d97706'               : '#1d4ed8';

  const cardBg     = active ? activeBg     : hovered ? 'rgba(255,255,255,0.06)' : 'transparent';
  const cardBorder = active ? activeBorder : hovered  ? 'rgba(255,255,255,0.10)' : 'transparent';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 10px', borderRadius: 10, boxSizing: 'border-box',
        background: cardBg, border: `1px solid ${cardBorder}`,
        transition: 'all 0.15s', textAlign: 'left', cursor: 'pointer', marginBottom: 2,
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0, transition: 'background 0.15s',
        background: active ? activeAvatar : (avatarBg || 'rgba(255,255,255,0.07)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? '#fff' : (avatarColor || '#64748b'),
      }}>
        {avatarContent}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: active ? 600 : 500, lineHeight: 1.25, marginBottom: 3,
          color: active ? (isSelf ? '#fef3c7' : '#eef2f8') : '#c8d0dc',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{label}</p>
        <p style={{ fontSize: 11, color: active ? 'rgba(210,220,235,0.55)' : '#6a6a6a', lineHeight: 1.2 }}>{sub}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {alertCount > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'rgba(239,68,68,0.22)', color: '#f87171', lineHeight: 1.4 }}>{alertCount}</span>
        )}
        {healthColor && <span style={{ width: 7, height: 7, borderRadius: '50%', background: healthColor, flexShrink: 0 }} />}
      </div>
    </button>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────────────────── */

function StatCard({ label, value, sub, icon, gradient, glowColor, delay = 0, onClick, active = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: gradient,
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: active
          ? `0 0 0 2px white, 0 0 0 5px ${glowColor}, 0 8px 24px ${glowColor}50`
          : hov
            ? `0 12px 32px ${glowColor}55, 0 2px 8px rgba(0,0,0,0.12)`
            : `0 4px 16px ${glowColor}30, 0 1px 4px rgba(0,0,0,0.08)`,
        animation: 'fadeUpIn 0.35s ease both',
        animationDelay: `${delay}ms`,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        transform: active || hov ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Decorative circle */}
      <div style={{ position: 'absolute', right: -18, top: -18, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 14, bottom: -24, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      {/* Active filter indicator */}
      {active && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <svg style={{ width: 10, height: 10, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: 18, height: 18, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>{icon}</svg>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
        </div>
        <p style={{ fontSize: 34, fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 5, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{sub}</p>
      </div>
    </div>
  );
}

/* ─── Sort Arrow ───────────────────────────────────────────────────────────── */

function SortArrow({ active, dir }) {
  if (!active) {
    return (
      <svg className="w-3 h-3 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      {dir === 'asc'
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      }
    </svg>
  );
}

/* ─── DSC List Row ─────────────────────────────────────────────────────────── */

function DSCRow({ dsc, clients, onClick, threshold }) {
  const [hov, setHov] = useState(false);
  const status   = getStatus(dsc.expiry_date, threshold);
  const daysLeft = getDaysLeft(dsc.expiry_date);
  const client   = clients.find(c => c.id === dsc.client_id);
  const tc       = TYPE_CFG[client?.type] || TYPE_CFG['self'];

  const dotColor = status === 'Active' ? '#22c55e' : status === 'Expiring Soon' ? '#f59e0b' : '#ef4444';

  return (
    <div
      onClick={() => onClick(dsc)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
      style={{ background: hov ? '#f8fafc' : 'transparent' }}
    >
      {/* Status dot */}
      <span
        style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, flexShrink: 0 }}
        className={status === 'Expiring Soon' ? 'animate-pulse' : ''}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-slate-800 truncate">{dsc.label || dsc.holder_name}</p>
          {client && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: tc.bg, color: tc.text }}>{client.type}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{dsc.holder_name} · {client?.name || '—'}</p>
      </div>

      {/* Issuing CA — hidden on smaller screens */}
      <p className="text-xs text-slate-400 w-36 truncate shrink-0 hidden xl:block">{dsc.issued_by}</p>

      {/* Expiry */}
      <div className="text-right shrink-0 w-28">
        <p className="text-xs font-semibold text-slate-600">{fmtDate(dsc.expiry_date)}</p>
        <p className="text-[11px] font-semibold mt-0.5" style={{ color: daysColor(daysLeft, threshold) }}>{daysText(daysLeft)}</p>
      </div>

      {/* Status badge */}
      <div className="shrink-0 w-32">
        <StatusBadge status={status} />
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

/* ─── DSC Mini Card (used in both single and multi-DSC client views) ──────── */

const STATUS_CARD_STYLE = {
  'Active':        { bar: 'linear-gradient(90deg, #059669, #34d399)', badge: '#dcfce7', badgeText: '#166534' },
  'Expiring Soon': { bar: 'linear-gradient(90deg, #d97706, #fbbf24)', badge: '#fef3c7', badgeText: '#92400e' },
  'Expired':       { bar: 'linear-gradient(90deg, #dc2626, #f87171)', badge: '#fee2e2', badgeText: '#7f1d1d' },
};

function DSCMiniCard({ dsc, onClick, delay = 0, threshold }) {
  const [hov, setHov] = useState(false);
  const status   = getStatus(dsc.expiry_date, threshold);
  const daysLeft = getDaysLeft(dsc.expiry_date);
  const sc       = STATUS_CARD_STYLE[status] || STATUS_CARD_STYLE['Active'];

  return (
    <div
      onClick={() => onClick(dsc)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        animation: 'fadeUpIn 0.3s ease both',
        animationDelay: `${delay}ms`,
        boxShadow: hov ? '0 10px 32px rgba(0,0,0,0.11)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Color bar top */}
      <div style={{ height: 4, background: sc.bar }} />

      <div style={{ padding: '16px 18px 18px' }}>
        {/* Status + days pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
            background: sc.badge, color: sc.badgeText, letterSpacing: '0.02em',
          }}>
            {status}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: daysColor(daysLeft, threshold),
          }}>
            {daysText(daysLeft)}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 15, fontWeight: 700, marginBottom: 3, lineHeight: 1.25,
          color: hov ? '#1d4ed8' : '#0f172a',
          transition: 'color 0.15s',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {dsc.label || dsc.holder_name}
        </h3>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {dsc.holder_name}
        </p>

        <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />

        {/* Key details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
          <MiniDetail label="Issued by" value={dsc.issued_by} />
          <MiniDetail label="Expires" value={fmtDate(dsc.expiry_date)} />
          <MiniDetail label="Class" value={dsc.dsc_class} />
          <MiniDetail label="Purpose" value={dsc.dsc_purpose} />
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
          opacity: hov ? 1 : 0, transition: 'opacity 0.15s',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>View full details</span>
          <svg style={{ width: 13, height: 13, color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MiniDetail({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</p>
    </div>
  );
}

/* ─── Main Dashboard ───────────────────────────────────────────────────────── */

export default function DSCDashboard() {
  const [dscs,           setDscs]       = useState(mockDSCs);
  const [clients]                       = useState(mockClients);
  const [activeClient,   setClient]     = useState('all');
  const [statusFilter,   setStatus]     = useState('All');
  const [search,         setSearch]     = useState('');
  const [sortBy,         setSortBy]     = useState('expiry_asc');
  const [showAdd,        setShowAdd]    = useState(false);
  const [selected,       setSel]        = useState(null);
  const [showSettings,   setSettings]   = useState(false);
  const [alertThreshold, setThreshold]  = useState(() => {
    const n = Number(localStorage.getItem('dsc_alert_threshold'));
    return (n >= 1 && n <= 365) ? n : 90;
  });
  const [extraEmails, setExtraEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('dsc_extra_emails');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const handleThresholdChange = days => {
    setThreshold(days);
    localStorage.setItem('dsc_alert_threshold', String(days));
  };

  const handleExtraEmailsChange = emails => {
    setExtraEmails(emails);
    localStorage.setItem('dsc_extra_emails', JSON.stringify(emails));
  };

  const activeClientObj = clients.find(c => c.id === activeClient);
  const base = dscs.filter(d => activeClient === 'all' || d.client_id === activeClient);

  // Clients (excluding 'own') that have at least one DSC
  const clientsWithDSCs = clients.filter(
    c => c.id !== 'own' && dscs.some(d => d.client_id === c.id)
  ).length;

  const counts = {
    total:    base.length,
    active:   base.filter(d => getStatus(d.expiry_date, alertThreshold) === 'Active').length,
    expiring: base.filter(d => getStatus(d.expiry_date, alertThreshold) === 'Expiring Soon').length,
    expired:  base.filter(d => getStatus(d.expiry_date, alertThreshold) === 'Expired').length,
  };

  const visible = base
    .filter(d => statusFilter === 'All' || getStatus(d.expiry_date, alertThreshold) === statusFilter)
    .filter(d => !search || [d.holder_name, d.label, d.organization, d.serial_number, d.location]
      .some(v => v?.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'expiry_asc')  return new Date(a.expiry_date) - new Date(b.expiry_date);
      if (sortBy === 'expiry_desc') return new Date(b.expiry_date) - new Date(a.expiry_date);
      if (sortBy === 'name_asc' || sortBy === 'name_desc') {
        const ca = clients.find(c => c.id === a.client_id)?.name || '';
        const cb = clients.find(c => c.id === b.client_id)?.name || '';
        return sortBy === 'name_asc' ? ca.localeCompare(cb) : cb.localeCompare(ca);
      }
      if (sortBy === 'added_desc') return new Date(b.created_at) - new Date(a.created_at);
      const ord = { Expired: 0, 'Expiring Soon': 1, Active: 2 };
      const diff = ord[getStatus(a.expiry_date, alertThreshold)] - ord[getStatus(b.expiry_date, alertThreshold)];
      return diff !== 0 ? diff : new Date(a.expiry_date) - new Date(b.expiry_date);
    });

  const switchClient = id => { setClient(id); setStatus('All'); setSearch(''); };

  const handleSave = dsc =>
    setDscs(p => [...p, {
      ...dsc,
      id: String(Date.now()),
      client_id: dsc.client_id || (activeClient === 'all' ? 'own' : activeClient),
      created_at: new Date().toISOString().split('T')[0],
    }]);

  const handleDelete = id => { setDscs(p => p.filter(d => d.id !== id)); setSel(null); };

  const handleUpdate = (id, fields) => {
    setDscs(p => p.map(d => d.id === id ? { ...d, ...fields } : d));
    setSel(prev => prev?.id === id ? { ...prev, ...fields } : prev);
  };

  const isEmpty      = activeClient !== 'all' && base.length === 0;
  const isClientView = activeClient !== 'all' && base.length > 0;
  const isAllView    = activeClient === 'all';

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50">
      <Sidebar clients={clients} dscs={dscs} activeClient={activeClient} onClientSelect={switchClient} threshold={alertThreshold} onOpenSettings={() => setSettings(true)} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Header ─────────────────────────────────────────────────────── */}
        <header
          className="bg-white h-16 px-6 flex items-center justify-between gap-4 shrink-0"
          style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {activeClient !== 'all' && (
              <>
                <button
                  onClick={() => switchClient('all')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <div className="w-px h-5 bg-slate-200 shrink-0" />
              </>
            )}
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-slate-900 leading-snug truncate">
                {activeClient === 'all' ? 'Overview' : activeClientObj?.name}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {activeClient === 'all'
                  ? `${counts.total} certificates · ${clientsWithDSCs} clients`
                  : `${activeClientObj?.type} · ${base.length} DSC${base.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search (only in all-clients view) */}
            {isAllView && (
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search DSCs…"
                  className="w-64 pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-300 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Primary CTA */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 2px 8px rgba(29,78,216,0.22)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add DSC
            </button>
          </div>
        </header>

        {/* ── Scrollable Content ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-5">

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Total" value={counts.total}
                sub={activeClient === 'all' ? `across ${clientsWithDSCs} clients` : 'for this client'}
                gradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)"
                glowColor="#2563eb" delay={0}
                onClick={() => setStatus('All')}
                active={statusFilter === 'All'}
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />}
              />
              <StatCard label="Active" value={counts.active} sub="valid certificates"
                gradient="linear-gradient(135deg, #065f46 0%, #059669 100%)"
                glowColor="#059669" delay={60}
                onClick={() => setStatus(s => s === 'Active' ? 'All' : 'Active')}
                active={statusFilter === 'Active'}
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              />
              <StatCard label="Expiring Soon" value={counts.expiring} sub={`within ${alertThreshold} days`}
                gradient="linear-gradient(135deg, #92400e 0%, #d97706 100%)"
                glowColor="#d97706" delay={120}
                onClick={() => setStatus(s => s === 'Expiring Soon' ? 'All' : 'Expiring Soon')}
                active={statusFilter === 'Expiring Soon'}
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />}
              />
              <StatCard label="Expired" value={counts.expired} sub="require renewal"
                gradient="linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)"
                glowColor="#dc2626" delay={180}
                onClick={() => setStatus(s => s === 'Expired' ? 'All' : 'Expired')}
                active={statusFilter === 'Expired'}
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              />
            </div>

            {/* ── Empty client ── */}
            {isEmpty && (
              <div
                className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center text-center"
                style={{ animation: 'fadeUpIn 0.3s ease both' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1.5">No certificates added yet</h3>
                <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
                  Add a digital signature certificate for <span className="font-semibold text-slate-600">{activeClientObj?.name}</span> to start tracking its validity.
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 2px 8px rgba(29,78,216,0.22)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add DSC for {activeClientObj?.name}
                </button>
              </div>
            )}

            {/* ── Client DSC card grid (1 or more DSCs for a specific client) ── */}
            {isClientView && (
              <div style={{ animation: 'fadeUpIn 0.3s ease both', animationDelay: '60ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Digital Signature Certificates
                    {statusFilter === 'All'
                      ? ` · ${base.length}`
                      : ` · ${visible.length} of ${base.length} · ${statusFilter}`}
                  </p>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another DSC
                  </button>
                </div>
                {visible.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 py-12 flex flex-col items-center" style={{ animation: 'fadeUpIn 0.2s ease both' }}>
                    <svg className="w-8 h-8 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-500 mb-1">No {statusFilter} certificates</p>
                    <button onClick={() => setStatus('All')} className="text-xs text-blue-600 hover:underline mt-1">Clear filter</button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))',
                    gap: 16,
                  }}>
                    {visible.map((dsc, i) => (
                      <DSCMiniCard key={dsc.id} dsc={dsc} onClick={setSel} delay={i * 60} threshold={alertThreshold} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── All Clients list / table view ── */}
            {isAllView && base.length > 0 && (
              <div style={{ animation: 'fadeUpIn 0.3s ease both', animationDelay: '80ms' }}>

                {/* Filter bar */}
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-0.5 p-1 bg-white rounded-lg border border-slate-200" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    {[
                      { key: 'All',           on: 'bg-slate-900 text-white' },
                      { key: 'Active',        on: 'bg-emerald-600 text-white' },
                      { key: 'Expiring Soon', on: 'bg-amber-500 text-white' },
                      { key: 'Expired',       on: 'bg-red-500 text-white' },
                    ].map(({ key, on }) => {
                      const cnt = base.filter(d => key === 'All' || getStatus(d.expiry_date, alertThreshold) === key).length;
                      return (
                        <button
                          key={key}
                          onClick={() => setStatus(key)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                            statusFilter === key ? on : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {key}
                          {cnt > 0 && (
                            <span className={`ml-1.5 ${statusFilter === key ? 'opacity-70' : 'text-slate-400'}`}>{cnt}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="ml-auto text-xs text-slate-400 font-medium">{visible.length} result{visible.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Table */}
                {visible.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center">
                    <svg className="w-9 h-9 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-500 mb-1">No matching certificates</p>
                    <p className="text-xs text-slate-400">Adjust your filter or search query.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50">
                      <div style={{ width: 9, flexShrink: 0 }} />
                      <button
                        onClick={() => setSortBy(sortBy === 'name_asc' ? 'name_desc' : 'name_asc')}
                        className="flex-1 flex items-center gap-1.5 text-left group"
                      >
                        <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${sortBy === 'name_asc' || sortBy === 'name_desc' ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          Certificate · Client
                        </span>
                        <SortArrow active={sortBy === 'name_asc' || sortBy === 'name_desc'} dir={sortBy === 'name_desc' ? 'desc' : 'asc'} />
                      </button>
                      <p className="hidden xl:block w-36 text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Issuing CA</p>
                      <button
                        onClick={() => setSortBy(sortBy === 'expiry_asc' ? 'expiry_desc' : 'expiry_asc')}
                        className="w-28 flex items-center justify-end gap-1.5 text-right group shrink-0"
                      >
                        <SortArrow active={sortBy === 'expiry_asc' || sortBy === 'expiry_desc'} dir={sortBy === 'expiry_desc' ? 'desc' : 'asc'} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${sortBy === 'expiry_asc' || sortBy === 'expiry_desc' ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          Expiry
                        </span>
                      </button>
                      <button
                        onClick={() => setSortBy('status_priority')}
                        className="w-32 flex items-center gap-1.5 group shrink-0"
                      >
                        <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${sortBy === 'status_priority' ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          Status
                        </span>
                        {sortBy === 'status_priority' && <SortArrow active dir="asc" />}
                      </button>
                      <div style={{ width: 16, flexShrink: 0 }} />
                    </div>
                    {visible.map(dsc => (
                      <DSCRow key={dsc.id} dsc={dsc} clients={clients} onClick={setSel} threshold={alertThreshold} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pb-4" />
          </div>
        </div>
      </main>

      {showSettings && (
        <SettingsPanel
          threshold={alertThreshold}
          onThresholdChange={handleThresholdChange}
          extraEmails={extraEmails}
          onExtraEmailsChange={handleExtraEmailsChange}
          onClose={() => setSettings(false)}
        />
      )}
      {showAdd && (
        <AddDSCWizard
          clients={clients}
          defaultClientId={activeClient === 'all' ? 'own' : activeClient}
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}
      {selected && (
        <DSCDetailPanel
          dsc={selected}
          threshold={alertThreshold}
          onClose={() => setSel(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
