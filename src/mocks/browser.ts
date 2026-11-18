import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** Service worker that answers the app's API requests in the browser. */
export const worker = setupWorker(...handlers);
