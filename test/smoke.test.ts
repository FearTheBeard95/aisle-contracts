import { describe, it, expect } from "vitest";
import { CONTRACTS_VERSION, ApiErrorCodeSchema, ApiErrorSchema } from "../src/index.js";

describe("package", () => {
  it("exports a version", () => {
    expect(CONTRACTS_VERSION).toBe("0.1.6");
  });
});

describe("ApiErrorCodeSchema", () => {
  // EMAIL_UNVERIFIED is its own code rather than FORBIDDEN with a detail
  // string: both clients route to a whole screen on it, so sniffing
  // `details.reason` would be coupling that breaks silently.
  it("accepts EMAIL_UNVERIFIED", () => {
    expect(ApiErrorCodeSchema.parse("EMAIL_UNVERIFIED")).toBe("EMAIL_UNVERIFIED");
  });

  it("carries EMAIL_UNVERIFIED through the error envelope", () => {
    const parsed = ApiErrorSchema.parse({
      error: { code: "EMAIL_UNVERIFIED", message: "Verify your email to continue" },
    });
    expect(parsed.error.code).toBe("EMAIL_UNVERIFIED");
  });

  it("still rejects an unknown code", () => {
    expect(ApiErrorCodeSchema.safeParse("NOPE").success).toBe(false);
  });
});
