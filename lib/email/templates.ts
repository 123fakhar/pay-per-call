import { COMPANY, REVENUE_RANGE_LABELS } from "@/lib/constants";
import type { ApplicationRow } from "@/lib/db/schema";

function fullName(application: ApplicationRow) {
  return `${application.firstName} ${application.lastName}`;
}

export function adminNotificationContent(application: ApplicationRow) {
  const subject = `New Affiliate Signup — ${fullName(application)}`;
  const campaigns = Array.isArray(application.campaigns)
    ? application.campaigns.join(", ")
    : "";
  const revenue =
    REVENUE_RANGE_LABELS[
      application.monthlyRevenueRange as keyof typeof REVENUE_RANGE_LABELS
    ] ?? application.monthlyRevenueRange;

  const body = [
    `A new affiliate application was received.`,
    ``,
    `Application ID: ${application.id}`,
    `Submitted: ${application.createdAt.toISOString()}`,
    `Status: ${application.status}`,
    ``,
    `Contact`,
    `Name: ${fullName(application)}`,
    `Email: ${application.email}`,
    `Phone: ${application.phone || "Not provided"}`,
    `Timezone: ${application.timezone}`,
    ``,
    `Company`,
    `Entity type: ${application.legalEntityType}`,
    `Name: ${application.companyName}`,
    `Website: ${application.websiteUrl}`,
    ``,
    `Campaigns: ${campaigns}`,
    `Top verticals: ${application.topVerticals}`,
    `Primary channel: ${application.primaryChannelDetails}`,
    `Secondary channel: ${application.secondaryChannelDetails}`,
    `Monthly earnings range: ${revenue}`,
    ``,
    `Reference 1: ${application.referenceOneName} (${application.referenceOneContact})`,
    `Reference 2: ${application.referenceTwoName} (${application.referenceTwoContact})`,
    ``,
    `Review this application in the administrator dashboard.`,
  ].join("\n");

  return { subject, body };
}

export function applicantConfirmationContent(application: ApplicationRow) {
  const subject = "We Received Your Affiliate Application — Assured Insurance Services";
  const body = [
    `Hello ${application.firstName},`,
    ``,
    `We received your affiliate application for ${COMPANY.name}.`,
    `This message confirms receipt only. It is not an approval, offer, or guarantee of campaigns, call volume, or payment.`,
    ``,
    `Application reference: ${application.id}`,
    ``,
    `Our review team will contact you if more information is needed.`,
    ``,
    COMPANY.name,
    ...COMPANY.addressLines,
    ``,
    `If you did not submit this application, ignore this message.`,
  ].join("\n");

  return { subject, body };
}
