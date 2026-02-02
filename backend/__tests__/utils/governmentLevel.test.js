import {
  getGovernmentLevel,
  sortSchoolsByRating,
  computeRatingScore,
  computeAverageRating,
} from '../../utils/governmentLevel.js';

// ─── computeRatingScore ─────────────────────────────────────────────

describe('computeRatingScore', () => {
  test('evaluation-based: 10/10 criteria true => 5.0', () => {
    const rating = {
      stars: null,
      evaluation: {
        officiallyRegistered: true,
        qualifiedSpecialists: true,
        individualPlan: true,
        safeEnvironment: true,
        medicalRequirements: true,
        developmentalActivities: true,
        foodQuality: true,
        regularInformation: true,
        clearPayments: true,
        kindAttitude: true,
      },
    };
    expect(computeRatingScore(rating)).toBe(5);
  });

  test('evaluation-based: 5/10 criteria true => 2.5', () => {
    const rating = {
      stars: null,
      evaluation: {
        officiallyRegistered: true,
        qualifiedSpecialists: true,
        individualPlan: true,
        safeEnvironment: true,
        medicalRequirements: true,
        developmentalActivities: false,
        foodQuality: false,
        regularInformation: false,
        clearPayments: false,
        kindAttitude: false,
      },
    };
    expect(computeRatingScore(rating)).toBe(2.5);
  });

  test('evaluation-based: 7/10 criteria true => 3.5', () => {
    const rating = {
      stars: null,
      evaluation: {
        officiallyRegistered: true,
        qualifiedSpecialists: true,
        individualPlan: true,
        safeEnvironment: true,
        medicalRequirements: true,
        developmentalActivities: true,
        foodQuality: true,
        regularInformation: false,
        clearPayments: false,
        kindAttitude: false,
      },
    };
    expect(computeRatingScore(rating)).toBe(3.5);
  });

  test('evaluation takes priority over stars', () => {
    const rating = {
      stars: 5,
      evaluation: {
        officiallyRegistered: true,
        qualifiedSpecialists: false,
        individualPlan: false,
        safeEnvironment: false,
        medicalRequirements: false,
        developmentalActivities: false,
        foodQuality: false,
        regularInformation: false,
        clearPayments: false,
        kindAttitude: false,
      },
    };
    // 1/10 * 5 = 0.5, not the stars=5
    expect(computeRatingScore(rating)).toBe(0.5);
  });

  test('stars-based: returns star value directly', () => {
    expect(computeRatingScore({ stars: 4, evaluation: null })).toBe(4);
    expect(computeRatingScore({ stars: 1, evaluation: {} })).toBe(1);
    expect(computeRatingScore({ stars: 5 })).toBe(5);
  });

  test('empty evaluation falls through to stars', () => {
    expect(computeRatingScore({ stars: 3, evaluation: {} })).toBe(3);
  });

  test('returns null for ratings with no usable data', () => {
    expect(computeRatingScore({ stars: null, evaluation: null })).toBeNull();
    expect(computeRatingScore({ stars: null, evaluation: {} })).toBeNull();
    expect(computeRatingScore({ stars: undefined })).toBeNull();
    expect(computeRatingScore({})).toBeNull();
  });

  test('invalid stars (out of range) => null', () => {
    expect(computeRatingScore({ stars: 0 })).toBeNull();
    expect(computeRatingScore({ stars: 6 })).toBeNull();
    expect(computeRatingScore({ stars: -1 })).toBeNull();
  });
});

// ─── computeAverageRating ───────────────────────────────────────────

