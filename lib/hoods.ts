export type Hood = {
  name: string;
  lat: number;
  lng: number;
  imageUrl: string;
  /** Alternate names that may appear in scraped apartment data */
  aliases?: string[];
};

/** SSSB housing areas with coordinates from sssb.se/vara-bostader/ and hero images from each area page. */
export const HOODS: Hood[] = [
  {
    name: 'Forum',
    lat: 59.3480026,
    lng: 18.0651971,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Forum-webb-scaled.jpg',
  },
  {
    name: 'Lappkärrsberget',
    lat: 59.3697209,
    lng: 18.0627876,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/20220613_7327_webb.jpg',
    aliases: ['Campus Lappis', 'Lappis'],
  },
  {
    name: 'Domus',
    lat: 59.3486292,
    lng: 18.0639127,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Domus-webb-scaled.jpg',
  },
  {
    name: 'Nyponet',
    lat: 59.3493399,
    lng: 18.062596,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/11/Nyponet2-webb.jpg',
  },
  {
    name: 'Roslagstull',
    lat: 59.3514367,
    lng: 18.0583054,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Roslagstull-webb-scaled.jpg',
  },
  {
    name: 'Freja',
    lat: 59.4315254,
    lng: 18.0550347,
    imageUrl: 'https://www.sssb.se/wp-content/uploads/2023/01/freja-webb3.jpg',
  },
  {
    name: 'Frösunda',
    lat: 59.3675798,
    lng: 18.0140253,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2023/01/frosunda-webb2.jpg',
  },
  {
    name: 'Kungshamra',
    lat: 59.3821542,
    lng: 18.0267935,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Kungshamra-webb-scaled.jpg',
  },
  {
    name: 'Pax',
    lat: 59.3477573,
    lng: 18.0008697,
    imageUrl: 'https://www.sssb.se/wp-content/uploads/2023/01/pax-webb.jpg',
  },
  {
    name: 'Strix',
    lat: 59.3501456,
    lng: 18.0043484,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Strix2-webb-scaled.jpg',
  },
  {
    name: 'Apeln',
    lat: 59.3352529,
    lng: 18.0597604,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Apeln-webb-scaled.jpg',
  },
  {
    name: 'Fyrtalet',
    lat: 59.3473942,
    lng: 18.1029431,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Fyrtalet-webb-scaled.jpg',
  },
  {
    name: 'Hugin & Munin',
    lat: 59.3459993,
    lng: 18.1112098,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Hugin-Munin-webb-scaled.jpg',
    aliases: ['Hugin', 'Munin'],
  },
  {
    name: 'Idun',
    lat: 59.344469,
    lng: 18.0298952,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Idun-webb-scaled.jpg',
  },
  {
    name: 'Jerum',
    lat: 59.3490888,
    lng: 18.0964361,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Jerum-webb-scaled.jpg',
  },
  {
    name: 'Kurland',
    lat: 59.3383757,
    lng: 18.0580359,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Kurland-webb-scaled.jpg',
  },
  {
    name: 'Lucidor',
    lat: 59.3247763,
    lng: 18.070411,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Lucidor-webb-scaled.jpg',
  },
  {
    name: 'Mjölner',
    lat: 59.3450587,
    lng: 18.0834699,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Mjolner2-webb-scaled.jpg',
  },
  {
    name: 'Vätan',
    lat: 59.3373733,
    lng: 18.0687536,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Vatan-webb-scaled.jpg',
  },
  {
    name: 'Marieberg',
    lat: 59.326447,
    lng: 18.0211691,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Marieberg-webb-scaled.jpg',
  },
  {
    name: 'Tanto',
    lat: 59.3101888,
    lng: 18.0452516,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Tanto-webb-scaled.jpg',
  },
  {
    name: 'Balder',
    lat: 59.3135072,
    lng: 18.1993729,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/11/Balder-webb.jpg',
  },
  {
    name: 'Birka',
    lat: 59.288995,
    lng: 18.118767,
    imageUrl: 'https://www.sssb.se/wp-content/uploads/2022/11/birka2-webb.jpg',
  },
  {
    name: 'Embla',
    lat: 59.3033048,
    lng: 18.0981744,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Embla-webb-scaled.jpg',
  },
  {
    name: 'Flemingsberg',
    lat: 59.2243048,
    lng: 17.9364253,
    imageUrl: 'https://www.sssb.se/wp-content/uploads/2023/10/med_webb.jpg',
    aliases: ['Medicinaren'],
  },
  {
    name: 'Skärmarbrink',
    lat: 59.295003,
    lng: 18.09403,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Hammarbyhemmet-webb-scaled.jpg',
  },
  {
    name: 'Hammarbyhemmet',
    lat: 59.300873,
    lng: 18.0928611,
    imageUrl:
      'https://www.sssb.se/wp-content/uploads/2022/10/Hammarbyhemmet-webb-scaled.jpg',
  },
];

export function findHood(name: string): Hood | undefined {
  const normalized = name.trim().toLowerCase();
  return HOODS.find(
    (hood) =>
      hood.name.toLowerCase() === normalized ||
      hood.aliases?.some((alias) => alias.toLowerCase() === normalized),
  );
}
