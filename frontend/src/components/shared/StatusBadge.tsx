import { STATUS_COLORS, STATUS_ICONS } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS["pending"];
  const icon = STATUS_ICONS[status.toLowerCase()] || STATUS_ICONS["pending"];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
      {icon}
      {status}
    </span>
  );
}
