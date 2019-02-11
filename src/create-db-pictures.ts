import { findWebImages } from "./find-web-images";
import { logger } from "./logger";
import { UnknownName, Picture, PictureHelper } from "@entipic/domain";
import { WebEntity } from "./types";
import { pictureRepository } from "./data";
import { s3PutImage } from "./s3";
import * as sharp from 'sharp';


export async function createDbPictures(unknownName: UnknownName, webEntity?: WebEntity) {

	const images = await findWebImages(unknownName, webEntity);
	const list: Picture[] = [];

	for (const image of images) {
		const picture = PictureHelper.build({
			hash: image.hash,
			url: image.url,
			host: image.host,
		});


		const dbPicture = await pictureRepository.create(picture)
			.catch((error: any) => {
				// picture exists
				if (error.code === 11000) {
					logger.warn('Picture exists: ' + picture.id);
					return picture;
				}
			});

		// is new created picture
		if (dbPicture && dbPicture.createdAt) {
			let instance = sharp(image.data);
			const size = PictureHelper.getPictureSize('f');
			instance = instance.resize(size, size);

			try {
				await s3PutImage(picture.id, await instance.toBuffer());
				list.push(dbPicture);
			} catch (e) {
				logger.error(e)
			}
		}
	}

	return list.filter(item => !!item);
}
