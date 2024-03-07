#!/usr/bin/env bash
set -euo pipefail

update(){
  if [[ -n "${TARGETS:-}" ]]; then
      inputs=()
      for input in $TARGETS; do
          inputs+=("--update-input" "$input")
      done
      nix "${options[@]}" flake lock "${inputs[@]}" --commit-lock-file --commit-lockfile-summary "$COMMIT_MSG"
  else
      nix "${options[@]}" flake update --commit-lock-file --commit-lockfile-summary "$COMMIT_MSG"
  fi
}


options=()
if [[ -n "${NIX_OPTIONS:-}" ]]; then
    for option in $NIX_OPTIONS; do
        options+=("${option}")
    done
fi

if [[ -n "${PATH_TO_FLAKE_DIR:-}" ]]; then
  cd "$PATH_TO_FLAKE_DIR"
  update
elif [[ -n "${FLAKE_DIRS:-}" ]]; then
  for flake_dir in $FLAKE_DIRS; do
    cd "$flake_dir"
    update
  done
else
  update
fi
