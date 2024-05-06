// Build the Nix args out of inputs from the Actions environment
export function makeNixCommandArgs(
  nixOptions: string[],
  flakeInputs: string[],
  commitMessage: string,
): string[] {
  const flakeInputFlags = flakeInputs.flatMap((input) => [
    "--update-input",
    input,
  ]);

  return nixOptions
    .concat(["flake", "lock"])
    .concat(flakeInputFlags)
    .concat([
      "--commit-lock-file",
      "--commit-lockfile-summary",
      `"${commitMessage}"`,
    ]);
}
