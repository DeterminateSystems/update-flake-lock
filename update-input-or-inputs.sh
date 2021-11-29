#!/usr/bin/env bash
to_update=$*

if [ -n "$to_update" ]; then
  inputs=()
  for input in $to_update; do
    inputs+=("--update-input" "$input")
  done
  nix flake lock "${inputs[@]}" --commit-lock-file
else
  nix flake update --commit-lock-file
fi
