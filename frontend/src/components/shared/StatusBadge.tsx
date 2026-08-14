import { STATUS_COLORS, STATUS_ICONS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_ICONS } from '@/lib/constants';

export function StatusBadge({ status, type = 'order' }: { status: string, type?: 'order' | 'payment' }) {
  const isPayment = type === 'payment';
  const colorMap = isPayment ? PAYMENT_STATUS_COLORS : STATUS_COLORS;
  const iconMap = isPayment ? PAYMENT_STATUS_ICONS : STATUS_ICONS;
  
  const color = colorMap[status.toUpperCase()] || colorMap[isPayment ? "UNPAID" : "PENDING"];
  const icon = iconMap[status.toUpperCase()] || iconMap[isPayment ? "UNPAID" : "PENDING"];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
      {icon}
      {status}
    </span>
  );
}
