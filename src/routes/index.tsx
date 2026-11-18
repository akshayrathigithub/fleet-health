import { Link, Navigate, Route, Routes } from 'react-router';

import { StateMessage } from '@/components';
import { ROUTES } from '@/constants';
import { DevicesPage } from '@/devices';
import { AppLayout } from '@/layout';

/**
 * The list and a selected device share one route with an optional param, so
 * the list stays mounted (and keeps its scroll position) when a device opens.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={ROUTES.devices} replace />} />
        <Route path={ROUTES.devicesPattern} element={<DevicesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <StateMessage
      icon="search"
      title="Page not found"
      description="That address doesn't match anything in Fleet Health."
      action={<Link to={ROUTES.devices}>Go to devices</Link>}
    />
  );
}
