import { getGovernmentLevel, sortSchoolsByRating } from '../../utils/governmentLevel.js';

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
