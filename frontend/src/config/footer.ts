export interface FooterLink {
  label: string
  href: string
}

export interface FooterContactItem {
  label: string
  value: string
}

export interface FooterConfig {
  organizationName: string
  organizationTag: string
  description: string
  quickLinks: FooterLink[]
  relatedLinks: FooterLink[]
  addressLines: string[]
  emergencyNumbers: FooterContactItem[]
  socialLinks: FooterLink[]
  legalLinks: FooterLink[]
  copyrightText: string
}

export const footerConfig: FooterConfig = {
  organizationName: 'Sri Lanka Police',
  organizationTag: 'Protecting Life and Property',
  description: 'Trusted service for safety, law enforcement, and national traffic management.',
  quickLinks: [
    { label: 'E-Services', href: '#' },
    { label: 'Media Center', href: '#' },
    { label: 'Image Gallery', href: '#' },
    { label: 'Police Stations', href: '#' },
    { label: 'Join the Service', href: '#' },
  ],
  relatedLinks: [
    {
      label: 'Ministry of Public Security',
      href: 'https://www.pubsec.gov.lk/',
    },
    {
      label: 'Department of Immigration & Emigration',
      href: 'https://www.immigration.gov.lk/',
    },
    {
      label: 'Department of Registration of Persons',
      href: 'https://drp.gov.lk/',
    },
    {
      label: 'National Dangerous Drugs Control Board',
      href: 'https://www.nddcb.gov.lk/',
    },
    {
      label: 'National Police Academy',
      href: 'https://npa.gov.lk/',
    },
  ],
  addressLines: ['Police Headquarters,', 'Colombo 02, Sri Lanka'],
  emergencyNumbers: [
    { label: 'Police Emergency', value: '119' },
    { label: 'Traffic Emergency', value: '1919' },
    { label: 'Headquarters', value: '+94 11 2421111' },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://www.facebook.com/people/Sri-Lanka-Police/100064256130301/' },
    { label: 'YouTube', href: 'https://www.youtube.com/@Sri_Lanka_police' },
    { label: 'Instagram', href: 'https://www.instagram.com/sri_lanka_police/' },
    { label: 'X', href: 'https://x.com/SL_PoliceMedia' },
  ],
  legalLinks: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
  copyrightText: 'Copyright 2026 Sri Lanka Police. All Rights Reserved.',
}
