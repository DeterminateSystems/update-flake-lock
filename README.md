# update-flake-lock

This is a GitHub Action that will update your flake.lock file whenever it is run.

> NOTE: We hardcode the `install_url` to a relatively recent `nixUnstable` (`nix-2.5pre20211015_130284b` currently). If you need a newer version that includes a new feature or important bug fix, feel free to file an issue or send a PR bumping the `install_url` inside the [`action.yml`](action.yml)!

## Example

An example GitHub Action workflow using this action would look like the following:

```yaml
name: update-flake-lock
on:
  workflow_dispatch:

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
```

To have this workflow run on a recurring basis, see the [GitHub Actions documentation on the `schedule` key](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#schedule).
