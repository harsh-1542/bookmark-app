/**
 * Utility helpers shared across the application.
 * Keep this file lean — domain-specific helpers belong in their own modules.
 */

/**
 * Merge class names conditionally (lightweight clsx alternative).
 * Replace with `clsx` + `tailwind-merge` once installed.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date value into a localised string.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}
