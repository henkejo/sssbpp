export const validNonNegativeIntegerParam = (value: string): boolean => {
  return !isNaN(parseInt(value)) && parseInt(value) >= 0;
};