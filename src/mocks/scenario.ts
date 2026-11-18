/**
 * Demo switches for the mock API, set with a `?mock=` query param on the page:
 *
 *   ?mock=error         the device list fails to load
 *   ?mock=empty         the fleet has no devices
 *   ?mock=slow          the device list takes three seconds
 *   ?mock=action-error  acknowledging and flagging fail (shows rollback)
 *
 * This works because MSW runs request handlers in the page, not in the
 * service worker, so they can read the page URL.
 */
const SCENARIOS = ['error', 'empty', 'slow', 'action-error'] as const;

export type Scenario = (typeof SCENARIOS)[number];

export function getScenario(): Scenario | null {
  const value = new URLSearchParams(window.location.search).get('mock');
  return SCENARIOS.find((scenario) => scenario === value) ?? null;
}
