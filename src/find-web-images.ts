import got from "got";

import { findImagesOnGoogle } from "./google-images";
import { UnknownName } from "@entipic/domain";
const dhash = require("dhash-image");

/**
 * Find pictures on the web for a web entity and an unknown name.
 * @param  {Object} unknownName Unknown name
 * @param  {Object} webEntity   A web entity.
 * @return {Array[Object]}			Created pictures.
 */
export async function findWebImages(
  unknownName: UnknownName
): Promise<WebImage[]> {
  let name = unknownName.name;
  let country = unknownName.country;
  let lang = unknownName.lang;

  const images = await findImagesOnGoogle(name, lang, country, { limit: 5 });

  const list = [];

  for (const image of images) {
    if (image.host === "commons.wikimedia.org") {
      const url = await resolveWikimediaImage(image.url).catch(console.error);
      if (url) {
        image.url = url;
        if (url) {
          console.log(`resolved image: ${url}`);
        }
      }
    }
    let response: got.Response<Buffer>;
    try {
      response = await got(image.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36",
          Accept: "image/jpeg,image/webp,*/*;q=0.8",
          "Accept-Language":
            "en-US,en;q=0.8,cs;q=0.6,es;q=0.4,hu;q=0.2,it;q=0.2,lt;q=0.2,ro;q=0.2,ru;q=0.2,sk;q=0.2,uk;q=0.2,pl;q=0.2,bg;q=0.2"
        },
        encoding: null,
        timeout: 1000 * 5
      });
      const result = await processImage(response.body, image);
      list.push(result);
    } catch (e) {
      console.log(`error on image: ${e.message}`, image.url);
      continue;
    }
    if (list.length >= 1) {
      break;
    }
  }
  return list.filter((image) => !!image);
}

async function processImage(
  data: Buffer,
  image: { url: string; host: string }
): Promise<WebImage> {
  const hash = ((await dhash(data)) as Buffer).toString("hex");
  return {
    hash,
    url: image.url,
    host: image.host,
    data: data
  };
}

export type WebImage = {
  hash: string;
  url: string;
  host: string;
  data: Buffer;
};

async function resolveWikimediaImage(filePageUrl: string) {
  // Extract the file name from the URL
  const fileName = encodeURIComponent(filePageUrl.split("/").pop() || "");
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=url&format=json`;

  try {
    const response = await got(apiUrl, { json: true });
    // console.log("response", response.body);
    const pages = response.body.query.pages;
    const page = Object.values(pages)[0] as any;
    if (page?.imageinfo) {
      return page.imageinfo[0].url as string; // Direct URL to the image
    }
    throw new Error("Direct image URL not found");
  } catch (error) {
    console.error("Error resolving image URL:", error.message);
    return null; // Handle as needed
  }
}
