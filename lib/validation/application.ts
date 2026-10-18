import { z } from "zod";
import {
  CAMPAIGNS,
  COUNTRIES,
  EXPERIENCE_LENGTHS,
  LEGAL_ENTITY_TYPES,
  MESSAGING_SERVICES,
  REVENUE_RANGES,
  TIMEZONES,
} from "@/lib/constants";

const campaignIds = CAMPAIGNS.map((campaign) => campaign.id) as [
  (typeof CAMPAIGNS)[number]["id"],
  ...(typeof CAMPAIGNS)[number]["id"][],
];

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export function createApplicationSchema(options: { gmailOnly: boolean }) {
  return z
    .object({
      firstName: z.string().trim().min(1, "First name is required").max(80),
      lastName: z.string().trim().min(1, "Last name is required").max(80),
      email: z.email("Enter a valid email address"),
      confirmEmail: z.email("Confirm email must be valid"),
      phone: optionalText,
      timezone: z.enum(TIMEZONES).or(z.string().trim().min(1).max(80)),
      legalEntityType: z.enum(LEGAL_ENTITY_TYPES),
      companyName: z.string().trim().min(1, "Company or individual name is required").max(160),
      websiteUrl: z.url("Enter a valid website or social URL"),
      addressLine1: z.string().trim().min(1, "Address is required").max(200),
      addressLine2: optionalText,
      country: z.enum(COUNTRIES).or(z.string().trim().min(1).max(80)),
      city: z.string().trim().min(1, "City is required").max(80),
      postalCode: z.string().trim().min(1, "ZIP / postal code is required").max(20),
      messagingService: z.enum(MESSAGING_SERVICES),
      messengerUsername: z.string().trim().min(1, "Messenger username is required").max(120),
      bestTimeToContact: optionalText,
      topVerticals: z.string().trim().min(1, "Describe your top verticals and campaigns").max(2000),
      campaigns: z.array(z.enum(campaignIds)).min(1, "Select at least one campaign"),
      trafficSourceDetails: z
        .string()
        .trim()
        .min(1, "Name the networks and advertisers you work with")
        .max(4000),
      monthlyRevenueRange: z.enum(REVENUE_RANGES),
      monthlyRevenueNotes: optionalText,
      referenceOneName: z.string().trim().min(1, "First reference name is required").max(120),
      referenceOneContact: z.string().trim().min(1, "First reference contact is required").max(200),
      referenceTwoName: z.string().trim().min(1, "Second reference name is required").max(120),
      referenceTwoContact: z.string().trim().min(1, "Second reference contact is required").max(200),
      primaryChannelDetails: z.string().trim().min(1, "Primary channel details are required").max(2000),
      secondaryChannelDetails: z
        .string()
        .trim()
        .min(1, "Secondary channel details are required, or enter NA")
        .max(2000),
      howEnteredAffiliate: z
        .string()
        .trim()
        .min(1, "Tell us how you entered affiliate marketing")
        .max(2000),
      industryExperience: z.enum(EXPERIENCE_LENGTHS),
      referralSource: z.string().trim().min(1, "Referral source is required").max(500),
      previousRelationship: z.string().trim().min(1, "This question is required").max(2000),
      internalReferral: optionalText,
      termsAccepted: z.literal(true, { error: "You must accept the terms to continue" }),
      termsVersion: z.string().min(1),
      formStartedAt: z.number().int().positive(),
      websiteFax: z.string().max(0, "Submission rejected"),
    })
    .superRefine((value, ctx) => {
      if (value.email.toLowerCase() !== value.confirmEmail.toLowerCase()) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmEmail"],
          message: "Email addresses must match",
        });
      }
      if (options.gmailOnly && !value.email.toLowerCase().endsWith("@gmail.com")) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Registration is currently limited to Gmail addresses",
        });
      }
    });
}

export type ApplicationInput = z.infer<ReturnType<typeof createApplicationSchema>>;

export function parseApplicationInput(data: unknown, options: { gmailOnly: boolean }) {
  return createApplicationSchema(options).safeParse(data);
}

export function isTooFast(formStartedAt: number, now = Date.now(), minimumMs = 3000) {
  return now - formStartedAt < minimumMs;
}
