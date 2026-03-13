import { trimTrailingPunctuation } from "./trim-trailing-punctuation";
import { COMMON_BARE_TLDS } from "./common-bare-tlds";

const HOST_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const NUMERIC_DOTTED_RE = /^\d+(?:\.\d+)+$/;
const EXPLICIT_PROTOCOL_RE = /^https?:\/\//i;

function toUrl(input: string): URL | null {
  const withProtocol = /^(?:https?:\/\/)/i.test(input) ? input : `https://${input}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function hasExplicitUrlSignal(candidate: string, url: URL, labels: string[]): boolean {
  if (EXPLICIT_PROTOCOL_RE.test(candidate)) {
    return true;
  }

  if (/^www\./i.test(candidate)) {
    return true;
  }

  if (labels.length > 2) {
    return true;
  }

  if (url.port) {
    return true;
  }

  if (url.search || url.hash) {
    return true;
  }

  return /^\/[^/]/.test(url.pathname);
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

  if (
    labels.length === 2 &&
    !hasExplicitUrlSignal(candidate, url, labels) &&
    !COMMON_BARE_TLDS.has(topLevelDomain.toLowerCase())
  ) {
    return false;
  }

  return labels.every((label) => HOST_LABEL_RE.test(label));
}
