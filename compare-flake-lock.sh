#!/usr/bin/env bash
set -euo pipefail

git checkout HEAD~1 &>/dev/null
nodes1="$(nix flake metadata '.#' --json | jq '.locks.nodes')"
git checkout - &>/dev/null
nodes2="$(nix flake metadata '.#' --json | jq '.locks.nodes')"
keys1="$(echo "${nodes1}" | jq 'keys | .[]')"
keys2="$(echo "${nodes2}" | jq 'keys | .[]')"

for key in ${keys2}; do
    if [[ "${keys1}" != *"${key}"* ]]; then
        continue
    fi
    owner="$(echo "${nodes1}" | jq -r ".${key}.locked.owner")"
    repo="$(echo "${nodes1}" | jq -r ".${key}.locked.repo")"
    type="$(echo "${nodes1}" | jq -r ".${key}.locked.type")"
    rev1="$(echo "${nodes1}" | jq -r ".${key}.locked.rev")"
    rev2="$(echo "${nodes2}" | jq -r ".${key}.locked.rev")"
    if [[ "${rev1}" != "${rev2}" ]]; then
        if [[ "${type}" == 'github' ]]; then
            echo "- https://github.com/${owner}/${repo}/compare/${rev1}...${rev2}"
        fi
        # TODO: support gitlab and possibly other services
    fi
done
