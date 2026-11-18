import { delay, http, HttpResponse } from 'msw';

import { API_PATTERNS, MOCK_SLOW_DELAY_MS } from '@/constants';

import { db } from './db';
import { getScenario } from './scenario';

/**
 * The simulated device API. The app calls these endpoints with real `fetch`
 * requests; Mock Service Worker intercepts them in the browser.
 *
 * `delay()` adds realistic latency so loading states are visible.
 */

const notFound = (message: string) => HttpResponse.json({ message }, { status: 404 });
const serverError = () =>
  HttpResponse.json({ message: 'Fleet service unavailable' }, { status: 503 });

export const handlers = [
  http.get(API_PATTERNS.devices, async () => {
    const scenario = getScenario();
    await delay(scenario === 'slow' ? MOCK_SLOW_DELAY_MS : undefined);

    if (scenario === 'error') return serverError();
    if (scenario === 'empty') return HttpResponse.json([]);
    return HttpResponse.json(db.listDevices());
  }),

  http.get<{ deviceId: string }>(API_PATTERNS.device, async ({ params }) => {
    await delay();

    const device = db.getDevice(params.deviceId);
    return device ? HttpResponse.json(device) : notFound('Device not found');
  }),

  http.post<{ deviceId: string; alertId: string }>(
    API_PATTERNS.acknowledgeAlert,
    async ({ params }) => {
      await delay();
      if (getScenario() === 'action-error') return serverError();

      const device = db.acknowledgeAlert(params.deviceId, params.alertId);
      return device ? HttpResponse.json(device) : notFound('Device or alert not found');
    },
  ),

  http.put<{ deviceId: string }>(API_PATTERNS.replacementFlag, async ({ params }) => {
    await delay();
    if (getScenario() === 'action-error') return serverError();

    const device = db.flagForReplacement(params.deviceId);
    return device ? HttpResponse.json(device) : notFound('Device not found');
  }),
];
