import { renderCommitMessage, renderPullRequestBody } from "./template.js";
import { template } from "handlebars";
import { Test, describe, expect, test } from "vitest";

describe("templating", () => {
  test("commit message", () => {
    type TestCase = {
      template: string;
      flakeDotLockDir: string;
      flakeDotLock: string;
      expected: string;
    };

    const testCases: TestCase[] = [
      {
        template: "Updating flake.lock in dir {{ flake_dot_lock_dir }}",
        flakeDotLockDir: ".",
        flakeDotLock: "./flake.lock",
        expected: "Updating flake.lock in dir .",
      },
      {
        template:
          "Here I go doing some updating of my pristine flake.lock at {{ flake_dot_lock }}",
        flakeDotLockDir: "subflake",
        flakeDotLock: "subflake/flake.lock",
        expected:
          "Here I go doing some updating of my pristine flake.lock at subflake/flake.lock",
      },
      {
        template: "This variable doesn't exist: {{ foo }}",
        flakeDotLockDir: ".",
        flakeDotLock: "./flake.lock",
        expected: "This variable doesn't exist: ",
      },
    ];

    testCases.forEach(
      ({ template, flakeDotLockDir, flakeDotLock, expected }) => {
        expect(
          renderCommitMessage(template, flakeDotLockDir, flakeDotLock),
        ).toEqual(expected);
      },
    );
  });

  test("pull request body", () => {
    type TestCase = {
      template: string;
      expected: string;
    };

    const testCases: TestCase[] = [];

    testCases.forEach(({ template, expected }) => {
      expect(renderPullRequestBody(template)).toEqual(expected);
    });
  });
});
