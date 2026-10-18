import { describe, expect, it } from "vitest";
import { COMPANY } from "@/lib/constants";
import { adminNotificationContent, applicantConfirmationContent } from "@/lib/email/templates";
import type { ApplicationRow } from "@/lib/db/schema";

function mockApplication(overrides?: Partial<ApplicationRow>): ApplicationRow {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    firstName: "Marcus",
    lastName: "Vance",
    email: "marcus.vance@gmail.com",
    phone: "772-555-0144",
    timezone: "America/New_York",
    legalEntityType: "llc",
    companyName: "Vance Media Group",
    websiteUrl: "https://vancemedia.com",
    addressLine1: "2440 SE Federal Hwy",
    addressLine2: "Suite 111",
    country: "United States",
    city: "Stuart",
    postalCode: "34994",
    messagingService: "telegram",
    messengerUsername: "@marcusvance",
    bestTimeToContact: "2 PM - 5 PM EST",
    topVerticals: "Medicare and Final Expense pay-per-call",
    campaigns: ["medicare", "final-expense"],
    trafficSourceDetails: "Search ads and click-to-call banners",
    monthlyRevenueRange: "25k_50k",
    monthlyRevenueNotes: "Averaging 35k monthly across verticals",
    referenceOneName: "David Miller",
    referenceOneContact: "david@premierleads.com",
    referenceTwoName: "Elena Rostova",
    referenceTwoContact: "elena@apexmedia.net",
    primaryChannelDetails: "Google Ads high-intent search",
    secondaryChannelDetails: "Bing search traffic",
    howEnteredAffiliate: "Started performance media buying in 2017",
    industryExperience: "5_plus_years",
    referralSource: "Colleague referral",
    previousRelationship: "Prior experience with performance marketing networks",
    internalReferral: "NA",
    termsAccepted: 1,
    termsVersion: "1.0.0-draft",
    termsAcceptedAt: new Date("2026-10-16T12:00:00Z"),
    status: "pending",
    adminReviewedAt: null,
    adminNotes: null,
    submitterKeyHash: "mock-hash",
    createdAt: new Date("2026-10-16T12:00:00Z"),
    updatedAt: new Date("2026-10-16T12:00:00Z"),
    ...overrides,
  };
}

describe("Email Templates", () => {
  describe("Administrator Notification", () => {
    it("targets the designated administrator recipient", () => {
      expect(COMPANY.adminNotificationEmail).toBe("justin.bennett@assuredinsuranceservices.com");
    });

    it("formats the subject line with applicant full name", () => {
      const app = mockApplication();
      const { subject } = adminNotificationContent(app);
      expect(subject).toBe("New Affiliate Signup — Marcus Vance");
    });

    it("includes application ID, contact details, company, campaigns, traffic channels, earnings range, and references in the body", () => {
      const app = mockApplication();
      const { body } = adminNotificationContent(app);

      expect(body).toContain(app.id);
      expect(body).toContain("Marcus Vance");
      expect(body).toContain(app.email);
      expect(body).toContain(app.phone!);
      expect(body).toContain(app.companyName);
      expect(body).toContain(app.websiteUrl);
      expect(body).toContain("medicare, final-expense");
      expect(body).toContain("Google Ads high-intent search");
      expect(body).toContain("$25,000 – $50,000");
      expect(body).toContain("David Miller (david@premierleads.com)");
      expect(body).toContain("Elena Rostova (elena@apexmedia.net)");
    });
  });

  describe("Applicant Confirmation", () => {
    it("formats the subject line confirming application receipt", () => {
      const app = mockApplication();
      const { subject } = applicantConfirmationContent(app);
      expect(subject).toBe("We Received Your Affiliate Application — Assured Insurance Services");
    });

    it("confirms receipt without implying acceptance, approval, or call volume", () => {
      const app = mockApplication();
      const { body } = applicantConfirmationContent(app);

      expect(body).toContain("Marcus");
      expect(body).toContain(app.id);
      expect(body).toContain("This message confirms receipt only");
      expect(body).toContain("It is not an approval, offer, or guarantee of campaigns, call volume, or payment");
    });

    it("includes the company physical address", () => {
      const app = mockApplication();
      const { body } = applicantConfirmationContent(app);

      expect(body).toContain("2440 SE FEDERAL HWY");
      expect(body).toContain("SUITE 111");
      expect(body).toContain("STUART, FL 34994");
    });
  });
});
