import got from "got";
import { INVALID_HOSTS } from "./constants";
import { SearchImage } from "./serp-images";

const SERPER_IMAGES_ENDPOINT = "https://google.serper.dev/images";

type SerperImageResult = {
  imageUrl?: string;
  link?: string;
  domain?: string;
};

export async function findImagesOnSerper(
  name: string,
  lang: string,
  country?: string,
  options?: { limit: number }
): Promise<SearchImage[]> {
  const limit = options?.limit || 2;
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error("SERPER_API_KEY is missing");
  }

  const body: Record<string, string | number> = { q: name };

  if (lang) {
    body.hl = lang;
  }

  if (country) {
    body.gl = country.toLowerCase();
  }

  const response = await got.post(SERPER_IMAGES_ENDPOINT, {
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json"
    },
    body,
    json: true,
    timeout: 1000 * 15
  });

  const responseBody = response.body as any;
  const results: SerperImageResult[] = Array.isArray(responseBody?.images)
    ? responseBody.images
    : [];

  const list: SearchImage[] = [];

  for (const item of results) {
    const imageUrl = item?.imageUrl;
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
    console.log("No images found via Serper");
    if (responseBody?.error) {
      console.log("Serper error:", responseBody.error);
    }
  }

  return [...new Map(list.map((item) => [item.url, item])).values()];
}
