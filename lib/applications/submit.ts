import { eq } from "drizzle-orm";
import { COMPANY, TERMS_VERSION } from "@/lib/constants";
import { openDatabase } from "@/lib/db";
import { applicantConfirmationContent, adminNotificationContent } from "@/lib/email/templates";
import type { ApplicationInput } from "@/lib/validation/application";

export async function persistApplication(input: ApplicationInput, submitterKeyHash: string) {
  const { db, applications, emailOutbox } = await openDatabase();
  const termsAcceptedAt = new Date();
  const id = crypto.randomUUID();

  return db.transaction(async (tx) => {
    await tx.insert(applications).values({
        id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        phone: emptyToNull(input.phone),
        timezone: input.timezone,
        legalEntityType: input.legalEntityType,
        companyName: input.companyName,
        websiteUrl: input.websiteUrl,
        addressLine1: input.addressLine1,
        addressLine2: emptyToNull(input.addressLine2),
        country: input.country,
        city: input.city,
        postalCode: input.postalCode,
        messagingService: input.messagingService,
        messengerUsername: input.messengerUsername,
        bestTimeToContact: emptyToNull(input.bestTimeToContact),
        topVerticals: input.topVerticals,
        campaigns: input.campaigns,
        trafficSourceDetails: input.trafficSourceDetails,
        monthlyRevenueRange: input.monthlyRevenueRange,
        monthlyRevenueNotes: emptyToNull(input.monthlyRevenueNotes),
        referenceOneName: input.referenceOneName,
        referenceOneContact: input.referenceOneContact,
        referenceTwoName: input.referenceTwoName,
        referenceTwoContact: input.referenceTwoContact,
        primaryChannelDetails: input.primaryChannelDetails,
        secondaryChannelDetails: input.secondaryChannelDetails,
        howEnteredAffiliate: input.howEnteredAffiliate,
        industryExperience: input.industryExperience,
        referralSource: input.referralSource,
        previousRelationship: input.previousRelationship,
        internalReferral: emptyToNull(input.internalReferral),
        termsAccepted: 1,
        termsVersion: input.termsVersion || TERMS_VERSION,
        termsAcceptedAt,
        submitterKeyHash,
      });

    const [application] = await tx.select().from(applications).where(eq(applications.id, id)).limit(1);

    if (!application) {
      throw new Error("Failed to store application");
    }

    const admin = adminNotificationContent(application);
    const applicant = applicantConfirmationContent(application);

    await tx.insert(emailOutbox).values([
      {
        applicationId: application.id,
        kind: "admin_notification",
        toAddress: COMPANY.adminNotificationEmail,
        subject: admin.subject,
        bodyText: admin.body,
      },
      {
        applicationId: application.id,
        kind: "applicant_confirmation",
        toAddress: application.email,
        subject: applicant.subject,
        bodyText: applicant.body,
      },
    ]);

    return application;
  });
}

function emptyToNull(value?: string | null) {
  if (!value || value.trim() === "") return null;
  return value.trim();
}
