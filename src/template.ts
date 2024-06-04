import Handlebars from "handlebars";

export function renderPullRequestBody(
  template: string,
  dirs: string[],
): string {
  const commaSeparated = dirs.join(", ");
  const spaceSeparated = dirs.join(" ");
  const dirsList = dirs.map((d: string) => `* ${d}`).join("\n");

  const tpl = Handlebars.compile(template);

  return tpl({
    // eslint-disable-next-line camelcase
    comma_separated_dirs: commaSeparated,
    // eslint-disable-next-line camelcase
    space_separated_dirs: spaceSeparated,
    // eslint-disable-next-line camelcase
    updated_dirs_list: dirsList,
  });
}

export function renderCommitMessage(
  template: string,
  flakeDotLockDir: string,
  flakeDotLock: string,
): string {
  return render(template, {
    // eslint-disable-next-line camelcase
    flake_dot_lock_dir: flakeDotLockDir,
    // eslint-disable-next-line camelcase
    flake_dot_lock: flakeDotLock,
  });
}

function render(template: string, inputs: Record<string, string>): string {
  const tpl = Handlebars.compile(template);
  return tpl(inputs);
}
