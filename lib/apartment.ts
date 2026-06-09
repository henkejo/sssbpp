const rentAmountFormatter = new Intl.NumberFormat('en-IE', {
  maximumFractionDigits: 0,
});

export function formatRent(rent: number): string | null {
  if (rent <= 0) {
    return null;
  }
  return `€ ${rentAmountFormatter.format(rent / 10)}`;
}

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
