#!/usr/bin/env bash
set -euo pipefail

if [[ -n "$PATH_TO_FLAKE_DIR" ]]; then
  cd "$PATH_TO_FLAKE_DIR"
fi

commitArg=""
if [[ "$COMMIT_WITH_TOKEN" != "true" ]]; then
  # Commit happening in next step
  commitArg="suppress"
fi

if [[ -n "$TARGETS" ]]; then
    inputs=()
    for input in $TARGETS; do
        inputs+=("--update-input" "$input")
    done
    nix flake lock "${inputs[@]}" ${commitArg:+"--commit-lock-file"} --commit-lockfile-summary "$COMMIT_MSG"
else
    nix flake update ${commitArg:+"--commit-lock-file"} --commit-lockfile-summary "$COMMIT_MSG"
fi
