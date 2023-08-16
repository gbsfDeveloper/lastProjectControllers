/**
 * Generate a random number between min and max, INCLUDING both min and max
 */
export function genRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
