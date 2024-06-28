import { makeNixCommandArgs } from "./nix.js";
import { expect, test } from "vitest";

type TestCase = {
  inputs: {
    nixOptions: string[];
    flakeInputs: string[];
    commitMessage: string;
  };
  expected: string[];
};

test("Nix command arguments", () => {
  const testCases: TestCase[] = [
    {
      inputs: {
        nixOptions: ["--log-format", "raw"],
        flakeInputs: [],
        commitMessage: "just testing",
      },
      expected: [
        "--log-format",
        "raw",
        "flake",
        "update",
        "--commit-lock-file",
        "--option",
        "commit-lockfile-summary",
        "just testing",
      ],
    },
    {
      inputs: {
        nixOptions: [],
        flakeInputs: ["nixpkgs", "rust-overlay"],
        commitMessage: "just testing",
      },
      expected: [
        "flake",
        "lock",
        "--update-input",
        "nixpkgs",
        "--update-input",
        "rust-overlay",
        "--commit-lock-file",
        "--option",
        "commit-lockfile-summary",
        "just testing",
      ],
    },
    {
      inputs: {
        nixOptions: ["--debug"],
        flakeInputs: [],
        commitMessage: "just testing",
      },
      expected: [
        "--debug",
        "flake",
        "update",
        "--commit-lock-file",
        "--option",
        "commit-lockfile-summary",
        "just testing",
      ],
    },
  ];

  testCases.forEach(({ inputs, expected }) => {
    const args = makeNixCommandArgs(
      inputs.nixOptions,
      inputs.flakeInputs,
      inputs.commitMessage,
    );
    expect(args).toStrictEqual(expected);
  });
});
