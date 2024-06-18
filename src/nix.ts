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

  const updateLockMechanism = flakeInputFlags.length === 0 ? "update" : "lock";

  return nixOptions
    .concat(["flake", updateLockMechanism])
    .concat(flakeInputFlags)
    .concat(["--commit-lock-file", "--commit-lockfile-summary", commitMessage]);
}
