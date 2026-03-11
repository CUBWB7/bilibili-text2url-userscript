import { trimTrailingPunctuation } from "./trim-trailing-punctuation";
import { validateUrlCandidate } from "./validate-url-candidate";

export function normalizeUrl(input: string): string | null {
  const candidate = trimTrailingPunctuation(input).trim();

  if (!validateUrlCandidate(candidate)) {
    return null;
  }

  const withProtocol = /^(?:https?:\/\/)/i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}
