/**
 * Parses year string to number, handling formats like "1999" or "1999-2000"
 * Returns the first year if it's a range, or the year itself if it's a single year
 *
 * @param year - Year as string, number, or undefined
 * @returns Parsed year as number, or 0 if invalid
 *
 * @example
 * parseYear("1999") // returns 1999
 * parseYear("1999-2000") // returns 1999
 * parseYear(1999) // returns 1999
 * parseYear(undefined) // returns 0
 */
export function parseYear(year: string | number | undefined): number {
  if (typeof year === "number") {
    return year;
  }

  if (!year || typeof year !== "string") {
    return 0;
  }

  // Handle range format like "1999-2000" - extract first year
  const yearStr = year.trim();
  const firstYear = yearStr.split("-")[0]?.trim();

  if (!firstYear) {
    return 0;
  }

  const parsed = parseInt(firstYear, 10);
  return isNaN(parsed) ? 0 : parsed;
}
