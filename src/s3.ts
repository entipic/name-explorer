// const debug = require('debug')('ournet:news-reader:service');

import S3 = require("aws-sdk/clients/s3");
import { PictureHelper } from "@entipic/domain";
import { Readable } from "stream";
const BUCKET = process.env.ENTIPIC_IMAGES_BUCKET || "cdn.entipic.com";
const s3 = new S3();

export async function s3PutImage(
  id: string,
  body: Buffer | Blob | Readable,
  contentType: string = "image/jpeg"
) {
  const key = PictureHelper.formatS3Key(id);
  await s3
    .putObject({
      Bucket: BUCKET,
      Key: key,
      CacheControl: "public, max-age=" + 86400 * 30,
      ContentType: contentType,
      Body: body,
      ACL: "public-read"
    })
    .promise();
}
