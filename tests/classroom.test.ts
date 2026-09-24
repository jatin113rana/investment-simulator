import { describe, it, expect } from "vitest";
import { generateRandomCode } from "../lib/classroom/code-generator";
import { createClassroomSchema, joinClassroomSchema } from "../lib/validation/classroom";

describe("Classroom Join Code Generator", () => {
  it("generates a 6-character uppercase alphanumeric code", () => {
    const code = generateRandomCode(6);
    expect(code).toHaveLength(6);
    expect(code).toBe(code.toUpperCase());
    // Ensure no ambiguous characters 0, O, 1, I
    expect(code).not.toMatch(/[01OI]/);
  });
});

describe("Classroom Validation Schemas", () => {
  it("validates valid classroom creation input", () => {
    const input = { name: "Finance 101", startingBalance: 15000 };
    const parsed = createClassroomSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Finance 101");
      expect(parsed.data.startingBalance).toBe(15000);
    }
  });

  it("fails classroom creation when name is too short", () => {
    const input = { name: "AB", startingBalance: 10000 };
    const parsed = createClassroomSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates and uppercase transforms join codes", () => {
    const input = { code: "fin10a" };
    const parsed = joinClassroomSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe("FIN10A");
    }
  });

  it("fails join code validation when code length is not 6", () => {
    const input = { code: "FIN1" };
    const parsed = joinClassroomSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});
