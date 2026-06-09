export function getLevelFromAptNr(aptNr: string): number | null {
  const digits = aptNr.replace(/\D/g, '');
  if (digits.length >= 4) {
    return parseInt(digits.charAt(1), 10);
  }
  if (digits.length === 3) {
    return parseInt(digits.charAt(0), 10);
  }
  if (digits.length === 2) {
    return parseInt(digits.charAt(0), 10);
  }
  return null;
}
