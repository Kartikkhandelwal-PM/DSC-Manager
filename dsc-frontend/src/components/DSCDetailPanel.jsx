import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { getStatus, getDaysLeft } from '../data/mockDSCs';

/* ── Read-only field (cert data — cannot be changed) ── */
function ReadField({ label, value, mono, span }) {
  if (!value) return null;
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <div className={`w-full px-3 py-2.5 text-xs rounded-xl bg-slate-100/80 border border-slate-200/60 text-slate-600 leading-snug truncate${mono ? ' font-mono tracking-wide' : ' font-semibold'}`}>
        {value}
      </div>
    </div>
  );
}

/* ── Editable field (user-managed data) ── */
function EditField({ label, name, value, onChange, placeholder, textarea, type, readOnly, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</label>
      {readOnly ? (
        <div className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-100/80 border border-slate-200/60 text-slate-600 font-medium leading-snug min-h-[38px]">
          {value || <span className="text-slate-300 italic text-xs">Not set</span>}
        </div>
      ) : children ? (
        <select
          name={name} value={value} onChange={onChange}
          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 transition-all text-slate-700 font-medium"
        >
          {children}
        </select>
      ) : textarea ? (
        <textarea
          name={name} value={value} onChange={onChange} placeholder={placeholder} rows={2}
          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 focus:bg-white resize-none placeholder:text-slate-300 transition-all font-medium text-slate-700"
        />
      ) : (
        <input
          type={type || 'text'} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300 focus:bg-white placeholder:text-slate-300 transition-all font-medium text-slate-700"
        />
      )}
    </div>
  );
}

/* ── Section wrapper ── */
function FieldSection({ title, iconPath, badge, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">{badge}</span>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {children}
      </div>
    </div>
  );
}

const VALIDITY_DAYS = 3 * 365;

const HEADER = {
  'Active':        { bg: 'linear-gradient(135deg, #0d1b3e, #1a3a7a)', progress: 'from-blue-400 to-blue-300',   ring: 'bg-blue-500/15'  },
  'Expiring Soon': { bg: 'linear-gradient(135deg, #78350f, #b45309)', progress: 'from-amber-400 to-yellow-300', ring: 'bg-amber-500/15' },
  'Expired':       { bg: 'linear-gradient(135deg, #7f1d1d, #991b1b)', progress: 'from-red-400 to-rose-400',     ring: 'bg-red-500/15'   },
};

