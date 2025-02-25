import { findWebImages } from "./find-web-images";
import { logger } from "./logger";
import { UnknownName, Picture, PictureHelper } from "@entipic/domain";
import { pictureRepository } from "./data";
import { s3PutImage } from "./s3";
import sharp from "sharp";

export async function createDbPictures(unknownName: UnknownName) {
  const images = await findWebImages(unknownName);
  if (images.length === 0) {
    logger.warn(`No image found for ${unknownName.name}`, unknownName);
    return [];
  }
  const list: Picture[] = [];

  for (const image of images) {
    const picture = PictureHelper.build({
      hash: image.hash,
      url: image.url,
      host: image.host
    });

    const dbPicture = await pictureRepository
      .create(picture)
      .catch((error: any) => {
        // picture exists
        if (error.code === 11000) {
          logger.warn("Picture exists: " + picture.id);
          return picture;
        }
        return undefined;
      });

    // is new created picture
    if (dbPicture && dbPicture.createdAt) {
      let instance = sharp(image.data);
      const size = PictureHelper.getPictureSize("f");
      instance = instance.resize(size, size, { kernel: "cubic" });

      try {
        await s3PutImage(picture.id, await instance.toBuffer());
        list.push(dbPicture);
      } catch (e) {
        logger.error(`Error on saving image to S3`, e);
      }
    }
  }

  return list.filter((item) => !!item);
}
