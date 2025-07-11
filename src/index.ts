import { makeNixCommandArgs } from "./nix.js";
import * as actionsCore from "@actions/core";
import * as actionsExec from "@actions/exec";
import { DetSysAction, inputs } from "detsys-ts";
import { Writable } from "stream";

const EVENT_EXECUTION_FAILURE = "execution_failure";
const COMMIT_MESSAGE_MAX_LENGTH = 65536;

class UpdateFlakeLockAction extends DetSysAction {
  private nixOptions: string[];
  private flakeInputs: string[];
  private pathToFlakeDir: string | null;

  constructor() {
    super({
      name: "update-flake-lock",
      fetchStyle: "universal",
      requireNix: "fail",
    });

    this.flakeInputs = inputs.getArrayOfStrings("inputs", "space");
    this.nixOptions = inputs.getArrayOfStrings("nix-options", "space");
    this.pathToFlakeDir = inputs.getStringOrNull("path-to-flake-dir");
  }

  async main(): Promise<void> {
    await this.update();
  }

  // No post phase
  async post(): Promise<void> {}

  async update(): Promise<void> {
    // Nix command of this form:
    // nix ${maybe nix options} flake ${"update" or "lock"} ${maybe --update-input flags}
    // Example commands:
    // nix --extra-substituters https://example.com flake lock --update-input nixpkgs
    // nix flake update
    const nixCommandArgs: string[] = makeNixCommandArgs(
      this.nixOptions,
      this.flakeInputs,
    );

    actionsCore.debug(
      JSON.stringify({
        options: this.nixOptions,
        inputs: this.flakeInputs,
        args: nixCommandArgs,
      }),
    );

    let output = "";

    const execOptions: actionsExec.ExecOptions = {
      cwd: this.pathToFlakeDir !== null ? this.pathToFlakeDir : undefined,
      ignoreReturnCode: true,
      outStream: new Writable({
        write: (chunk, _, callback) => {
          output += chunk.toString();
          callback();
        },
      }),
    };

    const exitCode = await actionsExec.exec("nix", nixCommandArgs, execOptions);

    if (exitCode !== 0) {
      this.recordEvent(EVENT_EXECUTION_FAILURE, {
        exitCode,
      });
      actionsCore.setFailed(`non-zero exit code of ${exitCode} detected`);
    } else {
      actionsCore.info(`flake.lock file was successfully updated`);
      if (output.length > COMMIT_MESSAGE_MAX_LENGTH) {
        actionsCore.warning(
          `commit message is too long, truncating to ${COMMIT_MESSAGE_MAX_LENGTH} characters`,
        );
      }
      actionsCore.exportVariable(
        "FLAKE_UPDATE_OUTPUT",
        output.trim().slice(0, COMMIT_MESSAGE_MAX_LENGTH),
      );
    }
  }
}

function main(): void {
  new UpdateFlakeLockAction().execute();
}

main();
