/**
 * Search for images on google
 *
 */

import got from "got";
import { URL } from "url";

const INVALID_HOSTS = [
  "feelgrafix.com",
  "picturesstar.com",
  "shutterstock.com",
  "gettyimages.com",
  "alamy.com",
  "istockphoto.com",
  "dreamstime.com"
];

export async function findImagesOnGoogle(
  name: string,
  lang: string,
  country?: string,
  options?: { limit: number; type?: string }
) {
  options = options || { limit: 2 };
  options.limit = options.limit || 2;
  //options.type = options.type || 'photo';
  let url =
    "https://www.google.com/search?q={q}&lr=lang_{lang}&cr={country}&prmd=imvnslo&source=lnms&tbm=isch&tbas=0&tbs=itp:{type},isz:lt,islt:qsvga,ift:jpg,webp&safe=on";
  url = url
    .replace("{q}", encodeURIComponent(name))
    .replace("{type}", options.type || "")
    .replace("{lang}", lang);

  if (country) {
    url = url.replace("{country}", "country" + country.toUpperCase());
  } else {
    url = url.replace("{country}", "");
  }

  const reqOptions = {
    gzip: true,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Language":
        "en-US,en;q=0.8,cs;q=0.6,es;q=0.4,hu;q=0.2,it;q=0.2,lt;q=0.2,ro;q=0.2,ru;q=0.2,sk;q=0.2,uk;q=0.2,pl;q=0.2,bg;q=0.2"
    }
  };

  let response: got.Response<string>;
  try {
    response = await got(url, reqOptions);
  } catch (e) {
    throw new Error(e.message);
  }

  let regResult;
  const reg = /"(https?:\/\/[^"]+\.(jpeg|jpg|webp))"/g;
  const list = [];
  while ((regResult = reg.exec(response.body))) {
    const href = regResult[1];
    if (!href) continue;

    if (INVALID_HOSTS.find((item) => href.includes(item))) continue;
    list.push(href);

    if (list.length >= options.limit) {
      break;
    }
  }

  if (list.length === 0) {
    const reg = /"(https?:\/\/[^"]+\.(png))"/g;
    const list = [];
    while ((regResult = reg.exec(response.body))) {
      const href = regResult[1];
      if (!href) continue;

      if (INVALID_HOSTS.find((item) => href.includes(item))) continue;
      list.push(href);

      if (list.length >= options.limit) {
        break;
      }
    }
  }

  return [...new Set(list)].map((url) => {
    const u = new URL(url);
    return { host: u.hostname, url };
  });
}
