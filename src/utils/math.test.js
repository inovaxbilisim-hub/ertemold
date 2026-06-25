import { add } from '../src/utils/math';

describe('math utils', () => {
  test('add works', () => {
    expect(add(1, 2)).toBe(3);
  });
});