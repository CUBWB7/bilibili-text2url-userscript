import { trimTrailingPunctuation } from "./trim-trailing-punctuation";

const HOST_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const NUMERIC_DOTTED_RE = /^\d+(?:\.\d+)+$/;

function toUrl(input: string): URL | null {
  const withProtocol = /^(?:https?:\/\/)/i.test(input) ? input : `https://${input}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

export function validateUrlCandidate(input: string): boolean {
  const candidate = trimTrailingPunctuation(input).trim();

  if (!candidate) return false;
  if (!candidate.includes(".")) return false;
  if (NUMERIC_DOTTED_RE.test(candidate)) return false;

  const url = toUrl(candidate);
  if (!url) return false;

  const { hostname } = url;

  if (!hostname.includes(".")) return false;
  if (/^\d+(?:\.\d+)+$/.test(hostname)) return false;
  if (!/^[a-z0-9]/i.test(hostname)) return false;

  const labels = hostname.split(".");
  const topLevelDomain = labels.at(-1);

  if (!topLevelDomain || !/^[a-z]{2,63}$/i.test(topLevelDomain)) {
    return false;
  }

  return labels.every((label) => HOST_LABEL_RE.test(label));
}
