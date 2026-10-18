"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CAMPAIGNS,
  COUNTRIES,
  EXPERIENCE_LENGTHS,
  EXPERIENCE_LENGTH_LABELS,
  LEGAL_ENTITY_LABELS,
  LEGAL_ENTITY_TYPES,
  MESSAGING_LABELS,
  MESSAGING_SERVICES,
  PREVIOUS_RELATIONSHIP_QUESTION,
  REVENUE_RANGE_LABELS,
  REVENUE_RANGES,
  TERMS_VERSION,
  TIMEZONES,
} from "@/lib/constants";
import { createApplicationSchema, type ApplicationInput } from "@/lib/validation/application";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type FormValues = ApplicationInput;

export function AffiliateForm({ gmailOnly }: { gmailOnly: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const schema = useMemo(() => createApplicationSchema({ gmailOnly }), [gmailOnly]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      phone: "",
      timezone: "America/New_York",
      legalEntityType: "individual_sole_proprietor",
      companyName: "",
      websiteUrl: "",
      addressLine1: "",
      addressLine2: "",
      country: "United States",
      city: "",
      postalCode: "",
      messagingService: "telegram",
      messengerUsername: "",
      bestTimeToContact: "",
      topVerticals: "",
      campaigns: [],
      trafficSourceDetails: "",
      monthlyRevenueRange: "none_yet",
      monthlyRevenueNotes: "",
      referenceOneName: "",
      referenceOneContact: "",
      referenceTwoName: "",
      referenceTwoContact: "",
      primaryChannelDetails: "",
      secondaryChannelDetails: "NA",
      howEnteredAffiliate: "",
      industryExperience: "1_to_3_years",
      referralSource: "",
      previousRelationship: "",
      internalReferral: "NA",
      termsAccepted: undefined,
      termsVersion: TERMS_VERSION,
      formStartedAt: 0,
      websiteFax: "",
    },
  });

  useEffect(() => {
    form.setValue("formStartedAt", Date.now());
  }, [form]);

  const errors = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, termsAccepted: true, termsVersion: TERMS_VERSION }),
      });
      const data = (await response.json()) as {
        error?: string;
        fields?: Record<string, string[]>;
        applicationId?: string;
      };
      if (!response.ok) {
        if (data.fields) {
          for (const [key, messages] of Object.entries(data.fields)) {
            form.setError(key as keyof FormValues, { message: messages[0] });
          }
        }
        toast.error(data.error ?? "Please correct the highlighted fields.");
        return;
      }
      toast.success("Application saved. Check your email for a receipt confirmation when delivery succeeds.");
      router.push(`/apply/success?id=${data.applicationId}`);
    } catch {
      toast.error("Network error. Your answers are still on this page.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...form.register("websiteFax")} />

      <Section title="General">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First Name" required error={errors.firstName?.message}>
            <Input {...form.register("firstName")} autoComplete="given-name" />
          </Field>
          <Field label="Last Name" required error={errors.lastName?.message}>
            <Input {...form.register("lastName")} autoComplete="family-name" />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <Input type="email" {...form.register("email")} autoComplete="email" />
            {gmailOnly ? <p className="mt-1 text-xs text-[var(--muted)]">Gmail addresses only are currently enabled.</p> : null}
          </Field>
          <Field label="Email Confirmation" required error={errors.confirmEmail?.message}>
            <Input type="email" {...form.register("confirmEmail")} autoComplete="email" />
          </Field>
          <Field label="Phone Number" error={errors.phone?.message}>
            <Input {...form.register("phone")} autoComplete="tel" />
          </Field>
          <Field label="Timezone" error={errors.timezone?.message}>
            <Select {...form.register("timezone")}>
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Company">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Legal Entity Type" required error={errors.legalEntityType?.message}>
            <Select {...form.register("legalEntityType")}>
              {LEGAL_ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {LEGAL_ENTITY_LABELS[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Company / Individual / Website Name" required error={errors.companyName?.message}>
            <Input {...form.register("companyName")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Website / Social Media" required error={errors.websiteUrl?.message}>
              <Input type="url" placeholder="https://" {...form.register("websiteUrl")} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Address">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Address" required error={errors.addressLine1?.message}>
            <Input {...form.register("addressLine1")} autoComplete="address-line1" />
          </Field>
          <Field label="Apartment / Suite" error={errors.addressLine2?.message}>
            <Input {...form.register("addressLine2")} autoComplete="address-line2" />
          </Field>
          <Field label="Country" required error={errors.country?.message}>
            <Select {...form.register("country")}>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City" required error={errors.city?.message}>
            <Input {...form.register("city")} autoComplete="address-level2" />
          </Field>
          <Field label="ZIP / Postal Code" required error={errors.postalCode?.message}>
            <Input {...form.register("postalCode")} autoComplete="postal-code" />
          </Field>
        </div>
      </Section>

      <Section title="Additional Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Messaging Service" required error={errors.messagingService?.message}>
            <Select {...form.register("messagingService")}>
              {MESSAGING_SERVICES.map((service) => (
                <option key={service} value={service}>
                  {MESSAGING_LABELS[service]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Messenger Username" required error={errors.messengerUsername?.message}>
            <Input {...form.register("messengerUsername")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Best Time to Contact" error={errors.bestTimeToContact?.message}>
              <Input {...form.register("bestTimeToContact")} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Traffic Details">
        <Field
          label="What are your top verticals and campaigns?"
          required
          error={errors.topVerticals?.message}
        >
          <Textarea {...form.register("topVerticals")} />
        </Field>
        <fieldset className="mt-4">
          <legend className="mb-3 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Campaign selection *
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            {CAMPAIGNS.map((campaign) => (
              <label
                key={campaign.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 transition has-checked:border-[#67efff]/70 has-checked:bg-[#67efff]/10"
              >
                <input type="checkbox" value={campaign.id} {...form.register("campaigns")} className="mt-1 accent-[#67efff]" />
                <span>
                  <span className="block text-[var(--ivory)]">{campaign.name}</span>
                  <span className="block text-sm text-[var(--muted)]">{campaign.summary}</span>
                </span>
              </label>
            ))}
          </div>
          <FieldError message={errors.campaigns?.message as string | undefined} />
        </fieldset>
        <div className="mt-4">
          <Field
            label="What networks and/or advertisers do you work?"
            required
            error={errors.trafficSourceDetails?.message}
          >
            <Textarea {...form.register("trafficSourceDetails")} />
          </Field>
        </div>
      </Section>

      <Section title="Affiliate Monthly Earnings">
        <Field
          label="Average revenue generated per month"
          required
          error={errors.monthlyRevenueRange?.message}
        >
          <Select {...form.register("monthlyRevenueRange")}>
            {REVENUE_RANGES.map((range) => (
              <option key={range} value={range}>
                {REVENUE_RANGE_LABELS[range]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="mt-4">
          <Field label="Optional explanation" error={errors.monthlyRevenueNotes?.message}>
            <Textarea {...form.register("monthlyRevenueNotes")} />
          </Field>
        </div>
      </Section>

      <Section title="Networks and Advertisers">
        <p className="mb-4 text-sm text-[var(--muted)]">Provide 2 references with contact details.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Reference 1 name" required error={errors.referenceOneName?.message}>
            <Input {...form.register("referenceOneName")} />
          </Field>
          <Field label="Reference 1 contact" required error={errors.referenceOneContact?.message}>
            <Input {...form.register("referenceOneContact")} />
          </Field>
          <Field label="Reference 2 name" required error={errors.referenceTwoName?.message}>
            <Input {...form.register("referenceTwoName")} />
          </Field>
          <Field label="Reference 2 contact" required error={errors.referenceTwoContact?.message}>
            <Input {...form.register("referenceTwoContact")} />
          </Field>
        </div>
      </Section>

      <Section title="Primary and Secondary Channels">
        <Field label="What is your Primary Channel?" required error={errors.primaryChannelDetails?.message}>
          <Textarea
            placeholder="Place primary channel details here"
            {...form.register("primaryChannelDetails")}
          />
        </Field>
        <div className="mt-4">
          <Field
            label="What is your Secondary Channel?"
            required
            error={errors.secondaryChannelDetails?.message}
          >
            <Textarea
              placeholder="Place secondary channel details here"
              {...form.register("secondaryChannelDetails")}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">Enter NA if not applicable.</p>
          </Field>
        </div>
      </Section>

      <Section title="Experience">
        <Field
          label="How did you get into affiliate marketing?"
          required
          error={errors.howEnteredAffiliate?.message}
        >
          <Textarea
            placeholder="Place affiliate marketing details here"
            {...form.register("howEnteredAffiliate")}
          />
        </Field>
        <div className="mt-4">
          <Field
            label="How long have you been in the industry?"
            required
            error={errors.industryExperience?.message}
          >
            <Select {...form.register("industryExperience")}>
              {EXPERIENCE_LENGTHS.map((item) => (
                <option key={item} value={item}>
                  {EXPERIENCE_LENGTH_LABELS[item]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Referral Source">
        <Field
          label="How did you hear about Assured Insurance Services?"
          required
          error={errors.referralSource?.message}
        >
          <Input
            placeholder="Share how you heard about us"
            {...form.register("referralSource")}
          />
        </Field>
      </Section>

      <Section title="Previous Relationship">
        <Field
          label="Have you worked with a pay-per-call network in the past?"
          required
          error={errors.previousRelationship?.message}
        >
          <Textarea placeholder={PREVIOUS_RELATIONSHIP_QUESTION} {...form.register("previousRelationship")} />
        </Field>
      </Section>

      <Section title="Internal Referral">
        <Field
          label="Who asked you to sign up? Share the representative's full name, or NA"
          error={errors.internalReferral?.message}
        >
          <Input {...form.register("internalReferral")} />
        </Field>
      </Section>

      <Section title="Terms">
        <p className="text-sm leading-7 text-[var(--muted)]">
          Draft legal documents are provided for review before launch. Read the{" "}
          <a className="text-[var(--gold)] underline" href="/legal/terms">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a className="text-[var(--gold)] underline" href="/legal/privacy">
            Privacy Policy
          </a>
          . Version recorded on submit: {TERMS_VERSION}.
        </p>
        <label className="mt-4 flex items-start gap-3 text-sm text-[var(--ivory)]">
          <input type="checkbox" {...form.register("termsAccepted")} className="mt-1" />
          I have read and agree to the Terms and Conditions and Privacy Policy.
        </label>
        <FieldError message={errors.termsAccepted?.message} />
      </Section>

      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
        {submitting ? "Saving application…" : "Submit application"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <h2 className="mb-6 font-serif text-2xl text-[var(--ivory)]">{title}</h2>
        {children}
      </Card>
    </motion.section>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
