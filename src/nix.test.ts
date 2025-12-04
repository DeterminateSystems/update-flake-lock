import { makeNixCommandArgs } from "./nix.js";
import { expect, test } from "vitest";

type TestCase = {
  inputs: {
    nixOptions: string[];
    flake: string | null;
    flakeInputs: string[];
    commitMessage: string | null;
  };
  expected: string[];
};

test("Nix command arguments", () => {
  const testCases: TestCase[] = [
    {
      inputs: {
        nixOptions: [],
        flake: "flake-url",
        flakeInputs: [],
        commitMessage: null,
      },
      expected: [
        "flake",
        "update",
        "--flake",
        "flake-url",
        "--commit-lock-file",
      ],
    },
    {
      inputs: {
        nixOptions: ["--log-format", "raw"],
        flake: null,
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
        flake: null,
        flakeInputs: ["nixpkgs", "rust-overlay"],
        commitMessage: "just testing",
      },
      expected: [
        "flake",
        "update",
        "nixpkgs",
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
        flake: null,
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
      inputs.flake,
      inputs.flakeInputs,
      inputs.commitMessage,
    );
    expect(args).toStrictEqual(expected);
  });
});