describe('computeAverageRating', () => {
  test('mixed evaluation and stars ratings', () => {
    const ratings = [
      {
        stars: null,
        evaluation: {
          officiallyRegistered: true, qualifiedSpecialists: true,
          individualPlan: true, safeEnvironment: true, medicalRequirements: true,
          developmentalActivities: false, foodQuality: false,
          regularInformation: false, clearPayments: false, kindAttitude: false,
        },
      }, // score = 2.5
      { stars: 4, evaluation: {} }, // score = 4
    ];
    const result = computeAverageRating(ratings);
    // (2.5 + 4) / 2 = 3.25 → 3.3
    expect(result.average).toBe(3.3);
    expect(result.count).toBe(2);
  });

  test('skips ratings with no usable data', () => {
    const ratings = [
      { stars: 5, evaluation: {} },
      { stars: null, evaluation: null }, // skipped
      { stars: null, evaluation: {} },   // skipped
      { stars: 3, evaluation: {} },
    ];
    const result = computeAverageRating(ratings);
    // (5 + 3) / 2 = 4
    expect(result.average).toBe(4);
    expect(result.count).toBe(2);
  });

  test('empty array', () => {
    const result = computeAverageRating([]);
    expect(result.average).toBe(0);
    expect(result.count).toBe(0);
  });

  test('all null scores', () => {
    const result = computeAverageRating([
      { stars: null, evaluation: {} },
      { stars: null },
    ]);
    expect(result.average).toBe(0);
    expect(result.count).toBe(0);
  });

  test('all evaluation-based ratings', () => {
    const make = (met) => ({
      stars: null,
      evaluation: Object.fromEntries([
        'officiallyRegistered', 'qualifiedSpecialists', 'individualPlan',
        'safeEnvironment', 'medicalRequirements', 'developmentalActivities',
        'foodQuality', 'regularInformation', 'clearPayments', 'kindAttitude',
      ].map((k, i) => [k, i < met])),
    });
    // 8/10 = 4.0, 6/10 = 3.0, 10/10 = 5.0 => avg = 4.0
    const result = computeAverageRating([make(8), make(6), make(10)]);
    expect(result.average).toBe(4);
    expect(result.count).toBe(3);
  });
});

// ─── getGovernmentLevel ─────────────────────────────────────────────

describe('getGovernmentLevel', () => {
  test.each([
    [5.0, 5],
    [4.8, 5],
    [4.5, 5],
    [4.49, 4],
    [4.0, 4],
    [3.99, 3],
    [3.5, 3],
    [3.0, 3],
    [2.99, 2],
    [2.0, 2],
    [1.99, 1],
    [1.0, 1],
    [0, 1],
  ])('rating %f => level %i', (rating, expected) => {
    expect(getGovernmentLevel(rating)).toBe(expected);
  });
});

// ─── sortSchoolsByRating ────────────────────────────────────────────

describe('sortSchoolsByRating', () => {
  test('sorts by averageRating DESC', () => {
    const schools = [
      { name: 'A', averageRating: 4.5, ratingsCount: 10 },
      { name: 'B', averageRating: 4.3, ratingsCount: 10 },
      { name: 'C', averageRating: 4.8, ratingsCount: 10 },
    ];
    const sorted = sortSchoolsByRating(schools);
    expect(sorted.map(s => s.name)).toEqual(['C', 'A', 'B']);
  });

  test('tie-breaker: ratingsCount DESC when averageRating is equal', () => {
    const schools = [
      { name: 'X', averageRating: 4.0, ratingsCount: 5 },
      { name: 'Y', averageRating: 4.0, ratingsCount: 20 },
      { name: 'Z', averageRating: 4.0, ratingsCount: 10 },
    ];
    const sorted = sortSchoolsByRating(schools);
    expect(sorted.map(s => s.name)).toEqual(['Y', 'Z', 'X']);
  });

  test('tie-breaker: name ASC when averageRating and ratingsCount are equal', () => {
    const schools = [
      { name: 'Gamma', averageRating: 3.5, ratingsCount: 10 },
      { name: 'Alpha', averageRating: 3.5, ratingsCount: 10 },
      { name: 'Beta', averageRating: 3.5, ratingsCount: 10 },
    ];
    const sorted = sortSchoolsByRating(schools);
    expect(sorted.map(s => s.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  test('full tie-breaker chain: A=4.5, B=4.3, C=4.8 => C, A, B', () => {
    const schools = [
      { name: 'A', averageRating: 4.5, ratingsCount: 8 },
      { name: 'B', averageRating: 4.3, ratingsCount: 12 },
      { name: 'C', averageRating: 4.8, ratingsCount: 5 },
    ];
    const sorted = sortSchoolsByRating(schools);
    expect(sorted.map(s => s.name)).toEqual(['C', 'A', 'B']);
  });

  test('does not mutate the input array', () => {
    const schools = [
      { name: 'B', averageRating: 3.0, ratingsCount: 1 },
      { name: 'A', averageRating: 5.0, ratingsCount: 1 },
    ];
    const original = [...schools];
    sortSchoolsByRating(schools);
    expect(schools).toEqual(original);
  });

  test('empty array returns empty', () => {
    expect(sortSchoolsByRating([])).toEqual([]);
  });
});
