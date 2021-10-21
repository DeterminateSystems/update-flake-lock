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
    - cron: '0 0 * * *' # runs daily at 00:00

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Install Nix
        uses: cachix/install-nix-action@v14
        with:
          install_url: https://nixos-nix-install-tests.cachix.org/serve/vij683ly7sl95nnhb67bdjjfabclr85m/install
          install_options: '--tarball-url-prefix https://nixos-nix-install-tests.cachix.org/serve'
          extra_nix_config: |
            experimental-features = nix-command flakes
            access-tokens = github.com=${{ secrets.GITHUB_TOKEN }}
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@v3
```

