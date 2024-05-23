// Helper function for nullable input fields into an array of strings
export function determineFlakeDirectories(input: string): string[] {
  const sepChar = /\s+/;
  const trimmed = input.trim();
  if (trimmed === "") {
    return [];
  } else {
    return trimmed.split(sepChar).map((s: string) => s.trim());
  }
}
