import { describe, expect, it } from "vitest";
import { isTooFast, parseApplicationInput } from "@/lib/validation/application";
import { TERMS_VERSION } from "@/lib/constants";

function validPayload() {
  return {
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah@gmail.com",
    confirmEmail: "sarah@gmail.com",
    phone: "555-0199",
    timezone: "America/New_York",
    legalEntityType: "llc" as const,
    companyName: "Cyberdyne Traffic LLC",
    websiteUrl: "https://cyberdynetraffic.com",
    addressLine1: "100 Tech Way",
    addressLine2: "Suite 400",
    country: "United States" as const,
    city: "Stuart",
    postalCode: "34994",
    messagingService: "telegram" as const,
    messengerUsername: "@sarahconnor",
    bestTimeToContact: "Morning EST",
    topVerticals: "Medicare and Final Expense pay-per-call traffic",
    campaigns: ["medicare", "final-expense"],
    trafficSourceDetails: "Google Ads search intent and native editorial advertorials",
    monthlyRevenueRange: "10k_25k" as const,
    monthlyRevenueNotes: "Consistent past 12 months",
    referenceOneName: "John Smith",
    referenceOneContact: "john@networkone.com",
    referenceTwoName: "Alice Walker",
    referenceTwoContact: "alice@networktwo.com",
    primaryChannelDetails: "Inbound search campaigns with verified caller intent",
    secondaryChannelDetails: "Warm transfer publisher partnerships",
    howEnteredAffiliate: "Started running digital campaigns in 2018 focusing on lead gen",
    industryExperience: "3_to_5_years" as const,
    referralSource: "Industry peer recommendation",
    previousRelationship: "Previously worked with LeadPoint and DMS on performance campaigns; no direct affiliation",
    internalReferral: "NA",
    termsAccepted: true,
    termsVersion: TERMS_VERSION,
    formStartedAt: Date.now() - 10000,
    websiteFax: "",
  };
}

describe("Application Validation Schema", () => {
  it("accepts a fully compliant application payload", () => {
    const payload = validPayload();
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(true);
  });

  it("fails when email and confirmEmail do not match", () => {
    const payload = { ...validPayload(), confirmEmail: "mismatch@gmail.com" };
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.confirmEmail).toBeDefined();
    }
  });

  it("matches emails case-insensitively", () => {
    const payload = {
      ...validPayload(),
      email: "Sarah@Gmail.Com",
      confirmEmail: "sarah@gmail.com",
    };
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(true);
  });

  it("enforces Gmail-only restriction when configured", () => {
    const payload = {
      ...validPayload(),
      email: "sarah@customdomain.com",
      confirmEmail: "sarah@customdomain.com",
    };
    const restricted = parseApplicationInput(payload, { gmailOnly: true });
    expect(restricted.success).toBe(false);
    if (!restricted.success) {
      expect(restricted.error.flatten().fieldErrors.email).toBeDefined();
    }

    const open = parseApplicationInput(payload, { gmailOnly: false });
    expect(open.success).toBe(true);
  });

  it("fails when honeypot websiteFax field is populated", () => {
    const payload = { ...validPayload(), websiteFax: "spammer-bot-content" };
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.websiteFax).toBeDefined();
    }
  });

  it("fails when no campaigns are selected", () => {
    const payload = { ...validPayload(), campaigns: [] as unknown as ["medicare"] };
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.campaigns).toBeDefined();
    }
  });

  it("fails when terms are not accepted", () => {
    const payload = { ...validPayload(), termsAccepted: false as unknown as true };
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.termsAccepted).toBeDefined();
    }
  });

  it("fails on invalid website URL", () => {
    const payload = { ...validPayload(), websiteUrl: "not-a-valid-url" };
    const result = parseApplicationInput(payload, { gmailOnly: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.websiteUrl).toBeDefined();
    }
  });

  it("correctly identifies submissions that are submitted too quickly", () => {
    const now = 100000;
    expect(isTooFast(now - 1500, now, 3000)).toBe(true);
    expect(isTooFast(now - 4000, now, 3000)).toBe(false);
  });
});
