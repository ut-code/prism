import { describe, expect, test } from "bun:test";
import { sanitizeFilename } from "./validation.ts";

describe("sanitizeFilename security", () => {
  test("blocks path traversal attempts", () => {
    expect(() => sanitizeFilename("..")).toThrow(
      "Filename cannot contain '..'",
    );
    expect(() => sanitizeFilename("../etc/passwd")).toThrow(
      "Filename cannot contain '..'",
    );
    expect(() => sanitizeFilename("foo/../bar")).toThrow(
      "Filename cannot contain '..'",
    );
  });

  test("blocks hidden files", () => {
    expect(() => sanitizeFilename(".env")).toThrow(
      "Filename cannot start with '.'",
    );
    expect(() => sanitizeFilename(".git")).toThrow(
      "Filename cannot start with '.'",
    );
  });

  test("blocks empty filenames", () => {
    expect(() => sanitizeFilename("")).toThrow("Filename cannot be empty");
    expect(() => sanitizeFilename("   ")).toThrow("Filename cannot be empty");
  });

  test("allows valid filenames", () => {
    expect(() => sanitizeFilename("document.pdf")).not.toThrow();
    expect(() => sanitizeFilename("my-file_123.txt")).not.toThrow();
    expect(() => sanitizeFilename("日本語ファイル.txt")).not.toThrow();
  });

  test("sanitizes special characters", () => {
    expect(sanitizeFilename("file/name.txt")).toBe("file_name.txt");
    expect(sanitizeFilename("file\\name.txt")).toBe("file_name.txt");
  });

  test("limits filename length", () => {
    const longName = `${"a".repeat(300)}.txt`;
    expect(sanitizeFilename(longName).length).toBe(255);
  });
});
