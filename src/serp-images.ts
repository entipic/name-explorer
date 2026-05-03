import got from "got";
import { INVALID_HOSTS } from "./constants";

const SERP_API_ENDPOINT = "https://serpapi.com/search.json";

export type SearchImage = {
  host: string;
  url: string;
};

export async function findImagesOnSerp(
  name: string,
  lang: string,
  country?: string,
  options?: { limit: number }
): Promise<SearchImage[]> {
  const limit = options?.limit || 2;
  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) {
    throw new Error("SERP_API_KEY is missing");
  }

  const searchParams = new URLSearchParams({
    engine: "google_images",
    q: name,
    api_key: apiKey,
    google_domain: "google.com",
    safe: "active"
  });

  if (lang) {
    searchParams.set("hl", lang);
  }

  if (country) {
    searchParams.set("gl", country.toLowerCase());
  }

  const url = `${SERP_API_ENDPOINT}?${searchParams.toString()}`;
  const response = await got(url, {
    json: true,
    timeout: 1000 * 15
  });

  const body = response.body as any;
  const results = Array.isArray(body?.images_results) ? body.images_results : [];

  const list: SearchImage[] = [];

  for (const item of results) {
    const imageUrl = item?.original || item?.link;
    if (!imageUrl || typeof imageUrl !== "string") {
      continue;
    }

    if (INVALID_HOSTS.find((host) => imageUrl.includes(host))) {
      continue;
    }

    try {
      const parsed = new URL(imageUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        continue;
      }
      list.push({ host: parsed.hostname, url: imageUrl });
    } catch (_e) {
      continue;
    }

    if (list.length >= limit) {
      break;
    }
  }

  if (list.length === 0) {
    console.log("No images found via SerpAPI");
    if (body?.error) {
      console.log("SerpAPI error:", body.error);
    }
  }

  return [...new Map(list.map((item) => [item.url, item])).values()];
}