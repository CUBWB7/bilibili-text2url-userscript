import { normalizeUrl } from "./normalize-url";
import { trimTrailingPunctuation } from "./trim-trailing-punctuation";

const URL_PATH_CHARS = "[A-Za-z0-9._~:/?#\\[\\]@!$&'()*+,;=%-]";
const CANDIDATE_RE = new RegExp(
  String.raw`(?:https?:\/\/|www\.)${URL_PATH_CHARS}+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}(?::\d{2,5})?(?:[/?#]${URL_PATH_CHARS}*)?`,
  "giu"
);

const INVALID_PREVIOUS_CHAR_RE = /[A-Za-z0-9@_-]/;
const INVALID_NEXT_CHAR_RE = /[A-Za-z0-9_-]/;

export interface UrlCandidateMatch {
  raw: string;
  displayText: string;
  href: string;
  start: number;
  end: number;
}

function hasValidBoundaries(input: string, start: number, end: number): boolean {
  const previousCharacter = start > 0 ? input[start - 1] : "";
  const nextCharacter = end < input.length ? input[end] : "";

  if (previousCharacter && INVALID_PREVIOUS_CHAR_RE.test(previousCharacter)) {
    return false;
  }

  if (nextCharacter && INVALID_NEXT_CHAR_RE.test(nextCharacter)) {
    return false;
  }

  return true;
}

export function findUrlCandidates(input: string): UrlCandidateMatch[] {
  const matches: UrlCandidateMatch[] = [];

  for (const match of input.matchAll(CANDIDATE_RE)) {
    const raw = match[0];
    const start = match.index ?? 0;
    const rawEnd = start + raw.length;

    if (!hasValidBoundaries(input, start, rawEnd)) {
      continue;
    }

    const displayText = trimTrailingPunctuation(raw);
    const href = normalizeUrl(displayText);

    if (!displayText || !href) {
      continue;
    }

    matches.push({
      raw,
      displayText,
      href,
      start,
      end: start + displayText.length
    });
  }

  return matches;
}
