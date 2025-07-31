import { makeNixCommandArgs } from "./nix.js";
import * as actionsCore from "@actions/core";
import * as actionsExec from "@actions/exec";
import { DetSysAction, inputs } from "detsys-ts";

const EVENT_EXECUTION_FAILURE = "execution_failure";

class UpdateFlakeLockAction extends DetSysAction {
  private commitMessage: string | null;
  private nixOptions: string[];
  private flakeInputs: string[];
  private flakes: string[];

  constructor() {
    super({
      name: "update-flake-lock",
      fetchStyle: "universal",
      requireNix: "fail",
    });

    this.commitMessage = inputs.getStringOrNull("commit-msg");
    this.flakeInputs = inputs.getArrayOfStrings("inputs", "space");
    this.nixOptions = inputs.getArrayOfStrings("nix-options", "space");
    this.flakes = actionsCore
      .getMultilineInput("flakes")
      .concat(inputs.getStringOrNull("path-to-flake-dir") ?? []);
  }

  async main(): Promise<void> {
    await this.update();
  }

  // No post phase
  async post(): Promise<void> {}

  async update(): Promise<void> {
    for (const flake of this.flakes.length > 0 ? this.flakes : [null]) {
      // Nix command of this form:
      // nix ${maybe nix options} flake update ${maybe --flake flake} ${maybe inputs} --commit-lock-file ${maybe --commit-lockfile-summary commit message}
      // Example commands:
      // nix --extra-substituters https://example.com flake update nixpkgs --commit-lock-file --commit-lockfile-summary "updated flake.lock"
      // nix flake update --flake flake-dir/ --commit-lock-file
      const nixCommandArgs: string[] = makeNixCommandArgs(
        this.nixOptions,
        flake,
        this.flakeInputs,
        this.commitMessage,
      );

      actionsCore.debug(
        JSON.stringify({
          options: this.nixOptions,
          flake,
          inputs: this.flakeInputs,
          message: this.commitMessage,
          args: nixCommandArgs,
        }),
      );

      const execOptions: actionsExec.ExecOptions = {
        ignoreReturnCode: true,
      };

      const exitCode = await actionsExec.exec(
        "nix",
        nixCommandArgs,
        execOptions,
      );

      if (exitCode !== 0) {
        this.recordEvent(EVENT_EXECUTION_FAILURE, {
          exitCode,
        });
        actionsCore.setFailed(`non-zero exit code of ${exitCode} detected`);
      } else {
        actionsCore.info(`flake.lock file was successfully updated`);
      }
    }
  }
}

function main(): void {
  new UpdateFlakeLockAction().execute();
}

main();
