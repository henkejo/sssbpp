const numberFormatter = new Intl.NumberFormat('sv-SE');

export function formatCloseCount(count: number): string {
  return `${numberFormatter.format(count)} close${count === 1 ? '' : 's'}`;
}

export function formatClosesInMonths(
  closeCount: number,
  monthCount: number,
): string {
  return `${formatCloseCount(closeCount)} in ${numberFormatter.format(monthCount)} month${monthCount === 1 ? '' : 's'}`;
}
