/**
 * Generates a random number between min and max (inclusive).
 * @param min - The minimum number.
 * @param max - The maximum number.
 * @returns A random number from min to max.
 */
export const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Selects n random elements from an array.
 * @param arr - The array to select from.
 * @param n - The number of elements to select.
 * @returns An array containing n random elements from the input array.
 */
export const randomElementsFromArray = <T>(arr: T[], n: number): T[] => {
  if (n >= arr.length) {
    return arr;
  }
  return arr.sort(() => 0.5 - Math.random()).slice(0, n);
};
