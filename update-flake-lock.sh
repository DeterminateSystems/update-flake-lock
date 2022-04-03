#!/usr/bin/env bash
set -euo pipefail

if [[ -n "$TARGETS" ]]; then
    inputs=()
    for input in $TARGETS; do
        inputs+=("--update-input" "$input")
    done
    nix flake lock "${inputs[@]}" --commit-lock-file --commit-lockfile-summary "$COMMIT_MSG"
else
    nix flake update --commit-lock-file --commit-lockfile-summary "$COMMIT_MSG"
fi
