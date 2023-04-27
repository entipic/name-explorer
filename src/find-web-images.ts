
import got from 'got';

import { findImagesOnGoogle } from './google-images';
import { UnknownName } from '@entipic/domain';
import { SimpleEntityType } from 'wiki-entity';
import { WebEntity } from './types';
const dhash = require('dhash-image');

/**
 * Find pictures on the web for a web entity and an unknown name.
 * @param  {Object} unknownName Unknown name
 * @param  {Object} webEntity   A web entity.
 * @return {Array[Object]}			Created pictures.
 */
export async function findWebImages(unknownName: UnknownName, webEntity?: WebEntity): Promise<WebImage[]> {
	const options = { limit: 2 } as any;
	let name = unknownName.name;
	let country = unknownName.country;
	if (webEntity) {
		name = webEntity.name || name;
		country = '';
		if (webEntity.type) {
			if (webEntity.type === SimpleEntityType.PERSON) {
				options.type = 'face';
			} else if (~[SimpleEntityType.ORG, SimpleEntityType.PRODUCT].indexOf(webEntity.type)) {
				name += ' logo';
			}
		}
	}

	const images = await findImagesOnGoogle(name, country, options);

	const list = [];

	for (const image of images) {
		let response: got.Response<Buffer>;
		try {
			response = await got(image.url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
					'Accept': 'image/jpeg,image/webp,*/*;q=0.8',
					'Accept-Language': 'en-US,en;q=0.8,cs;q=0.6,es;q=0.4,hu;q=0.2,it;q=0.2,lt;q=0.2,ro;q=0.2,ru;q=0.2,sk;q=0.2,uk;q=0.2,pl;q=0.2,bg;q=0.2'
				},
				encoding: null,
				timeout: 1000 * 3,
			})
			const result = await processImage(response.body, image);
			list.push(result);
		} catch (e) {
			continue;
		}
	}
	return list.filter(image => !!image);
}

async function processImage(data: Buffer, image: { url: string, host: string }): Promise<WebImage> {
	const hash = (await dhash(data) as Buffer).toString('hex');
	return {
		hash,
		url: image.url,
		host: image.host,
		data: data
	};
}

export type WebImage = {
	hash: string
	url: string
	host: string
	data: Buffer
}
