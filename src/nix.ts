// Build the Nix args out of inputs from the Actions environment
export function makeNixCommandArgs(
  nixOptions: string[],
  flake: string | null,
  flakeInputs: string[],
  commitMessage: string | null,
): string[] {
  // NOTE(cole-h): In Nix versions 2.23.0 and later, `commit-lockfile-summary` became an alias to
  // the setting `commit-lock-file-summary` (https://github.com/NixOS/nix/pull/10691), and Nix does
  // not treat aliases the same as their "real" setting by requiring setting aliases to be
  // configured via `--option <alias name> <option value>`
  // (https://github.com/NixOS/nix/issues/10989).
  // So, we go the long way so that we can support versions both before and after Nix 2.23.0.
  const lockfileSummaryFlags = commitMessage
    ? ["--option", "commit-lockfile-summary", commitMessage]
    : [];

  return nixOptions
    .concat(["flake", "update"])
    .concat(flake ? ["--flake", flake] : [])
    .concat(flakeInputs)
    .concat(["--commit-lock-file"])
    .concat(lockfileSummaryFlags);
}
