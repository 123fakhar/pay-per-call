CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'approved', 'declined', 'withdrawn');
CREATE TYPE email_kind AS ENUM ('admin_notification', 'applicant_confirmation');
CREATE TYPE email_status AS ENUM ('pending', 'sending', 'sent', 'failed');

CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  timezone text NOT NULL,
  legal_entity_type text NOT NULL,
  company_name text NOT NULL,
  website_url text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  country text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  messaging_service text NOT NULL,
  messenger_username text NOT NULL,
  best_time_to_contact text,
  top_verticals text NOT NULL,
  campaigns jsonb NOT NULL,
  traffic_source_details text NOT NULL,
  monthly_revenue_range text NOT NULL,
  monthly_revenue_notes text,
  reference_one_name text NOT NULL,
  reference_one_contact text NOT NULL,
  reference_two_name text NOT NULL,
  reference_two_contact text NOT NULL,
  primary_channel_details text NOT NULL,
  secondary_channel_details text NOT NULL,
  how_entered_affiliate text NOT NULL,
  industry_experience text NOT NULL,
  referral_source text NOT NULL,
  previous_relationship text NOT NULL,
  internal_referral text,
  terms_accepted integer NOT NULL,
  terms_version text NOT NULL,
  terms_accepted_at timestamptz NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  admin_reviewed_at timestamptz,
  admin_notes text,
  submitter_key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX applications_created_at_idx ON applications (created_at DESC);
CREATE INDEX applications_status_idx ON applications (status);
CREATE INDEX applications_email_idx ON applications (email);

CREATE TABLE email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id),
  kind email_kind NOT NULL,
  to_address text NOT NULL,
  subject text NOT NULL,
  body_text text NOT NULL,
  status email_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  locked_at timestamptz,
  locked_by text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_outbox_application_kind_unique UNIQUE (application_id, kind)
);

CREATE INDEX email_outbox_status_scheduled_idx ON email_outbox (status, scheduled_at);

CREATE TABLE submission_rate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX submission_rate_events_key_created_idx ON submission_rate_events (key_hash, created_at DESC);
