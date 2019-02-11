import { findWebImages } from "./find-web-images";
import { logger } from "./logger";
import { UnknownName, Picture, PictureHelper } from "@entipic/domain";
import { WebEntity } from "./types";
import { pictureRepository } from "./data";
import { s3PutImage } from "./s3";


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
			await s3PutImage(picture.id, image.data);
			list.push(dbPicture);
		}
	}

	return list.filter(item => !!item);
}
