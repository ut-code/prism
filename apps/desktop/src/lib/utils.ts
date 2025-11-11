/**
 * Returns an array with unique elements based on a key selector function.
 *
 * @param array - The input array
 * @param keySelector - Function to extract the unique key from each element
 * @returns Array with unique elements based on the key
 */
export function uniqueBy<T, K>(array: T[], keySelector: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of array) {
    const key = keySelector(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}
