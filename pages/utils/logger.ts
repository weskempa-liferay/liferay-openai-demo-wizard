export const logger =
  (context: string) =>
  (...log) =>
    console.debug(`[${context}]:`, ...log);
