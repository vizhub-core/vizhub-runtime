// Generate a unique request ID,
// for uniquely identifying messages
// sent to the worker or iframe from the
// main thread.
export const generateRequestId = (): string =>
  (Math.random() + "").slice(2);
