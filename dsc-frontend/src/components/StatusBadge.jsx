export default function StatusBadge({ status }) {
  const config = {
    'Active':        { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200/60' },
    'Expiring Soon': { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200/60'  },
    'Expired':       { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     border: 'border-red-200/60'    },
    'Revoked':       { bg: 'bg-slate-100',  text: 'text-slate-600',   dot: 'bg-slate-400',   border: 'border-slate-200/60'  },
  };
  const c = config[status] || config['Active'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.bg} ${c.text} ${c.border} shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot} ${status === 'Expiring Soon' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
