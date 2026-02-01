/**
 * Compute government level from a school's average rating.
 *
 * Level 5: 4.5 – 5.0
 * Level 4: 4.0 – 4.49
 * Level 3: 3.0 – 3.99
 * Level 2: 2.0 – 2.99
 * Level 1: < 2.0
 *
 * @param {number} averageRating - The school's average rating (0–5)
 * @returns {number} Government level (1–5)
 */
export function getGovernmentLevel(averageRating) {
  if (averageRating >= 4.5) return 5;
  if (averageRating >= 4.0) return 4;
  if (averageRating >= 3.0) return 3;
  if (averageRating >= 2.0) return 2;
  return 1;
}

/**
 * Sort schools by: averageRating DESC, ratingsCount DESC, name ASC.
 * Returns a new sorted array (does not mutate input).
 *
 * @param {Array<{averageRating: number, ratingsCount: number, name: string}>} schools
 * @returns {Array} Sorted copy
 */
export function sortSchoolsByRating(schools) {
  return [...schools].sort((a, b) => {
    if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
    if (b.ratingsCount !== a.ratingsCount) return b.ratingsCount - a.ratingsCount;
    return (a.name || '').localeCompare(b.name || '');
  });
}
