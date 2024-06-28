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
      dirs: string[];
      expected: string;
    };

    const testCases: TestCase[] = [
      {
        template: "Updated inputs: {{ comma_separated_dirs }}",
        dirs: ["."],
        expected: "Updated inputs: .",
      },
      {
        template: "Updated inputs: {{ space_separated_dirs }}",
        dirs: ["subflake", "subflake2"],
        expected: "Updated inputs: subflake subflake2",
      },
      {
        template: "Updated inputs:\n{{ updated_dirs_list }}",
        dirs: ["flake1", "flake2"],
        expected: `Updated inputs:\n* flake1\n* flake2`,
      },
    ];

    testCases.forEach(({ template, dirs, expected }) => {
      expect(renderPullRequestBody(template, dirs)).toEqual(expected);
    });
  });
});
