export const COMPANY = {
  name: "Assured Insurance Services",
  shortName: "Assured",
  addressLines: ["2440 SE FEDERAL HWY", "SUITE 111", "STUART, FL 34994"],
  cityStateZip: "Stuart, FL 34994",
  adminNotificationEmail: "justin.bennett@assuredinsuranceservices.com",
} as const;

export const TERMS_VERSION = "1.0.0-draft";

export const CAMPAIGNS = [
  {
    id: "medicare",
    name: "Medicare",
    summary:
      "Pay-per-call campaigns related to Medicare-interested consumers. Assured is not a government agency and is not endorsed by the U.S. government or Medicare.",
  },
  {
    id: "final-expense",
    name: "Final Expense",
    summary:
      "Campaigns focused on final-expense insurance conversations. Volume and approval are never guaranteed.",
  },
  {
    id: "auto-insurance",
    name: "Auto Insurance",
    summary:
      "Auto insurance call campaigns. Program terms, geographies, and payouts are confirmed only after review.",
  },
  {
    id: "home-services",
    name: "Home Services",
    summary:
      "Home services call campaigns. Availability depends on buyer demand and quality standards.",
  },
  {
    id: "legal",
    name: "Legal",
    summary:
      "Legal-vertical campaigns. This is not legal advice and does not create an attorney-client relationship.",
  },
] as const;

export type CampaignId = (typeof CAMPAIGNS)[number]["id"];

export const LEGAL_ENTITY_TYPES = [
  "individual_sole_proprietor",
  "llc",
  "corporation",
  "partnership",
  "other",
] as const;

export const LEGAL_ENTITY_LABELS: Record<(typeof LEGAL_ENTITY_TYPES)[number], string> = {
  individual_sole_proprietor: "Individual / Sole Proprietor",
  llc: "Limited Liability Company (LLC)",
  corporation: "Corporation",
  partnership: "Partnership",
  other: "Other",
};

export const MESSAGING_SERVICES = [
  "skype",
  "telegram",
  "whatsapp",
  "slack",
  "signal",
  "other",
] as const;

export const MESSAGING_LABELS: Record<(typeof MESSAGING_SERVICES)[number], string> = {
  skype: "Skype",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  slack: "Slack",
  signal: "Signal",
  other: "Other",
};

export const REVENUE_RANGES = [
  "none_yet",
  "under_1k",
  "1k_5k",
  "5k_10k",
  "10k_25k",
  "25k_50k",
  "50k_plus",
] as const;

export const REVENUE_RANGE_LABELS: Record<(typeof REVENUE_RANGES)[number], string> = {
  none_yet: "Not yet generating affiliate revenue",
  under_1k: "Under $1,000",
  "1k_5k": "$1,000 – $5,000",
  "5k_10k": "$5,000 – $10,000",
  "10k_25k": "$10,000 – $25,000",
  "25k_50k": "$25,000 – $50,000",
  "50k_plus": "$50,000+",
};

export const EXPERIENCE_LENGTHS = [
  "less_than_6_months",
  "6_to_12_months",
  "1_to_3_years",
  "3_to_5_years",
  "5_plus_years",
] as const;

export const EXPERIENCE_LENGTH_LABELS: Record<(typeof EXPERIENCE_LENGTHS)[number], string> = {
  less_than_6_months: "Less than 6 months",
  "6_to_12_months": "6–12 months",
  "1_to_3_years": "1–3 years",
  "3_to_5_years": "3–5 years",
  "5_plus_years": "5+ years",
};

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Puerto_Rico",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Philippines",
  "Mexico",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Ireland",
  "New Zealand",
  "South Africa",
  "Brazil",
  "Other",
] as const;

export const APPLICATION_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "declined",
  "withdrawn",
] as const;

export const PREVIOUS_RELATIONSHIP_QUESTION =
  "Have you previously worked with another performance-marketing or pay-per-call network? If you have history with a specific network, name it. This question is for traffic-history context only and does not imply any affiliation between that network and Assured Insurance Services.";