export default function DSCDetailPanel({ dsc, threshold = 90, onClose, onDelete, onUpdate }) {
  const status   = getStatus(dsc.expiry_date, threshold);
  const daysLeft = getDaysLeft(dsc.expiry_date);
  const progress = Math.max(0, Math.min(100, (daysLeft / VALIDITY_DAYS) * 100));
  const h = HEADER[status] || HEADER['Active'];

  const [showDeleteConfirm, setDelConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    label:        dsc.label        || '',
    location:     dsc.location     || '',
    assigned_to:  dsc.assigned_to  || '',
    notes:        dsc.notes        || '',
    token_label:  dsc.token_label  || '',
    token_serial: dsc.token_serial || '',
  });

  useEffect(() => {
    setEditing(false);
    setForm({
      label:        dsc.label        || '',
      location:     dsc.location     || '',
      assigned_to:  dsc.assigned_to  || '',
      notes:        dsc.notes        || '',
      token_label:  dsc.token_label  || '',
      token_serial: dsc.token_serial || '',
    });
  }, [dsc.id]);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const isDirty = ['label', 'location', 'assigned_to', 'notes', 'token_label', 'token_serial']
    .some(k => (form[k] || '') !== (dsc[k] || ''));

  const handleSave = () => { onUpdate(dsc.id, form); setEditing(false); };
  const handleCancel = () => {
    setForm({
      label: dsc.label || '', location: dsc.location || '',
      assigned_to: dsc.assigned_to || '', notes: dsc.notes || '',
      token_label: dsc.token_label || '', token_serial: dsc.token_serial || '',
    });
    setEditing(false);
  };

  const fmt = s => s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={showDeleteConfirm ? undefined : onClose} />

      <div
        className="relative w-full max-w-md bg-slate-50 flex flex-col overflow-hidden rounded-2xl"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.28)', maxHeight: '90vh', animation: 'popIn 0.22s ease both' }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 px-6 pt-6 pb-7 relative overflow-hidden" style={{ background: h.bg }}>
          <div className={`absolute -right-14 -top-14 w-48 h-48 rounded-full ${h.ring} pointer-events-none`} />
          <div className={`absolute right-4 top-12 w-28 h-28 rounded-full ${h.ring} pointer-events-none`} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={status} />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <h2 className="text-xl font-black text-white mb-0.5 truncate">{dsc.label || dsc.holder_name}</h2>
            <p className="text-sm text-white/55 truncate">{dsc.holder_name} · {dsc.organization}</p>

            <div className="mt-5">
              <div className="flex items-end justify-between mb-2.5">
                <div>
                  <span className="text-4xl font-black text-white leading-none tabular-nums">
                    {daysLeft <= 0 ? '0' : daysLeft}
                  </span>
                  <span className="text-white/55 text-sm ml-2 font-medium">
                    {daysLeft <= 0 ? 'expired' : 'days left'}
                  </span>
                </div>
                <p className="text-xs text-white/45 pb-0.5 font-medium">{fmt(dsc.expiry_date)}</p>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${h.progress} transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Alert banner ── */}
        {status === 'Expiring Soon' && (
          <div className="mx-5 mt-4 shrink-0 flex items-start gap-3 bg-amber-50 border border-amber-200/80 rounded-xl p-3.5">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-xs text-amber-800 font-medium">
              Expires in <span className="font-bold">{daysLeft} days.</span> Renew soon to avoid service disruption.
            </p>
          </div>
        )}
        {status === 'Expired' && (
          <div className="mx-5 mt-4 shrink-0 flex items-start gap-3 bg-red-50 border border-red-200/80 rounded-xl p-3.5">
            <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-red-800 font-medium">This DSC has expired. Renew immediately to continue using it.</p>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* Certificate Holder — read-only */}
          <FieldSection
            title="Certificate Holder"
            iconPath="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            badge="Read-only"
          >
            <div className="grid grid-cols-2 gap-3">
              <ReadField label="Holder Name"  value={dsc.holder_name}  span={2} />
              <ReadField label="Organisation" value={dsc.organization} span={2} />
              <ReadField label="City"         value={dsc.city} />
              <ReadField label="State"        value={dsc.state} />
              <ReadField label="Email"        value={dsc.email}        span={2} />
            </div>
          </FieldSection>

          {/* Certificate Info — read-only */}
          <FieldSection
            title="Certificate Info"
            iconPath="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            badge="Read-only"
          >
            <div className="grid grid-cols-2 gap-3">
              <ReadField label="Serial Number" value={dsc.serial_number} span={2} mono />
              <ReadField label="Issued By"     value={dsc.issued_by}     span={2} />
              <ReadField label="Class"         value={dsc.dsc_class} />
              <ReadField label="Purpose"       value={dsc.dsc_purpose} />
              <ReadField label="Issue Date"    value={fmt(dsc.issue_date)} />
              <ReadField label="Expiry Date"   value={fmt(dsc.expiry_date)} />
            </div>
          </FieldSection>

          {/* Token / Hardware — editable */}
          <FieldSection
            title="Token / Hardware"
            iconPath="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          >
            <div className="grid grid-cols-2 gap-3">
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
          </FieldSection>

          {/* Management — editable */}
          <FieldSection
            title="Management"
            iconPath="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          >
            <EditField label="Label / Nickname" name="label"       value={form.label}       onChange={set} placeholder="e.g. Director Signing DSC" readOnly={!editing} />
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Physical Location" name="location"    value={form.location}    onChange={set} placeholder="e.g. Office Drawer 3"    readOnly={!editing} />
              <EditField label="Assigned To"       name="assigned_to" value={form.assigned_to} onChange={set} placeholder="e.g. Accounts Team"       readOnly={!editing} />
            </div>
            <EditField label="Notes" name="notes" value={form.notes} onChange={set} placeholder="Any remarks about this DSC..." textarea readOnly={!editing} />
          </FieldSection>

          <p className="text-xs text-center text-slate-400 pb-2 font-medium">
            Added via {dsc.added_method === 'token' ? 'USB token' : 'manual entry'} · {fmt(dsc.created_at)}
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-200 bg-white px-5 py-4 shrink-0">
          {showDeleteConfirm ? (
            <div style={{ animation: 'popIn 0.18s ease both' }}>
              <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-700 leading-none mb-0.5">Delete permanently?</p>
                  <p className="text-[11px] text-red-500 truncate">{dsc.label || dsc.holder_name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDelConfirm(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(dsc.id)}
                  className="flex-1 py-2 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 8px rgba(239,68,68,0.3)' }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          ) : editing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}
              >
                {isDirty ? 'Save Changes' : 'Done'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-3">
                {(status === 'Expiring Soon' || status === 'Expired') && (
                  <button
                    className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}
                  >
                    Renew via Capricorn
                  </button>
                )}
                <button
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                  onClick={() => setEditing(true)}
                >
                  Edit Details
                </button>
              </div>
              <button
                onClick={() => setDelConfirm(true)}
                className="w-full mt-2.5 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
              >
                Remove this DSC
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
