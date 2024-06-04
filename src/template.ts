import Handlebars from "handlebars";

export function renderCommitMessage(
  template: string,
  flakeDotLock: string,
): string {
  return render(template, { flake_dot_lock: flakeDotLock });
}

function render(template: string, inputs: Record<string, string>): string {
  const tpl = Handlebars.compile(template);
  return tpl(inputs);
}
