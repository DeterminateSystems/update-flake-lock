import { makeNixCommandArgs } from "./nix.js";
import * as actionsCore from "@actions/core";
import * as actionsExec from "@actions/exec";
import { ActionOptions, IdsToolbox, inputs } from "detsys-ts";

const EVENT_EXECUTION_FAILURE = "execution_failure";

class UpdateFlakeLockAction {
  idslib: IdsToolbox;
  private commitMessage: string;
  private nixOptions: string[];
  private flakeInputs: string[];
  private pathToFlakeDir: string | null;

  constructor() {
    const options: ActionOptions = {
      name: "update-flake-lock",
      fetchStyle: "universal",
      requireNix: "fail",
    };

    this.idslib = new IdsToolbox(options);
    this.commitMessage = inputs.getString("commit-msg");
    this.flakeInputs = inputs.getArrayOfStrings("inputs", "comma");
    this.nixOptions = inputs.getArrayOfStrings("nix-options", "comma");
    this.pathToFlakeDir = inputs.getStringOrNull("path-to-flake-dir");
  }

  async update(): Promise<void> {
    // Nix command of this form:
    // nix ${maybe nix options} flake lock ${maybe --update-input flags} --commit-lock-file --commit-lockfile-summary ${commit message}
    // Example commands:
    // nix --extra-substituters https://example.com flake lock --update-input nixpkgs --commit-lock-file --commit-lockfile-summary "updated flake.lock"
    // nix flake lock --commit-lock-file --commit-lockfile-summary "updated flake.lock"
    const nixCommandArgs: string[] = makeNixCommandArgs(
      this.nixOptions,
      this.flakeInputs,
      this.commitMessage,
    );

    actionsCore.debug(
      JSON.stringify({
        options: this.nixOptions,
        inputs: this.flakeInputs,
        message: this.commitMessage,
        args: nixCommandArgs,
      }),
    );

    const execOptions: actionsExec.ExecOptions = {};
    if (this.pathToFlakeDir !== null) {
      execOptions.cwd = this.pathToFlakeDir;
    }

    const exitCode = await actionsExec.exec("nix", nixCommandArgs, execOptions);

    if (exitCode !== 0) {
      this.idslib.recordEvent(EVENT_EXECUTION_FAILURE, {
        exitCode,
      });
      actionsCore.setFailed(`non-zero exit code of ${exitCode} detected`);
    } else {
      actionsCore.info(`flake.lock file was successfully updated`);
    }
  }
}

function main(): void {
  const updateFlakeLock = new UpdateFlakeLockAction();

  updateFlakeLock.idslib.onMain(async () => {
    await updateFlakeLock.update();
  });

  updateFlakeLock.idslib.execute();
}

main();
