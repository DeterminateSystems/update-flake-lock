import { makeNixCommandArgs } from "./nix.js";
import * as actionsCore from "@actions/core";
import * as actionsExec from "@actions/exec";
import { DetSysAction, inputs } from "detsys-ts";
import * as fs from "fs";

const EVENT_EXECUTION_FAILURE = "execution_failure";

class UpdateFlakeLockAction extends DetSysAction {
  private commitMessage: string;
  private nixOptions: string[];
  private flakeInputs: string[];
  private pathToFlakeDir: string | null;
  private flakeDirs: string[] | null;

  constructor() {
    super({
      name: "update-flake-lock",
      fetchStyle: "universal",
      requireNix: "fail",
    });

    this.commitMessage = inputs.getString("commit-msg");
    this.flakeInputs = inputs.getArrayOfStrings("inputs", "space");
    this.nixOptions = inputs.getArrayOfStrings("nix-options", "space");
    this.pathToFlakeDir = inputs.getStringOrNull("path-to-flake-dir");
    this.flakeDirs = inputs.getArrayOfStrings("flake-dirs", "space");

    this.validateInputs();
  }

  async main(): Promise<void> {
    await this.update();
  }

  // No post phase
  async post(): Promise<void> {}

  async update(): Promise<void> {
    if (this.flakeDirs !== null && this.flakeDirs.length > 0) {
      actionsCore.debug(
        `Running flake lock update in multiple directories: ${this.flakeDirs.map((dir) => `\`${dir}\``).join(" ")}`,
      );

      for (const directory of this.flakeDirs) {
        await this.updateFlake(directory);
      }
    } else {
      // Set directory to root if not specified
      const flakeDir = this.pathToFlakeDir ?? ".";
      await this.updateFlake(flakeDir);
    }
  }

  private async updateFlake(flakeDir: string): Promise<void> {
    this.ensureDirectoryExists(flakeDir);
    this.ensureDirectoryIsFlake(flakeDir);

    actionsCore.debug(`Running flake lock update in directory \`${flakeDir}\``);

    // Nix command of this form:
    // nix ${maybe nix options} flake ${"update" or "lock"} ${maybe --update-input flags} --commit-lock-file --commit-lockfile-summary ${commit message}
    // Example commands:
    // nix --extra-substituters https://example.com flake lock --update-input nixpkgs --commit-lock-file --commit-lockfile-summary "updated flake.lock"
    // nix flake update --commit-lock-file --commit-lockfile-summary "updated flake.lock"
    const nixCommandArgs: string[] = makeNixCommandArgs(
      this.nixOptions,
      this.flakeInputs,
      this.commitMessage,
    );

    actionsCore.debug(
      JSON.stringify({
        directory: flakeDir,
        options: this.nixOptions,
        inputs: this.flakeInputs,
        message: this.commitMessage,
        args: nixCommandArgs,
      }),
    );

    const execOptions: actionsExec.ExecOptions = {
      cwd: flakeDir,
    };

    const exitCode = await actionsExec.exec("nix", nixCommandArgs, execOptions);

    if (exitCode !== 0) {
      this.recordEvent(EVENT_EXECUTION_FAILURE, {
        exitCode,
      });
      actionsCore.setFailed(
        `non-zero exit code of ${exitCode} detected while updating directory \`${flakeDir}\``,
      );
    } else {
      actionsCore.info(
        `flake.lock file in \`${flakeDir}\` was successfully updated`,
      );
    }
  }

  private validateInputs(): void {
    // Ensure that either path-to-flake-dir or flake-dirs is set to a meaningful value but not both
    if (
      this.flakeDirs !== null &&
      this.flakeDirs.length > 0 &&
      this.pathToFlakeDir !== ""
    ) {
      // TODO: improve this error message
      throw new Error(
        "Both `path-to-flake-dir` and `flake-dirs` are set, whereas only one can be set",
      );
    }

    // Ensure that flake-dirs isn't an empty array if set
    if (this.flakeDirs !== null && this.flakeDirs.length === 0) {
      throw new Error(
        "The `flake-dirs` input is set to an empty array; it must contain at least one directory",
      );
    }
  }

  private ensureDirectoryExists(flakeDir: string): void {
    actionsCore.debug(`Checking that flake directory \`${flakeDir}\` exists`);

    // Ensure the directory exists
    fs.access(flakeDir, fs.constants.F_OK, (err) => {
      if (err !== null) {
        throw new Error(`Directory \`${flakeDir}\` doesn't exist`);
      } else {
        actionsCore.debug(`Flake directory \`${flakeDir}\` exists`);
      }
    });
  }

  private ensureDirectoryIsFlake(flakeDir: string): void {
    const flakeDotNix = `${flakeDir}/flake.nix`;
    if (!fs.existsSync(flakeDotNix)) {
      throw new Error(
        `Directory \`${flakeDir}\` is not a valid flake as it doesn't contain a \`flake.nix\``,
      );
    } else {
      actionsCore.debug(`Directory \`${flakeDir}\` is a valid flake`);
    }
  }
}

function main(): void {
  new UpdateFlakeLockAction().execute();
}

main();
