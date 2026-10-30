/**
 * SIMULATED BEHAVIOUR — frontend demo only.
 *
 * Every form submission and admin mutation goes through these helpers so the
 * places that will need a real API call are easy to find (search for
 * `simulateRequest`). Nothing here sends data anywhere.
 */

export const IS_DEMO = true;

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves after a short latency. Pass `fail: true` to exercise error states.
 * TODO(api): replace call sites with real requests (quote, contact, admin CRUD).
 */
export async function simulateRequest<T>(
  payload: T,
  { delay = 1100, fail = false }: { delay?: number; fail?: boolean } = {},
): Promise<T> {
  await wait(delay);
  if (fail) throw new Error("Simulated network error");
  return payload;
}

export function demoReference(prefix = "LST"): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${n}`;
}
