import { describe, it, expect } from "vitest";
import { healthResponseSchema } from "../lib/validation";

describe("Health Check Validation Schema", () => {
  it("validates a correctly structured health object", () => {
    const payload = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: "test",
    };

    const result = healthResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("ok");
    }
  });

  it("fails validation when status is invalid", () => {
    const payload = {
      status: "error",
      timestamp: new Date().toISOString(),
      environment: "test",
    };

    const result = healthResponseSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
