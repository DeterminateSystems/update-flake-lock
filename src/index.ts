import { ActionOptions, IdsToolbox, inputs } from "detsys-ts";

class UpdateFlakeLockAction {
  idslib: IdsToolbox;
  private nixOptions: string;
  private targets: string;
  private commitMessage: string;
  private pathToFlakeDir: string;

  constructor() {
    const options: ActionOptions = {
      name: "update-flake-lock",
      // We don't
      fetchStyle: "universal",
      requireNix: "fail",
    };

    this.idslib = new IdsToolbox(options);

    this.nixOptions = inputs.getString("nix-options");
    this.targets = inputs.getString("inputs");
    this.commitMessage = inputs.getString("commit-msg");
    this.pathToFlakeDir = inputs.getString("path-to-flake-dir");
  }

  async update(): Promise<void> {}
}

function main(): void {
  const updateFlakeLock = new UpdateFlakeLockAction();

  updateFlakeLock.idslib.onMain(async () => {
    await updateFlakeLock.update();
  });

  updateFlakeLock.idslib.execute();
}

main();
