export interface RouteMatch {
  matched: boolean;
  params: Record<string, string>;
}

export function matchRoute(pattern: string, url: string): RouteMatch {
  const patternParts = pattern.split("/").filter(Boolean);
  const urlParts = url.split("/").filter(Boolean);

  if (patternParts.length !== urlParts.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const uPart = urlParts[i];

    if (pPart.startsWith(":")) {
      params[pPart.slice(1)] = decodeURIComponent(uPart);
    } else if (pPart !== uPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

export function matchMiddleware(pattern: string, url: string): boolean {
  if (pattern === "*") return true;
  return url === pattern || url.startsWith(pattern + "/");
}
