'use client';

import { IntegrationMatrix } from '@/components/operations/IntegrationMatrix';
import type { IntegrationRow } from '@/types/operations';

type IntegrationStatusProps = {
  rows: IntegrationRow[];
  loading: boolean;
};

export function IntegrationStatus({ rows, loading }: IntegrationStatusProps) {
  return <IntegrationMatrix rows={rows} loading={loading} />;
}
