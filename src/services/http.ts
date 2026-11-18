/** Error thrown for any failed API call. `status` is 0 when the request never got a response. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return String(body.message);
    }
  } catch {
    // Not a JSON error body; fall through to the status text.
  }
  return response.statusText || `Request failed with status ${response.status}`;
}

/**
 * Thin fetch wrapper: resolves with parsed JSON or rejects with an ApiError.
 * Responses are trusted to match `T`; a real backend would warrant runtime validation.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(new URL(path, BASE_URL), {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, 'Network request failed');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  return (await response.json()) as T;
}
