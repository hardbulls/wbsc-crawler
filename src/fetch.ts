type BrowserProfile = {
  userAgent: string;
  acceptLanguage: string;
  secChUa?: string;
  secChUaPlatform?: string;
};

// Real desktop browser/OS combos with matching client-hint headers. A bare
// spoofed User-Agent without the headers a real browser always sends alongside
// it (Accept-Language, sec-ch-ua/platform for Chromium) is itself a bot signal
// to WAFs, so each profile is sent as a consistent bundle rather than mixing a UA
// string with Node's default fetch headers.
const BROWSER_PROFILES: BrowserProfile[] = [
  {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    acceptLanguage: "de-AT,de;q=0.9,en-US;q=0.8,en;q=0.7",
    secChUa:
      '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
    secChUaPlatform: '"Windows"',
  },
  {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    acceptLanguage: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    secChUa:
      '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
    secChUaPlatform: '"macOS"',
  },
  {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    acceptLanguage: "de-AT,de;q=0.9,en-US;q=0.8,en;q=0.7",
    secChUa:
      '"Chromium";v="129", "Not_A Brand";v="24", "Google Chrome";v="129"',
    secChUaPlatform: '"Windows"',
  },
  {
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
    acceptLanguage: "de,en-US;q=0.7,en;q=0.3",
  },
  {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    acceptLanguage: "de-AT,de;q=0.8,en-US;q=0.5,en;q=0.3",
  },
  {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
    acceptLanguage: "de-de",
  },
  {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    acceptLanguage: "de-at",
  },
];

function getRandomBrowserProfile(): BrowserProfile {
  const randomIndex = Math.floor(Math.random() * BROWSER_PROFILES.length);

  return BROWSER_PROFILES[randomIndex];
}

function buildBrowserHeaders(profile: BrowserProfile): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": profile.userAgent,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": profile.acceptLanguage,
  };

  if (profile.secChUa) {
    headers["sec-ch-ua"] = profile.secChUa;
    headers["sec-ch-ua-mobile"] = "?0";
  }

  if (profile.secChUaPlatform) {
    headers["sec-ch-ua-platform"] = profile.secChUaPlatform;
  }

  return headers;
}

const RETRYABLE_STATUSES = new Set([403, 408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchUrl(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  let headers: Record<string, string> = buildBrowserHeaders(
    getRandomBrowserProfile(),
  );

  if (options?.headers) {
    headers = {
      ...headers,
      ...Object.fromEntries(new Headers(options.headers)),
    };
  }

  options = {
    ...options,
    headers: headers,
  };

  let lastResponse: Response | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok || !RETRYABLE_STATUSES.has(response.status)) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * 2 ** attempt);
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError;
}
