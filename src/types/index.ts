/**
 * Barrel file for shared application types.
 *
 * Organise domain types into separate files and re-export here, e.g.:
 *   export * from "./bookmark";
 *   export * from "./user";
 */

// ─── Utility types ────────────────────────────────────────────────────────────

/** Make selected keys in T optional. */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make selected keys in T required. */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Generic async server-action result shape. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
