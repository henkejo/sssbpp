export type CampusId = 'kth' | 'ki' | 'su';

export type Campus = {
  id: CampusId;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  color: string;
};

/** Main campus locations from sssb.se/vara-bostader/ university markers. */
export const CAMPUSES: Campus[] = [
  {
    id: 'kth',
    name: 'Kungliga tekniska högskolan',
    shortName: 'KTH',
    lat: 59.3482,
    lng: 18.0705,
    color: '#004791',
  },
  {
    id: 'ki',
    name: 'Karolinska institutet',
    shortName: 'KI',
    lat: 59.3485031,
    lng: 18.031,
    color: '#8a1f40',
  },
  {
    id: 'su',
    name: 'Stockholms universitet',
    shortName: 'SU',
    lat: 59.3637,
    lng: 18.0550487,
    color: '#a90061',
  },
];
