import { describe, expect, test } from "bun:test";
import { escapeLikePattern } from "./search.routes.ts";

describe("escapeLikePattern", () => {
  test("escapes % wildcard", () => {
    expect(escapeLikePattern("100%")).toBe("100\\%");
  });

  test("escapes _ wildcard", () => {
    expect(escapeLikePattern("user_name")).toBe("user\\_name");
  });

  test("escapes backslash", () => {
    expect(escapeLikePattern("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  test("escapes multiple special chars", () => {
    expect(escapeLikePattern("50%_discount\\sale")).toBe(
      "50\\%\\_discount\\\\sale",
    );
  });

  test("normal text unchanged", () => {
    expect(escapeLikePattern("hello world")).toBe("hello world");
  });
});
