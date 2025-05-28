# update-flake-lock

This is a GitHub Action that updates the [`flake.lock`][lockfile] file for your [Nix flake][flakes] whenever it is run.

> [!NOTE]
> As of v3, this action no longer automatically installs [Determinate Nix][det-nix] to the action runner.
> You **must** set up Nix with flakes support enabled prior to running this action or your workflow will not function as expected.

## Example

Here's an example GitHub Action workflow using this Action:

```yaml
name: "Flake.lock: update Nix dependencies"

on:
  workflow_dispatch: # allows manual triggering
  schedule:
    - cron: '0 0 * * 0' # runs weekly on Sunday at 00:00

jobs:
  nix-flake-update:
    permissions:
      contents: write
      id-token: write
      issues: write
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: DeterminateSystems/determinate-nix-action@v3
      - uses: DeterminateSystems/update-flake-lock@main
        with:
          pr-title: "Update Nix flake inputs" # Title of PR to be created
          pr-labels: |                  # Labels to be set on the PR
            dependencies
            automated
```

## Example updating specific input(s)

> [!NOTE]
> If any inputs have a stale reference (e.g. the lockfile thinks a git input wants its "ref" to be "nixos-unstable", but the flake.nix specifies "nixos-unstable-small"), they are also updated. At this time, there is no known workaround.

It's also possible to update specific [flake inputs][inputs] by specifying them in a space-separated list:

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
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
        with:
          inputs: input1 input2 input3
```

## Example adding options to nix command

It's also possible to use specific options to the `nix` command in a space-separated list:

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
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
        with:
          nix-options: --debug --log-format raw
```

## Example that prints the number of the created PR

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
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        id: update
        uses: DeterminateSystems/update-flake-lock@main
        with:
          inputs: input1 input2 input3
      - name: Print PR number
        run: echo Pull request number is ${{ steps.update.outputs.pull-request-number }}.
```

## Example that doesn't run on PRs

If you were to run this action as a part of your CI workflow, you may want to prevent it from running against Pull Requests.

```yaml
name: update-flake-lock
on:
  workflow_dispatch: # allows manual triggering
  pull_request: # triggers on every Pull Request
  schedule:
    - cron: '0 0 * * 0' # runs weekly on Sunday at 00:00

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        if: ${{ github.event_name != 'pull_request' }}
        uses: DeterminateSystems/update-flake-lock@main
        with:
          inputs: input1 input2 input3
          path-to-flake-dir: 'nix/' # in this example our flake doesn't sit at the root of the repository, it sits under 'nix/flake.nix'
```

## Example using a different Git user

If you want to change the author and / or committer of the flake.lock update commit, you can tweak the `git-{author,committer}-{name,email}` options:

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
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
        with:
          git-author-name: Jane Author
          git-author-email: github-actions[bot]@users.noreply.github.com
          git-committer-name: John Committer
          git-committer-email: github-actions[bot]@users.noreply.github.com
```

## Running GitHub Actions CI

GitHub Actions doesn't run workflows when a branch is pushed by or a PR is opened by a GitHub Action.
There are two ways to have GitHub Actions CI run on a PR submitted by this action.

### Without a Personal Authentication Token

Without using a Personal Authentication Token, close and reopen the pull request manually to kick off CI.

### With a Personal Authentication Token

