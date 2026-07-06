import { useState, useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';
import { getStatus, getDaysLeft } from '../data/mockDSCs';

/* ── Read-only field ── */
function ReadField({ label, value, mono, span }) {
  if (!value) return null;
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </label>
      <div
        className={`w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-800 text-sm leading-snug truncate${
          mono ? ' font-mono font-medium tracking-wide' : ' font-medium'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ── Editable field ── */
function EditField({ label, name, value, onChange, placeholder, textarea, type, readOnly, required, children }) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (reveal ? 'text' : 'password') : (type || 'text');

  return (
    <div>
      <label className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
        {label}
        {required && <span className="text-red-400 font-bold not-uppercase normal-case tracking-normal text-[11px] leading-none">*</span>}
      </label>
      {readOnly ? (
        <div className="w-full px-3 py-1.5 text-sm rounded-lg bg-slate-50 border border-slate-200/70 text-slate-800 font-medium leading-snug min-h-[34px] flex items-center justify-between gap-2">
          {value ? (
            isPassword ? (
              <>
                <span className="tracking-[0.25em] text-slate-500 select-none">
                  {reveal ? value : '•'.repeat(Math.min(value.length, 10))}
                </span>
                <button
                  type="button"
                  onClick={() => setReveal(r => !r)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {reveal ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </>
            ) : value
          ) : (
            <span className="text-slate-300 italic text-xs font-normal">Not set</span>
          )}
        </div>
      ) : children ? (
        <select
          name={name} value={value} onChange={onChange}
          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-medium shadow-sm appearance-none cursor-pointer"
        >
          {children}
        </select>
      ) : textarea ? (
        <textarea
          name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3}
          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none placeholder:text-slate-300 transition-all font-medium text-slate-800 shadow-sm"
        />
      ) : (
        <div className={isPassword ? 'relative' : undefined}>
          <input
            type={resolvedType} name={name} value={value} onChange={onChange} placeholder={placeholder}
            className={`w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-300 transition-all font-medium text-slate-800 shadow-sm${isPassword ? ' pr-9' : ''}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setReveal(r => !r)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {reveal ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section wrapper ── */
function FieldSection({ title, iconPath, badge, children }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200/80 tracking-wide">
            {badge}
          </span>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {children}
      </div>
    </div>
  );
}

const VALIDITY_DAYS = 3 * 365;

const HEADER = {
  'Active':        { bg: 'linear-gradient(150deg, #60a5fa 0%, #a78bfa 100%)', progress: 'from-violet-200 to-blue-100',  ring: 'bg-violet-200/30' },
  'Expiring Soon': { bg: 'linear-gradient(150deg, #fbbf24 0%, #fb923c 100%)', progress: 'from-orange-200 to-amber-100', ring: 'bg-orange-200/30' },
  'Expired':       { bg: 'linear-gradient(150deg, #f87171 0%, #fb7185 100%)', progress: 'from-rose-200 to-pink-100',    ring: 'bg-rose-200/30'   },
};

export default function DSCDetailPanel({ dsc, threshold = 90, onClose, onDelete, onUpdate }) {
  const status   = getStatus(dsc.expiry_date, threshold);
  const daysLeft = getDaysLeft(dsc.expiry_date);
  const progress = Math.max(0, Math.min(100, (daysLeft / VALIDITY_DAYS) * 100));
  const h = HEADER[status] || HEADER['Active'];

  const bodyRef = useRef(null);
  const [bannerHidden, setBannerHidden] = useState(false);
  const [showDeleteConfirm, setDelConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    label:         dsc.label         || '',
    location:      dsc.location      || '',
    assigned_to:   dsc.assigned_to   || '',
    notes:         dsc.notes         || '',
    token_label:   dsc.token_label   || '',
    token_serial:  dsc.token_serial  || '',
    token_pin:     dsc.token_pin     || '',
    cert_password: dsc.cert_password || '',
  });

  useEffect(() => { setBannerHidden(false); }, [dsc.id]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => setBannerHidden(el.scrollTop > 20);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setEditing(false);
    setForm({
      label:         dsc.label         || '',
      location:      dsc.location      || '',
      assigned_to:   dsc.assigned_to   || '',
      notes:         dsc.notes         || '',
      token_label:   dsc.token_label   || '',
      token_serial:  dsc.token_serial  || '',
      token_pin:     dsc.token_pin     || '',
      cert_password: dsc.cert_password || '',
    });
  }, [dsc.id]);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const isDirty = ['label', 'location', 'assigned_to', 'notes', 'token_label', 'token_serial', 'token_pin', 'cert_password']
    .some(k => (form[k] || '') !== (dsc[k] || ''));

  const handleSave = () => { onUpdate(dsc.id, form); setEditing(false); };
  const handleCancel = () => {
    setForm({
      label: dsc.label || '', location: dsc.location || '',
      assigned_to: dsc.assigned_to || '', notes: dsc.notes || '',
      token_label: dsc.token_label || '', token_serial: dsc.token_serial || '',
      token_pin: dsc.token_pin || '', cert_password: dsc.cert_password || '',
    });
    setEditing(false);
  };

  const fmt = s => s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={showDeleteConfirm ? undefined : onClose} />

      <div
        className="relative w-full max-w-xl bg-slate-50 flex flex-col overflow-hidden rounded-2xl"
        style={{ boxShadow: '0 32px 72px rgba(0,0,0,0.32)', maxHeight: '90vh', animation: 'popIn 0.22s ease both' }}
      >

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="shrink-0 relative overflow-hidden" style={{ background: h.bg }}>
          {/* Decorative orbs — bottom-right corner only, never over text */}
          <div className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full ${h.ring} pointer-events-none`} />
          <div className={`absolute right-14 -bottom-16 w-28 h-28 rounded-full ${h.ring} pointer-events-none`} />

          <div className="relative z-10 px-5 pt-4 pb-4">
            {/* Row 1 — badge + close */}
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={status} />
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Row 2 — title + days-left */}
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-white leading-tight truncate mb-0.5" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.30)' }}>
                  {dsc.label || dsc.holder_name}
                </h2>
                <p className="text-xs text-white font-medium truncate" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>
                  {dsc.holder_name} · {dsc.organization}
                </p>
              </div>
              <div className="shrink-0 text-right pb-0.5">
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-2xl font-black text-white tabular-nums leading-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.30)' }}>
                    {daysLeft <= 0 ? '0' : daysLeft}
                  </span>
                  <span className="text-xs text-white font-semibold mb-0.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>
                    {daysLeft <= 0 ? 'expired' : 'days'}
                  </span>
                </div>
                <p className="text-[10px] text-white font-medium mt-0.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.25)', opacity: 0.85 }}>
                  {daysLeft <= 0 ? 'Renewal overdue' : 'remaining'}
                </p>
              </div>
            </div>

            {/* Row 3 — progress bar + dates */}
            <div className="mt-3">
              <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${h.progress}`}
                  style={{ width: `${progress}%`, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)', opacity: 0.80 }}>Issued {fmt(dsc.issue_date)}</span>
                <span className="text-[10px] text-white font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)', opacity: 0.80 }}>Expires {fmt(dsc.expiry_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Alert banner (flips away on scroll) ─────────────────── */}
        {(status === 'Expiring Soon' || status === 'Expired') && (
          <div
            className="shrink-0 overflow-hidden"
            style={{
              maxHeight: bannerHidden ? 0 : '72px',
              marginTop: bannerHidden ? 0 : '12px',
              transition: 'max-height 0.42s cubic-bezier(.4,0,.2,1), margin-top 0.42s ease',
            }}
          >
            <div
              className={`mx-5 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 ${
                status === 'Expiring Soon'
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-red-50 border border-red-200'
              }`}
              style={{
                transformOrigin: 'top center',
                transform: bannerHidden
                  ? 'perspective(480px) rotateX(-88deg) scaleY(0.4)'
                  : 'perspective(480px) rotateX(0deg) scaleY(1)',
                opacity: bannerHidden ? 0 : 1,
                transition: 'transform 0.38s cubic-bezier(.4,0,.2,1), opacity 0.28s ease',
              }}
            >
              {status === 'Expiring Soon' ? (
                <>
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-xs text-amber-800 font-medium">
                    Expires in <span className="font-bold">{daysLeft} days</span> — renew soon to avoid service disruption.
                  </p>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-800 font-medium">This DSC has expired. Renew immediately to continue using it.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Body ────────────────────────────────────────────────── */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto min-h-0">
          <div className="px-5 py-4">

            <FieldSection
              title="Certificate Holder"
              iconPath="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              badge="Read-only"
            >
              <div className="grid grid-cols-2 gap-2">
                <ReadField label="Holder Name"  value={dsc.holder_name}  span={2} />
                <ReadField label="Organisation" value={dsc.organization} span={2} />
                <ReadField label="City"         value={dsc.city} />
                <ReadField label="State"        value={dsc.state} />
                <ReadField label="Email"        value={dsc.email}        span={2} />
              </div>
            </FieldSection>

            <FieldSection
              title="Certificate Info"
              iconPath="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              badge="Read-only"
            >
              <div className="grid grid-cols-2 gap-2">
                <ReadField label="Serial Number" value={dsc.serial_number} span={2} mono />
                <ReadField label="Issued By"     value={dsc.issued_by}     span={2} />
                <ReadField label="Class"         value={dsc.dsc_class} />
                <ReadField label="Purpose"       value={dsc.dsc_purpose} />
                <ReadField label="Issue Date"    value={fmt(dsc.issue_date)} />
                <ReadField label="Expiry Date"   value={fmt(dsc.expiry_date)} />
              </div>
            </FieldSection>

            <FieldSection
              title="Token / Hardware"
              iconPath="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <EditField label="Token Brand" name="token_label" value={form.token_label} onChange={set} placeholder="e.g. ePass2003" readOnly={!editing}>
                    <option value="">— Select token —</option>
                    <option>ePass2003</option>
                    <option>WatchData</option>
                    <option>PROXKey</option>
                    <option>SafeNet iKey</option>
                    <option>Feitian ePass</option>
                    <option>Aladdin eToken</option>
                    <option>Other</option>
                  </EditField>
                </div>
                <EditField label="Token Serial" name="token_serial" value={form.token_serial} onChange={set} placeholder="HW12345678" readOnly={!editing} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EditField label="Token PIN" name="token_pin" value={form.token_pin} onChange={set} placeholder="e.g. 123456" type="password" readOnly={!editing} />
                <EditField label="Cert Password" name="cert_password" value={form.cert_password} onChange={set} placeholder="Certificate password" type="password" readOnly={!editing} />
              </div>
            </FieldSection>

            <FieldSection
              title="Management"
              iconPath="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            >
              <EditField label="Label / Nickname" name="label" value={form.label} onChange={set} placeholder="e.g. Director Signing DSC" readOnly={!editing} />
              <div className="grid grid-cols-2 gap-2">
                <EditField label="Physical Location" name="location"    value={form.location}    onChange={set} placeholder="e.g. Office Drawer 3" readOnly={!editing} />
                <EditField label="Assigned To"       name="assigned_to" value={form.assigned_to} onChange={set} placeholder="e.g. Accounts Team"   readOnly={!editing} />
              </div>
              <EditField label="Notes" name="notes" value={form.notes} onChange={set} placeholder="Any remarks about this DSC..." textarea readOnly={!editing} />
            </FieldSection>

            <p className="text-[11px] text-slate-400 font-medium text-center pb-1">
              Added via {dsc.added_method === 'token' ? 'USB token' : 'manual entry'} · {fmt(dsc.created_at)}
            </p>

          </div>
        </div>

        {/* ── Delete confirmation overlay (full-panel modal) ─────── */}
        {showDeleteConfirm && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center p-8 rounded-2xl"
            style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', animation: 'popIn 0.18s ease both' }}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)', animation: 'popIn 0.22s ease both' }}
            >
              <div className="px-6 pt-7 pb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">Remove this DSC?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">{dsc.label || dsc.holder_name}</span> will be permanently deleted and cannot be recovered.
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setDelConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(dsc.id)}
                  className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 12px rgba(239,68,68,0.35)' }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 bg-white px-5 py-3 shrink-0">
          {editing ? (
            <div className="flex items-center justify-end gap-2.5">
              {isDirty && (
                <p className="text-[11px] text-slate-400 mr-auto">You have unsaved changes</p>
              )}
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm font-semibold rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-white text-sm font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 2px 10px rgba(29,78,216,0.3)' }}
              >
                {isDirty ? 'Save Changes' : 'Done'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {/* Destructive — isolated on the left */}
              <button
                onClick={() => setDelConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>

              {/* Primary actions — right */}
              <div className="flex items-center gap-2.5">
                <button
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
                  onClick={() => setEditing(true)}
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
