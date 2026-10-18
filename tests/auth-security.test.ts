import { describe, expect, it } from "vitest";
import { hashWithSalt, safeEqual } from "@/lib/hash";
import { verifyAdminCredentials } from "@/lib/auth/session";
import { clientIp, rateLimitExceeded } from "@/lib/rate-limit";

describe("Security and Authentication Utilities", () => {
  describe("Constant-Time String Comparison (safeEqual)", () => {
    it("returns true for matching strings", () => {
      expect(safeEqual("admin@assuredinsurance.com", "admin@assuredinsurance.com")).toBe(true);
      expect(safeEqual("correct-horse-battery-staple", "correct-horse-battery-staple")).toBe(true);
    });

    it("returns false for different strings of same length", () => {
      expect(safeEqual("passwordA", "passwordB")).toBe(false);
    });

    it("returns false for different strings of different lengths without throwing", () => {
      expect(safeEqual("short", "longer_password_string")).toBe(false);
      expect(safeEqual("", "non-empty")).toBe(false);
    });
  });

  describe("Admin Credential Verification", () => {
    it("verifies credentials against environment variables using safeEqual", () => {
      const origEmail = process.env.ADMIN_EMAIL;
      const origPass = process.env.ADMIN_PASSWORD;

      process.env.ADMIN_EMAIL = "admin@assuredinsurance.com";
      process.env.ADMIN_PASSWORD = "StrongSecurePassword123#";

      expect(verifyAdminCredentials("admin@assuredinsurance.com", "StrongSecurePassword123#")).toBe(true);
      expect(verifyAdminCredentials("ADMIN@assuredinsurance.com", "StrongSecurePassword123#")).toBe(true);
      expect(verifyAdminCredentials("admin@assuredinsurance.com", "WrongPassword")).toBe(false);
      expect(verifyAdminCredentials("other@assuredinsurance.com", "StrongSecurePassword123#")).toBe(false);

      process.env.ADMIN_EMAIL = origEmail;
      process.env.ADMIN_PASSWORD = origPass;
    });

    it("returns false when credentials are not configured", () => {
      const origEmail = process.env.ADMIN_EMAIL;
      delete process.env.ADMIN_EMAIL;
      expect(verifyAdminCredentials("admin@test.com", "pass")).toBe(false);
      process.env.ADMIN_EMAIL = origEmail;
    });
  });

  describe("Hashing with Salt", () => {
    it("generates predictable, salted sha256 hashes", () => {
      const hash1 = hashWithSalt("192.168.1.100", "my-secret-salt");
      const hash2 = hashWithSalt("192.168.1.100", "my-secret-salt");
      const hash3 = hashWithSalt("192.168.1.100", "different-salt");

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toHaveLength(64);
    });
  });

  describe("Rate Limiting and Client IP Extraction", () => {
    it("detects when rate limit threshold is exceeded", () => {
      expect(rateLimitExceeded(4, 5)).toBe(false);
      expect(rateLimitExceeded(5, 5)).toBe(true);
      expect(rateLimitExceeded(6, 5)).toBe(true);
    });

    it("extracts client IP from x-forwarded-for header", () => {
      const headers = new Headers({
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      });
      expect(clientIp(headers)).toBe("203.0.113.195");
    });

    it("falls back to x-real-ip when x-forwarded-for is absent", () => {
      const headers = new Headers({
        "x-real-ip": "198.51.100.42",
      });
      expect(clientIp(headers)).toBe("198.51.100.42");
    });

    it("returns unknown when no IP headers are present", () => {
      const headers = new Headers();
      expect(clientIp(headers)).toBe("unknown");
    });
  });
});
