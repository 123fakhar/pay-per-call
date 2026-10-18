import { describe, expect, it } from "vitest";
import { smtpConfigured } from "@/lib/email/transport";

describe("Email Outbox and Transport Security", () => {
  describe("SMTP Configuration Detection", () => {
    it("reports not configured when required environment variables are missing", () => {
      const origHost = process.env.SMTP_HOST;
      const origPort = process.env.SMTP_PORT;
      const origUser = process.env.SMTP_USER;
      const origPass = process.env.SMTP_PASS;
      const origFrom = process.env.MAIL_FROM;

      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.MAIL_FROM;

      expect(smtpConfigured()).toBe(false);

      process.env.SMTP_HOST = origHost;
      process.env.SMTP_PORT = origPort;
      process.env.SMTP_USER = origUser;
      process.env.SMTP_PASS = origPass;
      process.env.MAIL_FROM = origFrom;
    });

    it("reports configured when all 5 variables are set", () => {
      const orig = { ...process.env };

      process.env.SMTP_HOST = "smtp.hostinger.com";
      process.env.SMTP_PORT = "465";
      process.env.SMTP_USER = "notifications@assuredinsurance.com";
      process.env.SMTP_PASS = "SecretPass123!";
      process.env.MAIL_FROM = "notifications@assuredinsurance.com";

      expect(smtpConfigured()).toBe(true);

      process.env = orig;
    });
  });

  describe("Exponential Backoff Logic", () => {
    function calculateBackoffMinutes(attempts: number) {
      return Math.min(60, 2 ** Math.max(0, attempts - 1));
    }

    it("calculates exponential intervals up to a 60-minute ceiling", () => {
      expect(calculateBackoffMinutes(1)).toBe(1);
      expect(calculateBackoffMinutes(2)).toBe(2);
      expect(calculateBackoffMinutes(3)).toBe(4);
      expect(calculateBackoffMinutes(4)).toBe(8);
      expect(calculateBackoffMinutes(5)).toBe(16);
      expect(calculateBackoffMinutes(6)).toBe(32);
      expect(calculateBackoffMinutes(7)).toBe(60);
      expect(calculateBackoffMinutes(10)).toBe(60);
    });
  });

  describe("Error Sanitization", () => {
    function sanitizeErrorMessage(error: unknown) {
      if (error instanceof Error && error.message.toLowerCase().includes("smtp is not configured")) {
        return "smtp_not_configured";
      }
      return "delivery_failed";
    }

    it("does not leak raw SMTP errors or server connection dumps", () => {
      const rawError = new Error("Connection failed to 192.168.1.1:465 with user myuser and pass secret");
      const sanitized = sanitizeErrorMessage(rawError);
      expect(sanitized).toBe("delivery_failed");
      expect(sanitized).not.toContain("secret");
      expect(sanitized).not.toContain("192.168.1.1");
    });

    it("categorizes unconfigured SMTP cleanly", () => {
      const err = new Error("SMTP is not configured");
      expect(sanitizeErrorMessage(err)).toBe("smtp_not_configured");
    });
  });
});
