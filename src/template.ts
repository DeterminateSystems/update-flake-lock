import Handlebars from "handlebars";

export function renderPullRequestBody(template: string): string {
  const tpl = Handlebars.compile(template);
  return tpl({});
}

export function renderCommitMessage(
  template: string,
  flakeDotLockDir: string,
  flakeDotLock: string,
): string {
  return render(template, {
    flake_dot_lock_dir: flakeDotLockDir,
    flake_dot_lock: flakeDotLock,
  });
}

function render(template: string, inputs: Record<string, string>): string {
  const tpl = Handlebars.compile(template);
  return tpl(inputs);
}
