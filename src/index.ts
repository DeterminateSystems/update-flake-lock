import { makeNixCommandArgs } from "./nix.js";
import * as actionsExec from "@actions/exec";
import {
  DetSysAction,
  inputs,
  log,
  withSpan,
} from "@determinate-systems/detsys-ts";

const EVENT_EXECUTION_FAILURE = "detsys.execution_failure";

const ATTR_EXIT_CODE = "detsys.exit_code";

class UpdateFlakeLockAction extends DetSysAction {
  private commitMessage: string;
  private nixOptions: string[];
  private flakeInputs: string[];
  private pathToFlakeDir: string | null;

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
  }

  async main(): Promise<void> {
    await this.update();
  }

  // No post phase
  async post(): Promise<void> {}

  async update(): Promise<void> {
    return await withSpan("update_flake_lock", async (span) => {
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

      log.debug(
        JSON.stringify({
          options: this.nixOptions,
          inputs: this.flakeInputs,
          message: this.commitMessage,
          args: nixCommandArgs,
        }),
      );

      const execOptions: actionsExec.ExecOptions = {
        cwd: this.pathToFlakeDir !== null ? this.pathToFlakeDir : undefined,
        ignoreReturnCode: true,
      };

      const exitCode = await actionsExec.exec(
        "nix",
        nixCommandArgs,
        execOptions,
      );

      span.setAttribute(ATTR_EXIT_CODE, exitCode);

      if (exitCode !== 0) {
        this.addEvent(EVENT_EXECUTION_FAILURE, {
          [ATTR_EXIT_CODE]: exitCode,
        });
        log.setFailed(`non-zero exit code of ${exitCode} detected`);
      } else {
        log.info(`flake.lock file was successfully updated`);
      }
    });
  }
}

function main(): void {
  new UpdateFlakeLockAction().execute();
}

main();
