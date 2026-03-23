export type RecordStatus = 'wanted' | 'arrested' | 'unidentified'

export interface CriminalRecord {
  id: string
  badgeLabel: string
  status: RecordStatus
  name: string
  alias: string
  crime: string
  summary: string
  lastKnownLocation: string
  lastSeenOn: string
  stats: {
    age: number
    height: string
    weight: string
  }
  physicalDescription: string
  additionalNotes: string
  photoUrl: string
}

export const criminalRecords: CriminalRecord[] = [
  {
    id: 'samayan',
    badgeLabel: 'WANTED',
    status: 'wanted',
    name: 'Samayan',
    alias: 'AHMED ROSKEY',
    crime: 'Armed Robbery',
    summary: 'Last seen in Kandy bus stand',
    lastKnownLocation: 'Kandy - Central Bus Stand',
    lastSeenOn: '2025-10-15',
    stats: { age: 34, height: `5'8"`, weight: '70kg' },
    physicalDescription: 'Tattoo on right forearm (tiger). Often wears baseball caps and navy jackets. Known to frequent vehicle repair shops.',
    additionalNotes: 'Travels with two associates in a blue hybrid sedan. Considered armed and dangerous.',
    photoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=640&h=640&q=80',
  },
  {
    id: 'fernando',
    badgeLabel: 'ARRESTED',
    status: 'arrested',
    name: 'Dilshan Fernando',
    alias: 'D. FERNANDO',
    crime: 'Counterfeit Currency',
    summary: 'Captured in Galle during routine checkpoint',
    lastKnownLocation: 'Galle Fort checkpoint',
    lastSeenOn: '2026-01-05',
    stats: { age: 41, height: `5'10"`, weight: '82kg' },
    physicalDescription: 'Salt-and-pepper hair, trimmed beard, scar under left eye.',
    additionalNotes: 'Currently under remand; further accomplices suspected in Matara district.',
    photoUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=640&h=640&q=80',
  },
  {
    id: 'perera',
    badgeLabel: 'WANTED',
    status: 'wanted',
    name: 'Nuwan Perera',
    alias: 'N. PERERA',
    crime: 'Cyber Fraud',
    summary: 'Suspected to be in Colombo financial district',
    lastKnownLocation: 'Colombo Fort, Lotus Road',
    lastSeenOn: '2026-02-11',
    stats: { age: 29, height: `5'9"`, weight: '68kg' },
    physicalDescription: 'Clean shave, usually seen with a messenger bag and wireless earbuds.',
    additionalNotes: 'Uses multiple forged IDs; may attempt to flee overseas using fake passports.',
    photoUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=facearea&w=640&h=640&q=80',
  },
  {
    id: 'devi',
    badgeLabel: 'UNIDENTIFIED',
    status: 'unidentified',
    name: 'Unknown Female',
    alias: 'UNIDENTIFIED',
    crime: 'Accessory to Robbery',
    summary: 'Seen leaving scene via CCTV footage',
    lastKnownLocation: 'Negombo Beach Road',
    lastSeenOn: '2025-12-28',
    stats: { age: 30, height: `5'6"`, weight: '60kg' },
    physicalDescription: 'Long black hair, lotus tattoo behind left ear, carried red backpack.',
    additionalNotes: 'Often uses tuk-tuk transport; public assistance required to confirm identity.',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=640&h=640&q=80',
  },
  {
    id: 'wijesinghe',
    badgeLabel: 'WANTED',
    status: 'wanted',
    name: 'Kasun Wijesinghe',
    alias: 'K. WIJESINGHE',
    crime: 'Vehicle Theft',
    summary: 'Linked to a series of van thefts in Kurunegala',
    lastKnownLocation: 'Kurunegala North checkpoint',
    lastSeenOn: '2026-03-01',
    stats: { age: 37, height: `6'1"`, weight: '88kg' },
    physicalDescription: 'Tall build, short buzz cut, burns mark on left wrist.',
    additionalNotes: 'Drives stolen vehicles north; may attempt to cross provincial borders at night.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=640&h=640&q=80',
  },
  {
    id: 'manoj',
    badgeLabel: 'WANTED',
    status: 'wanted',
    name: 'Manoj Jayawardena',
    alias: 'M. JAY',
    crime: 'Kidnapping',
    summary: 'Believed to be hiding near Badulla railway quarters',
    lastKnownLocation: 'Badulla railway quarters',
    lastSeenOn: '2026-02-20',
    stats: { age: 32, height: `5'7"`, weight: '74kg' },
    physicalDescription: 'Often wears sunglasses at night, has noticeable limp on right leg.',
    additionalNotes: 'Travels with juvenile accomplice; high priority person of interest.',
    photoUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=facearea&w=640&h=640&q=80',
  },
]

export const findCriminalRecord = (recordId: string): CriminalRecord | undefined =>
  criminalRecords.find(record => record.id === recordId)
