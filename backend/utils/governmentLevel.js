/**
 * The 10 evaluation criteria used in the new rating format.
 */
const EVALUATION_CRITERIA = [
  'officiallyRegistered',
  'qualifiedSpecialists',
  'individualPlan',
  'safeEnvironment',
  'medicalRequirements',
  'developmentalActivities',
  'foodQuality',
  'regularInformation',
  'clearPayments',
  'kindAttitude',
];

/**
 * Compute the effective 0–5 score for a single SchoolRating record.
 *
 * The rating system has two formats:
 *   1. New `evaluation` (JSONB with 10 boolean criteria, stars = NULL)
 *      → score = (criteria met / 10) × 5
 *   2. Legacy `stars` (INTEGER 1–5)
 *      → score = stars value
 *
 * @param {{ stars?: number|null, evaluation?: object|null }} rating
 * @returns {number|null} Score 0–5, or null if rating has no usable data
 */
export function computeRatingScore(rating) {
  // Check evaluation first (newer format takes priority)
  const eval_ = rating.evaluation;
  if (eval_ && typeof eval_ === 'object' && !Array.isArray(eval_)) {
    const keys = Object.keys(eval_);
    if (keys.length > 0) {
      const met = EVALUATION_CRITERIA.filter(k => eval_[k] === true).length;
      return (met / EVALUATION_CRITERIA.length) * 5;
    }
  }

  // Fall back to stars
  if (rating.stars !== null && rating.stars !== undefined) {
    const n = Number(rating.stars);
    if (!isNaN(n) && n >= 1 && n <= 5) return n;
  }

  return null;
}

/**
 * Compute the average rating for an array of SchoolRating records.
 * Skips ratings that have no usable data (null score).
 *
 * @param {Array<{ stars?: number|null, evaluation?: object|null }>} ratings
 * @returns {{ average: number, count: number }}
 *   average – 0–5 rounded to 1 decimal, count – number of scoreable ratings
 */
export function computeAverageRating(ratings) {
  let sum = 0;
  let count = 0;

  for (const r of ratings) {
    const score = computeRatingScore(r);
    if (score !== null) {
      sum += score;
      count++;
    }
  }

  const average = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
  return { average, count };
}

/**
 * Compute government level from a school's average rating.
 *
 * Level 5: 4.5 – 5.0
 * Level 4: 4.0 – 4.49
 * Level 3: 3.0 – 3.99
 * Level 2: 2.0 – 2.99
 * Level 1: 0.01 – 1.99
 * null:    no ratings (unrated)
 *
 * @param {number} averageRating - The school's average rating (0–5)
 * @param {number} [ratingsCount] - Number of ratings (if 0, returns null)
 * @returns {number|null} Government level (1–5), or null if unrated
 */
export function getGovernmentLevel(averageRating, ratingsCount) {
  if (ratingsCount !== undefined && ratingsCount === 0) return null;
  if (averageRating >= 4.5) return 5;
  if (averageRating >= 4.0) return 4;
  if (averageRating >= 3.0) return 3;
  if (averageRating >= 2.0) return 2;
  if (averageRating > 0) return 1;
  return null;
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
