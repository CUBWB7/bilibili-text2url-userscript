const SIMPLE_TRAILING_PUNCTUATION_RE = /[。，；：！？、,.!?:;]+$/u;

function hasMoreClosingsThanOpenings(text: string, opening: string, closing: string): boolean {
  let openings = 0;
  let closings = 0;

  for (const character of text) {
    if (character === opening) openings += 1;
    if (character === closing) closings += 1;
  }

  return closings > openings;
}

export function trimTrailingPunctuation(input: string): string {
  let result = input.replace(SIMPLE_TRAILING_PUNCTUATION_RE, "");

  while (result.endsWith(")") && hasMoreClosingsThanOpenings(result, "(", ")")) {
    result = result.slice(0, -1);
  }

  while (result.endsWith("]") && hasMoreClosingsThanOpenings(result, "[", "]")) {
    result = result.slice(0, -1);
  }

  while (result.endsWith("}") && hasMoreClosingsThanOpenings(result, "{", "}")) {
    result = result.slice(0, -1);
  }

  return result;
}
