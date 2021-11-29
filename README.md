# update-flake-lock

This is a GitHub Action that will update your flake.lock file whenever it is run.

> **NOTE:** As of v3, this action will no longer automatically install Nix to the action runner. You **MUST** set up a Nix with flakes support enabled prior to running this action, or your workflow will not function as expected.

## Example

An example GitHub Action workflow using this action would look like the following:

```yaml
name: update-flake-lock
on:
  workflow_dispatch: # allows manual triggering
  schedule:
    - cron: '0 0 * * 0' # runs weekly on Sunday at 00:00

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Install Nix
        uses: cachix/install-nix-action@v16
        with:
          extra_nix_config: |
            access-tokens = github.com=${{ secrets.GITHUB_TOKEN }}
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@v3
```

## Running GitHub Actions CI

GitHub Actions will not run workflows when a branch is pushed by or a PR is opened by a GitHub Action. To work around this, try:

```
git branch -D update_flake_lock_action
git fetch origin
git checkout update_flake_lock_action
git commit --amend --no-edit
git push origin update_flake_lock_action --force
```

## Contributing

Feel free to send a PR or open an issue if you find something functions unexpectedly! Please make sure to test your changes and update any related documentation before submitting your PR.

### How to test changes

In order to more easily test your changes to this action, we have created a template repository that should point you in the right direction: https://github.com/DeterminateSystems/update-flake-lock-test-template. Please see the README in that repository for instructions on testing your changes.
