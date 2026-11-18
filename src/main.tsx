import './styles/global.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './providers';

/**
 * This project has no backend, so the mock API is always on. It answers the
 * app's real `fetch` calls from a service worker. With a real backend, this
 * function would run in development only (or be removed) and nothing else in
 * the app would change.
 */
async function startMockApi() {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
}

function renderApp() {
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root element');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

startMockApi()
  .catch((error: unknown) => {
    // Render anyway: the app shows its own error state when requests fail.
    console.error('Mock API failed to start', error);
  })
  .then(renderApp);
