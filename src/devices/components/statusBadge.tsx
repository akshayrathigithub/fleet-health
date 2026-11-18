import { Badge } from '@/components';
import { STATUS_APPEARANCE, STATUS_META } from '@/constants';
import type { HealthStatus } from '../models/types';

export function StatusBadge({ status }: { status: HealthStatus }) {
  const { tone, icon } = STATUS_APPEARANCE[status];

  return (
    <Badge tone={tone} icon={icon}>
      {STATUS_META[status].label}
    </Badge>
  );
}
