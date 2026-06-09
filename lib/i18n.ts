const messages: Record<string, string> = {
  All: 'All',
  '1 rum & kök': '1 room and kitchen',
  '1 rum & pentry': '1 room with kitchenette',
  '2 rum & kök': '2 rooms and kitchen',
  '2 rum & pentry': '2 rooms with kitchenette',
  '3 rum & kök': '3 rooms and kitchen',
  '3 rum & pentry': '3 rooms with kitchenette',
  '4 rum & kök': '4 rooms and kitchen',
  'Rum i korridor': 'Corridor room',
  'Rum i kollektiv': 'Room in collective',
};

function normalizeKey(key: string): string {
  return key.replace(/\s+och\s+/gi, ' & ');
}

export function t(
  strings: TemplateStringsArray,
  ...values: readonly (string | number)[]
): string {
  const key = normalizeKey(
    strings.reduce(
      (acc, str, i) => acc + str + String(values[i] ?? ''),
      '',
    ),
  );
  return messages[key] ?? key;
}
