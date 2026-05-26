import { useState } from 'react';
import { getStatus, getDaysLeft } from '../data/mockDSCs';

function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysText(n) {
  if (n <= 0)  return 'Expired';
  if (n <= 90) return `${n} days left`;
  return `${Math.floor(n / 30)} months left`;
}

const STATUS_STYLE = {
  'Active':        { bar: 'linear-gradient(90deg, #059669, #34d399)', badge: '#dcfce7', badgeText: '#166534', daysColor: '#16a34a' },
  'Expiring Soon': { bar: 'linear-gradient(90deg, #d97706, #fbbf24)', badge: '#fef3c7', badgeText: '#92400e', daysColor: '#d97706' },
  'Expired':       { bar: 'linear-gradient(90deg, #dc2626, #f87171)', badge: '#fee2e2', badgeText: '#7f1d1d', daysColor: '#dc2626' },
};

export default function DSCCard({ dsc, onClick, index = 0, threshold = 90 }) {
  const [hov, setHov] = useState(false);
  const status   = getStatus(dsc.expiry_date, threshold);
  const daysLeft = getDaysLeft(dsc.expiry_date);
  const sc       = STATUS_STYLE[status] || STATUS_STYLE['Active'];

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
        animationDelay: `${Math.min(index * 50, 350)}ms`,
        boxShadow: hov ? '0 10px 32px rgba(0,0,0,0.11)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Color bar */}
      <div style={{ height: 4, background: sc.bar }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {/* Status + days */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
            background: sc.badge, color: sc.badgeText,
          }}>
            {status}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: sc.daysColor }}>
            {daysText(daysLeft)}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 14, fontWeight: 700, marginBottom: 2, lineHeight: 1.25,
          color: hov ? '#1d4ed8' : '#0f172a',
          transition: 'color 0.15s',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {dsc.label || dsc.holder_name}
        </h3>
        <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {dsc.holder_name}
        </p>

        <div style={{ height: 1, background: '#f1f5f9', marginBottom: 12 }} />

        {/* Key info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Row label="Issued by" value={dsc.issued_by} />
          <Row label="Expires"   value={fmtDate(dsc.expiry_date)} />
          {dsc.location && <Row label="Location" value={dsc.location} />}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 6 }}>
            {dsc.dsc_class}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3, opacity: hov ? 1 : 0, transition: 'opacity 0.15s' }}>
            Details
            <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}
