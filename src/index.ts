import * as actionsCore from "@actions/core";
import * as actionsExec from "@actions/exec";
import { ActionOptions, IdsToolbox, inputs } from "detsys-ts";

const EVENT_EXECUTION_FAILURE = "execution_failure";

class UpdateFlakeLockAction {
  idslib: IdsToolbox;
  private commitMessage: string;
  private pathToFlakeDir: string | null;

  constructor() {
    const options: ActionOptions = {
      name: "update-flake-lock",
      fetchStyle: "universal",
      requireNix: "fail",
    };

    this.idslib = new IdsToolbox(options);
    this.commitMessage = inputs.getString("commit-msg");
    this.pathToFlakeDir = inputs.getStringOrNull("path-to-flake-dir");
  }

  get flakeInputs(): string[] {
    const targets: string[] = [];
    for (const input of inputs.getString("inputs").split(",")) {
      targets.concat(["--update-input", input]);
    }
    return targets;
  }

  get nixOptions(): string[] {
    return inputs.getString("nix-options").split(",");
  }

  async update(): Promise<void> {
    if (this.pathToFlakeDir !== null) {
      const returnCode = await actionsExec.exec("cd", [this.pathToFlakeDir]);
      if (returnCode !== 0) {
        this.idslib.recordEvent(EVENT_EXECUTION_FAILURE, {
          returnCode,
        });
        actionsCore.setFailed(
          `Error when trying to cd into flake directory ${this.pathToFlakeDir}. Make sure the check that the directory exists.`,
        );
      }
    }

    // Nix command of this form:
    // nix ${maybe nix options} flake lock ${maybe --update-input flags} --commit-lock-file --commit-lock-file-summary ${commit message}
    // Example commands:
    // nix --extra-substituters https://example.com flake lock --update-input nixpkgs --commit-lock-file --commit-lock-file-summary "updated flake.lock"
    // nix flake lock --commit-lock-file --commit-lock-file-summary "updated flake.lock"
    const nixCommandArgs: string[] = this.nixOptions
      .concat(["flake", "lock"])
      .concat(this.flakeInputs)
      .concat([
        "--commit-lock-file",
        "--commit-lock-file-summary",
        this.commitMessage,
      ]);

    actionsCore.debug(`running nix command:\nnix ${nixCommandArgs.join(" ")}`);

    const exitCode = await actionsExec.exec("nix", nixCommandArgs);

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
