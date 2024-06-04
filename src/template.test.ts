import { renderCommitMessage } from "./template.js";
import { describe, expect, test } from "vitest";

describe("templating", () => {
  test("commit message", () => {
    type TestCase = {
      template: string;
      flakeDotLock: string;
      expected: string;
    };

    const testCases: TestCase[] = [
      {
        template: "Updating lockfile at {{ flake_dot_lock }}",
        flakeDotLock: "./flake.lock",
        expected: "Updating lockfile at ./flake.lock",
      },
      {
        template:
          "Here I go doing some updating of my pristine flake.lock at {{ flake_dot_lock }}",
        flakeDotLock: "subflake/flake.lock",
        expected:
          "Here I go doing some updating of my pristine flake.lock at subflake/flake.lock",
      },
    ];

    testCases.forEach(({ template, flakeDotLock, expected }) => {
      expect(renderCommitMessage(template, flakeDotLock)).toEqual(expected);
    });
  });
});