By providing a Personal Authentication Token, the PR is submitted in a way that bypasses this limitation (GitHub essentially thinks it's the owner of the PAT submitting the PR, and not an Action).
You can create a token by visiting https://github.com/settings/tokens and select at least the `repo` scope. For the new fine-grained tokens, you need to enable read and write access for "Contents" and "Pull Requests" permissions. Then, store this token in your repository secrets (i.e. `https://github.com/<USER>/<REPO>/settings/secrets/actions`) as `GH_TOKEN_FOR_UPDATES` and set up your workflow file like the following:

```yaml
name: update-flake-lock
on:
  workflow_dispatch: # allows manual triggering
  schedule:
    - cron: '0 0 * * 1,4' # Run twice a week

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
        with:
          token: ${{ secrets.GH_TOKEN_FOR_UPDATES }}
```

## With GPG commit signing

It's possible for the bot to produce GPG-signed commits.
Associating a GPG public key to a GitHub user account isn't required but it *is* necessary if you want the signed commits to appear as verified in Github.
This can be a compliance requirement in some cases.

You can follow [GitHub's guide to creating and/or adding a new GPG key to an user account](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-new-gpg-key-to-your-github-account).
Using a specific GitHub user account for the bot can be a good security measure to dissociate this bot's actions and commits from your personal GitHub account.

For the bot to produce signed commits, you need to provide the GPG private keys to this action's input parameters. You can safely do that with [Github secrets as explained here](https://github.com/crazy-max/ghaction-import-gpg#prerequisites).

When using commit signing, the commit author name and email for the commits produced by this bot would correspond to the ones associated to the GPG Public Key.

If you want to sign using a subkey, you must specify the subkey fingerprint using the `gpg-fingerprint` input parameter.

Here's an example of how to using this action with commit signing:

```yaml
name: update-flake-lock

on:
  workflow_dispatch: # allows manual triggering
  schedule:
    - cron: '0 0 * * 1,4' # Run twice a week

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
        with:
          sign-commits: true
          gpg-private-key: ${{ secrets.GPG_PRIVATE_KEY }}
          gpg-fingerprint: ${{ secrets.GPG_FINGERPRINT }} # specify subkey fingerprint (optional)
          gpg-passphrase: ${{ secrets.GPG_PASSPHRASE }}
```

## Custom PR Body

By default, the generated PR body uses this template:

````handlebars
Automated changes by the [update-flake-lock](https://github.com/DeterminateSystems/update-flake-lock) GitHub Action.

````
{{ env.GIT_COMMIT_MESSAGE }}
````
```

### Running GitHub Actions on this PR

GitHub Actions doesn't run workflows on pull requests that are opened by a GitHub Action.

To run GitHub Actions workflows on this PR, run:

```sh
git branch -D update_flake_lock_action
git fetch origin
git checkout update_flake_lock_action
git commit --amend --no-edit
git push origin update_flake_lock_action --force
```
````

You can customize it, however, using variable interpolation performed with [Handlebars].
This enables you to customize the template with these variables:

- `env.GIT_AUTHOR_NAME`
- `env.GIT_AUTHOR_EMAIL`
- `env.GIT_COMMITTER_NAME`
- `env.GIT_COMMITTER_EMAIL`
- `env.GIT_COMMIT_MESSAGE`

## Add assignees or reviewers

You can assign the PR to or request a review from one or more GitHub users with `pr-assignees` and `pr-reviewers`, respectively.
These properties expect a comma or newline separated list of GitHub usernames:

```yaml
name: update-flake-lock
on:
  workflow_dispatch: # allows manual triggering
  schedule:
    - cron: '0 0 * * 1,4' # Run twice a week

jobs:
  lockfile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Install Determinate Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Update flake.lock
        uses: DeterminateSystems/update-flake-lock@main
        with:
          pr-assignees: SomeGitHubUsername
          pr-reviewers: SomeOtherGitHubUsername,SomeThirdGitHubUsername
```

## Contributing

Feel free to send a PR or open an issue if you find that something functions unexpectedly!
Please make sure to test your changes and update any related documentation before submitting your PR.

### How to test changes

In order to more easily test your changes to this action, we have created a template repository that should point you in the right direction: https://github.com/DeterminateSystems/update-flake-lock-test-template.
Please see the README in that repository for instructions on testing your changes.

[det-nix]: https://docs.determinate.systems/determinate-nix
[flakes]: https://zero-to-nix.com/concepts/flakes
[handlebars]: https://handlebarsjs.com
[inputs]: https://zero-to-nix.com/concepts/flakes/#inputs
[lockfile]: https://zero-to-nix.com/concepts/flakes/#lockfile
