import { describe, expect, it } from "vitest";
import { GET as getLive } from "@/app/api/health/live/route";
import { GET as getVersion } from "@/app/api/health/version/route";

describe("Health Check Endpoints", () => {
  it("responds to /api/health/live with ok status", async () => {
    const response = await getLive();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.version).toBeDefined();
  });

  it("responds to /api/health/version with version and gitSha", async () => {
    const response = await getVersion();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.version).toBeDefined();
    expect(data.gitSha).toBeDefined();
  });
});
