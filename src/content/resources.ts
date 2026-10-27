// Adult-run help services. We link out; we never copy their programs.
// Each entry was checked against the provider's own site on 2026-10-25.

export interface Resource {
  name: string;
  what: string;
  action: string;
  href: string;
  urgent?: boolean;
}

export const CRISIS_RESOURCES: Resource[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    what: "Free, confidential, 24/7. Call or text.",
    action: "Call or text 988",
    href: "tel:988",
    urgent: true,
  },
  {
    name: "Crisis Text Line",
    what: "Text with a trained volunteer crisis counselor.",
    action: "Text HOME to 741741",
    href: "sms:741741?&body=HOME",
    urgent: true,
  },
];

export const QUIT_RESOURCES: Resource[] = [
  {
    name: "Kick It California",
    what: "Free program that helps Californians quit tobacco and nicotine, including vaping.",
    action: "Call 800-300-8086",
    href: "https://kickitca.org/",
  },
  {
    name: "This is Quitting (Truth Initiative)",
    what: "Free text-message quit program for young people who vape.",
    action: "Visit truthinitiative.org",
    href: "https://truthinitiative.org/thisisquitting",
  },
];

// For the adults around a student. Linked, never copied (these curricula are copyrighted).
export const SCHOOL_RESOURCES: Resource[] = [
  {
    name: "Healthy Futures (Stanford REACH Lab)",
    what: "An alternative-to-suspension program for students caught vaping or who want to quit. Self-paced plus counselor-led sessions.",
    action: "Share with your school",
    href: "https://med.stanford.edu/tobaccopreventiontoolkit/healthy-futures-nicotine.html",
  },
  {
    name: "Tobacco Prevention Toolkit (Stanford REACH Lab)",
    what: "Curricula and crash courses on vaping, nicotine addiction, and refusal skills for teachers and parents.",
    action: "Open the toolkit",
    href: "https://med.stanford.edu/tobaccopreventiontoolkit.html",
  },
];

export const AB2711 = {
  citation: "California Education Code §48900(h)(2)",
  bill: "AB 2711 (Stats. 2024, Ch. 840), effective January 1, 2025",
  quote:
    "Pupils who voluntarily disclose their use of a tobacco product in order to seek help through services or supports shall not be suspended solely for that disclosure.",
  href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=EDC&sectionNum=48900",
};
